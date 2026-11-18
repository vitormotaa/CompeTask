import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ajustar-foto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ajustar-foto.component.html',
  styleUrls: ['./ajustar-foto.component.scss'],
})
export class AjustarFotoComponent {
  @Input({ required: true }) src = '';
  @Output() confirmar = new EventEmitter<string>();
  @Output() cancelar = new EventEmitter<void>();

  largura = 0;
  altura = 0;
  posicaoX = 50;
  posicaoY = 50;
  zoom = 1;
  erro = '';
  private imagem: HTMLImageElement | null = null;

  get larguraPreview(): number {
    return this.largura && this.altura ? this.largura / Math.min(this.largura, this.altura) * this.zoom * 100 : 100;
  }

  get alturaPreview(): number {
    return this.largura && this.altura ? this.altura / Math.min(this.largura, this.altura) * this.zoom * 100 : 100;
  }

  carregarImagem(event: Event): void {
    const imagem = event.target as HTMLImageElement;
    this.largura = imagem.naturalWidth;
    this.altura = imagem.naturalHeight;
    this.imagem = imagem;
  }

  alterarPosicao(event: Event, eixo: 'x' | 'y' | 'zoom'): void {
    const valor = Number((event.target as HTMLInputElement).value);
    if (eixo === 'x') this.posicaoX = valor;
    else if (eixo === 'y') this.posicaoY = valor;
    else this.zoom = valor;
  }

  aplicar(): void {
    if (!this.imagem || !this.largura || !this.altura) {
      this.erro = 'Não foi possível carregar a imagem.';
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const contexto = canvas.getContext('2d');
    if (!contexto) {
      this.erro = 'Não foi possível ajustar a imagem.';
      return;
    }

    const lado = Math.min(this.largura, this.altura) / this.zoom;
    const x = (this.largura - lado) * this.posicaoX / 100;
    const y = (this.altura - lado) * this.posicaoY / 100;
    contexto.drawImage(this.imagem, x, y, lado, lado, 0, 0, 512, 512);
    this.confirmar.emit(canvas.toDataURL('image/jpeg', 0.9));
  }
}
