package com.example.kursovayabackend.dto;

import lombok.Data;

import java.util.List;

@Data
public class RouteDto {
    private String title;
    private String description;
    private String visibility;
    private String status;
    private String difficulty;
    private Long userId;
    private List<CoordinateDto> coordinates;
}

