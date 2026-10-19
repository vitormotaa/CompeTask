package br.cefetmg.pp_competask.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.cefetmg.pp_competask.model.Notificacao;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    List<Notificacao> findAllByUsuarioIdUsuarioOrderByDataHoraDesc(Long usuarioId);

    List<Notificacao> findAllByUsuarioIdUsuarioAndLidaFalseOrderByDataHoraDesc(Long usuarioId);

    java.util.Optional<Notificacao> findByIdNotificacaoAndUsuarioIdUsuario(Long idNotificacao, Long usuarioId);

    @Modifying
    @Query("DELETE FROM Notificacao n WHERE n.tarefa.idTarefa = :tarefaId AND n.lida = false")
    void excluirPendentesPorTarefaId(@Param("tarefaId") Long tarefaId);

    @Modifying
    @Query("DELETE FROM Notificacao n WHERE n.tarefa.idTarefa = :tarefaId "
            + "AND n.usuario.idUsuario = :usuarioId AND n.lida = false")
    void excluirPendentesPorTarefaEUsuario(
            @Param("tarefaId") Long tarefaId, @Param("usuarioId") Long usuarioId);

    @Modifying
    @Query("DELETE FROM Notificacao n WHERE n.tarefa.idTarefa IN "
            + "(SELECT t.idTarefa FROM Tarefa t WHERE t.comunidade.idComunidade = :comunidadeId)")
    void excluirPorComunidadeId(@Param("comunidadeId") Long comunidadeId);

    @Modifying
    @Query("DELETE FROM Notificacao n WHERE n.usuario.idUsuario = :usuarioId "
            + "AND n.tarefa.idTarefa IN "
            + "(SELECT t.idTarefa FROM Tarefa t WHERE t.comunidade.idComunidade = :comunidadeId) "
            + "AND n.lida = false")
    void excluirPendentesPorUsuarioEComunidade(
            @Param("usuarioId") Long usuarioId, @Param("comunidadeId") Long comunidadeId);
}