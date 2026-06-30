package com.cristock.service.impl;

import com.cristock.dto.request.BalanceUpdateRequest;
import com.cristock.dto.response.UserDTO;
import com.cristock.entity.User;
import com.cristock.exception.InvalidCredentialsException;
import com.cristock.repository.UserRepository;
import com.cristock.service.UserService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<UserDTO> findAllUsers() {

        List<User> users = userRepository.findAll();
        List<UserDTO> dtos = new ArrayList<>();

        for (User user : users) {
            UserDTO dto = new UserDTO();

            dto.setFullName(user.getFullName());
            dto.setEmail(user.getEmail());
            dto.setRole(user.getRole());
            dto.setWalletBalance(user.getWalletBalance());
            dto.setCreatedAt(user.getCreatedAt());
            dto.setUpdatedAt(user.getUpdatedAt());

            dtos.add(dto);
        }

        return dtos;
    }

    @Override
    public void updateUserBalance(BalanceUpdateRequest request){

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new InvalidCredentialsException("Invalid email or password"));

        BigDecimal newWalletBalance = user.getWalletBalance().add(request.getAmount());
        user.setWalletBalance(newWalletBalance);
        userRepository.save(user);

    }

}