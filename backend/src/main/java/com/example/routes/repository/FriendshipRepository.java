package com.example.routes.repository;

import com.example.routes.entity.Friendship;
import com.example.routes.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    // Проверить существование дружбы в одном направлении
    boolean existsByFirstUserAndSecondUser(User firstUser, User secondUser);

    // Проверить существование дружбы в обратном направлении
    default boolean existsBetweenUsers(User user1, User user2) {
        return existsByFirstUserAndSecondUser(user1, user2) ||
                existsByFirstUserAndSecondUser(user2, user1);
    }
    List<Friendship> findByFirstUserOrSecondUser(User firstUser, User secondUser);
}