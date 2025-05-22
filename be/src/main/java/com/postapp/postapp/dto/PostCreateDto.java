package com.postapp.postapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostCreateDto {
    @NotBlank(message = "Başlık boş olamaz")
    @Size(max = 50, message = "Başlık en fazla 50 karakter olabilir")
    private String title;

    @NotBlank(message = "İçerik boş olamaz")
    @Size(max = 250, message = "İçerik en fazla 250 karakter uzunluğunda olabilir")
    private String content;
}