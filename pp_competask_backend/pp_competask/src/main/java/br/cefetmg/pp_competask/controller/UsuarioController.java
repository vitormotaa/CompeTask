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

import br.cefetmg.pp_competask.model.Usuario;
import br.cefetmg.pp_competask.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/v1/usuarios")
@CrossOrigin(origins = "http://localhost:8100")
public class UsuarioController {

    private UsuarioRepository repository;

    public UsuarioController(UsuarioRepository repository){
        this.repository = repository;
    }

    @GetMapping("")
    public List<Usuario> getAll(){
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Usuario getById(@PathVariable Long id){
        return repository.findById(id).orElse(null);
    }

    @PostMapping("")
    public Usuario inserir(@RequestBody Usuario usuario){
        usuario.setIdUsuario(null);
        repository.save(usuario);
        return usuario;
    }

    @DeleteMapping("/{id}")
    public Usuario excluir(@PathVariable Long id){
        Usuario usuario = repository.findById(id).orElse(null);
        if (usuario == null){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Entidade com id " + id + " não encontrada.");
        }
        repository.delete(usuario);
        return usuario;
    }

    @PutMapping("")
    public Usuario alterar(@RequestBody Usuario usuario){
        if (usuario.getIdUsuario() == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id é obrigatório.");
        }
        repository.save(usuario);
        return usuario;
    }
    

}
