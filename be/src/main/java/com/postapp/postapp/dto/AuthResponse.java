package com.postapp.postapp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponse {
    private String message;
    private Long userId;
    String accessToken;
    String refreshToken;
}
