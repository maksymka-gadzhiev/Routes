package com.example.routes.service;

import com.example.routes.dto.request.RouteCreateRequest;
import com.example.routes.dto.response.RouteResponse;
import com.example.routes.entity.*;
import com.example.routes.exception.ResourceNotFoundException;
import com.example.routes.repository.RouteRepository;
import com.example.routes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final RouteRepository routeRepository;
    private final UserRepository userRepository;

    @Transactional
    public RouteResponse createRoute(RouteCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        Route route = new Route();
        route.setTitle(request.getTitle());
        route.setDescription(request.getDescription());
        route.setVisibility(request.getVisibility());
        route.setStatus(request.getStatus());
        route.setDifficulty(request.getDifficulty());
        route.setDistance(request.getDistance());
        route.setCategory(request.getCategory());
        route.setUser(user);
        route.setCreatedAt(LocalDateTime.now());
        List<Coordinate> coordinates = request.getCoordinates().stream()
                .map(dto -> {
                    if (dto.getXLon() == null || dto.getYLat() == null) {
                        throw new IllegalArgumentException("xLon and yLat are required for coordinates");
                    }
                    Coordinate coord = new Coordinate();
                    coord.setOrderNumber(dto.getOrderNumber());
                    coord.setXLon(dto.getXLon());
                    coord.setYLat(dto.getYLat());
                    coord.setElevation(dto.getElevation());
                    coord.setRoute(route);
                    return coord;
                })
                .collect(Collectors.toList());

        route.setCoordinates(coordinates);

        Route savedRoute = routeRepository.save(route);
        return convertToResponse(savedRoute);
    }

    private RouteResponse convertToResponse(Route route) {
        RouteResponse response = new RouteResponse();
        response.setRouteId(route.getRouteId());
        response.setTitle(route.getTitle());
        response.setDescription(route.getDescription());
        response.setVisibility(route.getVisibility());
        response.setStatus(route.getStatus());
        response.setDifficulty(route.getDifficulty());
        response.setCategory(route.getCategory().name());
        response.setAvgRating(route.getAvgRating());
        response.setDistance(route.getDistance());
        response.setCreatedAt(route.getCreatedAt());
        response.setUpdatedAt(route.getUpdatedAt());
        response.setUserId(route.getUser().getUserId());

        List<RouteResponse.CoordinateResponse> coordinateResponses =
                route.getCoordinates().stream()
                        .map(coord -> {
                            RouteResponse.CoordinateResponse cr = new RouteResponse.CoordinateResponse();
                            cr.setCoordinateId(coord.getCoordinateId());
                            cr.setOrderNumber(coord.getOrderNumber());
                            cr.setXLon(coord.getXLon());
                            cr.setYLat(coord.getYLat());
                            cr.setElevation(coord.getElevation());
                            return cr;
                        })
                        .collect(Collectors.toList());

        response.setCoordinates(coordinateResponses);
        return response;
    }

    public List<RouteResponse> getRouteByUserId(Long userId) {
        List<Route> routes = routeRepository.findByUser_UserId(userId);
        return routes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RouteResponse getDetailRoute(Long userId, Long routeId) {
        Route route = routeRepository.findByUserIdAndRouteIdWithCoordinates(userId, routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + routeId));
        return convertToResponse(route);
    }

    public List<RouteResponse> searchRoutes(String query) {
        List<Route> routes = routeRepository.findByTitleContainingIgnoreCase(query);
        return routes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<RouteResponse> getPopularRoutes() {
        // Пример: топ-6 маршрутов по рейтингу
        Pageable topSix = PageRequest.of(0, 6, Sort.by(Sort.Direction.DESC, "avgRating"));
        return routeRepository.findAll(topSix).getContent()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
}