package com.postapp.postapp.mapper;

import com.postapp.postapp.dto.UserCreateDto;
import com.postapp.postapp.dto.UserResponseDto;
import com.postapp.postapp.entities.User;
import org.mapstruct.*;
import org.springframework.stereotype.Component;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = "spring")
@Component
public interface UserMapper {
    // UserCreateDto → User
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "posts", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "likes", ignore = true)
    User toEntity(UserCreateDto userCreateDto);

    // User → UserResponseDto
    @Mapping(target = "fullName", expression = "java(user.getFirstName() + \" \" + user.getLastName())")
    @Mapping(target = "commentCount", expression = "java(user.getComments() != null ? user.getComments().size() : 0)")
    @Mapping(target = "postCount", expression = "java(user.getPosts() != null ? user.getPosts().size() : 0)")
    @Mapping(target = "likeCount", expression = "java(user.getLikes() != null ? user.getLikes().size() : 0)")
    UserResponseDto toResponseDto(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "email", ignore = true) //Kayıtlı bir usrin emaili güncellenemez
    void partialUpdate(UserCreateDto userCreateDto, @MappingTarget User user);
}