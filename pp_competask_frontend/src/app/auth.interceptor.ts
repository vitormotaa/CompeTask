import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

// Lê o localStorage direto: injetar UsuarioService aqui criaria dependência circular com HttpClient.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const ehApi = req.url.includes('/api/v1/');

  const requisicao = token && ehApi
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requisicao).pipe(
    catchError((erro: unknown) => {
      const ehLogin = req.url.endsWith('/usuarios/login');

      if (erro instanceof HttpErrorResponse && erro.status === 401 && ehApi && !ehLogin) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuarioSessao');
        router.navigate(['/login']);
      }

      return throwError(() => erro);
    })
  );
};
