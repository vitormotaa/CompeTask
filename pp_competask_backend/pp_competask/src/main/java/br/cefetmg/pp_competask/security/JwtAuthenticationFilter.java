package br.cefetmg.pp_competask.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioDetailsService usuarioDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = TokenUtils.extrairBearer(request.getHeader("Authorization"));

        if (token != null && jwtService.validarToken(token)) {
            try {
                UserDetails usuario = usuarioDetailsService.loadUserByUsername(jwtService.getEmail(token));

                if (usuario.isEnabled()) {
                    SecurityContextHolder.getContext().setAuthentication(
                            new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities()));
                }
            } catch (UsernameNotFoundException e) {
                // token de usuário removido: segue sem autenticação
            }
        }

        filterChain.doFilter(request, response);
    }
}
