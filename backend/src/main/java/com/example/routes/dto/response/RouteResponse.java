package com.example.routes.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RouteResponse {
    private Long routeId;
    private String title;
    private String description;
    private String visibility;
    private String status;
    private String difficulty;
    private String category;
    private Double avgRating;
    private Double distance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long userId;
    private List<CoordinateResponse> coordinates;

    @Data
    public static class CoordinateResponse {
        private Long coordinateId;
        private Integer orderNumber;
        private Double xLon;
        private Double yLat;
        private Double elevation;
    }
}