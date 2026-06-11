package br.cefetmg.pp_competask.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbusuario")

public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;


    @Column(length = 255, nullable = false)
    private String nome;

    @Column(length = 255, nullable = false, unique = true)
    private String email;

    @Column(length = 255, nullable = false)
    private String senha;

    @Column(length = 255, nullable = true)
    private String foto; //na teoria daria pra ja comecar a foto com uma url de imagem padrao (aquele bonequinho la) ai caso o usuario nao bote foto, vai essa padrao e se botar so sobrescreve

    @Column(nullable = false)
    private Integer streak = 0;

    @Column(nullable = false)
    private Boolean ativo = true;
}
