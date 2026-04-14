package com.grandreserve.controller;

import com.grandreserve.dto.StatusUpdateRequest;
import com.grandreserve.entity.RoomBooking;
import com.grandreserve.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
public class RoomBookingController {

    private final BookingService bookingService;

    public RoomBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Customer: create booking
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody RoomBookingRequest req) {
        RoomBooking b = bookingService.createRoomBooking(
            req.getCustomerId(), req.getCustomerEmail(), req.getCustomerName(),
            req.getName(), req.getAge(), req.getContact(),
            req.getAddress(), req.getIdProof(), req.getRoomType(),
            req.getBedSize(), req.getFloor(), req.isBalcony(), req.isPool()
        );
        return ResponseEntity.ok(toMap(b));
    }

    // Customer: own bookings
    @GetMapping("/my/{userId}")
    public ResponseEntity<List<Map<String, Object>>> myBookings(@PathVariable String userId) {
        List<Map<String, Object>> result = bookingService.getRoomBookingsByUser(userId)
                .stream().map(this::toMap).toList();
        return ResponseEntity.ok(result);
    }

    // Management: all bookings
    @GetMapping
    @PreAuthorize("hasRole('MANAGEMENT')")
    public ResponseEntity<List<Map<String, Object>>> all() {
        List<Map<String, Object>> result = bookingService.getAllRoomBookings()
                .stream().map(this::toMap).toList();
        return ResponseEntity.ok(result);
    }

    // Management: update status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('MANAGEMENT')")
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Long id,
                                                            @RequestBody StatusUpdateRequest req) {
        RoomBooking b = bookingService.updateRoomStatus(id, req.getStatus());
        return ResponseEntity.ok(toMap(b));
    }

    // Management: delete
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGEMENT')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        bookingService.deleteRoomBooking(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Deleted successfully");
        return ResponseEntity.ok(res);
    }

    // Floor occupancy
    @GetMapping("/floor/{floor}")
    @PreAuthorize("hasRole('MANAGEMENT')")
    public ResponseEntity<Map<String, Object>> floorOccupancy(@PathVariable int floor) {
        return ResponseEntity.ok(bookingService.getFloorOccupancy(floor));
    }

    private Map<String, Object> toMap(RoomBooking b) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",        b.getId());
        m.put("name",      b.getName());
        m.put("age",       b.getAge());
        m.put("contact",   b.getContact());
        m.put("address",   b.getAddress());
        m.put("idProof",   b.getIdProof());
        m.put("roomType",  b.getRoomType());
        m.put("bedSize",   b.getBedSize());
        m.put("floor",     b.getFloor());
        m.put("balcony",   b.isBalcony());
        m.put("pool",      b.isPool());
        m.put("price",     b.getPrice());
        m.put("status",    b.getStatus());
        m.put("customerId",    b.getCustomerId() != null ? b.getCustomerId().toString() : null);
        m.put("customerEmail", b.getCustomerEmail());
        m.put("customerName",  b.getCustomerName());
        m.put("createdAt", b.getCreatedAt().toString());
        return m;
    }

    // ── Inner request class ──────────────────────────────────
    public static class RoomBookingRequest {
        private String  customerId;
        private String  customerEmail;
        private String  customerName;
        private String  name;
        private Integer age;
        private String  contact;
        private String  address;
        private String  idProof;
        private String  roomType;
        private String  bedSize;
        private Integer floor;
        private boolean balcony;
        private boolean pool;

        public RoomBookingRequest() {}

        public String  getCustomerId()  { return customerId; }
        public String  getCustomerEmail() { return customerEmail; }
        public String  getCustomerName() { return customerName; }
        public String  getName()    { return name; }
        public Integer getAge()     { return age; }
        public String  getContact() { return contact; }
        public String  getAddress() { return address; }
        public String  getIdProof() { return idProof; }
        public String  getRoomType(){ return roomType; }
        public String  getBedSize() { return bedSize; }
        public Integer getFloor()   { return floor; }
        public boolean isBalcony()  { return balcony; }
        public boolean isPool()     { return pool; }

        public void setCustomerId(String v)    { this.customerId = v; }
        public void setCustomerEmail(String v) { this.customerEmail = v; }
        public void setCustomerName(String v)  { this.customerName = v; }
        public void setName(String v)    { this.name = v; }
        public void setAge(Integer v)    { this.age = v; }
        public void setContact(String v) { this.contact = v; }
        public void setAddress(String v) { this.address = v; }
        public void setIdProof(String v) { this.idProof = v; }
        public void setRoomType(String v){ this.roomType = v; }
        public void setBedSize(String v) { this.bedSize = v; }
        public void setFloor(Integer v)  { this.floor = v; }
        public void setBalcony(boolean v){ this.balcony = v; }
        public void setPool(boolean v)   { this.pool = v; }
    }
}
