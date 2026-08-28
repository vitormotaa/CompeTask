package br.cefetmg.pp_competask.service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.pp_competask.dto.TarefaRequestDTO;
import br.cefetmg.pp_competask.dto.TarefaResponseDTO;
import br.cefetmg.pp_competask.model.Checkin;
import br.cefetmg.pp_competask.model.Comunidade;
import br.cefetmg.pp_competask.model.MembroComunidade;
import br.cefetmg.pp_competask.model.Tarefa;
import br.cefetmg.pp_competask.model.Usuario;
import br.cefetmg.pp_competask.repository.CheckinRepository;
import br.cefetmg.pp_competask.repository.ComunidadeRepository;
import br.cefetmg.pp_competask.repository.MembroComunidadeRepository;
import br.cefetmg.pp_competask.repository.TarefaRepository;
import br.cefetmg.pp_competask.repository.UsuarioRepository;

@Service
public class TarefaService {

    @Autowired
    private TarefaRepository tarefaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ComunidadeRepository comunidadeRepository;

    @Autowired
    private MembroComunidadeRepository membroComunidadeRepository;

    @Autowired
    private CheckinRepository checkinRepository;

    @Transactional(readOnly = true)
    public List<TarefaResponseDTO> buscarTarefasPorUsuarioId(Long id) {
        List<Tarefa> tarefas = tarefaRepository.findAllByUsuarioIdUsuarioAndInComunidadeFalse(id);
        return tarefas.stream().map(TarefaResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public TarefaResponseDTO buscarPorId(Long id) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarefa nao encontrada."));

        return new TarefaResponseDTO(tarefa);
    }

    @Transactional
    public TarefaResponseDTO inserir(TarefaRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado. Faca login novamente."));

        Tarefa tarefa = new Tarefa();
        tarefa.setUsuario(usuario);
        tarefa.setTitulo(dto.getTitulo());
        tarefa.setDescricao(dto.getDescricao());
        tarefa.setPrioridade(dto.getPrioridade());
        tarefa.setDataRealizacao(dto.getDataRealizacao());
        tarefa.setLembreteData(dto.getLembreteData());
        tarefa.setLembreteHora(dto.getLembreteHora());
        tarefa.setTempoExecucao(dto.getTempoExecucao());
        tarefa.setConcluida(false);
        tarefa.setDataConfeccao(null);

        return new TarefaResponseDTO(tarefaRepository.save(tarefa));
    }

    @Transactional
    public TarefaResponseDTO atualizar(Long id, TarefaRequestDTO dto) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarefa nao encontrada."));

        if (tarefa.isInComunidade()) {
            validarAdministrador(dto.getUsuarioId(), tarefa.getComunidade().getIdComunidade());
        }

        tarefa.setTitulo(dto.getTitulo());
        tarefa.setDescricao(dto.getDescricao());
        tarefa.setPrioridade(dto.getPrioridade());
        tarefa.setDataRealizacao(dto.getDataRealizacao());
        tarefa.setLembreteData(dto.getLembreteData());
        tarefa.setLembreteHora(dto.getLembreteHora());
        tarefa.setTempoExecucao(dto.getTempoExecucao());

        if (dto.getConcluida() != null) {
            tarefa.setConcluida(dto.getConcluida());

            if (dto.getConcluida()) {
                tarefa.setDataConfeccao(LocalDate.now().toString());
            } else {
                tarefa.setDataConfeccao(null);
            }
        }

        return new TarefaResponseDTO(tarefaRepository.save(tarefa));
    }

    @Transactional
    public void excluir(Long id) {
        // verificar se existe pra ai mandar excluir
        if (!tarefaRepository.existsById(id)) {
            throw new IllegalArgumentException("Tarefa nao encontrada.");
        }

        tarefaRepository.deleteById(id);
    }

    @Transactional
    public TarefaResponseDTO alterarConclusao(Long id, Long usuarioId) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarefa nao encontrada."));

