package com.example.routes.service;

import io.jenetics.jpx.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GpxService {

    public byte[] exportToGpx(String title, List<GpxService.Point> points) throws IOException {
        // Создаем маршрут с точками
        Route route = Route.builder()
                .name(title)
                .points(points.stream()
                        .map(p -> WayPoint.builder()
                                .lat(p.lat())
                                .lon(p.lon())
                                .build())
                        .collect(Collectors.toList()))
                .build();

        // Создаем объект GPX
        GPX gpx = GPX.builder()
                .addRoute(route)
                .creator("Marshruti")
                .build();

        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            GPX.write(gpx, os);
            return os.toByteArray();
        }
    }

    public List<Point> importFromGpx(byte[] gpxData) throws IOException {
        try (ByteArrayInputStream is = new ByteArrayInputStream(gpxData)) {
            GPX gpx = GPX.read(is);
            return gpx.getRoutes().stream()
                    .flatMap(route -> route.getPoints().stream())
                    .map(p -> new Point(p.getLatitude().doubleValue(), p.getLongitude().doubleValue()))
                    .collect(Collectors.toList());
        }
    }

    public record Point(double lat, double lon) {}
}