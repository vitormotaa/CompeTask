package br.cefetmg.pp_competask.dto;

import java.util.List;

import br.cefetmg.pp_competask.model.Comunidade;
import br.cefetmg.pp_competask.model.Comunidade.TipoAcesso;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ComunidadeResponseDTO {
    private long id;
    private String nome;
    private String descricao;
    private TipoAcesso tipoAcesso;
    private String foto;
    private List<MembroComunidadeResponseDTO> membros;

    public ComunidadeResponseDTO(Comunidade comunidade) {
        this.id = comunidade.getIdComunidade();
        this.nome = comunidade.getNome();
        this.descricao = comunidade.getDescricao();
        this.tipoAcesso = comunidade.getTipoAcesso();
        this.foto = comunidade.getFoto();
        if (comunidade.getMembros() != null) {
            this.membros = comunidade.getMembros().stream().map(MembroComunidadeResponseDTO::new).toList();
        }
    }
}
