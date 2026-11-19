import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let testes: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    testes = TestBed.inject(HttpTestingController);
    localStorage.setItem('token', 'antigo');
    localStorage.setItem('refreshToken', 'renovacao');
    localStorage.setItem('usuarioSessao', '{"id":"1"}');
  });

  afterEach(() => {
    testes.verify();
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuarioSessao');
  });

  it('renova o token vencido e repete a requisição protegida', () => {
    let resposta: unknown;
    http.get('https://competask.onrender.com/api/v1/tarefas').subscribe((valor) => { resposta = valor; });
    const primeira = testes.expectOne((r) => r.url.endsWith('/tarefas'));
    expect(primeira.request.headers.get('Authorization')).toBe('Bearer antigo');
    primeira.flush(null, { status: 401, statusText: 'Unauthorized' });
    testes.expectOne((r) => r.url.endsWith('/sessao/renovar')).flush({ token: 'novo' });
    const repetida = testes.expectOne((r) => r.url.endsWith('/tarefas'));
    expect(repetida.request.headers.get('Authorization')).toBe('Bearer novo');
    repetida.flush({ ok: true });
    expect(resposta).toEqual({ ok: true });
  });

  it('preserva a sessão quando a renovação falha por falta de conexão', () => {
    let erroRecebido = false;
    http.get('https://competask.onrender.com/api/v1/tarefas').subscribe({ error: () => { erroRecebido = true; } });
    testes.expectOne((r) => r.url.endsWith('/tarefas')).flush(null, { status: 401, statusText: 'Unauthorized' });
    testes.expectOne((r) => r.url.endsWith('/sessao/renovar')).error(new ProgressEvent('error'));
    expect(erroRecebido).toBeTrue();
    expect(localStorage.getItem('refreshToken')).toBe('renovacao');
    expect(localStorage.getItem('usuarioSessao')).not.toBeNull();
  });
});
