import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LembreteEventosService {
  private readonly alteracoesSubject = new Subject<{ tarefaId?: string; comunidadeId?: string }>();
  readonly alteracoes$ = this.alteracoesSubject.asObservable();
  private readonly saidaSubject = new Subject<void>();
  readonly saida$ = this.saidaSubject.asObservable();

  notificar(alteracao: { tarefaId?: string; comunidadeId?: string } = {}): void {
    this.alteracoesSubject.next(alteracao);
  }

  notificarSaida(): void {
    this.saidaSubject.next();
  }
}
