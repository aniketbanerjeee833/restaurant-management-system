CREATE TABLE orders_takeaway (
    id INT PRIMARY KEY AUTO_INCREMENT,
    Takeaway_Order_Id VARCHAR(255) NOT NULL UNIQUE,

  

 

    Status ENUM('hold','paid','cancelled') DEFAULT 'hold',

    Sub_Total DECIMAL(10,2) DEFAULT 0,
   
    Discount DECIMAL(10,2) DEFAULT 0,
    Amount DECIMAL(10,2) DEFAULT 0,

    
    Payment_Status ENUM('pending','completed') DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
