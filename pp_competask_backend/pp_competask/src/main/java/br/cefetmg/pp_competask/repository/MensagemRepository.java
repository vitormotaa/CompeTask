package br.cefetmg.pp_competask.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.cefetmg.pp_competask.model.Mensagem;

@Repository
public interface MensagemRepository extends JpaRepository<Mensagem, Long> {

    List<Mensagem> findAllByComunidadeIdComunidadeOrderByDataHoraEnvioAsc(Long comunidadeId);

    @Modifying
    @Query("DELETE FROM Mensagem m WHERE m.comunidade.idComunidade = :comunidadeId")
    void excluirPorComunidadeId(@Param("comunidadeId") Long comunidadeId);
}
