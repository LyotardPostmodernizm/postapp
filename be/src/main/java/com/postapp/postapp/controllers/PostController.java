package com.postapp.postapp.controllers;

import com.postapp.postapp.dto.PostCreateDto;
import com.postapp.postapp.dto.PostResponseDto;
import com.postapp.postapp.entities.Post;
import com.postapp.postapp.entities.User;
import com.postapp.postapp.exceptions.UnauthorizedException;
import com.postapp.postapp.mapper.PostMapper;
import com.postapp.postapp.services.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import net.bytebuddy.implementation.bind.MethodDelegationBinder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
@Tag(name = "Posts", description = "Post management APIs")
public class PostController {
    private final PostService postService;
    private final PostMapper postMapper;

    @Operation(summary = "Get all posts",
            description = "Get all posts by optional userId",
            tags = {"Posts"} )
    @GetMapping
    public List<PostResponseDto> getAllPosts(@RequestParam Optional<Long> userId) {
        List<PostResponseDto>posts =  postService.getAllPosts(userId).stream()
                .map(postMapper::toResponseDto)
                .toList();
        System.out.println(posts);
        return posts;
    }

    @Operation(summary = "Get post by id",
            description = "Get post by id",
            tags = {"Posts"} )
    @GetMapping("/id")
    public PostResponseDto getPostById(@PathVariable Long id) {
        Post post = postService.getPostById(id);
        return postMapper.toResponseDto(post);
    }


    @Operation(summary = "Create a new book")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Post created successfully",
                    content = { @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PostCreateDto.class)) }),
            @ApiResponse(responseCode = "400", description = "Invalid input provided") })

    @PostMapping
    public PostResponseDto createPost(@io.swagger.v3.oas.annotations.parameters.RequestBody(
                                                  description = "Post to create", required = true,
                                                  content = @Content(mediaType = "application/json",
                                                          schema = @Schema(implementation = PostCreateDto.class),
                                                          examples = @ExampleObject(value = "{ \"title\": \"Title of Post\", \"content\": \"Content of Post\" }")))
            @RequestBody PostCreateDto postCreateDto,
            @AuthenticationPrincipal User currentUser
    ) {
        System.out.println("Current User: " + currentUser);
        if (currentUser == null) {
            throw new RuntimeException("Authentication failed: User is null");
        }

        Post post = postMapper.toEntity(postCreateDto);
        post.setUser(currentUser);
        Post savedPost = postService.createPost(post);
        return postMapper.toResponseDto(savedPost);
    }
    @Operation(summary = "Update a post",description = "Update a post by id",tags = {"Posts"})
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
