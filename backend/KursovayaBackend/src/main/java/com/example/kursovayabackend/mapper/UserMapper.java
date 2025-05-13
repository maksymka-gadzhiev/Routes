package com.example.kursovayabackend.mapper;

import com.example.kursovayabackend.entity.UserEntity;
import com.graphhopper.json.Statement;
import org.apache.catalina.User;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface UserMapper {
    void save(UserEntity user);
    Optional<UserEntity> findById(Long userid);
    Optional<UserEntity> findByEmail(String email);
    void update(UserEntity user);
    void deleteById(Long userid);
    Optional<UserEntity> findByEmailContains(String login);
}
