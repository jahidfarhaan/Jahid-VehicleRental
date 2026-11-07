-- ====================================================================
-- Jahid Vehicle Rentals - Database Initialization Script
-- Database: rental_db
-- ====================================================================

-- 1. Create and switch to rental_db
CREATE DATABASE IF NOT EXISTS rental_db;
USE rental_db;

-- 2. Drop existing tables if they exist (clean setup)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS vehicles;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. Create 'vehicles' table
-- vehicle_category restricted to 'Car' or 'Motorbike'
CREATE TABLE vehicles (
    vehicle_no VARCHAR(50) NOT NULL PRIMARY KEY,
    vehicle_category VARCHAR(20) NOT NULL CHECK (vehicle_category IN ('Car', 'Motorbike')),
    model VARCHAR(100) NOT NULL,
    rent_per_day INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Available'
);

-- 4. Create 'customers' table
-- rented_vehicle_no has Foreign Key referencing vehicles.vehicle_no
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    phone_no VARCHAR(20) NOT NULL,
    rented_vehicle_no VARCHAR(50),
    rental_date DATE NOT NULL,
    CONSTRAINT fk_customer_vehicle
        FOREIGN KEY (rented_vehicle_no) 
        REFERENCES vehicles(vehicle_no)
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);

-- 5. Seed initial fleet inventory data
INSERT INTO vehicles (vehicle_no, vehicle_category, model, rent_per_day, status) VALUES
('KA-01-SP-9009', 'Car', 'Ferrari SF90 Stradale', 15000, 'Available'),
('KA-05-SUV-4040', 'Car', 'Range Rover SV Autobiography', 9500, 'Rented'),
('KA-03-SD-2121', 'Car', 'Mercedes-Benz S-Class AMG Line', 7500, 'Available'),
('KA-04-BK-7777', 'Motorbike', 'Ducati Panigale V4 Superbike', 5000, 'Available'),
('KA-02-CR-1100', 'Motorbike', 'Harley-Davidson Fat Bob 114 Cruiser', 3800, 'Rented'),
('KA-09-SP-3333', 'Car', 'BMW M4 Competition Coupe', 11000, 'Available');

-- 6. Seed initial customer rental logs
INSERT INTO customers (customer_name, phone_no, rented_vehicle_no, rental_date) VALUES
('Alexandre Sterling', '+91-98765-43210', 'KA-05-SUV-4040', '2026-11-04'),
('Zainab Al-Mansoor', '+91-98123-56789', 'KA-02-CR-1100', '2026-11-06');
