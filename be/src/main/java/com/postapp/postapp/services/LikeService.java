package com.postapp.postapp.services;

import com.postapp.postapp.entities.Comment;
import com.postapp.postapp.entities.Like;
import com.postapp.postapp.repositories.LikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;

    public List<Like> getAllLikes(Optional<Long> userId, Optional<Long> postId, Optional<Long> commentId) {
        if(userId.isPresent() && postId.isPresent()){
            return likeRepository.findByUserIdAndPostId(userId.get(), postId.get());
        }
        else if(userId.isPresent() && commentId.isPresent()){
            return likeRepository.findByUserIdAndCommentId(userId.get(),commentId.get());
        }
        else if(postId.isPresent()){
            return likeRepository.findByPostId(postId.get());
        }
        else if(commentId.isPresent()){
            return likeRepository.findByCommentId(commentId.get());
        }
        else if(userId.isPresent()){
            return likeRepository.findByUserId(userId.get());
        }
        else {
            return likeRepository.findAll();
        }

    }
    public Like getLikeById(Long likeId){
        return likeRepository.findById(likeId).orElseThrow(() -> new RuntimeException("Like Bulunamadı!"));
    }

    public Like saveLike(Like like) {
        return likeRepository.save(like);
    }

    public void deleteLike(Long likeId) {
        likeRepository.deleteById(likeId);
    }

}
