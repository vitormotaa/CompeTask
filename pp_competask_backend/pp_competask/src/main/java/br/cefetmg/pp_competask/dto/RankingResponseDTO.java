package br.cefetmg.pp_competask.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RankingResponseDTO {

    private Long usuarioId;
    private String nomeUsuario;
    private long pontos;
    private int posicao;
}
