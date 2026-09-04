import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
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
import { CheckinModel, CheckinsService } from '../../services/checkins.service';

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
  checkinTarefaId = '';
  fotoPreview = '';
  fotoArquivo: File | null = null;
  checkinEnviando = false;
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
  checkins: CheckinModel[] = [];
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
    private readonly usuarioService: UsuarioService,
    private readonly checkinsService: CheckinsService
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

      return Number(this.tarefaEstaConcluida(tarefaA)) - Number(this.tarefaEstaConcluida(tarefaB));
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
        this.carregarTarefas(Number(usuarioAtual.id));
        this.carregarCheckins();
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
    if (aba === 'checkins') {
      this.carregarCheckins();
    }
  }

  selecionarRanking(periodo: PeriodoRanking): void {
    this.rankingAtual = periodo;
  }

  abrirNovoCheckin(tarefa?: TarefaModel): void {
    if (tarefa?.concluida) {
      this.mensagemAcao = 'Esta tarefa já foi concluída para todos.';
      return;
    }

    this.checkinTarefaId = tarefa?.id ?? this.tarefas.find((item) => !item.concluida && !item.concluidaPeloUsuario)?.id ?? '';
    this.novoCheckinAberto = true;
  }

  fecharNovoCheckin(): void {
    this.novoCheckinAberto = false;
    this.limparCheckin();
  }

  publicarCheckin(): void {
    const usuarioAtual = this.usuarioService.obterUsuarioSessao();
    const tarefa = this.tarefas.find((item) => item.id === this.checkinTarefaId);

    if (!usuarioAtual?.id || !tarefa || tarefa.concluida || !this.fotoArquivo || !this.checkinTitulo.trim()) {
      this.mensagemAcao = !this.checkinTitulo.trim()
        ? 'Informe um titulo para o check-in.'
        : !this.fotoArquivo ? 'Adicione uma foto para fazer o check-in.' : 'Selecione uma tarefa válida.';
      return;
    }

    this.checkinEnviando = true;
    this.checkinsService.enviarImagem(this.fotoArquivo).subscribe({
      next: (imagem) => {
        this.checkinsService.criar({
          usuarioId: Number(usuarioAtual.id),
          comunidadeId: this.comunidade.idComunidade,
          tarefaId: Number(tarefa.id),
          descricao: this.montarDescricaoCheckin(),
          foto: imagem.url,
          fotoPublicId: imagem.publicId,
          dataHoraEnvio: new Date().toISOString(),
        }).subscribe({
          next: () => {
            this.checkinEnviando = false;
            tarefa.concluidaPeloUsuario = true;
            this.mensagemAcao = 'Check-in realizado! Sua pontuação aumentou.';
            this.fecharNovoCheckin();
            this.carregarComunidade();
          },
          error: (erro: HttpErrorResponse) => this.tratarErroCheckin(erro),
        });
      },
      error: (erro: HttpErrorResponse) => this.tratarErroCheckin(erro),
    });
  }

  enviarMensagem(): void {
    this.mensagemChat = '';
  }

  concluirParaTodos(tarefa: TarefaModel, event: Event): void {
    event.stopPropagation();
    const usuarioAtual = this.usuarioService.obterUsuarioSessao();
    if (!usuarioAtual?.id || !this.usuarioEhAdministrador) {
      return;
    }

    this.tarefasService.concluirParaTodos(tarefa, usuarioAtual.id).subscribe({
      next: (resultado) => {
        tarefa.concluida = resultado.concluida;
        this.carregarTarefas(Number(usuarioAtual.id));
      },
      error: () => this.mensagemAcao = 'Nao foi possivel alterar a conclusao da tarefa.',
    });
  }

  selecionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) {
      return;
    }

    this.fotoArquivo = arquivo;
    const leitor = new FileReader();
    leitor.onload = () => this.fotoPreview = String(leitor.result || '');
    leitor.readAsDataURL(arquivo);
  }

  tarefaEstaConcluida(tarefa: TarefaModel): boolean {
    return tarefa.inComunidade ? Boolean(tarefa.concluidaPeloUsuario) : tarefa.concluida;
  }

  getTituloCheckin(checkin: CheckinModel): string {
    const tituloSalvo = this.obterPartesDescricao(checkin).titulo;
    return tituloSalvo || this.tarefas.find((tarefa) => Number(tarefa.id) === checkin.tarefaId)?.titulo || `Tarefa #${checkin.tarefaId}`;
  }

  getDescricaoCheckin(checkin: CheckinModel): string {
    return this.obterPartesDescricao(checkin).descricao || 'Check-in realizado com sucesso.';
  }

  private carregarTarefas(idUsuario: number): void {
    this.comunidadesService.listarTarefas(this.comunidade.idComunidade, idUsuario).subscribe({
      next: (tarefas) => {
        this.tarefas = tarefas;
      },
      error: () => {
        this.mensagemAcao = 'Nao foi possivel carregar as tarefas da comunidade.';
      },
    });
  }

  private carregarCheckins(): void {
    if (!this.comunidade.idComunidade) {
      return;
    }

    this.checkinsService.listarPorComunidade(this.comunidade.idComunidade).subscribe({
      next: (checkins) => {
        this.checkins = checkins;
      },
      error: () => {
        this.mensagemAcao = 'Nao foi possivel carregar os check-ins da comunidade.';
      },
    });
  }

  getStatus(tarefa: TarefaModel): string {
    return tarefa.concluida ? 'Concluida para todos' : this.tarefaEstaConcluida(tarefa) ? 'Concluida por voce' : 'Em andamento';
  }

  private limparCheckin(): void {
    this.checkinTitulo = '';
    this.checkinDescricao = '';
    this.checkinTarefaId = '';
    this.fotoPreview = '';
    this.fotoArquivo = null;
    this.checkinEnviando = false;
  }

  private montarDescricaoCheckin(): string {
    return `Título: ${this.checkinTitulo.trim()}\n${this.checkinDescricao.trim()}`;
  }

  private obterPartesDescricao(checkin: CheckinModel): { titulo: string; descricao: string } {
    const descricao = checkin.descricao || '';
    if (!descricao.startsWith('Título: ')) {
      return { titulo: '', descricao };
    }

    const quebraLinha = descricao.indexOf('\n');
    return {
      titulo: descricao.slice(8, quebraLinha === -1 ? undefined : quebraLinha).trim(),
      descricao: quebraLinha === -1 ? '' : descricao.slice(quebraLinha + 1).trim(),
    };
  }

  private tratarErroCheckin(erro: HttpErrorResponse): void {
    this.checkinEnviando = false;
    const mensagem = typeof erro.error === 'string'
      ? erro.error
      : String(erro.error?.message ?? erro.error?.error ?? erro.message ?? 'Nao foi possivel realizar o check-in.');
    this.mensagemAcao = mensagem;
    this.carregarComunidade();
    if (mensagem.toLowerCase().includes('concluída') || mensagem.toLowerCase().includes('concluida')) {
      this.fecharNovoCheckin();
    }
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
