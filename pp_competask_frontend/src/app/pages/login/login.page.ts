import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { UsuarioModel } from 'src/app/models/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonIcon, IonButton],
})
export class LoginPage {

  loginForm: FormGroup;

  senhaVisivel = false;

  constructor(private readonly formBuilder: FormBuilder, private readonly router: Router, private usuarioService: UsuarioService, private toastController: ToastController) {
    addIcons({
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline
    });

    this.loginForm = this.formBuilder.group({
      'email': ['', Validators.compose([Validators.required, Validators.email])],
      'senha': ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  async entrar() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const email = String(this.loginForm.value.email || '').trim();
    const senha = String(this.loginForm.value.senha || '').trim();

    this.usuarioService.login(email, senha).subscribe({
      next: (resultado: UsuarioModel) => {
        this.usuarioService.salvarSessao(resultado);
        this.router.navigate(['/usuario']);
      },
      error: async (erro: HttpErrorResponse) => {
        const mensagem = this.obterMensagemErroLogin(erro);
        const toast = await this.toastController.create({
          message: mensagem,
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  ionViewWillEnter(){
      this.loginForm.reset();
      this.loginForm.markAsPristine(); // indica que o formulário não foi modificado desde seu estado inicial — remove o estado dirty que poderia disparar validações visuais.
      this.loginForm.markAsUntouched(); //marca todos os controles como não tocados — remove o estado touched para que mensagens de erro baseadas em toque não apareçam imediatamente.
    }

  irParaCadastro(): void {
      this.router.navigate(['/cadastro']);
    }

  alternarSenhaVisibilidade(): void {
      this.senhaVisivel = !this.senhaVisivel;
    }

  ngOnInit() {
      this.usuarioService.inicializar();
    }

  private obterMensagemErroLogin(erro: HttpErrorResponse): string {
    const mensagemDoBackend =
      typeof erro.error === 'string'
        ? erro.error
        : erro.error?.message || erro.message;

    return mensagemDoBackend || 'Falha no login';
  }
}
