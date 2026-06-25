package br.cefetmg.pp_competask.dto;

import br.cefetmg.pp_competask.model.Usuario;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
public class UsuarioResponseLoginDTO {
    
    private Long idUsuario;
    private String nome;
    private String email;
    private String senha;
    private Integer streak;
    private Boolean ativo; 

    public UsuarioResponseLoginDTO(Usuario usuario){
        this.idUsuario = usuario.getIdUsuario();
        this.nome = usuario.getNome();
        this.email = usuario.getEmail();
        this.senha = usuario.getSenha();
        this.streak = usuario.getStreak();
        this.ativo = usuario.getAtivo();
    }
}
