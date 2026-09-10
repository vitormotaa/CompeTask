package br.cefetmg.pp_competask.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.pp_competask.dto.MensagemRequestDTO;
import br.cefetmg.pp_competask.dto.MensagemResponseDTO;
import br.cefetmg.pp_competask.model.Comunidade;
import br.cefetmg.pp_competask.model.Mensagem;
import br.cefetmg.pp_competask.model.Usuario;
import br.cefetmg.pp_competask.repository.ComunidadeRepository;
import br.cefetmg.pp_competask.repository.MembroComunidadeRepository;
import br.cefetmg.pp_competask.repository.MensagemRepository;
import br.cefetmg.pp_competask.repository.UsuarioRepository;

@Service
public class MensagemService {

	@Autowired
	private MensagemRepository mensagemRepository;

	@Autowired
	private UsuarioRepository usuarioRepository;

	@Autowired
	private ComunidadeRepository comunidadeRepository;

	@Autowired
	private MembroComunidadeRepository membroComunidadeRepository;

	@Transactional(readOnly = true)
	public List<MensagemResponseDTO> buscarHistoricoPorComunidadeId(Long comunidadeId) {
		List<Mensagem> mensagens = mensagemRepository.findAllByComunidadeIdComunidadeOrderByDataHoraEnvioAsc(comunidadeId);
		return mensagens.stream().map(MensagemResponseDTO::new).toList();
	}

	@Transactional
	public MensagemResponseDTO enviar(MensagemRequestDTO dto) {
		Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
				.orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

		Comunidade comunidade = comunidadeRepository.findById(dto.getComunidadeId())
				.orElseThrow(() -> new IllegalArgumentException("Comunidade não encontrada."));

		boolean membro = membroComunidadeRepository.existsByUsuarioIdUsuarioAndComunidadeIdComunidade(
				dto.getUsuarioId(), dto.getComunidadeId());
		if (!membro) {
			throw new IllegalArgumentException("Usuário não pertence a esta comunidade.");
		}

		Mensagem mensagem = new Mensagem();
		mensagem.setUsuario(usuario);
		mensagem.setComunidade(comunidade);
		mensagem.setConteudo(dto.getConteudo());
		mensagem.setDataHoraEnvio(LocalDateTime.now());

		return new MensagemResponseDTO(mensagemRepository.save(mensagem));
	}
}
