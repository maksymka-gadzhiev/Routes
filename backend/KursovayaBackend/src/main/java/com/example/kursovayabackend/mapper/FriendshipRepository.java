package com.example.kursovayabackend.mapper;

import com.example.kursovayabackend.entity.Friendship;
import com.example.kursovayabackend.entity.Invite;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface FriendshipRepository {
    void save(Friendship friendship);
    Friendship findById(Long id);
    List<Friendship> findByUserId(Long userId);
    List<Friendship> findByFirstUserIdOrSecondUserId(Long userId);
    List<Invite> findInvitesByUserId(Long userId);
    void deleteById(Long id);
}