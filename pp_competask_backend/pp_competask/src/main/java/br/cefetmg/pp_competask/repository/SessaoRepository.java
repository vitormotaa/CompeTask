package br.cefetmg.pp_competask.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.cefetmg.pp_competask.model.Sessao;

public interface SessaoRepository extends JpaRepository<Sessao, Long> {
    Optional<Sessao> findByTokenHash(String tokenHash);
    void deleteByTokenHash(String tokenHash);
}
