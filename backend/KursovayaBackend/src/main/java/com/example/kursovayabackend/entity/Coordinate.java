package com.example.kursovayabackend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class Coordinate {
    private Long coordinateId;
    private Integer orderNumber;
    @JsonProperty("xLon")
    private Double xLon;
    @JsonProperty("yLat")
    private Double yLat;
    private Double elevation;
    private Long routeId;
}
