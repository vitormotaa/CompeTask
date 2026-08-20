package br.cefetmg.pp_competask.dto;

import br.cefetmg.pp_competask.model.Checkin;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter
@NoArgsConstructor
public class CheckinResponseDTO {

    private Long id;
    private String foto;
    private String descricao;
    private String dataHoraEnvio;
    private Long usuarioId;
    private Long comunidadeId;
    private Long tarefaId;

    public CheckinResponseDTO(Checkin checkin){
        this.id = checkin.getIdCheckin();
        this.foto = checkin.getFoto();
        this.descricao = checkin.getDescricao();
        this.dataHoraEnvio = checkin.getDataHoraEnvio();
        this.usuarioId = checkin.getUsuario().getIdUsuario();
        this.comunidadeId = checkin.getComunidade().getIdComunidade();
        this.tarefaId = checkin.getTarefa().getIdTarefa();
    }
}
