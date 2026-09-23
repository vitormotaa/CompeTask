export interface NotificacaoModel {
  id: number;
  tarefaId: number;
  titulo: string;
  mensagem: string;
  dataHora: string;
  lida: boolean;
}
