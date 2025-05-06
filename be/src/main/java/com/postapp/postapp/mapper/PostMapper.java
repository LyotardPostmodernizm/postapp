package com.postapp.postapp.mapper;

import com.postapp.postapp.dto.PostCreateDto;
import com.postapp.postapp.dto.PostResponseDto;
import com.postapp.postapp.entities.Post;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = "spring",
        uses = {UserMapper.class})
public interface PostMapper {

    // PostCreateDto → Post
    @Mapping(target = "user", ignore = true) // Kullanıcı context'ten alınacak
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "likes", ignore = true)
    Post toEntity(PostCreateDto postCreateDto);

    // Post → PostResponseDto
    @Mapping(target = "authorUsername", source = "user.username")
    @Mapping(target = "commentCount", expression = "java(post.getComments() != null ? post.getComments().size() : 0)")
    @Mapping(target = "likeCount", expression = "java(post.getLikes() != null ? post.getLikes().size() : 0)")
    PostResponseDto toResponseDto(Post post);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partialUpdate(PostCreateDto postCreateDto, @MappingTarget Post post);
}