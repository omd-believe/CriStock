package com.cristock.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceUpdateResponse {

    private Long playerId;

    private String playerName;

    private BigDecimal currentPrice;

    private BigDecimal previousPrice;

    private BigDecimal marketCap;
}