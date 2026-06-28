package com.cristock.controller;

import com.cristock.dto.response.LeaderboardResponse;
import com.cristock.service.LeaderboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService){
        this.leaderboardService = leaderboardService;
    }

    @GetMapping("/gainers")
    public List<LeaderboardResponse> gainers() {
        return leaderboardService.getTopGainers();
    }

    @GetMapping("/losers")
    public List<LeaderboardResponse> losers() {
        return leaderboardService.getTopLosers();
    }

    @GetMapping("/market-cap")
    public List<LeaderboardResponse> marketCap() {
        return leaderboardService.getTopMarketCap();
    }
}
