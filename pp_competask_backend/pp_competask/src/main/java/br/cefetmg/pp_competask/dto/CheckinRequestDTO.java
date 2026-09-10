package br.cefetmg.pp_competask.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CheckinRequestDTO {
    
    private String descricao;

    @NotBlank(message = "Foto é obrigatória")
    private String foto;

    @NotBlank(message = "Identificador da foto é obrigatório")
    private String fotoPublicId;

    @NotNull(message = "Data hora envio é obrigatória")
    private LocalDateTime dataHoraEnvio;

    @NotNull(message = "Usuário é obrigatório")
    private Long usuarioId;

    @NotNull(message = "Comunidade é obrigatória")
    private Long comunidadeId;

    @NotNull(message = "Tarefa é obrigatória")
    private Long tarefaId;
}
