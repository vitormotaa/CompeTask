import { CommonModule } from '@angular/common';
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
    { label: 'Timer', icon: 'timer-outline' },
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

    this.tarefaId = this.route.snapshot.paramMap.get('id');
  }

  ionViewWillEnter(): void {
    this.tarefaId = this.route.snapshot.paramMap.get('id');
    // console.log(this.tarefaId);
    this.carregarTarefa();
  }

  get tituloPagina(): string {
    return this.tarefaId ? 'Editar Tarefa' : 'Nova Tarefa';
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
      usuarioId: Number(usuarioAtual.id) as unknown as string,
      titulo: String(valores.titulo ?? ''),
      descricao: String(valores.descricao ?? ''),
      prioridade: Number(valores.prioridade ?? 1),
      dataRealizacao: String(valores.dataRealizacao ?? ''),
      lembreteData: String(valores.lembreteData ?? ''),
      lembreteHora: String(valores.lembreteHora ?? ''),
      tempoExecucao: String(valores.tempoExecucao ?? ''),
    };

    if (this.tarefaId) {
      console.log("to em editar");
      this.tarefasService.atualizar(this.tarefaId, payload).subscribe({
        next: (resultado: TarefaModel) => {
          this.router.navigate(['/tarefas']);
        },
        error: () => {
          console.log("deu erro aqui na hora de ATUALIZAR tarefa do usuario no banco")
        }
      });
    } else {
      console.log("to em adicionar");
      this.tarefasService.inserir(payload).subscribe({
        next: (resultado: TarefaModel) => {
          this.router.navigate(['/tarefas']);
        },
        error: () => {
          console.log("deu erro aqui na hora de criar tarefa do usuario no banco")
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
        this.router.navigate(['/tarefas']);
      },
      error: () => {
        console.log("deu erro aqui na hora de EXCLUIR tarefa do usuario no banco")
      }
    });
  }

  voltar(): void {
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

    const tarefa = this.obterTarefaPorId(this.tarefaId, usuarioAtual.id);

    if (!tarefa) {
      this.mensagemAcao = 'Tarefa não encontrada.';
      this.router.navigate(['/tarefas']);
      return;
    }

    this.form.patchValue({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      prioridade: String(tarefa.prioridade),
      dataRealizacao: tarefa.dataRealizacao,
      lembreteData: tarefa.lembreteData,
      lembreteHora: tarefa.lembreteHora,
      tempoExecucao: tarefa.tempoExecucao,
    });
  }

  private obterTarefaPorId(id: string, usuarioId: string): TarefaModel | null {
    return this.tarefasService.obterPorId(id, usuarioId);
  }
}