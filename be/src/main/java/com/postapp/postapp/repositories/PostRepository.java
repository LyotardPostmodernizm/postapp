package com.postapp.postapp.repositories;

import com.postapp.postapp.entities.Post;
import com.postapp.postapp.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserId(Long userId);
}
