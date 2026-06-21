package br.cefetmg.pp_competask.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.pp_competask.dto.ComunidadeRequestDTO;
import br.cefetmg.pp_competask.dto.ComunidadeResponseDTO;
import br.cefetmg.pp_competask.model.Comunidade;
import br.cefetmg.pp_competask.model.MembroComunidade;
import br.cefetmg.pp_competask.model.Usuario;
import br.cefetmg.pp_competask.repository.ComunidadeRepository;
import br.cefetmg.pp_competask.repository.MembroComunidadeRepository;
import br.cefetmg.pp_competask.repository.UsuarioRepository;

@Service
public class ComunidadeService {

    @Autowired
    private ComunidadeRepository comunidadeRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MembroComunidadeRepository membroComunidadeRepository;

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

    @Transactional
    public ComunidadeResponseDTO inserir(ComunidadeRequestDTO dto){
        //melhorar o retorno, ta so retornando null se nao achar, cade excessao
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuarioCriador()).orElse(null);
        //cria a comunidade
        Comunidade comunidade = new Comunidade();
        comunidade.setNome(dto.getNome());
        comunidade.setDescricao(dto.getDescricao());
        comunidade.setTipoAcesso(dto.getTipoAcesso());
        comunidade.setFoto(dto.getFoto());
        comunidade = comunidadeRepository.save(comunidade);
        //vincula o usuario e a comunidade na tabela auxiliar
        MembroComunidade membroComunidade = new MembroComunidade();
        membroComunidade.setComunidade(comunidade);
        membroComunidade.setUsuario(usuario);
        membroComunidade.setAdm(true);
        membroComunidade.setPontuacao(0);
        membroComunidadeRepository.save(membroComunidade);

        comunidade.getMembros().add(membroComunidade);

        return new ComunidadeResponseDTO(comunidade);
    }

    @Transactional
    public ComunidadeResponseDTO atualizar(Long id, ComunidadeRequestDTO dto){
        //ver se existe com esse id
        Comunidade comunidade = comunidadeRepository.findById(id).orElse(null);
        comunidade.setNome(dto.getNome());
        comunidade.setDescricao(dto.getDescricao());
        comunidade.setFoto(dto.getFoto());
        comunidade.setTipoAcesso(dto.getTipoAcesso());
        // comunidade.setMembros(null); 
        //por enquanto nao vamos mexer na lista de membros e entrar em comunidade nem nada do tipo

        return new ComunidadeResponseDTO(comunidadeRepository.save(comunidade));

    }

    @Transactional
    public void excluir(Long id){
        //verificar se existe ai madna excluir
        comunidadeRepository.deleteById(id);
    }
}
