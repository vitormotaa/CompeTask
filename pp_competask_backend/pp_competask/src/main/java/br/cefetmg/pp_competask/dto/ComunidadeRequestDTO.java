package br.cefetmg.pp_competask.dto;

import br.cefetmg.pp_competask.model.Comunidade.TipoAcesso;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ComunidadeRequestDTO {
    
    @NotBlank(message = "nome é obrigatório")
    private String nome;

    private String descricao;

    @NotNull(message = "o tipo de acesso é obtigatório")
    private TipoAcesso tipoAcesso;

    private String foto;

    @NotNull(message = "ID do usuário é obrigatório")
    private Long idUsuarioCriador;

}
