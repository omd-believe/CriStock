package com.cristock.controller;

import com.cristock.dto.request.TradingRequest;
import com.cristock.dto.response.OrderResponse;
import com.cristock.dto.response.PortfolioResponse;
import com.cristock.dto.response.TransactionResponse;
import com.cristock.service.TradingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trading")
@RequiredArgsConstructor
public class TradingController {

    private final TradingService tradingService;

    @PostMapping("/buy")
    public Object buyShares(
            Authentication authentication,
            @Valid @RequestBody TradingRequest request) {

        return tradingService.buyShares(
                authentication.getName(),
                request
        );
    }


    @PostMapping("/sell")
    public ResponseEntity<Object> sellShares(
            @Valid @RequestBody TradingRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                tradingService.sellShares(authentication.getName(), request)
        );
    }

    @GetMapping("/portfolio")
    public PortfolioResponse getPortfolio(Authentication authentication) {

        return tradingService.getPortfolio(
                authentication.getName()
        );
    }

    @GetMapping("/history")
    public List<TransactionResponse> getTransactionHistory(
            Authentication authentication) {

        return tradingService.getTransactionHistory(
                authentication.getName()
        );
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getOrders(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                tradingService.getOrders(authentication.getName())
        );
    }

    @DeleteMapping("/orders/{orderId}")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable Long orderId,
            Authentication authentication
    ) {

        tradingService.cancelOrder(
                authentication.getName(),
                orderId
        );

        return ResponseEntity.noContent().build();
    }
}