import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NotificacaoService } from '../../services/notificacao.service';
import { NotificacoesPage } from './notificacoes.page';

function luminancia(cor: string): number {
  const componentes = cor.match(/\d+/g);
  if (!componentes || componentes.length < 3) throw new Error(`Cor inválida: ${cor}`);
  const canais = componentes.slice(0, 3).map((valor) => {
    const canal = Number(valor) / 255;
    return canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
}

describe('NotificacoesPage', () => {
  it('mantém o título legível nas notificações lidas e não lidas', () => {
    TestBed.configureTestingModule({
      imports: [NotificacoesPage],
      providers: [
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate']) },
        { provide: NotificacaoService, useValue: jasmine.createSpyObj<NotificacaoService>('NotificacaoService', ['listar']) },
      ],
    });
    const fixture = TestBed.createComponent(NotificacoesPage);
    const dataHora = new Date().toISOString();
    fixture.componentInstance.notificacoes = [
      { id: 1, tarefaId: 1, titulo: 'Lembrete de tarefa', mensagem: 'Mensagem', dataHora, lida: false },
      { id: 2, tarefaId: 2, titulo: 'Lembrete de tarefa', mensagem: 'Mensagem', dataHora, lida: true },
    ];
    const elemento: HTMLElement = fixture.nativeElement;
    fixture.detectChanges();

    const shell = elemento.querySelector<HTMLElement>('.page-shell')!;
    shell.style.setProperty('--ion-text-color', '#ffffff');
    document.body.appendChild(shell);
    const lista = shell.querySelector<HTMLElement>('.lista')!;
    const itens = lista.querySelectorAll<HTMLElement>('.item');
    expect(itens.length).toBe(2);
    for (const item of Array.from(itens)) {
      const titulo = item.querySelector<HTMLElement>('strong')!;
      const fundo = item.classList.contains('item--lida') ? item : lista;
      const texto = luminancia(getComputedStyle(titulo).color);
      const superficie = luminancia(getComputedStyle(fundo).backgroundColor);
      const contraste = (Math.max(texto, superficie) + 0.05) / (Math.min(texto, superficie) + 0.05);
      expect(contraste).toBeGreaterThan(4.5);
    }
    shell.remove();
    fixture.destroy();
  });
});
