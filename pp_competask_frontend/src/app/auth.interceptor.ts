import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { SessaoService } from './services/sessao.service';

// Lê o localStorage direto: injetar UsuarioService aqui criaria dependência circular com HttpClient.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const sessao = inject(SessaoService);
  const token = localStorage.getItem('token');
  const ehApi = req.url.includes('/api/v1/');

  const requisicao = token && ehApi
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requisicao).pipe(
    catchError((erro: unknown) => {
      const ehLogin = req.url.endsWith('/usuarios/login');

      if (erro instanceof HttpErrorResponse && erro.status === 401 && ehApi && !ehLogin) {
        const refreshToken = localStorage.getItem('refreshToken');
        const tokenAtual = localStorage.getItem('token');
        if (token && tokenAtual && tokenAtual !== token) {
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${tokenAtual}` } }));
        }
        if (token && refreshToken) {
          return sessao.renovar().pipe(
            catchError((erroRenovacao: unknown) => {
              if (erroRenovacao instanceof HttpErrorResponse && erroRenovacao.status === 401
                  && localStorage.getItem('refreshToken') === refreshToken) {
                sessao.limpar();
                void router.navigate(['/login']);
              }
              return throwError(() => erroRenovacao);
            }),
            switchMap((novoToken) => next(req.clone({ setHeaders: { Authorization: `Bearer ${novoToken}` } }))),
          );
        }
        sessao.limpar();
        void router.navigate(['/login']);
      }

      return throwError(() => erro);
    })
  );
};
