package com.nlite.quickchat.controller;

import com.nlite.quickchat.controller.dto.LoginRequest;
import com.nlite.quickchat.controller.dto.LoginResponse;
import com.nlite.quickchat.entity.User;
import com.nlite.quickchat.service.JwtService;
import com.nlite.quickchat.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest req) {
        String username = (req == null || req.username() == null) ? "" : req.username().trim().toLowerCase();
        if (username.isBlank()) throw new IllegalArgumentException("username is required");

        // create user if needed
        User user = userService.resolveOrCreate(username);

        String token = jwtService.issueToken(user.getUsername());
        return new LoginResponse(user.getUsername(), token);
    }
}
