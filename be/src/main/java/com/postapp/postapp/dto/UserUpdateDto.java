package com.postapp.postapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateDto {

    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String email;
    private int avatar;
}


