package com.cristock.service.impl;

import com.cristock.dto.response.PriceUpdateResponse;
import com.cristock.entity.Player;
import com.cristock.service.WebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketServiceImpl implements WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void sendPriceUpdate(Player player) {

        PriceUpdateResponse response = PriceUpdateResponse.builder()
                .playerId(player.getId())
                .playerName(player.getName())
                .currentPrice(player.getCurrentPrice())
                .previousPrice(player.getPreviousPrice())
                .marketCap(player.getMarketCap())
                .build();

        messagingTemplate.convertAndSend(
                "/topic/prices",
                response
        );
    }
}