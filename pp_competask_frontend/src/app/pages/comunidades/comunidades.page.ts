import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  chevronForwardOutline,
  closeOutline,
  codeSlashOutline,
  colorPaletteOutline,
  gameControllerOutline,
  globeOutline,
  keyOutline,
  peopleOutline,
  personOutline,
  rocketOutline,
  searchOutline,
  timerOutline,
  checkmarkCircleOutline,
  constructOutline,
} from 'ionicons/icons';

import { ComunidadeModel } from '../../models/comunidade.model';

type AtalhoRodape = {
  label: string;
  icon: string;
  rota?: string;
  ativo?: boolean;
};

type AcaoModalComunidade = 'criar' | 'publicas' | 'privadas';

@Component({
  selector: 'app-comunidades',
  templateUrl: './comunidades.page.html',
  styleUrls: ['./comunidades.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
})
export class ComunidadesPage {
  busca = '';
  modalAberto = false;
  mensagemAcao = '';

  readonly comunidades: Array<ComunidadeModel & { membros: number; destaque?: boolean; icone: string; cor: string }> = [
    {
      idComunidade: 1,
      nome: 'Desenvolvedores React',
      descricao: 'Troca de dicas, componentes e hooks.',
      acesso: 'publico',
      foto: '',
      membros: 128,
      destaque: true,
      icone: 'code-slash-outline',
      cor: 'var(--accent-rose)',
    },
    {
      idComunidade: 2,
      nome: 'Design UI/UX',
      descricao: 'Referências visuais, fluxo e experiência.',
      acesso: 'publico',
      foto: '',
      membros: 85,
      icone: 'color-palette-outline',
      cor: 'var(--accent-cyan)',
    },
    {
      idComunidade: 3,
      nome: 'Projeto Final TCC',
      descricao: 'Organização do grupo e alinhamento final.',
      acesso: 'privado',
      foto: '',
      membros: 12,
      destaque: true,
      icone: 'construct-outline',
      cor: 'var(--accent-violet)',
    },
    {
      idComunidade: 4,
      nome: 'Startups & Negócios',
      descricao: 'Ideias, validação e planejamento.',
      acesso: 'publico',
      foto: '',
      membros: 340,
      icone: 'rocket-outline',
      cor: 'var(--accent-gold)',
    },
    {
      idComunidade: 5,
      nome: 'GameDev Brasil',
      descricao: 'Arte, motor gráfico e publicação.',
      acesso: 'privado',
      foto: '',
      membros: 216,
      icone: 'game-controller-outline',
      cor: 'var(--accent-green)',
    },
  ];

  atalhosRodape: AtalhoRodape[] = [
    { label: 'Tarefas', icon: 'checkmark-circle-outline', rota: '/tarefas' },
    { label: 'Comunidades', icon: 'people-outline', ativo: true },
    { label: 'Timer', icon: 'timer-outline' },
    { label: 'Usuário', icon: 'person-outline', rota: '/usuario' },
  ];

  constructor(private readonly router: Router) {
    addIcons({
      addOutline,
      chevronForwardOutline,
      closeOutline,
      codeSlashOutline,
      colorPaletteOutline,
      gameControllerOutline,
      globeOutline,
      keyOutline,
      peopleOutline,
      personOutline,
      rocketOutline,
      searchOutline,
      timerOutline,
      checkmarkCircleOutline,
      constructOutline,
    });
  }

  get comunidadesFiltradas(): Array<ComunidadeModel & { membros: number; destaque?: boolean; icone: string; cor: string }> {
    const termo = this.busca.trim().toLowerCase();

    if (!termo) {
      return this.comunidades;
    }

    return this.comunidades.filter((comunidade) => {
      return (
        comunidade.nome.toLowerCase().includes(termo) ||
        comunidade.descricao.toLowerCase().includes(termo) ||
        (comunidade.acesso === 'publico' ? 'publica' : 'privada').includes(termo)
      );
    });
  }

  abrirModal(): void {
    this.modalAberto = true;
    this.mensagemAcao = '';
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  selecionarAcao(acao: AcaoModalComunidade): void {
    if (acao === 'criar') {
      this.router.navigate(['/comunidades/nova']);
      return;
    }

    if (acao === 'publicas') {
      this.mensagemAcao = 'Busca de comunidades públicas será conectada depois.';
      this.modalAberto = false;
      return;
    }

    this.mensagemAcao = 'Entrada em comunidade privada será conectada depois.';
    this.modalAberto = false;
  }

  abrirComunidade(comunidade: ComunidadeModel): void {
    this.mensagemAcao = `Abrindo ${comunidade.nome}...`;
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
}
