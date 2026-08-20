package br.cefetmg.pp_competask.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.pp_competask.dto.AutentificacaoRequestDTO;
import br.cefetmg.pp_competask.dto.UsuarioRequestDTO;
import br.cefetmg.pp_competask.dto.UsuarioResponseDTO;
import br.cefetmg.pp_competask.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/usuarios")
// @CrossOrigin(origins = "http://localhost:8100")
@CrossOrigin(origins = "*")
@Tag(name = "Usuários", description = "Endpoints para gerenciamento de usuários do COMPETASK")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;


    @GetMapping("/{id}")
    @Operation(summary = "Buscar usuário por ID")
    public ResponseEntity<UsuarioResponseDTO> getById(@PathVariable Long id){
        try {
            return ResponseEntity.ok(usuarioService.findById(id));
        } catch (IllegalStateException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
        }
    }


    @GetMapping("/checkEmail")
    @Operation(summary = "Checar disponibilidade do email")
    public boolean existeEmail(@RequestParam String email){
        return usuarioService.existeEmail(email);
    }


    @PostMapping("/login") //deve ser POST com JSON
    @Operation(summary = "Login")
    public ResponseEntity<UsuarioResponseDTO> login(@RequestBody AutentificacaoRequestDTO autentificacaoRequestDTO){
        try {
            return ResponseEntity.ok(usuarioService.login(autentificacaoRequestDTO));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, ex.getMessage());
        }
    }


    @PostMapping("")
    @Operation(summary = "Criar usuário")
    public ResponseEntity<UsuarioResponseDTO> inserir(@RequestBody @Valid UsuarioRequestDTO usuarioRequestDTO){
         try {
            UsuarioResponseDTO usuarioResponseDTO = usuarioService.inserir(usuarioRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(usuarioResponseDTO);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }



    //não precisa existir porque meio que nao deleta só muda um bagulho, vai virar patch
    // @DeleteMapping("/{id}")
    // @Operation(summary = "Excluir usuário")
    // public ResponseEntity<UsuarioResponseDTO> excluir(@PathVariable Long id){
    //     try {
    //         return u.desativar(id);
    //     } catch (IllegalStateException ex) {
    //         throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
    //     }
    // }

    @PatchMapping("/excluir/{id}")
    @Operation(summary = "Alterar atividade do usuário")
    public ResponseEntity<UsuarioResponseDTO> excluir(@PathVariable Long id){
        UsuarioResponseDTO usuarioResponseDTO = usuarioService.excluir(id);
        return ResponseEntity.ok(usuarioResponseDTO);
    }



    @PutMapping("/{id}")
    @Operation(summary = "Editar usuário")
    public ResponseEntity<UsuarioResponseDTO> alterar(@RequestBody UsuarioRequestDTO usuarioRequestDTO, @PathVariable Long id){
        try {
            return ResponseEntity.ok(usuarioService.alterar(id, usuarioRequestDTO));
        } catch (IllegalStateException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (IllegalArgumentException ex) {
            if ("id é obrigatório.".equals(ex.getMessage())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT, ex.getMessage());
        }
    }

    @PatchMapping("/foto/{id}")
    @Operation(summary = "Atualizar foto do usuário")
    public ResponseEntity<UsuarioResponseDTO> atualizarFoto(@PathVariable Long id,
            @RequestParam(value = "arquivo", required = false) MultipartFile arquivo) {
        try {
            return ResponseEntity.ok(usuarioService.atualizarFoto(id, arquivo));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível enviar a imagem.");
        }
    }
}