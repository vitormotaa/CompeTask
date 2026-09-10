package br.cefetmg.pp_competask.dto;

import java.time.LocalDateTime;

import br.cefetmg.pp_competask.model.Mensagem;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MensagemResponseDTO {

    private Long id;
    private Long usuarioId;
    private String nomeUsuario;
    private Long comunidadeId;
    private String conteudo;
    private LocalDateTime dataHoraEnvio;

    public MensagemResponseDTO(Mensagem mensagem) {
        this.id = mensagem.getIdMensagem();
        this.usuarioId = mensagem.getUsuario().getIdUsuario();
        this.nomeUsuario = mensagem.getUsuario().getNome();
        this.comunidadeId = mensagem.getComunidade().getIdComunidade();
        this.conteudo = mensagem.getConteudo();
        this.dataHoraEnvio = mensagem.getDataHoraEnvio();
    }
}
