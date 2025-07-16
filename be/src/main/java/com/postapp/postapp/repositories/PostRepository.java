package com.postapp.postapp.repositories;

import com.postapp.postapp.entities.Post;
import com.postapp.postapp.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserId(Long userId);

    @Query(value = "SELECT id FROM post WHERE user_id = :userId ORDER BY created_at desc limit 10",nativeQuery = true)
    List<Long> findTop10ByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT p FROM Post p ORDER BY p.createdAt DESC")
    List<Post> findAllPostsOrderByCreatedAtDesc();

    @Query("SELECT p FROM Post p WHERE p.user.id = :userId ORDER BY p.createdAt DESC")
    List<Post> findPostsByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

}
