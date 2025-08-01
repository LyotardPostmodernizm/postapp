package com.postapp.postapp.controllers;

import com.postapp.postapp.dto.UserCreateDto;
import com.postapp.postapp.dto.UserResponseDto;
import com.postapp.postapp.dto.UserUpdateDto;
import com.postapp.postapp.entities.User;
import com.postapp.postapp.exceptions.ForbiddenException;
import com.postapp.postapp.exceptions.UserNotFoundException;
import com.postapp.postapp.mapper.UserMapper;
import com.postapp.postapp.security.JwtUserDetails;
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
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Kullanıcı yönetimi API'leri")
public class UserController {
    private final UserService userService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Operation(
            summary = "Tüm kullanıcıları getir",
            description = "Sistemdeki tüm kullanıcıları listeler",
            tags = {"Users"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Kullanıcılar başarıyla getirildi",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = UserResponseDto.class))}),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })
    @GetMapping
    public List<UserResponseDto> getAllUsers() {
        return userService.getAllUsers().stream()
                .map(userMapper::toResponseDto)
                .toList();

    }

    @Operation(
            summary = "ID ile kullanıcı getir",
            description = "Belirtilen ID'ye sahip kullanıcıyı getirir",
            tags = {"Users"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Kullanıcı başarıyla getirildi",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = UserResponseDto.class))}),
            @ApiResponse(responseCode = "404", description = "Kullanıcı bulunamadı"),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })
    @GetMapping("/{id}")
    public UserResponseDto getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user == null) throw new UserNotFoundException("User not found!");
        return userMapper.toResponseDto(user);
    }

