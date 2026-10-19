package br.cefetmg.pp_competask.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.cefetmg.pp_competask.model.MembroComunidade;

@Repository
public interface MembroComunidadeRepository extends JpaRepository<MembroComunidade, Long> {

    List<MembroComunidade> findByUsuarioIdUsuario(Long idUsuario);

    List<MembroComunidade> findByComunidadeIdComunidade(Long comunidadeId);

    List<MembroComunidade> findByComunidadeIdComunidadeAndAtivoTrue(Long comunidadeId);

    List<MembroComunidade> findByUsuarioIdUsuarioAndAtivoTrue(Long idUsuario);

    boolean existsByUsuarioIdUsuarioAndComunidadeIdComunidade(Long usuarioId, Long comunidadeId);

    MembroComunidade findByUsuarioIdUsuarioAndComunidadeIdComunidade(Long usuarioId, Long comunidadeId);

    boolean existsByUsuarioIdUsuarioAndComunidadeIdComunidadeAndAtivoTrue(Long usuarioId, Long comunidadeId);

    MembroComunidade findByUsuarioIdUsuarioAndComunidadeIdComunidadeAndAtivoTrue(
            Long usuarioId, Long comunidadeId);

    Optional<MembroComunidade> findFirstByUsuarioIdUsuarioAndComunidadeIdComunidadeOrderByIdDesc(
            Long usuarioId, Long comunidadeId);

    @Modifying
    @Query("DELETE FROM MembroComunidade m WHERE m.comunidade.idComunidade = :comunidadeId")
    void excluirPorComunidadeId(@Param("comunidadeId") Long comunidadeId);
}
