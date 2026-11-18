import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  caretDownOutline,
  checkmarkCircleOutline,
  chevronBackOutline,
  chevronForwardOutline,
  calendarOutline,
  flagOutline,
  filterOutline,
  peopleOutline,
  personOutline,
  timerOutline,
} from 'ionicons/icons';

import { TarefaModel } from '../../models/tarefa.model';
import { UsuarioService } from '../../services/usuario.service';
import { TarefasService } from '../../services/tarefas.service';
import { agruparPorMes, chaveDoDia, GrupoDia, identificarGrupoDia } from '../../utils/agrupar-por-dia';
import { centralizarAbaSelecionada } from '../../utils/abas-dia';

type AtalhoRodape = {
  label: string;
  icon: string;
  rota?: string;
  ativo?: boolean;
};

@Component({
  selector: 'app-tarefas',
  templateUrl: './tarefas.page.html',
  styleUrls: ['./tarefas.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class TarefasPage {
  @ViewChild('abasDias') abasDias?: ElementRef<HTMLElement>;
  tarefas: TarefaModel[] = [];
  mensagemAcao = '';
  statusMenuAberto = false;
  concluidasAbertas = false;
  diaSelecionado: string | null = null;
  mesVisivel = new Date();
  readonly identificarGrupoDia = identificarGrupoDia;
  ordenacaoAtual: 'status' | 'data' | 'prioridade' | 'alfabetica' = 'status';

  readonly opcoesOrdenacao = [
    { chave: 'status', label: 'Status' },
    { chave: 'data', label: 'Data planejada' },
    { chave: 'prioridade', label: 'Prioridade' },
    { chave: 'alfabetica', label: 'Alfabética' },
  ] as const;

  atalhosRodape: AtalhoRodape[] = [
    { label: 'Tarefas', icon: 'checkmark-circle-outline', rota: '/tarefas', ativo: true },
    { label: 'Comunidades', icon: 'people-outline', rota: '/comunidades' },
    { label: 'Cronômetro', icon: 'timer-outline', rota: '/timer' },
    { label: 'Usuário', icon: 'person-outline', rota: '/usuario' },
  ];

  constructor(
    private readonly router: Router,
    private readonly tarefasService: TarefasService,
    private readonly usuarioService: UsuarioService,
  ) {
    addIcons({
      addOutline,
      calendarOutline,
      caretDownOutline,
      checkmarkCircleOutline,
      chevronBackOutline,
      chevronForwardOutline,
      flagOutline,
      filterOutline,
      peopleOutline,
      personOutline,
      timerOutline,
    });
  }

  ionViewWillEnter(): void {
    const hoje = new Date();
    this.mesVisivel = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    this.diaSelecionado = chaveDoDia(hoje);
    this.centralizarDiaSelecionado();
    this.carregarTarefas();
  }

  get tarefasPendentes(): TarefaModel[] {
    return this.ordenarTarefas(this.tarefas.filter((tarefa) => !tarefa.concluida));
  }

  get tarefasConcluidas(): TarefaModel[] {
    return this.ordenarTarefas(this.tarefas.filter((tarefa) => tarefa.concluida));
  }

  get gruposDias(): GrupoDia<TarefaModel>[] {
    return agruparPorMes(
      [...this.tarefasPendentes, ...this.tarefasConcluidas],
      (tarefa) => this.parseData(tarefa.dataRealizacao),
      this.mesVisivel,
    );
  }

  get tituloMes(): string {
    return this.mesVisivel.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  mudarMes(diferenca: number): void {
    this.mesVisivel = new Date(this.mesVisivel.getFullYear(), this.mesVisivel.getMonth() + diferenca, 1);
    this.diaSelecionado = chaveDoDia(this.mesVisivel);
    this.centralizarDiaSelecionado();
  }

  get grupoSelecionado(): GrupoDia<TarefaModel> | null {
    const grupos = this.gruposDias;
    return grupos.find((grupo) => grupo.chave === this.diaSelecionado)
      ?? grupos.find((grupo) => grupo.chave === chaveDoDia(new Date())) ?? grupos[0] ?? null;
  }

  get pendentesDoDia(): TarefaModel[] {
    return this.grupoSelecionado?.itens.filter((tarefa) => !tarefa.concluida) ?? [];
  }

  get concluidasDoDia(): TarefaModel[] {
    return this.grupoSelecionado?.itens.filter((tarefa) => tarefa.concluida) ?? [];
  }

  get textoOrdenacao(): string {
    return this.opcoesOrdenacao.find((opcao) => opcao.chave === this.ordenacaoAtual)?.label ?? 'Status';
  }

  criarNovaTarefa(): void {
    this.router.navigate(['/tarefas/nova']);
  }

  abrirTarefa(tarefa: TarefaModel): void {
    this.router.navigate(['/tarefas/editar', tarefa.id]);
  }

  alternarConclusao(tarefa: TarefaModel, event: Event): void {
    event.stopPropagation();

    const usuarioAtual = this.usuarioService.obterUsuarioSessao();
    if (!usuarioAtual) {
      this.router.navigate(['/login']);
      return;
    }

    this.tarefasService.alternarConclusao(tarefa).subscribe({
      next: () => {
        this.carregarTarefas();
      },
      error: () => {
        console.log("deu erro aqui na hora de concluir tarefa no banco")
      }
    });
  }

  abrirAtalho(atalho: AtalhoRodape): void {
    if (atalho.ativo) {
      return;
    }

    if (atalho.rota) {
      this.router.navigate([atalho.rota]);
      return;
    }

    this.mensagemAcao = `${atalho.label} ainda será ligado ao backend.`;
  }

  alternarMenuStatus(event: Event): void {
    event.stopPropagation();
    this.statusMenuAberto = !this.statusMenuAberto;
  }

  selecionarOrdenacao(chave: 'status' | 'data' | 'prioridade' | 'alfabetica'): void {
    this.ordenacaoAtual = chave;
    this.statusMenuAberto = false;
  }

  alternarConcluidas(): void {
    this.concluidasAbertas = !this.concluidasAbertas;
  }

  getStatus(tarefa: TarefaModel): string {
    if (tarefa.concluida) {
      return 'Concluída';
    }

    if (this.estaAtrasada(tarefa)) {
      return 'Atrasada';
    }

    return 'Em andamento';
  }

  getClasseCard(tarefa: TarefaModel): string {
    if (tarefa.concluida) {
      return 'task-card task-card--done';
    }

    if (this.estaAtrasada(tarefa)) {
      return 'task-card task-card--late';
    }

    return 'task-card';
  }

  getClasseStatus(tarefa: TarefaModel): string {
    if (tarefa.concluida) {
      return 'task-chip task-chip--done';
    }

    if (this.estaAtrasada(tarefa)) {
      return 'task-chip task-chip--late';
    }

    return 'task-chip';
  }

  getPlanejamento(tarefa: TarefaModel): string {
    const hoje = this.ajustarParaMeiaNoite(new Date());
    const alvo = this.parseData(tarefa.dataRealizacao);

    if (!alvo) {
      return 'Sem prazo definido';
    }

    const diferencaDias = Math.round((alvo.getTime() - hoje.getTime()) / 86400000);

    if (diferencaDias === 0) {
      return 'Hoje';
    }

    if (diferencaDias === 1) {
      return 'Amanhã';
    }

    return alvo.toLocaleDateString('pt-BR');
  }

  getDescricaoOrdenacao(): string {
    switch (this.ordenacaoAtual) {
      case 'data':
        return 'data';
      case 'prioridade':
        return 'prioridade';
      default:
        return 'status';
    }
  }

  //API
  private carregarTarefas(): void {
    const usuarioAtual = this.usuarioService.obterUsuarioSessao();
    if (!usuarioAtual) {
      this.tarefas = [];
      return;
    }

    this.tarefasService.buscarTarefasUsuario().subscribe({
      next: (resultado: TarefaModel[]) => {
          this.tarefas = resultado;
          this.tarefasService.guardarTarefasLocal(this.tarefas);
          this.centralizarDiaSelecionado();
      },
      error:  () => {
          console.log("deu erro aqui na hora de puxar as tarefas do usuario do banco")
      }
    });
  }

  private centralizarDiaSelecionado(): void {
    centralizarAbaSelecionada(() => this.abasDias?.nativeElement);
  }

  // private ordenarTarefas(tarefas: TarefaModel[]): TarefaModel[] {
  //   return [...tarefas].sort((a, b) => {
  //     if (this.ordenacaoAtual === 'data') {
  //       return this.compararDatas(a.dataRealizacao, b.dataRealizacao);
  //     }

  //     if (this.ordenacaoAtual === 'prioridade') {
  //       return a.prioridade - b.prioridade;
  //     }

  //     if (this.ordenacaoAtual === 'alfabetica') {
  //       return a.titulo.localeCompare(b.titulo, 'pt-BR', { sensitivity: 'base' });
  //     }

  //     const pesoA = this.pesoStatus(a);
  //     const pesoB = this.pesoStatus(b);

  //     if (pesoA !== pesoB) {
  //       return pesoA - pesoB;
  //     }

  //     return b.atualizadaEm.localeCompare(a.atualizadaEm);
  //   });
  // }

  //esse método de cima já existia, tava dando um erro nele por conta dessa atualizadaEm (que na prática nem existe mais), ai eu pedi pro gemini corrigir e ele deu esse método aqui de baixo, vou deixar tudo aqui porque não sei o funcionamento exato de nada disso

  private ordenarTarefas(tarefas: TarefaModel[]): TarefaModel[] {
    return [...tarefas].sort((a, b) => {
      if (this.ordenacaoAtual === 'data') {
        return this.compararDatas(a.dataRealizacao, b.dataRealizacao);
      }

      if (this.ordenacaoAtual === 'prioridade') {
        // Garante que prioridade nula ou indefinida seja tratada como 0
        return (a.prioridade ?? 0) - (b.prioridade ?? 0);
      }

      if (this.ordenacaoAtual === 'alfabetica') {
        // CORREÇÃO 1: Protege o título se ele vier nulo
        return (a.titulo ?? '').localeCompare(b.titulo ?? '', 'pt-BR', { sensitivity: 'base' });
      }

      const pesoA = this.pesoStatus(a);
      const pesoB = this.pesoStatus(b);

      if (pesoA !== pesoB) {
        return pesoA - pesoB;
      }

      // CORREÇÃO 2: Protege o campo atualizadaEm caso seja uma tarefa nova sem data de modificação
      return (b.atualizadaEm ?? '').localeCompare(a.atualizadaEm ?? '');
    });
  }

  private pesoStatus(tarefa: TarefaModel): number {
    if (tarefa.concluida) {
      return 3;
    }

    if (this.estaAtrasada(tarefa)) {
      return 0;
    }

    return 1;
  }

  private compararDatas(dataA: string, dataB: string): number {
    const prazoA = this.parseData(dataA)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const prazoB = this.parseData(dataB)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return prazoA - prazoB;
  }

  private parseData(valor: string): Date | null {
    if (!valor) {
      return null;
    }

    const data = new Date(`${valor}T00:00:00`);
    return Number.isNaN(data.getTime()) ? null : data;
  }

  private ajustarParaMeiaNoite(data: Date): Date {
    const copia = new Date(data);
    copia.setHours(0, 0, 0, 0);
    return copia;
  }

  private estaAtrasada(tarefa: TarefaModel): boolean {
    if (tarefa.concluida) {
      return false;
    }

    const prazo = this.parseData(tarefa.dataRealizacao);
    if (!prazo) {
      return false;
    }

    return prazo.getTime() < this.ajustarParaMeiaNoite(new Date()).getTime();
  }
}
