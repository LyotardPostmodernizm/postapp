package com.postapp.postapp.mapper;

import com.postapp.postapp.dto.CommentCreateDto;
import com.postapp.postapp.dto.CommentResponseDto;
import com.postapp.postapp.entities.Comment;
import org.mapstruct.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = "spring",
        uses = {UserMapper.class})
@Component
public interface CommentMapper {

    // CommentCreateDto → Comment
    @Mapping(target = "parent", ignore = true) // Parent el ile işlenecek
    @Mapping(target = "user", ignore = true) // Kullanıcı, context'ten alınacak
    @Mapping(target = "post", ignore = true) // Post ID, path variable'dan alınacak
    @Mapping(target = "likes" ,ignore = true)
    Comment toEntity(CommentCreateDto commentCreateDto);

    // Comment → CommentResponseDto
    @Mapping(target = "authorUsername", source = "user.username")
    @Mapping(target = "postId", source = "post.id")
    @Mapping(target = "parentCommentId", source = "parent.id")
    @Mapping(target = "likeCount", expression = "java(comment.getLikes() != null ? comment.getLikes().size() : 0)")
    @Mapping(target = "children", qualifiedByName = "mapChildren")
    @Mapping(target = "authorAvatar", source = "user.avatar")
    CommentResponseDto toResponseDto(Comment comment);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partialUpdate(CommentCreateDto commentCreateDto, @MappingTarget Comment comment);

    @Named("mapChildren")
    default List<CommentResponseDto> mapChildren(List<Comment> children) {
        return children.stream()
                .map(this::toResponseDto)
                .toList();
    }
}