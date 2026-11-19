import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { UsuarioModel } from '../models/usuario.model';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { LembreteEventosService } from './lembrete-eventos.service';
import { SessaoService } from './sessao.service';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  // private readonly API_URL = 'http://localhost:8080/api/v1/usuarios';

  
  private readonly API_URL = 'https://competask.onrender.com/api/v1/usuarios';


  constructor(private http: HttpClient, private readonly lembreteEventos: LembreteEventosService,
    private readonly sessao: SessaoService){ }

  inicializar() {
    if (!localStorage['usuarios']) {
      let usuarios: UsuarioModel[] = [
        { id: new Date().toISOString(), nome: 'balbino', email: 'balbino@email.com', senha: '123456', streak: 3, foto: 'assets/balbino.webp' },
      ];
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
  }

  emailEmUso(email: string){
    const params = new HttpParams().set('email', email);
    return this.http.get<boolean>(`${this.API_URL}/checkEmail`, {params});
  }

  obterNome(): Observable<string> {
    return this.http.get(`${this.API_URL}/me/nome`, { responseType: 'text' });
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

  // o cadastro não devolve token, então autentica em seguida
  salvar(usuario: UsuarioModel): Observable<UsuarioModel> {
    const payload = this.converterParaBackend(usuario);

    return this.http.post<any>(this.API_URL, payload).pipe(
      switchMap(() => this.login(usuario.email, usuario.senha ?? ''))
    );
  }

  login(email: string, senha: string): Observable<UsuarioModel> {
    return this.http.post<{ token: string; refreshToken?: string }>(`${this.API_URL}/login`, { email, senha }).pipe(
      tap((resultado) => {
        localStorage.setItem('token', resultado.token);
        if (resultado.refreshToken) localStorage.setItem('refreshToken', resultado.refreshToken);
        else localStorage.removeItem('refreshToken');
      }),
      switchMap(() => this.http.get<any>(`${this.API_URL}/me`)),
      map((resultado: any) => this.converterParaModelo(resultado))
    );
  }

  excluirUsuario(): Observable<UsuarioModel> {
    return this.http.patch<any>(`${this.API_URL}/me/excluir`, {}).pipe(
      map((resultado: any) => {
        const usuarioDesativado = this.converterParaModelo(resultado);
        this.excluirSessao();
        return usuarioDesativado;
      })
    );
  }


  salvarSessao(usuario: UsuarioModel) {
    const { senha, ...dados } = this.converterParaModelo(usuario);
    localStorage.setItem('usuarioSessao', JSON.stringify(dados));
    this.lembreteEventos.notificar();
  }

  excluirSessao() {
    this.sessao.sair();
  }

  obterUsuarioSessao() {
    const json = localStorage.getItem('usuarioSessao');
    if (!json) return null;
    try {
      const usuario = this.converterParaModelo(JSON.parse(json));
      if (usuario.senha !== undefined) {
        this.salvarSessao(usuario);
        delete usuario.senha;
      }
      return usuario;
    } catch {
      console.error('Não foi possível ler a sessão salva.');
      return null;
    }
  }

  sessaoValida(): boolean {
    const token = localStorage.getItem('token');
    const usuario = this.obterUsuarioSessao();
    if (!token || !usuario?.id) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: unknown };
      return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
    } catch (erro: unknown) {
      console.error('Não foi possível ler o token da sessão.', erro);
      return false;
    }
  }

  obterUsuarioPorId(id: string) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    return usuarios.find((u: UsuarioModel) => u.id === id) || null;
  }

  // busca os dados atuais no backend (ex: streak atualizado por tarefas/check-ins)
  buscarUsuarioAtual(): Observable<UsuarioModel> {
    return this.http.get<any>(`${this.API_URL}/me`).pipe(
      map((resultado: any) => {
        const usuarioAtualizado = this.converterParaModelo(resultado);
        this.salvarSessao(usuarioAtualizado);
        return usuarioAtualizado;
      })
    );
  }

  obterUsuarioPorEmail(email: string) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const emailNormalizado = String(email || '').trim().toLowerCase();
    return usuarios.find((u: UsuarioModel) => String(u.email || '').trim().toLowerCase() === emailNormalizado) || null;
  }

  atualizarUsuarioLocal(usuario: UsuarioModel): Observable<UsuarioModel> {
    const payload = this.converterParaBackend(usuario);

    return this.http.put<any>(`${this.API_URL}/me`, payload).pipe(
      map((resultado: any) => {
        const usuarioAtualizado = this.converterParaModelo(resultado);
        this.salvarSessao(usuarioAtualizado);
        return usuarioAtualizado;
      })
    );
  }

  private converterParaBackend(usuario: UsuarioModel) {
    return {
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      foto: usuario.foto,
      streak: usuario.streak,
    };
  }

  private converterParaModelo(usuario: any): UsuarioModel {
    return {
      id: String(usuario?.idUsuario ?? usuario?.id ?? ''),
      nome: String(usuario?.nome ?? ''),
      email: String(usuario?.email ?? ''),
      senha: usuario?.senha,
      foto: usuario?.foto,
      streak: Number(usuario?.streak ?? usuario?.diasStreak ?? 0),
    };
  }


}
