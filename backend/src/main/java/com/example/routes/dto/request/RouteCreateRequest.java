package com.example.routes.dto.request;

import com.example.routes.enums.RouteCategory;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class RouteCreateRequest {
    private String title;
    private String description;
    private String visibility;
    private String status;
    private String difficulty;
    private Double distance;
    private RouteCategory category;
    private List<CoordinateDto> coordinates;
    private Long userId;

    @Data
    public static class CoordinateDto {
        private Integer orderNumber;

        @JsonProperty("xLon")
        private Double xLon;
        @JsonProperty("yLat")
        private Double yLat;
        private Double elevation;
    }
}