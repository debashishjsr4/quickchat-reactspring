package com.nlite.quickchat.controller;

import com.nlite.quickchat.entity.User;
import com.nlite.quickchat.repository.UserRepository;
import com.nlite.quickchat.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    public UserController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @GetMapping
    public List<String> listUsers() {
        String username = currentUsername();
        userService.resolveOrCreate(username); // ensure "me" exists

        return userRepository.findAll()
                .stream()
                .map(User::getUsername)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();
    }

    private String currentUsername() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new RuntimeException("Not authenticated");
        }
        return auth.getPrincipal().toString();
    }
}
