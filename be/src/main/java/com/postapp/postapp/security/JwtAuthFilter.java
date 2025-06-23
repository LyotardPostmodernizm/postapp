package com.postapp.postapp.security;

import com.postapp.postapp.services.UserDetailsServiceImpl;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import static java.security.KeyRep.Type.SECRET;

@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenGenerator jwtTokenGenerator;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        try {
            String token = extractJwtFromRequest(request);
            System.out.println("Extracted JWT Token: " + token);
            if (token != null && jwtTokenGenerator.validateToken(token)) {
                //String userId = jwtTokenGenerator.getUsernameFromToken(token);
                Claims claims = Jwts.parser()
                        .setSigningKey(jwtTokenGenerator.getSecretKey())
                        .parseClaimsJws(token)
                        .getBody();
                Long userId = claims.get("userId", Long.class);
                System.out.println("UserId from Token: " + userId);
                UserDetails user = userDetailsService.loadUserById(Long.valueOf(userId));
                System.out.println("User Details: " + user);
                if (user != null) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            user, null, user.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("Authentication set in SecurityContextHolder for: " + user.getUsername());

                }
            }
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            System.err.println("Error in JwtAuthFilter: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException(e);

        }

    }

    private String extractJwtFromRequest(HttpServletRequest httpServletRequest) {
        String bearer = httpServletRequest.getHeader("Authorization");
        System.out.println("Authorization Header: " + bearer);
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring("Bearer".length() + 1);
        }
        return null;
    }
}
