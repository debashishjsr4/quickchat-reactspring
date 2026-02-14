package com.nlite.quickchat.controller;

import com.nlite.quickchat.entity.Conversation;
import com.nlite.quickchat.entity.User;
import com.nlite.quickchat.service.ConversationService;
import com.nlite.quickchat.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationService conversationService;
    private final UserService userService;

    public ConversationController(ConversationService conversationService, UserService userService) {
        this.conversationService = conversationService;
        this.userService = userService;
    }

    @GetMapping
    public List<Conversation> list() {
        String username = currentUsername();
        User me = userService.resolveOrCreate(username);
        return conversationService.listForUser(me.getId());
    }

    @PostMapping("/direct")
    public Conversation createDirect(@RequestBody CreateDirectRequest req) {
        String username = currentUsername();

        if (req == null || req.otherUsername() == null || req.otherUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("otherUsername is required");
        }

        return conversationService.createDirectChat(username, req.otherUsername());
    }

    private String currentUsername() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new RuntimeException("Not authenticated");
        }
        return auth.getPrincipal().toString();
    }

    public record CreateDirectRequest(String otherUsername) {}
}
