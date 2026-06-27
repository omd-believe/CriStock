package com.cristock.dto.response;

import com.cristock.enums.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String type = "Bearer";

    private Long userId;
    private String fullName;
    private String email;
    private Role role;
}