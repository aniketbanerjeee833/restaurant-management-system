import { io } from "../../app.js";
import db from "../../config/db.js";


async function generateNextId(connection, prefix, column, table) {
    const [rows] = await connection.query(
        `SELECT ${column} FROM ${table} ORDER BY id DESC LIMIT 1`
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

const addOrder = async (req, res, next) => {
  let connection;


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
const normalizedCustomerName =Customer_Name && Customer_Name.trim() !== ""
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

    if (!Customer_Phone) {
      return res.status(400).json({
        success: false,
        message: "Customer  phone number is required",
      });
    }

    /* ---------------- DB START ---------------- */
    connection = await db.getConnection();
    await connection.beginTransaction();

    /* ---------------- CUSTOMER ---------------- */
    let Customer_Id;
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
        [Customer_Id,   normalizedCustomerName, Customer_Phone]
      );
    }

    /* ---------------- ORDER ---------------- */
    const Order_Id = await generateNextId(connection, "ODR", "Order_Id", "orders");

    await connection.query(
      `INSERT INTO orders
       (Order_Id, User_Id, Customer_Id, Status, Sub_Total, Discount, Amount, Payment_Status)
       VALUES (?, ?, ?, 'hold', ?, 0, ?, 'pending')`,
      [Order_Id, userId, Customer_Id, Sub_Total, Amount]
    );

    /* ---------------- TABLES ---------------- */
    for (const tableName of Table_Names) {
      const [[tbl]] = await connection.query(
        `SELECT Table_Id, Status FROM add_table WHERE Table_Name = ?`,
        [tableName]
      );

      if (!tbl) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: "Table not found" });
      }

      if (tbl.Status === "occupied") {
        await connection.rollback();
        return res.status(400).json({ success: false, message: "Table occupied" });
      }

      const Order_Table_Id = await generateNextId(
        connection,
        "OTB",
        "Order_Table_Id",
        "order_tables"
      );

      await connection.query(
        `INSERT INTO order_tables (Order_Table_Id, Order_Id, Table_Id)
         VALUES (?, ?, ?)`,
        [Order_Table_Id, Order_Id, tbl.Table_Id]
      );

      await connection.query(
        `UPDATE add_table SET Status='occupied', Start_Time=NOW()
         WHERE Table_Id = ?`,
        [tbl.Table_Id]
      );
    }

    /* ---------------- KOT ---------------- */
    const KOT_Id = await generateNextId(connection, "KOT", "KOT_Id", "kitchen_orders");

    await connection.query(
      `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
       VALUES (?, ?, 'pending')`,
      [KOT_Id, Order_Id]
    );

    /* ---------------- INSERT ITEMS ---------------- */
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

      const Item_Id = dbItem.Item_Id;

      const Order_Item_Id = await generateNextId(
        connection,
        "ODRITM",
        "Order_Item_Id",
        "order_items"
      );

      await connection.query(
        `INSERT INTO order_items
         (Order_Item_Id, Order_Id, Item_Id, Quantity, Price, Amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          Order_Item_Id,
          Order_Id,
          Item_Id,
          item.Item_Quantity,
          item.Item_Price,
          item.Amount,
        ]
      );

      // one kitchen row per quantity
      // for (let i = 0; i < item.Item_Quantity; i++) {
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
          [KOT_Item_Id, KOT_Id, Item_Id, item.Item_Name,item.Item_Quantity]
        );
      //}
    }

    /* ---------------- FETCH FULL KOT ITEMS + CATEGORY ---------------- */
    const [kotItems] = await connection.query(
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

    /* ---------------- SOCKET (ONCE PER CATEGORY) ---------------- */
    Object.entries(byCategory).forEach(([category, items]) => {
      io.to(`category_${category}`).emit("new_kitchen_order", {
        KOT_Id,
        Order_Id,
        Order_Type: "dinein",
        Status: "pending",
        items,
      });
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      Order_Id,
      KOT_Id,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Add Order Error:", err);
    next(err);
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



const getTablesHavingOrders = async (req, res, next) => {
    let connection;

    try {
        connection = await db.getConnection();

        // ===========================
        // 1️⃣ DINE-IN ORDERS
        // ===========================
        const [dineinOrders] = await connection.query(
            `SELECT 
                o.Order_Id,
                o.User_Id,
                o.Status,
                o.Sub_Total,
                o.Discount,
                o.Amount,
                o.Payment_Status,
                t.Table_Id,
                t.Table_Name,
                t.Start_Time AS Table_Start_Time
            FROM orders o
            JOIN order_tables ot ON o.Order_Id = ot.Order_Id
            JOIN add_table t ON t.Table_Id = ot.Table_Id
            WHERE o.Status = 'hold'`
        );

        const dineinFormatted = dineinOrders.map(o => ({
            ...o,
            orderType: "dinein"
        }));

        // ===========================
        // 2️⃣ TAKEAWAY ORDERS
        // ===========================
        const [takeawayHeaders] = await connection.query(`
            SELECT 
                tk.Takeaway_Order_Id,
                tk.User_Id,
                tk.Status,
                tk.Sub_Total,
                tk.Discount,
                tk.Amount,
                tk.Payment_Status,
                ko.KOT_Id
            FROM orders_takeaway tk
            JOIN kitchen_orders ko ON ko.Order_Id = tk.Takeaway_Order_Id
            WHERE tk.Status = 'paid'
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
            tableHavingOrders: dineinFormatted,
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
        message: "Order ID is required."
      });
    }

    connection = await db.getConnection();

    // 1️⃣ ORDER
    const [orderResult] = await connection.query(
      `SELECT * FROM orders WHERE Order_Id = ?`,
      [Order_Id]
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
    const [tables] = await connection.query(
      `SELECT  t.Table_Id, t.Table_Name, t.Start_Time AS Table_Start_Time
       FROM order_tables ot
       JOIN add_table t ON t.Table_Id = ot.Table_Id
       WHERE ot.Order_Id = ?`,
      [Order_Id]
    );

    // 3️⃣ ORDER ITEMS (menu structure)
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

    // 4️⃣ FETCH KOT
    const [[kot]] = await connection.query(
      `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
      [Order_Id]
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
      Order_Id,
      customer,
      tables: tables.map(t => t.Table_Name),

      // original order items (for billing UI)
      orderItems,

      // kitchen rows (1 row = 1 cooking item)
      kitchenItems,

      KOT_Id
    });

  } catch (err) {
    console.error("❌ Error fetching table order:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
const updateOrder = async (req, res, next) => {
  let connection;

  try {
    const { Order_Id } = req.params;
    const { items, Sub_Total, Amount } = req.body;

    if (!Order_Id) {
      return res.status(400).json({ success: false, message: "Order ID missing" });
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
      `UPDATE orders SET Sub_Total = ?, Amount = ? WHERE Order_Id = ?`,
      [Sub_Total, Amount, Order_Id]
    );

    /* ---------------------------------------------------
       2️⃣ FETCH OR CREATE KOT
    --------------------------------------------------- */
    const [[existingKOT]] = await connection.query(
      `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
      [Order_Id]
    );

    let KOT_Id;
    if (existingKOT) {
      KOT_Id = existingKOT.KOT_Id;
    } else {
      KOT_Id = await generateNextId(connection, "KOT", "KOT_Id", "kitchen_orders");
      await connection.query(
        `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
         VALUES (?, ?, 'pending')`,
        [KOT_Id, Order_Id]
      );
    }

    /* ---------------------------------------------------
       3️⃣ FETCH EXISTING FRONTDESK ITEMS
    --------------------------------------------------- */
    const [existingOrderItems] = await connection.query(
      `SELECT oi.Item_Id, oi.Quantity, afi.Item_Name
       FROM order_items oi
       JOIN add_food_item afi ON oi.Item_Id = afi.Item_Id
       WHERE oi.Order_Id = ?`,
      [Order_Id]
    );

    const existingOrderMap = {};
    existingOrderItems.forEach(row => {
      existingOrderMap[row.Item_Id] = {
        name: row.Item_Name,
        quantity: Number(row.Quantity),
      };
    });

    /* ---------------------------------------------------
       4️⃣ BUILD NEW ITEMS MAP (FROM FRONTEND)
    --------------------------------------------------- */
    const newItemMap = {};
    items.forEach(item => {
      if (item.Item_Name && item.Item_Quantity > 0) {
        newItemMap[item.Item_Name] = Number(item.Item_Quantity);
      }
    });

    /* ---------------------------------------------------
       5️⃣ FIND REMOVED ITEMS
    --------------------------------------------------- */
    const removedItemIds = [];

    for (const [itemId, data] of Object.entries(existingOrderMap)) {
      const stillExists = items.some(i => i.Item_Name === data.name);
      if (!stillExists) {
        removedItemIds.push(itemId);
      }
    }

    /* ---------------------------------------------------
       6️⃣ DELETE REMOVED ITEMS (FRONTDESK + KITCHEN)
    --------------------------------------------------- */
    if (removedItemIds.length > 0) {
      await connection.query(
        `DELETE FROM order_items
         WHERE Order_Id = ? AND Item_Id IN (?)`,
        [Order_Id, removedItemIds]
      );

      await connection.query(
        `DELETE FROM kitchen_order_items
         WHERE KOT_Id = ? AND Item_Id IN (?)`,
        [KOT_Id, removedItemIds]
      );
    }

    /* ---------------------------------------------------
       7️⃣ CLEAR & REINSERT FRONTDESK ITEMS
    --------------------------------------------------- */
    await connection.query(
      `DELETE FROM order_items WHERE Order_Id = ?`,
      [Order_Id]
    );

    /* ---------------------------------------------------
       8️⃣ FETCH EXISTING KITCHEN ITEMS (QTY MAP)
    --------------------------------------------------- */
    const [existingKitchenItems] = await connection.query(
      `SELECT Item_Id, SUM(Quantity) AS qty
       FROM kitchen_order_items
       WHERE KOT_Id = ?
       GROUP BY Item_Id`,
      [KOT_Id]
    );

    const kitchenQtyMap = {};
    existingKitchenItems.forEach(row => {
      kitchenQtyMap[row.Item_Id] = Number(row.qty) || 0;
    });

    /* ---------------------------------------------------
       9️⃣ SOCKET NOTIFICATION MAP
    --------------------------------------------------- */
    const notifyByCategory = {};

    /* ---------------------------------------------------
       🔟 PROCESS ITEMS
    --------------------------------------------------- */
    for (const item of items) {
      const { Item_Name, Item_Quantity, Item_Price, Amount: ItemAmount } = item;

      if (!Item_Name || Item_Quantity <= 0) continue;

      const [[dbItem]] = await connection.query(
        `SELECT Item_Id, Item_Category
         FROM add_food_item
         WHERE Item_Name = ?
         LIMIT 1`,
        [Item_Name]
      );

      if (!dbItem) continue;

      const Item_Id = dbItem.Item_Id;
      const Category = dbItem.Item_Category;

      /* --------- FRONTDESK INSERT --------- */
      const Order_Item_Id = await generateNextId(
        connection,
        "ODRITM",
        "Order_Item_Id",
        "order_items"
      );

      await connection.query(
        `INSERT INTO order_items
         (Order_Item_Id, Order_Id, Item_Id, Quantity, Price, Amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [Order_Item_Id, Order_Id, Item_Id, Item_Quantity, Item_Price, ItemAmount]
      );

      /* --------- KITCHEN DELTA LOGIC --------- */
      const oldQty = kitchenQtyMap[Item_Id] || 0;
      const newQty = Item_Quantity - oldQty;

      if (newQty <= 0) continue;

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
        [KOT_Item_Id, KOT_Id, Item_Id, Item_Name, newQty]
      );

      notifyByCategory[Category] ??= [];
      notifyByCategory[Category].push({
        KOT_Item_Id,
        Item_Id,
        Item_Name,
        Item_Category: Category,
        Quantity: newQty,
        Item_Status: "pending",
      });
    }

    /* ---------------------------------------------------
       1️⃣1️⃣ COMMIT
    --------------------------------------------------- */
    await connection.commit();

    /* ---------------------------------------------------
       1️⃣2️⃣ SOCKET NOTIFY (CATEGORY-WISE)
    --------------------------------------------------- */
    Object.entries(notifyByCategory).forEach(([category, items]) => {
      io.to(`category_${category}`).emit("new_kitchen_order", {
        KOT_Id,
        Order_Id,
        Order_Type: "dinein",
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
      Payment_Type,
      Final_Amount
    } = req.body;
const normalizedCustomerName =Customer_Name && Customer_Name.trim() !== ""
    ? Customer_Name.trim()
    : null;
    if (!Order_Id) {
      return res.status(400).json({
        success: false,
        message: "Order ID missing",
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
      [Order_Id]
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
      "INV",
      "Invoice_Id",
      "invoices"
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
      `INSERT INTO invoices
      (Invoice_Id, Order_Id, Invoice_Date, Financial_Year, 
       Customer_Name, Customer_Phone,Customer_Id,
       Discount_Type, Discount, Service_Charge, Amount, Payment_Type)
       VALUES (?, ?, NOW(), ?,?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Invoice_Id, Order_Id, activeFY,
          normalizedCustomerName,
        Customer_Phone ,
        Customer_Id,
        Discount_Type,
        Discount || 0,
        Service_Charge || 0,
        Final_Amount,
        Payment_Type,
      ]
    );

    // ---------------------------------------
    // 3️⃣ Mark Order as Completed
    // ---------------------------------------
    await connection.query(
      `UPDATE orders 
       SET Payment_Status = 'completed', Status = 'paid'
       WHERE Order_Id = ?`,
      [Order_Id]
    );

    // ---------------------------------------
    // 4️⃣ Free Tables
    // ---------------------------------------
    const [tableIds] = await connection.query(
      `SELECT Table_Id FROM order_tables WHERE Order_Id = ?`,
      [Order_Id]
    );

    await connection.query(
      `UPDATE add_table 
       SET Status = 'available', Start_Time = NULL, End_Time = NOW()
       WHERE Table_Id IN (?)`,
      [tableIds.map((t) => t.Table_Id)]
    );

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



const totalInvoicesEachDay = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    /* ---------------- DINE-IN INVOICES ---------------- */
    const [dineInInvoices] = await connection.query(`
      SELECT
        DATE_FORMAT(Invoice_Date, '%Y-%m-%d') AS date,
        COUNT(*) AS total_invoices
      FROM invoices
      GROUP BY DATE(Invoice_Date)
      ORDER BY DATE(Invoice_Date) DESC
    `);

    /* ---------------- TAKEAWAY (NOT CANCELLED) ---------------- */
    const [takeawayInvoices] = await connection.query(`
      SELECT
        DATE_FORMAT(ti.Invoice_Date, '%Y-%m-%d') AS date,
        COUNT(*) AS total_takeaway_invoices
      FROM takeaway_invoices ti
      JOIN orders_takeaway ot 
        ON ti.Takeaway_Order_Id = ot.Takeaway_Order_Id
      WHERE ot.Status <> 'cancelled'
      GROUP BY DATE(ti.Invoice_Date)
      ORDER BY DATE(ti.Invoice_Date) DESC
    `);

    /* ---------------- TAKEAWAY (CANCELLED) ---------------- */
    const [cancelledTakeawayInvoices] = await connection.query(`
      SELECT
        DATE_FORMAT(ti.Invoice_Date, '%Y-%m-%d') AS date,
        COUNT(*) AS cancelled_takeaway_invoices
      FROM takeaway_invoices ti
      JOIN orders_takeaway ot 
        ON ti.Takeaway_Order_Id = ot.Takeaway_Order_Id
      WHERE ot.Status = 'cancelled'
      GROUP BY DATE(ti.Invoice_Date)
      ORDER BY DATE(ti.Invoice_Date) DESC
    `);

    return res.status(200).json({
      success: true,
      
        data:dineInInvoices,
        takeawayInvoices,
        cancelledTakeawayInvoices,
    
    });

  } catch (err) {
    console.error("❌ Error fetching invoice data:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


// const getAllInvoicesAndOrdersEachDay = async (req, res, next) => {
//   let connection;

//   try {
//     const { date, search = "" } = req.query;
//     const page = req.query.page ? parseInt(req.query.page, 10) : 1;
//     const limit = 10;
//     const offset = (page - 1) * limit;

//     if (!date) {
//       return res.status(400).json({
//         success: false,
//         message: "Date is required",
//       });
//     }

//     connection = await db.getConnection();

//     let searchCondition = "";
//     let params = [date];
// let searchInvoice = "";
// let searchTakeaway = "";

// let paramsInvoice = [date];
// let paramsTakeaway = [date];
// if (search) {
//   const cleanSearch = search.trim().toLowerCase();
//   const s = `%${cleanSearch}%`;

//   searchInvoice = `
//     AND (
//       LOWER(Customer_Name) LIKE ?
//       OR LOWER(Customer_Phone) LIKE ?
//       OR LOWER(Invoice_Id) LIKE ?
//       OR LOWER(Order_Id) LIKE ?
//     )
//   `;

//   searchTakeaway = `
//     AND (
//       LOWER(Customer_Name) LIKE ?
//       OR LOWER(Customer_Phone) LIKE ?
//       OR LOWER(Invoice_Id) LIKE ?
//       OR LOWER(Takeaway_Order_Id) LIKE ?
//     )
//   `;

//   paramsInvoice.push(s, s, s, s);
//   paramsTakeaway.push(s, s, s, s);
// }

// const [countNormal] = await connection.query(
//   `SELECT COUNT(*) as total
//    FROM invoices
//    WHERE DATE(created_at) = ?
//    ${searchInvoice}`,
//   paramsInvoice
// );

//     // const [countTakeaway] = await connection.query(
//     //   `SELECT COUNT(*) as total 
//     //    FROM takeaway_invoices
//     //    WHERE DATE(created_at) = ?
//     //    ${searchCondition}`,
//     //   params
//     // );
// const [countTakeaway] = await connection.query(
//   `SELECT COUNT(*) as total
//    FROM takeaway_invoices
//    WHERE DATE(created_at) = ?
//    ${searchTakeaway}`,
//   paramsTakeaway
// );

//     const totalInvoices = countNormal[0].total + countTakeaway[0].total;
//     const totalPages = Math.ceil(totalInvoices / limit);

//     // ----------------------------------------------------
//     // 2️⃣ FETCH DINE-IN INVOICES (with Customer_Id)
//     // ----------------------------------------------------
//     // const [normalInvoices] = await connection.query(
//     //   `SELECT inv.*, 'dine' AS orderType
//     //    FROM invoices inv
//     //    WHERE DATE(inv.created_at) = ?
//     //    ${searchCondition}
//     //    ORDER BY inv.created_at ASC
//     //    LIMIT ? OFFSET ?`,
//     //   [...params, limit, offset]
//     // );
// const [normalInvoices] = await connection.query(
//   `SELECT inv.*, 'dine' AS orderType
//    FROM invoices inv
//    WHERE DATE(inv.created_at) = ?
//    ${searchInvoice}
//    ORDER BY inv.created_at ASC
//    LIMIT ? OFFSET ?`,
//   [...paramsInvoice, limit, offset]
// );

//     // ----------------------------------------------------
//     // 3️⃣ FETCH TAKEAWAY INVOICES (with Customer_Id)
//     // ----------------------------------------------------
//     // const [takeawayInvoices] = await connection.query(
//     //   `SELECT tk.*, 'takeaway' AS orderType
//     //    FROM takeaway_invoices tk
//     //    WHERE DATE(tk.created_at) = ?
//     //    ${searchCondition}
//     //    ORDER BY tk.created_at ASC
//     //    LIMIT ? OFFSET ?`,
//     //   [...params, limit, offset]
//     // );
// const [takeawayInvoices] = await connection.query(
//   `SELECT tk.*, 'takeaway' AS orderType
//    FROM takeaway_invoices tk
//    WHERE DATE(tk.created_at) = ?
//    ${searchTakeaway}
//    ORDER BY tk.created_at ASC
//    LIMIT ? OFFSET ?`,
//   [...paramsTakeaway, limit, offset]
// );

//     const allInvoices = [...normalInvoices, ...takeawayInvoices];

//     if (allInvoices.length === 0) {
//       return res.status(200).json({
//         success: true,
//         date,
//         page,
//         totalInvoices,
//         totalPages,
//         data: []
//       });
//     }

//     // Extract order_ids
//     const dineOrderIds = normalInvoices.map(i => i.Order_Id);
//     const takeawayOrderIds = takeawayInvoices.map(i => i.Takeaway_Order_Id);

//     const dineCustomerIds = normalInvoices.map(i => i.Customer_Id).filter(Boolean);
//     const takeawayCustomerIds = takeawayInvoices.map(i => i.Customer_Id).filter(Boolean);

//     const allCustomerIds = [...new Set([...dineCustomerIds, ...takeawayCustomerIds])];

//     // ----------------------------------------------------
//     // 4️⃣ FETCH CUSTOMER DETAILS FOR ALL
//     // ----------------------------------------------------
//     let [customerList] = allCustomerIds.length
//       ? await connection.query(
//           `SELECT * FROM customers WHERE Customer_Id IN (?)`,
//           [allCustomerIds]
//         )
//       : [[]];

//     // ----------------------------------------------------
//     // 5️⃣ FETCH ORDERS (DINE-IN)
//     // ----------------------------------------------------
//     let [orders] = dineOrderIds.length
//       ? await connection.query(`SELECT * FROM orders WHERE Order_Id IN (?)`, [dineOrderIds])
//       : [[]];

//     // ----------------------------------------------------
//     // 6️⃣ FETCH TAKEAWAY ORDERS
//     // ----------------------------------------------------
//     let [ordersTakeaway] = takeawayOrderIds.length
//       ? await connection.query(`SELECT * FROM orders_takeaway WHERE Takeaway_Order_Id IN (?)`, [takeawayOrderIds])
//       : [[]];

//     // ----------------------------------------------------
//     // 7️⃣ FETCH ITEMS FOR DINE-IN
//     // ----------------------------------------------------
//     let [items] = dineOrderIds.length
//       ? await connection.query(
//           `SELECT oi.Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
//            FROM order_items oi
//            JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//            WHERE oi.Order_Id IN (?)`,
//           [dineOrderIds]
//         )
//       : [[]];

//     // ----------------------------------------------------
//     // 8️⃣ FETCH ITEMS FOR TAKEAWAY
//     // ----------------------------------------------------
//     let [takeawayItems] = takeawayOrderIds.length
//       ? await connection.query(
//           `SELECT oi.Takeaway_Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
//            FROM order_takeaway_items oi
//            JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//            WHERE oi.Takeaway_Order_Id IN (?)`,
//           [takeawayOrderIds]
//         )
//       : [[]];

//     // ----------------------------------------------------
//     // 9️⃣ FETCH TABLES FOR DINE-IN
//     // ----------------------------------------------------
//     let [tables] = dineOrderIds.length
//       ? await connection.query(
//           `SELECT ot.Order_Id, t.Table_Id, t.Table_Name
//            FROM order_tables ot
//            JOIN add_table t ON t.Table_Id = ot.Table_Id
//            WHERE ot.Order_Id IN (?)`,
//           [dineOrderIds]
//         )
//       : [[]];

//     // ----------------------------------------------------
//     // 🔟 MERGE EVERYTHING
//     // ----------------------------------------------------
//     const finalData = allInvoices.map(inv => {
//       const customer = customerList.find(c => c.Customer_Id === inv.Customer_Id) || null;

//       if (inv.orderType === "dine") {
//         return {
//           invoice: inv,
//           customer,
//           order: orders.find(o => o.Order_Id === inv.Order_Id) || null,
//           items: items.filter(i => i.Order_Id === inv.Order_Id),
//           tables: tables.filter(t => t.Order_Id === inv.Order_Id),
//           orderType: "dine"
//         };
//       }

//       else {
//         return {
//           invoice: inv,
//           customer,
//           order: ordersTakeaway.find(o => o.Takeaway_Order_Id === inv.Takeaway_Order_Id) || null,
//           items: takeawayItems.filter(i => i.Takeaway_Order_Id === inv.Takeaway_Order_Id),
//           tables: [],
//           orderType: "takeaway"
//         };
//       }
//     });

//     return res.status(200).json({
//       success: true,
//       date,
//       page,
//       totalInvoices,
//       totalPages,
//       pageSize: limit,
//       data: finalData,
//     });

//   } catch (err) {
//     console.error("❌ Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

// const getAllInvoicesAndOrdersEachDay = async (req, res, next) => {
//     let connection;

//     try {
//         const { date, search = "" } = req.query;
//         const page = req.query.page ? parseInt(req.query.page, 10) : 1;
//         const limit = 10;
//         const offset = (page - 1) * limit;

//         if (!date) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Date is required",
//             });
//         }

//         connection = await db.getConnection();

//         let searchCondition = "";
//         let params = [date];

//         if (search) {
//             searchCondition = `
//                 AND (LOWER(Customer_Name) LIKE ? 
//                 OR LOWER(Invoice_Id) LIKE ?
//                 OR LOWER(Order_Id) LIKE ?)
//             `;
//             params.push(`%${search.toLowerCase()}%`);
//             params.push(`%${search.toLowerCase()}%`);
//             params.push(`%${search.toLowerCase()}%`);
//         }

//         // ----------------------------------------------------
//         // 1️⃣ COUNT NORMAL INVOICES
//         // ----------------------------------------------------
//         const [countNormal] = await connection.query(
//             `SELECT COUNT(*) as total 
//              FROM invoices
//              WHERE DATE(created_at) = ?
//              ${searchCondition}`,
//             params
//         );

//         // ----------------------------------------------------
//         // 2️⃣ COUNT TAKEAWAY INVOICES
//         // ----------------------------------------------------
//         const [countTakeaway] = await connection.query(
//             `SELECT COUNT(*) as total
//              FROM takeaway_invoices
//              WHERE DATE(created_at) = ?
//              ${searchCondition}`,
//             params
//         );

//         const totalInvoices = countNormal[0].total + countTakeaway[0].total;
//         const totalPages = Math.ceil(totalInvoices / limit);

//         // ----------------------------------------------------
//         // 3️⃣ FETCH NORMAL INVOICES + PAGINATION
//         // ----------------------------------------------------
//         const [normalInvoices] = await connection.query(
//             `SELECT *, 'dine' AS orderType
//              FROM invoices
//              WHERE DATE(created_at) = ?
//              ${searchCondition}
//              ORDER BY created_at ASC
//              LIMIT ? OFFSET ?`,
//             [...params, limit, offset]
//         );

//         // ----------------------------------------------------
//         // 4️⃣ FETCH TAKEAWAY INVOICES + PAGINATION
//         // ----------------------------------------------------
//         const [takeawayInvoices] = await connection.query(
//             `SELECT *, 'takeaway' AS orderType
//              FROM takeaway_invoices
//              WHERE DATE(created_at) = ?
//              ${searchCondition}
//              ORDER BY created_at ASC
//              LIMIT ? OFFSET ?`,
//             [...params, limit, offset]
//         );

//         // Combine both
//         const allInvoices = [...normalInvoices, ...takeawayInvoices];

//         if (allInvoices.length === 0) {
//             return res.status(200).json({
//                 success: true,
//                 date,
//                 page,
//                 totalInvoices,
//                 totalPages,
//                 data: []
//             });
//         }

//         // Extract order_ids for both types
//         const dineOrderIds = normalInvoices.map((i) => i.Order_Id);
//         const takeawayOrderIds = takeawayInvoices.map((i) => i.Takeaway_Order_Id);

//         // ----------------------------------------------------
//         // 5️⃣ FETCH ORDERS (DINE-IN)
//         // ----------------------------------------------------
//         let [orders] = dineOrderIds.length
//             ? await connection.query(`SELECT * FROM orders WHERE Order_Id IN (?)`, [dineOrderIds])
//             : [[]];

//         // ----------------------------------------------------
//         // 6️⃣ FETCH TAKEAWAY ORDERS
//         // ----------------------------------------------------
//         let [ordersTakeaway] = takeawayOrderIds.length
//             ? await connection.query(`SELECT * FROM orders_takeaway WHERE Takeaway_Order_Id IN (?)`, [takeawayOrderIds])
//             : [[]];

//         // ----------------------------------------------------
//         // 7️⃣ FETCH ITEMS FOR DINE-IN
//         // ----------------------------------------------------
//         let [items] = dineOrderIds.length
//             ? await connection.query(
//                   `SELECT oi.Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
//                    FROM order_items oi
//                    JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//                    WHERE oi.Order_Id IN (?)`,
//                   [dineOrderIds]
//               )
//             : [[]];

//         // ----------------------------------------------------
//         // 8️⃣ FETCH ITEMS FOR TAKEAWAY
//         // ----------------------------------------------------
//         let [takeawayItems] = takeawayOrderIds.length
//             ? await connection.query(
//                   `SELECT oi.Takeaway_Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
//                    FROM order_takeaway_items oi
//                    JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//                    WHERE oi.Takeaway_Order_Id IN (?)`,
//                   [takeawayOrderIds]
//               )
//             : [[]];

//         // ----------------------------------------------------
//         // 9️⃣ FETCH TABLES ONLY for dine-in
//         // ----------------------------------------------------
//         let [tables] = dineOrderIds.length
//             ? await connection.query(
//                   `SELECT ot.Order_Id, t.Table_Id, t.Table_Name
//                    FROM order_tables ot
//                    JOIN add_table t ON t.Table_Id = ot.Table_Id
//                    WHERE ot.Order_Id IN (?)`,
//                   [dineOrderIds]
//               )
//             : [[]];

//         // ----------------------------------------------------
//         // 🔟 MERGE EVERYTHING
//         // ----------------------------------------------------
//         const finalData = allInvoices.map((inv) => {
//             if (inv.orderType === "dine") {
//                 return {
//                     invoice: inv,
//                     order: orders.find((o) => o.Order_Id === inv.Order_Id) || null,
//                     items: items.filter((i) => i.Order_Id === inv.Order_Id),
//                     tables: tables.filter((t) => t.Order_Id === inv.Order_Id),
//                     orderType: "dine",
//                 };
//             } else {
//                 return {
//                     invoice: inv,
//                     order: ordersTakeaway.find((o) => o.Takeaway_Order_Id === inv.Takeaway_Order_Id) || null,
//                     items: takeawayItems.filter((i) => i.Takeaway_Order_Id === inv.Takeaway_Order_Id),
//                     tables: [], // No tables for takeaway
//                     orderType: "takeaway",
//                 };
//             }
//         });

//         return res.status(200).json({
//             success: true,
//             date,
//             page,
//             totalInvoices,
//             totalPages,
//             pageSize: limit,
//             data: finalData,
//         });

//     } catch (err) {
//         console.error("❌ Error:", err);
//         next(err);
//     } finally {
//         if (connection) connection.release();
//     }
// };
// const getAllInvoicesOfOrdersAndTakeawaysInDateRange = async (req, res, next) => {
//     let connection;

//     try {
//         const { fromDate, toDate } = req.query;
     
//         if (!fromDate || !toDate) {
//             return res.status(400).json({
//                 success: false,
//                 message: "From Date and To Date are required",
//             });
//         }

//         const page = req.query.page ? parseInt(req.query.page, 10) : 1;
//         const limit = 10;
//         const offset = (page - 1) * limit;

//         connection = await db.getConnection();

//     let searchCondition = "";
//     let params = [date];

//     if (search) {
//       searchCondition = `
//         AND (
//           LOWER(Customer_Name) LIKE ? 
//           OR LOWER(Invoice_Id) LIKE ?
//           OR LOWER(Order_Id) LIKE ?
//         )
//       `;
//       params.push(`%${search.toLowerCase()}%`);
//       params.push(`%${search.toLowerCase()}%`);
//       params.push(`%${search.toLowerCase()}%`);
//     }

//         // ---------------------------------------------------------------------
//         // 1️⃣ Count dine-in invoices
//         // ---------------------------------------------------------------------
//         const [countNormal] = await connection.query(
//             `SELECT COUNT(*) AS total
//              FROM invoices
//              WHERE DATE(created_at) BETWEEN ? AND ?
//              ${searchCondition}`,
//             [fromDate, toDate, ...params]
//         );

//         // ---------------------------------------------------------------------
//         // 2️⃣ Count takeaway invoices
//         // ---------------------------------------------------------------------
//         const [countTakeaway] = await connection.query(
//             `SELECT COUNT(*) AS total
//              FROM takeaway_invoices
//              WHERE DATE(created_at) BETWEEN ? AND ?
//              ${searchCondition}`,
//             [fromDate, toDate, ...params]
//         );

//         const totalInvoices = countNormal[0].total + countTakeaway[0].total;
//         const totalPages = Math.ceil(totalInvoices / limit);

//         // ---------------------------------------------------------------------
//         // 3️⃣ Fetch dine-in invoices (paginated)
//         // ---------------------------------------------------------------------
//         const [normalInvoices] = await connection.query(
//             `SELECT *, 'dine' AS orderType
//              FROM invoices
//              WHERE DATE(created_at) BETWEEN ? AND ?
//              ${searchCondition}
//              ORDER BY created_at ASC
//              LIMIT ? OFFSET ?`,
//             [...params, limit, offset]
//         );

//         // ---------------------------------------------------------------------
//         // 4️⃣ Fetch takeaway invoices (paginated)
//         // ---------------------------------------------------------------------
//         const [takeawayInvoices] = await connection.query(
//             `SELECT *, 'takeaway' AS orderType
//              FROM takeaway_invoices
//              WHERE DATE(created_at) BETWEEN ? AND ?
//              ORDER BY created_at ASC
//              LIMIT ? OFFSET ?`,
//             [fromDate, toDate, limit, offset]
//         );

//         const allInvoices = [...normalInvoices, ...takeawayInvoices];

//         // Nothing found
//         if (allInvoices.length === 0) {
//             return res.status(200).json({
//                 success: true,
//                 fromDate,
//                 toDate,
//                 totalInvoices: 0,
//                 totalPages: 0,
//                 data: []
//             });
//         }

//         // Extract order IDs
//         const dineOrderIds = normalInvoices.map((i) => i.Order_Id);
//         const takeawayOrderIds = takeawayInvoices.map((i) => i.Takeaway_Order_Id);

//         // ---------------------------------------------------------------------
//         // 5️⃣ Fetch dine-in orders
//         // ---------------------------------------------------------------------
//         let [orders] = dineOrderIds.length
//             ? await connection.query(`SELECT * FROM orders WHERE Order_Id IN (?)`, [dineOrderIds])
//             : [[]];

//         // ---------------------------------------------------------------------
//         // 6️⃣ Fetch takeaway orders
//         // ---------------------------------------------------------------------
//         let [ordersTakeaway] = takeawayOrderIds.length
//             ? await connection.query(
//                   `SELECT * FROM orders_takeaway WHERE Takeaway_Order_Id IN (?)`,
//                   [takeawayOrderIds]
//               )
//             : [[]];

//         // ---------------------------------------------------------------------
//         // 7️⃣ Fetch dine-in items
//         // ---------------------------------------------------------------------
//         let [items] = dineOrderIds.length
//             ? await connection.query(
//                   `SELECT oi.Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
//                    FROM order_items oi
//                    JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//                    WHERE oi.Order_Id IN (?)`,
//                   [dineOrderIds]
//               )
//             : [[]];

//         // ---------------------------------------------------------------------
//         // 8️⃣ Fetch takeaway items
//         // ---------------------------------------------------------------------
//         let [takeawayItems] = takeawayOrderIds.length
//             ? await connection.query(
//                   `SELECT oi.Takeaway_Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
//                    FROM order_takeaway_items oi
//                    JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//                    WHERE oi.Takeaway_Order_Id IN (?)`,
//                   [takeawayOrderIds]
//               )
//             : [[]];

//         // ---------------------------------------------------------------------
//         // 9️⃣ Fetch dine-in tables only
//         // ---------------------------------------------------------------------
//         let [tables] = dineOrderIds.length
//             ? await connection.query(
//                   `SELECT ot.Order_Id, t.Table_Id, t.Table_Name
//                    FROM order_tables ot
//                    JOIN add_table t ON t.Table_Id = ot.Table_Id
//                    WHERE ot.Order_Id IN (?)`,
//                   [dineOrderIds]
//               )
//             : [[]];

//         // ---------------------------------------------------------------------
//         // 🔟 Merge all results into final response format
//         // ---------------------------------------------------------------------
//         const finalData = allInvoices.map((inv) => {
//             if (inv.orderType === "dine") {
//                 return {
//                     invoice: inv,
//                     order: orders.find((o) => o.Order_Id === inv.Order_Id) || null,
//                     items: items.filter((i) => i.Order_Id === inv.Order_Id),
//                     tables: tables.filter((t) => t.Order_Id === inv.Order_Id),
//                     orderType: "dine",
//                 };
//             } else {
//                 return {
//                     invoice: inv,
//                     order:
//                         ordersTakeaway.find((o) => o.Takeaway_Order_Id === inv.Takeaway_Order_Id) ||
//                         null,
//                     items: takeawayItems.filter(
//                         (i) => i.Takeaway_Order_Id === inv.Takeaway_Order_Id
//                     ),
//                     tables: [], // takeaway orders do not have tables
//                     orderType: "takeaway",
//                 };
//             }
//         });

//         return res.status(200).json({
//             success: true,
//             fromDate,
//             toDate,
//             page,
//             totalInvoices,
//             totalPages,
//             pageSize: limit,
//             data: finalData,
//         });

//     } catch (err) {
//         console.error("❌ Error:", err);
//         next(err);
//     } finally {
//         if (connection) connection.release();
//     }
// };

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

//     const page = parseInt(req.query.page || 1, 10);
//     const limit = 10;
//     const offset = (page - 1) * limit;

//     connection = await db.getConnection();

//     // -----------------------------
//     // 🔍 SEARCH CONDITION
//     // -----------------------------
//     let searchCondition = "";
//     let searchParams = [];

//     if (search) {
//       searchCondition = `
//         AND (
//           LOWER(Customer_Name) LIKE ?
//           OR LOWER(Invoice_Id) LIKE ?
//         )
//       `;
//       searchParams = [
//         `%${search.toLowerCase()}%`,
//         `%${search.toLowerCase()}%`,
//       ];
//     }

//     // -----------------------------
//     // 1️⃣ FETCH DINE-IN INVOICES
//     // -----------------------------
//     const [dineInvoices] = await connection.query(
//       `
//       SELECT *, 'dine' AS orderType
//       FROM invoices
//       WHERE DATE(created_at) BETWEEN ? AND ?
//       ${searchCondition}
//       ORDER BY created_at DESC
//       `,
//       [fromDate, toDate, ...searchParams]
//     );

//     // -----------------------------
//     // 2️⃣ FETCH TAKEAWAY INVOICES
//     // -----------------------------
//     const [takeawayInvoices] = await connection.query(
//       `
//       SELECT *, 'takeaway' AS orderType
//       FROM takeaway_invoices
//       WHERE DATE(created_at) BETWEEN ? AND ?
//       ${searchCondition}
//       ORDER BY created_at DESC
//       `,
//       [fromDate, toDate, ...searchParams]
//     );

//     // -----------------------------
//     // 3️⃣ MERGE & SORT
//     // -----------------------------
//     const allInvoices = [...dineInvoices, ...takeawayInvoices].sort(
//       (a, b) => new Date(b.created_at) - new Date(a.created_at)
//     );

//     // -----------------------------
//     // 4️⃣ PAGINATION (JS LEVEL)
//     // -----------------------------
//     const totalInvoices = allInvoices.length;
//     const totalPages = Math.ceil(totalInvoices / limit);

//     const paginatedData = allInvoices.slice(offset, offset + limit);

//     return res.status(200).json({
//       success: true,
//       fromDate,
//       toDate,
//       page,
//       totalInvoices,
//       totalPages,
//       pageSize: limit,
//       data: paginatedData,
//     });

//   } catch (err) {
//     console.error("❌ Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };




// const takeawayAddOrdersAndGenerateInvoices = async (req, res, next) => {
//     let connection;

//     try {
//         const { 
//             userId,
//             items,
//             Sub_Total,
//             Amount,
//             Customer_Name,
//             Customer_Phone,
//             Discount_Type,
//             Discount,
//             Payment_Type,
//             Final_Amount
//         } = req.body;

//         // --------------------------------------------
//         // 🔍 REQUIRED FIELDS VALIDATION
//         // --------------------------------------------
//         if (!userId) {
//             return res.status(400).json({ success: false, message: "User ID is required." });
//         }

//         if (!items || items.length === 0) {
//             return res.status(400).json({ success: false, message: "At least one item is required." });
//         }

//         if (Sub_Total == null || Final_Amount == null) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Sub Total and Final Amount are required."
//             });
//         }

//         connection = await db.getConnection();
//         await connection.beginTransaction();

//         // --------------------------------------------
//         // 1️⃣ Generate New Takeaway Order ID
//         // --------------------------------------------
//         const Takeaway_Order_Id = await generateNextId(
//             connection,
//             "TKODR",
//             "Takeaway_Order_Id",
//             "orders_takeaway"
//         );

//         // --------------------------------------------
//         // 2️⃣ INSERT INTO orders_takeaway
//         // --------------------------------------------
       
//         await connection.query(
//   `INSERT INTO orders_takeaway 
//    (Takeaway_Order_Id, User_Id, Status, Sub_Total, Amount, Payment_Status)
//    VALUES (?, ?, ?, ?, ?, ?)`,
//   [
//     Takeaway_Order_Id,
//     userId,
//     "paid",
//     Sub_Total,
//     Final_Amount,  
//     "completed"
//   ]
// );

//          const KOT_Id = await generateNextId(connection, "KOT", "KOT_Id", "kitchen_orders");

//         await connection.query(
//             `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
//              VALUES (?, ?, 'pending')`,
//             [KOT_Id, Takeaway_Order_Id]
//         );
//         // --------------------------------------------
//         // 3️⃣ Insert Items into order_takeaway_items
//         // --------------------------------------------
//         for (let item of items) {

//           if (!item.Item_Quantity || item.Item_Quantity <= 0) {
//   await connection.rollback();
//   return res.status(400).json({
//     success: false,
//     message: `Invalid quantity for item: ${item.Item_Name}`,
//   });
// }

//             // Fix: Must use correct column name
//             const Order_Item_Id = await generateNextId(
//                 connection,
//                 "TKODRITM",
//                 "Takeaway_Order_Item_Id",
//                 "order_takeaway_items"
//             );

//             // Get Item_Id from add_food_item
//             const [ItemRow] = await connection.query(
//                 "SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1",
//                 [item.Item_Name]
//             );

//             if (!ItemRow || ItemRow.length === 0) {
//                 await connection.rollback();
//                 return res.status(404).json({ success: false, message: "Item not found." });
//             }

//             const Item_Id = ItemRow[0].Item_Id;

//             await connection.query(
//                 `INSERT INTO order_takeaway_items 
//                 (Takeaway_Order_Item_Id, Takeaway_Order_Id, Item_Id, Quantity, Price, Amount)
//                  VALUES (?, ?, ?, ?, ?, ?)`,
//                 [
//                     Order_Item_Id,
//                     Takeaway_Order_Id,
//                     Item_Id,
//                     item.Item_Quantity,
//                     item.Item_Price,
//                     item.Amount
//                 ]
//             );

//                const KOT_Item_Id = await generateNextId(connection, "KOTITM", "KOT_Item_Id", 
//         "kitchen_order_items");

//             await connection.query(
//                 `INSERT INTO kitchen_order_items 
//                  (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity)
//                  VALUES (?, ?, ?, ?, ?)`,
//                 [
//                     KOT_Item_Id,
//                     KOT_Id,
//                     Item_Id,
//                     item.Item_Name,
//                     item.Item_Quantity
//                 ]
//             );
//         }

//         // --------------------------------------------
//         // 4️⃣ Generate Invoice ID
//         // --------------------------------------------
//         const Invoice_Id = await generateNextId(
//             connection,
//             "TKINV",
//             "Invoice_Id",
//             "takeaway_invoices"
//         );

//         // --------------------------------------------
//         // 5️⃣ Insert Invoice
//         // --------------------------------------------
//          const [fy] = await connection.query(
//       `SELECT Financial_Year 
//        FROM financial_year 
//        WHERE Current_Financial_Year = 1
//        LIMIT 1`
//     );

//     if (fy.length === 0) {
//       await connection.rollback();
//       return res.status(400).json({
//         message: "No active financial year found. Please set one in settings.",
//       });
//     }

//     const activeFY = fy[0].Financial_Year; 
//         await connection.query(
//             `INSERT INTO takeaway_invoices
//             (Invoice_Id, Takeaway_Order_Id, Invoice_Date, Financial_Year, Amount,
//              Customer_Name, Customer_Phone, Discount_Type, Discount, Payment_Type)
//              VALUES (?, ?, NOW(),?, ?, ?, ?, ?, ?, ?)`,
//             [
//                 Invoice_Id,
//                 Takeaway_Order_Id,
//                 activeFY,
//                 Final_Amount,
//                 Customer_Name || null,
//                 Customer_Phone || null,
//                 Discount_Type ?? "percentage",
//                 Discount || 0,
//                 Payment_Type ?? "cash"
//             ]
//         );

//         // --------------------------------------------
//         // 6️⃣ Commit Transaction
//         // --------------------------------------------
//         // await connection.commit();

//         const [kotItems] = await connection.query(
//       `SELECT Item_Name, Quantity ,Item_Status, KOT_Item_Id
//          FROM kitchen_order_items 
//        WHERE KOT_Id = ?`,
//       [KOT_Id]
//     );

//     await connection.commit();

//     // 6️⃣ Real-time Kitchen Update
//    io.emit("new_kitchen_order", {
//   KOT_Id,
 
//   Order_Id: Takeaway_Order_Id,
//   status: "pending",
//   items: kotItems,
// });


//         return res.status(201).json({
//             success: true,
//             message: "Takeaway Order & Invoice generated successfully",
//             Takeaway_Order_Id,
//             Invoice_Id
//         });

//     } catch (err) {
//         if (connection) await connection.rollback();
//         console.error("❌ Error:", err);
//         next(err);
//     } finally {
//         if (connection) connection.release();
//     }
// };

// const getAllInvoicesAndOrdersEachDay = async (req, res, next) => {
//   let connection;

//   try {
//     const { date, search = "" } = req.query;
//     const page = req.query.page ? parseInt(req.query.page, 10) : 1;
//     const limit = 10;
//     const offset = (page - 1) * limit;

//     if (!date) {
//       return res.status(400).json({
//         success: false,
//         message: "Date is required",
//       });
//     }

//     connection = await db.getConnection();

//     // ----------------------------------------------------
//     // 🔍 SEARCH CONDITIONS
//     // ----------------------------------------------------
//     let searchInvoice = "";
//     let searchTakeaway = "";
//     let paramsInvoice = [date];
//     let paramsTakeaway = [date];

//     if (search) {
//       const s = `%${search.trim().toLowerCase()}%`;

//       searchInvoice = `
//         AND (
//           LOWER(Customer_Name) LIKE ?
//           OR LOWER(Customer_Phone) LIKE ?
//           OR LOWER(Invoice_Id) LIKE ?
//           OR LOWER(Order_Id) LIKE ?
//         )
//       `;

//       searchTakeaway = `
//         AND (
//           LOWER(Customer_Name) LIKE ?
//           OR LOWER(Customer_Phone) LIKE ?
//           OR LOWER(Invoice_Id) LIKE ?
//           OR LOWER(Takeaway_Order_Id) LIKE ?
//         )
//       `;

//       paramsInvoice.push(s, s, s, s);
//       paramsTakeaway.push(s, s, s, s);
//     }

//     // ----------------------------------------------------
//     // 1️⃣ FETCH ALL INVOICE HEADERS (NO PAGINATION)
//     // ----------------------------------------------------
//     const [normalInvoices] = await connection.query(
//       `
//       SELECT inv.*, 'dine' AS orderType
//       FROM invoices inv
//       WHERE DATE(inv.created_at) = ?
//       ${searchInvoice}
//       `,
//       paramsInvoice
//     );

//     const [takeawayInvoices] = await connection.query(
//       `
//       SELECT tk.*, 'takeaway' AS orderType
//       FROM takeaway_invoices tk
//       WHERE DATE(tk.created_at) = ?
//       ${searchTakeaway}
//       `,
//       paramsTakeaway
//     );

//     const [countNormal] = await connection.query(
//   `SELECT COUNT(*) as total
//    FROM invoices
//    WHERE DATE(created_at) = ?
//    ${searchInvoice}`,
//   paramsInvoice
// );

//     // const [countTakeaway] = await connection.query(
//     //   `SELECT COUNT(*) as total 
//     //    FROM takeaway_invoices
//     //    WHERE DATE(created_at) = ?
//     //    ${searchCondition}`,
//     //   params
//     // );
// const [countTakeaway] = await connection.query(
//   `SELECT COUNT(*) as total
//    FROM takeaway_invoices
//    WHERE DATE(created_at) = ?
//    ${searchTakeaway}`,
//   paramsTakeaway
// );
//     // ----------------------------------------------------
//     // 2️⃣ MERGE + SORT
//     // ----------------------------------------------------
   
// const allInvoicesSorted = [...normalInvoices, ...takeawayInvoices].sort(
//   (a, b) => {
//     // 1️⃣ DINE FIRST
//     if (a.orderType !== b.orderType) {
//       return a.orderType === "dine" ? -1 : 1;
//     }

//     // 2️⃣ SORT BY DATE INSIDE SAME TYPE
//     return new Date(a.created_at) - new Date(b.created_at);
//   }
// );

//     const totalInvoices = countNormal[0].total + countTakeaway[0].total;
//     const totalPages = Math.ceil(totalInvoices / limit);

//     // ----------------------------------------------------
//     // 3️⃣ APPLY PAGINATION (HERE IS THE KEY)
//     // ----------------------------------------------------
//     const paginatedInvoices = allInvoicesSorted.slice(
//       offset,
//       offset + limit
//     );

//     if (paginatedInvoices.length === 0) {
//       return res.status(200).json({
//         success: true,
//         date,
//         page,
//         pageSize: limit,
//         totalInvoices,
//         totalPages,
//         data: [],
//       });
//     }

//     // ----------------------------------------------------
//     // 4️⃣ EXTRACT IDS (ONLY FROM PAGINATED DATA)
//     // ----------------------------------------------------
//     const dineOrderIds = paginatedInvoices
//       .filter(i => i.orderType === "dine")
//       .map(i => i.Order_Id);

//     const takeawayOrderIds = paginatedInvoices
//       .filter(i => i.orderType === "takeaway")
//       .map(i => i.Takeaway_Order_Id);

//     const customerIds = [
//       ...new Set(
//         paginatedInvoices
//           .map(i => i.Customer_Id)
//           .filter(Boolean)
//       )
//     ];

//     // ----------------------------------------------------
//     // 5️⃣ FETCH CUSTOMERS
//     // ----------------------------------------------------
//     const [customers] = customerIds.length
//       ? await connection.query(
//           `SELECT * FROM customers WHERE Customer_Id IN (?)`,
//           [customerIds]
//         )
//       : [[]];

//     // ----------------------------------------------------
//     // 6️⃣ FETCH ORDERS
//     // ----------------------------------------------------
//     const [orders] = dineOrderIds.length
//       ? await connection.query(
//           `SELECT * FROM orders WHERE Order_Id IN (?)`,
//           [dineOrderIds]
//         )
//       : [[]];

//     const [ordersTakeaway] = takeawayOrderIds.length
//       ? await connection.query(
//           `SELECT * FROM orders_takeaway WHERE Takeaway_Order_Id IN (?)`,
//           [takeawayOrderIds]
//         )
//       : [[]];

//     // ----------------------------------------------------
//     // 7️⃣ FETCH ITEMS
//     // ----------------------------------------------------
//     const [items] = dineOrderIds.length
//       ? await connection.query(
//           `
//           SELECT oi.Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
//           FROM order_items oi
//           JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//           WHERE oi.Order_Id IN (?)
//           `,
//           [dineOrderIds]
//         )
//       : [[]];

//     const [takeawayItems] = takeawayOrderIds.length
//       ? await connection.query(
//           `
//           SELECT oi.Takeaway_Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
//           FROM order_takeaway_items oi
//           JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//           WHERE oi.Takeaway_Order_Id IN (?)
//           `,
//           [takeawayOrderIds]
//         )
//       : [[]];

//     // ----------------------------------------------------
//     // 8️⃣ FETCH TABLES (DINE-IN)
//     // ----------------------------------------------------
//     const [tables] = dineOrderIds.length
//       ? await connection.query(
//           `
//           SELECT ot.Order_Id, t.Table_Id, t.Table_Name
//           FROM order_tables ot
//           JOIN add_table t ON t.Table_Id = ot.Table_Id
//           WHERE ot.Order_Id IN (?)
//           `,
//           [dineOrderIds]
//         )
//       : [[]];

//     // ----------------------------------------------------
//     // 9️⃣ FINAL MERGE
//     // ----------------------------------------------------
//     const finalData = paginatedInvoices.map(inv => {
//       const customer =
//         customers.find(c => c.Customer_Id === inv.Customer_Id) || null;

//       if (inv.orderType === "dine") {
//         return {
//           invoice: inv,
//           customer,
//           order: orders.find(o => o.Order_Id === inv.Order_Id) || null,
//           items: items.filter(i => i.Order_Id === inv.Order_Id),
//           tables: tables.filter(t => t.Order_Id === inv.Order_Id),
//           orderType: "dine",
//         };
//       }

//       return {
//         invoice: inv,
//         customer,
//         order:
//           ordersTakeaway.find(o => o.Takeaway_Order_Id === inv.Takeaway_Order_Id) ||
//           null,
//         items: takeawayItems.filter(
//           i => i.Takeaway_Order_Id === inv.Takeaway_Order_Id
//         ),
//         tables: [],
//         orderType: "takeaway",
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       date,
//       page,
//       pageSize: limit,
//       totalInvoices,
//       totalPages,
//       data: finalData,
//     });

//   } catch (err) {
//     console.error("❌ Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
const getAllInvoicesAndOrdersEachDay = async (req, res, next) => {
  let connection;

  try {
    const { date, search = "" } = req.query;
    const page = parseInt(req.query.page || 1, 10);
    const limit = 10;
    const offset = (page - 1) * limit;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    connection = await db.getConnection();

    // ----------------------------------------------------
    // 🔍 SEARCH CONDITIONS
    // ----------------------------------------------------
    let searchInvoice = "";
    let searchTakeaway = "";
    let paramsInvoice = [date];
    let paramsTakeaway = [date];

    if (search) {
      const s = `%${search.trim().toLowerCase()}%`;

      searchInvoice = `
        AND (
          LOWER(Customer_Name) LIKE ?
          OR LOWER(Customer_Phone) LIKE ?
          OR LOWER(Invoice_Id) LIKE ?
          OR LOWER(Order_Id) LIKE ?
        )
      `;

      searchTakeaway = `
        AND (
          LOWER(Customer_Name) LIKE ?
          OR LOWER(Customer_Phone) LIKE ?
          OR LOWER(Invoice_Id) LIKE ?
          OR LOWER(Takeaway_Order_Id) LIKE ?
        )
      `;

      paramsInvoice.push(s, s, s, s);
      paramsTakeaway.push(s, s, s, s);
    }

    // ----------------------------------------------------
    // 1️⃣ COUNT TOTAL (DINE + TAKEAWAY)
    // ----------------------------------------------------
    const [countNormal] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM invoices
      WHERE DATE(created_at) = ?
      ${searchInvoice}
      `,
      paramsInvoice
    );

    const [countTakeaway] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM takeaway_invoices
      WHERE DATE(created_at) = ?
      ${searchTakeaway}
      `,
      paramsTakeaway
    );

    const totalInvoices = countNormal[0].total + countTakeaway[0].total;
    const totalPages = Math.ceil(totalInvoices / limit);

    // ----------------------------------------------------
    // 2️⃣ FETCH PAGINATED DATA (UNION ALL)
    // ----------------------------------------------------
   const [pagedInvoices] = await connection.query(
  `
  (
    SELECT
      inv.Invoice_Id,
      inv.Order_Id,
      inv.Customer_Id,
      inv.Customer_Name,
      inv.Customer_Phone,
      inv.Amount,
      inv.Service_Charge,
      inv.Discount,
      inv.Discount_Type,
      inv.created_at,
      inv.Invoice_Date,
      'dine' AS orderType,
      1 AS sortOrder,
      NULL AS Takeaway_Order_Id
    FROM invoices inv
    WHERE DATE(inv.created_at) = ?
    ${searchInvoice}
  )
  UNION ALL
  (
    SELECT
      tk.Invoice_Id,
      NULL AS Order_Id,
      tk.Customer_Id,
      tk.Customer_Name,
      tk.Customer_Phone,
      tk.Amount,
       NULL AS Service_Charge,  -- ✅ PLACEHOLDER ADDED
      tk.Discount,
      tk.Discount_Type,
      tk.created_at,
      tk.Invoice_Date,
      'takeaway' AS orderType,
      2 AS sortOrder,
      tk.Takeaway_Order_Id
    FROM takeaway_invoices tk
    WHERE DATE(tk.created_at) = ?
    ${searchTakeaway}
  )
  ORDER BY sortOrder ASC, created_at ASC
  LIMIT ? OFFSET ?
  `,
  [
    ...paramsInvoice,
    ...paramsTakeaway,
    limit,
    offset,
  ]
);


    if (pagedInvoices.length === 0) {
      return res.status(200).json({
        success: true,
        date,
        page,
        pageSize: limit,
        totalInvoices,
        totalPages,
        data: [],
      });
    }

    // ----------------------------------------------------
    // 3️⃣ EXTRACT IDS
    // ----------------------------------------------------
    const dineOrderIds = pagedInvoices
      .filter(i => i.orderType === "dine")
      .map(i => i.Order_Id);

    const takeawayOrderIds = pagedInvoices
      .filter(i => i.orderType === "takeaway")
      .map(i => i.Takeaway_Order_Id);

    // ----------------------------------------------------
    // 4️⃣ FETCH ORDERS
    // ----------------------------------------------------
    const [orders] = dineOrderIds.length
      ? await connection.query(
          `SELECT * FROM orders WHERE Order_Id IN (?)`,
          [dineOrderIds]
        )
      : [[]];

    const [ordersTakeaway] = takeawayOrderIds.length
      ? await connection.query(
          `SELECT * FROM orders_takeaway WHERE Takeaway_Order_Id IN (?)`,
          [takeawayOrderIds]
        )
      : [[]];

    // ----------------------------------------------------
    // 5️⃣ FETCH ITEMS
    // ----------------------------------------------------
    const [items] = dineOrderIds.length
      ? await connection.query(
          `
          SELECT oi.Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
          FROM order_items oi
          JOIN add_food_item f ON f.Item_Id = oi.Item_Id
          WHERE oi.Order_Id IN (?)
          `,
          [dineOrderIds]
        )
      : [[]];

    const [takeawayItems] = takeawayOrderIds.length
      ? await connection.query(
          `
          SELECT oi.Takeaway_Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
          FROM order_takeaway_items oi
          JOIN add_food_item f ON f.Item_Id = oi.Item_Id
          WHERE oi.Takeaway_Order_Id IN (?)
          `,
          [takeawayOrderIds]
        )
      : [[]];

    // ----------------------------------------------------
    // 6️⃣ FETCH TABLES (DINE-IN)
    // ----------------------------------------------------
    const [tables] = dineOrderIds.length
      ? await connection.query(
          `
          SELECT ot.Order_Id, t.Table_Id, t.Table_Name
          FROM order_tables ot
          JOIN add_table t ON t.Table_Id = ot.Table_Id
          WHERE ot.Order_Id IN (?)
          `,
          [dineOrderIds]
        )
      : [[]];

    // ----------------------------------------------------
    // 7️⃣ FINAL MERGE
    // ----------------------------------------------------
    const finalData = pagedInvoices.map(inv => {
      if (inv.orderType === "dine") {
        return {
          invoice: inv,
          order: orders.find(o => o.Order_Id === inv.Order_Id) || null,
          items: items.filter(i => i.Order_Id === inv.Order_Id),
          tables: tables.filter(t => t.Order_Id === inv.Order_Id),
          orderType: "dine",
        };
      }

      return {
        invoice: inv,
        order:
          ordersTakeaway.find(o => o.Takeaway_Order_Id === inv.Takeaway_Order_Id) ||
          null,
        items: takeawayItems.filter(
          i => i.Takeaway_Order_Id === inv.Takeaway_Order_Id
        ),
        tables: [],
        orderType: "takeaway",
      };
    });

    return res.status(200).json({
      success: true,
      date,
      page,
      pageSize: limit,
      totalInvoices,
      totalPages,
      data: finalData,
    });

  } catch (err) {
    console.error("❌ Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


const getAllInvoicesOfOrdersAndTakeawaysInDateRange = async (req, res, next) => {
  let connection;

  try {
    const { fromDate, toDate, search = "" } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "From Date and To Date are required",
      });
    }

    const page = parseInt(req.query.page || 1, 10);
    const limit = 10;
    const offset = (page - 1) * limit;

    connection = await db.getConnection();

    // ----------------------------------------------------
    // 🔍 SEARCH CONDITIONS
    // ----------------------------------------------------
    let dineSearchCondition = "";
    let takeawaySearchCondition = "";
    let searchParams = [];

    if (search) {
      const s = `%${search.trim().toLowerCase()}%`;

      dineSearchCondition = `
        AND (
          LOWER(Customer_Name) LIKE ?
          OR LOWER(Customer_Phone) LIKE ?
          OR LOWER(Invoice_Id) LIKE ?
          OR LOWER(Order_Id) LIKE ?
        )
      `;

      takeawaySearchCondition = `
        AND (
          LOWER(Customer_Name) LIKE ?
          OR LOWER(Customer_Phone) LIKE ?
          OR LOWER(Invoice_Id) LIKE ?
          OR LOWER(Takeaway_Order_Id) LIKE ?
        )
      `;

      searchParams = [s, s, s, s];
    }

    // ----------------------------------------------------
    // 1️⃣ COUNT TOTAL (DINE + TAKEAWAY)
    // ----------------------------------------------------
    const [countNormal] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM invoices
      WHERE DATE(created_at) BETWEEN ? AND ?
      ${dineSearchCondition}
      `,
      [fromDate, toDate, ...searchParams]
    );

    const [countTakeaway] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM takeaway_invoices
      WHERE DATE(created_at) BETWEEN ? AND ?
      ${takeawaySearchCondition}
      `,
      [fromDate, toDate, ...searchParams]
    );

    const totalInvoices = countNormal[0].total + countTakeaway[0].total;
    const totalPages = Math.ceil(totalInvoices / limit);

    if (totalInvoices === 0) {
      return res.status(200).json({
        success: true,
        fromDate,
        toDate,
        page,
        totalInvoices: 0,
        totalPages: 0,
        data: [],
      });
    }

    // ----------------------------------------------------
    // 2️⃣ FETCH PAGINATED DATA (UNION ALL)
    // ----------------------------------------------------
    const [pagedInvoices] = await connection.query(
      `
      (
        SELECT
          inv.Invoice_Id,
          inv.Order_Id,
          inv.Customer_Id,
          inv.Customer_Name,
          inv.Customer_Phone,
          inv.Amount,
          inv.Service_Charge,
          inv.Discount,
          inv.Discount_Type,
          inv.created_at,
          inv.Invoice_Date,
          'dine' AS orderType,
          1 AS sortOrder,
          NULL AS Takeaway_Order_Id
        FROM invoices inv
        WHERE DATE(inv.created_at) BETWEEN ? AND ?
        ${dineSearchCondition}
      )
      UNION ALL
      (
        SELECT
          tk.Invoice_Id,
          NULL AS Order_Id,
          tk.Customer_Id,
          tk.Customer_Name,
          tk.Customer_Phone,
          tk.Amount,
          NULL AS Service_Charge,
          tk.Discount,
          tk.Discount_Type,
          tk.created_at,
          tk.Invoice_Date,
          'takeaway' AS orderType,
          2 AS sortOrder,
          tk.Takeaway_Order_Id
        FROM takeaway_invoices tk
        WHERE DATE(tk.created_at) BETWEEN ? AND ?
        ${takeawaySearchCondition}
      )
      ORDER BY sortOrder ASC, created_at DESC
      LIMIT ? OFFSET ?
      `,
      [
        fromDate, toDate, ...searchParams,
        fromDate, toDate, ...searchParams,
        limit, offset
      ]
    );

    // ----------------------------------------------------
    // 3️⃣ EXTRACT IDS
    // ----------------------------------------------------
    const dineOrderIds = pagedInvoices
      .filter(i => i.orderType === "dine")
      .map(i => i.Order_Id);

    const takeawayOrderIds = pagedInvoices
      .filter(i => i.orderType === "takeaway")
      .map(i => i.Takeaway_Order_Id);

    // ----------------------------------------------------
    // 4️⃣ FETCH ORDERS
    // ----------------------------------------------------
    const [orders] = dineOrderIds.length
      ? await connection.query(
          `SELECT * FROM orders WHERE Order_Id IN (?)`,
          [dineOrderIds]
        )
      : [[]];

    const [ordersTakeaway] = takeawayOrderIds.length
      ? await connection.query(
          `SELECT * FROM orders_takeaway WHERE Takeaway_Order_Id IN (?)`,
          [takeawayOrderIds]
        )
      : [[]];

    // ----------------------------------------------------
    // 5️⃣ FETCH ITEMS
    // ----------------------------------------------------
    const [items] = dineOrderIds.length
      ? await connection.query(
          `
          SELECT oi.Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
          FROM order_items oi
          JOIN add_food_item f ON f.Item_Id = oi.Item_Id
          WHERE oi.Order_Id IN (?)
          `,
          [dineOrderIds]
        )
      : [[]];

    const [takeawayItems] = takeawayOrderIds.length
      ? await connection.query(
          `
          SELECT oi.Takeaway_Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
          FROM order_takeaway_items oi
          JOIN add_food_item f ON f.Item_Id = oi.Item_Id
          WHERE oi.Takeaway_Order_Id IN (?)
          `,
          [takeawayOrderIds]
        )
      : [[]];

    // ----------------------------------------------------
    // 6️⃣ FETCH TABLES (DINE-IN)
    // ----------------------------------------------------
    const [tables] = dineOrderIds.length
      ? await connection.query(
          `
          SELECT ot.Order_Id, t.Table_Id, t.Table_Name
          FROM order_tables ot
          JOIN add_table t ON t.Table_Id = ot.Table_Id
          WHERE ot.Order_Id IN (?)
          `,
          [dineOrderIds]
        )
      : [[]];

    // ----------------------------------------------------
    // 7️⃣ FINAL MERGE
    // ----------------------------------------------------
    const finalData = pagedInvoices.map(inv => {
      if (inv.orderType === "dine") {
        return {
          invoice: inv,
          order: orders.find(o => o.Order_Id === inv.Order_Id) || null,
          items: items.filter(i => i.Order_Id === inv.Order_Id),
          tables: tables.filter(t => t.Order_Id === inv.Order_Id),
          orderType: "dine",
        };
      }

      return {
        invoice: inv,
        order:
          ordersTakeaway.find(
            o => o.Takeaway_Order_Id === inv.Takeaway_Order_Id
          ) || null,
        items: takeawayItems.filter(
          i => i.Takeaway_Order_Id === inv.Takeaway_Order_Id
        ),
        tables: [],
        orderType: "takeaway",
      };
    });

    return res.status(200).json({
      success: true,
      fromDate,
      toDate,
      page,
      pageSize: limit,
      totalInvoices,
      totalPages,
      data: finalData,
    });

  } catch (err) {
    console.error("❌ Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

//best takeaway system

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
//        VALUES (?, ?, ?,'paid', ?, ?, 'completed')`,
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
//       Invoice_Id,
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

//changed takeaway order

//new takeaway system
const takeawayAddOrdersAndGenerateInvoices = async (req, res, next) => {
  let connection;

  try {
    const { 
      userId,
      items,
      Sub_Total,
      Amount,
      Customer_Name,
      Customer_Phone,
      Discount_Type,
      Discount,
      Payment_Type,
      Final_Amount
    } = req.body;
    console.log("req.body",req.body);
const normalizedCustomerName =Customer_Name && Customer_Name.trim() !== ""
    ? Customer_Name.trim()
    : null;
    // --------------------------------------------
    // VALIDATION
    // --------------------------------------------
    if (!userId)
      return res.status(400).json({ success: false, message: "User ID is required." });
  if( !Customer_Phone){
            return res.status(400).json({
                success: false,
                message: "Customer phone number is required.",
            })
        }
    if (!items?.length)
      return res.status(400).json({ success: false, message: "At least one item is required." });

    if (Sub_Total == null || Final_Amount == null)
      return res.status(400).json({
        success: false,
        message: "Sub Total and Final Amount are required."
      });

    connection = await db.getConnection();
    await connection.beginTransaction();
let Customer_Id;

    const [existingCustomer] = await connection.query(
      `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
      [Customer_Phone]
    );

    if (existingCustomer.length > 0) {
      // ✔ REUSE EXISTING CUSTOMER
      Customer_Id = existingCustomer[0].Customer_Id;
    } 
    else {
      //  CREATE NEW CUSTOMER
      Customer_Id = await generateNextId(
        connection,
        "CUST",
        "Customer_Id",
        "customers"
      );

      await connection.query(
        `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
         VALUES (?, ?, ?)`,
        [Customer_Id, normalizedCustomerName , Customer_Phone]
      );
    }
       
    // --------------------------------------------
    // 1️⃣ Generate Takeaway Order ID
    // --------------------------------------------
    const Takeaway_Order_Id = await generateNextId(
      connection,
      "TKODR",
      "Takeaway_Order_Id",
      "orders_takeaway"
    );

    // --------------------------------------------
    // 2️⃣ Insert Into orders_takeaway
    // --------------------------------------------
    await connection.query(
      `INSERT INTO orders_takeaway 
       (Takeaway_Order_Id, User_Id,Customer_Id, Status, Sub_Total, Amount, Payment_Status)
       VALUES (?, ?, ?,'paid', ?, ?, 'completed')`,
      [Takeaway_Order_Id, userId,Customer_Id, Sub_Total, Final_Amount]
    );

    // --------------------------------------------
    // 3️⃣ Generate KOT ID & Create Kitchen Order
    // --------------------------------------------
    const KOT_Id = await generateNextId(connection, "KOT", "KOT_Id", "kitchen_orders");

    await connection.query(
      `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
       VALUES (?, ?, 'pending')`,
      [KOT_Id, Takeaway_Order_Id]
    );

    // --------------------------------------------
    // 4️⃣ Insert Items (Order + Kitchen)
    // --------------------------------------------
    for (let item of items) {

      if (!item.Item_Quantity || item.Item_Quantity <= 0){
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for item: ${item.Item_Name}`
        });
      }
      // Fetch Item_Id
      const [ItemRow] = await connection.query(
        "SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1",
        [item.Item_Name]
      );

      if (!ItemRow.length){
             await connection.rollback();
    return res.status(404).json({ success: false, message: "Item not found." });
      }
    

      const Item_Id = ItemRow[0].Item_Id;

      // Insert into order_takeaway_items
      const Order_Item_Id = await generateNextId(
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
          Order_Item_Id,
          Takeaway_Order_Id,
          Item_Id,
          item.Item_Quantity,
          item.Item_Price,
          item.Amount
        ]
      );

      // --------------------------------------------
      // 🍽 INSERT INTO KITCHEN ORDER ITEMS
      // (One row per quantity — same model as dine-in)
      // --------------------------------------------
      // for (let q = 0; q < item.Item_Quantity; q++) {
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
            item.Item_Name,
            item.Item_Quantity
          ]
        );
      
    }

    // --------------------------------------------
    // 5️⃣ Generate Invoice
    // --------------------------------------------
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
// if (!fy.length) {
//   await connection.rollback();
//   return res.status(400).json({
//     message: "No active financial year found."
//   });
// }

    

