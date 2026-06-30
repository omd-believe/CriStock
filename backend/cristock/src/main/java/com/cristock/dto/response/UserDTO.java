package com.cristock.dto.response;

import com.cristock.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {

    private String fullName;
    private String email;
    private Role role;
    private BigDecimal walletBalance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
