package com.application.chat_app.repository;

import com.application.chat_app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByCode(String code);
    Optional<User> findByUsername(String username);

    @Query("SELECT u FROM User u WHERE u.email LIKE %:query% OR u.code LIKE %:query%")
    List<User> findByEmailContainingOrCodeContaining(@Param("query") String query);
}
