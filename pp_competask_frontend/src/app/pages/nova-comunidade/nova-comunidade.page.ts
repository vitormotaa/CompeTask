import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowBackOutline,
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

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly comunidadesService: ComunidadesService,
    private readonly usuarioService: UsuarioService
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
      this.mensagemAcao = 'Voce precisa estar logado para salvar uma comunidade.';
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
        this.mensagemAcao = 'Nao foi possivel salvar a comunidade.';
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
        this.mensagemAcao = 'Nao foi possivel excluir a comunidade.';
      },
    });
  }

  selecionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files && input.files.length > 0 ? input.files[0] : null;

    if (!arquivo) {
      this.fotoPreview = null;
      this.form.patchValue({ foto: '' });
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      const fotoBase64 = String(leitor.result || '');
      this.fotoPreview = fotoBase64;
      this.form.patchValue({ foto: fotoBase64 });
    };
    leitor.readAsDataURL(arquivo);
  }

  private carregarComunidade(): void {
    const usuarioAtual = this.usuarioService.obterUsuarioSessao();

    if (!usuarioAtual?.id || !this.comunidadeId) {
      this.mensagemAcao = 'Voce precisa estar logado para editar uma comunidade.';
      return;
    }

    this.comunidadesService.listarPorUsuario().subscribe({
      next: (comunidades) => {
        const comunidade = comunidades.find((item) => String(item.idComunidade) === this.comunidadeId);

        if (!comunidade) {
          this.mensagemAcao = 'Comunidade nao encontrada.';
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
        this.mensagemAcao = 'Nao foi possivel carregar a comunidade.';
      },
    });
  }
}
