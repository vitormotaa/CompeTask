import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LocalNotificationsPlugin } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { ToastController } from '@ionic/angular/standalone';
import { of, throwError } from 'rxjs';
import { TarefaModel } from '../models/tarefa.model';
import { ComunidadesService } from './comunidades.service';
import { LembreteEventosService } from './lembrete-eventos.service';
import { LembreteLocalService, NOTIFICACOES_LOCAIS } from './lembrete-local.service';
import { TarefasService } from './tarefas.service';
import { UsuarioService } from './usuario.service';
import { LEMBRETE_PUSH_NATIVE, LembretePushNative } from './lembrete-push-native';

describe('LembreteLocalService', () => {
  let servico: LembreteLocalService;
  let tarefas: jasmine.SpyObj<TarefasService>;
  let comunidades: jasmine.SpyObj<ComunidadesService>;
  let usuarios: jasmine.SpyObj<UsuarioService>;
  let toast: jasmine.SpyObj<ToastController>;
  let notificacoes: jasmine.SpyObj<LocalNotificationsPlugin>;
  let pushNativo: jasmine.SpyObj<LembretePushNative>;

  const tarefa: TarefaModel = {
    id: '1', usuarioId: '1', titulo: 'Estudar', descricao: '', prioridade: 1,
    dataRealizacao: '2099-12-01', lembreteData: '2099-12-01', lembreteHora: '10:30',
    tempoExecucao: '', dataConfeccao: '', concluida: false, criadaEm: '', atualizadaEm: '',
  };
  const pendente = (id: number, tarefaId: string) => ({
    id, title: 'Lembrete', body: 'Tarefa',
    extra: { tipo: 'competask-lembrete', usuarioId: '1', tarefaId },
  });

  beforeEach(() => {
    tarefas = jasmine.createSpyObj<TarefasService>('TarefasService', ['buscarTarefasUsuario']);
    comunidades = jasmine.createSpyObj<ComunidadesService>('ComunidadesService', ['listarPorUsuario', 'listarTarefas']);
    usuarios = jasmine.createSpyObj<UsuarioService>('UsuarioService', ['obterUsuarioSessao']);
    toast = jasmine.createSpyObj<ToastController>('ToastController', ['create']);
    notificacoes = jasmine.createSpyObj<LocalNotificationsPlugin>('LocalNotifications', [
      'getPending', 'cancel', 'checkPermissions', 'requestPermissions', 'createChannel',
      'checkExactNotificationSetting', 'schedule',
    ]);
    pushNativo = jasmine.createSpyObj<LembretePushNative>('LembretePush', ['reservar', 'cancelarReservas']);
    const elemento = jasmine.createSpyObj<HTMLIonToastElement>('toast', ['present']);
    elemento.present.and.resolveTo();
    toast.create.and.resolveTo(elemento);
    usuarios.obterUsuarioSessao.and.returnValue({ id: '1', nome: 'Nome', email: 'email', streak: 0 });
    tarefas.buscarTarefasUsuario.and.returnValue(of([tarefa]));
    comunidades.listarPorUsuario.and.returnValue(of([]));
    TestBed.configureTestingModule({
      providers: [
        { provide: TarefasService, useValue: tarefas },
        { provide: ComunidadesService, useValue: comunidades },
        { provide: UsuarioService, useValue: usuarios },
        { provide: LembreteEventosService, useValue: new LembreteEventosService() },
        { provide: ToastController, useValue: toast },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate']) },
        { provide: NOTIFICACOES_LOCAIS, useValue: notificacoes },
        { provide: LEMBRETE_PUSH_NATIVE, useValue: pushNativo },
      ],
    });
    servico = TestBed.inject(LembreteLocalService);
    notificacoes.getPending.and.resolveTo({ notifications: [] });
    notificacoes.cancel.and.resolveTo();
    notificacoes.checkPermissions.and.resolveTo({ display: 'granted' });
    notificacoes.createChannel.and.resolveTo();
    notificacoes.checkExactNotificationSetting.and.resolveTo({ exact_alarm: 'granted' });
    notificacoes.schedule.and.resolveTo({ notifications: [] });
  });

  it('agenda tarefas futuras e comunitárias sem check-in, substituindo e cancelando lembretes antigos', async () => {
    comunidades.listarPorUsuario.and.returnValue(of([{ idComunidade: 7, nome: '', descricao: '', acesso: 'publico', foto: '', membros: [] }]));
    comunidades.listarTarefas.and.returnValue(of([
      { ...tarefa, id: '2', titulo: 'Comunidade', inComunidade: true },
      { ...tarefa, id: '3', concluidaPeloUsuario: true },
    ]));
    notificacoes.getPending.and.resolveTo({
      notifications: [pendente(4, '1'), pendente(5, 'antiga'), { id: 1, title: 'Outra', body: '' }],
    });

    await servico.solicitarSincronizacao();

    const agendadas = notificacoes.schedule.calls.mostRecent().args[0].notifications;
    expect(agendadas.length).toBe(2);
    expect(agendadas[0].id).toBe(4);
    expect(agendadas[0].schedule?.at).toEqual(new Date(2099, 11, 1, 10, 30));
    expect(agendadas[0].foreground).toBeTrue();
    expect(agendadas[0].smallIcon).toBe('ic_lembrete');
    expect(agendadas[0].largeIcon).toBe('competask_logo');
    expect(agendadas[1].id).not.toBe(1);
    expect(agendadas[1].body).toContain('Comunidade');
    expect(notificacoes.cancel).toHaveBeenCalledWith({ notifications: [{ id: 5 }] });
  });

  it('cancela lembretes ao sair da conta sem afetar outras notificações', async () => {
    usuarios.obterUsuarioSessao.and.returnValue(null);
    notificacoes.getPending.and.resolveTo({
      notifications: [pendente(4, '1'), { id: 8, title: 'Outra', body: '' }],
    });
    await servico.solicitarSincronizacao();
    expect(notificacoes.cancel).toHaveBeenCalledWith({ notifications: [{ id: 4 }] });
    expect(tarefas.buscarTarefasUsuario).not.toHaveBeenCalled();
  });

  it('preserva agendamentos existentes e avisa quando a sincronização falha', async () => {
    notificacoes.getPending.and.resolveTo({ notifications: [pendente(4, '1')] });
    tarefas.buscarTarefasUsuario.and.returnValue(throwError(() => new Error('Rede indisponível')));
    spyOn(console, 'error');
    await servico.solicitarSincronizacao();
    expect(notificacoes.cancel).not.toHaveBeenCalled();
    expect(notificacoes.schedule).not.toHaveBeenCalled();
    expect(toast.create).toHaveBeenCalled();
  });

  it('cancela o lembrete alterado mesmo se a sincronização posterior falhar', async () => {
    notificacoes.getPending.and.resolveTo({ notifications: [pendente(4, '1'), pendente(5, '2')] });
    tarefas.buscarTarefasUsuario.and.returnValue(throwError(() => new Error('Rede indisponível')));
    spyOn(console, 'error');
    await servico.solicitarSincronizacao({ tarefaId: '1' });
    expect(notificacoes.cancel).toHaveBeenCalledOnceWith({ notifications: [{ id: 4 }] });
    expect(toast.create).toHaveBeenCalled();
  });

  it('cancela lembretes da comunidade após a saída mesmo se a sincronização falhar', async () => {
    const daComunidade = {
      ...pendente(4, '1'),
      extra: { ...pendente(4, '1').extra, comunidadeId: '7' },
    };
    notificacoes.getPending.and.resolveTo({ notifications: [daComunidade, pendente(5, '2')] });
    tarefas.buscarTarefasUsuario.and.returnValue(throwError(() => new Error('Rede indisponível')));
    spyOn(console, 'error');
    await servico.solicitarSincronizacao({ comunidadeId: '7' });
    expect(notificacoes.cancel).toHaveBeenCalledOnceWith({ notifications: [{ id: 4 }] });
  });

  it('informa quando a permissão está negada', async () => {
    notificacoes.checkPermissions.and.resolveTo({ display: 'denied' });
    await servico.solicitarSincronizacao();
    expect(notificacoes.schedule).not.toHaveBeenCalled();
    expect(toast.create).toHaveBeenCalled();
  });

  it('avisa e agenda sem hora exata quando o Android não permite alarmes exatos', async () => {
    notificacoes.checkExactNotificationSetting.and.resolveTo({ exact_alarm: 'denied' });
    await servico.solicitarSincronizacao();
    const agendada = notificacoes.schedule.calls.mostRecent().args[0].notifications[0];
    expect(agendada.isExactNotification).toBeFalse();
    expect(toast.create).toHaveBeenCalled();
  });

  it('agenda em versões do Android que não suportam canais de notificação', async () => {
    notificacoes.createChannel.and.rejectWith({ code: 'UNAVAILABLE' });
    await servico.solicitarSincronizacao();
    expect(notificacoes.schedule).toHaveBeenCalled();
  });

  it('não agenda localmente um lembrete que já chegou pelo Firebase', async () => {
    spyOn(Capacitor, 'getPlatform').and.returnValue('android');
    pushNativo.reservar.and.resolveTo({ permitidos: [], novos: [] });
    await servico.solicitarSincronizacao();
    expect(pushNativo.reservar).toHaveBeenCalledWith({
      usuarioId: '1',
      lembretes: [{ tarefaId: '1', horario: '2099-12-01T10:30:00', instante: new Date(2099, 11, 1, 10, 30).getTime() }],
    });
    expect(notificacoes.schedule.calls.mostRecent().args[0].notifications).toEqual([]);
  });

  it('desfaz as novas reservas se falhar o agendamento local', async () => {
    spyOn(Capacitor, 'getPlatform').and.returnValue('android');
    pushNativo.reservar.and.resolveTo({ permitidos: ['1|1|2099-12-01T10:30:00'], novos: ['1|1|2099-12-01T10:30:00'] });
    pushNativo.cancelarReservas.and.resolveTo();
    notificacoes.schedule.and.rejectWith(new Error('Falha ao agendar'));
    spyOn(console, 'error');
    await servico.solicitarSincronizacao();
    expect(pushNativo.cancelarReservas).toHaveBeenCalledOnceWith({ chaves: ['1|1|2099-12-01T10:30:00'] });
    expect(toast.create).toHaveBeenCalled();
  });
});
