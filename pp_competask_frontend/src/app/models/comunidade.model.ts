export type AcessoComunidade = 'publico' | 'privado';

export interface MembroComunidadeModel {
  usuarioId: number;
  nomeUsuario: string;
  adm: boolean;
  pontuacao: number;
}

export interface ComunidadeModel {
  idComunidade: number;
  nome: string;
  descricao: string;
  acesso: AcessoComunidade;
  foto: string;
  membros: MembroComunidadeModel[];
}

export type ComunidadeInput = {
  nome: string;
  descricao: string;
  acesso: AcessoComunidade;
  foto: string;
  idUsuarioCriador: number;
};

export interface RankingModel {
  usuarioId: number;
  nomeUsuario: string;
  pontos: number;
  posicao: number;
}

export interface MensagemModel {
  id: number;
  usuarioId: number;
  nomeUsuario: string;
  comunidadeId: number;
  conteudo: string;
  dataHoraEnvio: string;
}
