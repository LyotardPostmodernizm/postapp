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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/likes")
@RequiredArgsConstructor
@Tag(name = "Likes", description = "Beğeni yönetimi API'leri")
public class LikeController {
    private final LikeService likeService;
    private final LikeMapper likeMapper;
    private final PostService postService;
    private final CommentService commentService;
    private final UserService userService;

    @Operation(
            summary = "Tüm beğenileri getir",
            description = "Tüm beğenileri listeler. İsteğe bağlı parametrelerle filtreleme yapabilirsiniz.",
            tags = {"Likes"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Beğeniler başarıyla getirildi",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = LikeResponseDto.class))}),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })
    @GetMapping
    public List<LikeResponseDto> getAllLikes(@Parameter(description = "Kullanıcı ID'si ile filtreleme (opsiyonel)")
                                             @RequestParam Optional<Long> userId,
                                             @Parameter(description = "Post ID'si ile filtreleme (opsiyonel)")
                                             @RequestParam Optional<Long> postId,
                                             @Parameter(description = "Yorum ID'si ile filtreleme (opsiyonel)")
                                             @RequestParam Optional<Long> commentId) {
        return likeService.getAllLikes(userId, postId, commentId).stream()
                .map(likeMapper::toResponseDto)
                .toList();
    }

    @Operation(
            summary = "ID ile beğeni getir",
            description = "Belirtilen ID'ye sahip beğeniyi getirir",
            tags = {"Likes"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Beğeni başarıyla getirildi",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = LikeResponseDto.class))}),
            @ApiResponse(responseCode = "404", description = "Beğeni bulunamadı"),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })
    @GetMapping("/{id}")
    public LikeResponseDto getLikeById(@PathVariable Long id) {
        Like like = likeService.getLikeById(id);
        return likeMapper.toResponseDto(like);
    }

    @Operation(
            summary = "Yeni beğeni oluştur",
            description = "Post veya yorum için yeni bir beğeni oluşturur. Sadece post veya yorum ID'sinden biri dolu olmalıdır.",
            tags = {"Likes"},
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Beğeni başarıyla oluşturuldu",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = LikeResponseDto.class))}),
            @ApiResponse(responseCode = "400", description = "Geçersiz giriş verisi veya zaten beğenilmiş"),
            @ApiResponse(responseCode = "401", description = "Kimlik doğrulama gerekli"),
            @ApiResponse(responseCode = "404", description = "Kullanıcı, post veya yorum bulunamadı"),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })

    @PostMapping
    public LikeResponseDto createLike(@io.swagger.v3.oas.annotations.parameters.RequestBody(
                                              description = "Oluşturulacak beğeni bilgileri",
                                              required = true,
                                              content = @Content(
                                                      mediaType = "application/json",
                                                      schema = @Schema(implementation = LikeCreateDto.class),
                                                      examples = {
                                                              @ExampleObject(
                                                                      name = "Post beğenisi",
                                                                      value = "{ \"postId\": 1, \"commentId\": null }"
                                                              ),
                                                              @ExampleObject(
                                                                      name = "Yorum beğenisi",
                                                                      value = "{ \"postId\": null, \"commentId\": 1 }"
                                                              )
                                                      }
                                              )
                                      )
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
        if (user == null) {
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

    @Operation(
            summary = "Beğeni sil",
            description = "Belirtilen ID'ye sahip beğeniyi siler. Sadece kendi beğeninizi silebilirsiniz.",
            tags = {"Likes"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Beğeni başarıyla silindi"),
            @ApiResponse(responseCode = "401", description = "Bu beğeniyi silme yetkiniz yok"),
            @ApiResponse(responseCode = "404", description = "Beğeni bulunamadı"),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")

    })
    @DeleteMapping("/{id}")
    public void deleteLikeById(@Parameter(description = "Silinecek beğeni ID'si", required = true)
                                   @PathVariable Long id,
                               @Parameter(description = "Kullanıcı ID'si", required = true)
                                   @RequestParam Long userId) {
        Like like = likeService.getLikeById(id);
        if (!userId.equals(like.getUser().getId())) {
            throw new UnauthorizedException("Bu beğeniyi silme yetkiniz yok!");
        }
        likeService.deleteLike(id);
    }

}
