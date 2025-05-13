package com.example.kursovayabackend.dto;

import lombok.Data;

import java.util.List;

@Data
public class GpxExportRequest {
    private String title;
    private List<GpxPoint> coordinates;

    @Data
    public static class GpxPoint {
        private double lat;
        private double lon;
        private String name;
        private Double elevation;
    }
}
