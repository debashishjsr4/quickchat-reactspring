package com.nlite.quickchat.service;

import com.nlite.quickchat.entity.Message;
import com.nlite.quickchat.entity.User;
import com.nlite.quickchat.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserService userService;

    public MessageService(MessageRepository messageRepository,
                          UserService userService) {
        this.messageRepository = messageRepository;
        this.userService = userService;
    }

    public List<Message> findByConversationId(UUID conversationId) {
        return messageRepository.findRecentByConversationId(conversationId);
    }

    public Message create(UUID conversationId, String username, String body) {
        User user = userService.resolveOrCreate(username);

        Message m = new Message();
        m.setConversationId(conversationId);
        m.setSenderId(user.getId());   // store the user UUID
        m.setBody(body);

        return messageRepository.save(m);
    }
}
