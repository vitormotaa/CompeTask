import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActionSheetController, ToastController } from '@ionic/angular/standalone';
import { NotificacaoService } from '../services/notificacao.service';
import { TarefasService } from '../services/tarefas.service';
import { UsuarioService } from '../services/usuario.service';
import { TarefasPage } from './tarefas/tarefas.page';
import { UsuarioPage } from './usuario/usuario.page';

describe('Navegação inferior do perfil', () => {
  it('mantém a mesma posição e altura da navegação de tarefas', () => {
    TestBed.configureTestingModule({
      imports: [TarefasPage, UsuarioPage],
      providers: [
        provideRouter([]),
        { provide: UsuarioService, useValue: {} },
        { provide: TarefasService, useValue: {} },
        { provide: NotificacaoService, useValue: {} },
        { provide: ToastController, useValue: {} },
        { provide: ActionSheetController, useValue: {} },
      ],
    });
    const tarefas = TestBed.createComponent(TarefasPage);
    const perfil = TestBed.createComponent(UsuarioPage);
    tarefas.nativeElement.style.setProperty('--cp-safe-bottom', '24px');
    perfil.nativeElement.style.setProperty('--cp-safe-bottom', '24px');
    tarefas.detectChanges();
    perfil.detectChanges();

    const barraTarefas = tarefas.nativeElement.querySelector('.bottom-nav') as HTMLElement;
    const barraPerfil = perfil.nativeElement.querySelector('.bottom-nav') as HTMLElement;
    const estilosTarefas = getComputedStyle(barraTarefas);
    const estilosPerfil = getComputedStyle(barraPerfil);
    expect(estilosPerfil.paddingBottom).toBe(estilosTarefas.paddingBottom);
    expect(barraPerfil.getBoundingClientRect().height).toBeCloseTo(barraTarefas.getBoundingClientRect().height, 1);
    expect(barraPerfil.getBoundingClientRect().top).toBeCloseTo(barraTarefas.getBoundingClientRect().top, 1);
  });
});
