package com.cristock.service;

import com.cristock.entity.Player;

public interface PriceEngineService {

    void updatePriceAfterBuy(Player player, int quantity);

    void updatePriceAfterSell(Player player, int quantity);

}