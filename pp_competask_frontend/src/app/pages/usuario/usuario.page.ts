import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, flameOutline, lockClosedOutline, mailOutline, peopleOutline, personOutline, pencil, timerOutline } from 'ionicons/icons';

import { UsuarioModel } from '../../models/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';

type AtalhoRodape = {
  label: string;
  icon: string;
  rota?: string;
  ativo?: boolean;
};

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonIcon, IonButton],
})
export class UsuarioPage {
  usuario: UsuarioModel | null = null;
  fotoPreview: string | null = null;
  perfilForm: FormGroup;

  mensagemAcao = '';

  atalhosRodape: AtalhoRodape[] = [
    { label: 'Tarefas', icon: 'checkmark-circle-outline', rota: '/tarefas' },
    { label: 'Comunidades', icon: 'people-outline' },
    { label: 'Timer', icon: 'timer-outline' },
    { label: 'Usuário', icon: 'person-outline', ativo: true },
  ];

  constructor(private readonly formBuilder: FormBuilder, private readonly router: Router,private usuarioService: UsuarioService) {
    addIcons({ checkmarkCircleOutline, personOutline, pencil, flameOutline, mailOutline, lockClosedOutline, peopleOutline, timerOutline });

    this.perfilForm = this.formBuilder.group({
      'nome': ['', Validators.compose([Validators.required])],
      'email': ['', Validators.compose([Validators.required, Validators.email])],
      'senha': [''],
      'foto': ['']
    });
  }

  ionViewWillEnter(): void {
    const u = this.usuarioService.obterUsuarioSessao();
    if (!u){
      this.mensagemAcao = 'Usuário não encontrado na sessão.';
      return
    };
    this.usuario = u;
    this.perfilForm.patchValue({ nome: u.nome, email: u.email });
    this.fotoPreview = u.foto || null;
  }

  salvarAlteracoes(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    if (!this.usuario) {
      this.mensagemAcao = 'Usuário não encontrado na sessão.';
      return;
    }

    let mudancas = this.perfilForm.value;
    let usuario = this.usuario;

    usuario.nome = String(mudancas.nome ?? usuario.nome);
    if (mudancas.senha){
      usuario.senha = String(mudancas.senha);
    }
    const fotoVal = mudancas.foto;
    if (fotoVal !== undefined && fotoVal !== '') {
      usuario.foto = String(fotoVal);
    }

    const result = this.usuarioService.atualizarUsuarioLocal(usuario);
    if (result) {
      this.usuario = result;
      this.mensagemAcao = 'Alterações salvas.';
    } else {
      this.mensagemAcao = 'Não foi possível salvar. Verifique o email.';
    }
  }

  excluirConta(): void {
    if (!this.usuario) {
      this.mensagemAcao = 'Usuário não encontrado na sessão.';
      return;
    }
    const id = this.usuario.id;
    const result = this.usuarioService.excluirUsuario(id);
    if (!result) {
      this.mensagemAcao = 'Não foi possível excluir a conta.';
      return;
    }
    this.router.navigate(['/login']);
  }

  sairConta(): void {
    this.usuarioService.excluirSessao();
    this.router.navigate(['/login']);
  }

  abrirAtalho(atalho: AtalhoRodape): void {
    if (atalho.ativo) {
      return;
    }

    if (atalho.rota) {
      this.router.navigate([atalho.rota]);
      return;
    }

    this.mensagemAcao = `${atalho.label} ainda será ligado ao backend.`;
  }

  selecionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files && input.files.length > 0 ? input.files[0] : null;

    if (!arquivo) {
      this.fotoPreview = null;
      this.perfilForm.patchValue({ foto: '' });
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      const fotoBase64 = String(leitor.result || '');
      this.fotoPreview = fotoBase64;
      this.perfilForm.patchValue({ foto: fotoBase64 });
    };
    leitor.readAsDataURL(arquivo);
  }
}
