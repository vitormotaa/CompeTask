package br.cefetmg.pp_competask.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.pp_competask.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository <Usuario, Long> {

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdUsuarioNot(String email, Long idUsuario);

    Usuario findByEmailAndSenha(String email, String senha);

    Usuario findByEmail(String email);

    Usuario findByIdUsuario(Long id);

    List<Usuario> findAllByStreakGreaterThanAndUltimaAtividadeStreakBefore(Integer streak, LocalDate data);
}
