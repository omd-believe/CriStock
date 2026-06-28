package com.cristock.config;

import com.cristock.entity.User;
import com.cristock.enums.Role;
import com.cristock.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminProperties adminProperties;

    @Override
    public void run(String... args) {

        if (userRepository.existsByEmail(adminProperties.getEmail())) {
            log.info("Admin user already exists.");
            return;
        }

        User admin = User.builder()
                .fullName("System Admin")
                .email(adminProperties.getEmail())
                .password(passwordEncoder.encode(adminProperties.getPassword()))
                .walletBalance(new BigDecimal("1000000.00"))
                .role(Role.ADMIN)
                .build();

        userRepository.save(admin);

        log.info("===========================================");
        log.info("Default Admin Created");
        log.info("Email    : {}", adminProperties.getEmail());
        log.info("Password : {}", adminProperties.getPassword());
        log.info("===========================================");
    }
}