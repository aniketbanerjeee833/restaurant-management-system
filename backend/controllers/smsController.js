import crypto from "crypto";
import db from "../config/db.js";
//import { sendSMS } from "../utils/smsService.js";
import {io} from "../app.js"
import { sendSMS } from "../utils/sendSMS.js";

async function generateNextId(connection, prefix, column, table) {
  const [rows] = await connection.query(
    `SELECT ${column} FROM ${table} ORDER BY id DESC LIMIT 1 FOR UPDATE`
  );

  if (rows.length === 0) return prefix + "00001";

  const lastId = rows[0][column];
  const num = parseInt(lastId.replace(prefix, ""), 10) + 1;

  return prefix + num.toString().padStart(5, "0");
}
async function generateNextInvoiceId(connection, prefix, column, table) {
  const [rows] = await connection.query(
    `SELECT ${column} FROM ${table} ORDER BY id DESC LIMIT 1`
  );

  if (rows.length === 0) return prefix + "001";

  const lastId = rows[0][column];
  const num = parseInt(lastId.replace(prefix, ""), 10) + 1;

  return prefix + num.toString().padStart(3, "0");
}
//  const generateSms = async (req, res, next) => {
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

//     if (!Order_Id || !Customer_Phone || !Final_Amount) {
//       return res.status(400).json({
//         success: false,
//         message: "Required details missing",
//       });
//     }

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     /* ---------------- KOT ---------------- */
//     const [[kotRow]] = await connection.query(
//       `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
//       [Order_Id]
//     );
//     const KOT_Id = kotRow ? kotRow.KOT_Id : null;

//     /* ---------------- CUSTOMER ---------------- */
//     const [[customer]] = await connection.query(
//       `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
//       [Customer_Phone]
//     );

//     if (!customer) {
//       await connection.rollback();
//       return res.status(400).json({ success: false, message: "Customer not found" });
//     }

//     /* ---------------- FINANCIAL YEAR ---------------- */
//     const [[fy]] = await connection.query(
//       `SELECT Financial_Year FROM financial_year WHERE Current_Financial_Year = 1 LIMIT 1`
//     );

//     if (!fy) {
//       await connection.rollback();
//       return res.status(400).json({ message: "No active financial year found" });
//     }

//     /* ---------------- INVOICE ---------------- */
//     // const Invoice_Id = await generateNextInvoiceId(connection, "IN", "Invoice_Id", "invoices");
//   const Invoice_Id = await generateNextId(connection, "INV", "Invoice_Id", "invoices");
//     await connection.query(
//       `INSERT INTO invoices
//        (Invoice_Id, Order_Id, Invoice_Date, Financial_Year,
//         Customer_Name, Customer_Phone, Customer_Id,
//         Discount_Type, Discount, Service_Charge, Amount, Payment_Type)
//        VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         Invoice_Id,
//         Order_Id,
//         fy.Financial_Year,
//         Customer_Name?.trim() || null,
//         Customer_Phone,
//         customer.Customer_Id,
//         Discount_Type || "percentage",
//         Discount || 0,
//         Service_Charge || 0,
//         Final_Amount,
//         Payment_Type || "cash",
//       ]
//     );

//     /* ---------------- PUBLIC LINK ---------------- */
//     const Invoice_Public_Link_Id = await generateNextId(
//       connection,
//       "IPLK",
//       "Invoice_Public_Link_Id",
//       "invoice_public_links"
//     );

//     const Public_Token = crypto.randomBytes(24).toString("hex");

//     await connection.query(
//       `INSERT INTO invoice_public_links
//        (Invoice_Public_Link_Id, Invoice_Id, Order_Id, Customer_Id, Public_Token)
//        VALUES (?, ?, ?, ?, ?)`,
//       [Invoice_Public_Link_Id, Invoice_Id, Order_Id, customer.Customer_Id, Public_Token]
//     );

//     /* ---------------- ORDER & KITCHEN ---------------- */
//     await connection.query(
//       `UPDATE orders SET Payment_Status='completed', Status='paid' WHERE Order_Id=?`,
//       [Order_Id]
//     );

//      // ---------------------------------------
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

//     if (KOT_Id) {
//       await connection.query(
//         `UPDATE kitchen_orders SET Status='ready', updated_at=NOW() WHERE KOT_Id=?`,
//         [KOT_Id]
//       );
//       await connection.query(
//         `UPDATE kitchen_order_items SET Item_Status='ready' WHERE KOT_Id=?`,
//         [KOT_Id]
//       );
//       io.emit("kitchen_order_removed", { KOT_Id });
//     }

// // ✅ Commit only after SMS success
// await connection.commit();


//     /* ---------------- SMS ---------------- */
//     // const invoiceLink = `${"http://localhost:5173"}/invoice/view/${Public_Token}`;
//     // const smsMessage = `Thank you for your order 🙏\nView your bill here:\n${invoiceLink}`;
// // const restaurantName = "Hello Guys Shakuntala Park";
// const totalAmount = Number(Final_Amount).toFixed(2);
// const billNumber = Invoice_Id; // or invoice display number
// // const invoiceLink = `http://localhost:4000/api/staff/order/${billNumber}`;
// // const invoiceLink = `https://ancoinnovation.com/b/${billNumber}`
// const invoiceLink = `${"http://localhost:5173"}/${billNumber}`
// // const invoiceLink = `${"http://localhost:5173"}/invoice/view/${billNumber}`;
// // const invoiceLink = `https://ancoinnovation.com/restaurant-mangement-system/invoice/view/${Public_Token}`;

// // Hi, Your bill from Hello Guys Shakuntala Park : Total Rs.{#var#} (incl. Tax). Bill No. {#var#}. View full details: {#var#} CLPLSE.

// // const smsMessage = `Hi, Your bill from Hello Guys Shakuntala Park : Total Rs.${totalAmount} (incl. Tax). Bill No. ${billNumber}. View full details: ${invoiceLink} CLPLSE.`;

// const smsMessage = `Hi, Your bill from Hello Guys Shakuntala Park : Total Rs.${totalAmount} (incl. Tax). Bill No. ${billNumber} View full details: ${invoiceLink}. HloGuy`;
//     const smsSent = await sendSMS(Customer_Phone, smsMessage);

// // ❌ If SMS rejected → rollback
// // if (!smsSent) {
// //   await connection.rollback();
// //   return res.status(400).json({
// //     success: false,
// //     message: "SMS rejected by gateway. Please try again.",
// //   });
// // }
//  return res.status(200).json({
//       success: true,
//       message: smsSent
//         ? "Invoice generated & SMS sent successfully"
//         : "Invoice generated but SMS failed",
//       Invoice_Id,
//       smsSent,
//     });

// // return res.status(200).json({
// //   success: true,
// //   message: "Invoice generated & SMS sent successfully",
// //   Invoice_Id,
// //   Invoice_Public_Link_Id,
// // });


//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error generating SMS:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };



// const getPublicInvoiceHtml = async (req, res, next) => {
//   let connection;

//   try {
//     const { Invoice_Id } = req.params;

//     if (!Invoice_Id) {
//       return res.status(400).send("Invoice Id is required");
//     }

//     connection = await db.getConnection();

//     let invoiceDetails = null;
//     let orderItems = [];
//     let orderType = null;

//     /* --------------------------------------------------
//        1️⃣ CHECK DINE-IN INVOICE
//     -------------------------------------------------- */
//     const [[dineInvoice]] = await connection.query(
//       `SELECT * FROM invoices WHERE Invoice_Id = ? LIMIT 1`,
//       [Invoice_Id]
//     );

//     if (dineInvoice) {
//       orderType = "dinein";
//       invoiceDetails = dineInvoice;

//       const [items] = await connection.query(
//         `
//         SELECT 
//           oi.Quantity AS Item_Quantity,
//           oi.Amount,
//           fi.Item_Name
//         FROM order_items oi
//         JOIN add_food_item fi ON fi.Item_Id = oi.Item_Id
//         WHERE oi.Order_Id = ?
//         `,
//         [dineInvoice.Order_Id]
//       );

//       orderItems = items;
//     }

//     /* --------------------------------------------------
//        2️⃣ CHECK TAKEAWAY INVOICE (IF NOT DINE-IN)
//     -------------------------------------------------- */
//     if (!invoiceDetails) {
//       const [[takeawayInvoice]] = await connection.query(
//         `SELECT * FROM takeaway_invoices WHERE Invoice_Id = ? LIMIT 1`,
//         [Invoice_Id]
//       );

//       if (takeawayInvoice) {
//         orderType = "takeaway";
//         invoiceDetails = takeawayInvoice;

//         const [items] = await connection.query(
//           `
//           SELECT 
//             oti.Quantity AS Item_Quantity,
//             oti.Amount,
//             fi.Item_Name
//           FROM order_takeaway_items oti
//           JOIN add_food_item fi ON fi.Item_Id = oti.Item_Id
//           WHERE oti.Takeaway_Order_Id = ?
//           `,
//           [takeawayInvoice.Takeaway_Order_Id]
//         );

//         orderItems = items;
//       }
//     }

//     /* --------------------------------------------------
//        3️⃣ IF NO INVOICE FOUND
//     -------------------------------------------------- */
//     if (!invoiceDetails) {
//       return res.status(404).send("Invoice not found");
//     }

//     /* --------------------------------------------------
//        4️⃣ DATE / TIME / TOTAL
//     -------------------------------------------------- */
//     const total = Number(
//       invoiceDetails.Amount ||
//       invoiceDetails.Final_Amount ||
//       0
//     );

//     const invoiceDate = new Date(invoiceDetails.Invoice_Date);

//     const getCurrentDate = () =>
//       invoiceDate.toLocaleDateString("en-GB");

//     const getCurrentTime = () =>
//       invoiceDate.toLocaleTimeString("en-US", {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       });

//     /* --------------------------------------------------
//        5️⃣ BUILD HTML
//     -------------------------------------------------- */
// const html = ` 
// <!DOCTYPE html>
// <html>
//   <head>
//     <title>Invoice - ${Invoice_Id}</title>
//     <meta charset="UTF-8">
    
//     <style>
//       * {
//         margin: 0;
//         padding: 0;
//         box-sizing: border-box;
//       }
      
//       body { 
//         font-family: 'Courier New', Courier, monospace;
//         font-size: 11px;
//         line-height: 1.3;
//         color: #000;
//         width: 2.5in;
//         margin: 0 auto;
//         padding: 0;
//       }
      
//       .invoice {
//         width: 2.5in;
//         padding: 8px;
//       }

