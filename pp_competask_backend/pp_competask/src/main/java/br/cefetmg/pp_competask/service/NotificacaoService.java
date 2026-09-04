package br.cefetmg.pp_competask.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.pp_competask.dto.NotificacaoResponseDTO;
import br.cefetmg.pp_competask.model.MembroComunidade;
import br.cefetmg.pp_competask.model.Notificacao;
import br.cefetmg.pp_competask.model.Tarefa;
import br.cefetmg.pp_competask.repository.MembroComunidadeRepository;
import br.cefetmg.pp_competask.repository.NotificacaoRepository;
import br.cefetmg.pp_competask.repository.TarefaRepository;

@Service
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;
    private final TarefaRepository tarefaRepository;
    private final MembroComunidadeRepository membroComunidadeRepository;

    public NotificacaoService(NotificacaoRepository notificacaoRepository, TarefaRepository tarefaRepository,
            MembroComunidadeRepository membroComunidadeRepository) {
        this.notificacaoRepository = notificacaoRepository;
        this.tarefaRepository = tarefaRepository;
        this.membroComunidadeRepository = membroComunidadeRepository;
    }

    @Scheduled(fixedDelayString = "${competask.notificacoes.intervalo-ms:30000}")
    @Transactional
    public void processarLembretes() {
        LocalDateTime agora = LocalDateTime.now();

        for (Tarefa tarefa : tarefaRepository.findLembretesPendentes()) {
            LocalDateTime lembrete = converterDataHora(tarefa);
            if (lembrete == null || lembrete.isAfter(agora)) {
                continue;
            }

            if (tarefa.getComunidade() == null) {
                criarNotificacao(tarefa, tarefa.getUsuario(), lembrete);
            } else {
                for (MembroComunidade membro : membroComunidadeRepository
                        .findByComunidadeIdComunidade(tarefa.getComunidade().getIdComunidade())) {
                    criarNotificacao(tarefa, membro.getUsuario(), lembrete);
                }
            }

            tarefa.setLembreteNotificada(true);
            tarefaRepository.save(tarefa);
        }
    }

    @Transactional(readOnly = true)
    public List<NotificacaoResponseDTO> listar(Long usuarioId, boolean somenteNaoLidas) {
        List<Notificacao> notificacoes = somenteNaoLidas
                ? notificacaoRepository.findAllByUsuarioIdUsuarioAndLidaFalseOrderByDataHoraDesc(usuarioId)
                : notificacaoRepository.findAllByUsuarioIdUsuarioOrderByDataHoraDesc(usuarioId);
        return notificacoes.stream().map(NotificacaoResponseDTO::new).toList();
    }

    @Transactional
    public NotificacaoResponseDTO marcarComoLida(Long notificacaoId, Long usuarioId) {
        Notificacao notificacao = notificacaoRepository
                .findByIdNotificacaoAndUsuarioIdUsuario(notificacaoId, usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Notificação não encontrada."));
        notificacao.setLida(true);
        return new NotificacaoResponseDTO(notificacaoRepository.save(notificacao));
    }

    private void criarNotificacao(Tarefa tarefa, br.cefetmg.pp_competask.model.Usuario usuario,
            LocalDateTime dataHora) {
        Notificacao notificacao = new Notificacao();
        notificacao.setUsuario(usuario);
        notificacao.setTarefa(tarefa);
        notificacao.setTitulo("Lembrete de tarefa");
        notificacao.setMensagem("Está na hora de realizar a tarefa: " + tarefa.getTitulo());
        notificacao.setDataHora(dataHora);
        notificacao.setLida(false);
        notificacaoRepository.save(notificacao);
    }

    private LocalDateTime converterDataHora(Tarefa tarefa) {
        try {
            LocalDate data = LocalDate.parse(tarefa.getLembreteData());
            LocalTime hora = LocalTime.parse(tarefa.getLembreteHora(), DateTimeFormatter.ISO_TIME);
            return LocalDateTime.of(data, hora);
        } catch (DateTimeParseException ex) {
            return null;
        }
    }
}