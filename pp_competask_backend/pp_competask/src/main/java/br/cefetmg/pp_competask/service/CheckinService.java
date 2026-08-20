package br.cefetmg.pp_competask.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.pp_competask.dto.CheckinRequestDTO;
import br.cefetmg.pp_competask.dto.CheckinResponseDTO;
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
public class CheckinService {

	@Autowired
	private CheckinRepository checkinRepository;

	@Autowired
	private UsuarioRepository usuarioRepository;

	@Autowired
	private ComunidadeRepository comunidadeRepository;

	@Autowired
	private TarefaRepository tarefaRepository;

	@Autowired
	private MembroComunidadeRepository membroComunidadeRepository;

	@Transactional(readOnly = true)
	public List<CheckinResponseDTO> buscarCheckinsPorComunidadeId(Long id) {
		List<Checkin> checkins = checkinRepository.findAllByComunidadeIdComunidade(id);
		return checkins.stream().map(CheckinResponseDTO::new).toList();
	}

	@Transactional
	public CheckinResponseDTO inserir(CheckinRequestDTO dto) {
		Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
				.orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

		Comunidade comunidade = comunidadeRepository.findById(dto.getComunidadeId())
				.orElseThrow(() -> new IllegalArgumentException("Comunidade não encontrada."));

		Tarefa tarefa = tarefaRepository.findById(dto.getTarefaId())
				.orElseThrow(() -> new IllegalArgumentException("Tarefa não encontrada."));

		if (tarefa.getComunidade() == null
				|| !tarefa.getComunidade().getIdComunidade().equals(comunidade.getIdComunidade())) {
			throw new IllegalArgumentException("A tarefa não pertence a esta comunidade.");
		}

		MembroComunidade membroComunidade = membroComunidadeRepository
				.findByUsuarioIdUsuarioAndComunidadeIdComunidade(dto.getUsuarioId(), dto.getComunidadeId());

		if (membroComunidade == null) {
			throw new IllegalArgumentException("Usuário não pertence a esta comunidade.");
		}

		if (checkinRepository.existsByUsuarioIdUsuarioAndComunidadeIdComunidadeAndTarefaIdTarefa(
				dto.getUsuarioId(), dto.getComunidadeId(), dto.getTarefaId())) {
			throw new IllegalArgumentException("O usuário já realizou check-in nesta tarefa.");
		}

		Checkin checkin = new Checkin();
		checkin.setDescricao(dto.getDescricao());
		checkin.setFoto(dto.getFoto());
		checkin.setDataHoraEnvio(dto.getDataHoraEnvio());
		checkin.setUsuario(usuario);
		checkin.setComunidade(comunidade);
		checkin.setTarefa(tarefa);

		membroComunidade.setPontuacao(membroComunidade.getPontuacao() + 1);
		membroComunidadeRepository.save(membroComunidade);

		return new CheckinResponseDTO(checkinRepository.save(checkin));
	}

	@Transactional
	public void excluir(Long id) {
		Checkin checkin = checkinRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Check-in não encontrado."));

		MembroComunidade membroComunidade = membroComunidadeRepository
				.findByUsuarioIdUsuarioAndComunidadeIdComunidade(
						checkin.getUsuario().getIdUsuario(),
						checkin.getComunidade().getIdComunidade());

		if (membroComunidade == null) {
			throw new IllegalArgumentException("Membro da comunidade não encontrado.");
		}

		membroComunidade.setPontuacao(membroComunidade.getPontuacao() - 1);
		membroComunidadeRepository.save(membroComunidade);
		checkinRepository.delete(checkin);
	}
}
