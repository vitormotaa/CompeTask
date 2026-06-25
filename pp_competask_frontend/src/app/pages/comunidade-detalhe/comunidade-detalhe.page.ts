import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowBackOutline,
  cameraOutline,
  caretDownOutline,
  chatbubbleOutline,
  checkmarkCircleOutline,
  checkboxOutline,
  chevronDownOutline,
  flagOutline,
  filterOutline,
  imageOutline,
  paperPlaneOutline,
  peopleOutline,
  trophyOutline,
} from 'ionicons/icons';

import { ComunidadesService } from '../../services/comunidades.service';
import { UsuarioService } from '../../services/usuario.service';

type AbaComunidade = 'tarefas' | 'chat' | 'checkins' | 'ranking';
type PeriodoRanking = 'semanal' | 'mensal' | 'anual';
type OrdenacaoComunidade = 'status' | 'data' | 'prioridade' | 'alfabetica';

@Component({
  selector: 'app-comunidade-detalhe',
  templateUrl: './comunidade-detalhe.page.html',
  styleUrls: ['./comunidade-detalhe.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
})
export class ComunidadeDetalhePage {
  abaAtual: AbaComunidade = 'tarefas';
  rankingAtual: PeriodoRanking = 'semanal';
  novoCheckinAberto = false;
  mensagemChat = '';
  checkinTitulo = '';
  checkinDescricao = '';
  statusMenuAberto = false;
  ordenacaoAtual: OrdenacaoComunidade = 'status';

  comunidade = {
    idComunidade: 0,
    nome: 'Carregando...',
    membros: 0,
    foto: '',
  };
  mensagemAcao = '';

  readonly tarefas: any[] = [];
  readonly mensagens: any[] = [];
  readonly checkins: any[] = [];
  readonly ranking: any[] = [];

  readonly opcoesOrdenacao: Array<{ chave: OrdenacaoComunidade; label: string }> = [
    { chave: 'status', label: 'Status' },
    { chave: 'data', label: 'Data planejada' },
    { chave: 'prioridade', label: 'Prioridade' },
    { chave: 'alfabetica', label: 'Alfabetica' },
  ];

  readonly abas: Array<{ id: AbaComunidade; label: string; icon: string }> = [
    { id: 'tarefas', label: 'Tarefas', icon: 'checkbox-outline' },
    { id: 'chat', label: 'Chat', icon: 'chatbubble-outline' },
    { id: 'checkins', label: 'Check-ins', icon: 'camera-outline' },
    { id: 'ranking', label: 'Ranking', icon: 'trophy-outline' },
  ];

  readonly periodos: Array<{ id: PeriodoRanking; label: string }> = [
    { id: 'semanal', label: 'Semanal' },
    { id: 'mensal', label: 'Mensal' },
    { id: 'anual', label: 'Anual' },
  ];

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly comunidadesService: ComunidadesService,
    private readonly usuarioService: UsuarioService
  ) {
    addIcons({
      addOutline,
      arrowBackOutline,
      cameraOutline,
      caretDownOutline,
      chatbubbleOutline,
      checkmarkCircleOutline,
      checkboxOutline,
      chevronDownOutline,
      flagOutline,
      filterOutline,
      imageOutline,
      paperPlaneOutline,
      peopleOutline,
      trophyOutline,
    });
  }

  get textoOrdenacao(): string {
    return this.opcoesOrdenacao.find((opcao) => opcao.chave === this.ordenacaoAtual)?.label ?? 'Status';
  }

  ionViewWillEnter(): void {
    this.carregarComunidade();
  }

  carregarComunidade(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.mensagemAcao = 'Comunidade nao encontrada.';
      return;
    }

    const usuarioAtual = this.usuarioService.obterUsuarioSessao();

    if (!usuarioAtual?.id) {
      this.mensagemAcao = 'Voce precisa estar logado para ver esta comunidade.';
      return;
    }

    this.comunidadesService.listarPorUsuario(usuarioAtual.id).subscribe({
      next: (comunidades) => {
        const comunidade = comunidades.find((item) => String(item.idComunidade) === id) || null;

        if (!comunidade) {
          this.mensagemAcao = 'Comunidade nao encontrada.';
          return;
        }

        this.comunidade = {
          idComunidade: comunidade.idComunidade,
          nome: comunidade.nome,
          membros: comunidade.membros.length,
          foto: comunidade.foto,
        };
      },
      error: () => {
        this.mensagemAcao = 'Nao foi possivel carregar a comunidade.';
      },
    });
  }

  voltar(): void {
    this.router.navigate(['/comunidades']);
  }

  editarComunidade(): void {
    if (!this.comunidade.idComunidade) {
      return;
    }

    this.router.navigate(['/comunidades/editar', this.comunidade.idComunidade]);
  }

  alternarMenuStatus(event: Event): void {
    event.stopPropagation();
    this.statusMenuAberto = !this.statusMenuAberto;
  }

  selecionarOrdenacao(chave: OrdenacaoComunidade): void {
    this.ordenacaoAtual = chave;
    this.statusMenuAberto = false;
  }

  selecionarAba(aba: AbaComunidade): void {
    this.abaAtual = aba;
  }

  selecionarRanking(periodo: PeriodoRanking): void {
    this.rankingAtual = periodo;
  }

  abrirNovoCheckin(): void {
    this.novoCheckinAberto = true;
  }

  fecharNovoCheckin(): void {
    this.novoCheckinAberto = false;
  }

  publicarCheckin(): void {
    this.novoCheckinAberto = false;
    this.checkinTitulo = '';
    this.checkinDescricao = '';
  }

  enviarMensagem(): void {
    this.mensagemChat = '';
  }
}
