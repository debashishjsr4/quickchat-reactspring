package com.nlite.quickchat.controller;

import com.nlite.quickchat.controller.dto.CreateMessageRequest;
import com.nlite.quickchat.controller.dto.MessageDto;
import com.nlite.quickchat.entity.Message;
import com.nlite.quickchat.service.MessageService;
import com.nlite.quickchat.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;

    public MessageController(MessageService messageService, UserService userService) {
        this.messageService = messageService;
        this.userService = userService;
    }

    @GetMapping("/{conversationId}/messages")
    public List<MessageDto> getMessages(@PathVariable UUID conversationId) {
        return messageService.findByConversationId(conversationId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @PostMapping("/{conversationId}/messages")
    public MessageDto sendMessage(
            @PathVariable UUID conversationId,
            @RequestBody CreateMessageRequest req,
            @RequestHeader("X-User") String username
    ) {
        Message saved = messageService.create(conversationId, username, req.body());
        return toDto(saved);
    }

    private MessageDto toDto(Message m) {
        return new MessageDto(
                userService.nameOf(m.getSenderId()),
                m.getBody(),
                m.getCreatedAt()
        );
    }
}
