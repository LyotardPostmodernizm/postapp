package com.postapp.postapp.controllers;

import com.postapp.postapp.dto.UserCreateDto;
import com.postapp.postapp.dto.UserResponseDto;
import com.postapp.postapp.entities.User;
import com.postapp.postapp.exceptions.ForbiddenException;
import com.postapp.postapp.mapper.UserMapper;
import com.postapp.postapp.security.JwtUserDetails;
import com.postapp.postapp.services.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserMapper userMapper;
   private final PasswordEncoder passwordEncoder;

    @GetMapping
    public List<UserResponseDto> getAllUsers() {
        return userService.getAllUsers().stream()
                .map(userMapper::toResponseDto)
                .toList();

    }

    @GetMapping("/{id}")
    public UserResponseDto getUserById(@PathVariable Long id) {
        User user =userService.getUserById(id);
        return userMapper.toResponseDto(user);
    }

    @PostMapping
    public UserResponseDto createUser(@RequestBody @Valid UserCreateDto userCreateDto) {
        User user = userMapper.toEntity(userCreateDto);
        User savedUser = userService.saveUser(user);
        return userMapper.toResponseDto(savedUser);
    }

    @PutMapping("/{id}")
    public UserResponseDto updateUser(@PathVariable Long id, @RequestBody @Valid UserCreateDto userCreateDto,
                                      @AuthenticationPrincipal JwtUserDetails currentUser
    ) {
        if (!currentUser.getId().equals(id)) {
            System.out.println("Current user's id: "+currentUser.getId());
            throw new ForbiddenException("Bu kullanıcıyı güncelleme yetkiniz yok!");
        }
        System.out.println("Current User: " + currentUser);

        User user = userService.getUserById(id);
        
        userMapper.partialUpdate(userCreateDto, user);

        // Parolayı hashliyoruz
        if (userCreateDto.getPassword() != null && !userCreateDto.getPassword().isEmpty()) {
            String hashedPassword = passwordEncoder.encode(userCreateDto.getPassword());
            user.setPassword(hashedPassword);
        }

        User updatedUser = userService.saveUser(user);
        return userMapper.toResponseDto(updatedUser);
    }


    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUserById(id);
    }

    @GetMapping("/me")
    public UserResponseDto getCurrentUser(@AuthenticationPrincipal JwtUserDetails currentUser) {
        User user = userService.getUserById(currentUser.getId());
        return userMapper.toResponseDto(user);
    }
    @GetMapping("/activity/{userId}")
    public List<Object> getActivity(@PathVariable Long userId) {
        return userService.getUserActivity(userId);
    }
}
