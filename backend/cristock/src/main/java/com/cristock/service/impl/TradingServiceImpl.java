package com.cristock.service.impl;

import com.cristock.dto.request.TradingRequest;
import com.cristock.dto.response.HoldingResponse;
import com.cristock.dto.response.OrderResponse;
import com.cristock.dto.response.PortfolioResponse;
import com.cristock.dto.response.TransactionResponse;
import com.cristock.entity.*;
import com.cristock.enums.OrderStatus;
import com.cristock.enums.TransactionType;
import com.cristock.exception.*;
import com.cristock.repository.*;
import com.cristock.service.PriceEngineService;
import com.cristock.service.TradingService;
import com.cristock.service.WebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import com.cristock.enums.OrderType;



@Service
@RequiredArgsConstructor
public class TradingServiceImpl implements TradingService {

    private static final int MAX_TRADE_QUANTITY = 1000;

    private final UserRepository userRepository;
    private final PlayerRepository playerRepository;
    private final HoldingRepository holdingRepository;
    private final TransactionRepository transactionRepository;
    private final PriceEngineService priceEngineService;
    private final WebSocketService webSocketService;
    private final PriceHistoryRepository priceHistoryRepository;
    private final OrderRepository orderRepository;


    @Override
    @Transactional
    public Object buyShares(String userEmail, TradingRequest request) {

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero."
            );
        }

        if (request.getQuantity() > MAX_TRADE_QUANTITY) {
            throw new IllegalArgumentException(
                    "You can trade a maximum of " + MAX_TRADE_QUANTITY + " shares at once."
            );
        }

        if (request.getOrderType() == OrderType.LIMIT) {

            if (request.getLimitPrice() == null ||
                    request.getLimitPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException(
                        "Limit price must be greater than zero for a LIMIT order."
                );
            }
        }


        User user;

        if (request.getOrderType() == OrderType.LIMIT) {
            user = userRepository.findByEmailForUpdate(userEmail)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
        } else {
            user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
        }

        Player player = playerRepository.findById(request.getPlayerId())
                .orElseThrow(() -> new PlayerNotFoundException("Player not found"));


        if (!player.getActive()) {
            throw new MarketClosedException("Trading is currently suspended for this player.");
        }

