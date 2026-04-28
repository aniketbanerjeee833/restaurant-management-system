CREATE TABLE pre_booked_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,

    Pre_Booked_Order_Id VARCHAR(255) NOT NULL UNIQUE,

    User_Id INT NOT NULL,
    Customer_Id VARCHAR(255) NOT NULL,

    Booking_Date DATE NOT NULL,
    Booking_Time TIME NOT NULL,

    Address VARCHAR(500) NOT NULL,

    Advance_Payment DECIMAL(10,2) DEFAULT 0.00,
    Sub_Total DECIMAL(10,2) DEFAULT 0.00,
   
    Discount DECIMAL(10,2) DEFAULT 0.00,
    Total DECIMAL(10,2) DEFAULT 0.00,

    Payment_Type ENUM('cash','card','upi','none') DEFAULT 'none',
    Payment_Status ENUM('pending','completed') DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
