import { Injectable } from '@angular/core';

import { TarefaModel } from '../models/tarefa.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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
	private readonly API_URL = 'http://localhost:8080/api/v1/tarefas';

	constructor(private http: HttpClient) { }

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


	//método de busca de tarefas de acordo com o id do usuario - API
	buscarTarefasUsuario(id: string): Observable<TarefaModel[]> {
		return this.http.get<TarefaModel[]>(`${this.API_URL}/usuario/${id}`);
	}

	//não é ligado na api mas é pra salvar as coisas entao - API
	guardarTarefasLocal(tarefas: TarefaModel[]) {
		localStorage.setItem(this.storageKey, JSON.stringify(tarefas));
	}


	// método modificado por ia pra ficar de acordo, varios bo envolvendo o tipo de tarefa id e etc
	obterPorId(id: string, usuarioId?: string): TarefaModel | null {
		return this.obterTodas().find((tarefa) => tarefa.id == id && (!usuarioId || (tarefa as any).usuario?.idUsuario == usuarioId)) || null;
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

	//método de inserção de tarefa no banco (criar tarefa) - API
	inserir(tarefa: Partial<TarefaModel>): Observable<TarefaModel> {
		return this.http.post<TarefaModel>(this.API_URL, tarefa);
	}

	//método que existia previamente e deixei por ele usar esses trem de input e type (que tem la em cima do codigo)
	// atualizar(id: string, input: AtualizarTarefaInput, usuarioId?: string): TarefaModel | null {
	// 	const tarefas = this.obterTodas();
	// 	const indice = tarefas.findIndex((tarefa) => tarefa.id === id && (!usuarioId || tarefa.usuarioId === usuarioId));

	// 	if (indice === -1) {
	// 		return null;
	// 	}

	// 	const tarefaAtual = tarefas[indice];

	// 	tarefaAtual.titulo = input.titulo;
	// 	tarefaAtual.descricao = input.descricao;
	// 	tarefaAtual.prioridade = input.prioridade;
	// 	tarefaAtual.dataRealizacao = input.dataRealizacao;
	// 	tarefaAtual.lembreteData = input.lembreteData;
	// 	tarefaAtual.lembreteHora = input.lembreteHora;
	// 	tarefaAtual.tempoExecucao = input.tempoExecucao;
	// 	tarefaAtual.atualizadaEm = new Date().toISOString();

	// 	this.salvarTodas(tarefas);
	// 	return tarefaAtual;
	// }

	//método de atualização de tarefa no banco - API
	atualizar(id: string, tarefa: Partial<TarefaModel>): Observable<TarefaModel>{
		return this.http.put<TarefaModel>(`${this.API_URL}/${id}`, tarefa);
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

	//ta em comentario só por contad do nome, nao quero dar conflito com o metodo de baixo ai
	// excluir(id: string, usuarioId?: string): boolean {
	// 	const tarefas = this.obterTodas();
	// 	const indice = tarefas.findIndex((tarefa) => tarefa.id === id && (!usuarioId || tarefa.usuarioId === usuarioId));

	// 	if (indice === -1) {
	// 		return false;
	// 	}

	// 	tarefas.splice(indice, 1);
	// 	this.salvarTodas(tarefas);
	// 	return true;
	// }

	//método de exclusão de tarefa do usuario no banco - API
	excluir(id: string): Observable<void> {
		return this.http.delete<void>(`${this.API_URL}/${id}`);
	}

	private salvarTodas(tarefas: TarefaModel[]): void {
		localStorage.setItem(this.storageKey, JSON.stringify(tarefas));
	}
}