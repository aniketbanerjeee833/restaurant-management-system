

import db from "../config/db.js";

const getTotalSalesPurchasesReceivablesPayablesProfit = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    // 🔹 Date from frontend or default = today
    const selectedDate =
      req.query.date || new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

    // --------------------------------------------------
    // 1️⃣ TOTAL DINE-IN SALES (DAY-WISE)
    // --------------------------------------------------
    const [[dineInResult]] = await connection.query(
      `
      SELECT SUM(CAST(Amount AS DECIMAL(10,2))) AS total_dinein_sales
      FROM invoices
      WHERE DATE(Invoice_Date) = ?
      `,
      [selectedDate]
    );

    // --------------------------------------------------
    // 2️⃣ TOTAL TAKEAWAY SALES (DAY-WISE)
    // --------------------------------------------------
    const [[takeawayResult]] = await connection.query(
      `
      SELECT SUM(CAST(Amount AS DECIMAL(10,2))) AS total_takeaway_sales
      FROM takeaway_invoices
      WHERE DATE(Invoice_Date) = ?
      `,
      [selectedDate]
    );

    const totalDineInValue = Number(dineInResult?.total_dinein_sales || 0);
    const totalTakeawayValue = Number(takeawayResult?.total_takeaway_sales || 0);
    const totalSalesValue = totalDineInValue + totalTakeawayValue;

    // --------------------------------------------------
    // 3️⃣ COUNT OF DINE-IN ORDERS
    // --------------------------------------------------
    const [[dineInCount]] = await connection.query(
      `
      SELECT COUNT(*) AS total_dinein_sales_count
      FROM invoices
      WHERE DATE(Invoice_Date) = ?
      `,
      [selectedDate]
    );

    // --------------------------------------------------
    // 4️⃣ COUNT OF TAKEAWAY ORDERS
    // --------------------------------------------------
    const [[takeawayCount]] = await connection.query(
      `
      SELECT COUNT(*) AS total_takeaway_sales_count
      FROM takeaway_invoices
      WHERE DATE(Invoice_Date) = ?
      `,
      [selectedDate]
    );

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------
    return res.status(200).json({
      date: selectedDate,
      total_sales: totalSalesValue,
      total_dineIn: dineInCount.total_dinein_sales_count,
      total_takeaway: takeawayCount.total_takeaway_sales_count,
    });
  } catch (err) {
    console.error("❌ Error getting day-wise totals:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

// const getTotalSalesPurchasesReceivablesPayablesProfit = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();

//     const now = new Date();
//     const currentMonth = now.getMonth() + 1;
//     const currentYear = now.getFullYear();

//     // --------------------------------------------------
//     // 1️⃣ TOTAL DINE-IN SALES for CURRENT MONTH
//     // --------------------------------------------------
//     const [[dineInResult]] = await connection.query(
//       `
//       SELECT SUM(CAST(Amount AS DECIMAL(10,2))) AS total_dinein_sales
//       FROM invoices
//       WHERE MONTH(Invoice_Date) = ? AND YEAR(Invoice_Date) = ?
//       `,
//       [currentMonth, currentYear]
//     );

//     // --------------------------------------------------
//     // 2️⃣ TOTAL TAKEAWAY SALES for CURRENT MONTH
//     // --------------------------------------------------
//     const [[takeawayResult]] = await connection.query(
//       `
//       SELECT SUM(CAST(Amount AS DECIMAL(10,2))) AS total_takeaway_sales
//       FROM takeaway_invoices
//       WHERE MONTH(Invoice_Date) = ? AND YEAR(Invoice_Date) = ?
//       `,
//       [currentMonth, currentYear]
//     );

//     // Combined Sales Value
//     const totalDineInValue = Number(dineInResult?.total_dinein_sales || 0);
//     const totalTakeawayValue = Number(takeawayResult?.total_takeaway_sales || 0);

//     const totalSalesValue = totalDineInValue + totalTakeawayValue;
//     // --------------------------------------------------
//     // 3️⃣ TOTAL PURCHASES FOR CURRENT MONTH
//     // --------------------------------------------------
//     // const [[purchaseResult]] = await connection.query(
//     //   `
//     //   SELECT SUM(Total_Amount) AS total_purchases
//     //   FROM add_purchase
//     //   WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
//     //   `,
//     //   [currentMonth, currentYear]
//     // );

//     //  const totalPurchasesValue = Number(purchaseResult?.total_purchases || 0);

//     // --------------------------------------------------
//     // 4️⃣ NUMBER OF SALES (COUNT)
//     // --------------------------------------------------
//     const [[dineInCount]] = await connection.query(
//       `
//       SELECT COUNT(*) AS total_dinein_sales_count
//       FROM invoices
//       WHERE MONTH(Invoice_Date) = ? AND YEAR(Invoice_Date) = ?
//       `,
//       [currentMonth, currentYear]
//     );

//     const [[takeawayCount]] = await connection.query(
//       `
//       SELECT COUNT(*) AS total_takeaway_sales_count
//       FROM takeaway_invoices
//       WHERE MONTH(Invoice_Date) = ? AND YEAR(Invoice_Date) = ?
//       `,
//       [currentMonth, currentYear]
//     );

//     // --------------------------------------------------
//     // RESPONSE
//     // --------------------------------------------------
//     return res.status(200).json({
//       month: currentMonth,
//       year: currentYear,
//       total_sales: totalSalesValue,
//       // total_purchases: totalPurchasesValue,
//       total_dineIn: dineInCount.total_dinein_sales_count,
//       total_takeaway: takeawayCount.total_takeaway_sales_count,
//       // profit: totalSalesValue - totalPurchasesValue,
//     });
//   } catch (err) {
//     console.error("❌ Error getting monthly totals:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

// const getAllSalesAndPurchasesYearWise = async (req, res, next) => {
//   let connection;
//   try {
//     const year = parseInt(req.query.year) || 2025;
//     console.log("📅 Year received:", year);
//   connection = await db.getConnection();
  

//     const [dineInSales] = await db.query(
//       `
//       SELECT 
//         MONTH(Invoice_Date) AS month, 
//         SUM(Amount) AS total_DineIn_sales
//         FROM invoices WHERE MONTH(Invoice_Date) = ? AND YEAR(Invoice_Date) = ?
//         GROUP BY MONTH(Invoice_Date)
//         ORDER BY month ASC

// `)

// const [takeawaySales] = await db.query(
//       `
//       SELECT 
//         MONTH(Invoice_Date) AS month, 
//         SUM(Amount) AS total_takeaway_sales
//         FROM takeaway_invoices WHERE MONTH(Invoice_Date) = ? AND YEAR(Invoice_Date) = ?
//         GROUP BY MONTH(Invoice_Date)
//         ORDER BY month ASC

// `)

//     // Merge dine-in and takeaway sales
//     const salesMap = new Map();
//     dineInSales.forEach((sale) => {
//       salesMap.set(sale.month, sale);
//     });
//     takeawaySales.forEach((sale) => {
//       salesMap.set(sale.month, sale);
//     });
//     const sales = Array.from(salesMap.values());

//     // 🟪 Fetch monthly total purchases
//     const [purchases] = await db.query(
//       `
//       SELECT 
//         MONTH(created_at) AS month, 
//         SUM(Total_Amount) AS total_purchases
//       FROM add_purchase
//       WHERE YEAR(created_at) = ?
//       GROUP BY MONTH(created_at)
//       ORDER BY month ASC
//       `,
//       [year]
//     );

//     // 🧠 Merge results into a map
//     const monthMap = new Map();

  

//     for (const p of purchases) {
//       if (monthMap.has(p.month)) {
//         monthMap.get(p.month).total_purchases = p.total_purchases || 0;
//       } else {
//         monthMap.set(p.month, {
//           month: p.month,
//           total_sales: 0,
//           total_purchases: p.total_purchases || 0,
//         });
//       }
//     }
//     for (const s of sales) {
//       if (monthMap.has(s.month)) {
//         monthMap.get(s.month).total_sales = (monthMap.get(s.month).total_sales || 0) 
//         + (s.total_DineIn_sales || 0) + (s.total_takeaway_sales || 0);
//       } else {
//         monthMap.set(s.month, {
//           month: s.month,
//           total_sales: (s.total_DineIn_sales || 0) + (s.total_takeaway_sales || 0),
//           total_purchases: 0,
//         });
//       }
//     }

//     // 🧾 Ensure all 12 months exist (even if no sales/purchases)
//     const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
//     const combinedData = allMonths.map((month) => {
//       const d = monthMap.get(month) || {
//         total_sales: 0,
//         total_purchases: 0,
//       };
//       return {
//         month: new Date(year, month - 1).toLocaleString("default", {
//           month: "short",
//         }),
//         sales: d.total_sales,
//         purchases: d.total_purchases,
//         // profit: d.total_sales - d.total_purchases,
//       };
//     });

//     return res.status(200).json({
//       year,
//       data: combinedData,
//     });
//   } catch (err) {
//       if (connection) connection.release();
//     console.error("❌ Error getting all sales and purchases year wise:", err);
//     next(err);
//     // return res.status(500).json({ message: "Internal Server Error" });
//   }finally {
//     if (connection) connection.release();
//   }
// };

//INVENTOY PURCHASES ,,INVOICE TAKAWAY INVOICE ADD
const getAllSalesAndPurchasesYearWise = async (req, res, next) => {
  let connection;

  try {
    const year = parseInt(req.query.year) || 2025;
    console.log("📅 Year received:", year);

    connection = await db.getConnection();

    // ------------------------------------------------------
    // 1️⃣ DINE-IN SALES (use CAST to avoid string concat)
    // ------------------------------------------------------
    const [dineInSales] = await connection.query(
      `
      SELECT 
        MONTH(Invoice_Date) AS month,
        SUM(CAST(Amount AS DECIMAL(10,2))) AS total_dinein_sales
      FROM invoices
      WHERE YEAR(Invoice_Date) = ?
      GROUP BY MONTH(Invoice_Date)
      ORDER BY month ASC
      `,
      [year]
    );

    // ------------------------------------------------------
    // 2️⃣ TAKEAWAY SALES
    // ------------------------------------------------------
    const [takeawaySales] = await connection.query(
      `
      SELECT 
        MONTH(Invoice_Date) AS month,
        SUM(CAST(Amount AS DECIMAL(10,2))) AS total_takeaway_sales
      FROM takeaway_invoices
      WHERE YEAR(Invoice_Date) = ?
      GROUP BY MONTH(Invoice_Date)
      ORDER BY month ASC
      `,
      [year]
    );

    // ------------------------------------------------------
    // 3️⃣ MERGE SALES
    // ------------------------------------------------------
    const salesMap = new Map();

    dineInSales.forEach((row) => {
      salesMap.set(row.month, {
        dinein: Number(row.total_dinein_sales || 0),
        takeaway: 0
      });
    });

    takeawaySales.forEach((row) => {
      if (salesMap.has(row.month)) {
        salesMap.get(row.month).takeaway = Number(row.total_takeaway_sales || 0);
      } else {
        salesMap.set(row.month, {
          dinein: 0,
          takeaway: Number(row.total_takeaway_sales || 0)
        });
      }
    });

    // ------------------------------------------------------
    // 4️⃣ PURCHASES (CAST to ensure numeric)
    // ------------------------------------------------------
    const [purchases] = await connection.query(
      `
      SELECT 
        MONTH(Bill_Date) AS month,
        SUM(CAST(Total_Amount AS DECIMAL(10,2))) AS total_purchases
      FROM add_purchase
      WHERE YEAR(Bill_Date) = ?
      GROUP BY MONTH(Bill_Date)
      ORDER BY month ASC
      `,
      [year]
    );

    const purchaseMap = new Map();
    purchases.forEach((p) => {
      purchaseMap.set(p.month, Number(p.total_purchases || 0));
    });

    // ------------------------------------------------------
    // 5️⃣ FINAL OUTPUT — always 12 months
    // ------------------------------------------------------
    const results = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;

      const sale = salesMap.get(monthNum) || { dinein: 0, takeaway: 0 };
      const purchase = purchaseMap.get(monthNum) || 0;

      return {
        month: new Date(year, monthNum - 1).toLocaleString("default", {
          month: "short",
        }),
        sales: Number((sale.dinein + sale.takeaway).toFixed(2)),
        purchases: Number(purchase.toFixed(2)),
      };
    });

    // ------------------------------------------------------
    // SEND OUTPUT
    // ------------------------------------------------------
    return res.status(200).json({
      success: true,
      year,
      data: results,
    });

  } catch (err) {
    console.error("❌ Error getting yearly sales & purchases:", err);
    next(err);

  } finally {
    if (connection) connection.release();
  }
};

