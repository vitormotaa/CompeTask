import { CameraPlugin } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { LocalNotificationsPlugin } from '@capacitor/local-notifications';
import { ToastController } from '@ionic/angular/standalone';
import { PermissoesService } from './permissoes.service';

describe('PermissoesService', () => {
  let service: PermissoesService;
  let toast: jasmine.SpyObj<ToastController>;
  let camera: jasmine.SpyObj<CameraPlugin>;
  let notificacoes: jasmine.SpyObj<LocalNotificationsPlugin>;

  beforeEach(() => {
    localStorage.removeItem('permissoesIniciaisSolicitadas');
    localStorage.removeItem('permissaoInicialCameraSolicitada');
    localStorage.removeItem('permissaoInicialNotificacoesSolicitada');
    spyOn(Capacitor, 'getPlatform').and.returnValue('android');
    toast = jasmine.createSpyObj<ToastController>('ToastController', ['create']);
    const aviso = jasmine.createSpyObj<HTMLIonToastElement>('aviso', ['present']);
    aviso.present.and.resolveTo();
    toast.create.and.resolveTo(aviso);
    camera = jasmine.createSpyObj<CameraPlugin>('Camera', ['checkPermissions', 'requestPermissions']);
    notificacoes = jasmine.createSpyObj<LocalNotificationsPlugin>('LocalNotifications', ['checkPermissions', 'requestPermissions']);
    service = new PermissoesService(toast, camera, notificacoes);
  });

  afterEach(() => {
    localStorage.removeItem('permissoesIniciaisSolicitadas');
    localStorage.removeItem('permissaoInicialCameraSolicitada');
    localStorage.removeItem('permissaoInicialNotificacoesSolicitada');
  });

  it('solicita câmera e notificações apenas na primeira abertura', async () => {
    camera.checkPermissions.and.resolveTo({ camera: 'prompt', photos: 'granted' });
    camera.requestPermissions.and.resolveTo({ camera: 'granted', photos: 'granted' });
    notificacoes.checkPermissions.and.resolveTo({ display: 'prompt' });
    notificacoes.requestPermissions.and.resolveTo({ display: 'granted' });

    await service.solicitarIniciais();
    await service.solicitarIniciais();

    expect(camera.requestPermissions).toHaveBeenCalledOnceWith({ permissions: ['camera'] });
    expect(notificacoes.requestPermissions).toHaveBeenCalledTimes(1);
  });

  it('informa apenas a permissão negada da câmera', async () => {
    camera.checkPermissions.and.resolveTo({ camera: 'denied', photos: 'granted' });
    notificacoes.checkPermissions.and.resolveTo({ display: 'granted' });
    await service.solicitarIniciais();
    expect(toast.create).toHaveBeenCalledTimes(1);
    expect(toast.create.calls.mostRecent().args[0]?.message).toContain('câmera');
    expect(localStorage.getItem('permissoesIniciaisSolicitadas')).toBe('1');
  });

  it('registra a permissão de notificações negada sem exibir aviso', async () => {
    camera.checkPermissions.and.resolveTo({ camera: 'granted', photos: 'granted' });
    notificacoes.checkPermissions.and.resolveTo({ display: 'denied' });
    const aviso = spyOn(console, 'warn');
    await service.solicitarIniciais();
    expect(aviso).toHaveBeenCalled();
    expect(toast.create).not.toHaveBeenCalled();
    expect(localStorage.getItem('permissoesIniciaisSolicitadas')).toBe('1');
  });

  it('registra falhas na permissão de notificações sem exibir aviso', async () => {
    camera.checkPermissions.and.resolveTo({ camera: 'granted', photos: 'granted' });
    notificacoes.checkPermissions.and.rejectWith(new Error('Falha'));
    const erro = spyOn(console, 'error');
    await service.solicitarIniciais();
    expect(erro).toHaveBeenCalled();
    expect(toast.create).not.toHaveBeenCalled();
    expect(localStorage.getItem('permissoesIniciaisSolicitadas')).toBeNull();
  });

  it('não repete a solicitação de notificações quando só a câmera falha', async () => {
    camera.checkPermissions.and.rejectWith(new Error('Câmera indisponível'));
    notificacoes.checkPermissions.and.resolveTo({ display: 'prompt' });
    notificacoes.requestPermissions.and.resolveTo({ display: 'denied' });
    spyOn(console, 'error');
    spyOn(console, 'warn');
    await service.solicitarIniciais();
    await service.solicitarIniciais();
    expect(notificacoes.requestPermissions).toHaveBeenCalledTimes(1);
  });
});
