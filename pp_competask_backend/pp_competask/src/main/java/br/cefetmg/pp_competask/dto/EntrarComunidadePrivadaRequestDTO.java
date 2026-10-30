package br.cefetmg.pp_competask.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EntrarComunidadePrivadaRequestDTO {

    @NotBlank(message = "o código da comunidade é obrigatório")
    private String codigo;

    @NotBlank(message = "a senha da comunidade é obrigatória")
    private String senha;
}
