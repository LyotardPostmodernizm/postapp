package com.postapp.postapp.controllers;

import com.postapp.postapp.dto.LikeCreateDto;
import com.postapp.postapp.dto.LikeResponseDto;
import com.postapp.postapp.entities.Comment;
import com.postapp.postapp.entities.Like;
import com.postapp.postapp.entities.Post;
import com.postapp.postapp.entities.User;
import com.postapp.postapp.exceptions.UnauthorizedException;
import com.postapp.postapp.exceptions.UserNotFoundException;
import com.postapp.postapp.mapper.LikeMapper;
import com.postapp.postapp.security.JwtUserDetails;
import com.postapp.postapp.services.CommentService;
import com.postapp.postapp.services.LikeService;
import com.postapp.postapp.services.PostService;
import com.postapp.postapp.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
    private final UserService userService;

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
            @AuthenticationPrincipal JwtUserDetails currentUser

    ) {
        // Sadece postId VEYA commentId dolu olmalı
        if ((likeCreateDto.getPostId() == null && likeCreateDto.getCommentId() == null) ||
                (likeCreateDto.getPostId() != null && likeCreateDto.getCommentId() != null)) {
            throw new IllegalArgumentException("Sadece post veya comment üzerine beğeni atılabilir!");
        }
        Long userId = currentUser.getId();
        User user = userService.getUserById(userId);
        if(user==null){
            throw new UserNotFoundException("Kullanıcı Bulunamadı!");
        }

        if (likeCreateDto.getPostId() != null) {
            List<Like> existingLikes = likeService.getAllLikes(
                    Optional.of(userId),
                    Optional.of(likeCreateDto.getPostId()),
                    Optional.empty()
            );
            if (!existingLikes.isEmpty()) {
                throw new IllegalArgumentException("Bu postu zaten beğendiniz!");
            }
        }

        Like like = likeMapper.toEntity(likeCreateDto);
        like.setUser(user);

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
    public void deleteLikeById(@PathVariable Long id, @RequestParam Long userId) {
        Like like = likeService.getLikeById(id);
        if (!userId.equals(like.getUser().getId())) {
            throw new UnauthorizedException("Bu beğeniyi silme yetkiniz yok!");
        }
        likeService.deleteLike(id);
    }

}
