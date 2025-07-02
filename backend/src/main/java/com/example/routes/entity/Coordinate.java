package com.example.routes.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "coordinates")
public class Coordinate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "coordinate_id")
    private Long coordinateId;

    @Column(name = "order_number", nullable = false)
    private Integer orderNumber;

    @Column(name = "x_lon", nullable = false)
    private Double xLon;

    @Column(name = "y_lat", nullable = false)
    private Double yLat;

    private Double elevation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;
}