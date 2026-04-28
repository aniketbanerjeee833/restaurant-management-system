

import cron from "node-cron";
import db from "../config/db.js";

// const dailyStockCarryForward = () => {
//   // Runs every day at 12:01 AM
//   cron.schedule("1 0 * * *", async () => {
//     let connection;

//     try {
//       console.log("🕛 Running daily stock carry forward...");

//       const today = new Date().toLocaleDateString("en-CA", {
//         timeZone: "Asia/Kolkata",
//       });

//       connection = await db.getConnection();
//       await connection.beginTransaction();

//       /* ============================================
//          1️⃣ GET LAST AVAILABLE STOCK DATE
//       ============================================ */

//       const [[lastDateRow]] = await connection.query(
//         `
//         SELECT MAX(Stock_Date) AS lastDate
//         FROM daily_food_stock
//         WHERE Stock_Date < ?
//         `,
//         [today]
//       );

//       if (!lastDateRow?.lastDate) {
//         console.log("⚠️ No previous stock found");
//         await connection.rollback();
//         return;
//       }

//       const lastDate = lastDateRow.lastDate;

//       /* ============================================
//          2️⃣ GET ALL ITEMS FROM LAST DATE
//       ============================================ */

//       const [lastStocks] = await connection.query(
//         `
//         SELECT Item_Id, Closing_Quantity
//         FROM daily_food_stock
//         WHERE Stock_Date = ?
//         `,
//         [lastDate]
//       );

//       if (!lastStocks.length) {
//         console.log("⚠️ No stock rows to carry forward");
//         await connection.rollback();
//         return;
//       }

//       /* ============================================
//          3️⃣ INSERT TODAY'S STOCK (IF NOT EXISTS)
//       ============================================ */

//       for (const row of lastStocks) {

//         // Check if today's row already exists
//         const [[exists]] = await connection.query(
//           `
//           SELECT id
//           FROM daily_food_stock
//           WHERE Item_Id = ?
//             AND Stock_Date = ?
//           `,
//           [row.Item_Id, today]
//         );

//         if (exists) continue;

//         await connection.query(
//           `
//           INSERT INTO daily_food_stock
//             (Item_Id, Stock_Date,
//              Opening_Quantity, Added_Quantity,
//              Sold_Quantity, Closing_Quantity)
//           VALUES (?, ?, ?, 0, 0, ?)
//           `,
//           [
//             row.Item_Id,
//             today,
//             row.Closing_Quantity || 0,
//             row.Closing_Quantity || 0,
//           ]
//         );
//       }

//       await connection.commit();

//       console.log("✅ Daily stock carry-forward completed");

//     } catch (err) {
//       if (connection) await connection.rollback();
//       console.error("❌ Cron Stock Error:", err);
//     } finally {
//       if (connection) connection.release();
//     }
//   });
// };



const dailyStockCarryForward = () => {
  // Runs every day at 12:01 AM IST
  cron.schedule("1 0 * * *", async () => {
    let connection;

    try {
      console.log("🕛 Running daily stock carry forward...");

      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });

      connection = await db.getConnection();
      await connection.beginTransaction();

      /* ===============================
         1️⃣ GET LAST AVAILABLE STOCK DATE
      =============================== */

      const [[lastDateRow]] = await connection.query(
        `
        SELECT MAX(Stock_Date) AS lastDate
        FROM daily_food_stock
        WHERE Stock_Date < ?
        `,
        [today]
      );

      if (!lastDateRow?.lastDate) {
        console.log("⚠️ No previous stock found");
        await connection.rollback();
        return;
      }

      const lastDate = lastDateRow.lastDate;

      /* ===============================
         2️⃣ INSERT TODAY STOCK FOR ALL ITEMS
         (Carry forward closing → opening)
      =============================== */

      await connection.query(
        `
        INSERT INTO daily_food_stock
          (Item_Id, Stock_Date,
           Opening_Quantity, Added_Quantity,
           Sold_Quantity, Closing_Quantity)
        SELECT
          afi.Item_Id,
          ?,
          COALESCE(dfs.Closing_Quantity, 0),
          0,
          0,
          COALESCE(dfs.Closing_Quantity, 0)
        FROM add_food_item afi
        LEFT JOIN daily_food_stock dfs
          ON dfs.Item_Id = afi.Item_Id
         AND dfs.Stock_Date = ?
        WHERE afi.is_deleted = 0
        ON DUPLICATE KEY UPDATE
          Stock_Date = daily_food_stock.Stock_Date
        `,
        [today, lastDate]
      );

      await connection.commit();
      console.log("✅ Daily stock carry-forward completed");

    } catch (err) {
      if (connection) await connection.rollback();
      console.error("❌ Cron Stock Error:", err);
    } finally {
      if (connection) connection.release();
    }
  });
};

// export default dailyStockCarryForward;
 export default dailyStockCarryForward;