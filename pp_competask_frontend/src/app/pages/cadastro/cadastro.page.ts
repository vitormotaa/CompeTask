import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/services/usuario.service';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, personOutline, cameraOutline } from 'ionicons/icons';
import { UsuarioModel } from 'src/app/models/usuario.model';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonIcon, IonButton],
})
export class CadastroPage {

  cadastroForm: FormGroup;
  fotoPreview: string | null = null;

  // arquivo selecionado (usado para upload via FormData ou validações)
  fotoArquivo: File | null = null;
  private readonly MAX_BYTES = 1 * 1024 * 1024; // 1 MB

  senhaVisivel = false;


  constructor(private readonly formBuilder: FormBuilder, private readonly router: Router, private usuarioService: UsuarioService, private readonly toastController: ToastController) {
    this.cadastroForm = this.formBuilder.group({
      'nome': ['', Validators.compose([Validators.required])],
      'email': ['', Validators.compose([Validators.required, Validators.email])],
      'senha': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      'foto': ['']
    });

    addIcons({
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
      'person-outline': personOutline,
      'camera-outline': cameraOutline
    });
  }

  cadastrar(): void {
    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    this.usuarioService.emailEmUso(String(this.cadastroForm.value.email || '').trim()).subscribe({
      next: (emailTaEmUso: boolean) => {
        if (!emailTaEmUso) {
          this.usuarioService.salvar(this.cadastroForm.value).subscribe({
            next: (resultado: UsuarioModel) => {
              this.usuarioService.salvarSessao(resultado);
              this.router.navigate(['/login']);
            },
            error: (erro) => {
              if (erro.status === 409) {
                this.exibirMensagem('Email já cadastrado.');
                return;
              }

              this.exibirMensagem('Erro ao cadastrar usuário.');
            }
          });
        } else {
          const emailCtrl = this.cadastroForm.get('email');
          emailCtrl?.setValue('');                     // limpa o campo
          emailCtrl?.setErrors({ emailEmUso: true }); // define erro customizado
          emailCtrl?.markAsTouched();                  // mostra estado tocado (exibe validação)
          emailCtrl?.updateValueAndValidity();
          this.exibirMensagem('Email já em uso.');
        }
      },
      error: (erro) => {
        this.exibirMensagem('Erro ao cadastrar usuário.');
      }
    })

    // let salvo = this.usuarioService.salvar(this.cadastroForm.value);
    // if (!salvo) {
    //   this.cadastroForm.get('email')?.setErrors({ emailEmUso: true });
    //   this.cadastroForm.get('email')?.markAsTouched();
    //   return;
    // }
    // this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.usuarioService.inicializar();
  }

  ionViewWillEnter() {
    this.cadastroForm.reset();
    this.fotoPreview = null;
    this.cadastroForm.markAsPristine(); // indica que o formulário não foi modificado desde seu estado inicial — remove o estado dirty que poderia disparar validações visuais.
    this.cadastroForm.markAsUntouched(); //marca todos os controles como não tocados — remove o estado touched para que mensagens de erro baseadas em toque não apareçam imediatamente.
  }

  irParaLogin(): void {
    this.router.navigate(['/login']);
  }

  alternarSenhaVisibilidade(): void {
    this.senhaVisivel = !this.senhaVisivel;
  }

  selecionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files && input.files.length > 0 ? input.files[0] : null;

    if (!arquivo) {
      this.fotoPreview = null;
      this.fotoArquivo = null;
      this.cadastroForm.patchValue({ foto: '' });
      return;
    }

    // validar tamanho
    if (arquivo.size > this.MAX_BYTES) {
      this.exibirMensagem('Imagem muito grande. Máx 1 MB.');
      this.fotoArquivo = null;
      input.value = '';
      return;
    }

    // tudo OK: armazenar File e gerar preview (sem gravar base64 no form)
    this.fotoArquivo = arquivo;
    const leitor = new FileReader();
    leitor.onload = () => {
      const fotoBase64 = String(leitor.result || '');
      this.fotoPreview = fotoBase64;
      this.cadastroForm.patchValue({ foto: '' });
    };
    leitor.readAsDataURL(arquivo);
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present();
  }
}
