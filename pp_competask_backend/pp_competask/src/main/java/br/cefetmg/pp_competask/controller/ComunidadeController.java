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

import br.cefetmg.pp_competask.dto.ComunidadeRequestDTO;
import br.cefetmg.pp_competask.dto.ComunidadeResponseDTO;
import br.cefetmg.pp_competask.service.ComunidadeService;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/v1/comunidades")
@CrossOrigin(origins = "http://localhost:8100")
public class ComunidadeController {
    
    @Autowired
    private ComunidadeService comunidadeService;

    //listar todas as comunidades
    @GetMapping("")
    public List<ComunidadeResponseDTO> getAll(){
        return comunidadeService.getAll();
    }

    //listar todas as comunidades publicas
    @GetMapping("/publicas")
    public List<ComunidadeResponseDTO> getAllPublicas(){
        return comunidadeService.getAllPublicas();
    }

    //inserir comunidade
    @PostMapping("")
    public ResponseEntity<ComunidadeResponseDTO> inserir(@Valid @RequestBody ComunidadeRequestDTO comunidadeRequestDTO){
        ComunidadeResponseDTO comunidadeResponseDTO = comunidadeService.inserir(comunidadeRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(comunidadeResponseDTO);
    }

    //editar comunidade
    @PutMapping("/{id}")
    public ResponseEntity<ComunidadeResponseDTO> atualizar(@PathVariable Long id, @RequestBody ComunidadeRequestDTO comunidadeRequestDTO){
        ComunidadeResponseDTO comunidadeResponseDTO = comunidadeService.atualizar(id, comunidadeRequestDTO);
        return ResponseEntity.ok(comunidadeResponseDTO);
    }

    //excluir comunidade
    @DeleteMapping("/{id}")
    public ResponseEntity<ComunidadeResponseDTO> excluir(@PathVariable Long id){
        comunidadeService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
