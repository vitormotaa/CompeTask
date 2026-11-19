package br.cefetmg.pp_competask.model;

import java.time.Instant;
import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "tbpush_pendente")
@Getter
@Setter
public class PushPendente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String tokenHash;

    @Column(nullable = false)
    private Long usuarioId;

    @Column(nullable = false)
    private Long tarefaId;

    @Column(nullable = false)
    private LocalDateTime horario;

    @Column(nullable = false)
    private Instant expiraEm;

    @Column(nullable = false)
    private Instant proximaTentativa;
}
