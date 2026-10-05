package br.cefetmg.pp_competask.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TarefaRequestDTO {
    
    private Long usuarioId;

    @NotBlank(message = "O título é obrigatório")
    private String titulo;

    private String descricao;

    @NotNull(message = "A prioridade é obrigatória")
    private int prioridade;

    private String dataRealizacao;

    private String lembreteData;

    private String lembreteHora;

    private String tempoExecucao;

    private Boolean concluida;

    private String dataConfeccao;

    private Long comunidadeId;

    private Boolean inComunidade;
}