import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraDirection, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController, IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowBackOutline,
  cameraOutline,
  imageOutline,
  globeOutline,
  keyOutline,
  peopleOutline,
  personOutline,
} from 'ionicons/icons';

import { ComunidadesService } from '../../services/comunidades.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-nova-comunidade',
  templateUrl: './nova-comunidade.page.html',
  styleUrls: ['./nova-comunidade.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonIcon, IonButton],
})
export class NovaComunidadePage implements OnInit {
  comunidadeId: string | null = null;
  fotoPreview: string | null = null;
  mensagemAcao = '';
  salvando = false;
  form: FormGroup;

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('cameraInput') cameraInput?: ElementRef<HTMLInputElement>;
  @ViewChild('videoCamera') videoCamera?: ElementRef<HTMLVideoElement>;

  cameraAberta = false;
  erroCamera = '';
  private streamCamera: MediaStream | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly comunidadesService: ComunidadesService,
    private readonly usuarioService: UsuarioService,
    private readonly actionSheetController: ActionSheetController
  ) {
    this.form = this.formBuilder.group({
      nome: ['', Validators.required],
      descricao: [''],
      acesso: ['publico', Validators.required],
      foto: [''],
    });

    addIcons({
      addOutline,
      arrowBackOutline,
      cameraOutline,
      globeOutline,
      imageOutline,
      keyOutline,
      peopleOutline,
      personOutline,
    });
  }

  ngOnInit(): void {
    this.comunidadeId = this.route.snapshot.paramMap.get('id');

    if (this.comunidadeId) {
      this.carregarComunidade();
    }
  }

  get tituloPagina(): string {
    return this.comunidadeId ? 'Editar Comunidade' : 'Nova Comunidade';
  }

  get textoBotao(): string {
    if (this.salvando) {
      return this.comunidadeId ? 'SALVANDO...' : 'CRIANDO...';
    }

    return this.comunidadeId ? 'SALVAR COMUNIDADE' : 'CRIAR COMUNIDADE';
  }

  voltar(): void {
    if (this.comunidadeId) {
      this.router.navigate(['/comunidades', this.comunidadeId]);
      return;
    }

    this.router.navigate(['/comunidades']);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.mensagemAcao = 'Preencha o nome da comunidade.';
      return;
    }

    const usuarioAtual = this.usuarioService.obterUsuarioSessao();

    if (!usuarioAtual?.id) {
      this.mensagemAcao = 'Você precisa estar logado para salvar uma comunidade.';
      return;
    }

    this.salvando = true;
    this.mensagemAcao = '';

    const payload = {
      nome: this.form.value.nome,
      descricao: this.form.value.descricao || '',
      acesso: this.form.value.acesso,
      foto: this.form.value.foto || '',
      idUsuarioCriador: Number(usuarioAtual.id),
    };

    const requisicao = this.comunidadeId
      ? this.comunidadesService.atualizar(this.comunidadeId, payload)
      : this.comunidadesService.inserir(payload);

    requisicao.subscribe({
      next: (comunidade) => {
        this.salvando = false;
        this.router.navigate(['/comunidades', comunidade.idComunidade]);
      },
      error: () => {
        this.salvando = false;
        this.mensagemAcao = 'Não foi possível salvar a comunidade.';
      },
    });
  }

  excluirComunidade(): void {
    if (!this.comunidadeId) {
      return;
    }

    const confirmar = window.confirm('Tem certeza que deseja excluir esta comunidade?');
    if (!confirmar) {
      return;
    }

    this.salvando = true;
    this.mensagemAcao = '';

    this.comunidadesService.excluir(this.comunidadeId).subscribe({
      next: () => {
        this.salvando = false;
        this.router.navigate(['/comunidades']);
      },
      error: () => {
        this.salvando = false;
        this.mensagemAcao = 'Não foi possível excluir a comunidade.';
      },
    });
  }

  async escolherOrigemFoto(): Promise<void> {
    const sheet = await this.actionSheetController.create({
      header: 'Imagem da comunidade',
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
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
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
        direction: CameraDirection.Rear,
      });

      if (foto.dataUrl) {
        this.fotoPreview = foto.dataUrl;
        this.form.patchValue({ foto: foto.dataUrl });
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
    this.form.patchValue({ foto: fotoBase64 });
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
      this.form.patchValue({ foto: fotoBase64 });
    };
    leitor.readAsDataURL(arquivo);
    input.value = '';
  }

  private carregarComunidade(): void {
    const usuarioAtual = this.usuarioService.obterUsuarioSessao();

    if (!usuarioAtual?.id || !this.comunidadeId) {
      this.mensagemAcao = 'Você precisa estar logado para editar uma comunidade.';
      return;
    }

    this.comunidadesService.listarPorUsuario().subscribe({
      next: (comunidades) => {
        const comunidade = comunidades.find((item) => String(item.idComunidade) === this.comunidadeId);

        if (!comunidade) {
          this.mensagemAcao = 'Comunidade não encontrada.';
          return;
        }

        this.fotoPreview = comunidade.foto || null;
        this.form.patchValue({
          nome: comunidade.nome,
          descricao: comunidade.descricao,
          acesso: comunidade.acesso,
          foto: comunidade.foto,
        });
      },
      error: () => {
        this.mensagemAcao = 'Não foi possível carregar a comunidade.';
      },
    });
  }
}
