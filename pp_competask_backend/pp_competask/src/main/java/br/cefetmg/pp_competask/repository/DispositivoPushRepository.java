package br.cefetmg.pp_competask.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import br.cefetmg.pp_competask.model.DispositivoPush;

public interface DispositivoPushRepository extends JpaRepository<DispositivoPush, String> {
    List<DispositivoPush> findAllByUsuarioIdUsuario(Long usuarioId);
}
