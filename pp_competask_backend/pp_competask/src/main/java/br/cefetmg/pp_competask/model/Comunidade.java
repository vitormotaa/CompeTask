package br.cefetmg.pp_competask.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import jakarta.persistence.Table;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "tbcomunidade")

public class Comunidade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idComunidade;

    @Column(length = 255, nullable = false)
    private String nome;

    @Column(length = 255, nullable = true)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(name = "acesso", nullable = false, length = 20)
    private TipoAcesso tipoAcesso; 

    @Column(length = 255, nullable = true)
    private String foto;

    @OneToMany(mappedBy = "comunidade", cascade = CascadeType.ALL)
    private List<MembroComunidade> membros = new ArrayList<>();

    
    public enum TipoAcesso {
        PUBLICA("Pública"),
        PRIVADA("Privada");

        private final String descricao;

        TipoAcesso(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

}
