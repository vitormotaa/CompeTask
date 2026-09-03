package br.cefetmg.pp_competask.dto;

import java.time.LocalDateTime;

import br.cefetmg.pp_competask.model.Notificacao;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NotificacaoResponseDTO {

    private Long id;
    private Long tarefaId;
    private String titulo;
    private String mensagem;
    private LocalDateTime dataHora;
    private boolean lida;

    public NotificacaoResponseDTO(Notificacao notificacao) {
        this.id = notificacao.getIdNotificacao();
        this.tarefaId = notificacao.getTarefa().getIdTarefa();
        this.titulo = notificacao.getTitulo();
        this.mensagem = notificacao.getMensagem();
        this.dataHora = notificacao.getDataHora();
        this.lida = notificacao.isLida();
    }
}