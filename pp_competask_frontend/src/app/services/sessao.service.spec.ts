import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SessaoService } from './sessao.service';

describe('SessaoService', () => {
  let service: SessaoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SessaoService);
    http = TestBed.inject(HttpTestingController);
    localStorage.setItem('refreshToken', 'renovacao');
    localStorage.setItem('token', 'antigo');
    localStorage.setItem('usuarioSessao', '{"id":"1"}');
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioSessao');
  });

  it('compartilha a renovação entre requisições simultâneas', () => {
    const resultados: string[] = [];
    service.renovar().subscribe((token) => resultados.push(token));
    service.renovar().subscribe((token) => resultados.push(token));
    const req = http.expectOne((r) => r.url.endsWith('/sessao/renovar'));
    expect(req.request.body).toEqual({ refreshToken: 'renovacao' });
    req.flush({ token: 'novo' });
    expect(resultados).toEqual(['novo', 'novo']);
    expect(localStorage.getItem('token')).toBe('novo');
  });

  it('não restaura um token se o usuário saiu durante a renovação', () => {
    let falhou = false;
    service.renovar().subscribe({ error: () => { falhou = true; } });
    const renovacao = http.expectOne((r) => r.url.endsWith('/sessao/renovar'));
    service.sair();
    http.expectOne((r) => r.url.endsWith('/sessao/sair')).flush(null, { status: 204, statusText: 'No Content' });
    renovacao.flush({ token: 'novo' });
    expect(falhou).toBeTrue();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
