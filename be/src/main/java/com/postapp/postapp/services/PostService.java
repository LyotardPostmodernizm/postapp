package com.postapp.postapp.services;

import com.postapp.postapp.dto.PostCreateDto;
import com.postapp.postapp.entities.Post;
import com.postapp.postapp.repositories.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;

    public List<Post> getAllPosts(Optional<Long> userId) {
        if (userId.isPresent()) {
            return postRepository.findByUserId(userId.get());
        } else {
            return postRepository.findAll();
        }
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id).orElseThrow(() ->  new RuntimeException("Post bulunamadı!"));
    }

    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }

}
