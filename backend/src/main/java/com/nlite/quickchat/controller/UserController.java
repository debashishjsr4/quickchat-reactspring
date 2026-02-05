package com.nlite.quickchat.controller;

import com.nlite.quickchat.entity.User;
import com.nlite.quickchat.repository.UserRepository;
import com.nlite.quickchat.service.UserService;
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

    // ensures logged-in user exists + returns all known users (demo-friendly)
    @GetMapping
    public List<String> listUsers(@RequestHeader("X-User") String username) {
        userService.resolveOrCreate(username); // ensure "me" exists
        return userRepository.findAll()
                .stream()
                .map(User::getUsername)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();
    }
}
