import { inject, Injectable, InjectionToken, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications, LocalNotificationsPlugin, LocalNotificationSchema, PendingLocalNotificationSchema } from '@capacitor/local-notifications';
import { ToastController } from '@ionic/angular/standalone';
import { firstValueFrom, forkJoin, of } from 'rxjs';

import { TarefaModel } from '../models/tarefa.model';
import { ComunidadesService } from './comunidades.service';
import { LembreteEventosService } from './lembrete-eventos.service';
import { TarefasService } from './tarefas.service';
import { UsuarioService } from './usuario.service';
import { chaveLembrete, horarioLembrete, LEMBRETE_PUSH_NATIVE } from './lembrete-push-native';

const TIPO_LEMBRETE = 'competask-lembrete';
const CANAL_LEMBRETES = 'lembretes';
export const NOTIFICACOES_LOCAIS = new InjectionToken<LocalNotificationsPlugin>(
  'Notificações locais', { providedIn: 'root', factory: () => LocalNotifications },
);

@Injectable({ providedIn: 'root' })
export class LembreteLocalService {
  private fila = Promise.resolve();
  private revisao = 0;
  private iniciou = false;
  private avisouPermissao = false;
  private avisouHorario = false;
  private readonly tarefasAlteradas = new Set<string>();
  private readonly comunidadesAlteradas = new Set<string>();

  private readonly tarefas = inject(TarefasService);
  private readonly comunidades = inject(ComunidadesService);
  private readonly usuarios = inject(UsuarioService);
  private readonly eventos = inject(LembreteEventosService);
  private readonly toast = inject(ToastController);
  private readonly router = inject(Router);
  private readonly zona = inject(NgZone);
  private readonly notificacoes = inject(NOTIFICACOES_LOCAIS);
  private readonly pushNativo = inject(LEMBRETE_PUSH_NATIVE);

