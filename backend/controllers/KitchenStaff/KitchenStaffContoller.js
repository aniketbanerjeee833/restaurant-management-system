import { io } from "../../app.js";
import db from "../../config/db.js";
// const getKitchenOrders = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();

//     const { role, categories = [] } = req.user;
//     console.log("🍳 Staff categories:", categories);

//     // 🚫 Safety
//     if (role !== "kitchen-staff") {
//       return res.status(403).json({
//         success: false,
//         message: "Only kitchen staff can access kitchen orders",
//       });
//     }

//     if (!categories.length) {
//       return res.status(200).json({
//         success: true,
//         orders: [],
//       });
//     }

//     /* ------------------------------------------
//        1️⃣ Fetch KOTs that contain items
//           belonging to staff categories
//     ------------------------------------------- */
//     const [orders] = await connection.query(
//       `
//       SELECT DISTINCT
//         ko.KOT_Id,
//         ko.Order_Id,
//         ko.Status,
//         ko.created_at,
//         CASE 
//           WHEN ko.Order_Id LIKE 'TKODR%' THEN 'takeaway'
//           ELSE 'dinein'
//         END AS Order_Type
//       FROM kitchen_orders ko
//       JOIN kitchen_order_items koi ON koi.KOT_Id = ko.KOT_Id
//       JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
//       WHERE 
//         ko.Status IN ('pending', 'preparing')
//         AND fi.Item_Category IN (?)
//       ORDER BY ko.created_at DESC
//       `,
//       [categories]
//     );

//     if (!orders.length) {
//       return res.status(200).json({
//         success: true,
//         orders: [],
//       });
//     }

//     const kotIds = orders.map(o => o.KOT_Id);

//     /* ------------------------------------------
//        2️⃣ Fetch ONLY items of allowed categories
//     ------------------------------------------- */
//     const [items] = await connection.query(
//       `
//       SELECT
//         koi.KOT_Id,
//         koi.KOT_Item_Id,
//         koi.Item_Id,
//         koi.Item_Name,
//         koi.Quantity,
//         koi.Item_Status,
//         fi.Item_Category
//       FROM kitchen_order_items koi
//       JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
//       WHERE 
//         koi.KOT_Id IN (?)
//         AND fi.Item_Category IN (?)
//       ORDER BY koi.KOT_Item_Id ASC
//       `,
//       [kotIds, categories]
//     );

//     /* ------------------------------------------
//        3️⃣ Attach items to orders
//     ------------------------------------------- */
//     const formatted = orders.map(order => ({
//       ...order,
//       items: items.filter(it => it.KOT_Id === order.KOT_Id),
//     }));

//     return res.status(200).json({
//       success: true,
//       orders: formatted,
//     });

//   } catch (err) {
//     console.error("❌ Error fetching kitchen orders:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

// const getKitchenOrders = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();

//     // 1️⃣ Fetch all active kitchen orders including order type
//     const [orders] = await connection.query(
//       `
//       SELECT 
//         ko.KOT_Id,
//         ko.Order_Id,
//         ko.Status,
//         ko.created_At,
//         CASE 
//           WHEN ko.Order_Id LIKE 'TKODR%' THEN 'takeaway'
//           ELSE 'dinein'
//         END AS Order_Type
//       FROM kitchen_orders ko
//       WHERE ko.Status IN ('pending', 'accepted', 'preparing', 'ready')
//       ORDER BY ko.created_At DESC, ko.KOT_Id DESC
//       `
//     );

//     if (orders.length === 0) {
//       return res.status(200).json({
//         success: true,
//         orders: []
//       });
//     }

//     // Extract all KOT IDs
//     const kotIds = orders.map(o => o.KOT_Id);

//     // 2️⃣ Fetch items for all these orders
//     const [items] = await connection.query(
//       `
//       SELECT 
//         koi.KOT_Id,
//         koi.Item_Id,
//         koi.KOT_Item_Id,
//         koi.Item_Status,
//         koi.Item_Name,
//         koi.Quantity
//       FROM kitchen_order_items koi
//       WHERE koi.KOT_Id IN (?)
//       ORDER BY koi.KOT_Item_Id ASC
//       `,
//       [kotIds]
//     );

//     // 3️⃣ Attach items to each order
//     const formatted = orders.map(order => ({
//       ...order,
//       items: items.filter(it => it.KOT_Id === order.KOT_Id)
//     }));

//     return res.status(200).json({
//       success: true,
//       orders: formatted
//     });

