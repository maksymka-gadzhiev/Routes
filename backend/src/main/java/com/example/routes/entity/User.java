package com.example.routes.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import org.hibernate.annotations.Formula;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Вычисляемые поля
    @Formula("(SELECT COUNT(r.route_id) FROM routes r WHERE r.user_id = user_id)")
    private Integer routesCount;

    @Formula("(SELECT COALESCE(SUM(r.distance), 0) FROM routes r WHERE r.user_id = user_id)")
    private Double totalDistance;

    // Связи
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Route> routes;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Review> reviews;

    @OneToMany(mappedBy = "firstUser", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Friendship> initiatedFriendships;

    @OneToMany(mappedBy = "secondUser", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Friendship> receivedFriendships;

    @OneToMany(mappedBy = "userFrom", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Invite> sentInvites;

    @OneToMany(mappedBy = "userTo", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Invite> receivedInvites;
}