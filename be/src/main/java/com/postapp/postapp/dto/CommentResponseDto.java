package com.postapp.postapp.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class CommentResponseDto {
    private Long id;
    private String text;
    private String authorUsername;
    private Long postId;
    private Long parentCommentId;
    private int likeCount;
    private List<CommentResponseDto> children;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}