//   } catch (err) {
//     console.error("❌ Error fetching kitchen orders:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

//  const getKitchenOrders = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();

//     // 1️⃣ Fetch all active kitchen orders
//     const [orders] = await connection.query(
//       `
//       SELECT 
//         ko.KOT_Id,
//         ko.Order_Id,
//         ko.Status,
//         ko.created_At
//       FROM kitchen_orders ko
//       WHERE ko.Status IN ('pending', 'accepted', 'preparing', 'ready')
//       ORDER BY ko.created_At DESC
//       `
//     );

//     if (orders.length === 0) {
//       return res.status(200).json({
//         success: true,
//         orders: []
//       });
//     }

//     // Extract all KOT IDs
//     const kotIds = orders.map(o => o.KOT_Id);

//     // 2️⃣ Fetch items for all these KOTs
//     const [items] = await connection.query(
//       `
//       SELECT 
//         koi.KOT_Id,
//         koi.Item_Id,
//         koi.KOT_Item_Id,
//         koi.Item_Status,
//         koi.Item_Name,
//         koi.Quantity
//       FROM kitchen_order_items koi
//       WHERE koi.KOT_Id IN (?)
//       `,
//       [kotIds]
//     );

//     // 3️⃣ Attach items → each order
//     const formatted = orders.map(order => ({
//       ...order,
//       items: items.filter(it => it.KOT_Id === order.KOT_Id)
//     }));

//     return res.status(200).json({
//       success: true,
//       orders: formatted
//     });

//   } catch (err) {
//     console.error("❌ Error fetching kitchen orders:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

// const updateKitchenItemStatus = async (req, res, next) => {
//   let connection;

//   try {
//     const { KOT_Id ,KOT_Item_Id } = req.params;
//     const { status } = req.body; // "preparing" or "ready"

//     if (!["pending", "preparing", "ready"].includes(status)) {
      
//       return res.status(400).json({ success: false, message: "Invalid status" });
//     }

//     connection = await db.getConnection();

//     // 1️⃣ Update single item
//     await connection.query(
//       `
//       UPDATE kitchen_order_items 
//       SET Item_Status = ? 
//       WHERE KOT_Item_Id = ? AND Item_Id = ?
//       `,
//       [status, KOT_Item_Id, Item_Id]
//     );

//     // 2️⃣ Fetch new updated list of items
//     const [items] = await connection.query(
//       `SELECT * FROM kitchen_order_items WHERE KOT_Id = ?`,
//       [KOT_Id]
//     );

//     // 3️⃣ Check if all items are ready
//     const allReady = items.every((it) => it.Item_Status === "ready");

//     if (allReady) {
//       await connection.query(
//         `UPDATE kitchen_orders SET Status = 'ready' WHERE KOT_Id = ?`,
//         [KOT_Id]
//       );
//     }

//     // 4️⃣ Fetch updated order to send to UI
//     const [orderData] = await connection.query(
//       `
//         SELECT KOT_Id, Order_Id, Status 
//         FROM kitchen_orders 
//         WHERE KOT_Id = ?
//       `,
//       [KOT_Id]
//     );

//     const updatedOrder = {
//       ...orderData[0],
//       items,
//     };

//     // 🔥🔥 SOCKET.IO NOTIFICATIONS 🔥🔥

//     // 📡 Notify Kitchen Staff (real-time UI update)
//     io.emit("kitchen_item_updated", updatedOrder);

//     // 📢 Notify Frontend Staff (to update order status / notifications)
//     io.emit("frontend_kot_update", {
//       message: `Item status updated in KOT ${KOT_Id}`,
//       KOT_Id,
//       updatedOrder,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Item status updated",
//       order: updatedOrder,
//     });
//   } catch (err) {
//     console.error("❌ Error updating item status:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
// const updateKitchenItemStatus = async (req, res, next) => {
//   let connection;

//   try {
//     const { KOT_Id, KOT_Item_Id } = req.params;
//     const { status } = req.body;

//     // 1️⃣ Validate Status
//     if (!["pending", "preparing", "ready"].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid status value",
//       });
//     }

//     connection = await db.getConnection();
//   await connection.beginTransaction();
//     // 2️⃣ Update ONLY the selected kitchen item
//     await connection.query(
//       `
//       UPDATE kitchen_order_items
//       SET Item_Status = ?
//       WHERE KOT_Item_Id = ?
//       `,
//       [status, KOT_Item_Id]
//     );

