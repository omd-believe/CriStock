package com.cristock.dto.request;

import com.cristock.enums.OrderType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class TradingRequest {

    @NotNull(message = "Player ID is required")
    private Long playerId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than 0")
    private Integer quantity;

    @NotNull(message = "Order type is required")
    private OrderType orderType;

    private BigDecimal limitPrice;
}