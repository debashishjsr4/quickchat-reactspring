package com.nlite.quickchat.controller.dto;

import java.time.Instant;

public record MessageDto(
        String senderName,
        String body,
        Instant createdAt
) {}
