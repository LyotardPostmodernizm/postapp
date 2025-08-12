package com.postapp.postapp.controllers;

import com.postapp.postapp.dto.PostCreateDto;
import com.postapp.postapp.dto.PostResponseDto;
import com.postapp.postapp.entities.Post;
import com.postapp.postapp.entities.User;
import com.postapp.postapp.exceptions.UnauthorizedException;
import com.postapp.postapp.mapper.PostMapper;
import com.postapp.postapp.security.JwtUserDetails;
import com.postapp.postapp.services.PostService;
import com.postapp.postapp.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/posts")
@RequiredArgsConstructor
@Tag(name = "Posts", description = "Post yönetimi API'leri")
public class PostController {
    private final PostService postService;
    private final PostMapper postMapper;
    private final UserService userService;

    @Operation(summary = "Tüm postları getir",
            description = "Opsiyonel userId parametresi ile filtrelenmiş postları getir",
            tags = {"Posts"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Postlar başarıyla getirildi",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PostResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Geçersiz parametre")
    })
    @GetMapping
    public List<PostResponseDto> getAllPosts(@Parameter(description = "Belirli bir kullanıcının postlarını getirmek için kullanıcı ID'si")
                                             @RequestParam Optional<Long> userId) {
        List<PostResponseDto> posts = postService.getAllPosts(userId).stream()
                .map(postMapper::toResponseDto)
                .toList();
        return posts;
    }

    @Operation(summary = "ID ile post getir",
            description = "Belirtilen ID'ye sahip postu getir",
            tags = {"Posts"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Post başarıyla getirildi",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PostResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "Post bulunamadı")
    })

    @GetMapping("/{id}")
    public PostResponseDto getPostById(@PathVariable Long id) {
        Post post = postService.getPostById(id);
        return postMapper.toResponseDto(post);
    }


    @Operation(summary = "Yeni post oluştur",
            description = "Yeni bir post oluştur",
            tags = {"Posts"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Post başarıyla oluşturuldu",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PostResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Geçersiz girdi")
    })

    @PostMapping
    public PostResponseDto createPost(@io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Oluşturulacak post bilgileri", required = true,
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = PostCreateDto.class),
                    examples = @ExampleObject(value = "{ \"title\": \"Post Başlığı\", \"content\": \"Post İçeriği\", \"userId\": 1 }")))
                                      @Valid @RequestBody PostCreateDto postCreateDto) {
        User user = userService.getUserById(postCreateDto.getUserId());
        if (user == null) {
            throw new RuntimeException("Kullanıcı bulunamadı!");
        }

        Post post = postMapper.toEntity(postCreateDto);
        post.setUser(user);
        Post savedPost = postService.createPost(post);
        return postMapper.toResponseDto(savedPost);
    }

    @Operation(summary = "Post güncelle",
            description = "Belirtilen ID'ye sahip postu güncelle",
            tags = {"Posts"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Post başarıyla güncellendi",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PostResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Geçersiz girdi"),
            @ApiResponse(responseCode = "401", description = "Yetkisiz erişim"),
            @ApiResponse(responseCode = "404", description = "Post bulunamadı")
    })
    @PutMapping("/{id}")
    public PostResponseDto updatePost(@Parameter(description = "Post ID'si", required = true)
                                      @PathVariable Long id,
                                      @io.swagger.v3.oas.annotations.parameters.RequestBody(
                                              description = "Güncellenecek post bilgileri", required = true,
                                              content = @Content(mediaType = "application/json",
                                                      schema = @Schema(implementation = PostCreateDto.class),
                                                      examples = @ExampleObject(value = "{ \"title\": \"Güncellenmiş Başlık\", \"content\": \"Güncellenmiş İçerik\", \"userId\": 1 }")))
                                      @Valid @RequestBody PostCreateDto postCreateDto,
                                      @AuthenticationPrincipal JwtUserDetails currentUser
    ) {
        Post existingPost = postService.getPostById(id);

        // Kullanıcı yetkisi kontrolü - sadece kendi postunu güncelleyebilir

        if (!existingPost.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Bu postu güncelleme yetkiniz yok!");
        }

        User user = userService.getUserById(currentUser.getId());

        // Post güncelleme işlemi
        postMapper.partialUpdate(postCreateDto, existingPost);
        existingPost.setUser(user);
        Post updatedPost = postService.createPost(existingPost);
        return postMapper.toResponseDto(updatedPost);

    }
    @Operation(summary = "Post sil",
            description = "Belirtilen ID'ye sahip postu sil",
            tags = {"Posts"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Post başarıyla silindi"),
            @ApiResponse(responseCode = "401", description = "Yetkisiz erişim"),
            @ApiResponse(responseCode = "404", description = "Post bulunamadı")
    })
    @DeleteMapping("/{id}")
    public void deletePostById(
            @PathVariable Long id,
            @AuthenticationPrincipal JwtUserDetails currentUser
    ) {
        Post post = postService.getPostById(id);
        if (!post.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Bu postu silme yetkiniz yok!");
        }

        postService.deletePost(id);
    }


}
