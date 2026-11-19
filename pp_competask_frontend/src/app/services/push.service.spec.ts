import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { AppPlugin } from '@capacitor/app';
import { PushNotificationsPlugin } from '@capacitor/push-notifications';
import { ToastController } from '@ionic/angular/standalone';
import { LembreteEventosService } from './lembrete-eventos.service';
import { LEMBRETE_PUSH_NATIVE, LembretePushNative } from './lembrete-push-native';
import { APP_PUSH, NOTIFICACOES_PUSH, PushService } from './push.service';
import { UsuarioService } from './usuario.service';

describe('PushService', () => {
  let push: jasmine.SpyObj<PushNotificationsPlugin>;
  let nativo: jasmine.SpyObj<LembretePushNative>;
  let usuarios: jasmine.SpyObj<UsuarioService>;
  let eventos: LembreteEventosService;
  let http: HttpTestingController;

  beforeEach(() => {
    spyOn(Capacitor, 'getPlatform').and.returnValue('android');
    push = jasmine.createSpyObj<PushNotificationsPlugin>('PushNotifications', [
      'addListener', 'register', 'unregister', 'checkPermissions',
    ]);
    nativo = jasmine.createSpyObj<LembretePushNative>('LembretePush', ['addListener', 'definirUsuario']);
    usuarios = jasmine.createSpyObj<UsuarioService>('UsuarioService', ['obterUsuarioSessao']);
    eventos = new LembreteEventosService();
    const handle: PluginListenerHandle = { remove: () => Promise.resolve() };
    const app = jasmine.createSpyObj<AppPlugin>('App', ['addListener']);
    app.addListener.and.resolveTo(handle);
    push.addListener.and.resolveTo(handle);
    push.checkPermissions.and.resolveTo({ receive: 'granted' });
    push.register.and.resolveTo();
    push.unregister.and.resolveTo();
    nativo.addListener.and.resolveTo(handle);
    nativo.definirUsuario.and.resolveTo();
    usuarios.obterUsuarioSessao.and.returnValue({ id: '1', nome: 'Nome', email: 'u@example.com' });
    localStorage.setItem('token', 'token-de-acesso');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        { provide: NOTIFICACOES_PUSH, useValue: push },
        { provide: LEMBRETE_PUSH_NATIVE, useValue: nativo },
        { provide: APP_PUSH, useValue: app },
        { provide: UsuarioService, useValue: usuarios },
        { provide: LembreteEventosService, useValue: eventos },
        { provide: ToastController, useValue: jasmine.createSpyObj<ToastController>('Toast', ['create']) },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate']) },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('token');
  });

  it('associa o token ao usuário e o desvincula ao sair', fakeAsync(() => {
    TestBed.inject(PushService).iniciar();
    flushMicrotasks();
    expect(nativo.definirUsuario).toHaveBeenCalledWith({ usuarioId: '1' });
    expect(push.register).toHaveBeenCalled();

    const chamadas: readonly (readonly unknown[])[] = push.addListener.calls.allArgs();
    const callback = chamadas.find(([evento]) => evento === 'registration')?.[1];
    if (typeof callback !== 'function') {
      fail('O listener de registro não foi instalado.');
      return;
    }
    callback({ value: 'token-firebase' });
    flushMicrotasks();
    const registro = http.expectOne((req) => req.url.endsWith('/notificacoes/dispositivos'));
    expect(registro.request.body).toEqual({ token: 'token-firebase' });
    registro.flush(null, { status: 204, statusText: 'No Content' });
    flushMicrotasks();

    usuarios.obterUsuarioSessao.and.returnValue(null);
    localStorage.setItem('token', 'token-renovado');
    eventos.notificarSaida();
    localStorage.removeItem('token');
    eventos.notificar();
    flushMicrotasks();
    expect(nativo.definirUsuario).toHaveBeenCalledWith({ usuarioId: '' });
    const exclusao = http.expectOne((req) => req.method === 'DELETE' && req.url.endsWith('/notificacoes/dispositivos'));
    expect(exclusao.request.headers.get('Authorization')).toBe('Bearer token-renovado');
    exclusao.flush(null, { status: 204, statusText: 'No Content' });
    flushMicrotasks();
    expect(push.unregister).toHaveBeenCalled();
  }));
});
