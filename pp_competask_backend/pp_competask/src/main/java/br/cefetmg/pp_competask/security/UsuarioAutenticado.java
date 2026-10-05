package br.cefetmg.pp_competask.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import br.cefetmg.pp_competask.model.Usuario;

public class UsuarioAutenticado implements UserDetails {

    private final Long id;
    private final String email;
    private final String senha;
    private final boolean ativo;

    public UsuarioAutenticado(Usuario usuario) {
        this.id = usuario.getIdUsuario();
        this.email = usuario.getEmail();
        this.senha = usuario.getSenha();
        this.ativo = Boolean.TRUE.equals(usuario.getAtivo());
    }

    public Long getId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("USUARIO"));
    }

    @Override
    public String getPassword() {
        return senha;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isEnabled() {
        return ativo;
    }
}
