import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { UsuarioModel } from '../models/usuario.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  emailEmUso(email: string){
    const params = new HttpParams().set('email', email);
    return this.http.get<boolean>(`${this.API_URL}/checkEmail`, {params});
  }

  // salvar(usuario: UsuarioModel): boolean {
  //   const usuarios: UsuarioModel[] = JSON.parse(localStorage.getItem('usuarios') || '[]');
  //   const emailNovo = String(usuario.email || '').trim().toLowerCase();

  //   const emailJaExiste = usuarios.some((u: UsuarioModel) => String(u.email || '').trim().toLowerCase() === emailNovo);
  //   if (emailJaExiste) {
  //     return false;
  //   }

  //   usuario.email = emailNovo;
  //   usuario.diasStreak = 0;
  //   usuario.id = new Date().toISOString();
  //   usuarios.push(usuario);
  //   localStorage.setItem('usuarios', JSON.stringify(usuarios));
  //   return true;
  // }

  salvar(usuario: UsuarioModel): Observable<UsuarioModel> {
    return this.http.post<UsuarioModel>(this.API_URL, usuario);
  }

  login(email: string, senha: string): Observable<UsuarioModel> {
    const params = new HttpParams().set('email', email).set('senha', senha);
    return this.http.get<any>(`${this.API_URL}/login`, {params}).pipe(
      map((resultado: any) => this.converterParaModelo(resultado))
    );
  }
  //esse pipe e esse map tem que usar pra 'converter' o que vem do back pro front, acho que tem como fazer sem usando outras taticas
  excluirUsuario(id: string): Observable<UsuarioModel> {
    return this.http.delete<any>(`${this.API_URL}/${id}`).pipe(
      map((resultado: any) => {
        const usuarioDesativado = this.converterParaModelo(resultado);
        this.excluirSessao();
        return usuarioDesativado;
      })
    );
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
    localStorage.setItem('usuarioSessao', JSON.stringify(this.converterParaModelo(usuario)));
  }

  excluirSessao() {
    localStorage.removeItem('usuarioSessao');
  }

  obterUsuarioSessao() {
    const json = localStorage.getItem('usuarioSessao');
    if (!json) return null;
    try {
      return this.converterParaModelo(JSON.parse(json));
    } catch {
      return null;
    }
  }

  obterUsuarioPorId(id: string) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    return usuarios.find((u: UsuarioModel) => u.id === id) || null;
  }

  // obterUsuarioPorId(id: number): Observable<UsuarioModel> {
  //   return this.http.get<UsuarioModel>(`${this.API_URL}/${id}`);
  // }

  obterUsuarioPorEmail(email: string) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const emailNormalizado = String(email || '').trim().toLowerCase();
    return usuarios.find((u: UsuarioModel) => String(u.email || '').trim().toLowerCase() === emailNormalizado) || null;
  }

  atualizarUsuarioLocal(usuario: UsuarioModel): Observable<UsuarioModel> {
    const payload = this.converterParaBackend(usuario);

    return this.http.put<UsuarioModel>(this.API_URL, payload).pipe(
      map((resultado: any) => {
        const usuarioAtualizado = this.converterParaModelo(resultado);
        this.salvarSessao(usuarioAtualizado);
        return usuarioAtualizado;
      })
    );
  }

  private converterParaBackend(usuario: UsuarioModel) {
    return {
      idUsuario: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      foto: usuario.foto,
      streak: usuario.diasStreak,
    };
  }

  private converterParaModelo(usuario: any): UsuarioModel {
    return {
      id: String(usuario?.idUsuario ?? usuario?.id ?? ''),
      nome: String(usuario?.nome ?? ''),
      email: String(usuario?.email ?? ''),
      senha: usuario?.senha,
      foto: usuario?.foto,
      diasStreak: Number(usuario?.streak ?? usuario?.diasStreak ?? 0),
    };
  }


}
