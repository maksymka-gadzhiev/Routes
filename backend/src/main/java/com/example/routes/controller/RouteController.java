package com.example.routes.controller;

import com.example.routes.dto.request.GpxExportRequest;
import com.example.routes.dto.request.RouteCreateRequest;
import com.example.routes.dto.response.GpxImportResponse;
import com.example.routes.dto.response.RouteResponse;
import com.example.routes.service.GpxService;
import com.example.routes.service.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;
    private final GpxService gpxService;

    @PostMapping("/create")
    public ResponseEntity<RouteResponse> createRoute(@RequestBody RouteCreateRequest routeRequest) {
        return ResponseEntity.ok(routeService.createRoute(routeRequest));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RouteResponse>> getRouteByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(routeService.getRouteByUserId(userId));
    }

    @GetMapping("/route/{userId}/{routeId}")
    public ResponseEntity<RouteResponse> getDetailRoute(@PathVariable Long userId, @PathVariable Long routeId) {
        return ResponseEntity.ok(routeService.getDetailRoute(userId, routeId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<RouteResponse>> searchRoutes(@RequestParam String query) {
        return ResponseEntity.ok(routeService.searchRoutes(query));
    }

    @GetMapping("/popular")
    public ResponseEntity<List<RouteResponse>> getPopularRoutes() {
        return ResponseEntity.ok(routeService.getPopularRoutes());
    }

    @PostMapping("/export/gpx")
    public ResponseEntity<byte[]> exportRouteToGpx(
            @RequestBody GpxExportRequest request
    ) throws IOException {
        byte[] gpxData = gpxService.exportToGpx(
                request.getTitle(),
                request.getPoints().stream()
                        .map(p -> new GpxService.Point(p.getLat(), p.getLon()))
                        .toList()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + request.getTitle() + ".gpx\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(gpxData);
    }

    @PostMapping("/import/gpx")
    public ResponseEntity<GpxImportResponse> importRouteFromGpx(
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        List<GpxService.Point> points = gpxService.importFromGpx(file.getBytes());

        return ResponseEntity.ok(new GpxImportResponse(
                points.stream()
                        .map(p -> new GpxImportResponse.Point(p.lat(), p.lon()))
                        .toList()
        ));
    }
}
