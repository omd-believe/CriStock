package com.cristock.controller;

import com.cristock.dto.request.TradingRequest;
import com.cristock.dto.response.PortfolioResponse;
import com.cristock.dto.response.TransactionResponse;
import com.cristock.service.TradingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trading")
@RequiredArgsConstructor
public class TradingController {

    private final TradingService tradingService;

    @PostMapping("/buy")
    public TransactionResponse buyShares(
            Authentication authentication,
            @Valid @RequestBody TradingRequest request) {

        return tradingService.buyShares(
                authentication.getName(),
                request
        );
    }

    @PostMapping("/sell")
    public TransactionResponse sellShares(
            Authentication authentication,
            @Valid @RequestBody TradingRequest request) {

        return tradingService.sellShares(
                authentication.getName(),
                request
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
}