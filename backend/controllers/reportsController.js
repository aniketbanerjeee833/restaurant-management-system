import PdfPrinter from "pdfmake";
import db from "../config/db.js";
   const TAX_TYPES = {
        "GST0": "GST 0%",
        "GST0.25": "GST 0.25%",
        "GST3": "GST 3%",
        GST5: "GST 5%",
        GST12: "GST 12%",
        GST18: "GST 18%",
        GST28: "GST 28%",
        GST40: "GST 40%",
        "IGST0": "IGST 0%",
        "IGST0.25": "IGST 0.25%",
        "IGST3": "IGST 3%",
        IGST5: "IGST 5%",
        IGST12: "IGST 12%",
        IGST18: "IGST 18%",
        IGST28: "IGST 28%",
        IGST40: "IGST 40%"
    }
// const getSalesNewSalesPurchasesEachDay = async (req, res, next) => {
//   let connection;
//   try {
//     connection = await db.getConnection();

//     // const { date, year, month } = req.query;
//     const {date} = req.query;
//     console.log(date);
//     // const [year, month, day] = date.split("-");
//     // const fullDate = `${year}-${month}-${day}`; 
// if (!date) {
//      connection.release();
//   return res.status(400).json({ message: "Date is required" });
// }

// const fullDate = date; // already YYYY-MM-DD
//     const formatIndianDate = (date) =>
//       new Date(date).toLocaleString("en-IN", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric"
//       });

//     const formatIndianDateTime = (timestamp) =>
//       new Date(timestamp).toLocaleString("en-IN", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit"
//       });

//     // ---------------------------------------------------
//     // SALES + ITEMS
//     // ---------------------------------------------------
//     const [sales] = await db.query(
//       `SELECT s.*, p.Party_Name,p.GSTIN
//        FROM add_sale s
//        LEFT JOIN add_party p ON s.Party_Id = p.Party_Id
//        WHERE DATE(s.created_at) = ?
//        ORDER BY s.created_at ASC`,
//       [fullDate]
//     );

//     const saleIds = sales.map((s) => s.Sale_Id);

//     let saleItems = [];
//     if (saleIds.length > 0) {
//       const [items] = await db.query(
//         `SELECT si.*,i.Item_Name,i.Item_HSN,i.Item_Category,i.Item_Unit FROM add_sale_items si
//         LEFT JOIN add_item i ON si.Item_Id = i.Item_Id
//         WHERE si.Sale_Id IN (?)`,
//         [saleIds]
//       );
//       saleItems = items;
//     }

//     const salesWithItems = sales.map((sale) => ({
//       sale_id: sale.Sale_Id,
//       Party_Name: sale.Party_Name,
//       GSTIN: sale.GSTIN,
//       Invoice_Number: sale.Invoice_Number,
//       Invoice_Date: formatIndianDate(sale.Invoice_Date),
//       State_Of_Supply: sale.State_Of_Supply,
//       Payment_Type: sale.Payment_Type,
//       Referrence_Number: sale.Referrence_Number,
//     //   bill_number: sale.Bill_Number,
//       Total_Received: sale.Total_Received,
//       Balance_Due: sale.Balance_Due,
//       created_at: formatIndianDate(sale.created_at),
//       Total_Amount: sale.Total_Amount,
//       items: saleItems.filter((i) => i.Sale_Id === sale.Sale_Id),
//     }));

//     // ---------------------------------------------------
//     // NEW SALES + ITEMS
//     // ---------------------------------------------------
//     const [newSales] = await db.query(
//       `SELECT ns.*, p.Party_Name,p.GSTIN 
//        FROM add_new_sale ns
//        LEFT JOIN add_party p ON ns.Party_Id = p.Party_Id
//        WHERE DATE(ns.created_at) = ?
//        ORDER BY ns.created_at ASC`,
//       [fullDate]
//     );
//     console.log(newSales);

//     const newSaleIds = newSales.map((n) => n.Sale_Id);
//     console.log(newSaleIds);
//     let newSaleItems = [];
//     if (newSaleIds.length > 0) {
//       const [items] = await db.query(
//         `SELECT nsi.*,i.Item_Name,i.Item_HSN,i.Item_Category,i.Item_Unit
//         FROM add_new_sale_items nsi
//          LEFT JOIN add_item_sale i ON nsi.Item_Id = i.Item_Id
//          WHERE nsi.Sale_Id IN (?)`,
//         [newSaleIds]
//       );
//       newSaleItems = items;
//     }
//     console.log(newSaleItems);

//     const newSalesWithItems = newSales.map((ns) => ({
//       sale_id: ns.Sale_Id,
//       Party_Name: ns.Party_Name,
//       GSTIN: ns.GSTIN,
//       Invoice_Number: ns.Invoice_Number,
//       Invoice_Date: formatIndianDate(ns.Invoice_Date),
//       State_Of_Supply: ns.State_Of_Supply,
//       Payment_Type: ns.Payment_Type,
//       Referrence_Number: ns.Referrence_Number,
//       Total_Received: ns.Total_Received,
//       Balance_Due: ns.Balance_Due,
//       created_at: formatIndianDate(ns.created_at),
//       Total_Amount: ns.Total_Amount,
//       items: newSaleItems.filter((i) => i.Sale_Id === ns.Sale_Id),
//     }));

//     // ---------------------------------------------------
//     // PURCHASES + ITEMS
//     // ---------------------------------------------------
//     const [purchases] = await db.query(
//       `SELECT pu.*, p.Party_Name,p.GSTIN 
//        FROM add_purchase pu
//        LEFT JOIN add_party p ON pu.Party_Id = p.Party_Id
//        WHERE DATE(pu.created_at) = ?
//        ORDER BY pu.created_at ASC`,
//       [fullDate]
//     );

//     const purchaseIds = purchases.map((pu) => pu.Purchase_Id);

//     let purchaseItems = [];
//     if (purchaseIds.length > 0) {
//       const [items] = await db.query(
//         `SELECT pu.*,i.Item_Name,i.Item_HSN,i.Item_Category,i.Item_Unit
//          FROM add_purchase_items pu
//          LEFT JOIN add_item i ON pu.Item_Id = i.Item_Id
//           WHERE pu.Purchase_Id IN (?)`,
//         [purchaseIds]
//       );
//       purchaseItems = items;
//     }

