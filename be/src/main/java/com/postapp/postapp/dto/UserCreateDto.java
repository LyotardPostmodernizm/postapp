package com.postapp.postapp.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Getter
@Setter
public class UserCreateDto {
    @NotBlank(message = "Kullanıcı adı boş olamaz!")
    private String username;

    @NotBlank(message = "Parola boş olamaz!")
    @Size(min = 6, message = "Parola en az 6 karakter olmalıdır!")
    private String password;

    private String firstName;
    private String lastName;

    @NotBlank(message = "email boş olamaz!")
    private String email;

    private int avatar;

}