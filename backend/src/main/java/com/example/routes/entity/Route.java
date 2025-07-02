package com.example.routes.entity;

import com.example.routes.enums.RouteCategory;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "routes")
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "route_id")
    private Long routeId;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private String visibility;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String difficulty;

    @Column(name = "avg_rating")
    private Double avgRating;

    @Column(nullable = false)
    private Double distance;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RouteCategory category;

    // Связи
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Coordinate> coordinates;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Review> reviews;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}