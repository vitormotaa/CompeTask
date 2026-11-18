import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, chevronBackOutline, chevronForwardOutline, notificationsOutline } from 'ionicons/icons';

import { NotificacaoModel } from '../../models/notificacao.model';
import { NotificacaoService } from '../../services/notificacao.service';
import { agruparPorMes, chaveDoDia, GrupoDia, identificarGrupoDia } from '../../utils/agrupar-por-dia';
import { centralizarAbaSelecionada } from '../../utils/abas-dia';

@Component({
  selector: 'app-notificacoes',
  templateUrl: './notificacoes.page.html',
  styleUrls: ['./notificacoes.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class NotificacoesPage {
  @ViewChild('abasDias') abasDias?: ElementRef<HTMLElement>;
  notificacoes: NotificacaoModel[] = [];
  carregando = false;
  mensagemAcao = '';
  diaSelecionado: string | null = null;
  mesVisivel = new Date();
  readonly identificarGrupoDia = identificarGrupoDia;

  constructor(
    private readonly router: Router,
    private readonly notificacaoService: NotificacaoService,
  ) {
    addIcons({ arrowBackOutline, chevronBackOutline, chevronForwardOutline, notificationsOutline });
  }

  get notificacoesNaoLidas(): number {
    return this.notificacoes.filter((notificacao) => !notificacao.lida).length;
  }

  get gruposNotificacoes(): GrupoDia<NotificacaoModel>[] {
    return agruparPorMes(
      this.notificacoes,
      (notificacao) => notificacao.dataHora ? new Date(notificacao.dataHora) : null,
      this.mesVisivel,
    );
  }

  get grupoSelecionado(): GrupoDia<NotificacaoModel> | null {
    const grupos = this.gruposNotificacoes;
    return grupos.find((grupo) => grupo.chave === this.diaSelecionado)
      ?? grupos.find((grupo) => grupo.chave === chaveDoDia(new Date())) ?? grupos[0] ?? null;
  }

  get tituloMes(): string {
    return this.mesVisivel.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  mudarMes(diferenca: number): void {
    this.mesVisivel = new Date(this.mesVisivel.getFullYear(), this.mesVisivel.getMonth() + diferenca, 1);
    this.diaSelecionado = chaveDoDia(this.mesVisivel);
    centralizarAbaSelecionada(() => this.abasDias?.nativeElement);
  }

  ionViewWillEnter(): void {
    const hoje = new Date();
    this.mesVisivel = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    this.diaSelecionado = chaveDoDia(hoje);
    centralizarAbaSelecionada(() => this.abasDias?.nativeElement);
    this.carregando = true;
    this.mensagemAcao = '';

    this.notificacaoService.listar().subscribe({
      next: (notificacoes) => {
        this.notificacoes = notificacoes;
        this.carregando = false;
        centralizarAbaSelecionada(() => this.abasDias?.nativeElement);
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
