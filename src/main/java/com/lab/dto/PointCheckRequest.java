package com.lab.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PointCheckRequest {
    @NotNull(message = "X is required")
    @DecimalMin(value = "-3.0", message = "X must be >= -3")
    @DecimalMax(value = "3.0", message = "X must be <= 3")
    private Double x;
    
    @NotNull(message = "Y is required")
    @DecimalMin(value = "-3.0", message = "Y must be >= -3")
    @DecimalMax(value = "3.0", message = "Y must be <= 3")
    private Double y;
    
    @NotNull(message = "R is required")
    @DecimalMin(value = "0.0001", inclusive = false, message = "R must be greater than 0")
    @DecimalMax(value = "3.0", message = "R must be <= 3")
    private Double r;
}

