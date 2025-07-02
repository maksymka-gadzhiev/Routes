package com.example.routes.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class GpxExportRequest {
    private String title;
    private List<Point> points;

    @Data
    public static class Point {
        private double lat;
        private double lon;
    }
}
