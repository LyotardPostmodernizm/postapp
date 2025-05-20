package com.postapp.postapp.repositories;

import com.postapp.postapp.dto.LikeResponseDto;
import com.postapp.postapp.entities.Like;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LikeRepository extends JpaRepository<Like, Long> {
    List<Like> findByUserIdAndPostId(Long userId, Long postId);

    List<Like> findByUserIdAndCommentId(Long userId, Long commentId);

    List<Like> findByPostId(Long postId);

    List<Like> findByCommentId(Long commentId);

    List<Like> findByUserId(Long userId);

}