//       .header-center { 
//         text-align: center; 
//         margin-bottom: 8px;
//         border-bottom: 1px dashed #000;
//         padding-bottom: 8px;
//       }
      
         
//           .logo { 
//             width: 60px; 
//             height: auto; 
//             margin-bottom: 4px;
//             padding: 5px;
//             background-color: black;
//           }
//       .brand { 
//         font-size: 16px; 
//         font-weight: bold; 
//         text-transform: uppercase;
//         letter-spacing: 1px;
//         margin-bottom: 2px;
//       }
      
//       .line { 
//         border-top: 1px dashed #000; 
//         margin: 6px 0;
//       }
      
//       .line-solid {
//         border-top: 1px solid #000;
//         margin: 6px 0;
//       }

//       .info-row {
//         display: flex;
//         justify-content: space-between;
//         margin: 2px 0;
//         font-size: 10px;
//       }
      
//       .info-label {
//         font-weight: bold;
//       }

//       .items-header {
//         display: flex;
//         justify-content: space-between;
//         font-weight: bold;
//         border-bottom: 1px solid #000;
//         padding: 4px 0;
//         font-size: 10px;
//       }
      
//       .item-row {
//         display: flex;
//         justify-content: space-between;
//         padding: 3px 0;
//         border-bottom: 1px dashed #ddd;
//         font-size: 10px;
//       }
      
//       .item-name {
//         flex: 1;
//         padding-right: 8px;
//         word-wrap: break-word;
//       }
      
//       .item-qty {
//         width: 30px;
//         text-align: center;
//       }
      
//       .item-amount {
//         width: 55px;
//         text-align: right;
//         font-weight: bold;
//       }

//       .summary {
//         margin-top: 8px;
//         font-size: 11px;
//       }
      
//       .summary-row {
//         display: flex;
//         justify-content: space-between;
//         padding: 3px 0;
//       }
      
//       .summary-row.total {
//         font-size: 13px;
//         font-weight: bold;
//         border-top: 1px solid #000;
//         border-bottom: 2px solid #000;
//         margin-top: 4px;
//         padding: 5px 0;
//       }

//       .footer {
//         text-align: center;
//         margin-top: 10px;
//         padding-top: 8px;
//         border-top: 1px dashed #000;
//         font-size: 10px;
//       }
      
//       .footer-title {
//         font-weight: bold;
//         margin-bottom: 4px;
//         font-size: 11px;
//       }

//       @media print {
//         body {
//           width: 2.5in;
//           margin: 0;
//           padding: 0;
//         }
        
//         .invoice {
//           width: 2.5in;
//           padding: 8px;
//         }
        
//         @page {
//           size: 2.5in auto;
//           margin: 0;
//         }
//       }
//     </style>
//   </head>
//   <body>
//     <div class="invoice">

//       <!-- HEADER -->
//       <div class="header-center">
//         <img src="/public/images/restaurant-logo.png" class="logo" alt="Logo" />
//         <div class="brand">HELLO GUYS</div>
//       </div>

//       <!-- CUSTOMER INFO -->
//       <div class="info-row">
//         <span><span class="info-label">Customer:</span> ${invoiceDetails.Customer_Name || "Walk-in"}</span>
//       </div>

//       ${invoiceDetails.Customer_Phone ? `
//       <div class="info-row">
//         <span><span class="info-label">Phone:</span> ${invoiceDetails.Customer_Phone}</span>
//       </div>
//       ` : ""}

//       <div class="line"></div>

//       <!-- DATE / TIME / INVOICE -->
//       <div class="info-row">
//         <span><span class="info-label">Date:</span> ${getCurrentDate()}</span>
//         <span><span class="info-label">Time:</span> ${getCurrentTime()}</span>
//       </div>
//       <div class="info-row">
//         <span><span class="info-label">Invoice:</span> ${Invoice_Id}</span>
//       </div>

//       <div class="line-solid"></div>

//       <!-- ITEMS HEADER -->
//       <div class="items-header">
//         <div style="width:30px;">#</div>
//         <div class="item-name">ITEM</div>
//         <div class="item-qty">QTY</div>
//         <div class="item-amount">AMOUNT</div>
//       </div>

//       <!-- ITEMS -->
//       ${
//         orderItems.map((it, i) => `
//           <div class="item-row">
//             <div style="width:30px;">${i + 1}</div>
//             <div class="item-name">${it.Item_Name}</div>
//             <div class="item-qty">${it.Item_Quantity}</div>
//             <div class="item-amount">₹${Number(it.Amount).toFixed(2)}</div>
//           </div>
//         `).join("")
//       }

//       <div class="line-solid"></div>

//       <!-- SUMMARY -->
//       <div class="summary">
//         <div class="summary-row total">
//           <span>TOTAL</span>
//           <span>₹${total.toFixed(2)}</span>
//         </div>
//       </div>

//       <!-- FOOTER -->
//       <div class="footer">
//         <div class="footer-title">THANK YOU!</div>
//         <div>Please Visit Again</div>
//       </div>

//     </div>

//    <!-- DOWNLOAD BUTTON -->
   




//   </body>
// </html>
// `;

//     res.setHeader("Content-Type", "text/html; charset=UTF-8");
//     res.setHeader("Cache-Control", "no-store");

//     return res.status(200).send(html);

//   } catch (err) {
//     console.error("❌ Invoice HTML error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
// const getPublicInvoiceHtml = async (req, res, next) => {
//   let connection;

//   try {
//     const { Invoice_Id } = req.params;

//     if (!Invoice_Id) {
//       return res.status(400).json({
//         success: false,
//         message: "Invoice Id is required",
//       });
//     }

//     connection = await db.getConnection();

//     let invoiceDetails = null;
//     let orderItems = [];
//     let orderType = null;
//     let orderTypeLabel = null; // ✅ NEW

//     /* ---------------- 1️⃣ DINE-IN INVOICE ---------------- */
//     const [[dineInvoice]] = await connection.query(
//       `SELECT * FROM invoices WHERE Invoice_Id = ? LIMIT 1`,
//       [Invoice_Id]
//     );

//     if (dineInvoice) {
//       orderType = "dinein";
//       orderTypeLabel = "DINE-IN"; // ✅ ADD
//       invoiceDetails = dineInvoice;

//       const [items] = await connection.query(
//         `
//         SELECT 
//           fi.Item_Name,
//           oi.Quantity AS Item_Quantity,
//           oi.Amount,
//           oi.Service_Charge,
//           oi.Discount,
//           oi.Discount_Type
//         FROM order_items oi
//         JOIN add_food_item fi ON fi.Item_Id = oi.Item_Id
//         WHERE oi.Order_Id = ?
//         `,
//         [dineInvoice.Order_Id]
//       );

//       orderItems = items;
//     }

//     /* ---------------- 2️⃣ TAKEAWAY INVOICE ---------------- */
//     if (!invoiceDetails) {
//       const [[takeawayInvoice]] = await connection.query(
//         `SELECT * FROM takeaway_invoices WHERE Invoice_Id = ? LIMIT 1`,
//         [Invoice_Id]
//       );

//       if (takeawayInvoice) {
//         orderType = "takeaway";
//         orderTypeLabel = "TAKEAWAY"; // ✅ ADD
//         invoiceDetails = takeawayInvoice;

//         const [items] = await connection.query(
//           `
//           SELECT 
//             fi.Item_Name,
//             oti.Quantity AS Item_Quantity,
//             oti.Amount,
//             oti.Service_Charge,
//             oti.Discount,
//             oti.Discount_Type
//           FROM order_takeaway_items oti
//           JOIN add_food_item fi ON fi.Item_Id = oti.Item_Id
//           WHERE oti.Takeaway_Order_Id = ?
//           `,
//           [takeawayInvoice.Takeaway_Order_Id]
//         );

//         orderItems = items;
//       }
//     }

//     /* ---------------- 3️⃣ NOT FOUND ---------------- */
//     if (!invoiceDetails) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found",
//       });
//     }
// const totalAmount =
//   Number(invoiceDetails.Amount) ||
//   Number(invoiceDetails.Final_Amount) ||
//   0;

// const serviceCharge = Number(invoiceDetails.Service_Charge || 0);
// const discount = Number(invoiceDetails.Discount || 0);

// // ✅ Backward calculation
// const subTotal = totalAmount - serviceCharge + discount;
//     /* ---------------- 4️⃣ RESPONSE ---------------- */
//     return res.status(200).json({
//       success: true,
//       orderType,          // "dinein" | "takeaway"
//       orderTypeLabel,     // "DINE-IN" | "TAKEAWAY" ✅
//       invoice: {

//         Invoice_Id: invoiceDetails.Invoice_Id,
//         Customer_Name: invoiceDetails.Customer_Name,
//         Customer_Phone: invoiceDetails.Customer_Phone,
//         Invoice_Date: invoiceDetails.Invoice_Date,
//         Discount: invoiceDetails.Discount,
//         Discount_Type: invoiceDetails.Discount_Type,
//         Service_Charge: invoiceDetails.Service_Charge,
//          Sub_Total: Number(subTotal.toFixed(2)),  
//         Total:
//           Number(invoiceDetails.Amount) ||
//           Number(invoiceDetails.Final_Amount) ||
//           0,
//       },
//       items: orderItems,
//     });

//   } catch (err) {
//     console.error("❌ Invoice fetch error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

// const getPublicInvoiceHtml = async (req, res, next) => {
//   let connection;

//   try {
//     const { Invoice_Id } = req.params;

//     if (!Invoice_Id) {
//       return res.status(400).json({
//         success: false,
//         message: "Invoice Id is required",
//       });
//     }

//     connection = await db.getConnection();

//     let invoiceDetails = null;
//     let orderItems = [];
//     let orderType = null;
//     let orderTypeLabel = null;

//     /* =====================================================
//        1️⃣ DINE-IN INVOICE
//     ===================================================== */
//     const [[dineInvoice]] = await connection.query(
//       `SELECT * FROM invoices WHERE Invoice_Id = ? LIMIT 1`,
//       [Invoice_Id]
//     );

//     if (dineInvoice) {
//       orderType = "dinein";
//       orderTypeLabel = "DINE-IN";
//       invoiceDetails = dineInvoice;

//       const [items] = await connection.query(
//         `
//         SELECT 
//           fi.Item_Name,
//           oi.Quantity AS Item_Quantity,
//           oi.Amount
//         FROM order_items oi
//         JOIN add_food_item fi ON fi.Item_Id = oi.Item_Id
//         WHERE oi.Order_Id = ?
//         `,
//         [dineInvoice.Order_Id]
//       );

//       orderItems = items;
//     }

//     /* =====================================================
//        2️⃣ TAKEAWAY INVOICE
//     ===================================================== */
//     if (!invoiceDetails) {
//       const [[takeawayInvoice]] = await connection.query(
//         `SELECT * FROM takeaway_invoices WHERE Invoice_Id = ? LIMIT 1`,
//         [Invoice_Id]
//       );

