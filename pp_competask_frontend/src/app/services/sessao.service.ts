import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { Observable, finalize, map, shareReplay, tap, throwError } from 'rxjs';
import { LembreteEventosService } from './lembrete-eventos.service';

@Injectable({ providedIn: 'root' })
export class SessaoService {
  private readonly http: HttpClient;
  private readonly url = 'https://competask.onrender.com/api/v1/usuarios/sessao';
  private renovacao: Observable<string> | null = null;

  constructor(backend: HttpBackend, private readonly eventos: LembreteEventosService,
    private readonly toast: ToastController) {
    this.http = new HttpClient(backend);
  }

  renovar(): Observable<string> {
    if (this.renovacao) return this.renovacao;
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return throwError(() => new Error('Sessão sem token de renovação.'));

    this.renovacao = this.http.post<{ token: string }>(`${this.url}/renovar`, { refreshToken }).pipe(
      tap(({ token }) => {
        if (localStorage.getItem('refreshToken') !== refreshToken || !token) {
          throw new Error('A sessão mudou durante a renovação.');
        }
        localStorage.setItem('token', token);
      }),
      map(({ token }) => token),
      finalize(() => { this.renovacao = null; }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.renovacao;
  }

  limpar(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuarioSessao');
    this.eventos.notificar();
  }

  sair(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    this.limpar();
    if (refreshToken) {
      this.http.post<void>(`${this.url}/sair`, { refreshToken }).subscribe({
        error: (erro: unknown) => {
          console.error('Não foi possível revogar a sessão no servidor.', erro);
          void this.toast.create({
            message: 'Você saiu neste aparelho, mas não foi possível encerrar a sessão no servidor.',
            duration: 6000, position: 'top', color: 'warning',
          }).then((aviso) => aviso.present()).catch((falha: unknown) => console.error('Não foi possível exibir o aviso.', falha));
        },
      });
    }
  }
}