// LIMIT BUY
        if (request.getOrderType() == OrderType.LIMIT) {

            BigDecimal orderAmount = request.getLimitPrice()
                    .multiply(BigDecimal.valueOf(request.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);

            BigDecimal availableBalance = user.getWalletBalance()
                    .subtract(user.getReservedBalance());

            if (availableBalance.compareTo(orderAmount) < 0) {
                throw new InsufficientFundsException(
                        "Insufficient available wallet balance for this LIMIT BUY."
                );
            }

            // Reserve the required amount for this pending order
            user.setReservedBalance(
                    user.getReservedBalance().add(orderAmount)
            );

            Order order = Order.builder()
                    .user(user)
                    .player(player)
                    .transactionType(TransactionType.BUY)
                    .orderType(OrderType.LIMIT)
                    .status(OrderStatus.PENDING)
                    .quantity(request.getQuantity())
                    .limitPrice(request.getLimitPrice())
                    .expiresAt(LocalDateTime.now().plusHours(24))
                    .build();

            Order savedOrder = orderRepository.save(order);

            userRepository.save(user);

            return OrderResponse.builder()
                    .orderId(savedOrder.getId())
                    .playerId(savedOrder.getPlayer().getId())
                    .playerName(savedOrder.getPlayer().getName())
                    .transactionType(savedOrder.getTransactionType())
                    .orderType(savedOrder.getOrderType())
                    .status(savedOrder.getStatus())
                    .quantity(savedOrder.getQuantity())
                    .limitPrice(savedOrder.getLimitPrice())
                    .createdAt(savedOrder.getCreatedAt())
                    .updatedAt(savedOrder.getUpdatedAt())
                    .expiresAt(savedOrder.getExpiresAt())
                    .build();
        }

        // MARKET BUY
        if (player.getAvailableShares() < request.getQuantity()) {
            throw new InsufficientSharesException(
                    "Not enough shares available in the market."
            );
        }

        BigDecimal executionPrice = player.getCurrentPrice();

        BigDecimal totalCost = executionPrice
                .multiply(BigDecimal.valueOf(request.getQuantity()))
                .setScale(2, RoundingMode.HALF_UP);

        if (user.getWalletBalance().compareTo(totalCost) < 0) {
            throw new InsufficientFundsException(
                    "Insufficient funds in wallet to complete this purchase."
            );
        }

        user.setWalletBalance(
                user.getWalletBalance().subtract(totalCost)
        );

        player.setAvailableShares(
                player.getAvailableShares() - request.getQuantity()
        );

        priceEngineService.updatePriceAfterBuy(
                player,
                request.getQuantity()
        );

        recordPriceHistory(player);

        executePendingBuyOrders(player);
        executePendingSellOrders(player);

        sendPriceUpdateAfterCommit(player);

        Holding holding = holdingRepository.findByUserAndPlayer(user, player)
                .orElse(Holding.builder()
                        .user(user)
                        .player(player)
                        .shares(0)
                        .averageBuyPrice(BigDecimal.ZERO)
                        .build());

        BigDecimal previousInvestment = holding.getAverageBuyPrice()
                .multiply(BigDecimal.valueOf(holding.getShares()));

        BigDecimal totalInvestment = previousInvestment.add(totalCost);

        int totalShares =
                holding.getShares() + request.getQuantity();

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
                .price(executionPrice)
                .totalAmount(totalCost)
                .build();

        holdingRepository.save(holding);
        userRepository.save(user);

        Transaction savedTransaction =
                transactionRepository.save(transaction);

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
    public Object sellShares(String userEmail, TradingRequest request) {



        if (request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero.");
        }

        if (request.getQuantity() > MAX_TRADE_QUANTITY) {
            throw new IllegalArgumentException(
                    "You can trade a maximum of " + MAX_TRADE_QUANTITY + " shares at once."
            );
        }


        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));


        Player player = playerRepository.findById(request.getPlayerId())
                .orElseThrow(() -> new PlayerNotFoundException("Player not found"));

        if (!player.getActive()) {
            throw new MarketClosedException("Trading is currently suspended for this player.");
        }

        if (request.getOrderType() == OrderType.LIMIT) {

            if (request.getLimitPrice() == null ||
                    request.getLimitPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Limit price must be greater than 0");
            }

            Holding holding = holdingRepository.findByUserAndPlayer(user, player)
                    .orElseThrow(() -> new HoldingNotFoundException("You don't own this player."));

            if (holding.getShares() < request.getQuantity()) {
                throw new InsufficientSharesException("You do not own enough shares.");
            }

            Order order = Order.builder()
                    .user(user)
                    .player(player)
                    .transactionType(TransactionType.SELL)
                    .orderType(OrderType.LIMIT)
                    .status(OrderStatus.PENDING)
                    .quantity(request.getQuantity())
                    .limitPrice(request.getLimitPrice())
                    .expiresAt(LocalDateTime.now().plusHours(24))
                    .build();

            Order savedOrder = orderRepository.save(order);

            return OrderResponse.builder()
                    .orderId(savedOrder.getId())
                    .playerId(player.getId())
                    .playerName(player.getName())
                    .transactionType(savedOrder.getTransactionType())
                    .orderType(savedOrder.getOrderType())
                    .status(savedOrder.getStatus())
                    .quantity(savedOrder.getQuantity())
                    .limitPrice(savedOrder.getLimitPrice())
                    .createdAt(savedOrder.getCreatedAt())
                    .updatedAt(savedOrder.getUpdatedAt())
                    .expiresAt(savedOrder.getExpiresAt())
                    .build();
        }

        Holding holding = holdingRepository.findByUserAndPlayer(user, player)
                .orElseThrow(() ->
                        new HoldingNotFoundException("You don't own this player.")
                );

        if (holding.getShares() < request.getQuantity()) {
            throw new InsufficientSharesException(
                    "You do not own enough shares."
            );
        }

        List<Order> pendingSellOrders =
                orderRepository.findByUser_IdAndPlayer_IdAndStatusAndTransactionType(
                        user.getId(),
                        player.getId(),
                        OrderStatus.PENDING,
                        TransactionType.SELL
                );

        int pendingSellQuantity = pendingSellOrders.stream()
                .mapToInt(Order::getQuantity)
                .sum();

        int availableToSell =
                holding.getShares() - pendingSellQuantity;

        if (request.getQuantity() > availableToSell) {
            throw new InsufficientSharesException(
                    "You already have " + pendingSellQuantity +
                            " shares committed to pending sell orders."
            );
        }


        BigDecimal executionPrice = player.getCurrentPrice();

        BigDecimal totalAmount = executionPrice
                .multiply(BigDecimal.valueOf(request.getQuantity()))
                .setScale(2, RoundingMode.HALF_UP);

        user.setWalletBalance(
                user.getWalletBalance().add(totalAmount)
        );


        player.setAvailableShares(
                player.getAvailableShares() + request.getQuantity()
        );

        priceEngineService.updatePriceAfterSell(player, request.getQuantity());
        recordPriceHistory(player);
        executePendingBuyOrders(player);
        executePendingSellOrders(player);

        sendPriceUpdateAfterCommit(player);


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
                .price(executionPrice)
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

    private void recordPriceHistory(Player player) {
        PriceHistory snapshot = PriceHistory.builder()
                .player(player)
                .price(player.getCurrentPrice())
                .build();
        priceHistoryRepository.save(snapshot);
    }

    private void sendPriceUpdateAfterCommit(Player player) {

        if (TransactionSynchronizationManager.isSynchronizationActive()) {

            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {

                        @Override
                        public void afterCommit() {
                            webSocketService.sendPriceUpdate(player);
                        }
                    }
            );

        } else {
            webSocketService.sendPriceUpdate(player);
        }
    }


    @Transactional
    public void executePendingBuyOrders(Player player) {

        List<Order> pendingOrders =
                orderRepository.findByPlayerIdAndStatusAndOrderTypeAndTransactionType(
                        player.getId(),
                        OrderStatus.PENDING,
                        OrderType.LIMIT,
                        TransactionType.BUY
                );

        for (Order order : pendingOrders) {

            if (order.getExpiresAt() != null &&
                    order.getExpiresAt().isBefore(LocalDateTime.now())) {

                order.setStatus(OrderStatus.EXPIRED);
                orderRepository.save(order);
                continue;
            }

            if (player.getCurrentPrice().compareTo(order.getLimitPrice()) > 0) {
                continue;
            }

            executeBuyOrder(order, player);
        }
    }

    @Transactional
    public void executePendingSellOrders(Player player) {

        List<Order> pendingOrders =
                orderRepository.findByPlayerIdAndStatusAndOrderTypeAndTransactionType(
                        player.getId(),
                        OrderStatus.PENDING,
                        OrderType.LIMIT,
                        TransactionType.SELL
                );

        LocalDateTime now = LocalDateTime.now();

        for (Order order : pendingOrders) {

            if (order.getExpiresAt() != null &&
                    order.getExpiresAt().isBefore(now)) {

                order.setStatus(OrderStatus.EXPIRED);
                orderRepository.save(order);
                continue;
            }

            if (player.getCurrentPrice().compareTo(order.getLimitPrice()) < 0) {
                continue;
            }

            executeSellOrder(order, player);
        }
    }
    private void executeSellOrder(Order order, Player player) {

        User user = order.getUser();

        Holding holding = holdingRepository.findByUserAndPlayer(user, player)
                .orElseThrow(() ->
                        new HoldingNotFoundException("You don't own this player.")
                );

        if (holding.getShares() < order.getQuantity()) {
            order.setStatus(OrderStatus.REJECTED);
            orderRepository.save(order);
            return;
        }

        BigDecimal executionPrice = player.getCurrentPrice();

        BigDecimal totalAmount = executionPrice
                .multiply(BigDecimal.valueOf(order.getQuantity()))
                .setScale(2, RoundingMode.HALF_UP);

        user.setWalletBalance(
                user.getWalletBalance().add(totalAmount)
        );

        player.setAvailableShares(
                player.getAvailableShares() + order.getQuantity()
        );

        int remainingShares = holding.getShares() - order.getQuantity();

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
                .quantity(order.getQuantity())
                .price(executionPrice)
                .totalAmount(totalAmount)
                .build();

        transactionRepository.save(transaction);
        userRepository.save(user);

        order.setStatus(OrderStatus.EXECUTED);
        orderRepository.save(order);
    }

    private void executeBuyOrder(Order order, Player player) {

        User user = order.getUser();

        BigDecimal executionPrice = player.getCurrentPrice();

        BigDecimal totalCost = executionPrice
                .multiply(BigDecimal.valueOf(order.getQuantity()))
                .setScale(2, RoundingMode.HALF_UP);

        /*
         * The order already has this amount reserved.
         * The actual execution price can be different from the limit price,
         * so calculate the final amount using the current market price.
         */
        BigDecimal reservedAmount = order.getLimitPrice()
                .multiply(BigDecimal.valueOf(order.getQuantity()))
                .setScale(2, RoundingMode.HALF_UP);

        // The order cannot execute without enough market shares.
        if (player.getAvailableShares() < order.getQuantity()) {
            return;
        }

        // Consume the reserved amount.
        user.setReservedBalance(
                user.getReservedBalance().subtract(reservedAmount)
        );

        // Charge the actual execution price.
        user.setWalletBalance(
                user.getWalletBalance().subtract(totalCost)
        );

        // If the actual execution price is lower than the limit price,
        // return the unused reserved amount to the available wallet balance.
        BigDecimal difference = reservedAmount.subtract(totalCost);

        if (difference.compareTo(BigDecimal.ZERO) > 0) {
            user.setWalletBalance(
                    user.getWalletBalance().add(difference)
            );
        }

        player.setAvailableShares(
                player.getAvailableShares() - order.getQuantity()
        );

        Holding holding = holdingRepository.findByUserAndPlayer(user, player)
                .orElse(Holding.builder()
                        .user(user)
                        .player(player)
                        .shares(0)
                        .averageBuyPrice(BigDecimal.ZERO)
                        .build());

        BigDecimal previousInvestment =
                holding.getAverageBuyPrice()
                        .multiply(BigDecimal.valueOf(holding.getShares()));

        BigDecimal totalInvestment =
                previousInvestment.add(totalCost);

        int totalShares =
                holding.getShares() + order.getQuantity();

        BigDecimal averagePrice =
                totalInvestment.divide(
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
                .quantity(order.getQuantity())
                .price(executionPrice)
                .totalAmount(totalCost)
                .build();

        order.setStatus(OrderStatus.EXECUTED);

        holdingRepository.save(holding);
        userRepository.save(user);
        transactionRepository.save(transaction);
        orderRepository.save(order);
    }


    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        List<Order> orders =
                orderRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());

        return orders.stream()
                .map(order -> OrderResponse.builder()
                        .orderId(order.getId())
                        .playerId(order.getPlayer().getId())
                        .playerName(order.getPlayer().getName())
                        .transactionType(order.getTransactionType())
                        .orderType(order.getOrderType())
                        .status(order.getStatus())
                        .quantity(order.getQuantity())
                        .limitPrice(order.getLimitPrice())
                        .createdAt(order.getCreatedAt())
                        .updatedAt(order.getUpdatedAt())
                        .expiresAt(order.getExpiresAt())
                        .build())
                .toList();
    }


    @Override
    @Transactional
    public void cancelOrder(String userEmail, Long orderId) {

        User user = userRepository.findByEmailForUpdate(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException(
                    "You are not allowed to cancel this order."
            );
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Only pending orders can be cancelled."
            );
        }

        /*
         * LIMIT BUY orders reserve wallet funds.
         * Release that reservation when the order is cancelled.
         */
        if (order.getTransactionType() == TransactionType.BUY &&
                order.getOrderType() == OrderType.LIMIT) {

            BigDecimal reservedAmount = order.getLimitPrice()
                    .multiply(BigDecimal.valueOf(order.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);

            BigDecimal newReservedBalance = user.getReservedBalance()
                    .subtract(reservedAmount);

            if (newReservedBalance.compareTo(BigDecimal.ZERO) < 0) {
                newReservedBalance = BigDecimal.ZERO;
            }

            user.setReservedBalance(newReservedBalance);

            userRepository.save(user);
        }

        order.setStatus(OrderStatus.CANCELLED);

        orderRepository.save(order);
    }




    @Override
    @Transactional
    public void expirePendingOrders() {

        List<Order> pendingOrders =
                orderRepository.findByStatus(OrderStatus.PENDING);

        LocalDateTime now = LocalDateTime.now();

        for (Order order : pendingOrders) {

            if (order.getExpiresAt() == null ||
                    !order.getExpiresAt().isBefore(now)) {
                continue;
            }

            /*
             * LIMIT BUY orders reserve wallet funds.
             * Release the reservation before expiring the order.
             */
            if (order.getTransactionType() == TransactionType.BUY &&
                    order.getOrderType() == OrderType.LIMIT) {

                User user = userRepository.findByIdForUpdate(order.getUser().getId())
                        .orElseThrow(() -> new UserNotFoundException(
                                "User not found"
                        ));

                BigDecimal reservedAmount = order.getLimitPrice()
                        .multiply(BigDecimal.valueOf(order.getQuantity()))
                        .setScale(2, RoundingMode.HALF_UP);

                BigDecimal newReservedBalance =
                        user.getReservedBalance()
                                .subtract(reservedAmount);

                if (newReservedBalance.compareTo(BigDecimal.ZERO) < 0) {
                    newReservedBalance = BigDecimal.ZERO;
                }

                user.setReservedBalance(newReservedBalance);

                userRepository.save(user);
            }

            order.setStatus(OrderStatus.EXPIRED);

            orderRepository.save(order);
        }
    }


}