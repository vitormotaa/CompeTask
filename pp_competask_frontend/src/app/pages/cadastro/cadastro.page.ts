import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraDirection, CameraResultType, CameraSource } from '@capacitor/camera';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActionSheetController, IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/services/usuario.service';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, personOutline, cameraOutline, imageOutline } from 'ionicons/icons';
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

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('cameraInput') cameraInput?: ElementRef<HTMLInputElement>;
  @ViewChild('videoCamera') videoCamera?: ElementRef<HTMLVideoElement>;
  cameraAberta = false;
  erroCamera = '';
  private streamCamera: MediaStream | null = null;

  constructor(private readonly formBuilder: FormBuilder, private readonly router: Router, private usuarioService: UsuarioService, private readonly toastController: ToastController, private readonly actionSheetController: ActionSheetController) {
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
      'camera-outline': cameraOutline,
      'image-outline': imageOutline
    });
  }

  capturarFoto(): void {
    const video = this.videoCamera?.nativeElement;
    if (!video || !video.videoWidth) {
      return;
    }

    const lado = Math.min(video.videoWidth, video.videoHeight);
    const tamanho = Math.min(lado, 512);
    const canvas = document.createElement('canvas');
    canvas.width = tamanho;
    canvas.height = tamanho;
    const contexto = canvas.getContext('2d');
    if (!contexto) {
      return;
    }

    contexto.drawImage(video, (video.videoWidth - lado) / 2, (video.videoHeight - lado) / 2, lado, lado, 0, 0, tamanho, tamanho);

    const fotoBase64 = canvas.toDataURL('image/jpeg', 0.85);
    this.fotoPreview = fotoBase64;
    this.cadastroForm.patchValue({ foto: fotoBase64 });
    this.fecharCamera();
  }

  fecharCamera(): void {
    this.streamCamera?.getTracks().forEach((faixa) => faixa.stop());
    this.streamCamera = null;
    if (this.videoCamera?.nativeElement) {
      this.videoCamera.nativeElement.srcObject = null;
    }
    this.cameraAberta = false;
  }

  ionViewWillLeave(): void {
    this.fecharCamera();
  }

  async escolherOrigemFoto(): Promise<void> {
    const sheet = await this.actionSheetController.create({
      header: 'Foto de perfil',
      buttons: [
        { text: 'Tirar foto com a câmera', icon: 'camera-outline', handler: () => { void this.abrirCamera(); } },
        { text: 'Escolher da galeria', icon: 'image-outline', handler: () => this.fileInput?.nativeElement.click() },
        { text: 'Cancelar', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  private async abrirCamera(): Promise<void> {
    this.erroCamera = '';

    if (!Capacitor.isNativePlatform()) {
      if (!navigator.mediaDevices?.getUserMedia) {
        this.cameraInput?.nativeElement.click();
        return;
      }

      this.cameraAberta = true;
      try {
        this.streamCamera = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        const video = this.videoCamera?.nativeElement;
        if (video) {
          video.srcObject = this.streamCamera;
          await video.play().catch(() => undefined);
        }
      } catch {
        this.erroCamera = 'Não foi possível acessar a câmera. Verifique a permissão do navegador.';
      }
      return;
    }

    try {
      const foto = await Camera.getPhoto({
        quality: 80,
        width: 512,
        height: 512,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        direction: CameraDirection.Front,
      });

      if (foto.dataUrl) {
        this.fotoPreview = foto.dataUrl;
        this.cadastroForm.patchValue({ foto: foto.dataUrl });
      }
    } catch (erro) {
      const mensagem = String((erro as { message?: string })?.message ?? '').toLowerCase();
      if (!mensagem.includes('cancel')) {
        this.exibirMensagem('Não foi possível acessar a câmera. Verifique a permissão do aplicativo.');
      }
    }
  }

  cadastrar(): void {
    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    this.usuarioService.salvar(this.cadastroForm.value).subscribe({
      next: (resultado: UsuarioModel) => {
        this.usuarioService.salvarSessao(resultado);
        this.router.navigate(['/login']);
      },
      error: (erro) => {
        if (erro.status === 400 && erro.error?.message === 'E-mail já cadastrado.') {
          const emailCtrl = this.cadastroForm.get('email');
          emailCtrl?.setErrors({ emailEmUso: true });
          emailCtrl?.markAsTouched();
          this.exibirMensagem('Email já cadastrado.');
          return;
        }

        this.exibirMensagem('Erro ao cadastrar usuário.');
      }
    });

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
      this.cadastroForm.patchValue({ foto: fotoBase64 });
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
