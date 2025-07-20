package com.postapp.postapp.services;

import com.postapp.postapp.entities.Comment;
import com.postapp.postapp.entities.Post;
import com.postapp.postapp.entities.User;
import com.postapp.postapp.repositories.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommentService {


    private final CommentRepository commentRepository;


    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }


    public Comment getCommentById(Long commentId) {
        return commentRepository.findById(commentId).orElse(null);
    }


    public List<Comment> getAllCommentsByPostId(Long postId) {
        return commentRepository.findByPostId(postId);
    }


    public List<Comment> getAllCommentsByPostIdAndParentIsNull(Long postId) {
        return commentRepository.findByPostIdAndParentIsNull(postId);
    }



    public List<Comment> getAllCommentsByPostIdAndParentId(Long postId, Long parentId) {
        return commentRepository.findByPostIdAndParentId(postId, parentId);
    }


    public List<Comment> getAllCommentsByUserId(Long userId) {
        return commentRepository.findByUserId(userId);
    }


    public List<Comment> getAllCommentsByUserIdAndPostId(Long userId, Long postId) {
        return commentRepository.findByUserIdAndPostId(userId, postId);
    }


    public List<Comment> getAllCommentsByParentId(Long parentId) {
        return commentRepository.findByParentId(parentId);
    }


    public Comment saveComment(Comment comment) {
        return commentRepository.save(comment);
    }


    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }


    public Comment updateComment(Long commentId, Comment newComment) {
        Optional<Comment> comment = commentRepository.findById(commentId);
        if (comment.isPresent()) {
            Comment foundComment = comment.get();
            foundComment.setText(newComment.getText());
            return commentRepository.save(foundComment);
        }
        return null;
    }


    public void deleteCommentByIdAndUserId(Long commentId, Long userId) {
        commentRepository.deleteByIdAndUserId(commentId, userId);
    }


    public int getCommentCountByPostId(Long postId) {
        return commentRepository.countByPostId(postId);
    }


    public int getCommentCountByUserId(Long userId) {
        return commentRepository.countByUserId(userId);
    }

    public int getReplyCountByCommentId(Long commentId) {
        return commentRepository.countByParentId(commentId);
    }


    public int getMainCommentCountByPostId(Long postId) {
        return commentRepository.countByPostIdAndParentIsNull(postId);
    }


    public boolean existsById(Long commentId) {
        return commentRepository.existsById(commentId);
    }


    public boolean isCommentOwner(Long commentId, Long userId) {
        return commentRepository.existsByIdAndUserId(commentId, userId);
    }


    public void deleteAllCommentsByPostId(Long postId) {
        commentRepository.deleteByPostId(postId);
    }


    public void deleteAllCommentsByUserId(Long userId) {
        commentRepository.deleteByUserId(userId);
    }


    public List<Comment> getHierarchicalCommentsByPostId(Long postId) {
        List<Comment> rootComments = commentRepository.findHierarchicalCommentsByPostId(postId);

        //  Her root comment için tüm children'ları recursive olarak yüklüyoruz
        for (Comment rootComment : rootComments) {
            loadChildrenRecursive(rootComment);
        }

        return rootComments;
    }

    private void loadChildrenRecursive(Comment comment) {
        List<Comment> directChildren = commentRepository.findRepliesWithChildren(comment.getId());
        comment.setChildren(directChildren);

        // Her child için de recursive olarak alt yorumları yüklüyoruz
        for (Comment child : directChildren) {
            loadChildrenRecursive(child);
        }
    }




    public int getCommentDepth(Long commentId) {
        Comment comment = getCommentById(commentId);
        if (comment == null) return 0;

        int depth = 0;
        Comment current = comment;
        while (current.getParent() != null) {
            depth++;
            current = current.getParent();
        }
        return depth;
    }
}