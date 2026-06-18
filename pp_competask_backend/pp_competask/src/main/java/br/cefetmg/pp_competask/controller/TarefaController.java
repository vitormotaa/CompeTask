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
import br.cefetmg.pp_competask.model.Tarefa;
import br.cefetmg.pp_competask.repository.TarefaRepository;
import br.cefetmg.pp_competask.service.TarefaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/tarefas")
@CrossOrigin(origins = "http://localhost:8100")
public class TarefaController {

    @Autowired
    private TarefaService tarefaService;


    //listar todas as tarefas por id do usuario
    @GetMapping("/usuario/{id}")
    public List<TarefaResponseDTO> getAllByUsuarioId(@PathVariable Long id){
        return tarefaService.buscarTarefasPorUsuarioId(id);
    }

    //buscar tarefa por id
    // @GetMapping("/{id}")
    // public Tarefa getById(@PathVariable Long id){
    //     return repository.findById(id).orElse(null);
    // }

    //inserir tarefa
    @PostMapping("")
    public ResponseEntity<TarefaResponseDTO> inserir(@Valid @RequestBody TarefaRequestDTO tarefaRequestDTO){
        TarefaResponseDTO tarefaResponseDTO = tarefaService.inserir(tarefaRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(tarefaResponseDTO);
    }

    //editar tarefa
    @PutMapping("/{id}")
    public ResponseEntity<TarefaResponseDTO> atualizar(@PathVariable Long id, @RequestBody TarefaRequestDTO tarefaRequestDTO){
        TarefaResponseDTO tarefaResponseDTO = tarefaService.atualizar(id, tarefaRequestDTO);
        return ResponseEntity.ok(tarefaResponseDTO);
    }


    //excluir tarefa
    @DeleteMapping("/{id}")
    public ResponseEntity<TarefaResponseDTO> excluir(@PathVariable Long id){
       tarefaService.excluir(id);
       return ResponseEntity.noContent().build();
    }

}
