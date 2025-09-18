package com.postapp.postapp.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;


import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
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
    private String password;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")   private String lastName;

    @NotEmpty
    private String email;

    @OneToMany(mappedBy = "user")
    private List<Post> posts;

    @OneToMany(mappedBy = "user")
    private List<Comment> comments;

    @OneToMany(mappedBy = "user")
    private List<Like>likes;


    @Column(name = "created_at", columnDefinition = "DATETIME")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "DATETIME")
    private LocalDateTime updatedAt;


    @PrePersist
    protected void onCreate() {
        ZonedDateTime turkeyTime = ZonedDateTime.now(ZoneId.of("Europe/Istanbul"));
        createdAt = turkeyTime.toLocalDateTime();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        ZonedDateTime turkeyTime = ZonedDateTime.now(ZoneId.of("Europe/Istanbul"));
        updatedAt = turkeyTime.toLocalDateTime();
    }

}