const getCategoriesWiseItemCount = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    // Get month name from query (e.g. "October", "November")
    const monthName = req.query.month || null;

    // Get year from query (e.g. 2023)
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Map month name to number (1–12)
    const monthMap = {
      january: 1,
      february: 2,
      march: 3,
      april: 4,
      may: 5,
      june: 6,
      july: 7,
      august: 8,
      september: 9,
      october: 10,
      november: 11,
      december: 12,
    };

    let monthNumber;
    if (monthName) {
      monthNumber = monthMap[monthName.toLowerCase()];
      if (!monthNumber) {
        return res.status(400).json({
          success: false,
          message: `Invalid month name: "${monthName}". Please send a valid month name (e.g., "October").`,
        });
      }
    } else {
      monthNumber = new Date().getMonth() + 1; // Default: current month
    }

    console.log(`📅 Month received: ${monthName || "(current month)"} → ${monthNumber}`);

    // Query: Count items by category for given month
    const [categories] = await db.query(
      `
      SELECT 
        c.Item_Category,
        COUNT(i.id) AS total_items
      FROM add_item i
      JOIN add_category c ON i.Item_Category = c.Item_Category
      WHERE MONTH(i.created_at) = ?
      AND YEAR(i.created_at) = ?
      GROUP BY c.Item_Category
      ORDER BY total_items DESC
      `,
      [monthNumber, year]
    );

    return res.status(200).json({
      success: true,
      month: monthName || "current month",
      year: year,
      data: categories,
    });
  } catch (err) {
     if(connection){
      connection.release();
    }
    console.error("❌ Error getting categories-wise item count:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }finally{
    if(connection){
      connection.release();
    }
  }
};




