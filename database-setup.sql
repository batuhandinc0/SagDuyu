-- SagDuyu Database Setup Script
-- This script creates the database, user, and sets up permissions

-- Create database
CREATE DATABASE IF NOT EXISTS tubitak_sagduyu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (change password as needed)
CREATE USER IF NOT EXISTS 'sagduyu_user'@'localhost' IDENTIFIED BY 'sagduyu_password_2024';

-- Grant privileges
GRANT ALL PRIVILEGES ON tubitak_sagduyu.* TO 'sagduyu_user'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Use the database
USE tubitak_sagduyu;

-- Enable foreign key checks (Sequelize will handle this)
SET FOREIGN_KEY_CHECKS = 1;

-- Create tables (Sequelize will create these, but this is for reference)

-- Users table
-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     email VARCHAR(255) NOT NULL UNIQUE,
--     password VARCHAR(255) NOT NULL,
--     role ENUM('doctor', 'patient') NOT NULL,
--     is_active BOOLEAN DEFAULT TRUE,
--     last_login DATETIME NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- Doctors table
-- CREATE TABLE doctors (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT NOT NULL UNIQUE,
--     full_name VARCHAR(255) NOT NULL,
--     branch VARCHAR(255) NOT NULL,
--     hospital_name VARCHAR(255) NOT NULL,
--     phone VARCHAR(20) NOT NULL,
--     license_number VARCHAR(50) NULL UNIQUE,
--     experience INT NULL,
--     is_verified BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- Patients table
-- CREATE TABLE patients (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT NOT NULL UNIQUE,
--     full_name VARCHAR(255) NOT NULL,
--     tc_no VARCHAR(11) NOT NULL UNIQUE,
--     birth_date DATE NOT NULL,
--     blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-') NOT NULL,
--     height DECIMAL(5,2) NOT NULL,
--     weight DECIMAL(5,2) NOT NULL,
--     gender ENUM('male', 'female') NOT NULL,
--     address TEXT NULL,
--     emergency_contact VARCHAR(255) NULL,
--     emergency_phone VARCHAR(20) NULL,
--     allergies TEXT NULL,
--     chronic_diseases TEXT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- Lab Results table
-- CREATE TABLE lab_results (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     patient_id INT NOT NULL,
--     doctor_id INT NOT NULL,
--     test_type VARCHAR(255) NOT NULL,
--     test_name VARCHAR(255) NOT NULL,
--     result_summary TEXT NOT NULL,
--     detailed_results JSON NULL,
--     file_url VARCHAR(500) NULL,
--     file_name VARCHAR(255) NULL,
--     test_date DATETIME NOT NULL,
--     result_date DATETIME NULL,
--     status ENUM('pending', 'in_progress', 'completed', 'reviewed') DEFAULT 'pending',
--     priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
--     notes TEXT NULL,
--     is_confidential BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
--     FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
-- );

-- Appointments table
-- CREATE TABLE appointments (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     patient_id INT NOT NULL,
--     doctor_id INT NOT NULL,
--     appointment_date DATETIME NOT NULL,
--     duration INT DEFAULT 30,
--     status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
--     appointment_type ENUM('consultation', 'follow_up', 'emergency', 'lab_follow_up') NOT NULL,
--     reason TEXT NOT NULL,
--     notes TEXT NULL,
--     prescription TEXT NULL,
--     diagnosis VARCHAR(500) NULL,
--     treatment TEXT NULL,
--     follow_up_required BOOLEAN DEFAULT FALSE,
--     follow_up_date DATETIME NULL,
--     cancelled_at DATETIME NULL,
--     cancellation_reason VARCHAR(500) NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
--     FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
-- );

-- Insert sample data (optional - for testing)

-- Sample doctor user
-- INSERT INTO users (email, password, role, is_active) VALUES 
-- ('dr.ahmet@example.com', '$2b$12$LQv3c1yqBwAH6jG9kXkqJOj7H6Z8bM9N5P4Q8R2S3T4U5V6W7X8Y9Z0', 'doctor', TRUE);

-- Get the inserted user ID and create doctor profile
-- INSERT INTO doctors (user_id, full_name, branch, hospital_name, phone, license_number, experience, is_verified) VALUES 
-- (1, 'Dr. Ahmet Yılmaz', 'Kardiyoloji', 'XX Hastanesi', '05551234567', 'DOC001', 15, TRUE);

-- Sample patient user
-- INSERT INTO users (email, password, role, is_active) VALUES 
-- ('hasta@example.com', '$2b$12$LQv3c1yqBwAH6jG9kXkqJOj7H6Z8bM9N5P4Q8R2S3T4U5V6W7X8Y9Z0', 'patient', TRUE);

-- Get the inserted user ID and create patient profile  
-- INSERT INTO patients (user_id, full_name, tc_no, birth_date, blood_type, height, weight, gender) VALUES 
-- (2, 'Mehmet Demir', '12345678901', '1990-05-15', 'A+', 175.00, 70.50, 'male');

-- Create indexes for better performance
-- CREATE INDEX idx_users_email ON users(email);
-- CREATE INDEX idx_users_role ON users(role);
-- CREATE INDEX idx_patients_tc_no ON patients(tc_no);
-- CREATE INDEX idx_lab_results_patient_id ON lab_results(patient_id);
-- CREATE INDEX idx_lab_results_doctor_id ON lab_results(doctor_id);
-- CREATE INDEX idx_lab_results_status ON lab_results(status);
-- CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
-- CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
-- CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- Show confirmation message
SELECT 'Database setup completed successfully!' as message;

-- Show created tables
SHOW TABLES;