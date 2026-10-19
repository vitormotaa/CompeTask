package br.cefetmg.pp_competask.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
// @AllArgsConstructor
public class AutentificacaoResponseDTO {

    private String token;

    public AutentificacaoResponseDTO(String token) {
        this.token = token;
    }
}