// const getPartyWiseSalesAndPurchases = async (req, res, next) => {
//   try {
//     const now = new Date();
//     //const currentMonth = now.getMonth() + 1; // JS months are 0-based
//     // const currentYear = now.getFullYear();

//        const monthName = req.query.month || null;
//        const currentYear= parseInt(req.query.year) || new Date().getFullYear();
//     // 🔹 1️⃣ Fetch total sales per party for current month
//     const monthMap = {
//       january: 1,
//       february: 2,
//       march: 3,
//       april: 4,
//       may: 5,
//       june: 6,
//       july: 7,
//       august: 8,
//       september: 9,
//       october: 10,
//       november: 11,
//       december: 12,
//     };

//     let currentMonth;
//     if (monthName) {
//       currentMonth = monthMap[monthName.toLowerCase()];
//       if (!currentMonth) {
//         return res.status(400).json({
//           success: false,
//           message: `Invalid month name: "${monthName}". Please send a valid month name (e.g., "October").`,
//         });
//       }
//     } else {
//       currentMonth = new Date().getMonth() + 1; // Default: current month
//     }
//     // const [sales] = await db.query(
//     //   `
//     //   SELECT s.Party_Id, p.Party_Name, SUM(s.Total_Amount) AS total_sales
//     //   FROM add_sale s
//     //   JOIN add_party p ON p.Party_Id = s.Party_Id
//     //   WHERE MONTH(s.created_at) = ? AND YEAR(s.created_at) = ?
//     //   GROUP BY s.Party_Id, p.Party_Name
//     //   `,
//     //   [currentMonth, currentYear]
//     // );
//     const [sales] = await db.query(
//   `
//   SELECT s.Party_Id, p.Party_Name, SUM(s.Total_Amount) AS total_sales
//   FROM add_sale s
//   JOIN add_party p ON p.Party_Id = s.Party_Id
//   WHERE 
//     (MONTH(s.created_at) = ? AND YEAR(s.created_at) = ?)
//     OR
//     (MONTH(s.updated_at) = ? AND YEAR(s.updated_at) = ?)
//   GROUP BY s.Party_Id, p.Party_Name
//   `,
//   [currentMonth, currentYear, currentMonth, currentYear]
// );

