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
            if (token != null && jwtTokenGenerator.validateToken(token)) {
                Claims claims = Jwts.parser()
                        .setSigningKey(jwtTokenGenerator.getSecretKey())
                        .parseClaimsJws(token)
                        .getBody();

                Long userId = claims.get("userId", Long.class);
                if(userId != null) {
                    UserDetails user = userDetailsService.loadUserById(userId);

                    if (user != null) {
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                user, null, user.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                    }
                } else {
                    System.out.println("UserId is null in token claims");
                }
            }
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            System.err.println("Error in JwtAuthFilter: " + e.getMessage());
            e.printStackTrace();
            filterChain.doFilter(request, response);


        }

    }

    private String extractJwtFromRequest(HttpServletRequest httpServletRequest) {
        String bearer = httpServletRequest.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring("Bearer".length() + 1);
        }
        return null;
    }
}