//     // 3️⃣ Fetch all items for this KOT
//     const [items] = await connection.query(
//       `SELECT * FROM kitchen_order_items WHERE KOT_Id = ?`,
//       [KOT_Id]
//     );

//     // Find the updated item for notification
//     const updatedItem = items.find(it => it.KOT_Item_Id === KOT_Item_Id);

//     // 4️⃣ If ALL items are ready → update KOT status also
//     const allReady = items.every(it => it.Item_Status === "ready");
    
// const orderId = orderHeader?.Order_Id;
// const isTakeaway = orderId.startsWith("TKODR");

//     // if (allReady) {
//     //   await connection.query(
//     //     `UPDATE kitchen_orders SET Status = 'ready' WHERE KOT_Id = ?`,
//     //     [KOT_Id]
//     //   );
//     // }
//     if (allReady) {
//   // Update kitchen order
//   await connection.query(
//     `UPDATE kitchen_orders SET Status = 'ready' WHERE KOT_Id = ?`,
//     [KOT_Id]
//   );

//   // ⭐ ALSO update takeaway table
//   if (isTakeaway) {
//     await connection.query(
//       `UPDATE orders_takeaway SET Status = 'completed' WHERE Takeaway_Order_Id = ?`,
//       [orderId]
//     );
//   }
// }

//     // 5️⃣ Fetch the KOT order header
//     const [[orderHeader]] = await connection.query(
//       `
//       SELECT KOT_Id, Order_Id, Status
//       FROM kitchen_orders
//       WHERE KOT_Id = ?
//       `,
//       [KOT_Id]
//     );

//     const updatedOrder = {
//       ...orderHeader,
//       items,
//     };

//     await connection.commit();
//     // ============================================================
//     // 🔥🔥 SOCKET.IO REAL-TIME BROADCASTS 🔥🔥
//     // ============================================================

//     // 👉 Notify Kitchen Staff (their own UI updates)
//     io.emit("kitchen_item_updated", updatedOrder);


// io.to(`order_${KOT_Id}`).emit("frontend_kot_update", {
//   KOT_Id: String(KOT_Id),
//   KOT_Item_Id: String(KOT_Item_Id),
//    Order_Id: String(orderHeader?.Order_Id),  
//   itemName: updatedItem?.Item_Name,
//   status,
// });
// // 🔥 Notify ALL front desk staff to update table/order list
// // io.emit("frontdesk_order_update", {
// //   Order_Id: orderHeader?.Order_Id,
// //   KOT_Id: String(KOT_Id),
// //   kotStatus: allReady ? "ready" : "preparing",
// //   items
// // });
// io.emit("frontdesk_order_update", {
//   Order_Id: orderHeader?.Order_Id,
//   KOT_Id: String(KOT_Id),
//   kotStatus: allReady ? "ready" : "preparing",
//   isTakeaway,
//   removeFromList: allReady && isTakeaway,
//   items
// });

//     return res.status(200).json({
//       success: true,
//       message: "Item status updated successfully",
//       order: updatedOrder,
//     });

//   } catch (err) {
//     console.error("❌ Error updating item:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
// const updateKitchenItemStatus = async (req, res, next) => {
//   let connection;

//   try {
//     const { KOT_Id, KOT_Item_Id } = req.params;
//     const { status } = req.body;

//     // 1️⃣ Validate Status
//     if (!["pending", "preparing", "ready"].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid status value",
//       });
//     }

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     // 2️⃣ Update ONLY the selected kitchen item
//     await connection.query(
//       `UPDATE kitchen_order_items SET Item_Status = ? WHERE KOT_Item_Id = ?`,
//       [status, KOT_Item_Id]
//     );

//     // 3️⃣ Fetch all items for this KOT
//     // const [items] = await connection.query(
//     //   `SELECT * FROM kitchen_order_items WHERE KOT_Id = ?`,
//     //   [KOT_Id]
//     // );
//     // 3️⃣ Fetch all items for this KOT including Item_Name
// const [items] = await connection.query(
//   `SELECT 
//       koi.*, 
//       fi.Item_Name
//    FROM kitchen_order_items koi
//    JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
//    WHERE koi.KOT_Id = ?`,
//   [KOT_Id]
// );


//     // Find the updated item
//     const updatedItem = items.find((it) => it.KOT_Item_Id === KOT_Item_Id);

//     // 4️⃣ Fetch orderHeader BEFORE checking takeaway
//     const [[orderHeader]] = await connection.query(
//       `SELECT KOT_Id, Order_Id, Status FROM kitchen_orders WHERE KOT_Id = ?`,
//       [KOT_Id]
//     );

