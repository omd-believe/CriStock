package com.cristock.dto.response;

import com.cristock.enums.OrderStatus;
import com.cristock.enums.OrderType;
import com.cristock.enums.TransactionType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class OrderResponse {

    private Long orderId;
    private Long playerId;
    private String playerName;
    private TransactionType transactionType;
    private OrderType orderType;
    private OrderStatus status;
    private Integer quantity;
    private BigDecimal limitPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime expiresAt;
}