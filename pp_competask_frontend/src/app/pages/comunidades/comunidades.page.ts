import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { forkJoin } from 'rxjs';
import {
  addOutline,
  chevronForwardOutline,
  closeOutline,
  globeOutline,
  keyOutline,
  peopleOutline,
  personOutline,
  searchOutline,
  timerOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

import { ComunidadeModel } from '../../models/comunidade.model';
import { ComunidadesService } from '../../services/comunidades.service';
import { UsuarioService } from '../../services/usuario.service';

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
  buscaPublicas = '';
  modalAberto = false;
  modalPublicasAberto = false;
  modalPrivadoAberto = false;
  codigoPrivado = '';
  senhaPrivada = '';
  mensagemAcao = '';
  carregando = false;
  entrandoComunidadeId: number | null = null;
  comunidades: ComunidadeModel[] = [];
  comunidadesPublicas: ComunidadeModel[] = [];

  atalhosRodape: AtalhoRodape[] = [
    { label: 'Tarefas', icon: 'checkmark-circle-outline', rota: '/tarefas' },
    { label: 'Comunidades', icon: 'people-outline', ativo: true },
    { label: 'Cronômetro', icon: 'timer-outline', rota: '/timer' },
    { label: 'Usuário', icon: 'person-outline', rota: '/usuario' },
  ];

  constructor(
    private readonly router: Router,
    private readonly comunidadesService: ComunidadesService,
    private readonly usuarioService: UsuarioService
  ) {
    addIcons({
      addOutline,
      chevronForwardOutline,
      closeOutline,
      globeOutline,
      keyOutline,
      peopleOutline,
      personOutline,
      searchOutline,
      timerOutline,
      checkmarkCircleOutline,
    });
  }

  ionViewWillEnter(): void {
    this.fecharModal();
    this.fecharModalPublicas();
    this.fecharModalPrivado();
    this.carregarComunidades();
  }

  get comunidadesFiltradas(): ComunidadeModel[] {
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

  get comunidadesPublicasFiltradas(): ComunidadeModel[] {
    const termo = this.buscaPublicas.trim().toLowerCase();

    if (!termo) {
      return this.comunidadesPublicas;
    }

    return this.comunidadesPublicas.filter((comunidade) => comunidade.nome.toLowerCase().includes(termo));
  }

  carregarComunidades(mensagemSucesso = ''): void {
    const usuarioAtual = this.usuarioService.obterUsuarioSessao();

    if (!usuarioAtual?.id) {
      this.comunidades = [];
      this.mensagemAcao = 'Voce precisa estar logado para ver suas comunidades.';
      return;
    }

    this.carregando = true;
    this.mensagemAcao = '';
    this.comunidadesService.listarPorUsuario(usuarioAtual.id).subscribe({
      next: (comunidades) => {
        this.comunidades = comunidades;
        this.mensagemAcao = mensagemSucesso;
        this.carregando = false;
      },
      error: () => {
        this.mensagemAcao = 'Nao foi possivel carregar as comunidades.';
        this.carregando = false;
      },
    });
  }

  carregarComunidadesPublicas(): void {
    const usuarioAtual = this.usuarioService.obterUsuarioSessao();

    if (!usuarioAtual?.id) {
      this.mensagemAcao = 'Voce precisa estar logado para buscar comunidades publicas.';
      return;
    }

    this.carregando = true;
    this.mensagemAcao = '';
    forkJoin({
      publicas: this.comunidadesService.listarPublicas(),
      doUsuario: this.comunidadesService.listarPorUsuario(usuarioAtual.id),
    }).subscribe({
      next: ({ publicas, doUsuario }) => {
        const comunidadesDoUsuario = new Set(doUsuario.map((comunidade) => comunidade.idComunidade));
        this.comunidadesPublicas = publicas.filter((comunidade) => !comunidadesDoUsuario.has(comunidade.idComunidade));
        this.buscaPublicas = '';
        this.modalPublicasAberto = true;
        this.carregando = false;
      },
      error: () => {
        this.mensagemAcao = 'Nao foi possivel carregar as comunidades publicas.';
        this.carregando = false;
      },
    });
  }

  contarMembros(comunidade: ComunidadeModel): number {
    return comunidade.membros.length;
  }

  escolherIcone(comunidade: ComunidadeModel): string {
    return 'people-outline';
  }

  escolherCor(comunidade: ComunidadeModel): string {
    return comunidade.acesso === 'publico' ? 'var(--accent-cyan)' : 'var(--accent-violet)';
  }

  abrirModal(): void {
    this.modalAberto = true;
    this.mensagemAcao = '';
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  fecharModalPublicas(): void {
    this.modalPublicasAberto = false;
    this.comunidadesPublicas = [];
    this.buscaPublicas = '';
    this.entrandoComunidadeId = null;
  }

  abrirModalPrivado(): void {
    this.modalAberto = false;
    this.modalPrivadoAberto = true;
    this.codigoPrivado = '';
    this.senhaPrivada = '';
    this.mensagemAcao = '';
  }

  fecharModalPrivado(): void {
    this.modalPrivadoAberto = false;
  }

  entrarComunidadePrivada(): void {
    this.modalPrivadoAberto = false;
    this.mensagemAcao = 'Entrada em comunidade privada ainda nao esta no backend.';
  }

  selecionarAcao(acao: AcaoModalComunidade): void {
    if (acao === 'criar') {
      this.modalAberto = false;
      this.router.navigate(['/comunidades/nova']);
      return;
    }

    if (acao === 'publicas') {
      this.modalAberto = false;
      this.carregarComunidadesPublicas();
      return;
    }

    this.abrirModalPrivado();
  }

  entrarComunidadePublica(comunidade: ComunidadeModel): void {
    const usuarioAtual = this.usuarioService.obterUsuarioSessao();

    if (!usuarioAtual?.id) {
      this.mensagemAcao = 'Voce precisa estar logado para entrar em uma comunidade.';
      return;
    }

    this.entrandoComunidadeId = comunidade.idComunidade;
    this.comunidadesService.entrar(comunidade.idComunidade, Number(usuarioAtual.id)).subscribe({
      next: () => {
        this.comunidadesPublicas = this.comunidadesPublicas.filter((item) => item.idComunidade !== comunidade.idComunidade);
        this.entrandoComunidadeId = null;
        this.fecharModalPublicas();
        this.carregarComunidades(`Voce entrou em ${comunidade.nome}.`);
      },
      error: () => {
        this.entrandoComunidadeId = null;
        this.mensagemAcao = 'Nao foi possivel entrar na comunidade.';
      },
    });
  }

  abrirComunidade(comunidade: ComunidadeModel): void {
    this.router.navigate(['/comunidades', comunidade.idComunidade]);
  }

  abrirAtalho(atalho: AtalhoRodape): void {
    if (atalho.ativo) {
      return;
    }

    if (atalho.rota) {
      this.router.navigate([atalho.rota]);
      return;
    }

    this.mensagemAcao = `${atalho.label} ainda sera ligado ao backend.`;
  }
}
