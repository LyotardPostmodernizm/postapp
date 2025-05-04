package com.postapp.postapp.controllers;

import com.postapp.postapp.entities.Post;
import com.postapp.postapp.services.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @GetMapping
    public List<Post> getAllPosts(@RequestParam(required = false) Optional<Long> userId) {
        return postService.getAllPosts(userId);
    }
    @GetMapping
    public Post getPostById(@PathVariable Long id) {
        return postService.getPostById(id);
    }
    @PutMapping("/{id}")
    public Post updatePost(@PathVariable Long id, @RequestBody Post newPost) {
        return postService.updatePost(id,newPost);
    }

}
