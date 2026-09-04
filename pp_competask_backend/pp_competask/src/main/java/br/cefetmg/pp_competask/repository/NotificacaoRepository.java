package br.cefetmg.pp_competask.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.pp_competask.model.Notificacao;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    List<Notificacao> findAllByUsuarioIdUsuarioOrderByDataHoraDesc(Long usuarioId);

    List<Notificacao> findAllByUsuarioIdUsuarioAndLidaFalseOrderByDataHoraDesc(Long usuarioId);

    java.util.Optional<Notificacao> findByIdNotificacaoAndUsuarioIdUsuario(Long idNotificacao, Long usuarioId);
}