package com.cristock.service.impl;

import com.cristock.dto.request.CreatePlayerRequest;
import com.cristock.dto.response.PlayerResponse;
import com.cristock.entity.Player;
import com.cristock.exception.PlayerAlreadyExistsException;
import com.cristock.exception.PlayerNotFoundException;
import com.cristock.repository.PlayerRepository;
import com.cristock.service.PlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlayerServiceImpl implements PlayerService {

    private final PlayerRepository playerRepository;

    @Override
    @Transactional
    public PlayerResponse createPlayer(CreatePlayerRequest request) {
        if (playerRepository.existsByName(request.getName())) {
            throw new PlayerAlreadyExistsException("Player with name '" + request.getName() + "' already exists in the market.");
        }

        Player player = Player.builder()
                .name(request.getName())
                .country(request.getCountry())
                .team(request.getTeam())
                .role(request.getRole())
                .currentPrice(request.getCurrentPrice())
                .previousPrice(request.getCurrentPrice())
                .totalShares(request.getTotalShares())
                .availableShares(request.getTotalShares())
                .marketCap(request.getCurrentPrice().multiply(BigDecimal.valueOf(request.getTotalShares())))
                .active(true)
                .build();

        Player savedPlayer = playerRepository.save(player);
        return mapToResponse(savedPlayer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlayerResponse> getAllPlayers() {
        return playerRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PlayerResponse getPlayerById(Long id) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new PlayerNotFoundException("Player not found with ID: " + id));

        return mapToResponse(player);
    }

    @Override
    @Transactional
    public PlayerResponse updatePlayer(Long id, CreatePlayerRequest request) {
        Player existingPlayer = playerRepository.findById(id)
                .orElseThrow(() -> new PlayerNotFoundException("Player not found with ID: " + id));


        Optional<Player> playerWithSameName = playerRepository.findByName(request.getName());
        if (playerWithSameName.isPresent() && !playerWithSameName.get().getId().equals(id)) {
            throw new PlayerAlreadyExistsException("Another player with name '" + request.getName() + "' already exists.");
        }

        existingPlayer.setName(request.getName());
        existingPlayer.setCountry(request.getCountry());
        existingPlayer.setTeam(request.getTeam());
        existingPlayer.setRole(request.getRole());

        int shareDifference = request.getTotalShares() - existingPlayer.getTotalShares();
        existingPlayer.setTotalShares(request.getTotalShares());
        existingPlayer.setAvailableShares(existingPlayer.getAvailableShares() + shareDifference);

        existingPlayer.setPreviousPrice(existingPlayer.getCurrentPrice());
        existingPlayer.setCurrentPrice(request.getCurrentPrice());

        existingPlayer.setMarketCap(request.getCurrentPrice().multiply(BigDecimal.valueOf(request.getTotalShares())));

        Player updatedPlayer = playerRepository.save(existingPlayer);
        return mapToResponse(updatedPlayer);
    }

    @Override
    @Transactional
    public void deletePlayer(Long id) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new PlayerNotFoundException("Player not found with ID: " + id));


        player.setActive(false);
        playerRepository.save(player);
    }


    private PlayerResponse mapToResponse(Player player) {
        return PlayerResponse.builder()
                .id(player.getId())
                .name(player.getName())
                .country(player.getCountry())
                .team(player.getTeam())
                .role(player.getRole())
                .currentPrice(player.getCurrentPrice())
                .previousPrice(player.getPreviousPrice())
                .totalShares(player.getTotalShares())
                .availableShares(player.getAvailableShares())
                .marketCap(player.getMarketCap())
                .active(player.getActive())
                .build();
    }
}