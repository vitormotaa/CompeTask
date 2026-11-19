package br.cefetmg.pp_competask.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.time.Instant;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import br.cefetmg.pp_competask.model.DispositivoPush;
import br.cefetmg.pp_competask.model.Usuario;
import br.cefetmg.pp_competask.model.PushPendente;
import br.cefetmg.pp_competask.repository.DispositivoPushRepository;
import br.cefetmg.pp_competask.repository.NotificacaoRepository;
import br.cefetmg.pp_competask.repository.PushPendenteRepository;
import br.cefetmg.pp_competask.repository.UsuarioRepository;

class PushServiceTest {
    private final DispositivoPushRepository dispositivos = mock(DispositivoPushRepository.class);
    private final UsuarioRepository usuarios = mock(UsuarioRepository.class);
    private final FirebaseMessagingProvider provider = mock(FirebaseMessagingProvider.class);
    private final PushPendenteRepository pendentes = mock(PushPendenteRepository.class);
    private final NotificacaoRepository notificacoes = mock(NotificacaoRepository.class);
    private final PushService service = new PushService(dispositivos, usuarios, provider, pendentes, notificacoes);

    @Test
    void associaDispositivoAoUsuarioAutenticado() {
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(5L);
        when(usuarios.findById(5L)).thenReturn(Optional.of(usuario));
        service.registrar(5L, "token-do-dispositivo");
        var registro = org.mockito.ArgumentCaptor.forClass(DispositivoPush.class);
        verify(dispositivos).save(registro.capture());
        assertSame(usuario, registro.getValue().getUsuario());
        assertNotEquals("token-do-dispositivo", registro.getValue().getTokenHash());
    }

    @Test
    void naoRemoveDispositivoDeOutraConta() {
        Usuario outra = new Usuario();
        outra.setIdUsuario(2L);
        DispositivoPush dispositivo = new DispositivoPush();
        dispositivo.setUsuario(outra);
        when(dispositivos.findById(any())).thenReturn(Optional.of(dispositivo));
        service.remover(1L, "token");
        verify(dispositivos, never()).delete(any());
    }

    @Test
    void enfileiraMensagemParaCadaDispositivoDaConta() {
        DispositivoPush dispositivo = new DispositivoPush();
        dispositivo.setTokenHash("hash");
        when(dispositivos.findAllByUsuarioIdUsuario(1L)).thenReturn(List.of(dispositivo));
        service.enfileirar(1L, 3L, LocalDateTime.of(2026, 11, 20, 10, 30));
        var registro = org.mockito.ArgumentCaptor.forClass(PushPendente.class);
        verify(pendentes).save(registro.capture());
        assertEquals(1L, registro.getValue().getUsuarioId());
        assertEquals("hash", registro.getValue().getTokenHash());
    }

    @Test
    void enviaEExcluiLembretePendente() throws Exception {
        FirebaseMessaging messaging = mock(FirebaseMessaging.class);
        when(provider.obter()).thenReturn(messaging);
        DispositivoPush dispositivo = new DispositivoPush();
        dispositivo.setToken("token");
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(1L);
        dispositivo.setUsuario(usuario);
        PushPendente pendente = pendente();
        when(pendentes.findTop100ByProximaTentativaLessThanEqualOrderByProximaTentativaAsc(any()))
                .thenReturn(List.of(pendente));
        when(dispositivos.findById("hash")).thenReturn(Optional.of(dispositivo));
        when(notificacoes.existsByUsuarioIdUsuarioAndTarefaIdTarefaAndDataHoraAndLidaFalse(
                1L, 3L, pendente.getHorario())).thenReturn(true);
        service.processarPendentes();
        verify(messaging).send(any(Message.class));
        verify(pendentes).delete(pendente);
    }

    @Test
    void descartaEnvioQuandoNotificacaoFoiRemovida() throws Exception {
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(1L);
        DispositivoPush dispositivo = new DispositivoPush();
        dispositivo.setUsuario(usuario);
        PushPendente pendente = pendente();
        when(pendentes.findTop100ByProximaTentativaLessThanEqualOrderByProximaTentativaAsc(any()))
                .thenReturn(List.of(pendente));
        when(dispositivos.findById("hash")).thenReturn(Optional.of(dispositivo));
        service.processarPendentes();
        verify(pendentes).delete(pendente);
        verify(provider, never()).obter();
    }

    @Test
    void reagendaQuandoFirebaseEstaIndisponivel() throws Exception {
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(1L);
        DispositivoPush dispositivo = new DispositivoPush();
        dispositivo.setUsuario(usuario);
        dispositivo.setToken("token");
        PushPendente pendente = pendente();
        when(pendentes.findTop100ByProximaTentativaLessThanEqualOrderByProximaTentativaAsc(any()))
                .thenReturn(List.of(pendente));
        when(dispositivos.findById("hash")).thenReturn(Optional.of(dispositivo));
        when(notificacoes.existsByUsuarioIdUsuarioAndTarefaIdTarefaAndDataHoraAndLidaFalse(
                1L, 3L, pendente.getHorario())).thenReturn(true);
        when(provider.obter()).thenThrow(new IOException("Indisponível"));
        service.processarPendentes();
        verify(pendentes).save(pendente);
        verify(pendentes, never()).delete(pendente);
        assertTrue(pendente.getProximaTentativa().isAfter(Instant.now()));
    }

    private PushPendente pendente() {
        PushPendente resultado = new PushPendente();
        resultado.setUsuarioId(1L);
        resultado.setTarefaId(3L);
        resultado.setTokenHash("hash");
        resultado.setHorario(LocalDateTime.of(2026, 11, 20, 10, 30));
        resultado.setExpiraEm(Instant.now().plusSeconds(60));
        return resultado;
    }
}
