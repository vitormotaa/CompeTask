package br.cefetmg.pp_competask.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.pp_competask.model.Checkin;

@Repository
public interface CheckinRepository extends JpaRepository<Checkin, Long> {

    boolean existsByUsuarioIdUsuarioAndComunidadeIdComunidadeAndTarefaIdTarefa(Long usuarioId, Long comunidadeId,
            Long tarefaId);

    List<Checkin> findAllByUsuarioIdUsuarioAndComunidadeIdComunidade(Long usuarioId, Long comunidadeId);

    List<Checkin> findAllByComunidadeIdComunidade(Long comunidadeId);
}