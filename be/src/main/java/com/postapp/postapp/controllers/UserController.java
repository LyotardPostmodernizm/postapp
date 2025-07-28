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
        if(user == null) throw new UserNotFoundException("User not found!");
        return userMapper.toResponseDto(user);
    }

    @PostMapping
    public UserResponseDto createUser(@RequestBody @Valid UserCreateDto userCreateDto) {
        User user = userMapper.toEntity(userCreateDto);
        User savedUser = userService.saveUser(user);
        return userMapper.toResponseDto(savedUser);
    }

    @PutMapping("/{id}")
    public UserResponseDto updateUser(@PathVariable Long id, @RequestBody @Valid UserUpdateDto userUpdateDto,
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


    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id,
                           @AuthenticationPrincipal JwtUserDetails currentUser) {
        if (!currentUser.getId().equals(id)) {
            throw new ForbiddenException("Bu kullanıcıyı silme yetkiniz yok!");
        }
        userService.deleteUserById(id);
    }


    @GetMapping("/me")
    public UserResponseDto getCurrentUser(@AuthenticationPrincipal JwtUserDetails currentUser) {
        User user = userService.getUserById(currentUser.getId());
        return userMapper.toResponseDto(user);
    }
    @GetMapping("/activity/{userId}")
    public List<Object[]> getActivity(@PathVariable Long userId,
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
