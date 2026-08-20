package br.cefetmg.pp_competask.service;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;

// import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.pp_competask.dto.AutentificacaoRequestDTO;
import br.cefetmg.pp_competask.dto.ImagemUploadDTO;
import br.cefetmg.pp_competask.dto.UsuarioRequestDTO;
import br.cefetmg.pp_competask.dto.UsuarioResponseDTO;
import br.cefetmg.pp_competask.model.Usuario;
import br.cefetmg.pp_competask.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ImagemService imagemService;

    @Transactional
    public UsuarioResponseDTO inserir(UsuarioRequestDTO dto){
        //se nao existir pode criar, se existir e estiver desativado ai tem que ver os role
        if (!usuarioRepository.existsByEmail(dto.getEmail())) {
            Usuario usuario = new Usuario();
            usuario.setAtivo(true);
            usuario.setEmail(dto.getEmail());
            usuario.setFoto(dto.getFoto());
            usuario.setNome(dto.getNome());
            usuario.setStreak(0);
            usuario.setSenha(dto.getSenha());
            return new UsuarioResponseDTO(usuarioRepository.save(usuario));
        }

        throw new IllegalArgumentException("E-mail já cadastrado.");
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO findById(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Usuário não encontrado."));

        if (!usuario.getAtivo()){
            throw new IllegalStateException("Usuário não encontrado.");
        }

        return new UsuarioResponseDTO(usuario);
    }

    @Transactional(readOnly = true)
    public boolean existeEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email);

        if (usuario.getAtivo()){
            return true;
        }else{
            // é aqui que entra a lógica de tipo reativar a conta futuramente 
            return false;
        }
    }

    @Transactional
    public UsuarioResponseDTO login(AutentificacaoRequestDTO dto){
        Usuario usuario = usuarioRepository.findByEmailAndSenha(dto.getEmail(), dto.getSenha());

        if (usuario == null || !usuario.getAtivo()){
            throw new IllegalArgumentException("Email ou senha inválidos.");
        }

        return new UsuarioResponseDTO(usuario);
    }


    @Transactional
    public UsuarioResponseDTO excluir(Long id){
        if (!usuarioRepository.existsById(id)) {
            throw new IllegalArgumentException("Usuario nao encontrado.");
        }

        Usuario usuario = usuarioRepository.findById(id).orElse(null);
        if (usuario.getAtivo()){
            usuario.setAtivo(false);
        }

        return new UsuarioResponseDTO(usuarioRepository.save(usuario));
    }


    @Transactional // -> nao pode alterar email
    public UsuarioResponseDTO alterar(Long id, UsuarioRequestDTO dto){
        Usuario usuario = usuarioRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado."));

        //ver se usuario ta ativo? meio que nao precisa mas adicionaria uma seguranca a mais

        usuario.setFoto(dto.getFoto());
        usuario.setNome(dto.getNome());
        usuario.setSenha(dto.getSenha());

        return new UsuarioResponseDTO(usuarioRepository.save(usuario));

    }

    @Transactional
    public UsuarioResponseDTO atualizarFoto(Long id, MultipartFile arquivo) throws IOException {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado."));

        ImagemUploadDTO imagem = imagemService.salvar(arquivo);
            if (imagem == null) {
                return new UsuarioResponseDTO(usuario);
            }

        String fotoPublicIdAnterior = usuario.getFotoPublicId();

        usuario.setFoto(imagem.getUrl());
        usuario.setFotoPublicId(imagem.getPublicId());
        usuarioRepository.save(usuario);

        imagemService.excluir(fotoPublicIdAnterior);

        return new UsuarioResponseDTO(usuario);
    }
}