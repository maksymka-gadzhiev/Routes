package com.example.routes.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
public class GpxImportResponse {
    private List<Point> points;
    @Data
    public static class Point {
        private final double lat;
        private final double lon;
    }
}
