import db from "../../config/db.js";

// prefix: "ODR", column: "Order_Id", table: "orders"
// async function generateNextId(connection, prefix, column, table) {
//     const [rows] = await connection.query(
//         `SELECT ${column} FROM ${table} ORDER BY id DESC LIMIT 1`
//     );

//     if (rows.length === 0) return prefix + "00001";

//     const lastId = rows[0][column]; // Example: ODR00012
//     const num = parseInt(lastId.replace(prefix, ""), 10) + 1;

//     return prefix + num.toString().padStart(5, "0");
// }

//  const addOrder = async (req, res, next) => {

//     let connection;

//     // const connection = await db.getConnection();
//     try {
//             const { userId, tableIds, items } = req.body;

//     if (!userId || !tableIds || tableIds.length === 0) {
//         return res.status(400).json({
//             success: false,
//             message: "User ID and at least one table is required."
//         });
//     }
//           connection = await db.getConnection();
//         await connection.beginTransaction();

//         // 1️⃣ Generate next Order Id
//         const Order_Id = await generateNextId(connection, "ODR", "Order_Id", "orders");

//         // 2️⃣ Create Order
//         await connection.query(
//             `INSERT INTO orders 
//             (Order_Id, User_Id, Start_Time, Status, Sub_Total, Tax, Discount, Total)
//             VALUES (?, ?, NOW(), 'hold', 0, 0, 0, 0)`,
//             [Order_Id, userId]
//         );

//         // 3️⃣ Insert tables in order_tables
//         let subTotal = 0;

//         for (let tableId of tableIds) {
//             const Order_Table_Id = await generateNextId(
//                 connection,
//                 "OTB",
//                 "Order_Table_Id",
//                 "order_tables"
//             );

//             await connection.query(
//                 `INSERT INTO order_tables 
//                 (Order_Table_Id, Order_Id, Table_Id)
//                 VALUES (?, ?, ?)`,
//                 [Order_Table_Id, Order_Id, tableId]
//             );

//             // Mark table as occupied
//             await connection.query(
//                 `UPDATE tables SET Status = 'occupied', Start_Time = NOW()
//                  WHERE Table_Id = ?`,
//                 [tableId]
//             );
//         }

//         // 4️⃣ Insert Items
//         for (let item of items) {
//             const Order_Item_Id = await generateNextId(
//                 connection,
//                 "ODRITM",
//                 "Order_Item_Id",
//                 "order_items"
//             );

//             const total = item.quantity * item.price;
//             subTotal += total;

//             await connection.query(
//                 `INSERT INTO order_items
//                 (Order_Item_Id, Order_Id, Item_Id, Quantity, Price, Total)
//                 VALUES (?, ?, ?, ?, ?, ?)`,
//                 [
//                     Order_Item_Id,
//                     Order_Id,
//                     item.itemId,
//                     item.quantity,
//                     item.price,
//                     total
//                 ]
//             );
//         }

//         // 5️⃣ Update order totals
//         await connection.query(
//             `UPDATE orders 
//              SET Sub_Total = ?, Total = ?
//              WHERE Order_Id = ?`,
//             [subTotal, subTotal, Order_Id]
//         );

//         await connection.commit();

//        return res.status(201).json({
//             success: true,
//             message: "Order created successfully",
//             Order_Id: Order_Id
//         });

//     } catch (err) {
//         if (connection) await connection.rollback();
//         console.error("❌ Error editing food item:", err);
//         next(err);
//     } finally {

//         if (connection) connection.release();
//     }
// };
async function generateNextId(connection, prefix, column, table) {
    const [rows] = await connection.query(
        `SELECT ${column} FROM ${table} ORDER BY id DESC LIMIT 1`
    );

    if (rows.length === 0) return prefix + "00001";

    const lastId = rows[0][column];
    const num = parseInt(lastId.replace(prefix, ""), 10) + 1;

    return prefix + num.toString().padStart(5, "0");
}

 const addOrder = async (req, res, next) => {
    let connection;

    try {
        const { userId, Table_Names, items,  Sub_Total, Amount } 
        = req.body;

        if (!userId || !Table_Names || Table_Names.length === 0) {
            return res.status(400).json({
                success: false,
                message: "User ID and at least one table name is required."
            });
        } 
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one item is required."
            });
        }


        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1️⃣ Generate next Order Id
        const Order_Id = await generateNextId(connection, "ODR", "Order_Id", "orders");

        // 2️⃣ Create order
