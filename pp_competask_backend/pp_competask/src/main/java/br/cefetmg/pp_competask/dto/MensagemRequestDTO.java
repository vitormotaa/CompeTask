package br.cefetmg.pp_competask.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MensagemRequestDTO {

    @NotNull(message = "Usuário é obrigatório")
    private Long usuarioId;

    @NotNull(message = "Comunidade é obrigatória")
    private Long comunidadeId;

    @NotBlank(message = "Conteúdo é obrigatório")
    private String conteudo;
}
