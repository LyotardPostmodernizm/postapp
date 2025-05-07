package com.postapp.postapp.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;

import java.util.List;

@Entity
@Table(name = "user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int avatar;

    @NotEmpty(message = "Kullanıcı adı boş olamaz!")
    private String username;

    @NotEmpty
    @Size(max = 20,message = "Parola en fazla 20 karakter olabilir!")
    private String password;

    private String firstName;
    private String lastName;

    @NotEmpty
    private String email;

    @OneToMany(mappedBy = "user")
    private List<Post> posts;

    @OneToMany(mappedBy = "user")
    private List<Comment> comments;

    @OneToMany(mappedBy = "user")
    private List<Like>likes;




}
