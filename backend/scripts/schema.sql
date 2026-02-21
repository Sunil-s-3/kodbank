-- Kodbank Database Schema for Aiven MySQL
-- Run this manually if migrate.js is not used

CREATE TABLE IF NOT EXISTS kodusers (
  uid INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 100000,
  phone VARCHAR(50),
  role ENUM('Customer', 'manager', 'admin') NOT NULL DEFAULT 'Customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS CJWT (
  token_id INT PRIMARY KEY AUTO_INCREMENT,
  token TEXT NOT NULL,
  user_id INT NOT NULL,
  expiry DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES kodusers(uid) ON DELETE CASCADE,
  INDEX idx_token (token(255)),
  INDEX idx_user_id (user_id),
  INDEX idx_expiry (expiry)
);