//     // 🔹 2️⃣ Fetch total purchases per party for current month
//     // const [purchases] = await db.query(
//     //   `
//     //   SELECT pr.Party_Id, p.Party_Name, SUM(pr.Total_Amount) AS total_purchases
//     //   FROM add_purchase pr
//     //   JOIN add_party p ON p.Party_Id = pr.Party_Id
//     //   WHERE MONTH(pr.created_at) = ? AND YEAR(pr.created_at) = ?
//     //   GROUP BY pr.Party_Id, p.Party_Name
//     //   `,
//     //   [currentMonth, currentYear]
//     // );
//     const [purchases] = await db.query(
//   `
//   SELECT pr.Party_Id, p.Party_Name, SUM(pr.Total_Amount) AS total_purchases
//   FROM add_purchase pr
//   JOIN add_party p ON p.Party_Id = pr.Party_Id
//   WHERE 
//     (MONTH(pr.created_at) = ? AND YEAR(pr.created_at) = ?)
//     OR
//     (MONTH(pr.updated_at) = ? AND YEAR(pr.updated_at) = ?)
//   GROUP BY pr.Party_Id, p.Party_Name
//   `,
//   [currentMonth, currentYear, currentMonth, currentYear]
// );

//     // 🔹 3️⃣ Merge both sales and purchase results
//     const combinedMap = {};

