package br.cefetmg.pp_competask.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import com.google.firebase.messaging.AndroidConfig;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MessagingErrorCode;

import br.cefetmg.pp_competask.model.DispositivoPush;
import br.cefetmg.pp_competask.model.PushPendente;
import br.cefetmg.pp_competask.repository.DispositivoPushRepository;
import br.cefetmg.pp_competask.repository.NotificacaoRepository;
import br.cefetmg.pp_competask.repository.PushPendenteRepository;
import br.cefetmg.pp_competask.repository.UsuarioRepository;

@Service
public class PushService {
    private static final Logger log = LoggerFactory.getLogger(PushService.class);
    private final DispositivoPushRepository dispositivos;
    private final UsuarioRepository usuarios;
    private final FirebaseMessagingProvider provider;
    private final PushPendenteRepository pendentes;
    private final NotificacaoRepository notificacoes;

    public PushService(DispositivoPushRepository dispositivos, UsuarioRepository usuarios,
            FirebaseMessagingProvider provider, PushPendenteRepository pendentes, NotificacaoRepository notificacoes) {
        this.dispositivos = dispositivos;
        this.usuarios = usuarios;
        this.provider = provider;
        this.pendentes = pendentes;
        this.notificacoes = notificacoes;
    }

    @Transactional
    public void registrar(Long usuarioId, String token) {
        var usuario = usuarios.findById(usuarioId)
                .filter(u -> Boolean.TRUE.equals(u.getAtivo()))
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
        String hash = hash(token);
        DispositivoPush dispositivo = dispositivos.findById(hash).orElseGet(DispositivoPush::new);
        dispositivo.setTokenHash(hash);
        dispositivo.setToken(token);
        dispositivo.setUsuario(usuario);
        dispositivos.save(dispositivo);
    }

    @Transactional
    public void remover(Long usuarioId, String token) {
        dispositivos.findById(hash(token)).filter(d -> d.getUsuario().getIdUsuario().equals(usuarioId))
                .ifPresent(dispositivos::delete);
    }

    @Transactional
    public void enfileirar(Long usuarioId, Long tarefaId, LocalDateTime horario) {
        Instant agora = Instant.now();
        for (DispositivoPush dispositivo : dispositivos.findAllByUsuarioIdUsuario(usuarioId)) {
            PushPendente pendente = new PushPendente();
            pendente.setUsuarioId(usuarioId);
            pendente.setTarefaId(tarefaId);
            pendente.setHorario(horario);
            pendente.setTokenHash(dispositivo.getTokenHash());
            pendente.setProximaTentativa(agora);
            pendente.setExpiraEm(agora.plus(Duration.ofHours(1)));
            pendentes.save(pendente);
        }
    }

    @Scheduled(fixedDelayString = "${competask.notificacoes.push-intervalo-ms:30000}")
    @Transactional
    public void processarPendentes() {
        Instant agora = Instant.now();
        for (PushPendente pendente : pendentes.findTop100ByProximaTentativaLessThanEqualOrderByProximaTentativaAsc(agora)) {
            var dispositivo = dispositivos.findById(pendente.getTokenHash()).orElse(null);
            if (!pendente.getExpiraEm().isAfter(agora) || dispositivo == null
                    || !Boolean.TRUE.equals(dispositivo.getUsuario().getAtivo())
                    || !dispositivo.getUsuario().getIdUsuario().equals(pendente.getUsuarioId())
                    || !notificacoes.existsByUsuarioIdUsuarioAndTarefaIdTarefaAndDataHoraAndLidaFalse(
                            pendente.getUsuarioId(), pendente.getTarefaId(), pendente.getHorario())) {
                pendentes.delete(pendente);
                continue;
            }
            String horario = pendente.getHorario().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
            Message mensagem = Message.builder()
                    .setToken(dispositivo.getToken())
                    .setAndroidConfig(AndroidConfig.builder().setPriority(AndroidConfig.Priority.HIGH)
                            .setTtl(Duration.between(agora, pendente.getExpiraEm()).toMillis()).build())
                    .putData("tipo", "lembrete")
                    .putData("usuarioId", pendente.getUsuarioId().toString())
                    .putData("tarefaId", pendente.getTarefaId().toString())
                    .putData("horario", horario)
                    .build();
            try {
                provider.obter().send(mensagem);
                pendentes.delete(pendente);
            } catch (FirebaseMessagingException ex) {
                if (ex.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                    dispositivos.deleteById(dispositivo.getTokenHash());
                    pendentes.delete(pendente);
                } else {
                    log.error("Falha ao enviar lembrete {} ao Firebase: {}", pendente.getTarefaId(), ex.getMessagingErrorCode());
                    adiar(pendente, agora);
                }
            } catch (IOException | IllegalStateException ex) {
                log.error("Firebase não configurado; o lembrete {} será reenviado.", pendente.getTarefaId(), ex);
                adiar(pendente, agora);
            }
        }
    }

    private void adiar(PushPendente pendente, Instant agora) {
        pendente.setProximaTentativa(agora.plusSeconds(60));
        pendentes.save(pendente);
    }

    private String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 indisponível.", ex);
        }
    }
}
