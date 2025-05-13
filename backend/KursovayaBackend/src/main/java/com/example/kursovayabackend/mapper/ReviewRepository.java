package com.example.kursovayabackend.mapper;

import com.example.kursovayabackend.entity.Review;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ReviewRepository {
    void save(Review review);
    Optional<Review> findById(Long id);
    List<Review> findByRouteId(Long routeId);
    void update(Review review);
    void deleteById(Long id);
}
