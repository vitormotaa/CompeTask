import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ActionSheetController, ToastController } from '@ionic/angular/standalone';
import { of } from 'rxjs';

import { UsuarioModel } from '../models/usuario.model';
import { NotificacaoService } from '../services/notificacao.service';
import { UsuarioService } from '../services/usuario.service';
import { CadastroPage } from './cadastro/cadastro.page';
import { UsuarioPage } from './usuario/usuario.page';

describe('Foto de perfil', () => {
  const usuario: UsuarioModel = {
    id: '1', nome: 'Nome', email: 'usuario@example.com', senha: 'senha123', foto: 'foto-antiga', streak: 0,
  };
  let usuarios: jasmine.SpyObj<UsuarioService>;
  let router: jasmine.SpyObj<Router>;
  let toast: jasmine.SpyObj<ToastController>;
  let sheet: jasmine.SpyObj<ActionSheetController>;

  beforeEach(() => {
    usuarios = jasmine.createSpyObj<UsuarioService>('UsuarioService', [
      'obterUsuarioSessao', 'buscarUsuarioAtual', 'atualizarUsuarioLocal', 'salvar', 'salvarSessao',
    ]);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    toast = jasmine.createSpyObj<ToastController>('ToastController', ['create']);
    sheet = jasmine.createSpyObj<ActionSheetController>('ActionSheetController', ['create']);
    usuarios.obterUsuarioSessao.and.returnValue(usuario);
    usuarios.buscarUsuarioAtual.and.returnValue(of(usuario));
    const toastElement = jasmine.createSpyObj<HTMLIonToastElement>('toast', ['present']);
    toastElement.present.and.resolveTo();
    toast.create.and.resolveTo(toastElement);
  });

  it('envia a foto ajustada no cadastro', () => {
    const pagina = new CadastroPage(new FormBuilder(), router, usuarios, toast, sheet);
    usuarios.salvar.and.returnValue(of(usuario));
    pagina.cadastroForm.patchValue({ nome: usuario.nome, email: usuario.email, senha: usuario.senha });
    pagina.fotoParaAjustar = 'imagem-original';
    pagina.aplicarFoto('imagem-recortada');
    pagina.cadastrar();

    expect(pagina.fotoPreview).toBe('imagem-recortada');
    expect(usuarios.salvar).toHaveBeenCalledWith(jasmine.objectContaining({ foto: 'imagem-recortada' }));
  });

  it('mantém o email e envia a foto ajustada ao salvar o perfil', () => {
    const notificacoes = jasmine.createSpyObj<NotificacaoService>('NotificacaoService', ['listar']);
    notificacoes.listar.and.returnValue(of([]));
    usuarios.atualizarUsuarioLocal.and.returnValue(of(usuario));
    const pagina = new UsuarioPage(new FormBuilder(), router, usuarios, notificacoes, toast, sheet);
    pagina.ionViewWillEnter();
    pagina.fotoParaAjustar = 'imagem-original';
    pagina.aplicarFoto('imagem-recortada');
    pagina.salvarAlteracoes();

    expect(pagina.perfilForm.get('email')).toBeNull();
    expect(usuarios.atualizarUsuarioLocal).toHaveBeenCalledWith(
      jasmine.objectContaining({ email: usuario.email, foto: 'imagem-recortada' }),
    );
  });
});
