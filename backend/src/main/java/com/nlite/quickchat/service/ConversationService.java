package com.nlite.quickchat.service;

import com.nlite.quickchat.entity.Conversation;
import com.nlite.quickchat.entity.ConversationMember;
import com.nlite.quickchat.entity.User;
import com.nlite.quickchat.repository.ConversationMemberRepository;
import com.nlite.quickchat.repository.ConversationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository memberRepository;
    private final UserService userService;

    public ConversationService(
            ConversationRepository conversationRepository,
            ConversationMemberRepository memberRepository,
            UserService userService
    ) {
        this.conversationRepository = conversationRepository;
        this.memberRepository = memberRepository;
        this.userService = userService;
    }

    // list conversations where user is a member
    public List<Conversation> listForUser(UUID userId) {
        List<UUID> convIds = memberRepository.findByUserId(userId)
                .stream()
                .map(ConversationMember::getConversationId)
                .toList();

        if (convIds.isEmpty()) return List.of();
        return conversationRepository.findAllById(convIds);
    }

    // create a 1:1 chat between username and otherUsername
    public Conversation createDirectChat(String username, String otherUsername) {
        User me = userService.resolveOrCreate(username);
        User other = userService.resolveOrCreate(otherUsername);

        UUID meId = me.getId();
        UUID otherId = other.getId();

        // 1) Find if a direct chat already exists between these two users
        // Simple approach (good for teaching): scan direct conversations and check membership.
        List<Conversation> directConvs = conversationRepository.findByGroupChatFalse();

        for (Conversation c : directConvs) {
            List<ConversationMember> members = memberRepository.findByConversationId(c.getId());
            if (members.size() != 2) continue;

            boolean hasMe = members.stream().anyMatch(m -> m.getUserId().equals(meId));
            boolean hasOther = members.stream().anyMatch(m -> m.getUserId().equals(otherId));

            if (hasMe && hasOther) {
                return c; // ✅ reuse existing conversation
            }
        }

        // 2) Otherwise create a new one
        Conversation c = new Conversation();
        c.setGroupChat(false);
        c.setTitle(other.getUsername());

        // If your Conversation has ownerId NOT NULL, keep this:
        c.setOwnerId(meId);

        Conversation saved = conversationRepository.save(c);

        memberRepository.save(new ConversationMember(saved.getId(), meId));
        memberRepository.save(new ConversationMember(saved.getId(), otherId));

        return saved;
    }


    public boolean isMember(UUID conversationId, UUID userId) {
        return memberRepository.existsByConversationIdAndUserId(conversationId, userId);
    }
}
