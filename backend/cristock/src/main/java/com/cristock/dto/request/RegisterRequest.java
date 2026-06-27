package com.cristock.dto.request;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "full name is required")
    private String fullName;
    @NotBlank(message = "Email is required")
    @Email(message = "Please enter valid email")
    private String email;
    @Size(min = 6, message = "Password must be at least 6 characters")
    @NotBlank
    private String password;



}
