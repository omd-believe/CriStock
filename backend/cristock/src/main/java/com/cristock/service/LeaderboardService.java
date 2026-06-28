package com.cristock.service;

import com.cristock.dto.response.LeaderboardResponse;

import java.util.List;

public interface LeaderboardService {

    List<LeaderboardResponse> getTopGainers();

    List<LeaderboardResponse> getTopLosers();

    List<LeaderboardResponse> getTopMarketCap();

}
