package com.postapp.postapp.controllers;

import com.postapp.postapp.dto.AuthResponse;
import com.postapp.postapp.dto.UserCreateDto;
import com.postapp.postapp.dto.UserLoginRequest;
import com.postapp.postapp.entities.User;
import com.postapp.postapp.mapper.UserMapper;
import com.postapp.postapp.security.JwtTokenGenerator;
import com.postapp.postapp.services.UserService;
import jakarta.validation.Valid;
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
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody UserLoginRequest userLoginRequest) {
        AuthResponse authResponse = new AuthResponse();
        String email = userLoginRequest.getEmail();
        User user  = userService.getUserByEmail(email);
        if(user == null){
            authResponse.setMessage("Email ya da şifre yanlış!");
            return ResponseEntity.status(401).body(authResponse);

        }
        if(!passwordEncoder.matches(userLoginRequest.getPassword(), user.getPassword())){
            authResponse.setMessage("Email ya da şifre yanlış!");
            return ResponseEntity.status(401).body(authResponse);
        }
        String username = user.getUsername();
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                username, userLoginRequest.getPassword());

        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwtToken = jwtTokenGenerator.generateToken(authentication);
        authResponse.setMessage("Bearer " + jwtToken);
        authResponse.setUserId(user.getId());
        return ResponseEntity.ok(authResponse);

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
            authResponse.setMessage("Böyle bir kullanıcı zaten var!");
            return ResponseEntity.badRequest().body(authResponse);
        }
        if(userService.getUserByEmail(userCreateDto.getEmail()) != null){
            authResponse.setMessage("Bu email zaten kullanımda!");
            return ResponseEntity.badRequest().body(authResponse);
        }

        User user = userMapper.toEntity(userCreateDto);
        user.setPassword(passwordEncoder.encode(userCreateDto.getPassword()));
        userService.saveUser(user);
        authResponse.setUserId(user.getId());
        authResponse.setMessage("Kullanıcı başarıyla kaydedildi!");
        return ResponseEntity.ok(authResponse);
    }
}
