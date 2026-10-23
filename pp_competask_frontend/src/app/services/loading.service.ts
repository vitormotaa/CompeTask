import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly atrasoMs = 250;
  private requisicoesAtivas = 0;
  private temporizador: ReturnType<typeof setTimeout> | null = null;
  private readonly visivelSubject = new BehaviorSubject<boolean>(false);

  readonly visivel$ = this.visivelSubject.asObservable();

  iniciar(): void {
    this.requisicoesAtivas++;

    // O atraso evita que o popup pisque em respostas rápidas.
    if (this.requisicoesAtivas === 1 && !this.temporizador) {
      this.temporizador = setTimeout(() => {
        this.temporizador = null;
        if (this.requisicoesAtivas > 0) {
          this.visivelSubject.next(true);
        }
      }, this.atrasoMs);
    }
  }

  finalizar(): void {
    this.requisicoesAtivas = Math.max(0, this.requisicoesAtivas - 1);

    if (this.requisicoesAtivas === 0) {
      if (this.temporizador) {
        clearTimeout(this.temporizador);
        this.temporizador = null;
      }
      this.visivelSubject.next(false);
    }
  }
}
