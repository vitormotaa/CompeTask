import { PluginListenerHandle, registerPlugin } from '@capacitor/core';
import { InjectionToken } from '@angular/core';

export interface LembretePushNative {
  definirUsuario(options: { usuarioId: string }): Promise<void>;
  reservar(options: {
    usuarioId: string;
    lembretes: { tarefaId: string; horario: string; instante: number }[];
  }): Promise<{ permitidos: string[]; novos: string[] }>;
  cancelarReservas(options: { chaves: string[] }): Promise<void>;
  addListener(event: 'abriuLembrete', listener: () => void): Promise<PluginListenerHandle>;
}

export const lembretePushNative = registerPlugin<LembretePushNative>('LembretePush');
export const LEMBRETE_PUSH_NATIVE = new InjectionToken<LembretePushNative>(
  'Integração nativa de lembretes', { providedIn: 'root', factory: () => lembretePushNative },
);

export function horarioLembrete(data: string, hora: string): string {
  const partes = hora.split(':');
  return `${data}T${partes[0]}:${partes[1]}:${(partes[2] ?? '00').split('.')[0]}`;
}

export function chaveLembrete(usuarioId: string, tarefaId: string, horario: string): string {
  return `${usuarioId}|${tarefaId}|${horario}`;
}
