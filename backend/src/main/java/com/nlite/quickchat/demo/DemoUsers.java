package com.nlite.quickchat.demo;

import java.util.Map;
import java.util.UUID;

public final class DemoUsers {

    private static final Map<String, UUID> USERS = Map.of(
            "alice", UUID.fromString("00000000-0000-0000-0000-000000000002"),
            "bob",   UUID.fromString("00000000-0000-0000-0000-000000000005")
    );

    public static UUID resolve(String username) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Missing X-User header");
        }

        UUID id = USERS.get(username.toLowerCase());
        if (id == null) {
            throw new IllegalArgumentException("Unknown user: " + username);
        }

        return id;
    }

    private DemoUsers() {}
}
