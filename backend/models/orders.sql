CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    Order_Id VARCHAR(255) NOT NULL UNIQUE,

    User_Id INT NOT NULL,

    

    Status ENUM('hold','paid','cancelled') DEFAULT 'hold',

    Sub_Total DECIMAL(10,2) DEFAULT 0,
    Tax DECIMAL(10,2) DEFAULT 0,
    Discount DECIMAL(10,2) DEFAULT 0,
    Total DECIMAL(10,2) DEFAULT 0,

    Payment_Type ENUM('cash','card','upi','none') DEFAULT 'none',
    Payment_Status ENUM('pending','completed') DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

   
);
