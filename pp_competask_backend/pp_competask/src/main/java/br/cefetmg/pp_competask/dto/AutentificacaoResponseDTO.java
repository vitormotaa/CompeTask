package br.cefetmg.pp_competask.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
// @AllArgsConstructor
public class AutentificacaoResponseDTO {

    private String token;
    private String refreshToken;

    public AutentificacaoResponseDTO(String token) {
        this.token = token;
    }

    public AutentificacaoResponseDTO(String token, String refreshToken) {
        this.token = token;
        this.refreshToken = refreshToken;
    }
}
