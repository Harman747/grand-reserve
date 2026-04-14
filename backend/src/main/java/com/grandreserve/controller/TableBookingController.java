package com.grandreserve.controller;

import com.grandreserve.dto.StatusUpdateRequest;
import com.grandreserve.entity.TableBooking;
import com.grandreserve.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tables")
public class TableBookingController {

    private final BookingService bookingService;

    public TableBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Customer: create table booking
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody TableBookingRequest req) {
        TableBooking b = bookingService.createTableBooking(
            req.getCustomerId(), req.getCustomerEmail(), req.getCustomerName(),
            req.getName(), req.getAge(),
            req.getContact(), req.getFloor(), req.getSeats()
        );
        return ResponseEntity.ok(toMap(b));
    }

    // Customer: own bookings
    @GetMapping("/my/{userId}")
    public ResponseEntity<List<Map<String, Object>>> myBookings(@PathVariable String userId) {
        List<Map<String, Object>> result = bookingService.getTableBookingsByUser(userId)
                .stream().map(this::toMap).toList();
        return ResponseEntity.ok(result);
    }

    // Management: all bookings
    @GetMapping
    @PreAuthorize("hasRole('MANAGEMENT')")
    public ResponseEntity<List<Map<String, Object>>> all() {
        List<Map<String, Object>> result = bookingService.getAllTableBookings()
                .stream().map(this::toMap).toList();
        return ResponseEntity.ok(result);
    }

    // Management: update status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('MANAGEMENT')")
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Long id,
                                                            @RequestBody StatusUpdateRequest req) {
        TableBooking b = bookingService.updateTableStatus(id, req.getStatus());
        return ResponseEntity.ok(toMap(b));
    }

    // Management: delete
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGEMENT')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        bookingService.deleteTableBooking(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Deleted successfully");
        return ResponseEntity.ok(res);
    }

    private Map<String, Object> toMap(TableBooking b) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",        b.getId());
        m.put("name",      b.getName());
        m.put("age",       b.getAge());
        m.put("contact",   b.getContact());
        m.put("floor",     b.getFloor());
        m.put("seats",     b.getSeats());
        m.put("price",     b.getPrice());
        m.put("status",    b.getStatus());
        m.put("customerId",    b.getCustomerId() != null ? b.getCustomerId().toString() : null);
        m.put("customerEmail", b.getCustomerEmail());
        m.put("customerName",  b.getCustomerName());
        m.put("createdAt", b.getCreatedAt().toString());
        return m;
    }

    // ── Inner request class ──────────────────────────────────
    public static class TableBookingRequest {
        private String  customerId;
        private String  customerEmail;
        private String  customerName;
        private String  name;
        private Integer age;
        private String  contact;
        private Integer floor;
        private Integer seats;

        public TableBookingRequest() {}

        public String  getCustomerId()  { return customerId; }
        public String  getCustomerEmail() { return customerEmail; }
        public String  getCustomerName() { return customerName; }
        public String  getName()    { return name; }
        public Integer getAge()     { return age; }
        public String  getContact() { return contact; }
        public Integer getFloor()   { return floor; }
        public Integer getSeats()   { return seats; }

        public void setCustomerId(String v)    { this.customerId = v; }
        public void setCustomerEmail(String v) { this.customerEmail = v; }
        public void setCustomerName(String v)  { this.customerName = v; }
        public void setName(String v)    { this.name = v; }
        public void setAge(Integer v)    { this.age = v; }
        public void setContact(String v) { this.contact = v; }
        public void setFloor(Integer v)  { this.floor = v; }
        public void setSeats(Integer v)  { this.seats = v; }
    }
}
