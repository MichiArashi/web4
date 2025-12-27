package com.lab.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PointResultResponse {
    private Long id;
    private Double x;
    private Double y;
    private Double r;
    private Boolean hit;
    private LocalDateTime timestamp;
    private Long executionTime;
    private String username; // Имя пользователя
}

