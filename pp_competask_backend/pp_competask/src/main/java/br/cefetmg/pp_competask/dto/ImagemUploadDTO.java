package br.cefetmg.pp_competask.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ImagemUploadDTO {

    private String url;
    private String publicId;
}