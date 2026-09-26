package com.cristock.scheduler;

import com.cristock.service.TradingService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderExpiryScheduler {

    private final TradingService tradingService;

    @Scheduled(fixedRate = 60000)
    public void expireOrders() {
        tradingService.expirePendingOrders();
    }
}