package com.postapp.postapp.mapper;

import com.postapp.postapp.dto.LikeCreateDto;
import com.postapp.postapp.dto.LikeResponseDto;
import com.postapp.postapp.entities.Like;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
@Component
public interface LikeMapper {
    @Mapping(target = "post", ignore = true)
    @Mapping(target = "comment", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true) // Otomatik set edileceği için
    @Mapping(target="id", ignore = true)
    Like toEntity(LikeCreateDto likeCreateDto);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "postId", source = "post.id")
    @Mapping(target = "commentId", source = "comment.id")
    LikeResponseDto toResponseDto(Like like);
}