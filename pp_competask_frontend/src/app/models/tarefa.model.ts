export interface TarefaModel {
  id: string;
  usuarioId: string;
  titulo: string;
  descricao: string;
  prioridade: number;
  dataRealizacao: string;
  lembreteData: string;
  lembreteHora: string;
  tempoExecucao: string;
  dataConfeccao: string;
  concluida: boolean;
  criadaEm: string;
  atualizadaEm: string;
}