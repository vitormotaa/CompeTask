import { HttpBackend, HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { App, AppPlugin } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, PushNotificationsPlugin } from '@capacitor/push-notifications';
import { ToastController } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { LembreteEventosService } from './lembrete-eventos.service';
import { LEMBRETE_PUSH_NATIVE, LembretePushNative } from './lembrete-push-native';
import { UsuarioService } from './usuario.service';

export const NOTIFICACOES_PUSH = new InjectionToken<PushNotificationsPlugin>(
  'Notificações Firebase', { providedIn: 'root', factory: () => PushNotifications },
);
export const APP_PUSH = new InjectionToken<AppPlugin>(
  'Estado do aplicativo para notificações', { providedIn: 'root', factory: () => App },
);

@Injectable({ providedIn: 'root' })
export class PushService {
  private readonly url = 'https://competask.onrender.com/api/v1/notificacoes/dispositivos';
  private readonly semInterceptores: HttpClient;
  private usuarioId: string | null = null;
  private tokenPush = '';
  private tokenAcesso = '';
  private iniciou = false;
  private fila = Promise.resolve();

  constructor(
    backend: HttpBackend,
    private readonly http: HttpClient,
    private readonly usuarios: UsuarioService,
    private readonly eventos: LembreteEventosService,
    private readonly toast: ToastController,
    private readonly zona: NgZone,
    private readonly router: Router,
    @Inject(NOTIFICACOES_PUSH) private readonly push: PushNotificationsPlugin,
    @Inject(LEMBRETE_PUSH_NATIVE) private readonly nativo: LembretePushNative,
    @Inject(APP_PUSH) private readonly app: AppPlugin,
  ) {
    this.semInterceptores = new HttpClient(backend);
  }

  async iniciar(): Promise<void> {
    if (this.iniciou || Capacitor.getPlatform() !== 'android') return;
    this.iniciou = true;
    try {
      await this.push.addListener('registration', ({ value }) => {
        this.zona.run(() => { void this.registrar(value).catch((erro: unknown) => this.relatarErro(erro)); });
      });
      await this.push.addListener('registrationError', (erro) => {
        void this.relatarErro(erro);
      });
      await this.push.addListener('pushNotificationActionPerformed', () => {
        this.zona.run(() => {
          if (this.usuarios.obterUsuarioSessao()) void this.router.navigate(['/notificacoes']);
        });
      });
      await this.nativo.addListener('abriuLembrete', () => {
        this.zona.run(() => {
          if (this.usuarios.obterUsuarioSessao()) void this.router.navigate(['/notificacoes']);
        });
      });
      await this.app.addListener('appStateChange', ({ isActive }) => {
        if (isActive) this.zona.run(() => this.solicitarAtualizacao(true));
      });
      this.eventos.saida$.subscribe(() => {
        this.tokenAcesso = localStorage.getItem('token') ?? this.tokenAcesso;
      });
      this.eventos.alteracoes$.subscribe(() => this.solicitarAtualizacao());
      this.solicitarAtualizacao(true);
    } catch (erro: unknown) {
      await this.relatarErro(erro);
    }
  }

  private solicitarAtualizacao(forcar = false): void {
    this.fila = this.fila.then(() => this.atualizar(forcar)).catch((erro: unknown) => this.relatarErro(erro));
  }

  private async atualizar(forcar: boolean): Promise<void> {
    const usuarioId = this.usuarios.obterUsuarioSessao()?.id ?? '';
    if (usuarioId !== this.usuarioId) {
      const anterior = { tokenPush: this.tokenPush, tokenAcesso: this.tokenAcesso };
      this.usuarioId = usuarioId;
      this.tokenPush = '';
      this.tokenAcesso = '';
      await this.nativo.definirUsuario({ usuarioId });
      if (anterior.tokenPush && anterior.tokenAcesso) {
        try {
          await firstValueFrom(this.semInterceptores.delete<void>(this.url, {
            headers: { Authorization: `Bearer ${anterior.tokenAcesso}` },
            body: { token: anterior.tokenPush },
          }));
        } catch (erro: unknown) {
          console.error('Não foi possível desvincular o dispositivo do usuário anterior.', erro);
          void this.toast.create({
            message: 'Não foi possível desvincular as notificações remotas no servidor.',
            duration: 6000, position: 'top', color: 'warning',
          }).then((aviso) => aviso.present())
            .catch((falha: unknown) => console.error('Não foi possível exibir o aviso.', falha));
        }
      }
      if (!usuarioId) {
        await this.push.unregister();
        return;
      }
      forcar = true;
    }
    if (!usuarioId || !forcar) return;
    const permissao = await this.push.checkPermissions();
    if (permissao.receive !== 'granted') return;
    await this.push.register();
  }

  private async registrar(token: string): Promise<void> {
    const usuarioId = this.usuarios.obterUsuarioSessao()?.id;
    if (!usuarioId || usuarioId !== this.usuarioId) return;
    await firstValueFrom(this.http.post<void>(this.url, { token }));
    if (this.usuarios.obterUsuarioSessao()?.id !== usuarioId) return;
    this.tokenPush = token;
    this.tokenAcesso = localStorage.getItem('token') ?? '';
  }

  private async relatarErro(erro: unknown): Promise<void> {
    console.error('Não foi possível configurar as notificações Firebase.', erro);
    const aviso = await this.toast.create({
      message: 'Não foi possível configurar notificações remotas. Os lembretes locais continuam disponíveis.',
      duration: 6000, position: 'top', color: 'warning',
    });
    await aviso.present();
  }
}

