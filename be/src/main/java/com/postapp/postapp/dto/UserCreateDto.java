package com.postapp.postapp.dto;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Getter
@Setter
public class UserCreateDto {
    @NotBlank(message = "Kullanıcı adı boş olamaz!")
    @Size(min=6, message = "Kullanıcı adı en az 6 karakter uzunluğunda olmalıdır!")
    @Size(max=30,message = "Kullanıcı adı en fazla 30 karakter uzunluğunda olabilir!")
    private String username;

    @NotBlank(message = "Parola boş olamaz!")
    @Size(min = 6, message = "Parola en az 6 karakter uzunluğunda olmalıdır!")
    @Size(max = 20,message = "Parola en fazla 20 karakter uzunluğunda olabilir!")
    private String password;

    private String firstName;
    private String lastName;

    @NotBlank(message = "email boş olamaz!")
    private String email;

    private int avatar;

}