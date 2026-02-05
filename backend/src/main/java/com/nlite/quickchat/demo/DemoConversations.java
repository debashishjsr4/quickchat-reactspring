package com.nlite.quickchat.demo;

import java.util.UUID;

public final class DemoConversations {

    public static UUID resolve(String key) {
        if ("chat-1".equals(key)) {
            return UUID.fromString("00000000-0000-0000-0000-000000000001");
        }
        throw new IllegalArgumentException("Unknown conversation: " + key);
    }

    private DemoConversations() {}
}
