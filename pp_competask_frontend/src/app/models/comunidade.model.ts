export type AcessoComunidade = 'publico' | 'privado';

export interface ComunidadeModel {
  idComunidade: number;
  nome: string;
  descricao: string;
  acesso: AcessoComunidade;
  foto: string;
}
