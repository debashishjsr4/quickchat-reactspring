package com.nlite.quickchat.repository;

import com.nlite.quickchat.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("select m from Message m where m.conversationId = :cid order by m.createdAt desc")
    List<Message> findRecentByConversationId(@Param("cid") UUID conversationId);
}
