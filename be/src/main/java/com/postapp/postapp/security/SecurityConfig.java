package com.postapp.postapp.security;

import com.postapp.postapp.services.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthEntryPoint jwtAuthEntryPoint;
    private final JwtTokenGenerator jwtTokenGenerator;

    @Bean
    public JwtAuthFilter jwtAuthenticationFilter() {
        return new JwtAuthFilter(jwtTokenGenerator, userDetailsService );
    }


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/users/**").permitAll() // POST dahil tüm /users isteklerine izin veriyoruz ama şimdilik (DEĞİŞECEK!!!)
                        .requestMatchers("/posts/**").permitAll()
                        .requestMatchers("/comments/**").permitAll()
                        .requestMatchers("/likes/**").permitAll()
                        .anyRequest().authenticated()
                )
                // Basic Auth'yu modern DSL ile aktif ediyoruz.
                .httpBasic(Customizer.withDefaults())
                .build();
    }
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    } //Bu da AKTİF EDİLECEK!!!


}