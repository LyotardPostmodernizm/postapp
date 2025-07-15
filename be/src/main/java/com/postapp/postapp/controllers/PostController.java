package com.postapp.postapp.controllers;

import com.postapp.postapp.dto.PostCreateDto;
import com.postapp.postapp.dto.PostResponseDto;
import com.postapp.postapp.entities.Post;
import com.postapp.postapp.entities.User;
import com.postapp.postapp.exceptions.UnauthorizedException;
import com.postapp.postapp.mapper.PostMapper;
import com.postapp.postapp.services.PostService;
import com.postapp.postapp.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
    private final UserService userService;

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


    @Operation(summary = "Create a new post")
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
            @RequestBody PostCreateDto postCreateDto
    ) {
        User user = userService.getUserById(postCreateDto.getUserId());
        if (user == null) {
            throw new RuntimeException("Kullanıcı bulunamadı!");
        }

        Post post = postMapper.toEntity(postCreateDto);
        post.setUser(user);
        Post savedPost = postService.createPost(post);
        return postMapper.toResponseDto(savedPost);
    }
    @Operation(summary = "Update a post",description = "Update a post by id",tags = {"Posts"})
    @PutMapping("/{id}")
    public PostResponseDto updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostCreateDto postCreateDto

    ) {
        Post existingPost = postService.getPostById(id);

        User user = userService.getUserById(postCreateDto.getUserId());
        if (user == null) {
            throw new RuntimeException("Kullanıcı bulunamadı!");
        }

        // Kullanıcı yetkisi kontrolü - sadece kendi postunu güncelleyebilir
        if (!existingPost.getUser().getId().equals(postCreateDto.getUserId())) {
            throw new UnauthorizedException("Bu postu güncelleme yetkiniz yok!");
        }


        // Post güncelleme işlemi
            postMapper.partialUpdate(postCreateDto, existingPost);
            existingPost.setUser(user);
            Post updatedPost = postService.createPost(existingPost);
            return postMapper.toResponseDto(updatedPost);

    }

    @DeleteMapping("/{id}")
    public void deletePostById(@PathVariable Long id,
                               @RequestParam Long userId) {

        Post post = postService.getPostById(id);

        User user = userService.getUserById(userId);
        if (user == null) {
            throw new RuntimeException("Kullanıcı bulunamadı!");
        }

        // Kullanıcı yetkisi kontrolü - sadece kendi postunu silebilir
        if (!post.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Bu postu silme yetkiniz yok!");
        }

        postService.deletePost(id);
    }


}
