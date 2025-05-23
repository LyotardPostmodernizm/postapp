package com.postapp.postapp.controllers;

import com.postapp.postapp.dto.PostCreateDto;
import com.postapp.postapp.dto.PostResponseDto;
import com.postapp.postapp.entities.Post;
import com.postapp.postapp.entities.User;
import com.postapp.postapp.exceptions.UnauthorizedException;
import com.postapp.postapp.mapper.PostMapper;
import com.postapp.postapp.services.PostService;
import lombok.RequiredArgsConstructor;
import net.bytebuddy.implementation.bind.MethodDelegationBinder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    private final PostMapper postMapper;

    @GetMapping
    public List<PostResponseDto> getAllPosts(@RequestParam Optional<Long> userId) {
        List<PostResponseDto>posts =  postService.getAllPosts(userId).stream()
                .map(postMapper::toResponseDto)
                .toList();
        System.out.println(posts);
        return posts;
    }

    @GetMapping("/id")
    public PostResponseDto getPostById(@PathVariable Long id) {
        Post post = postService.getPostById(id);
        return postMapper.toResponseDto(post);
    }

    @PostMapping
    public PostResponseDto createPost(
            @RequestBody PostCreateDto postCreateDto,
            @AuthenticationPrincipal User currentUser
    ) {
        Post post = postMapper.toEntity(postCreateDto);
        post.setUser(currentUser);
        Post savedPost = postService.createPost(post);
        return postMapper.toResponseDto(savedPost);
    }

    @PutMapping("/{id}")
    public PostResponseDto updatePost(
            @PathVariable Long id,
            @RequestBody PostCreateDto postCreateDto,
            @AuthenticationPrincipal User currentUser
    ) {
        Post existingPost = postService.getPostById(id);


            // Kullanıcı yetkisi kontrolü
            if (!existingPost.getUser().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("Bu postu güncelleme yetkiniz yok!");
            }

            // Post güncelleme işlemi
            postMapper.partialUpdate(postCreateDto, existingPost);
            Post updatedPost = postService.createPost(existingPost);
            return postMapper.toResponseDto(updatedPost);

    }

    @DeleteMapping("/{id}")
    public void deletePostById(@PathVariable Long id,
                               @AuthenticationPrincipal User currentUser) {

        Post post = postService.getPostById(id);

        if (!post.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Bu postu silme yetkiniz yok!");
        }
        postService.deletePost(id);
    }


}
