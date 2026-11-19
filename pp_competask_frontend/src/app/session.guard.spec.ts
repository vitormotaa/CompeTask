import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, provideRouter } from '@angular/router';
import { firstValueFrom, isObservable } from 'rxjs';
import { loginGuard } from './session.guard';

describe('loginGuard', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    localStorage.setItem('usuarioSessao', '{"id":"1","nome":"Nome","email":"u@example.com"}');
    localStorage.setItem('token', `header.${btoa(JSON.stringify({ exp: 1 }))}.signature`);
    localStorage.setItem('refreshToken', 'renovacao');
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuarioSessao');
  });

  it('restaura a sessão expirada antes de abrir as tarefas', async () => {
    const resultado = TestBed.runInInjectionContext(() =>
      loginGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
    if (!isObservable(resultado)) fail('Era esperada uma renovação assíncrona.');
    else {
      const destino = firstValueFrom(resultado);
      http.expectOne((r) => r.url.endsWith('/sessao/renovar')).flush({ token: 'novo' });
      expect(TestBed.inject(Router).serializeUrl(await destino as import('@angular/router').UrlTree)).toBe('/tarefas');
      expect(localStorage.getItem('token')).toBe('novo');
    }
  });
});
