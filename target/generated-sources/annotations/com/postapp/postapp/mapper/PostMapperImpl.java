package com.postapp.postapp.mapper;

import com.postapp.postapp.dto.CommentResponseDto;
import com.postapp.postapp.dto.PostCreateDto;
import com.postapp.postapp.dto.PostResponseDto;
import com.postapp.postapp.entities.Comment;
import com.postapp.postapp.entities.Post;
import com.postapp.postapp.entities.User;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-15T16:38:44+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.7 (Amazon.com Inc.)"
)
@Component
public class PostMapperImpl implements PostMapper {

    @Override
    public Post toEntity(PostCreateDto postCreateDto) {
        if ( postCreateDto == null ) {
            return null;
        }

        Post post = new Post();

        post.setTitle( postCreateDto.getTitle() );
        post.setContent( postCreateDto.getContent() );

        return post;
    }

    @Override
    public PostResponseDto toResponseDto(Post post) {
        if ( post == null ) {
            return null;
        }

        PostResponseDto postResponseDto = new PostResponseDto();

        postResponseDto.setAuthorUsername( postUserUsername( post ) );
        postResponseDto.setUserId( postUserId( post ) );
        postResponseDto.setId( post.getId() );
        postResponseDto.setTitle( post.getTitle() );
        postResponseDto.setContent( post.getContent() );
        postResponseDto.setComments( commentListToCommentResponseDtoList( post.getComments() ) );
        if ( post.getCreatedAt() != null ) {
            postResponseDto.setCreatedAt( LocalDateTime.ofInstant( post.getCreatedAt().toInstant(), ZoneId.of( "UTC" ) ) );
        }
        if ( post.getUpdatedAt() != null ) {
            postResponseDto.setUpdatedAt( LocalDateTime.ofInstant( post.getUpdatedAt().toInstant(), ZoneId.of( "UTC" ) ) );
        }

        postResponseDto.setCommentCount( post.getComments() != null ? post.getComments().size() : 0 );
        postResponseDto.setLikeCount( post.getLikes() != null ? post.getLikes().size() : 0 );

        return postResponseDto;
    }

    @Override
    public void partialUpdate(PostCreateDto postCreateDto, Post post) {
        if ( postCreateDto == null ) {
            return;
        }

        if ( postCreateDto.getTitle() != null ) {
            post.setTitle( postCreateDto.getTitle() );
        }
        if ( postCreateDto.getContent() != null ) {
            post.setContent( postCreateDto.getContent() );
        }
    }

    private String postUserUsername(Post post) {
        User user = post.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getUsername();
    }

    private Long postUserId(Post post) {
        User user = post.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getId();
    }

    protected CommentResponseDto commentToCommentResponseDto(Comment comment) {
        if ( comment == null ) {
            return null;
        }

        CommentResponseDto commentResponseDto = new CommentResponseDto();

        commentResponseDto.setId( comment.getId() );
        commentResponseDto.setText( comment.getText() );
        commentResponseDto.setChildren( commentListToCommentResponseDtoList( comment.getChildren() ) );
        if ( comment.getCreatedAt() != null ) {
            commentResponseDto.setCreatedAt( LocalDateTime.ofInstant( comment.getCreatedAt().toInstant(), ZoneId.of( "UTC" ) ) );
        }
        if ( comment.getUpdatedAt() != null ) {
            commentResponseDto.setUpdatedAt( LocalDateTime.ofInstant( comment.getUpdatedAt().toInstant(), ZoneId.of( "UTC" ) ) );
        }

        return commentResponseDto;
    }

    protected List<CommentResponseDto> commentListToCommentResponseDtoList(List<Comment> list) {
        if ( list == null ) {
            return null;
        }

        List<CommentResponseDto> list1 = new ArrayList<CommentResponseDto>( list.size() );
        for ( Comment comment : list ) {
            list1.add( commentToCommentResponseDto( comment ) );
        }

        return list1;
    }
}
