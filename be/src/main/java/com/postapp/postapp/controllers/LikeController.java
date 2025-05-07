package com.postapp.postapp.controllers;

import com.postapp.postapp.dto.LikeCreateDto;
import com.postapp.postapp.dto.LikeResponseDto;
import com.postapp.postapp.entities.Comment;
import com.postapp.postapp.entities.Like;
import com.postapp.postapp.entities.Post;
import com.postapp.postapp.entities.User;
import com.postapp.postapp.exceptions.UnauthorizedException;
import com.postapp.postapp.mapper.LikeMapper;
import com.postapp.postapp.services.CommentService;
import com.postapp.postapp.services.LikeService;
import com.postapp.postapp.services.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/likes")
@RequiredArgsConstructor
public class LikeController {
    private final LikeService likeService;
    private final LikeMapper likeMapper;
    private final PostService postService;
    private final CommentService commentService;

    @GetMapping
    public List<LikeResponseDto> getAllLikes(@RequestParam Optional<Long> userId,
                                             @RequestParam Optional<Long> postId,
                                             @RequestParam Optional<Long> commentId) {
        return likeService.getAllLikes(userId, postId, commentId).stream()
                .map(likeMapper::toResponseDto)
                .toList();
    }

    @GetMapping("/{id}")
    public LikeResponseDto getLikeById(@PathVariable Long id) {
        Like like = likeService.getLikeById(id);
        return likeMapper.toResponseDto(like);
    }

    @PostMapping
    public LikeResponseDto createLike(
            @RequestBody LikeCreateDto likeCreateDto,
            @AuthenticationPrincipal User currentUser
    ) {
        // Sadece postId VEYA commentId dolu olmalı
        if ((likeCreateDto.getPostId() == null && likeCreateDto.getCommentId() == null) ||
                (likeCreateDto.getPostId() != null && likeCreateDto.getCommentId() != null)) {
            throw new IllegalArgumentException("Sadece post veya comment üzerine beğeni atılabilir!");
        }

        Like like = likeMapper.toEntity(likeCreateDto);
        like.setUser(currentUser);

        // Post veya Comment ilişkisini kuruyoruz
        if (likeCreateDto.getPostId() != null) {
            Post post = postService.getPostById(likeCreateDto.getPostId());
            like.setPost(post);
        } else {
            Comment comment = commentService.getCommentById(likeCreateDto.getCommentId());
            like.setComment(comment);
        }

        Like savedLike = likeService.saveLike(like);
        return likeMapper.toResponseDto(savedLike);
    }
    @DeleteMapping("/{id}")
    public void deleteLikeById(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        if (!currentUser.getId().equals(likeService.getLikeById(id).getUser().getId())) {
            throw new UnauthorizedException("Bu beğeniyi silme yetkiniz yok!");
        }
        likeService.deleteLike(id);
    }

}
