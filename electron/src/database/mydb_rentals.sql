CREATE TABLE rental_unit (
   id INT AUTO_INCREMENT PRIMARY KEY,
   username VARCHAR(255) NOT NULL,
   title VARCHAR(255) NOT NULL,
   description TEXT,
   feature VARCHAR(255),
   price INT NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE review (
   id INT AUTO_INCREMENT PRIMARY KEY,
   rental_id INT NOT NULL,
   username VARCHAR(255) NOT NULL,
   rating VARCHAR(10) NOT NULL,
   comment TEXT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (rental_id) REFERENCES rental_unit(id)
);