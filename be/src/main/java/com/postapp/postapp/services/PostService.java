package com.postapp.postapp.services;

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
        return postRepository.findById(id).orElse(null);
    }

    public Post updatePost(Long id, Post newPost) {
        Optional<Post> existingPost = postRepository.findById(id);
        if (existingPost.isPresent()) {
            Post existingPostEntity = existingPost.get();
            existingPostEntity.setTitle(newPost.getTitle());
            existingPostEntity.setContent(newPost.getContent());
            return postRepository.save(existingPostEntity);
        } else {
            return null;
        }
    }
}
