package br.cefetmg.pp_competask.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DispositivoPushDTO(@NotBlank @Size(max = 2048) String token) {}
