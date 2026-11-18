import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NotificacaoModel } from '../models/notificacao.model';
import { TarefaModel } from '../models/tarefa.model';
import { NotificacaoService } from '../services/notificacao.service';
import { TarefasService } from '../services/tarefas.service';
import { UsuarioService } from '../services/usuario.service';
import { NotificacoesPage } from './notificacoes/notificacoes.page';
import { TarefasPage } from './tarefas/tarefas.page';

describe('Agrupamento das páginas', () => {
  const router = jasmine.createSpyObj<Router>('Router', ['navigate']);

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 10, 18, 12));
  });

  afterEach(() => jasmine.clock().uninstall());

  it('mostra apenas as tarefas da aba selecionada, incluindo concluídas e sem data', () => {
    TestBed.configureTestingModule({
      imports: [TarefasPage],
      providers: [
        { provide: Router, useValue: router },
        { provide: TarefasService, useValue: jasmine.createSpyObj<TarefasService>('TarefasService', ['buscarTarefasUsuario']) },
        { provide: UsuarioService, useValue: jasmine.createSpyObj<UsuarioService>('UsuarioService', ['obterUsuarioSessao']) },
      ],
    });
    const fixture = TestBed.createComponent(TarefasPage);
    const pagina = fixture.componentInstance;
    const tarefa: TarefaModel = {
      id: '1', usuarioId: '1', titulo: 'B', descricao: '', prioridade: 1, dataRealizacao: '2026-11-18',
      lembreteData: '', lembreteHora: '', tempoExecucao: '', dataConfeccao: '', concluida: false,
      criadaEm: '', atualizadaEm: '',
    };
    pagina.tarefas = [
      tarefa,
      { ...tarefa, id: '2', titulo: 'A' },
      { ...tarefa, id: '3', dataRealizacao: '2026-11-17' },
      { ...tarefa, id: '4', concluida: true, dataRealizacao: '' },
      { ...tarefa, id: '5', titulo: 'Concluída', concluida: true },
    ];
    pagina.selecionarOrdenacao('alfabetica');
    fixture.detectChanges();

    const elemento: HTMLElement = fixture.nativeElement;
    const abas = elemento.querySelectorAll<HTMLButtonElement>('.abas-dia button');
    expect(abas.length).toBe(31);
    expect(abas[0].textContent?.trim()).toBe('01/11/2026');
    expect(abas[29].textContent?.trim()).toBe('30/11/2026');
    expect(abas[30].textContent?.trim()).toBe('Sem data');
    expect(abas[17].getAttribute('aria-pressed')).toBe('true');
    expect(elemento.querySelectorAll('.task-card').length).toBe(2);

    abas[16].click();
    fixture.detectChanges();
    expect(abas[16].getAttribute('aria-pressed')).toBe('true');
    expect(elemento.querySelectorAll('.task-card').length).toBe(1);

    abas[17].click();
    fixture.detectChanges();
    expect(pagina.pendentesDoDia.map((item) => item.titulo)).toEqual(['A', 'B']);
    expect(pagina.concluidasDoDia.map((item) => item.titulo)).toEqual(['Concluída']);
    elemento.querySelector<HTMLButtonElement>('.task-group__header')!.click();
    fixture.detectChanges();
    expect(elemento.querySelectorAll('.task-card').length).toBe(3);

    abas[30].click();
    fixture.detectChanges();
    expect(pagina.pendentesDoDia.length).toBe(0);
    expect(pagina.concluidasDoDia[0].id).toBe('4');
    pagina.tarefas = pagina.tarefas.filter((item) => item.id !== '4');
    fixture.detectChanges();
    expect(pagina.grupoSelecionado?.chave).toBe('2026-11-18');
  });

  it('abre no dia atual mesmo sem tarefas e permite selecionar outras datas', () => {
    const tarefa: TarefaModel = {
      id: '1', usuarioId: '1', titulo: 'Amanhã', descricao: '', prioridade: 1, dataRealizacao: '2026-11-19',
      lembreteData: '', lembreteHora: '', tempoExecucao: '', dataConfeccao: '', concluida: false,
      criadaEm: '', atualizadaEm: '',
    };
    const tarefas = jasmine.createSpyObj<TarefasService>('TarefasService', ['buscarTarefasUsuario', 'guardarTarefasLocal']);
    tarefas.buscarTarefasUsuario.and.returnValue(of([tarefa]));
    const usuarios = jasmine.createSpyObj<UsuarioService>('UsuarioService', ['obterUsuarioSessao']);
    usuarios.obterUsuarioSessao.and.returnValue({ id: '1', nome: 'Nome', email: 'email', streak: 0 });
    TestBed.configureTestingModule({
      imports: [TarefasPage],
      providers: [
        { provide: Router, useValue: router },
        { provide: TarefasService, useValue: tarefas },
        { provide: UsuarioService, useValue: usuarios },
      ],
    });
    const fixture = TestBed.createComponent(TarefasPage);
    const pagina = fixture.componentInstance;
    pagina.ionViewWillEnter();
    fixture.detectChanges();
    const elemento: HTMLElement = fixture.nativeElement;
    const abas = elemento.querySelectorAll<HTMLButtonElement>('.abas-dia button');
    expect(abas.length).toBe(30);
    expect(abas[17].textContent?.trim()).toBe('18/11/2026');
    expect(abas[17].getAttribute('aria-pressed')).toBe('true');
    expect(elemento.querySelector('.empty-state')?.textContent).toContain('Nenhuma tarefa para este dia');
    abas[18].click();
    fixture.detectChanges();
    expect(elemento.querySelector('.task-card h2')?.textContent).toBe('Amanhã');
    pagina.ionViewWillEnter();
    fixture.detectChanges();
    expect(pagina.grupoSelecionado?.chave).toBe('2026-11-18');
  });

  it('navega entre meses e mostra todos os dias, incluindo fevereiro bissexto', () => {
    TestBed.configureTestingModule({
      imports: [TarefasPage],
      providers: [
        { provide: Router, useValue: router },
        { provide: TarefasService, useValue: {} },
        { provide: UsuarioService, useValue: {} },
      ],
    });
    const fixture = TestBed.createComponent(TarefasPage);
    const pagina = fixture.componentInstance;
    pagina.mesVisivel = new Date(2027, 11, 1);
    pagina.diaSelecionado = '2027-12-31';
    fixture.detectChanges();
    const elemento: HTMLElement = fixture.nativeElement;
    const avancar = elemento.querySelector<HTMLButtonElement>('[aria-label="Próximo mês"]')!;
    const voltar = elemento.querySelector<HTMLButtonElement>('[aria-label="Mês anterior"]')!;

    avancar.click();
    fixture.detectChanges();
    expect(pagina.grupoSelecionado?.chave).toBe('2028-01-01');
    expect(elemento.querySelectorAll('.abas-dia button').length).toBe(31);
    expect(pagina.tituloMes).toContain('2028');
    avancar.click();
    fixture.detectChanges();
    const abasFevereiro = elemento.querySelectorAll<HTMLButtonElement>('.abas-dia button');
    expect(abasFevereiro.length).toBe(29);
    expect(abasFevereiro[28].textContent?.trim()).toBe('29/02/2028');
    abasFevereiro[28].click();
    fixture.detectChanges();
    expect(pagina.grupoSelecionado?.chave).toBe('2028-02-29');
    voltar.click();
    fixture.detectChanges();
    expect(pagina.grupoSelecionado?.chave).toBe('2028-01-01');
  });

  it('troca as notificações visíveis ao selecionar outra data', () => {
    TestBed.configureTestingModule({
      imports: [NotificacoesPage],
      providers: [
        { provide: Router, useValue: router },
        { provide: NotificacaoService, useValue: jasmine.createSpyObj<NotificacaoService>('NotificacaoService', ['listar']) },
      ],
    });
    const fixture = TestBed.createComponent(NotificacoesPage);
    const pagina = fixture.componentInstance;
    const notificacao: NotificacaoModel = {
      id: 1, tarefaId: 1, titulo: 'Lembrete', mensagem: '', dataHora: '2026-11-18T12:00:00', lida: false,
    };
    pagina.notificacoes = [
      notificacao,
      { ...notificacao, id: 2, titulo: 'Dia anterior', dataHora: '2026-11-17T23:00:00', lida: true },
      { ...notificacao, id: 3, dataHora: '2026-11-18T08:00:00' },
    ];

    fixture.detectChanges();
    const elemento: HTMLElement = fixture.nativeElement;
    const abas = elemento.querySelectorAll<HTMLButtonElement>('.abas-dia button');
    expect(abas.length).toBe(30);
    expect(abas[0].textContent?.trim()).toBe('01/11/2026');
    expect(abas[29].textContent?.trim()).toBe('30/11/2026');
    expect(abas[17].getAttribute('aria-pressed')).toBe('true');
    expect(elemento.querySelectorAll('.item').length).toBe(2);
    abas[16].click();
    fixture.detectChanges();
    expect(abas[16].getAttribute('aria-pressed')).toBe('true');
    expect(elemento.querySelectorAll('.item').length).toBe(1);
    expect(elemento.querySelector('.item strong')?.textContent).toContain('Dia anterior');
    abas[0].click();
    fixture.detectChanges();
    expect(elemento.querySelectorAll('.item').length).toBe(0);
    expect(elemento.querySelector('.vazio')?.textContent).toContain('Nenhuma notificação para este dia');
    expect(pagina.notificacoesNaoLidas).toBe(2);
  });

  it('abre notificações no dia atual e permite navegar por meses vazios e anos bissextos', () => {
    const service = jasmine.createSpyObj<NotificacaoService>('NotificacaoService', ['listar']);
    service.listar.and.returnValue(of([]));
    TestBed.configureTestingModule({
      imports: [NotificacoesPage],
      providers: [
        { provide: Router, useValue: router },
        { provide: NotificacaoService, useValue: service },
      ],
    });
    const fixture = TestBed.createComponent(NotificacoesPage);
    const pagina = fixture.componentInstance;
    pagina.ionViewWillEnter();
    fixture.detectChanges();
    const elemento: HTMLElement = fixture.nativeElement;
    expect(pagina.grupoSelecionado?.chave).toBe('2026-11-18');
    expect(elemento.querySelectorAll('.abas-dia button').length).toBe(30);
    expect(elemento.querySelector('.vazio')?.textContent).toContain('Nenhuma notificação por enquanto');

    pagina.mesVisivel = new Date(2028, 1, 1);
    pagina.diaSelecionado = '2028-02-01';
    fixture.detectChanges();
    const abas = elemento.querySelectorAll<HTMLButtonElement>('.abas-dia button');
    expect(abas.length).toBe(29);
    abas[28].click();
    fixture.detectChanges();
    expect(pagina.grupoSelecionado?.chave).toBe('2028-02-29');
    elemento.querySelector<HTMLButtonElement>('[aria-label="Próximo mês"]')!.click();
    fixture.detectChanges();
    expect(pagina.grupoSelecionado?.chave).toBe('2028-03-01');
    expect(elemento.querySelectorAll('.abas-dia button').length).toBe(31);
    pagina.ionViewWillEnter();
    fixture.detectChanges();
    expect(pagina.grupoSelecionado?.chave).toBe('2026-11-18');
  });
});
