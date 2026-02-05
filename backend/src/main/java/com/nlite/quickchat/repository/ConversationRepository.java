package com.nlite.quickchat.repository;

import com.nlite.quickchat.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    List<Conversation> findByOwnerId(UUID ownerId);

    List<Conversation> findByGroupChatFalse();
}
