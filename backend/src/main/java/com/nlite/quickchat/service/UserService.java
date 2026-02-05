package com.nlite.quickchat.service;

import com.nlite.quickchat.entity.User;
import com.nlite.quickchat.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User resolveOrCreate(String usernameRaw) {
        String username = normalize(usernameRaw);
        if (username.isBlank()) {
            throw new IllegalArgumentException("X-User header is required");
        }

        return userRepository.findByUsernameIgnoreCase(username)
                .orElseGet(() -> {
                    try {
                        return userRepository.save(new User(username));
                    } catch (DataIntegrityViolationException e) {
                        // race condition: two requests created same user concurrently
                        return userRepository.findByUsernameIgnoreCase(username)
                                .orElseThrow();
                    }
                });
    }

    public String nameOf(UUID userId) {
        return userRepository.findById(userId)
                .map(User::getUsername)
                .orElse("unknown");
    }

    private String normalize(String s) {
        if (s == null) return "";
        String u = s.trim();
        if (u.length() > 50) u = u.substring(0, 50);
        return u;
    }
}
