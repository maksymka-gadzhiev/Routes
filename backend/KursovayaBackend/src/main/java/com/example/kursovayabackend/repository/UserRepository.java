package com.example.kursovayabackend.repository;

import com.example.kursovayabackend.entity.UserEntity;
import com.example.kursovayabackend.mapper.UserMapper;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UserRepository {

    private final UserMapper userMapper;

    @Autowired
    public UserRepository(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public void save(UserEntity user) {
        userMapper.save(user);
    }

    public Optional<UserEntity> getUserById(Long userid) {
        return userMapper.findById(userid);
    }

    public Optional<UserEntity> findByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    public void update(UserEntity user) {
        userMapper.update(user);
    }

    public void deleteById(Long userid) {
        userMapper.deleteById(userid);
    }

    public Optional<UserEntity> findByEmailContains(String email) {
        System.out.println("Searching for email containing: " + email);
        Optional<UserEntity> user = userMapper.findByEmailContains(email);
        System.out.println("Found user: " + user.orElse(null));
        return user;
    }
}