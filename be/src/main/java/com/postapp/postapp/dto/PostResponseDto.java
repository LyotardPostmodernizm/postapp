package com.postapp.postapp.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class PostResponseDto {
    private Long id;
    private String title;
    private String content;
    private int avatar;
    private String authorUsername;
    private Long userId;
    private int commentCount;
    private List<CommentResponseDto> comments;
    private int likeCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}