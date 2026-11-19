import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { UsuarioService } from './usuario.service';

describe('Sessão do usuário', () => {
  let service: UsuarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(UsuarioService);
    localStorage.removeItem('usuarioSessao');
    localStorage.removeItem('token');
  });

  afterEach(() => {
    localStorage.removeItem('usuarioSessao');
    localStorage.removeItem('token');
  });

  it('reconhece uma sessão com token ainda válido sem armazenar a senha', () => {
    service.salvarSessao({ id: '1', nome: 'Nome', email: 'u@example.com', senha: 'senha', streak: 0 });
    localStorage.setItem('token', `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 }))}.signature`);

    expect(service.sessaoValida()).toBeTrue();
    expect(localStorage.getItem('usuarioSessao')).not.toContain('senha');
  });

  it('não considera uma sessão expirada como válida', () => {
    service.salvarSessao({ id: '1', nome: 'Nome', email: 'u@example.com' });
    localStorage.setItem('token', `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 1 }))}.signature`);
    expect(service.sessaoValida()).toBeFalse();
  });

  it('remove a senha salva em sessões antigas', () => {
    localStorage.setItem('usuarioSessao', JSON.stringify({ id: '1', nome: 'Nome', email: 'u@example.com', senha: 'senha' }));
    expect(service.obterUsuarioSessao()?.senha).toBeUndefined();
    expect(localStorage.getItem('usuarioSessao')).not.toContain('senha');
  });
});
