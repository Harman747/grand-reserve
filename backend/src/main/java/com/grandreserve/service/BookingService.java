package com.grandreserve.service;

import com.grandreserve.entity.RoomBooking;
import com.grandreserve.entity.TableBooking;
import com.grandreserve.repository.RoomBookingRepository;
import com.grandreserve.repository.TableBookingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class BookingService {

    private final RoomBookingRepository  roomRepo;
    private final TableBookingRepository tableRepo;

    public BookingService(RoomBookingRepository roomRepo,
                          TableBookingRepository tableRepo) {
        this.roomRepo  = roomRepo;
        this.tableRepo = tableRepo;
    }

    // ── Price tables ─────────────────────────────────────────
    private static final Map<String,  Integer> ROOM_TYPE = Map.of(
        "Single", 1500, "Double", 2500, "Triple", 3500, "Quad", 5000);
    private static final Map<String,  Integer> BED_SIZE  = Map.of(
        "Twin", 300, "Queen", 500, "King", 700);
    private static final Map<Integer, Integer> FLOOR_ADD = Map.of(
        1, 0, 2, 200, 3, 400, 4, 600, 5, 800);
    private static final Map<Integer, Integer> TABLE_PRC = Map.of(
        1, 200, 2, 350, 4, 600, 10, 1200, 20, 2200);

    private int calcRoomPrice(String roomType, String bedSize, int floor, boolean balcony, boolean pool) {
        int p = ROOM_TYPE.getOrDefault(roomType, 0)
              + BED_SIZE .getOrDefault(bedSize,  0)
              + FLOOR_ADD.getOrDefault(floor,    0);
        if (balcony) p += 500;
        if (pool)    p += 800;
        return p;
    }

    // ── Room Bookings ─────────────────────────────────────────
    public RoomBooking createRoomBooking(String customerId, String customerEmail, String customerName,
                                         String name, Integer age, String contact, String address,
                                         String idProof, String roomType, String bedSize, Integer floor,
                                         boolean balcony, boolean pool) {
        int price = calcRoomPrice(roomType, bedSize, floor, balcony, pool);

        RoomBooking booking = RoomBooking.builder()
                .customerId(UUID.fromString(customerId)).customerEmail(customerEmail).customerName(customerName)
                .name(name).age(age).contact(contact)
                .address(address).idProof(idProof).roomType(roomType)
                .bedSize(bedSize).floor(floor).balcony(balcony).pool(pool)
                .price(price)
                .build();
        return roomRepo.save(booking);
    }

    public List<RoomBooking> getAllRoomBookings() {
        return roomRepo.findAllByOrderByCreatedAtDesc();
    }

    public List<RoomBooking> getRoomBookingsByUser(String customerId) {
        return roomRepo.findByCustomerId(UUID.fromString(customerId));
    }

    public RoomBooking updateRoomStatus(Long id, String status) {
        RoomBooking b = roomRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Room booking not found"));
        b.setStatus(status.toLowerCase());
        return roomRepo.save(b);
    }

    public void deleteRoomBooking(Long id) {
        roomRepo.deleteById(id);
    }

    // ── Table Bookings ────────────────────────────────────────
    public TableBooking createTableBooking(String customerId, String customerEmail, String customerName,
                                           String name, Integer age, String contact,
                                           Integer floor, Integer seats) {
        int price = TABLE_PRC.getOrDefault(seats, 0);

        TableBooking booking = TableBooking.builder()
                .customerId(UUID.fromString(customerId)).customerEmail(customerEmail).customerName(customerName)
                .name(name).age(age).contact(contact)
                .floor(floor).seats(seats).price(price)
                .build();
        return tableRepo.save(booking);
    }

    public List<TableBooking> getAllTableBookings() {
        return tableRepo.findAllByOrderByCreatedAtDesc();
    }

    public List<TableBooking> getTableBookingsByUser(String customerId) {
        return tableRepo.findByCustomerId(UUID.fromString(customerId));
    }

    public TableBooking updateTableStatus(Long id, String status) {
        TableBooking b = tableRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Table booking not found"));
        b.setStatus(status.toLowerCase());
        return tableRepo.save(b);
    }

    public void deleteTableBooking(Long id) {
        tableRepo.deleteById(id);
    }

    // ── Floor occupancy ───────────────────────────────────────
    public Map<String, Object> getFloorOccupancy(int floor) {
        long roomsBooked  = roomRepo .findByFloorAndStatus(floor, "accepted").size();
        long tablesBooked = tableRepo.findByFloorAndStatus(floor, "accepted").size();
        return Map.of(
            "floor",        floor,
            "roomsBooked",  roomsBooked,
            "tablesBooked", tablesBooked,
            "roomsFree",    Math.max(0, 4 - roomsBooked),
            "tablesFree",   Math.max(0, 6 - tablesBooked)
        );
    }
}