//     const purchasesWithItems = purchases.map((pu) => ({
//       purchase_id: pu.Purchase_Id,
//       Party_Name: pu.Party_Name,
//       GSTIN: pu.GSTIN,
//       Bill_Number: pu.Bill_Number,
//       Bill_Date: formatIndianDate(pu.Bill_Date),
//       State_Of_Supply: pu.State_Of_Supply,
//       Payment_Type: pu.Payment_Type,
//       Referrence_Number: pu.Referrence_Number,
//       Total_Paid: pu.Total_Paid,
//       Balance_Due: pu.Balance_Due,
//       created_at: formatIndianDate(pu.created_at),
//       Total_Amount: pu.Total_Amount,
//       items: purchaseItems.filter((i) => i.Purchase_Id === pu.Purchase_Id),
//     }));
// const totalPurchasesAmount = purchases.reduce(
//   (sum, p) => sum + Number(p.Total_Amount || 0),0);
// const totalPurchasePaidAmount = purchases.reduce(
//   (sum, p) => sum + Number(p.Total_Paid || 0),0)
// const totalSalesAmount = sales.reduce(
//   (sum, s) => sum + Number(s.Total_Amount || 0),0);
// const totalSalesReceivedAmount = sales.reduce(
//   (sum, s) => sum + Number(s.Total_Received || 0),0)
// const totalNewSalesAmount = newSales.reduce(
//   (sum, s) => sum + Number(s.Total_Amount || 0),0);
// const totalNewSalesReceivedAmount = newSales.reduce(
//   (sum, s) => sum + Number(s.Total_Received || 0),0)
//     // ---------------------------------------------------
//     // RESPONSE
//     // ---------------------------------------------------
//     return res.status(200).json({
//       success: true,
//       date: fullDate,
//       data:{
//         sales:{salesWithItems,totalSalesAmount,totalSalesReceivedAmount},
//       newSales: {newSalesWithItems,totalNewSalesAmount,totalNewSalesReceivedAmount},
//       purchases: {purchasesWithItems,totalPurchasesAmount,totalPurchasePaidAmount },
//       }
 
//     });

//   } catch (err) {
//     if (connection) connection.release();
//     console.error("❌ Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

// const fonts = {
//   Helvetica: {
//     normal: "Helvetica",
//     bold: "Helvetica-Bold",
//     italics: "Helvetica-Oblique",
//     bolditalics: "Helvetica-BoldOblique",
//   },
// };
// const getSalesNewSalesPurchasesEachDay = async (req, res, next) => {
//   let connection;
//   try {
//     connection = await db.getConnection();

//     const { date } = req.query;

//     if (!date) {
//       connection.release();
//       return res.status(400).json({ message: "Date is required" });
//     }

//     const fullDate = date; // Already YYYY-MM-DD

//     // Date formatter
//     const formatIndianDate = (date) =>
//       new Date(date).toLocaleString("en-IN", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric"
//       });

//     // ---------------------------------------------------
//     // 1️⃣ SALES (DATA + ITEMS)
//     // ---------------------------------------------------
//     const [sales] = await db.query(
//       `SELECT s.*, p.Party_Name, p.GSTIN
//        FROM add_sale s
//        LEFT JOIN add_party p ON s.Party_Id = p.Party_Id
//        WHERE DATE(s.financial_year) = ?
//        ORDER BY s.created_at ASC`,
//       [fullDate]
//     );

//     const saleIds = sales.map((s) => s.Sale_Id);

//     let saleItems = [];
//     if (saleIds.length > 0) {
//       const [items] = await db.query(
//         `SELECT si.*, i.Item_Name, i.Item_HSN, i.Item_Category, i.Item_Unit
//          FROM add_sale_items si
//          LEFT JOIN add_item i ON si.Item_Id = i.Item_Id
//          WHERE si.Sale_Id IN (?)`,
//         [saleIds]
//       );
//       saleItems = items;
//     }

//     const salesWithItems = sales.map((sale) => ({
//       sale_id: sale.Sale_Id,
//       Party_Name: sale.Party_Name,
//       GSTIN: sale.GSTIN,
//       Invoice_Number: sale.Invoice_Number,
//       Invoice_Date: formatIndianDate(sale.Invoice_Date),
//       State_Of_Supply: sale.State_Of_Supply,
//       Payment_Type: sale.Payment_Type,
//       Referrence_Number: sale.Referrence_Number,
//       Total_Received: sale.Total_Received,
//       Balance_Due: sale.Balance_Due,
//       created_at: formatIndianDate(sale.created_at),
//       Total_Amount: sale.Total_Amount,
//       items: saleItems.filter((i) => i.Sale_Id === sale.Sale_Id),
//     }));

//     // 👉 SQL TOTALS
//     const [salesTotals] = await db.query(
//       `SELECT 
//           COALESCE(SUM(Total_Amount),0) AS totalSalesAmount,
//           COALESCE(SUM(Total_Received),0) AS totalSalesReceivedAmount,
//           COALESCE(SUM(Balance_Due),0) AS totalSalesBalanceDue
//        FROM add_sale
//        WHERE DATE(created_at) = ?`,
//       [fullDate]
//     );

//     // ---------------------------------------------------
//     // 2️⃣ NEW SALES (DATA + ITEMS)
//     // ---------------------------------------------------
    

//     // ---------------------------------------------------
//     // 3️⃣ PURCHASES (DATA + ITEMS)
//     // ---------------------------------------------------
//     const [purchases] = await db.query(
//       `SELECT pu.*, p.Party_Name, p.GSTIN
//        FROM add_purchase pu
//        LEFT JOIN add_party p ON pu.Party_Id = p.Party_Id
//        WHERE DATE(pu.financial_year) = ?
//        ORDER BY pu.created_at ASC`,
//       [fullDate]
//     );

//     const purchaseIds = purchases.map((pu) => pu.Purchase_Id);

