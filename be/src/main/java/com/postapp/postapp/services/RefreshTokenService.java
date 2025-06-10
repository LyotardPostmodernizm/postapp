package com.postapp.postapp.services;

import com.postapp.postapp.entities.RefreshToken;
import com.postapp.postapp.entities.User;
import com.postapp.postapp.repositories.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    @Value("${refreshToken.expirationTime}")
    private Long expirationTime;
    private final RefreshTokenRepository refreshTokenRepository;

    public boolean isExpired(RefreshToken refreshToken){
        return refreshToken.getExpirationDate().before(new Date());
    }
    public String createRefreshToken(User user){
        RefreshToken token = refreshTokenRepository.findByUserId(user.getId());
        if(token == null) {
            token =	new RefreshToken();
            token.setUser(user);
        }
        token.setToken(UUID.randomUUID().toString());
        token.setExpirationDate(Date.from(Instant.now().plusSeconds(expirationTime)));
        refreshTokenRepository.save(token);
        return token.getToken();
    }

    public RefreshToken getByUserId(Long userId) {
        return refreshTokenRepository.findByUserId(userId);
    }
}
