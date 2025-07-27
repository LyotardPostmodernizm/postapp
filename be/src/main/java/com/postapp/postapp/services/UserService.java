package com.postapp.postapp.services;

import com.postapp.postapp.entities.User;
import com.postapp.postapp.repositories.CommentRepository;
import com.postapp.postapp.repositories.LikeRepository;
import com.postapp.postapp.repositories.PostRepository;
import com.postapp.postapp.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.sql.Timestamp;
import java.util.stream.Collectors;

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

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<Object[]> getUserActivity(Long userId) {
        List<Long> top10PostIds = postRepository.findTop10ByUserId(userId);
        if (top10PostIds.isEmpty()) {
            return null;
        }
        List<Object[]> commentActivities = commentRepository.findByPostIds(top10PostIds);
        List<Object[]> likeActivities = likeRepository.findByPostIds(top10PostIds);

        List<Object[]> allActivities = new ArrayList<>();
        allActivities.addAll(commentActivities);
        allActivities.addAll(likeActivities);

        allActivities.sort((a, b) -> {
            try {
                // created_at değerlerini karşılaştırıyoruz
                Timestamp dateA = (java.sql.Timestamp) a[4];
                Timestamp dateB = (java.sql.Timestamp) b[4];
                return dateB.compareTo(dateA);
            } catch (Exception e) {
                return 0;
            }
        });

        return allActivities.stream()
                .limit(10)
                .collect(Collectors.toList());
    }
}

