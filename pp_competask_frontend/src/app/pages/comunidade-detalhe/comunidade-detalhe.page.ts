import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowBackOutline,
  cameraOutline,
  chatbubbleOutline,
  checkmarkCircleOutline,
  checkboxOutline,
  chevronDownOutline,
  flagOutline,
  imageOutline,
  paperPlaneOutline,
  peopleOutline,
  settingsOutline,
  trophyOutline,
} from 'ionicons/icons';

type AbaComunidade = 'tarefas' | 'chat' | 'checkins' | 'ranking';
type PeriodoRanking = 'semanal' | 'mensal' | 'anual';

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

  readonly comunidade = {
    nome: 'Desenvolvedores React',
    membros: 128,
  };

  readonly tarefas = [
    {
      titulo: 'Postar resumo do encontro',
      descricao: 'Compartilhar anotações no chat',
      planejamento: 'Ontem',
      prioridade: 2,
      pessoas: '7/28',
      status: 'Atrasada',
      atrasada: true,
    },
    {
      titulo: 'Desafio semanal: 3 PRs',
      descricao: 'Abrir 3 pull requests revisados',
      planejamento: 'Hoje',
      prioridade: 1,
      pessoas: '0/28',
      status: '',
      atrasada: false,
    },
    {
      titulo: 'Estudo coletivo de hooks',
      descricao: 'Revisar useEffect e useMemo em grupo',
      planejamento: 'Amanhã',
      prioridade: 3,
      pessoas: '3/28',
      status: '',
      atrasada: false,
    },
  ];

  readonly mensagens = [
    { autor: 'Ana', texto: 'Bem-vindos à comunidade! 🎉', minha: false },
    { autor: 'Você', texto: 'Vamos começar as tarefas!', minha: true },
  ];

  readonly checkins = [
    {
      icone: '🏃‍♀️',
      titulo: 'Treino concluído 💪',
      descricao: 'Terminei a tarefa de exercícios da semana!',
      autor: 'Ana Silva',
      tempo: 'há 2h',
    },
    {
      icone: '📖',
      titulo: 'Estudo finalizado',
      descricao: 'Revisei a documentação e deixei minhas anotações.',
      autor: 'Bruno Costa',
      tempo: 'ontem',
    },
  ];

  readonly ranking = [
    { posicao: 1, nome: 'Ana Silva', pontos: 7, campeao: true },
    { posicao: 2, nome: 'Bruno Costa', pontos: 5 },
    { posicao: 3, nome: 'Carla Dias', pontos: 4 },
    { posicao: 4, nome: 'Diego Souza', pontos: 2 },
    { posicao: 5, nome: 'Eduarda Lima', pontos: 1 },
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

  constructor(private readonly router: Router) {
    addIcons({
      addOutline,
      arrowBackOutline,
      cameraOutline,
      chatbubbleOutline,
      checkmarkCircleOutline,
      checkboxOutline,
      chevronDownOutline,
      flagOutline,
      imageOutline,
      paperPlaneOutline,
      peopleOutline,
      settingsOutline,
      trophyOutline,
    });
  }

  voltar(): void {
    this.router.navigate(['/comunidades']);
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
