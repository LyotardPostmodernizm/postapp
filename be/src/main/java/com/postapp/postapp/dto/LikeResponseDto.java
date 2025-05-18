package com.postapp.postapp.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class LikeResponseDto {
    private Long id;
    private Long userId;
    private Long postId;
    private Long commentId;
    private LocalDateTime createdAt;
}