//     // Add sales data
//     for (const s of sales) {
//       combinedMap[s.Party_Id] = {
//         partyId: s.Party_Id,
//         partyName: s.Party_Name,
//         totalSales: s.total_sales || 0,
//         totalPurchases: 0,
//       };
//     }

//     // Merge purchase data
//     for (const p of purchases) {
//       if (combinedMap[p.Party_Id]) {
//         combinedMap[p.Party_Id].totalPurchases = p.total_purchases || 0;
//       } else {
//         combinedMap[p.Party_Id] = {
//           partyId: p.Party_Id,
//           partyName: p.Party_Name,
//           totalSales: 0,
//           totalPurchases: p.total_purchases || 0,
//         };
//       }
//     }

//     // 🔹 4️⃣ Calculate profit and transform into array
//     const combined = Object.values(combinedMap).map((entry) => ({
//       partyId: entry.partyId,
//       partyName: entry.partyName,
//       totalSales: Number(entry.totalSales) || 0,
//       totalPurchases: Number(entry.totalPurchases) || 0,
//       profit: (Number(entry.totalSales) || 0) - (Number(entry.totalPurchases) || 0),
//     }));

//     // 🔹 5️⃣ Sort by profit descending
//     combined.sort((a, b) => b.profit - a.profit);

//     // ✅ 6️⃣ Send response
//     return res.status(200).json({
//       success: true,
//       month: currentMonth,
//       year: currentYear,
//       totalParties: combined.length,
//       data: combined,
//     });
//   } catch (err) {
//     console.error("❌ Error getting party-wise sales and purchases:", err);
//     next(err);
//     // return res.status(500).json({ message: "Internal Server Error" });
//   }
// };
const getPartyWiseSalesAndPurchases = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    const now = new Date();
    //const currentMonth = now.getMonth() + 1; // JS months are 0-based
    // const currentYear = now.getFullYear();

       const monthName = req.query.month || null;
       const currentYear= parseInt(req.query.year) || new Date().getFullYear();
    // 🔹 1️⃣ Fetch total sales per party for current month
    const monthMap = {
      january: 1,
      february: 2,
      march: 3,
      april: 4,
      may: 5,
      june: 6,
      july: 7,
      august: 8,
      september: 9,
      october: 10,
      november: 11,
      december: 12,
    };

    let currentMonth;
    if (monthName) {
      currentMonth = monthMap[monthName.toLowerCase()];
      if (!currentMonth) {
        return res.status(400).json({
          success: false,
          message: `Invalid month name: "${monthName}". Please send a valid month name (e.g., "October").`,
        });
      }
    } else {
      currentMonth = new Date().getMonth() + 1; // Default: current month
    }
    const [sales] = await db.query(
      `
      SELECT s.Party_Id, p.Party_Name, SUM(s.Total_Amount) AS total_sales
      FROM add_sale s
      JOIN add_party p ON p.Party_Id = s.Party_Id
      WHERE MONTH(s.created_at) = ? AND YEAR(s.created_at) = ?
      GROUP BY s.Party_Id, p.Party_Name
      `,
      [currentMonth, currentYear]
    );

    // 🔹 2️⃣ Fetch total purchases per party for current month
    const [purchases] = await db.query(
      `
      SELECT pr.Party_Id, p.Party_Name, SUM(pr.Total_Amount) AS total_purchases
      FROM add_purchase pr
      JOIN add_party p ON p.Party_Id = pr.Party_Id
      WHERE MONTH(pr.created_at) = ? AND YEAR(pr.created_at) = ?
      GROUP BY pr.Party_Id, p.Party_Name
      `,
      [currentMonth, currentYear]
    );

    // 🔹 3️⃣ Merge both sales and purchase results
    const combinedMap = {};

    // Add sales data
    for (const s of sales) {
      combinedMap[s.Party_Id] = {
        partyId: s.Party_Id,
        partyName: s.Party_Name,
        totalSales: s.total_sales || 0,
        totalPurchases: 0,
      };
    }

    // Merge purchase data
    for (const p of purchases) {
      if (combinedMap[p.Party_Id]) {
        combinedMap[p.Party_Id].totalPurchases = p.total_purchases || 0;
      } else {
        combinedMap[p.Party_Id] = {
          partyId: p.Party_Id,
          partyName: p.Party_Name,
          totalSales: 0,
          totalPurchases: p.total_purchases || 0,
        };
      }
    }

    // 🔹 4️⃣ Calculate profit and transform into array
    const combined = Object.values(combinedMap).map((entry) => ({
      partyId: entry.partyId,
      partyName: entry.partyName,
      totalSales: Number(entry.totalSales) || 0,
      totalPurchases: Number(entry.totalPurchases) || 0,
      profit: (Number(entry.totalSales) || 0) - (Number(entry.totalPurchases) || 0),
    }));

    // 🔹 5️⃣ Sort by profit descending
    combined.sort((a, b) => b.profit - a.profit);

    // ✅ 6️⃣ Send response
    return res.status(200).json({
      success: true,
      month: currentMonth,
      year: currentYear,
      totalParties: combined.length,
      data: combined,
    });
  } catch (err) {
    if (connection) {
      connection.release();
    }
    console.error("❌ Error getting party-wise sales and purchases:", err);
    next(err);
    // return res.status(500).json({ message: "Internal Server Error" });
  }finally{
    if(connection){
      connection.release();
    }
  }
};