//     const activeFY = fy[0].Financial_Year;

//     await connection.query(
//       `INSERT INTO takeaway_invoices
//        (Invoice_Id, Takeaway_Order_Id, Invoice_Date, Financial_Year, Amount,
//         Customer_Name, Customer_Phone,Customer_Id, Discount_Type, Discount, Payment_Type)
//        VALUES (?, ?, NOW(), ?, ?, ?,?, ?, ?, ?, ?)`,
//       [
//         Invoice_Id,
//         Takeaway_Order_Id,
//         activeFY,
//         Final_Amount,
//         normalizedCustomerName,
//         Customer_Phone || null,
//         Customer_Id,
//         Discount_Type ?? "percentage",
//         Discount || 0,
//         Payment_Type ?? "cash"
//       ]
//     );

  
    const [kotItems] = await connection.query(
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

    

    // kotItems.forEach((item) => {
    //   if (!itemsByCategory[item.Item_Category]) {
    //     itemsByCategory[item.Item_Category] = [];
    //   }
    //   itemsByCategory[item.Item_Category].push(item);
    // });

    // await connection.commit();

    // /* ------------------------------------------------
    //    🔔 10️⃣ SOCKET → CATEGORY STAFF ONLY
    // ------------------------------------------------ */
    // Object.entries(itemsByCategory).forEach(([category, items]) => {
    //   io.to(`category_${category}`).emit("new_kitchen_order", {
    //     KOT_Id,
    //     Order_Id: Takeaway_Order_Id,
    //     Order_Type: "takeaway",
    //     Status: "pending",
    //     items,
    //   });
    // });
    const itemsByCategory = {};

kotItems.forEach(item => {
  if (!itemsByCategory[item.Item_Category]) {
    itemsByCategory[item.Item_Category] = [];
  }
  itemsByCategory[item.Item_Category].push({
    KOT_Item_Id: item.KOT_Item_Id,
    Item_Id: item.Item_Id,
    Item_Name: item.Item_Name,
    Quantity: item.Quantity,
    Item_Status: item.Item_Status,
  });
});

Object.entries(itemsByCategory).forEach(([category, items]) => {
  io.to(`category_${category}`).emit("new_kitchen_order", {
    KOT_Id,
    Order_Id: Takeaway_Order_Id,
    Order_Type: "takeaway",
    Status: "pending",
    items,
  });
});
await connection.commit();
return res.status(200).json({
      success: true,
      message: " Order completed.",
    
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
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
      `UPDATE orders_takeaway SET Sub_Total = ?, Amount = ? WHERE Takeaway_Order_Id = ?`,
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
       3️⃣ FETCH EXISTING FRONTDESK ITEMS
    --------------------------------------------------- */
    const [existingOrderItems] = await connection.query(
      `SELECT oi.Item_Id, oi.Quantity, afi.Item_Name
       FROM order_takeaway_items oi
       JOIN add_food_item afi ON oi.Item_Id = afi.Item_Id
       WHERE oi.Takeaway_Order_Id = ?`,
      [Takeaway_Order_Id]
    );

    const existingOrderMap = {};
    existingOrderItems.forEach(row => {
      existingOrderMap[row.Item_Id] = {
        name: row.Item_Name,
        quantity: Number(row.Quantity),
      };
    });

    /* ---------------------------------------------------
       4️⃣ BUILD NEW ITEMS MAP (FROM FRONTEND)
    --------------------------------------------------- */
    const newItemMap = {};
    items.forEach(item => {
      if (item.Item_Name && item.Item_Quantity > 0) {
        newItemMap[item.Item_Name] = Number(item.Item_Quantity);
      }
    });

    /* ---------------------------------------------------
       5️⃣ FIND REMOVED ITEMS
    --------------------------------------------------- */
    const removedItemIds = [];

    for (const [itemId, data] of Object.entries(existingOrderMap)) {
      const stillExists = items.some(i => i.Item_Name === data.name);
      if (!stillExists) {
        removedItemIds.push(itemId);
      }
    }

    /* ---------------------------------------------------
       6️⃣ DELETE REMOVED ITEMS (FRONTDESK + KITCHEN)
    --------------------------------------------------- */
    if (removedItemIds.length > 0) {
      await connection.query(
        `DELETE FROM order_takeaway_items
         WHERE Takeaway_Order_Id = ? AND Item_Id IN (?)`,
        [Takeaway_Order_Id, removedItemIds]
      );

      await connection.query(
        `DELETE FROM kitchen_order_items
         WHERE KOT_Id = ? AND Item_Id IN (?)`,
        [KOT_Id, removedItemIds]
      );
    }

    /* ---------------------------------------------------
       7️⃣ CLEAR & REINSERT FRONTDESK ITEMS
    --------------------------------------------------- */
    await connection.query(
      `DELETE FROM order_takeaway_items WHERE Takeaway_Order_Id = ?`,
      [Takeaway_Order_Id]
    );

    /* ---------------------------------------------------
       8️⃣ FETCH EXISTING KITCHEN ITEMS (QTY MAP)
    --------------------------------------------------- */
    const [existingKitchenItems] = await connection.query(
      `SELECT Item_Id, SUM(Quantity) AS qty
       FROM kitchen_order_items
       WHERE KOT_Id = ?
       GROUP BY Item_Id`,
      [KOT_Id]
    );

    const kitchenQtyMap = {};
    existingKitchenItems.forEach(row => {
      kitchenQtyMap[row.Item_Id] = Number(row.qty) || 0;
    });

    /* ---------------------------------------------------
       9️⃣ SOCKET NOTIFICATION MAP
    --------------------------------------------------- */
    const notifyByCategory = {};

    /* ---------------------------------------------------
       🔟 PROCESS ITEMS
    --------------------------------------------------- */
    for (const item of items) {
      const { Item_Name, Item_Quantity, Item_Price, Amount: ItemAmount } = item;

      if (!Item_Name || Item_Quantity <= 0) continue;

      const [[dbItem]] = await connection.query(
        `SELECT Item_Id, Item_Category
         FROM add_food_item
         WHERE Item_Name = ?
         LIMIT 1`,
        [Item_Name]
      );

      if (!dbItem) continue;

      const Item_Id = dbItem.Item_Id;
      const Category = dbItem.Item_Category;

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
        [Takeaway_Order_Item_Id, Takeaway_Order_Id, Item_Id, Item_Quantity, Item_Price, ItemAmount]
      );

      /* --------- KITCHEN DELTA LOGIC --------- */
      const oldQty = kitchenQtyMap[Item_Id] || 0;
      const newQty = Item_Quantity - oldQty;

      if (newQty <= 0) continue;

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
        [KOT_Item_Id, KOT_Id, Item_Id, Item_Name, newQty]
      );

      notifyByCategory[Category] ??= [];
      notifyByCategory[Category].push({
        KOT_Item_Id,
        Item_Id,
        Item_Name,
        Item_Category: Category,
        Quantity: newQty,
        Item_Status: "pending",
      });
    }

    /* ---------------------------------------------------
       1️⃣1️⃣ COMMIT
    --------------------------------------------------- */
    await connection.commit();

    /* ---------------------------------------------------
       1️⃣2️⃣ SOCKET NOTIFY (CATEGORY-WISE)
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

export {addNewCustomer,getAllCustomers,addOrder, getTablesHavingOrders, getTableOrderDetails, updateOrder, 
    confirmOrderBillPaidAndInvoiceGenerated,confirmTakeawayOrderBillPaidAndInvoiceGenerated,
    totalInvoicesEachDay,
    getAllInvoicesAndOrdersEachDay, takeawayAddOrdersAndGenerateInvoices,getTakeawayOrderDetails,updateTakeawayOrder,
    getAllInvoicesOfOrdersAndTakeawaysInDateRange
,nextInvoiceNumber,cancelTakeawayOrder,completeTakeawayOrder};

