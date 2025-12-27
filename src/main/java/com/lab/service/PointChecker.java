package com.lab.service;

import org.springframework.stereotype.Service;

@Service
public class PointChecker {
    
    public boolean checkPoint(double x, double y, double r) {

        double absR = Math.abs(r);
        boolean isNegativeR = r < 0;
        

        boolean inTriangle = x >= 0 && x <= absR &&
                y >= 0 && y <= absR/2 &&
                y <= (-0.5 * x) + (absR/2);


        boolean inRectangle = x >= -absR/2 && x <= 0 &&
                y >= 0 && y <= absR;


        boolean inQuarterCircle = x >= -absR/2 && x <= 0 &&
                y >= -absR/2 && y <= 0 &&
                (x * x + y * y) <= (absR/2) * (absR/2);

        boolean inArea = inTriangle || inRectangle || inQuarterCircle;
        

        return isNegativeR ? !inArea : inArea;
    }
}

