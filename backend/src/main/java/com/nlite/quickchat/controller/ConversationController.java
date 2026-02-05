package com.nlite.quickchat.controller;

import com.nlite.quickchat.entity.Conversation;
import com.nlite.quickchat.entity.User;
import com.nlite.quickchat.service.ConversationService;
import com.nlite.quickchat.service.UserService;
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
    public List<Conversation> list(@RequestHeader("X-User") String username) {
        User me = userService.resolveOrCreate(username);
        return conversationService.listForUser(me.getId());
    }

    // NEW: create a direct 1:1 chat with another username
    @PostMapping("/direct")
    public Conversation createDirect(
            @RequestHeader("X-User") String username,
            @RequestBody CreateDirectRequest req
    ) {
        return conversationService.createDirectChat(username, req.otherUsername());
    }

    public record CreateDirectRequest(String otherUsername) {}
}
