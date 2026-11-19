import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsuarioService } from './services/usuario.service';
import { SessaoService } from './services/sessao.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { ToastController } from '@ionic/angular/standalone';

export const loginGuard: CanActivateFn = () => {
  const usuarios = inject(UsuarioService);
  const router = inject(Router);
  const sessao = inject(SessaoService);
  const toast = inject(ToastController);
  if (usuarios.sessaoValida()) return router.createUrlTree(['/tarefas']);
  const refreshToken = localStorage.getItem('refreshToken');
  if (!usuarios.obterUsuarioSessao()?.id || !refreshToken) return true;
  return sessao.renovar().pipe(
    map(() => router.createUrlTree(['/tarefas'])),
    catchError((erro: unknown) => {
      if (erro instanceof HttpErrorResponse && erro.status === 401
          && localStorage.getItem('refreshToken') === refreshToken) {
        sessao.limpar();
      } else {
        console.error('Não foi possível restaurar a sessão.', erro);
        void toast.create({
          message: 'Não foi possível restaurar a sessão. Verifique sua conexão e tente novamente.',
          duration: 5000, position: 'top', color: 'warning',
        }).then((aviso) => aviso.present());
      }
      return of(true);
    }),
  );
};
