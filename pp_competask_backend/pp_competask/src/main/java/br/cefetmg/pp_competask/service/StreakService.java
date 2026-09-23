package br.cefetmg.pp_competask.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.pp_competask.model.Usuario;
import br.cefetmg.pp_competask.repository.UsuarioRepository;

@Service
public class StreakService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // chamado sempre que o usuario conclui uma tarefa propria ou faz checkin em uma tarefa de comunidade
    @Transactional
    public void registrarAtividade(Usuario usuario) {
        LocalDate hoje = LocalDate.now();
        LocalDate ultimaAtividade = usuario.getUltimaAtividadeStreak();

        if (hoje.equals(ultimaAtividade)) {
            return;
        }

        if (ultimaAtividade != null && ultimaAtividade.equals(hoje.minusDays(1))) {
            usuario.setStreak(usuario.getStreak() + 1);
        } else {
            usuario.setStreak(1);
        }

        usuario.setUltimaAtividadeStreak(hoje);
        usuarioRepository.save(usuario);
    }

    // roda logo apos a virada do dia, zerando a streak de quem nao teve atividade no dia anterior
    @Scheduled(cron = "${competask.streak.reset-cron:0 5 0 * * *}")
    @Transactional
    public void resetarStreaksInativas() {
        LocalDate ontem = LocalDate.now().minusDays(1);
        List<Usuario> usuariosParaResetar = usuarioRepository
                .findAllByStreakGreaterThanAndUltimaAtividadeStreakBefore(0, ontem);

        for (Usuario usuario : usuariosParaResetar) {
            usuario.setStreak(0);
        }

        usuarioRepository.saveAll(usuariosParaResetar);
    }
}