//     let purchaseItems = [];
//     if (purchaseIds.length > 0) {
//       const [items] = await db.query(
//         `SELECT pu.*, i.Item_Name, i.Item_HSN, i.Item_Category, i.Item_Unit
//          FROM add_purchase_items pu
//          LEFT JOIN add_item i ON pu.Item_Id = i.Item_Id
//          WHERE pu.Purchase_Id IN (?)`,
//         [purchaseIds]
//       );
//       purchaseItems = items;
//     }

//     const purchasesWithItems = purchases.map((pu) => ({
//       purchase_id: pu.Purchase_Id,
//       Party_Name: pu.Party_Name,
//       GSTIN: pu.GSTIN,
//       Bill_Number: pu.Bill_Number,
//       Bill_Date: formatIndianDate(pu.Bill_Date),
//       State_Of_Supply: pu.State_Of_Supply,
//       Payment_Type: pu.Payment_Type,
//       Referrence_Number: pu.Referrence_Number,
//       Total_Paid: pu.Total_Paid,
//       Balance_Due: pu.Balance_Due,
//       created_at: formatIndianDate(pu.created_at),
//       Total_Amount: pu.Total_Amount,
//       items: purchaseItems.filter((i) => i.Purchase_Id === pu.Purchase_Id),
//     }));

//     // 👉 SQL TOTALS
//     const [purchaseTotals] = await db.query(
//       `SELECT 
//           COALESCE(SUM(Total_Amount),0) AS totalPurchasesAmount,
//           COALESCE(SUM(Total_Paid),0) AS totalPurchasePaidAmount,
//           COALESCE(SUM(Balance_Due),0) AS totalPurchasesBalanceDue
//        FROM add_purchase
//        WHERE DATE(created_at) = ?`,
//       [fullDate]
//     );

//     // ---------------------------------------------------
//     // FINAL RESPONSE
//     // ---------------------------------------------------

// console.log(salesTotals);
//     return res.status(200).json({
//       success: true,
//       date: fullDate,
//       data: {
//         sales: {
//           items: salesWithItems,
//           totalSalesAmount: salesTotals[0].totalSalesAmount,
//          totalSalesReceivedAmount: salesTotals[0].totalSalesReceivedAmount,
//          totalSalesBalanceDue: salesTotals[0].totalSalesBalanceDue
//         },
     
//         purchases: {
//           items: purchasesWithItems,
//           totalPurchasesAmount: purchaseTotals[0].totalPurchasesAmount,
//           totalPurchasePaidAmount: purchaseTotals[0].totalPurchasePaidAmount,
//           totalPurchasesBalanceDue: purchaseTotals[0].totalPurchasesBalanceDue
//         }
//       }
//     });

//   } catch (err) {
//     if (connection) connection.release();
//     console.error("❌ Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
// const getSalesNewSalesPurchasesInDateRange = async (req, res, next) => {
//   let connection;
//   try {
//     connection = await db.getConnection();

//     const { fromDate, toDate } = req.query;

//     if (!fromDate || !toDate) {
//       connection.release();
//       return res.status(400).json({ message: "From and To Date is required" });
//     }
 

//     const fullFromDate = fromDate; // Already YYYY-MM-DD
//     const fullToDate = toDate; // Already YYYY-MM-DD

//     // Date formatter
//     const formatIndianDate = (date) =>
//       new Date(date).toLocaleString("en-IN", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric"
//       });

//     // ---------------------------------------------------
//     // 1️⃣ SALES (DATA + ITEMS)
//     // ---------------------------------------------------
//     const [sales] = await db.query(
//       `SELECT s.*, p.Party_Name, p.GSTIN
//        FROM add_sale s
//        LEFT JOIN add_party p ON s.Party_Id = p.Party_Id
//        WHERE DATE(s.created_at) BETWEEN ? AND ?
//        ORDER BY s.created_at ASC`,
//       [fullFromDate, fullToDate]
//     );

//     const saleIds = sales.map((s) => s.Sale_Id);

//     let saleItems = [];
//     if (saleIds.length > 0) {
//       const [items] = await db.query(
//         `SELECT si.*, i.Item_Name, i.Item_HSN, i.Item_Category, i.Item_Unit
//          FROM add_sale_items si
//          LEFT JOIN add_item i ON si.Item_Id = i.Item_Id
//          WHERE si.Sale_Id IN (?)`,
//         [saleIds]
//       );
//       saleItems = items;
//     }

//     const salesWithItems = sales.map((sale) => ({
//       sale_id: sale.Sale_Id,
//       Party_Name: sale.Party_Name,
//       GSTIN: sale.GSTIN,
//       Invoice_Number: sale.Invoice_Number,
//       Invoice_Date: formatIndianDate(sale.Invoice_Date),
//       State_Of_Supply: sale.State_Of_Supply,
//       Payment_Type: sale.Payment_Type,
//       Referrence_Number: sale.Referrence_Number,
//       Total_Received: sale.Total_Received,
//       Balance_Due: sale.Balance_Due,
//       created_at: formatIndianDate(sale.created_at),
//       Total_Amount: sale.Total_Amount,
//       items: saleItems.filter((i) => i.Sale_Id === sale.Sale_Id),
//     }));

//     // 👉 SQL TOTALS
//     const [salesTotals] = await db.query(
//       `SELECT 
//           COALESCE(SUM(Total_Amount),0) AS totalSalesAmount,
//           COALESCE(SUM(Total_Received),0) AS totalSalesReceivedAmount,
//           COALESCE(SUM(Balance_Due),0) AS totalSalesBalanceDue
//        FROM add_sale
//       WHERE DATE(created_at) BETWEEN ? AND ?`,
//       [fullFromDate, fullToDate]
//     );

//     // ---------------------------------------------------
//     // 2️⃣ NEW SALES (DATA + ITEMS)
//     // ---------------------------------------------------
//     const [newSales] = await db.query(
//       `SELECT ns.*, p.Party_Name, p.GSTIN
//        FROM add_new_sale ns
//        LEFT JOIN add_party p ON ns.Party_Id = p.Party_Id
//        WHERE DATE(ns.created_at) BETWEEN ? AND ?
//        ORDER BY ns.created_at ASC`,
//       [fullFromDate, fullToDate]
//     );

