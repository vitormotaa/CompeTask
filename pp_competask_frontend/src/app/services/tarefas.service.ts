import { Injectable } from '@angular/core';

import { TarefaModel } from '../models/tarefa.model';

type NovaTarefaInput = {
	titulo: string;
	descricao: string;
	prioridade: number;
	dataRealizacao: string;
	lembreteData: string;
	lembreteHora: string;
	tempoExecucao: string;
};

type AtualizarTarefaInput = NovaTarefaInput;

@Injectable({
	providedIn: 'root',
})
export class TarefasService {
	private readonly storageKey = 'tarefas';

	obterTodas(): TarefaModel[] {
		const tarefasJson = localStorage.getItem(this.storageKey);

		if (!tarefasJson) {
			return [];
		}

		try {
			return JSON.parse(tarefasJson) as TarefaModel[];
		} catch {
			return [];
		}
	}

	obterPorUsuario(usuarioId: string): TarefaModel[] {
		return this.obterTodas().filter((tarefa) => tarefa.usuarioId === usuarioId);
	}

	obterPorId(id: string, usuarioId?: string): TarefaModel | null {
		const tarefas = this.obterTodas();
		return tarefas.find((tarefa) => tarefa.id === id && (!usuarioId || tarefa.usuarioId === usuarioId)) || null;
	}

	criar(input: NovaTarefaInput, usuarioId: string): TarefaModel {
		const tarefas = this.obterTodas();
		const agora = new Date().toISOString();

		const novaTarefa: TarefaModel = {
			id: agora,
			usuarioId,
			titulo: input.titulo,
			descricao: input.descricao,
			prioridade: input.prioridade,
			dataRealizacao: input.dataRealizacao,
			lembreteData: input.lembreteData,
			lembreteHora: input.lembreteHora,
			tempoExecucao: input.tempoExecucao,
			dataConfeccao: '',
			concluida: false,
			criadaEm: agora,
			atualizadaEm: agora,
		};

		tarefas.unshift(novaTarefa);
		this.salvarTodas(tarefas);
		return novaTarefa;
	}

	atualizar(id: string, input: AtualizarTarefaInput, usuarioId?: string): TarefaModel | null {
		const tarefas = this.obterTodas();
		const indice = tarefas.findIndex((tarefa) => tarefa.id === id && (!usuarioId || tarefa.usuarioId === usuarioId));

		if (indice === -1) {
			return null;
		}

		const tarefaAtual = tarefas[indice];

		tarefaAtual.titulo = input.titulo;
		tarefaAtual.descricao = input.descricao;
		tarefaAtual.prioridade = input.prioridade;
		tarefaAtual.dataRealizacao = input.dataRealizacao;
		tarefaAtual.lembreteData = input.lembreteData;
		tarefaAtual.lembreteHora = input.lembreteHora;
		tarefaAtual.tempoExecucao = input.tempoExecucao;
		tarefaAtual.atualizadaEm = new Date().toISOString();

		this.salvarTodas(tarefas);
		return tarefaAtual;
	}

	alternarConclusao(id: string, usuarioId?: string): TarefaModel | null {
		const tarefas = this.obterTodas();
		const indice = tarefas.findIndex((tarefa) => tarefa.id === id && (!usuarioId || tarefa.usuarioId === usuarioId));

		if (indice === -1) {
			return null;
		}

		const tarefaAtual = tarefas[indice];
		const concluindoAgora = !tarefaAtual.concluida;

		tarefaAtual.concluida = concluindoAgora;
		tarefaAtual.dataConfeccao = concluindoAgora ? new Date().toISOString() : '';
		tarefaAtual.atualizadaEm = new Date().toISOString();

		this.salvarTodas(tarefas);
		return tarefaAtual;
	}

	excluir(id: string, usuarioId?: string): boolean {
		const tarefas = this.obterTodas();
		const indice = tarefas.findIndex((tarefa) => tarefa.id === id && (!usuarioId || tarefa.usuarioId === usuarioId));

		if (indice === -1) {
			return false;
		}

		tarefas.splice(indice, 1);
		this.salvarTodas(tarefas);
		return true;
	}

	private salvarTodas(tarefas: TarefaModel[]): void {
		localStorage.setItem(this.storageKey, JSON.stringify(tarefas));
	}
}