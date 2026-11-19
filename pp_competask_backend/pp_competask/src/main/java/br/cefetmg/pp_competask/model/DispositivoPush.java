package br.cefetmg.pp_competask.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "tbdispositivo_push")
@Getter
@Setter
public class DispositivoPush {
    @Id
    @Column(length = 64)
    private String tokenHash;

    @Column(nullable = false, length = 2048)
    private String token;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
