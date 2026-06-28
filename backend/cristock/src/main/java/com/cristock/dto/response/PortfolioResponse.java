package com.cristock.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
public class PortfolioResponse {

    private BigDecimal walletBalance;
    private BigDecimal portfolioValue;
    private BigDecimal investedAmount;
    private BigDecimal profitLoss;
    private List<HoldingResponse> holdings;
}