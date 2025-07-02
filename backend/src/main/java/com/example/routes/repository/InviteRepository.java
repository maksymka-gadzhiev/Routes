package com.example.routes.repository;

import com.example.routes.entity.Invite;
import com.example.routes.entity.User;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InviteRepository extends JpaRepository<Invite, Long> {
    boolean existsByUserFromAndUserTo(User userFrom, User userTo);

    @Query("SELECT i FROM Invite i " +
            "LEFT JOIN FETCH i.userFrom " +  // Загружаем отправителя
            "LEFT JOIN FETCH i.userTo " +    // Загружаем получателя
            "WHERE i.userTo.userId = :userId")
    List<Invite> findAllByUserToId(@Param("userId") Long userId);

    List<Invite> findByUserTo(User userTo);

    // Найти приглашения по отправителю (userFrom)
    List<Invite> findByUserFrom(User userFrom);

}
