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
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbtarefa")

public class Tarefa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTarefa;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(length = 255, nullable = false)
    private String titulo;

    @Column(length = 255, nullable = true)
    private String descricao;

    @Column(nullable = false)
    private int prioridade;

    @Column(length = 255, nullable = true)
    private String dataRealizacao;

    @Column(length = 255, nullable = true)
    private String lembreteData;

    @Column(length = 255, nullable = true)
    private String lembreteHora;

    @Column(length = 255, nullable = true)
    private String tempoExecucao;

    @Column(nullable = false)
    private boolean concluida;

    @Column(length = 255, nullable = true)
    private String dataConfeccao;

}