//     const orderId = orderHeader?.Order_Id;
//     const isTakeaway = orderId.startsWith("TKODR");

//     // 5️⃣ If ALL items are ready → update statuses
//     const allReady = items.every((it) => it.Item_Status === "ready");

//     if (allReady) {
//       // Update kitchen order
//       // await connection.query(
//       //   `UPDATE kitchen_orders SET Status = 'ready' WHERE KOT_Id = ?`,
//       //   [KOT_Id]
//       // );

//       // ⭐ ALSO update takeaway status
//       if (isTakeaway) {
//         await connection.query(
//           `UPDATE orders_takeaway SET Status = 'completed' WHERE Takeaway_Order_Id = ?`,
//           [orderId]
//         );
//       }
//     }

//     const updatedOrder = {
//       ...orderHeader,
//       items,
//     };

//     await connection.commit();

//     // ============================================================
//     // 🔥 SOCKET.IO REAL-TIME BROADCASTS
//     // ============================================================

//     // 🔹 Notify Kitchen Staff
//     io.emit("kitchen_item_updated", updatedOrder);

//     // 🔹 Notify only that order room
//     io.to(`order_${KOT_Id}`).emit("frontend_kot_update", {
//       KOT_Id: String(KOT_Id),
//       KOT_Item_Id: String(KOT_Item_Id),
//       Order_Id: String(orderId),
//       itemName: updatedItem?.Item_Name,
//       status,
//     });

//     // 🔹 Notify Front Desk / Dashboard
//  io.emit("frontdesk_order_update", {
//   Order_Id: orderId,
//   KOT_Id: String(KOT_Id),

//   // ⚠️ Mark ready ONLY for takeaway
//   kotStatus: isTakeaway ? (allReady ? "ready" : "preparing") : "preparing",

//   isTakeaway,

//   // 🚀 Remove takeaway card only when all items are ready
//   removeFromList: isTakeaway && allReady,

//   items,
// });

//     // io.emit("frontdesk_order_update", {
//     //   Order_Id: orderId,
//     //   KOT_Id: String(KOT_Id),
//     //   kotStatus: allReady ? "ready" : "preparing",
//     //   isTakeaway,
//     //   removeFromList: allReady && isTakeaway,
//     //   items,
//     // });

//     return res.status(200).json({
//       success: true,
//       message: "Item status updated successfully",
//       order: updatedOrder,
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error updating item:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
// const updateKitchenItemStatus = async (req, res, next) => {
//   let connection;

//   try {
//     const { KOT_Id, KOT_Item_Id } = req.params;
//     const { status } = req.body;
//    console.log("PARAMS:", req.params);
// console.log("BODY:", req.body);

//     if (!["pending", "preparing", "ready"].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid status value",
//       });
//     }

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     // 1️⃣ Update ONLY chosen item
//     await connection.query(
//       `UPDATE kitchen_order_items SET Item_Status = ? WHERE KOT_Item_Id = ?`,
//       [status, KOT_Item_Id]
//     );

//     // 2️⃣ Get all items from this KOT with names
//     const [items] = await connection.query(
//       `SELECT koi.*, fi.Item_Name
//        FROM kitchen_order_items koi
//        JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
//        WHERE koi.KOT_Id = ?`,
//       [KOT_Id]
//     );

//     const updatedItem = items.find(it => it.KOT_Item_Id === KOT_Item_Id);

//     // 3️⃣ Fetch order header
//     const [[orderHeader]] = await connection.query(
//       `SELECT KOT_Id, Order_Id, Status FROM kitchen_orders WHERE KOT_Id = ?`,
//       [KOT_Id]
//     );

//     const orderId = orderHeader?.Order_Id;
//     const isTakeaway = orderId.startsWith("TKODR");

//     // 4️⃣ Check if every item is ready
//     const allReady = items.every(it => it.Item_Status === "ready");

//     if (allReady) {
//       // ⭐ TAKEAWAY ONLY → Mark KOT ready & takeaway completed
//       if (isTakeaway) {

//         // Update KOT status
//         await connection.query(
//           `UPDATE kitchen_orders SET Status = 'ready' WHERE KOT_Id = ?`,
//           [KOT_Id]
//         );

//         // Update takeaway order
//         await connection.query(
//           `UPDATE orders_takeaway SET Status = 'completed' WHERE Takeaway_Order_Id = ?`,
//           [orderId]
//         );
//       }
//     }

//     const updatedOrder = {
//       ...orderHeader,
//       items,
//     };

