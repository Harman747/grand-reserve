package com.grandreserve.repository;

import com.grandreserve.entity.RoomBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RoomBookingRepository extends JpaRepository<RoomBooking, Long> {
    List<RoomBooking> findByCustomerId(UUID customerId);
    List<RoomBooking> findAllByOrderByCreatedAtDesc();
    List<RoomBooking> findByFloorAndStatus(Integer floor, String status);
}
