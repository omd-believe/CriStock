package com.cristock.service;

import com.cristock.dto.request.CreatePlayerRequest;
import com.cristock.dto.response.PlayerResponse;

import java.util.List;

public interface PlayerService {

    PlayerResponse createPlayer(CreatePlayerRequest request);

    List<PlayerResponse> getAllPlayers();

    PlayerResponse getPlayerById(Long id);

    PlayerResponse updatePlayer(Long id, CreatePlayerRequest request);

    void deletePlayer(Long id);
}