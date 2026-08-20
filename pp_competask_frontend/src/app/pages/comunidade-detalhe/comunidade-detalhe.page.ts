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
  trophyOutline, calendarOutline, chevronForwardOutline } from 'ionicons/icons';

import { ComunidadesService } from '../../services/comunidades.service';
import { TarefaModel } from '../../models/tarefa.model';
import { TarefasService } from '../../services/tarefas.service';
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
    adm: false,
  };
  mensagemAcao = '';

  tarefas: TarefaModel[] = [];
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
    private readonly tarefasService: TarefasService,
    private readonly usuarioService: UsuarioService
  ) {
    addIcons({arrowBackOutline,peopleOutline,filterOutline,caretDownOutline,checkmarkCircleOutline,calendarOutline,flagOutline,chevronForwardOutline,addOutline,paperPlaneOutline,cameraOutline,imageOutline,chatbubbleOutline,checkboxOutline,chevronDownOutline,trophyOutline,});
  }

  get textoOrdenacao(): string {
    return this.opcoesOrdenacao.find((opcao) => opcao.chave === this.ordenacaoAtual)?.label ?? 'Status';
  }

  get usuarioEhAdministrador(): boolean {
    return this.comunidade.adm;
  }

  get tarefasOrdenadas(): TarefaModel[] {
    return [...this.tarefas].sort((tarefaA, tarefaB) => {
      if (this.ordenacaoAtual === 'data') {
        return this.compararDatas(tarefaA.dataRealizacao, tarefaB.dataRealizacao);
      }

      if (this.ordenacaoAtual === 'prioridade') {
        return tarefaA.prioridade - tarefaB.prioridade;
      }

      if (this.ordenacaoAtual === 'alfabetica') {
        return tarefaA.titulo.localeCompare(tarefaB.titulo, 'pt-BR', { sensitivity: 'base' });
      }

      return Number(tarefaA.concluida) - Number(tarefaB.concluida);
    });
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
          adm: comunidade.membros.some((membro) => membro.usuarioId === Number(usuarioAtual.id) && membro.adm),
        };
        this.carregarTarefas();
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
    if (!this.usuarioEhAdministrador || !this.comunidade.idComunidade) {
      return;
    }

    this.router.navigate(['/comunidades/editar', this.comunidade.idComunidade]);
  }

  criarTarefaComunitaria(): void {
    if (!this.usuarioEhAdministrador || !this.comunidade.idComunidade) {
      return;
    }

    this.router.navigate(['/tarefas/nova'], {
      queryParams: { comunidadeId: this.comunidade.idComunidade },
    });
  }

  abrirTarefa(tarefa: TarefaModel): void {
    if (!this.usuarioEhAdministrador) {
      return;
    }

    this.router.navigate(['/tarefas/editar', tarefa.id], {
      queryParams: { comunidadeId: this.comunidade.idComunidade },
    });
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

  private carregarTarefas(): void {
    this.comunidadesService.listarTarefas(this.comunidade.idComunidade).subscribe({
      next: (tarefas) => {
        this.tarefas = tarefas;
      },
      error: () => {
        this.mensagemAcao = 'Nao foi possivel carregar as tarefas da comunidade.';
      },
    });
  }

  getStatus(tarefa: TarefaModel): string {
    return tarefa.concluida ? 'Concluida' : 'Em andamento';
  }

  getPlanejamento(tarefa: TarefaModel): string {
    if (!tarefa.dataRealizacao) {
      return 'Sem prazo definido';
    }

    const data = new Date(`${tarefa.dataRealizacao}T00:00:00`);
    return Number.isNaN(data.getTime()) ? tarefa.dataRealizacao : data.toLocaleDateString('pt-BR');
  }

  private compararDatas(dataA: string, dataB: string): number {
    const valorA = dataA ? new Date(`${dataA}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
    const valorB = dataB ? new Date(`${dataB}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
    return valorA - valorB;
  }
}
