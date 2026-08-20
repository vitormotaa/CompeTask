package br.cefetmg.pp_competask.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "tbcheckin")
public class Checkin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCheckin;

    @Column(length = 255, nullable = false)
    private String descricao;

    @Column(columnDefinition = "TEXT", nullable = true) //vai mudar isso, por enquanto é porque ta usando base 64
    private String foto;

    @Column(length = 255, nullable = false)
    private String fotoPublicId;

    @Column(length = 255, nullable = false)
    private String dataHoraEnvio;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "comunidade_id", nullable = false)
    private Comunidade comunidade;

    @ManyToOne
    @JoinColumn(name = "tarefa_id", nullable = false)
    private Tarefa tarefa;
}
