package com.postapp.postapp.repositories;

import com.postapp.postapp.dto.LikeResponseDto;
import com.postapp.postapp.entities.Comment;
import com.postapp.postapp.entities.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LikeRepository extends JpaRepository<Like, Long> {
    List<Like> findByUserIdAndPostId(Long userId, Long postId);

    List<Like> findByUserIdAndCommentId(Long userId, Long commentId);

    List<Like> findByPostId(Long postId);

    List<Like> findByCommentId(Long commentId);

    List<Like> findByUserId(Long userId);

    @Query(value = "SELECT 'beğendi', l.post_id, u.avatar, u.username FROM likes l LEFT JOIN user u on l.user_id = u.id WHERE l.post_id IN (:postIds) ORDER BY l.created_at desc limit 10",nativeQuery = true)
    List<Object> findByPostIds(@Param("postIds") List<Long> postIds);

}
