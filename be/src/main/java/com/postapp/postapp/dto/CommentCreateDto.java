package com.postapp.postapp.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class CommentCreateDto {
    @NotBlank
    @Size(max = 1000)
    private String text;

    private Long parentCommentId;
}
