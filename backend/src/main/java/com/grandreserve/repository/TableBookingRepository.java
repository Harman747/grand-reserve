package com.grandreserve.repository;

import com.grandreserve.entity.TableBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TableBookingRepository extends JpaRepository<TableBooking, Long> {
    List<TableBooking> findByCustomerId(UUID customerId);
    List<TableBooking> findAllByOrderByCreatedAtDesc();
    List<TableBooking> findByFloorAndStatus(Integer floor, String status);
}
