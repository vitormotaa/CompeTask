package br.cefetmg.pp_competask.dto;

import br.cefetmg.pp_competask.model.MembroComunidade;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor

public class MembroComunidadeResponseDTO {
    private Long usuarioId;
    private String nomeUsuario;
    private boolean isAdm;
    private int pontuacao;

    public MembroComunidadeResponseDTO(MembroComunidade membro) {
        this.usuarioId = membro.getUsuario().getIdUsuario(); 
        this.nomeUsuario = membro.getUsuario().getNome();
        this.isAdm = membro.isAdm();
        this.pontuacao = membro.getPontuacao();
    }
}
