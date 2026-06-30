package com.cristock.service;

import com.cristock.dto.request.BalanceUpdateRequest;
import com.cristock.dto.response.UserDTO;
import com.cristock.repository.UserRepository;

import java.util.List;

public interface UserService {

    public List<UserDTO> findAllUsers();

    public void updateUserBalance(BalanceUpdateRequest request);
}
