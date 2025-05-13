package com.example.kursovayabackend.controller;

import com.example.kursovayabackend.dto.RouteDto;
import com.example.kursovayabackend.entity.Route;
import com.example.kursovayabackend.service.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
public class RouteController {
    private final RouteService routeService;

    @PostMapping()
    public ResponseEntity<Map<String, Object>> createRoute(@RequestBody RouteDto routeDto) {
        Map<String, Object> result = new HashMap<>();
        Route route = routeService.createRoute(routeDto);
        result.put("status", "success");
        result.put("routeId", route.getRouteId());
        result.put("title", route.getTitle());
        return ResponseEntity.ok(result);

    }
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Route>> getRouteByUser(@PathVariable Long userId) {
        try {
            List<Route> routes = routeService.getRouteByUserId(userId);
            return ResponseEntity.ok(routes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
}