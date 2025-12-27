package com.lab.controller;

import com.lab.dto.PageResponse;
import com.lab.dto.PointCheckRequest;
import com.lab.dto.PointCheckFromGraphRequest;
import com.lab.dto.PointResultResponse;
import com.lab.model.PointResult;
import com.lab.model.User;
import com.lab.repository.UserRepository;
import com.lab.service.JwtService;
import com.lab.service.PointResultService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/points")
@CrossOrigin(origins = "*")
public class PointController {
    
    @Autowired
    private PointResultService pointResultService;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/check")
    public ResponseEntity<?> checkPoint(
            @Valid @RequestBody PointCheckRequest request,
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            if (request.getR() == null || request.getR() <= 0) {
                return ResponseEntity.badRequest().body("R must be greater than 0");
            }
            if (request.getR() > 3.0) {
                return ResponseEntity.badRequest().body("R must be <= 3");
            }
            
            String username = jwtService.extractUsername(authHeader.replace("Bearer ", ""));
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            PointResult result = pointResultService.checkAndSavePoint(
                request.getX(), request.getY(), request.getR(), user
            );
            
            PointResultResponse response = new PointResultResponse(
                result.getId(),
                result.getX(),
                result.getY(),
                result.getR(),
                result.getHit(),
                result.getTimestamp(),
                result.getExecutionTime(),
                result.getUser().getUsername()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/check-from-graph")
    public ResponseEntity<?> checkPointFromGraph(
            @RequestBody PointCheckFromGraphRequest request,
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            if (request.getX() == null || request.getY() == null || request.getR() == null) {
                return ResponseEntity.badRequest().body("X, Y, and R are required");
            }
            
            if (request.getR() <= 0) {
                return ResponseEntity.badRequest().body("R must be greater than 0");
            }
            if (request.getR() > 3.0) {
                return ResponseEntity.badRequest().body("R must be <= 3");
            }
            
            String username = jwtService.extractUsername(authHeader.replace("Bearer ", ""));
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            PointResult result = pointResultService.checkAndSavePoint(
                request.getX(), request.getY(), request.getR(), user
            );
            
            PointResultResponse response = new PointResultResponse(
                result.getId(),
                result.getX(),
                result.getY(),
                result.getR(),
                result.getHit(),
                result.getTimestamp(),
                result.getExecutionTime(),
                result.getUser().getUsername()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getResults(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            jwtService.extractUsername(authHeader.replace("Bearer ", ""));
            
            Page<PointResult> resultsPage = pointResultService.getAllResults(page, size);
            
            PageResponse<PointResultResponse> response = new PageResponse<>(
                resultsPage.getContent().stream()
                    .map(r -> {
                        String username = r.getUser() != null ? r.getUser().getUsername() : "Unknown";
                        return new PointResultResponse(
                            r.getId(),
                            r.getX(),
                            r.getY(),
                            r.getR(),
                            r.getHit(),
                            r.getTimestamp(),
                            r.getExecutionTime(),
                            username
                        );
                    })
                    .toList(),
                resultsPage.getNumber(),
                resultsPage.getSize(),
                resultsPage.getTotalElements(),
                resultsPage.getTotalPages(),
                resultsPage.hasNext(),
                resultsPage.hasPrevious()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error loading results: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearUserResults(
            @RequestHeader("Authorization") String authHeader) {
        
        String username = jwtService.extractUsername(authHeader.replace("Bearer ", ""));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        pointResultService.deleteUserResults(user);
        
        return ResponseEntity.ok("Points cleared successfully");
    }
}