//     const newSaleIds = newSales.map((ns) => ns.Sale_Id);

//     let newSaleItems = [];
//     if (newSaleIds.length > 0) {
//       const [items] = await db.query(
//         `SELECT nsi.*, i.Item_Name, i.Item_HSN, i.Item_Category, i.Item_Unit
//          FROM add_new_sale_items nsi
//          LEFT JOIN add_item_sale i ON nsi.Item_Id = i.Item_Id
//          WHERE nsi.Sale_Id IN (?)`,
//         [newSaleIds]
//       );
//       newSaleItems = items;
//     }

//     const newSalesWithItems = newSales.map((ns) => ({
//       sale_id: ns.Sale_Id,
//       Party_Name: ns.Party_Name,
//       GSTIN: ns.GSTIN,
//       Invoice_Number: ns.Invoice_Number,
//       Invoice_Date: formatIndianDate(ns.Invoice_Date),
//       State_Of_Supply: ns.State_Of_Supply,
//       Payment_Type: ns.Payment_Type,
//       Referrence_Number: ns.Referrence_Number,
//       Total_Received: ns.Total_Received,
//       Balance_Due: ns.Balance_Due,
//       created_at: formatIndianDate(ns.created_at),
//       Total_Amount: ns.Total_Amount,
//       items: newSaleItems.filter((i) => i.Sale_Id === ns.Sale_Id),
//     }));

//     // 👉 SQL TOTALS
//     const [newSalesTotals] = await db.query(
//       `SELECT 
//           COALESCE(SUM(Total_Amount), 0) AS totalNewSalesAmount,
//           COALESCE(SUM(Total_Received), 0) AS totalNewSalesReceivedAmount,
//           COALESCE(SUM(Balance_Due), 0) AS totalNewSalesBalanceDue
//        FROM add_new_sale
//       WHERE DATE(created_at) BETWEEN ? AND ?`,
//       [fullFromDate, fullToDate]
//     );

//     // ---------------------------------------------------
//     // 3️⃣ PURCHASES (DATA + ITEMS)
//     // ---------------------------------------------------
//     const [purchases] = await db.query(
//       `SELECT pu.*, p.Party_Name, p.GSTIN
//        FROM add_purchase pu
//        LEFT JOIN add_party p ON pu.Party_Id = p.Party_Id
//        WHERE DATE(pu.created_at) BETWEEN ? AND ?
//        ORDER BY pu.created_at ASC`,
//       [fullFromDate, fullToDate]
//     );

//     const purchaseIds = purchases.map((pu) => pu.Purchase_Id);

//     let purchaseItems = [];
//     if (purchaseIds.length > 0) {
//       const [items] = await db.query(
//         `SELECT pu.*, i.Item_Name, i.Item_HSN, i.Item_Category, i.Item_Unit
//          FROM add_purchase_items pu
//          LEFT JOIN add_item i ON pu.Item_Id = i.Item_Id
//          WHERE pu.Purchase_Id IN (?)`,
//         [purchaseIds]
//       );
//       purchaseItems = items;
//     }

//     const purchasesWithItems = purchases.map((pu) => ({
//       purchase_id: pu.Purchase_Id,
//       Party_Name: pu.Party_Name,
//       GSTIN: pu.GSTIN,
//       Bill_Number: pu.Bill_Number,
//       Bill_Date: formatIndianDate(pu.Bill_Date),
//       State_Of_Supply: pu.State_Of_Supply,
//       Payment_Type: pu.Payment_Type,
//       Referrence_Number: pu.Referrence_Number,
//       Total_Paid: pu.Total_Paid,
//       Balance_Due: pu.Balance_Due,
//       created_at: formatIndianDate(pu.created_at),
//       Total_Amount: pu.Total_Amount,
//       items: purchaseItems.filter((i) => i.Purchase_Id === pu.Purchase_Id),
//     }));

//     // 👉 SQL TOTALS
//     const [purchaseTotals] = await db.query(
//       `SELECT 
//           COALESCE(SUM(Total_Amount),0) AS totalPurchasesAmount,
//           COALESCE(SUM(Total_Paid),0) AS totalPurchasePaidAmount,
//           COALESCE(SUM(Balance_Due),0) AS totalPurchasesBalanceDue
//        FROM add_purchase
//       WHERE DATE(created_at) BETWEEN ? AND ?`,
//       [fullFromDate, fullToDate]
//     );

//     // ---------------------------------------------------
//     // FINAL RESPONSE
//     // ---------------------------------------------------

// console.log(salesTotals);
//     return res.status(200).json({
//       success: true,
//       fromDate: fromDate,
//       toDate: toDate,
//       data: {
//         sales: {
//           items: salesWithItems,
//           totalSalesAmount: salesTotals[0].totalSalesAmount,
//          totalSalesReceivedAmount: salesTotals[0].totalSalesReceivedAmount,
//          totalSalesBalanceDue: salesTotals[0].totalSalesBalanceDue
//         },
//         newSales: {
//           items: newSalesWithItems,
//         totalNewSalesAmount: newSalesTotals[0].totalNewSalesAmount,
//         totalNewSalesReceivedAmount: newSalesTotals[0].totalNewSalesReceivedAmount,
//         totalNewSalesBalanceDue: newSalesTotals[0].totalNewSalesBalanceDue
//         },
//         purchases: {
//           items: purchasesWithItems,
//           totalPurchasesAmount: purchaseTotals[0].totalPurchasesAmount,
//           totalPurchasePaidAmount: purchaseTotals[0].totalPurchasePaidAmount,
//           totalPurchasesBalanceDue: purchaseTotals[0].totalPurchasesBalanceDue
//         }
//       }
//     });

