import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActionSheetController, ToastController } from '@ionic/angular/standalone';
import { ToastController as ToastControllerAngular } from '@ionic/angular';
import { ChatService } from '../services/chat.service';
import { CheckinsService } from '../services/checkins.service';
import { ComunidadesService } from '../services/comunidades.service';
import { NotificacaoService } from '../services/notificacao.service';
import { TarefasService } from '../services/tarefas.service';
import { UsuarioService } from '../services/usuario.service';
import { TarefaPage } from './add-tarefa/add-tarefa.page';
import { CadastroPage } from './cadastro/cadastro.page';
import { ComunidadeDetalhePage } from './comunidade-detalhe/comunidade-detalhe.page';
import { ComunidadesPage } from './comunidades/comunidades.page';
import { LoginPage } from './login/login.page';
import { NotificacoesPage } from './notificacoes/notificacoes.page';
import { NovaComunidadePage } from './nova-comunidade/nova-comunidade.page';
import { TarefasPage } from './tarefas/tarefas.page';
import { TimerPage } from './timer/timer.page';
import { UsuarioPage } from './usuario/usuario.page';

describe('Títulos das páginas', () => {
  it('usa o mesmo tamanho em todas as páginas, ligeiramente maior que o anterior das tarefas', () => {
    const paginas: Type<unknown>[] = [
      TarefasPage, LoginPage, CadastroPage, TarefaPage, ComunidadeDetalhePage,
      ComunidadesPage, NotificacoesPage, NovaComunidadePage, TimerPage, UsuarioPage,
    ];
    TestBed.configureTestingModule({
      imports: paginas,
      providers: [
        provideRouter([]),
        { provide: UsuarioService, useValue: { inicializar: () => undefined } },
        { provide: TarefasService, useValue: {} },
        { provide: ComunidadesService, useValue: {} },
        { provide: NotificacaoService, useValue: {} },
        { provide: CheckinsService, useValue: {} },
        { provide: ChatService, useValue: {} },
        { provide: ActionSheetController, useValue: {} },
        { provide: ToastController, useValue: {} },
        { provide: ToastControllerAngular, useValue: {} },
      ],
    });

    const tamanhos: number[] = [];
    for (const pagina of paginas) {
      const fixture = TestBed.createComponent(pagina);
      fixture.detectChanges();
      const elemento: HTMLElement = fixture.nativeElement;
      const titulo = elemento.querySelector<HTMLElement>('h1')!;
      const shell = titulo.closest<HTMLElement>('main, section')!;
      document.body.appendChild(shell);
      tamanhos.push(parseFloat(getComputedStyle(titulo).fontSize));
      shell.remove();
      fixture.destroy();
    }

    for (const tamanho of tamanhos) {
      expect(tamanho).toBeCloseTo(tamanhos[0], 2);
    }
    const tamanhoAnterior = document.createElement('span');
    tamanhoAnterior.style.fontSize = 'clamp(1.15rem, 4vw, 1.2rem)';
    document.body.appendChild(tamanhoAnterior);
    expect(tamanhos[0]).toBeGreaterThan(parseFloat(getComputedStyle(tamanhoAnterior).fontSize));
    tamanhoAnterior.remove();
  });
});
