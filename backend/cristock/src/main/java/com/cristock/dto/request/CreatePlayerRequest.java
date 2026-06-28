package com.cristock.dto.request;

import com.cristock.enums.PlayerRole;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreatePlayerRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "Team is required")
    private String team;

    @NotNull(message = "Role is required")
    private PlayerRole role;

    @NotNull(message = "Current price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    private BigDecimal currentPrice;

    @NotNull(message = "Total shares are required")
    @Min(value = 1, message = "Total shares must be at least 1")
    private Integer totalShares;
}