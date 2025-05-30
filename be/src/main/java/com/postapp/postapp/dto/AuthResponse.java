package com.postapp.postapp.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String message;
    private Long userId;
}
