package com.cristock.entity;

import com.cristock.enums.PlayerRole;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;


import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "players")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    @NotBlank
    private String name;

    @Column(nullable = false)
    @NotBlank
    private String country;

    @NotBlank
    @Column(nullable = false)
    private String team;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlayerRole role;

    @Positive
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal currentPrice;


    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal previousPrice;

    @Positive
    @Column(nullable = false)
    private Integer totalShares;

    @Positive
    @Column(nullable = false)
    private Integer availableShares;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal marketCap;

    @Column(nullable = false)
    private Boolean active;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        if (this.active == null) {
            this.active = true;
        }


        if (this.currentPrice != null && this.totalShares != null) {
            this.marketCap = currentPrice.multiply(BigDecimal.valueOf(totalShares))
                    .setScale(2);
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();

        if (this.currentPrice != null && this.totalShares != null) {
            this.marketCap = currentPrice.multiply(BigDecimal.valueOf(totalShares))
                    .setScale(2);
        }
    }
}

