package br.cefetmg.pp_competask.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.pp_competask.model.Sessao;
import br.cefetmg.pp_competask.model.Usuario;
import br.cefetmg.pp_competask.repository.SessaoRepository;
import br.cefetmg.pp_competask.security.JwtService;

@Service
public class SessaoService {
    private final SessaoRepository sessoes;
    private final JwtService jwtService;
    private final SecureRandom random = new SecureRandom();

    public SessaoService(SessaoRepository sessoes, JwtService jwtService) {
        this.sessoes = sessoes;
        this.jwtService = jwtService;
    }

    @Transactional
    public String criar(Usuario usuario) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        Sessao sessao = new Sessao();
        sessao.setUsuario(usuario);
        sessao.setTokenHash(hash(token));
        sessao.setExpiraEm(Instant.now().plus(30, ChronoUnit.DAYS));
        sessoes.save(sessao);
        return token;
    }

    @Transactional(readOnly = true)
    public String renovar(String token) {
        Sessao sessao = sessoes.findByTokenHash(hash(token))
                .filter(s -> s.getExpiraEm().isAfter(Instant.now()) && Boolean.TRUE.equals(s.getUsuario().getAtivo()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão expirada."));
        return jwtService.gerarToken(sessao.getUsuario());
    }

    @Transactional
    public void revogar(String token) {
        sessoes.deleteByTokenHash(hash(token));
    }

    private String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 não disponível.", ex);
        }
    }
}
