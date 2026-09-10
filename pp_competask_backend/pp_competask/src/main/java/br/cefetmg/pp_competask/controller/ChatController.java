package br.cefetmg.pp_competask.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import br.cefetmg.pp_competask.dto.MensagemRequestDTO;
import br.cefetmg.pp_competask.dto.MensagemResponseDTO;
import br.cefetmg.pp_competask.service.MensagemService;

// controller STOMP: recebe mensagens enviadas para /app/comunidade/{id}/enviar e retransmite para /topico/comunidade/{id}
@Controller
public class ChatController {

	@Autowired
	private MensagemService mensagemService;

	@MessageMapping("/comunidade/{id}/enviar")
	@SendTo("/topico/comunidade/{id}")
	public MensagemResponseDTO enviar(@DestinationVariable Long id, @Payload MensagemRequestDTO mensagemRequestDTO) {
		mensagemRequestDTO.setComunidadeId(id);
		return mensagemService.enviar(mensagemRequestDTO);
	}
}
