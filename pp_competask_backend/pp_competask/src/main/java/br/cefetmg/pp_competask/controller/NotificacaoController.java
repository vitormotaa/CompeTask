package br.cefetmg.pp_competask.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.pp_competask.dto.NotificacaoResponseDTO;
import br.cefetmg.pp_competask.security.UsuarioLogado;
import br.cefetmg.pp_competask.service.NotificacaoService;
import br.cefetmg.pp_competask.service.PushService;
import br.cefetmg.pp_competask.dto.DispositivoPushDTO;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/notificacoes")
@CrossOrigin(origins = "*")
public class NotificacaoController {

    private final NotificacaoService notificacaoService;
    private final PushService pushService;

    public NotificacaoController(NotificacaoService notificacaoService, PushService pushService) {
        this.notificacaoService = notificacaoService;
        this.pushService = pushService;
    }

    @PostMapping("/dispositivos")
    public ResponseEntity<Void> registrarDispositivo(@RequestBody @Valid DispositivoPushDTO dispositivo) {
        pushService.registrar(UsuarioLogado.getId(), dispositivo.token());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/dispositivos")
    public ResponseEntity<Void> removerDispositivo(@RequestBody @Valid DispositivoPushDTO dispositivo) {
        pushService.remover(UsuarioLogado.getId(), dispositivo.token());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("")
    public List<NotificacaoResponseDTO> listar(
            @RequestParam(defaultValue = "false") boolean somenteNaoLidas) {
        return notificacaoService.listar(UsuarioLogado.getId(), somenteNaoLidas);
    }

    @PatchMapping("/{id}/lida")
    public ResponseEntity<NotificacaoResponseDTO> marcarComoLida(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(notificacaoService.marcarComoLida(id, UsuarioLogado.getId()));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
        }
    }
}