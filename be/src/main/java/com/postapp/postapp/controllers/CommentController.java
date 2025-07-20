package com.postapp.postapp.controllers;

import com.postapp.postapp.dto.CommentCreateDto;
import com.postapp.postapp.dto.CommentResponseDto;
import com.postapp.postapp.entities.Comment;
import com.postapp.postapp.entities.Post;
import com.postapp.postapp.entities.User;
import com.postapp.postapp.exceptions.UnauthorizedException;
import com.postapp.postapp.mapper.CommentMapper;
import com.postapp.postapp.security.JwtUserDetails;
import com.postapp.postapp.services.CommentService;
import com.postapp.postapp.services.PostService;
import com.postapp.postapp.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/comments")
public class CommentController {

    private final CommentService commentService;
    private final CommentMapper commentMapper;
    private final PostService postService;
    private final UserService userService;

    @GetMapping
    public List<CommentResponseDto> getAllComments(
            @RequestParam(required = false) Optional<Long> userId,
            @RequestParam(required = false) Optional<Long> postId,
            @RequestParam(required = false) String parentId
    ) {
        List<Comment> comments;

        if (userId.isPresent() && postId.isPresent()) {
            comments = commentService.getAllCommentsByUserIdAndPostId(userId.get(), postId.get());
        } else if (userId.isPresent()) {
            comments = commentService.getAllCommentsByUserId(userId.get());
        } else if (postId.isPresent()) {
            if (parentId != null) {
                if ("null".equals(parentId) || "0".equals(parentId)) {
                    comments = commentService.getHierarchicalCommentsByPostId(postId.get());
                } else {
                    try {
                        Long parentIdLong = Long.parseLong(parentId);
                        comments = commentService.getAllCommentsByPostIdAndParentId(postId.get(), parentIdLong);
                    } catch (NumberFormatException e) {
                        comments = commentService.getHierarchicalCommentsByPostId(postId.get());
                    }
                }
            } else {
                comments = commentService.getHierarchicalCommentsByPostId(postId.get());
            }
        } else {
            comments = commentService.getAllComments();
        }

        System.out.println("=== REPOSITORY'DEN GELEN COMMENT'LAR ===");
        for (Comment comment : comments) {
            System.out.println("Comment ID: " + comment.getId() +
                    ", Text: " + comment.getText() +
                    ", Children size: " + (comment.getChildren() != null ? comment.getChildren().size() : "null"));

            if (comment.getChildren() != null) {
                for (Comment child : comment.getChildren()) {
                    System.out.println("  - Child ID: " + child.getId() +
                            ", Text: " + child.getText() +
                            ", Parent ID: " + (child.getParent() != null ? child.getParent().getId() : "null"));
                }
            }
        }

        List<CommentResponseDto> result = comments.stream()
                .map(commentMapper::toResponseDto)
                .collect(Collectors.toList());


        System.out.println("=== MAPPED RESULT'LAR ===");
        for (CommentResponseDto dto : result) {
            System.out.println("DTO ID: " + dto.getId() +
                    ", Text: " + dto.getText() +
                    ", Children size: " + (dto.getChildren() != null ? dto.getChildren().size() : "null") +
                    ", Reply count: " + dto.getReplyCount());

            if (dto.getChildren() != null) {
                for (CommentResponseDto child : dto.getChildren()) {
                    System.out.println("  - Child DTO ID: " + child.getId() +
                            ", Text: " + child.getText() +
                            ", Parent ID: " + child.getParentCommentId());
                }
            }
        }

        return result;

    }

    @GetMapping("/{id}")
    public CommentResponseDto getCommentById(@PathVariable Long id) {
        Comment comment = commentService.getCommentById(id);
        return commentMapper.toResponseDto(comment);
    }

    @PutMapping("/{id}")
    public CommentResponseDto updateComment(
            @PathVariable Long id,
            @RequestBody CommentCreateDto commentCreateDto,
            @AuthenticationPrincipal JwtUserDetails currentUser
    ) {
        Comment existingComment = commentService.getCommentById(id);
        User user = userService.getUserById(currentUser.getId());

        if (!existingComment.getUser().getId().equals(user.getId())) {
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
            @AuthenticationPrincipal JwtUserDetails currentUser
    ) {

        Post post = postService.getPostById(postId);
        User user = userService.getUserById(currentUser.getId());

        // DTO → Entity
        Comment comment = commentMapper.toEntity(commentCreateDto);
        comment.setUser(user);
        comment.setPost(post);

        Comment savedComment = commentService.saveComment(comment);
        return commentMapper.toResponseDto(savedComment);
    }

    @PostMapping("/{parentCommentId}/replies")
    public CommentResponseDto createCommentOnComment(
            @PathVariable Long parentCommentId,
            @RequestBody CommentCreateDto commentCreateDto,
            @AuthenticationPrincipal JwtUserDetails currentUser
    ) {
        // Parent yorumu alıyoruz
        Comment parentComment = commentService.getCommentById(parentCommentId);
        User user = userService.getUserById(currentUser.getId());


        // DTO'den entityi oluşturuyoruz
        Comment comment = commentMapper.toEntity(commentCreateDto);
        comment.setUser(user);
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