//     await connection.commit();

//     // ==========================================================
//     // SOCKET EMITS
//     // ==========================================================

//     // 🔹 Notify kitchen dashboard
//     const categories = [
//       ...new Set(items.map((i) => i.Category)),
//     ];

//     categories.forEach((cat) => {
//       io.to(`category_${cat}`).emit("kitchen_order_updated", updatedOrder);
//     });
//     // io.emit("kitchen_item_updated", updatedOrder);

//     // 🔹 Notify TAKEAWAY card UI
//     io.to(`order_${KOT_Id}`).emit("frontend_kot_update", {
//       KOT_Id,
//       KOT_Item_Id,
//       Order_Id: orderId,
//       itemName: updatedItem?.Item_Name,
//       status,
//     });

//     // 🔹 Notify Frontdesk dashboard (remove takeaway when ready)
//     io.emit("frontdesk_order_update", {
//       Order_Id: orderId,
//       KOT_Id,
//       kotStatus: isTakeaway
//         ? (allReady ? "ready" : "preparing")  // takeaway
//         : "preparing",                        // dine-in always preparing

//       isTakeaway,

//       removeFromList: isTakeaway && allReady, // REMOVE TAKEAWAY CARD

//       items,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Item status updated successfully",
//       order: updatedOrder,
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error updating item:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

// const updateKitchenItemStatus = async (req, res, next) => {
//   let connection;

//   try {
//     const { KOT_Id, KOT_Item_Id } = req.params;
//     const { status } = req.body;

//     if (!["pending", "preparing", "ready"].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid status value",
//       });
//     }

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     /* --------------------------------------------------
//        1️⃣ UPDATE ITEM STATUS
//     -------------------------------------------------- */
//     await connection.query(
//       `UPDATE kitchen_order_items 
//        SET Item_Status = ? 
//        WHERE KOT_Item_Id = ?`,
//       [status, KOT_Item_Id]
//     );

//     /* --------------------------------------------------
//        2️⃣ FETCH ALL ITEMS (WITH CATEGORY)
//     -------------------------------------------------- */
//     const [items] = await connection.query(
//       `
//       SELECT 
//         koi.KOT_Item_Id,
//         koi.KOT_Id,
//         koi.Item_Id,
//         koi.Item_Status,
//         fi.Item_Name,
//         fi.Item_Category
//       FROM kitchen_order_items koi
//       JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
//       WHERE koi.KOT_Id = ?
//       `,
//       [KOT_Id]
//     );

//     const updatedItem = items.find(
//       (it) => String(it.KOT_Item_Id) === String(KOT_Item_Id)
//     );

//     /* --------------------------------------------------
//        3️⃣ FETCH ORDER HEADER
//     -------------------------------------------------- */
//     const [[orderHeader]] = await connection.query(
//       `SELECT KOT_Id, Order_Id, Status 
//        FROM kitchen_orders 
//        WHERE KOT_Id = ?`,
//       [KOT_Id]
//     );
//     if (!orderHeader) {
//   await connection.rollback();
//   return res.status(404).json({
//     success: false,
//     message: "KOT not found",
//   });
// }


//     const orderId = orderHeader.Order_Id;
//     const isTakeaway = orderId.startsWith("TKODR");

//     /* --------------------------------------------------
//        4️⃣ CHECK IF ALL ITEMS READY
//     -------------------------------------------------- */
//     const allReady = items.every((it) => it.Item_Status === "ready");

//     if (allReady && isTakeaway) {
//       // Mark KOT ready
//       await connection.query(
//         `UPDATE kitchen_orders SET Status = 'ready' WHERE KOT_Id = ?`,
//         [KOT_Id]
//       );

//       // Mark takeaway order completed
//       await connection.query(
//         `UPDATE orders_takeaway 
//          SET Status = 'completed' 
//          WHERE Takeaway_Order_Id = ?`,
//         [orderId]
//       );
//     }

//     await connection.commit();

//     /* ==================================================
//        🔔 SOCKET EMITS
//     ================================================== */

//     /* -------------------------------
//        A️⃣ KITCHEN STAFF (CATEGORY)
//     -------------------------------- */
//     const categories = [
//       ...new Set(items.map((i) => i.Item_Category)),
//     ];

//     categories.forEach((category) => {
//       io.to(`category_${category}`).emit("kitchen_order_updated", {
//         KOT_Id,
//         Order_Id: orderId,
//         Order_Type: isTakeaway ? "takeaway" : "dinein",
//         Status: allReady ? "ready" : "preparing",
//         items: items.filter(i => i.Item_Category === category),
//       });
//     });

