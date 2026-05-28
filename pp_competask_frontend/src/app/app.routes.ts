import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./pages/cadastro/cadastro.page').then((m) => m.CadastroPage),
  },
  {
    path: 'usuario',
    loadComponent: () => import('./pages/usuario/usuario.page').then((m) => m.UsuarioPage),
  },
  {
    path: 'tarefas',
    loadComponent: () => import('./pages/tarefas/tarefas.page').then((m) => m.TarefasPage),
  },
  {
    path: 'tarefas/nova',
    loadComponent: () => import('./pages/add-tarefa/add-tarefa.page').then((m) => m.TarefaPage),
  },
  {
    path: 'tarefas/editar/:id',
    loadComponent: () => import('./pages/add-tarefa/add-tarefa.page').then((m) => m.TarefaPage),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
