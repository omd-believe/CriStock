package com.cristock.repository;

import com.cristock.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Long> {

    List<Player> findByActiveTrue();

    Optional<Player> findByName(String name);

    boolean existsByName(String name);
}