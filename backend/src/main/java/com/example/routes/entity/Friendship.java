package com.example.routes.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "friendships",
        uniqueConstraints = @UniqueConstraint(columnNames = {"first_user_id", "second_user_id"}))
public class Friendship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "friendship_id")
    private Long friendshipId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "first_user_id", nullable = false)
    private User firstUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "second_user_id", nullable = false)
    private User secondUser;
}