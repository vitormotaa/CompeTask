package br.cefetmg.pp_competask.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.pp_competask.dto.NotificacaoResponseDTO;
import br.cefetmg.pp_competask.service.NotificacaoService;

@RestController
@RequestMapping("/api/v1/notificacoes")
@CrossOrigin(origins = "*")
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    public NotificacaoController(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<NotificacaoResponseDTO> listar(@PathVariable Long usuarioId,
            @RequestParam(defaultValue = "false") boolean somenteNaoLidas) {
        return notificacaoService.listar(usuarioId, somenteNaoLidas);
    }

    @PatchMapping("/{id}/lida")
    public ResponseEntity<NotificacaoResponseDTO> marcarComoLida(@PathVariable Long id,
            @RequestParam Long usuarioId) {
        try {
            return ResponseEntity.ok(notificacaoService.marcarComoLida(id, usuarioId));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
        }
    }
}