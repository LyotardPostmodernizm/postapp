package com.postapp.postapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class CommentCreateDto {
    @NotBlank
    @Size(max = 250)
    private String text;
}
