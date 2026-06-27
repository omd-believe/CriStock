package com.cristock.service;

import com.cristock.dto.request.LoginRequest;
import com.cristock.dto.request.RegisterRequest;
import com.cristock.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
