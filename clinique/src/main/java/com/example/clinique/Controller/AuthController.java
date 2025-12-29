package com.example.clinique.Controller;

import com.example.clinique.dto.LoginRequest;
import com.example.clinique.dto.LoginResponse;
import com.example.clinique.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // Autoriser les requêtes depuis React
public class AuthController {

    @Autowired
    private AuthService authService;
   
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.authenticate(loginRequest);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<Boolean> checkEmailExists(@PathVariable String email) {
        boolean exists = authService.findByEmail(email) != null;
        return ResponseEntity.ok(exists);
    }
}