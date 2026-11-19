import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Camera, CameraPlugin } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications, LocalNotificationsPlugin } from '@capacitor/local-notifications';
import { ToastController } from '@ionic/angular/standalone';

const CAMERA = new InjectionToken<CameraPlugin>('Câmera', { providedIn: 'root', factory: () => Camera });
const NOTIFICACOES = new InjectionToken<LocalNotificationsPlugin>(
  'Permissão de notificações', { providedIn: 'root', factory: () => LocalNotifications },
);

@Injectable({ providedIn: 'root' })
export class PermissoesService {
  private readonly chave = 'permissoesIniciaisSolicitadas';

  constructor(
    private readonly toast: ToastController,
    @Inject(CAMERA) private readonly camera: CameraPlugin,
    @Inject(NOTIFICACOES) private readonly notificacoes: LocalNotificationsPlugin,
  ) {}

  async solicitarIniciais(): Promise<void> {
    if (Capacitor.getPlatform() !== 'android' || localStorage.getItem(this.chave)) return;

    try {
      let camera = await this.camera.checkPermissions();
      if (camera.camera === 'prompt' || camera.camera === 'prompt-with-rationale') {
        camera = await this.camera.requestPermissions({ permissions: ['camera'] });
      }

      let notificacoes = await this.notificacoes.checkPermissions();
      if (notificacoes.display === 'prompt' || notificacoes.display === 'prompt-with-rationale') {
        notificacoes = await this.notificacoes.requestPermissions();
      }
      localStorage.setItem(this.chave, '1');

      if (camera.camera !== 'granted' || notificacoes.display !== 'granted') {
        const aviso = await this.toast.create({
          message: 'Você pode ativar câmera e notificações nas configurações do aplicativo.',
          duration: 5000,
          position: 'top',
          color: 'warning',
        });
        await aviso.present();
      }
    } catch (erro: unknown) {
      console.error('Não foi possível solicitar as permissões iniciais.', erro);
      const aviso = await this.toast.create({
        message: 'Não foi possível solicitar as permissões. Tente novamente ao abrir o aplicativo.',
        duration: 5000,
        position: 'top',
        color: 'warning',
      });
      await aviso.present();
    }
  }
}
