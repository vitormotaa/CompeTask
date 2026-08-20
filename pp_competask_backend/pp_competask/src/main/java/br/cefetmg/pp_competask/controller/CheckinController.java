package br.cefetmg.pp_competask.controller;

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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.pp_competask.dto.CheckinRequestDTO;
import br.cefetmg.pp_competask.dto.CheckinResponseDTO;
import br.cefetmg.pp_competask.service.CheckinService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/checkins")
@CrossOrigin(origins = "*")
@Tag(name = "Check-ins", description = "Endpoints para gerenciamento de check-ins do COMPETASK")
public class CheckinController {

	@Autowired
	private CheckinService checkinService;

	@GetMapping("/comunidade/{id}")
	@Operation(summary = "Buscar check-ins por comunidade")
	public List<CheckinResponseDTO> getAllByComunidadeId(@PathVariable Long id) {
		return checkinService.buscarCheckinsPorComunidadeId(id);
	}

	@PostMapping("")
	@Operation(summary = "Criar check-in")
	public ResponseEntity<CheckinResponseDTO> inserir(@Valid @RequestBody CheckinRequestDTO checkinRequestDTO) {
		try {
			CheckinResponseDTO checkinResponseDTO = checkinService.inserir(checkinRequestDTO);
			return ResponseEntity.status(HttpStatus.CREATED).body(checkinResponseDTO);
		} catch (IllegalArgumentException ex) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
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
		}
	}
}
