package br.cefetmg.pp_competask.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import br.cefetmg.pp_competask.model.Tarefa;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    List<Tarefa> findAllByUsuarioIdUsuario(Long id);

    List<Tarefa> findAllByUsuarioIdUsuarioAndInComunidadeFalse(Long id);

    List<Tarefa> findAllByComunidadeIdComunidade(Long id);

    @Query("SELECT t FROM Tarefa t WHERE t.lembreteData IS NOT NULL AND t.lembreteHora IS NOT NULL "
            + "AND (t.lembreteNotificada IS NULL OR t.lembreteNotificada = false) AND t.concluida = false")
    List<Tarefa> findLembretesPendentes();
} 
