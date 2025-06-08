package com.postapp.postapp.services;

import com.postapp.postapp.entities.User;
import com.postapp.postapp.repositories.CommentRepository;
import com.postapp.postapp.repositories.LikeRepository;
import com.postapp.postapp.repositories.PostRepository;
import com.postapp.postapp.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User saveUser(User newUser) {
        return userRepository.save(newUser);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("Kullanıcı Bulunamadı!"));
    }

    public void deleteUserById(Long id) {
        userRepository.deleteById(id);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User getUserByEmail(String email){
        return userRepository.findByEmail(email);
    }

    public List<Object> getUserActivity(Long userId) {
        List<Long> top10PostIds = postRepository.findTop10ByUserId(userId);
        if(top10PostIds.isEmpty()){
            return null;
        }
        List<Object> result = List.of(commentRepository.findByPostIds(top10PostIds), likeRepository.findByPostIds(top10PostIds));
       return result;

    }
}
