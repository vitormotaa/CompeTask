package br.cefetmg.pp_competask.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.pp_competask.model.Comunidade;
import br.cefetmg.pp_competask.model.Comunidade.TipoAcesso;

@Repository
public interface ComunidadeRepository extends JpaRepository<Comunidade, Long>{

    List<Comunidade> findByTipoAcesso(TipoAcesso tipoAcesso);
} 