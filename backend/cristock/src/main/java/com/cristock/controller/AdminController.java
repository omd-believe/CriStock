package com.cristock.controller;

import com.cristock.dto.request.BalanceUpdateRequest;
import com.cristock.dto.response.UserDTO;
import com.cristock.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;


    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @PatchMapping("/users/addbalance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateBalance(@Valid
            @RequestBody BalanceUpdateRequest request) {

        userService.updateUserBalance(request);
        return ResponseEntity.ok("Balance updated successfully");
    }
}