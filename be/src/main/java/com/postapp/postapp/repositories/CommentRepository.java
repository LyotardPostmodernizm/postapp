package com.postapp.postapp.repositories;

import com.postapp.postapp.dto.CommentResponseDto;
import com.postapp.postapp.entities.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostId(Long postId);


    @Query("SELECT DISTINCT c FROM Comment c " +
            "LEFT JOIN FETCH c.user u " +
            "WHERE c.post.id = :postId AND c.parent IS NULL " +
            "ORDER BY c.createdAt ASC")
    List<Comment> findByPostIdAndParentIsNull(@Param("postId") Long postId);



    @Query("SELECT c FROM Comment c WHERE c.post.id = :postId AND c.parent IS NULL ORDER BY c.createdAt ASC")
    List<Comment> findByPostIdAndParentIsNullOrderByCreatedAtAsc(@Param("postId") Long postId);


    @Query("SELECT c FROM Comment c WHERE c.post.id = :postId AND c.parent.id = :parentId ORDER BY c.createdAt ASC")
    List<Comment> findByPostIdAndParentId(@Param("postId") Long postId, @Param("parentId") Long parentId);


    List<Comment> findByUserId(Long userId);


    @Query("SELECT c FROM Comment c WHERE c.user.id = :userId AND c.post.id = :postId")
    List<Comment> findByUserIdAndPostId(@Param("userId") Long userId, @Param("postId") Long postId);


    List<Comment> findByParentId(Long parentId);


    void deleteByIdAndUserId(Long commentId, Long userId);


    void deleteByPostId(Long postId);


    void deleteByUserId(Long userId);


    int countByPostId(Long postId);


    int countByUserId(Long userId);


    int countByParentId(Long parentId);


    @Query("SELECT COUNT(c) FROM Comment c WHERE c.post.id = :postId AND c.parent IS NULL")
    int countByPostIdAndParentIsNull(@Param("postId") Long postId);


    boolean existsByIdAndUserId(Long commentId, Long userId);


    @Query("SELECT COUNT(c) > 0 FROM Comment c WHERE c.id = :commentId AND c.user.id = :userId")
    boolean existsByCommentIdAndUserId(@Param("commentId") Long commentId, @Param("userId") Long userId);


    @Query("SELECT DISTINCT c FROM Comment c " +
            "LEFT JOIN FETCH c.user u " +
            "LEFT JOIN FETCH c.likes l " +
            "WHERE c.post.id = :postId AND c.parent IS NULL " +
            "ORDER BY c.createdAt ASC")
    List<Comment> findHierarchicalCommentsByPostId(@Param("postId") Long postId);

    @Query("SELECT DISTINCT c FROM Comment c " +
            "LEFT JOIN FETCH c.user u " +
            "LEFT JOIN FETCH c.likes l " +
            "WHERE c.parent.id = :parentId " +
            "ORDER BY c.createdAt ASC")
    List<Comment> findRepliesWithChildren(@Param("parentId") Long parentId);


    @Query("SELECT c FROM Comment c WHERE c.parent.id = :parentId ORDER BY c.createdAt ASC")
    List<Comment> findAllRepliesByParentId(@Param("parentId") Long parentId);


    @Query("SELECT c FROM Comment c WHERE c.post.id = :postId ORDER BY c.createdAt DESC")
    List<Comment> findLatestCommentsByPostId(@Param("postId") Long postId);


    @Query("SELECT c FROM Comment c WHERE c.post.id = :postId ORDER BY SIZE(c.likes) DESC")
    List<Comment> findMostLikedCommentsByPostId(@Param("postId") Long postId);


    @Query(value = "SELECT 'yorum yaptı', c.post_id, u.avatar, u.username, c.created_at " +
            "FROM comment c LEFT JOIN user u ON u.id = c.user_id " +
            "WHERE c.post_id IN (:postIds) " +
            "ORDER BY c.created_at DESC LIMIT 10", nativeQuery = true)
    List<Object[]> findByPostIds(@Param("postIds") List<Long> postIds);

}
