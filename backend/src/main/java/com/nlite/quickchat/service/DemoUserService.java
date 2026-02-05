package com.nlite.quickchat.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class DemoUserService {

    private final Map<String, UUID> users = Map.of(
            "alice", UUID.fromString("00000000-0000-0000-0000-000000000001"),
            "bob",   UUID.fromString("00000000-0000-0000-0000-000000000002")
    );

    public UUID idOf(String username) {
        return users.get(username);
    }

    public String nameOf(UUID userId) {
        return users.entrySet()
                .stream()
                .filter(e -> e.getValue().equals(userId))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse("unknown");
    }
}
