package com.cristock.repository;

import com.cristock.entity.Player;
import com.cristock.entity.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {

    List<PriceHistory> findByPlayerAndRecordedAtAfterOrderByRecordedAtAsc(
            Player player, LocalDateTime after);


    @Query("SELECT ph FROM PriceHistory ph WHERE ph.player = :player ORDER BY ph.recordedAt DESC")
    List<PriceHistory> findRecentByPlayer(@Param("player") Player player);
}