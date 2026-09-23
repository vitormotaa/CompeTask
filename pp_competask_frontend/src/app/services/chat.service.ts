import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { MensagemModel } from '../models/comunidade.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly WS_URL = 'https://competask.onrender.com/ws-chat';

  private client: Client | null = null;
  private subscricao: StompSubscription | null = null;

  conectar(comunidadeId: number, aoReceber: (mensagem: MensagemModel) => void): void {
    this.client = new Client({
      webSocketFactory: () => new SockJS(this.WS_URL),
      onConnect: () => {
        this.subscricao = this.client!.subscribe(`/topico/comunidade/${comunidadeId}`, (frame) => {
          aoReceber(JSON.parse(frame.body));
        });
      },
    });

    this.client.activate();
  }

  enviar(comunidadeId: number, usuarioId: number, conteudo: string): void {
    if (!this.client?.connected) {
      return;
    }

    this.client.publish({
      destination: `/app/comunidade/${comunidadeId}/enviar`,
      body: JSON.stringify({ usuarioId, comunidadeId, conteudo }),
    });
  }

  desconectar(): void {
    this.subscricao?.unsubscribe();
    this.subscricao = null;
    this.client?.deactivate();
    this.client = null;
  }
}
