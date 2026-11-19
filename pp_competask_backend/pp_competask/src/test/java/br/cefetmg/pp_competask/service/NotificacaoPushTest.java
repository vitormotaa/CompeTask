package br.cefetmg.pp_competask.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import br.cefetmg.pp_competask.model.Tarefa;
import br.cefetmg.pp_competask.model.Usuario;
import br.cefetmg.pp_competask.repository.CheckinRepository;
import br.cefetmg.pp_competask.repository.MembroComunidadeRepository;
import br.cefetmg.pp_competask.repository.NotificacaoRepository;
import br.cefetmg.pp_competask.repository.TarefaRepository;

class NotificacaoPushTest {
    @Test
    void enfileiraPushQuandoLembretePessoalEhProcessado() {
        var notificacoes = mock(NotificacaoRepository.class);
        var tarefas = mock(TarefaRepository.class);
        var push = mock(PushService.class);
        var service = new NotificacaoService(notificacoes, tarefas,
                mock(MembroComunidadeRepository.class), mock(CheckinRepository.class), push);
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(4L);
        Tarefa tarefa = new Tarefa();
        tarefa.setIdTarefa(7L);
        tarefa.setUsuario(usuario);
        tarefa.setTitulo("Tarefa");
        tarefa.setLembreteData("2020-01-02");
        tarefa.setLembreteHora("10:30");
        when(tarefas.findLembretesPendentes()).thenReturn(List.of(tarefa));

        service.processarLembretes();

        verify(notificacoes).save(any());
        verify(push).enfileirar(4L, 7L, LocalDateTime.of(2020, 1, 2, 10, 30));
        verify(tarefas).save(tarefa);
    }
}
