package com.postapp.postapp.controllers;

import com.postapp.postapp.dto.AuthResponse;
import com.postapp.postapp.dto.UserCreateDto;
import com.postapp.postapp.dto.UserLoginRequest;
import com.postapp.postapp.entities.User;
import com.postapp.postapp.mapper.UserMapper;
import com.postapp.postapp.security.JwtTokenGenerator;
import com.postapp.postapp.services.UserService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
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
@AllArgsConstructor
@RequestMapping("/auth")
public class AuthController {
    private  AuthenticationManager authenticationManager;
    private  JwtTokenGenerator jwtTokenGenerator;
    private  UserService userService;
    private  UserMapper userMapper;
    private  PasswordEncoder passwordEncoder;

    @PostMapping("/login") //Login olduktan sonra userId ve Bearer + jwt token dönecek
    public AuthResponse login(@RequestBody UserLoginRequest userLoginRequest) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                userLoginRequest.getUsername(), userLoginRequest.getPassword());

        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwtToken = jwtTokenGenerator.generateToken(authentication);

        User user = userService.getUserByUsername(userLoginRequest.getUsername());
        AuthResponse authResponse = new AuthResponse();
        authResponse.setMessage("Bearer " + jwtToken);
        authResponse.setUserId(user.getId());
        return authResponse;

    }

    @PostMapping("/register") //register olduktan sonra sadece message dönecek
    public ResponseEntity<AuthResponse> register(@RequestBody UserCreateDto userCreateDto) {
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
        if(userService.getUserByUsername(userCreateDto.getUsername()) != null){
            authResponse.setMessage("Kullanıcı zaten var!");
            return ResponseEntity.badRequest().body(authResponse);
        }

        User user = userMapper.toEntity(userCreateDto);
        user.setPassword(passwordEncoder.encode(userCreateDto.getPassword()));
        userService.saveUser(user);
        authResponse.setMessage("Kullanıcı, başarıyla kaydedildi!");
        return ResponseEntity.ok(authResponse);
    }
}