const eachItemHistory = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    // Fetch all purchase records
    const [purchaseItems] = await db.query(`
      SELECT * FROM add_purchase_items
      ORDER BY Item_Id ASC, created_at DESC
    `);

    // Fetch all sale records
    const [saleItems] = await db.query(`
      SELECT * FROM add_sale_items
      ORDER BY Item_Id ASC, created_at DESC
    `);

    // Use a Map to group by Item_Id
    const combinedEachItemSalePurchase = new Map();

    // Group purchase items
    for (const item of purchaseItems) {
      if (!combinedEachItemSalePurchase.has(item.Item_Id)) {
        combinedEachItemSalePurchase.set(item.Item_Id, {
          Item_Id: item.Item_Id,
          Item_Name: item.Item_Name,
          purchases: [],
          sales: [],
        });
      }
      combinedEachItemSalePurchase.get(item.Item_Id).purchases.push(item);
    }

    // Group sale items
    for (const item of saleItems) {
      if (!combinedEachItemSalePurchase.has(item.Item_Id)) {
        combinedEachItemSalePurchase.set(item.Item_Id, {
          Item_Id: item.Item_Id,
          Item_Name: item.Item_Name,
          purchases: [],
          sales: [],
        });
      }
      combinedEachItemSalePurchase.get(item.Item_Id).sales.push(item);
    }

    // Convert map → array for response
    const result = Array.from(combinedEachItemSalePurchase.values());

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (err) {
       if(connection){
      connection.release();
    }
    console.error("❌ Error getting item history:", err);
    next(err);
  }finally{
    if(connection){
      connection.release();
    }
  }
};


