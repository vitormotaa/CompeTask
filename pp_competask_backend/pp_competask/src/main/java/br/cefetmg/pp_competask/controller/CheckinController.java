package br.cefetmg.pp_competask.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.pp_competask.dto.CheckinRequestDTO;
import br.cefetmg.pp_competask.dto.CheckinResponseDTO;
import br.cefetmg.pp_competask.dto.ImagemUploadDTO;
import br.cefetmg.pp_competask.service.CheckinService;
import br.cefetmg.pp_competask.service.ImagemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/checkins")
@CrossOrigin(origins = "*")
@Tag(name = "Check-ins", description = "Endpoints para gerenciamento de check-ins do COMPETASK")
public class CheckinController {

	@Autowired
	private CheckinService checkinService;

	@Autowired
	private ImagemService imagemService;

	@GetMapping("/comunidade/{id}")
	@Operation(summary = "Buscar check-ins por comunidade")
	public List<CheckinResponseDTO> getAllByComunidadeId(@PathVariable Long id) {
		return checkinService.buscarCheckinsPorComunidadeId(id);
	}

	@PostMapping("/imagens")
	@Operation(summary = "Enviar imagem para check-in")
	public ResponseEntity<ImagemUploadDTO> enviarImagem(@RequestParam("arquivo") MultipartFile arquivo) {
		try {
			ImagemUploadDTO imagem = imagemService.salvar(arquivo);
			if (imagem == null) {
				throw new IllegalArgumentException("A imagem é obrigatória.");
			}

			return ResponseEntity.status(HttpStatus.CREATED).body(imagem);
		} catch (IllegalArgumentException ex) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
		} catch (IOException ex) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível enviar a imagem.");
		}
	}

	@PostMapping("")
	@Operation(summary = "Criar check-in")
	public ResponseEntity<CheckinResponseDTO> inserir(@RequestBody CheckinRequestDTO checkinRequestDTO) {
		try {
			validarCamposObrigatorios(checkinRequestDTO);
			CheckinResponseDTO checkinResponseDTO = checkinService.inserir(checkinRequestDTO);
			return ResponseEntity.status(HttpStatus.CREATED).body(checkinResponseDTO);
		} catch (IllegalArgumentException ex) {
			excluirImagem(checkinRequestDTO.getFotoPublicId());
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
		} catch (RuntimeException ex) {
			excluirImagem(checkinRequestDTO.getFotoPublicId());
			throw ex;
		}
	}

	@DeleteMapping("/{id}")
	@Operation(summary = "Excluir check-in")
	public ResponseEntity<Void> excluir(@PathVariable Long id) {
		try {
			checkinService.excluir(id);
			return ResponseEntity.noContent().build();
		} catch (IllegalArgumentException ex) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
		} catch (IOException ex) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível excluir a imagem.");
		}
	}

	private void validarCamposObrigatorios(CheckinRequestDTO dto) {
		if (dto.getFoto() == null || dto.getFoto().isBlank()) {
			throw new IllegalArgumentException("Foto é obrigatória");
		}
		if (dto.getFotoPublicId() == null || dto.getFotoPublicId().isBlank()) {
			throw new IllegalArgumentException("Identificador da foto é obrigatório");
		}
		if (dto.getDataHoraEnvio() == null || dto.getDataHoraEnvio().isBlank()) {
			throw new IllegalArgumentException("Data hora envio é obrigatória");
		}
		if (dto.getUsuarioId() == null || dto.getComunidadeId() == null || dto.getTarefaId() == null) {
			throw new IllegalArgumentException("Usuário, comunidade e tarefa são obrigatórios");
		}
	}

	private void excluirImagem(String publicId) {
		try {
			imagemService.excluir(publicId);
		} catch (IOException ex) {
		}
	}
}
