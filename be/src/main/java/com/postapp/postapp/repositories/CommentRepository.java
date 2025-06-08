package com.postapp.postapp.repositories;

import com.postapp.postapp.dto.CommentResponseDto;
import com.postapp.postapp.entities.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByUserIdAndPostId(Long userId, Long postId);

    List<Comment> findByUserId(Long userId);

    List<Comment> findByPostId(Long postId);

    @Query(value = "SELECT 'yorum yaptı', c.post_id, u.avatar, u.username FROM comment c LEFT JOIN user u ON u.id = c.user_id WHERE c.post_id IN (:postIds) ORDER BY c.created_at desc limit 10",nativeQuery = true)
    List<Object> findByPostIds(@Param("postIds") List<Long> postIds);
}
