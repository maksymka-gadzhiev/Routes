package com.example.kursovayabackend.service;

import com.example.kursovayabackend.dto.*;
import com.example.kursovayabackend.entity.Coordinate;
import com.example.kursovayabackend.entity.Route;
import com.example.kursovayabackend.mapper.CoordinateMapper;
import com.example.kursovayabackend.mapper.RouteMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class RouteService {
    private final RouteMapper routeMapper;
    private final CoordinateMapper coordinateMapper;

    @Transactional
    public Route createRoute(RouteDto routeDto) {
        Route route = new Route();
        route.setTitle(routeDto.getTitle());
        route.setDescription(routeDto.getDescription());
        route.setVisibility(routeDto.getVisibility());
        route.setStatus("draft");
        route.setDifficulty(routeDto.getDifficulty());
        route.setUserId(routeDto.getUserId());
        route.setAvgRating(0.0);

        routeMapper.save(route);

        if (route.getRouteId() == null) {
            throw new IllegalStateException("Failed to generate route ID");
        }
        List<Coordinate> coordinates = routeDto.getCoordinates().stream()
                .map(dto -> {
                    Coordinate coordinate = new Coordinate();
                    coordinate.setXLon(dto.getX());
                    coordinate.setYLat(dto.getY());
                    coordinate.setElevation(
                            dto.getElevation() != null && !dto.getElevation().isEmpty()
                                    ? Double.parseDouble(dto.getElevation())
                                    : 0.0
                    );
                    coordinate.setOrderNumber(dto.getOrderNumber());
                    coordinate.setRouteId(route.getRouteId());
                    return coordinate;
                })
                .collect(Collectors.toList());

        if (!coordinates.isEmpty()) {
            coordinateMapper.save(coordinates);
        }

        route.setCoordinates(coordinates);
        return route;
    }

    public List<Route> getRouteByUserId(Long userId) {
        List<Route> routes = routeMapper.findByUserId(userId);

        routes.forEach(route -> {
            List<Coordinate> coordinates = coordinateMapper.findByRouteId(route.getRouteId());
            route.setCoordinates(coordinates);
        });

        return routes;
    }
}