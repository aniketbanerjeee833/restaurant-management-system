CREATE TABLE pre_booked_order_tables (
    id INT AUTO_INCREMENT PRIMARY KEY,

    Pre_Booked_Order_Id VARCHAR(255) NOT NULL,
    Table_Id INT NOT NULL,

    -- Optional but powerful
    Reserved_From DATETIME NULL,
    Reserved_Till DATETIME NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

 
);
