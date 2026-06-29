package com.cristock.service;

import com.cristock.entity.Player;

public interface WebSocketService {

    void sendPriceUpdate(Player player);

}