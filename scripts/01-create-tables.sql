-- Chess Auth Database Schema
CREATE DATABASE IF NOT EXISTS sql12788046;
USE sql12788046;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    app_name VARCHAR(100) NOT NULL,
    public_key VARCHAR(64) UNIQUE NOT NULL,
    secret_key VARCHAR(64) UNIQUE NOT NULL,
    hwid_lock BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Licenses table
CREATE TABLE IF NOT EXISTS licenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    license_key VARCHAR(64) UNIQUE NOT NULL,
    username VARCHAR(50) NOT NULL,
    hwid VARCHAR(255) NULL,
    subscription_type ENUM('free', 'pro', 'premium') DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_banned BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Settings table for custom messages per app
CREATE TABLE IF NOT EXISTS app_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    login_success_msg VARCHAR(255) DEFAULT 'Login successful',
    login_error_msg VARCHAR(255) DEFAULT 'Invalid credentials',
    sub_expired_msg VARCHAR(255) DEFAULT 'Subscription expired',
    banned_msg VARCHAR(255) DEFAULT 'Account banned',
    hwid_mismatch_msg VARCHAR(255) DEFAULT 'HWID mismatch',
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Logs table
CREATE TABLE IF NOT EXISTS logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NULL,
    username VARCHAR(50) NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL
);
