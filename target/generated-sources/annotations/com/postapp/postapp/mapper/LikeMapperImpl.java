package com.postapp.postapp.mapper;

import com.postapp.postapp.dto.LikeCreateDto;
import com.postapp.postapp.dto.LikeResponseDto;
import com.postapp.postapp.entities.Comment;
import com.postapp.postapp.entities.Like;
import com.postapp.postapp.entities.Post;
import com.postapp.postapp.entities.User;
import java.time.LocalDateTime;
import java.time.ZoneId;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-09T10:17:11+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.7 (Amazon.com Inc.)"
)
@Component
public class LikeMapperImpl implements LikeMapper {

    @Override
    public Like toEntity(LikeCreateDto likeCreateDto) {
        if ( likeCreateDto == null ) {
            return null;
        }

        Like like = new Like();

        return like;
    }

    @Override
    public LikeResponseDto toResponseDto(Like like) {
        if ( like == null ) {
            return null;
        }

        LikeResponseDto likeResponseDto = new LikeResponseDto();

        likeResponseDto.setUserId( likeUserId( like ) );
        likeResponseDto.setPostId( likePostId( like ) );
        likeResponseDto.setCommentId( likeCommentId( like ) );
        likeResponseDto.setId( like.getId() );
        if ( like.getCreatedAt() != null ) {
            likeResponseDto.setCreatedAt( LocalDateTime.ofInstant( like.getCreatedAt().toInstant(), ZoneId.of( "UTC" ) ) );
        }

        return likeResponseDto;
    }

    private Long likeUserId(Like like) {
        User user = like.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getId();
    }

    private Long likePostId(Like like) {
        Post post = like.getPost();
        if ( post == null ) {
            return null;
        }
        return post.getId();
    }

    private Long likeCommentId(Like like) {
        Comment comment = like.getComment();
        if ( comment == null ) {
            return null;
        }
        return comment.getId();
    }
}
