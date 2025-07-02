package com.example.routes.repository;

import com.example.routes.entity.Route;
import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public interface RouteRepository extends JpaRepository<Route, Long> {
    List<Route> findByUser_UserId(Long userId);
    @Query("SELECT r FROM Route r JOIN FETCH r.coordinates WHERE r.routeId = :routeId AND r.user.userId = :userId")
    Optional<Route> findByUserIdAndRouteIdWithCoordinates(
            @Param("userId") Long userId,
            @Param("routeId") Long routeId
    );

    // Добавьте этот метод
    List<Route> findByTitleContainingIgnoreCase(String title);

    // Для популярных маршрутов
    Page<Route> findAll(Pageable  pageable);
}
