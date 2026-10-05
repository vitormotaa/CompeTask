package br.cefetmg.pp_competask.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.pp_competask.dto.UsuarioResponseDTO;
import br.cefetmg.pp_competask.repository.UsuarioRepository;
import br.cefetmg.pp_competask.service.ComunidadeService;
import br.cefetmg.pp_competask.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

// Exclusivo do trabalho de DBF (perfil ADMINISTRADOR); apagar este arquivo remove os endpoints.
@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Administração", description = "Endpoints restritos ao perfil ADMINISTRADOR")
public class AdminController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private ComunidadeService comunidadeService;

    @GetMapping("/usuarios")
    @Operation(summary = "Listar todos os usuários")
    public List<UsuarioResponseDTO> listarUsuarios() {
        return usuarioRepository.findAll().stream().map(UsuarioResponseDTO::new).toList();
    }

    @PatchMapping("/usuarios/{id}/desativar")
    @Operation(summary = "Desativar usuário")
    public ResponseEntity<UsuarioResponseDTO> desativarUsuario(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(usuarioService.excluir(id));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
        }
    }

    @DeleteMapping("/comunidades/{id}")
    @Operation(summary = "Excluir qualquer comunidade")
    public ResponseEntity<Void> excluirComunidade(@PathVariable Long id) {
        try {
            comunidadeService.excluir(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível excluir a imagem.");
        }
    }
}
