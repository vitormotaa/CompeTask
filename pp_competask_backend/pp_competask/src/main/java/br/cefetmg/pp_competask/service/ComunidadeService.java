package br.cefetmg.pp_competask.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.cefetmg.pp_competask.dto.ComunidadeRequestDTO;
import br.cefetmg.pp_competask.dto.ComunidadeResponseDTO;
import br.cefetmg.pp_competask.dto.ImagemUploadDTO;
import br.cefetmg.pp_competask.dto.MembroComunidadeResponseDTO;
import br.cefetmg.pp_competask.model.Checkin;
import br.cefetmg.pp_competask.model.Comunidade;
import br.cefetmg.pp_competask.model.MembroComunidade;
import br.cefetmg.pp_competask.model.Usuario;
import br.cefetmg.pp_competask.repository.CheckinRepository;
import br.cefetmg.pp_competask.repository.ComunidadeRepository;
import br.cefetmg.pp_competask.repository.MembroComunidadeRepository;
import br.cefetmg.pp_competask.repository.MensagemRepository;
import br.cefetmg.pp_competask.repository.NotificacaoRepository;
import br.cefetmg.pp_competask.repository.TarefaRepository;
import br.cefetmg.pp_competask.repository.UsuarioRepository;

@Service
public class ComunidadeService {

    private static final String ALFABETO_ACESSO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Autowired
    private ComunidadeRepository comunidadeRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MembroComunidadeRepository membroComunidadeRepository;

    @Autowired
    private CheckinRepository checkinRepository;

    @Autowired
    private MensagemRepository mensagemRepository;

    @Autowired
    private TarefaRepository tarefaRepository;

    @Autowired
    private NotificacaoRepository notificacaoRepository;

    @Autowired
    private ImagemService imagemService;

