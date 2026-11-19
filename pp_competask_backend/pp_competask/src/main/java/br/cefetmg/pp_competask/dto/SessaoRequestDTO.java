package br.cefetmg.pp_competask.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SessaoRequestDTO(@NotBlank @Size(max = 256) String refreshToken) {}
