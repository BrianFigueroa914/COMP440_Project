CREATE DATABASE IF NOT EXISTS mydb;
USE mydb;
CREATE TABLE IF NOT EXISTS user (
    username   VARCHAR(50) PRIMARY KEY,
    password   VARCHAR(255) NOT NULL,
    firstName  VARCHAR(50),
    lastName   VARCHAR(50),
    email      VARCHAR(100) UNIQUE,
    phone      VARCHAR(20) UNIQUE
);

SELECT * FROM user LIMIT 1000;