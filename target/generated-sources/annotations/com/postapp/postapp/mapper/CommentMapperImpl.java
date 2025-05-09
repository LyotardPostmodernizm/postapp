package com.postapp.postapp.mapper;

import com.postapp.postapp.dto.CommentCreateDto;
import com.postapp.postapp.dto.CommentResponseDto;
import com.postapp.postapp.entities.Comment;
import com.postapp.postapp.entities.Post;
import com.postapp.postapp.entities.User;
import java.time.LocalDateTime;
import java.time.ZoneId;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-09T15:24:00+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.7 (Amazon.com Inc.)"
)
@Component
public class CommentMapperImpl implements CommentMapper {

    @Override
    public Comment toEntity(CommentCreateDto commentCreateDto) {
        if ( commentCreateDto == null ) {
            return null;
        }

        Comment comment = new Comment();

        comment.setText( commentCreateDto.getText() );

        return comment;
    }

    @Override
    public CommentResponseDto toResponseDto(Comment comment) {
        if ( comment == null ) {
            return null;
        }

        CommentResponseDto commentResponseDto = new CommentResponseDto();

        commentResponseDto.setAuthorUsername( commentUserUsername( comment ) );
        commentResponseDto.setPostId( commentPostId( comment ) );
        commentResponseDto.setParentCommentId( commentParentId( comment ) );
        commentResponseDto.setChildren( mapChildren( comment.getChildren() ) );
        commentResponseDto.setId( comment.getId() );
        commentResponseDto.setText( comment.getText() );
        if ( comment.getCreatedAt() != null ) {
            commentResponseDto.setCreatedAt( LocalDateTime.ofInstant( comment.getCreatedAt().toInstant(), ZoneId.of( "UTC" ) ) );
        }
        if ( comment.getUpdatedAt() != null ) {
            commentResponseDto.setUpdatedAt( LocalDateTime.ofInstant( comment.getUpdatedAt().toInstant(), ZoneId.of( "UTC" ) ) );
        }

        commentResponseDto.setLikeCount( comment.getLikes() != null ? comment.getLikes().size() : 0 );

        return commentResponseDto;
    }

    @Override
    public void partialUpdate(CommentCreateDto commentCreateDto, Comment comment) {
        if ( commentCreateDto == null ) {
            return;
        }

        if ( commentCreateDto.getText() != null ) {
            comment.setText( commentCreateDto.getText() );
        }
    }

    private String commentUserUsername(Comment comment) {
        User user = comment.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getUsername();
    }

    private Long commentPostId(Comment comment) {
        Post post = comment.getPost();
        if ( post == null ) {
            return null;
        }
        return post.getId();
    }

    private Long commentParentId(Comment comment) {
        Comment parent = comment.getParent();
        if ( parent == null ) {
            return null;
        }
        return parent.getId();
    }
}
