package com.nlite.quickchat.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_username", columnNames = "username")
})
public class User {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 50)
    private String username;

    protected User() {}

    public User(String username) {
        this.username = username;
    }

    public UUID getId() { return id; }
    public String getUsername() { return username; }
}
