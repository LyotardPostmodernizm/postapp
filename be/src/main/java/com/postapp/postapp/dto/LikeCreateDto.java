package com.postapp.postapp.dto;

import jakarta.validation.constraints.Null;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LikeCreateDto {
    @Null(message = "Post ID ve Comment ID aynı anda sağlanamaz.")
    private Long postId;

    @Null(message = "Post ID ve Comment ID aynı anda sağlanamaz.")
    private Long commentId;

    private Long userId;

}