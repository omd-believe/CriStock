package com.cristock.service.impl;

import com.cristock.dto.response.LeaderboardResponse;
import com.cristock.entity.Player;
import com.cristock.repository.PlayerRepository;
import com.cristock.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardServiceImpl implements LeaderboardService {

    private final PlayerRepository playerRepository;

    @Override
    public List<LeaderboardResponse> getTopGainers() {

        return playerRepository.findByActiveTrue()
                .stream()
                .sorted(Comparator.comparing(this::percentageChange).reversed())
                .limit(10)
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<LeaderboardResponse> getTopLosers() {

        return playerRepository.findByActiveTrue()
                .stream()
                .sorted(Comparator.comparing(this::percentageChange))
                .limit(10)
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<LeaderboardResponse> getTopMarketCap() {

        return playerRepository.findTop10ByOrderByMarketCapDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private LeaderboardResponse mapToResponse(Player player) {

        BigDecimal priceChange =
                player.getCurrentPrice().subtract(player.getPreviousPrice());

        BigDecimal percentageChange = percentageChange(player);

        return LeaderboardResponse.builder()
                .playerId(player.getId())
                .playerName(player.getName())
                .team(player.getTeam())
                .currentPrice(player.getCurrentPrice())
                .previousPrice(player.getPreviousPrice())
                .marketCap(player.getMarketCap())
                .priceChange(priceChange)
                .percentageChange(percentageChange)
                .build();
    }

    private BigDecimal percentageChange(Player player) {

        if (player.getPreviousPrice() == null
                || player.getPreviousPrice().compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return player.getCurrentPrice()
                .subtract(player.getPreviousPrice())
                .divide(player.getPreviousPrice(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }
}