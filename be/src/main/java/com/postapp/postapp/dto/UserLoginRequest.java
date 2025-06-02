package com.postapp.postapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserLoginRequest {
    @NotBlank(message = "Email boş olamaz!")
    @Email(message = "Lütfen geçerli bir email giriniz!")
    private String email;

    @NotBlank(message = "Şifre boş olamaz!")
    private String password;

}
