package com.example.kursovayabackend.mapper;

import com.example.kursovayabackend.entity.Invite;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface InviteRepository {
    void save(Invite invite);
    Invite findById(Long id);
    List<Invite> findByUserId(Long userId);
    List<Invite> findByUserToId(Long userId);
    void deleteById(Long id);
}