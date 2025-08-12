package com.postapp.postapp.controllers;

import com.postapp.postapp.dto.AuthResponse;
import com.postapp.postapp.dto.RefreshTokenRequest;
import com.postapp.postapp.dto.UserCreateDto;
import com.postapp.postapp.dto.UserLoginRequest;
import com.postapp.postapp.entities.RefreshToken;
import com.postapp.postapp.entities.User;
import com.postapp.postapp.mapper.UserMapper;
import com.postapp.postapp.security.JwtTokenGenerator;
import com.postapp.postapp.services.RefreshTokenService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/auth")
@Tag(name = "Authentication", description = "Kimlik doğrulama ve yetkilendirme API'leri")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenGenerator jwtTokenGenerator;
    private final UserService userService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    @Operation(
            summary = "Kullanıcı girişi",
            description = "Email ve şifre ile sisteme giriş yapar ve JWT token döner",
            tags = {"Authentication"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Giriş başarılı",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class),
                            examples = @ExampleObject(
                                    value = "{ \"message\": \"Giriş başarılı\", \"accessToken\": \"Bearer eyJhbGciOiJIUzI1NiJ9...\", \"refreshToken\": \"refresh-token-value\", \"userId\": 1 }"
                            ))}),
            @ApiResponse(responseCode = "401", description = "Email veya şifre yanlış",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class),
                            examples = @ExampleObject(
                                    value = "{ \"message\": \"Email ya da şifre yanlış!\", \"accessToken\": null, \"refreshToken\": null, \"userId\": null }"
                            ))}),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })
    @PostMapping("/login") //Login olduktan sonra userId ve Bearer + jwt token dönecek
    public ResponseEntity<AuthResponse> login(@io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Giriş bilgileri",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserLoginRequest.class),
                    examples = @ExampleObject(
                            value = "{ \"email\": \"user@example.com\", \"password\": \"password123\" }"
                    )
            )
    )
                                                  @Valid @RequestBody UserLoginRequest userLoginRequest) {
        AuthResponse authResponse = new AuthResponse();
        String email = userLoginRequest.getEmail();
        User user = userService.getUserByEmail(email);
        if (user == null) {
            authResponse.setMessage("Email ya da şifre yanlış!");
            return ResponseEntity.status(401).body(authResponse);

        }
        if (!passwordEncoder.matches(userLoginRequest.getPassword(), user.getPassword())) {
            authResponse.setMessage("Email ya da şifre yanlış!");
            return ResponseEntity.status(401).body(authResponse);
        }
        String username = user.getUsername();
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                username, userLoginRequest.getPassword());

        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwtToken = jwtTokenGenerator.generateToken(authentication);
        authResponse.setAccessToken("Bearer " + jwtToken);
        authResponse.setRefreshToken(refreshTokenService.createRefreshToken(user));
        authResponse.setUserId(user.getId());
        return ResponseEntity.ok(authResponse);

    }

    @Operation(
            summary = "Kullanıcı kaydı",
            description = "Yeni kullanıcı hesabı oluşturur ve otomatik giriş yapar",
            tags = {"Authentication"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Kayıt başarılı",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class),
                            examples = @ExampleObject(
                                    value = "{ \"message\": \"Kullanıcı başarıyla kaydedildi!\", \"accessToken\": \"Bearer eyJhbGciOiJIUzI1NiJ9...\", \"refreshToken\": \"refresh-token-value\", \"userId\": 1 }"
                            ))}),
            @ApiResponse(responseCode = "400", description = "Geçersiz giriş verisi veya kullanıcı zaten mevcut",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class),
                            examples = {
                                    @ExampleObject(name = "Parola boş",
                                            value = "{ \"message\": \"Parola boş olamaz!\", \"accessToken\": null, \"refreshToken\": null, \"userId\": null }"),
                                    @ExampleObject(name = "Kullanıcı adı mevcut",
                                            value = "{ \"message\": \"Böyle bir kullanıcı zaten var!\", \"accessToken\": null, \"refreshToken\": null, \"userId\": null }"),
                                    @ExampleObject(name = "Email mevcut",
                                            value = "{ \"message\": \"Bu email zaten kullanımda!\", \"accessToken\": null, \"refreshToken\": null, \"userId\": null }")
                            })}),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Kayıt bilgileri",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserCreateDto.class),
                    examples = @ExampleObject(
                            value = "{ \"username\": \"newuser\", \"email\": \"newuser@example.com\", \"password\": \"password123\", \"firstName\": \"Ad\", \"lastName\": \"Soyad\", \"avatar\": 1 }"
                    )
            )
    )
                                                 @RequestBody UserCreateDto userCreateDto) {
        AuthResponse authResponse = new AuthResponse();

        if (userCreateDto.getPassword() == null || userCreateDto.getPassword().isEmpty()) {
            authResponse.setMessage("Parola boş olamaz!");
            return ResponseEntity.badRequest().body(authResponse);
        }
        if (userCreateDto.getUsername() == null || userCreateDto.getUsername().isEmpty()) {
            authResponse.setMessage("Kullanıcı adı boş olamaz!");
            return ResponseEntity.badRequest().body(authResponse);
        }
        if (userCreateDto.getEmail() == null || userCreateDto.getEmail().isEmpty()) {
            authResponse.setMessage("Email boş olamaz!");
            return ResponseEntity.badRequest().body(authResponse);
        }
        if (!userCreateDto.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            authResponse.setMessage("Geçersiz email tipi!");
            return ResponseEntity.badRequest().body(authResponse);
        }
        if (userService.getUserByUsername(userCreateDto.getUsername()) != null) {
            authResponse.setMessage("Böyle bir kullanıcı zaten var!");
            return ResponseEntity.badRequest().body(authResponse);
        }
        if (userService.getUserByEmail(userCreateDto.getEmail()) != null) {
            authResponse.setMessage("Bu email zaten kullanımda!");
            return ResponseEntity.badRequest().body(authResponse);
        }

        User user = userMapper.toEntity(userCreateDto);
        user.setPassword(passwordEncoder.encode(userCreateDto.getPassword()));
        userService.saveUser(user);

        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                new UsernamePasswordAuthenticationToken(userCreateDto.getUsername(), userCreateDto.getPassword());
        Authentication authentication = authenticationManager.authenticate(usernamePasswordAuthenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwtToken = jwtTokenGenerator.generateToken(authentication);

        authResponse.setMessage("Kullanıcı başarıyla kaydedildi!");
        authResponse.setAccessToken("Bearer " + jwtToken);
        authResponse.setRefreshToken(refreshTokenService.createRefreshToken(user));
        authResponse.setUserId(user.getId());
        return ResponseEntity.ok(authResponse);
    }

    @Operation(
            summary = "Token yenileme",
            description = "Refresh token kullanarak yeni access token alır",
            tags = {"Authentication"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token başarıyla yenilendi",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class),
                            examples = @ExampleObject(
                                    value = "{ \"message\": \"Token Yenilendi!\", \"accessToken\": \"Bearer eyJhbGciOiJIUzI1NiJ9...\", \"refreshToken\": null, \"userId\": 1 }"
                            ))}),
            @ApiResponse(responseCode = "401", description = "Refresh token geçersiz",
                    content = {@Content(mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class),
                            examples = @ExampleObject(
                                    value = "{ \"message\": \"Refresh Token Geçerli Değil!\", \"accessToken\": null, \"refreshToken\": null, \"userId\": null }"
                            ))}),
            @ApiResponse(responseCode = "500", description = "Sunucu hatası")
    })
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Refresh token bilgileri",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = RefreshTokenRequest.class),
                            examples = @ExampleObject(
                                    value = "{ \"userId\": 1, \"refreshToken\": \"refresh-token-value\" }"
                            )
                    )
            )
            @RequestBody RefreshTokenRequest refreshTokenRequest)
    {
        AuthResponse authResponse = new AuthResponse();
        RefreshToken token = refreshTokenService.getByUserId(refreshTokenRequest.getUserId());
        if (token.getToken().equals(refreshTokenRequest.getRefreshToken()) && !refreshTokenService.isExpired(token)) {

            User user = token.getUser();
            String jwtToken = jwtTokenGenerator.generateTokenByUserId(user.getId());
            authResponse.setMessage("Token Yenilendi!");
            authResponse.setAccessToken("Bearer " + jwtToken);
            authResponse.setUserId(user.getId());
            return ResponseEntity.ok(authResponse);
        } else {
            authResponse.setMessage("Refresh Token Geçerli Değil!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(authResponse);
        }

    }
}