//   } catch (err) {
//     if (connection) connection.release();
//     console.error("❌ Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
const getSalesNewSalesPurchasesEachDay = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();

    const { date } = req.query;

    if (!date) {
      connection.release();
      return res.status(400).json({ message: "Date is required" });
    }

    const fullDate = date; // YYYY-MM-DD

    // Format function
    const formatIndianDate = (date) =>
      new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

    // ---------------------------------------------------
    // 0️⃣ FETCH ACTIVE FINANCIAL YEAR
    // ---------------------------------------------------
    const [fy] = await connection.query(
      `SELECT Financial_Year 
       FROM financial_year 
       WHERE Current_Financial_Year = 1
       LIMIT 1`
    );

    if (!fy.length) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: "No active financial year found.",
      });
    }

    const activeFY = fy[0].Financial_Year; // Example: "2024-2025"

    // ---------------------------------------------------
    // 1️⃣ SALES (DATA + ITEMS)
    // ---------------------------------------------------
    const [sales] = await connection.query(
      `SELECT s.*, p.Party_Name, p.GSTIN
       FROM add_sale s
       LEFT JOIN add_party p ON s.Party_Id = p.Party_Id
       WHERE s.Financial_Year = ?
       AND DATE(s.Invoice_Date) = ?
       ORDER BY s.Invoice_Date ASC`,
      [activeFY, fullDate]
    );

    const saleIds = sales.map((s) => s.Sale_Id);

    let saleItems = [];
    if (saleIds.length > 0) {
      const [items] = await connection.query(
        `SELECT si.*, i.Item_Name, i.Item_HSN, i.Item_Category, i.Item_Unit
         FROM add_sale_items si
         LEFT JOIN add_item i ON si.Item_Id = i.Item_Id
         WHERE si.Sale_Id IN (?)`,
        [saleIds]
      );
      saleItems = items;
    }

    const salesWithItems = sales.map((sale) => ({
      sale_id: sale.Sale_Id,
      Party_Name: sale.Party_Name,
      GSTIN: sale.GSTIN,
      Invoice_Number: sale.Invoice_Number,
      Invoice_Date: formatIndianDate(sale.Invoice_Date),
      State_Of_Supply: sale.State_Of_Supply,
      Payment_Type: sale.Payment_Type,
      Referrence_Number: sale.Referrence_Number,
      Total_Received: sale.Total_Received,
      Balance_Due: sale.Balance_Due,
      created_at: formatIndianDate(sale.created_at),
      Total_Amount: sale.Total_Amount,
      items: saleItems.filter((i) => i.Sale_Id === sale.Sale_Id),
    }));

    // SALES TOTALS
    const [salesTotals] = await connection.query(
      `SELECT 
          COALESCE(SUM(Total_Amount),0) AS totalSalesAmount,
          COALESCE(SUM(Total_Received),0) AS totalSalesReceivedAmount,
          COALESCE(SUM(Balance_Due),0) AS totalSalesBalanceDue
       FROM add_sale
       WHERE Financial_Year = ?
       AND DATE(Invoice_Date) = ?`,
      [activeFY, fullDate]
    );

    // ---------------------------------------------------
    // 2️⃣ PURCHASES (DATA + ITEMS)
    // ---------------------------------------------------
    const [purchases] = await connection.query(
      `SELECT pu.*, p.Party_Name, p.GSTIN
       FROM add_purchase pu
       LEFT JOIN add_party p ON pu.Party_Id = p.Party_Id
       WHERE pu.Financial_Year = ?
       AND DATE(pu.Bill_Date) = ?
       ORDER BY pu.Bill_Date ASC`,
      [activeFY, fullDate]
    );

    const purchaseIds = purchases.map((pu) => pu.Purchase_Id);

    let purchaseItems = [];
    if (purchaseIds.length > 0) {
      const [items] = await connection.query(
        `SELECT pu.*, i.Item_Name, i.Item_HSN, i.Item_Category, i.Item_Unit
         FROM add_purchase_items pu
         LEFT JOIN add_item i ON pu.Item_Id = i.Item_Id
         WHERE pu.Purchase_Id IN (?)`,
        [purchaseIds]
      );
      purchaseItems = items;
    }

    const purchasesWithItems = purchases.map((pu) => ({
      purchase_id: pu.Purchase_Id,
      Party_Name: pu.Party_Name,
      GSTIN: pu.GSTIN,
      Bill_Number: pu.Bill_Number,
      Bill_Date: formatIndianDate(pu.Bill_Date),
      State_Of_Supply: pu.State_Of_Supply,
      Payment_Type: pu.Payment_Type,
      Referrence_Number: pu.Referrence_Number,
      Total_Paid: pu.Total_Paid,
      Balance_Due: pu.Balance_Due,
      created_at: formatIndianDate(pu.created_at),
      Total_Amount: pu.Total_Amount,
      items: purchaseItems.filter((i) => i.Purchase_Id === pu.Purchase_Id),
    }));

    // PURCHASE TOTALS
    const [purchaseTotals] = await connection.query(
      `SELECT 
          COALESCE(SUM(Total_Amount),0) AS totalPurchasesAmount,
          COALESCE(SUM(Total_Paid),0) AS totalPurchasePaidAmount,
          COALESCE(SUM(Balance_Due),0) AS totalPurchasesBalanceDue
       FROM add_purchase
       WHERE Financial_Year = ?
       AND DATE(Bill_Date) = ?`,
      [activeFY, fullDate]
    );

    // ---------------------------------------------------
    // FINAL RESPONSE
    // ---------------------------------------------------

    return res.status(200).json({
      success: true,
      date: fullDate,
      financialYear: activeFY,
      data: {
        sales: {
          items: salesWithItems,
          totalSalesAmount: salesTotals[0].totalSalesAmount,
          totalSalesReceivedAmount: salesTotals[0].totalSalesReceivedAmount,
          totalSalesBalanceDue: salesTotals[0].totalSalesBalanceDue,
        },

        purchases: {
          items: purchasesWithItems,
          totalPurchasesAmount: purchaseTotals[0].totalPurchasesAmount,
          totalPurchasePaidAmount: purchaseTotals[0].totalPurchasePaidAmount,
          totalPurchasesBalanceDue: purchaseTotals[0].totalPurchasesBalanceDue,
        },
      },
    });
  } catch (err) {
    if (connection) connection.release();
    console.error("❌ Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


// const getSalesNewSalesPurchasesInDateRange = async (req, res, next) => {
//   let connection;
//   try {
//     connection = await db.getConnection();

//     const { fromDate, toDate } = req.query;

//     if (!fromDate || !toDate) {
//       connection.release();
//       return res.status(400).json({ message: "From and To Date is required" });
//     }

//     const formatIndianDate = (date) =>
//       new Date(date).toLocaleString("en-IN", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric"
//       });

//     /* ---------------------------------------------------
//        1️⃣ SALES (DATA + ITEMS)
//     --------------------------------------------------- */
//     const [sales] = await db.query(
//       `SELECT s.*, p.Party_Name, p.GSTIN
//        FROM add_sale s
//        LEFT JOIN add_party p ON s.Party_Id = p.Party_Id
//        WHERE DATE(s.created_at) BETWEEN ? AND ?
//        ORDER BY s.created_at ASC`,
//       [fromDate, toDate]
//     );

//     const saleIds = sales.map((s) => s.Sale_Id);

//     let saleItems = [];
//     if (saleIds.length > 0) {
//       const [items] = await db.query(
//         `SELECT si.*, i.Item_Name, i.Item_HSN, i.Item_Category, i.Item_Unit
//          FROM add_sale_items si
//          LEFT JOIN add_item i ON si.Item_Id = i.Item_Id
//          WHERE si.Sale_Id IN (?)`,
//         [saleIds]
//       );
//       saleItems = items;
//     }

//     const salesWithItems = sales.map((s) => ({
//       sale_id: s.Sale_Id,
//       Party_Name: s.Party_Name,
//       GSTIN: s.GSTIN,
//       Invoice_Number: s.Invoice_Number,
//       Invoice_Date: formatIndianDate(s.Invoice_Date),
//       State_Of_Supply: s.State_Of_Supply,
//       Payment_Type: s.Payment_Type,
//       Referrence_Number: s.Referrence_Number,
//       Total_Received: s.Total_Received,
//       Balance_Due: s.Balance_Due,
//       created_at: formatIndianDate(s.created_at),
//       Total_Amount: s.Total_Amount,
//       items: saleItems.filter((i) => i.Sale_Id === s.Sale_Id),
//     }));

//     const [salesTotals] = await db.query(
//       `SELECT 
//           COALESCE(SUM(Total_Amount),0) AS totalSalesAmount,
//           COALESCE(SUM(Total_Received),0) AS totalSalesReceivedAmount,
//           COALESCE(SUM(Balance_Due),0) AS totalSalesBalanceDue
//        FROM add_sale
//        WHERE DATE(created_at) BETWEEN ? AND ?`,
//       [fromDate, toDate]
//     );

//     /* ---------------------------------------------------
   
   
//     /* ---------------------------------------------------
//        3️⃣ PURCHASES (DATA + ITEMS)
//     --------------------------------------------------- */
//     const [purchases] = await db.query(
//       `SELECT pu.*, p.Party_Name, p.GSTIN
//        FROM add_purchase pu
//        LEFT JOIN add_party p ON pu.Party_Id = p.Party_Id
//        WHERE DATE(pu.created_at) BETWEEN ? AND ?
//        ORDER BY pu.created_at ASC`,
//       [fromDate, toDate]
//     );

//     const purchaseIds = purchases.map((p) => p.Purchase_Id);

//     let purchaseItems = [];
//     if (purchaseIds.length > 0) {
//       const [items] = await db.query(
//         `SELECT pu.*, i.Item_Name, i.Item_HSN, i.Item_Category, i.Item_Unit
//          FROM add_purchase_items pu
//          LEFT JOIN add_item i ON pu.Item_Id = i.Item_Id
//          WHERE pu.Purchase_Id IN (?)`,
//         [purchaseIds]
//       );
//       purchaseItems = items;
//     }

//     const purchasesWithItems = purchases.map((pu) => ({
//       purchase_id: pu.Purchase_Id,
//       Party_Name: pu.Party_Name,
//       GSTIN: pu.GSTIN,
//       Bill_Number: pu.Bill_Number,
//       Bill_Date: formatIndianDate(pu.Bill_Date),
//       State_Of_Supply: pu.State_Of_Supply,
//       Payment_Type: pu.Payment_Type,
//       Referrence_Number: pu.Referrence_Number,
//       Total_Paid: pu.Total_Paid,
//       Balance_Due: pu.Balance_Due,
//       created_at: formatIndianDate(pu.created_at),
//       Total_Amount: pu.Total_Amount,
//       items: purchaseItems.filter((i) => i.Purchase_Id === pu.Purchase_Id),
//     }));

//     const [purchaseTotals] = await db.query(
//       `SELECT 
//           COALESCE(SUM(Total_Amount),0) AS totalPurchasesAmount,
//           COALESCE(SUM(Total_Paid),0) AS totalPurchasePaidAmount,
//           COALESCE(SUM(Balance_Due),0) AS totalPurchasesBalanceDue
//        FROM add_purchase
//        WHERE DATE(created_at) BETWEEN ? AND ?`,
//       [fromDate, toDate]
//     );

//     /* ---------------------------------------------------
//        FINAL RESPONSE
//     --------------------------------------------------- */
//     return res.status(200).json({
//       success: true,
//       fromDate,
//       toDate,
//       data: {
//         sales: {
//           items: salesWithItems,
//           totalSalesAmount: salesTotals[0].totalSalesAmount,
//           totalSalesReceivedAmount: salesTotals[0].totalSalesReceivedAmount,
//           totalSalesBalanceDue: salesTotals[0].totalSalesBalanceDue
//         },
       
//         purchases: {
//           items: purchasesWithItems,
//           totalPurchasesAmount: purchaseTotals[0].totalPurchasesAmount,
//           totalPurchasePaidAmount: purchaseTotals[0].totalPurchasePaidAmount,
//           totalPurchasesBalanceDue: purchaseTotals[0].totalPurchasesBalanceDue
//         }
//       }
//     });

//   } catch (err) {
//     if (connection) connection.release();
//     console.error("❌ Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
const getSalesNewSalesPurchasesInDateRange = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();

    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      connection.release();
      return res.status(400).json({ message: "From and To Date is required" });
    }

    const formatIndianDate = (date) =>
      new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

    /* ---------------------------------------------------
       0️⃣ FETCH ACTIVE FINANCIAL YEAR
    --------------------------------------------------- */
    const [fy] = await connection.query(
      `SELECT Financial_Year 
       FROM financial_year 
       WHERE Current_Financial_Year = 1
       LIMIT 1`
    );

    if (!fy.length) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: "No active financial year found.",
      });
    }

    const activeFY = fy[0].Financial_Year;

    /* ---------------------------------------------------
       1️⃣ SALES (DATA + ITEMS)
    --------------------------------------------------- */
    const [sales] = await connection.query(
      `SELECT s.*, p.Party_Name, p.GSTIN
       FROM add_sale s
       LEFT JOIN add_party p ON s.Party_Id = p.Party_Id
       WHERE s.Financial_Year = ?
       AND DATE(s.Invoice_Date) BETWEEN ? AND ?
       ORDER BY s.Invoice_Date ASC`,
      [activeFY, fromDate, toDate]
    );

    const saleIds = sales.map((s) => s.Sale_Id);

    let saleItems = [];
    if (saleIds.length > 0) {
      const [items] = await connection.query(
        `SELECT si.*, i.Item_Name, i.Item_HSN, i.Item_Category, i.Item_Unit
         FROM add_sale_items si
         LEFT JOIN add_item i ON si.Item_Id = i.Item_Id
         WHERE si.Sale_Id IN (?)`,
        [saleIds]
      );
      saleItems = items;
    }

    const salesWithItems = sales.map((s) => ({
      sale_id: s.Sale_Id,
      Party_Name: s.Party_Name,
      GSTIN: s.GSTIN,
      Invoice_Number: s.Invoice_Number,
      Invoice_Date: formatIndianDate(s.Invoice_Date),
      State_Of_Supply: s.State_Of_Supply,
      Payment_Type: s.Payment_Type,
      Referrence_Number: s.Referrence_Number,
      Total_Received: s.Total_Received,
      Balance_Due: s.Balance_Due,
      created_at: formatIndianDate(s.created_at),
      Total_Amount: s.Total_Amount,
      items: saleItems.filter((i) => i.Sale_Id === s.Sale_Id),
    }));

    const [salesTotals] = await connection.query(
      `SELECT 
          COALESCE(SUM(Total_Amount),0) AS totalSalesAmount,
          COALESCE(SUM(Total_Received),0) AS totalSalesReceivedAmount,
          COALESCE(SUM(Balance_Due),0) AS totalSalesBalanceDue
       FROM add_sale
       WHERE Financial_Year = ?
       AND DATE(Invoice_Date) BETWEEN ? AND ?`,
      [activeFY, fromDate, toDate]
    );

    /* ---------------------------------------------------
       2️⃣ PURCHASES (DATA + ITEMS)
    --------------------------------------------------- */
    const [purchases] = await connection.query(
      `SELECT pu.*, p.Party_Name, p.GSTIN
       FROM add_purchase pu
       LEFT JOIN add_party p ON pu.Party_Id = p.Party_Id
       WHERE pu.Financial_Year = ?
       AND DATE(pu.Bill_Date) BETWEEN ? AND ?
       ORDER BY pu.Bill_Date ASC`,
      [activeFY, fromDate, toDate]
    );

    const purchaseIds = purchases.map((p) => p.Purchase_Id);

    let purchaseItems = [];
    if (purchaseIds.length > 0) {
      const [items] = await connection.query(
        `SELECT pu.*, i.Item_Name, i.Item_HSN, i.Item_Category, i.Item_Unit
         FROM add_purchase_items pu
         LEFT JOIN add_item i ON pu.Item_Id = i.Item_Id
         WHERE pu.Purchase_Id IN (?)`,
        [purchaseIds]
      );
      purchaseItems = items;
    }

    const purchasesWithItems = purchases.map((pu) => ({
      purchase_id: pu.Purchase_Id,
      Party_Name: pu.Party_Name,
      GSTIN: pu.GSTIN,
      Bill_Number: pu.Bill_Number,
      Bill_Date: formatIndianDate(pu.Bill_Date),
      State_Of_Supply: pu.State_Of_Supply,
      Payment_Type: pu.Payment_Type,
      Referrence_Number: pu.Referrence_Number,
      Total_Paid: pu.Total_Paid,
      Balance_Due: pu.Balance_Due,
      created_at: formatIndianDate(pu.created_at),
      Total_Amount: pu.Total_Amount,
      items: purchaseItems.filter((i) => i.Purchase_Id === pu.Purchase_Id),
    }));

    const [purchaseTotals] = await connection.query(
      `SELECT 
          COALESCE(SUM(Total_Amount),0) AS totalPurchasesAmount,
          COALESCE(SUM(Total_Paid),0) AS totalPurchasePaidAmount,
          COALESCE(SUM(Balance_Due),0) AS totalPurchasesBalanceDue
       FROM add_purchase
       WHERE Financial_Year = ?
       AND DATE(Bill_Date) BETWEEN ? AND ?`,
      [activeFY, fromDate, toDate]
    );

    /* ---------------------------------------------------
       FINAL RESPONSE
    --------------------------------------------------- */
    return res.status(200).json({
      success: true,
      fromDate,
      toDate,
      financialYear: activeFY,
      data: {
        sales: {
          items: salesWithItems,
          totalSalesAmount: salesTotals[0].totalSalesAmount,
          totalSalesReceivedAmount: salesTotals[0].totalSalesReceivedAmount,
          totalSalesBalanceDue: salesTotals[0].totalSalesBalanceDue,
        },

        purchases: {
          items: purchasesWithItems,
          totalPurchasesAmount: purchaseTotals[0].totalPurchasesAmount,
          totalPurchasePaidAmount: purchaseTotals[0].totalPurchasePaidAmount,
          totalPurchasesBalanceDue: purchaseTotals[0].totalPurchasesBalanceDue,
        },
      },
    });
  } catch (err) {
    if (connection) connection.release();
    console.error("❌ Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

const fonts = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};


const printer = new PdfPrinter(fonts);


const printDailyReport = async (req, res) => {
  try {
    // Accept BOTH daily OR range
    const {
      sales = [],
    
      purchases = [],

      date,        // for single-day
      fromDate,    // for range
      toDate,

      totalSalesAmount,
      totalSalesReceivedAmount,
      totalSalesBalanceDue,

     

      totalPurchasesAmount,
      totalPurchasesPaidAmount,
      totalPurchasesBalanceDue
    } = req.body;

    // GLOBAL TOTALS
    const globalTotals = {
      totalSalesAmount: totalSalesAmount || 0,
      totalSalesReceivedAmount: totalSalesReceivedAmount || 0,
      totalSalesBalanceDue: totalSalesBalanceDue || 0,

     

      totalPurchasesAmount: totalPurchasesAmount || 0,
      totalPurchasesPaidAmount: totalPurchasesPaidAmount || 0,
      totalPurchasesBalanceDue: totalPurchasesBalanceDue || 0
    };

    const safe = (v) => (v !== undefined && v !== null ? v : "N/A");

  
  const buildSection = (title, list, type) => {
  if (!list || list.length === 0) return [];

  let rows = [
    {
      text: title.toUpperCase(),
      style: "sectionHeader",
      alignment: "center",
      margin: [0, 20, 0, 10]
    }
  ];

  list.forEach((entry, idx) => {
    rows.push({
      unbreakable: true,  // 🔥🔥🔥 THE MAGIC FIX
      stack: [
        {
          text: `${title.slice(0, -1)} ${idx + 1}`,
          style: "subTitle",
          alignment: "left",
          margin: [0, 0, 0, 5]
        },

        // PARTY DETAILS
        {
          columns: [
            {
              width: "48%",
              stack: [
                { text: "Party Name", style: "label" },
                { text: safe(entry.Party_Name), style: "value" },

                { text: "GSTIN", style: "label" },
                { text: safe(entry.GSTIN), style: "value" }
              ]
            },
            {
              width: "48%",
              alignment: "right",
              stack: [
                {
                  text: type === "purchase" ? "Bill Number" : "Invoice Number",
                  style: "label"
                },
                {
                  text: safe(entry.Bill_Number|| entry.Invoice_Number),
                  style: "value"
                },

                {
                  text: type === "purchase" ? "Bill Date" : "Invoice Date",
                  style: "label"
                },
                {
                  text: safe(entry.Bill_Date|| entry.Invoice_Date),
                  style: "value"
                }
              ]
            }
          ],
          columnGap: 20,
          margin: [0, 0, 0, 10]
        },

        // TABLE
        {
          style: "tableSmall",
          table: {
            headerRows: 1,
            widths: ["auto", "*", "*", "*", "*", "*", "*", "*"],
            body: [
              [
                { text: "Sl", style: "tableHeader" },
                { text: "Category", style: "tableHeader" },
                { text: "Item", style: "tableHeader" },
                { text: "HSN", style: "tableHeader" },
                { text: "Qty", style: "tableHeader" },
                { text: "Price", style: "tableHeader" },
                { text: "Tax", style: "tableHeader" },
                { text: "Amount", style: "tableHeader" }
              ],

              ...entry.items.map((it, i) => [
                i + 1,
                safe(it.Item_Category),
                safe(it.Item_Name),
                safe(it.Item_HSN),
                safe(it.Quantity + " " + safe(it.Item_Unit)),
                safe(it.Sale_Price || it.Purchase_Price),
                safe(TAX_TYPES[it.Tax_Type] || it.Tax_Type),
                Number(it.Amount || 0).toFixed(2)
              ])
            ]
          },
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 8]
        },

        // TOTALS SECTION
        {
          columns: [
            { width: "*", text: "" },
            {
              width: "40%",
              table: {
                widths: ["*", "auto"],
                body: [
                  ["Total Amount", safe(entry.Total_Amount)],
                  [
                    type === "purchase" ? "Paid" : "Received",
                    safe(entry.Total_Paid || entry.Total_Received)
                  ],
                  ["Balance Due", safe(entry.Balance_Due)]
                ]
              },
              layout: "noBordersBox"
            }
          ],
          margin: [0, 0, 0, 15]
        }
      ]
    });
  });

  return rows;
};

    // HEADER TITLE
    let headerTitle = "";

    if (fromDate && toDate) {
      headerTitle = `DATE RANGE REPORT`;
    } else if (date) {
      headerTitle = `DAILY REPORT`;
    }

    
const docDefinition = {
  pageMargins: [18, 18, 18, 30],
  defaultStyle: { font: "Helvetica" },

  footer: (p, pc) => ({
    text: `Page ${p} of ${pc}`,
    alignment: "center",
    margin: [10, 10, 10, 10]
  }),

  content: [
    {
      text: headerTitle,
      style: "header",
      alignment: "center",
      margin: [0, 0, 0, 10]
    },

    ...buildSection("Purchases", purchases, "purchase"),
    ...buildSection("Sales", sales, "sale"),
    
  ],

  styles: {
    header: { fontSize: 20, bold: true },
    sectionHeader: { fontSize: 15, bold: true },
    subTitle: { fontSize: 12, bold: true },
    label: { bold: true, fontSize: 10 },
    value: { fontSize: 10 },
    tableHeader: { bold: true, fillColor: "#eee" },
    tableSmall: { fontSize: 9 }
  }
};

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];

    pdfDoc.on("data", (c) => chunks.push(c));
    pdfDoc.on("end", () => {
      res.setHeader("Content-Type", "application/pdf");
      res.send(Buffer.concat(chunks));
    });

    pdfDoc.end();

  } catch (err) {
    console.error("Print failed:", err);
    res.status(500).json({ message: "PDF Print Error" });
  }
};



export {getSalesNewSalesPurchasesEachDay,
  getSalesNewSalesPurchasesInDateRange,printDailyReport}