//       if (takeawayInvoice) {
//         orderType = "takeaway";
//         orderTypeLabel = "TAKEAWAY";
//         invoiceDetails = takeawayInvoice;

//         const [items] = await connection.query(
//           `
//           SELECT 
//             fi.Item_Name,
//             oti.Quantity AS Item_Quantity,
//             oti.Amount
//           FROM order_takeaway_items oti
//           JOIN add_food_item fi ON fi.Item_Id = oti.Item_Id
//           WHERE oti.Takeaway_Order_Id = ?
//           `,
//           [takeawayInvoice.Takeaway_Order_Id]
//         );

//         orderItems = items;
//       }
//     }

//     /* =====================================================
//        3️⃣ NOT FOUND
//     ===================================================== */
//     if (!invoiceDetails) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found",
//       });
//     }

//     /* =====================================================
//        4️⃣ AMOUNT + DISCOUNT CALCULATION (✔ CORRECT)
//     ===================================================== */
//     const finalAmount = Number(
//       invoiceDetails.Amount ?? invoiceDetails.Final_Amount ?? 0
//     );

//     const serviceCharge = Number(invoiceDetails.Service_Charge ?? 0);
//     const discountInput = Number(invoiceDetails.Discount ?? 0);
//     const discountType = invoiceDetails.Discount_Type; // "percentage" | "amount"

//     let subTotal = 0;
//     let discountValue = 0;

//     // 🧠 CASE 1: PERCENTAGE DISCOUNT
//     if (discountType === "percentage" && discountInput > 0) {
//       const discountRate = discountInput / 100;

//       // Reverse percentage discount
//       subTotal = (finalAmount - serviceCharge) / (1 - discountRate);
//       discountValue = subTotal * discountRate;
//     }

//     // 🧠 CASE 2: FLAT AMOUNT DISCOUNT
//     else if (discountType === "amount" && discountInput > 0) {
//       discountValue = discountInput;
//       subTotal = finalAmount - serviceCharge + discountValue;
//     }

//     // 🧠 CASE 3: NO DISCOUNT
//     else {
//       subTotal = finalAmount - serviceCharge;
//       discountValue = 0;
//     }

//     subTotal = Math.max(subTotal, 0);

//     /* =====================================================
//        5️⃣ RESPONSE
//     ===================================================== */
//     return res.status(200).json({
//       success: true,
//       orderType,
//       orderTypeLabel,
//       invoice: {
//         Invoice_Id: invoiceDetails.Invoice_Id,
//         Customer_Name: invoiceDetails.Customer_Name,
//         Customer_Phone: invoiceDetails.Customer_Phone,
//         Invoice_Date: invoiceDetails.Invoice_Date,

//         Sub_Total: Number(subTotal.toFixed(2)),
//         Discount: Number(discountValue.toFixed(2)),
//         Discount_Type: discountType,
//         Service_Charge: Number(serviceCharge.toFixed(2)),
//         Total: Number(finalAmount.toFixed(2)),
//       },
//       items: orderItems,
//     });

//   } catch (err) {
//     console.error("❌ Invoice fetch error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

 const generateSms = async (req, res, next) => {
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
      Final_Amount,
    } = req.body;
const normalizedCustomerName =
  Customer_Name && Customer_Name.trim() !== ""
    ? Customer_Name.trim()
    : null;

    if (!Order_Id || !Customer_Phone || !Final_Amount) {
      return res.status(400).json({
        success: false,
        message: "Required details missing",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();
    /* ---------------- FETCH WAITER ---------------- */
const [[orderRow]] = await connection.query(
  `SELECT User_Id FROM orders WHERE Order_Id = ? LIMIT 1`,
  [Order_Id]
);

const Waiter_Id = orderRow?.User_Id || null;


    /* ---------------- KOT ---------------- */
    const [[kotRow]] = await connection.query(
      `SELECT KOT_Id FROM kitchen_orders WHERE Order_Id = ? LIMIT 1`,
      [Order_Id]
    );
    const KOT_Id = kotRow?.KOT_Id || null;

    /* ---------------- CUSTOMER (AUTO CREATE) ---------------- */
    let customerId;

    const [[existingCustomer]] = await connection.query(
      `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
      [Customer_Phone]
    );

    if (existingCustomer) {
      customerId = existingCustomer.Customer_Id;
    } else {
      // const Customer_Id = await generateNextId(
      //   connection,
      //   "CUST",
      //   "Customer_Id",
      //   "customers"
      // );

      // await connection.query(
      //   `INSERT INTO customers
      //    (Customer_Id, Customer_Name, Customer_Phone, created_at)
      //    VALUES (?, ?, ?, NOW())`,
      //   [
      //     Customer_Id,
      //     normalizedCustomerName, // ✅ NULL if not provided
      //     Customer_Phone,
      //   ]
      // );
       const [custRes] = await connection.execute(
          `INSERT INTO customers (Customer_Name, Customer_Phone)
           VALUES (?, ?)`,
          [Customer_Name?.trim() || null, Customer_Phone]
        );

        const id = custRes.insertId;
        const Customer_Id = "CUST" + id.toString().padStart(5, "0");

        // ✅ UPDATE WITH FORMATTED ID
        await connection.execute(
          `UPDATE customers SET Customer_Id = ? WHERE id = ?`,
          [Customer_Id, id]
        );

      customerId = Customer_Id;
    }

    /* ---------------- FINANCIAL YEAR ---------------- */
    const [[fy]] = await connection.query(
      `SELECT Financial_Year 
       FROM financial_year 
       WHERE Current_Financial_Year = 1 
       LIMIT 1`
    );

    if (!fy) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "No active financial year found",
      });
    }

    /* ---------------- INVOICE ---------------- */
    // const Invoice_Id = await generateNextId(
    //   connection,
    //   "INV",
    //   "Invoice_Id",
    //   "invoices"
    // );

    const[invoiceResult]=await connection.query(
      `INSERT INTO invoices
       ( Order_Id, Invoice_Date, Financial_Year,
        Customer_Name, Customer_Phone, Customer_Id,
        Discount_Type, Discount, Service_Charge, Amount, Payment_Type)
       VALUES ( ?, NOW(), ?, ?,
        ?, ?, ?, ?, 
        ?, ?, ?)`,
      [
        
        Order_Id,
        fy.Financial_Year,
        Customer_Name?.trim() || null,
        Customer_Phone,
        customerId,
        Discount_Type || "percentage",
        Discount || 0,
        Service_Charge || 0,
        Final_Amount,
        Payment_Type || "cash",
      ]

    );
  const InvoiceIdNum = invoiceResult.insertId;
  const Invoice_Id = "INV" + InvoiceIdNum.toString().padStart(5, "0");

    await connection.query(
      `UPDATE invoices SET Invoice_Id = ? WHERE id = ?`,
      [Invoice_Id, InvoiceIdNum]
    );
    /* ---------------- PUBLIC LINK ---------------- */
    // const Invoice_Public_Link_Id = await generateNextId(
    //   connection,
    //   "IPLK",
    //   "Invoice_Public_Link_Id",
    //   "invoice_public_links"
    // );

    const Public_Token = crypto.randomBytes(24).toString("hex");

    const[publicLinkResult] = await connection.query(
      `INSERT INTO invoice_public_links
       ( Invoice_Id, Order_Id, Customer_Id, Public_Token)
       VALUES ( ?, ?, ?, ?)`,
      [
        
        Invoice_Id,
        Order_Id,
        customerId,
        Public_Token,
      ]
    );
    const InvoicePublicLinkNum= publicLinkResult.insertId;
    const Invoice_Public_Link_Id = "IPLK" + InvoicePublicLinkNum.toString().padStart(5, "0");

    await connection.query(
      `UPDATE invoice_public_links SET Invoice_Public_Link_Id = ? WHERE id = ?`,
      [Invoice_Public_Link_Id, InvoicePublicLinkNum]
    );

    /* ---------------- ORDER & TABLES ---------------- */
    await connection.query(
      `UPDATE orders 
       SET Payment_Status='completed', Status='paid' 
       WHERE Order_Id=?`,
      [Order_Id]
    );

    const [tableIds] = await connection.query(
      `SELECT Table_Id FROM order_tables WHERE Order_Id = ?`,
      [Order_Id]
    );

    if (tableIds.length) {
      await connection.query(
        `UPDATE add_table 
         SET Status='available', Start_Time=NULL, End_Time=NOW()
         WHERE Table_Id IN (?)`,
        [tableIds.map((t) => t.Table_Id)]
      );
    }

    /* ---------------- KITCHEN ---------------- */
    if (KOT_Id) {
      await connection.query(
        `UPDATE kitchen_orders 
         SET Status='ready', updated_at=NOW() 
         WHERE KOT_Id=?`,
        [KOT_Id]
      );

      await connection.query(
        `UPDATE kitchen_order_items 
         SET Item_Status='ready' 
         WHERE KOT_Id=?`,
        [KOT_Id]
      );

      io.emit("kitchen_order_removed", { KOT_Id });
    }

    /* ---------------- COMMIT TRANSACTION ---------------- */
    await connection.commit();
    /* ---------------- 🔥 SOCKET NOTIFICATIONS ---------------- */

// 🧑‍🍳 Notify WAITER that order is closed
if (Waiter_Id) {
  io.to(`waiter_${Waiter_Id}`).emit("waiter_order_closed", {
    Order_Id,
    Invoice_Id,
    message: "Order billed & closed",
  });
}


    /* ---------------- SMS (POST COMMIT) ---------------- */
   const totalAmount = Number(Final_Amount).toFixed(2);
    const billNumber = Invoice_Id;
    const invoiceLink = `http://localhost:5173/${billNumber}`;
