package com.postapp.postapp.controllers;

import com.postapp.postapp.dto.CommentCreateDto;
import com.postapp.postapp.dto.CommentResponseDto;
import com.postapp.postapp.entities.Comment;
import com.postapp.postapp.entities.Post;
import com.postapp.postapp.entities.User;
import com.postapp.postapp.exceptions.UnauthorizedException;
import com.postapp.postapp.mapper.CommentMapper;
import com.postapp.postapp.services.CommentService;
import com.postapp.postapp.services.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/comments")
public class CommentController {

    private final CommentService commentService;
    private final CommentMapper commentMapper;
    private final PostService postService;

    @GetMapping
    public List<CommentResponseDto> getAllComments(@RequestParam Optional<Long> userId,
                                                   @RequestParam Optional<Long> postId) {
        return commentService.getAllComments(userId, postId).stream()
                .map(commentMapper::toResponseDto)
                .toList();

    }

    @GetMapping("{/id}")
    public CommentResponseDto getCommentById(@PathVariable Long id) {
        Comment comment = commentService.getCommentById(id);
        return commentMapper.toResponseDto(comment);
    }

    @PutMapping("/{id}")
    public CommentResponseDto updateComment(
            @PathVariable Long id,
            @RequestBody CommentCreateDto commentCreateDto,
            @AuthenticationPrincipal User currentUser
    ) {
        Comment existingComment = commentService.getCommentById(id);

        if (!existingComment.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Bu yorumu güncelleme yetkiniz yok!");
        }
        commentMapper.partialUpdate(commentCreateDto, existingComment);
        Comment updatedComment = commentService.saveComment(existingComment);
        return commentMapper.toResponseDto(updatedComment);
    }

    @PostMapping("/posts/{postId}")
    public CommentResponseDto createCommentOnPost(
            @PathVariable Long postId,
            @RequestBody CommentCreateDto commentCreateDto,
            @AuthenticationPrincipal User currentUser
    ) {

        Post post = postService.getPostById(postId);

        // DTO → Entity
        Comment comment = commentMapper.toEntity(commentCreateDto);
        comment.setUser(currentUser);
        comment.setPost(post);

        // Parent comment varsa ekliyoruz.
        if (commentCreateDto.getParentCommentId() != null) {
            Comment parent = commentService.getCommentById(commentCreateDto.getParentCommentId());
            comment.setParent(parent);
        }

        Comment savedComment = commentService.saveComment(comment);
        return commentMapper.toResponseDto(savedComment);
    }

    @PostMapping("/{parentCommentId}/replies")
    public CommentResponseDto createCommentOnComment(
            @PathVariable Long parentCommentId,
            @RequestBody CommentCreateDto commentCreateDto,
            @AuthenticationPrincipal User currentUser
    ) {
        // Parent yorumu alıyoruz
        Comment parentComment = commentService.getCommentById(parentCommentId);

        // DTO'den entityi oluşturuyoruz
        Comment comment = commentMapper.toEntity(commentCreateDto);
        comment.setUser(currentUser);
        comment.setParent(parentComment);
        comment.setPost(parentComment.getPost());
        Comment savedComment = commentService.saveComment(comment);

        return commentMapper.toResponseDto(savedComment);
    }

    @DeleteMapping("/{id}")
    public void deleteCommentById(@PathVariable Long id,
                                   @AuthenticationPrincipal User currentUser) {
        Comment comment = commentService.getCommentById(id);
        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Bu yorumu silme yetkiniz yok!");
        }
        commentService.deleteComment(id);
    }

}