//     await connection.query(
//     `INSERT INTO orders 
//     (Order_Id, User_Id, Status, Sub_Total,
//      Discount, Amount,  Payment_Status)
//     VALUES (?, ?, 'hold', ?, ?, 0, ?, 'none', 'pending', ?)`,
//     [Order_Id, userId, Sub_Total,  Amount]
// );
await connection.query(
    `INSERT INTO orders 
     (Order_Id, User_Id, Status, Sub_Total, Discount, Amount, Payment_Status)
     VALUES (?, ?, 'hold', ?, 0, ?,"pending")`,
    [Order_Id, userId, Sub_Total, Amount]
);



        // 3️⃣ Convert Table Names → Table Ids
        for (let tableName of Table_Names) {

            // Find Table_Id by Table_Name
            const [tbl] = await connection.query(
                `SELECT Table_Id,Status FROM add_table WHERE Table_Name = ?`,
                [tableName]
            );
            const status = tbl[0].Status;

            if (status === "occupied") {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Table is already occupied.",
                });
            }

            if (tbl.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Table not found.",
                });
            }

            const Table_Id = tbl[0].Table_Id;

            // Generate Order_Table_Id
            const Order_Table_Id = await generateNextId(
                connection,
                "OTB",
                "Order_Table_Id",
                "order_tables"
            );

            // Insert in order_tables
            await connection.query(
                `INSERT INTO order_tables
                (Order_Table_Id, Order_Id, Table_Id)
                VALUES (?, ?, ?)`,
                [Order_Table_Id, Order_Id, Table_Id]
            );

            // Mark table as occupied
            await connection.query(
                `UPDATE add_table 
                 SET Status = 'occupied', Start_Time = NOW()
                 WHERE Table_Id = ?`,
                [Table_Id]
            );
        }

        // 4️⃣ Insert items
        for (let item of items) {

            // const Order_Item_Id = await generateNextId(
            //     connection,
            //     "ODRITM",
            //     "Order_Item_Id",
            //     "order_items"
            // );


 const [dbItem] = await connection.query(
        `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
        [item.Item_Name]
    );

    if (dbItem.length === 0) {
        throw new Error(`Item '${item.Item_Name}' not found in menu.`);
    }

    const Item_Id = dbItem[0].Item_Id;

    // 2️⃣ Generate next order_item id
    const Order_Item_Id = await generateNextId(
        connection, "ODRITM", "Order_Item_Id", "order_items"
    );
              await connection.query(
        `INSERT INTO order_items
         (Order_Item_Id, Order_Id, Item_Id, Quantity, Price, Amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
         [
             Order_Item_Id,
             Order_Id,
             Item_Id,                    // <-- FIXED
             item.Item_Quantity,
             item.Item_Price,
             item.Amount
         ]
    );
        }

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            Order_Id
        });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error("❌ Error creating order:", err);
        next(err);
    } finally {
        if (connection) connection.release();
    }
};

