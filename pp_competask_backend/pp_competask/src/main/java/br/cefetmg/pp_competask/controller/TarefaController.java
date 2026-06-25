package br.cefetmg.pp_competask.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;


import br.cefetmg.pp_competask.dto.TarefaRequestDTO;
import br.cefetmg.pp_competask.dto.TarefaResponseDTO;
import br.cefetmg.pp_competask.service.TarefaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/tarefas")
@CrossOrigin(origins = "http://localhost:8100")
@Tag(name = "Tarefas", description = "Endpoints para gerenciamento de tarefas do COMPETASK")
public class TarefaController {

    @Autowired
    private TarefaService tarefaService;


    //listar todas as tarefas por id do usuario
    @GetMapping("/usuario/{id}")
    @Operation(
        summary = "Buscar tarefas do usuário por ID", 
        description = ""
    )
    public List<TarefaResponseDTO> getAllByUsuarioId(@PathVariable Long id){
        return tarefaService.buscarTarefasPorUsuarioId(id);
    }

    //buscar tarefa por id
    @GetMapping("/{id}")
    @Operation(
        summary = "Buscar tarefa por ID da tarefa", 
        description = ""
    )
    public ResponseEntity<TarefaResponseDTO> getById(@PathVariable Long id){
        try {
            return ResponseEntity.ok(tarefaService.buscarPorId(id));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
        }
    }

    //inserir tarefa
    @PostMapping("")
    @Operation(
        summary = "Criar uma tarefa", 
        description = ""
    )
    public ResponseEntity<TarefaResponseDTO> inserir(@Valid @RequestBody TarefaRequestDTO tarefaRequestDTO){
        try {
            TarefaResponseDTO tarefaResponseDTO = tarefaService.inserir(tarefaRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(tarefaResponseDTO);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    //editar tarefa
    @PutMapping("/{id}")
    @Operation(
        summary = "Editar tarefa", 
        description = ""
    )
    public ResponseEntity<TarefaResponseDTO> atualizar(@PathVariable Long id, @RequestBody TarefaRequestDTO tarefaRequestDTO){
        try {
            TarefaResponseDTO tarefaResponseDTO = tarefaService.atualizar(id, tarefaRequestDTO);
            return ResponseEntity.ok(tarefaResponseDTO);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }


    //excluir tarefa
    @DeleteMapping("/{id}")
    @Operation(
        summary = "Excluir tarefa", 
        description = ""
    )
    public ResponseEntity<TarefaResponseDTO> excluir(@PathVariable Long id){
       try {
           tarefaService.excluir(id);
           return ResponseEntity.noContent().build();
       } catch (IllegalArgumentException ex) {
           throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
       }
    }

}
