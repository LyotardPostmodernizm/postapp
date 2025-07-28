package com.postapp.postapp.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtTokenGenerator {

    @Value("${postapp.jwt.secret}")
    private String SECRET;

    @Value("${postapp.expiration.time}")
    private long EXPIRATION_TIME;


    public String generateToken(Authentication authentication) {
        JwtUserDetails jwtUserDetails = authentication.getPrincipal().equals("anonymousUser")
                ? null : (JwtUserDetails) authentication.getPrincipal();

        Date expireDate = new Date(new Date().getTime() + EXPIRATION_TIME);

        if (jwtUserDetails == null) {
            throw new SignatureException("Invalid token");
        }

        return Jwts.builder()
                .setSubject(jwtUserDetails.getUsername())
                .claim("userId", jwtUserDetails.getId())
                .setIssuedAt(new Date())
                .setExpiration(expireDate)
                .signWith(SignatureAlgorithm.HS512, SECRET)
                .compact();

    }
    public String generateTokenByUserId(Long userId) {
        Date expireDate = new Date(new Date().getTime() + EXPIRATION_TIME);
        return Jwts.builder()
                .setSubject(Long.toString(userId))
                .claim("userId", userId)
                .setIssuedAt(new Date())
                .setExpiration(expireDate)
                .signWith(SignatureAlgorithm.HS512, SECRET)
                .compact();
    }


    public String getUsernameFromToken(String token) {
        return Jwts.parser().setSigningKey(SECRET).parseClaimsJws(token).getBody().getSubject();
    }

    public Long getUserIdFromToken(String token) {
        return Jwts.parser().setSigningKey(SECRET).parseClaimsJws(token).getBody().getSubject() == null
                ? null : Long.parseLong(getUsernameFromToken(token));
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(SECRET).parseClaimsJws(token);

            return !isExpired(token);
        } catch (Exception e) {
            System.out.println("Invalid JWT Token: " + e.getMessage());
            return false;
        }
    }

    private boolean isExpired(String token) {
        Date expirationDate = Jwts.parser().setSigningKey(SECRET).parseClaimsJws(token).getBody().getExpiration();
        return new Date().after(expirationDate);
    }


    public String getSecretKey() {
        return SECRET;
    }
}
