import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { UsuarioModel } from '../models/usuario.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private readonly API_URL = 'http://localhost:8080/api/v1/usuarios';

  constructor(private http: HttpClient){ }

  inicializar() {
    if (!localStorage['usuarios']) {
      let usuarios: UsuarioModel[] = [
        { id: new Date().toISOString(), nome: 'balbino', email: 'balbino@email.com', senha: '123456', diasStreak: 3, foto: 'assets/balbino.webp' },
      ];
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
  }

  salvar(usuario: UsuarioModel): boolean {
    const usuarios: UsuarioModel[] = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const emailNovo = String(usuario.email || '').trim().toLowerCase();

    const emailJaExiste = usuarios.some((u: UsuarioModel) => String(u.email || '').trim().toLowerCase() === emailNovo);
    if (emailJaExiste) {
      return false;
    }

    usuario.email = emailNovo;
    usuario.diasStreak = 0;
    usuario.id = new Date().toISOString();
    usuarios.push(usuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    return true;
  }

  // salvar(usuario: UsuarioModel): Observable<UsuarioModel> {
  //   return this.http.post<UsuarioModel>(this.API_URL, usuario);
  // }

  excluirUsuario(id: string): boolean {
    let usuariosJson = localStorage.getItem('usuarios');
    if (usuariosJson) {
      let usuarios: UsuarioModel[] = JSON.parse(usuariosJson);
      const aux = usuarios.findIndex(usuarios => usuarios.id === id);
      if (aux === -1) {
        return false;
      }
      usuarios.splice(aux, 1);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      this.excluirSessao();
      return true;
    }
    return false;
  }

  validar(usuario: UsuarioModel): boolean {
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const email = String(usuario.email || '').trim().toLowerCase();
    return usuarios.some((u: UsuarioModel) => String(u.email || '').trim().toLowerCase() === email && u.senha === usuario.senha);
  }

  salvarSessao(usuario: UsuarioModel) {
    if (!localStorage.getItem('usuarioSessao')) {
      localStorage.setItem('usuarioSessao', JSON.stringify({}));
    }
    localStorage.setItem('usuarioSessao', JSON.stringify(usuario));

    // this.usuarioAtual = usuario;
  }

  excluirSessao() {
    localStorage.removeItem('usuarioSessao');
  }

  obterUsuarioSessao() {
    const json = localStorage.getItem('usuarioSessao');
    if (!json) return null;
    try {
      return JSON.parse(json) as UsuarioModel;
    } catch {
      return null;
    }
  }

  obterUsuarioPorId(id: string) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    return usuarios.find((u: UsuarioModel) => u.id === id) || null;
  }

  obterUsuarioPorEmail(email: string) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const emailNormalizado = String(email || '').trim().toLowerCase();
    return usuarios.find((u: UsuarioModel) => String(u.email || '').trim().toLowerCase() === emailNormalizado) || null;
  }

  atualizarUsuarioLocal(usuario: UsuarioModel): UsuarioModel | null {
    const usuariosJson = localStorage.getItem('usuarios');
    if (!usuariosJson) {
      return null;
    } 

    const usuarios: UsuarioModel[] = JSON.parse(usuariosJson);

    const existente = usuarios.find(u => u.id === usuario.id);
    if (!existente) {
      return null;
    }

    existente.nome = String(usuario.nome ?? existente.nome);
    existente.email = String(usuario.email ?? existente.email);

    if (usuario.senha) {
      existente.senha = String(usuario.senha);
    }

    if (usuario.foto !== undefined && usuario.foto !== '') {
      existente.foto = String(usuario.foto);
    }

    if (usuario.diasStreak !== undefined) {
      existente.diasStreak = Number(usuario.diasStreak);
    }

    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    this.salvarSessao(existente);

    return existente;
  }


}
