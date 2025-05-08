package com.postapp.postapp.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserResponseDto {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private int commentCount;
    private int likeCount;
    private int postCount;
    private int avatar;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
