package com.nlite.quickchat.controller.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateMessageRequest(
        @NotBlank String body
) {}
