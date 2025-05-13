package com.example.kursovayabackend.mapper;

import com.example.kursovayabackend.entity.Route;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface RouteMapper {
    void save(Route route);
    Optional<Route> findById(Long id);
    List<Route> findAll();
    List<Route> findByUserId(Long userId);
    void update(Route route);
    void deleteById(Long id);
}
