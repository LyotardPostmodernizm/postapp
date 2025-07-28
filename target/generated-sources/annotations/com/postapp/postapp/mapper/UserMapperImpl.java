package com.postapp.postapp.mapper;

import com.postapp.postapp.dto.UserCreateDto;
import com.postapp.postapp.dto.UserResponseDto;
import com.postapp.postapp.dto.UserUpdateDto;
import com.postapp.postapp.entities.User;
import java.time.LocalDateTime;
import java.time.ZoneId;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-28T14:36:24+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.7 (Amazon.com Inc.)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public User toEntity(UserCreateDto userCreateDto) {
        if ( userCreateDto == null ) {
            return null;
        }

        User user = new User();

        user.setAvatar( userCreateDto.getAvatar() );
        user.setUsername( userCreateDto.getUsername() );
        user.setPassword( userCreateDto.getPassword() );
        user.setFirstName( userCreateDto.getFirstName() );
        user.setLastName( userCreateDto.getLastName() );
        user.setEmail( userCreateDto.getEmail() );

        return user;
    }

    @Override
    public User toEntity(UserUpdateDto userUpdateDto) {
        if ( userUpdateDto == null ) {
            return null;
        }

        User user = new User();

        user.setAvatar( userUpdateDto.getAvatar() );
        user.setUsername( userUpdateDto.getUsername() );
        user.setPassword( userUpdateDto.getPassword() );
        user.setFirstName( userUpdateDto.getFirstName() );
        user.setLastName( userUpdateDto.getLastName() );
        user.setEmail( userUpdateDto.getEmail() );

        return user;
    }

    @Override
    public UserResponseDto toResponseDto(User user) {
        if ( user == null ) {
            return null;
        }

        UserResponseDto userResponseDto = new UserResponseDto();

        userResponseDto.setId( user.getId() );
        userResponseDto.setUsername( user.getUsername() );
        userResponseDto.setEmail( user.getEmail() );
        userResponseDto.setAvatar( user.getAvatar() );
        if ( user.getCreatedAt() != null ) {
            userResponseDto.setCreatedAt( LocalDateTime.ofInstant( user.getCreatedAt().toInstant(), ZoneId.of( "UTC" ) ) );
        }
        if ( user.getUpdatedAt() != null ) {
            userResponseDto.setUpdatedAt( LocalDateTime.ofInstant( user.getUpdatedAt().toInstant(), ZoneId.of( "UTC" ) ) );
        }

        userResponseDto.setFullName( user.getFirstName() + " " + user.getLastName() );
        userResponseDto.setCommentCount( user.getComments() != null ? user.getComments().size() : 0 );
        userResponseDto.setPostCount( user.getPosts() != null ? user.getPosts().size() : 0 );
        userResponseDto.setLikeCount( user.getLikes() != null ? user.getLikes().size() : 0 );

        return userResponseDto;
    }

    @Override
    public void partialUpdate(UserUpdateDto userUpdateDto, User user) {
        if ( userUpdateDto == null ) {
            return;
        }

        user.setAvatar( userUpdateDto.getAvatar() );
        if ( userUpdateDto.getUsername() != null ) {
            user.setUsername( userUpdateDto.getUsername() );
        }
        if ( userUpdateDto.getPassword() != null ) {
            user.setPassword( userUpdateDto.getPassword() );
        }
        if ( userUpdateDto.getFirstName() != null ) {
            user.setFirstName( userUpdateDto.getFirstName() );
        }
        if ( userUpdateDto.getLastName() != null ) {
            user.setLastName( userUpdateDto.getLastName() );
        }
    }
}
