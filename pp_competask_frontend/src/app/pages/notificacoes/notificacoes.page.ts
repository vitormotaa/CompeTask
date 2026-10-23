import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, notificationsOutline } from 'ionicons/icons';

import { NotificacaoModel } from '../../models/notificacao.model';
import { NotificacaoService } from '../../services/notificacao.service';

@Component({
  selector: 'app-notificacoes',
  templateUrl: './notificacoes.page.html',
  styleUrls: ['./notificacoes.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class NotificacoesPage {
  notificacoes: NotificacaoModel[] = [];
  carregando = false;
  mensagemAcao = '';

  constructor(
    private readonly router: Router,
    private readonly notificacaoService: NotificacaoService,
  ) {
    addIcons({ arrowBackOutline, notificationsOutline });
  }

  get notificacoesNaoLidas(): number {
    return this.notificacoes.filter((notificacao) => !notificacao.lida).length;
  }

  ionViewWillEnter(): void {
    this.carregando = true;
    this.mensagemAcao = '';

    this.notificacaoService.listar().subscribe({
      next: (notificacoes) => {
        this.notificacoes = notificacoes;
        this.carregando = false;
      },
      error: () => {
        this.mensagemAcao = 'Não foi possível carregar as notificações.';
        this.carregando = false;
      },
    });
  }

  voltar(): void {
    this.router.navigate(['/usuario']);
  }

  marcarComoLida(notificacao: NotificacaoModel): void {
    if (notificacao.lida) {
      return;
    }

    this.notificacaoService.marcarComoLida(notificacao.id).subscribe({
      next: (atualizada) => {
        notificacao.lida = atualizada.lida;
      },
    });
  }
}
