package com.cristock.service.impl;

import com.cristock.dto.request.TradingRequest;
import com.cristock.dto.response.HoldingResponse;
import com.cristock.dto.response.PortfolioResponse;
import com.cristock.dto.response.TransactionResponse;
import com.cristock.entity.Holding;
import com.cristock.entity.Player;
import com.cristock.entity.Transaction;
import com.cristock.entity.User;
import com.cristock.enums.TransactionType;
import com.cristock.exception.*;
import com.cristock.repository.HoldingRepository;
import com.cristock.repository.PlayerRepository;
import com.cristock.repository.TransactionRepository;
import com.cristock.repository.UserRepository;
import com.cristock.service.PriceEngineService;
import com.cristock.service.TradingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TradingServiceImpl implements TradingService {

    private final UserRepository userRepository;
    private final PlayerRepository playerRepository;
    private final HoldingRepository holdingRepository;
    private final TransactionRepository transactionRepository;
    private final PriceEngineService priceEngineService;

    @Override
    @Transactional
    public TransactionResponse buyShares(String userEmail, TradingRequest request) {


        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));


        Player player = playerRepository.findById(request.getPlayerId())
                .orElseThrow(() -> new PlayerNotFoundException("Player not found"));


        if (!player.getActive()) {
            throw new MarketClosedException("Trading is currently suspended for this player.");
        }


        if (request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero.");
        }
        if (player.getAvailableShares() < request.getQuantity()) {
            throw new InsufficientSharesException("Not enough shares available in the market.");
        }


        BigDecimal totalCost = player.getCurrentPrice()
                .multiply(BigDecimal.valueOf(request.getQuantity()))
                .setScale(2, RoundingMode.HALF_UP);


        if (user.getWalletBalance().compareTo(totalCost) < 0) {
            throw new InsufficientFundsException("Insufficient funds in wallet to complete this purchase.");
        }


        user.setWalletBalance(user.getWalletBalance().subtract(totalCost));


        player.setAvailableShares(player.getAvailableShares() - request.getQuantity());

        priceEngineService.updatePriceAfterBuy(player, request.getQuantity());


        Holding holding = holdingRepository.findByUserAndPlayer(user, player)
                .orElse(Holding.builder()
                        .user(user)
                        .player(player)
                        .shares(0)
                        .averageBuyPrice(BigDecimal.ZERO)
                        .build());

        // new average buy price: ((Old Shares * Old Avg Price) + (New Shares * New Price)) / Total Shares
        BigDecimal previousInvestment = holding.getAverageBuyPrice()
                .multiply(BigDecimal.valueOf(holding.getShares()));

        BigDecimal totalInvestment = previousInvestment.add(totalCost);

        int totalShares = holding.getShares() + request.getQuantity();

        BigDecimal averagePrice = totalInvestment.divide(
                BigDecimal.valueOf(totalShares),
                2,
                RoundingMode.HALF_UP
        );

        holding.setShares(totalShares);
        holding.setAverageBuyPrice(averagePrice);


        Transaction transaction = Transaction.builder()
                .user(user)
                .player(player)
                .type(TransactionType.BUY)
                .quantity(request.getQuantity())
                .price(player.getCurrentPrice())
                .totalAmount(totalCost)
                .build();


        holdingRepository.save(holding);
        userRepository.save(user);

        Transaction savedTransaction = transactionRepository.save(transaction);


        return TransactionResponse.builder()
                .transactionId(savedTransaction.getId())
                .playerName(savedTransaction.getPlayer().getName())
                .type(savedTransaction.getType())
                .quantity(savedTransaction.getQuantity())
                .price(savedTransaction.getPrice())
                .totalAmount(savedTransaction.getTotalAmount())
                .timestamp(savedTransaction.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public TransactionResponse sellShares(String userEmail, TradingRequest request) {


        if (request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero.");
        }


        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));


        Player player = playerRepository.findById(request.getPlayerId())
                .orElseThrow(() -> new PlayerNotFoundException("Player not found"));

        if (!player.getActive()) {
            throw new MarketClosedException("Trading is currently suspended for this player.");
        }


        Holding holding = holdingRepository.findByUserAndPlayer(user, player)
                .orElseThrow(() -> new HoldingNotFoundException("You don't own this player."));


        if (holding.getShares() < request.getQuantity()) {
            throw new InsufficientSharesException("You do not own enough shares.");
        }


        BigDecimal totalAmount = player.getCurrentPrice()
                .multiply(BigDecimal.valueOf(request.getQuantity()))
                .setScale(2, RoundingMode.HALF_UP);


        user.setWalletBalance(
                user.getWalletBalance().add(totalAmount)
        );


        player.setAvailableShares(
                player.getAvailableShares() + request.getQuantity()
        );

        priceEngineService.updatePriceAfterSell(player, request.getQuantity());


        int remainingShares = holding.getShares() - request.getQuantity();

        if (remainingShares == 0) {
            holdingRepository.delete(holding);
        } else {
            holding.setShares(remainingShares);
            holdingRepository.save(holding);
        }


        Transaction transaction = Transaction.builder()
                .user(user)
                .player(player)
                .type(TransactionType.SELL)
                .quantity(request.getQuantity())
                .price(player.getCurrentPrice())
                .totalAmount(totalAmount)
                .build();


        userRepository.save(user);


        Transaction savedTransaction = transactionRepository.save(transaction);


        return TransactionResponse.builder()
                .transactionId(savedTransaction.getId())
                .playerName(savedTransaction.getPlayer().getName())
                .type(savedTransaction.getType())
                .quantity(savedTransaction.getQuantity())
                .price(savedTransaction.getPrice())
                .totalAmount(savedTransaction.getTotalAmount())
                .timestamp(savedTransaction.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PortfolioResponse getPortfolio(String userEmail) {


        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));


        List<Holding> holdings = holdingRepository.findByUser(user);

        BigDecimal investedAmount = BigDecimal.ZERO;
        BigDecimal portfolioValue = BigDecimal.ZERO;

        List<HoldingResponse> holdingResponses = holdings.stream()
                .map(holding -> {

                    Player player = holding.getPlayer();

                    BigDecimal investment = holding.getAverageBuyPrice()
                            .multiply(BigDecimal.valueOf(holding.getShares()));

                    BigDecimal currentValue = player.getCurrentPrice()
                            .multiply(BigDecimal.valueOf(holding.getShares()));

                    BigDecimal profitLoss = currentValue.subtract(investment);

                    return HoldingResponse.builder()
                            .playerId(player.getId())
                            .playerName(player.getName())
                            .shares(holding.getShares())
                            .averageBuyPrice(holding.getAverageBuyPrice())
                            .currentPrice(player.getCurrentPrice())
                            .currentValue(currentValue)
                            .profitLoss(profitLoss)
                            .build();

                })
                .toList();


        for (Holding holding : holdings) {

            BigDecimal investment = holding.getAverageBuyPrice()
                    .multiply(BigDecimal.valueOf(holding.getShares()));

            BigDecimal currentValue = holding.getPlayer()
                    .getCurrentPrice()
                    .multiply(BigDecimal.valueOf(holding.getShares()));

            investedAmount = investedAmount.add(investment);
            portfolioValue = portfolioValue.add(currentValue);
        }

        BigDecimal profitLoss = portfolioValue.subtract(investedAmount);

        return PortfolioResponse.builder()
                .walletBalance(user.getWalletBalance())
                .portfolioValue(portfolioValue)
                .investedAmount(investedAmount)
                .profitLoss(profitLoss)
                .holdings(holdingResponses)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionHistory(String userEmail) {


        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));


        List<Transaction> transactions =
                transactionRepository.findByUserOrderByCreatedAtDesc(user);


        return transactions.stream()
                .map(transaction -> TransactionResponse.builder()
                        .transactionId(transaction.getId())
                        .playerName(transaction.getPlayer().getName())
                        .type(transaction.getType())
                        .quantity(transaction.getQuantity())
                        .price(transaction.getPrice())
                        .totalAmount(transaction.getTotalAmount())
                        .timestamp(transaction.getCreatedAt())
                        .build())
                .toList();
    }
}