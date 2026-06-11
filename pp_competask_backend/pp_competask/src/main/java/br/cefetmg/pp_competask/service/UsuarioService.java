package br.cefetmg.pp_competask.service;

// import java.util.List;

import org.springframework.stereotype.Service;

import br.cefetmg.pp_competask.model.Usuario;
import br.cefetmg.pp_competask.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public Usuario salvar(Usuario usuario) {
        if (!existeEmail(usuario.getEmail())) {
            return repository.save(usuario);
        }

        throw new IllegalArgumentException("E-mail já cadastrado.");
    }

    // public List<Usuario> listarAtivos() {
    //     return repository.findAll().stream()
    //         .filter(usuario -> Boolean.TRUE.equals(usuario.getAtivo()))
    //         .toList();
    // }

    public Usuario findById(Long id) {
        Usuario usuario = repository.findById(id)
            .orElseThrow(() -> new IllegalStateException("Usuário não encontrado."));

        validarUsuarioAtivo(usuario);

        return usuario;
    }

    public boolean existeEmail(String email) {
        return repository.findAll().stream()
            .anyMatch(usuario -> Boolean.TRUE.equals(usuario.getAtivo()) && email.equals(usuario.getEmail()));
    }

    public Usuario login(String email, String senha) {
        Usuario usuario = repository.findByEmailAndSenha(email, senha);

        validarUsuarioAtivoOuLoginInvalido(usuario);

        return usuario;
    }

    public Usuario alterar(Usuario usuario) {
        if (usuario.getIdUsuario() == null) {
            throw new IllegalArgumentException("id é obrigatório.");
        }

        Usuario existente = repository.findById(usuario.getIdUsuario())
            .orElseThrow(() -> new IllegalStateException("Usuário não encontrado."));

        validarUsuarioAtivo(existente);

        boolean emailEmUsoPorOutroAtivo = repository.findAll().stream()
            .anyMatch(outro -> Boolean.TRUE.equals(outro.getAtivo())
                && !outro.getIdUsuario().equals(usuario.getIdUsuario())
                && usuario.getEmail().equals(outro.getEmail()));

        if (emailEmUsoPorOutroAtivo) {
            throw new IllegalArgumentException("E-mail já cadastrado.");
        }

        existente.setNome(usuario.getNome());
        existente.setEmail(usuario.getEmail());
        existente.setSenha(usuario.getSenha());
        existente.setFoto(usuario.getFoto());
        existente.setStreak(usuario.getStreak());

        return repository.save(existente);
    }

    public Usuario desativar(Long id) {
        Usuario existente = repository.findById(id)
            .orElseThrow(() -> new IllegalStateException("Usuário não encontrado."));

        validarUsuarioAtivo(existente);

        existente.setAtivo(false);

        return repository.save(existente);
    }

    private void validarUsuarioAtivo(Usuario usuario) {
        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new IllegalStateException("Usuário não encontrado.");
        }
    }

    private void validarUsuarioAtivoOuLoginInvalido(Usuario usuario) {
        if (usuario == null || !Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new IllegalArgumentException("E-mail ou senha inválidos.");
        }
    }

}
