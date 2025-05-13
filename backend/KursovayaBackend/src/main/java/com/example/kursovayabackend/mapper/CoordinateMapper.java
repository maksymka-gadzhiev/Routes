package com.example.kursovayabackend.mapper;

import com.example.kursovayabackend.entity.Coordinate;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
@Mapper
public interface CoordinateMapper {
    void save(List<Coordinate> coordinate);
    List<Coordinate> findByRouteId(Long routeId);
    void deleteById(Long id);
    void deleteByRouteId(Long routeId);
}