    @Transactional(readOnly = true)
    public List<ComunidadeResponseDTO> getAll() {
        List<Comunidade> comunidades = comunidadeRepository.findAll();
        return comunidades.stream().map(ComunidadeResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public List<ComunidadeResponseDTO> getAllPublicas() {
        List<Comunidade> comunidades = comunidadeRepository.findByTipoAcesso(Comunidade.TipoAcesso.PUBLICA);
        return comunidades.stream().map(ComunidadeResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public List<ComunidadeResponseDTO> getAllByUsuario(Long idUsuario) {
        List<MembroComunidade> vinculos = membroComunidadeRepository.findByUsuarioIdUsuarioAndAtivoTrue(idUsuario);
        return vinculos.stream()
                .map(MembroComunidade::getComunidade)
                .map(ComunidadeResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MembroComunidadeResponseDTO> listarMembros(Long comunidadeId, Long usuarioId) {
        comunidadeRepository.findById(comunidadeId)
                .orElseThrow(() -> new IllegalArgumentException("Comunidade não encontrada."));

        if (!membroComunidadeRepository
                .existsByUsuarioIdUsuarioAndComunidadeIdComunidadeAndAtivoTrue(usuarioId, comunidadeId)) {
            throw new IllegalStateException("Apenas membros ativos podem consultar os membros da comunidade.");
        }

        return membroComunidadeRepository.findByComunidadeIdComunidadeAndAtivoTrue(comunidadeId).stream()
                .sorted(Comparator.comparing(MembroComunidade::isAdm).reversed()
                        .thenComparing(membro -> membro.getUsuario().getNome(), String.CASE_INSENSITIVE_ORDER))
                .map(MembroComunidadeResponseDTO::new)
                .toList();
    }

    @Transactional
    public ComunidadeResponseDTO inserir(ComunidadeRequestDTO dto) {
        // melhorar o retorno, ta só retornando null se não achar, cadê exceção
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuarioCriador()).orElse(null);
        // cria a comunidade
        Comunidade comunidade = new Comunidade();
        comunidade.setNome(dto.getNome());
        comunidade.setDescricao(dto.getDescricao());
        comunidade.setTipoAcesso(dto.getTipoAcesso());
        comunidade.setFoto(dto.getFoto());
        aplicarAcesso(comunidade);
        comunidade = comunidadeRepository.save(comunidade);
        // vincula o usuario e a comunidade na tabela auxiliar
        MembroComunidade membroComunidade = new MembroComunidade();
        membroComunidade.setComunidade(comunidade);
        membroComunidade.setUsuario(usuario);
        membroComunidade.setAdm(true);
        membroComunidade.setPontuacao(0);
        membroComunidadeRepository.save(membroComunidade);

        comunidade.getMembros().add(membroComunidade);

        return new ComunidadeResponseDTO(comunidade, true);
    }

    // gera código/senha para comunidades privadas e limpa-os para as públicas
    private void aplicarAcesso(Comunidade comunidade) {
        if (comunidade.getTipoAcesso() == Comunidade.TipoAcesso.PRIVADA) {
            if (comunidade.getCodigoAcesso() == null) {
                comunidade.setCodigoAcesso(gerarCodigoUnico());
            }
            if (comunidade.getSenhaAcesso() == null) {
                comunidade.setSenhaAcesso(gerarTextoAleatorio(8));
            }
        } else {
            comunidade.setCodigoAcesso(null);
            comunidade.setSenhaAcesso(null);
        }
    }

    private String gerarCodigoUnico() {
        String codigo;
        do {
            codigo = gerarTextoAleatorio(8);
        } while (comunidadeRepository.existsByCodigoAcesso(codigo));
        return codigo;
    }

    private String gerarTextoAleatorio(int tamanho) {
        StringBuilder sb = new StringBuilder(tamanho);
        for (int i = 0; i < tamanho; i++) {
            sb.append(ALFABETO_ACESSO.charAt(RANDOM.nextInt(ALFABETO_ACESSO.length())));
        }
        return sb.toString();
    }

    @Transactional
    public ComunidadeResponseDTO obterAcesso(Long idComunidade, Long idUsuario) {
        Comunidade comunidade = comunidadeRepository.findById(idComunidade)
                .orElseThrow(() -> new IllegalArgumentException("Comunidade não encontrada."));

        MembroComunidade membro = membroComunidadeRepository
                .findByUsuarioIdUsuarioAndComunidadeIdComunidadeAndAtivoTrue(idUsuario, idComunidade);
        if (membro == null || !membro.isAdm()) {
            throw new IllegalStateException("Apenas o administrador pode consultar o acesso da comunidade.");
        }

        aplicarAcesso(comunidade);
        return new ComunidadeResponseDTO(comunidadeRepository.save(comunidade), true);
    }

    @Transactional
    public ComunidadeResponseDTO entrarEmComunidadePrivada(String codigo, String senha, Long idUsuario) {
        Comunidade comunidade = comunidadeRepository.findByCodigoAcesso(codigo.trim())
                .orElseThrow(() -> new IllegalArgumentException("Código ou senha inválidos."));

        if (comunidade.getTipoAcesso() != Comunidade.TipoAcesso.PRIVADA
                || comunidade.getSenhaAcesso() == null
                || !MessageDigest.isEqual(
                        comunidade.getSenhaAcesso().getBytes(StandardCharsets.UTF_8),
                        senha.trim().getBytes(StandardCharsets.UTF_8))) {
            throw new IllegalArgumentException("Código ou senha inválidos.");
        }

        return vincularUsuario(comunidade, idUsuario);
    }

    @Transactional
    public ComunidadeResponseDTO atualizar(Long id, ComunidadeRequestDTO dto) {
        // ver se existe com esse id
        Comunidade comunidade = comunidadeRepository.findById(id).orElse(null);
        comunidade.setNome(dto.getNome());
        comunidade.setDescricao(dto.getDescricao());
        comunidade.setFoto(dto.getFoto());
        comunidade.setTipoAcesso(dto.getTipoAcesso());
        aplicarAcesso(comunidade);
        // por enquanto não vamos mexer na lista de membros e entrar em comunidade nem
        // nada do tipo

        return new ComunidadeResponseDTO(comunidadeRepository.save(comunidade));

    }

    @Transactional
    public void excluir(Long id) throws IOException {
        Comunidade comunidade = comunidadeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Comunidade não encontrada."));

        List<Checkin> checkins = checkinRepository.findAllByComunidadeIdComunidade(id);
        for (Checkin checkin : checkins) {
            imagemService.excluir(checkin.getFotoPublicId());
        }
        imagemService.excluir(comunidade.getFotoPublicId());

        notificacaoRepository.excluirPorComunidadeId(id);
        checkinRepository.deleteAll(checkins);
        mensagemRepository.excluirPorComunidadeId(id);
        tarefaRepository.excluirPorComunidadeId(id);
        comunidadeRepository.delete(comunidade);
    }

    @Transactional
    public ComunidadeResponseDTO atualizarFoto(Long id, MultipartFile arquivo) throws IOException {
        Comunidade comunidade = comunidadeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Comunidade não encontrada."));

        ImagemUploadDTO imagem = imagemService.salvar(arquivo);
            if (imagem == null) {
                return new ComunidadeResponseDTO(comunidade);
            }

        String fotoPublicIdAnterior = comunidade.getFotoPublicId();

        comunidade.setFoto(imagem.getUrl());
        comunidade.setFotoPublicId(imagem.getPublicId());
        comunidadeRepository.save(comunidade);

        imagemService.excluir(fotoPublicIdAnterior);

        return new ComunidadeResponseDTO(comunidade);
    }

    @Transactional
    public ComunidadeResponseDTO entrarNaComunidade(Long idComunidade, Long idUsuario) {
        Comunidade comunidade = comunidadeRepository.findById(idComunidade)
                .orElseThrow(() -> new IllegalArgumentException("Comunidade não encontrada."));

        if (comunidade.getTipoAcesso() == Comunidade.TipoAcesso.PRIVADA) {
            throw new IllegalStateException("Comunidade privada: informe o código e a senha para entrar.");
        }

        return vincularUsuario(comunidade, idUsuario);
    }

    private ComunidadeResponseDTO vincularUsuario(Comunidade comunidade, Long idUsuario) {
        Long idComunidade = comunidade.getIdComunidade();

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        MembroComunidade membroExistente = membroComunidadeRepository
                .findFirstByUsuarioIdUsuarioAndComunidadeIdComunidadeOrderByIdDesc(idUsuario, idComunidade)
                .orElse(null);
        if (membroExistente != null && membroExistente.isAtivo()) {
            throw new IllegalArgumentException("Usuário já pertence a esta comunidade.");
        }

        MembroComunidade membro = membroExistente == null ? new MembroComunidade() : membroExistente;
        membro.setUsuario(usuario);
        membro.setComunidade(comunidade);
        if (membroExistente == null) {
            membro.setAdm(false);
            membro.setPontuacao(0);
        }
        membro.setAtivo(true);
        membro.setDataSaida(null);

        membroComunidadeRepository.save(membro);

        if (membroExistente == null) {
            comunidade.getMembros().add(membro);
        }

        return new ComunidadeResponseDTO(comunidade);
    }

    @Transactional
    public void sairDaComunidade(Long comunidadeId, Long usuarioId) throws IOException {
        comunidadeRepository.findById(comunidadeId)
                .orElseThrow(() -> new IllegalArgumentException("Comunidade não encontrada."));

        MembroComunidade membro = membroComunidadeRepository
                .findByUsuarioIdUsuarioAndComunidadeIdComunidadeAndAtivoTrue(usuarioId, comunidadeId);
        if (membro == null) {
            throw new IllegalArgumentException("Usuário não pertence a esta comunidade.");
        }
        if (membro.isAdm()) {
            throw new IllegalStateException("O administrador não pode sair da comunidade.");
        }

        List<Checkin> checkins = checkinRepository
                .findAllByUsuarioIdUsuarioAndComunidadeIdComunidade(usuarioId, comunidadeId);
        for (Checkin checkin : checkins) {
            imagemService.excluir(checkin.getFotoPublicId());
        }
        checkinRepository.deleteAll(checkins);
        notificacaoRepository.excluirPendentesPorUsuarioEComunidade(usuarioId, comunidadeId);

        membro.setPontuacao(0);
        membro.setAtivo(false);
        membro.setDataSaida(LocalDateTime.now());
        membroComunidadeRepository.save(membro);
    }
}
