package com.example.clinique.dto;

import com.example.clinique.entities.User;

public class LoginResponse {
    private boolean success;
    private String message;
    private String token;
    private User user;
    private String redirectUrl;

    // Constructeurs
    public LoginResponse() {}

    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public LoginResponse(boolean success, String message, String token, User user, String redirectUrl) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.user = user;
        this.redirectUrl = redirectUrl;
    }

    // Getters et Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getRedirectUrl() { return redirectUrl; }
    public void setRedirectUrl(String redirectUrl) { this.redirectUrl = redirectUrl; }
}