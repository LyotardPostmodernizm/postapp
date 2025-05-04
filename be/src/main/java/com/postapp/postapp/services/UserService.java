package com.postapp.postapp.services;

import com.postapp.postapp.entities.User;
import com.postapp.postapp.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User saveUser(User newUser) {
        return userRepository.save(newUser);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User updateUser(Long id, User newUser) {
        Optional<User> oldUser = userRepository.findById(id);
        if (oldUser.isPresent()) {
            User existingUser = oldUser.get();
            existingUser.setFirstName(newUser.getFirstName());
            existingUser.setLastName(newUser.getLastName());
            existingUser.setEmail(newUser.getEmail());
//            existingUser.setUsername(existingUser.getUsername());
//            existingUser.setPassword(existingUser.getPassword());
//            existingUser.setAvatar(existingUser.getAvatar()); Bunlar için ayrı bir mantık eklenecek.

            return userRepository.save(newUser);
        }
        else return null;
    }

    public void deleteUserById(Long id) {
        userRepository.deleteById(id);
    }
}
