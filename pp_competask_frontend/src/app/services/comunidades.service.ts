import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ComunidadeInput, ComunidadeModel } from '../models/comunidade.model';
import { TarefaModel } from '../models/tarefa.model';

@Injectable({
  providedIn: 'root',
})
export class ComunidadesService {
  // private readonly API_URL = 'http://localhost:8080/api/v1/comunidades';
  private readonly API_URL = 'https://competask.onrender.com/api/v1/comunidades';

  constructor(private http: HttpClient) { }

  listar(): Observable<ComunidadeModel[]> {
    return this.http.get<any[]>(this.API_URL).pipe(
      map((comunidades) => comunidades.map((comunidade) => this.converterParaModelo(comunidade)))
    );
  }

  listarPublicas(): Observable<ComunidadeModel[]> {
    return this.http.get<any[]>(`${this.API_URL}/publicas`).pipe(
      map((comunidades) => comunidades.map((comunidade) => this.converterParaModelo(comunidade)))
    );
  }

  listarPorUsuario(idUsuario: string): Observable<ComunidadeModel[]> {
    return this.http.get<any[]>(`${this.API_URL}/usuario/${idUsuario}`).pipe(
      map((comunidades) => comunidades.map((comunidade) => this.converterParaModelo(comunidade)))
    );
  }

  entrar(idComunidade: number, usuarioId: number): Observable<ComunidadeModel> {
    return this.http.post<any>(`${this.API_URL}/entrar/${idComunidade}`, { usuarioId }).pipe(
      map((comunidade) => this.converterParaModelo(comunidade))
    );
  }

  listarTarefas(idComunidade: number): Observable<TarefaModel[]> {
    return this.http.get<TarefaModel[]>(`${this.API_URL}/tarefas/${idComunidade}`);
  }

  buscarPorId(id: string): Observable<ComunidadeModel | null> {
    return this.listar().pipe(
      map((comunidades) => comunidades.find((comunidade) => String(comunidade.idComunidade) === id) || null)
    );
  }

  inserir(comunidade: ComunidadeInput): Observable<ComunidadeModel> {
    return this.http.post<any>(this.API_URL, this.converterParaBackend(comunidade)).pipe(
      map((resultado) => this.converterParaModelo(resultado))
    );
  }

  atualizar(id: string, comunidade: ComunidadeInput): Observable<ComunidadeModel> {
    return this.http.put<any>(`${this.API_URL}/${id}`, this.converterParaBackend(comunidade)).pipe(
      map((resultado) => this.converterParaModelo(resultado))
    );
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  private converterParaBackend(comunidade: ComunidadeInput) {
    return {
      nome: comunidade.nome,
      descricao: comunidade.descricao,
      tipoAcesso: comunidade.acesso === 'publico' ? 'PUBLICA' : 'PRIVADA',
      foto: comunidade.foto,
      idUsuarioCriador: comunidade.idUsuarioCriador,
    };
  }

  private converterParaModelo(comunidade: any): ComunidadeModel {
    return {
      idComunidade: Number(comunidade?.id ?? comunidade?.idComunidade ?? 0),
      nome: String(comunidade?.nome ?? ''),
      descricao: String(comunidade?.descricao ?? ''),
      acesso: comunidade?.tipoAcesso === 'PRIVADA' ? 'privado' : 'publico',
      foto: String(comunidade?.foto ?? ''),
      membros: Array.isArray(comunidade?.membros) ? comunidade.membros.map((membro: any) => ({
        usuarioId: Number(membro?.usuarioId ?? 0),
        nomeUsuario: String(membro?.nomeUsuario ?? ''),
        adm: Boolean(membro?.adm ?? membro?.isAdm ?? false),
        pontuacao: Number(membro?.pontuacao ?? 0),
      })) : [],
    };
  }
}
