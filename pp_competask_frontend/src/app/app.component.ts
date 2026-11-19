import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

import { LoadingService } from './services/loading.service';
import { LembreteLocalService } from './services/lembrete-local.service';
import { PermissoesService } from './services/permissoes.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet, NgIf, AsyncPipe],
})
export class AppComponent {
  constructor(readonly loading: LoadingService, lembretes: LembreteLocalService, permissoes: PermissoesService) {
    void permissoes.solicitarIniciais().finally(() => lembretes.iniciar());
  }
}