//     /* --------------------------------
//        B️⃣ FRONTDESK – ITEM LEVEL UPDATE
//     -------------------------------- */
//     io.to(`order_${KOT_Id}`).emit("frontend_kot_update", {
//       Order_Id: orderId,
//       KOT_Id,
//       KOT_Item_Id,
//       itemName: updatedItem.Item_Name,
//       status,
//       orderType: isTakeaway ? "takeaway" : "dinein",
//       isTakeaway,
//     });

//     /* --------------------------------
//        C️⃣ FRONTDESK DASHBOARD UPDATE
//     -------------------------------- */
//     io.emit("frontdesk_order_update", {
//       Order_Id: orderId,
//       KOT_Id,
//       kotStatus: isTakeaway
//         ? allReady
//           ? "ready"
//           : "preparing"
//         : "preparing",
//       isTakeaway,
//       removeFromList: isTakeaway && allReady,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Item status updated successfully",
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error updating item:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

const getKitchenOrders = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    const { role, categories = [] } = req.user;

    if (role !== "kitchen-staff") {
      return res.status(403).json({
        success: false,
        message: "Only kitchen staff can access kitchen orders",
      });
    }

    if (!categories.length) {
      return res.status(200).json({ success: true, orders: [] });
    }

    /* ------------------------------------------------
       1️⃣ Fetch KOTs where THIS STAFF still has
          at least ONE non-ready item
    ------------------------------------------------ */
    const [orders] = await connection.query(
      `
      SELECT DISTINCT
        ko.KOT_Id,
        ko.Order_Id,
        ko.Status,
        ko.created_at,
        CASE 
          WHEN ko.Order_Id LIKE 'TKODR%' THEN 'takeaway'
          ELSE 'dinein'
        END AS Order_Type
      FROM kitchen_orders ko
      JOIN kitchen_order_items koi ON koi.KOT_Id = ko.KOT_Id
      JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
      WHERE
        fi.Item_Category IN (?)
        AND koi.Item_Status != 'ready'
      ORDER BY ko.created_at DESC
      `,
      [categories]
    );

    if (!orders.length) {
      return res.status(200).json({ success: true, orders: [] });
    }

    const kotIds = orders.map(o => o.KOT_Id);

    /* ------------------------------------------------
       2️⃣ Fetch ONLY PENDING/PREPARING items
          for those categories
    ------------------------------------------------ */
    const [items] = await connection.query(
      `
      SELECT
        koi.KOT_Id,
        koi.KOT_Item_Id,
        koi.Item_Id,
        koi.Item_Name,
        koi.Quantity,
        koi.Item_Status,
        fi.Item_Category
      FROM kitchen_order_items koi
      JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
      WHERE
        koi.KOT_Id IN (?)
        AND fi.Item_Category IN (?)
        AND koi.Item_Status != 'ready'
      ORDER BY koi.KOT_Item_Id ASC
      `,
      [kotIds, categories]
    );

    const formatted = orders.map(order => ({
      ...order,
      items: items.filter(it => it.KOT_Id === order.KOT_Id),
    }));

    return res.status(200).json({
      success: true,
      orders: formatted,
    });

  } catch (err) {
    console.error("❌ Error fetching kitchen orders:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


// const updateKitchenItemStatus = async (req, res, next) => {
//   let connection;

//   try {
//     const { KOT_Id, KOT_Item_Id } = req.params;
//     const { status } = req.body;

//     if (!["pending", "preparing", "ready"].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid status value",
//       });
//     }

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     /* --------------------------------------------------
//        1️⃣ UPDATE SINGLE ITEM STATUS
//     -------------------------------------------------- */
//     await connection.query(
//       `UPDATE kitchen_order_items 
//        SET Item_Status = ? 
//        WHERE KOT_Item_Id = ?`,
//       [status, KOT_Item_Id]
//     );

//     /* --------------------------------------------------
//        2️⃣ FETCH UPDATED ITEM (CATEGORY REQUIRED)
//     -------------------------------------------------- */
//     const [[updatedItem]] = await connection.query(
//       `
//       SELECT 
//         koi.KOT_Item_Id,
//         koi.KOT_Id,
//         koi.Item_Id,
//         koi.Item_Status,
//         fi.Item_Name,
//         fi.Item_Category
//       FROM kitchen_order_items koi
//       JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
//       WHERE koi.KOT_Item_Id = ?
//       `,
//       [KOT_Item_Id]
//     );

//     if (!updatedItem) {
//       await connection.rollback();
//       return res.status(404).json({
//         success: false,
//         message: "Kitchen item not found",
//       });
//     }

//     const itemCategory = updatedItem.Item_Category;

//     /* --------------------------------------------------
//        3️⃣ FETCH ORDER HEADER
//     -------------------------------------------------- */
//     const [[orderHeader]] = await connection.query(
//       `SELECT KOT_Id, Order_Id 
//        FROM kitchen_orders 
//        WHERE KOT_Id = ?`,
//       [KOT_Id]
//     );

//     if (!orderHeader) {
//       await connection.rollback();
//       return res.status(404).json({
//         success: false,
//         message: "KOT not found",
//       });
//     }

//     const orderId = orderHeader.Order_Id;
//     const isTakeaway = orderId.startsWith("TKODR");
//     const isDineIn = orderId.startsWith("ODR");

//     /* --------------------------------------------------
//        4️⃣ CHECK CATEGORY COMPLETION
//     -------------------------------------------------- */
//     const [categoryItems] = await connection.query(
//       `
//       SELECT Item_Status
//       FROM kitchen_order_items koi
//       JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
//       WHERE koi.KOT_Id = ?
//         AND fi.Item_Category = ?
//       `,
//       [KOT_Id, itemCategory]
//     );

//     const categoryAllReady =
//       categoryItems.length > 0 &&
//       categoryItems.every((i) => i.Item_Status === "ready");

//     /* --------------------------------------------------
//        5️⃣ CHECK FULL KOT COMPLETION (ONLY FOR TAKEAWAY)
//     -------------------------------------------------- */
//     const [allItems] = await connection.query(
//       `SELECT Item_Status FROM kitchen_order_items WHERE KOT_Id = ?`,
//       [KOT_Id]
//     );

//     const allReady = allItems.every((i) => i.Item_Status === "ready");

//     if (allReady && isTakeaway) {
//       await connection.query(
//         `UPDATE kitchen_orders SET Status = 'ready' WHERE KOT_Id = ?`,
//         [KOT_Id]
//       );

//       await connection.query(
//         `UPDATE orders_takeaway 
//          SET Status = 'completed' 
//          WHERE Takeaway_Order_Id = ?`,
//         [orderId]
//       );
//     }

//     await connection.commit();

//     /* ==================================================
//        🔔 SOCKET EMITS
//     ================================================== */

//     /* --------------------------------
//        A️⃣ CATEGORY STAFF UPDATE
//     -------------------------------- */
//     io.to(`category_${itemCategory}`).emit("kitchen_order_updated", {
//       KOT_Id,
//       Order_Id: orderId,
//       Order_Type: isTakeaway ? "takeaway" : "dinein",
//       removeOrder: categoryAllReady, // 🔥 KEY FLAG
//       items: categoryAllReady
//         ? []
//         : [
//             {
//               KOT_Item_Id: updatedItem.KOT_Item_Id,
//               Item_Id: updatedItem.Item_Id,
//               Item_Name: updatedItem.Item_Name,
//               Item_Category: itemCategory,
//               Quantity: 1,
//               Item_Status: updatedItem.Item_Status,
//             },
//           ],
//     });

//     /* --------------------------------
//        B️⃣ FRONTDESK ITEM UPDATE
//     -------------------------------- */
//     io.to(`order_${KOT_Id}`).emit("frontend_kot_update", {
//       Order_Id: orderId,
//       KOT_Id,
//       KOT_Item_Id,
//       itemName: updatedItem.Item_Name,
//       status: updatedItem.Item_Status,
//       orderType: isTakeaway ? "takeaway" : "dinein",
//       isTakeaway,
//     });

//     /* --------------------------------
//        C️⃣ FRONTDESK DASHBOARD
//     -------------------------------- */
//     io.emit("frontdesk_order_update", {
//       Order_Id: orderId,
//       KOT_Id,
//       kotStatus: allReady ? "ready" : "preparing",
//       isTakeaway,
//       removeFromList: isTakeaway && allReady,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Item status updated successfully",
//     });
//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error updating item:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
const updateKitchenItemStatus = async (req, res, next) => {
  let connection;

  try {
    const { KOT_Id, KOT_Item_Id } = req.params;
    const { status } = req.body;

    if (!["pending", "preparing", "ready"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    /* --------------------------------------------------
       1️⃣ UPDATE SINGLE ITEM
    -------------------------------------------------- */
    await connection.query(
      `UPDATE kitchen_order_items 
       SET Item_Status = ? 
       WHERE KOT_Item_Id = ?`,
      [status, KOT_Item_Id]
    );

    /* --------------------------------------------------
       2️⃣ FETCH UPDATED ITEM (WITH CATEGORY)
    -------------------------------------------------- */
    const [[updatedItem]] = await connection.query(
      `
      SELECT 
        koi.KOT_Item_Id,
        koi.KOT_Id,
        koi.Item_Id,
        koi.Item_Status,
        fi.Item_Name,
        fi.Item_Category
      FROM kitchen_order_items koi
      JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
      WHERE koi.KOT_Item_Id = ?
      `,
      [KOT_Item_Id]
    );

    if (!updatedItem) {
      await connection.rollback();
      return res.status(404).json({ message: "Kitchen item not found" });
    }

    const itemCategory = updatedItem.Item_Category;

    /* --------------------------------------------------
       3️⃣ FETCH ORDER HEADER
    -------------------------------------------------- */
    const [[orderHeader]] = await connection.query(
      `SELECT Order_Id FROM kitchen_orders WHERE KOT_Id = ?`,
      [KOT_Id]
    );

    if (!orderHeader) {
      await connection.rollback();
      return res.status(404).json({ message: "KOT not found" });
    }

    const orderId = orderHeader.Order_Id;
    const isTakeaway = orderId.startsWith("TKODR");

    /* --------------------------------------------------
       4️⃣ CATEGORY COMPLETION CHECK
    -------------------------------------------------- */
    const [categoryItems] = await connection.query(
      `
      SELECT koi.Item_Status
      FROM kitchen_order_items koi
      JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
      WHERE koi.KOT_Id = ?
        AND fi.Item_Category = ?
      `,
      [KOT_Id, itemCategory]
    );

    const categoryAllReady =
      categoryItems.length > 0 &&
      categoryItems.every(i => i.Item_Status === "ready");

    /* --------------------------------------------------
       5️⃣ FULL KOT COMPLETION (TAKEAWAY ONLY)
    -------------------------------------------------- */
    let allReady = false;

    if (isTakeaway) {
      const [allItems] = await connection.query(
        `SELECT Item_Status FROM kitchen_order_items WHERE KOT_Id = ?`,
        [KOT_Id]
      );

      allReady = allItems.every(i => i.Item_Status === "ready");

      if (allReady) {
        await connection.query(
          `UPDATE kitchen_orders SET Status = 'ready' WHERE KOT_Id = ?`,
          [KOT_Id]
        );

        await connection.query(
          `UPDATE orders_takeaway 
           SET Status = 'completed'
           WHERE Takeaway_Order_Id = ?`,
          [orderId]
        );
      }
    }

    await connection.commit();

    /* ==================================================
       🔔 SOCKET EVENTS
    ================================================== */

    /* -------------------------------
       A️⃣ CATEGORY STAFF ONLY
    -------------------------------- */
    io.to(`category_${itemCategory}`).emit("kitchen_order_updated", {
      KOT_Id,
      Order_Id: orderId,
      Order_Type: isTakeaway ? "takeaway" : "dinein",
      removeOrder: categoryAllReady, // 🔥 THIS IS THE KEY
      items: categoryAllReady
        ? []
        : [
            {
              KOT_Item_Id: updatedItem.KOT_Item_Id,
              Item_Name: updatedItem.Item_Name,
              Item_Category: itemCategory,
              Quantity: 1,
              Item_Status: updatedItem.Item_Status,
            },
          ],
    });

    /* -------------------------------
       B️⃣ FRONTDESK ITEM UPDATE
    -------------------------------- */
    io.to(`order_${KOT_Id}`).emit("frontend_kot_update", {
      Order_Id: orderId,
      KOT_Id,
      KOT_Item_Id,
      itemName: updatedItem.Item_Name,
      status: updatedItem.Item_Status,
      orderType: isTakeaway ? "takeaway" : "dinein",
      isTakeaway,
    });

    /* -------------------------------
       C️⃣ FRONTDESK DASHBOARD
    -------------------------------- */
    io.emit("frontdesk_order_update", {
      Order_Id: orderId,
      KOT_Id,
      kotStatus: allReady ? "ready" : "preparing",
      isTakeaway,
      removeFromList: isTakeaway && allReady,
    });

    return res.status(200).json({
      success: true,
      message: "Item status updated successfully",
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error updating kitchen item:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

export { getKitchenOrders, updateKitchenItemStatus };