package com.cristock.service;

import com.cristock.dto.request.TradingRequest;
import com.cristock.dto.response.OrderResponse;
import com.cristock.dto.response.PortfolioResponse;
import com.cristock.dto.response.TransactionResponse;

import java.util.List;

public interface TradingService {

    Object buyShares(
            String userEmail,
            TradingRequest request
    );

    Object sellShares(
            String userEmail,
            TradingRequest request
    );

    PortfolioResponse getPortfolio(String userEmail);

    List<TransactionResponse> getTransactionHistory(String userEmail);

    List<OrderResponse> getOrders(String userEmail);

    void cancelOrder(
            String userEmail,
            Long orderId
    );

    void expirePendingOrders();

}