package br.cefetmg.pp_competask.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.pp_competask.dto.TarefaRequestDTO;
import br.cefetmg.pp_competask.dto.TarefaResponseDTO;
import br.cefetmg.pp_competask.dto.TarefaTempoExecucaoPatchDTO;
import br.cefetmg.pp_competask.service.TarefaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/tarefas")
// @CrossOrigin(origins = "http://localhost:8100")
@CrossOrigin(origins = "*")
@Tag(name = "Tarefas", description = "Endpoints para gerenciamento de tarefas do COMPETASK")
public class TarefaController {

    @Autowired
    private TarefaService tarefaService;

    // listar todas as tarefas por id do usuario
    @GetMapping("/usuario/{id}")
    @Operation(summary = "Buscar tarefas do usuário por ID", description = "")
    public List<TarefaResponseDTO> getAllByUsuarioId(@PathVariable Long id) {
        return tarefaService.buscarTarefasPorUsuarioId(id);
    }

    // buscar tarefa por id
    @GetMapping("/{id}")
    @Operation(summary = "Buscar tarefa por ID da tarefa", description = "")
    public ResponseEntity<TarefaResponseDTO> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(tarefaService.buscarPorId(id));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
        }
    }

    // inserir tarefa
    @PostMapping("")
    @Operation(summary = "Criar uma tarefa", description = "")
    public ResponseEntity<TarefaResponseDTO> inserir(@Valid @RequestBody TarefaRequestDTO tarefaRequestDTO) {
        try {
            TarefaResponseDTO tarefaResponseDTO = tarefaService.inserir(tarefaRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(tarefaResponseDTO);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    // editar tarefa
    @PutMapping("/{id}")
    @Operation(summary = "Editar tarefa", description = "")
    public ResponseEntity<TarefaResponseDTO> atualizar(@PathVariable Long id,
            @RequestBody TarefaRequestDTO tarefaRequestDTO) {
        try {
            TarefaResponseDTO tarefaResponseDTO = tarefaService.atualizar(id, tarefaRequestDTO);
            return ResponseEntity.ok(tarefaResponseDTO);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    // excluir tarefa
    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir tarefa", description = "")
    public ResponseEntity<TarefaResponseDTO> excluir(@PathVariable Long id) {
        try {
            tarefaService.excluir(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
        }
    }

    // alterar estado de concluída da tarefa
    @PatchMapping("/conclusao/{id}")
    @Operation(summary = "Editar tarefa")
    public ResponseEntity<TarefaResponseDTO> alterarConclusao(@PathVariable Long id,
            @RequestParam Long usuarioId) {
        try {
            TarefaResponseDTO tarefaResponseDTO = tarefaService.alterarConclusao(id, usuarioId);
            return ResponseEntity.ok(tarefaResponseDTO);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    // adicionar e alterar o tempo de conclusão de uma tarefa
    @PatchMapping("/timer/{id}")
    @Operation(summary = "Adicionar e editar tempo de conclsuão de uma tarefa")
    public ResponseEntity<TarefaResponseDTO> timerTarefa(@PathVariable Long id,
            @Valid @RequestBody TarefaTempoExecucaoPatchDTO tempoExecucao) {
        TarefaResponseDTO tarefaResponseDTO = tarefaService.timerTarefa(id, tempoExecucao.getTempoExecucao());
        return ResponseEntity.ok(tarefaResponseDTO);
    }

    // criar uma tarefa na comunidade 
    @PostMapping("/comunidade")
    @Operation(summary = "Criar uma tarefa na comunidade")
    public ResponseEntity<TarefaResponseDTO> inserirNaComunidade(@Valid @RequestBody TarefaRequestDTO tarefaRequestDTO) {
        try {
            TarefaResponseDTO tarefaResponseDTO = tarefaService.inserirNaComunidade(tarefaRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(tarefaResponseDTO);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }
}