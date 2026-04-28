CREATE TABLE food_stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,

  Item_Id VARCHAR(255) NOT NULL,
  Stock_Date DATE NOT NULL,

--   Movement_Type ENUM('ADD','SALE','ADJUST') NOT NULL,
  Quantity INT NOT NULL,

--   Ref_Type ENUM('ADMIN','DINE_IN','TAKEAWAY') NOT NULL,
--   Ref_Id VARCHAR(50),   -- Admin user id / Order id

User_Id VARCHAR(255) NOT NULL,
  created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

  -- Prevent duplicate movements for same order & item
 
);
