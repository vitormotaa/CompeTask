import { AjustarFotoComponent } from './ajustar-foto.component';

describe('AjustarFotoComponent', () => {
  it('salva o recorte escolhido com posição e zoom da pré-visualização', () => {
    const componente = new AjustarFotoComponent();
    const imagem = document.createElement('img');
    Object.defineProperty(imagem, 'naturalWidth', { value: 800 });
    Object.defineProperty(imagem, 'naturalHeight', { value: 400 });
    const evento = new Event('load');
    Object.defineProperty(evento, 'target', { value: imagem });
    componente.carregarImagem(evento);
    componente.posicaoX = 25;
    componente.posicaoY = 75;
    componente.zoom = 2;

    const desenhar = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
    spyOn(HTMLCanvasElement.prototype, 'toDataURL').and.returnValue('data:image/jpeg;base64,recorte');
    const confirmar = spyOn(componente.confirmar, 'emit');
    componente.aplicar();

    expect(componente.larguraPreview).toBe(400);
    expect(componente.alturaPreview).toBe(200);
    expect(desenhar).toHaveBeenCalledWith(imagem, 150, 150, 200, 200, 0, 0, 512, 512);
    expect(confirmar).toHaveBeenCalledWith('data:image/jpeg;base64,recorte');
  });

  it('não confirma sem uma imagem carregada', () => {
    const componente = new AjustarFotoComponent();
    const confirmar = spyOn(componente.confirmar, 'emit');
    componente.aplicar();
    expect(confirmar).not.toHaveBeenCalled();
    expect(componente.erro).toBeTruthy();
  });
});
