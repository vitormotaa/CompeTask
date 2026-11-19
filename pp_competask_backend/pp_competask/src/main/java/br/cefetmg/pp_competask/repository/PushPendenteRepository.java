package br.cefetmg.pp_competask.repository;

import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import br.cefetmg.pp_competask.model.PushPendente;

public interface PushPendenteRepository extends JpaRepository<PushPendente, Long> {
    List<PushPendente> findTop100ByProximaTentativaLessThanEqualOrderByProximaTentativaAsc(Instant instante);
}
