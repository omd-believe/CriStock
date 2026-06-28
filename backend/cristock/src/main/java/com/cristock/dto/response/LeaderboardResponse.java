package com.cristock.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class LeaderboardResponse {

    private Long playerId;
    private String playerName;
    private String team;

    private BigDecimal currentPrice;
    private BigDecimal previousPrice;
    private BigDecimal marketCap;

    private BigDecimal priceChange;
    private BigDecimal percentageChange;
}