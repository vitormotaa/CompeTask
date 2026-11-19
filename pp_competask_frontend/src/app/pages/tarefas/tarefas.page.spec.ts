import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TarefasService } from '../../services/tarefas.service';
import { UsuarioService } from '../../services/usuario.service';
import { TarefasPage } from './tarefas.page';

describe('Cabeçalho das tarefas', () => {
  it('mantém o título em uma linha e a ordenação visível em telas estreitas', () => {
    TestBed.configureTestingModule({
      imports: [TarefasPage],
      providers: [
        provideRouter([]),
        { provide: TarefasService, useValue: {} },
        { provide: UsuarioService, useValue: {} },
      ],
    });
    const fixture = TestBed.createComponent(TarefasPage);
    const pagina = fixture.componentInstance;
    fixture.detectChanges();
    const elemento: HTMLElement = fixture.nativeElement;
    const shell = elemento.querySelector<HTMLElement>('.tasks-shell')!;
    document.body.appendChild(shell);
    for (const largura of [320, 360, 390]) {
      shell.style.width = `${largura}px`;
      for (const opcao of pagina.opcoesOrdenacao) {
        pagina.selecionarOrdenacao(opcao.chave);
        fixture.detectChanges();
        const titulo = shell.querySelector<HTMLElement>('.tasks-header h1')!;
        const identidade = shell.querySelector<HTMLElement>('.tasks-header > div:first-child')!.getBoundingClientRect();
        const botao = shell.querySelector<HTMLElement>('.status-pill')!;
        const cabecalho = shell.querySelector<HTMLElement>('.tasks-header')!.getBoundingClientRect();
        const tituloRect = titulo.getBoundingClientRect();
        const botaoRect = botao.getBoundingClientRect();
        const estilos = getComputedStyle(titulo);

        expect(titulo.textContent).toBe('Minhas Tarefas');
        expect(estilos.whiteSpace).toBe('nowrap');
        expect(tituloRect.height).toBeGreaterThan(0);
        expect(tituloRect.height).toBeLessThan(parseFloat(estilos.lineHeight) + 1);
        expect(titulo.scrollWidth).toBeLessThanOrEqual(titulo.clientWidth);
        expect(botaoRect.right).toBeLessThanOrEqual(cabecalho.right + 1);
        expect(botaoRect.left).toBeGreaterThanOrEqual(cabecalho.left - 1);
        expect(botaoRect.left).toBeGreaterThanOrEqual(identidade.right - 1);
        expect(botaoRect.top).toBeLessThan(identidade.bottom);
        const rotulo = botao.querySelector<HTMLElement>('span')!;
        expect(rotulo.scrollWidth).toBeLessThanOrEqual(rotulo.clientWidth);
      }
    }
    shell.remove();
    fixture.destroy();
  });
});
