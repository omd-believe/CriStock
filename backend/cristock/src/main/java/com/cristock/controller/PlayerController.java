package com.cristock.controller;

import com.cristock.dto.request.CreatePlayerRequest;
import com.cristock.dto.response.ChartDataResponse;
import com.cristock.dto.response.PlayerResponse;
import com.cristock.entity.Player;
import com.cristock.entity.PriceHistory;
import com.cristock.exception.PlayerNotFoundException;
import com.cristock.repository.PlayerRepository;
import com.cristock.repository.PriceHistoryRepository;
import com.cristock.service.PlayerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;
    private final PriceHistoryRepository priceHistoryRepository;
    private final PlayerRepository playerRepository;


    @GetMapping
    public ResponseEntity<List<PlayerResponse>> getAllPlayers() {
        return ResponseEntity.ok(playerService.getAllPlayers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlayerResponse> getPlayerById(@PathVariable Long id) {
        return ResponseEntity.ok(playerService.getPlayerById(id));
    }

    @PostMapping
    public ResponseEntity<PlayerResponse> createPlayer(@Valid @RequestBody CreatePlayerRequest request) {
        return ResponseEntity.ok(playerService.createPlayer(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlayerResponse> updatePlayer(
            @PathVariable Long id,@Valid @RequestBody CreatePlayerRequest request) {
        return ResponseEntity.ok(playerService.updatePlayer(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlayer(@PathVariable Long id) {
        playerService.deletePlayer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/chart")
    public ResponseEntity<List<ChartDataResponse>> getPriceHistory(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1D") String timeframe) {

        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new PlayerNotFoundException("Player not found with id: " + id));

        LocalDateTime from = switch (timeframe) {
            case "1H" -> LocalDateTime.now().minusHours(1);
            case "1W" -> LocalDateTime.now().minusWeeks(1);
            case "1M" -> LocalDateTime.now().minusMonths(1);
            default   -> LocalDateTime.now().minusDays(1);
        };

        List<PriceHistory> history = priceHistoryRepository
                .findByPlayerAndRecordedAtAfterOrderByRecordedAtAsc(player, from);


        if (history.isEmpty()) {
            return ResponseEntity.ok(List.of(
                    new ChartDataResponse(
                            LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")),
                            player.getCurrentPrice()
                    )
            ));
        }

        DateTimeFormatter fmt = switch (timeframe) {
            case "1H"       -> DateTimeFormatter.ofPattern("HH:mm");
            case "1W", "1M" -> DateTimeFormatter.ofPattern("dd MMM");
            default         -> DateTimeFormatter.ofPattern("HH:mm");
        };

        List<ChartDataResponse> response = history.stream()
                .sorted(Comparator.comparing(PriceHistory::getRecordedAt))
                .map(h -> new ChartDataResponse(
                        h.getRecordedAt().format(fmt),
                        h.getPrice()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}