const getTablesHavingOrders = async (req, res, next) => {
    let connection;

    try {
        connection = await db.getConnection();

        const [rows] = await connection.query(
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
            WHERE o.Status = 'hold';`
        );

        return res.status(200).json({
            success: true,
            tableHavingOrders: rows,
        });

    } catch (err) {
        console.error("❌ Error getting tables with orders:", err);
        next(err);
    } finally {
        if (connection) connection.release();
    }
};

//View table having orders
const getTableOrderDetails = async (req, res, next) => {
    let connection;

    try {
        
        connection = await db.getConnection();
        const { Order_Id } = req.params;

        if(!Order_Id){
            return res.status(400).json({
                success: false,
                message: "Order ID is required."
            });
        }
        //console.log(Order_Id);

        // 1️⃣ Fetch order summary
        const [order] = await connection.query(
            `SELECT Order_Id, User_Id, Status, Sub_Total,  Discount,
                    Amount,  Payment_Status 
             FROM orders
             WHERE Order_Id = ?`,
            [Order_Id]
        );

        if (order.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // 2️⃣ Fetch tables linked to order
        const [tables] = await connection.query(
            `SELECT t.Table_Id, t.Table_Name, t.Start_Time AS Table_Start_Time
             FROM order_tables ot
             JOIN add_table t ON t.Table_Id = ot.Table_Id
             WHERE ot.Order_Id = ?`,
            [Order_Id]
        );

        // 3️⃣ Fetch order items
        const [items] = await connection.query(
            `SELECT 
                oi.Order_Item_Id,
                oi.Item_Id,
                f.Item_Name,
                f.Item_Image,
                f.Item_Category,
                f.Tax_Type,
                f.Item_Price AS Food_Item_Price,
                f.id,
                f.Amount,
                oi.Quantity,
                oi.Price,
                oi.Amount
             FROM order_items oi
             JOIN add_food_item f ON f.Item_Id = oi.Item_Id
             WHERE oi.Order_Id = ?`,
            [Order_Id]
        );

        return res.status(200).json({
            success: true,
            order: order[0],
            tables,
            items
        });

    } catch (err) {
        console.error("❌ Error fetching order details:", err);
        next(err);
    } finally {
        if (connection) connection.release();
    }
};
const updateOrder = async (req, res, next) => {
    let connection;

    try {
        const { Order_Id} = req.params;
        const {
            items,
            Sub_Total,
            Tax_Amount,
            Amount,
            
        } = req.body;

        // VALIDATION
        if (!Order_Id) {
            return res.status(400).json({
                success: false,
                message: "Order ID missing"
            });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one item is required"
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // 🟢 1️⃣ UPDATE ORDER MAIN TOTALS
        await connection.query(
            `UPDATE orders SET 
                Sub_Total = ?,  
                
                Amount = ? 
               
             WHERE Order_Id = ?`,
            [Sub_Total,  Amount, Order_Id]
        );

        // 🟢 2️⃣ DELETE OLD ITEMS
        await connection.query(
            `DELETE FROM order_items WHERE Order_Id = ?`,
            [Order_Id]
        );

        // 🟢 3️⃣ INSERT UPDATED ITEMS
        for (let item of items) {
            if(item.Item_Name.trim() === '' || !item.Item_Name){ 
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Item name cannot be empty"
                });
            }
            if(item.Item_Quantity <= 0){ 
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Item quantity must be greater than 0"
                });
            }

            // Find Item_Id from menu
            const [dbItem] = await connection.query(
                `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
                [item.Item_Name]
            );

            if (dbItem.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Item '${item.Item_Name}' not found in menu`
                });
            }

            const Item_Id = dbItem[0].Item_Id;

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
                    item.Amount
                ]
            );
        }

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Order updated successfully."
        });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error("❌ Error updating order:", err);
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
            Final_Amount // Amount after discount + service charge
        } = req.body;

        if (!Order_Id) {
            return res.status(400).json({
                success: false,
                message: "Order ID missing"
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1️⃣ Create Invoice ID
        const Invoice_Id = await generateNextId(
            connection,
            "INV",
            "Invoice_Id",
            "invoices"
        );

        // 2️⃣ Insert Invoice
        await connection.query(
            `INSERT INTO invoices
            (Invoice_Id, Order_Id, Customer_Name, Customer_Phone, Discount_Type, Discount,
             Service_Charge, Amount, Payment_Type)
             VALUES (?, ?, ?, ?, ?, ?,?, ?, ?)`,
            [
                Invoice_Id,
                Order_Id,
                Customer_Name || null,
                Customer_Phone || null,
                Discount_Type ,
                Discount || 0,
                Service_Charge || 0,
                Final_Amount,
                Payment_Type
            ]
        );

        // 3️⃣ Update Order status
        await connection.query(
            `UPDATE orders SET Payment_Status = 'completed',Status = 'paid'
             WHERE Order_Id = ?`,
            [Order_Id]
        );

        // 4️⃣ Fetch table IDs linked to order
        // const [tableIds] = await connection.query(
        //     `SELECT Table_Id FROM order_tables WHERE Order_Id = ?`
        //     [Order_Id]
        // );
  const [tableIds] = await connection.query(
            `SELECT Table_Id FROM order_tables WHERE Order_Id = ?`,
            [Order_Id]        // ✔ FIXED
        );
        const tableIdsArray = tableIds.map((t) => t.Table_Id);

        // 5️⃣ Free the tables
        await connection.query(
            `UPDATE add_table 
             SET Status = 'available', 
                 Start_Time = NULL,
                 End_Time = NOW()
             WHERE Table_Id IN (?)`,
            [tableIdsArray]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Invoice generated & order completed successfully.",
            Invoice_Id
        });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error(err);
        next(err);
    } finally {
        if (connection) connection.release();
    }
};


//ADMIN to see All orders

// const getAllOrdersAndInvoices = async (req, res, next) => {
//     let connection;

//     try {
//         connection = await db.getConnection();
//         const { date } = req.query;

//         // ⛔ Date is required
//         if (!date) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Date is required in YYYY-MM-DD format"
//             });
//         }

//         // 1️⃣ Fetch invoices only for given date
//         const [invoices] = await connection.query(
//             `SELECT * 
//              FROM invoices 
//              WHERE DATE(created_at) = ?
//              ORDER BY created_at DESC`,
//             [date]
//         );

//         if (invoices.length === 0) {
//             return res.status(200).json({
//                 success: true,
//                 data: [],
//                 message: "No invoices found for this date."
//             });
//         }

//         const invoiceOrderIds = invoices.map(inv => inv.Order_Id);

//         // 2️⃣ Fetch all orders linked with these invoices
//         const [orders] = await connection.query(
//             `SELECT * 
//              FROM orders 
//              WHERE Order_Id IN (?)`,
//             [invoiceOrderIds]
//         );

//         const orderMap = {};
//         orders.forEach(o => orderMap[o.Order_Id] = o);

//         // 3️⃣ Fetch ordered items
//         const [orderItems] = await connection.query(
//             `SELECT 
//                 oi.Order_Id,
//                 oi.Quantity,
//                 oi.Price,
//                 oi.Amount,
//                 f.Item_Name
//              FROM order_items oi
//              JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//              WHERE oi.Order_Id IN (?)`,
//             [invoiceOrderIds]
//         );

//         const itemsMap = {};
//         orderItems.forEach(item => {
//             if (!itemsMap[item.Order_Id]) itemsMap[item.Order_Id] = [];
//             itemsMap[item.Order_Id].push({
//                 Item_Name: item.Item_Name,
//                 Quantity: item.Quantity,
//                 Price: item.Price,
//                 Amount: item.Amount
//             });
//         });

//         // 4️⃣ Fetch order tables
//         const [orderTables] = await connection.query(
//             `SELECT 
//                 ot.Order_Id,
//                 t.Table_Id,
//                 t.Table_Name
//              FROM order_tables ot
//              JOIN add_table t ON t.Table_Id = ot.Table_Id
//              WHERE ot.Order_Id IN (?)`,
//             [invoiceOrderIds]
//         );

//         const tableMap = {};
//         orderTables.forEach(tbl => {
//             if (!tableMap[tbl.Order_Id]) tableMap[tbl.Order_Id] = [];
//             tableMap[tbl.Order_Id].push({
//                 Table_Id: tbl.Table_Id,
//                 Table_Name: tbl.Table_Name
//             });
//         });

//         // 5️⃣ Combine and return final structure
//         const finalData = invoices.map(inv => ({
//             invoice: inv,
//             order: orderMap[inv.Order_Id] || null,
//             tables: tableMap[inv.Order_Id] || [],
//             items: itemsMap[inv.Order_Id] || []
//         }));

//         return res.status(200).json({
//             success: true,
//             date,
//             totalInvoices: finalData.length,
//             data: finalData,
//         });

//     } catch (err) {
//         console.error("❌ Error fetching invoice data:", err);
//         next(err);
//     } finally {
//         if (connection) connection.release();
//     }
// };

const totalInvoicesEachDay= async (req, res, next) => {
    let connection;

    try {
      
        connection = await db.getConnection();

        const[invoices]=await connection.query(`
        SELECT
      DATE_FORMAT(Invoice_Date, '%Y-%m-%d') AS date,
        COUNT(*) AS total_invoices
        FROM invoices
        GROUP BY DATE(Invoice_Date)
        ORDER BY DATE(Invoice_Date) DESC
        `)

        const [takeawayInvoices] = await connection.query(`
        SELECT
      DATE_FORMAT(Invoice_Date, '%Y-%m-%d') AS date,
        COUNT(*) AS total_takeaway_invoices
        FROM takeaway_invoices
        GROUP BY DATE(Invoice_Date)
        ORDER BY DATE(Invoice_Date) DESC
        `)

        return res.status(200).json({
            success: true,
            data: invoices,
            takeawayInvoices
        });

    }catch(err){
       
        console.error("❌ Error fetching invoice data:", err);
        next(err);
    }finally{
        if (connection) connection.release();
    }
}
const getAllInvoicesAndOrdersEachDay = async (req, res, next) => {
    let connection;

    try {
        const { date, search = "" } = req.query;
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date is required",
            });
        }

        connection = await db.getConnection();

        let searchCondition = "";
        let params = [date];

        if (search) {
            searchCondition = `
                AND (LOWER(Customer_Name) LIKE ? 
                OR LOWER(Invoice_Id) LIKE ?
                OR LOWER(Order_Id) LIKE ?)
            `;
            params.push(`%${search.toLowerCase()}%`);
            params.push(`%${search.toLowerCase()}%`);
            params.push(`%${search.toLowerCase()}%`);
        }

        // ----------------------------------------------------
        // 1️⃣ COUNT NORMAL INVOICES
        // ----------------------------------------------------
        const [countNormal] = await connection.query(
            `SELECT COUNT(*) as total 
             FROM invoices
             WHERE DATE(created_at) = ?
             ${searchCondition}`,
            params
        );

        // ----------------------------------------------------
        // 2️⃣ COUNT TAKEAWAY INVOICES
        // ----------------------------------------------------
        const [countTakeaway] = await connection.query(
            `SELECT COUNT(*) as total
             FROM takeaway_invoices
             WHERE DATE(created_at) = ?
             ${searchCondition}`,
            params
        );

        const totalInvoices = countNormal[0].total + countTakeaway[0].total;
        const totalPages = Math.ceil(totalInvoices / limit);

        // ----------------------------------------------------
        // 3️⃣ FETCH NORMAL INVOICES + PAGINATION
        // ----------------------------------------------------
        const [normalInvoices] = await connection.query(
            `SELECT *, 'dine' AS orderType
             FROM invoices
             WHERE DATE(created_at) = ?
             ${searchCondition}
             ORDER BY created_at ASC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        // ----------------------------------------------------
        // 4️⃣ FETCH TAKEAWAY INVOICES + PAGINATION
        // ----------------------------------------------------
        const [takeawayInvoices] = await connection.query(
            `SELECT *, 'takeaway' AS orderType
             FROM takeaway_invoices
             WHERE DATE(created_at) = ?
             ${searchCondition}
             ORDER BY created_at ASC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        // Combine both
        const allInvoices = [...normalInvoices, ...takeawayInvoices];

        if (allInvoices.length === 0) {
            return res.status(200).json({
                success: true,
                date,
                page,
                totalInvoices,
                totalPages,
                data: []
            });
        }

        // Extract order_ids for both types
        const dineOrderIds = normalInvoices.map((i) => i.Order_Id);
        const takeawayOrderIds = takeawayInvoices.map((i) => i.Takeaway_Order_Id);

        // ----------------------------------------------------
        // 5️⃣ FETCH ORDERS (DINE-IN)
        // ----------------------------------------------------
        let [orders] = dineOrderIds.length
            ? await connection.query(`SELECT * FROM orders WHERE Order_Id IN (?)`, [dineOrderIds])
            : [[]];

        // ----------------------------------------------------
        // 6️⃣ FETCH TAKEAWAY ORDERS
        // ----------------------------------------------------
        let [ordersTakeaway] = takeawayOrderIds.length
            ? await connection.query(`SELECT * FROM orders_takeaway WHERE Takeaway_Order_Id IN (?)`, [takeawayOrderIds])
            : [[]];

        // ----------------------------------------------------
        // 7️⃣ FETCH ITEMS FOR DINE-IN
        // ----------------------------------------------------
        let [items] = dineOrderIds.length
            ? await connection.query(
                  `SELECT oi.Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
                   FROM order_items oi
                   JOIN add_food_item f ON f.Item_Id = oi.Item_Id
                   WHERE oi.Order_Id IN (?)`,
                  [dineOrderIds]
              )
            : [[]];

        // ----------------------------------------------------
        // 8️⃣ FETCH ITEMS FOR TAKEAWAY
        // ----------------------------------------------------
        let [takeawayItems] = takeawayOrderIds.length
            ? await connection.query(
                  `SELECT oi.Takeaway_Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
                   FROM order_takeaway_items oi
                   JOIN add_food_item f ON f.Item_Id = oi.Item_Id
                   WHERE oi.Takeaway_Order_Id IN (?)`,
                  [takeawayOrderIds]
              )
            : [[]];

        // ----------------------------------------------------
        // 9️⃣ FETCH TABLES ONLY for dine-in
        // ----------------------------------------------------
        let [tables] = dineOrderIds.length
            ? await connection.query(
                  `SELECT ot.Order_Id, t.Table_Id, t.Table_Name
                   FROM order_tables ot
                   JOIN add_table t ON t.Table_Id = ot.Table_Id
                   WHERE ot.Order_Id IN (?)`,
                  [dineOrderIds]
              )
            : [[]];

        // ----------------------------------------------------
        // 🔟 MERGE EVERYTHING
        // ----------------------------------------------------
        const finalData = allInvoices.map((inv) => {
            if (inv.orderType === "dine") {
                return {
                    invoice: inv,
                    order: orders.find((o) => o.Order_Id === inv.Order_Id) || null,
                    items: items.filter((i) => i.Order_Id === inv.Order_Id),
                    tables: tables.filter((t) => t.Order_Id === inv.Order_Id),
                    orderType: "dine",
                };
            } else {
                return {
                    invoice: inv,
                    order: ordersTakeaway.find((o) => o.Takeaway_Order_Id === inv.Takeaway_Order_Id) || null,
                    items: takeawayItems.filter((i) => i.Takeaway_Order_Id === inv.Takeaway_Order_Id),
                    tables: [], // No tables for takeaway
                    orderType: "takeaway",
                };
            }
        });

        return res.status(200).json({
            success: true,
            date,
            page,
            totalInvoices,
            totalPages,
            pageSize: limit,
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
        const { fromDate, toDate } = req.query;

        if (!fromDate || !toDate) {
            return res.status(400).json({
                success: false,
                message: "From Date and To Date are required",
            });
        }

        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        connection = await db.getConnection();

        // ---------------------------------------------------------------------
        // 1️⃣ Count dine-in invoices
        // ---------------------------------------------------------------------
        const [countNormal] = await connection.query(
            `SELECT COUNT(*) AS total
             FROM invoices
             WHERE DATE(created_at) BETWEEN ? AND ?`,
            [fromDate, toDate]
        );

        // ---------------------------------------------------------------------
        // 2️⃣ Count takeaway invoices
        // ---------------------------------------------------------------------
        const [countTakeaway] = await connection.query(
            `SELECT COUNT(*) AS total
             FROM takeaway_invoices
             WHERE DATE(created_at) BETWEEN ? AND ?`,
            [fromDate, toDate]
        );

        const totalInvoices = countNormal[0].total + countTakeaway[0].total;
        const totalPages = Math.ceil(totalInvoices / limit);

        // ---------------------------------------------------------------------
        // 3️⃣ Fetch dine-in invoices (paginated)
        // ---------------------------------------------------------------------
        const [normalInvoices] = await connection.query(
            `SELECT *, 'dine' AS orderType
             FROM invoices
             WHERE DATE(created_at) BETWEEN ? AND ?
             ORDER BY created_at ASC
             LIMIT ? OFFSET ?`,
            [fromDate, toDate, limit, offset]
        );

        // ---------------------------------------------------------------------
        // 4️⃣ Fetch takeaway invoices (paginated)
        // ---------------------------------------------------------------------
        const [takeawayInvoices] = await connection.query(
            `SELECT *, 'takeaway' AS orderType
             FROM takeaway_invoices
             WHERE DATE(created_at) BETWEEN ? AND ?
             ORDER BY created_at ASC
             LIMIT ? OFFSET ?`,
            [fromDate, toDate, limit, offset]
        );

        const allInvoices = [...normalInvoices, ...takeawayInvoices];

        // Nothing found
        if (allInvoices.length === 0) {
            return res.status(200).json({
                success: true,
                fromDate,
                toDate,
                totalInvoices: 0,
                totalPages: 0,
                data: []
            });
        }

        // Extract order IDs
        const dineOrderIds = normalInvoices.map((i) => i.Order_Id);
        const takeawayOrderIds = takeawayInvoices.map((i) => i.Takeaway_Order_Id);

        // ---------------------------------------------------------------------
        // 5️⃣ Fetch dine-in orders
        // ---------------------------------------------------------------------
        let [orders] = dineOrderIds.length
            ? await connection.query(`SELECT * FROM orders WHERE Order_Id IN (?)`, [dineOrderIds])
            : [[]];

        // ---------------------------------------------------------------------
        // 6️⃣ Fetch takeaway orders
        // ---------------------------------------------------------------------
        let [ordersTakeaway] = takeawayOrderIds.length
            ? await connection.query(
                  `SELECT * FROM orders_takeaway WHERE Takeaway_Order_Id IN (?)`,
                  [takeawayOrderIds]
              )
            : [[]];

        // ---------------------------------------------------------------------
        // 7️⃣ Fetch dine-in items
        // ---------------------------------------------------------------------
        let [items] = dineOrderIds.length
            ? await connection.query(
                  `SELECT oi.Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
                   FROM order_items oi
                   JOIN add_food_item f ON f.Item_Id = oi.Item_Id
                   WHERE oi.Order_Id IN (?)`,
                  [dineOrderIds]
              )
            : [[]];

        // ---------------------------------------------------------------------
        // 8️⃣ Fetch takeaway items
        // ---------------------------------------------------------------------
        let [takeawayItems] = takeawayOrderIds.length
            ? await connection.query(
                  `SELECT oi.Takeaway_Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
                   FROM order_takeaway_items oi
                   JOIN add_food_item f ON f.Item_Id = oi.Item_Id
                   WHERE oi.Takeaway_Order_Id IN (?)`,
                  [takeawayOrderIds]
              )
            : [[]];

        // ---------------------------------------------------------------------
        // 9️⃣ Fetch dine-in tables only
        // ---------------------------------------------------------------------
        let [tables] = dineOrderIds.length
            ? await connection.query(
                  `SELECT ot.Order_Id, t.Table_Id, t.Table_Name
                   FROM order_tables ot
                   JOIN add_table t ON t.Table_Id = ot.Table_Id
                   WHERE ot.Order_Id IN (?)`,
                  [dineOrderIds]
              )
            : [[]];

        // ---------------------------------------------------------------------
        // 🔟 Merge all results into final response format
        // ---------------------------------------------------------------------
        const finalData = allInvoices.map((inv) => {
            if (inv.orderType === "dine") {
                return {
                    invoice: inv,
                    order: orders.find((o) => o.Order_Id === inv.Order_Id) || null,
                    items: items.filter((i) => i.Order_Id === inv.Order_Id),
                    tables: tables.filter((t) => t.Order_Id === inv.Order_Id),
                    orderType: "dine",
                };
            } else {
                return {
                    invoice: inv,
                    order:
                        ordersTakeaway.find((o) => o.Takeaway_Order_Id === inv.Takeaway_Order_Id) ||
                        null,
                    items: takeawayItems.filter(
                        (i) => i.Takeaway_Order_Id === inv.Takeaway_Order_Id
                    ),
                    tables: [], // takeaway orders do not have tables
                    orderType: "takeaway",
                };
            }
        });

        return res.status(200).json({
            success: true,
            fromDate,
            toDate,
            page,
            totalInvoices,
            totalPages,
            pageSize: limit,
            data: finalData,
        });

    } catch (err) {
        console.error("❌ Error:", err);
        next(err);
    } finally {
        if (connection) connection.release();
    }
};

// const getAllInvoicesAndOrdersEachDay = async (req, res, next) => {
//     let connection;

//     try {
//         const { date } = req.query;
//          const page = req.query.page ? parseInt(req.query.page, 10) : null;
//     const search = req.query.search ? req.query.search.trim().toLowerCase() : "";
//         if (!date) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Date is required",
//             });
//         }

//         connection = await db.getConnection();

//         // 1️⃣ Fetch invoices for that date
//         const [invoices] = await connection.query(
//             `SELECT * FROM invoices 
//              WHERE DATE(created_at) = ?
//              ORDER BY created_at DESC`,
//             [date]
//         );
//       if (invoices.length === 0) {
//             connection.release(); // 🔥 Fix leak
//             return res.status(200).json({
//                 success: true,
//                 date,
//                 totalInvoices: 0,
//                 data: []
//             });
//         }

//         const orderIds = invoices.map((inv) => inv.Order_Id);

//         // 2️⃣ Fetch orders
//         const [orders] = await connection.query(
//             `SELECT * FROM orders WHERE Order_Id IN (?)`,
//             [orderIds]
//         );

//         // 3️⃣ Fetch order items
//         const [items] = await connection.query(
//             `SELECT oi.Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
//              FROM order_items oi
//              JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//              WHERE oi.Order_Id IN (?)`,
//             [orderIds]
//         );

//         // 4️⃣ Fetch tables
//         const [tables] = await connection.query(
//             `SELECT ot.Order_Id, t.Table_Id, t.Table_Name
//              FROM order_tables ot
//              JOIN add_table t ON t.Table_Id = ot.Table_Id
//              WHERE ot.Order_Id IN (?)`,
//             [orderIds]
//         );

//         // 5️⃣ Build response (simple grouping)
//         const finalData = invoices.map((inv) => ({
//             invoice: inv,
//             order: orders.find((o) => o.Order_Id === inv.Order_Id) || null,
//             items: items.filter((it) => it.Order_Id === inv.Order_Id),
//             tables: tables.filter((tb) => tb.Order_Id === inv.Order_Id),
//         }));

//                 return res.status(200).json({
//             success: true,
//             date,
//             totalInvoices: finalData.length,
//             data: finalData,
//         });


//         // return res.status(200).json({
//         //     success: true,
//         //     data: final,
//         // });

//     } catch (err) {
//         console.error("❌ Error:", err);
//         next(err);
//     } finally {
//         if (connection) connection.release();
//     }
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

//         // 🔍 SEARCH FILTER CONDITIONS
//         let searchCondition = "";
//         let params = [date];

//         if (search) {
//             searchCondition = `
//                 AND (LOWER(Customer_Name) LIKE ? 
//                 OR LOWER(Invoice_No) LIKE ?
//                 OR LOWER(Order_Id) LIKE ?)
//             `;
//             params.push(`%${search.toLowerCase()}%`);
//             params.push(`%${search.toLowerCase()}%`);
//             params.push(`%${search.toLowerCase()}%`);
//         }

//         // 1️⃣ Count total invoices
//         const [count] = await connection.query(
//             `SELECT COUNT(*) as total 
//              FROM invoices
//              WHERE DATE(created_at) = ?
//              ${searchCondition}`,
//             params
//         );
//         const totalInvoices = count[0].total;

//         // 2️⃣ Fetch paginated invoices
//         const [invoices] = await connection.query(
//             `SELECT * FROM invoices
//              WHERE DATE(created_at) = ?
//              ${searchCondition}
//              ORDER BY created_at ASC
//              LIMIT ? OFFSET ?`,
//             [...params, limit, offset]
//         );

//         if (invoices.length === 0) {
//             return res.status(200).json({
//                 success: true,
//                 date,
//                 page,
//                 totalInvoices,
//                 totalPages: Math.ceil(totalInvoices / limit),
//                 data: []
//             });
//         }

//         const orderIds = invoices.map((inv) => inv.Order_Id);

//         // 3️⃣ Fetch orders
//         const [orders] = await connection.query(
//             `SELECT * FROM orders WHERE Order_Id IN (?)`,
//             [orderIds]
//         );

//         // 4️⃣ Fetch items
//         const [items] = await connection.query(
//             `SELECT oi.Order_Id, oi.Quantity, oi.Price, oi.Amount, f.Item_Name
//              FROM order_items oi
//              JOIN add_food_item f ON f.Item_Id = oi.Item_Id
//              WHERE oi.Order_Id IN (?)`,
//             [orderIds]
//         );

//         // 5️⃣ Fetch tables
//         const [tables] = await connection.query(
//             `SELECT ot.Order_Id, t.Table_Id, t.Table_Name
//              FROM order_tables ot
//              JOIN add_table t ON t.Table_Id = ot.Table_Id
//              WHERE ot.Order_Id IN (?)`,
//             [orderIds]
//         );

//         // 6️⃣ Final combined response
//         const finalData = invoices.map((inv) => ({
//             invoice: inv,
//             order: orders.find((o) => o.Order_Id === inv.Order_Id) || null,
//             items: items.filter((it) => it.Order_Id === inv.Order_Id),
//             tables: tables.filter((tb) => tb.Order_Id === inv.Order_Id),
//         }));

//         return res.status(200).json({
//             success: true,
//             date,
//             page,
//             totalInvoices,
//             totalPages: Math.ceil(totalInvoices / limit),
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

//         if (!userId) {
//             return res.status(400).json({ success: false, message: "User ID is required." });
//         }

//         if (!items || items.length === 0) {
//             return res.status(400).json({ success: false, message: "At least one item is required." });
//         }

//         if (!Sub_Total || !Final_Amount) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Sub Total and Final Amount are required."
//             });
//         }

//         connection = await db.getConnection();
//         await connection.beginTransaction();

//         // ------------------------------------------------------
//         // 1️⃣ Generate New Takeaway Order ID
//         // ------------------------------------------------------
//         const Takeaway_Order_Id = await generateNextId(
//             connection,
//             "TKODR",
//             "Takeaway_Order_Id",
//             "orders_takeaway"
//         );

//         // ------------------------------------------------------
//         // 2️⃣ Insert into orders_takeaway (NO CUSTOMER FIELDS HERE)
//         // ------------------------------------------------------
//         await connection.query(
//             `INSERT INTO orders_takeaway 
//             (Takeaway_Order_Id, User_Id,Status, Sub_Total, Amount, Payment_Status)
//              VALUES (?, ?, ?, ?, ?,?)`,
//             [
//                 Takeaway_Order_Id,
//                 userId,
//                 "paid",
//                 Sub_Total,
//                 Amount,
//                 "completed"
//             ]
//         );

//         // ------------------------------------------------------
//         // 3️⃣ Insert Items into order_takeaway_items
//         // ------------------------------------------------------
//         for (let item of items) {
//             const Order_Item_Id = await generateNextId(
//                 connection,
//                 "TKODRITM",
//                 "Takeaway_Order_Item_Id",
//                 "order_takeaway_items"
//             );
//             const [Item_Ids]=await connection.query("SELECT Item_Id FROM add_food_item WHERE Item_Name = ?", [item.Item_Name]);
//             item.Item_Id=Item_Ids[0].Item_Id

//             await connection.query(
//                 `INSERT INTO order_takeaway_items 
//                 (Takeaway_Order_Item_Id, Takeaway_Order_Id, Item_Id, Quantity, Price, Amount)
//                  VALUES (?, ?, ?, ?, ?, ?)`,
//                 [
//                     Order_Item_Id,
//                     Takeaway_Order_Id,
//                     item.Item_Id,
//                     item.Item_Quantity,
//                     item.Item_Price,
//                     item.Amount
//                 ]
//             );
//         }

//         // ------------------------------------------------------
//         // 4️⃣ Generate Invoice ID
//         // ------------------------------------------------------
//         const Invoice_Id = await generateNextId(
//             connection,
//             "TKINV",
//             "Invoice_Id",
//             "takeaway_invoices"
//         );

//         // ------------------------------------------------------
//         // 5️⃣ Insert into takeaway_invoices (Customer fields only here)
//         // ------------------------------------------------------
//         await connection.query(
//             `INSERT INTO takeaway_invoices
//             (Invoice_Id, Takeaway_Order_Id, Invoice_Date, Amount,
//              Customer_Name, Customer_Phone, Discount_Type, Discount, Payment_Type)
//              VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?)`,
//             [
//                 Invoice_Id,
//                 Takeaway_Order_Id,
//                 Final_Amount,
//                 Customer_Name || null,
//                 Customer_Phone || null,
//                 Discount_Type ?? "percentage",
//                 Discount || 0,
//                 Payment_Type ?? "cash"
//             ]
//         );

//         // ------------------------------------------------------
//         // 6️⃣ Commit Transaction
//         // ------------------------------------------------------
//         await connection.commit();

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

        // --------------------------------------------
        // 🔍 REQUIRED FIELDS VALIDATION
        // --------------------------------------------
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: "At least one item is required." });
        }

        if (Sub_Total == null || Final_Amount == null) {
            return res.status(400).json({
                success: false,
                message: "Sub Total and Final Amount are required."
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // --------------------------------------------
        // 1️⃣ Generate New Takeaway Order ID
        // --------------------------------------------
        const Takeaway_Order_Id = await generateNextId(
            connection,
            "TKODR",
            "Takeaway_Order_Id",
            "orders_takeaway"
        );

        // --------------------------------------------
        // 2️⃣ INSERT INTO orders_takeaway
        // --------------------------------------------
        await connection.query(
            `INSERT INTO orders_takeaway 
            (Takeaway_Order_Id, User_Id, Status, Sub_Total, Amount, Payment_Status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                Takeaway_Order_Id,
                userId,
                "paid",
                Sub_Total,
                Final_Amount,     // FIX: Should store Final Amount, not Amount
                "completed"
            ]
        );

        // --------------------------------------------
        // 3️⃣ Insert Items into order_takeaway_items
        // --------------------------------------------
        for (let item of items) {
            // Fix: Must use correct column name
            const Order_Item_Id = await generateNextId(
                connection,
                "TKODRITM",
                "Takeaway_Order_Item_Id",
                "order_takeaway_items"
            );

            // Get Item_Id from add_food_item
            const [ItemRow] = await connection.query(
                "SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1",
                [item.Item_Name]
            );

            if (!ItemRow || ItemRow.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Item not found." });
            }

            const Item_Id = ItemRow[0].Item_Id;

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
        }

        // --------------------------------------------
        // 4️⃣ Generate Invoice ID
        // --------------------------------------------
        const Invoice_Id = await generateNextId(
            connection,
            "TKINV",
            "Invoice_Id",
            "takeaway_invoices"
        );

        // --------------------------------------------
        // 5️⃣ Insert Invoice
        // --------------------------------------------
        await connection.query(
            `INSERT INTO takeaway_invoices
            (Invoice_Id, Takeaway_Order_Id, Invoice_Date, Amount,
             Customer_Name, Customer_Phone, Discount_Type, Discount, Payment_Type)
             VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?)`,
            [
                Invoice_Id,
                Takeaway_Order_Id,
                Final_Amount,
                Customer_Name || null,
                Customer_Phone || null,
                Discount_Type ?? "percentage",
                Discount || 0,
                Payment_Type ?? "cash"
            ]
        );

        // --------------------------------------------
        // 6️⃣ Commit Transaction
        // --------------------------------------------
        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Takeaway Order & Invoice generated successfully",
            Takeaway_Order_Id,
            Invoice_Id
        });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error("❌ Error:", err);
        next(err);
    } finally {
        if (connection) connection.release();
    }
};


export {addOrder, getTablesHavingOrders, getTableOrderDetails, updateOrder, 
    confirmOrderBillPaidAndInvoiceGenerated,totalInvoicesEachDay,
    getAllInvoicesAndOrdersEachDay, takeawayAddOrdersAndGenerateInvoices,getAllInvoicesOfOrdersAndTakeawaysInDateRange};