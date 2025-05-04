package com.postapp.postapp.repositories;

import com.postapp.postapp.entities.Comment;
import com.postapp.postapp.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
}
