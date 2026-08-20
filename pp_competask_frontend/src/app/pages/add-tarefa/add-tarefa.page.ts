import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  checkmarkCircleOutline,
  chevronBackOutline,
  documentTextOutline,
  flagOutline,
  peopleOutline,
  personOutline,
  timeOutline,
  timerOutline,
} from 'ionicons/icons';

import { TarefaModel } from '../../models/tarefa.model';
import { TarefasService } from '../../services/tarefas.service';
import { UsuarioService } from '../../services/usuario.service';

type AtalhoRodape = {
  label: string;
  icon: string;
  rota?: string;
  ativo?: boolean;
};

@Component({
  selector: 'app-tarefa',
  templateUrl: './add-tarefa.page.html',
  styleUrls: ['./add-tarefa.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonIcon, IonButton],
})
export class TarefaPage {
  tarefaId: string | null = null;
  comunidadeId: string | null = null;
  mensagemAcao = '';
  form = this.formBuilder.group({
    titulo: ['', Validators.required],
    descricao: [''],
    prioridade: ['', Validators.required],
    dataRealizacao: ['', Validators.required],
    lembreteData: [''],
    lembreteHora: [''],
    tempoExecucao: [''],
  });

  atalhosRodape: AtalhoRodape[] = [
    { label: 'Tarefas', icon: 'checkmark-circle-outline', rota: '/tarefas', ativo: true },
    { label: 'Comunidades', icon: 'people-outline', rota: '/comunidades' },
    { label: 'Timer', icon: 'timer-outline', rota: '/timer' },
    { label: 'Usuário', icon: 'person-outline', rota: '/usuario' },
  ];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly tarefasService: TarefasService,
    private readonly usuarioService: UsuarioService,
  ) {
    addIcons({
      calendarOutline,
      checkmarkCircleOutline,
      chevronBackOutline,
      documentTextOutline,
      flagOutline,
      peopleOutline,
      personOutline,
      timeOutline,
      timerOutline,
    });

    this.atualizarContextoRota();
  }

  ionViewWillEnter(): void {
    this.atualizarContextoRota();
    this.carregarTarefa();
  }

  get tituloPagina(): string {
    if (this.comunidadeId && !this.tarefaId) {
      return 'Nova Tarefa da Comunidade';
    }

    return this.tarefaId ? 'Editar Tarefa' : 'Nova Tarefa';
  }

  get textoBotaoSalvar(): string {
    if (this.tarefaId) {
      return 'SALVAR TAREFA';
    }

    return this.comunidadeId ? 'CRIAR TAREFA DA COMUNIDADE' : 'CRIAR TAREFA';
  }

  //API
  salvarTarefa(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const usuarioAtual = this.usuarioService.obterUsuarioSessao();
    if (!usuarioAtual) {
      this.mensagemAcao = 'Você precisa entrar para criar ou editar tarefas.';
      this.router.navigate(['/login']);
      return;
    }

    const valores = this.form.getRawValue();
    const payload = {
      usuarioId: Number(usuarioAtual.id),
      titulo: String(valores.titulo ?? ''),
      descricao: String(valores.descricao ?? ''),
      prioridade: Number(valores.prioridade ?? 1),
      dataRealizacao: String(valores.dataRealizacao ?? ''),
      lembreteData: String(valores.lembreteData ?? ''),
      lembreteHora: String(valores.lembreteHora ?? ''),
      tempoExecucao: String(valores.tempoExecucao ?? ''),
      comunidadeId: this.comunidadeId ? Number(this.comunidadeId) : undefined,
      inComunidade: Boolean(this.comunidadeId),
    };

    if (this.tarefaId) {
      this.tarefasService.atualizar(this.tarefaId, payload).subscribe({
        next: (resultado: TarefaModel) => {
          this.voltar();
        },
        error: (erro: HttpErrorResponse) => {
          this.tratarErroSalvar(erro);
        }
      });
    } else {
      const requisicao = this.comunidadeId
        ? this.tarefasService.inserirNaComunidade(payload)
        : this.tarefasService.inserir(payload);

      requisicao.subscribe({
        next: (resultado: TarefaModel) => {
          this.voltar();
        },
        error: (erro: HttpErrorResponse) => {
          this.tratarErroSalvar(erro);
        }
      });
    }
  }

  excluirTarefa(): void {
    if (!this.tarefaId) {
      console.log("1")
      return;
    }

    const usuarioAtual = this.usuarioService.obterUsuarioSessao();
    if (!usuarioAtual) {
      this.mensagemAcao = 'Você precisa entrar para excluir tarefas.';
      this.router.navigate(['/login']);
      return;
    }

    const confirmar = window.confirm('Tem certeza que deseja excluir esta tarefa?');
    if (!confirmar) {
      console.log("2")
      return;
    }

    this.tarefasService.excluir(this.tarefaId).subscribe({
      next: (resultado: void) => {
        this.voltar();
      },
      error: () => {
        console.log("deu erro aqui na hora de EXCLUIR tarefa do usuario no banco")
      }
    });
  }

  voltar(): void {
    if (this.comunidadeId) {
      this.router.navigate(['/comunidades', this.comunidadeId]);
      return;
    }

    this.router.navigate(['/tarefas']);
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

  private carregarTarefa(): void {
    const usuarioAtual = this.usuarioService.obterUsuarioSessao();
    if (!usuarioAtual) {
      this.mensagemAcao = 'Você precisa entrar para acessar tarefas.';
      this.router.navigate(['/login']);
      return;
    }

    if (!this.tarefaId) {
      this.form.reset({
        titulo: '',
        descricao: '',
        prioridade: '',
        dataRealizacao: '',
        lembreteData: '',
        lembreteHora: '',
        tempoExecucao: '',
      });
      this.form.markAsPristine();
      this.form.markAsUntouched();
      return;
    }

    this.tarefasService.buscarPorId(this.tarefaId).subscribe({
      next: (tarefa: TarefaModel) => {
        this.form.patchValue({
          titulo: tarefa.titulo,
          descricao: tarefa.descricao,
          prioridade: String(tarefa.prioridade),
          dataRealizacao: tarefa.dataRealizacao,
          lembreteData: tarefa.lembreteData,
          lembreteHora: tarefa.lembreteHora,
          tempoExecucao: tarefa.tempoExecucao,
        });
      },
      error: () => {
        this.mensagemAcao = 'Tarefa não encontrada.';
        this.router.navigate(['/tarefas']);
      },
    });
  }

  private atualizarContextoRota(): void {
    this.tarefaId = this.route.snapshot.paramMap.get('id');
    this.comunidadeId = this.route.snapshot.queryParamMap.get('comunidadeId');
  }

  private tratarErroSalvar(erro: HttpErrorResponse): void {
    const mensagem = this.obterMensagemErro(erro);
    this.mensagemAcao = mensagem;

    if (mensagem.includes('Usuario nao encontrado')) {
      this.usuarioService.excluirSessao();
      this.router.navigate(['/login']);
    }
  }

  private obterMensagemErro(erro: HttpErrorResponse): string {
    if (typeof erro.error === 'string') {
      return erro.error;
    }

    if (erro.error?.message) {
      return String(erro.error.message);
    }

    if (erro.message) {
      return String(erro.message);
    }

    return 'Nao foi possivel salvar a tarefa.';
  }
}
