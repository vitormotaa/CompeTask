package br.cefetmg.pp_competask.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.pp_competask.model.Sessao;
import br.cefetmg.pp_competask.model.Usuario;
import br.cefetmg.pp_competask.repository.SessaoRepository;
import br.cefetmg.pp_competask.security.JwtService;

class SessaoServiceTest {
    private final SessaoRepository repository = mock(SessaoRepository.class);
    private final JwtService jwt = mock(JwtService.class);
    private final SessaoService service = new SessaoService(repository, jwt);

    @Test
    void criaTokenAleatorioEArmazenaApenasHash() {
        Usuario usuario = new Usuario();
        String token = service.criar(usuario);
        var sessao = org.mockito.ArgumentCaptor.forClass(Sessao.class);
        verify(repository).save(sessao.capture());
        assertNotEquals(token, sessao.getValue().getTokenHash());
        assertEquals(64, sessao.getValue().getTokenHash().length());
        assertSame(usuario, sessao.getValue().getUsuario());
        assertTrue(sessao.getValue().getExpiraEm().isAfter(Instant.now()));
    }

    @Test
    void renovaSomenteSessaoAtivaENaoExpirada() {
        Usuario usuario = new Usuario();
        Sessao sessao = new Sessao();
        sessao.setUsuario(usuario);
        sessao.setExpiraEm(Instant.now().plusSeconds(60));
        when(repository.findByTokenHash(any())).thenReturn(Optional.of(sessao));
        when(jwt.gerarToken(usuario)).thenReturn("jwt");
        assertEquals("jwt", service.renovar("token"));
        sessao.setExpiraEm(Instant.now().minusSeconds(1));
        assertThrows(ResponseStatusException.class, () -> service.renovar("token"));
        sessao.setExpiraEm(Instant.now().plusSeconds(60));
        usuario.setAtivo(false);
        assertThrows(ResponseStatusException.class, () -> service.renovar("token"));
    }
}