const getItemsSoldCount = async (req, res, next) => {
  let connection;
  try {
    // Fetch all sale records with count
    const [saleItems] = await db.query(`
      SELECT 
        add_item.Item_Id,
        add_item.Item_Name,
        COUNT(add_sale_items.Item_Id) as sold_count
      FROM add_item 
      LEFT JOIN add_sale_items
        ON add_item.Item_Id = add_sale_items.Item_Id
      GROUP BY add_item.Item_Id, add_item.Item_Name
    `);

    return res.status(200).json({
      success: true,
      data: saleItems,
    });
  } catch (err) {
     if(connection){
      connection.release();
    }
    console.error("❌ Error getting items sold count:", err);
    next(err);
  }finally{
    if(connection){
      connection.release();
    }
  }
}
const getPartyWiseItemsSoldAndPurchased = async (req, res, next) => {
  let connection;
  try{

    // const partyId=req.params.partyId;
    const combinedPartyWiseSaleAndPurchase = new Map();
    const[saleItems]=await db.query(
      `SELECT s.*,
       ap.Party_Name
      FROM add_sale s
      LEFT JOIN add_party ap ON ap.Party_Id = s.Party_Id
      ORDER BY s.Party_Id ASC, s.created_at DESC
      `)
    
    const [purchaseItems] = await db.query(
      `SELECT 
         p.*,
         ap.Party_Name
       FROM add_purchase p
       LEFT JOIN add_party ap ON ap.Party_Id = p.Party_Id
       ORDER BY p.Party_Id ASC, p.created_at DESC
      `
    )
    saleItems.forEach((item)=>{
      if (!combinedPartyWiseSaleAndPurchase.has(item.Party_Id)) {
        combinedPartyWiseSaleAndPurchase.set(item.Party_Id, {
          Party_Id: item.Party_Id,
          Party_Name: item.Party_Name,
          sales: [],
          purchases: [],
        });
      }
      combinedPartyWiseSaleAndPurchase.get(item.Party_Id).sales.push(item);
    })
    purchaseItems.forEach((item)=>{
      if (!combinedPartyWiseSaleAndPurchase.has(item.Party_Id)) {
        combinedPartyWiseSaleAndPurchase.set(item.Party_Id, {
          Party_Id: item.Party_Id,
          Party_Name: item.Party_Name,
          sales: [],
          purchases: [],
        });
      }
      combinedPartyWiseSaleAndPurchase.get(item.Party_Id).purchases.push(item);
    })

        
    return res.status(200).json({
      success: true,
      data: Array.from(combinedPartyWiseSaleAndPurchase.values()),
    });
  }catch(err){  
    if(connection){
      connection.release();
    }
    console.error("❌ Error getting items sold count:", err);
    next(err);
  }finally{
    if(connection){
      connection.release();
    }
  }
}


//TOP SELLING ITEMS

// const getItemsSoldEachDay=async(req,res,next)=>{
//   let connection;
//   try{
//        const page = parseInt(req.query.page || 1, 10);
//     const limit = 10;
//     const offset = (page - 1) * limit;
//      const selectedDate =
//       req.query.date || new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
//     const [itemsSoldEachDayFromDineIn] = await db.query(`
//       SELECT 
//         add_food_item.Item_Id,
//         add_food_item.Item_Name,
//         order_items.Quantity as sold_count,
//        order_items.Amount as total_price

      
//       FROM add_food_item 
//       LEFT JOIN order_items
//         ON add_food_item.Item_Id = order_items.Item_Id
     
