package com.cristock.dto.response;

import com.cristock.enums.PlayerRole;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class PlayerResponse {
    private Long id;
    private String name;
    private String country;
    private String team;
    private PlayerRole role;
    private BigDecimal currentPrice;
    private BigDecimal previousPrice;
    private Integer totalShares;
    private Integer availableShares;
    private BigDecimal marketCap;
    private Boolean active;
}