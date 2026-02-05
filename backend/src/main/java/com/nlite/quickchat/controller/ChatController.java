package com.nlite.quickchat.controller;

import com.nlite.quickchat.controller.dto.CreateMessageRequest;
import com.nlite.quickchat.demo.DemoUsers;
import com.nlite.quickchat.entity.Message;
import com.nlite.quickchat.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private static final UUID CONVERSATION_ID =
            UUID.fromString("00000000-0000-0000-0000-000000000001");

    private final MessageService messageService;

    public ChatController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/send")
    public Message send(@RequestBody CreateMessageRequest body, HttpServletRequest request) {
        String username = request.getHeader("X-User");   // "alice" / "bob"
        return messageService.create(CONVERSATION_ID, username, body.body());
    }
}
