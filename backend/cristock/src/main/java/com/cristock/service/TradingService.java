package com.cristock.service;

import com.cristock.dto.request.TradingRequest;
import com.cristock.dto.response.PortfolioResponse;
import com.cristock.dto.response.TransactionResponse;

import java.util.List;

public interface TradingService {

    TransactionResponse buyShares(
            String userEmail,
            TradingRequest request
    );

    TransactionResponse sellShares(
            String userEmail,
            TradingRequest request
    );

    PortfolioResponse getPortfolio(String userEmail);

    List<TransactionResponse> getTransactionHistory(String userEmail);
}