package br.cefetmg.pp_competask.security;

import java.security.Principal;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class UsuarioLogado {

    private UsuarioLogado() {
    }

    public static Long getId() {
        return getId(SecurityContextHolder.getContext().getAuthentication());
    }

    public static Long getId(Principal principal) {
        if (principal instanceof Authentication authentication
                && authentication.getPrincipal() instanceof UsuarioAutenticado usuario) {
            return usuario.getId();
        }
        throw new IllegalStateException("Usuário não autenticado.");
    }
}
