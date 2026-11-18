import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LembreteEventosService } from './lembrete-eventos.service';

export type ImagemUpload = {
  url: string;
  publicId: string;
};

export type CheckinInput = {
  usuarioId: number;
  comunidadeId: number;
  tarefaId: number;
  descricao: string;
  foto: string;
  fotoPublicId: string;
  dataHoraEnvio: string;
};

export type CheckinModel = {
  id: number;
  foto: string;
  descricao: string;
  dataHoraEnvio: string;
  usuarioId: number;
  comunidadeId: number;
  tarefaId: number;
};

@Injectable({
  providedIn: 'root',
})
export class CheckinsService {
  private readonly API_URL = 'https://competask.onrender.com/api/v1/checkins';

  constructor(private readonly http: HttpClient, private readonly lembreteEventos: LembreteEventosService) { }

  enviarImagem(arquivo: File): Observable<ImagemUpload> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.http.post<ImagemUpload>(`${this.API_URL}/imagens`, formData);
  }

  listarPorComunidade(idComunidade: number): Observable<CheckinModel[]> {
    return this.http.get<CheckinModel[]>(`${this.API_URL}/comunidade/${idComunidade}`);
  }

  criar(checkin: CheckinInput): Observable<unknown> {
    return this.http.post(this.API_URL, checkin).pipe(
      tap(() => this.lembreteEventos.notificar({ tarefaId: String(checkin.tarefaId) })),
    );
  }
}