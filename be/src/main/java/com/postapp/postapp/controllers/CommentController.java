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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/comments")
@Tag(name = "Comments", description = "Yorum yönetimi API'leri")
public class CommentController {

    private final CommentService commentService;
    private final CommentMapper commentMapper;
    private final PostService postService;
    private final UserService userService;

    @Operation(
            summary = "Tüm yorumları getir",
            description = "Tüm yorumları listeler. İsteğe bağlı parametrelerle filtreleme yapabilirsiniz.",
            tags = {"Comments"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Yorumlar başarıyla getirildi",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = CommentResponseDto.class))}),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })
    @GetMapping
    public List<CommentResponseDto> getAllComments(
            @Parameter(description = "Kullanıcı ID'si ile filtreleme (opsiyonel)")
            @RequestParam(required = false) Optional<Long> userId,
            @Parameter(description = "Post ID'si ile filtreleme (opsiyonel)")
            @RequestParam(required = false) Optional<Long> postId,
            @Parameter(description = "Ana yorum ID'si (0 veya sayısal değer)")
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


        List<CommentResponseDto> result = comments.stream()
                .map(commentMapper::toResponseDto)
                .collect(Collectors.toList());


        return result;

    }

    @Operation(
            summary = "ID ile yorum getir",
            description = "Belirtilen ID'ye sahip yorumu getirir",
            tags = {"Comments"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Yorum başarıyla getirildi",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = CommentResponseDto.class))}),
            @ApiResponse(responseCode = "404", description = "Yorum bulunamadı"),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })
    @GetMapping("/{id}")
    public CommentResponseDto getCommentById(@Parameter(description = "Yorum ID'si", required = true)
                                                 @PathVariable Long id) {
        Comment comment = commentService.getCommentById(id);
        return commentMapper.toResponseDto(comment);
    }

    @Operation(
            summary = "Yorum güncelle",
            description = "Mevcut bir yorumu günceller. Sadece kendi yorumunuzu güncelleyebilirsiniz.",
            tags = {"Comments"},
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Yorum başarıyla güncellendi",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = CommentResponseDto.class))}),
            @ApiResponse(responseCode = "400", description = "Geçersiz giriş verisi"),
            @ApiResponse(responseCode = "401", description = "Bu yorumu güncelleme yetkiniz yok"),
            @ApiResponse(responseCode = "404", description = "Yorum bulunamadı"),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })
    @PutMapping("/{id}")
    public CommentResponseDto updateComment(@Parameter(description = "Güncellenecek yorum ID'si", required = true)
                                                @PathVariable Long id,
                                            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                                                    description = "Güncellenecek yorum bilgileri",
                                                    required = true,
                                                    content = @Content(
                                                            mediaType = "application/json",
                                                            schema = @Schema(implementation = CommentCreateDto.class),
                                                            examples = @ExampleObject(
                                                                    value = "{ \"content\": \"Güncellenmiş yorum içeriği\" }"
                                                            )
                                                    )
                                            )
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

    @Operation(
            summary = "Post üzerine yorum yap",
            description = "Belirtilen post üzerine yeni bir yorum oluşturur",
            tags = {"Comments"},
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Yorum başarıyla oluşturuldu",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = CommentResponseDto.class))}),
            @ApiResponse(responseCode = "400", description = "Geçersiz giriş verisi"),
            @ApiResponse(responseCode = "401", description = "Kimlik doğrulama gerekli"),
            @ApiResponse(responseCode = "404", description = "Post bulunamadı"),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })
    @PostMapping("/posts/{postId}")
    public CommentResponseDto createCommentOnPost(
            @Parameter(description = "Yorum yapılacak post ID'si", required = true)
            @PathVariable Long postId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Oluşturulacak yorum bilgileri",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = CommentCreateDto.class),
                            examples = @ExampleObject(
                                    value = "{ \"content\": \"Bu harika bir post!\" }"
                            )
                    )
            )
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

    @Operation(
            summary = "Yorum üzerine yanıt yap",
            description = "Belirtilen yorum üzerine yanıt oluşturur",
            tags = {"Comments"},
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Yanıt başarıyla oluşturuldu",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = CommentResponseDto.class))}),
            @ApiResponse(responseCode = "400", description = "Geçersiz giriş verisi"),
            @ApiResponse(responseCode = "401", description = "Kimlik doğrulama gerekli"),
            @ApiResponse(responseCode = "404", description = "Ana yorum bulunamadı"),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })

    @PostMapping("/{parentCommentId}/replies")
    public CommentResponseDto createCommentOnComment(
            @Parameter(description = "Ana yorum ID'si", required = true)
            @PathVariable Long parentCommentId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Oluşturulacak yanıt bilgileri",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = CommentCreateDto.class),
                            examples = @ExampleObject(
                                    value = "{ \"content\": \"Katılıyorum!\" }"
                            )
                    )
            )
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

    @Operation(
            summary = "Yorum sil",
            description = "Belirtilen ID'ye sahip yorumu siler. Sadece kendi yorumunuzu silebilirsiniz.",
            tags = {"Comments"},
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Yorum başarıyla silindi"),
            @ApiResponse(responseCode = "401", description = "Bu yorumu silme yetkiniz yok"),
            @ApiResponse(responseCode = "404", description = "Yorum bulunamadı"),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })
    @DeleteMapping("/{id}")
    public void deleteCommentById(@PathVariable Long id,
                                  @AuthenticationPrincipal JwtUserDetails currentUser) {
        Comment comment = commentService.getCommentById(id);
        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Bu yorumu silme yetkiniz yok!");
        }
        commentService.deleteComment(id);
    }

}