  iniciar(): void {
    if (this.iniciou || Capacitor.getPlatform() !== 'android') return;
    this.iniciou = true;
    this.eventos.alteracoes$.subscribe((alteracao) => { void this.solicitarSincronizacao(alteracao); });
    void App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) this.zona.run(() => { void this.solicitarSincronizacao(); });
    }).catch((erro: unknown) => this.relatarErro(erro));
    void this.notificacoes.addListener('localNotificationActionPerformed', () => {
      this.zona.run(() => {
        if (this.usuarios.obterUsuarioSessao()) void this.router.navigate(['/notificacoes']);
      });
    }).catch((erro: unknown) => this.relatarErro(erro));
    void this.solicitarSincronizacao();
  }

  solicitarSincronizacao(alteracao: { tarefaId?: string; comunidadeId?: string } = {}): Promise<void> {
    if (alteracao.tarefaId) this.tarefasAlteradas.add(alteracao.tarefaId);
    if (alteracao.comunidadeId) this.comunidadesAlteradas.add(alteracao.comunidadeId);
    const revisao = ++this.revisao;
    this.fila = this.fila
      .then(() => this.sincronizar(revisao))
      .catch((erro: unknown) => this.relatarErro(erro));
    return this.fila;
  }

  private async sincronizar(revisao: number): Promise<void> {
    if (revisao !== this.revisao) return;
    const usuarioId = this.usuarios.obterUsuarioSessao()?.id;
    const pendentes = (await this.notificacoes.getPending()).notifications;
    if (revisao !== this.revisao) return;
    const gerenciados = pendentes.filter((item) => this.obterDados(item) !== null);
    const deOutraConta = gerenciados.filter((item) => this.obterDados(item)?.usuarioId !== usuarioId);
    if (deOutraConta.length) {
      await this.notificacoes.cancel({ notifications: deOutraConta.map(({ id }) => ({ id })) });
    }
    if (!usuarioId || revisao !== this.revisao) return;
    const tarefasAlteradas = new Set(this.tarefasAlteradas);
    const comunidadesAlteradas = new Set(this.comunidadesAlteradas);
    const alterados = gerenciados.filter((item) => {
      const dados = this.obterDados(item);
      return dados?.usuarioId === usuarioId && (tarefasAlteradas.has(dados.tarefaId)
        || (dados.comunidadeId !== undefined && comunidadesAlteradas.has(dados.comunidadeId)));
    });
    if (alterados.length) {
      await this.notificacoes.cancel({ notifications: alterados.map(({ id }) => ({ id })) });
    }
    tarefasAlteradas.forEach((id) => this.tarefasAlteradas.delete(id));
    comunidadesAlteradas.forEach((id) => this.comunidadesAlteradas.delete(id));
    if (revisao !== this.revisao) return;

    const dados = await firstValueFrom(forkJoin({
      tarefas: this.tarefas.buscarTarefasUsuario(true),
      comunidades: this.comunidades.listarPorUsuario(true),
    }));
    const tarefasComunidades = await firstValueFrom(
      dados.comunidades.length
        ? forkJoin(dados.comunidades.map((comunidade) => this.comunidades.listarTarefas(comunidade.idComunidade, true)))
        : of([]),
    );
    if (revisao !== this.revisao || this.usuarios.obterUsuarioSessao()?.id !== usuarioId) return;

    const agendaveis: { tarefa: TarefaModel; data: Date }[] = [];
    let dadosInvalidos = false;
    const tarefas = tarefasComunidades.reduce<TarefaModel[]>((todas, lista) => todas.concat(lista), dados.tarefas);
    for (const tarefa of tarefas) {
      if (tarefa.concluida || tarefa.concluidaPeloUsuario || (!tarefa.lembreteData && !tarefa.lembreteHora)) continue;
      const data = this.dataDoLembrete(tarefa);
      if (!data) {
        dadosInvalidos = true;
      } else if (data.getTime() > Date.now()) {
        agendaveis.push({ tarefa, data });
      }
    }

    const atuais = gerenciados.filter((item) => this.obterDados(item)?.usuarioId === usuarioId);
    if (agendaveis.length) {
      let permissao = await this.notificacoes.checkPermissions();
      if (permissao.display === 'prompt' || permissao.display === 'prompt-with-rationale') {
        permissao = await this.notificacoes.requestPermissions();
      }
      if (revisao !== this.revisao) return;
      if (permissao.display !== 'granted') {
        if (!this.avisouPermissao) {
          this.avisouPermissao = true;
          await this.mostrarAviso('Ative as notificações nas configurações do celular para receber lembretes.');
        }
        return;
      }
      this.avisouPermissao = false;
      try {
        await this.notificacoes.createChannel({
          id: CANAL_LEMBRETES, name: 'Lembretes de tarefas',
          description: 'Avisos dos lembretes das suas tarefas', importance: 4, vibration: true,
        });
      } catch (erro: unknown) {
        if (!erro || typeof erro !== 'object' || !('code' in erro) || erro.code !== 'UNAVAILABLE') throw erro;
      }
      const horarioExato = (await this.notificacoes.checkExactNotificationSetting()).exact_alarm === 'granted';

      const usados = new Set(pendentes.map((item) => item.id));
      const anteriores = new Map(atuais.map((item) => [this.obterDados(item)?.tarefaId, item.id]));
      let proximoId = 1;
      let permitidos: Set<string> | null = null;
      let novasReservas: string[] = [];
      if (Capacitor.getPlatform() === 'android') {
        const reserva = await this.pushNativo.reservar({
          usuarioId,
          lembretes: agendaveis.map(({ tarefa, data }) => ({
            tarefaId: String(tarefa.id),
            horario: horarioLembrete(tarefa.lembreteData, tarefa.lembreteHora),
            instante: data.getTime(),
          })),
        });
        permitidos = new Set(reserva.permitidos);
        novasReservas = reserva.novos;
      }
      const notificacoes: LocalNotificationSchema[] = agendaveis.filter(({ tarefa }) =>
        !permitidos || permitidos.has(chaveLembrete(usuarioId, String(tarefa.id),
          horarioLembrete(tarefa.lembreteData, tarefa.lembreteHora)))
      ).map(({ tarefa, data }) => {
        const tarefaId = String(tarefa.id);
        let id = anteriores.get(tarefaId);
        if (id === undefined) {
          while (usados.has(proximoId)) proximoId++;
          id = proximoId++;
          usados.add(id);
        }
        return {
          id,
          title: 'Lembrete de tarefa',
          body: `Está na hora de realizar a tarefa: ${tarefa.titulo}`,
          channelId: CANAL_LEMBRETES,
          smallIcon: 'ic_lembrete',
          largeIcon: 'competask_logo',
          foreground: true,
          schedule: { at: data, allowWhileIdle: true },
          isExactNotification: horarioExato,
          extra: {
            tipo: TIPO_LEMBRETE, usuarioId, tarefaId,
            ...(tarefa.comunidadeId != null ? { comunidadeId: String(tarefa.comunidadeId) } : {}),
          },
        };
      });
      if (revisao !== this.revisao) {
        if (novasReservas.length) await this.pushNativo.cancelarReservas({ chaves: novasReservas });
        return;
      }
      let resultado: Awaited<ReturnType<LocalNotificationsPlugin['schedule']>>;
      try {
        resultado = await this.notificacoes.schedule({ notifications: notificacoes });
      } catch (erro: unknown) {
        if (novasReservas.length) await this.pushNativo.cancelarReservas({ chaves: novasReservas });
        throw erro;
      }
      if ((!horarioExato || resultado.warning) && !this.avisouHorario) {
        this.avisouHorario = true;
        const aviso = await this.toast.create({
          message: 'O Android pode atrasar lembretes. Ative alarmes e lembretes exatos nas configurações.',
          duration: 8000, position: 'top', color: 'warning',
          buttons: [{ text: 'Configurar', handler: () => {
            void this.notificacoes.changeExactNotificationSetting().catch((erro: unknown) => this.relatarErro(erro));
          } }],
        });
        await aviso.present();
      }
      const idsAtivos = new Set(notificacoes.map((item) => item.id));
      const obsoletos = atuais.filter((item) => !idsAtivos.has(item.id));
      if (obsoletos.length) await this.notificacoes.cancel({ notifications: obsoletos.map(({ id }) => ({ id })) });
    } else if (atuais.length) {
      await this.notificacoes.cancel({ notifications: atuais.map(({ id }) => ({ id })) });
    }
    if (dadosInvalidos) await this.mostrarAviso('Alguns lembretes têm data ou horário inválido e não foram agendados.');
  }

  private obterDados(item: PendingLocalNotificationSchema): { usuarioId: string; tarefaId: string; comunidadeId?: string } | null {
    const extra: unknown = item.extra;
    if (!extra || typeof extra !== 'object' || !('tipo' in extra) || extra.tipo !== TIPO_LEMBRETE
      || !('usuarioId' in extra) || typeof extra.usuarioId !== 'string'
      || !('tarefaId' in extra) || typeof extra.tarefaId !== 'string') return null;
    const comunidadeId = 'comunidadeId' in extra && typeof extra.comunidadeId === 'string'
      ? extra.comunidadeId : undefined;
    return { usuarioId: extra.usuarioId, tarefaId: extra.tarefaId, comunidadeId };
  }

  private dataDoLembrete(tarefa: TarefaModel): Date | null {
    const data = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tarefa.lembreteData);
    const hora = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(tarefa.lembreteHora);
    if (!data || !hora) return null;
    const [ano, mes, dia] = data.slice(1).map(Number);
    const [horas, minutos, segundos] = [Number(hora[1]), Number(hora[2]), Number(hora[3] ?? 0)];
    const resultado = new Date(ano, mes - 1, dia, horas, minutos, segundos);
    return resultado.getFullYear() === ano && resultado.getMonth() === mes - 1 && resultado.getDate() === dia
      && resultado.getHours() === horas && resultado.getMinutes() === minutos && resultado.getSeconds() === segundos
      ? resultado : null;
  }

  private async mostrarAviso(mensagem: string): Promise<void> {
    const aviso = await this.toast.create({ message: mensagem, duration: 5000, position: 'top', color: 'warning' });
    await aviso.present();
  }

  private async relatarErro(erro: unknown): Promise<void> {
    console.error('Não foi possível sincronizar os lembretes no celular.', erro);
    await this.mostrarAviso('Não foi possível sincronizar os lembretes no celular. Abra o aplicativo novamente para tentar.');
  }
}
