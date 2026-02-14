package com.nlite.quickchat.controller;

import com.nlite.quickchat.controller.dto.CreateMessageRequest;
import com.nlite.quickchat.controller.dto.MessageDto;
import com.nlite.quickchat.entity.Message;
import com.nlite.quickchat.entity.User;
import com.nlite.quickchat.service.ConversationService;
import com.nlite.quickchat.service.MessageService;
import com.nlite.quickchat.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;
    private final ConversationService conversationService;

    public MessageController(
            MessageService messageService,
            UserService userService,
            ConversationService conversationService
    ) {
        this.messageService = messageService;
        this.userService = userService;
        this.conversationService = conversationService;
    }

    @GetMapping("/{conversationId}/messages")
    public List<MessageDto> getMessages(@PathVariable UUID conversationId) {
        User me = userService.resolveOrCreate(currentUsername());

        // ✅ security: only members can read
        if (!conversationService.isMember(conversationId, me.getId())) {
            throw new RuntimeException("Not allowed to view this conversation");
        }

        return messageService.findByConversationId(conversationId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @PostMapping("/{conversationId}/messages")
    public MessageDto sendMessage(
            @PathVariable UUID conversationId,
            @RequestBody CreateMessageRequest req
    ) {
        User me = userService.resolveOrCreate(currentUsername());

        if (req == null || req.body() == null || req.body().trim().isEmpty()) {
            throw new IllegalArgumentException("body is required");
        }

        // ✅ security: only members can send
        if (!conversationService.isMember(conversationId, me.getId())) {
            throw new RuntimeException("Not allowed to send to this conversation");
        }

        Message saved = messageService.create(conversationId, me.getUsername(), req.body());
        return toDto(saved);
    }

    private MessageDto toDto(Message m) {
        return new MessageDto(
                userService.nameOf(m.getSenderId()),
                m.getBody(),
                m.getCreatedAt()
        );
    }

    private String currentUsername() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new RuntimeException("Not authenticated");
        }
        return auth.getPrincipal().toString();
    }
}
