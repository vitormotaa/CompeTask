package br.cefetmg.pp_competask.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
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

import br.cefetmg.pp_competask.model.Tarefa;
import br.cefetmg.pp_competask.repository.TarefaRepository;

@RestController
@RequestMapping("/api/v1/tarefas")
@CrossOrigin(origins = "http://localhost:8100")
public class TarefaController {
    private TarefaRepository repository;

    public TarefaController(TarefaRepository repository){
        this.repository = repository;
    }

    @GetMapping("")
    public List<Tarefa> getAll(){
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Tarefa getById(@PathVariable Long id){
        return repository.findById(id).orElse(null);
    }

    @PostMapping("")
    public Tarefa inserir(@RequestBody Tarefa tarefa){
        tarefa.setIdTarefa(null);
        repository.save(tarefa);
        return tarefa;
    }

    @DeleteMapping("/{id}")
    public Tarefa excluir(@PathVariable Long id){
        Tarefa tarefa = repository.findById(id).orElse(null);
        if (tarefa == null){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Entidade com id " + id + " não encontrada.");
        }
        repository.delete(tarefa);
        return tarefa;
    }

    @PutMapping("")
    public Tarefa alterar(@RequestBody Tarefa tarefa){
        if (tarefa.getIdTarefa() == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id é obrigatório.");
        }
        repository.save(tarefa);
        return tarefa;
    }
}