        if (tarefa.isInComunidade()) {
            validarAdministrador(usuarioId, tarefa.getComunidade().getIdComunidade());
        } else if (tarefa.getUsuario() == null
                || !tarefa.getUsuario().getIdUsuario().equals(usuarioId)) {
            throw new IllegalArgumentException(
                    "Apenas o proprietário pode concluir esta tarefa.");
        }

        tarefa.setConcluida(!tarefa.isConcluida());
        tarefa.setDataConfeccao(
                tarefa.isConcluida() ? LocalDate.now().toString() : null);

        return new TarefaResponseDTO(tarefaRepository.save(tarefa));
    }

    @Transactional
    public TarefaResponseDTO timerTarefa(Long id, String tempoExecucao) {
        if (!tarefaRepository.existsById(id)) {
            throw new IllegalArgumentException("Tarefa nao encontrada.");
        }

        Tarefa tarefa = tarefaRepository.findById(id).orElse(null);
        tarefa.setTempoExecucao(tempoExecucao);

        return new TarefaResponseDTO(tarefaRepository.save(tarefa));
    }

    @Transactional
    public TarefaResponseDTO inserirNaComunidade(TarefaRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado. Faca login novamente."));

        Comunidade comunidade = comunidadeRepository.findById(dto.getComunidadeId())
                .orElseThrow(() -> new IllegalArgumentException("Comunidade não encontrada"));

        MembroComunidade membroComunidade = membroComunidadeRepository
                .findByUsuarioIdUsuarioAndComunidadeIdComunidade(dto.getUsuarioId(), dto.getComunidadeId());

        if (membroComunidade == null) {
            throw new IllegalArgumentException("Usuário não pertence a esta comunidade.");
        }

        if (!membroComunidade.isAdm()) {
            throw new IllegalArgumentException("Apenas administradores podem criar tarefas na comunidade.");
        }

        Tarefa tarefa = new Tarefa();
        tarefa.setUsuario(usuario);
        tarefa.setTitulo(dto.getTitulo());
        tarefa.setDescricao(dto.getDescricao());
        tarefa.setPrioridade(dto.getPrioridade());
        tarefa.setDataRealizacao(dto.getDataRealizacao());
        tarefa.setLembreteData(dto.getLembreteData());
        tarefa.setLembreteHora(dto.getLembreteHora());
        tarefa.setTempoExecucao(dto.getTempoExecucao());
        tarefa.setConcluida(false);
        tarefa.setDataConfeccao(null);
        tarefa.setInComunidade(true);
        tarefa.setComunidade(comunidade);

        return new TarefaResponseDTO(tarefaRepository.save(tarefa));
    }

    @Transactional(readOnly = true)
    public List<TarefaResponseDTO> buscarTarefasPorComunidadeId(Long comunidadeId, Long usuarioId) {
        List<Tarefa> tarefas = tarefaRepository.findAllByComunidadeIdComunidade(comunidadeId);
        Set<Long> tarefasComCheckin = new HashSet<>();

        for (Checkin checkin : checkinRepository
                .findAllByUsuarioIdUsuarioAndComunidadeIdComunidade(usuarioId, comunidadeId)) {
            tarefasComCheckin.add(checkin.getTarefa().getIdTarefa());
        }

        return tarefas.stream().map(tarefa -> {
            TarefaResponseDTO dto = new TarefaResponseDTO(tarefa);
            dto.setConcluidaPeloUsuario(
                    tarefa.isConcluida() || tarefasComCheckin.contains(tarefa.getIdTarefa()));
            return dto;
        }).toList();
    }

    private void validarAdministrador(Long usuarioId, Long comunidadeId) {
        MembroComunidade membro = membroComunidadeRepository
                .findByUsuarioIdUsuarioAndComunidadeIdComunidade(usuarioId, comunidadeId);

        if (membro == null || !membro.isAdm()) {
            throw new IllegalArgumentException(
                    "Apenas administradores podem editar ou concluir tarefas da comunidade.");
        }
    }
}