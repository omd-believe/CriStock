package com.cristock.repository;

import com.cristock.entity.Holding;
import com.cristock.entity.Player;
import com.cristock.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HoldingRepository extends JpaRepository<Holding, Long> {

    Optional<Holding> findByUserAndPlayer(User user, Player player);

    List<Holding> findByUser(User user);
}