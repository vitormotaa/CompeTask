import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { NotificacaoModel } from '../models/notificacao.model';

@Injectable({
  providedIn: 'root',
})
export class NotificacaoService {
  private readonly API_URL = 'https://competask.onrender.com/api/v1/notificacoes';

  constructor(private readonly http: HttpClient) { }

  listar(usuarioId: number, somenteNaoLidas = false): Observable<NotificacaoModel[]> {
    return this.http.get<NotificacaoModel[]>(`${this.API_URL}/usuario/${usuarioId}`, {
      params: { somenteNaoLidas },
    });
  }

  marcarComoLida(id: number, usuarioId: number): Observable<NotificacaoModel> {
    return this.http.patch<NotificacaoModel>(`${this.API_URL}/${id}/lida`, {}, {
      params: { usuarioId },
    });
  }
}
