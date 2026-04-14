package com.grandreserve.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "room_bookings")
public class RoomBooking {

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
    private String  address;
    @Column(name = "id_proof")
    private String  idProof;
    @Column(name = "room_type")
    private String  roomType;
    @Column(name = "bed_size")
    private String  bedSize;
    private Integer floor;
    private boolean balcony;
    private boolean pool;
    private Integer price;

    private String status = "pending";

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public RoomBooking() {}

    private RoomBooking(Builder b) {
        this.customerId = b.customerId;
        this.customerEmail = b.customerEmail;
        this.customerName = b.customerName;
        this.name     = b.name;
        this.age      = b.age;
        this.contact  = b.contact;
        this.address  = b.address;
        this.idProof  = b.idProof;
        this.roomType = b.roomType;
        this.bedSize  = b.bedSize;
        this.floor    = b.floor;
        this.balcony  = b.balcony;
        this.pool     = b.pool;
        this.price    = b.price;
        this.status   = "pending";
        this.createdAt = OffsetDateTime.now();
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID customerId;
        private String customerEmail, customerName;
        private String name, contact, address, idProof, roomType, bedSize;
        private Integer age, floor, price;
        private boolean balcony, pool;

        public Builder customerId(UUID v)      { this.customerId = v; return this; }
        public Builder customerEmail(String v) { this.customerEmail = v; return this; }
        public Builder customerName(String v)  { this.customerName = v; return this; }
        public Builder name(String v)     { this.name = v;      return this; }
        public Builder age(Integer v)     { this.age = v;       return this; }
        public Builder contact(String v)  { this.contact = v;   return this; }
        public Builder address(String v)  { this.address = v;   return this; }
        public Builder idProof(String v)  { this.idProof = v;   return this; }
        public Builder roomType(String v) { this.roomType = v;  return this; }
        public Builder bedSize(String v)  { this.bedSize = v;   return this; }
        public Builder floor(Integer v)   { this.floor = v;     return this; }
        public Builder balcony(boolean v) { this.balcony = v;   return this; }
        public Builder pool(boolean v)    { this.pool = v;      return this; }
        public Builder price(Integer v)   { this.price = v;     return this; }
        public RoomBooking build()        { return new RoomBooking(this); }
    }

    // Getters
    public Long          getId()        { return id; }
    public UUID          getCustomerId(){ return customerId; }
    public String        getCustomerEmail(){ return customerEmail; }
    public String        getCustomerName(){ return customerName; }
    public String        getName()      { return name; }
    public Integer       getAge()       { return age; }
    public String        getContact()   { return contact; }
    public String        getAddress()   { return address; }
    public String        getIdProof()   { return idProof; }
    public String        getRoomType()  { return roomType; }
    public String        getBedSize()   { return bedSize; }
    public Integer       getFloor()     { return floor; }
    public boolean       isBalcony()    { return balcony; }
    public boolean       isPool()       { return pool; }
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
    public void setAddress(String v)        { this.address = v; }
    public void setIdProof(String v)        { this.idProof = v; }
    public void setRoomType(String v)       { this.roomType = v; }
    public void setBedSize(String v)        { this.bedSize = v; }
    public void setFloor(Integer v)         { this.floor = v; }
    public void setBalcony(boolean v)       { this.balcony = v; }
    public void setPool(boolean v)          { this.pool = v; }
    public void setPrice(Integer v)         { this.price = v; }
    public void setStatus(String v)         { this.status = v; }
    public void setCreatedAt(OffsetDateTime v){ this.createdAt = v; }
}
