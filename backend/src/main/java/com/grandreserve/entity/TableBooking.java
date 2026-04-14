package com.grandreserve.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "table_bookings")
public class TableBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "customer_email", nullable = false)
    private String customerEmail;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    private String  name;
    private Integer age;
    private String  contact;
    private Integer floor;
    private Integer seats;
    private Integer price;

    private String status = "pending";

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public TableBooking() {}

    private TableBooking(Builder b) {
        this.customerId = b.customerId;
        this.customerEmail = b.customerEmail;
        this.customerName = b.customerName;
        this.name      = b.name;
        this.age       = b.age;
        this.contact   = b.contact;
        this.floor     = b.floor;
        this.seats     = b.seats;
        this.price     = b.price;
        this.status    = "pending";
        this.createdAt = OffsetDateTime.now();
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID customerId;
        private String customerEmail, customerName;
        private String name, contact;
        private Integer age, floor, seats, price;

        public Builder customerId(UUID v)      { this.customerId = v; return this; }
        public Builder customerEmail(String v) { this.customerEmail = v; return this; }
        public Builder customerName(String v)  { this.customerName = v; return this; }
        public Builder name(String v)    { this.name = v;     return this; }
        public Builder age(Integer v)    { this.age = v;      return this; }
        public Builder contact(String v) { this.contact = v;  return this; }
        public Builder floor(Integer v)  { this.floor = v;    return this; }
        public Builder seats(Integer v)  { this.seats = v;    return this; }
        public Builder price(Integer v)  { this.price = v;    return this; }
        public TableBooking build()      { return new TableBooking(this); }
    }

    // Getters
    public Long          getId()        { return id; }
    public UUID          getCustomerId(){ return customerId; }
    public String        getCustomerEmail(){ return customerEmail; }
    public String        getCustomerName(){ return customerName; }
    public String        getName()      { return name; }
    public Integer       getAge()       { return age; }
    public String        getContact()   { return contact; }
    public Integer       getFloor()     { return floor; }
    public Integer       getSeats()     { return seats; }
    public Integer       getPrice()     { return price; }
    public String        getStatus()    { return status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    // Setters
    public void setId(Long v)               { this.id = v; }
    public void setCustomerId(UUID v)       { this.customerId = v; }
    public void setCustomerEmail(String v)  { this.customerEmail = v; }
    public void setCustomerName(String v)   { this.customerName = v; }
    public void setName(String v)           { this.name = v; }
    public void setAge(Integer v)           { this.age = v; }
    public void setContact(String v)        { this.contact = v; }
    public void setFloor(Integer v)         { this.floor = v; }
    public void setSeats(Integer v)         { this.seats = v; }
    public void setPrice(Integer v)         { this.price = v; }
    public void setStatus(String v)         { this.status = v; }
    public void setCreatedAt(OffsetDateTime v){ this.createdAt = v; }
}
