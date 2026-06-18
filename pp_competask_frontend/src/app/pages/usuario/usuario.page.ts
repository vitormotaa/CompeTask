import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, flameOutline, lockClosedOutline, mailOutline, peopleOutline, personOutline, pencil, timerOutline, notifications, notificationsOutline } from 'ionicons/icons';

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
    { label: 'Comunidades', icon: 'people-outline', rota: '/comunidades' },
    { label: 'Timer', icon: 'timer-outline' },
    { label: 'Usuário', icon: 'person-outline', ativo: true },
  ];

  constructor(private readonly formBuilder: FormBuilder, private readonly router: Router,private usuarioService: UsuarioService) {
    addIcons({notificationsOutline,personOutline,pencil,notifications,flameOutline,mailOutline,lockClosedOutline,checkmarkCircleOutline,peopleOutline,timerOutline});

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

    const mudancas = this.perfilForm.value;
    const fotoVal = mudancas.foto;

    const usuarioAtualizado: UsuarioModel = {
      ...this.usuario,
      nome: String(mudancas.nome ?? this.usuario.nome),
      email: String(mudancas.email ?? this.usuario.email),
      senha: mudancas.senha ? String(mudancas.senha) : this.usuario.senha,
      foto: fotoVal !== undefined && fotoVal !== '' ? String(fotoVal) : this.usuario.foto,
      diasStreak: this.usuario.diasStreak,
    };

    this.usuarioService.atualizarUsuarioLocal(usuarioAtualizado).subscribe({
      next: (resultado: UsuarioModel) => {
        this.usuario = resultado;
        this.perfilForm.patchValue({
          nome: resultado.nome,
          email: resultado.email,
          senha: '',
          foto: ''
        });
        this.fotoPreview = resultado.foto || null;
        this.mensagemAcao = 'Alterações salvas.';
      },
      error: async (erro: HttpErrorResponse) => {
        this.mensagemAcao = this.obterMensagemErroSalvar(erro);
      }
    });
  }

  excluirConta(): void {
    if (!this.usuario) {
      this.mensagemAcao = 'Usuário não encontrado na sessão.';
      return;
    }
    const id = this.usuario.id;
    this.usuarioService.excluirUsuario(id).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (erro: HttpErrorResponse) => {
        this.mensagemAcao = this.obterMensagemErroSalvar(erro);
      }
    });
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

  private obterMensagemErroSalvar(erro: HttpErrorResponse): string {
    const mensagemDoBackend =
      typeof erro.error === 'string'
        ? erro.error
        : erro.error?.message || erro.message;

    return mensagemDoBackend || 'Não foi possível salvar as alterações.';
  }
}
