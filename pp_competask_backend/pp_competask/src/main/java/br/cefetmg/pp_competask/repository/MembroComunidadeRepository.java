package br.cefetmg.pp_competask.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.pp_competask.model.MembroComunidade;

@Repository
public interface MembroComunidadeRepository extends JpaRepository<MembroComunidade, Long> {

    List<MembroComunidade> findByUsuarioIdUsuario(Long idUsuario);

    List<MembroComunidade> findByComunidadeIdComunidade(Long comunidadeId);

    boolean existsByUsuarioIdUsuarioAndComunidadeIdComunidade(Long usuarioId, Long comunidadeId);

    MembroComunidade findByUsuarioIdUsuarioAndComunidadeIdComunidade(Long usuarioId, Long comunidadeId);
}
