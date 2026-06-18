package br.cefetmg.pp_competask.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.pp_competask.model.Usuario;
import br.cefetmg.pp_competask.service.UsuarioService;

@RestController
@RequestMapping("/api/v1/usuarios")
@CrossOrigin(origins = "http://localhost:8100")
public class UsuarioController {

    @Autowired
    private UsuarioService service;

    // public UsuarioController(UsuarioRepository repository, UsuarioService service){
    //     this.repository = repository;
    //     this.service = service;
    // }

    // @GetMapping("")
    // public List<Usuario> getAll(){
    //     return service.listarAtivos();
    // }

    @GetMapping("/{id}")
    public Usuario getById(@PathVariable Long id){
        try {
            return service.findById(id);
        } catch (IllegalStateException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
        }
    }

    @GetMapping("/checkEmail")
    public boolean existeEmail(@RequestParam("email") String email){
        return service.existeEmail(email);
    }

    @GetMapping("/login") //deve ser POST com JSON
    public Usuario login(@RequestParam("email") String email,  @RequestParam("senha") String senha){
        try {
            return service.login(email, senha);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, ex.getMessage());
        }
    }

    @PostMapping("")
    public Usuario inserir(@RequestBody Usuario usuario){
        usuario.setIdUsuario(null);
        try {
            return service.salvar(usuario);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, ex.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Usuario excluir(@PathVariable Long id){
        try {
            return service.desativar(id);
        } catch (IllegalStateException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
        }
    }

    @PutMapping("")
    public Usuario alterar(@RequestBody Usuario usuario){
        try {
            return service.alterar(usuario);
        } catch (IllegalStateException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (IllegalArgumentException ex) {
            if ("id é obrigatório.".equals(ex.getMessage())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT, ex.getMessage());
        }
    }


    

}
