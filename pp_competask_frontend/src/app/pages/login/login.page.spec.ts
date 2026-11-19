import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UsuarioService } from '../../services/usuario.service';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let usuarios: jasmine.SpyObj<UsuarioService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    usuarios = jasmine.createSpyObj<UsuarioService>('UsuarioService', ['inicializar', 'login', 'salvarSessao']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        { provide: UsuarioService, useValue: usuarios },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('explica os campos obrigatórios sem tentar fazer login', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    void fixture.componentInstance.entrar();
    fixture.detectChanges();
    const elemento: HTMLElement = fixture.nativeElement;
    expect(elemento.querySelector('#email-erro')?.textContent).toContain('Informe seu e-mail');
    expect(elemento.querySelector('#senha-erro')?.textContent).toContain('Informe sua senha');
    expect(usuarios.login).not.toHaveBeenCalled();
  });

  it('apresenta mensagens amigáveis para credenciais, conexão e servidor', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    const pagina = fixture.componentInstance;
    pagina.loginForm.setValue({ email: 'usuario@example.com', senha: 'senha123' });
    const casos = [
      { status: 401, mensagem: 'E-mail ou senha incorretos' },
      { status: 0, mensagem: 'Verifique sua internet' },
      { status: 500, mensagem: 'serviço está indisponível' },
    ];
    for (const caso of casos) {
      usuarios.login.and.returnValue(throwError(() => new HttpErrorResponse({ status: caso.status, error: 'erro técnico' })));
      void pagina.entrar();
      fixture.detectChanges();
      const aviso = fixture.nativeElement.querySelector('.form-error') as HTMLElement;
      expect(aviso.textContent).toContain(caso.mensagem);
      expect(aviso.textContent).not.toContain('erro técnico');
    }
  });

  it('orienta sobre e-mail inválido e senha curta', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    fixture.componentInstance.loginForm.setValue({ email: 'email-invalido', senha: '123' });
    void fixture.componentInstance.entrar();
    fixture.detectChanges();
    const elemento: HTMLElement = fixture.nativeElement;
    expect(elemento.querySelector('#email-erro')?.textContent).toContain('Confira se o e-mail está correto');
    expect(elemento.querySelector('#senha-erro')?.textContent).toContain('pelo menos 6 caracteres');
    expect(usuarios.login).not.toHaveBeenCalled();
  });

  it('mantém o login bem-sucedido', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    const usuario = { id: '1', nome: 'Nome', email: 'usuario@example.com' };
    usuarios.login.and.returnValue(of(usuario));
    fixture.componentInstance.loginForm.setValue({ email: usuario.email, senha: 'senha123' });
    void fixture.componentInstance.entrar();
    expect(usuarios.salvarSessao).toHaveBeenCalledWith(usuario);
    expect(router.navigate).toHaveBeenCalledWith(['/tarefas']);
  });
});
