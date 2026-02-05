package com.nlite.quickchat.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "conversation_members",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_conv_member",
                columnNames = {"conversation_id", "user_id"}
        )
)
public class ConversationMember {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    protected ConversationMember() {}

    public ConversationMember(UUID conversationId, UUID userId) {
        this.conversationId = conversationId;
        this.userId = userId;
    }

    public UUID getId() { return id; }
    public UUID getConversationId() { return conversationId; }
    public UUID getUserId() { return userId; }
}