//       WHERE DATE(order_items.created_at) = ?
    
      
//       ORDER BY sold_count DESC
//       LIMIT ${limit}
//       OFFSET ${offset}
//     `
//     , [selectedDate]);
//         const [itemsSoldEachDayFromTakeaway] = await db.query(`
//       SELECT 
//         add_food_item.Item_Id,
//         add_food_item.Item_Name,
//         order_items_takeaway.Quantity as sold_count,
//        order_items_takeaway.Amount as total_price
      
//       FROM add_food_item 
//       LEFT JOIN order_items_takeaway
//         ON add_food_item.Item_Id = order_items_takeaway.Item_Id
     
//       WHERE DATE(order_items_takeaway.created_at) = ?
    
    
//       ORDER BY sold_count DESC
//       LIMIT ${limit}
//       OFFSET ${offset}
//     `
//     , [selectedDate]);

//     const itemsSoldEachDay = [...itemsSoldEachDayFromDineIn,...itemsSoldEachDayFromTakeaway];
// let items=new Map()
// itemsSoldEachDay.forEach((item)=>{

//   if(!items.has(item.Item_Id)){
//     items.set(item.Item_Id,{Item_Id:item.Item_Id,Item_Name:item.Item_Name,
//       sold_count:item.sold_count,total_price:item.total_price})
//   }else{
//     items.get(item.Item_Id).sold_count+=item.sold_count;
//     items.get(item.Item_Id).total_price+=item.total_price
//   }
// })
//     // itemsSoldEachDay.forEach((item) => {
//     //  it

//     // })
//     return res.status(200).json({
//       success: true,
//       data: items,
//       currentPage: page,
//       pageSize: limit
//     });
//   }catch(err){
//     if(connection){
//       connection.release();
//     }
//     console.error("❌ Error getting top selling items:", err);
//     next(err);
//   }finally{
//     if(connection){
//       connection.release();
//     }
//   }
// }
const getItemsSoldEachDay = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || 1, 10);
    const limit = 10;
    const offset = (page - 1) * limit;
    const selectedDate =
      req.query.date || new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

    // ----------------------------------------------------
    // 1️⃣ COUNT TOTAL DISTINCT ITEMS SOLD
    // ----------------------------------------------------
    const [countResult] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM (
        SELECT Item_Id FROM order_items WHERE DATE(created_at) = ?
        UNION
        SELECT Item_Id FROM order_takeaway_items WHERE DATE(created_at) = ?
      ) x
      `,
      [selectedDate, selectedDate]
    );

    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // ----------------------------------------------------
    // 2️⃣ FETCH AGGREGATED ITEM SALES (DINE + TAKEAWAY)
    // ----------------------------------------------------
    const [rows] = await db.query(
      `
      SELECT 
        f.Item_Id,
        f.Item_Name,
        SUM(t.sold_qty) AS sold_count,
        SUM(t.total_amount) AS total_price
      FROM (
        SELECT Item_Id, Quantity AS sold_qty, Amount AS total_amount
        FROM order_items
        WHERE DATE(created_at) = ?

        UNION ALL

        SELECT Item_Id, Quantity AS sold_qty, Amount AS total_amount
        FROM order_takeaway_items
        WHERE DATE(created_at) = ?
      ) t
      JOIN add_food_item f ON f.Item_Id = t.Item_Id
      GROUP BY f.Item_Id, f.Item_Name
      ORDER BY sold_count DESC
      LIMIT ? OFFSET ?
      `,
      [selectedDate, selectedDate, limit, offset]
    );

    return res.status(200).json({
      success: true,
      date: selectedDate,
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,
      data: rows,
    });

  } catch (err) {
    console.error("❌ Error getting items sold each day:", err);
    next(err);
  }
};

export { getAllSalesAndPurchasesYearWise ,
  getCategoriesWiseItemCount,
  getTotalSalesPurchasesReceivablesPayablesProfit,
  getPartyWiseSalesAndPurchases,eachItemHistory,

  getItemsSoldCount,
  getPartyWiseItemsSoldAndPurchased,
  getItemsSoldEachDay };