package br.cefetmg.pp_competask.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.pp_competask.dto.ComunidadeRequestDTO;
import br.cefetmg.pp_competask.dto.ComunidadeResponseDTO;
import br.cefetmg.pp_competask.dto.MensagemResponseDTO;
import br.cefetmg.pp_competask.dto.PeriodoRanking;
import br.cefetmg.pp_competask.dto.RankingResponseDTO;
import br.cefetmg.pp_competask.dto.TarefaResponseDTO;
import br.cefetmg.pp_competask.service.CheckinService;
import br.cefetmg.pp_competask.service.ComunidadeService;
import br.cefetmg.pp_competask.service.MensagemService;
import br.cefetmg.pp_competask.service.TarefaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/comunidades")
// @CrossOrigin(origins = "http://localhost:8100")
@CrossOrigin(origins = "*")
@Tag(name = "Comunidades", description = "Endpoints para gerenciamento de comunidades do COMPETASK")
public class ComunidadeController {

    @Autowired
    private ComunidadeService comunidadeService;

    @Autowired
    private TarefaService tarefaService;

    @Autowired
    private CheckinService checkinService;

    @Autowired
    private MensagemService mensagemService;

    // listar todas as comunidades
    @GetMapping("")
    @Operation(summary = "Buscar todas as comunidades", description = "")
    public List<ComunidadeResponseDTO> getAll() {
        return comunidadeService.getAll();
    }

    // listar todas as comunidades publicas
    @GetMapping("/publicas")
    @Operation(summary = "Buscar todas as comunidades públicas", description = "")
    public List<ComunidadeResponseDTO> getAllPublicas() {
        return comunidadeService.getAllPublicas();
    }

    // listar comunidades do usuario logado
    @GetMapping("/usuario/{idUsuario}")
    @Operation(summary = "Buscar todas as comunidades do usuário", description = "")
    public List<ComunidadeResponseDTO> getAllByUsuario(@PathVariable Long idUsuario) {
        return comunidadeService.getAllByUsuario(idUsuario);
    }

    // inserir comunidade
    @PostMapping("")
    @Operation(summary = "Criar comunidade", description = "")
    public ResponseEntity<ComunidadeResponseDTO> inserir(
            @Valid @RequestBody ComunidadeRequestDTO comunidadeRequestDTO) {
        ComunidadeResponseDTO comunidadeResponseDTO = comunidadeService.inserir(comunidadeRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(comunidadeResponseDTO);
    }

    // editar comunidade
    @PutMapping("/{id}")
    @Operation(summary = "Editar comunidade", description = "")
    public ResponseEntity<ComunidadeResponseDTO> atualizar(@PathVariable Long id,
            @RequestBody ComunidadeRequestDTO comunidadeRequestDTO) {
        ComunidadeResponseDTO comunidadeResponseDTO = comunidadeService.atualizar(id, comunidadeRequestDTO);
        return ResponseEntity.ok(comunidadeResponseDTO);
    }

    @PatchMapping("/foto/{id}")
    @Operation(summary = "Atualizar foto da comunidade", description = "")
    public ResponseEntity<ComunidadeResponseDTO> atualizarFoto(@PathVariable Long id,
            @RequestParam(value = "arquivo", required = false) MultipartFile arquivo) {
        try {
            return ResponseEntity.ok(comunidadeService.atualizarFoto(id, arquivo));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível enviar a imagem.");
        }
    }

    // excluir comunidade
    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir comunidade", description = "")
    public ResponseEntity<ComunidadeResponseDTO> excluir(@PathVariable Long id) {
        try {
            comunidadeService.excluir(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível excluir a imagem.");
        }
    }

    // listar todas as tarefas por id da comunidade
    @GetMapping("/{id}/tarefas")
    @Operation(summary = "Buscar tarefas da comunidade por ID", description = "")
    public List<TarefaResponseDTO> getAllByComunidadeId(@PathVariable Long id,
            @RequestParam Long usuarioId) {
        return tarefaService.buscarTarefasPorComunidadeId(id, usuarioId);
    }

    // ranking da comunidade por período (semanal, mensal ou anual)
    @GetMapping("/{id}/ranking")
    @Operation(summary = "Buscar ranking da comunidade por período", description = "")
    public List<RankingResponseDTO> getRanking(@PathVariable Long id, @RequestParam PeriodoRanking periodo) {
        return checkinService.buscarRanking(id, periodo);
    }

    // histórico de mensagens do chat da comunidade
    @GetMapping("/{id}/mensagens")
    @Operation(summary = "Buscar histórico de mensagens do chat da comunidade", description = "")
    public List<MensagemResponseDTO> getMensagens(@PathVariable Long id) {
        return mensagemService.buscarHistoricoPorComunidadeId(id);
    }

    // entrar em comunidades que o usuário não é dono
    @PostMapping("/entrar/{id}")
    @Operation(summary = "Entrar em comunidades públicas", description = "")
    public ResponseEntity<ComunidadeResponseDTO> entrarNaComunidade(@PathVariable Long id,
            @RequestBody Map<String, Long> body) {

        Long usuarioId = body.get("usuarioId");

        if (usuarioId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "usuarioId é obrigatório");
        }

        ComunidadeResponseDTO comunidade = comunidadeService.entrarNaComunidade(id, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(comunidade);
    }

}