    @Operation(
            summary = "Yeni kullanıcı oluştur",
            description = "Yeni bir kullanıcı hesabı oluşturur",
            tags = {"Users"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Kullanıcı başarıyla oluşturuldu",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = UserResponseDto.class))}),
            @ApiResponse(responseCode = "400", description = "Geçersiz giriş verisi"),
            @ApiResponse(responseCode = "409", description = "Kullanıcı adı veya email zaten kullanımda"),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })
    @PostMapping
    public UserResponseDto createUser(@io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Oluşturulacak kullanıcı bilgileri",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserCreateDto.class),
                    examples = @ExampleObject(
                            value = "{ \"username\": \"ali_veli\", \"email\": \"ali_veli@example.com\", \"password\": \"securePassword123\", \"firstName\": \"Ali\", \"lastName\": \"Veli\", \"avatar\": 1 }"
                    )
            )
    ) @RequestBody @Valid UserCreateDto userCreateDto) {
        User user = userMapper.toEntity(userCreateDto);
        User savedUser = userService.saveUser(user);
        return userMapper.toResponseDto(savedUser);
    }

    @Operation(
            summary = "Kullanıcı bilgilerini güncelle",
            description = "Mevcut kullanıcının bilgilerini günceller. Sadece kendi profilinizi güncelleyebilirsiniz.",
            tags = {"Users"},
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Kullanıcı başarıyla güncellendi",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = UserResponseDto.class))}),
            @ApiResponse(responseCode = "400", description = "Geçersiz giriş verisi"),
            @ApiResponse(responseCode = "401", description = "Kimlik doğrulama gerekli"),
            @ApiResponse(responseCode = "403", description = "Bu kullanıcıyı güncelleme yetkiniz yok"),
            @ApiResponse(responseCode = "404", description = "Kullanıcı bulunamadı"),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })
    @PutMapping("/{id}")
    public UserResponseDto updateUser(@Parameter(description = "Güncellenecek kullanıcı ID'si", required = true)
                                      @PathVariable Long id,
                                      @io.swagger.v3.oas.annotations.parameters.RequestBody(
                                              description = "Güncellenecek kullanıcı bilgileri (sadece değiştirilmek istenen alanlar gönderilmelidir)",
                                              required = true,
                                              content = @Content(
                                                      mediaType = "application/json",
                                                      schema = @Schema(implementation = UserUpdateDto.class),
                                                      examples = @ExampleObject(
                                                              value = "{ \"username\": \"new_username\", \"firstName\": \"Yeni Ad\", \"lastName\": \"Yeni Soyad\", \"avatar\": 2, \"password\": \"newPassword123\" }"
                                                      )
                                              )
                                      )
                                      @RequestBody @Valid UserUpdateDto userUpdateDto,
                                      @AuthenticationPrincipal JwtUserDetails currentUser
    ) {
        if (!currentUser.getId().equals(id)) {
            throw new ForbiddenException("Bu kullanıcıyı güncelleme yetkiniz yok!");
        }

        User user = userService.getUserById(id);

        // Sadece gönderilen alanları güncelliyoruz.
        if (userUpdateDto.getUsername() != null && !userUpdateDto.getUsername().isEmpty()) {
            user.setUsername(userUpdateDto.getUsername());
        }

        if (userUpdateDto.getFirstName() != null && !userUpdateDto.getFirstName().isEmpty()) {
            user.setFirstName(userUpdateDto.getFirstName());
        }

        if (userUpdateDto.getLastName() != null && !userUpdateDto.getLastName().isEmpty()) {
            user.setLastName(userUpdateDto.getLastName());
        }

        if (userUpdateDto.getAvatar() != 0) { // Default 0 değilse güncelliyoruz.
            user.setAvatar(userUpdateDto.getAvatar());
        }

        // Parolayı hashliyoruz
        if (userUpdateDto.getPassword() != null && !userUpdateDto.getPassword().isEmpty()) {
            String hashedPassword = passwordEncoder.encode(userUpdateDto.getPassword());
            user.setPassword(hashedPassword);
        }

        User updatedUser = userService.saveUser(user);
        return userMapper.toResponseDto(updatedUser);
    }

    @Operation(
            summary = "Kullanıcı hesabını sil",
            description = "Belirtilen ID'ye sahip kullanıcı hesabını siler. Sadece kendi hesabınızı silebilirsiniz.",
            tags = {"Users"},
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Kullanıcı başarıyla silindi"),
            @ApiResponse(responseCode = "401", description = "Kimlik doğrulama gerekli"),
            @ApiResponse(responseCode = "403", description = "Bu kullanıcıyı silme yetkiniz yok"),
            @ApiResponse(responseCode = "404", description = "Kullanıcı bulunamadı"),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })
    @DeleteMapping("/{id}")
    public void deleteUser(@Parameter(description = "Silinecek kullanıcı ID'si", required = true)
                           @PathVariable Long id,
                           @AuthenticationPrincipal JwtUserDetails currentUser) {
        if (!currentUser.getId().equals(id)) {
            throw new ForbiddenException("Bu kullanıcıyı silme yetkiniz yok!");
        }
        userService.deleteUserById(id);
    }

    @Operation(
            summary = "Mevcut kullanıcı bilgilerini getir",
            description = "Giriş yapmış kullanıcının kendi bilgilerini getirir",
            tags = {"Users"},
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Kullanıcı bilgileri başarıyla getirildi",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = UserResponseDto.class))}),
            @ApiResponse(responseCode = "401", description = "Kimlik doğrulama gerekli"),
            @ApiResponse(responseCode = "404", description = "Kullanıcı bulunamadı"),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })
    @GetMapping("/me")
    public UserResponseDto getCurrentUser(@AuthenticationPrincipal JwtUserDetails currentUser) {
        User user = userService.getUserById(currentUser.getId());
        return userMapper.toResponseDto(user);
    }

    @Operation(
            summary = "Kullanıcı aktivitelerini getir",
            description = "Belirtilen kullanıcının aktivite geçmişini getirir. Sadece kendi aktivitelerinizi görebilirsiniz.",
            tags = {"Users"},
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Aktiviteler başarıyla getirildi",
                    content = {@Content(mediaType = "application/json")}),
            @ApiResponse(responseCode = "401", description = "Kimlik doğrulama gerekli"),
            @ApiResponse(responseCode = "403", description = "Bu kullanıcının aktivitelerini görme yetkiniz yok"),
            @ApiResponse(responseCode = "404", description = "Kullanıcı bulunamadı"),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })
    @GetMapping("/activity/{userId}")
    public List<Object[]> getActivity(@Parameter(description = "Aktiviteleri getirilecek kullanıcı ID'si", required = true)
                                      @PathVariable Long userId,
                                      @AuthenticationPrincipal JwtUserDetails currentUser) {
        if (!currentUser.getId().equals(userId)) {
            throw new ForbiddenException("Bu kullanıcının aktivitelerini görme yetkiniz yok!");
        }
        return userService.getUserActivity(userId);
    }

    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    private void userNotFoundHandler(UserNotFoundException ex) {
        System.out.println(ex.getMessage());
    }
}
