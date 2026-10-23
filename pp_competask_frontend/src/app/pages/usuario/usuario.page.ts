import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraDirection, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController, IonButton, IonContent, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, checkmarkCircleOutline, flameOutline, imageOutline, lockClosedOutline, mailOutline, peopleOutline, personOutline, pencil, timerOutline, notifications, notificationsOutline } from 'ionicons/icons';

import { UsuarioModel } from '../../models/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { NotificacaoModel } from '../../models/notificacao.model';
import { NotificacaoService } from '../../services/notificacao.service';

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

  notificacoes: NotificacaoModel[] = [];

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('cameraInput') cameraInput?: ElementRef<HTMLInputElement>;
  @ViewChild('videoCamera') videoCamera?: ElementRef<HTMLVideoElement>;

  cameraAberta = false;
  erroCamera = '';
  private streamCamera: MediaStream | null = null;

  get notificacoesNaoLidas(): number {
    return this.notificacoes.filter((notificacao) => !notificacao.lida).length;
  }

  atalhosRodape: AtalhoRodape[] = [
    { label: 'Tarefas', icon: 'checkmark-circle-outline', rota: '/tarefas' },
    { label: 'Comunidades', icon: 'people-outline', rota: '/comunidades' },
    { label: 'Cronômetro', icon: 'timer-outline', rota: '/timer' },
    { label: 'Usuário', icon: 'person-outline', ativo: true },
  ];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private usuarioService: UsuarioService,
    private readonly notificacaoService: NotificacaoService,
    private readonly toastController: ToastController,
    private readonly actionSheetController: ActionSheetController,
  ) {
    addIcons({cameraOutline,imageOutline,notificationsOutline,personOutline,pencil,notifications,flameOutline,mailOutline,lockClosedOutline,checkmarkCircleOutline,peopleOutline,timerOutline});

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
    this.usuario.streak = this.usuario.streak || 0;
    this.perfilForm.patchValue({ nome: u.nome, email: u.email });
    this.fotoPreview = u.foto || null;
    this.carregarNotificacoes();

    // atualiza a streak com o valor mais recente do backend
    this.usuarioService.buscarUsuarioAtual().subscribe({
      next: (usuarioAtualizado) => this.usuario = usuarioAtualizado,
      error: () => {},
    });
  }

  carregarNotificacoes(): void {
    if (!this.usuario?.id) {
      return;
    }

    this.notificacaoService.listar().subscribe({
      next: (notificacoes) => this.notificacoes = notificacoes,
      error: () => this.mensagemAcao = 'Não foi possível carregar as notificações.',
    });
  }

  abrirNotificacoes(): void {
    this.router.navigate(['/notificacoes']);
  }

  async escolherOrigemFoto(): Promise<void> {
    const sheet = await this.actionSheetController.create({
      header: 'Foto de perfil',
      buttons: [
        { text: 'Tirar foto com a câmera', icon: 'camera-outline', handler: () => { void this.abrirCamera(); } },
        { text: 'Escolher arquivo', icon: 'image-outline', handler: () => this.fileInput?.nativeElement.click() },
        { text: 'Cancelar', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  async abrirCamera(): Promise<void> {
    this.erroCamera = '';

    if (Capacitor.isNativePlatform()) {
      await this.tirarFotoNativa();
      return;
    }

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
  }

  private async tirarFotoNativa(): Promise<void> {
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
        this.perfilForm.patchValue({ foto: foto.dataUrl });
      }
    } catch (erro) {
      const mensagem = String((erro as { message?: string })?.message ?? '').toLowerCase();
      if (!mensagem.includes('cancel')) {
        this.mensagemAcao = 'Não foi possível acessar a câmera. Verifique a permissão do aplicativo.';
      }
    }
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

    contexto.drawImage(
      video,
      (video.videoWidth - lado) / 2,
      (video.videoHeight - lado) / 2,
      lado,
      lado,
      0,
      0,
      tamanho,
      tamanho,
    );

    const fotoBase64 = canvas.toDataURL('image/jpeg', 0.85);
    this.fotoPreview = fotoBase64;
    this.perfilForm.patchValue({ foto: fotoBase64 });
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

  private async mostrarToast(mensagem: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2200,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle-outline',
    });
    await toast.present();
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

    if (!mudancas.senha && !this.usuario.senha) {
      this.mensagemAcao = 'Informe sua senha para salvar as alterações.';
      return;
    }

    const usuarioAtualizado: UsuarioModel = {
      ...this.usuario,
      nome: String(mudancas.nome ?? this.usuario.nome),
      email: String(mudancas.email ?? this.usuario.email),
      senha: mudancas.senha ? String(mudancas.senha) : this.usuario.senha,
      foto: fotoVal !== undefined && fotoVal !== '' ? String(fotoVal) : this.usuario.foto,
      streak: this.usuario.streak,
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
        this.mensagemAcao = '';
        this.mostrarToast('Alterações salvas com sucesso!');
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
    this.usuarioService.excluirUsuario().subscribe({
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
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      const fotoBase64 = String(leitor.result || '');
      this.fotoPreview = fotoBase64;
      this.perfilForm.patchValue({ foto: fotoBase64 });
    };
    leitor.readAsDataURL(arquivo);
    input.value = '';
  }

  private obterMensagemErroSalvar(erro: HttpErrorResponse): string {
    const mensagemDoBackend =
      typeof erro.error === 'string'
        ? erro.error
        : erro.error?.message || erro.message;

    return mensagemDoBackend || 'Não foi possível salvar as alterações.';
  }
}
