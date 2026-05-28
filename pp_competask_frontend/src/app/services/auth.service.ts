import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { UsuarioModel } from '../models/usuario.model';

export interface CredenciaisLogin {
  email: string;
  senha: string;
}

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly usuarioAtualSubject = new BehaviorSubject<UsuarioModel | null>(null);

  readonly usuarioAtual$ = this.usuarioAtualSubject.asObservable();

  autenticar(credenciais: CredenciaisLogin): Observable<UsuarioModel> {
    const usuario = this.montarUsuario(credenciais.email, credenciais.senha);
    this.usuarioAtualSubject.next(usuario);
    return of(usuario);
  }

  cadastrar(dados: DadosCadastro): Observable<UsuarioModel> {
    const usuario = this.montarUsuario(dados.email, dados.senha, dados.nome);
    this.usuarioAtualSubject.next(usuario);
    return of(usuario);
  }

  obterUsuarioAtual(): UsuarioModel | null {
    return this.usuarioAtualSubject.value;
  }

  limparSessao(): void {
    this.usuarioAtualSubject.next(null);
  }

  private montarUsuario(email: string, senha: string, nome?: string): UsuarioModel {
    return {
      id: new Date().toISOString(),
      nome: nome?.trim() || this.extrairNomeDoEmail(email),
      email: email.trim(),
      senha,
      diasStreak: 7,
      notificacoesPendentes: 1,
    };
  }

  private extrairNomeDoEmail(email: string): string {
    const parteInicial = email.split('@')[0] ?? 'Usuário';
    return parteInicial
      ? parteInicial.charAt(0).toUpperCase() + parteInicial.slice(1)
      : 'Usuário';
  }
}