// const invoiceLink = `https://ancoinnovation.com/b/${billNumber}`
//   const invoiceLink = `http://localhost:5173/${billNumber}`
// //  const invoiceLink = `${"http://localhost:5173"}/${billNumber}`
// // const invoiceLink = `http://localhost:4000/api/staff/order/${billNumber}`;
// // const invoiceLink = `${"http://localhost:5173"}/invoice/view/${billNumber}`;
// // const invoiceLink = `https://ancoinnovation.com/restaurant-mangement-system/invoice/view/${Public_Token}`
// // const smsMessage = `Hi, Your bill from Hello Guys Shakuntala Park : Total Rs.${totalAmount} (incl. Tax). Bill No. ${billNumber}. View full details: ${invoiceLink} CLPLSE.`;
// //const smsMessage = `Hi, Your bill from Hello Guys Shakuntala Park : Total Rs.${totalAmount} (incl. Tax). Bill No. ${billNumber} View full details: ${invoiceLink}. HloGuy`;
    // ⚠ EXACT DLT TEMPLATE MATCH
    const smsMessage = `Hi, Your bill from Hello Guys Shakuntala Park : Total Rs.${totalAmount} (incl. Tax). Bill No. ${billNumber} View full details: ${invoiceLink}. HloGuy`;

    const smsSent = await sendSMS(Customer_Phone, smsMessage);

    return res.status(200).json({
      success: true,
      message: smsSent
        ? "Invoice generated & SMS sent successfully"
        : "Invoice generated but SMS failed",
      Invoice_Id,
      smsSent,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error generating invoice & SMS:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


// const getPublicInvoiceHtml = async (req, res, next) => {
//   let connection;

//   try {
//     const { Invoice_Id } = req.params;

//     if (!Invoice_Id) {
//       return res.status(400).json({
//         success: false,
//         message: "Invoice Id is required",
//       });
//     }

//     connection = await db.getConnection();

//     let invoiceDetails = null;
//     let orderItems = [];
//     let orderType = null;
//     let orderTypeLabel = null;

//     /* ================= DINE-IN ================= */
//     const [[dineInvoice]] = await connection.query(
//       `SELECT * FROM invoices WHERE Invoice_Id = ? LIMIT 1`,
//       [Invoice_Id]
//     );

//     if (dineInvoice) {
//       orderType = "dinein";
//       orderTypeLabel = "DINE-IN";
//       invoiceDetails = dineInvoice;

//       const [items] = await connection.query(
//         `
//         SELECT fi.Item_Name, oi.Quantity AS Item_Quantity, oi.Amount
//         FROM order_items oi
//         JOIN add_food_item fi ON fi.Item_Id = oi.Item_Id
//         WHERE oi.Order_Id = ?
//         `,
//         [dineInvoice.Order_Id]
//       );

//       orderItems = items;
//     }

//     /* ================= TAKEAWAY ================= */
//     if (!invoiceDetails) {
//       const [[takeawayInvoice]] = await connection.query(
//         `SELECT * FROM takeaway_invoices WHERE Invoice_Id = ? LIMIT 1`,
//         [Invoice_Id]
//       );

//       if (takeawayInvoice) {
//         orderType = "takeaway";
//         orderTypeLabel = "TAKEAWAY";
//         invoiceDetails = takeawayInvoice;

//         const [items] = await connection.query(
//           `
//           SELECT fi.Item_Name, oti.Quantity AS Item_Quantity, oti.Amount
//           FROM order_takeaway_items oti
//           JOIN add_food_item fi ON fi.Item_Id = oti.Item_Id
//           WHERE oti.Takeaway_Order_Id = ?
//           `,
//           [takeawayInvoice.Takeaway_Order_Id]
//         );

//         orderItems = items;
//       }
//     }

//     if (!invoiceDetails) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found",
//       });
//     }

//     /* ================= CALCULATION ================= */

//     const subTotal = orderItems.reduce(
//       (sum, item) => sum + Number(item.Amount || 0),
//       0
//     );

//     const serviceCharge = Number(invoiceDetails.Service_Charge || 0);
//     const discountInput = Number(invoiceDetails.Discount || 0); // 👈 staff input
//     const discountType = invoiceDetails.Discount_Type;

//     let discountValue = 0;

//     if (discountType === "percentage" && discountInput > 0) {
//       discountValue = subTotal * (discountInput / 100);
//     } else if (discountType === "amount" && discountInput > 0) {
//       discountValue = discountInput;
//     }

//     discountValue = Math.min(discountValue, subTotal);

//     const finalTotal =
//       subTotal - discountValue + serviceCharge;

//     /* ================= RESPONSE ================= */
//     return res.status(200).json({
//       success: true,
//       orderType,
//       orderTypeLabel,
//       invoice: {
//         Invoice_Id: invoiceDetails.Invoice_Id,
//         Customer_Name: invoiceDetails.Customer_Name,
//         Customer_Phone: invoiceDetails.Customer_Phone,
//         Invoice_Date: invoiceDetails.Invoice_Date,

//         Sub_Total: Number(subTotal.toFixed(2)),

//         // 👇 EXACT UI INPUT
//         Discount: discountInput,
//         Discount_Type: discountType,

//         // 👇 ACTUAL MONEY DEDUCTED
//         Discount_Value: Number(discountValue.toFixed(2)),

//         Service_Charge: Number(serviceCharge.toFixed(2)),
//         Total: Number(finalTotal.toFixed(2)),
//       },
//       items: orderItems,
//     });

//   } catch (err) {
//     console.error("❌ Invoice fetch error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };


// const generateSmsForTakeaway=async (req, res, next) => {
//    let connection;

//   try {
  
//     const {
//       //  items,
//       // Customer_Name,
//       // Customer_Phone,
//       // Discount_Type,
//       // Discount,
     
//       // Payment_Type,
//       // Final_Amount,
//            userId,
//       items,
//       Sub_Total,
//       Amount,
//       Customer_Name,
//       Customer_Phone,
//       Discount_Type,
//       Discount,
//       Payment_Type,
//        Final_Amount
//     } = req.body;

//     const normalizedCustomerName =Customer_Name && Customer_Name.trim() !== ""
//     ? Customer_Name.trim()
//     : null;
//     // --------------------------------------------
//     // VALIDATION
//     // --------------------------------------------
//     if (!userId)
//       return res.status(400).json({ success: false, message: "User ID is required." });
//      if( !Customer_Phone){
//                 return res.status(400).json({
//                     success: false,
//                     message: "Customer phone number is required.",
//                 })
//             }
//         if (!items?.length)
//           return res.status(400).json({ success: false, message: "At least one item is required." });
    
//         // if (Sub_Total == null || Final_Amount == null)
//         //   return res.status(400).json({
//         //     success: false,
//         //     message: "Sub Total and Final Amount are required."
//         //   });
    
//         connection = await db.getConnection();
//         await connection.beginTransaction();
//     let Customer_Id;
    
//         const [existingCustomer] = await connection.query(
//           `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
//           [Customer_Phone]
//         );
    
//         if (existingCustomer.length > 0) {
//           // ✔ REUSE EXISTING CUSTOMER
//           Customer_Id = existingCustomer[0].Customer_Id;
//         } 
//         else {
//           //  CREATE NEW CUSTOMER
//           Customer_Id = await generateNextId(
//             connection,
//             "CUST",
//             "Customer_Id",
//             "customers"
//           );
    
//           await connection.query(
//             `INSERT INTO customers (Customer_Id, Customer_Name, Customer_Phone)
//              VALUES (?, ?, ?)`,
//             [Customer_Id, normalizedCustomerName , Customer_Phone]
//           );
//         }
           
//         // --------------------------------------------
//         // 1️⃣ Generate Takeaway Order ID
//         // --------------------------------------------
//         const Takeaway_Order_Id = await generateNextId(
//           connection,
//           "TKODR",
//           "Takeaway_Order_Id",
//           "orders_takeaway"
//         );
    
//         // --------------------------------------------
//         // 2️⃣ Insert Into orders_takeaway
//         // --------------------------------------------
//         await connection.query(
//           `INSERT INTO orders_takeaway 
//            (Takeaway_Order_Id, User_Id,Customer_Id, Status, Sub_Total, Amount, Payment_Status)
//            VALUES (?, ?, ?,'completed', ?, ?, 'completed')`,
//           [Takeaway_Order_Id, userId,Customer_Id, Sub_Total, Final_Amount]
//         );
    
//         // --------------------------------------------
//         // 3️⃣ Generate KOT ID & Create Kitchen Order
//         // --------------------------------------------
//         const KOT_Id = await generateNextId(connection, "KOT", "KOT_Id", "kitchen_orders");
    
//         await connection.query(
//           `INSERT INTO kitchen_orders (KOT_Id, Order_Id, Status)
//            VALUES (?, ?, 'ready')`,
//           [KOT_Id, Takeaway_Order_Id]
//         );
    
//         // --------------------------------------------
//         // 4️⃣ Insert Items (Order + Kitchen)
//         // --------------------------------------------
//         for (let item of items) {
    
//           if (!item.Item_Quantity || item.Item_Quantity <= 0){
//             await connection.rollback();
//             return res.status(400).json({
//               success: false,
//               message: `Invalid quantity for item: ${item.Item_Name}`
//             });
//           }
//           // Fetch Item_Id
//           const [ItemRow] = await connection.query(
//             "SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1",
//             [item.Item_Name]
//           );
    
//           if (!ItemRow.length){
//                  await connection.rollback();
//         return res.status(404).json({ success: false, message: "Item not found." });
//           }
        
    
//           const Item_Id = ItemRow[0].Item_Id;
    
//           // Insert into order_takeaway_items
//           const Order_Item_Id = await generateNextId(
//             connection,
//             "TKODRITM",
//             "Takeaway_Order_Item_Id",
//             "order_takeaway_items"
//           );
    
//           await connection.query(
//             `INSERT INTO order_takeaway_items 
//              (Takeaway_Order_Item_Id, Takeaway_Order_Id, Item_Id, Quantity, Price, Amount)
//              VALUES (?, ?, ?, ?, ?, ?)`,
//             [
//               Order_Item_Id,
//               Takeaway_Order_Id,
//               Item_Id,
//               item.Item_Quantity,
//               item.Item_Price,
//               item.Amount
//             ]
//           );
    
//           // --------------------------------------------
//           // 🍽 INSERT INTO KITCHEN ORDER ITEMS
        
//           // --------------------------------------------
//           // for (let q = 0; q < item.Item_Quantity; q++) {
//             const KOT_Item_Id = await generateNextId(
//               connection,
//               "KOTITM",
//               "KOT_Item_Id",
//               "kitchen_order_items"
//             );
    
//             await connection.query(
//               `INSERT INTO kitchen_order_items 
//                (KOT_Item_Id, KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
//                VALUES (?, ?, ?, ?, ?, 'ready')`,
//               [
//                 KOT_Item_Id,
//                 KOT_Id,
//                 Item_Id,
//                 item.Item_Name,
//                 item.Item_Quantity
//               ]
//             );
          
//         }
    
//         // --------------------------------------------
//         // 5️⃣ Generate Invoice
//         // --------------------------------------------
//         const Invoice_Id = await generateNextId(
//           connection,
//           "TKINV",
//           "Invoice_Id",
//           "takeaway_invoices"
//         );
    
//         const [fy] = await connection.query(
//           `SELECT Financial_Year 
//            FROM financial_year 
//            WHERE Current_Financial_Year = 1
//            LIMIT 1`
//         );
//     if (!fy.length) {
//       await connection.rollback();
//       return res.status(400).json({
//         message: "No active financial year found."
//       });
//     }
    
        
    
//         const activeFY = fy[0].Financial_Year;
    
//         await connection.query(
//           `INSERT INTO takeaway_invoices
//            (Invoice_Id, Takeaway_Order_Id, Invoice_Date, Financial_Year, Amount,
//             Customer_Name, Customer_Phone,Customer_Id, Discount_Type, Discount, Payment_Type)
//            VALUES (?, ?, NOW(), ?, ?, ?,?, ?, ?, ?, ?)`,
//           [
//             Invoice_Id,
//             Takeaway_Order_Id,
//             activeFY,
//             Final_Amount,
//             normalizedCustomerName,
//             Customer_Phone || null,
//             Customer_Id,
//             Discount_Type ?? "percentage",
//             Discount || 0,
//             Payment_Type ?? "cash"
//           ]
//         );
    
    
//         const [kotItems] = await connection.query(
//           `
//           SELECT
//             koi.KOT_Item_Id,
//             koi.Item_Id,
//             koi.Item_Name,
//             koi.Quantity,
//             koi.Item_Status,
//             fi.Item_Category
//           FROM kitchen_order_items koi
//           JOIN add_food_item fi ON fi.Item_Id = koi.Item_Id
//           WHERE koi.KOT_Id = ?
//           `,
//           [KOT_Id]
//         );
    
      
//         const itemsByCategory = {};
    
//     kotItems.forEach(item => {
//       if (!itemsByCategory[item.Item_Category]) {
//         itemsByCategory[item.Item_Category] = [];
//       }
//       itemsByCategory[item.Item_Category].push({
//         KOT_Item_Id: item.KOT_Item_Id,
//         Item_Id: item.Item_Id,
//         Item_Name: item.Item_Name,
//         Quantity: item.Quantity,
//         Item_Status: item.Item_Status,
//       });
//     });
    
//     Object.entries(itemsByCategory).forEach(([category, items]) => {
//       io.to(`category_${category}`).emit("new_kitchen_order", {
//         KOT_Id,
//         Order_Id: Takeaway_Order_Id,
//         Order_Type: "takeaway",
//         Status: "ready",
//         items,
//       });
//     });
   
//    /* ---------------- PUBLIC LINK ---------------- */
// const Invoice_Public_Link_Id = await generateNextId(
//   connection,
//   "IPLK",
//   "Invoice_Public_Link_Id",
//   "invoice_public_links"
// );

// const Public_Token = crypto.randomBytes(24).toString("hex");

// await connection.query(
//   `INSERT INTO invoice_public_links
//    (Invoice_Public_Link_Id, Invoice_Id, Order_Id, Customer_Id, Public_Token)
//    VALUES (?, ?, ?, ?, ?)`,
//   [
//     Invoice_Public_Link_Id,
//     Invoice_Id,
//     Takeaway_Order_Id,   // ✅ correct
//     Customer_Id,         // ✅ correct
//     Public_Token,
//   ]
// );
// await connection.commit();
//     /* ---------------- ORDER & KITCHEN ---------------- */
 


//     /* ---------------- SMS ---------------- */
 
// const totalAmount = Number(Final_Amount).toFixed(2);
// const billNumber = Invoice_Id; // or invoice display number
// // const invoiceLink = `https://ancoinnovation.com/b/${billNumber}`
//   const invoiceLink = `http://localhost:5173/${billNumber}`
// //  const invoiceLink = `${"http://localhost:5173"}/${billNumber}`
// // const invoiceLink = `http://localhost:4000/api/staff/order/${billNumber}`;
// // const invoiceLink = `${"http://localhost:5173"}/invoice/view/${billNumber}`;
// // const invoiceLink = `https://ancoinnovation.com/restaurant-mangement-system/invoice/view/${Public_Token}`;

// // Hi, Your bill from Hello Guys Shakuntala Park : Total Rs.{#var#} (incl. Tax). Bill No. {#var#}. View full details: {#var#} CLPLSE.

// // const smsMessage = `Hi, Your bill from Hello Guys Shakuntala Park : Total Rs.${totalAmount} (incl. Tax). Bill No. ${billNumber}. View full details: ${invoiceLink} CLPLSE.`;
// //const smsMessage = `Hi, Your bill from Hello Guys Shakuntala Park : Total Rs.${totalAmount} (incl. Tax). Bill No. ${billNumber} View full details: ${invoiceLink}. HloGuy`;
// const smsMessage =`Hi, Your bill from Hello Guys Shakuntala Park : Total Rs.${totalAmount} (incl. Tax). Bill No. ${billNumber} View full details: ${invoiceLink}. HloGuy`;

//     const smsSent = await sendSMS(Customer_Phone, smsMessage);

// // ❌ If SMS rejected → rollback
// // if (!smsSent) {
// //   await connection.rollback();
// //   return res.status(400).json({
// //     success: false,
// //     message: "SMS rejected by gateway. Please try again.",
// //   });
// // }
// //  return res.status(200).json({
// //       success: true,
// //       message: smsSent
// //         ? "Invoice generated & SMS sent successfully"
// //         : "Invoice generated but SMS failed",
// //       Invoice_Id,
// //       smsSent,
// //     });
// // ✅ Commit only after SMS success


// // return res.status(200).json({
// //   success: true,
// //   message: "Invoice generated & SMS sent successfully",
// //   Invoice_Id,
// //   Invoice_Public_Link_Id,
// // });
//   return res.status(200).json({
//       success: true,
//       message: smsSent
//         ? "Invoice generated & SMS sent successfully"
//         : "Invoice generated but SMS failed",
//       Invoice_Id,
//       smsSent,
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error generating SMS:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// }
// const getPublicInvoiceHtml = async (req, res, next) => {
//   let connection;

//   try {
//     const { Invoice_Id } = req.params;

//     if (!Invoice_Id) {
//       return res.status(400).json({
//         success: false,
//         message: "Invoice Id is required",
//       });
//     }

//     connection = await db.getConnection();

//     let invoiceDetails = null;
//     let orderItems = [];
//     let tables = [];              // 👈 NEW
//     let orderType = null;
//     let orderTypeLabel = null;

//     /* ================= DINE-IN ================= */
//     const [[dineInvoice]] = await connection.query(
//       `SELECT * FROM invoices WHERE Invoice_Id = ? LIMIT 1`,
//       [Invoice_Id]
//     );

//     if (dineInvoice) {
//       orderType = "dinein";
//       orderTypeLabel = "DINE-IN";
//       invoiceDetails = dineInvoice;

//       // 🔹 Items
//       const [items] = await connection.query(
//         `
//         SELECT fi.Item_Name, oi.Quantity AS Item_Quantity, oi.Amount
//         FROM order_items oi
//         JOIN add_food_item fi ON fi.Item_Id = oi.Item_Id
//         WHERE oi.Order_Id = ?
//         `,
//         [dineInvoice.Order_Id]
//       );
//       orderItems = items;

//       // 🔹 Tables (NEW)
//       const [tableRows] = await connection.query(
//         `
//         SELECT t.Table_Id, t.Table_Name
//         FROM order_tables ot
//         JOIN add_table t ON t.Table_Id = ot.Table_Id
//         WHERE ot.Order_Id = ?
//         `,
//         [dineInvoice.Order_Id]
//       );
//       tables = tableRows;
//     }

//     /* ================= TAKEAWAY ================= */
//     if (!invoiceDetails) {
//       const [[takeawayInvoice]] = await connection.query(
//         `SELECT * FROM takeaway_invoices WHERE Invoice_Id = ? LIMIT 1`,
//         [Invoice_Id]
//       );

//       if (takeawayInvoice) {
//         orderType = "takeaway";
//         orderTypeLabel = "TAKEAWAY";
//         invoiceDetails = takeawayInvoice;

//         const [items] = await connection.query(
//           `
//           SELECT fi.Item_Name, oti.Quantity AS Item_Quantity, oti.Amount
//           FROM order_takeaway_items oti
//           JOIN add_food_item fi ON fi.Item_Id = oti.Item_Id
//           WHERE oti.Takeaway_Order_Id = ?
//           `,
//           [takeawayInvoice.Takeaway_Order_Id]
//         );

//         orderItems = items;
//         tables = []; // 👈 always empty for takeaway
//       }
//     }

//     if (!invoiceDetails) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found",
//       });
//     }

//     /* ================= CALCULATION ================= */

//     const subTotal = orderItems.reduce(
//       (sum, item) => sum + Number(item.Amount || 0),
//       0
//     );

//     const serviceCharge = Number(invoiceDetails.Service_Charge || 0);
//     const discountInput = Number(invoiceDetails.Discount || 0);
//     const discountType = invoiceDetails.Discount_Type;

//     let discountValue = 0;

//     if (discountType === "percentage" && discountInput > 0) {
//       discountValue = subTotal * (discountInput / 100);
//     } else if (discountType === "amount" && discountInput > 0) {
//       discountValue = discountInput;
//     }

//     discountValue = Math.min(discountValue, subTotal);

//     const finalTotal = subTotal - discountValue + serviceCharge;

//     /* ================= RESPONSE ================= */
//     return res.status(200).json({
//       success: true,
//       orderType,
//       orderTypeLabel,
//       invoice: {
//         Invoice_Id: invoiceDetails.Invoice_Id,
//         Customer_Name: invoiceDetails.Customer_Name,
//         Customer_Phone: invoiceDetails.Customer_Phone,
//         Invoice_Date: invoiceDetails.Invoice_Date,

//         Sub_Total: Number(subTotal.toFixed(2)),
//         Discount: discountInput,
//         Discount_Type: discountType,
//         Discount_Value: Number(discountValue.toFixed(2)),
//         Service_Charge: Number(serviceCharge.toFixed(2)),
//         Total: Number(finalTotal.toFixed(2)),
//       },
//       items: orderItems,
//       tables,        // 👈 INCLUDED HERE
//     });

//   } catch (err) {
//     console.error("❌ Invoice fetch error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
const getPublicInvoiceHtml = async (req, res, next) => {
  let connection;

  try {
    const { Invoice_Id } = req.params;

    if (!Invoice_Id) {
      return res.status(400).json({
        success: false,
        message: "Invoice Id is required",
      });
    }

    connection = await db.getConnection();

    let invoiceDetails = null;
    let orderItems = [];
    let tables = [];
    let orderType = null;
    let orderTypeLabel = null;

    /* ================= DINE-IN ================= */
    const [[dineInvoice]] = await connection.query(
      `SELECT * FROM invoices WHERE Invoice_Id = ? LIMIT 1`,
      [Invoice_Id]
    );

    if (dineInvoice) {
      orderType = "dinein";
      orderTypeLabel = "DINE-IN";
      invoiceDetails = dineInvoice;

      const [items] = await connection.query(
        `
        SELECT fi.Item_Name, oi.Quantity AS Item_Quantity, oi.Amount
        FROM order_items oi
        JOIN add_food_item fi ON fi.Item_Id = oi.Item_Id
        WHERE oi.Order_Id = ?
        `,
        [dineInvoice.Order_Id]
      );
      orderItems = items;

      const [tableRows] = await connection.query(
        `
        SELECT t.Table_Id, t.Table_Name
        FROM order_tables ot
        JOIN add_table t ON t.Table_Id = ot.Table_Id
        WHERE ot.Order_Id = ?
        `,
        [dineInvoice.Order_Id]
      );
      tables = tableRows;
    }

    /* ================= TAKEAWAY ================= */
    if (!invoiceDetails) {
      const [[takeawayInvoice]] = await connection.query(
        `SELECT * FROM takeaway_invoices WHERE Invoice_Id = ? LIMIT 1`,
        [Invoice_Id]
      );

      if (takeawayInvoice) {
        orderType = "takeaway";
        orderTypeLabel = "TAKEAWAY";
        invoiceDetails = takeawayInvoice;

        const [items] = await connection.query(
          `
          SELECT fi.Item_Name, oti.Quantity AS Item_Quantity, oti.Amount
          FROM order_takeaway_items oti
          JOIN add_food_item fi ON fi.Item_Id = oti.Item_Id
          WHERE oti.Takeaway_Order_Id = ?
          `,
          [takeawayInvoice.Takeaway_Order_Id]
        );

        orderItems = items;
        tables = [];
      }
    }

    /* ================= PRE-BOOK ================= */
    if (!invoiceDetails) {
      const [[preBookInvoice]] = await connection.query(
        `SELECT * FROM pre_book_orders_invoices WHERE Pre_Book_Invoice_Id = ? LIMIT 1`,
        [Invoice_Id]
      );

      if (preBookInvoice) {
        orderType = "prebook";
        orderTypeLabel = "PRE-BOOK";
        invoiceDetails = preBookInvoice;

        const [items] = await connection.query(
          `
          SELECT Item_Name, Quantity AS Item_Quantity, Amount
          FROM pre_booked_order_items
          WHERE Pre_Booked_Order_Id = ?
          `,
          [preBookInvoice.Pre_Book_Order_Id]
        );

        orderItems = items;
        tables = []; // ❌ no tables for pre-book
      }
    }

    if (!invoiceDetails) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    /* ================= CALCULATIONS ================= */
    const subTotal = orderItems.reduce(
      (sum, item) => sum + Number(item.Amount || 0),
      0
    );

    const serviceCharge = Number(invoiceDetails.Service_Charge || 0);
    const discountInput = Number(invoiceDetails.Discount || 0);
    const discountType = invoiceDetails.Discount_Type;

    let discountValue = 0;

    if (discountType === "percentage" && discountInput > 0) {
      discountValue = subTotal * (discountInput / 100);
    } else if (discountType === "amount" && discountInput > 0) {
      discountValue = discountInput;
    }

    discountValue = Math.min(discountValue, subTotal);

    const finalTotal = subTotal - discountValue + serviceCharge;

    /* ================= RESPONSE ================= */
    return res.status(200).json({
      success: true,
      orderType,
      orderTypeLabel,
      invoice: {
        Invoice_Id:
          invoiceDetails.Invoice_Id ||
          invoiceDetails.Pre_Book_Invoice_Id,

        Customer_Name: invoiceDetails.Customer_Name || null,
        Customer_Phone: invoiceDetails.Customer_Phone || null,

        Invoice_Date:
          invoiceDetails.Invoice_Date ||
          invoiceDetails.Pre_Book_Invoice_Date,

        Sub_Total: Number(subTotal.toFixed(2)),
        Discount: discountInput,
        Discount_Type: discountType,
        Discount_Value: Number(discountValue.toFixed(2)),
        Service_Charge: Number(serviceCharge.toFixed(2)),
        Total: Number(finalTotal.toFixed(2)),
      },
      items: orderItems,
      tables,
    });

  } catch (err) {
    console.error("❌ Invoice fetch error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

 const generateSmsForTakeaway = async (req, res, next) => {
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
      Final_Amount,
    } = req.body;

    const normalizedCustomerName =
      Customer_Name && Customer_Name.trim() !== ""
        ? Customer_Name.trim()
        : null;

    // --------------------------------------------
    // VALIDATION
    // --------------------------------------------
    if (!userId)
      return res.status(400).json({ success: false, message: "User ID is required." });

    if (!Customer_Phone) {
      return res.status(400).json({
        success: false,
        message: "Customer phone number is required.",
      });
    }

    if (!items?.length)
      return res.status(400).json({
        success: false,
        message: "At least one item is required.",
      });

    connection = await db.getConnection();
    await connection.beginTransaction();

    /* ---------------- CUSTOMER (AUTO CREATE) ---------------- */
    let Customer_Id;

    const [[existingCustomer]] = await connection.query(
      `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
      [Customer_Phone]
    );

    if (existingCustomer) {
      Customer_Id = existingCustomer.Customer_Id;
    } else {
      // Customer_Id = await generateNextId(
      //   connection,
      //   "CUST",
      //   "Customer_Id",
      //   "customers"
      // );

      // await connection.query(
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

    // --------------------------------------------
    // 1️⃣ Generate Takeaway Order ID
    // --------------------------------------------
    // const Takeaway_Order_Id = await generateNextId(
    //   connection,
    //   "TKODR",
    //   "Takeaway_Order_Id",
    //   "orders_takeaway"
    // );

    // --------------------------------------------
    // 2️⃣ Insert Into orders_takeaway
    // --------------------------------------------
    const[oderTakeawayResult]=await connection.query(
      `INSERT INTO orders_takeaway 
       ( User_Id, Customer_Id, Status, Sub_Total, Amount, Payment_Status)
       VALUES ( ?, ?, 'completed', ?, ?, 'completed')`,
      [ userId, Customer_Id, Sub_Total, Final_Amount]
    );
    const takeawayOrderId = oderTakeawayResult.insertId;
    const Takeaway_Order_Id = "TKODR" + takeawayOrderId.toString().padStart(5, "0");

    await connection.query(
      `UPDATE orders_takeaway SET Takeaway_Order_Id = ? WHERE id = ?`,
     [Takeaway_Order_Id, takeawayOrderId]
    );
    // --------------------------------------------
    // 3️⃣ Generate KOT ID & Create Kitchen Order
    // --------------------------------------------
    // const KOT_Id = await generateNextId(
    //   connection,
    //   "KOT",
    //   "KOT_Id",
    //   "kitchen_orders"
    // );

    const [kitchenResult]=await connection.query(
      `INSERT INTO kitchen_orders ( Order_Id, Status)
       VALUES ( ?, 'ready')`,
      [ Takeaway_Order_Id]
    );

    const KOT_Num = kitchenResult.insertId;
    const KOT_Id = "KOT" + KOT_Num.toString().padStart(5, "0");

    await connection.query(
      `UPDATE kitchen_orders SET KOT_Id = ? WHERE id = ?`,
      [KOT_Id, KOT_Num]
    );

    // --------------------------------------------
    // 4️⃣ Insert Items (Order + Kitchen)
    // --------------------------------------------
    // for (let item of items) {
    //   if (!item.Item_Quantity || item.Item_Quantity <= 0) {
    //     await connection.rollback();
    //     return res.status(400).json({
    //       success: false,
    //       message: `Invalid quantity for item: ${item.Item_Name}`,
    //     });
    //   }

    //   const [ItemRow] = await connection.query(
    //     `SELECT Item_Id FROM add_food_item WHERE Item_Name = ? LIMIT 1`,
    //     [item.Item_Name]
    //   );

    //   if (!ItemRow.length) {
    //     await connection.rollback();
    //     return res.status(404).json({
    //       success: false,
    //       message: "Item not found.",
    //     });
    //   }

    //   const Item_Id = ItemRow[0].Item_Id;

    //   // const Order_Item_Id = await generateNextId(
    //   //   connection,
    //   //   "TKODRITM",
    //   //   "Takeaway_Order_Item_Id",
    //   //   "order_takeaway_items"
    //   // );

    //   const [orderTakeawayItemsResult]=await connection.query(
    //     `INSERT INTO order_takeaway_items 
    //      ( Takeaway_Order_Id, Item_Id, Quantity, Price, Amount)
    //      VALUES ( ?, ?, ?, ?, ?)`,
    //     [
         
    //       Takeaway_Order_Id,
    //       Item_Id,
    //       item.Item_Quantity,
    //       item.Item_Price,
    //       item.Amount,
    //     ]
    //   );

    //     const OrderItemNum= orderTakeawayItemsResult.insertId;
    //     const Order_Item_Id = "TKODRITM" + OrderItemNum.toString().padStart(5, "0");

    //     await connection.query(
    //       `UPDATE order_takeaway_items SET Takeaway_Order_Item_Id = ? WHERE id = ?`,
    //       [Order_Item_Id, OrderItemNum]
    //     );

    //   // const KOT_Item_Id = await generateNextId(
    //   //   connection,
    //   //   "KOTITM",
    //   //   "KOT_Item_Id",
    //   //   "kitchen_order_items"
    //   // );

    //   const[kitchenOrderItemsResult]=await connection.query(
    //     `INSERT INTO kitchen_order_items 
    //      ( KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
    //      VALUES ( ?, ?, ?, ?, 'ready')`,
    //     [
         
    //       KOT_Id,
    //       Item_Id,
    //       item.Item_Name,
    //       item.Item_Quantity,
    //     ]
    //   );
    //   const KOTItemName = kitchenOrderItemsResult.insertId;
    //   const KOT_Item_Id = "KOTITM" + KOTItemName.toString().padStart(5, "0");

    //   await connection.query(
    //     `UPDATE kitchen_order_items SET KOT_Item_Id = ? WHERE id = ?`,
    //     [KOT_Item_Id, KOTItemName]
    //   );
    // }
// --------------------------------------------
// 🔥 STEP 1: FETCH ALL ITEMS IN ONE QUERY
// --------------------------------------------
const itemNames = items.map(i => i.Item_Name);

const [dbItems] = await connection.query(
  `SELECT Item_Id, Item_Name FROM add_food_item WHERE Item_Name IN (?)`,
  [itemNames]
);

// --------------------------------------------
// 🔥 STEP 2: CREATE MAP FOR O(1) LOOKUP
// --------------------------------------------
const itemMap = new Map();

dbItems.forEach(item => {
  itemMap.set(item.Item_Name, item.Item_Id);
});

// --------------------------------------------
// 🔥 STEP 3: LOOP (NO DB SELECT INSIDE)
// --------------------------------------------
for (let item of items) {
  // ✅ VALIDATION
  if (!item.Item_Quantity || item.Item_Quantity <= 0) {
    await connection.rollback();
    return res.status(400).json({
      success: false,
      message: `Invalid quantity for item: ${item.Item_Name}`,
    });
  }

  const Item_Id = itemMap.get(item.Item_Name);

  if (!Item_Id) {
    await connection.rollback();
    return res.status(404).json({
      success: false,
      message: `Item not found: ${item.Item_Name}`,
    });
  }

  // --------------------------------------------
  // 🧾 INSERT ORDER ITEM
  // --------------------------------------------
  const [orderTakeawayItemsResult] = await connection.query(
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

  const OrderItemNum = orderTakeawayItemsResult.insertId;
  const Order_Item_Id = "TKODRITM" + OrderItemNum.toString().padStart(5, "0");

  await connection.query(
    `UPDATE order_takeaway_items 
     SET Takeaway_Order_Item_Id = ? 
     WHERE id = ?`,
    [Order_Item_Id, OrderItemNum]
  );

  // --------------------------------------------
  // 🍳 INSERT KITCHEN ITEM
  // --------------------------------------------
  const [kitchenOrderItemsResult] = await connection.query(
    `INSERT INTO kitchen_order_items 
     (KOT_Id, Item_Id, Item_Name, Quantity, Item_Status)
     VALUES (?, ?, ?, ?, 'ready')`,
    [
      KOT_Id,
      Item_Id,
      item.Item_Name,
      item.Item_Quantity,
    ]
  );

  const KOTItemNum = kitchenOrderItemsResult.insertId;
  const KOT_Item_Id = "KOTITM" + KOTItemNum.toString().padStart(5, "0");

  await connection.query(
    `UPDATE kitchen_order_items 
     SET KOT_Item_Id = ? 
     WHERE id = ?`,
    [KOT_Item_Id, KOTItemNum]
  );
}
    // --------------------------------------------
    // 5️⃣ Generate Invoice
    // --------------------------------------------
    // const Invoice_Id = await generateNextId(
    //   connection,
    //   "TKINV",
    //   "Invoice_Id",
    //   "takeaway_invoices"
    // );

    const [[fy]] = await connection.query(
      `SELECT Financial_Year FROM financial_year
       WHERE Current_Financial_Year = 1 LIMIT 1`
    );

    if (!fy) {
      await connection.rollback();
      return res.status(400).json({
        message: "No active financial year found.",
      });
    }

    const[takeawayInvoiceResult]=await connection.query(
      `INSERT INTO takeaway_invoices
       ( Takeaway_Order_Id, Invoice_Date, Financial_Year, Amount,
        Customer_Name, Customer_Phone, Customer_Id, Discount_Type, Discount, Payment_Type)
       VALUES ( ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        
        Takeaway_Order_Id,
        fy.Financial_Year,
        Final_Amount,
        normalizedCustomerName,
        Customer_Phone,
        Customer_Id,
        Discount_Type ?? "percentage",
        Discount || 0,
        Payment_Type ?? "cash",
      ]
    );

    const Invoice_Num = takeawayInvoiceResult.insertId;
    const Invoice_Id = "TKINV" + Invoice_Num.toString().padStart(5, "0");

    await connection.query(
      `UPDATE takeaway_invoices SET Invoice_Id = ? WHERE id = ?`,
      [Invoice_Id, Invoice_Num]
    );
    /* ---------------- PUBLIC LINK ---------------- */
    // const Invoice_Public_Link_Id = await generateNextId(
    //   connection,
    //   "IPLK",
    //   "Invoice_Public_Link_Id",
    //   "invoice_public_links"
    // );

    const Public_Token = crypto.randomBytes(24).toString("hex");

    const[invoicePublicLinksResult]=await connection.query(
      `INSERT INTO invoice_public_links
       ( Invoice_Id, Order_Id, Customer_Id, Public_Token)
       VALUES (?, ?, ?, ?)`,
      [
        
        Invoice_Id,
        Takeaway_Order_Id,
        Customer_Id,
        Public_Token,
      ]
    );
      const Invoice_Public_Link_Num = invoicePublicLinksResult.insertId;
      const Invoice_Public_Link_Id = "IPLK" + Invoice_Public_Link_Num.toString().padStart(5, "0");

      await connection.query(
        `UPDATE invoice_public_links SET Invoice_Public_Link_Id = ? WHERE id = ?`,
        [Invoice_Public_Link_Id, Invoice_Public_Link_Num]
      );
    
    await connection.commit();

    /* ---------------- SMS ---------------- */
    const totalAmount = Number(Final_Amount).toFixed(2);
    const billNumber = Invoice_Id;
    const invoiceLink = `http://localhost:5173/${billNumber}`;
 // const invoiceLink = `https://ancoinnovation.com/b/${billNumber}`
//   const invoiceLink = `http://localhost:5173/${billNumber}`
// //  const invoiceLink = `${"http://localhost:5173"}/${billNumber}`
// // const invoiceLink = `http://localhost:4000/api/staff/order/${billNumber}`;
// // const invoiceLink = `${"http://localhost:5173"}/invoice/view/${billNumber}`;
// // const invoiceLink = `https://ancoinnovation.com/restaurant-mangement-system/invoice/view/${Public_Token}`
// // const smsMessage = `Hi, Your bill from Hello Guys Shakuntala Park : Total Rs.${totalAmount} (incl. Tax). Bill No. ${billNumber}. View full details: ${invoiceLink} CLPLSE.`;
// //const smsMessage = `Hi, Your bill from Hello Guys Shakuntala Park : Total Rs.${totalAmount} (incl. Tax). Bill No. ${billNumber} View full details: ${invoiceLink}. HloGuy`;
 const smsMessage =`Hi, Your bill from Hello Guys Shakuntala Park : Total Rs.${totalAmount} (incl. Tax). Bill No. ${billNumber} View full details: ${invoiceLink}. HloGuy`;


    const smsSent = await sendSMS(Customer_Phone, smsMessage);

    return res.status(200).json({
      success: true,
      message: smsSent
        ? "Invoice generated & SMS sent successfully"
        : "Invoice generated but SMS failed",
      Invoice_Id,
      smsSent,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error generating SMS (takeaway):", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
const generateSmsForPreBooked = async (req, res, next) => {
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
    } = req.body;

    if (!Pre_Book_Order_Id || !Customer_Phone || !Final_Amount) {
      return res.status(400).json({
        success: false,
        message: "Required details missing",
      });
    }

    const normalizedCustomerName =
      Customer_Name && Customer_Name.trim() !== ""
        ? Customer_Name.trim()
        : null;

    const finalAmount = Number(Final_Amount);
    if (finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid final amount",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    /* --------------------------------------------------
       1️⃣ CUSTOMER (AUTO CREATE / UPDATE)
    -------------------------------------------------- */
    let Customer_Id;

    const [[existingCustomer]] = await connection.query(
      `SELECT Customer_Id FROM customers WHERE Customer_Phone = ? LIMIT 1`,
      [Customer_Phone]
    );

    if (existingCustomer) {
      Customer_Id = existingCustomer.Customer_Id;

      if (normalizedCustomerName) {
        await connection.query(
          `UPDATE customers SET Customer_Name = ? WHERE Customer_Id = ?`,
          [normalizedCustomerName, Customer_Id]
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
        `INSERT INTO customers
         (Customer_Id, Customer_Name, Customer_Phone, created_at)
         VALUES (?, ?, ?, NOW())`,
        [Customer_Id, normalizedCustomerName, Customer_Phone]
      );
    }

    /* --------------------------------------------------
       2️⃣ FINANCIAL YEAR
    -------------------------------------------------- */
    const [[fy]] = await connection.query(
      `SELECT Financial_Year
       FROM financial_year
       WHERE Current_Financial_Year = 1
       LIMIT 1`
    );

    if (!fy) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "No active financial year found",
      });
    }

    const activeFY = fy.Financial_Year;

    /* --------------------------------------------------
       3️⃣ GENERATE INVOICE
    -------------------------------------------------- */
    const Pre_Book_Invoice_Id = await generateNextId(
      connection,
      "PRBINV",
      "Pre_Book_Invoice_Id",
      "pre_book_orders_invoices"
    );

    await connection.query(
      `INSERT INTO pre_book_orders_invoices
       (Pre_Book_Invoice_Id, Pre_Book_Order_Id, Pre_Book_Invoice_Date,
        Financial_Year, Customer_Id, Discount_Type, Discount,
        Service_Charge, Amount, Payment_Type)
       VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
      [
        Pre_Book_Invoice_Id,
        Pre_Book_Order_Id,
        activeFY,
        Customer_Id,
        Discount_Type ?? "percentage",
        Number(Discount || 0),
        Number(Service_Charge || 0),
        finalAmount,
        Payment_Type ?? "cash",
      ]
    );

    /* --------------------------------------------------
       4️⃣ PUBLIC INVOICE LINK
    -------------------------------------------------- */
    const Invoice_Public_Link_Id = await generateNextId(
      connection,
      "IPLK",
      "Invoice_Public_Link_Id",
      "invoice_public_links"
    );

    const Public_Token = crypto.randomBytes(24).toString("hex");

    await connection.query(
      `INSERT INTO invoice_public_links
       (Invoice_Public_Link_Id, Invoice_Id, Order_Id, Customer_Id, Public_Token)
       VALUES (?, ?, ?, ?, ?)`,
      [
        Invoice_Public_Link_Id,
        Pre_Book_Invoice_Id,
        Pre_Book_Order_Id,
        Customer_Id,
        Public_Token,
      ]
    );

    /* --------------------------------------------------
       5️⃣ UPDATE PRE-BOOK ORDER STATUS ✅ (YOU WANTED THIS)
    -------------------------------------------------- */
    await connection.query(
      `UPDATE pre_booked_orders
       SET
         Customer_Id = ?,
         Payment_Left = 0,
         Payment_Status = 'paid',
         Status = 'completed'
       WHERE Pre_Booked_Order_Id = ?`,
      [Customer_Id, Pre_Book_Order_Id]
    );

    /* --------------------------------------------------
       6️⃣ COMMIT TRANSACTION
    -------------------------------------------------- */
    await connection.commit();

    /* --------------------------------------------------
       7️⃣ SEND SMS (POST-COMMIT)
    -------------------------------------------------- */
    const billNumber = Pre_Book_Invoice_Id;
    const totalAmount = finalAmount.toFixed(2);
    // const invoiceLink =
    //   `https://ancoinnovation.com/restaurant-mangement-system/invoice/view/${Public_Token}`;
const invoiceLink = `http://localhost:5173/${billNumber}`;
    const smsMessage =
      `Hi, Your bill from Hello Guys Shakuntala Park : ` +
      `Total Rs.${totalAmount} (incl. Tax). ` +
      `Bill No. ${billNumber} ` +
      `View full details: ${invoiceLink}. HloGuy`;

    const smsSent = await sendSMS(Customer_Phone, smsMessage);

    return res.status(200).json({
      success: true,
      message: smsSent
        ? "Invoice generated, order completed & SMS sent"
        : "Invoice generated & order completed, SMS failed",
      Pre_Book_Invoice_Id,
      smsSent,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error generating invoice & SMS:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

// const getPublicInvoiceHtmlForPreBook= async (req, res, next) => {
//   let connection;
//   try {
    
//     // 🔴 fetch invoiceDetails, orderDetails, invoiceNumberData, total here
//     // (you already have this logic elsewhere)
//     const { Pre_Book_Invoice_Id } = req.params;

//     if (!Pre_Book_Invoice_Id) {
//       return res.status(400).send("Invoice Id is required");
//     }

//     connection = await db.getConnection();
//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error generating invoice & SMS:", err);
//     next(err);
//   }finally {
//     if (connection) connection.release();
//   }
// };

export { generateSms,getPublicInvoiceHtml ,generateSmsForTakeaway, generateSmsForPreBooked
};












// const getPublicInvoiceHtml = async (req, res, next) => {
//   let connection;
//   try {
    
//     // 🔴 fetch invoiceDetails, orderDetails, invoiceNumberData, total here
//     // (you already have this logic elsewhere)
// const { Invoice_Id } = req.params;

//     if (!Invoice_Id) {
//       return res.status(400).send("Invoice Id is required");
//     }

//     connection = await db.getConnection();

//     let invoiceDetails = null;
//     let orderItems = [];
//     let orderType = null;

//     /* --------------------------------------------------
//        1️⃣ CHECK DINE-IN INVOICE
//     -------------------------------------------------- */
//     const [[dineInvoice]] = await connection.query(
//       `SELECT * FROM invoices WHERE Invoice_Id = ? LIMIT 1`,
//       [Invoice_Id]
//     );

//     if (dineInvoice) {
//       orderType = "dinein";
//       invoiceDetails = dineInvoice;

//       // Fetch dine-in items
//       const [items] = await connection.query(
//         `
//         SELECT 
//           oi.Quantity AS Item_Quantity,
//           oi.Amount,
//           fi.Item_Name
//         FROM order_items oi
//         JOIN add_food_item fi ON fi.Item_Id = oi.Item_Id
//         WHERE oi.Order_Id = ?
//         `,
//         [dineInvoice.Order_Id]
//       );

//       orderItems = items;
//     }

//     /* --------------------------------------------------
//        2️⃣ CHECK TAKEAWAY INVOICE (IF NOT DINE-IN)
//     -------------------------------------------------- */
//     if (!invoiceDetails) {
//       const [[takeawayInvoice]] = await connection.query(
//         `SELECT * FROM takeaway_invoices WHERE Invoice_Id = ? LIMIT 1`,
//         [Invoice_Id]
//       );

//       if (takeawayInvoice) {
//         orderType = "takeaway";
//         invoiceDetails = takeawayInvoice;

//         const [items] = await connection.query(
//           `
//           SELECT 
//             oti.Quantity AS Item_Quantity,
//             oti.Amount,
//             fi.Item_Name
//           FROM order_takeaway_items oti
//           JOIN add_food_item fi ON fi.Item_Id = oti.Item_Id
//           WHERE oti.Takeaway_Order_Id = ?
//           `,
//           [takeawayInvoice.Takeaway_Order_Id]
//         );

//         orderItems = items;
//       }
//     }

//     /* --------------------------------------------------
//        3️⃣ IF NO INVOICE FOUND
//     -------------------------------------------------- */
//     if (!invoiceDetails) {
//       return res.status(404).send("Invoice not found");
//     }

//     /* --------------------------------------------------
//        4️⃣ CALCULATE TOTAL
//     -------------------------------------------------- */
//     const total = Number(invoiceDetails.Amount || invoiceDetails.Final_Amount || 0);

//     const getCurrentDate = () =>
//       new Date(invoiceDetails.Invoice_Date).toLocaleDateString("en-GB");

//     const getCurrentTime = () =>
//       new Date(invoiceDetails.Invoice_Date).toLocaleTimeString("en-US", {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       });

//     const html = ` 
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <title>Invoice - ${invoiceDetails?.Invoice_Number ?? ""}</title>
//         <meta charset="UTF-8">
//         <style>
//           * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//           }
          
//           body { 
//             font-family: 'Courier New', Courier, monospace;
//             font-size: 11px;
//             line-height: 1.3;
//             color: #000;
//             width: 2.5in;
//             margin: 0 auto;
//             padding: 0;
//           }
          
//           .invoice {
//             width: 2.5in;
//             padding: 8px;
//           }

//           .header-center { 
//             text-align: center; 
//             margin-bottom: 8px;
//             border-bottom: 1px dashed #000;
//             padding-bottom: 8px;
//           }
          
//           .logo { 
//             width: 60px; 
//             height: auto; 
//             margin-bottom: 4px;
//           }
          
//           .brand { 
//             font-size: 16px; 
//             font-weight: bold; 
//             text-transform: uppercase;
//             letter-spacing: 1px;
//             margin-bottom: 2px;
//           }
          
//           .line { 
//             border-top: 1px dashed #000; 
//             margin: 6px 0;
//           }
          
//           .line-solid {
//             border-top: 1px solid #000;
//             margin: 6px 0;
//           }

//           .info-row {
//             display: flex;
//             justify-content: space-between;
//             margin: 2px 0;
//             font-size: 10px;
//           }
          
//           .info-label {
//             font-weight: bold;
//           }

//           .items-header {
//             display: flex;
//             justify-content: space-between;
//             font-weight: bold;
//             border-bottom: 1px solid #000;
//             padding: 4px 0;
//             font-size: 10px;
//           }
          
//           .item-row {
//             display: flex;
//             justify-content: space-between;
//             padding: 3px 0;
//             border-bottom: 1px dashed #ddd;
//             font-size: 10px;
//           }
          
//           .item-name {
//             flex: 1;
//             padding-right: 8px;
//             word-wrap: break-word;
//           }
          
//           .item-qty {
//             width: 30px;
//             text-align: center;
//           }
          
//           .item-price {
//             width: 50px;
//             text-align: right;
//           }
          
//           .item-amount {
//             width: 55px;
//             text-align: right;
//             font-weight: bold;
//           }

//           .summary {
//             margin-top: 8px;
//             font-size: 11px;
//           }
          
//           .summary-row {
//             display: flex;
//             justify-content: space-between;
//             padding: 3px 0;
//           }
          
//           .summary-row.total {
//             font-size: 13px;
//             font-weight: bold;
//             border-top: 1px solid #000;
//             border-bottom: 2px solid #000;
//             margin-top: 4px;
//             padding: 5px 0;
//           }

//           .footer {
//             text-align: center;
//             margin-top: 10px;
//             padding-top: 8px;
//             border-top: 1px dashed #000;
//             font-size: 10px;
//           }
          
//           .footer-title {
//             font-weight: bold;
//             margin-bottom: 4px;
//             font-size: 11px;
//           }

//           @media print {
//             body {
//               width: 2.5in;
//               margin: 0;
//               padding: 0;
//             }
            
//             .invoice {
//               width: 2.5in;
//               padding: 8px;
//             }
            
//             @page {
//               size: 2.5in auto;
//               margin: 0;
//             }
            
//             .no-print {
//               display: none !important;
//             }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="invoice">

//           <div class="header-center">
//             <img src="/public/images/logo.png" class="logo" alt="Logo" />
//             <div class="brand"> "HELLO GUYS"</div>
//           </div>

//           <div class="info-row">
//             <span><span class="info-label">Customer:</span> ${invoiceDetails?.Customer_Name ?? "Walk-in"}</span>
//           </div>
//           ${invoiceDetails?.Customer_Phone ? `
//           <div class="info-row">
//             <span><span class="info-label">Phone:</span> ${invoiceDetails.Customer_Phone}</span>
//           </div>
//           ` : ''}
          
//           <div class="line"></div>

//           <div class="info-row">
//             <span><span class="info-label">Date:</span> ${getCurrentDate()}</span>
//             <span><span class="info-label">Time:</span> ${getCurrentTime()}</span>
//           </div>
//           <div class="info-row">
//             <span><span class="info-label">Invoice:</span> ${invoiceNumberData?.nextInvoiceNumber ?? "-"}</span>
//           </div>

//           <div class="line-solid"></div>

//           <div class="items-header">
//             <div style="width: 30px;">#</div>
//             <div class="item-name">ITEM</div>
//             <div class="item-qty">QTY</div>
//             <div class="item-amount">AMOUNT</div>
//           </div>

//           ${
//             (orderDetails?.items || []).map((it, i) => `
//               <div class="item-row">
//                 <div style="width: 30px;">${i + 1}</div>
//                 <div class="item-name">${it.Item_Name ?? "-"}</div>
//                 <div class="item-qty">${it.Item_Quantity ?? 1}</div>
//                 <div class="item-amount">₹${Number(it.Amount ?? 0).toFixed(2)}</div>
//               </div>
//             `).join("")
//           }

//           <div class="line-solid"></div>

//           <div class="summary">
//             <div class="summary-row">
//               <span>Subtotal</span>
//               <span>₹${Number(invoiceDetails?.Sub_Total ?? 0).toFixed(2)}</span>
//             </div>
//             ${Number(invoiceDetails?.Service_Charge ?? 0) > 0 ? `
//             <div class="summary-row">
//               <span>Service Charge</span>
//               <span>₹${Number(invoiceDetails.Service_Charge).toFixed(2)}</span>
//             </div>
//             ` : ''}
//             ${invoiceDetails?.Discount && Number(invoiceDetails.Discount) > 0 ? `
//             <div class="summary-row">
//               <span>Discount</span>
//               <span>${
//                 invoiceDetails.Discount_Type === "percentage"
//                   ? `${invoiceDetails.Discount}%`
//                   : `₹${invoiceDetails.Discount}`
//               }</span>
//             </div>
//             ` : ''}
//             <div class="summary-row total">
//               <span>TOTAL</span>
//               <span>₹${Number(total).toFixed(2)}</span>
//             </div>
//           </div>

//           <div class="footer">
//             <div class="footer-title">THANK YOU!</div>
//             <div>Please Visit Again</div>
//           </div>

//         </div>
//       </body>
//     </html>
//   `;

//     // ✅ IMPORTANT HEADERS
//     res.setHeader("Content-Type", "text/html; charset=UTF-8");
//     res.setHeader("Cache-Control", "no-store");

//     return res.status(200).send(html);

//   } catch (err) {
//     console.error("Invoice HTML error:", err);
//     next(err);
//   }finally {
//     if (connection) connection.release();

//   }
// };