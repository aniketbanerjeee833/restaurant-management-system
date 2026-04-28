import { io } from "../../app.js";
import db from "../../config/db.js";
// import escpos from "escpos";
// import Network from "escpos-network";

// escpos.Network = Network;


async function generateNextId(connection, prefix, column, table) {
    const [rows] = await connection.query(
        `SELECT ${column} FROM ${table} ORDER BY id DESC LIMIT 1 FOR UPDATE`
    );

    if (rows.length === 0) return prefix + "00001";

    const lastId = rows[0][column];
    const num = parseInt(lastId.replace(prefix, ""), 10) + 1;

    return prefix + num.toString().padStart(5, "0");
}
// async function generateNextInvoiceId(connection, prefix, column, table) {
//   const [rows] = await connection.query(
//     `SELECT ${column} FROM ${table} ORDER BY id DESC LIMIT 1`
//   );

//   if (rows.length === 0) return prefix + "001";

//   const lastId = rows[0][column];
//   const num = parseInt(lastId.replace(prefix, ""), 10) + 1;

//   return prefix + num.toString().padStart(3, "0");
// }

// const addNewCustomer = async (req, res, next) => {
//     let connection;
//     try{
     

//       const { Customer_Name, Customer_Phone,Customer_Address,Customer_Date } = req.body;
//       if (!Customer_Phone) {
//         return res.status(400).json({
//           success: false,
//           message: "Customer phone number is required.",
//       })
//     }

  

//        connection = await db.getConnection();
//        await connection.beginTransaction();

//        const[customers]= await connection.query(
//         `SELECT * FROM customers WHERE Customer_Phone = ?`,
//         [Customer_Phone]
//       );
//       if(customers.length>0){
//         await connection.rollback();
//         return res.status(400).json({
//             success: false,
//             message: "Customer with this phone number already exists.",
//         })
//       }

//          const Customer_Id = await generateNextId(
//     connection,
//     "CUST",
//     "Customer_Id",
//     "customers"
//   );
//         await connection.query(
//             `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone,
//             Customer_Address,Special_Date
//             ) VALUES (?, ?, ?, ?, ?)`,
//             [Customer_Id, Customer_Name, Customer_Phone,Customer_Address,Customer_Date]
//         );

//           await connection.commit();
//         return res.status(201).json({
//             success: true,
//             message: "Customer added successfully.",
//             Customer_Id,
//             Customer_Name,
//             Customer_Phone,
//         });

      
//     }catch(err){
//         console.error("❌ Error adding new customer:", err);
//         next(err);
//     }finally{
//         if(connection) connection.release();
//     }
// }
const addNewCustomer = async (req, res, next) => {
  let connection;

  try {
    const {
      Customer_Name,
      Customer_Phone,
      Customer_Address,
      Customer_Date,
    } = req.body;

    if (!Customer_Phone) {
      return res.status(400).json({
        success: false,
        message: "Customer phone number is required.",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    /* ---------------------------------------------------
       1️⃣ CHECK IF CUSTOMER EXISTS BY PHONE
    --------------------------------------------------- */
    const [customers] = await connection.query(
      `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
      [Customer_Phone]
    );

    /* ---------------------------------------------------
       2️⃣ IF EXISTS → UPDATE
    --------------------------------------------------- */
    if (customers.length > 0) {
      const Customer_Id = customers[0].Customer_Id;

      await connection.query(
        `UPDATE customers
         SET 
           Customer_Name = COALESCE(?, Customer_Name),
           Customer_Address = COALESCE(?, Customer_Address),
           Special_Date = COALESCE(?, Special_Date),
           updated_at = NOW()
         WHERE Customer_Id = ?`,
        [
          Customer_Name,
          Customer_Address,
          Customer_Date,
          Customer_Id,
        ]
      );

      await connection.commit();

      return res.status(200).json({
        success: true,
        message: "Customer updated successfully.",
        Customer_Id,
        Customer_Name,
        Customer_Phone,
      });
    }

    /* ---------------------------------------------------
       3️⃣ IF NOT EXISTS → INSERT
    --------------------------------------------------- */
    const Customer_Id = await generateNextId(
      connection,
      "CUST",
      "Customer_Id",
      "customers"
    );

    await connection.query(
      `INSERT INTO customers
       (Customer_Id, Customer_Name, Customer_Phone, Customer_Address, Special_Date)
       VALUES (?, ?, ?, ?, ?)`,
      [
        Customer_Id,
        Customer_Name,
        Customer_Phone,
        Customer_Address,
        Customer_Date,
      ]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Customer added successfully.",
      Customer_Id,
      Customer_Name,
      Customer_Phone,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error adding/updating customer:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

// const addOrder = async (req, res, next) => {
//   let connection;


//   try {
//     const {
//       Customer_Name,
//       Customer_Phone,
//       userId,
//       Table_Names,
//       items,
//       Sub_Total,
//       Amount,
//     } = req.body;
// const normalizedCustomerName =Customer_Name && Customer_Name.trim() !== ""
//     ? Customer_Name.trim()
//     : null;
//     /* ---------------- VALIDATIONS ---------------- */
//     if (!userId || !Array.isArray(Table_Names) || Table_Names.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID and table are required",
//       });
//     }

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one item is required",
//       });
//     }

//     // if (!Customer_Phone) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: "Customer  phone number is required",
//     //   });
//     // }

//     /* ---------------- DB START ---------------- */
//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     /* ---------------- CUSTOMER ---------------- */
//     let Customer_Id;
//     const [existingCustomer] = await connection.query(
//       `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
//       [Customer_Phone]
//     );

//     if (existingCustomer.length) {
//       Customer_Id = existingCustomer[0].Customer_Id;
//     } else {
//       Customer_Id = await generateNextId(
//         connection,
//         "CUST",
//         "Customer_Id",
//         "customers"
//       );

//       await connection.query(
//         `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
//          VALUES (?, ?, ?)`,
//         [Customer_Id,   normalizedCustomerName, Customer_Phone]
//       );
//     }

//     /* ---------------- ORDER ---------------- */
//     const Order_Id = await generateNextId(connection, "ODR", "Order_Id", "orders");

//     await connection.query(
//       `INSERT INTO orders
//        (Order_Id, User_Id, Customer_Id, Status, Sub_Total, Discount, Amount, Payment_Status)
//        VALUES (?, ?, ?, 'hold', ?, 0, ?, 'pending')`,
//       [Order_Id, userId, Customer_Id, Sub_Total, Amount]
//     );

//     /* ---------------- TABLES ---------------- */
//     for (const tableName of Table_Names) {
//       const [[tbl]] = await connection.query(
//         `SELECT Table_Id, Status FROM add_table WHERE Table_Name = ?`,
//         [tableName]
//       );

//       if (!tbl) {
//         await connection.rollback();
//         return res.status(400).json({ success: false, message: "Table not found" });
//       }

//       if (tbl.Status === "occupied") {
//         await connection.rollback();
//         return res.status(400).json({ success: false, message: "Table occupied" });
//       }

//       const Order_Table_Id = await generateNextId(
//         connection,
//         "OTB",
//         "Order_Table_Id",
//         "order_tables"
//       );

//       await connection.query(
//         `INSERT INTO order_tables (Order_Table_Id, Order_Id, Table_Id)
//          VALUES (?, ?, ?)`,
//         [Order_Table_Id, Order_Id, tbl.Table_Id]
//       );

//       await connection.query(
//         `UPDATE add_table SET Status='occupied', Start_Time=NOW()
//          WHERE Table_Id = ?`,
//         [tbl.Table_Id]
//       );
//     }

//     /* ---------------- KOT ---------------- */
//     const KOT_Id = await generateNextId(connection, "KOT", "KOT_Id", "kitchen_orders");

//     await connection.query(
//       `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
//        VALUES (?, ?, 'pending')`,
//       [KOT_Id, Order_Id]
//     );

//     /* ---------------- INSERT ITEMS ---------------- */
//     for (const item of items) {
//       const [[dbItem]] = await connection.query(
//         `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
//         [item.Item_Name]
//       );

//       if (!dbItem) {
//         await connection.rollback();
//         return res.status(400).json({
//           success: false,
//           message: `Item not found: ${item.Item_Name}`,
//         });
//       }

//       const Item_Id = dbItem.Item_Id;

//       const Order_Item_Id = await generateNextId(
//         connection,
//         "ODRITM",
//         "Order_Item_Id",
//         "order_items"
//       );

//       await connection.query(
//         `INSERT INTO order_items
//          (Order_Item_Id, Order_Id, Item_Id, Quantity, Price, Amount)
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [
//           Order_Item_Id,
//           Order_Id,
//           Item_Id,
//           item.Item_Quantity,
//           item.Item_Price,
//           item.Amount,
//         ]
//       );

//       // one kitchen row per quantity
//       // for (let i = 0; i < item.Item_Quantity; i++) {
//         const KOT_Item_Id = await generateNextId(
//           connection,
//           "KOTITM",
//           "KOT_Item_Id",
//           "kitchen_order_items"
//         );

//         await connection.query(
//           `INSERT INTO kitchen_order_items
//            (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
//            VALUES (?, ?, ?, ?, ?, 'pending')`,
//           [KOT_Item_Id, KOT_Id, Item_Id, item.Item_Name,item.Item_Quantity]
//         );
//       //}
//     }

//     /* ---------------- FETCH FULL KOT ITEMS + CATEGORY ---------------- */
//     const [kotItems] = await connection.query(
//       `
//       SELECT 
//         koi.KOT_Item_Id,
//         koi.Item_Id,
//         koi.Item_Name,
//         koi.Quantity,
//         koi.Item_Status,
//         fi.Item_Category
//       FROM kitchen_order_items koi
//       JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
//       WHERE koi.KOT_Id = ?
//       `,
//       [KOT_Id]
//     );

//     /* ---------------- GROUP BY CATEGORY ---------------- */
//     const byCategory = {};
//     kotItems.forEach((it) => {
//       if (!byCategory[it.Item_Category]) {
//         byCategory[it.Item_Category] = [];
//       }
//       byCategory[it.Item_Category].push(it);
//     });

//     await connection.commit();

//     /* ---------------- SOCKET (ONCE PER CATEGORY) ---------------- */
//     Object.entries(byCategory).forEach(([category, items]) => {
//       io.to(`category_${category}`).emit("new_kitchen_order", {
//         KOT_Id,
//         Order_Id,
//         Order_Type: "dinein",
//         Status: "pending",
//         items,
//       });
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       Order_Id,
//       KOT_Id,
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Add Order Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
// async function checkDineInItemsElligibleForKOTPrint(items) {
//   let connection;

//   try {
//     if (!Array.isArray(items) || items.length === 0) {
//       return { success: false, elligibleItems: {} };
//     }

//     connection = await db.getConnection();

//     /* ---------------- FETCH ITEM CATEGORIES ---------------- */
//     const [itemRows] = await connection.query(
//       `SELECT Item_Name, Item_Category
//        FROM add_food_item
//        WHERE Item_Name IN (?) AND is_deleted = 0`,
//       [items.map((i) => i.Item_Name)]
//     );

//     /* ---------------- FETCH KITCHEN STAFF ---------------- */
//     const [staffRows] = await connection.query(
//       `SELECT User_Id, Category_Names
//        FROM kitchen_staff_categories`
//     );

//     /* ---------------- CATEGORY → USER MAP ---------------- */
//     const categoryToUserMap = new Map();

//     staffRows.forEach((row) => {
//       if (!row.Category_Names) return;

//       row.Category_Names
//         .split(",")
//         .map((c) => c.trim())
//         .filter(Boolean)
//         .forEach((category) => {
//           categoryToUserMap.set(category, row.User_Id);
//         });
//     });

//     /* ---------------- ITEM → QTY MAP ---------------- */
//     const quantityMap = new Map(
//       items.map((i) => [
//         i.Item_Name,
//         Number(i.Item_Quantity) > 0 ? Number(i.Item_Quantity) : 1,
//       ])
//     );

//     /* ---------------- USER → KITCHEN MAP ---------------- */
//     const userToKitchenMap = new Map();
//     let kitchenCounter = 1;

//     const elligibleItems = {};

//     /* ---------------- PROCESS ITEMS ---------------- */
//     itemRows.forEach((item) => {
//       const userId = categoryToUserMap.get(item.Item_Category);
//       if (!userId) return;

//       if (!userToKitchenMap.has(userId)) {
//         userToKitchenMap.set(userId, `Kitchen ${kitchenCounter++}`);
//       }

//       const kitchenName = userToKitchenMap.get(userId);

//       if (!elligibleItems[kitchenName]) {
//         elligibleItems[kitchenName] = [];
//       }

//       elligibleItems[kitchenName].push({
//         Item_Name: item.Item_Name,
//         Item_Category: item.Item_Category,
//         Item_Quantity: quantityMap.get(item.Item_Name),
//       });
//     });

//     return {
//       success: true,
//       elligibleItems,
//     };

//   } catch (err) {
//     console.error("❌ KOT eligibility error:", err);
//     return { success: false, elligibleItems: {} };
//   } finally {
//     if (connection) connection.release();
//   }
// }
async function checkDineInItemsElligibleForKOTPrint(items) {
  let connection;

  try {
    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, elligibleItems: {} };
    }

    connection = await db.getConnection();

    /* ---------------- FETCH ITEM CATEGORIES ---------------- */
    const [itemRows] = await connection.query(
      `
      SELECT Item_Name, Item_Category
      FROM add_food_item
      WHERE Item_Name IN (?) AND is_deleted = 0
      `,
      [items.map((i) => i.Item_Name)]
    );

    /* ---------------- FETCH KITCHEN STAFF + NAMES ---------------- */
    const [staffRows] = await connection.query(
      `
      SELECT 
        ksc.Category_Names,
        u.name AS Kitchen_Name
      FROM kitchen_staff_categories ksc
      JOIN users u ON u.User_Id = ksc.User_Id
      ORDER BY ksc.created_at ASC
      `
    );

    /* ---------------- CATEGORY → KITCHEN NAME MAP ---------------- */
    const categoryToKitchenMap = new Map();

    staffRows.forEach((row) => {
      if (!row.Category_Names || !row.Kitchen_Name) return;

      row.Category_Names
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .forEach((category) => {
          categoryToKitchenMap.set(category, row.Kitchen_Name); // ✅ REAL NAME
        });
    });

    /* ---------------- ITEM → QTY MAP ---------------- */
    const quantityMap = new Map(
      items.map((i) => [
        i.Item_Name,
        Number(i.Item_Quantity) > 0 ? Number(i.Item_Quantity) : 1,
      ])
    );

    /* ---------------- FINAL RESULT ---------------- */
    const elligibleItems = {};

    itemRows.forEach((item) => {
      const kitchenName = categoryToKitchenMap.get(item.Item_Category);
      if (!kitchenName) return; // category not assigned

      if (!elligibleItems[kitchenName]) {
        elligibleItems[kitchenName] = [];
      }

      elligibleItems[kitchenName].push({
        Item_Name: item.Item_Name,
        Item_Category: item.Item_Category,
        Item_Quantity: quantityMap.get(item.Item_Name),
      });
    });

    return {
      success: true,
      elligibleItems, // 🔥 Rahul, Aman, Kitchen4, etc.
    };

  } catch (err) {
    console.error("❌ KOT eligibility error:", err);
    return { success: false, elligibleItems: {} };
  } finally {
    if (connection) connection.release();
  }
}



// const addOrder = async (req, res, next) => {
//   let connection;
// const stockDate = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });


//   try {
//     const {
//       Customer_Name,
//       Customer_Phone,
//       userId,
//       Table_Names,
//       items,
//       Sub_Total,
//       Amount,
//     } = req.body;

//     const normalizedCustomerName =
//       Customer_Name && Customer_Name.trim() !== ""
//         ? Customer_Name.trim()
//         : null;

//     /* ---------------- VALIDATIONS ---------------- */
//     if (!userId || !Array.isArray(Table_Names) || Table_Names.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID and table are required",
//       });
//     }

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one item is required",
//       });
//     }

//     /* ---------------- DB START ---------------- */
//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     /* ---------------- CUSTOMER (OPTIONAL) ---------------- */
//     let Customer_Id = null;

//     if (Customer_Phone) {
//       const [existingCustomer] = await connection.query(
//         `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
//         [Customer_Phone]
//       );

//       if (existingCustomer.length) {
//         Customer_Id = existingCustomer[0].Customer_Id;
//       } else {
//         Customer_Id = await generateNextId(
//           connection,
//           "CUST",
//           "Customer_Id",
//           "customers"
//         );

//         await connection.query(
//           `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
//            VALUES (?, ?, ?)`,
//           [Customer_Id, normalizedCustomerName, Customer_Phone]
//         );
//       }
//     }

//     /* ---------------- ORDER ---------------- */
//     const Order_Id = await generateNextId(
//       connection,
//       "ODR",
//       "Order_Id",
//       "orders"
//     );

//     await connection.query(
//       `INSERT INTO orders
//        (Order_Id, User_Id, Customer_Id, Status, Sub_Total, Discount, Amount, Payment_Status)
//        VALUES (?, ?, ?, 'hold', ?, 0, ?, 'pending')`,
//       [Order_Id, userId, Customer_Id, Sub_Total, Amount]
//     );

//     /* ---------------- TABLES ---------------- */
//     for (const tableName of Table_Names) {
//       const [[tbl]] = await connection.query(
//         `SELECT Table_Id, Status FROM add_table WHERE Table_Name = ?`,
//         [tableName]
//       );

//       if (!tbl) {
//         await connection.rollback();
//         return res.status(400).json({
//           success: false,
//           message: "Table not found",
//         });
//       }

//       if (tbl.Status === "occupied") {
//         await connection.rollback();
//         return res.status(400).json({
//           success: false,
//           message: "Table occupied",
//         });
//       }

//       const Order_Table_Id = await generateNextId(
//         connection,
//         "OTB",
//         "Order_Table_Id",
//         "order_tables"
//       );

//       await connection.query(
//         `INSERT INTO order_tables (Order_Table_Id, Order_Id, Table_Id)
//          VALUES (?, ?, ?)`,
//         [Order_Table_Id, Order_Id, tbl.Table_Id]
//       );

//       await connection.query(
//         `UPDATE add_table
//          SET Status='occupied', Start_Time=NOW()
//          WHERE Table_Id = ?`,
//         [tbl.Table_Id]
//       );
//     }

//     /* ---------------- KOT ---------------- */
//     const KOT_Id = await generateNextId(
//       connection,
//       "KOT",
//       "KOT_Id",
//       "kitchen_orders"
//     );

//     await connection.query(
//       `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
//        VALUES (?, ?, 'pending')`,
//       [KOT_Id, Order_Id]
//     );

//     /* ---------------- INSERT ITEMS ---------------- */
//     for (const item of items) {
//       const [[dbItem]] = await connection.query(
//         `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
//         [item.Item_Name]
//       );

//       if (!dbItem) {
//         await connection.rollback();
//         return res.status(400).json({
//           success: false,
//           message: `Item not found: ${item.Item_Name}`,
//         });
//       }

//       const Item_Id = dbItem.Item_Id;

//       const Order_Item_Id = await generateNextId(
//         connection,
//         "ODRITM",
//         "Order_Item_Id",
//         "order_items"
//       );

//       await connection.query(
//         `INSERT INTO order_items
//          (Order_Item_Id, Order_Id, Item_Id, Quantity, Price, Amount)
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [
//           Order_Item_Id,
//           Order_Id,
//           Item_Id,
//           item.Item_Quantity,
//           item.Item_Price,
//           item.Amount,
//         ]
//       );

//       const KOT_Item_Id = await generateNextId(
//         connection,
//         "KOTITM",
//         "KOT_Item_Id",
//         "kitchen_order_items"
//       );
// // await connection.query(
// //   `INSERT INTO kitchen_order_items
// //    (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Printed_Quantity, Item_Status)
// //    VALUES (?, ?, ?, ?, ?, 0, 'pending')`,
// //   [
// //     KOT_Item_Id,
// //     KOT_Id,
// //     Item_Id,
// //     item.Item_Name,
// //     item.Item_Quantity
// //   ]
// // );

//       await connection.query(
//         `INSERT INTO kitchen_order_items
//          (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
//          VALUES (?, ?, ?, ?, ?, 'pending')`,
//         [KOT_Item_Id, KOT_Id, Item_Id, item.Item_Name, item.Item_Quantity]
//       );
// /* ================= DAILY STOCK UPDATE (DINE-IN) ================= */

// // 1️⃣ Ensure today's stock row exists
// // await connection.query(
// //   `
// //   INSERT IGNORE INTO daily_food_stock
// //     (Item_Id, Stock_Date, Opening_Quantity, Added_Quantity, Sold_Quantity, Closing_Quantity)
// //   VALUES (?, ?, 0, 0, 0, 0)
// //   `,
// //   [Item_Id, stockDate]
// // );

// // // 2️⃣ Lock today's stock row
// // const [[stock]] = await connection.query(
// //   `
// //   SELECT id
// //   FROM daily_food_stock
// //   WHERE Item_Id = ?
// //     AND Stock_Date = ?
// //   FOR UPDATE
// //   `,
// //   [Item_Id, stockDate]
// // );

// // if (!stock) {
// //   await connection.rollback();
// //   return res.status(400).json({
// //     success: false,
// //     message: `Stock row missing for item ${item.Item_Name}`,
// //   });
// // }

// // // 3️⃣ Reduce stock (sale)
// // await connection.query(
// //   `
// //   UPDATE daily_food_stock
// //   SET
// //     Sold_Quantity = Sold_Quantity + ?,
// //     Closing_Quantity = Closing_Quantity - ?
// //   WHERE id = ?
// //   `,
// //   [
// //     item.Item_Quantity,
// //     item.Item_Quantity,
// //     stock.id,
// //   ]
// // );

// // /* ================= STOCK HISTORY (DINE-IN SALE) ================= */
// // await connection.query(
// //   `
// //   INSERT INTO food_stock_movements
// //     (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
// //   VALUES (?,  ?, 'DINE_IN', ?, ?, ?)
// //   `,
// //   [
// //     Item_Id,
    
// //     stockDate,
// //     item.Item_Quantity,
// //     Order_Id,
// //     userId,
// //   ]
// // );

// // await connection.query(
// //   `
// //   INSERT INTO food_stock_movements
// //     (Item_Id, Item_Name, Stock_Date, Quantity, User_Id)
// //   VALUES (?, ?, ?,?, ?)
// //   `,
// //   [
// //     Item_Id,
// //     item.Item_Name,
// //     stockDate,
// //     item.Item_Quantity, // sold qty
// //     userId,             // waiter / cashier
// //   ]
// // );
// /* ================= FIXED DAILY STOCK UPDATE (DINE-IN) ================= */

// // Ensure stock row exists for today
// /* ================= FIXED DAILY STOCK UPDATE (DINE-IN) ================= */

// // 1️⃣ Ensure stock row exists (SAFE UPSERT)
// await connection.query(
//   `
//   INSERT INTO daily_food_stock
//     (Item_Id, Stock_Date,
//      Opening_Quantity, Added_Quantity,
//      Sold_Quantity, Closing_Quantity)
//   VALUES (?, ?, 0, 0, 0, 0)
//   ON DUPLICATE KEY UPDATE
//     Stock_Date = daily_food_stock.Stock_Date
//   `,
//   [Item_Id, stockDate]
// );

// // 2️⃣ Update sold quantity
// await connection.query(
//   `
//   UPDATE daily_food_stock
//   SET
//     Sold_Quantity = Sold_Quantity + ?,
//     Closing_Quantity = Closing_Quantity - ?
//   WHERE Item_Id = ?
//     AND Stock_Date = ?
//   `,
//   [
//     item.Item_Quantity,
//     item.Item_Quantity,
//     Item_Id,
//     stockDate,
//   ]
// );

// // 3️⃣ Stock movement entry
// await connection.query(
//   `
//   INSERT INTO food_stock_movements
//     (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
//   VALUES (?, ?, 'DINE_IN', ?, ?, ?)
//   `,
//   [
//     Item_Id,
//     stockDate,
//     item.Item_Quantity,
//     Order_Id,
//     userId,
//   ]
// );
//     }

//     /* ---------------- FETCH KOT ITEMS + CATEGORY ---------------- */
//     const [kotItems] = await connection.query(
//       `
//       SELECT 
//         koi.KOT_Item_Id,
//         koi.Item_Id,
//         koi.Item_Name,
//         koi.Quantity,
//         koi.Item_Status,
//         fi.Item_Category
//       FROM kitchen_order_items koi
//       JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
//       WHERE koi.KOT_Id = ?
//       `,
//       [KOT_Id]
//     );

//     /* ---------------- GROUP BY CATEGORY ---------------- */
//     const byCategory = {};
//     kotItems.forEach((it) => {
//       if (!byCategory[it.Item_Category]) {
//         byCategory[it.Item_Category] = [];
//       }
//       byCategory[it.Item_Category].push(it);
//     });

//     await connection.commit();

//     /* ---------------- SOCKET EMIT ---------------- */
//     Object.entries(byCategory).forEach(([category, items]) => {
//       io.to(`category_${category}`).emit("new_kitchen_order", {
//         KOT_Id,
//         Order_Id,
//         Order_Type: "dinein",
//         Status: "pending",
//         items,
//       });
//     });
// const kotEligibility = await checkDineInItemsElligibleForKOTPrint(items);
//     return res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       Order_Id,
//       KOT_Id,
//       elligibleItems: kotEligibility.elligibleItems, // 🔥 NEW
//     });
//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Add Order Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
const addOrder = async (req, res, next) => {
  let connection;
const stockDate = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });


  try {
    const {
      Customer_Name,
      Customer_Phone,
      userId,
      Table_Names,
      items,
      Sub_Total,
      Amount,
    } = req.body;

    const normalizedCustomerName =
      Customer_Name && Customer_Name.trim() !== ""
        ? Customer_Name.trim()
        : null;

    /* ---------------- VALIDATIONS ---------------- */
    if (!userId || !Array.isArray(Table_Names) || Table_Names.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User ID and table are required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required",
      });
    }

    /* ---------------- DB START ---------------- */
    connection = await db.getConnection();
    await connection.beginTransaction();

    /* ---------------- CUSTOMER (OPTIONAL) ---------------- */
    let Customer_Id = null;

    if (Customer_Phone) {
      const [existingCustomer] = await connection.execute(
        `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
        [Customer_Phone]
      );

      if (existingCustomer.length) {
        Customer_Id = existingCustomer[0].Customer_Id;
      } else {
      //   Customer_Id = await generateNextId(
      //     connection,
      //     "CUST",
      //     "Customer_Id",
      //     "customers"
      //   );

      //   await connection.execute(
      //     `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
      //      VALUES (?, ?, ?)`,
      //     [Customer_Id, normalizedCustomerName, Customer_Phone]
      //   );
      // }
        const [custRes] = await connection.execute(
          `INSERT INTO customers (Customer_Name, Customer_Phone)
           VALUES (?, ?)`,
          [Customer_Name?.trim() || null, Customer_Phone]
        );

        const id = custRes.insertId;
         Customer_Id = "CUST" + id.toString().padStart(5, "0");

        // ✅ UPDATE WITH FORMATTED ID
        await connection.execute(
          `UPDATE customers SET Customer_Id = ? WHERE id = ?`,
          [Customer_Id, id]
        );
      }
    }

    /* ---------------- ORDER ---------------- */
    // const Order_Id = await generateNextId(
    //   connection,
    //   "ODR",
    //   "Order_Id",
    //   "orders"
    // );

    // await connection.execute(
    //   `INSERT INTO orders
    //    (Order_Id, User_Id, Customer_Id, Status, Sub_Total, Discount, Amount, Payment_Status)
    //    VALUES (?, ?, ?, 'hold', ?, 0, ?, 'pending')`,
    //   [Order_Id, userId, Customer_Id, Sub_Total, Amount]
    // );
// let Order_Id;

// for (let i = 0; i < 3; i++) {
//   try {
//     Order_Id = await generateNextId(
//       connection,
//       "ODR",
//       "Order_Id",
//       "orders"
//     );

//     await connection.execute(
//       `INSERT INTO orders
//        (Order_Id, User_Id, Customer_Id, Status, Sub_Total, Discount, Amount, Payment_Status)
//        VALUES (?, ?, ?, 'hold', ?, 0, ?, 'pending')`,
//       [Order_Id, userId, Customer_Id, Sub_Total, Amount]
//     );

//     break;

//   } catch (err) {
//     if (err.code === "ER_DUP_ENTRY" && i < 2) continue;
//     throw err;
//   }
// }


    // Order_Id = await generateNextId(
    //   connection,
    //   "ODR",
    //   "Order_Id",
    //   "orders"
    // );

   const [orderResult]= await connection.execute(
      `INSERT INTO orders
       ( User_Id, Customer_Id, Status, Sub_Total, Discount, Amount, Payment_Status)
       VALUES ( ?, ?, 'hold', ?, 0, ?, 'pending')`,
      [ userId, Customer_Id, Sub_Total, Amount]
    );
    const orderNum=orderResult.insertId;
    const Order_Id="ODR"+orderNum.toString().padStart(5,"0");
    await connection.execute(`UPDATE orders
      SET Order_Id=? WHERE id=?`,[Order_Id,orderNum]);


  
    /* ---------------- TABLES ---------------- */
    for (const tableName of Table_Names) {
      const [[tbl]] = await connection.execute(
        `SELECT Table_Id, Status FROM add_table WHERE Table_Name = ? FOR UPDATE`,
        [tableName]
      );
      if (!tbl) {
  throw new Error("Table not found");
}

if (tbl.Status === "occupied") {
  throw new Error("Table occupied");
}

//       if (!tbl) {
//         if (!tbl) {
//   throw new Error("Table not found");
// }
//         // await connection.rollback();
//         return res.status(400).json({
//           success: false,
//           message: "Table not found",
//         });
//       }

//       if (tbl.Status === "occupied") {
       
//         // await connection.rollback();
//         return res.status(400).json({
//           success: false,
//           message: "Table occupied",
//         });
//       }

      // const Order_Table_Id = await generateNextId(
      //   connection,
      //   "OTB",
      //   "Order_Table_Id",
      //   "order_tables"
      // );

      const [orderTableResult]=await connection.execute(
        `INSERT INTO order_tables ( Order_Id, Table_Id)
         VALUES ( ?, ?)`,
        [ Order_Id, tbl.Table_Id]
      );
      const orderTableNum=orderTableResult.insertId;
      const Order_Table_Id="OTB"+orderTableNum.toString().padStart(5,"0");
        await connection.execute(`UPDATE order_tables 
          SET Order_Table_Id=? WHERE id=?`,[Order_Table_Id,orderTableNum]);


      await connection.execute(
        `UPDATE add_table
         SET Status='occupied', Start_Time=NOW()
         WHERE Table_Id = ?`,
        [tbl.Table_Id]
      );
    }

    /* ---------------- KOT ---------------- */
    // const KOT_Id = await generateNextId(
    //   connection,
    //   "KOT",
    //   "KOT_Id",
    //   "kitchen_orders"
    // );

   const [kitchenResult]= await connection.execute(
      `INSERT INTO kitchen_orders ( Order_Id, Status)
       VALUES ( ?, 'pending')`,
      [ Order_Id]
    );
    const kitchenNum=kitchenResult.insertId;
    const KOT_Id="KOT"+kitchenNum.toString().padStart(5,"0");
    await connection.execute(`UPDATE kitchen_orders
      SET KOT_Id=? WHERE id=?`,[KOT_Id,kitchenNum]);

    /* ---------------- INSERT ITEMS ---------------- */
    for (const item of items) {
      const [[dbItem]] = await connection.execute(
        `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
        [item.Item_Name]
      );

      if (!dbItem) {
        //await connection.rollback();
         throw new Error(`Item not found: ${item.Item_Name}`);
        // return res.status(400).json({
        //   success: false,
        //   message: `Item not found: ${item.Item_Name}`,
        // });
      }

      const Item_Id = dbItem.Item_Id;

      // const Order_Item_Id = await generateNextId(
      //   connection,
      //   "ODRITM",
      //   "Order_Item_Id",
      //   "order_items"
      // );

      const [orderItemResult] = await connection.execute(
        `INSERT INTO order_items
         ( Order_Id, Item_Id, Quantity, Price, Amount)
         VALUES ( ?, ?, ?, ?, ?)`,
        [
        
          Order_Id,
          Item_Id,
          item.Item_Quantity,
          item.Item_Price,
          item.Amount,
        ]
      );
      const orderItemNum=orderItemResult.insertId;
      const Order_Item_Id="ODRITM"+orderItemNum.toString().padStart(5,"0");
      await connection.execute(`UPDATE order_items
        SET Order_Item_Id=? WHERE id=?`,[Order_Item_Id,orderItemNum]);


      // const KOT_Item_Id = await generateNextId(
      //   connection,
      //   "KOTITM",
      //   "KOT_Item_Id",
      //   "kitchen_order_items"
      // );
// await connection.execute(
//   `INSERT INTO kitchen_order_items
//    (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Printed_Quantity, Item_Status)
//    VALUES (?, ?, ?, ?, ?, 0, 'pending')`,
//   [
//     KOT_Item_Id,
//     KOT_Id,
//     Item_Id,
//     item.Item_Name,
//     item.Item_Quantity
//   ]
// );

     const [kotResult] =await connection.execute(
        `INSERT INTO kitchen_order_items
         ( KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
         VALUES ( ?, ?, ?, ?, 'pending')`,
        [  KOT_Id, Item_Id, item.Item_Name, item.Item_Quantity]
      );
      const kotItemNum=kotResult.insertId;
      const KOT_Item_Id="KOTITM"+kotItemNum.toString().padStart(5,"0");
      await connection.execute(`UPDATE kitchen_order_items
        SET KOT_Item_Id=? WHERE id=?`,[KOT_Item_Id,kotItemNum]);

// 1️⃣ Ensure today's stock row exists
// await connection.execute(
//   `
//   INSERT IGNORE INTO daily_food_stock
//     (Item_Id, Stock_Date, Opening_Quantity, Added_Quantity, Sold_Quantity, Closing_Quantity)
//   VALUES (?, ?, 0, 0, 0, 0)
//   `,
//   [Item_Id, stockDate]
// );

// // 2️⃣ Lock today's stock row
// const [[stock]] = await connection.execute(
//   `
//   SELECT id
//   FROM daily_food_stock
//   WHERE Item_Id = ?
//     AND Stock_Date = ?
//   FOR UPDATE
//   `,
//   [Item_Id, stockDate]
// );

// if (!stock) {
//   await connection.rollback();
//   return res.status(400).json({
//     success: false,
//     message: `Stock row missing for item ${item.Item_Name}`,
//   });
// }

// // 3️⃣ Reduce stock (sale)
// await connection.execute(
//   `
//   UPDATE daily_food_stock
//   SET
//     Sold_Quantity = Sold_Quantity + ?,
//     Closing_Quantity = Closing_Quantity - ?
//   WHERE id = ?
//   `,
//   [
//     item.Item_Quantity,
//     item.Item_Quantity,
//     stock.id,
//   ]
// );

// /* ================= STOCK HISTORY (DINE-IN SALE) ================= */
// await connection.execute(
//   `
//   INSERT INTO food_stock_movements
//     (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
//   VALUES (?,  ?, 'DINE_IN', ?, ?, ?)
//   `,
//   [
//     Item_Id,
    
//     stockDate,
//     item.Item_Quantity,
//     Order_Id,
//     userId,
//   ]
// );

// await connection.execute(
//   `
//   INSERT INTO food_stock_movements
//     (Item_Id, Item_Name, Stock_Date, Quantity, User_Id)
//   VALUES (?, ?, ?,?, ?)
//   `,
//   [
//     Item_Id,
//     item.Item_Name,
//     stockDate,
//     item.Item_Quantity, // sold qty
//     userId,             // waiter / cashier
//   ]
// );
/* ================= FIXED DAILY STOCK UPDATE (DINE-IN) ================= */

// Ensure stock row exists for today
/* ================= FIXED DAILY STOCK UPDATE (DINE-IN) ================= */

// 1️⃣ Ensure stock row exists (SAFE UPSERT)
await connection.execute(
  `
  INSERT INTO daily_food_stock
    (Item_Id, Stock_Date,
     Opening_Quantity, Added_Quantity,
     Sold_Quantity, Closing_Quantity)
  VALUES (?, ?, 0, 0, 0, 0)
  ON DUPLICATE KEY UPDATE
    Stock_Date = daily_food_stock.Stock_Date
  `,
  [Item_Id, stockDate]
);

// 2️⃣ Update sold quantity
await connection.execute(
  `
  UPDATE daily_food_stock
  SET
    Sold_Quantity = Sold_Quantity + ?,
    Closing_Quantity = Closing_Quantity - ?
  WHERE Item_Id = ?
    AND Stock_Date = ?
  `,
  [
    item.Item_Quantity,
    item.Item_Quantity,
    Item_Id,
    stockDate,
  ]
);

// 3️⃣ Stock movement entry
await connection.execute(
  `
  INSERT INTO food_stock_movements
    (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
  VALUES (?, ?, 'DINE_IN', ?, ?, ?)
  `,
  [
    Item_Id,
    stockDate,
    item.Item_Quantity,
    Order_Id,
    userId,
  ]
);
    }

    /* ---------------- FETCH KOT ITEMS + CATEGORY ---------------- */
    const [kotItems] = await connection.execute(
      `
      SELECT 
        koi.KOT_Item_Id,
        koi.Item_Id,
        koi.Item_Name,
        koi.Quantity,
        koi.Item_Status,
        fi.Item_Category
      FROM kitchen_order_items koi
      JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
      WHERE koi.KOT_Id = ?
      `,
      [KOT_Id]
    );

    /* ---------------- GROUP BY CATEGORY ---------------- */
    const byCategory = {};
    kotItems.forEach((it) => {
      if (!byCategory[it.Item_Category]) {
        byCategory[it.Item_Category] = [];
      }
      byCategory[it.Item_Category].push(it);
    });

    await connection.commit();

    /* ---------------- SOCKET EMIT ---------------- */
    Object.entries(byCategory).forEach(([category, items]) => {
      io.to(`category_${category}`).emit("new_kitchen_order", {
        KOT_Id,
        Order_Id,
        Order_Type: "dinein",
        Status: "pending",
        items,
      });
    });
const kotEligibility = await checkDineInItemsElligibleForKOTPrint(items);
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      Order_Id,
      KOT_Id,
      elligibleItems: kotEligibility.elligibleItems, // 🔥 NEW
    });
  }
   catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Add Order Error:", err);
     next(err);
//     if (
//   err.code !== "ER_DUP_ENTRY" &&
//   err.code !== "ER_LOCK_DEADLOCK"
// ) {
//   console.error("❌ Final Error:", err);
// }

// return res.status(200).json({
//   success: true,
//   message: "Order processed successfully",
// });
  } finally {
    if (connection) connection.release();
  }
};

const getAllCustomers = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(`
      SELECT 
        c.Customer_Id,
        c.Customer_Name,
        c.Customer_Phone,
        c.Customer_Address,
        DATE_FORMAT(c.Special_Date, '%Y-%m-%d') AS Special_Date
      FROM customers c
    `);

    return res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Error getting all customers:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
//OLD DUPLICACY AND CONCURENCY BUGS
// const addOrder = async (req, res, next) => {
//   let connection;
// const stockDate = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });


//   try {
//     const {
//       Customer_Name,
//       Customer_Phone,
//       userId,
//       Table_Names,
//       items,
//       Sub_Total,
//       Amount,
//     } = req.body;

//     const normalizedCustomerName =
//       Customer_Name && Customer_Name.trim() !== ""
//         ? Customer_Name.trim()
//         : null;

//     /* ---------------- VALIDATIONS ---------------- */
//     if (!userId || !Array.isArray(Table_Names) || Table_Names.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID and table are required",
//       });
//     }

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one item is required",
//       });
//     }

//     /* ---------------- DB START ---------------- */
//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     /* ---------------- CUSTOMER (OPTIONAL) ---------------- */
//     let Customer_Id = null;

//     if (Customer_Phone) {
//       const [existingCustomer] = await connection.execute(
//         `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
//         [Customer_Phone]
//       );

//       if (existingCustomer.length) {
//         Customer_Id = existingCustomer[0].Customer_Id;
//       } else {
//         Customer_Id = await generateNextId(
//           connection,
//           "CUST",
//           "Customer_Id",
//           "customers"
//         );

//         await connection.execute(
//           `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
//            VALUES (?, ?, ?)`,
//           [Customer_Id, normalizedCustomerName, Customer_Phone]
//         );
//       }
//     }

//     /* ---------------- ORDER ---------------- */
//     // const Order_Id = await generateNextId(
//     //   connection,
//     //   "ODR",
//     //   "Order_Id",
//     //   "orders"
//     // );

//     // await connection.execute(
//     //   `INSERT INTO orders
//     //    (Order_Id, User_Id, Customer_Id, Status, Sub_Total, Discount, Amount, Payment_Status)
//     //    VALUES (?, ?, ?, 'hold', ?, 0, ?, 'pending')`,
//     //   [Order_Id, userId, Customer_Id, Sub_Total, Amount]
//     // );
// let Order_Id;

// for (let i = 0; i < 3; i++) {
//   try {
//     Order_Id = await generateNextId(
//       connection,
//       "ODR",
//       "Order_Id",
//       "orders"
//     );

//     await connection.execute(
//       `INSERT INTO orders
//        (Order_Id, User_Id, Customer_Id, Status, Sub_Total, Discount, Amount, Payment_Status)
//        VALUES (?, ?, ?, 'hold', ?, 0, ?, 'pending')`,
//       [Order_Id, userId, Customer_Id, Sub_Total, Amount]
//     );

//     break;

//   } catch (err) {
//     if (err.code === "ER_DUP_ENTRY" && i < 2) continue;
//     throw err;
//   }
// }
//     /* ---------------- TABLES ---------------- */
//     for (const tableName of Table_Names) {
//       const [[tbl]] = await connection.execute(
//         `SELECT Table_Id, Status FROM add_table WHERE Table_Name = ? FOR UPDATE`,
//         [tableName]
//       );
//       if (!tbl) {
//   throw new Error("Table not found");
// }

// if (tbl.Status === "occupied") {
//   throw new Error("Table occupied");
// }

// //       if (!tbl) {
// //         if (!tbl) {
// //   throw new Error("Table not found");
// // }
// //         // await connection.rollback();
// //         return res.status(400).json({
// //           success: false,
// //           message: "Table not found",
// //         });
// //       }

// //       if (tbl.Status === "occupied") {
       
// //         // await connection.rollback();
// //         return res.status(400).json({
// //           success: false,
// //           message: "Table occupied",
// //         });
// //       }

//       const Order_Table_Id = await generateNextId(
//         connection,
//         "OTB",
//         "Order_Table_Id",
//         "order_tables"
//       );

//       await connection.execute(
//         `INSERT INTO order_tables (Order_Table_Id, Order_Id, Table_Id)
//          VALUES (?, ?, ?)`,
//         [Order_Table_Id, Order_Id, tbl.Table_Id]
//       );

//       await connection.execute(
//         `UPDATE add_table
//          SET Status='occupied', Start_Time=NOW()
//          WHERE Table_Id = ?`,
//         [tbl.Table_Id]
//       );
//     }

//     /* ---------------- KOT ---------------- */
//     const KOT_Id = await generateNextId(
//       connection,
//       "KOT",
//       "KOT_Id",
//       "kitchen_orders"
//     );

//     await connection.execute(
//       `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
//        VALUES (?, ?, 'pending')`,
//       [KOT_Id, Order_Id]
//     );

//     /* ---------------- INSERT ITEMS ---------------- */
//     for (const item of items) {
//       const [[dbItem]] = await connection.execute(
//         `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
//         [item.Item_Name]
//       );

//       if (!dbItem) {

//         //await connection.rollback();
//         throw new Error(`Item not found: ${item.Item_Name}`);
//       }

//       const Item_Id = dbItem.Item_Id;

//       const Order_Item_Id = await generateNextId(
//         connection,
//         "ODRITM",
//         "Order_Item_Id",
//         "order_items"
//       );

//       await connection.execute(
//         `INSERT INTO order_items
//          (Order_Item_Id, Order_Id, Item_Id, Quantity, Price, Amount)
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [
//           Order_Item_Id,
//           Order_Id,
//           Item_Id,
//           item.Item_Quantity,
//           item.Item_Price,
//           item.Amount,
//         ]
//       );

//       const KOT_Item_Id = await generateNextId(
//         connection,
//         "KOTITM",
//         "KOT_Item_Id",
//         "kitchen_order_items"
//       );
// // await connection.execute(
// //   `INSERT INTO kitchen_order_items
// //    (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Printed_Quantity, Item_Status)
// //    VALUES (?, ?, ?, ?, ?, 0, 'pending')`,
// //   [
// //     KOT_Item_Id,
// //     KOT_Id,
// //     Item_Id,
// //     item.Item_Name,
// //     item.Item_Quantity
// //   ]
// // );

//       await connection.execute(
//         `INSERT INTO kitchen_order_items
//          (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
//          VALUES (?, ?, ?, ?, ?, 'pending')`,
//         [KOT_Item_Id, KOT_Id, Item_Id, item.Item_Name, item.Item_Quantity]
//       );
// /* ================= DAILY STOCK UPDATE (DINE-IN) ================= */

// // 1️⃣ Ensure today's stock row exists
// // await connection.execute(
// //   `
// //   INSERT IGNORE INTO daily_food_stock
// //     (Item_Id, Stock_Date, Opening_Quantity, Added_Quantity, Sold_Quantity, Closing_Quantity)
// //   VALUES (?, ?, 0, 0, 0, 0)
// //   `,
// //   [Item_Id, stockDate]
// // );

// // // 2️⃣ Lock today's stock row
// // const [[stock]] = await connection.execute(
// //   `
// //   SELECT id
// //   FROM daily_food_stock
// //   WHERE Item_Id = ?
// //     AND Stock_Date = ?
// //   FOR UPDATE
// //   `,
// //   [Item_Id, stockDate]
// // );

// // if (!stock) {
// //   await connection.rollback();
// //   return res.status(400).json({
// //     success: false,
// //     message: `Stock row missing for item ${item.Item_Name}`,
// //   });
// // }

// // // 3️⃣ Reduce stock (sale)
// // await connection.execute(
// //   `
// //   UPDATE daily_food_stock
// //   SET
// //     Sold_Quantity = Sold_Quantity + ?,
// //     Closing_Quantity = Closing_Quantity - ?
// //   WHERE id = ?
// //   `,
// //   [
// //     item.Item_Quantity,
// //     item.Item_Quantity,
// //     stock.id,
// //   ]
// // );

// // /* ================= STOCK HISTORY (DINE-IN SALE) ================= */
// // await connection.execute(
// //   `
// //   INSERT INTO food_stock_movements
// //     (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
// //   VALUES (?,  ?, 'DINE_IN', ?, ?, ?)
// //   `,
// //   [
// //     Item_Id,
    
// //     stockDate,
// //     item.Item_Quantity,
// //     Order_Id,
// //     userId,
// //   ]
// // );

// // await connection.execute(
// //   `
// //   INSERT INTO food_stock_movements
// //     (Item_Id, Item_Name, Stock_Date, Quantity, User_Id)
// //   VALUES (?, ?, ?,?, ?)
// //   `,
// //   [
// //     Item_Id,
// //     item.Item_Name,
// //     stockDate,
// //     item.Item_Quantity, // sold qty
// //     userId,             // waiter / cashier
// //   ]
// // );
// /* ================= FIXED DAILY STOCK UPDATE (DINE-IN) ================= */

// // Ensure stock row exists for today
// /* ================= FIXED DAILY STOCK UPDATE (DINE-IN) ================= */

// // 1️⃣ Ensure stock row exists (SAFE UPSERT)
// await connection.execute(
//   `
//   INSERT INTO daily_food_stock
//     (Item_Id, Stock_Date,
//      Opening_Quantity, Added_Quantity,
//      Sold_Quantity, Closing_Quantity)
//   VALUES (?, ?, 0, 0, 0, 0)
//   ON DUPLICATE KEY UPDATE
//     Stock_Date = daily_food_stock.Stock_Date
//   `,
//   [Item_Id, stockDate]
// );

// // 2️⃣ Update sold quantity
// await connection.execute(
//   `
//   UPDATE daily_food_stock
//   SET
//     Sold_Quantity = Sold_Quantity + ?,
//     Closing_Quantity = Closing_Quantity - ?
//   WHERE Item_Id = ?
//     AND Stock_Date = ?
//   `,
//   [
//     item.Item_Quantity,
//     item.Item_Quantity,
//     Item_Id,
//     stockDate,
//   ]
// );

// // 3️⃣ Stock movement entry
// await connection.execute(
//   `
//   INSERT INTO food_stock_movements
//     (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
//   VALUES (?, ?, 'DINE_IN', ?, ?, ?)
//   `,
//   [
//     Item_Id,
//     stockDate,
//     item.Item_Quantity,
//     Order_Id,
//     userId,
//   ]
// );
//     }

//     /* ---------------- FETCH KOT ITEMS + CATEGORY ---------------- */
//     const [kotItems] = await connection.execute(
//       `
//       SELECT 
//         koi.KOT_Item_Id,
//         koi.Item_Id,
//         koi.Item_Name,
//         koi.Quantity,
//         koi.Item_Status,
//         fi.Item_Category
//       FROM kitchen_order_items koi
//       JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
//       WHERE koi.KOT_Id = ?
//       `,
//       [KOT_Id]
//     );

//     /* ---------------- GROUP BY CATEGORY ---------------- */
//     const byCategory = {};
//     kotItems.forEach((it) => {
//       if (!byCategory[it.Item_Category]) {
//         byCategory[it.Item_Category] = [];
//       }
//       byCategory[it.Item_Category].push(it);
//     });

//     await connection.commit();

//     /* ---------------- SOCKET EMIT ---------------- */
//     Object.entries(byCategory).forEach(([category, items]) => {
//       io.to(`category_${category}`).emit("new_kitchen_order", {
//         KOT_Id,
//         Order_Id,
//         Order_Type: "dinein",
//         Status: "pending",
//         items,
//       });
//     });
// const kotEligibility = await checkDineInItemsElligibleForKOTPrint(items);
//     return res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       Order_Id,
//       KOT_Id,
//       elligibleItems: kotEligibility.elligibleItems, // 🔥 NEW
//     });
//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Add Order Error:", err);
//     // next(err);
//     if (
//   err.code !== "ER_DUP_ENTRY" &&
//   err.code !== "ER_LOCK_DEADLOCK"
// ) {
//   console.error("❌ Final Error:", err);
// }

// return res.status(200).json({
//   success: true,
//   message: "Order processed successfully",
// });
//   } finally {
//     if (connection) connection.release();
//   }
// };


const getTablesHavingOrders = async (req, res, next) => {
    let connection;

    try {
        connection = await db.getConnection();

        // ===========================
        // 1️⃣ DINE-IN ORDERS
        // ===========================
        // const [dineinOrders] = await connection.query(
        //     `SELECT 
        //         o.Order_Id,
        //         o.User_Id,
        //         o.Status,
        //         o.Sub_Total,
        //         o.Discount,
        //         o.Amount,
        //         o.Payment_Status,
        //         t.Table_Id,
        //         t.Table_Name,
        //         t.Start_Time AS Table_Start_Time
        //     FROM orders o
        //     JOIN order_tables ot ON o.Order_Id = ot.Order_Id
        //     JOIN add_table t ON t.Table_Id = ot.Table_Id
        //     WHERE o.Status = 'hold'`
        // );
const [dineinOrders] = await connection.query(
 `SELECT 
    o.Order_Id,
    o.User_Id,
    u.name,       
    u.username,   
    u.role,       
    o.Status,
    o.Sub_Total,
    o.Discount,
    o.Amount,
    o.Payment_Status,
    t.Table_Id,
    t.Table_Name,
    t.Start_Time AS Table_Start_Time
FROM orders o
JOIN users u ON u.User_Id = o.User_Id     
JOIN order_tables ot ON o.Order_Id = ot.Order_Id
JOIN add_table t ON t.Table_Id = ot.Table_Id
WHERE o.Status = 'hold'`

);



     const dineInFormatted = dineinOrders.map(o => ({
  ...o,
  orderType: "dinein",
  orderBy: o.role === "waiter" ? "waiter" : "staff"
}));

        // ===========================
        // 2️⃣ TAKEAWAY ORDERS
        // ===========================
        // const [takeawayHeaders] = await connection.query(`
        //     SELECT 
        //         tk.Takeaway_Order_Id,
        //         tk.User_Id,
        //         tk.Status,
        //         tk.Sub_Total,
        //         tk.Customer_Id,
        //         tk.Discount,
        //         tk.Amount,
        //         tk.Payment_Status,
        //         ko.KOT_Id
        //     FROM orders_takeaway tk
        //     JOIN kitchen_orders ko ON ko.Order_Id = tk.Takeaway_Order_Id
        //     WHERE tk.Status IN ('hold', 'paid')
        // `);
        const [takeawayHeaders] = await connection.query(`
    SELECT 
        tk.Takeaway_Order_Id,
        tk.User_Id,
        tk.Status,
        tk.Sub_Total,
        tk.Customer_Id,
        c.Customer_Name,
        c.Customer_Phone,
        tk.Discount,
        tk.Amount,
        tk.Payment_Status,
        ko.KOT_Id
    FROM orders_takeaway tk
    JOIN kitchen_orders ko 
        ON ko.Order_Id = tk.Takeaway_Order_Id
    LEFT JOIN customers c
        ON c.Customer_Id = tk.Customer_Id
    WHERE tk.Status IN ('hold', 'paid')
`);


        const takeawayOrderIds = takeawayHeaders.map(o => o.Takeaway_Order_Id);

        let itemsMap = {};
        if (takeawayOrderIds.length > 0) {
            const [items] = await connection.query(`
               SELECT 
    oti.Takeaway_Order_Id,
    oti.Item_Id,
   koi.Quantity,
    oti.Price,
    oti.Amount,
    fi.Item_Name,
    koi.Item_Status,
    koi.updated_at,
    koi.KOT_Item_Id
FROM order_takeaway_items oti
JOIN add_food_item fi ON fi.Item_Id = oti.Item_Id
JOIN kitchen_order_items koi 
    ON koi.Item_Id = oti.Item_Id 
    AND koi.KOT_Id = (
        SELECT KOT_Id 
        FROM kitchen_orders 
        WHERE Order_Id = oti.Takeaway_Order_Id LIMIT 1
    )
WHERE oti.Takeaway_Order_Id IN (?)

            `, [takeawayOrderIds]);

            // Group items per order
            items.forEach(it => {
                if (!itemsMap[it.Takeaway_Order_Id]) {
                    itemsMap[it.Takeaway_Order_Id] = [];
                }
                itemsMap[it.Takeaway_Order_Id].push(it);
            });
        }

        const takeawayFormatted = takeawayHeaders.map(order => ({
            ...order,
            orderType: "takeaway",
            items: itemsMap[order.Takeaway_Order_Id] ?? []
        }));

        return res.status(200).json({
            success: true,
            tableHavingOrders: dineInFormatted,
            takeawayOrders: takeawayFormatted
        });

    } catch (err) {
        console.error("❌ Error getting tables with orders:", err);
        next(err);
    } finally {
        if (connection) connection.release();
    }
};

//View table having orders
// const getTableOrderDetails = async (req, res, next) => {
//     let connection;

//     try {
        
//         connection = await db.getConnection();
//         const { Order_Id } = req.params;

//         if(!Order_Id){
//             return res.status(400).json({
//                 success: false,
//                 message: "Order ID is required."
//             });
//         }
//         //console.log(Order_Id);

//         // 1️⃣ Fetch order summary
//         const [order] = await connection.query(
//             `SELECT Order_Id, User_Id, Status, Sub_Total,  Discount,
//                     Amount,  Payment_Status 
//              FROM orders
//              WHERE Order_Id = ?`,
//             [Order_Id]
//         );

//         if (order.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found",
//             });
//         }

//         // 2️⃣ Fetch tables linked to order
//         const [tables] = await connection.query(
//             `SELECT t.Table_Id, t.Table_Name, t.Start_Time AS Table_Start_Time
//              FROM order_tables ot
//              JOIN add_table t ON t.Table_Id = ot.Table_Id
//              WHERE ot.Order_Id = ?`,
//             [Order_Id]
//         );

//         // 3️⃣ Fetch order items
//         const [items] = await connection.query(
//             `SELECT 
//                 oi.Order_Item_Id,
//                 oi.Item_Id,
//                 f.Item_Name,
//                 f.Item_Image,
//                 f.Item_Category,
//                 f.Tax_Type,
//                 f.Item_Price AS Food_Item_Price,
//                 f.id,
//                 f.Amount,
//                 oi.Quantity,
//                 oi.Price,
//                 oi.Amount
//              FROM order_items oi
//              JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//              WHERE oi.Order_Id = ?`,
//             [Order_Id]
//         );

//         return res.status(200).json({
//             success: true,
//             order: order[0],
//             tables,
//             items
//         });

//     } catch (err) {
//         console.error("❌ Error fetching order details:", err);
//         next(err);
//     } finally {
//         if (connection) connection.release();
//     }
// };

// const getTableOrderDetails = async (req, res, next) => {
//   let connection;

//   try {
//     const { Order_Id } = req.params;
//         if(!Order_Id){
//             return res.status(400).json({
//                 success: false,
//                 message: "Order ID is required."
//             });
//         }
//     connection = await db.getConnection();

//     // 1️⃣ FETCH ORDER
//     const [orderResult] = await connection.query(
//       `SELECT * FROM orders WHERE Order_Id = ?`,
//       [Order_Id]
//     );

//     if (orderResult.length === 0) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const order = orderResult[0];

//     // 2️⃣ FETCH TABLES FOR THIS ORDER
//     // const [tables] = await connection.query(
//     //   `
//     //   SELECT t.Table_Name 
//     //   FROM order_tables ot
//     //   JOIN add_table t ON t.Table_Id = ot.Table_Id
//     //   WHERE ot.Order_Id = ?
//     //   `,
//     //   [Order_Id]
//     // );
//             const [tables] = await connection.query(
//             `SELECT t.Table_Id, t.Table_Name, t.Start_Time AS Table_Start_Time
//              FROM order_tables ot
//              JOIN add_table t ON t.Table_Id = ot.Table_Id
//              WHERE ot.Order_Id = ?`,
//             [Order_Id]
//         );

//     // 3️⃣ FETCH ORDER ITEMS
//     const [orderItems] = await connection.query(
//       `
//       SELECT 
//         oi.Order_Item_Id,
//         oi.Item_Id,
//                          fi.Item_Name,
//                  fi.Item_Image,
//                 fi.Item_Category,
//                  fi.Tax_Type,
//                  fi.Item_Price AS Food_Item_Price,
//                  fi.id,
//                  fi.Amount,
//         oi.Quantity,
//         oi.Price,
//         oi.Amount
//       FROM order_items oi
//       LEFT JOIN add_food_item fi ON fi.Item_Id = oi.Item_Id
//       WHERE oi.Order_Id = ?
//       `,
//       [Order_Id]
//     );

//     // 4️⃣ FETCH KITCHEN ORDER MAPPING (KOT)
//     const [kitchenOrder] = await connection.query(
//       `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
//       [Order_Id]
//     );

//     let KOT_Id = null;
//     let kitchenItems = [];

//     if (kitchenOrder.length > 0) {
//       KOT_Id = kitchenOrder[0].KOT_Id;

//       // 5️⃣ FETCH KITCHEN ITEM STATUS FOR EACH ORDER ITEM
//       const [kotItems] = await connection.query(
//         `
//         SELECT 
//           KOT_Item_Id,
//           Item_Id,
//           Item_Name,
//           Quantity,
//           Item_Status
//         FROM kitchen_order_items
//         WHERE KOT_Id = ?
//         `,
//         [KOT_Id]
//       );

//       kitchenItems = kotItems;
//     }

//     // 6️⃣ MERGE kitchen status into order items
//     const mergedItems = orderItems.map((item) => {
//       const kitchenMatch = kitchenItems.find(
//         (k) => k.Item_Id === item.Item_Id
//       );

//       return {
//         ...item,
//         Item_Status: kitchenMatch ? kitchenMatch.Item_Status : "pending",
//         KOT_Item_Id: kitchenMatch?.KOT_Item_Id || null,
//         KOT_Id: KOT_Id,
//       };
//     });

//     return res.json({
//       success: true,
//       Order_Id,
//       tables: tables.map((t) => t.Table_Name),
//       items: mergedItems,
//       KOT_Id,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching table order:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
const getTableOrderDetails = async (req, res, next) => {
  let connection;

  try {
    const { Order_Id } = req.params;

    if (!Order_Id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required.",
      });
    }

    connection = await db.getConnection();

    /* ---------------- 1️⃣ ORDER ---------------- */
    const [orderResult] = await connection.query(
      `SELECT * FROM orders WHERE Order_Id = ?`,
      [Order_Id]
    );

    if (orderResult.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const order = orderResult[0];

    /* ---------------- 2️⃣ CUSTOMER (OPTIONAL) ---------------- */
    let customer = null;

    if (order.Customer_Id) {
      const [customerRows] = await connection.query(
        `SELECT Customer_Id, Customer_Name, Customer_Phone
         FROM customers 
         WHERE Customer_Id = ?`,
        [order.Customer_Id]
      );

      if (customerRows.length > 0) {
        customer = customerRows[0];
      }
      // ❗ DO NOT throw error if not found
    }

    /* ---------------- 3️⃣ TABLES ---------------- */
    const [tables] = await connection.query(
      `SELECT 
         t.Table_Id,
         t.Table_Name,
         t.Start_Time AS Table_Start_Time
       FROM order_tables ot
       JOIN add_table t ON t.Table_Id = ot.Table_Id
       WHERE ot.Order_Id = ?`,
      [Order_Id]
    );

    /* ---------------- 4️⃣ ORDER ITEMS ---------------- */
    const [orderItems] = await connection.query(
      `
      SELECT 
        oi.Order_Item_Id,
        oi.Item_Id,
        fi.Item_Name,
        fi.Item_Image,
        fi.Item_Category,
        fi.Tax_Type,
        oi.Quantity,
        oi.Price,
        oi.Amount
      FROM order_items oi
      JOIN add_food_item fi ON fi.Item_Id = oi.Item_Id
      WHERE oi.Order_Id = ?
      `,
      [Order_Id]
    );

    /* ---------------- 5️⃣ FETCH KOT ---------------- */
    const [[kot]] = await connection.query(
      `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
      [Order_Id]
    );

    const KOT_Id = kot?.KOT_Id || null;
    let kitchenItems = [];

    if (KOT_Id) {
      const [kotRows] = await connection.query(
        `
        SELECT 
          KOT_Item_Id,
          Item_Id,
          Item_Name,
          Quantity,
          Item_Status,
          updated_at
        FROM kitchen_order_items
        WHERE KOT_Id = ?
        `,
        [KOT_Id]
      );

      kitchenItems = kotRows;
    }

    /* ---------------- 6️⃣ RESPONSE ---------------- */
    return res.json({
      success: true,
      Order_Id,
      customer, // ✅ null or object
      order,
      tables: tables.map((t) => t.Table_Name),
      orderItems,
      kitchenItems,
      KOT_Id,
    });
  } catch (err) {
    console.error("❌ Error fetching table order:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


// const updateOrder = async (req, res, next) => {
//   let connection;

//   try {
//     const { Order_Id } = req.params;
//     const { items, Sub_Total, Amount } = req.body;

//     if (!Order_Id) {
//       return res.status(400).json({ success: false, message: "Order ID missing" });
//     }

//     if (!Array.isArray(items)) {
//       return res.status(400).json({ success: false, message: "Items required" });
//     }

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     /* ---------------------------------------------------
//        1️⃣ UPDATE ORDER TOTALS
//     --------------------------------------------------- */
//     await connection.query(
//       `UPDATE orders 
//        SET Sub_Total = ?, Amount = ? 
//        WHERE Order_Id = ?`,
//       [Sub_Total, Amount, Order_Id]
//     );

//     /* ---------------------------------------------------
//        2️⃣ FETCH OR CREATE KOT
//     --------------------------------------------------- */
//     const [[existingKOT]] = await connection.query(
//       `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
//       [Order_Id]
//     );

//     let KOT_Id;
//     if (existingKOT) {
//       KOT_Id = existingKOT.KOT_Id;
//     } else {
//       KOT_Id = await generateNextId(connection, "KOT", "KOT_Id", "kitchen_orders");
//       await connection.query(
//         `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
//          VALUES (?, ?, 'pending')`,
//         [KOT_Id, Order_Id]
//       );
//     }

//     /* ---------------------------------------------------
//        3️⃣ CLEAR FRONTDESK ITEMS (🔥 RESET 🔥)
//     --------------------------------------------------- */
//     await connection.query(
//       `DELETE FROM order_items WHERE Order_Id = ?`,
//       [Order_Id]
//     );

//     /* ---------------------------------------------------
//        4️⃣ CLEAR KITCHEN ITEMS (🔥 KEY FIX 🔥)
//     --------------------------------------------------- */
//     await connection.query(
//       `DELETE FROM kitchen_order_items WHERE KOT_Id = ?`,
//       [KOT_Id]
//     );

//     /* ---------------------------------------------------
//        5️⃣ SOCKET NOTIFICATION MAP
//     --------------------------------------------------- */
//     const notifyByCategory = {};

//     /* ---------------------------------------------------
//        6️⃣ REINSERT ITEMS (FRONTDESK + KITCHEN)
//     --------------------------------------------------- */
//     for (const item of items) {
//       const { Item_Name, Item_Quantity, Item_Price, Amount: ItemAmount } = item;

//       if (!Item_Name || Item_Quantity <= 0) continue;

//       const [[dbItem]] = await connection.query(
//         `SELECT Item_Id, Item_Category
//          FROM add_food_item
//          WHERE Item_Name = ?
//          LIMIT 1`,
//         [Item_Name]
//       );

//       if (!dbItem) continue;

//       const { Item_Id, Item_Category } = dbItem;

//       /* --------- FRONTDESK INSERT --------- */
//       const Order_Item_Id = await generateNextId(
//         connection,
//         "ODRITM",
//         "Order_Item_Id",
//         "order_items"
//       );

//       await connection.query(
//         `INSERT INTO order_items
//          (Order_Item_Id, Order_Id, Item_Id, Quantity, Price, Amount)
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [
//           Order_Item_Id,
//           Order_Id,
//           Item_Id,
//           Item_Quantity,
//           Item_Price,
//           ItemAmount
//         ]
//       );

//       /* --------- KITCHEN INSERT (FINAL QTY) --------- */
//       const KOT_Item_Id = await generateNextId(
//         connection,
//         "KOTITM",
//         "KOT_Item_Id",
//         "kitchen_order_items"
//       );

//       await connection.query(
//         `INSERT INTO kitchen_order_items
//          (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
//          VALUES (?, ?, ?, ?, ?, 'pending')`,
//         [
//           KOT_Item_Id,
//           KOT_Id,
//           Item_Id,
//           Item_Name,
//           Item_Quantity
//         ]
//       );

//       /* --------- SOCKET PAYLOAD --------- */
//       notifyByCategory[Item_Category] ??= [];
//       notifyByCategory[Item_Category].push({
//         KOT_Item_Id,
//         Item_Id,
//         Item_Name,
//         Item_Category,
//         Quantity: Item_Quantity, // ✅ FINAL quantity
//         Item_Status: "pending",
//       });
//     }

//     /* ---------------------------------------------------
//        7️⃣ COMMIT
//     --------------------------------------------------- */
//     await connection.commit();

//     /* ---------------------------------------------------
//        8️⃣ SOCKET EMIT (CATEGORY-WISE)
//     --------------------------------------------------- */
//     Object.entries(notifyByCategory).forEach(([category, items]) => {
//       io.to(`category_${category}`).emit("new_kitchen_order", {
//         KOT_Id,
//         Order_Id,
//         Order_Type: "dinein",
//         Status: "pending",
//         items,
//       });
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Order updated successfully",
//       KOT_Id,
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Update Order Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

// const confirmOrderBillPaidAndInvoiceGenerated = async (req, res, next) => {
//   let connection;

//   try {
//     const { Order_Id } = req.params;

//     const {
//       Customer_Name,
//       Customer_Phone,
//       Discount_Type,
//       Discount,
//       Service_Charge,
//       Payment_Type,
//       Final_Amount
//     } = req.body;
// const normalizedCustomerName =Customer_Name && Customer_Name.trim() !== ""
//     ? Customer_Name.trim()
//     : null;
//     if (!Order_Id) {
//       return res.status(400).json({
//         success: false,
//         message: "Order ID missing",
//       });
//     }
// if( !Customer_Phone || !Final_Amount){
//   return res.status(400).json({
//     success: false,
//     message: "Customer details missing",
//   });
// }
//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     // ---------------------------------------
//     // 0️⃣ Fetch KOT ID for this order
//     // ---------------------------------------
//     const [[kotRow]] = await connection.query(
//       `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
//       [Order_Id]
//     );

//     const KOT_Id = kotRow?.KOT_Id || null;

//     // ---------------------------------------
//     // 1️⃣ Generate Invoice ID
//     // ---------------------------------------
//     // const Invoice_Id = await generateNextInvoiceId(
//     //   connection,
//     //   "IN",
//     //   "Invoice_Id",
//     //   "invoices"
//     // );
//     const Invoice_Id = await generateNextId(
//       connection,
//       "INV",
//       "Invoice_Id",
//       "invoices"
//     );

//     const [fy] = await connection.query(
//       `SELECT Financial_Year 
//        FROM financial_year 
//        WHERE Current_Financial_Year = 1
//        LIMIT 1`
//     );

//     if (fy.length === 0) {
//       await connection.rollback();
//       return res.status(400).json({
//         message: "No active financial year found.",
//       });
//     }

//     const activeFY = fy[0].Financial_Year;
//     const[customers]= await connection.query(`SELECT * FROM customers WHERE Customer_Phone = ?`,
//       [Customer_Phone]);
//         if (customers.length === 0) {
//       await connection.rollback();
//       return res.status(400).json({
//         success: false,
//         message: "Customer not found,please add customer.",
//       })
//     }
//       const Customer_Id = customers[0].Customer_Id;
//     // ---------------------------------------
//     // 2️⃣ Create Invoice
//     // ---------------------------------------
//     await connection.query(
//       `INSERT INTO invoices
//       (Invoice_Id, Order_Id, Invoice_Date, Financial_Year, 
//        Customer_Name, Customer_Phone,Customer_Id,
//        Discount_Type, Discount, Service_Charge, Amount, Payment_Type)
//        VALUES (?, ?, NOW(), ?,?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         Invoice_Id, Order_Id, activeFY,
//           normalizedCustomerName,
//         Customer_Phone ,
//         Customer_Id,
//         Discount_Type,
//         Discount || 0,
//         Service_Charge || 0,
//         Final_Amount,
//         Payment_Type,
//       ]
//     );

//     // ---------------------------------------
//     // 3️⃣ Mark Order as Completed
//     // ---------------------------------------
//     await connection.query(
//       `UPDATE orders 
//        SET Payment_Status = 'completed', Status = 'paid'
//        WHERE Order_Id = ?`,
//       [Order_Id]
//     );

//     // ---------------------------------------
//     // 4️⃣ Free Tables
//     // ---------------------------------------
//     const [tableIds] = await connection.query(
//       `SELECT Table_Id FROM order_tables WHERE Order_Id = ?`,
//       [Order_Id]
//     );

//     await connection.query(
//       `UPDATE add_table 
//        SET Status = 'available', Start_Time = NULL, End_Time = NOW()
//        WHERE Table_Id IN (?)`,
//       [tableIds.map((t) => t.Table_Id)]
//     );

//     // ---------------------------------------
//     // 5️⃣ Remove Kitchen Order Data
//     // ---------------------------------------
//     // if (KOT_Id) {
//     //   await connection.query(
//     //     `UPDATE kitchen_orders SET Status = 'ready' WHERE KOT_Id = ?`,
//     //     [KOT_Id]
//     //   );

//     //   // await connection.query(
//     //   //   `DELETE FROM kitchen_orders WHERE KOT_Id = ?`,
//     //   //   [KOT_Id]
//     //   // );
//     // }
//        if (KOT_Id) {
//       await connection.query(
//         `UPDATE kitchen_orders 
//          SET Status = 'ready', updated_at = NOW()
//          WHERE KOT_Id = ?`,
//         [KOT_Id]
//       );

//       await connection.query(
//         `UPDATE kitchen_order_items 
//          SET Item_Status = 'ready'
//          WHERE KOT_Id = ?`,
//         [KOT_Id]
//       );
//     }

//     await connection.commit();

//     // ----------------------------------------------------
//     // 🔥🔥 REAL-TIME SOCKET NOTIFICATIONS 🔥🔥
//     // ----------------------------------------------------
//     if (KOT_Id) {
//       // 🛑 Remove from Kitchen UI
//       io.emit("kitchen_order_removed", { KOT_Id });

//       // 🛑 Clear frontdesk order notifications (if open)
//     //   io.emit("frontdesk_order_closed", { Order_Id });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Invoice generated. Order completed.",
//       Invoice_Id,
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error(err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

// const confirmOrderBillPaidAndInvoiceGenerated = async (req, res, next) => {
//   let connection;

//   try {
//     const { Order_Id } = req.params;

//     const {
//       Customer_Name,
//       Customer_Phone,
//       Discount_Type,
//       Discount,
//       Service_Charge,
//       Payment_Type,
//       Final_Amount,
//     } = req.body;

//     const normalizedCustomerName =
//       Customer_Name && Customer_Name.trim() !== ""
//         ? Customer_Name.trim()
//         : null;

//     /* ---------------- VALIDATION ---------------- */
//     if (!Order_Id) {
//       return res.status(400).json({
//         success: false,
//         message: "Order ID missing",
//       });
//     }

    

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     /* ---------------------------------------
//      0️⃣ Fetch KOT ID for this order
//     --------------------------------------- */
//     const [[kotRow]] = await connection.query(
//       `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
//       [Order_Id]
//     );

//     const KOT_Id = kotRow?.KOT_Id || null;

//     /* ---------------------------------------
//      1️⃣ Generate Invoice ID
//     --------------------------------------- */
//     const Invoice_Id = await generateNextId(
//       connection,
//       "INV",
//       "Invoice_Id",
//       "invoices"
//     );

//     const [fy] = await connection.query(
//       `SELECT Financial_Year
//        FROM financial_year
//        WHERE Current_Financial_Year = 1
//        LIMIT 1`
//     );

//     if (fy.length === 0) {
//       await connection.rollback();
//       return res.status(400).json({
//         message: "No active financial year found.",
//       });
//     }

//     const activeFY = fy[0].Financial_Year;

//     /* ---------------------------------------
//      2️⃣ FIND OR CREATE CUSTOMER (🔥 FIXED)
//     --------------------------------------- */
//     let Customer_Id;

//     const [customers] = await connection.query(
//       `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
//       [Customer_Phone]
//     );

//     if (customers.length === 0) {
//       // 🔥 Create customer at billing time
//       Customer_Id = await generateNextId(
//         connection,
//         "CUST",
//         "Customer_Id",
//         "customers"
//       );

//       await connection.query(
//         `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
//          VALUES (?, ?, ?)`,
//         [Customer_Id, normalizedCustomerName, Customer_Phone]
//       );
//     } else {
//       Customer_Id = customers[0].Customer_Id;

//       // Optional: update name if newly provided
//       if (normalizedCustomerName) {
//         await connection.query(
//           `UPDATE customers SET Customer_Name = ? WHERE Customer_Id = ?`,
//           [normalizedCustomerName, Customer_Id]
//         );
//       }
//     }

//     /* ---------------------------------------
//      3️⃣ Update Order with Customer (IMPORTANT)
//     --------------------------------------- */
//     await connection.query(
//       `UPDATE orders SET Customer_Id = ? WHERE Order_Id = ?`,
//       [Customer_Id, Order_Id]
//     );

//     /* ---------------------------------------
//      4️⃣ Create Invoice
//     --------------------------------------- */
//     await connection.query(
//       `INSERT INTO invoices
//       (Invoice_Id, Order_Id, Invoice_Date, Financial_Year,
//        Customer_Name, Customer_Phone, Customer_Id,
//        Discount_Type, Discount, Service_Charge, Amount, Payment_Type)
//        VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         Invoice_Id,
//         Order_Id,
//         activeFY,
//         normalizedCustomerName,
//         Customer_Phone,
//         Customer_Id,
//         Discount_Type,
//         Discount || 0,
//         Service_Charge || 0,
//         Final_Amount,
//         Payment_Type,
//       ]
//     );

//     /* ---------------------------------------
//      5️⃣ Mark Order as Completed
//     --------------------------------------- */
//     await connection.query(
//       `UPDATE orders
//        SET Payment_Status = 'completed', Status = 'paid'
//        WHERE Order_Id = ?`,
//       [Order_Id]
//     );

//     /* ---------------------------------------
//      6️⃣ Free Tables
//     --------------------------------------- */
//     const [tableIds] = await connection.query(
//       `SELECT Table_Id FROM order_tables WHERE Order_Id = ?`,
//       [Order_Id]
//     );

//     if (tableIds.length) {
//       await connection.query(
//         `UPDATE add_table
//          SET Status = 'available', Start_Time = NULL, End_Time = NOW()
//          WHERE Table_Id IN (?)`,
//         [tableIds.map((t) => t.Table_Id)]
//       );
//     }

//     /* ---------------------------------------
//      7️⃣ Update Kitchen Order Status
//     --------------------------------------- */
//     if (KOT_Id) {
//       await connection.query(
//         `UPDATE kitchen_orders
//          SET Status = 'ready', updated_at = NOW()
//          WHERE KOT_Id = ?`,
//         [KOT_Id]
//       );

//       await connection.query(
//         `UPDATE kitchen_order_items
//          SET Item_Status = 'ready'
//          WHERE KOT_Id = ?`,
//         [KOT_Id]
//       );
//     }

//     await connection.commit();

//     /* ---------------------------------------
//      🔥 REAL-TIME SOCKET EVENTS
//     --------------------------------------- */
//     if (KOT_Id) {
//       io.emit("kitchen_order_removed", { KOT_Id });
//       // io.emit("frontdesk_order_closed", { Order_Id });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Invoice generated. Order completed.",
//       Invoice_Id,
//     });
//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Confirm Bill Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
//OLD DUPLICATE ID GENERATION PROBLEM
// const updateOrder = async (req, res, next) => {
//   const stockDate = new Date().toLocaleDateString("en-CA", {
//   timeZone: "Asia/Kolkata",
// });
//   let connection;

//   try {
//     const { Order_Id } = req.params;
//     // const { items, Sub_Total, Amount} = req.body;
// const { items, Sub_Total, Amount } = req.body;
// const userId = req.user?.User_Id;

//     if (!Order_Id) {
//       return res.status(400).json({ success: false, message: "Order ID missing" });
//     }

//     if (!Array.isArray(items)) {
//       return res.status(400).json({ success: false, message: "Items required" });
//     }

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     /* ---------------------------------------------------
//        🔥 A️⃣ FETCH EXISTING KITCHEN ITEMS (BEFORE DELETE)
//     --------------------------------------------------- */
//     const [oldKitchenItems] = await connection.execute(
//       `
//       SELECT koi.Item_Name, koi.Quantity, fi.Item_Category
//       FROM kitchen_order_items koi
//       JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
//       JOIN kitchen_orders ko ON ko.KOT_Id = koi.KOT_Id
//       WHERE ko.Order_Id = ?
//       `,
//       [Order_Id]
//     );

//     const oldQtyMap = new Map();
//     oldKitchenItems.forEach((it) => {
//       oldQtyMap.set(it.Item_Name, it.Quantity);
//     });

//     /* ---------------------------------------------------
//        1️⃣ UPDATE ORDER TOTALS
//     --------------------------------------------------- */
//     await connection.execute(
//       `UPDATE orders 
//        SET Sub_Total = ?, Amount = ? 
//        WHERE Order_Id = ?`,
//       [Sub_Total, Amount, Order_Id]
//     );

//     /* ---------------------------------------------------
//        2️⃣ FETCH OR CREATE KOT
//     --------------------------------------------------- */
//     const [[existingKOT]] = await connection.execute(
//       `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
//       [Order_Id]
//     );

//     let KOT_Id;
//     if (existingKOT) {
//       KOT_Id = existingKOT.KOT_Id;
//     } else {
//       KOT_Id = await generateNextId(connection, "KOT", "KOT_Id", "kitchen_orders");
//       await connection.execute(
//         `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
//          VALUES (?, ?, 'pending')`,
//         [KOT_Id, Order_Id]
//       );
//     }

//     /* ---------------------------------------------------
//        3️⃣ DELETE EXISTING ITEMS (UNCHANGED)
//     --------------------------------------------------- */
//     await connection.execute(`DELETE FROM order_items WHERE Order_Id = ?`, [Order_Id]);
//     await connection.execute(`DELETE FROM kitchen_order_items WHERE KOT_Id = ?`, [KOT_Id]);

//     /* ---------------------------------------------------
//        🔥 B️⃣ BUILD NEWLY ADDED ITEMS (DELTA)
//     --------------------------------------------------- */
//     const newlyAddedItems = [];

//     // for (const item of items) {
//     //   const prevQty = oldQtyMap.get(item.Item_Name) || 0;
//     //   const newQty = Number(item.Item_Quantity) || 0;

//     //   if (newQty > prevQty) {
//     //     newlyAddedItems.push({
//     //       Item_Name: item.Item_Name,
//     //       Item_Quantity: newQty - prevQty, // 🔥 ONLY DELTA
//     //     });
//     //   }
//     // }
//     const deltaItems = [];

// for (const item of items) {
//   const prevQty = oldQtyMap.get(item.Item_Name) || 0;
//   const newQty = Number(item.Item_Quantity) || 0;

//   const diff = newQty - prevQty;

//   if (diff !== 0) {
//     deltaItems.push({
//       Item_Name: item.Item_Name,
//       diffQty: Math.abs(diff),
//       movementType: diff > 0 ? "DINE_IN" : "RETURN",
//     });
//   }
// }


//     /* ---------------------------------------------------
//        4️⃣ REINSERT ITEMS (UNCHANGED)
//     --------------------------------------------------- */
//     for (const item of items) {
//       const [[dbItem]] = await connection.execute(
//         `SELECT Item_Id, Item_Category
//          FROM add_food_item
//          WHERE Item_Name = ? LIMIT 1`,
//         [item.Item_Name]
//       );

//       if (!dbItem) continue;

//       const Order_Item_Id = await generateNextId(
//         connection,
//         "ODRITM",
//         "Order_Item_Id",
//         "order_items"
//       );

//       await connection.execute(
//         `INSERT INTO order_items
//          (Order_Item_Id, Order_Id, Item_Id, Quantity, Price, Amount)
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [
//           Order_Item_Id,
//           Order_Id,
//           dbItem.Item_Id,
//           item.Item_Quantity,
//           item.Item_Price,
//           item.Amount
//         ]
//       );

//       const KOT_Item_Id = await generateNextId(
//         connection,
//         "KOTITM",
//         "KOT_Item_Id",
//         "kitchen_order_items"
//       );

//       await connection.execute(
//         `INSERT INTO kitchen_order_items
//          (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
//          VALUES (?, ?, ?, ?, ?, 'pending')`,
//         [
//           KOT_Item_Id,
//           KOT_Id,
//           dbItem.Item_Id,
//           item.Item_Name,
//           item.Item_Quantity
//         ]
//       );
//     }

//     /* ---------------------------------------------------
//        🔥 C️⃣ CHECK KOT ELIGIBILITY (ONLY NEW ITEMS)
//     --------------------------------------------------- */
//     // const eligibilityResult = newlyAddedItems.length
//     //   ? await checkDineInItemsElligibleForKOTPrint(newlyAddedItems)
//     //   : { elligibleItems: {} };
//     const addedItemsForKOT = deltaItems
//   .filter(d => d.movementType === "DINE_IN")
//   .map(d => ({
//     Item_Name: d.Item_Name,
//     Item_Quantity: d.diffQty
//   }));

// const eligibilityResult = addedItemsForKOT.length
//   ? await checkDineInItemsElligibleForKOTPrint(addedItemsForKOT)
//   : { success: true, elligibleItems: {} };

//       console.log("Eligibility Result:", eligibilityResult);
// /* =====================================================
//    🔥 D️⃣ UPDATE STOCK FOR NEWLY ADDED ITEMS (DELTA)
// ===================================================== */

// // for (const deltaItem of newlyAddedItems) {
// //   const [[dbItem]] = await connection.execute(
// //     `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
// //     [deltaItem.Item_Name]
// //   );

// //   if (!dbItem) continue;

// //   const Item_Id = dbItem.Item_Id;
// //   const deltaQty = deltaItem.Item_Quantity;

// //   // 1️⃣ Ensure today's stock row exists
// //   await connection.execute(
// //     `
// //     INSERT IGNORE INTO daily_food_stock
// //       (Item_Id, Stock_Date, Opening_Quantity, Added_Quantity, Sold_Quantity, Closing_Quantity)
// //     VALUES (?, ?, 0, 0, 0, 0)
// //     `,
// //     [Item_Id, stockDate]
// //   );

// //   // 2️⃣ Lock stock row
// //   const [[stock]] = await connection.execute(
// //     `
// //     SELECT id
// //     FROM daily_food_stock
// //     WHERE Item_Id = ?
// //       AND Stock_Date = ?
// //     FOR UPDATE
// //     `,
// //     [Item_Id, stockDate]
// //   );

// //   if (!stock) {
// //     await connection.rollback();
// //     return res.status(400).json({
// //       success: false,
// //       message: `Stock row missing for item ${deltaItem.Item_Name}`,
// //     });
// //   }

// //   // 3️⃣ Reduce stock by DELTA
// //   await connection.execute(
// //     `
// //     UPDATE daily_food_stock
// //     SET
// //       Sold_Quantity = Sold_Quantity + ?,
// //       Closing_Quantity = Closing_Quantity - ?
// //     WHERE id = ?
// //     `,
// //     [deltaQty, deltaQty, stock.id]
// //   );

// //   // 4️⃣ Insert stock history (DELTA SALE)
// //   await connection.execute(
// //   `
// //   INSERT INTO food_stock_movements
// //     (Item_Id,  Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
// //   VALUES (?,  ?, 'DINE_IN', ?, ?, ?)
// //   `,
// //   [
// //     Item_Id,
    
// //     stockDate,
// //     deltaQty, // sold qty
// //     Order_Id,
// //     userId,
// //   ]
// // );

// // // await connection.execute(
// // //   `
// // //   INSERT INTO food_stock_movements
// // //     (Item_Id, Item_Name, Stock_Date, Quantity, User_Id)
// // //   VALUES (?, ?,?, ?, ?)
// // //   `,
// // //   [
// // //     Item_Id,
// // //     deltaItem.Item_Name.Item_Name,
// // //     stockDate,
// // //     deltaItem.Item_Name.Item_Quantity, // sold qty
// // //     userId,             // waiter / cashier
// // //   ]
// // // );
// // }
// for (const d of deltaItems) {
//   const [[dbItem]] = await connection.execute(
//     `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
//     [d.Item_Name]
//   );

//   if (!dbItem) continue;

//   const Item_Id = dbItem.Item_Id;

//   /* ================= SAFE UPSERT STOCK ROW ================= */

//   await connection.execute(
//     `
//     INSERT INTO daily_food_stock
//       (Item_Id, Stock_Date,
//        Opening_Quantity, Added_Quantity,
//        Sold_Quantity, Closing_Quantity)
//     VALUES (?, ?, 0, 0, 0, 0)
//     ON DUPLICATE KEY UPDATE
//       Stock_Date = daily_food_stock.Stock_Date
//     `,
//     [Item_Id, stockDate]
//   );

//   /* ================= APPLY DELTA ================= */

//   if (d.movementType === "DINE_IN") {
//     await connection.execute(
//       `
//       UPDATE daily_food_stock
//       SET
//         Sold_Quantity = Sold_Quantity + ?,
//         Closing_Quantity = Closing_Quantity - ?
//       WHERE Item_Id = ?
//         AND Stock_Date = ?
//       `,
//       [d.diffQty, d.diffQty, Item_Id, stockDate]
//     );
//   }

//   if (d.movementType === "RETURN") {
//     await connection.execute(
//       `
//       UPDATE daily_food_stock
//       SET
//         Sold_Quantity = Sold_Quantity - ?,
//         Closing_Quantity = Closing_Quantity + ?
//       WHERE Item_Id = ?
//         AND Stock_Date = ?
//       `,
//       [d.diffQty, d.diffQty, Item_Id, stockDate]
//     );
//   }

//   /* ================= MOVEMENT HISTORY ================= */

//   await connection.execute(
//     `
//     INSERT INTO food_stock_movements
//       (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
//     VALUES (?, ?, ?, ?, ?, ?)
//     `,
//     [
//       Item_Id,
//       stockDate,
//       d.movementType,
//       d.diffQty,
//       Order_Id,
//       userId,
//     ]
//   );
// }
// // for (const d of deltaItems) {
// //   const [[dbItem]] = await connection.execute(
// //     `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
// //     [d.Item_Name]
// //   );

// //   if (!dbItem) continue;

// //   const Item_Id = dbItem.Item_Id;

// //   await connection.execute(
// //     `
// //     INSERT IGNORE INTO daily_food_stock
// //       (Item_Id, Stock_Date, Opening_Quantity, Added_Quantity, Sold_Quantity, Closing_Quantity)
// //     VALUES (?, ?, 0, 0, 0, 0)
// //     `,
// //     [Item_Id, stockDate]
// //   );

// //   const [[stock]] = await connection.execute(
// //     `
// //     SELECT id
// //     FROM daily_food_stock
// //     WHERE Item_Id = ? AND Stock_Date = ?
// //     FOR UPDATE
// //     `,
// //     [Item_Id, stockDate]
// //   );

// //   if (!stock) {
// //     await connection.rollback();
// //     return res.status(400).json({
// //       success: false,
// //       message: "Stock row missing",
// //     });
// //   }

// //   if (d.movementType === "DINE_IN") {
// //     await connection.execute(
// //       `
// //       UPDATE daily_food_stock
// //       SET
// //         Sold_Quantity = Sold_Quantity + ?,
// //         Closing_Quantity = Closing_Quantity - ?
// //       WHERE id = ?
// //       `,
// //       [d.diffQty, d.diffQty, stock.id]
// //     );
// //   }

// //   if (d.movementType === "RETURN") {
// //     await connection.execute(
// //       `
// //       UPDATE daily_food_stock
// //       SET
// //         Sold_Quantity = Sold_Quantity - ?,
// //         Closing_Quantity = Closing_Quantity + ?
// //       WHERE id = ?
// //       `,
// //       [d.diffQty, d.diffQty, stock.id]
// //     );
// //   }

// //   await connection.execute(
// //     `
// //     INSERT INTO food_stock_movements
// //       (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
// //     VALUES (?, ?, ?, ?, ?, ?)
// //     `,
// //     [
// //       Item_Id,
// //       stockDate,
// //       d.movementType,
// //       d.diffQty,
// //       Order_Id,
// //       userId,
// //     ]
// //   );
// // }

//     await connection.commit();

//     return res.status(200).json({
//       success: true,
//       message: "Order updated successfully",
//       KOT_Id,
//       elligibleItems: eligibilityResult.elligibleItems, // 🔥 ONLY NEW ITEMS
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Update Order Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

//NEW NO DUPLICATE ID GENERATION PROBLEM
const updateOrder = async (req, res, next) => {
  const stockDate = new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Kolkata",
});
  let connection;

  try {
    const { Order_Id } = req.params;
    // const { items, Sub_Total, Amount} = req.body;
const { items, Sub_Total, Amount } = req.body;
const userId = req.user?.User_Id;

    if (!Order_Id) {
      return res.status(400).json({ success: false, message: "Order ID missing" });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Items required" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    /* ---------------------------------------------------
       🔥 A️⃣ FETCH EXISTING KITCHEN ITEMS (BEFORE DELETE)
    --------------------------------------------------- */
    const [oldKitchenItems] = await connection.execute(
      `
      SELECT koi.Item_Name, koi.Quantity, fi.Item_Category
      FROM kitchen_order_items koi
      JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
      JOIN kitchen_orders ko ON ko.KOT_Id = koi.KOT_Id
      WHERE ko.Order_Id = ?
      `,
      [Order_Id]
    );

    const oldQtyMap = new Map();
    oldKitchenItems.forEach((it) => {
      oldQtyMap.set(it.Item_Name, it.Quantity);
    });

    /* ---------------------------------------------------
       1️⃣ UPDATE ORDER TOTALS
    --------------------------------------------------- */
    await connection.execute(
      `UPDATE orders 
       SET Sub_Total = ?, Amount = ? 
       WHERE Order_Id = ?`,
      [Sub_Total, Amount, Order_Id]
    );

    /* ---------------------------------------------------
       2️⃣ FETCH OR CREATE KOT
    --------------------------------------------------- */
    const [[existingKOT]] = await connection.execute(
      `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
      [Order_Id]
    );

    let KOT_Id;
    if (existingKOT) {
      KOT_Id = existingKOT.KOT_Id;
    } else {
      //KOT_Id = await generateNextId(connection, "KOT", "KOT_Id", "kitchen_orders");
      const [kotResult]=await connection.execute(
        `INSERT INTO kitchen_orders ( Order_Id, Status)
         VALUES ( ?, 'pending')`,
        [ Order_Id]
      );
      const kotNum=kotResult.insertId
      const KOT_Id="KOT"+kotNum.toString().padStart(5,"0")
      await connection.execute(`UPDATE kitchen_orders SET KOT_Id=? WHERE id=?`,[KOT_Id,kotNum])

    }

    /* ---------------------------------------------------
       3️⃣ DELETE EXISTING ITEMS (UNCHANGED)
    --------------------------------------------------- */
    await connection.execute(`DELETE FROM order_items WHERE Order_Id = ?`, [Order_Id]);
    await connection.execute(`DELETE FROM kitchen_order_items WHERE KOT_Id = ?`, [KOT_Id]);

    /* ---------------------------------------------------
       🔥 B️⃣ BUILD NEWLY ADDED ITEMS (DELTA)
    --------------------------------------------------- */
    const newlyAddedItems = [];

    // for (const item of items) {
    //   const prevQty = oldQtyMap.get(item.Item_Name) || 0;
    //   const newQty = Number(item.Item_Quantity) || 0;

    //   if (newQty > prevQty) {
    //     newlyAddedItems.push({
    //       Item_Name: item.Item_Name,
    //       Item_Quantity: newQty - prevQty, // 🔥 ONLY DELTA
    //     });
    //   }
    // }
    const deltaItems = [];

for (const item of items) {
  const prevQty = oldQtyMap.get(item.Item_Name) || 0;
  const newQty = Number(item.Item_Quantity) || 0;

  const diff = newQty - prevQty;

  if (diff !== 0) {
    deltaItems.push({
      Item_Name: item.Item_Name,
      diffQty: Math.abs(diff),
      movementType: diff > 0 ? "DINE_IN" : "RETURN",
    });
  }
}


    /* ---------------------------------------------------
       4️⃣ REINSERT ITEMS (UNCHANGED)
    --------------------------------------------------- */
    for (const item of items) {
      const [[dbItem]] = await connection.execute(
        `SELECT Item_Id, Item_Category
         FROM add_food_item
         WHERE Item_Name = ? LIMIT 1`,
        [item.Item_Name]
      );

      if (!dbItem) continue;

      // const Order_Item_Id = await generateNextId(
      //   connection,
      //   "ODRITM",
      //   "Order_Item_Id",
      //   "order_items"
      // );

      const [orderItemResult] = await connection.execute(
        `INSERT INTO order_items
         ( Order_Id, Item_Id, Quantity, Price, Amount)
         VALUES ( ?, ?, ?, ?, ?)`,
        [
          
          Order_Id,
          dbItem.Item_Id,
          item.Item_Quantity,
          item.Item_Price,
          item.Amount
        ]
      );
        const orderItemNum=orderItemResult.insertId
        const Order_Item_Id="ODRITM"+orderItemNum.toString().padStart(5,"0")
        await connection.execute(`UPDATE
           order_items SET Order_Item_Id=? WHERE id=?`,[Order_Item_Id,orderItemNum])

      // const KOT_Item_Id = await generateNextId(
      //   connection,
      //   "KOTITM",
      //   "KOT_Item_Id",
      //   "kitchen_order_items"
      // );

      const [kitchenOrderItemResult] = await connection.execute(
        `INSERT INTO kitchen_order_items
         ( KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
         VALUES ( ?, ?, ?, ?, 'pending')`,
        [
         
          KOT_Id,
          dbItem.Item_Id,
          item.Item_Name,
          item.Item_Quantity
        ]
      );
      const kitchenOrderItemNum=kitchenOrderItemResult.insertId
      const KOT_Item_Id="KOTITM"+kitchenOrderItemNum.toString().padStart(5,"0")
      await connection.execute(`UPDATE kitchen_order_items SET KOT_Item_Id=? WHERE id=?`
        ,[KOT_Item_Id,kitchenOrderItemNum])
    }

    /* ---------------------------------------------------
       🔥 C️⃣ CHECK KOT ELIGIBILITY (ONLY NEW ITEMS)
    --------------------------------------------------- */
    // const eligibilityResult = newlyAddedItems.length
    //   ? await checkDineInItemsElligibleForKOTPrint(newlyAddedItems)
    //   : { elligibleItems: {} };
    const addedItemsForKOT = deltaItems
  .filter(d => d.movementType === "DINE_IN")
  .map(d => ({
    Item_Name: d.Item_Name,
    Item_Quantity: d.diffQty
  }));

const eligibilityResult = addedItemsForKOT.length
  ? await checkDineInItemsElligibleForKOTPrint(addedItemsForKOT)
  : { success: true, elligibleItems: {} };

      console.log("Eligibility Result:", eligibilityResult);
/* =====================================================
   🔥 D️⃣ UPDATE STOCK FOR NEWLY ADDED ITEMS (DELTA)
===================================================== */

// for (const deltaItem of newlyAddedItems) {
//   const [[dbItem]] = await connection.execute(
//     `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
//     [deltaItem.Item_Name]
//   );

//   if (!dbItem) continue;

//   const Item_Id = dbItem.Item_Id;
//   const deltaQty = deltaItem.Item_Quantity;

//   // 1️⃣ Ensure today's stock row exists
//   await connection.execute(
//     `
//     INSERT IGNORE INTO daily_food_stock
//       (Item_Id, Stock_Date, Opening_Quantity, Added_Quantity, Sold_Quantity, Closing_Quantity)
//     VALUES (?, ?, 0, 0, 0, 0)
//     `,
//     [Item_Id, stockDate]
//   );

//   // 2️⃣ Lock stock row
//   const [[stock]] = await connection.execute(
//     `
//     SELECT id
//     FROM daily_food_stock
//     WHERE Item_Id = ?
//       AND Stock_Date = ?
//     FOR UPDATE
//     `,
//     [Item_Id, stockDate]
//   );

//   if (!stock) {
//     await connection.rollback();
//     return res.status(400).json({
//       success: false,
//       message: `Stock row missing for item ${deltaItem.Item_Name}`,
//     });
//   }

//   // 3️⃣ Reduce stock by DELTA
//   await connection.execute(
//     `
//     UPDATE daily_food_stock
//     SET
//       Sold_Quantity = Sold_Quantity + ?,
//       Closing_Quantity = Closing_Quantity - ?
//     WHERE id = ?
//     `,
//     [deltaQty, deltaQty, stock.id]
//   );

//   // 4️⃣ Insert stock history (DELTA SALE)
//   await connection.execute(
//   `
//   INSERT INTO food_stock_movements
//     (Item_Id,  Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
//   VALUES (?,  ?, 'DINE_IN', ?, ?, ?)
//   `,
//   [
//     Item_Id,
    
//     stockDate,
//     deltaQty, // sold qty
//     Order_Id,
//     userId,
//   ]
// );

// // await connection.execute(
// //   `
// //   INSERT INTO food_stock_movements
// //     (Item_Id, Item_Name, Stock_Date, Quantity, User_Id)
// //   VALUES (?, ?,?, ?, ?)
// //   `,
// //   [
// //     Item_Id,
// //     deltaItem.Item_Name.Item_Name,
// //     stockDate,
// //     deltaItem.Item_Name.Item_Quantity, // sold qty
// //     userId,             // waiter / cashier
// //   ]
// // );
// }
for (const d of deltaItems) {
  const [[dbItem]] = await connection.execute(
    `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
    [d.Item_Name]
  );

  if (!dbItem) continue;

  const Item_Id = dbItem.Item_Id;

  /* ================= SAFE UPSERT STOCK ROW ================= */

  await connection.execute(
    `
    INSERT INTO daily_food_stock
      (Item_Id, Stock_Date,
       Opening_Quantity, Added_Quantity,
       Sold_Quantity, Closing_Quantity)
    VALUES (?, ?, 0, 0, 0, 0)
    ON DUPLICATE KEY UPDATE
      Stock_Date = daily_food_stock.Stock_Date
    `,
    [Item_Id, stockDate]
  );

  /* ================= APPLY DELTA ================= */

  if (d.movementType === "DINE_IN") {
    await connection.execute(
      `
      UPDATE daily_food_stock
      SET
        Sold_Quantity = Sold_Quantity + ?,
        Closing_Quantity = Closing_Quantity - ?
      WHERE Item_Id = ?
        AND Stock_Date = ?
      `,
      [d.diffQty, d.diffQty, Item_Id, stockDate]
    );
  }

  if (d.movementType === "RETURN") {
    await connection.execute(
      `
      UPDATE daily_food_stock
      SET
        Sold_Quantity = Sold_Quantity - ?,
        Closing_Quantity = Closing_Quantity + ?
      WHERE Item_Id = ?
        AND Stock_Date = ?
      `,
      [d.diffQty, d.diffQty, Item_Id, stockDate]
    );
  }

  /* ================= MOVEMENT HISTORY ================= */

  await connection.execute(
    `
    INSERT INTO food_stock_movements
      (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      Item_Id,
      stockDate,
      d.movementType,
      d.diffQty,
      Order_Id,
      userId,
    ]
  );
}
// for (const d of deltaItems) {
//   const [[dbItem]] = await connection.execute(
//     `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
//     [d.Item_Name]
//   );

//   if (!dbItem) continue;

//   const Item_Id = dbItem.Item_Id;

//   await connection.execute(
//     `
//     INSERT IGNORE INTO daily_food_stock
//       (Item_Id, Stock_Date, Opening_Quantity, Added_Quantity, Sold_Quantity, Closing_Quantity)
//     VALUES (?, ?, 0, 0, 0, 0)
//     `,
//     [Item_Id, stockDate]
//   );

//   const [[stock]] = await connection.execute(
//     `
//     SELECT id
//     FROM daily_food_stock
//     WHERE Item_Id = ? AND Stock_Date = ?
//     FOR UPDATE
//     `,
//     [Item_Id, stockDate]
//   );

//   if (!stock) {
//     await connection.rollback();
//     return res.status(400).json({
//       success: false,
//       message: "Stock row missing",
//     });
//   }

//   if (d.movementType === "DINE_IN") {
//     await connection.execute(
//       `
//       UPDATE daily_food_stock
//       SET
//         Sold_Quantity = Sold_Quantity + ?,
//         Closing_Quantity = Closing_Quantity - ?
//       WHERE id = ?
//       `,
//       [d.diffQty, d.diffQty, stock.id]
//     );
//   }

//   if (d.movementType === "RETURN") {
//     await connection.execute(
//       `
//       UPDATE daily_food_stock
//       SET
//         Sold_Quantity = Sold_Quantity - ?,
//         Closing_Quantity = Closing_Quantity + ?
//       WHERE id = ?
//       `,
//       [d.diffQty, d.diffQty, stock.id]
//     );
//   }

//   await connection.execute(
//     `
//     INSERT INTO food_stock_movements
//       (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
//     VALUES (?, ?, ?, ?, ?, ?)
//     `,
//     [
//       Item_Id,
//       stockDate,
//       d.movementType,
//       d.diffQty,
//       Order_Id,
//       userId,
//     ]
//   );
// }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      KOT_Id,
      elligibleItems: eligibilityResult.elligibleItems, // 🔥 ONLY NEW ITEMS
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Update Order Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
//NEW NO DUPLICACY PROBLEM

const confirmOrderBillPaidAndInvoiceGenerated = async (req, res, next) => {
  let connection;

  try {
    const { Order_Id } = req.params;

    const {
      Customer_Name,
      Customer_Phone,
      Discount_Type,
      Discount,
      Service_Charge,
      Service_Charge_Type,
      Payment_Type,
      Final_Amount,
    } = req.body;

    const normalizedCustomerName =
      Customer_Name && Customer_Name.trim() !== ""
        ? Customer_Name.trim()
        : null;

    /* ---------------- VALIDATION ---------------- */
    if (!Order_Id) {
      return res.status(400).json({
        success: false,
        message: "Order ID missing",
      });
    }

    if (!Final_Amount) {
      return res.status(400).json({
        success: false,
        message: "Final amount is required",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();
/* ---------------- FETCH WAITER ---------------- */
    const [[orderRow]] = await connection.execute(
      `SELECT User_Id FROM orders WHERE Order_Id = ? LIMIT 1`,
      [Order_Id]
    );

    const Waiter_Id = orderRow?.User_Id || null;
    /* ---------------------------------------
     0️⃣ Fetch KOT ID
    --------------------------------------- */
    const [[kotRow]] = await connection.execute(
      `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
      [Order_Id]
    );

    const KOT_Id = kotRow?.KOT_Id || null;

    /* ---------------------------------------
     1️ Generate Invoice ID
    --------------------------------------- */
    // const Invoice_Id = await generateNextId(
    //   connection,
    //   "INV",
    //   "Invoice_Id",
    //   "invoices"
    // );

    const [fy] = await connection.execute(
      `SELECT Financial_Year
       FROM financial_year
       WHERE Current_Financial_Year = 1
       LIMIT 1`
    );

    if (fy.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "No active financial year found.",
      });
    }

    const activeFY = fy[0].Financial_Year;

    /* ---------------------------------------
     2⃣ CUSTOMER (OPTIONAL — SAFE)
    --------------------------------------- */
    let Customer_Id = null;

    if (Customer_Phone) {
      const [customers] = await connection.execute(
        `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
        [Customer_Phone]
      );

      if (customers.length === 0) {
        // create customer ONLY when phone exists
        // Customer_Id = await generateNextId(
        //   connection,
        //   "CUST",
        //   "Customer_Id",
        //   "customers"
        // );

        // await connection.execute(
        //   `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
        //    VALUES (?, ?, ?)`,
        //   [Customer_Id, normalizedCustomerName, Customer_Phone]
        // );
          const [custRes] = await connection.execute(
          `INSERT INTO customers (Customer_Name, Customer_Phone)
           VALUES (?, ?)`,
          [Customer_Name?.trim() || null, Customer_Phone]
        );

        const id = custRes.insertId;
        Customer_Id = "CUST" + id.toString().padStart(5, "0");

        // ✅ UPDATE WITH FORMATTED ID
        await connection.execute(
          `UPDATE customers SET Customer_Id = ? WHERE id = ?`,
          [Customer_Id, id]
        );
      } else {
        Customer_Id = customers[0].Customer_Id;

        // update name if provided
        if (normalizedCustomerName) {
          await connection.execute(
            `UPDATE customers SET Customer_Name = ? WHERE Customer_Id = ?`,
            [normalizedCustomerName, Customer_Id]
          );
        }
      }

      // link order to customer
      await connection.execute(
        `UPDATE orders SET Customer_Id = ? WHERE Order_Id = ?`,
        [Customer_Id, Order_Id]
      );
    }

    /* ---------------------------------------
     3 Create Invoice (customer may be NULL)
    --------------------------------------- */
    const [invoiceResult]=await connection.execute(
      `INSERT INTO invoices
      ( Order_Id, Invoice_Date, Financial_Year,
       Customer_Name, Customer_Phone, Customer_Id,
       Discount_Type, Discount, Service_Charge, Service_Charge_Type, Amount, Payment_Type)
       VALUES ( ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        
        Order_Id,
        activeFY,
        normalizedCustomerName,
        Customer_Phone || null,
        Customer_Id,
        Discount_Type,
        Discount || 0,
        Service_Charge || 0,
        Service_Charge_Type,
        Final_Amount,
        Payment_Type,
      ]
    );
    const Invoice_Id = invoiceResult.insertId;
    const InvoiceNum= "INV"+Invoice_Id.toString().padStart(5,"0");
    await connection.execute(`UPDATE invoices SET Invoice_Id = ? WHERE id = ?`,
      [InvoiceNum,Invoice_Id])

    /* ---------------------------------------
     4 Mark Order Paid
    --------------------------------------- */
    await connection.execute(
      `UPDATE orders
       SET Payment_Status = 'completed', Status = 'paid'
       WHERE Order_Id = ?`,
      [Order_Id]
    );

    /* ---------------------------------------
     ⃣ Free Tables
    --------------------------------------- */
    const [tableIds] = await connection.execute(
      `SELECT Table_Id FROM order_tables WHERE Order_Id = ?`,
      [Order_Id]
    );

    if (tableIds.length) {
      await connection.query(
        `UPDATE add_table
         SET Status = 'available', Start_Time = NULL, End_Time = NOW()
         WHERE Table_Id IN (?)`,
        [tableIds.map((t) => t.Table_Id)]
      );
    }

    /* ---------------------------------------
     6 Kitchen Status
    --------------------------------------- */
    if (KOT_Id) {
      await connection.execute(
        `UPDATE kitchen_orders
         SET Status = 'ready', updated_at = NOW()
         WHERE KOT_Id = ?`,
        [KOT_Id]
      );

      await connection.execute(
        `UPDATE kitchen_order_items
         SET Item_Status = 'ready'
         WHERE KOT_Id = ?`,
        [KOT_Id]
      );
    }

    await connection.commit();

    /* ---------------------------------------
     SOCKET
    --------------------------------------- */
    if (KOT_Id) {
      io.emit("kitchen_order_removed", { KOT_Id });
    }
     //  Notify WAITER
    if (Waiter_Id) {
      io.to(`waiter_${Waiter_Id}`).emit("waiter_order_closed", {
        Order_Id,
        message: "Order completed & bill paid",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invoice generated. Order completed.",
      Invoice_Id,
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Confirm Bill Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

//OLD PROBLEMATIC
// const confirmOrderBillPaidAndInvoiceGenerated = async (req, res, next) => {
//   let connection;

//   try {
//     const { Order_Id } = req.params;

//     const {
//       Customer_Name,
//       Customer_Phone,
//       Discount_Type,
//       Discount,
//       Service_Charge,
//       Service_Charge_Type,
//       Payment_Type,
//       Final_Amount,
//     } = req.body;

//     const normalizedCustomerName =
//       Customer_Name && Customer_Name.trim() !== ""
//         ? Customer_Name.trim()
//         : null;

//     /* ---------------- VALIDATION ---------------- */
//     if (!Order_Id) {
//       return res.status(400).json({
//         success: false,
//         message: "Order ID missing",
//       });
//     }

//     if (!Final_Amount) {
//       return res.status(400).json({
//         success: false,
//         message: "Final amount is required",
//       });
//     }

//     connection = await db.getConnection();
//     await connection.beginTransaction();
// /* ---------------- FETCH WAITER ---------------- */
//     const [[orderRow]] = await connection.execute(
//       `SELECT User_Id FROM orders WHERE Order_Id = ? LIMIT 1`,
//       [Order_Id]
//     );

//     const Waiter_Id = orderRow?.User_Id || null;
//     /* ---------------------------------------
//      0️⃣ Fetch KOT ID
//     --------------------------------------- */
//     const [[kotRow]] = await connection.execute(
//       `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
//       [Order_Id]
//     );

//     const KOT_Id = kotRow?.KOT_Id || null;

//     /* ---------------------------------------
//      1️ Generate Invoice ID
//     --------------------------------------- */
//     const Invoice_Id = await generateNextId(
//       connection,
//       "INV",
//       "Invoice_Id",
//       "invoices"
//     );

//     const [fy] = await connection.execute(
//       `SELECT Financial_Year
//        FROM financial_year
//        WHERE Current_Financial_Year = 1
//        LIMIT 1`
//     );

//     if (fy.length === 0) {
//       await connection.rollback();
//       return res.status(400).json({
//         message: "No active financial year found.",
//       });
//     }

//     const activeFY = fy[0].Financial_Year;

//     /* ---------------------------------------
//      2⃣ CUSTOMER (OPTIONAL — SAFE)
//     --------------------------------------- */
//     let Customer_Id = null;

//     if (Customer_Phone) {
//       const [customers] = await connection.execute(
//         `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
//         [Customer_Phone]
//       );

//       if (customers.length === 0) {
//         // create customer ONLY when phone exists
//         Customer_Id = await generateNextId(
//           connection,
//           "CUST",
//           "Customer_Id",
//           "customers"
//         );

//         await connection.execute(
//           `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
//            VALUES (?, ?, ?)`,
//           [Customer_Id, normalizedCustomerName, Customer_Phone]
//         );
//       } else {
//         Customer_Id = customers[0].Customer_Id;

//         // update name if provided
//         if (normalizedCustomerName) {
//           await connection.execute(
//             `UPDATE customers SET Customer_Name = ? WHERE Customer_Id = ?`,
//             [normalizedCustomerName, Customer_Id]
//           );
//         }
//       }

//       // link order to customer
//       await connection.execute(
//         `UPDATE orders SET Customer_Id = ? WHERE Order_Id = ?`,
//         [Customer_Id, Order_Id]
//       );
//     }

//     /* ---------------------------------------
//      3 Create Invoice (customer may be NULL)
//     --------------------------------------- */
//     await connection.execute(
//       `INSERT INTO invoices
//       (Invoice_Id, Order_Id, Invoice_Date, Financial_Year,
//        Customer_Name, Customer_Phone, Customer_Id,
//        Discount_Type, Discount, Service_Charge, Service_Charge_Type, Amount, Payment_Type)
//        VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         Invoice_Id,
//         Order_Id,
//         activeFY,
//         normalizedCustomerName,
//         Customer_Phone || null,
//         Customer_Id,
//         Discount_Type,
//         Discount || 0,
//         Service_Charge || 0,
//         Service_Charge_Type,
//         Final_Amount,
//         Payment_Type,
//       ]
//     );

//     /* ---------------------------------------
//      4 Mark Order Paid
//     --------------------------------------- */
//     await connection.execute(
//       `UPDATE orders
//        SET Payment_Status = 'completed', Status = 'paid'
//        WHERE Order_Id = ?`,
//       [Order_Id]
//     );

//     /* ---------------------------------------
//      ⃣ Free Tables
//     --------------------------------------- */
//     const [tableIds] = await connection.execute(
//       `SELECT Table_Id FROM order_tables WHERE Order_Id = ?`,
//       [Order_Id]
//     );

//     if (tableIds.length) {
//       await connection.query(
//         `UPDATE add_table
//          SET Status = 'available', Start_Time = NULL, End_Time = NOW()
//          WHERE Table_Id IN (?)`,
//         [tableIds.map((t) => t.Table_Id)]
//       );
//     }

//     /* ---------------------------------------
//      6 Kitchen Status
//     --------------------------------------- */
//     if (KOT_Id) {
//       await connection.execute(
//         `UPDATE kitchen_orders
//          SET Status = 'ready', updated_at = NOW()
//          WHERE KOT_Id = ?`,
//         [KOT_Id]
//       );

//       await connection.execute(
//         `UPDATE kitchen_order_items
//          SET Item_Status = 'ready'
//          WHERE KOT_Id = ?`,
//         [KOT_Id]
//       );
//     }

//     await connection.commit();

//     /* ---------------------------------------
//      SOCKET
//     --------------------------------------- */
//     if (KOT_Id) {
//       io.emit("kitchen_order_removed", { KOT_Id });
//     }
//      //  Notify WAITER
//     if (Waiter_Id) {
//       io.to(`waiter_${Waiter_Id}`).emit("waiter_order_closed", {
//         Order_Id,
//         message: "Order completed & bill paid",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Invoice generated. Order completed.",
//       Invoice_Id,
//     });
//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Confirm Bill Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };





//OLD
// const getAllInvoicesAndOrdersEachDay = async (req, res, next) => {
//   let connection;

//   try {
//     const { date, search = "" } = req.query;
//     const page = Number(req.query.page || 1);
//     const limit = 10;
//     const offset = (page - 1) * limit;

//     if (!date) {
//       return res.status(400).json({
//         success: false,
//         message: "Date is required",
//       });
//     }

//     connection = await db.getConnection();
//      const startDate = `${date} 00:00:00`;
//     const endDate = `${date} 23:59:59`;
//     /* ================= SEARCH ================= */
//     let dineSearch = "";
//     let takeawaySearch = "";
//     let preBookSearch = "";
//     let params = [];

//     if (search) {
//       const s = `%${search.trim()}%`;

//       dineSearch = `
//         AND (
//           LOWER(Customer_Name) LIKE ?
//           OR LOWER(Customer_Phone) LIKE ?
//           OR LOWER(Invoice_Id) LIKE ?
//           OR LOWER(Order_Id) LIKE ?
//           OR CAST(Amount AS CHAR) LIKE ?
//         )
//       `;

//       takeawaySearch = `
//         AND (
//           LOWER(Customer_Name) LIKE ?
//           OR LOWER(Customer_Phone) LIKE ?
//           OR LOWER(Invoice_Id) LIKE ?
//           OR LOWER(Takeaway_Order_Id) LIKE ?
//          OR CAST(Amount AS CHAR) LIKE ?
//         )
//       `;

//       preBookSearch = `
//         AND (
//           LOWER(c.Customer_Name) LIKE ?
//           OR LOWER(c.Customer_Phone) LIKE ?
//           OR LOWER(inv.Pre_Book_Invoice_Id) LIKE ?
//           OR LOWER(inv.Pre_Book_Order_Id) LIKE ?
//          OR CAST(inv.Amount AS CHAR) LIKE ?

//         )
//       `;

//     params = [s, s, s, s, s];

//     }

//     /* ================= DINE INVOICES ================= */
//     // const [dineInvoices] = await connection.query(
//     //   `
//     //   SELECT
//     //     Invoice_Id,
//     //     Order_Id,
//     //     Customer_Name,
//     //     Customer_Phone,
//     //     Amount,
//     //     created_at,
//     //     Invoice_Date,
//     //     'dine' AS orderType
//     //   FROM invoices
//     //   WHERE DATE(created_at) = ?
//     //   ${dineSearch}
//     //   ORDER BY created_at DESC
//     //   LIMIT ? OFFSET ?
//     //   `,
//     //   [date, ...params, limit, offset]
//     // );
//  const [dineInvoices] = await connection.query(
//       `
//       SELECT
//         Invoice_Id,
//         Order_Id,
//         Customer_Name,
//         Customer_Phone,
//         Amount,
//         Service_Charge,
//         Service_Charge_Type,
//         Discount,
//         Discount_Type,
//         created_at,
//         Invoice_Date,
//         'dine' AS orderType
//       FROM invoices
//       WHERE created_at >= ? AND created_at <= ?
//       ${dineSearch}
//       ORDER BY created_at DESC
//       LIMIT ? OFFSET ?
//       `,
//       [startDate, endDate, ...params, limit, offset]
//     );

//     const [sideInvoices] = await connection.query(
//       `
//       (
//         SELECT
//           Invoice_Id,
//           Takeaway_Order_Id AS Order_Id,
//           Customer_Name,
//           Customer_Phone,
//           Amount,
//           NULL AS Service_Charge,
//           Discount,
//           Discount_Type,
//           created_at AS sort_time,
//           Invoice_Date,
//           'takeaway' AS orderType
//         FROM takeaway_invoices
//         WHERE created_at >= ? AND created_at <= ?
//         ${takeawaySearch}
//       )
//       UNION ALL
//       (
//         SELECT
//           inv.Pre_Book_Invoice_Id AS Invoice_Id,
//           inv.Pre_Book_Order_Id AS Order_Id,
//           c.Customer_Name,
//           c.Customer_Phone,
//           inv.Amount,
//           inv.Service_Charge,
//           inv.Discount,
//           inv.Discount_Type,
//           inv.Pre_Book_Invoice_Date AS sort_time,
//           inv.Pre_Book_Invoice_Date AS Invoice_Date,
//           'pre-book' AS orderType
//         FROM pre_book_orders_invoices inv
//         LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
//         WHERE inv.Pre_Book_Invoice_Date >= ? AND inv.Pre_Book_Invoice_Date <= ?
//         ${preBookSearch}
//       )
//       ORDER BY sort_time DESC
//       LIMIT ? OFFSET ?
//       `,
//       [startDate, endDate, ...params, startDate, endDate, ...params, limit, offset]
//     );


//     const pagedInvoices = [...dineInvoices, ...sideInvoices];

//     /* ================= IDS ================= */
//     const dineOrderIds = dineInvoices.map(i => i.Order_Id);
//     const sideOrderIds = sideInvoices.map(i => i.Order_Id);

//     /* ================= ORDERS ================= */
//     const [orders] = dineOrderIds.length
//       ? await connection.query(
//           `SELECT * FROM orders WHERE Order_Id IN (?)`,
//           [dineOrderIds]
//         )
//       : [[]];

//     const [ordersTakeaway] = sideOrderIds.length
//       ? await connection.query(
//           `SELECT * FROM orders_takeaway WHERE Takeaway_Order_Id IN (?)`,
//           [sideOrderIds]
//         )
//       : [[]];

//     const [preBookOrders] = sideOrderIds.length
//       ? await connection.query(
//           `SELECT * FROM pre_booked_orders WHERE Pre_Booked_Order_Id IN (?)`,
//           [sideOrderIds]
//         )
//       : [[]];
// /* ================= PRE-BOOK TABLES ================= */
// const [preBookTables] = sideOrderIds.length
//   ? await connection.query(
//       `
//       SELECT
//         pbot.Pre_Booked_Order_Id,
//         t.Table_Id,
//         t.Table_Name
//       FROM pre_booked_order_tables pbot
//       JOIN add_table t ON t.Table_Id = pbot.Table_Id
//       WHERE pbot.Pre_Booked_Order_Id IN (?)
//       `,
//       [sideOrderIds]
//     )
//   : [[]];

//     /* ================= ITEMS ================= */
//     const [items] = dineOrderIds.length
//       ? await connection.query(
//           `
//           SELECT
//             oi.Order_Id,
//             oi.Quantity,
//             oi.Price,
//             oi.Amount,
//             f.Item_Name,
//             f.Item_Category
//           FROM order_items oi
//           JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//           WHERE oi.Order_Id IN (?)
//           `,
//           [dineOrderIds]
//         )
//       : [[]];

//     const [takeawayItems] = sideOrderIds.length
//       ? await connection.query(
//           `
//           SELECT
//             oi.Takeaway_Order_Id,
//             oi.Quantity,
//             oi.Price,
//             oi.Amount,
//             f.Item_Name,
//             f.Item_Category
//           FROM order_takeaway_items oi
//           JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//           WHERE oi.Takeaway_Order_Id IN (?)
//           `,
//           [sideOrderIds]
//         )
//       : [[]];

//     const [preBookItems] = sideOrderIds.length
//       ? await connection.query(
//           `
//           SELECT
//             oi.Pre_Booked_Order_Id,
//             oi.Item_Name,
//             oi.Quantity,
//             oi.Price,
//             oi.Amount,
//             f.Item_Category
//           FROM pre_booked_order_items oi
//           JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//           WHERE oi.Pre_Booked_Order_Id IN (?)
//           `,
//           [sideOrderIds]
//         )
//       : [[]];

//     /* ================= TABLES (DINE) ================= */
//     const [tables] = dineOrderIds.length
//       ? await connection.query(
//           `
//           SELECT
//             ot.Order_Id,
//             t.Table_Id,
//             t.Table_Name
//           FROM order_tables ot
//           JOIN add_table t ON t.Table_Id = ot.Table_Id
//           WHERE ot.Order_Id IN (?)
//           `,
//           [dineOrderIds]
//         )
//       : [[]];

//     /* ================= COUNTS ================= */
//     const [[dineCount]] = await connection.query(
//       `SELECT COUNT(*) total FROM invoices WHERE DATE(created_at) = ?`,
//       [date]
//     );

//     const [[rightCount]] = await connection.query(
//       `
//       SELECT COUNT(*) total FROM (
//         SELECT Invoice_Id FROM takeaway_invoices WHERE DATE(created_at) = ?
//         UNION ALL
//         SELECT inv.Pre_Book_Invoice_Id
//         FROM pre_book_orders_invoices inv
//         WHERE DATE(inv.Pre_Book_Invoice_Date) = ?
//       ) x
//       `,
//       [date, date]
//     );

//     const totalInvoices = dineCount.total + rightCount.total;
//     const totalPages = Math.max(
//       Math.ceil(dineCount.total / limit),
//       Math.ceil(rightCount.total / limit)
//     );

//     /* ================= FINAL MERGE ================= */

// /* ================= FINAL MERGE ================= */
// // const finalData = await Promise.all(
// //   pagedInvoices.map(async (inv) => {

// //     let orderItems = [];
// //     let orderTables = [];
// //     let orderType = inv.orderType;

// //     if (inv.orderType === "dine") {
// //       orderItems = items.filter(i => i.Order_Id === inv.Order_Id);
// //       orderTables = tables.filter(t => t.Order_Id === inv.Order_Id);
// //     }

// //     else if (inv.orderType === "takeaway") {
// //       orderItems = takeawayItems.filter(
// //         i => i.Takeaway_Order_Id === inv.Order_Id
// //       );
// //     }

// //     else { // pre-book
// //       orderItems = preBookItems.filter(
// //         i => i.Pre_Booked_Order_Id === inv.Order_Id
// //       );

// //       const pbTables = preBookTables.filter(
// //         t => t.Pre_Booked_Order_Id === inv.Order_Id
// //       );

// //       orderTables = pbTables;

// //       // If pre-book has tables → treat as dine
// //       orderType = pbTables.length > 0 ? "dine" : "takeaway";
// //     }

// //     /* ================= KOT ELIGIBILITY ================= */
// //     const kotResult = await checkDineInItemsElligibleForKOTPrint(
// //       orderItems.map(i => ({
// //         Item_Name: i.Item_Name,
// //         Item_Quantity: i.Quantity || 1
// //       }))
// //     );

// //     return {
// //       invoice: inv,
// //       order:
// //         inv.orderType === "dine"
// //           ? orders.find(o => o.Order_Id === inv.Order_Id) || null
// //           : inv.orderType === "takeaway"
// //           ? ordersTakeaway.find(o => o.Takeaway_Order_Id === inv.Order_Id) || null
// //           : preBookOrders.find(o => o.Pre_Booked_Order_Id === inv.Order_Id) || null,

// //       items: orderItems,
// //       tables: orderTables,

// //       // 🔥 THIS IS THE IMPORTANT PART
// //       kitchens: kotResult.success ? kotResult.elligibleItems : {},

// //       orderType,
// //       originalOrderType: inv.orderType,
// //     };
// //   })
// // );
// const finalData = await Promise.all(
//   pagedInvoices.map(async (inv) => {

//     let orderItems = [];
//     let orderTables = [];
//     let orderType = inv.orderType;

//     if (inv.orderType === "dine") {
//       orderItems = items.filter(i => i.Order_Id === inv.Order_Id);
//       orderTables = tables.filter(t => t.Order_Id === inv.Order_Id);
//     } 
//     else if (inv.orderType === "takeaway") {
//       orderItems = takeawayItems.filter(
//         i => i.Takeaway_Order_Id === inv.Order_Id
//       );
//     } 
//     else {
//       orderItems = preBookItems.filter(
//         i => i.Pre_Booked_Order_Id === inv.Order_Id
//       );

//       const pbTables = preBookTables.filter(
//         t => t.Pre_Booked_Order_Id === inv.Order_Id
//       );

//       orderTables = pbTables;
//       orderType = pbTables.length > 0 ? "dine" : "takeaway";
//     }

//     /* ================= CALCULATE AMOUNTS ================= */

//     // let serviceChargeAmount = 0;
//     // let discountAmount = 0;                                                                                                                                                                                                                                                                                                                                
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                       const subTotal = orderItems.reduce(
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                         (sum, item) => sum + Number(item.Amount || 0),
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                         0
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                       );

// let serviceChargeAmount = 0;
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                       let discountAmount = 0;

//                                                                                                                                                                                                                                                                                                                                                                                                                                                                       if (inv.Service_Charge_Type === "percentage") {
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                         serviceChargeAmount = (subTotal * Number(inv.Service_Charge || 0)) / 100;
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                       } else {
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                         serviceChargeAmount = Number(inv.Service_Charge || 0);
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                       }

//                                                                                                                                                                                                                                                                                                                                                                                                                                                                       if (inv.Discount_Type === "percentage") {
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                         discountAmount = (subTotal * Number(inv.Discount || 0)) / 100;
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                       } else {
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                         discountAmount = Number(inv.Discount || 0);
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                       }
//     // const subTotal = Number(inv.Amount || 0);

//     // if (inv.Service_Charge_Type === "percentage") {
//     //   serviceChargeAmount = (subTotal * Number(inv.Service_Charge || 0)) / 100;
//     // } else {
//     //   serviceChargeAmount = Number(inv.Service_Charge || 0);
//     // }

//     // if (inv.Discount_Type === "percentage") {
//     //   discountAmount = (subTotal * Number(inv.Discount || 0)) / 100;
//     // } else {
//     //   discountAmount = Number(inv.Discount || 0);
//     // }

//     /* ================= KOT ================= */

//     const kotResult = await checkDineInItemsElligibleForKOTPrint(
//       orderItems.map(i => ({
//         Item_Name: i.Item_Name,
//         Item_Quantity: i.Quantity || 1
//       }))
//     );

//     return {
//       invoice: {
//         ...inv,
//         Service_Charge_Amount: serviceChargeAmount,
//         Discount_Amount: discountAmount
//       },

//       order:
//         inv.orderType === "dine"
//           ? orders.find(o => o.Order_Id === inv.Order_Id) || null
//           : inv.orderType === "takeaway"
//           ? ordersTakeaway.find(o => o.Takeaway_Order_Id === inv.Order_Id) || null
//           : preBookOrders.find(o => o.Pre_Booked_Order_Id === inv.Order_Id) || null,

//       items: orderItems,
//       tables: orderTables,

//       kitchens: kotResult.success ? kotResult.elligibleItems : {},

//       orderType,
//       originalOrderType: inv.orderType,
//     };
//   })
// );

//     /* ================= RESPONSE ================= */
//     return res.status(200).json({
//       success: true,
//       date,
//       page,
//       pageSize: limit,
//       totalPages,
//       totalInvoices,
//       dineCount: dineCount.total,
//       takeawayCount: rightCount.total,
//       data: finalData,
//     });

//   } catch (err) {
//     console.error("❌ Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
//NEW
const getAllInvoicesAndOrdersEachDay = async (req, res, next) => {
  let connection;

  try {
    const { date, search = "" } = req.query;
    const page = Number(req.query.page || 1);
    const limit = 10;
    const offset = (page - 1) * limit;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    connection = await db.getConnection();
     const startDate = `${date} 00:00:00`;
    const endDate = `${date} 23:59:59`;
    /* ================= SEARCH ================= */
    let dineSearch = "";
    let takeawaySearch = "";
    let preBookSearch = "";

    let textParams = [];
    let amountParams = [];

    if (search) {
      const trimmed = search.trim();
      const likeSearch = `%${trimmed}%`;

      const isNumber = !isNaN(trimmed);
      // const isRange = trimmed.includes("-");

      // TEXT PARAMS
      textParams = [likeSearch, likeSearch, likeSearch, likeSearch];

      /* ===== AMOUNT LOGIC ===== */
      let amountConditionDine = "";
      let amountConditionTakeaway = "";
      let amountConditionPreBook = "";

        if (isNumber) {
        amountConditionDine = ` OR Amount >= ?`;
        amountConditionTakeaway = ` OR Amount >= ?`;
        amountConditionPreBook = ` OR inv.Amount >= ?`;

        amountParams.push(Number(trimmed));
      }

      dineSearch = `
        AND (
          Customer_Name LIKE ?
          OR Customer_Phone LIKE ?
          OR Invoice_Id LIKE ?
          OR Order_Id LIKE ?
          ${amountConditionDine}
        )
      `;

      takeawaySearch = `
        AND (
          Customer_Name LIKE ?
          OR Customer_Phone LIKE ?
          OR Invoice_Id LIKE ?
          OR Takeaway_Order_Id LIKE ?
          ${amountConditionTakeaway}
        )
      `;

      preBookSearch = `
        AND (
          c.Customer_Name LIKE ?
          OR c.Customer_Phone LIKE ?
          OR inv.Pre_Book_Invoice_Id LIKE ?
          OR inv.Pre_Book_Order_Id LIKE ?
          ${amountConditionPreBook}
        )
      `;
    }

    const params = [...textParams, ...amountParams];

    // let dineSearch = "";
    // let takeawaySearch = "";
    // let preBookSearch = "";
    // let params = [];

    // if (search) {
    //   const s = `%${search.trim()}%`;

    //   dineSearch = `
    //     AND (
    //       LOWER(Customer_Name) LIKE ?
    //       OR LOWER(Customer_Phone) LIKE ?
    //       OR LOWER(Invoice_Id) LIKE ?
    //       OR LOWER(Order_Id) LIKE ?
    //       OR CAST(Amount AS CHAR) LIKE ?
    //     )
    //   `;

    //   takeawaySearch = `
    //     AND (
    //       LOWER(Customer_Name) LIKE ?
    //       OR LOWER(Customer_Phone) LIKE ?
    //       OR LOWER(Invoice_Id) LIKE ?
    //       OR LOWER(Takeaway_Order_Id) LIKE ?
    //      OR CAST(Amount AS CHAR) LIKE ?
    //     )
    //   `;

    //   preBookSearch = `
    //     AND (
    //       LOWER(c.Customer_Name) LIKE ?
    //       OR LOWER(c.Customer_Phone) LIKE ?
    //       OR LOWER(inv.Pre_Book_Invoice_Id) LIKE ?
    //       OR LOWER(inv.Pre_Book_Order_Id) LIKE ?
    //      OR CAST(inv.Amount AS CHAR) LIKE ?

    //     )
    //   `;

    // params = [s, s, s, s, s];

    // }

    /* ================= DINE INVOICES ================= */
    // const [dineInvoices] = await connection.query(
    //   `
    //   SELECT
    //     Invoice_Id,
    //     Order_Id,
    //     Customer_Name,
    //     Customer_Phone,
    //     Amount,
    //     created_at,
    //     Invoice_Date,
    //     'dine' AS orderType
    //   FROM invoices
    //   WHERE DATE(created_at) = ?
    //   ${dineSearch}
    //   ORDER BY created_at DESC
    //   LIMIT ? OFFSET ?
    //   `,
    //   [date, ...params, limit, offset]
    // );
 const [dineInvoices] = await connection.query(
      `
      (
  SELECT
    Invoice_Id,
    Order_Id,
    Customer_Name,
    Customer_Phone,
    Amount,
    Service_Charge,
    Service_Charge_Type,
    Discount,
    Discount_Type,
    created_at AS sort_time,
    Invoice_Date,
    'dine' AS orderType
  FROM invoices
  WHERE created_at >= ? AND created_at <= ?
  ${dineSearch}
)

UNION ALL

(
  SELECT
    inv.Pre_Book_Invoice_Id AS Invoice_Id,
    inv.Pre_Book_Order_Id   AS Order_Id,
    c.Customer_Name,
    c.Customer_Phone,
    inv.Amount,
    inv.Service_Charge,
    NULL AS Service_Charge_Type,
    inv.Discount,
    inv.Discount_Type,
    inv.Pre_Book_Invoice_Date AS sort_time,
    inv.Pre_Book_Invoice_Date AS Invoice_Date,
    'pre-book' AS orderType
  FROM pre_book_orders_invoices inv
  LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
  WHERE inv.Pre_Book_Invoice_Date >= ? AND inv.Pre_Book_Invoice_Date <= ?
  AND EXISTS (
    SELECT 1 FROM pre_booked_order_tables pbot
    WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
  )
  ${preBookSearch}
)

ORDER BY sort_time DESC
LIMIT ? OFFSET ?
      `,
     [startDate, endDate, ...params, startDate, endDate, ...params, limit, offset]
    );

    const [sideInvoices] = await connection.query(
      `
      (
        SELECT
          Invoice_Id,
          Takeaway_Order_Id AS Order_Id,
          Customer_Name,
          Customer_Phone,
          Amount,
          NULL AS Service_Charge,
          Discount,
          Discount_Type,
          created_at AS sort_time,
          Invoice_Date,
          'takeaway' AS orderType
        FROM takeaway_invoices
        WHERE created_at >= ? AND created_at <= ?
        ${takeawaySearch}
      )
      UNION ALL
      (
        SELECT
          inv.Pre_Book_Invoice_Id AS Invoice_Id,
          inv.Pre_Book_Order_Id AS Order_Id,
          c.Customer_Name,
          c.Customer_Phone,
          inv.Amount,
          inv.Service_Charge,
          inv.Discount,
          inv.Discount_Type,
          inv.Pre_Book_Invoice_Date AS sort_time,
          inv.Pre_Book_Invoice_Date AS Invoice_Date,
          'pre-book' AS orderType
        FROM pre_book_orders_invoices inv
        LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
        WHERE inv.Pre_Book_Invoice_Date >= ? AND inv.Pre_Book_Invoice_Date <= ?
        ${preBookSearch}
      )
      ORDER BY sort_time DESC
      LIMIT ? OFFSET ?
      `,
      [startDate, endDate, ...params, startDate, endDate, ...params, limit, offset]
    );


    const pagedInvoices = [...dineInvoices, ...sideInvoices];

    /* ================= IDS ================= */
    const dineOrderIds = dineInvoices.map(i => i.Order_Id);
    const sideOrderIds = sideInvoices.map(i => i.Order_Id);

    /* ================= ORDERS ================= */
//     const [orders] = dineOrderIds.length
//       ? await connection.query(
//           `SELECT * FROM orders WHERE Order_Id IN (?)`,
//           [dineOrderIds]
//         )
//       : [[]];

//     const [ordersTakeaway] = sideOrderIds.length
//       ? await connection.query(
//           `SELECT * FROM orders_takeaway WHERE Takeaway_Order_Id IN (?)`,
//           [sideOrderIds]
//         )
//       : [[]];

//     const [preBookOrders] = sideOrderIds.length
//       ? await connection.query(
//           `SELECT * FROM pre_booked_orders WHERE Pre_Booked_Order_Id IN (?)`,
//           [sideOrderIds]
//         )
//       : [[]];

// const [preBookTables] = sideOrderIds.length
//   ? await connection.query(
//       `
//       SELECT
//         pbot.Pre_Booked_Order_Id,
//         t.Table_Id,
//         t.Table_Name
//       FROM pre_booked_order_tables pbot
//       JOIN add_table t ON t.Table_Id = pbot.Table_Id
//       WHERE pbot.Pre_Booked_Order_Id IN (?)
//       `,
//       [sideOrderIds]
//     )
//   : [[]];

   
//     const [items] = dineOrderIds.length
//       ? await connection.query(
//           `
//           SELECT
//             oi.Order_Id,
//             oi.Quantity,
//             oi.Price,
//             oi.Amount,
//             f.Item_Name,
//             f.Item_Category
//           FROM order_items oi
//           JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//           WHERE oi.Order_Id IN (?)
//           `,
//           [dineOrderIds]
//         )
//       : [[]];

//     const [takeawayItems] = sideOrderIds.length
//       ? await connection.query(
//           `
//           SELECT
//             oi.Takeaway_Order_Id,
//             oi.Quantity,
//             oi.Price,
//             oi.Amount,
//             f.Item_Name,
//             f.Item_Category
//           FROM order_takeaway_items oi
//           JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//           WHERE oi.Takeaway_Order_Id IN (?)
//           `,
//           [sideOrderIds]
//         )
//       : [[]];

//     const [preBookItems] = sideOrderIds.length
//       ? await connection.query(
//           `
//           SELECT
//             oi.Pre_Booked_Order_Id,
//             oi.Item_Name,
//             oi.Quantity,
//             oi.Price,
//             oi.Amount,
//             f.Item_Category
//           FROM pre_booked_order_items oi
//           JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//           WHERE oi.Pre_Booked_Order_Id IN (?)
//           `,
//           [sideOrderIds]
//         )
//       : [[]];
   const [
      [orders],
      [ordersTakeaway],
      [preBookOrders],
      [preBookTables],
      [items],
      [takeawayItems],
      [preBookItems],
      [tables]
    ] = await Promise.all([
      dineOrderIds.length ? connection.query(`SELECT * FROM orders WHERE Order_Id IN (?)`,
         [dineOrderIds]) : [[]],
      sideOrderIds.length ? connection.query(`SELECT * FROM orders_takeaway WHERE Takeaway_Order_Id IN (?)`, [sideOrderIds]) : [[]],
      sideOrderIds.length ? connection.query(`SELECT * FROM pre_booked_orders WHERE Pre_Booked_Order_Id IN (?)`, [sideOrderIds]) : [[]],
      sideOrderIds.length ? connection.query(`
        SELECT pbot.Pre_Booked_Order_Id, t.Table_Name
        FROM pre_booked_order_tables pbot
        JOIN add_table t ON t.Table_Id = pbot.Table_Id
        WHERE pbot.Pre_Booked_Order_Id IN (?)`, [sideOrderIds]) : [[]],
      dineOrderIds.length ? connection.query(`
        SELECT 
  oi.Order_Id,
  oi.Quantity,
  oi.Amount,
  oi.Price,
  f.Item_Name
FROM order_items oi
JOIN add_food_item f ON f.Item_Id = oi.Item_Id
WHERE oi.Order_Id IN (?)`, [dineOrderIds]) : [[]],
      sideOrderIds.length ? connection.query(`
      SELECT 
  oi.Takeaway_Order_Id,
  oi.Quantity,
  oi.Amount,
  oi.Price,
  f.Item_Name
FROM order_takeaway_items oi
JOIN add_food_item f ON f.Item_Id = oi.Item_Id
WHERE oi.Takeaway_Order_Id IN (?)`, [sideOrderIds]) : [[]],
      sideOrderIds.length ? connection.query(`
 SELECT 
  oi.Pre_Booked_Order_Id,
  oi.Quantity,
  oi.Amount,
  oi.Price,
  f.Item_Name
FROM pre_booked_order_items oi
JOIN add_food_item f ON f.Item_Id = oi.Item_Id
WHERE oi.Pre_Booked_Order_Id IN (?)`, [sideOrderIds]) : [[]],
dineOrderIds.length
      ? await connection.query(
          `
          SELECT
            ot.Order_Id,
            t.Table_Id,
            t.Table_Name
          FROM order_tables ot
          JOIN add_table t ON t.Table_Id = ot.Table_Id
          WHERE ot.Order_Id IN (?)
          `,
          [dineOrderIds]
        )
      : [[]],
    ]);

    /* ================= TABLES (DINE) ================= */
    // const [tables] = dineOrderIds.length
    //   ? await connection.query(
    //       `
    //       SELECT
    //         ot.Order_Id,
    //         t.Table_Id,
    //         t.Table_Name
    //       FROM order_tables ot
    //       JOIN add_table t ON t.Table_Id = ot.Table_Id
    //       WHERE ot.Order_Id IN (?)
    //       `,
    //       [dineOrderIds]
    //     )
    //   : [[]];

    /* ================= COUNTS ================= */
    // const [[dineCount]] = await connection.query(
    //   `SELECT COUNT(*) total FROM invoices WHERE DATE(created_at) = ?`,
    //   [date]
    // );
const [[dineCount]] = await connection.query(
`
SELECT COUNT(*) AS total FROM (

  SELECT Invoice_Id
  FROM invoices
  WHERE created_at BETWEEN ? AND ?
  ${dineSearch}

  UNION ALL

  SELECT inv.Pre_Book_Invoice_Id
  FROM pre_book_orders_invoices inv
  LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
  WHERE inv.Pre_Book_Invoice_Date BETWEEN ? AND ?
    AND EXISTS (
      SELECT 1
      FROM pre_booked_order_tables pbot
      WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
    )
  ${preBookSearch}

) x
`,
[
  startDate, endDate, ...params,
  startDate, endDate, ...params
]
);
    const [[rightCount]] = await connection.query(
`
SELECT COUNT(*) AS total FROM (

  SELECT Invoice_Id
  FROM takeaway_invoices
  WHERE created_at BETWEEN ? AND ?
  ${takeawaySearch}

  UNION ALL

  SELECT inv.Pre_Book_Invoice_Id
  FROM pre_book_orders_invoices inv
  LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
  WHERE inv.Pre_Book_Invoice_Date BETWEEN ? AND ?
    AND NOT EXISTS (
      SELECT 1
      FROM pre_booked_order_tables pbot
      WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
    )
  ${preBookSearch}

) x
`,
[
  startDate, endDate, ...params,
  startDate, endDate, ...params
]
);

    const totalInvoices = dineCount.total + rightCount.total;
    const totalPages = Math.max(
      Math.ceil(dineCount.total / limit),
      Math.ceil(rightCount.total / limit)
    );

    /* ================= FINAL MERGE ================= */

/* ================= FINAL MERGE ================= */
// const finalData = await Promise.all(
//   pagedInvoices.map(async (inv) => {

//     let orderItems = [];
//     let orderTables = [];
//     let orderType = inv.orderType;

//     if (inv.orderType === "dine") {
//       orderItems = items.filter(i => i.Order_Id === inv.Order_Id);
//       orderTables = tables.filter(t => t.Order_Id === inv.Order_Id);
//     }

//     else if (inv.orderType === "takeaway") {
//       orderItems = takeawayItems.filter(
//         i => i.Takeaway_Order_Id === inv.Order_Id
//       );
//     }

//     else { // pre-book
//       orderItems = preBookItems.filter(
//         i => i.Pre_Booked_Order_Id === inv.Order_Id
//       );

//       const pbTables = preBookTables.filter(
//         t => t.Pre_Booked_Order_Id === inv.Order_Id
//       );

//       orderTables = pbTables;

//       // If pre-book has tables → treat as dine
//       orderType = pbTables.length > 0 ? "dine" : "takeaway";
//     }

//     /* ================= KOT ELIGIBILITY ================= */
//     const kotResult = await checkDineInItemsElligibleForKOTPrint(
//       orderItems.map(i => ({
//         Item_Name: i.Item_Name,
//         Item_Quantity: i.Quantity || 1
//       }))
//     );

//     return {
//       invoice: inv,
//       order:
//         inv.orderType === "dine"
//           ? orders.find(o => o.Order_Id === inv.Order_Id) || null
//           : inv.orderType === "takeaway"
//           ? ordersTakeaway.find(o => o.Takeaway_Order_Id === inv.Order_Id) || null
//           : preBookOrders.find(o => o.Pre_Booked_Order_Id === inv.Order_Id) || null,

//       items: orderItems,
//       tables: orderTables,

//       // 🔥 THIS IS THE IMPORTANT PART
//       kitchens: kotResult.success ? kotResult.elligibleItems : {},

//       orderType,
//       originalOrderType: inv.orderType,
//     };
//   })
// );
const finalData = await Promise.all(
  pagedInvoices.map(async (inv) => {

    let orderItems = [];
    let orderTables = [];
    let orderType = inv.orderType;

    if (inv.orderType === "dine") {
      orderItems = items.filter(i => i.Order_Id === inv.Order_Id);
      orderTables = tables.filter(t => t.Order_Id === inv.Order_Id);
    } 
    else if (inv.orderType === "takeaway") {
      orderItems = takeawayItems.filter(
        i => i.Takeaway_Order_Id === inv.Order_Id
      );
    } 
    else {
      orderItems = preBookItems.filter(
        i => i.Pre_Booked_Order_Id === inv.Order_Id
      );

      const pbTables = preBookTables.filter(
        t => t.Pre_Booked_Order_Id === inv.Order_Id
      );

      orderTables = pbTables;
      orderType = pbTables.length > 0 ? "dine" : "takeaway";
    }

    /* ================= CALCULATE AMOUNTS ================= */

    // let serviceChargeAmount = 0;
    // let discountAmount = 0;                                                                                                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      const subTotal = orderItems.reduce(
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        (sum, item) => sum + Number(item.Amount || 0),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      );

let serviceChargeAmount = 0;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      let discountAmount = 0;

                                                                                                                                                                                                                                                                                                                                                                                                                                                                      if (inv.Service_Charge_Type === "percentage") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        serviceChargeAmount = (subTotal * Number(inv.Service_Charge || 0)) / 100;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        serviceChargeAmount = Number(inv.Service_Charge || 0);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                                                                                                                                                                                                                                      if (inv.Discount_Type === "percentage") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        discountAmount = (subTotal * Number(inv.Discount || 0)) / 100;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        discountAmount = Number(inv.Discount || 0);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      }
    // const subTotal = Number(inv.Amount || 0);

    // if (inv.Service_Charge_Type === "percentage") {
    //   serviceChargeAmount = (subTotal * Number(inv.Service_Charge || 0)) / 100;
    // } else {
    //   serviceChargeAmount = Number(inv.Service_Charge || 0);
    // }

    // if (inv.Discount_Type === "percentage") {
    //   discountAmount = (subTotal * Number(inv.Discount || 0)) / 100;
    // } else {
    //   discountAmount = Number(inv.Discount || 0);
    // }

    /* ================= KOT ================= */

    const kotResult = await checkDineInItemsElligibleForKOTPrint(
      orderItems.map(i => ({
        Item_Name: i.Item_Name,
        Item_Quantity: i.Quantity || 1
      }))
    );

    return {
      invoice: {
        ...inv,
        Service_Charge_Amount: serviceChargeAmount,
        Discount_Amount: discountAmount
      },

      order:
        inv.orderType === "dine"
          ? orders.find(o => o.Order_Id === inv.Order_Id) || null
          : inv.orderType === "takeaway"
          ? ordersTakeaway.find(o => o.Takeaway_Order_Id === inv.Order_Id) || null
          : preBookOrders.find(o => o.Pre_Booked_Order_Id === inv.Order_Id) || null,

      items: orderItems,
      tables: orderTables,

      kitchens: kotResult.success ? kotResult.elligibleItems : {},

      orderType,
      originalOrderType: inv.orderType,
    };
  })
);

    /* ================= RESPONSE ================= */
    return res.status(200).json({
      success: true,
      date,
      page,
      pageSize: limit,
      totalPages,
      totalInvoices,
      dineCount: dineCount.total,
      takeawayCount: rightCount.total,
      data: finalData,
    });

  } catch (err) {
    console.error("❌ Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


// const takeawayAddOrdersAndGenerateInvoices = async (req, res, next) => {
//   let connection;
// const stockDate = new Date()
//   .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
// // YYYY-MM-DD

//   try {
//     const {
//       userId,
//       items,
//       Sub_Total,
//       Final_Amount,          // ✅ FINAL AMOUNT FROM FRONTEND
//       Customer_Name,
//       Customer_Phone,
//       Discount_Type,
//       Discount,
//       Payment_Type,
//     } = req.body;

//     console.log("req.body", req.body);

//     // ---------------- VALIDATION ----------------
//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required." });
//     }

//     if (!items || !items.length) {
//       return res.status(400).json({ message: "At least one item is required." });
//     }

//     if (Sub_Total == null || Final_Amount == null) {
//       return res.status(400).json({
//         message: "Sub Total and Final Amount are required.",
//       });
//     }

//     const subTotal = Number(Sub_Total);
//     const finalAmount = Number(Final_Amount);
//     const discountValue = Number(Discount || 0);

//     if (Number.isNaN(subTotal) || Number.isNaN(finalAmount)) {
//       return res.status(400).json({ message: "Invalid amount values." });
//     }

//     if (finalAmount > subTotal) {
//       return res.status(400).json({
//         message: "Final amount cannot be greater than subtotal.",
//       });
//     }

//     if (finalAmount < 0) {
//       return res.status(400).json({
//         message: "Final amount cannot be negative.",
//       });
//     }

//     if (Discount_Type === "percentage" && discountValue > 100) {
//       return res.status(400).json({
//         message: "Discount percentage cannot exceed 100.",
//       });
//     }

//     const normalizedCustomerName =
//       Customer_Name && Customer_Name.trim() !== ""
//         ? Customer_Name.trim()
//         : null;

//     // ---------------- DB TRANSACTION ----------------
//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     // ---------------- CUSTOMER (OPTIONAL) ----------------
//     let Customer_Id = null;

//     // Only process customer if phone is provided
//     if (Customer_Phone && Customer_Phone.trim() !== "") {
//       const [existingCustomer] = await connection.query(
//         `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
//         [Customer_Phone]
//       );

//       if (existingCustomer.length > 0) {
//         Customer_Id = existingCustomer[0].Customer_Id;
//       } else {
//         Customer_Id = await generateNextId(
//           connection,
//           "CUST",
//           "Customer_Id",
//           "customers"
//         );

//         await connection.query(
//           `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
//            VALUES (?, ?, ?)`,
//           [Customer_Id, normalizedCustomerName, Customer_Phone]
//         );
//       }
//     }

//     // ---------------- ORDER ----------------
//     const Takeaway_Order_Id = await generateNextId(
//       connection,
//       "TKODR",
//       "Takeaway_Order_Id",
//       "orders_takeaway"
//     );

//     await connection.query(
//       `INSERT INTO orders_takeaway
//        (Takeaway_Order_Id, User_Id, Customer_Id, Status, Sub_Total, Amount, Payment_Status,Delivery_Status)
//        VALUES (?, ?, ?, 'completed', ?, ?, 'completed','pending')`,
//       [Takeaway_Order_Id, userId, Customer_Id, subTotal, finalAmount]
//     );

//     // ---------------- KOT ----------------
//     const KOT_Id = await generateNextId(
//       connection,
//       "KOT",
//       "KOT_Id",
//       "kitchen_orders"
//     );

//     await connection.query(
//       `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
//        VALUES (?, ?, 'ready')`,
//       [KOT_Id, Takeaway_Order_Id]
//     );

//     // ---------------- ITEMS ----------------
//     for (const item of items) {
//       if (!item.Item_Quantity || item.Item_Quantity <= 0) {
//         await connection.rollback();
//         return res.status(400).json({
//           message: `Invalid quantity for item: ${item.Item_Name}`,
//         });
//       }

//       const [itemRow] = await connection.query(
//         `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
//         [item.Item_Name]
//       );

//       if (!itemRow.length) {
//         await connection.rollback();
//         return res.status(404).json({ message: "Item not found." });
//       }

//       const Item_Id = itemRow[0].Item_Id;

//       const Order_Item_Id = await generateNextId(
//         connection,
//         "TKODRITM",
//         "Takeaway_Order_Item_Id",
//         "order_takeaway_items"
//       );

//       await connection.query(
//         `INSERT INTO order_takeaway_items
//          (Takeaway_Order_Item_Id, Takeaway_Order_Id, Item_Id, Quantity, Price, Amount)
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [
//           Order_Item_Id,
//           Takeaway_Order_Id,
//           Item_Id,
//           item.Item_Quantity,
//           item.Item_Price,
//           item.Amount,
//         ]
//       );

//       const KOT_Item_Id = await generateNextId(
//         connection,
//         "KOTITM",
//         "KOT_Item_Id",
//         "kitchen_order_items"
//       );

//       await connection.query(
//         `INSERT INTO kitchen_order_items
//          (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
//          VALUES (?, ?, ?, ?, ?, 'ready')`,
//         [
//           KOT_Item_Id,
//           KOT_Id,
//           Item_Id,
//           item.Item_Name,
//           item.Item_Quantity,
//         ]
//       );
//    // Ensure today's stock row exists
// /* ================= DAILY STOCK UPDATE ================= */

// // 1️⃣ Ensure today's stock row exists
// // await connection.query(
// //   `
// //   INSERT IGNORE INTO daily_food_stock
// //     (Item_Id, Stock_Date, Opening_Quantity, Added_Quantity, Sold_Quantity, Closing_Quantity)
// //   VALUES (?, ?, 0, 0, 0, 0)
// //   `,
// //   [Item_Id, stockDate]
// // );

// // // 2️⃣ Lock today's stock row
// // const [[stock]] = await connection.query(
// //   `
// //   SELECT id
// //   FROM daily_food_stock
// //   WHERE Item_Id = ?
// //     AND Stock_Date = ?
// //   FOR UPDATE
// //   `,
// //   [Item_Id, stockDate]
// // );

// // if (!stock) {
// //   await connection.rollback();
// //   return res.status(400).json({
// //     success: false,
// //     message: `Stock row missing for item ${item.Item_Name}`,
// //   });
// // }

// // // 3️⃣ Reduce stock (sale)
// // await connection.query(
// //   `
// //   UPDATE daily_food_stock
// //   SET
// //     Sold_Quantity = Sold_Quantity + ?,
// //     Closing_Quantity = Closing_Quantity - ?
// //   WHERE id = ?
// //   `,
// //   [
// //     item.Item_Quantity,
// //     item.Item_Quantity,
// //     stock.id,
// //   ]
// // );

// // /* ================= STOCK HISTORY (SALE) ================= */

// // await connection.query(
// //   `
// //   INSERT INTO food_stock_movements
// //     (Item_Id,  Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
// //   VALUES (?,  ?, 'TAKEAWAY', ?, ?, ?)
// //   `,
// //   [
// //     Item_Id,
    
// //     stockDate,
// //     item.Item_Quantity,
// //     Takeaway_Order_Id,
// //     userId,
// //   ]
// // );
// await connection.query(
//         `
//         INSERT INTO daily_food_stock
//           (Item_Id, Stock_Date,
//            Opening_Quantity, Added_Quantity,
//            Sold_Quantity, Closing_Quantity)
//         VALUES (?, ?, 0, 0, 0, 0)
//         ON DUPLICATE KEY UPDATE
//           Stock_Date = daily_food_stock.Stock_Date
//         `,
//         [Item_Id, stockDate]
//       );

//       // 2️⃣ Update sold quantity
//       await connection.query(
//         `
//         UPDATE daily_food_stock
//         SET
//           Sold_Quantity = Sold_Quantity + ?,
//           Closing_Quantity = Closing_Quantity - ?
//         WHERE Item_Id = ?
//           AND Stock_Date = ?
//         `,
//         [
//           item.Item_Quantity,
//           item.Item_Quantity,
//           Item_Id,
//           stockDate,
//         ]
//       );

//       // 3️⃣ Movement entry
//       await connection.query(
//         `
//         INSERT INTO food_stock_movements
//           (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
//         VALUES (?, ?, 'TAKEAWAY', ?, ?, ?)
//         `,
//         [
//           Item_Id,
//           stockDate,
//           item.Item_Quantity,
//           Takeaway_Order_Id,
//           userId,
//         ]
//       )

//     }

//     // ---------------- INVOICE ----------------
//     const Invoice_Id = await generateNextId(
//       connection,
//       "TKINV",
//       "Invoice_Id",
//       "takeaway_invoices"
//     );

//     const [fy] = await connection.query(
//       `SELECT Financial_Year
//        FROM financial_year
//        WHERE Current_Financial_Year = 1
//        LIMIT 1`
//     );

//     if (!fy.length) {
//       await connection.rollback();
//       return res.status(400).json({ message: "No active financial year found." });
//     }

//     const activeFY = fy[0].Financial_Year;

//     await connection.query(
//       `INSERT INTO takeaway_invoices
//        (Invoice_Id, Takeaway_Order_Id, Invoice_Date, Financial_Year, Amount,
//         Customer_Name, Customer_Phone, Customer_Id, Discount_Type, Discount, Payment_Type)
//        VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         Invoice_Id,
//         Takeaway_Order_Id,
//         activeFY,
//         finalAmount,                // ✅ TRUST FRONTEND FINAL AMOUNT
//         normalizedCustomerName,
//         Customer_Phone || null,
//         Customer_Id,
//         Discount_Type ?? "percentage",
//         discountValue,
//         Payment_Type ?? "Cash",
//       ]
//     );

//     await connection.commit();

//     // ---------------- RESPONSE ----------------
//     return res.status(200).json({
//       success: true,
//       message: "Order completed successfully.",
//       invoice: {
//         Invoice_Id,
//         Invoice_Number: Invoice_Id,
//         Takeaway_Order_Id,
//         Customer_Name: normalizedCustomerName,
//         Customer_Phone,
//         Sub_Total: subTotal,
//         Discount: discountValue,
//         Discount_Type,
//         Final_Amount: finalAmount,
//         Payment_Type,
//         Invoice_Date: new Date(),
//         Financial_Year: activeFY,
//         Order_Type: "takeaway",
//       },
//       items,
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

const totalInvoicesEachDay = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    const year = Number(req.query.year);
    const month = Number(req.query.month);

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month are required",
      });
    }

    /* =====================================================
       1️⃣ NORMAL DINE-IN (NOT PRE-BOOK)
       invoices table ONLY
    ===================================================== */
    const [dineInInvoices] = await connection.query(
      `
      SELECT
        DATE_FORMAT(Invoice_Date,'%Y-%m-%d') AS date,
        COUNT(DISTINCT Invoice_Id) AS total_dinein_invoices
      FROM invoices
      WHERE 
         YEAR(Invoice_Date) = ?
        AND MONTH(Invoice_Date) = ?
      GROUP BY DATE(Invoice_Date)
      ORDER BY DATE(Invoice_Date)
      `,
      [year, month]
    );

    /* =====================================================
       2️⃣ NORMAL TAKEAWAY
    ===================================================== */
    const [takeawayInvoices] = await connection.query(
      `
      SELECT
        DATE_FORMAT(ti.Invoice_Date,'%Y-%m-%d') AS date,
        COUNT(DISTINCT ti.Invoice_Id) AS total_takeaway_invoices
      FROM takeaway_invoices ti
      JOIN orders_takeaway ot
        ON ti.Takeaway_Order_Id = ot.Takeaway_Order_Id
      WHERE ot.Status <> 'cancelled'
        AND YEAR(ti.Invoice_Date) = ?
        AND MONTH(ti.Invoice_Date) = ?
      GROUP BY DATE(ti.Invoice_Date)
      ORDER BY DATE(ti.Invoice_Date)
      `,
      [year, month]
    );

    /* =====================================================
       3️⃣ PRE-BOOK DINE-IN (HAS TABLE)
       DISTINCT is CRITICAL
    ===================================================== */
    const [preBookDineInInvoices] = await connection.query(
      `
      SELECT
        DATE_FORMAT(pbi.Pre_Book_Invoice_Date,'%Y-%m-%d') AS date,
        COUNT(DISTINCT pbi.Pre_Book_Invoice_Id) AS total_pre_book_dinein_invoices
      FROM pre_book_orders_invoices pbi
      JOIN pre_booked_order_tables pbot
        ON pbi.Pre_Book_Order_Id = pbot.Pre_Booked_Order_Id
      WHERE pbot.Pre_Booked_Order_Table_Id IS NOT NULL
        AND YEAR(pbi.Pre_Book_Invoice_Date) = ?
        AND MONTH(pbi.Pre_Book_Invoice_Date) = ?
      GROUP BY DATE(pbi.Pre_Book_Invoice_Date)
      ORDER BY DATE(pbi.Pre_Book_Invoice_Date)
      `,
      [year, month]
    );

    /* =====================================================
       4️⃣ PRE-BOOK TAKEAWAY (NO TABLE)
    ===================================================== */
    const [preBookTakeawayInvoices] = await connection.query(
      `
      SELECT
        DATE_FORMAT(pbi.Pre_Book_Invoice_Date,'%Y-%m-%d') AS date,
        COUNT(DISTINCT pbi.Pre_Book_Invoice_Id) AS total_pre_book_takeaway_invoices
      FROM pre_book_orders_invoices pbi
      LEFT JOIN pre_booked_order_tables pbot
        ON pbi.Pre_Book_Order_Id = pbot.Pre_Booked_Order_Id
      WHERE pbot.Pre_Booked_Order_Table_Id IS NULL
        AND YEAR(pbi.Pre_Book_Invoice_Date) = ?
        AND MONTH(pbi.Pre_Book_Invoice_Date) = ?
      GROUP BY DATE(pbi.Pre_Book_Invoice_Date)
      ORDER BY DATE(pbi.Pre_Book_Invoice_Date)
      `,
      [year, month]
    );

    /* =====================================================
       5️⃣ TOTAL SALES — SUM EACH INVOICE ONCE
    ===================================================== */
    const [totalSalesEachDay] = await connection.query(
      `
      SELECT
        date,
        SUM(amount) AS total_sales
      FROM (

        /* NORMAL DINE-IN */
        SELECT
          DATE_FORMAT(Invoice_Date,'%Y-%m-%d') AS date,
          SUM(Amount) AS amount
        FROM invoices
        WHERE 
         YEAR(Invoice_Date) = ?
          AND MONTH(Invoice_Date) = ?
        GROUP BY DATE(Invoice_Date)

        UNION ALL

        /* NORMAL TAKEAWAY */
        SELECT
          DATE_FORMAT(Invoice_Date,'%Y-%m-%d') AS date,
          SUM(Amount) AS amount
        FROM takeaway_invoices
        WHERE YEAR(Invoice_Date) = ?
          AND MONTH(Invoice_Date) = ?
        GROUP BY DATE(Invoice_Date)

        UNION ALL

        /* PRE-BOOK (ALL — counted ONCE per invoice) */
        SELECT
          DATE_FORMAT(Pre_Book_Invoice_Date,'%Y-%m-%d') AS date,
          SUM(Amount) AS amount
        FROM pre_book_orders_invoices
        WHERE YEAR(Pre_Book_Invoice_Date) = ?
          AND MONTH(Pre_Book_Invoice_Date) = ?
        GROUP BY DATE(Pre_Book_Invoice_Date)

      ) x
      GROUP BY date
      ORDER BY date
      `,
      [year, month, year, month, year, month]
    );

    return res.status(200).json({
      success: true,
      year,
      month,
      dineInInvoices,
      takeawayInvoices,
      preBookDineInInvoices,
      preBookTakeawayInvoices,
      totalSalesEachDay,
    });

  } catch (err) {
    console.error("❌ Error fetching invoice data:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
// NEW NO DUPLICATE IDS PROBLEM
const takeawayAddOrdersAndGenerateInvoices = async (req, res, next) => {
  let connection;
const stockDate = new Date()
  .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
// YYYY-MM-DD

  try {
    
    const {
      userId,
      items,
      Sub_Total,
      Final_Amount,          // ✅ FINAL AMOUNT FROM FRONTEND
      Customer_Name,
      Customer_Phone,
      Discount_Type,
      Discount,
      Payment_Type,
    } = req.body;

    console.log("req.body", req.body);

    // ---------------- VALIDATION ----------------
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    if (!items || !items.length) {
      return res.status(400).json({ message: "At least one item is required." });
    }

    if (Sub_Total == null || Final_Amount == null) {
      return res.status(400).json({
        message: "Sub Total and Final Amount are required.",
      });
    }

    const subTotal = Number(Sub_Total);
    const finalAmount = Number(Final_Amount);
    const discountValue = Number(Discount || 0);

    if (Number.isNaN(subTotal) || Number.isNaN(finalAmount)) {
      return res.status(400).json({ message: "Invalid amount values." });
    }

    if (finalAmount > subTotal) {
      return res.status(400).json({
        message: "Final amount cannot be greater than subtotal.",
      });
    }

    if (finalAmount < 0) {
      return res.status(400).json({
        message: "Final amount cannot be negative.",
      });
    }

    if (Discount_Type === "percentage" && discountValue > 100) {
      return res.status(400).json({
        message: "Discount percentage cannot exceed 100.",
      });
    }

    const normalizedCustomerName =
      Customer_Name && Customer_Name.trim() !== ""
        ? Customer_Name.trim()
        : null;

    // ---------------- DB TRANSACTION ----------------
    connection = await db.getConnection();
    await connection.beginTransaction();

    // ---------------- CUSTOMER (OPTIONAL) ----------------
    let Customer_Id = null;

    // Only process customer if phone is provided
    if (Customer_Phone && Customer_Phone.trim() !== "") {
      const [existingCustomer] = await connection.execute(
        `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
        [Customer_Phone]
      );

      if (existingCustomer.length > 0) {
        Customer_Id = existingCustomer[0].Customer_Id;
      } else {
        // Customer_Id = await generateNextId(
        //   connection,
        //   "CUST",
        //   "Customer_Id",
        //   "customers"
        // );

        // await connection.execute(
        //   `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
        //    VALUES (?, ?, ?)`,
        //   [Customer_Id, normalizedCustomerName, Customer_Phone]
        // );
          const [custRes] = await connection.execute(
          `INSERT INTO customers (Customer_Name, Customer_Phone)
           VALUES (?, ?)`,
          [Customer_Name?.trim() || null, Customer_Phone]
        );

        const id = custRes.insertId;
        Customer_Id = "CUST" + id.toString().padStart(5, "0");

        // ✅ UPDATE WITH FORMATTED ID
        await connection.execute(
          `UPDATE customers SET Customer_Id = ? WHERE id = ?`,
          [Customer_Id, id]
        );
      }
    }

    // ---------------- ORDER ----------------
    // const Takeaway_Order_Id = await generateNextId(
    //   connection,
    //   "TKODR",
    //   "Takeaway_Order_Id",
    //   "orders_takeaway"
    // );

    // await connection.execute(
    //   `INSERT INTO orders_takeaway
    //    (Takeaway_Order_Id, User_Id, Customer_Id, Status, Sub_Total, Amount, Payment_Status,Delivery_Status)
    //    VALUES (?, ?, ?, 'completed', ?, ?, 'completed','pending')`,
    //   [Takeaway_Order_Id, userId, Customer_Id, subTotal, finalAmount]
    // );

        
          //Takeaway_Order_Id = await generateNextId(connection, "TKODR", "Takeaway_Order_Id", "orders_takeaway");

         const[takeawayResult]= await connection.execute(
            `INSERT INTO orders_takeaway
             ( User_Id, Customer_Id, Status, Sub_Total, Amount, Payment_Status,Delivery_Status)
             VALUES ( ?, ?, 'completed', ?, ?, 'completed','pending')`,
            [ userId, Customer_Id, subTotal, finalAmount]
          );
          const takeawayNum=takeawayResult.insertId
          const Takeaway_Order_Id="TKODR" + takeawayNum.toString().padStart(5,"0")
            await connection.execute(
              `UPDATE 
              orders_takeaway SET Takeaway_Order_Id = ? WHERE id = ?`, 
              [Takeaway_Order_Id, takeawayNum]
            );
          
        


    // ---------------- KOT ----------------
    // const KOT_Id = await generateNextId(
    //   connection,
    //   "KOT",
    //   "KOT_Id",
    //   "kitchen_orders"
    // );

    // await connection.execute(
    //   `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
    //    VALUES (?, ?, 'ready')`,
    //   [KOT_Id, Takeaway_Order_Id]
    // );
     
          //KOT_Id = await generateNextId(connection, "KOT", "KOT_Id", "kitchen_orders");

         const [kotResult]= await connection.execute(
            `INSERT INTO kitchen_orders ( Order_Id, Status)
             VALUES (?, 'ready')`,
            [Takeaway_Order_Id]
          );
          const kotNum=kotResult.insertId
          const KOT_Id="KOT" + kotNum.toString().padStart(5,"0")
            await connection.execute(`UPDATE kitchen_orders SET KOT_Id = ? WHERE id = ?`, 
              [KOT_Id, kotNum]);
          
        
      

    // ---------------- ITEMS ----------------
    for (const item of items) {
      // if (!item.Item_Quantity || item.Item_Quantity <= 0) {
      //   await connection.rollback();
      //   return res.status(400).json({
      //     message: `Invalid quantity for item: ${item.Item_Name}`,
      //   });
      // }
      if (!item.Item_Quantity || item.Item_Quantity <= 0) {
        throw new Error(`Invalid quantity for item: ${item.Item_Name}`);
      }
      const [itemRow] = await connection.execute(
        `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
        [item.Item_Name]
      );
      if (!itemRow.length) {
       throw new Error(`Item not found: ${item.Item_Name}`);
        }
      // if (!itemRow.length) {
      //   await connection.rollback();
      //   return res.status(404).json({ message: "Item not found." });
      // }

      const Item_Id = itemRow[0].Item_Id;

      // const Order_Item_Id = await generateNextId(
      //   connection,
      //   "TKODRITM",
      //   "Takeaway_Order_Item_Id",
      //   "order_takeaway_items"
      // );

      // await connection.execute(
      //   `INSERT INTO order_takeaway_items
      //    (Takeaway_Order_Item_Id, Takeaway_Order_Id, Item_Id, Quantity, Price, Amount)
      //    VALUES (?, ?, ?, ?, ?, ?)`,
      //   [
      //     Order_Item_Id,
      //     Takeaway_Order_Id,
      //     Item_Id,
      //     item.Item_Quantity,
      //     item.Item_Price,
      //     item.Amount,
      //   ]
      // );
        // let Order_Item_Id;
        // for (let i = 0; i < 3; i++) {
        //   try {
        //     //Order_Item_Id = await generateNextId(connection, "TKODRITM", "Takeaway_Order_Item_Id", "order_takeaway_items");

        //     await connection.execute(
        //       `INSERT INTO order_takeaway_items
        //        (Takeaway_Order_Item_Id, Takeaway_Order_Id, Item_Id, Quantity, Price, Amount)
        //        VALUES (?, ?, ?, ?, ?, ?)`,
        //       [Order_Item_Id, Takeaway_Order_Id, Item_Id, item.Item_Quantity, item.Item_Price, item.Amount]
        //     );
        //     break;
        //   } catch (err) {
        //     if (err.code === "ER_DUP_ENTRY" && i < 2) continue;
        //     throw err;
        //   }
        // }
        // ✅ INSERT FIRST
const [orderItemRes] = await connection.execute(
  `INSERT INTO order_takeaway_items
   (Takeaway_Order_Id, Item_Id, Quantity, Price, Amount)
   VALUES (?, ?, ?, ?, ?)`,
  [
    Takeaway_Order_Id,
    Item_Id,
    item.Item_Quantity,
    item.Item_Price,
    item.Amount,
  ]
);

// ✅ generate ID
const orderItemId = orderItemRes.insertId;
const Order_Item_Id =
  "TKODRITM" + orderItemId.toString().padStart(5, "0");

// ✅ update
await connection.execute(
  `UPDATE order_takeaway_items 
   SET Takeaway_Order_Item_Id = ? 
   WHERE id = ?`,
  [Order_Item_Id, orderItemId]
);
      // const KOT_Item_Id = await generateNextId(
      //   connection,
      //   "KOTITM",
      //   "KOT_Item_Id",
      //   "kitchen_order_items"
      // );

      // await connection.execute(
      //   `INSERT INTO kitchen_order_items
      //    (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
      //    VALUES (?, ?, ?, ?, ?, 'ready')`,
      //   [
      //     KOT_Item_Id,
      //     KOT_Id,
      //     Item_Id,
      //     item.Item_Name,
      //     item.Item_Quantity,
      //   ]
      // );

        //   let KOT_Item_Id;
        // for (let i = 0; i < 3; i++) {
        //   try {
        //     KOT_Item_Id = await generateNextId(connection, "KOTITM", "KOT_Item_Id", "kitchen_order_items");

        //     await connection.execute(
        //       `INSERT INTO kitchen_order_items
        //        (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
        //        VALUES (?, ?, ?, ?, ?, 'ready')`,
        //       [KOT_Item_Id, KOT_Id, Item_Id, item.Item_Name, item.Item_Quantity]
        //     );
        //     break;
        //   } catch (err) {
        //     if (err.code === "ER_DUP_ENTRY" && i < 2) continue;
        //     throw err;
        //   }
        // }
        // ✅ INSERT FIRST
const [kotRes] = await connection.execute(
  `INSERT INTO kitchen_order_items
   (KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
   VALUES (?, ?, ?, ?, 'ready')`,
  [KOT_Id, Item_Id, item.Item_Name, item.Item_Quantity]
);

// ✅ generate ID
const kotId = kotRes.insertId;
const KOT_Item_Id = "KOTITM" + kotId.toString().padStart(5, "0");

// ✅ update
await connection.execute(
  `UPDATE kitchen_order_items SET KOT_Item_Id = ? WHERE id = ?`,
  [KOT_Item_Id, kotId]
);
   // Ensure today's stock row exists
/* ================= DAILY STOCK UPDATE ================= */

// 1️⃣ Ensure today's stock row exists
// await connection.execute(
//   `
//   INSERT IGNORE INTO daily_food_stock
//     (Item_Id, Stock_Date, Opening_Quantity, Added_Quantity, Sold_Quantity, Closing_Quantity)
//   VALUES (?, ?, 0, 0, 0, 0)
//   `,
//   [Item_Id, stockDate]
// );

// // 2️⃣ Lock today's stock row
// const [[stock]] = await connection.execute(
//   `
//   SELECT id
//   FROM daily_food_stock
//   WHERE Item_Id = ?
//     AND Stock_Date = ?
//   FOR UPDATE
//   `,
//   [Item_Id, stockDate]
// );

// if (!stock) {
//   await connection.rollback();
//   return res.status(400).json({
//     success: false,
//     message: `Stock row missing for item ${item.Item_Name}`,
//   });
// }

// // 3️⃣ Reduce stock (sale)
// await connection.execute(
//   `
//   UPDATE daily_food_stock
//   SET
//     Sold_Quantity = Sold_Quantity + ?,
//     Closing_Quantity = Closing_Quantity - ?
//   WHERE id = ?
//   `,
//   [
//     item.Item_Quantity,
//     item.Item_Quantity,
//     stock.id,
//   ]
// );

// /* ================= STOCK HISTORY (SALE) ================= */

// await connection.execute(
//   `
//   INSERT INTO food_stock_movements
//     (Item_Id,  Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
//   VALUES (?,  ?, 'TAKEAWAY', ?, ?, ?)
//   `,
//   [
//     Item_Id,
    
//     stockDate,
//     item.Item_Quantity,
//     Takeaway_Order_Id,
//     userId,
//   ]
// );
await connection.execute(
        `
        INSERT INTO daily_food_stock
          (Item_Id, Stock_Date,
           Opening_Quantity, Added_Quantity,
           Sold_Quantity, Closing_Quantity)
        VALUES (?, ?, 0, 0, 0, 0)
        ON DUPLICATE KEY UPDATE
          Stock_Date = daily_food_stock.Stock_Date
        `,
        [Item_Id, stockDate]
      );

      // 2️⃣ Update sold quantity
      await connection.execute(
        `
        UPDATE daily_food_stock
        SET
          Sold_Quantity = Sold_Quantity + ?,
          Closing_Quantity = Closing_Quantity - ?
        WHERE Item_Id = ?
          AND Stock_Date = ?
        `,
        [
          item.Item_Quantity,
          item.Item_Quantity,
          Item_Id,
          stockDate,
        ]
      );

      // 3️⃣ Movement entry
      await connection.execute(
        `
        INSERT INTO food_stock_movements
          (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
        VALUES (?, ?, 'TAKEAWAY', ?, ?, ?)
        `,
        [
          Item_Id,
          stockDate,
          item.Item_Quantity,
          Takeaway_Order_Id,
          userId,
        ]
      )

    }

    // ---------------- INVOICE ----------------
    // const Invoice_Id = await generateNextId(
    //   connection,
    //   "TKINV",
    //   "Invoice_Id",
    //   "takeaway_invoices"
    // );

    // const [fy] = await connection.execute(
    //   `SELECT Financial_Year
    //    FROM financial_year
    //    WHERE Current_Financial_Year = 1
    //    LIMIT 1`
    // );

    // if (!fy.length) {
    //   await connection.rollback();
    //   return res.status(400).json({ message: "No active financial year found." });
    // }

    // const activeFY = fy[0].Financial_Year;

    // await connection.execute(
    //   `INSERT INTO takeaway_invoices
    //    (Invoice_Id, Takeaway_Order_Id, Invoice_Date, Financial_Year, Amount,
    //     Customer_Name, Customer_Phone, Customer_Id, Discount_Type, Discount, Payment_Type)
    //    VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`,
    //   [
    //     Invoice_Id,
    //     Takeaway_Order_Id,
    //     activeFY,
    //     finalAmount,                // ✅ TRUST FRONTEND FINAL AMOUNT
    //     normalizedCustomerName,
    //     Customer_Phone || null,
    //     Customer_Id,
    //     Discount_Type ?? "percentage",
    //     discountValue,
    //     Payment_Type ?? "Cash",
    //   ]
    // );
    const [fy] = await connection.execute(
  `SELECT Financial_Year
   FROM financial_year
   WHERE Current_Financial_Year = 1
   LIMIT 1`
);

if (!fy.length) {
  return res.status(400).json({ message: "No active financial year found." });
}

const activeFY = fy[0].Financial_Year;

// 🔁 NOW RETRY LOOP
// let Invoice_Id;

// for (let i = 0; i < 3; i++) {
//   try {
//     Invoice_Id = await generateNextId(
//       connection,
//       "TKINV",
//       "Invoice_Id",
//       "takeaway_invoices"
//     );

//     await connection.execute(
//       `INSERT INTO takeaway_invoices
//        (Invoice_Id, Takeaway_Order_Id, Invoice_Date, Financial_Year, Amount,
//         Customer_Name, Customer_Phone, Customer_Id, Discount_Type, Discount, Payment_Type)
//        VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         Invoice_Id,
//         Takeaway_Order_Id,
//         activeFY, // ✅ NOW DEFINED
//         finalAmount,
//         normalizedCustomerName,
//         Customer_Phone || null,
//         Customer_Id,
//         Discount_Type ?? "percentage",
//         discountValue,
//         Payment_Type ?? "Cash",
//       ]
//     );

//     break;

//   } catch (err) {
//     if (err.code === "ER_DUP_ENTRY" && i < 2) continue;
//     throw err;
//   }
// }
// ✅ INSERT FIRST
const [invoiceRes] = await connection.execute(
  `INSERT INTO takeaway_invoices
   (Takeaway_Order_Id, Invoice_Date, Financial_Year, Amount,
    Customer_Name, Customer_Phone, Customer_Id,
    Discount_Type, Discount, Payment_Type)
   VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    Takeaway_Order_Id,
    activeFY,
    finalAmount,
    normalizedCustomerName,
    Customer_Phone || null,
    Customer_Id,
    Discount_Type ?? "percentage",
    discountValue,
    Payment_Type ?? "Cash",
  ]
);

// ✅ generate ID
const invoiceNum = invoiceRes.insertId;
const Invoice_Id = "TKINV" + invoiceNum.toString().padStart(5, "0");

// ✅ update
await connection.execute(
  `UPDATE takeaway_invoices SET Invoice_Id = ? WHERE id = ?`,
  [Invoice_Id, invoiceNum]
);
    await connection.commit();

    // ---------------- RESPONSE ----------------
    return res.status(200).json({
      success: true,
      message: "Order completed successfully.",
      invoice: {
        Invoice_Id,
        Invoice_Number: Invoice_Id,
        Takeaway_Order_Id,
        Customer_Name: normalizedCustomerName,
        Customer_Phone,
        Sub_Total: subTotal,
        Discount: discountValue,
        Discount_Type,
        Final_Amount: finalAmount,
        Payment_Type,
        Invoice_Date: new Date(),
        Financial_Year: activeFY,
        Order_Type: "takeaway",
      },
      items,
    });

  }
   catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error:", err);
    next(err);
  } 
// catch (err) {
//   if (connection) await connection.rollback();

//   // ❌ Ignore retry errors silently
//   if (
//     err.code === "ER_LOCK_DEADLOCK" ||
//     err.code === "ER_DUP_ENTRY"
//   ) {
//     return res.status(200).json({
//       success: true,
//       message: "Order processed successfully",
//     });
//   }

//   // ✅ Log real errors (stderr)
//   console.error("❌ Final Error:", err);

//   // ✅ Still return success (your requirement)
//   return res.status(200).json({
//     success: true,
//     message: "Processing... please wait",
//   });
// }
  
  finally {
    if (connection) connection.release();
  }
};
//OLD PROBLEMATIC 
// const takeawayAddOrdersAndGenerateInvoices = async (req, res, next) => {
//   let connection;
// const stockDate = new Date()
//   .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
// // YYYY-MM-DD

//   try {
    
//     const {
//       userId,
//       items,
//       Sub_Total,
//       Final_Amount,          // ✅ FINAL AMOUNT FROM FRONTEND
//       Customer_Name,
//       Customer_Phone,
//       Discount_Type,
//       Discount,
//       Payment_Type,
//     } = req.body;

//     console.log("req.body", req.body);

//     // ---------------- VALIDATION ----------------
//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required." });
//     }

//     if (!items || !items.length) {
//       return res.status(400).json({ message: "At least one item is required." });
//     }

//     if (Sub_Total == null || Final_Amount == null) {
//       return res.status(400).json({
//         message: "Sub Total and Final Amount are required.",
//       });
//     }

//     const subTotal = Number(Sub_Total);
//     const finalAmount = Number(Final_Amount);
//     const discountValue = Number(Discount || 0);

//     if (Number.isNaN(subTotal) || Number.isNaN(finalAmount)) {
//       return res.status(400).json({ message: "Invalid amount values." });
//     }

//     if (finalAmount > subTotal) {
//       return res.status(400).json({
//         message: "Final amount cannot be greater than subtotal.",
//       });
//     }

//     if (finalAmount < 0) {
//       return res.status(400).json({
//         message: "Final amount cannot be negative.",
//       });
//     }

//     if (Discount_Type === "percentage" && discountValue > 100) {
//       return res.status(400).json({
//         message: "Discount percentage cannot exceed 100.",
//       });
//     }

//     const normalizedCustomerName =
//       Customer_Name && Customer_Name.trim() !== ""
//         ? Customer_Name.trim()
//         : null;

//     // ---------------- DB TRANSACTION ----------------
//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     // ---------------- CUSTOMER (OPTIONAL) ----------------
//     let Customer_Id = null;

//     // Only process customer if phone is provided
//     if (Customer_Phone && Customer_Phone.trim() !== "") {
//       const [existingCustomer] = await connection.execute(
//         `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
//         [Customer_Phone]
//       );

//       if (existingCustomer.length > 0) {
//         Customer_Id = existingCustomer[0].Customer_Id;
//       } else {
//         Customer_Id = await generateNextId(
//           connection,
//           "CUST",
//           "Customer_Id",
//           "customers"
//         );

//         await connection.execute(
//           `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
//            VALUES (?, ?, ?)`,
//           [Customer_Id, normalizedCustomerName, Customer_Phone]
//         );
//       }
//     }

//     // ---------------- ORDER ----------------
//     // const Takeaway_Order_Id = await generateNextId(
//     //   connection,
//     //   "TKODR",
//     //   "Takeaway_Order_Id",
//     //   "orders_takeaway"
//     // );

//     // await connection.execute(
//     //   `INSERT INTO orders_takeaway
//     //    (Takeaway_Order_Id, User_Id, Customer_Id, Status, Sub_Total, Amount, Payment_Status,Delivery_Status)
//     //    VALUES (?, ?, ?, 'completed', ?, ?, 'completed','pending')`,
//     //   [Takeaway_Order_Id, userId, Customer_Id, subTotal, finalAmount]
//     // );

//          let Takeaway_Order_Id;
//       for (let i = 0; i < 3; i++) {
//         try {
//           Takeaway_Order_Id = await generateNextId(connection, "TKODR", "Takeaway_Order_Id", "orders_takeaway");

//           await connection.execute(
//             `INSERT INTO orders_takeaway
//              (Takeaway_Order_Id, User_Id, Customer_Id, Status, Sub_Total, Amount, Payment_Status,Delivery_Status)
//              VALUES (?, ?, ?, 'completed', ?, ?, 'completed','pending')`,
//             [Takeaway_Order_Id, userId, Customer_Id, subTotal, finalAmount]
//           );
//           break;
//         } catch (err) {
//           if (err.code === "ER_DUP_ENTRY" && i < 2) continue;
//           throw err;
//         }
//       }


//     // ---------------- KOT ----------------
//     // const KOT_Id = await generateNextId(
//     //   connection,
//     //   "KOT",
//     //   "KOT_Id",
//     //   "kitchen_orders"
//     // );

//     // await connection.execute(
//     //   `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
//     //    VALUES (?, ?, 'ready')`,
//     //   [KOT_Id, Takeaway_Order_Id]
//     // );
//      let KOT_Id;
//       for (let i = 0; i < 3; i++) {
//         try {
//           KOT_Id = await generateNextId(connection, "KOT", "KOT_Id", "kitchen_orders");

//           await connection.execute(
//             `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
//              VALUES (?, ?, 'ready')`,
//             [KOT_Id, Takeaway_Order_Id]
//           );
//           break;
//         } catch (err) {
//           if (err.code === "ER_DUP_ENTRY" && i < 2) continue;
//           throw err;
//         }
//       }

//     // ---------------- ITEMS ----------------
//     for (const item of items) {
//       // if (!item.Item_Quantity || item.Item_Quantity <= 0) {
//       //   await connection.rollback();
//       //   return res.status(400).json({
//       //     message: `Invalid quantity for item: ${item.Item_Name}`,
//       //   });
//       // }
//       if (!item.Item_Quantity || item.Item_Quantity <= 0) {
//         throw new Error(`Invalid quantity for item: ${item.Item_Name}`);
//       }
//       const [itemRow] = await connection.execute(
//         `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
//         [item.Item_Name]
//       );
//       if (!itemRow.length) {
//        throw new Error(`Item not found: ${item.Item_Name}`);
//         }
//       // if (!itemRow.length) {
//       //   await connection.rollback();
//       //   return res.status(404).json({ message: "Item not found." });
//       // }

//       const Item_Id = itemRow[0].Item_Id;

//       // const Order_Item_Id = await generateNextId(
//       //   connection,
//       //   "TKODRITM",
//       //   "Takeaway_Order_Item_Id",
//       //   "order_takeaway_items"
//       // );

//       // await connection.execute(
//       //   `INSERT INTO order_takeaway_items
//       //    (Takeaway_Order_Item_Id, Takeaway_Order_Id, Item_Id, Quantity, Price, Amount)
//       //    VALUES (?, ?, ?, ?, ?, ?)`,
//       //   [
//       //     Order_Item_Id,
//       //     Takeaway_Order_Id,
//       //     Item_Id,
//       //     item.Item_Quantity,
//       //     item.Item_Price,
//       //     item.Amount,
//       //   ]
//       // );
//         let Order_Item_Id;
//         for (let i = 0; i < 3; i++) {
//           try {
//             Order_Item_Id = await generateNextId(connection, "TKODRITM", "Takeaway_Order_Item_Id", "order_takeaway_items");

//             await connection.execute(
//               `INSERT INTO order_takeaway_items
//                (Takeaway_Order_Item_Id, Takeaway_Order_Id, Item_Id, Quantity, Price, Amount)
//                VALUES (?, ?, ?, ?, ?, ?)`,
//               [Order_Item_Id, Takeaway_Order_Id, Item_Id, item.Item_Quantity, item.Item_Price, item.Amount]
//             );
//             break;
//           } catch (err) {
//             if (err.code === "ER_DUP_ENTRY" && i < 2) continue;
//             throw err;
//           }
//         }
//       // const KOT_Item_Id = await generateNextId(
//       //   connection,
//       //   "KOTITM",
//       //   "KOT_Item_Id",
//       //   "kitchen_order_items"
//       // );

//       // await connection.execute(
//       //   `INSERT INTO kitchen_order_items
//       //    (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
//       //    VALUES (?, ?, ?, ?, ?, 'ready')`,
//       //   [
//       //     KOT_Item_Id,
//       //     KOT_Id,
//       //     Item_Id,
//       //     item.Item_Name,
//       //     item.Item_Quantity,
//       //   ]
//       // );

//           let KOT_Item_Id;
//         for (let i = 0; i < 3; i++) {
//           try {
//             KOT_Item_Id = await generateNextId(connection, "KOTITM", "KOT_Item_Id", "kitchen_order_items");

//             await connection.execute(
//               `INSERT INTO kitchen_order_items
//                (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
//                VALUES (?, ?, ?, ?, ?, 'ready')`,
//               [KOT_Item_Id, KOT_Id, Item_Id, item.Item_Name, item.Item_Quantity]
//             );
//             break;
//           } catch (err) {
//             if (err.code === "ER_DUP_ENTRY" && i < 2) continue;
//             throw err;
//           }
//         }
//    // Ensure today's stock row exists
// /* ================= DAILY STOCK UPDATE ================= */

// // 1️⃣ Ensure today's stock row exists
// // await connection.execute(
// //   `
// //   INSERT IGNORE INTO daily_food_stock
// //     (Item_Id, Stock_Date, Opening_Quantity, Added_Quantity, Sold_Quantity, Closing_Quantity)
// //   VALUES (?, ?, 0, 0, 0, 0)
// //   `,
// //   [Item_Id, stockDate]
// // );

// // // 2️⃣ Lock today's stock row
// // const [[stock]] = await connection.execute(
// //   `
// //   SELECT id
// //   FROM daily_food_stock
// //   WHERE Item_Id = ?
// //     AND Stock_Date = ?
// //   FOR UPDATE
// //   `,
// //   [Item_Id, stockDate]
// // );

// // if (!stock) {
// //   await connection.rollback();
// //   return res.status(400).json({
// //     success: false,
// //     message: `Stock row missing for item ${item.Item_Name}`,
// //   });
// // }

// // // 3️⃣ Reduce stock (sale)
// // await connection.execute(
// //   `
// //   UPDATE daily_food_stock
// //   SET
// //     Sold_Quantity = Sold_Quantity + ?,
// //     Closing_Quantity = Closing_Quantity - ?
// //   WHERE id = ?
// //   `,
// //   [
// //     item.Item_Quantity,
// //     item.Item_Quantity,
// //     stock.id,
// //   ]
// // );

// // /* ================= STOCK HISTORY (SALE) ================= */

// // await connection.execute(
// //   `
// //   INSERT INTO food_stock_movements
// //     (Item_Id,  Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
// //   VALUES (?,  ?, 'TAKEAWAY', ?, ?, ?)
// //   `,
// //   [
// //     Item_Id,
    
// //     stockDate,
// //     item.Item_Quantity,
// //     Takeaway_Order_Id,
// //     userId,
// //   ]
// // );
// await connection.execute(
//         `
//         INSERT INTO daily_food_stock
//           (Item_Id, Stock_Date,
//            Opening_Quantity, Added_Quantity,
//            Sold_Quantity, Closing_Quantity)
//         VALUES (?, ?, 0, 0, 0, 0)
//         ON DUPLICATE KEY UPDATE
//           Stock_Date = daily_food_stock.Stock_Date
//         `,
//         [Item_Id, stockDate]
//       );

//       // 2️⃣ Update sold quantity
//       await connection.execute(
//         `
//         UPDATE daily_food_stock
//         SET
//           Sold_Quantity = Sold_Quantity + ?,
//           Closing_Quantity = Closing_Quantity - ?
//         WHERE Item_Id = ?
//           AND Stock_Date = ?
//         `,
//         [
//           item.Item_Quantity,
//           item.Item_Quantity,
//           Item_Id,
//           stockDate,
//         ]
//       );

//       // 3️⃣ Movement entry
//       await connection.execute(
//         `
//         INSERT INTO food_stock_movements
//           (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
//         VALUES (?, ?, 'TAKEAWAY', ?, ?, ?)
//         `,
//         [
//           Item_Id,
//           stockDate,
//           item.Item_Quantity,
//           Takeaway_Order_Id,
//           userId,
//         ]
//       )

//     }

//     // ---------------- INVOICE ----------------
//     // const Invoice_Id = await generateNextId(
//     //   connection,
//     //   "TKINV",
//     //   "Invoice_Id",
//     //   "takeaway_invoices"
//     // );

//     // const [fy] = await connection.execute(
//     //   `SELECT Financial_Year
//     //    FROM financial_year
//     //    WHERE Current_Financial_Year = 1
//     //    LIMIT 1`
//     // );

//     // if (!fy.length) {
//     //   await connection.rollback();
//     //   return res.status(400).json({ message: "No active financial year found." });
//     // }

//     // const activeFY = fy[0].Financial_Year;

//     // await connection.execute(
//     //   `INSERT INTO takeaway_invoices
//     //    (Invoice_Id, Takeaway_Order_Id, Invoice_Date, Financial_Year, Amount,
//     //     Customer_Name, Customer_Phone, Customer_Id, Discount_Type, Discount, Payment_Type)
//     //    VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`,
//     //   [
//     //     Invoice_Id,
//     //     Takeaway_Order_Id,
//     //     activeFY,
//     //     finalAmount,                // ✅ TRUST FRONTEND FINAL AMOUNT
//     //     normalizedCustomerName,
//     //     Customer_Phone || null,
//     //     Customer_Id,
//     //     Discount_Type ?? "percentage",
//     //     discountValue,
//     //     Payment_Type ?? "Cash",
//     //   ]
//     // );
//     const [fy] = await connection.execute(
//   `SELECT Financial_Year
//    FROM financial_year
//    WHERE Current_Financial_Year = 1
//    LIMIT 1`
// );

// if (!fy.length) {
//   return res.status(400).json({ message: "No active financial year found." });
// }

// const activeFY = fy[0].Financial_Year;

// // 🔁 NOW RETRY LOOP
// let Invoice_Id;

// for (let i = 0; i < 3; i++) {
//   try {
//     Invoice_Id = await generateNextId(
//       connection,
//       "TKINV",
//       "Invoice_Id",
//       "takeaway_invoices"
//     );

//     await connection.execute(
//       `INSERT INTO takeaway_invoices
//        (Invoice_Id, Takeaway_Order_Id, Invoice_Date, Financial_Year, Amount,
//         Customer_Name, Customer_Phone, Customer_Id, Discount_Type, Discount, Payment_Type)
//        VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         Invoice_Id,
//         Takeaway_Order_Id,
//         activeFY, // ✅ NOW DEFINED
//         finalAmount,
//         normalizedCustomerName,
//         Customer_Phone || null,
//         Customer_Id,
//         Discount_Type ?? "percentage",
//         discountValue,
//         Payment_Type ?? "Cash",
//       ]
//     );

//     break;

//   } catch (err) {
//     if (err.code === "ER_DUP_ENTRY" && i < 2) continue;
//     throw err;
//   }
// }
//     await connection.commit();

//     // ---------------- RESPONSE ----------------
//     return res.status(200).json({
//       success: true,
//       message: "Order completed successfully.",
//       invoice: {
//         Invoice_Id,
//         Invoice_Number: Invoice_Id,
//         Takeaway_Order_Id,
//         Customer_Name: normalizedCustomerName,
//         Customer_Phone,
//         Sub_Total: subTotal,
//         Discount: discountValue,
//         Discount_Type,
//         Final_Amount: finalAmount,
//         Payment_Type,
//         Invoice_Date: new Date(),
//         Financial_Year: activeFY,
//         Order_Type: "takeaway",
//       },
//       items,
//     });

//   }
//   //  catch (err) {
//   //   if (connection) await connection.rollback();
//   //   console.error("❌ Error:", err);
//   //   next(err);
//   // } 
// catch (err) {
//   if (connection) await connection.rollback();

//   // ❌ Ignore retry errors silently
//   if (
//     err.code === "ER_LOCK_DEADLOCK" ||
//     err.code === "ER_DUP_ENTRY"
//   ) {
//     return res.status(200).json({
//       success: true,
//       message: "Order processed successfully",
//     });
//   }

//   // ✅ Log real errors (stderr)
//   console.error("❌ Final Error:", err);

//   // ✅ Still return success (your requirement)
//   return res.status(200).json({
//     success: true,
//     message: "Processing... please wait",
//   });
// }
  
//   finally {
//     if (connection) connection.release();
//   }
// };

// const totalInvoicesEachDay = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();

//     const year = Number(req.query.year);
//     const month = Number(req.query.month); // 1–12

//     if (!year || !month) {
//       return res.status(400).json({
//         success: false,
//         message: "Year and month are required",
//       });
//     }

//     /* ---------------- DINE-IN INVOICES ---------------- */
//     const [dineInInvoices] = await connection.query(
//       `
//       SELECT
//         DATE_FORMAT(Invoice_Date, '%Y-%m-%d') AS date,
//         COUNT(*) AS total_invoices
//       FROM invoices
//       WHERE YEAR(Invoice_Date) = ? AND MONTH(Invoice_Date) = ?
//       GROUP BY DATE(Invoice_Date)
//       ORDER BY DATE(Invoice_Date)
//       `,
//       [year, month]
//     );

//     /* ---------------- TAKEAWAY (NOT CANCELLED) ---------------- */
//     const [takeawayInvoices] = await connection.query(
//       `
//       SELECT
//         DATE_FORMAT(ti.Invoice_Date, '%Y-%m-%d') AS date,
//         COUNT(*) AS total_takeaway_invoices
//       FROM takeaway_invoices ti
//       JOIN orders_takeaway ot 
//         ON ti.Takeaway_Order_Id = ot.Takeaway_Order_Id
//       WHERE 
//         ot.Status <> 'cancelled'
//         AND YEAR(ti.Invoice_Date) = ?
//         AND MONTH(ti.Invoice_Date) = ?
//       GROUP BY DATE(ti.Invoice_Date)
//       ORDER BY DATE(ti.Invoice_Date)
//       `,
//       [year, month]
//     );

//     /* ---------------- PRE-BOOK INVOICES ---------------- */
//     const [preBookInvoices] = await connection.query(
//       `
//       SELECT
//         DATE_FORMAT(Pre_Book_Invoice_Date,'%Y-%m-%d') AS date,
//         COUNT(*) AS total_pre_book_invoices
//       FROM pre_book_orders_invoices
//       WHERE YEAR(Pre_Book_Invoice_Date) = ?
//         AND MONTH(Pre_Book_Invoice_Date) = ?
//       GROUP BY DATE(Pre_Book_Invoice_Date)
//       ORDER BY DATE(Pre_Book_Invoice_Date)
//       `,
//       [year, month]
//     );

//     /* ---------------- TOTAL SALES (FIXED ✅) ---------------- */
//     const [totalSalesEachDay] = await connection.query(
//       `
//       SELECT
//         date,
//         SUM(dinein_sales + takeaway_sales + prebook_sales) AS total_sales
//       FROM (
//         /* DINE-IN */
//         SELECT
//           DATE_FORMAT(Invoice_Date,'%Y-%m-%d') AS date,
//           SUM(CAST(Amount AS DECIMAL(10,2))) AS dinein_sales,
//           0 AS takeaway_sales,
//           0 AS prebook_sales
//         FROM invoices
//         WHERE YEAR(Invoice_Date) = ? AND MONTH(Invoice_Date) = ?
//         GROUP BY DATE(Invoice_Date)

//         UNION ALL

//         /* TAKEAWAY */
//         SELECT
//           DATE_FORMAT(Invoice_Date,'%Y-%m-%d') AS date,
//           0 AS dinein_sales,
//           SUM(CAST(Amount AS DECIMAL(10,2))) AS takeaway_sales,
//           0 AS prebook_sales
//         FROM takeaway_invoices
//         WHERE YEAR(Invoice_Date) = ? AND MONTH(Invoice_Date) = ?
//         GROUP BY DATE(Invoice_Date)

//         UNION ALL

//         /* PRE-BOOK ✅ FIXED */
//         SELECT
//           DATE_FORMAT(Pre_Book_Invoice_Date,'%Y-%m-%d') AS date,
//           0 AS dinein_sales,
//           0 AS takeaway_sales,
//           SUM(CAST(Amount AS DECIMAL(10,2))) AS prebook_sales
//         FROM pre_book_orders_invoices
//         WHERE YEAR(Pre_Book_Invoice_Date) = ?
//           AND MONTH(Pre_Book_Invoice_Date) = ?
//         GROUP BY DATE(Pre_Book_Invoice_Date)
//       ) x
//       GROUP BY date
//       ORDER BY date
//       `,
//       [year, month, year, month, year, month]
//     );

//     return res.status(200).json({
//       success: true,
//       year,
//       month,

//       dineInInvoices,
//       takeawayInvoices,
//       preBookInvoices,

//       totalSalesEachDay,
//     });

//   } catch (err) {
//     console.error("❌ Error fetching invoice data:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

// const getAllInvoicesOfOrdersAndTakeawaysInDateRange = async (req, res, next) => {
//   let connection;

//   try {
//     const { fromDate, toDate, search = "", cursor } = req.query;

//     if (!fromDate || !toDate) {
//       return res.status(400).json({
//         success: false,
//         message: "From Date and To Date are required",
//       });
//     }

//     const page = Number(req.query.page || 1);
//     const limit = 10;
//     const offset = (page - 1) * limit;
//     //const halfLimit = Math.ceil(limit / 2);

//     const startDate = `${fromDate} 00:00:00`;
//     const endDate = `${toDate} 23:59:59`;

//     connection = await db.getConnection();

//     /* ================= SEARCH ================= */

//     let dineSearch = "";
//     let takeawaySearch = "";
//     let preBookSearch = "";

//     let textParams = [];
//     let amountParams = [];

//     if (search) {
//       const trimmed = search.trim();
//       const likeSearch = `%${trimmed}%`;

//       const isNumber = !isNaN(trimmed);
//       // const isRange = trimmed.includes("-");

//       // TEXT PARAMS
//       textParams = [likeSearch, likeSearch, likeSearch, likeSearch];

//       /* ===== AMOUNT LOGIC ===== */
//       let amountConditionDine = "";
//       let amountConditionTakeaway = "";
//       let amountConditionPreBook = "";

//         if (isNumber) {
//         amountConditionDine = ` OR Amount >= ?`;
//         amountConditionTakeaway = ` OR Amount >= ?`;
//         amountConditionPreBook = ` OR inv.Amount >= ?`;

//         amountParams.push(Number(trimmed));
//       }

//       dineSearch = `
//         AND (
//           Customer_Name LIKE ?
//           OR Customer_Phone LIKE ?
//           OR Invoice_Id LIKE ?
//           OR Order_Id LIKE ?
//           ${amountConditionDine}
//         )
//       `;

//       takeawaySearch = `
//         AND (
//           Customer_Name LIKE ?
//           OR Customer_Phone LIKE ?
//           OR Invoice_Id LIKE ?
//           OR Takeaway_Order_Id LIKE ?
//           ${amountConditionTakeaway}
//         )
//       `;

//       preBookSearch = `
//         AND (
//           c.Customer_Name LIKE ?
//           OR c.Customer_Phone LIKE ?
//           OR inv.Pre_Book_Invoice_Id LIKE ?
//           OR inv.Pre_Book_Order_Id LIKE ?
//           ${amountConditionPreBook}
//         )
//       `;
//     }

//     const finalParams = [...textParams, ...amountParams];

//     /* ================= LEFT ================= */
  
//     const [leftInvoices] = await connection.query(
//       `
//       (
//         SELECT
//           Invoice_Id,
//           Order_Id,
//           Customer_Name,
//           Customer_Phone,
//           Amount,
//           Service_Charge,
//           Service_Charge_Type,
//           Discount,
//           Discount_Type,
//           created_at AS sort_time,
//           Invoice_Date,
//           'dine' AS orderType
//         FROM invoices
//         WHERE created_at >= ? AND created_at <= ?
//         ${dineSearch}
//       )

//       UNION ALL

//       (
//         SELECT
//           inv.Pre_Book_Invoice_Id AS Invoice_Id,
//           inv.Pre_Book_Order_Id AS Order_Id,
//           c.Customer_Name,
//           c.Customer_Phone,
//           inv.Amount,
//           inv.Service_Charge,
//           NULL AS Service_Charge_Type,
//           inv.Discount,
//           inv.Discount_Type,
//           inv.Pre_Book_Invoice_Date AS sort_time,
//           inv.Pre_Book_Invoice_Date AS Invoice_Date,
//           'pre-book' AS orderType
//         FROM pre_book_orders_invoices inv
//         LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
//         WHERE inv.Pre_Book_Invoice_Date >= ? 
//         AND inv.Pre_Book_Invoice_Date <= ?
//         AND EXISTS (
//           SELECT 1
//           FROM pre_booked_order_tables pbot
//           WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
//         )
//         ${preBookSearch}
//       )

//       ORDER BY sort_time DESC
//       LIMIT ? OFFSET ?
//       `,
//       [
//         startDate,
//         endDate,
//         ...finalParams,
//         startDate,
//         endDate,
//         ...finalParams,
//         limit,
//         offset,
//       ]
//     );

//     /* ================= RIGHT ================= */
//     const [rightInvoices] = await connection.query(
//       `
//       (
//         SELECT
//           Invoice_Id,
//           Takeaway_Order_Id AS Order_Id,
//           Customer_Name,
//           Customer_Phone,
//           Amount,
//           NULL AS Service_Charge,
//           Discount,
//           Discount_Type,
//           created_at AS sort_time,
//           Invoice_Date,
//           'takeaway' AS orderType
//         FROM takeaway_invoices
//         WHERE created_at >= ? AND created_at <= ?
//         ${takeawaySearch}
//       )

//       UNION ALL

//       (
//         SELECT
//           inv.Pre_Book_Invoice_Id AS Invoice_Id,
//           inv.Pre_Book_Order_Id AS Order_Id,
//           c.Customer_Name,
//           c.Customer_Phone,
//           inv.Amount,
//           inv.Service_Charge,
//           inv.Discount,
//           inv.Discount_Type,
//           inv.Pre_Book_Invoice_Date AS sort_time,
//           inv.Pre_Book_Invoice_Date AS Invoice_Date,
//           'pre-book' AS orderType
//         FROM pre_book_orders_invoices inv
//         LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
//         WHERE inv.Pre_Book_Invoice_Date >= ? 
//         AND inv.Pre_Book_Invoice_Date <= ?
//         AND NOT EXISTS (
//           SELECT 1
//           FROM pre_booked_order_tables pbot
//           WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
//         )
//         ${preBookSearch}
//       )

//       ORDER BY sort_time DESC
//       LIMIT ? OFFSET ?
//       `,
//       [
//         startDate,
//         endDate,
//         ...finalParams,
//         startDate,
//         endDate,
//         ...finalParams,
//         limit,
//         offset,
//       ]
//     );
// const [[leftCountRow]] = await connection.query(
//   `
//   SELECT COUNT(*) AS total FROM (
    
//     SELECT i.Invoice_Id
//     FROM invoices i
//     WHERE i.created_at >= ? AND i.created_at <= ?
//     ${dineSearch}

//     UNION ALL

//     SELECT inv.Pre_Book_Invoice_Id
//     FROM pre_book_orders_invoices inv
//     LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
//     WHERE inv.Pre_Book_Invoice_Date >= ? 
//     AND inv.Pre_Book_Invoice_Date <= ?
//     AND EXISTS (
//       SELECT 1 FROM pre_booked_order_tables pbot
//       WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
//     )
//     ${preBookSearch}

//   ) x
//   `,
//   [
//     startDate, endDate, ...finalParams,
//     startDate, endDate, ...finalParams
//   ]
// );

// const [[rightCountRow]] = await connection.query(
//   `
//   SELECT COUNT(*) AS total FROM (

//     SELECT t.Invoice_Id
//     FROM takeaway_invoices t
//     WHERE t.created_at >= ? AND t.created_at <= ?
//     ${takeawaySearch}

//     UNION ALL

//     SELECT inv.Pre_Book_Invoice_Id
//     FROM pre_book_orders_invoices inv
//     LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
//     WHERE inv.Pre_Book_Invoice_Date >= ? 
//     AND inv.Pre_Book_Invoice_Date <= ?
//     AND NOT EXISTS (
//       SELECT 1 FROM pre_booked_order_tables pbot
//       WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
//     )
//     ${preBookSearch}

//   ) x
//   `,
//   [
//     startDate, endDate, ...finalParams,
//     startDate, endDate, ...finalParams
//   ]
// );
//     // const [[rightCountRow]] = await connection.query(
//     //   `
//     //   SELECT COUNT(*) AS total FROM (
//     //     SELECT Invoice_Id
//     //     FROM takeaway_invoices
//     //     WHERE DATE(created_at) BETWEEN ? AND ?
//     //     ${takeawaySearch}
//     //     UNION ALL
//     //     SELECT inv.Pre_Book_Invoice_Id
//     //     FROM pre_book_orders_invoices inv
//     //     LEFT JOIN pre_booked_order_tables pbot
//     //       ON pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
//     //     LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
//     //     WHERE pbot.Pre_Booked_Order_Id IS NULL
//     //       AND DATE(inv.Pre_Book_Invoice_Date) BETWEEN ? AND ?
//     //     ${preBookSearch}
//     //   ) x
//     //   `,
//     //   [fromDate, toDate, ...params, fromDate, toDate, ...params]
//     // );

//     const totalInvoices = leftCountRow.total + rightCountRow.total;
//         const totalPages = Math.max(
//       Math.ceil(leftCountRow.total / limit),
//       Math.ceil(rightCountRow.total / limit)
//     );
//     /* ================= MERGE + SORT ================= */

//     const pagedInvoices = [...leftInvoices, ...rightInvoices]
      

//     /* ================= IDS ================= */

//     const dineOrderIds = [];
//     const takeawayOrderIds = [];
//     const preBookOrderIds = [];

//     pagedInvoices.forEach(inv => {
//       if (inv.orderType === "dine") dineOrderIds.push(inv.Order_Id);
//       else if (inv.orderType === "takeaway") takeawayOrderIds.push(inv.Order_Id);
//       else preBookOrderIds.push(inv.Order_Id);
//     });

//     /* ================= PARALLEL FETCH ================= */

//     const [
//       [orders],
//       [ordersTakeaway],
//       [preBookOrders],
//       [preBookTables],
//       [dineItems],
//       [takeawayItems],
//       [preBookItems],
//       [tables]
//     ] = await Promise.all([
//       dineOrderIds.length ? connection.query(`SELECT * FROM orders WHERE Order_Id IN (?)`, [dineOrderIds]) : [[]],
//       takeawayOrderIds.length ? connection.query(`SELECT * FROM orders_takeaway WHERE Takeaway_Order_Id IN (?)`, [takeawayOrderIds]) : [[]],
//       preBookOrderIds.length ? connection.query(`SELECT * FROM pre_booked_orders WHERE Pre_Booked_Order_Id IN (?)`, [preBookOrderIds]) : [[]],
//       preBookOrderIds.length ? connection.query(`
//         SELECT pbot.Pre_Booked_Order_Id, t.Table_Name
//         FROM pre_booked_order_tables pbot
//         JOIN add_table t ON t.Table_Id = pbot.Table_Id
//         WHERE pbot.Pre_Booked_Order_Id IN (?)`, [preBookOrderIds]) : [[]],
//       dineOrderIds.length ? connection.query(`
//         SELECT 
//   oi.Order_Id,
//   oi.Quantity,
//   oi.Amount,
//   oi.Price,
//   f.Item_Name
// FROM order_items oi
// JOIN add_food_item f ON f.Item_Id = oi.Item_Id
// WHERE oi.Order_Id IN (?)`, [dineOrderIds]) : [[]],
//       takeawayOrderIds.length ? connection.query(`
//       SELECT 
//   oi.Takeaway_Order_Id,
//   oi.Quantity,
//   oi.Amount,
//   oi.Price,
//   f.Item_Name
// FROM order_takeaway_items oi
// JOIN add_food_item f ON f.Item_Id = oi.Item_Id
// WHERE oi.Takeaway_Order_Id IN (?)`, [takeawayOrderIds]) : [[]],
//       preBookOrderIds.length ? connection.query(`
//  SELECT 
//   oi.Pre_Booked_Order_Id,
//   oi.Quantity,
//   oi.Amount,
//   oi.Price,
//   f.Item_Name
// FROM pre_booked_order_items oi
// JOIN add_food_item f ON f.Item_Id = oi.Item_Id
// WHERE oi.Pre_Booked_Order_Id IN (?)`, [preBookOrderIds]) : [[]],
// dineOrderIds.length
//       ? await connection.query(
//           `
//           SELECT
//             ot.Order_Id,
//             t.Table_Id,
//             t.Table_Name
//           FROM order_tables ot
//           JOIN add_table t ON t.Table_Id = ot.Table_Id
//           WHERE ot.Order_Id IN (?)
//           `,
//           [dineOrderIds]
//         )
//       : [[]],
//     ]);

//     /* ================= MAP OPTIMIZATION ================= */

//     const buildMap = (arr, key) => {
//       const map = new Map();
//       arr.forEach(i => {
//         if (!map.has(i[key])) map.set(i[key], []);
//         map.get(i[key]).push(i);
//       });
//       return map;
//     };

//     const dineMap = buildMap(dineItems, "Order_Id");
//      const dineTableMap = buildMap(tables, "Order_Id");
//     const takeawayMap = buildMap(takeawayItems, "Takeaway_Order_Id");
//     const preBookMap = buildMap(preBookItems, "Pre_Booked_Order_Id");
//     const tableMap = buildMap(preBookTables, "Pre_Booked_Order_Id");

//     const ordersMap = new Map(orders.map(o => [o.Order_Id, o]));
//     const takeawayOrdersMap = new Map(ordersTakeaway.map(o => [o.Takeaway_Order_Id, o]));
//     const preBookOrdersMap = new Map(preBookOrders.map(o => [o.Pre_Booked_Order_Id, o]));

//     /* ================= FINAL DATA ================= */

//     const finalData = await Promise.all(
//       pagedInvoices.map(async (inv) => {
//         let items = [];
//         let tables = [];
//         let orderType = inv.orderType;

       
//           if (inv.orderType === "dine") {
//   items = dineMap.get(inv.Order_Id) || [];
//   tables = dineTableMap.get(inv.Order_Id) || []; // 🔥 FIX

         
//           }else if (inv.orderType === "takeaway") {
//           items = takeawayMap.get(inv.Order_Id) || [];
//         } else {
//           items = preBookMap.get(inv.Order_Id) || [];
//           tables = tableMap.get(inv.Order_Id) || [];
//           orderType = tables.length > 0 ? "dine" : "takeaway";
//         }

//         const subTotal = items.reduce((sum, i) => sum + Number(i.Amount || 0), 0);

//         const serviceChargeAmount =
//           inv.Service_Charge_Type === "percentage"
//             ? (subTotal * Number(inv.Service_Charge || 0)) / 100
//             : Number(inv.Service_Charge || 0);

//         const discountAmount =
//           inv.Discount_Type === "percentage"
//             ? (subTotal * Number(inv.Discount || 0)) / 100
//             : Number(inv.Discount || 0);

//         const kotResult = await checkDineInItemsElligibleForKOTPrint(
//           items.map(i => ({ Item_Name: i.Item_Name, Item_Quantity: i.Quantity || 1 }))
//         );

//         return {
//           invoice: {
//             ...inv,
//             Service_Charge_Amount: serviceChargeAmount,
//             Discount_Amount: discountAmount
//           },
//           order:
//             inv.orderType === "dine"
//               ? ordersMap.get(inv.Order_Id)
//               : inv.orderType === "takeaway"
//               ? takeawayOrdersMap.get(inv.Order_Id)
//               : preBookOrdersMap.get(inv.Order_Id),
//           items,
//           tables,
//           kitchens: kotResult.success ? kotResult.elligibleItems : {},
//           orderType,
//           originalOrderType: inv.orderType
//         };
//       })
//     );

//     const nextCursor =
//       pagedInvoices.length > 0
//         ? pagedInvoices[pagedInvoices.length - 1].sort_time
//         : null;

//     /* ================= RESPONSE ================= */

//     res.status(200).json({
//       success: true,
//       fromDate,
//       toDate,
//       page,
//       pageSize: limit,
//       totalInvoices,
//       totalPages,
//       dineCount: leftCountRow.total,
//       takeawayCount: rightCountRow.total,
//       preBookCount: null,
//       data: finalData,
//       totalCount: totalInvoices,
//       nextCursor
//     });

//   } catch (err) {
//     console.error("❌ Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
//DINE IN LEFT SPLITTED TAKEAWAY RIGHT
// const getAllInvoicesOfOrdersAndTakeawaysInDateRange = async (req, res, next) => {
//   let connection;

//   try {
//     const { fromDate, toDate, search = "", cursor } = req.query;

//     if (!fromDate || !toDate) {
//       return res.status(400).json({
//         success: false,
//         message: "From Date and To Date are required",
//       });
//     }

//     const page = Number(req.query.page || 1);
//     const limit = 10;
//     const offset = (page - 1) * limit;
//     //const halfLimit = Math.ceil(limit / 2);

//     const startDate = `${fromDate} 00:00:00`;
//     const endDate = `${toDate} 23:59:59`;

//     connection = await db.getConnection();

//     /* ================= SEARCH ================= */

//     let dineSearch = "";
//     let takeawaySearch = "";
//     let preBookSearch = "";

//     let textParams = [];
//     let amountParams = [];

//     if (search) {
//       const trimmed = search.trim();
//       const likeSearch = `%${trimmed}%`;

//       const isNumber = !isNaN(trimmed);
//       // const isRange = trimmed.includes("-");

//       // TEXT PARAMS
//       textParams = [likeSearch, likeSearch, likeSearch, likeSearch];

//       /* ===== AMOUNT LOGIC ===== */
//       let amountConditionDine = "";
//       let amountConditionTakeaway = "";
//       let amountConditionPreBook = "";

//         if (isNumber) {
//         amountConditionDine = ` OR Amount >= ?`;
//         amountConditionTakeaway = ` OR Amount >= ?`;
//         amountConditionPreBook = ` OR inv.Amount >= ?`;

//         amountParams.push(Number(trimmed));
//       }

//       dineSearch = `
//         AND (
//           Customer_Name LIKE ?
//           OR Customer_Phone LIKE ?
//           OR Invoice_Id LIKE ?
//           OR Order_Id LIKE ?
//           ${amountConditionDine}
//         )
//       `;

//       takeawaySearch = `
//         AND (
//           Customer_Name LIKE ?
//           OR Customer_Phone LIKE ?
//           OR Invoice_Id LIKE ?
//           OR Takeaway_Order_Id LIKE ?
//           ${amountConditionTakeaway}
//         )
//       `;

//       preBookSearch = `
//         AND (
//           c.Customer_Name LIKE ?
//           OR c.Customer_Phone LIKE ?
//           OR inv.Pre_Book_Invoice_Id LIKE ?
//           OR inv.Pre_Book_Order_Id LIKE ?
//           ${amountConditionPreBook}
//         )
//       `;
//     }

//     const finalParams = [...textParams, ...amountParams];

//     /* ================= LEFT ================= */
  
//     const [leftInvoices] = await connection.query(
//       `
//       (
//         SELECT
//           Invoice_Id,
//           Order_Id,
//           Customer_Name,
//           Customer_Phone,
//           Amount,
//           Service_Charge,
//           Service_Charge_Type,
//           Discount,
//           Discount_Type,
//           created_at AS sort_time,
//           Invoice_Date,
//           'dine' AS orderType
//         FROM invoices
//         WHERE created_at >= ? AND created_at <= ?
//         ${dineSearch}
//       )

//       UNION ALL

//       (
//         SELECT
//           inv.Pre_Book_Invoice_Id AS Invoice_Id,
//           inv.Pre_Book_Order_Id AS Order_Id,
//           c.Customer_Name,
//           c.Customer_Phone,
//           inv.Amount,
//           inv.Service_Charge,
//           NULL AS Service_Charge_Type,
//           inv.Discount,
//           inv.Discount_Type,
//           inv.Pre_Book_Invoice_Date AS sort_time,
//           inv.Pre_Book_Invoice_Date AS Invoice_Date,
//           'pre-book' AS orderType
//         FROM pre_book_orders_invoices inv
//         LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
//         WHERE inv.Pre_Book_Invoice_Date >= ? 
//         AND inv.Pre_Book_Invoice_Date <= ?
//         AND EXISTS (
//           SELECT 1
//           FROM pre_booked_order_tables pbot
//           WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
//         )
//         ${preBookSearch}
//       )

//       ORDER BY sort_time DESC
//       LIMIT ? OFFSET ?
//       `,
//       [
//         startDate,
//         endDate,
//         ...finalParams,
//         startDate,
//         endDate,
//         ...finalParams,
//         limit,
//         offset,
//       ]
//     );

//     /* ================= RIGHT ================= */
//     const [rightInvoices] = await connection.query(
//       `
//       (
//         SELECT
//           Invoice_Id,
//           Takeaway_Order_Id AS Order_Id,
//           Customer_Name,
//           Customer_Phone,
//           Amount,
//           NULL AS Service_Charge,
//           Discount,
//           Discount_Type,
//           created_at AS sort_time,
//           Invoice_Date,
//           'takeaway' AS orderType
//         FROM takeaway_invoices
//         WHERE created_at >= ? AND created_at <= ?
//         ${takeawaySearch}
//       )

//       UNION ALL

//       (
//         SELECT
//           inv.Pre_Book_Invoice_Id AS Invoice_Id,
//           inv.Pre_Book_Order_Id AS Order_Id,
//           c.Customer_Name,
//           c.Customer_Phone,
//           inv.Amount,
//           inv.Service_Charge,
//           inv.Discount,
//           inv.Discount_Type,
//           inv.Pre_Book_Invoice_Date AS sort_time,
//           inv.Pre_Book_Invoice_Date AS Invoice_Date,
//           'pre-book' AS orderType
//         FROM pre_book_orders_invoices inv
//         LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
//         WHERE inv.Pre_Book_Invoice_Date >= ? 
//         AND inv.Pre_Book_Invoice_Date <= ?
//         AND NOT EXISTS (
//           SELECT 1
//           FROM pre_booked_order_tables pbot
//           WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
//         )
//         ${preBookSearch}
//       )

//       ORDER BY sort_time DESC
//       LIMIT ? OFFSET ?
//       `,
//       [
//         startDate,
//         endDate,
//         ...finalParams,
//         startDate,
//         endDate,
//         ...finalParams,
//         limit,
//         offset,
//       ]
//     );
// const [[leftCountRow]] = await connection.query(
//   `
//   SELECT COUNT(*) AS total FROM (
    
//     SELECT i.Invoice_Id
//     FROM invoices i
//     WHERE i.created_at >= ? AND i.created_at <= ?
//     ${dineSearch}

//     UNION ALL

//     SELECT inv.Pre_Book_Invoice_Id
//     FROM pre_book_orders_invoices inv
//     LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
//     WHERE inv.Pre_Book_Invoice_Date >= ? 
//     AND inv.Pre_Book_Invoice_Date <= ?
//     AND EXISTS (
//       SELECT 1 FROM pre_booked_order_tables pbot
//       WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
//     )
//     ${preBookSearch}

//   ) x
//   `,
//   [
//     startDate, endDate, ...finalParams,
//     startDate, endDate, ...finalParams
//   ]
// );

// const [[rightCountRow]] = await connection.query(
//   `
//   SELECT COUNT(*) AS total FROM (

//     SELECT t.Invoice_Id
//     FROM takeaway_invoices t
//     WHERE t.created_at >= ? AND t.created_at <= ?
//     ${takeawaySearch}

//     UNION ALL

//     SELECT inv.Pre_Book_Invoice_Id
//     FROM pre_book_orders_invoices inv
//     LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
//     WHERE inv.Pre_Book_Invoice_Date >= ? 
//     AND inv.Pre_Book_Invoice_Date <= ?
//     AND NOT EXISTS (
//       SELECT 1 FROM pre_booked_order_tables pbot
//       WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
//     )
//     ${preBookSearch}

//   ) x
//   `,
//   [
//     startDate, endDate, ...finalParams,
//     startDate, endDate, ...finalParams
//   ]
// );
//     // const [[rightCountRow]] = await connection.query(
//     //   `
//     //   SELECT COUNT(*) AS total FROM (
//     //     SELECT Invoice_Id
//     //     FROM takeaway_invoices
//     //     WHERE DATE(created_at) BETWEEN ? AND ?
//     //     ${takeawaySearch}
//     //     UNION ALL
//     //     SELECT inv.Pre_Book_Invoice_Id
//     //     FROM pre_book_orders_invoices inv
//     //     LEFT JOIN pre_booked_order_tables pbot
//     //       ON pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
//     //     LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
//     //     WHERE pbot.Pre_Booked_Order_Id IS NULL
//     //       AND DATE(inv.Pre_Book_Invoice_Date) BETWEEN ? AND ?
//     //     ${preBookSearch}
//     //   ) x
//     //   `,
//     //   [fromDate, toDate, ...params, fromDate, toDate, ...params]
//     // );

//     const totalInvoices = leftCountRow.total + rightCountRow.total;
//         const totalPages = Math.max(
//       Math.ceil(leftCountRow.total / limit),
//       Math.ceil(rightCountRow.total / limit)
//     );
//     /* ================= MERGE + SORT ================= */

//     const pagedInvoices = [...leftInvoices, ...rightInvoices]
      

//     /* ================= IDS ================= */

//     const dineOrderIds = [];
//     const takeawayOrderIds = [];
//     const preBookOrderIds = [];

//     pagedInvoices.forEach(inv => {
//       if (inv.orderType === "dine") dineOrderIds.push(inv.Order_Id);
//       else if (inv.orderType === "takeaway") takeawayOrderIds.push(inv.Order_Id);
//       else preBookOrderIds.push(inv.Order_Id);
//     });

//     /* ================= PARALLEL FETCH ================= */

//     const [
//       [orders],
//       [ordersTakeaway],
//       [preBookOrders],
//       [preBookTables],
//       [dineItems],
//       [takeawayItems],
//       [preBookItems],
//       [tables]
//     ] = await Promise.all([
//       dineOrderIds.length ? connection.query(`SELECT * FROM orders WHERE Order_Id IN (?)`, [dineOrderIds]) : [[]],
//       takeawayOrderIds.length ? connection.query(`SELECT * FROM orders_takeaway WHERE Takeaway_Order_Id IN (?)`, [takeawayOrderIds]) : [[]],
//       preBookOrderIds.length ? connection.query(`SELECT * FROM pre_booked_orders WHERE Pre_Booked_Order_Id IN (?)`, [preBookOrderIds]) : [[]],
//       preBookOrderIds.length ? connection.query(`
//         SELECT pbot.Pre_Booked_Order_Id, t.Table_Name
//         FROM pre_booked_order_tables pbot
//         JOIN add_table t ON t.Table_Id = pbot.Table_Id
//         WHERE pbot.Pre_Booked_Order_Id IN (?)`, [preBookOrderIds]) : [[]],
//       dineOrderIds.length ? connection.query(`
//         SELECT 
//   oi.Order_Id,
//   oi.Quantity,
//   oi.Amount,
//   oi.Price,
//   f.Item_Name
// FROM order_items oi
// JOIN add_food_item f ON f.Item_Id = oi.Item_Id
// WHERE oi.Order_Id IN (?)`, [dineOrderIds]) : [[]],
//       takeawayOrderIds.length ? connection.query(`
//       SELECT 
//   oi.Takeaway_Order_Id,
//   oi.Quantity,
//   oi.Amount,
//   oi.Price,
//   f.Item_Name
// FROM order_takeaway_items oi
// JOIN add_food_item f ON f.Item_Id = oi.Item_Id
// WHERE oi.Takeaway_Order_Id IN (?)`, [takeawayOrderIds]) : [[]],
//       preBookOrderIds.length ? connection.query(`
//  SELECT 
//   oi.Pre_Booked_Order_Id,
//   oi.Quantity,
//   oi.Amount,
//   oi.Price,
//   f.Item_Name
// FROM pre_booked_order_items oi
// JOIN add_food_item f ON f.Item_Id = oi.Item_Id
// WHERE oi.Pre_Booked_Order_Id IN (?)`, [preBookOrderIds]) : [[]],
// dineOrderIds.length
//       ? await connection.query(
//           `
//           SELECT
//             ot.Order_Id,
//             t.Table_Id,
//             t.Table_Name
//           FROM order_tables ot
//           JOIN add_table t ON t.Table_Id = ot.Table_Id
//           WHERE ot.Order_Id IN (?)
//           `,
//           [dineOrderIds]
//         )
//       : [[]],
//     ]);

//     /* ================= MAP OPTIMIZATION ================= */

//     const buildMap = (arr, key) => {
//       const map = new Map();
//       arr.forEach(i => {
//         if (!map.has(i[key])) map.set(i[key], []);
//         map.get(i[key]).push(i);
//       });
//       return map;
//     };

//     const dineMap = buildMap(dineItems, "Order_Id");
//      const dineTableMap = buildMap(tables, "Order_Id");
//     const takeawayMap = buildMap(takeawayItems, "Takeaway_Order_Id");
//     const preBookMap = buildMap(preBookItems, "Pre_Booked_Order_Id");
//     const tableMap = buildMap(preBookTables, "Pre_Booked_Order_Id");

//     const ordersMap = new Map(orders.map(o => [o.Order_Id, o]));
//     const takeawayOrdersMap = new Map(ordersTakeaway.map(o => [o.Takeaway_Order_Id, o]));
//     const preBookOrdersMap = new Map(preBookOrders.map(o => [o.Pre_Booked_Order_Id, o]));

//     /* ================= FINAL DATA ================= */

//     const finalData = await Promise.all(
//       pagedInvoices.map(async (inv) => {
//         let items = [];
//         let tables = [];
//         let orderType = inv.orderType;

       
//           if (inv.orderType === "dine") {
//   items = dineMap.get(inv.Order_Id) || [];
//   tables = dineTableMap.get(inv.Order_Id) || []; // 🔥 FIX

         
//           }else if (inv.orderType === "takeaway") {
//           items = takeawayMap.get(inv.Order_Id) || [];
//         } else {
//           items = preBookMap.get(inv.Order_Id) || [];
//           tables = tableMap.get(inv.Order_Id) || [];
//           orderType = tables.length > 0 ? "dine" : "takeaway";
//         }

//         const subTotal = items.reduce((sum, i) => sum + Number(i.Amount || 0), 0);

//         const serviceChargeAmount =
//           inv.Service_Charge_Type === "percentage"
//             ? (subTotal * Number(inv.Service_Charge || 0)) / 100
//             : Number(inv.Service_Charge || 0);

//         const discountAmount =
//           inv.Discount_Type === "percentage"
//             ? (subTotal * Number(inv.Discount || 0)) / 100
//             : Number(inv.Discount || 0);

//         const kotResult = await checkDineInItemsElligibleForKOTPrint(
//           items.map(i => ({ Item_Name: i.Item_Name, Item_Quantity: i.Quantity || 1 }))
//         );

//         return {
//           invoice: {
//             ...inv,
//             Service_Charge_Amount: serviceChargeAmount,
//             Discount_Amount: discountAmount
//           },
//           order:
//             inv.orderType === "dine"
//               ? ordersMap.get(inv.Order_Id)
//               : inv.orderType === "takeaway"
//               ? takeawayOrdersMap.get(inv.Order_Id)
//               : preBookOrdersMap.get(inv.Order_Id),
//           items,
//           tables,
//           kitchens: kotResult.success ? kotResult.elligibleItems : {},
//           orderType,
//           originalOrderType: inv.orderType
//         };
//       })
//     );

//     const nextCursor =
//       pagedInvoices.length > 0
//         ? pagedInvoices[pagedInvoices.length - 1].sort_time
//         : null;

//     /* ================= RESPONSE ================= */

//     res.status(200).json({
//       success: true,
//       fromDate,
//       toDate,
//       page,
//       pageSize: limit,
//       totalInvoices,
//       totalPages,
//       dineCount: leftCountRow.total,
//       takeawayCount: rightCountRow.total,
//       preBookCount: null,
//       data: finalData,
//       totalCount: totalInvoices,
//       nextCursor
//     });

//   } catch (err) {
//     console.error("❌ Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
// ALL  DINE IN TAKEAWAY IN FILTERS
const getAllInvoicesOfOrdersAndTakeawaysInDateRange = async (req, res, next) => {
  let connection;

  try {
    const {
      fromDate,
      toDate,
      search = "",
      filter = "all", // "all" | "dine" | "takeaway"
    } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "From Date and To Date are required",
      });
    }

    const page   = Math.max(1, Number(req.query.page) || 1);
    const limit  = 20;
    const offset = (page - 1) * limit;

    const startDate = `${fromDate} 00:00:00`;
    const endDate   = `${toDate} 23:59:59`;

    connection = await db.getConnection();

    /* ─────────────────────────────────────────
       SEARCH CLAUSES
    ───────────────────────────────────────── */
    let dineSearch     = "";
    let takeawaySearch = "";
    let preBookSearch  = "";

    let dineParams     = [];
    let takeawayParams = [];
    let preBookParams  = [];

    if (search) {
      const trimmed    = search.trim();
      const likeSearch = `%${trimmed}%`;
      const isNumber   = !isNaN(trimmed) && trimmed !== "";

      const baseText = [likeSearch, likeSearch, likeSearch, likeSearch];
      const amountP  = isNumber ? [Number(trimmed)] : [];

      dineSearch = `
        AND (
          Customer_Name  LIKE ? OR
          Customer_Phone LIKE ? OR
          Invoice_Id     LIKE ? OR
          Order_Id       LIKE ?
          ${isNumber ? "OR Amount >= ?" : ""}
        )
      `;
      takeawaySearch = `
        AND (
          Customer_Name      LIKE ? OR
          Customer_Phone     LIKE ? OR
          Invoice_Id         LIKE ? OR
          Takeaway_Order_Id  LIKE ?
          ${isNumber ? "OR Amount >= ?" : ""}
        )
      `;
      preBookSearch = `
        AND (
          c.Customer_Name  LIKE ? OR
          c.Customer_Phone LIKE ? OR
          inv.Pre_Book_Invoice_Id LIKE ? OR
          inv.Pre_Book_Order_Id   LIKE ?
          ${isNumber ? "OR inv.Amount >= ?" : ""}
        )
      `;

      dineParams     = [...baseText, ...amountP];
      takeawayParams = [...baseText, ...amountP];
      preBookParams  = [...baseText, ...amountP];
    }

    /* ─────────────────────────────────────────
       DECIDE WHICH STREAMS TO INCLUDE
       filter = "all"      → dine + takeaway streams
       filter = "dine"     → only dine stream
       filter = "takeaway" → only takeaway stream
    ───────────────────────────────────────── */

    const includeDine     = filter === "all" || filter === "dine";
    const includeTakeaway = filter === "all" || filter === "takeaway";

    /* ─────────────────────────────────────────
       BUILD UNION QUERY  (only the needed arms)
    ───────────────────────────────────────── */
    const arms   = [];
    const params = [];

    if (includeDine) {
      /* ── arm 1: regular dine-in invoices ── */
      arms.push(`
        SELECT
          Invoice_Id,
          Order_Id,
          Customer_Name,
          Customer_Phone,
          Amount,
          Service_Charge,
          Service_Charge_Type,
          Discount,
          Discount_Type,
          
          created_at     AS sort_time,
          Invoice_Date,
          'dine'         AS orderType
        FROM invoices
        WHERE created_at >= ? AND created_at <= ?
        ${dineSearch}
      `);
      params.push(startDate, endDate, ...dineParams);

      /* ── arm 2: pre-book WITH tables (dine) ── */
      arms.push(`
        SELECT
          inv.Pre_Book_Invoice_Id  AS Invoice_Id,
          inv.Pre_Book_Order_Id    AS Order_Id,
          c.Customer_Name,
          c.Customer_Phone,
          inv.Amount,
          inv.Service_Charge,
          NULL                     AS Service_Charge_Type,
          inv.Discount,
          inv.Discount_Type,
          
          inv.Pre_Book_Invoice_Date AS sort_time,
          inv.Pre_Book_Invoice_Date AS Invoice_Date,
          'pre-book'               AS orderType
        FROM pre_book_orders_invoices inv
        LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
        WHERE inv.Pre_Book_Invoice_Date >= ? AND inv.Pre_Book_Invoice_Date <= ?
          AND EXISTS (
            SELECT 1 FROM pre_booked_order_tables pbot
            WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
          )
        ${preBookSearch}
      `);
      params.push(startDate, endDate, ...preBookParams);
    }

    if (includeTakeaway) {
      /* ── arm 3: regular takeaway invoices ── */
      arms.push(`
        SELECT
          Invoice_Id,
          Takeaway_Order_Id        AS Order_Id,
          Customer_Name,
          Customer_Phone,
          Amount,
          NULL                     AS Service_Charge,
          NULL                     AS Service_Charge_Type,
          Discount,
          Discount_Type,
     
          created_at               AS sort_time,
          Invoice_Date,
          'takeaway'               AS orderType
        FROM takeaway_invoices
        WHERE created_at >= ? AND created_at <= ?
        ${takeawaySearch}
      `);
      params.push(startDate, endDate, ...takeawayParams);

      /* ── arm 4: pre-book WITHOUT tables (takeaway) ── */
      arms.push(`
        SELECT
          inv.Pre_Book_Invoice_Id  AS Invoice_Id,
          inv.Pre_Book_Order_Id    AS Order_Id,
          c.Customer_Name,
          c.Customer_Phone,
          inv.Amount,
          inv.Service_Charge,
          NULL                     AS Service_Charge_Type,
          inv.Discount,
          inv.Discount_Type,
         
          inv.Pre_Book_Invoice_Date AS sort_time,
          inv.Pre_Book_Invoice_Date AS Invoice_Date,
          'pre-book'               AS orderType
        FROM pre_book_orders_invoices inv
        LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
        WHERE inv.Pre_Book_Invoice_Date >= ? AND inv.Pre_Book_Invoice_Date <= ?
          AND NOT EXISTS (
            SELECT 1 FROM pre_booked_order_tables pbot
            WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
          )
        ${preBookSearch}
      `);
      params.push(startDate, endDate, ...preBookParams);
    }

    const unionSQL = arms.join(" UNION ALL ");

    /* ─────────────────────────────────────────
       COUNT  (wrap the union)
    ───────────────────────────────────────── */
    const [[{ total: totalCount }]] = await connection.query(
      `SELECT COUNT(*) AS total FROM ( ${unionSQL} ) _cnt`,
      params
    );

    const totalPages = Math.ceil(totalCount / limit);

    /* ─────────────────────────────────────────
       PAGINATED DATA
    ───────────────────────────────────────── */
    const [pagedInvoices] = await connection.query(
      `
        SELECT * FROM ( ${unionSQL} ) _u
        ORDER BY sort_time DESC
        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    /* ─────────────────────────────────────────
       COLLECT IDS BY TYPE
    ───────────────────────────────────────── */
    const dineOrderIds     = [];
    const takeawayOrderIds = [];
    const preBookOrderIds  = [];

    pagedInvoices.forEach((inv) => {
      if      (inv.orderType === "dine")     dineOrderIds.push(inv.Order_Id);
      else if (inv.orderType === "takeaway") takeawayOrderIds.push(inv.Order_Id);
      else                                   preBookOrderIds.push(inv.Order_Id);
    });

    /* ─────────────────────────────────────────
       PARALLEL DETAIL FETCH
    ───────────────────────────────────────── */
    const [
      [orders],
      [ordersTakeaway],
      [preBookOrders],
      [preBookTables],
      [dineItems],
      [takeawayItems],
      [preBookItems],
      [dineTables],
    ] = await Promise.all([
      dineOrderIds.length
        ? connection.query(`SELECT * FROM orders WHERE Order_Id IN (?)`, [dineOrderIds])
        : [[]],
      takeawayOrderIds.length
        ? connection.query(`SELECT * FROM orders_takeaway WHERE Takeaway_Order_Id IN (?)`, [takeawayOrderIds])
        : [[]],
      preBookOrderIds.length
        ? connection.query(`SELECT * FROM pre_booked_orders WHERE Pre_Booked_Order_Id IN (?)`, [preBookOrderIds])
        : [[]],
      preBookOrderIds.length
        ? connection.query(
            `SELECT pbot.Pre_Booked_Order_Id, t.Table_Name
             FROM pre_booked_order_tables pbot
             JOIN add_table t ON t.Table_Id = pbot.Table_Id
             WHERE pbot.Pre_Booked_Order_Id IN (?)`,
            [preBookOrderIds]
          )
        : [[]],
      dineOrderIds.length
        ? connection.query(
            `SELECT oi.Order_Id, oi.Quantity, oi.Amount, oi.Price, f.Item_Name
             FROM order_items oi
             JOIN add_food_item f ON f.Item_Id = oi.Item_Id
             WHERE oi.Order_Id IN (?)`,
            [dineOrderIds]
          )
        : [[]],
      takeawayOrderIds.length
        ? connection.query(
            `SELECT oi.Takeaway_Order_Id, oi.Quantity, oi.Amount, oi.Price, f.Item_Name
             FROM order_takeaway_items oi
             JOIN add_food_item f ON f.Item_Id = oi.Item_Id
             WHERE oi.Takeaway_Order_Id IN (?)`,
            [takeawayOrderIds]
          )
        : [[]],
      preBookOrderIds.length
        ? connection.query(
            `SELECT oi.Pre_Booked_Order_Id, oi.Quantity, oi.Amount, oi.Price, f.Item_Name
             FROM pre_booked_order_items oi
             JOIN add_food_item f ON f.Item_Id = oi.Item_Id
             WHERE oi.Pre_Booked_Order_Id IN (?)`,
            [preBookOrderIds]
          )
        : [[]],
      dineOrderIds.length
        ? connection.query(
            `SELECT ot.Order_Id, t.Table_Id, t.Table_Name
             FROM order_tables ot
             JOIN add_table t ON t.Table_Id = ot.Table_Id
             WHERE ot.Order_Id IN (?)`,
            [dineOrderIds]
          )
        : [[]],
    ]);

    /* ─────────────────────────────────────────
       BUILD LOOKUP MAPS
    ───────────────────────────────────────── */
    const buildMap = (arr, key) => {
      const map = new Map();
      arr.forEach((i) => {
        if (!map.has(i[key])) map.set(i[key], []);
        map.get(i[key]).push(i);
      });
      return map;
    };

    const dineItemMap     = buildMap(dineItems,     "Order_Id");
    const dineTableMap    = buildMap(dineTables,    "Order_Id");
    const takeawayItemMap = buildMap(takeawayItems, "Takeaway_Order_Id");
    const preBookItemMap  = buildMap(preBookItems,  "Pre_Booked_Order_Id");
    const preBookTableMap = buildMap(preBookTables, "Pre_Booked_Order_Id");

    const ordersMap        = new Map(orders.map((o) => [o.Order_Id, o]));
    const takeawayOrderMap = new Map(ordersTakeaway.map((o) => [o.Takeaway_Order_Id, o]));
    const preBookOrderMap  = new Map(preBookOrders.map((o) => [o.Pre_Booked_Order_Id, o]));

    /* ─────────────────────────────────────────
       ASSEMBLE FINAL DATA
    ───────────────────────────────────────── */
    const finalData = await Promise.all(
      pagedInvoices.map(async (inv) => {
        let items        = [];
        let tables       = [];
        let resolvedType = inv.orderType; // may be overridden for pre-book

        if (inv.orderType === "dine") {
          items  = dineItemMap.get(inv.Order_Id)  || [];
          tables = dineTableMap.get(inv.Order_Id) || [];
        } else if (inv.orderType === "takeaway") {
          items = takeawayItemMap.get(inv.Order_Id) || [];
        } else {
          // pre-book — resolve to dine or takeaway by table presence
          items        = preBookItemMap.get(inv.Order_Id)  || [];
          tables       = preBookTableMap.get(inv.Order_Id) || [];
          resolvedType = tables.length > 0 ? "dine" : "takeaway";
        }

        const subTotal = items.reduce((sum, i) => sum + Number(i.Amount || 0), 0);

        const serviceChargeAmount =
          inv.Service_Charge_Type === "percentage"
            ? (subTotal * Number(inv.Service_Charge || 0)) / 100
            : Number(inv.Service_Charge || 0);

        const discountAmount =
          inv.Discount_Type === "percentage"
            ? (subTotal * Number(inv.Discount || 0)) / 100
            : Number(inv.Discount || 0);

        const kotResult = await checkDineInItemsElligibleForKOTPrint(
          items.map((i) => ({ Item_Name: i.Item_Name, Item_Quantity: i.Quantity || 1 }))
        );

        const order =
          inv.orderType === "dine"
            ? ordersMap.get(inv.Order_Id)
            : inv.orderType === "takeaway"
            ? takeawayOrderMap.get(inv.Order_Id)
            : preBookOrderMap.get(inv.Order_Id);

        return {
          invoice: {
            ...inv,
            Service_Charge_Amount: serviceChargeAmount,
            Discount_Amount:       discountAmount,
          },
          order,
          items,
          tables,
          kitchens:          kotResult.success ? kotResult.elligibleItems : {},
          orderType:         resolvedType,
          originalOrderType: inv.orderType,
        };
      })
    );

    /* ─────────────────────────────────────────
       RESPONSE
    ───────────────────────────────────────── */
    return res.status(200).json({
      success:    true,
      fromDate,
      toDate,
      filter,
      page,
      pageSize:   limit,
      totalCount,
      totalPages,
      data:       finalData,
    });

  } catch (err) {
    console.error("❌ Error in getAllInvoicesUnifiedFeed:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
const updateTakeawayAndDineInDeliveryStatus = async (req, res, next) => {
  let connection;

  try {
    const {
      orderType,          // "dine" | "takeaway"
     
      Takeaway_Order_Id,
      Delivery_Status
    } = req.body;

    if (!orderType || !Delivery_Status) {
      return res.status(400).json({
        success: false,
        message: "orderType and Delivery_Status are required",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const normalizedStatus = Delivery_Status.toLowerCase();



    /* ---------------- TAKEAWAY ---------------- */
    if (orderType === "takeaway") {
      if (!Takeaway_Order_Id) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "Takeaway_Order_Id is required for takeaway",
        });
      }

      await connection.query(
        `UPDATE orders_takeaway
         SET Delivery_Status = ?
         WHERE Takeaway_Order_Id = ?`,
        [normalizedStatus, Takeaway_Order_Id]
      );
    }

    /* ---------------- INVALID ---------------- */
    else {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid orderType",
      });
    }

    /* ✅ COMMIT ONLY ON SUCCESS */
    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Delivery status updated successfully",
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error updating delivery status:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
// const getAllInvoicesOfOrdersAndTakeawaysInDateRange = async (req, res, next) => {
//   let connection;

//   try {
//     const { fromDate, toDate, search = "" } = req.query;

//     if (!fromDate || !toDate) {
//       return res.status(400).json({
//         success: false,
//         message: "From Date and To Date are required",
//       });
//     }

//     const page = Number(req.query.page || 1);
//     const limit = 10;
//     const offset = (page - 1) * limit;
//  const startDate = `${fromDate} 00:00:00`;
//     const endDate = `${toDate} 23:59:59`;
//     connection = await db.getConnection();

//     /* ================= SEARCH ================= */
//     let dineSearch = "";
//     let takeawaySearch = "";
//     let preBookSearch = "";
//     let params = [];
//     if (search) {
//       const s = `%${search.trim().toLowerCase()}%`;

//       dineSearch = `
//         AND (
//           LOWER(Customer_Name) LIKE ?
//           OR LOWER(Customer_Phone) LIKE ?
//           OR LOWER(Invoice_Id) LIKE ?
//           OR LOWER(Order_Id) LIKE ?
//           OR CAST(Amount AS CHAR) LIKE ?
//         )
//       `;

//       takeawaySearch = `
//         AND (
//           LOWER(Customer_Name) LIKE ?
//           OR LOWER(Customer_Phone) LIKE ?
//           OR LOWER(Invoice_Id) LIKE ?
//           OR LOWER(Takeaway_Order_Id) LIKE ?
//           OR CAST(Amount AS CHAR) LIKE ?
//         )
//       `;

//       preBookSearch = `
//         AND (
//           LOWER(c.Customer_Name) LIKE ?
//           OR LOWER(c.Customer_Phone) LIKE ?
//           OR LOWER(inv.Pre_Book_Invoice_Id) LIKE ?
//           OR LOWER(inv.Pre_Book_Order_Id) LIKE ?
//           OR CAST(inv.Amount AS CHAR) LIKE ?
//         )
//       `;

//       params = [s, s, s, s, s];
//     }

//     /* ================= LEFT ================= */
//     const [leftInvoices] = await connection.query(
//       `
//       (
//         SELECT
//           Invoice_Id,
//           Order_Id,
//           Customer_Name,
//           Customer_Phone,
//           Amount,
//           Service_Charge,
//           Service_Charge_Type,
//           Discount,
//           Discount_Type,
//           created_at AS sort_time,
//           Invoice_Date,
//           'dine' AS orderType
//         FROM invoices
//         WHERE created_at >= ? AND created_at <= ?
//         ${dineSearch}
//       )

//       UNION ALL

//       (
//         SELECT
//           inv.Pre_Book_Invoice_Id AS Invoice_Id,
//           inv.Pre_Book_Order_Id AS Order_Id,
//           c.Customer_Name,
//           c.Customer_Phone,
//           inv.Amount,
//           inv.Service_Charge,
//           NULL AS Service_Charge_Type,
//           inv.Discount,
//           inv.Discount_Type,
//           inv.Pre_Book_Invoice_Date AS sort_time,
//           inv.Pre_Book_Invoice_Date AS Invoice_Date,
//           'pre-book' AS orderType
//         FROM pre_book_orders_invoices inv
//         LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
//         WHERE inv.Pre_Book_Invoice_Date >= ? 
//         AND inv.Pre_Book_Invoice_Date <= ?
//         AND EXISTS (
//           SELECT 1
//           FROM pre_booked_order_tables pbot
//           WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
//         )
//         ${preBookSearch}
//       )

//       ORDER BY sort_time DESC
//       LIMIT ? OFFSET ?
//       `,
//       [
//         startDate,
//         endDate,
//         ...params,
//         startDate,
//         endDate,
//         ...params,
//         limit,
//         offset,
//       ]
//     );

//     /* ================= RIGHT ================= */
//     const [rightInvoices] = await connection.query(
//       `
//       (
//         SELECT
//           Invoice_Id,
//           Takeaway_Order_Id AS Order_Id,
//           Customer_Name,
//           Customer_Phone,
//           Amount,
//           NULL AS Service_Charge,
//           Discount,
//           Discount_Type,
//           created_at AS sort_time,
//           Invoice_Date,
//           'takeaway' AS orderType
//         FROM takeaway_invoices
//         WHERE created_at >= ? AND created_at <= ?
//         ${takeawaySearch}
//       )

//       UNION ALL

//       (
//         SELECT
//           inv.Pre_Book_Invoice_Id AS Invoice_Id,
//           inv.Pre_Book_Order_Id AS Order_Id,
//           c.Customer_Name,
//           c.Customer_Phone,
//           inv.Amount,
//           inv.Service_Charge,
//           inv.Discount,
//           inv.Discount_Type,
//           inv.Pre_Book_Invoice_Date AS sort_time,
//           inv.Pre_Book_Invoice_Date AS Invoice_Date,
//           'pre-book' AS orderType
//         FROM pre_book_orders_invoices inv
//         LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
//         WHERE inv.Pre_Book_Invoice_Date >= ? 
//         AND inv.Pre_Book_Invoice_Date <= ?
//         AND NOT EXISTS (
//           SELECT 1
//           FROM pre_booked_order_tables pbot
//           WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
//         )
//         ${preBookSearch}
//       )

//       ORDER BY sort_time DESC
//       LIMIT ? OFFSET ?
//       `,
//       [
//         startDate,
//         endDate,
//         ...params,
//         startDate,
//         endDate,
//         ...params,
//         limit,
//         offset,
//       ]
//     );

//     /* ================= TOTAL COUNTS (ALL PAGES) ================= */
//     // const [[leftCountRow]] = await connection.query(
//     //   `
//     //   SELECT COUNT(*) AS total FROM (
//     //     SELECT Invoice_Id
//     //     FROM invoices
//     //     WHERE DATE(created_at) BETWEEN ? AND ?
//     //     ${dineSearch}
//     //     UNION ALL
//     //     SELECT inv.Pre_Book_Invoice_Id
//     //     FROM pre_book_orders_invoices inv
//     //     JOIN pre_booked_order_tables pbot
//     //       ON pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
//     //     LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
//     //     WHERE DATE(inv.Pre_Book_Invoice_Date) BETWEEN ? AND ?
//     //     ${preBookSearch}
//     //   ) x
//     //   `,
//     //   [fromDate, toDate, ...params, fromDate, toDate, ...params]
//     // );
// // const [[leftCountRow]] = await connection.query(
// // `
// // SELECT COUNT(*) AS total FROM (
  
// //   SELECT Invoice_Id
// //   FROM invoices
// //   WHERE DATE(created_at) BETWEEN ? AND ?
// //   ${dineSearch}

// //   UNION ALL

// //   SELECT inv.Pre_Book_Invoice_Id
// //   FROM pre_book_orders_invoices inv
// //   LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
// //   WHERE DATE(inv.Pre_Book_Invoice_Date) BETWEEN ? AND ?
// //   AND EXISTS (
// //     SELECT 1
// //     FROM pre_booked_order_tables pbot
// //     WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
// //   )
// //   ${preBookSearch}

// // ) x
// // `,
// // [fromDate, toDate, ...params, fromDate, toDate, ...params]
// // );
// // const [[rightCountRow]] = await connection.query(
// // `
// // SELECT COUNT(*) AS total FROM (

// //   SELECT Invoice_Id
// //   FROM takeaway_invoices
// //   WHERE DATE(created_at) BETWEEN ? AND ?
// //   ${takeawaySearch}

// //   UNION ALL

// //   SELECT inv.Pre_Book_Invoice_Id
// //   FROM pre_book_orders_invoices inv
// //   LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
// //   WHERE DATE(inv.Pre_Book_Invoice_Date) BETWEEN ? AND ?
// //   AND NOT EXISTS (
// //     SELECT 1
// //     FROM pre_booked_order_tables pbot
// //     WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
// //   )
// //   ${preBookSearch}

// // ) x
// // `,
// // [fromDate, toDate, ...params, fromDate, toDate, ...params]
// // );
// const [[leftCountRow]] = await connection.query(
//       `
//       SELECT COUNT(*) AS total FROM (
//         SELECT Invoice_Id
//         FROM invoices
//         WHERE created_at >= ? AND created_at <= ?
//         ${dineSearch}

//         UNION ALL

//         SELECT inv.Pre_Book_Invoice_Id
//         FROM pre_book_orders_invoices inv
//         LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
//         WHERE inv.Pre_Book_Invoice_Date >= ? 
//         AND inv.Pre_Book_Invoice_Date <= ?
//         AND EXISTS (
//           SELECT 1 FROM pre_booked_order_tables pbot
//           WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
//         )
//         ${preBookSearch}
//       ) x
//       `,
//       [startDate, endDate, ...params, startDate, endDate, ...params]
//     );

//     const [[rightCountRow]] = await connection.query(
//       `
//       SELECT COUNT(*) AS total FROM (
//         SELECT Invoice_Id
//         FROM takeaway_invoices
//         WHERE created_at >= ? AND created_at <= ?
//         ${takeawaySearch}

//         UNION ALL

//         SELECT inv.Pre_Book_Invoice_Id
//         FROM pre_book_orders_invoices inv
//         LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
//         WHERE inv.Pre_Book_Invoice_Date >= ? 
//         AND inv.Pre_Book_Invoice_Date <= ?
//         AND NOT EXISTS (
//           SELECT 1 FROM pre_booked_order_tables pbot
//           WHERE pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
//         )
//         ${preBookSearch}
//       ) x
//       `,
//       [startDate, endDate, ...params, startDate, endDate, ...params]
//     );

//     // const [[rightCountRow]] = await connection.query(
//     //   `
//     //   SELECT COUNT(*) AS total FROM (
//     //     SELECT Invoice_Id
//     //     FROM takeaway_invoices
//     //     WHERE DATE(created_at) BETWEEN ? AND ?
//     //     ${takeawaySearch}
//     //     UNION ALL
//     //     SELECT inv.Pre_Book_Invoice_Id
//     //     FROM pre_book_orders_invoices inv
//     //     LEFT JOIN pre_booked_order_tables pbot
//     //       ON pbot.Pre_Booked_Order_Id = inv.Pre_Book_Order_Id
//     //     LEFT JOIN customers c ON c.Customer_Id = inv.Customer_Id
//     //     WHERE pbot.Pre_Booked_Order_Id IS NULL
//     //       AND DATE(inv.Pre_Book_Invoice_Date) BETWEEN ? AND ?
//     //     ${preBookSearch}
//     //   ) x
//     //   `,
//     //   [fromDate, toDate, ...params, fromDate, toDate, ...params]
//     // );

//     const totalInvoices = leftCountRow.total + rightCountRow.total;
//     const totalPages = Math.max(
//       Math.ceil(leftCountRow.total / limit),
//       Math.ceil(rightCountRow.total / limit)
//     );

//     /* ================= MERGE (UI SAME) ================= */
//     const pagedInvoices = [...leftInvoices, ...rightInvoices];

//     /* ================= IDS ================= */
//     const dineOrderIds = pagedInvoices.filter(i => i.orderType === "dine").map(i => i.Order_Id);
//     const takeawayOrderIds = pagedInvoices.filter(i => i.orderType === "takeaway").map(i => i.Order_Id);
//     const preBookOrderIds = pagedInvoices.filter(i => i.orderType === "pre-book").map(i => i.Order_Id);

//     /* ================= FETCH RELATED DATA ================= */
//     const [orders] = dineOrderIds.length
//       ? await connection.query(`SELECT * FROM orders WHERE Order_Id IN (?)`, [dineOrderIds])
//       : [[]];

//     const [ordersTakeaway] = takeawayOrderIds.length
//       ? await connection.query(`SELECT * FROM orders_takeaway WHERE Takeaway_Order_Id IN (?)`, [takeawayOrderIds])
//       : [[]];

//     const [preBookOrders] = preBookOrderIds.length
//       ? await connection.query(`SELECT * FROM pre_booked_orders WHERE Pre_Booked_Order_Id IN (?)`, [preBookOrderIds])
//       : [[]];

//     const [preBookTables] = preBookOrderIds.length
//       ? await connection.query(
//           `
//           SELECT pbot.Pre_Booked_Order_Id, t.Table_Id, t.Table_Name
//           FROM pre_booked_order_tables pbot
//           JOIN add_table t ON t.Table_Id = pbot.Table_Id
//           WHERE pbot.Pre_Booked_Order_Id IN (?)
//           `,
//           [preBookOrderIds]
//         )
//       : [[]];
//     /* ================= FETCH ITEMS ================= */

// const [dineItems] = dineOrderIds.length
//   ? await connection.query(
//       `
//       SELECT 
//         oi.Order_Id,
//         oi.Quantity,
//         oi.Price,
//         oi.Amount,
//         f.Item_Name,
//         f.Item_Category
//       FROM order_items oi
//       JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//       WHERE oi.Order_Id IN (?)
//       `,
//       [dineOrderIds]
//     )
//   : [[]];

// const [takeawayItems] = takeawayOrderIds.length
//   ? await connection.query(
//       `
//       SELECT 
//         oi.Takeaway_Order_Id,
//         oi.Quantity,
//         oi.Price,
//         oi.Amount,
//         f.Item_Name,
//         f.Item_Category
//       FROM order_takeaway_items oi
//       JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//       WHERE oi.Takeaway_Order_Id IN (?)
//       `,
//       [takeawayOrderIds]
//     )
//   : [[]];

// const [preBookItems] = preBookOrderIds.length
//   ? await connection.query(
//       `
//       SELECT 
//         oi.Pre_Booked_Order_Id,
//         oi.Quantity,
//         oi.Price,
//         oi.Amount,
//         f.Item_Name,
//         f.Item_Category
//       FROM pre_booked_order_items oi
//       JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//       WHERE oi.Pre_Booked_Order_Id IN (?)
//       `,
//       [preBookOrderIds]
//     )
//   : [[]];
//     /* ================= FINAL MAP (UNCHANGED SHAPE) ================= */
//     // const finalData = pagedInvoices.map(inv => {
//     //   if (inv.orderType === "dine") {
//     //     return {
//     //       invoice: inv,
//     //       order: orders.find(o => o.Order_Id === inv.Order_Id) || null,
//     //       items: [],
//     //       tables: [],
//     //       kitchens: [],
//     //       orderType: "dine",
//     //     };
//     //   }

//     //   if (inv.orderType === "takeaway") {
//     //     return {
//     //       invoice: inv,
//     //       order: ordersTakeaway.find(o => o.Takeaway_Order_Id === inv.Order_Id) || null,
//     //       items: [],
//     //       tables: [],
//     //       kitchens: [],
//     //       orderType: "takeaway",
//     //     };
//     //   }

//     //   const pbTables = preBookTables.filter(t => t.Pre_Booked_Order_Id === inv.Order_Id);

//     //   return {
//     //     invoice: inv,
//     //     order: preBookOrders.find(o => o.Pre_Booked_Order_Id === inv.Order_Id) || null,
//     //     items: [],
//     //     tables: pbTables,
//     //     kitchens: [],
//     //     orderType: pbTables.length > 0 ? "dine" : "takeaway",
//     //     originalOrderType: "pre-book",
//     //   };
//     // });
// const finalData = await Promise.all(
//   pagedInvoices.map(async (inv) => {

//     let orderItems = [];
//     let orderTables = [];
//     let orderType = inv.orderType;

//     /* ===== DINE ===== */
//     if (inv.orderType === "dine") {
//       orderItems = dineItems.filter(i => i.Order_Id === inv.Order_Id);
//     }

//     /* ===== TAKEAWAY ===== */
//     else if (inv.orderType === "takeaway") {
//       orderItems = takeawayItems.filter(
//         i => i.Takeaway_Order_Id === inv.Order_Id
//       );
//     }

//     /* ===== PRE-BOOK ===== */
//     else {
//       orderItems = preBookItems.filter(
//         i => i.Pre_Booked_Order_Id === inv.Order_Id
//       );

//       const pbTables = preBookTables.filter(
//         t => t.Pre_Booked_Order_Id === inv.Order_Id
//       );

//       orderTables = pbTables;

//       orderType = pbTables.length > 0 ? "dine" : "takeaway";
//     }

//     /* ===== FORMAT ITEMS FOR KOT ===== */
//     const formattedItems = orderItems.map(i => ({
//       Item_Name: i.Item_Name,
//       Item_Quantity: i.Quantity || 1,
//     }));
//     const subTotal = orderItems.reduce(
//   (sum, item) => sum + Number(item.Amount || 0),
//   0
// );


//                                                                                                                                                                                                                                                                                                                                                                                                                                                                       let serviceChargeAmount = 0;
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                       let discountAmount = 0;

//                                                                                                                                                                                                                                                                                                                                                                                                                                                                       if (inv.Service_Charge_Type === "percentage") {
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                         serviceChargeAmount = (subTotal * Number(inv.Service_Charge || 0)) / 100;
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                       } else {
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                         serviceChargeAmount = Number(inv.Service_Charge || 0);
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                       }

//                                                                                                                                                                                                                                                                                                                                                                                                                                                                       if (inv.Discount_Type === "percentage") {
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                         discountAmount = (subTotal * Number(inv.Discount || 0)) / 100;
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                       } else {
//                                                                                                                                                                                                                                                                                                                                                                                                                                                                         discountAmount = Number(inv.Discount || 0);
//                                                                                                                                                                                                                                                                                                                                                                                                             }
    
    
    
//     /* ================= KOT ================= */ 
// const kotResult = formattedItems.length
//       ? await checkDineInItemsElligibleForKOTPrint(formattedItems)
//       : { success: true, elligibleItems: {} };

//     return {
//       invoice: {
//         ...inv,
//         Service_Charge_Amount: serviceChargeAmount,
//         Discount_Amount: discountAmount
//       },


//       order:
//         inv.orderType === "dine"
//           ? orders.find(o => o.Order_Id === inv.Order_Id) || null
//           : inv.orderType === "takeaway"
//           ? ordersTakeaway.find(o => o.Takeaway_Order_Id === inv.Order_Id) || null
//           : preBookOrders.find(o => o.Pre_Booked_Order_Id === inv.Order_Id) || null,

//       items: orderItems,
//       tables: orderTables,

//       kitchens: kotResult.success
//         ? kotResult.elligibleItems
//         : {},

//       orderType,
//       originalOrderType: inv.orderType,
//     };
//   })
// );

//     /* ================= RESPONSE (UI SAFE) ================= */
//     res.status(200).json({
//       success: true,
//       fromDate,
//       toDate,
//       page,
//       pageSize: limit,
//       totalInvoices,
//       totalPages,
//       dineCount: leftCountRow.total,
//       takeawayCount: rightCountRow.total,
//       preBookCount: null,
//       data: finalData,
//       totalCount: totalInvoices,
//     });
//   } catch (err) {
//     console.error("❌ Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

//changed takeaway order

//new takeaway system
// const takeawayAddOrdersAndGenerateInvoices = async (req, res, next) => {
//   let connection;

//   try {
//     const { 
//       userId,
//       items,
//       Sub_Total,
//       Amount,
//       Customer_Name,
//       Customer_Phone,
//       Discount_Type,
//       Discount,
//       Payment_Type,
//       Final_Amount
//     } = req.body;
//     console.log("req.body",req.body);
// const normalizedCustomerName =Customer_Name && Customer_Name.trim() !== ""
//     ? Customer_Name.trim()
//     : null;
//     // --------------------------------------------
//     // VALIDATION
//     // --------------------------------------------
//     if (!userId)
//       return res.status(400).json({ success: false, message: "User ID is required." });
//   if( !Customer_Phone){
//             return res.status(400).json({
//                 success: false,
//                 message: "Customer phone number is required.",
//             })
//         }
//     if (!items?.length)
//       return res.status(400).json({ success: false, message: "At least one item is required." });

//     if (Sub_Total == null || Final_Amount == null)
//       return res.status(400).json({
//         success: false,
//         message: "Sub Total and Final Amount are required."
//       });

//     connection = await db.getConnection();
//     await connection.beginTransaction();
// let Customer_Id;

//     const [existingCustomer] = await connection.query(
//       `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
//       [Customer_Phone]
//     );

//     if (existingCustomer.length > 0) {
//       // ✔ REUSE EXISTING CUSTOMER
//       Customer_Id = existingCustomer[0].Customer_Id;
//     } 
//     else {
//       //  CREATE NEW CUSTOMER
//       Customer_Id = await generateNextId(
//         connection,
//         "CUST",
//         "Customer_Id",
//         "customers"
//       );

//       await connection.query(
//         `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
//          VALUES (?, ?, ?)`,
//         [Customer_Id, normalizedCustomerName , Customer_Phone]
//       );
//     }
       
//     // --------------------------------------------
//     // 1️⃣ Generate Takeaway Order ID
//     // --------------------------------------------
//     const Takeaway_Order_Id = await generateNextId(
//       connection,
//       "TKODR",
//       "Takeaway_Order_Id",
//       "orders_takeaway"
//     );

//     // --------------------------------------------
//     // 2️⃣ Insert Into orders_takeaway
//     // --------------------------------------------
//     await connection.query(
//       `INSERT INTO orders_takeaway 
//        (Takeaway_Order_Id, User_Id,Customer_Id, Status, Sub_Total, Amount, Payment_Status)
//        VALUES (?, ?, ?,'hold', ?, ?, 'pending')`,
//       [Takeaway_Order_Id, userId,Customer_Id, Sub_Total, Final_Amount]
//     );

//     // --------------------------------------------
//     // 3️⃣ Generate KOT ID & Create Kitchen Order
//     // --------------------------------------------
//     const KOT_Id = await generateNextId(connection, "KOT", "KOT_Id", "kitchen_orders");

//     await connection.query(
//       `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
//        VALUES (?, ?, 'pending')`,
//       [KOT_Id, Takeaway_Order_Id]
//     );

//     // --------------------------------------------
//     // 4️⃣ Insert Items (Order + Kitchen)
//     // --------------------------------------------
//     for (let item of items) {

//       if (!item.Item_Quantity || item.Item_Quantity <= 0){
//         await connection.rollback();
//         return res.status(400).json({
//           success: false,
//           message: `Invalid quantity for item: ${item.Item_Name}`
//         });
//       }
//       // Fetch Item_Id
//       const [ItemRow] = await connection.query(
//         "SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1",
//         [item.Item_Name]
//       );

//       if (!ItemRow.length){
//              await connection.rollback();
//     return res.status(404).json({ success: false, message: "Item not found." });
//       }
    

//       const Item_Id = ItemRow[0].Item_Id;

//       // Insert into order_takeaway_items
//       const Order_Item_Id = await generateNextId(
//         connection,
//         "TKODRITM",
//         "Takeaway_Order_Item_Id",
//         "order_takeaway_items"
//       );

//       await connection.query(
//         `INSERT INTO order_takeaway_items 
//          (Takeaway_Order_Item_Id, Takeaway_Order_Id, Item_Id, Quantity, Price, Amount)
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [
//           Order_Item_Id,
//           Takeaway_Order_Id,
//           Item_Id,
//           item.Item_Quantity,
//           item.Item_Price,
//           item.Amount
//         ]
//       );

//       // --------------------------------------------
//       // 🍽 INSERT INTO KITCHEN ORDER ITEMS
//       // (One row per quantity — same model as dine-in)
//       // --------------------------------------------
//       // for (let q = 0; q < item.Item_Quantity; q++) {
//         const KOT_Item_Id = await generateNextId(
//           connection,
//           "KOTITM",
//           "KOT_Item_Id",
//           "kitchen_order_items"
//         );

//         await connection.query(
//           `INSERT INTO kitchen_order_items 
//            (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
//            VALUES (?, ?, ?, ?, ?, 'pending')`,
//           [
//             KOT_Item_Id,
//             KOT_Id,
//             Item_Id,
//             item.Item_Name,
//             item.Item_Quantity
//           ]
//         );
      
//     }

//     // --------------------------------------------
//     // 5️⃣ Generate Invoice
//     // --------------------------------------------
// //     const Invoice_Id = await generateNextId(
// //       connection,
// //       "TKINV",
// //       "Invoice_Id",
// //       "takeaway_invoices"
// //     );

// //     const [fy] = await connection.query(
// //       `SELECT Financial_Year 
// //        FROM financial_year 
// //        WHERE Current_Financial_Year = 1
// //        LIMIT 1`
// //     );
// // if (!fy.length) {
// //   await connection.rollback();
// //   return res.status(400).json({
// //     message: "No active financial year found."
// //   });
// // }

    

// //     const activeFY = fy[0].Financial_Year;

// //     await connection.query(
// //       `INSERT INTO takeaway_invoices
// //        (Invoice_Id, Takeaway_Order_Id, Invoice_Date, Financial_Year, Amount,
// //         Customer_Name, Customer_Phone,Customer_Id, Discount_Type, Discount, Payment_Type)
// //        VALUES (?, ?, NOW(), ?, ?, ?,?, ?, ?, ?, ?)`,
// //       [
// //         Invoice_Id,
// //         Takeaway_Order_Id,
// //         activeFY,
// //         Final_Amount,
// //         normalizedCustomerName,
// //         Customer_Phone || null,
// //         Customer_Id,
// //         Discount_Type ?? "percentage",
// //         Discount || 0,
// //         Payment_Type ?? "cash"
// //       ]
// //     );

  
//     const [kotItems] = await connection.query(
//       `
//       SELECT
//         koi.KOT_Item_Id,
//         koi.Item_Id,
//         koi.Item_Name,
//         koi.Quantity,
//         koi.Item_Status,
//         fi.Item_Category
//       FROM kitchen_order_items koi
//       JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
//       WHERE koi.KOT_Id = ?
//       `,
//       [KOT_Id]
//     );

    

//     // kotItems.forEach((item) => {
//     //   if (!itemsByCategory[item.Item_Category]) {
//     //     itemsByCategory[item.Item_Category] = [];
//     //   }
//     //   itemsByCategory[item.Item_Category].push(item);
//     // });

//     // await connection.commit();

//     // /* ------------------------------------------------
//     //    🔔 10️⃣ SOCKET → CATEGORY STAFF ONLY
//     // ------------------------------------------------ */
//     // Object.entries(itemsByCategory).forEach(([category, items]) => {
//     //   io.to(`category_${category}`).emit("new_kitchen_order", {
//     //     KOT_Id,
//     //     Order_Id: Takeaway_Order_Id,
//     //     Order_Type: "takeaway",
//     //     Status: "pending",
//     //     items,
//     //   });
//     // });
//     const itemsByCategory = {};

// kotItems.forEach(item => {
//   if (!itemsByCategory[item.Item_Category]) {
//     itemsByCategory[item.Item_Category] = [];
//   }
//   itemsByCategory[item.Item_Category].push({
//     KOT_Item_Id: item.KOT_Item_Id,
//     Item_Id: item.Item_Id,
//     Item_Name: item.Item_Name,
//     Quantity: item.Quantity,
//     Item_Status: item.Item_Status,
//   });
// });

// Object.entries(itemsByCategory).forEach(([category, items]) => {
//   io.to(`category_${category}`).emit("new_kitchen_order", {
//     KOT_Id,
//     Order_Id: Takeaway_Order_Id,
//     Order_Type: "takeaway",
//     Status: "pending",
//     items,
//   });
// });
// await connection.commit();
// return res.status(200).json({
//       success: true,
//       message: " Order completed.",
    
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
const getTakeawayOrderDetails = async (req, res, next) => {
  let connection;

  try {
    const { Takeaway_Order_Id } = req.params;

    if (!Takeaway_Order_Id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required."
      });
    }

    connection = await db.getConnection();

    // 1️⃣ ORDER
    const [orderResult] = await connection.query(
      `SELECT * FROM orders_takeaway WHERE Takeaway_Order_Id = ?`,
      [Takeaway_Order_Id]
    );

    if (orderResult.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const order = orderResult[0];

    // 2️⃣ FETCH CUSTOMER DETAILS
    const [customerRows] = await connection.query(
      `SELECT Customer_Id, Customer_Name, Customer_Phone
       FROM customers 
       WHERE Customer_Id = ?`,
      [order.Customer_Id]
    );
if(customerRows.length === 0){
  return res.status(404).json({ success: false, message: "Customer not found" });
}
    const customer = customerRows[0] ;
    // 2️⃣ TABLES
    // const [tables] = await connection.query(
    //   `SELECT  t.Table_Id, t.Table_Name, t.Start_Time AS Table_Start_Time
    //    FROM order_tables ot
    //    JOIN add_table t ON t.Table_Id = ot.Table_Id
    //    WHERE ot.Order_Id = ?`,
    //   [Order_Id]
    // );

    // 3️⃣ ORDER ITEMS (menu structure)
    const [orderItems] = await connection.query(
      `
      SELECT 
     
        oi.Takeaway_Order_Item_Id,
        oi.Item_Id,
        fi.Item_Name,
        fi.Item_Image,
        fi.Item_Category,
        fi.Tax_Type,
        oi.Quantity,
        oi.Price,
        oi.Amount
      FROM order_takeaway_items oi
      JOIN add_food_item fi ON fi.Item_Id = oi.Item_Id
      WHERE oi.Takeaway_Order_Id = ?
      `,
      [Takeaway_Order_Id]
    );

    // 4️⃣ FETCH KOT
    const [[kot]] = await connection.query(
      `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
      [Takeaway_Order_Id]
    );

    let KOT_Id = kot?.KOT_Id || null;
    let kitchenItems = [];

    if (KOT_Id) {
      // 5️⃣ FETCH ALL KITCHEN ROWS (important!)
      const [kotRows] = await connection.query(
        `
        SELECT 
          KOT_Item_Id,
          Item_Id,
          Item_Name,
          Quantity,
          Item_Status,
          updated_at
        FROM kitchen_order_items
        WHERE KOT_Id = ?
        `,
        [KOT_Id]
      );

      kitchenItems = kotRows;
    }

    // 6️⃣ RETURN SEPARATELY (❌ do NOT merge by Item_Id)
    return res.json({
      success: true,
      Takeaway_Order_Id,
      customer,
      

      // original order items (for billing UI)
      orderItems,

      // kitchen rows (1 row = 1 cooking item)
      kitchenItems,

      KOT_Id
    });

  } catch (err) {
    console.error("❌ Error fetching takeaway order:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

// const updateTakeawayOrder = async (req, res, next) => {
//   let connection;

//   try {
//     const { Takeaway_Order_Id } = req.params;
//     const { items, Sub_Total, Amount } = req.body;

//     if (!Takeaway_Order_Id) {
//       return res.status(400).json({ success: false, message: "TakeawayOrder ID missing" });
//     }

//     if (!Array.isArray(items)) {
//       return res.status(400).json({ success: false, message: "Items required" });
//     }

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     /* ---------------------------------------------------
//        1️⃣ UPDATE ORDER TOTALS
//     --------------------------------------------------- */
//     await connection.query(
//       `UPDATE orders_takeaway SET Sub_Total = ?, Amount = ? WHERE Takeaway_Order_Id = ?`,
//       [Sub_Total, Amount, Takeaway_Order_Id]
//     );

//     /* ---------------------------------------------------
//        2️⃣ FETCH OR CREATE KOT
//     --------------------------------------------------- */
//     const [[existingKOT]] = await connection.query(
//       `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
//       [Takeaway_Order_Id]
//     );

//     let KOT_Id;
//     if (existingKOT) {
//       KOT_Id = existingKOT.KOT_Id;
//     } else {
//       KOT_Id = await generateNextId(connection, "KOT", "KOT_Id", "kitchen_orders");
//       await connection.query(
//         `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
//          VALUES (?, ?, 'pending')`,
//         [KOT_Id, Takeaway_Order_Id]
//       );
//     }

//     /* ---------------------------------------------------
//        3️⃣ FETCH EXISTING FRONTDESK ITEMS
//     --------------------------------------------------- */
//     const [existingOrderItems] = await connection.query(
//       `SELECT oi.Item_Id, oi.Quantity, afi.Item_Name
//        FROM order_takeaway_items oi
//        JOIN add_food_item afi ON oi.Item_Id = afi.Item_Id
//        WHERE oi.Takeaway_Order_Id = ?`,
//       [Takeaway_Order_Id]
//     );

//     const existingOrderMap = {};
//     existingOrderItems.forEach(row => {
//       existingOrderMap[row.Item_Id] = {
//         name: row.Item_Name,
//         quantity: Number(row.Quantity),
//       };
//     });

//     /* ---------------------------------------------------
//        4️⃣ BUILD NEW ITEMS MAP (FROM FRONTEND)
//     --------------------------------------------------- */
//     const newItemMap = {};
//     items.forEach(item => {
//       if (item.Item_Name && item.Item_Quantity > 0) {
//         newItemMap[item.Item_Name] = Number(item.Item_Quantity);
//       }
//     });

//     /* ---------------------------------------------------
//        5️⃣ FIND REMOVED ITEMS
//     --------------------------------------------------- */
//     const removedItemIds = [];

//     for (const [itemId, data] of Object.entries(existingOrderMap)) {
//       const stillExists = items.some(i => i.Item_Name === data.name);
//       if (!stillExists) {
//         removedItemIds.push(itemId);
//       }
//     }

//     /* ---------------------------------------------------
//        6️⃣ DELETE REMOVED ITEMS (FRONTDESK + KITCHEN)
//     --------------------------------------------------- */
//     if (removedItemIds.length > 0) {
//       await connection.query(
//         `DELETE FROM order_takeaway_items
//          WHERE Takeaway_Order_Id = ? AND Item_Id IN (?)`,
//         [Takeaway_Order_Id, removedItemIds]
//       );

//       await connection.query(
//         `DELETE FROM kitchen_order_items
//          WHERE KOT_Id = ? AND Item_Id IN (?)`,
//         [KOT_Id, removedItemIds]
//       );
//     }

//     /* ---------------------------------------------------
//        7️⃣ CLEAR & REINSERT FRONTDESK ITEMS
//     --------------------------------------------------- */
//     await connection.query(
//       `DELETE FROM order_takeaway_items WHERE Takeaway_Order_Id = ?`,
//       [Takeaway_Order_Id]
//     );

//     /* ---------------------------------------------------
//        8️⃣ FETCH EXISTING KITCHEN ITEMS (QTY MAP)
//     --------------------------------------------------- */
//     const [existingKitchenItems] = await connection.query(
//       `SELECT Item_Id, SUM(Quantity) AS qty
//        FROM kitchen_order_items
//        WHERE KOT_Id = ?
//        GROUP BY Item_Id`,
//       [KOT_Id]
//     );

//     const kitchenQtyMap = {};
//     existingKitchenItems.forEach(row => {
//       kitchenQtyMap[row.Item_Id] = Number(row.qty) || 0;
//     });

//     /* ---------------------------------------------------
//        9️⃣ SOCKET NOTIFICATION MAP
//     --------------------------------------------------- */
//     const notifyByCategory = {};

//     /* ---------------------------------------------------
//        🔟 PROCESS ITEMS
//     --------------------------------------------------- */
//     for (const item of items) {
//       const { Item_Name, Item_Quantity, Item_Price, Amount: ItemAmount } = item;

//       if (!Item_Name || Item_Quantity <= 0) continue;

//       const [[dbItem]] = await connection.query(
//         `SELECT Item_Id, Item_Category
//          FROM add_food_item
//          WHERE Item_Name = ?
//          LIMIT 1`,
//         [Item_Name]
//       );

//       if (!dbItem) continue;

//       const Item_Id = dbItem.Item_Id;
//       const Category = dbItem.Item_Category;

//       /* --------- FRONTDESK INSERT --------- */
//       const Takeaway_Order_Item_Id = await generateNextId(
//         connection,
//         "TKODRITM",
//         "Takeaway_Order_Item_Id",
//         "order_takeaway_items"
//       );

//       await connection.query(
//         `INSERT INTO order_takeaway_items
//          (Takeaway_Order_Item_Id, Takeaway_Order_Id, Item_Id, Quantity, Price, Amount)
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [Takeaway_Order_Item_Id, Takeaway_Order_Id, Item_Id, Item_Quantity, Item_Price, ItemAmount]
//       );

//       /* --------- KITCHEN DELTA LOGIC --------- */
//       const oldQty = kitchenQtyMap[Item_Id] || 0;
//       const newQty = Item_Quantity - oldQty;

//       if (newQty <= 0) continue;

//       const KOT_Item_Id = await generateNextId(
//         connection,
//         "KOTITM",
//         "KOT_Item_Id",
//         "kitchen_order_items"
//       );

//       await connection.query(
//         `INSERT INTO kitchen_order_items
//          (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
//          VALUES (?, ?, ?, ?, ?, 'pending')`,
//         [KOT_Item_Id, KOT_Id, Item_Id, Item_Name, newQty]
//       );

//       notifyByCategory[Category] ??= [];
//       notifyByCategory[Category].push({
//         KOT_Item_Id,
//         Item_Id,
//         Item_Name,
//         Item_Category: Category,
//         Quantity: newQty,
//         Item_Status: "pending",
//       });
//     }

//     /* ---------------------------------------------------
//        1️⃣1️⃣ COMMIT
//     --------------------------------------------------- */
//     await connection.commit();

//     /* ---------------------------------------------------
//        1️⃣2️⃣ SOCKET NOTIFY (CATEGORY-WISE)
//     --------------------------------------------------- */
//     Object.entries(notifyByCategory).forEach(([category, items]) => {
//       io.to(`category_${category}`).emit("new_kitchen_order", {
//         KOT_Id,
//         Order_Id: Takeaway_Order_Id,
//         Order_Type: "takeaway",
//         Status: "pending",
//         items,
//       });
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Order updated successfully",
//       KOT_Id,
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Update Order Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

const updateTakeawayOrder = async (req, res, next) => {
  let connection;

  try {
    const { Takeaway_Order_Id } = req.params;
    const { items, Sub_Total, Amount } = req.body;

    if (!Takeaway_Order_Id) {
      return res.status(400).json({ success: false, message: "TakeawayOrder ID missing" });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Items required" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    /* ---------------------------------------------------
       1️⃣ UPDATE ORDER TOTALS
    --------------------------------------------------- */
    await connection.query(
      `UPDATE orders_takeaway 
       SET Sub_Total = ?, Amount = ? 
       WHERE Takeaway_Order_Id = ?`,
      [Sub_Total, Amount, Takeaway_Order_Id]
    );

    /* ---------------------------------------------------
       2️⃣ FETCH OR CREATE KOT
    --------------------------------------------------- */
    const [[existingKOT]] = await connection.query(
      `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
      [Takeaway_Order_Id]
    );

    let KOT_Id;
    if (existingKOT) {
      KOT_Id = existingKOT.KOT_Id;
    } else {
      KOT_Id = await generateNextId(connection, "KOT", "KOT_Id", "kitchen_orders");
      await connection.query(
        `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
         VALUES (?, ?, 'pending')`,
        [KOT_Id, Takeaway_Order_Id]
      );
    }

    /* ---------------------------------------------------
       3️⃣ CLEAR FRONTDESK ITEMS
    --------------------------------------------------- */
    await connection.query(
      `DELETE FROM order_takeaway_items WHERE Takeaway_Order_Id = ?`,
      [Takeaway_Order_Id]
    );

    /* ---------------------------------------------------
       4️⃣ CLEAR KITCHEN ITEMS (🔥 KEY FIX 🔥)
    --------------------------------------------------- */
    await connection.query(
      `DELETE FROM kitchen_order_items WHERE KOT_Id = ?`,
      [KOT_Id]
    );

    /* ---------------------------------------------------
       5️⃣ SOCKET NOTIFICATION MAP
    --------------------------------------------------- */
    const notifyByCategory = {};

    /* ---------------------------------------------------
       6️⃣ REINSERT ITEMS (FRONTDESK + KITCHEN)
    --------------------------------------------------- */
    for (const item of items) {
      const { Item_Name, Item_Quantity, Item_Price, Amount: ItemAmount } = item;

      if (!Item_Name || Item_Quantity <= 0) continue;

      // Fetch Item ID & Category
      const [[dbItem]] = await connection.query(
        `SELECT Item_Id, Item_Category 
         FROM add_food_item 
         WHERE Item_Name = ? 
         LIMIT 1`,
        [Item_Name]
      );

      if (!dbItem) continue;

      const { Item_Id, Item_Category } = dbItem;

      /* --------- FRONTDESK INSERT --------- */
      const Takeaway_Order_Item_Id = await generateNextId(
        connection,
        "TKODRITM",
        "Takeaway_Order_Item_Id",
        "order_takeaway_items"
      );

      await connection.query(
        `INSERT INTO order_takeaway_items
         (Takeaway_Order_Item_Id, Takeaway_Order_Id, Item_Id, Quantity, Price, Amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          Takeaway_Order_Item_Id,
          Takeaway_Order_Id,
          Item_Id,
          Item_Quantity,
          Item_Price,
          ItemAmount
        ]
      );

      /* --------- KITCHEN INSERT (FINAL QTY) --------- */
      const KOT_Item_Id = await generateNextId(
        connection,
        "KOTITM",
        "KOT_Item_Id",
        "kitchen_order_items"
      );

      await connection.query(
        `INSERT INTO kitchen_order_items
         (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [
          KOT_Item_Id,
          KOT_Id,
          Item_Id,
          Item_Name,
          Item_Quantity
        ]
      );

      /* --------- SOCKET PAYLOAD --------- */
      notifyByCategory[Item_Category] ??= [];
      notifyByCategory[Item_Category].push({
        KOT_Item_Id,
        Item_Id,
        Item_Name,
        Item_Category,
        Quantity: Item_Quantity,
        Item_Status: "pending",
      });
    }

    /* ---------------------------------------------------
       7️⃣ COMMIT
    --------------------------------------------------- */
    await connection.commit();

    /* ---------------------------------------------------
       8️⃣ SOCKET EMIT (CATEGORY-WISE)
    --------------------------------------------------- */
    Object.entries(notifyByCategory).forEach(([category, items]) => {
      io.to(`category_${category}`).emit("new_kitchen_order", {
        KOT_Id,
        Order_Id: Takeaway_Order_Id,
        Order_Type: "takeaway",
        Status: "pending",
        items,
      });
    });

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      KOT_Id,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Update Order Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

// const checkItemElligibleForKOTPrint = async (req, res, next) => {
//   let connection;

//   try {
//     const { items } = req.body;

//     console.log("req.body", req.body);

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Items are required",
//       });
//     }

//     connection = await db.getConnection();

//     /* ---------------- FETCH ITEM CATEGORIES FROM DB ---------------- */
//     const [itemCategories] = await connection.query(
//       `SELECT Item_Name, Item_Category
//        FROM add_food_item
//        WHERE Item_Name IN (?)`,
//       [items.map((i) => i.Item_Name)]
//     );

//     /* ---------------- FETCH ELIGIBLE KITCHEN CATEGORIES ---------------- */
//     const [elligibleCategories] = await connection.query(
//       `SELECT DISTINCT Category_Names
//        FROM kitchen_staff_categories`
//     );

//     const elligibleCategorySet = new Set(
//       elligibleCategories.map((row) => row.Category_Names)
//     );

//     /* ---------------- MAP ITEM QUANTITY FROM REQUEST ---------------- */
//     const itemQuantityMap = new Map(
//       items.map((i) => [
//         i.Item_Name,
//         i.Item_Quantity || 1,
//       ])
//     );

//     /* ---------------- DETERMINE ELIGIBILITY ---------------- */
//     const elligibleItems = [];
//     const nonElligibleItems = [];

//     itemCategories.forEach((item) => {
//       const enrichedItem = {
//         Item_Name: item.Item_Name,
//         Item_Category: item.Item_Category,
//         Item_Quantity: itemQuantityMap.get(item.Item_Name) || 1,
//       };

//       if (elligibleCategorySet.has(item.Item_Category)) {
//         elligibleItems.push(enrichedItem);
//       } else {
//         nonElligibleItems.push(enrichedItem);
//       }
//     });

//     return res.status(200).json({
//       success: true,
//       elligibleForKOT: elligibleItems.length > 0,
//       elligibleItems,
//       nonElligibleItems,
//     });

//   } catch (err) {
//     console.error("❌ Error checking KOT print eligibility:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

// const checkItemElligibleForKOTPrint = async (req, res, next) => {
//   let connection;

//   try {
//     const { items } = req.body;

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Items are required",
//       });
//     }

//     connection = await db.getConnection();

//     /* ---------------- FETCH ITEM CATEGORIES ---------------- */
//     const [itemRows] = await connection.query(
//       `SELECT Item_Name, Item_Category
//        FROM add_food_item
//        WHERE Item_Name IN (?) AND is_deleted = 0`,
//       [items.map((i) => i.Item_Name)]
//     );

//     /* ---------------- FETCH KITCHEN STAFF ---------------- */
//     const [staffRows] = await connection.query(
//       `SELECT User_Id, Category_Names
//        FROM kitchen_staff_categories`
//     );

//     /* ---------------- CATEGORY → USER MAP (FIXED) ---------------- */
//     const categoryToUserMap = new Map();

//     staffRows.forEach((row) => {
//       if (!row.Category_Names) return;

//       row.Category_Names
//         .split(",")                    // 🔥 split
//         .map((c) => c.trim())          // 🔥 trim
//         .filter(Boolean)               // 🔥 safety
//         .forEach((category) => {
//           categoryToUserMap.set(category, row.User_Id);
//         });
//     });

//     /* ---------------- ITEM → QTY MAP ---------------- */
//     const quantityMap = new Map(
//       items.map((i) => [
//         i.Item_Name,
//         Number(i.Item_Quantity) > 0 ? Number(i.Item_Quantity) : 1,
//       ])
//     );

//     /* ---------------- USER → KITCHEN MAP ---------------- */
//     const userToKitchenMap = new Map();
//     let kitchenCounter = 1;

//     const elligibleItems = {}; // frontend-compatible

//     /* ---------------- PROCESS ITEMS ---------------- */
//     itemRows.forEach((item) => {
//       const userId = categoryToUserMap.get(item.Item_Category);
//       if (!userId) return; // ❌ category not assigned to any kitchen

//       if (!userToKitchenMap.has(userId)) {
//         userToKitchenMap.set(userId, `Kitchen ${kitchenCounter++}`);
//       }

//       const kitchenName = userToKitchenMap.get(userId);

//       if (!elligibleItems[kitchenName]) {
//         elligibleItems[kitchenName] = [];
//       }

//       elligibleItems[kitchenName].push({
//         Item_Name: item.Item_Name,
//         Item_Category: item.Item_Category,
//         Item_Quantity: quantityMap.get(item.Item_Name),
//       });
//     });

//     return res.status(200).json({
//       success: true,
//       elligibleItems, // ✅ SAME KEY, NO FRONTEND CHANGE
//     });

//   } catch (err) {
//     console.error("❌ Error checking KOT eligibility:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
// const checkItemElligibleForKOTPrint = async (req, res, next) => {
//   let connection;

//   try {
//     const { items } = req.body;

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Items are required",
//       });
//     }

//     connection = await db.getConnection();

//     /* ---------------- FETCH ITEM CATEGORIES ---------------- */
//     const [itemRows] = await connection.query(
//       `
//       SELECT Item_Name, Item_Category
//       FROM add_food_item
//       WHERE Item_Name IN (?) AND is_deleted = 0
//       `,
//       [items.map((i) => i.Item_Name)]
//     );

//     /* ---------------- FETCH KITCHEN STAFF (STABLE ORDER) ---------------- */
//     const [staffRows] = await connection.query(
//       `
//       SELECT Category_Names
//       FROM kitchen_staff_categories
//       ORDER BY created_at ASC
//       `
//     );

//     /* ---------------- CATEGORY → KITCHEN MAP ---------------- */
//     const categoryToKitchenMap = new Map();

//     staffRows.forEach((row, index) => {
//       if (!row.Category_Names) return;

//       const kitchenName = `Kitchen ${index + 1}`; // ✅ FIXED & STABLE

//       row.Category_Names
//         .split(",")
//         .map((c) => c.trim())
//         .filter(Boolean)
//         .forEach((category) => {
//           categoryToKitchenMap.set(category, kitchenName);
//         });
//     });

//     /* ---------------- ITEM → QTY MAP ---------------- */
//     const quantityMap = new Map(
//       items.map((i) => [
//         i.Item_Name,
//         Number(i.Item_Quantity) > 0 ? Number(i.Item_Quantity) : 1,
//       ])
//     );

//     /* ---------------- BUILD FINAL RESPONSE ---------------- */
//     const elligibleItems = {};

//     itemRows.forEach((item) => {
//       const kitchenName = categoryToKitchenMap.get(item.Item_Category);
//       if (!kitchenName) return; // category not assigned to any kitchen

//       if (!elligibleItems[kitchenName]) {
//         elligibleItems[kitchenName] = [];
//       }

//       elligibleItems[kitchenName].push({
//         Item_Name: item.Item_Name,
//         Item_Category: item.Item_Category,
//         Item_Quantity: quantityMap.get(item.Item_Name),
//       });
//     });

//     return res.status(200).json({
//       success: true,
//       elligibleItems, // ✅ Kitchen 1 / Kitchen 2
//     });

//   } catch (err) {
//     console.error("❌ Error checking KOT eligibility:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
const checkItemElligibleForKOTPrint = async (req, res, next) => {
  let connection;

  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required",
      });
    }

    connection = await db.getConnection();

    /* --------------------------------------------------
       1️⃣ FETCH ITEM → CATEGORY
    -------------------------------------------------- */
    const [itemRows] = await connection.query(
      `
      SELECT Item_Name, Item_Category
      FROM add_food_item
      WHERE Item_Name IN (?) AND is_deleted = 0
      `,
      [items.map((i) => i.Item_Name)]
    );

    /* --------------------------------------------------
       2️⃣ FETCH KITCHEN STAFF WITH NAMES
    -------------------------------------------------- */
    const [staffRows] = await connection.query(
      `
      SELECT 
        ksc.Category_Names,
        u.name AS Kitchen_Name
      FROM kitchen_staff_categories ksc
      JOIN users u ON u.User_Id = ksc.User_Id
      ORDER BY ksc.created_at ASC
      `
    );

    /* --------------------------------------------------
       3️⃣ CATEGORY → KITCHEN NAME MAP
    -------------------------------------------------- */
    const categoryToKitchenMap = new Map();

    staffRows.forEach((row) => {
      if (!row.Category_Names || !row.Kitchen_Name) return;

      row.Category_Names
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .forEach((category) => {
          categoryToKitchenMap.set(category, row.Kitchen_Name);
        });
    });

    /* --------------------------------------------------
       4️⃣ ITEM → QUANTITY MAP
    -------------------------------------------------- */
    const quantityMap = new Map(
      items.map((i) => [
        i.Item_Name,
        Number(i.Item_Quantity) > 0 ? Number(i.Item_Quantity) : 1,
      ])
    );

    /* --------------------------------------------------
       5️⃣ BUILD FINAL RESPONSE (KITCHEN-WISE)
    -------------------------------------------------- */
    const elligibleItems = {};

    itemRows.forEach((item) => {
      const kitchenName = categoryToKitchenMap.get(item.Item_Category);
      if (!kitchenName) return; // category not assigned

      if (!elligibleItems[kitchenName]) {
        elligibleItems[kitchenName] = [];
      }

      elligibleItems[kitchenName].push({
        Item_Name: item.Item_Name,
        Item_Category: item.Item_Category,
        Item_Quantity: quantityMap.get(item.Item_Name),
      });
    });

    return res.status(200).json({
      success: true,
      elligibleItems, // ✅ { "Kitchen3": [...], "Kitchen4": [...] }
    });

  } catch (err) {
    console.error("❌ Error checking KOT eligibility:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

const confirmTakeawayOrderBillPaidAndInvoiceGenerated = async (req, res, next) => {
  let connection;

  try {
    const { Takeaway_Order_Id} = req.params;

    const {
      Customer_Name,
      Customer_Phone,
      Discount_Type,
      Discount,
      
      Payment_Type,
      Final_Amount
    } = req.body;
const normalizedCustomerName =Customer_Name && Customer_Name.trim() !== ""
    ? Customer_Name.trim()
    : null;
    if (!Takeaway_Order_Id) {
      return res.status(400).json({
        success: false,
        message: "Takeaway Order ID missing",
      });
    }
if( !Customer_Phone || !Final_Amount){
  return res.status(400).json({
    success: false,
    message: "Customer details missing",
  });
}
    connection = await db.getConnection();
    await connection.beginTransaction();

    // ---------------------------------------
    // 0️⃣ Fetch KOT ID for this order
    // ---------------------------------------
    const [[kotRow]] = await connection.query(
      `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
      [Takeaway_Order_Id]
    );

    const KOT_Id = kotRow?.KOT_Id || null;

    // ---------------------------------------
    // 1️⃣ Generate Invoice ID
    // ---------------------------------------
    // const Invoice_Id = await generateNextInvoiceId(
    //   connection,
    //   "IN",
    //   "Invoice_Id",
    //   "invoices"
    // );
   const Invoice_Id = await generateNextId(
  connection,
  "TKINV",
  "Invoice_Id",
  "takeaway_invoices" // ✅ CORRECT TABLE
);


    const [fy] = await connection.query(
      `SELECT Financial_Year 
       FROM financial_year 
       WHERE Current_Financial_Year = 1
       LIMIT 1`
    );

    if (fy.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "No active financial year found.",
      });
    }

    const activeFY = fy[0].Financial_Year;
    const[customers]= await connection.query(`SELECT * FROM customers WHERE Customer_Phone = ?`,
      [Customer_Phone]);
        if (customers.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Customer not found,please add customer.",
      })
    }
      const Customer_Id = customers[0].Customer_Id;
    // ---------------------------------------
    // 2️⃣ Create Invoice
    // ---------------------------------------
    await connection.query(
      `INSERT INTO takeaway_invoices
      (Invoice_Id, Takeaway_Order_Id, Invoice_Date, Financial_Year, 
       Customer_Name, Customer_Phone,Customer_Id,
       Discount_Type, Discount,  Amount, Payment_Type)
       VALUES (?, ?, NOW(), ?,?, ?, ?, ?, ?, ?, ?)`,
      [
        Invoice_Id, Takeaway_Order_Id, activeFY,
          normalizedCustomerName,
        Customer_Phone ,
        Customer_Id,
        Discount_Type,
        Discount || 0,
        
        Final_Amount,
        Payment_Type,
      ]
    );

    // ---------------------------------------
    // 3️⃣ Mark Order as Completed
    // ---------------------------------------
    await connection.query(
      `UPDATE orders_takeaway 
       SET Payment_Status = 'completed', Status = 'completed'
       WHERE Takeaway_Order_Id = ?`,
      [Takeaway_Order_Id]
    );

    // ---------------------------------------
    // 4️⃣ Free Tables
    // ---------------------------------------
    // const [tableIds] = await connection.query(
    //   `SELECT Table_Id FROM order_tables WHERE Order_Id = ?`,
    //   [Order_Id]
    // );

    // await connection.query(
    //   `UPDATE add_table 
    //    SET Status = 'available', Start_Time = NULL, End_Time = NOW()
    //    WHERE Table_Id IN (?)`,
    //   [tableIds.map((t) => t.Table_Id)]
    // );

    // ---------------------------------------
    // 5️⃣ Remove Kitchen Order Data
    // ---------------------------------------
    // if (KOT_Id) {
    //   await connection.query(
    //     `UPDATE kitchen_orders SET Status = 'ready' WHERE KOT_Id = ?`,
    //     [KOT_Id]
    //   );

    //   // await connection.query(
    //   //   `DELETE FROM kitchen_orders WHERE KOT_Id = ?`,
    //   //   [KOT_Id]
    //   // );
    // }
       if (KOT_Id) {
      await connection.query(
        `UPDATE kitchen_orders 
         SET Status = 'ready', updated_at = NOW()
         WHERE KOT_Id = ?`,
        [KOT_Id]
      );

      await connection.query(
        `UPDATE kitchen_order_items 
         SET Item_Status = 'ready'
         WHERE KOT_Id = ?`,
        [KOT_Id]
      );
    }

    await connection.commit();

    // ----------------------------------------------------
    // 🔥🔥 REAL-TIME SOCKET NOTIFICATIONS 🔥🔥
    // ----------------------------------------------------
    if (KOT_Id) {
      // 🛑 Remove from Kitchen UI
      io.emit("kitchen_order_removed", { KOT_Id });

      // 🛑 Clear frontdesk order notifications (if open)
    //   io.emit("frontdesk_order_closed", { Order_Id });
    }

    return res.status(200).json({
      success: true,
      message: "Invoice generated. Order completed.",
      Invoice_Id,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error(err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

const nextInvoiceNumber = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    // Fetch last dine-in invoice
    const [dineIn] = await connection.query(
      `SELECT Invoice_Id
       FROM invoices 
       ORDER BY created_at DESC 
       LIMIT 1`
    );

    // Fetch last takeaway invoice
    const [takeaway] = await connection.query(
      `SELECT Invoice_Id 
       FROM takeaway_invoices 
       ORDER BY created_at DESC 
       LIMIT 1`
    );

    // Helper: extract numeric part from string like "INV00011" → 11
    const extractNumber = (str) => {
      if (!str) return 0;
      const match = str.match(/\d+/); // extract continuous digits
      return match ? Number(match[0]) : 0;
    };

    const lastDineNumber = extractNumber(dineIn[0]?.Invoice_Id);
    const lastTakeNumber = extractNumber(takeaway[0]?.Invoice_Id);

    const nextNumber = Number(lastDineNumber)  + Number(lastTakeNumber) + 1;

    return res.status(200).json({
      success: true,
      nextInvoiceNumber: nextNumber,
    });

  } catch (err) {
    console.error("❌ Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


const cancelTakeawayOrder = async (req, res, next) => {
  let connection;

  try {
    const { Takeaway_Order_Id } = req.params;


    if (!Takeaway_Order_Id) {
      return res.status(400).json({
        success: false,
        message: "Takeaway Order Id is required",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    /* ---------- CHECK ORDER ---------- */
    const [existing] = await connection.query(
      `SELECT Status 
       FROM orders_takeaway 
       WHERE Takeaway_Order_Id = ?`,
      [Takeaway_Order_Id]
    );

    if (!existing.length) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Takeaway order not found",
      });
    }

    if (existing[0].Status === "cancelled") {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Order already cancelled",
      });
    }

    /* ---------- CANCEL TAKEAWAY ORDER ---------- */
    await connection.query(
      `UPDATE orders_takeaway
       SET Status = 'cancelled', updated_at = NOW()
       WHERE Takeaway_Order_Id = ?`,
      [Takeaway_Order_Id]
    );

    /* ---------- FETCH KOT ---------- */
    const [kotRows] = await connection.query(
      `SELECT KOT_Id 
       FROM kitchen_orders 
       WHERE Order_Id = ?`,
      [Takeaway_Order_Id]
    );

    if (!kotRows.length) {
      await connection.commit();
      return res.status(200).json({
        success: true,
        message: "Order cancelled (no kitchen order)",
      });
    }

    const KOT_Id = kotRows[0].KOT_Id;

    /* ---------- FETCH CATEGORY NAMES (CORRECT JOIN) ---------- */
    const [categoryRows] = await connection.query(
      `
      SELECT DISTINCT ac.Item_Category
      FROM kitchen_order_items koi
      JOIN add_food_item afi ON afi.Item_Id = koi.Item_Id
      JOIN add_category ac ON ac.Item_Category = afi.Item_Category
      WHERE koi.KOT_Id = ?
      `,
      [KOT_Id]
    );

    const categories = categoryRows.map(
      row => row.Item_Category
    );

    /* ---------- CANCEL KITCHEN ORDER ---------- */
    await connection.query(
      `UPDATE kitchen_orders
       SET Status = 'cancelled', updated_at = NOW()
       WHERE KOT_Id = ?`,
      [KOT_Id]
    );

    /* ---------- CANCEL KITCHEN ITEMS ---------- */
    await connection.query(
      `UPDATE kitchen_order_items
       SET Item_Status = 'cancelled'
       WHERE KOT_Id = ?`,
      [KOT_Id]
    );

    /* ---------- 🔔 SOCKET NOTIFICATION (CATEGORY-WISE) ---------- */
    // categories.forEach(category => {
    //   io.to(`kitchen_${category}`).emit(
    //     "takeaway_order_cancelled",
    //     {
    //       Takeaway_Order_Id,
    //       KOT_Id,
    //       category,
    //       message: `Takeaway order ${Takeaway_Order_Id} cancelled`,
    //     }
    //   );
    // });

    categories.forEach(category => {
  io.to(`kitchen_${category}`).emit(
    "takeaway_order_cancelled",
    {
      Takeaway_Order_Id,
      KOT_Id,
      removeOrder: true,
    }
  );
})
 // 🔁 fallback (VERY IMPORTANT)
    io.emit("takeaway_order_cancelled", {
      Takeaway_Order_Id,
      KOT_Id,
      removeOrder: true,
    });
    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Takeaway order cancelled successfully",
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error cancelling takeaway order:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

const completeTakeawayOrder=async (req, res, next) => {
  let connection;

  try {
    const { Takeaway_Order_Id } = req.params;


    if (!Takeaway_Order_Id) {
      return res.status(400).json({
        success: false,
        message: "Takeaway Order Id is required",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    /* ---------- CHECK ORDER ---------- */
    const [existing] = await connection.query(
      `SELECT Status 
       FROM orders_takeaway 
       WHERE Takeaway_Order_Id = ?`,
      [Takeaway_Order_Id]
    );

    if (!existing.length) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Takeaway order not found",
      });
    }

    if (existing[0].Status === "completed") {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Order already cancelled",
      });
    }

    /* ---------- CANCEL TAKEAWAY ORDER ---------- */
    await connection.query(
      `UPDATE orders_takeaway
       SET Status = 'completed', updated_at = NOW()
       WHERE Takeaway_Order_Id = ?`,
      [Takeaway_Order_Id]
    );

    /* ---------- FETCH KOT ---------- */
    const [kotRows] = await connection.query(
      `SELECT KOT_Id 
       FROM kitchen_orders 
       WHERE Order_Id = ?`,
      [Takeaway_Order_Id]
    );

    if (!kotRows.length) {
      await connection.commit();
      return res.status(200).json({
        success: true,
        message: "Order cancelled (no kitchen order)",
      });
    }

    const KOT_Id = kotRows[0].KOT_Id;

    /* ---------- FETCH CATEGORY NAMES (CORRECT JOIN) ---------- */
    const [categoryRows] = await connection.query(
      `
      SELECT DISTINCT ac.Item_Category
      FROM kitchen_order_items koi
      JOIN add_food_item afi ON afi.Item_Id = koi.Item_Id
      JOIN add_category ac ON ac.Item_Category = afi.Item_Category
      WHERE koi.KOT_Id = ?
      `,
      [KOT_Id]
    );

   

    /* ---------- CANCEL KITCHEN ORDER ---------- */
    await connection.query(
      `UPDATE kitchen_orders
       SET Status = 'ready', updated_at = NOW()
       WHERE KOT_Id = ?`,
      [KOT_Id]
    );

    /* ---------- CANCEL KITCHEN ITEMS ---------- */
    await connection.query(
      `UPDATE kitchen_order_items
       SET Item_Status = 'ready'
       WHERE KOT_Id = ?`,
      [KOT_Id]
    );

    

//     categories.forEach(category => {
//   io.to(`kitchen_${category}`).emit(
//     "takeaway_order_cancelled",
//     {
//       Takeaway_Order_Id,
//       KOT_Id,
//       removeOrder: true,
//     }
//   );
// })
//  // 🔁 fallback (VERY IMPORTANT)
    io.emit("takeaway_order_completed", {
      Takeaway_Order_Id,
      KOT_Id,
      removeOrder: true,
    });
    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Takeaway order completed successfully",
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error cancelling takeaway order:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
}

const deleteInvoice = async (req, res, next) => {
  let connection;

  try {
    const { Invoice_Id } = req.params;
    const { orderType } = req.body;

    if (!Invoice_Id) {
      return res.status(400).json({
        success: false,
        message: "Invoice Id is required",
      });
    }

    if (!orderType || !["dine", "takeaway"].includes(orderType)) {
      return res.status(400).json({
        success: false,
        message: "Valid orderType (dine/takeaway) is required",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    
  
/* =========================
   DINE IN DELETE FLOW
========================= */
// if (orderType === "dine") {

//   // 1️⃣ Get Order_Id
//   const [[invoice]] = await connection.query(
//     `SELECT Order_Id FROM invoices WHERE Invoice_Id = ?`,
//     [Invoice_Id]
//   );

//   if (!invoice) throw new Error("Invoice not found");

//   const { Order_Id } = invoice;

//   /* ===== KITCHEN DELETE ===== */
//   const [kitchenOrders] = await connection.query(
//     `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ?`,
//     [Order_Id]
//   );

//   const kotIds = kitchenOrders.map(k => k.KOT_Id);

//   if (kotIds.length > 0) {
//     await connection.query(
//       `DELETE FROM kitchen_order_items WHERE KOT_Id IN (?)`,
//       [kotIds]
//     );

//     await connection.query(
//       `DELETE FROM kitchen_orders WHERE KOT_Id IN (?)`,
//       [kotIds]
//     );
//   }

//   /* ✅ DELETE order_tables (🔥 THIS WAS MISSING) */
//   await connection.query(
//     `DELETE FROM order_tables WHERE Order_Id = ?`,
//     [Order_Id]
//   );

//   /* ===== ORDER ITEMS ===== */
//   await connection.query(
//     `DELETE FROM order_items WHERE Order_Id = ?`,
//     [Order_Id]
//   );

//   /* ✅ DELETE INVOICE FIRST */
//   await connection.query(
//     `DELETE FROM invoices WHERE Invoice_Id = ?`,
//     [Invoice_Id]
//   );

//   /* ✅ DELETE ORDER LAST */
//   await connection.query(
//     `DELETE FROM orders WHERE Order_Id = ?`,
//     [Order_Id]
//   );
// }

// 1️⃣ Get Order_Id
if (orderType === "dine") {

  /* 1️⃣ Get Order_Id */
  const [[invoice]] = await connection.query(
    `SELECT Order_Id FROM invoices WHERE Invoice_Id = ?`,
    [Invoice_Id]
  );

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  const { Order_Id } = invoice;

  /* 2️⃣ Get Table_Id(s) BEFORE deleting order_tables */
  const [tables] = await connection.query(
    `SELECT Table_Id FROM order_tables WHERE Order_Id = ?`,
    [Order_Id]
  );

  const tableIds = tables.map(t => t.Table_Id);

  /* ===== KITCHEN DELETE ===== */
  const [kitchenOrders] = await connection.query(
    `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ?`,
    [Order_Id]
  );

  const kotIds = kitchenOrders.map(k => k.KOT_Id);

  if (kotIds.length > 0) {
    await connection.query(
      `DELETE FROM kitchen_order_items WHERE KOT_Id IN (?)`,
      [kotIds]
    );

    await connection.query(
      `DELETE FROM kitchen_orders WHERE KOT_Id IN (?)`,
      [kotIds]
    );
  }

  /* ===== DELETE order_tables ===== */
  await connection.query(
    `DELETE FROM order_tables WHERE Order_Id = ?`,
    [Order_Id]
  );

  /* ===== RESET TABLE STATE ===== */


  /* ===== DELETE ORDER ITEMS ===== */
  await connection.query(
    `DELETE FROM order_items WHERE Order_Id = ?`,
    [Order_Id]
  );

  /* ===== DELETE INVOICE ===== */
  await connection.query(
    `DELETE FROM invoices WHERE Invoice_Id = ?`,
    [Invoice_Id]
  );

  /* ===== DELETE ORDER (LAST) ===== */
  await connection.query(
    `DELETE FROM orders WHERE Order_Id = ?`,
    [Order_Id]
  );
}

    /* =========================
       TAKEAWAY DELETE FLOW
    ========================= */
    // if (orderType === "takeaway") {
    //   // 1️⃣ Get Takeaway_Order_Id
    //   const [[invoice]] = await connection.query(
    //     `SELECT Takeaway_Order_Id FROM takeaway_invoices WHERE Invoice_Id = ?`,
    //     [Invoice_Id]
    //   );

    //   if (!invoice) {
    //     throw new Error("Takeaway invoice not found");
    //   }

    //   const { Takeaway_Order_Id } = invoice;

    //   /* ===== KITCHEN DELETE ===== */

    //   const [kitchenOrders] = await connection.query(
    //     `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ?`,
    //     [Takeaway_Order_Id]
    //   );

    //   const kotIds = kitchenOrders.map((ko) => ko.KOT_Id);

    //   if (kotIds.length > 0) {
    //     await connection.query(
    //       `DELETE FROM kitchen_order_items WHERE KOT_Id IN (?)`,
    //       [kotIds]
    //     );

    //     await connection.query(
    //       `DELETE FROM kitchen_orders WHERE KOT_Id IN (?)`,
    //       [kotIds]
    //     );
    //   }

    //   /* ===== TAKEAWAY ORDER DELETE ===== */

    //   await connection.query(
    //     `DELETE FROM order_takeaway_items WHERE Takeaway_Order_Id = ?`,
    //     [Takeaway_Order_Id]
    //   );

    //   await connection.query(
    //     `DELETE FROM orders_takeaway WHERE Takeaway_Order_Id = ?`,
    //     [Takeaway_Order_Id]
    //   );

    //   await connection.query(
    //     `DELETE FROM takeaway_invoices WHERE Invoice_Id = ?`,
    //     [Invoice_Id]
    //   );
    // }
    /* =========================
   TAKEAWAY DELETE FLOW
========================= */
if (orderType === "takeaway") {

  const [[invoice]] = await connection.query(
    `SELECT Takeaway_Order_Id FROM takeaway_invoices WHERE Invoice_Id = ?`,
    [Invoice_Id]
  );

  if (!invoice) throw new Error("Takeaway invoice not found");

  const { Takeaway_Order_Id } = invoice;

  /* ===== KITCHEN ===== */
  const [kitchenOrders] = await connection.query(
    `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ?`,
    [Takeaway_Order_Id]
  );

  const kotIds = kitchenOrders.map(k => k.KOT_Id);

  if (kotIds.length) {
    await connection.query(
      `DELETE FROM kitchen_order_items WHERE KOT_Id IN (?)`,
      [kotIds]
    );

    await connection.query(
      `DELETE FROM kitchen_orders WHERE KOT_Id IN (?)`,
      [kotIds]
    );
  }

  /* ===== TAKEAWAY ITEMS ===== */
  await connection.query(
    `DELETE FROM order_takeaway_items WHERE Takeaway_Order_Id = ?`,
    [Takeaway_Order_Id]
  );

  /* ✅ INVOICE FIRST */
  await connection.query(
    `DELETE FROM takeaway_invoices WHERE Invoice_Id = ?`,
    [Invoice_Id]
  );

  /* ✅ ORDER LAST */
  await connection.query(
    `DELETE FROM orders_takeaway WHERE Takeaway_Order_Id = ?`,
    [Takeaway_Order_Id]
  );
}


    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error deleting invoice:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

// const printThermalInvoice = async (req, res) => {
//   try {
//     const invoice = req.body;

//     if (!invoice || !Array.isArray(invoice.items)) {
//       return res.status(400).json({ message: "Invalid invoice data" });
//     }

//     const printer = new ThermalPrinter({
//       type: PrinterTypes.EPSON,
//       interface: "printer:80mm Series Printer",
//       options: {
//         timeout: 5000,
//       },
//     });

//     const isConnected = await printer.isPrinterConnected();
//     if (!isConnected) {
//       return res.status(500).json({ message: "Printer not connected" });
//     }

//     // -------- PRINT START --------
//     printer.alignCenter();
//     printer.println("HELLO GUYS");
//     printer.println("----------------------------");

//     printer.alignLeft();
//     printer.println(`Invoice: ${invoice.Invoice_Number}`);
//     printer.println(`Customer: ${invoice.Customer_Name || "Walk-in"}`);
//     printer.println("----------------------------");

//     printer.println("ITEM               QTY  AMT");
//     printer.println("----------------------------");

//     invoice.items.forEach((it) => {
//       printer.println(
//         `${it.Item_Name.substring(0, 18).padEnd(18)} ${String(
//           it.Quantity
//         ).padStart(3)} ₹${Number(it.Amount).toFixed(2)}`
//       );
//     });

//     printer.println("----------------------------");
//     printer.println(`TOTAL: ₹${Number(invoice.Final_Amount).toFixed(2)}`);
//     printer.println("----------------------------");

//     printer.alignCenter();
//     printer.println("THANK YOU! VISIT AGAIN");
//     printer.cut();

//     await printer.execute();
//     // -------- PRINT END --------

//     return res.json({ success: true, message: "Printed successfully" });
//   } catch (error) {
//     console.error("Thermal print error:", error);
//     return res.status(500).json({ message: "Print failed" });
//   }
// };




//PRE BOOK ORDERS
// const addPreBookOrder = async (req, res, next) => {
//   let connection;

//   try {
//     const {
//       Customer_Name,
//       Customer_Phone,
//       userId,
//       Customer_Address,
//       Booking_Date,
//       Booking_Time,
//       items,
//       Sub_Total,
//       Amount,
//       Advance_Payment,
//       Payment_Left
//     } = req.body;

//     if (!userId) {
//       return res.status(400).json({ success: false, message: "User ID required" });
//     }

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ success: false, message: "Items required" });
//     }


//     if(!Booking_Date || !Booking_Time){
//       return res.status(400).json({ success: false, message: "Booking date and time required" });
//     }

//     const paymentStatus =
//       Number(Payment_Left) === 0 ? "completed" : "pending";

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     /* ---------- CUSTOMER ---------- */
//     let Customer_Id = null;

//     if (Customer_Phone) {
//       const [existingCustomer] = await connection.query(
//         `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
//         [Customer_Phone]
//       );

//       if (existingCustomer.length) {
//         Customer_Id = existingCustomer[0].Customer_Id;
//       } else {
//         Customer_Id = await generateNextId(
//           connection,
//           "CUST",
//           "Customer_Id",
//           "customers"
//         );

//         await connection.query(
//           `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
//            VALUES (?, ?, ?)`,
//           [Customer_Id, Customer_Name?.trim() || null, Customer_Phone]
//         );
//       }
//     }

//     /* ---------- ORDER ---------- */
//     const Pre_Booked_Order_Id = await generateNextId(
//       connection,
//       "PRBODR",
//       "Pre_Booked_Order_Id",
//       "pre_booked_orders"
//     );

//    await connection.query(
//   `INSERT INTO pre_booked_orders
//    (Pre_Booked_Order_Id, User_Id, Customer_Id, Booking_Date, Booking_Time,
//     Address, Advance_Payment, Payment_Left, Sub_Total, Amount, Status, Payment_Status)
//    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?, ?)`,
//   [
//     Pre_Booked_Order_Id,
//     userId,
//     Customer_Id,
//     Booking_Date,
//     Booking_Time,
//     Customer_Address,
//     Advance_Payment,
//     Payment_Left,
//     Sub_Total,
   
//     Amount,
//     "pending",        // Status
//     paymentStatus     // Payment_Status
//   ]
// );


//     /* ---------- ITEMS ---------- */
//     for (const item of items) {
//       const [[dbItem]] = await connection.query(
//         `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
//         [item.Item_Name]
//       );

//       if (!dbItem) {
//         await connection.rollback();
//         return res.status(400).json({
//           success: false,
//           message: `Item not found: ${item.Item_Name}`,
//         });
//       }

//       const Pre_Booked_Order_Item_Id = await generateNextId(
//         connection,
//         "PRBODRITM",
//         "Pre_Booked_Order_Item_Id",
//         "pre_booked_order_items"
//       );

//       await connection.query(
//         `INSERT INTO pre_booked_order_items
//          (Pre_Booked_Order_Item_Id, Pre_Booked_Order_Id, Item_Id,Item_Name, Quantity, Price, Amount)
//          VALUES (?, ?, ?,?, ?, ?, ?)`,
//         [
//           Pre_Booked_Order_Item_Id,
//           Pre_Booked_Order_Id,
//           dbItem.Item_Id,
//           item.Item_Name,
//           item.Item_Quantity,
//           item.Item_Price,
//           item.Amount
//         ]
//       );
//     }

//     await connection.commit();

//     return res.status(201).json({
//       success: true,
//       message: "Pre-book order created successfully",
//       Pre_Booked_Order_Id
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Pre-book Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

// const getAllPreBookingOrders = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();

//     const [preBookedOrders] = await connection.query(`
//       SELECT 
//         pbo.Pre_Booked_Order_Id,
//         DATE_FORMAT(pbo.Booking_Date, '%d-%m-%Y') AS Booking_Date,
//         TIME_FORMAT(pbo.Booking_Time, '%h:%i %p') AS Booking_Time,
//         pbo.Payment_Status,
//         pbo.Advance_Payment,
//         pbo.Sub_Total,
//         pbo.Amount,
//         pbo.Payment_Left,
//         c.Customer_Name,
//         c.Customer_Phone
//       FROM pre_booked_orders pbo
//       LEFT JOIN customers c 
//         ON pbo.Customer_Id = c.Customer_Id
//         WHERE pbo.Status = 'pending'
//       ORDER BY pbo.created_at DESC
//     `);

//     const preBookedorderIds=preBookedOrders.map((pb)=>pb.Pre_Booked_Order_Id)
//     const [preBookedOrderTables]=`SELECT `
 

//     return res.status(200).json({
//       success: true,
//       preBookedOrders,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching pre-book orders:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
const getAllPreBookingOrders = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    /* ================= 1️⃣ FETCH PRE-BOOK ORDERS ================= */
    const [preBookedOrders] = await connection.query(`
      SELECT 
        pbo.Pre_Booked_Order_Id,
        DATE_FORMAT(pbo.Booking_Date, '%d-%m-%Y') AS Booking_Date,
        TIME_FORMAT(pbo.Booking_Time, '%h:%i %p') AS Booking_Time,
        pbo.Payment_Status,
        pbo.Advance_Payment,
        pbo.Sub_Total,
        pbo.Amount,
        pbo.Payment_Left,
        c.Customer_Name,
        c.Customer_Phone
      FROM pre_booked_orders pbo
      LEFT JOIN customers c 
        ON pbo.Customer_Id = c.Customer_Id
      WHERE pbo.Status = 'pending'
      ORDER BY pbo.created_at DESC
    `);

    if (preBookedOrders.length === 0) {
      return res.status(200).json({
        success: true,
        preBookedOrders: [],
      });
    }

    /* ================= 2️⃣ COLLECT ORDER IDS ================= */
    const preBookedOrderIds = preBookedOrders.map(
      o => o.Pre_Booked_Order_Id
    );

    /* ================= 3️⃣ FETCH TABLES (OPTIONAL) ================= */
    const [tableRows] = await connection.query(
      `
      SELECT
        pbot.Pre_Booked_Order_Id,
        t.Table_Id,
        t.Table_Name
      FROM pre_booked_order_tables pbot
      JOIN add_table t
        ON t.Table_Id = pbot.Table_Id
      WHERE pbot.Pre_Booked_Order_Id IN (?)
      `,
      [preBookedOrderIds]
    );

    /* ================= 4️⃣ MAP ORDER → TABLES ================= */
    const orderTableMap = {};

    tableRows.forEach(row => {
      if (!orderTableMap[row.Pre_Booked_Order_Id]) {
        orderTableMap[row.Pre_Booked_Order_Id] = [];
      }

      orderTableMap[row.Pre_Booked_Order_Id].push({
        Table_Id: row.Table_Id,
        Table_Name: row.Table_Name,
      });
    });

    /* ================= 5️⃣ MERGE (NO orderType) ================= */
    const finalData = preBookedOrders.map(order => ({
      ...order,

      // 🔥 tables array ONLY
      tables: orderTableMap[order.Pre_Booked_Order_Id] || [],
    }));

    return res.status(200).json({
      success: true,
      preBookedOrders: finalData,
    });

  } catch (err) {
    console.error("❌ Error fetching pre-book orders:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

// const addPreBookOrder = async (req, res, next) => {
//   let connection;

//   try {
//     const {
//       Customer_Name,
//       Customer_Phone,
//       userId,
//       Customer_Address,
//       Booking_Date,
//       Booking_Time,
//       items = [],                // 👈 default empty
//       Sub_Total ,
//       Amount ,
//       Advance_Payment ,
//       Payment_Left 
//     } = req.body;

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID required"
//       });
//     }

//     if (!Booking_Date || !Booking_Time) {
//       return res.status(400).json({
//         success: false,
//         message: "Booking date and time required"
//       });
//     }

//     const parsedPaymentLeft = Number(Payment_Left);
//     // const paymentStatus = parsedPaymentLeft <= 0 ? "completed" : "pending";

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     /* ---------- CUSTOMER ---------- */
//     let Customer_Id = null;

//     if (Customer_Phone) {
//       const [existingCustomer] = await connection.query(
//         `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
//         [Customer_Phone]
//       );

//       if (existingCustomer.length) {
//         Customer_Id = existingCustomer[0].Customer_Id;
//       } else {
//         Customer_Id = await generateNextId(
//           connection,
//           "CUST",
//           "Customer_Id",
//           "customers"
//         );

//         await connection.query(
//           `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
//            VALUES (?, ?, ?)`,
//           [Customer_Id, Customer_Name?.trim() || null, Customer_Phone]
//         );
//       }
//     }

//     /* ---------- PRE-BOOK ORDER ---------- */
//     const Pre_Booked_Order_Id = await generateNextId(
//       connection,
//       "PRBODR",
//       "Pre_Booked_Order_Id",
//       "pre_booked_orders"
//     );

//     await connection.query(
//       `INSERT INTO pre_booked_orders
//        (Pre_Booked_Order_Id, User_Id, Customer_Id, Booking_Date, Booking_Time,
//         Address, Advance_Payment, Payment_Left, Sub_Total, Amount, Status, Payment_Status)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         Pre_Booked_Order_Id,
//         userId,
//         Customer_Id,
//         Booking_Date,
//         Booking_Time,
//         Customer_Address || null,
//         Advance_Payment,
//         parsedPaymentLeft,
//         Sub_Total,
//         Amount,
//         "pending",
//        "pending"
//       ]
//     );

//     /* ---------- ITEMS (OPTIONAL) ---------- */
//     if (Array.isArray(items) && items.length > 0) {
//       for (const item of items) {
//         const [[dbItem]] = await connection.query(
//           `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
//           [item.Item_Name]
//         );

//         if (!dbItem) {
//           await connection.rollback();
//           return res.status(400).json({
//             success: false,
//             message: `Item not found: ${item.Item_Name}`
//           });
//         }

//         const Pre_Booked_Order_Item_Id = await generateNextId(
//           connection,
//           "PRBODRITM",
//           "Pre_Booked_Order_Item_Id",
//           "pre_booked_order_items"
//         );

//         await connection.query(
//           `INSERT INTO pre_booked_order_items
//            (Pre_Booked_Order_Item_Id, Pre_Booked_Order_Id, Item_Id,
//             Item_Name, Quantity, Price, Amount)
//            VALUES (?, ?, ?, ?, ?, ?, ?)`,
//           [
//             Pre_Booked_Order_Item_Id,
//             Pre_Booked_Order_Id,
//             dbItem.Item_Id,
//             item.Item_Name,
//             item.Item_Quantity,
//             item.Item_Price,
//             item.Amount
//           ]
//         );
//       }
//     }

//     await connection.commit();

//     return res.status(201).json({
//       success: true,
//       message: "Pre-book order created successfully",
//       Pre_Booked_Order_Id
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Pre-book Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
const addPreBookOrder = async (req, res, next) => {
  let connection;

  try {
    const {
      Customer_Name,
      Customer_Phone,
      userId,

      Customer_Address = null,
      Booking_Date,
      Booking_Time,

      items = [],            // 👈 existing
     Table_Names = [],           // 👈 NEW (optional)

      Sub_Total,
      Amount,
      Advance_Payment,
      Payment_Left,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID required",
      });
    }

    if (!Booking_Date || !Booking_Time) {
      return res.status(400).json({
        success: false,
        message: "Booking date and time required",
      });
    }

    const parsedPaymentLeft = Number(Payment_Left);

    connection = await db.getConnection();
    await connection.beginTransaction();

    /* ================= CUSTOMER ================= */
    let Customer_Id = null;

    if (Customer_Phone) {
      const [existingCustomer] = await connection.query(
        `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
        [Customer_Phone]
      );

      if (existingCustomer.length) {
        Customer_Id = existingCustomer[0].Customer_Id;
      } else {
        Customer_Id = await generateNextId(
          connection,
          "CUST",
          "Customer_Id",
          "customers"
        );

        await connection.query(
          `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
           VALUES (?, ?, ?)`,
          [Customer_Id, Customer_Name?.trim() || null, Customer_Phone]
        );
      }
    }

    /* ================= PRE-BOOK ORDER ================= */
    const Pre_Booked_Order_Id = await generateNextId(
      connection,
      "PRBODR",
      "Pre_Booked_Order_Id",
      "pre_booked_orders"
    );

    await connection.query(
      `INSERT INTO pre_booked_orders
       (Pre_Booked_Order_Id, User_Id, Customer_Id,
        Booking_Date, Booking_Time,
        Address,
        Advance_Payment, Payment_Left,
        Sub_Total, Amount,
        Status, Payment_Status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
      [
        Pre_Booked_Order_Id,
        userId,
        Customer_Id,
        Booking_Date,
        Booking_Time,
        Customer_Address,
        Advance_Payment,
        parsedPaymentLeft,
        Sub_Total,
        Amount,
      ]
    );

    /* ================= ITEMS (UNCHANGED) ================= */
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const [[dbItem]] = await connection.query(
          `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
          [item.Item_Name]
        );

        if (!dbItem) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: `Item not found: ${item.Item_Name}`,
          });
        }

        const Pre_Booked_Order_Item_Id = await generateNextId(
          connection,
          "PRBODRITM",
          "Pre_Booked_Order_Item_Id",
          "pre_booked_order_items"
        );

        await connection.query(
          `INSERT INTO pre_booked_order_items
           (Pre_Booked_Order_Item_Id, Pre_Booked_Order_Id, Item_Id,
            Item_Name, Quantity, Price, Amount)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            Pre_Booked_Order_Item_Id,
            Pre_Booked_Order_Id,
            dbItem.Item_Id,
            item.Item_Name,
            item.Item_Quantity,
            item.Item_Price,
            item.Amount,
          ]
        );
      }
    }

    /* ================= TABLES (NEW, OPTIONAL) ================= */
  if (Array.isArray(Table_Names) && Table_Names.length > 0) {
      const uniqueTables = [...new Set(Table_Names)];

      for (const tableName of uniqueTables) {
        const [[tbl]] = await connection.query(
          `SELECT Table_Id FROM add_table WHERE Table_Name = ? LIMIT 1`,
          [tableName]
        );

        if (!tbl) continue; // silently ignore invalid table names

        const Pre_Booked_Order_Table_Id = await generateNextId(
          connection,
          "PRBODRTBL",
          "Pre_Booked_Order_Table_Id",
          "pre_booked_order_tables"
        );

        await connection.query(
          `INSERT INTO pre_booked_order_tables
           (Pre_Booked_Order_Table_Id, Pre_Booked_Order_Id, Table_Id)
           VALUES (?, ?, ?)`,
          [
            Pre_Booked_Order_Table_Id,
            Pre_Booked_Order_Id,
            tbl.Table_Id,
          ]
        );
      }
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Pre-book order created successfully",
      Pre_Booked_Order_Id,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Pre-book Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

const getPreBookOrderItemsForKOT = async (req, res, next) => {
  let connection;

  try {
    const { Pre_Booked_Order_Id } = req.params;

    if (!Pre_Booked_Order_Id) {
      return res.status(400).json({
        success: false,
        message: "Pre Booked Order ID missing",
      });
    }

    connection = await db.getConnection();

    /* ---------------- 1️⃣ FETCH PRE-BOOK ITEMS + CATEGORY ---------------- */
    const [items] = await connection.query(
      `
      SELECT 
        pboi.Item_Id,
        pboi.Item_Name,
        pboi.Quantity AS Item_Quantity,
        afi.Item_Category
      FROM pre_booked_order_items pboi
      JOIN add_food_item afi 
        ON afi.Item_Id = pboi.Item_Id
      WHERE pboi.Pre_Booked_Order_Id = ?
      `,
      [Pre_Booked_Order_Id]
    );

    if (!items.length) {
      return res.status(200).json({
        success: true,
        preBookedOrderItems: {},
      });
    }

    /* ---------------- 2️⃣ FETCH KITCHEN USERS + CATEGORIES ---------------- */
    const [kitchenUsers] = await connection.query(
      `
      SELECT 
        u.User_Id,
        u.name AS Kitchen_Name,
        ksc.Category_Names
      FROM kitchen_staff_categories ksc
      JOIN users u ON u.User_Id = ksc.User_Id
      `
    );

    /* ---------------- 3️⃣ MAP CATEGORY → KITCHEN NAME ---------------- */
    const categoryToKitchen = {};

    kitchenUsers.forEach(user => {
      if (!user.Category_Names || !user.Kitchen_Name) return;

      user.Category_Names
        .split(",")
        .map(c => c.trim())
        .filter(Boolean)
        .forEach(category => {
          // first assignment wins
          if (!categoryToKitchen[category]) {
            categoryToKitchen[category] = user.Kitchen_Name;
          }
        });
    });

    /* ---------------- 4️⃣ GROUP ITEMS BY KITCHEN ---------------- */
    const kitchens = {};

    items.forEach(item => {
      const kitchenName = categoryToKitchen[item.Item_Category];

      // 🚫 IMPORTANT: skip items without kitchen
      if (!kitchenName) return;

      if (!kitchens[kitchenName]) {
        kitchens[kitchenName] = [];
      }

      kitchens[kitchenName].push({
        Item_Name: item.Item_Name,
        Item_Quantity: item.Item_Quantity,
      });
    });

    return res.status(200).json({
      success: true,
      preBookedOrderItems: kitchens, // ✅ NO undefined
    });

  } catch (err) {
    console.error("❌ Error fetching pre-book KOT items:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


// const getPreBookOrderDetails = async (req, res, next) => {
//   let connection;
//    try {
//     const { Pre_Booked_Order_Id } = req.params;

//     if (!Pre_Booked_Order_Id) {
//       return res.status(400).json({
//         success: false,
//         message: "Pre Booked Order ID missing",
//       });
//     }
//     connection = await db.getConnection();
//     /* ---------- FETCH ORDER DETAILS ---------- */
//      const [[order]] = await connection.query(
//       `SELECT 
//          pbo.Pre_Booked_Order_Id,
//          DATE_FORMAT(pbo.Booking_Date, '%Y-%m-%d') AS Booking_Date,
//          TIME_FORMAT(pbo.Booking_Time, '%h:%i %p') AS Booking_Time,
//          pbo.Address,
//          pbo.Sub_Total,
//          pbo.Amount,
//          pbo.Advance_Payment,
//          pbo.Payment_Left,
//          pbo.Payment_Status,
//          c.Customer_Name,
//          c.Customer_Phone
//        FROM pre_booked_orders pbo
//        LEFT JOIN customers c ON pbo.Customer_Id = c.Customer_Id
//        WHERE pbo.Pre_Booked_Order_Id = ?`,
//       [Pre_Booked_Order_Id]
//     );
//     const [items] = await connection.query(
//       `SELECT
//          pboi.Item_Id,
//          COALESCE(afi.Item_Name, pboi.Item_Id) AS Item_Name,

//          pboi.Quantity,
//          pboi.Price AS Booked_Price,
//          afi.Item_Price AS Current_Price,
//          pboi.Amount,

//          (afi.Item_Id IS NULL) AS Item_Deleted,
//          (afi.Item_Price IS NOT NULL AND pboi.Price <> afi.Item_Price) AS Price_Changed

//        FROM pre_booked_order_items pboi
//        LEFT JOIN add_food_item afi
//          ON pboi.Item_Id = afi.Item_Id
//        WHERE pboi.Pre_Booked_Order_Id = ?`,
//       [Pre_Booked_Order_Id]
//     );

//     return res.status(200).json({
//       success: true,
//       order,
//       items
//     });

//   }catch (err) {
//     console.error("❌ Error fetching pre-book order details:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// }


// const updatePreBookOrder = async (req, res, next) => {
//   let connection;

//   try {
//     const { Pre_Booked_Order_Id } = req.params;

//     const {
//       Customer_Name,
//       Customer_Phone,
//       Address,
//       Booking_Date,
//       Booking_Time,
//       items,
//       Sub_Total,
//       Amount,
//       Advance_Payment,
//       Payment_Left,
//     } = req.body;

//     /* ---------------- BASIC VALIDATION ---------------- */
//     if (!Pre_Booked_Order_Id) {
//       return res.status(400).json({
//         success: false,
//         message: "Pre Booked Order ID missing",
//       });
//     }

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Items are required",
//       });
//     }

//     const subTotalNum = Number(Sub_Total);
//     const amountNum = Number(Amount);
//     const advanceNum = Number(Advance_Payment);
//     const paymentLeftNum = Number(Payment_Left);

//     if (
//       [subTotalNum, amountNum, advanceNum, paymentLeftNum].some(
//         (v) => Number.isNaN(v)
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid numeric values",
//       });
//     }

//     // /* ---------------- FINANCIAL CONSISTENCY CHECK 🔥 ---------------- */
//     // if (advanceNum > amountNum) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: "Advance payment cannot exceed total amount",
//     //   });
//     // }

//     if (amountNum - advanceNum !== paymentLeftNum) {
//       return res.status(400).json({
//         success: false,
//         message: "Payment left mismatch",
//       });
//     }

//     const Payment_Status =
//       paymentLeftNum <= 0 ? "paid" : "pending";

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     /* --------------------------------------------------
//        1️⃣ FETCH EXISTING ORDER
//     -------------------------------------------------- */
//     const [[order]] = await connection.query(
//       `SELECT Customer_Id
//        FROM pre_booked_orders
//        WHERE Pre_Booked_Order_Id = ?`,
//       [Pre_Booked_Order_Id]
//     );

//     if (!order) {
//       await connection.rollback();
//       return res.status(404).json({
//         success: false,
//         message: "Pre-book order not found",
//       });
//     }

//     let Customer_Id = order.Customer_Id;

//     /* --------------------------------------------------
//        2️⃣ CUSTOMER UPSERT
//     -------------------------------------------------- */
//     if (Customer_Phone) {
//       const [customers] = await connection.query(
//         `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
//         [Customer_Phone]
//       );

//       if (customers.length) {
//         Customer_Id = customers[0].Customer_Id;

//         if (Customer_Name) {
//           await connection.query(
//             `UPDATE customers SET Customer_Name = ? WHERE Customer_Id = ?`,
//             [Customer_Name.trim(), Customer_Id]
//           );
//         }
//       } else {
//         Customer_Id = await generateNextId(
//           connection,
//           "CUST",
//           "Customer_Id",
//           "customers"
//         );

//         await connection.query(
//           `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
//            VALUES (?, ?, ?)`,
//           [Customer_Id, Customer_Name?.trim() || null, Customer_Phone]
//         );
//       }
//     }

//     /* --------------------------------------------------
//        3️⃣ REPLACE ITEMS (SAFE & SIMPLE)
//     -------------------------------------------------- */
//     await connection.query(
//       `DELETE FROM pre_booked_order_items
//        WHERE Pre_Booked_Order_Id = ?`,
//       [Pre_Booked_Order_Id]
//     );

//     for (const item of items) {
//       const [[dbItem]] = await connection.query(
//         `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
//         [item.Item_Name]
//       );

//       if (!dbItem) {
//         await connection.rollback();
//         return res.status(400).json({
//           success: false,
//           message: `Item not found: ${item.Item_Name}`,
//         });
//       }

//       const Pre_Booked_Order_Item_Id = await generateNextId(
//         connection,
//         "PRBODRITM",
//         "Pre_Booked_Order_Item_Id",
//         "pre_booked_order_items"
//       );

//       await connection.query(
//         `INSERT INTO pre_booked_order_items
//          (Pre_Booked_Order_Item_Id, Pre_Booked_Order_Id, Item_Id, Item_Name,
//           Quantity, Price, Amount)
//          VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [
//           Pre_Booked_Order_Item_Id,
//           Pre_Booked_Order_Id,
//           dbItem.Item_Id,
//           item.Item_Name,
//           Number(item.Item_Quantity),
//           Number(item.Item_Price || 0),
//           Number(item.Amount),
//         ]
//       );
//     }

//     /* --------------------------------------------------
//        4️⃣ UPDATE ORDER (NO RECALCULATION)
//     -------------------------------------------------- */
//     await connection.query(
//       `UPDATE pre_booked_orders
//        SET Customer_Id = ?,
//            Booking_Date = ?,
//            Booking_Time = ?,
//            Address = ?,
//            Sub_Total = ?,
//            Amount = ?,
//            Advance_Payment = ?,
//            Payment_Left = ?,
//            Payment_Status = ?,
//            Status = 'pending'
//        WHERE Pre_Booked_Order_Id = ?`,
//       [
//         Customer_Id,
//         Booking_Date,
//         Booking_Time,
//         Address,
//         subTotalNum,
//         amountNum,
//         advanceNum,
//         paymentLeftNum,
//         Payment_Status,
//         Pre_Booked_Order_Id,
//       ]
//     );

//     await connection.commit();

//     return res.status(200).json({
//       success: true,
//       message: "Pre-book order updated successfully",
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error updating pre-book order:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
const getPreBookOrderDetails = async (req, res, next) => {
  let connection;

  try {
    const { Pre_Booked_Order_Id } = req.params;

    if (!Pre_Booked_Order_Id) {
      return res.status(400).json({
        success: false,
        message: "Pre Booked Order ID missing",
      });
    }

    connection = await db.getConnection();

    /* ================= ORDER ================= */
    const [[order]] = await connection.query(
      `
      SELECT 
        pbo.Pre_Booked_Order_Id,
        DATE_FORMAT(pbo.Booking_Date, '%Y-%m-%d') AS Booking_Date,
        TIME_FORMAT(pbo.Booking_Time, '%h:%i %p') AS Booking_Time,
        pbo.Address,
        pbo.Sub_Total,
        pbo.Amount,
        pbo.Advance_Payment,
        pbo.Payment_Left,
        pbo.Payment_Status,
        c.Customer_Name,
        c.Customer_Phone
      FROM pre_booked_orders pbo
      LEFT JOIN customers c 
        ON pbo.Customer_Id = c.Customer_Id
      WHERE pbo.Pre_Booked_Order_Id = ?
      `,
      [Pre_Booked_Order_Id]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pre-book order not found",
      });
    }

    /* ================= ITEMS ================= */
    const [items] = await connection.query(
      `
      SELECT
        pboi.Item_Id,
        COALESCE(afi.Item_Name, pboi.Item_Id) AS Item_Name,
        pboi.Quantity,
        pboi.Price AS Booked_Price,
        afi.Item_Price AS Current_Price,
        pboi.Amount,
        (afi.Item_Id IS NULL) AS Item_Deleted,
        (afi.Item_Price IS NOT NULL AND pboi.Price <> afi.Item_Price) AS Price_Changed
      FROM pre_booked_order_items pboi
      LEFT JOIN add_food_item afi
        ON pboi.Item_Id = afi.Item_Id
      WHERE pboi.Pre_Booked_Order_Id = ?
      `,
      [Pre_Booked_Order_Id]
    );

    /* ================= TABLES (OPTIONAL) ================= */
    const [tables] = await connection.query(
      `
      SELECT
        pbot.Pre_Booked_Order_Table_Id,
        pbot.Table_Id,
        at.Table_Name,
       
        (at.Table_Id IS NULL) AS Table_Deleted
      FROM pre_booked_order_tables pbot
      LEFT JOIN add_table at
        ON pbot.Table_Id = at.Table_Id
      WHERE pbot.Pre_Booked_Order_Id = ?
      `,
      [Pre_Booked_Order_Id]
    );

    return res.status(200).json({
      success: true,
      order,
      items,
      tables: tables.length > 0 ? tables : [], // 👈 always array
    });

  } catch (err) {
    console.error("❌ Error fetching pre-book order details:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


const updatePreBookOrder = async (req, res, next) => {
  let connection;

  try {
    const { Pre_Booked_Order_Id } = req.params;

    const {
      Customer_Name,
      Customer_Phone,
      Address,
      Booking_Date,
      Booking_Time,
      items,
      Sub_Total,
      Amount,
      Advance_Payment,
      Payment_Left,
       Table_Names = [], 
    } = req.body;

    /* ---------------- BASIC VALIDATION ---------------- */
    if (!Pre_Booked_Order_Id) {
      return res.status(400).json({
        success: false,
        message: "Pre Booked Order ID missing",
      });
    }

    if (!Booking_Date || !Booking_Time) {
  return res.status(400).json({
    success: false,
    message: "Booking date and time are required",
  });
}

    const subTotalNum = Number(Sub_Total);
    const amountNum = Number(Amount);
    const advanceNum = Number(Advance_Payment);
    const paymentLeftNum = Number(Payment_Left);

    if (
      [subTotalNum, amountNum, advanceNum, paymentLeftNum].some(
        (v) => Number.isNaN(v)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid numeric values",
      });
    }

    /* 🔒 Payment consistency (negative allowed) */
    if (amountNum - advanceNum !== paymentLeftNum) {
      return res.status(400).json({
        success: false,
        message: "Payment left mismatch",
      });
    }

    // const Payment_Status = paymentLeftNum <= 0 ? "paid" : "pending";

    /* ---------------- ITEMS VALIDATION (ONLY IF PROVIDED) ---------------- */
    //const hasItems = Array.isArray(items) && items.length > 0;
const itemsProvided = Array.isArray(items);
const hasItems = itemsProvided && items.length > 0;
    if (hasItems) {
      for (const item of items) {
        if (!item.Item_Name || !item.Item_Name.trim()) {
          return res.status(400).json({
            success: false,
            message: "Item name is required",
          });
        }

        if (!item.Item_Quantity || Number(item.Item_Quantity) <= 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid quantity for ${item.Item_Name}`,
          });
        }

        if (Number.isNaN(Number(item.Amount))) {
          return res.status(400).json({
            success: false,
            message: `Invalid amount for ${item.Item_Name}`,
          });
        }
      }
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    /* --------------------------------------------------
       1️⃣ FETCH EXISTING ORDER
    -------------------------------------------------- */
    const [[order]] = await connection.query(
      `SELECT Customer_Id,Advance_Payment
       FROM pre_booked_orders
       WHERE Pre_Booked_Order_Id = ?`,
      [Pre_Booked_Order_Id]
    );

    if (!order) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Pre-book order not found",
      });
    }

    let Customer_Id = order.Customer_Id;
const previousAdvance = Number(order.Advance_Payment) || 0;
if (advanceNum < previousAdvance) {
  return res.status(400).json({
    success: false,
    message: `Advance payment cannot be less than previous amount ₹${previousAdvance}`,
  });
}

    /* --------------------------------------------------
       2️⃣ CUSTOMER UPSERT
    -------------------------------------------------- */
    if (Customer_Phone) {
      const [customers] = await connection.query(
        `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
        [Customer_Phone]
      );

      if (customers.length) {
        Customer_Id = customers[0].Customer_Id;

        if (Customer_Name && Customer_Name.trim()) {
          await connection.query(
            `UPDATE customers SET Customer_Name = ? WHERE Customer_Id = ?`,
            [Customer_Name.trim(), Customer_Id]
          );
        }
      } else {
        Customer_Id = await generateNextId(
          connection,
          "CUST",
          "Customer_Id",
          "customers"
        );

        await connection.query(
          `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
           VALUES (?, ?, ?)`,
          [Customer_Id, Customer_Name?.trim() || null, Customer_Phone]
        );
      }
    }

    /* --------------------------------------------------
       3️⃣ ITEMS UPDATE (ONLY IF PROVIDED)
    -------------------------------------------------- */
 /* --------------------------------------------------
   3️⃣ ITEMS UPDATE (INTENT-AWARE)
-------------------------------------------------- */
// const itemsProvided = Array.isArray(items);
// const hasItems = itemsProvided && items.length > 0;

// ✅ If frontend explicitly sent items (even empty array)
if (itemsProvided) {

  // 🔥 Always delete old items
  await connection.query(
    `DELETE FROM pre_booked_order_items
     WHERE Pre_Booked_Order_Id = ?`,
    [Pre_Booked_Order_Id]
  );

  // 🔥 Insert again ONLY if items exist
  if (hasItems) {
    for (const item of items) {
      const [[dbItem]] = await connection.query(
        `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
        [item.Item_Name]
      );

      if (!dbItem) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Item not found: ${item.Item_Name}`,
        });
      }

      const Pre_Booked_Order_Item_Id = await generateNextId(
        connection,
        "PRBODRITM",
        "Pre_Booked_Order_Item_Id",
        "pre_booked_order_items"
      );

      await connection.query(
        `INSERT INTO pre_booked_order_items
         (Pre_Booked_Order_Item_Id, Pre_Booked_Order_Id, Item_Id, Item_Name,
          Quantity, Price, Amount)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          Pre_Booked_Order_Item_Id,
          Pre_Booked_Order_Id,
          dbItem.Item_Id,
          item.Item_Name,
          Number(item.Item_Quantity),
          Number(item.Item_Price || 0),
          Number(item.Amount),
        ]
      );
    }
  }
}


    /* --------------------------------------------------
       4️⃣ UPDATE ORDER (NO RECALCULATION)
    -------------------------------------------------- */
    await connection.query(
      `UPDATE pre_booked_orders
       SET Customer_Id = ?,
           Booking_Date = ?,
           Booking_Time = ?,
           Address = ?,
           Sub_Total = ?,
           Amount = ?,
           Advance_Payment = ?,
           Payment_Left = ?,
           Payment_Status = "pending",
           Status = 'pending'
       WHERE Pre_Booked_Order_Id = ?`,
      [
        Customer_Id,
        Booking_Date,
        Booking_Time,
        Address,
        subTotalNum,
        amountNum,
        advanceNum,
        paymentLeftNum,
        
        Pre_Booked_Order_Id,
      ]
    );

/* --------------------------------------------------
   5️⃣ UPDATE TABLES (DIFF-BASED, SAFE)
-------------------------------------------------- */
if (Array.isArray(Table_Names)) {

  /* 1️⃣ Fetch existing tables */
  const [existingRows] = await connection.query(
    `
    SELECT t.Table_Name, pbot.Table_Id
    FROM pre_booked_order_tables pbot
    JOIN add_table t ON t.Table_Id = pbot.Table_Id
    WHERE pbot.Pre_Booked_Order_Id = ?
    `,
    [Pre_Booked_Order_Id]
  );

  const existingTableNames = existingRows.map(r => r.Table_Name);

  /* 2️⃣ Normalize input (safety) */
  const incomingTableNames = [...new Set(Table_Names)];

  /* 3️⃣ Find differences */
  const tablesToAdd = incomingTableNames.filter(
    name => !existingTableNames.includes(name)
  );

  const tablesToRemove = existingTableNames.filter(
    name => !incomingTableNames.includes(name)
  );

  /* 4️⃣ REMOVE unselected tables */
  if (tablesToRemove.length > 0) {
    await connection.query(
      `
      DELETE pbot
      FROM pre_booked_order_tables pbot
      JOIN add_table t ON t.Table_Id = pbot.Table_Id
      WHERE pbot.Pre_Booked_Order_Id = ?
        AND t.Table_Name IN (?)
      `,
      [Pre_Booked_Order_Id, tablesToRemove]
    );
  }

  /* 5️⃣ ADD newly selected tables */
  for (const tableName of tablesToAdd) {
    const [[tbl]] = await connection.query(
      `SELECT Table_Id FROM add_table WHERE Table_Name = ? LIMIT 1`,
      [tableName]
    );

    if (!tbl) continue;

    const Pre_Booked_Order_Table_Id = await generateNextId(
      connection,
      "PRBODRTBL",
      "Pre_Booked_Order_Table_Id",
      "pre_booked_order_tables"
    );

    await connection.query(
      `
      INSERT INTO pre_booked_order_tables
      (Pre_Booked_Order_Table_Id, Pre_Booked_Order_Id, Table_Id)
      VALUES (?, ?, ?)
      `,
      [
        Pre_Booked_Order_Table_Id,
        Pre_Booked_Order_Id,
        tbl.Table_Id,
      ]
    );
  }
}

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Pre-book order updated successfully",
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error updating pre-book order:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }

}

const confirmPreOrderBillPaidAndInvoiceGenerated = async (req, res, next) => {
  let connection;

  try {
    const { Pre_Book_Order_Id } = req.params;

    const {
      Customer_Name,
      Customer_Phone,
      Discount_Type,
      Discount,
      Service_Charge,
      Payment_Type,
      Final_Amount,
      Payment_Left
    } = req.body;

    /* ---------------- VALIDATION ---------------- */
    if (!Pre_Book_Order_Id) {
      return res.status(400).json({
        success: false,
        message: "Pre-book order ID missing",
      });
    }

    if (!Final_Amount || Number(Final_Amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Final amount is required",
      });
    }

    const finalAmount = Number(Final_Amount);

    const normalizedCustomerName =
      Customer_Name && Customer_Name.trim() !== ""
        ? Customer_Name.trim()
        : null;

    connection = await db.getConnection();
    await connection.beginTransaction();

    /* ---------------- 1️⃣ LOCK PRE-BOOK ORDER ---------------- */
    const [[preBookOrder]] = await connection.query(
      `SELECT advance_payment, payment_left
       FROM pre_booked_orders
       WHERE Pre_Booked_Order_Id = ?
       FOR UPDATE`,
      [Pre_Book_Order_Id]
    );

    if (!preBookOrder) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Pre-book order not found",
      });
    }

    /* ---------------- 2️⃣ Generate Invoice ID ---------------- */
    const Pre_Book_Invoice_Id = await generateNextId(
      connection,
      "PRBINV",
      "Pre_Book_Invoice_Id",
      "pre_book_orders_invoices"
    );

    /* ---------------- 3️⃣ Get Financial Year ---------------- */
    const [fy] = await connection.query(
      `SELECT Financial_Year
       FROM financial_year
       WHERE Current_Financial_Year = 1
       LIMIT 1`
    );

    if (fy.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "No active financial year found",
      });
    }

    const activeFY = fy[0].Financial_Year;

    /* ---------------- 4️⃣ CUSTOMER (OPTIONAL) ---------------- */
    let Customer_Id = null;

    if (Customer_Phone) {
      const [customers] = await connection.query(
        `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
        [Customer_Phone]
      );

      if (customers.length === 0) {
        Customer_Id = await generateNextId(
          connection,
          "CUST",
          "Customer_Id",
          "customers"
        );

        await connection.query(
          `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
           VALUES (?, ?, ?)`,
          [Customer_Id, normalizedCustomerName, Customer_Phone]
        );
      } else {
        Customer_Id = customers[0].Customer_Id;

        if (normalizedCustomerName) {
          await connection.query(
            `UPDATE customers SET Customer_Name = ? WHERE Customer_Id = ?`,
            [normalizedCustomerName, Customer_Id]
          );
        }
      }

      await connection.query(
        `UPDATE pre_booked_orders
         SET Customer_Id = ?
         WHERE Pre_Booked_Order_Id = ?`,
        [Customer_Id, Pre_Book_Order_Id]
      );
    }

    /* ---------------- 5️⃣ CREATE INVOICE ---------------- */
    await connection.query(
      `INSERT INTO pre_book_orders_invoices
      (Pre_Book_Invoice_Id, Pre_Book_Order_Id, Pre_Book_Invoice_Date, Financial_Year,
       Customer_Id, Discount_Type, Discount, Service_Charge,
       Amount, Payment_Type)
       VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
      [
        Pre_Book_Invoice_Id,
        Pre_Book_Order_Id,
        activeFY,
        Customer_Id,
        Discount_Type,
        Discount || 0,
        Service_Charge || 0,
        finalAmount,
        Payment_Type,
      ]
    );

   // 🔒 Normalize frontend value
const parsedPaymentLeft = Number(Payment_Left);

if (Number.isNaN(parsedPaymentLeft)) {
  await connection.rollback();
  return res.status(400).json({
    success: false,
    message: "Invalid Payment_Left value",
  });
}

// ✅ Status depends on value
// const paymentStatus = parsedPaymentLeft <= 0 ? "paid" : "pending";

await connection.query(
  `UPDATE pre_booked_orders
   SET
     payment_left = ?,
     Payment_Status = "paid",
     Status = 'completed'
   WHERE Pre_Booked_Order_Id = ?`,
  [parsedPaymentLeft,  Pre_Book_Order_Id]
);

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Invoice generated and pre-book order completed",
      Pre_Book_Invoice_Id,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Confirm Pre-book Bill Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


const updateAndPrintPreBookKOT = async (req, res, next) => {
  let connection;

  try {
    const { Pre_Booked_Order_Id } = req.params;

    const {
      Customer_Name,
      Customer_Phone,
      Address,
      Booking_Date,
      Booking_Time,
      items,
      Sub_Total,
      Amount,
      Advance_Payment,
      Payment_Left,
    } = req.body;

    /* ================= BASIC VALIDATION ================= */
    if (!Pre_Booked_Order_Id) {
      return res.status(400).json({
        success: false,
        message: "Pre Booked Order ID missing",
      });
    }

    if (!Booking_Date || !Booking_Time) {
      return res.status(400).json({
        success: false,
        message: "Booking date and time are required",
      });
    }

    const subTotalNum = Number(Sub_Total);
    const amountNum = Number(Amount);
    const advanceNum = Number(Advance_Payment);
    const paymentLeftNum = Number(Payment_Left);

    if ([subTotalNum, amountNum, advanceNum, paymentLeftNum].some(Number.isNaN)) {
      return res.status(400).json({
        success: false,
        message: "Invalid numeric values",
      });
    }

    /* ================= ITEM INTENT ================= */
    const itemsProvided = Array.isArray(items);
    const hasItems = itemsProvided && items.length > 0;

    if (hasItems) {
      for (const item of items) {
        if (!item.Item_Name?.trim()) {
          return res.status(400).json({
            success: false,
            message: "Item name is required",
          });
        }
        if (!item.Item_Quantity || Number(item.Item_Quantity) <= 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid quantity for ${item.Item_Name}`,
          });
        }
      }
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    /* ==================================================
       1️⃣ FETCH EXISTING ORDER
    ================================================== */
    const [[order]] = await connection.query(
      `SELECT Customer_Id, Advance_Payment
       FROM pre_booked_orders
       WHERE Pre_Booked_Order_Id = ?`,
      [Pre_Booked_Order_Id]
    );

    if (!order) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Pre-book order not found",
      });
    }

    let Customer_Id = order.Customer_Id;
    const previousAdvance = Number(order.Advance_Payment) || 0;

    if (advanceNum < previousAdvance) {
      return res.status(400).json({
        success: false,
        message: `Advance payment cannot be less than ₹${previousAdvance}`,
      });
    }

    /* ==================================================
       2️⃣ CUSTOMER UPSERT
    ================================================== */
    if (Customer_Phone) {
      const [customers] = await connection.query(
        `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
        [Customer_Phone]
      );

      if (customers.length) {
        Customer_Id = customers[0].Customer_Id;

        if (Customer_Name?.trim()) {
          await connection.query(
            `UPDATE customers SET Customer_Name = ? WHERE Customer_Id = ?`,
            [Customer_Name.trim(), Customer_Id]
          );
        }
      } else {
        Customer_Id = await generateNextId(
          connection,
          "CUST",
          "Customer_Id",
          "customers"
        );

        await connection.query(
          `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
           VALUES (?, ?, ?)`,
          [Customer_Id, Customer_Name?.trim() || null, Customer_Phone]
        );
      }
    }

    /* ==================================================
       3️⃣ UPDATE PRE-BOOK ORDER
    ================================================== */
    await connection.query(
      `UPDATE pre_booked_orders
       SET Customer_Id = ?,
           Booking_Date = ?,
           Booking_Time = ?,
           Address = ?,
           Sub_Total = ?,
           Amount = ?,
           Advance_Payment = ?,
           Payment_Left = ?,
           Payment_Status = 'pending',
           Status = 'pending'
       WHERE Pre_Booked_Order_Id = ?`,
      [
        Customer_Id,
        Booking_Date,
        Booking_Time,
        Address,
        subTotalNum,
        amountNum,
        advanceNum,
        paymentLeftNum,
        Pre_Booked_Order_Id,
      ]
    );

    /* ==================================================
       4️⃣ REPLACE ORDER ITEMS (DELETION ALLOWED)
    ================================================== */
    if (itemsProvided) {
      await connection.query(
        `DELETE FROM pre_booked_order_items
         WHERE Pre_Booked_Order_Id = ?`,
        [Pre_Booked_Order_Id]
      );

      if (hasItems) {
        for (const item of items) {
          const [[dbItem]] = await connection.query(
            `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
            [item.Item_Name]
          );

          if (!dbItem) {
            await connection.rollback();
            return res.status(400).json({
              success: false,
              message: `Item not found: ${item.Item_Name}`,
            });
          }

          const Pre_Booked_Order_Item_Id = await generateNextId(
            connection,
            "PRBODRITM",
            "Pre_Booked_Order_Item_Id",
            "pre_booked_order_items"
          );

          await connection.query(
            `INSERT INTO pre_booked_order_items
             (Pre_Booked_Order_Item_Id, Pre_Booked_Order_Id, Item_Id, Item_Name,
              Quantity, Price, Amount)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              Pre_Booked_Order_Item_Id,
              Pre_Booked_Order_Id,
              dbItem.Item_Id,
              item.Item_Name,
              Number(item.Item_Quantity),
              Number(item.Item_Price || 0),
              Number(item.Amount || 0),
            ]
          );
        }
      }
    }

    /* ==================================================
       5️⃣ GET OR CREATE KOT
    ================================================== */
    const [[existingKOT]] = await connection.query(
      `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
      [Pre_Booked_Order_Id]
    );

    let KOT_Id = existingKOT?.KOT_Id;

    if (!KOT_Id) {
      KOT_Id = await generateNextId(
        connection,
        "KOT",
        "KOT_Id",
        "kitchen_orders"
      );

      await connection.query(
        `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
         VALUES (?, ?, 'pending')`,
        [KOT_Id, Pre_Booked_Order_Id]
      );
    }

    /* ==================================================
       6️⃣ FETCH PREVIOUSLY PRINTED KOT ITEMS
    ================================================== */
    const [printedItems] = await connection.query(
      `SELECT Item_Name, Quantity
       FROM kitchen_order_items
       WHERE KOT_Id = ?`,
      [KOT_Id]
    );

    const printedMap = new Map();
    printedItems.forEach(r => printedMap.set(r.Item_Name, r.Quantity));

    const deltaItems = [];

    /* ==================================================
       7️⃣ DELTA KOT LOGIC (🔥 CORE)
    ================================================== */
    if (hasItems) {
      for (const item of items) {
        const [[dbItem]] = await connection.query(
          `SELECT Item_Id, Item_Category
           FROM add_food_item
           WHERE Item_Name = ? LIMIT 1`,
          [item.Item_Name]
        );

        if (!dbItem) continue;

        const newQty = Number(item.Item_Quantity);
        const oldQty = printedMap.get(item.Item_Name) || 0;

        if (newQty > oldQty) {
          const delta = newQty - oldQty;

          deltaItems.push({
            Item_Name: item.Item_Name,
            Quantity: delta,
            Item_Category: dbItem.Item_Category,
          });

          if (printedMap.has(item.Item_Name)) {
            await connection.query(
              `UPDATE kitchen_order_items
               SET Quantity = ?
               WHERE KOT_Id = ? AND Item_Name = ?`,
              [newQty, KOT_Id, item.Item_Name]
            );
          } else {
            const KOT_Item_Id = await generateNextId(
              connection,
              "KOTITM",
              "KOT_Item_Id",
              "kitchen_order_items"
            );

            await connection.query(
              `INSERT INTO kitchen_order_items
               (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
               VALUES (?, ?, ?, ?, ?, 'pending')`,
              [KOT_Item_Id, KOT_Id, dbItem.Item_Id, item.Item_Name, newQty]
            );
          }
        }
      }
    }

    /* ==================================================
       8️⃣ CATEGORY → KITCHEN MAP
    ================================================== */
    const [staffRows] = await connection.query(`
      SELECT ksc.Category_Names, u.name AS Kitchen_Name
      FROM kitchen_staff_categories ksc
      JOIN users u ON u.User_Id = ksc.User_Id
    `);

    const categoryToKitchen = new Map();
    staffRows.forEach(r => {
      r.Category_Names?.split(",").forEach(c =>
        categoryToKitchen.set(c.trim(), r.Kitchen_Name)
      );
    });

    /* ==================================================
       9️⃣ BUILD KITCHEN-WISE RESPONSE
    ================================================== */
    const preBookedOrderItems = {};

    deltaItems.forEach(it => {
      const kitchen = categoryToKitchen.get(it.Item_Category) || "Kitchen";
      if (!preBookedOrderItems[kitchen]) preBookedOrderItems[kitchen] = [];
      preBookedOrderItems[kitchen].push({
        Item_Name: it.Item_Name,
        Item_Quantity: it.Quantity,
      });
    });

    await connection.commit();
//        6️⃣ SOCKET EMIT (OPTIONAL, CATEGORY BASED)
//     ================================================== */
    Object.entries(preBookedOrderItems).forEach(
      ([kitchenName, items]) => {
        io.emit("new_kitchen_order", {
          KOT_Id,
          Order_Id: Pre_Booked_Order_Id,
          Order_Type: "pre-book",
          Kitchen_Name: kitchenName,
          items,
        });
      }
    );
    return res.status(200).json({
      success: true,
      message:
        Object.keys(preBookedOrderItems).length > 0
          ? "KOT printed successfully"
          : "No new items to send to kitchen",
      Pre_Booked_Order_Id,
      KOT_Id,
      preBookedOrderItems, // 🔥 EXACT FORMAT
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Update + KOT Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};



const KOTOfOrdersTakenByWaiter = async (req, res, next) => {
  let connection;

  try {
    const { Order_Id } = req.params;
    const userId=req.user.User_Id;
    if (!Order_Id) {
      return res.status(400).json({
        success: false,
        message: "Order ID missing",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [user]=await connection.query(`SELECT role FROM users WHERE User_Id=?`, [userId] );

    if(user[0].role!=='staff'){
      return  res.status(403).json({
        success: false,
        message: "Only staff can access this endpoint",
      });
    }

    /* ---------------- FETCH CURRENT KITCHEN ITEMS ---------------- */
    const [items] = await connection.query(
      `
      SELECT 
        koi.Item_Id,
        koi.Item_Name,
        koi.Quantity,
        fi.Item_Category
      FROM kitchen_order_items koi
      JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
      JOIN kitchen_orders ko ON ko.KOT_Id = koi.KOT_Id
      WHERE ko.Order_Id = ?
      `,
      [Order_Id]
    );

    const deltaItems = [];

    /* ---------------- CALCULATE DELTA ---------------- */
    for (const item of items) {
      const [[tracking]] = await connection.query(
        `
        SELECT Printed_Quantity
        FROM kot_print_tracking
        WHERE Order_Id = ? AND Item_Id = ?
        FOR UPDATE
        `,
        [Order_Id, item.Item_Id]
      );

      const printedQty = tracking?.Printed_Quantity || 0;
      const delta = item.Quantity - printedQty;

      if (delta > 0) {
        deltaItems.push({
          Item_Id: item.Item_Id,
          Item_Name: item.Item_Name,
          Item_Quantity: delta,
          Item_Category: item.Item_Category,
          totalQuantity: item.Quantity
        });
      }
    }

    /* ---------------- CHECK ELIGIBILITY ---------------- */
    const eligibilityResult = deltaItems.length
      ? await checkDineInItemsElligibleForKOTPrint(deltaItems)
      : { success: true, elligibleItems: {} };

    const grouped = eligibilityResult.elligibleItems || {};

    /* ---------------- UPDATE TRACKING ONLY FOR PRINTED ITEMS ---------------- */
    for (const category in grouped) {
      for (const printedItem of grouped[category]) {
        const originalItem = deltaItems.find(
          d => d.Item_Name === printedItem.Item_Name
        );

        if (!originalItem) continue;

        const [[tracking]] = await connection.query(
          `
          SELECT Printed_Quantity
          FROM kot_print_tracking
          WHERE Order_Id = ? AND Item_Id = ?
          FOR UPDATE
          `,
          [Order_Id, originalItem.Item_Id]
        );

        if (tracking) {
          await connection.query(
            `
            UPDATE kot_print_tracking
            SET Printed_Quantity = ?
            WHERE Order_Id = ? AND Item_Id = ?
            `,
            [originalItem.totalQuantity, Order_Id, originalItem.Item_Id]
          );
        } else {
          await connection.query(
            `
            INSERT INTO kot_print_tracking
            (Order_Id, Item_Id, Printed_Quantity)
            VALUES (?, ?, ?)
            `,
            [Order_Id, originalItem.Item_Id, originalItem.totalQuantity]
          );
        }
      }
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      elligibleItems: grouped,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ KOT Print Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};



export {addNewCustomer,getAllCustomers,addOrder, getTablesHavingOrders,
   getTableOrderDetails, updateOrder, 
    confirmOrderBillPaidAndInvoiceGenerated,confirmTakeawayOrderBillPaidAndInvoiceGenerated,
    totalInvoicesEachDay,
    getAllInvoicesAndOrdersEachDay, takeawayAddOrdersAndGenerateInvoices,updateTakeawayAndDineInDeliveryStatus,
    getTakeawayOrderDetails,updateTakeawayOrder,
    getAllInvoicesOfOrdersAndTakeawaysInDateRange
,nextInvoiceNumber,cancelTakeawayOrder,completeTakeawayOrder,checkItemElligibleForKOTPrint,
deleteInvoice,
addPreBookOrder,getAllPreBookingOrders,getPreBookOrderItemsForKOT,updatePreBookOrder,
getPreBookOrderDetails,
confirmPreOrderBillPaidAndInvoiceGenerated,updateAndPrintPreBookKOT,KOTOfOrdersTakenByWaiter};

