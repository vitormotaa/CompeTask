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
    spyOn(Capacitor, 'getPlatform').and.returnValue('android');
    toast = jasmine.createSpyObj<ToastController>('ToastController', ['create']);
    const aviso = jasmine.createSpyObj<HTMLIonToastElement>('aviso', ['present']);
    aviso.present.and.resolveTo();
    toast.create.and.resolveTo(aviso);
    camera = jasmine.createSpyObj<CameraPlugin>('Camera', ['checkPermissions', 'requestPermissions']);
    notificacoes = jasmine.createSpyObj<LocalNotificationsPlugin>('LocalNotifications', ['checkPermissions', 'requestPermissions']);
    service = new PermissoesService(toast, camera, notificacoes);
  });

  afterEach(() => localStorage.removeItem('permissoesIniciaisSolicitadas'));

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

  it('informa permissões negadas sem repeti-las na abertura seguinte', async () => {
    camera.checkPermissions.and.resolveTo({ camera: 'denied', photos: 'granted' });
    notificacoes.checkPermissions.and.resolveTo({ display: 'denied' });
    await service.solicitarIniciais();
    expect(toast.create).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('permissoesIniciaisSolicitadas')).toBe('1');
  });
});
