package com.grandreserve.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "management_users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true)
    private String email;          // nullable for legacy staff accounts

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    public enum Role { CUSTOMER, MANAGEMENT }

    public User() {}

    private User(Builder b) {
        this.username = b.username;
        this.email    = b.email;
        this.password = b.password;
        this.name     = b.name;
        this.role     = b.role;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String username, email, password, name;
        private Role role;
        public Builder username(String v) { this.username = v; return this; }
        public Builder email(String v)    { this.email = v;    return this; }
        public Builder password(String v) { this.password = v; return this; }
        public Builder name(String v)     { this.name = v;     return this; }
        public Builder role(Role v)       { this.role = v;     return this; }
        public User build()               { return new User(this); }
    }

    // Getters
    public Long   getId()       { return id; }
    public String getUsername() { return username; }
    public String getEmail()    { return email; }
    public String getPassword() { return password; }
    public String getName()     { return name; }
    public Role   getRole()     { return role; }

    // Setters
    public void setId(Long v)        { this.id = v; }
    public void setUsername(String v){ this.username = v; }
    public void setEmail(String v)   { this.email = v; }
    public void setPassword(String v){ this.password = v; }
    public void setName(String v)    { this.name = v; }
    public void setRole(Role v)      { this.role = v; }
}
