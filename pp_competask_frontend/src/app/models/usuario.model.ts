export interface UsuarioModel {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  foto?: string;
  streak?: number;
}
