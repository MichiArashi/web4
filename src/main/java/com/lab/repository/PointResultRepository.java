package com.lab.repository;

import com.lab.model.PointResult;
import com.lab.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PointResultRepository extends JpaRepository<PointResult, Long> {

    @Query(value = "SELECT p FROM PointResult p ORDER BY p.timestamp DESC",
           countQuery = "SELECT COUNT(p) FROM PointResult p")
    Page<PointResult> findAllOrderByTimestampDesc(Pageable pageable);
    
    @Modifying
    @Query("DELETE FROM PointResult p WHERE p.user = :user")
    void deleteByUser(User user);
}

