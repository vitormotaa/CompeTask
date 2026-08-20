package br.cefetmg.pp_competask.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import br.cefetmg.pp_competask.dto.ImagemUploadDTO;
import jakarta.annotation.PostConstruct;

@Service
public class ImagemService {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret));
    }

    public ImagemUploadDTO salvar(MultipartFile arquivo) throws IOException {
        if (arquivo == null || arquivo.isEmpty()) {
            return null;
        }

        validarImagem(arquivo);

        Map<?, ?> resultado = cloudinary.uploader().upload(arquivo.getBytes(), ObjectUtils.asMap(
                "resource_type", "image",
                "folder", "competask"));

        return new ImagemUploadDTO(
                (String) resultado.get("secure_url"),
                (String) resultado.get("public_id"));
    }

    public void excluir(String publicId) throws IOException {
        if (publicId != null && !publicId.isBlank()) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "image"));
        }
    }

    private void validarImagem(MultipartFile arquivo) {
        String tipo = arquivo.getContentType();
        if (tipo == null || !tipo.startsWith("image/")) {
            throw new IllegalArgumentException("O arquivo enviado deve ser uma imagem.");
        }
    }
}