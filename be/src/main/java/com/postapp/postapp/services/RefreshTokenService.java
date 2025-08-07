package com.postapp.postapp.services;

import com.postapp.postapp.entities.RefreshToken;
import com.postapp.postapp.entities.User;
import com.postapp.postapp.repositories.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.UUID;



@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    @Value("${postapp.refresh.token.expires.in}")
    private  Long expirationTime;
    private final RefreshTokenRepository refreshTokenRepository;

    public boolean isExpired(RefreshToken refreshToken) {
        ZonedDateTime turkeyTime = ZonedDateTime.now(ZoneId.of("Europe/Istanbul"));
        LocalDateTime now = turkeyTime.toLocalDateTime();
        return refreshToken.getExpirationDate().isBefore(now);
    }

    public String createRefreshToken(User user) {
        RefreshToken token = refreshTokenRepository.findByUserId(user.getId());
        if (token == null) {
            token = new RefreshToken();
            token.setUser(user);
        }

        token.setToken(UUID.randomUUID().toString());


        ZonedDateTime turkeyTime = ZonedDateTime.now(ZoneId.of("Europe/Istanbul"));
        LocalDateTime expirationDateTime = turkeyTime.plusSeconds(expirationTime).toLocalDateTime();
        token.setExpirationDate(expirationDateTime);

        refreshTokenRepository.save(token);
        return token.getToken();
    }


    public RefreshToken getByUserId(Long userId) {
        return refreshTokenRepository.findByUserId(userId);
    }
}
