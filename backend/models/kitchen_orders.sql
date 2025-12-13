CREATE TABLE kitchen_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    KOT_Id VARCHAR(255) NOT NULL UNIQUE,    
    Order_Id VARCHAR(255) NOT NULL,
    Status ENUM('pending','accepted','preparing','ready','completed','cancelled') DEFAULT 'pending',
    
    created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    
);
