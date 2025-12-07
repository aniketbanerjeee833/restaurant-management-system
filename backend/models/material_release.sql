CREATE TABLE IF NOT EXISTS material_release (
 id INT AUTO_INCREMENT PRIMARY KEY,
 Material_Release_Id VARCHAR(255) NOT NULL UNIQUE,
             
  Material_Id VARCHAR(255) NOT NULL,
  Released_Quantity DECIMAL(10,2) NOT NULL,
  Released_By VARCHAR(255),                     -- staff user_id
                       
  Release_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

);
