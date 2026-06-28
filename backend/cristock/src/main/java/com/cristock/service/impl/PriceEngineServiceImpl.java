package com.cristock.service.impl;

import com.cristock.entity.Player;
import com.cristock.repository.PlayerRepository;
import com.cristock.service.PriceEngineService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class PriceEngineServiceImpl implements PriceEngineService {

    private final PlayerRepository playerRepository;

    private static final int SHARES_PER_PERCENT = 10;

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    @Override
    public void updatePriceAfterBuy(Player player, int quantity) {

        int percentageIncrease = Math.max(1, quantity / SHARES_PER_PERCENT);

        BigDecimal multiplier = BigDecimal.valueOf(percentageIncrease)
                .divide(ONE_HUNDRED, 4, RoundingMode.HALF_UP);

        player.setPreviousPrice(player.getCurrentPrice());

        BigDecimal newPrice = player.getCurrentPrice()
                .multiply(BigDecimal.ONE.add(multiplier))
                .setScale(2, RoundingMode.HALF_UP);

        player.setCurrentPrice(newPrice);

        updateMarketCap(player);

        playerRepository.save(player);
    }

    @Override
    public void updatePriceAfterSell(Player player, int quantity) {

        int percentageDecrease = Math.max(1, quantity / SHARES_PER_PERCENT);

        BigDecimal multiplier = BigDecimal.valueOf(percentageDecrease)
                .divide(ONE_HUNDRED, 4, RoundingMode.HALF_UP);

        player.setPreviousPrice(player.getCurrentPrice());

        BigDecimal newPrice = player.getCurrentPrice()
                .multiply(BigDecimal.ONE.subtract(multiplier))
                .setScale(2, RoundingMode.HALF_UP);

        if (newPrice.compareTo(BigDecimal.ONE) < 0) {
            newPrice = BigDecimal.ONE;
        }

        player.setCurrentPrice(newPrice);

        updateMarketCap(player);

        playerRepository.save(player);
    }

    private void updateMarketCap(Player player) {

        player.setMarketCap(
                player.getCurrentPrice()
                        .multiply(BigDecimal.valueOf(player.getTotalShares()))
                        .setScale(2, RoundingMode.HALF_UP)
        );
    }
}