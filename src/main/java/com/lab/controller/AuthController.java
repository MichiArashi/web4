package com.lab.controller;

import com.lab.dto.AuthResponse;
import com.lab.dto.LoginRequest;
import com.lab.model.User;
import com.lab.service.JwtService;
import com.lab.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtService jwtService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> userOpt = userService.findByUsername(request.getUsername());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Пользователь не найден");
        }
        
        User user = userOpt.get();
        if (!userService.validatePassword(user, request.getPassword())) {
            return ResponseEntity.status(401).body("Неверный пароль");
        }
        
        String token = jwtService.generateToken(user.getUsername());
        
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername()));
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody LoginRequest request) {
        try {
            User user = userService.createUser(request.getUsername(), request.getPassword());
            String token = jwtService.generateToken(user.getUsername());
            return ResponseEntity.ok(new AuthResponse(token, user.getUsername()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

