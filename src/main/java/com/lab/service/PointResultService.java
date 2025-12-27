package com.lab.service;

import com.lab.model.PointResult;
import com.lab.model.User;
import com.lab.repository.PointResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PointResultService {
    
    @Autowired
    private PointResultRepository pointResultRepository;
    
    @Autowired
    private PointChecker pointChecker;
    
    @Transactional
    public PointResult checkAndSavePoint(double x, double y, double r, User user) {
        long startTime = System.nanoTime();
        

        boolean hit = pointChecker.checkPoint(x, y, r);
        
        long executionTime = (System.nanoTime() - startTime) / 1_000_000; // в миллисекундах
        

        PointResult result = new PointResult(
            x, y, r, hit,
            LocalDateTime.now(),
            executionTime,
            user
        );
        

        return pointResultRepository.save(result);
    }
    
    public Page<PointResult> getAllResults(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return pointResultRepository.findAllOrderByTimestampDesc(pageable);
    }
    
    @Transactional
    public void deleteUserResults(User user) {
        pointResultRepository.deleteByUser(user);
        pointResultRepository.flush();
    }
}

