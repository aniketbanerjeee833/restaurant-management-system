
import db from "../config/db.js"; // mysql2/promise db
import { sanitizeObject } from "../utils/sanitizeInput.js";
import { saleNewItemFormSchema } from "../validators/saleNewItemFormSchema.js";
import saleSchema from "../validators/saleSchema.js";
import PdfPrinter from "pdfmake";
// import puppeteer from "puppeteer";
//import pdf from "html-pdf-node";
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
const cleanValue = (value) => {
  if (value === undefined || value === null || value === "" || value === " ") {
    return null; // store as NULL in DB
  }
  return value;  // ✅ returns the original value for valid data
};
const cleanDiscount = (value) => {
  if (value === undefined || value === null || value === "" || value === " ") {
    return 0.00; // store as 0.00 in DB
  }
  return Number(value);
}
const normalizeNumber = (val) =>
  val !== undefined && val !== null && String(val).trim() !== ""
    ? Number(val)
    : null;

// const addSale = async (req, res, next) => {
//   let connection;
//   try {
//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     // 1️⃣ Sanitize + validate
//     const cleanData = sanitizeObject(req.body);
//     const validation = saleSchema.safeParse(cleanData);
//     if (!validation.success) {
//       await connection.rollback();
//       return res.status(400).json({ errors: validation.error.errors });
//     }

//     const {
//       Party_Name,
//       GSTIN,
//       Invoice_Number,
//       Invoice_Date,
//       State_Of_Supply,
//       Total_Amount,
//       Total_Received,
//       Balance_Due,
//       Payment_Type,
//       Reference_Number,
//       items,
//     } = validation.data;

//     if (
//       !Party_Name ||
//       !Invoice_Number ||
//       !Invoice_Date ||
//       !State_Of_Supply ||
//       !Array.isArray(items) ||
//       items.length === 0
//     ) {
//       await connection.rollback();
//       return res.status(400).json({
//         message: "Star marked fields missing or items empty",
//       });
//     }
//     const itemCountMap = new Map();
//     for (const item of items) {
//       const itemName = item.Item_Name?.trim().toLowerCase();
//       if (!itemName) {
//         await connection.rollback();
//         return res.status(400).json({ message: "Item name missing." });
//       }

//       const qty = Number(item.Quantity) || 0;
//       itemCountMap.set(itemName, (itemCountMap.get(itemName) || 0) + qty);
//           const duplicates = [...itemCountMap.entries()].filter(([name]) =>
//       items.filter((it) => it.Item_Name?.trim().toLowerCase() === name).length > 1
//     );
//     if (duplicates.length > 0) {
//       const names = duplicates.map(([n]) => `'${n}'`).join(", ");
//      await connection.rollback();
//       return res.status(400).json({
//         message: `Duplicate items detected: ${names}. Please ensure each item appears only once.`,
//       });
//     }
//     }
//     // 2️⃣ Validate unique invoice number
//     const [existingInvoice] = await connection.query(
//       "SELECT Invoice_Number FROM add_sale WHERE Invoice_Number = ? LIMIT 1",
//       [Invoice_Number]
//     );
//     if (existingInvoice.length > 0) {
//       await connection.rollback();
//       return res
//         .status(400)
//         .json({ message: "Invoice number already exists, please use a new one." });
//     }

//     // 3️⃣ Fetch Party_Id
//     const [partyRows] = await connection.query(
//       "SELECT Party_Id, GSTIN FROM add_party WHERE Party_Name = ? LIMIT 1",
//       [Party_Name]
//     );
//     if (partyRows.length === 0) {
//       await connection.rollback();
//       return res.status(404).json({ message: "Party not found." });
//     }
//     if (partyRows[0].GSTIN !== GSTIN) {
//   return res.status(400).json({ 
//     message: "GSTIN does not match with selected party." 
//   });
// }
//     const Party_Id = partyRows[0].Party_Id;

//     // 4️⃣ Generate new Sale_Id
//     const [lastSale] = await connection.query(
//       "SELECT Sale_Id FROM add_sale ORDER BY id DESC LIMIT 1"
//     );
//     let newSaleId = "SAL001";
//     if (lastSale.length > 0) {
//       const num = parseInt(lastSale[0].Sale_Id.replace("SAL", "")) + 1;
//       newSaleId = "SAL" + num.toString().padStart(3, "0");
//     }

//     // 5️⃣ Insert into add_sale
//     await connection.query(
//       `INSERT INTO add_sale 
//        (Party_Id, Sale_Id, Invoice_Number, Invoice_Date, State_Of_Supply,
//         Total_Amount, Total_Received, Balance_Due, Payment_Type, Reference_Number, 
//         created_at, updated_at)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//       [
//         Party_Id,
//         newSaleId,
//         Invoice_Number,
//         Invoice_Date,
//         State_Of_Supply,
//         cleanValue(Total_Amount),
//         cleanValue(Total_Received),
//         cleanValue(Balance_Due),
//         cleanValue(Payment_Type),
//         cleanValue(Reference_Number),
//       ]
//     );

//     // 6️⃣ Get latest sale item id once
//     // const [latestSaleItem] = await connection.query(
//     //   "SELECT Sale_Items_Id FROM add_sale_items ORDER BY id DESC LIMIT 1"
//     // );
//     // let nextSaleItemNum = 1;
//     // if (latestSaleItem.length > 0) {
//     //   const lastNum = parseInt(
//     //     latestSaleItem[0].Sale_Items_Id.replace("SIT", "")
//     //   );
//     //   nextSaleItemNum = isNaN(lastNum) ? 1 : lastNum + 1;
//     // }
//     const [maxRow] = await connection.query(
//   "SELECT MAX(CAST(SUBSTRING(Sale_Items_Id, 4) AS UNSIGNED)) AS maxNum FROM add_sale_items"
// );
// let nextSaleItemNum = (maxRow[0]?.maxNum || 0) + 1;
//     console.log("nextSaleItemNum", nextSaleItemNum);

//     // 7️⃣ Insert each sale item
//     for (const item of items) {
//       const {
//         Item_Name,
//         Item_HSN,
//         Item_Category,
//         Quantity,
//         Item_Unit,
//         Sale_Price,
//         Discount_On_Sale_Price,
//         Discount_Type_On_Sale_Price,
//         Tax_Type,
//         Tax_Amount,
//         Amount,
//       } = item;
//       // if (Item_HSN) {
//       //   const [hsnCheck] = await db.execute(
//       //     `SELECT Item_Name FROM add_item WHERE Item_HSN = ? AND Item_Name != ? LIMIT 1`,
//       //     [Item_HSN, Item_Name]
//       //   );
//       //   if (hsnCheck.length > 0) {
//       //     return res.status(400).json({
//       //       message: `HSN '${Item_HSN}' already belongs to another item '${hsnCheck[0].Item_Name}'.`,
//       //     });
//       //   }
//       // }
//       // Ensure item exists
//       const [itemRows] = await connection.query(
//         "SELECT * FROM add_item WHERE Item_Name = ? LIMIT 1",
//         [Item_Name]
//       );
//       if (itemRows.length === 0) {
//         await connection.rollback();
//         return res
//           .status(404)
//           .json({ message: `Item '${Item_Name}' not found in inventory.` });
//       }

//       const Item_Id = itemRows[0].Item_Id;

//       // Fetch verified tax type from purchase table (trusted)
//       const [purchaseTax] = await connection.query(
//         `SELECT Tax_Type FROM add_purchase_items WHERE Item_Id = ? ORDER BY id DESC LIMIT 1`,
//         [Item_Id]
//       );
//       const safeTaxType = purchaseTax[0]?.Tax_Type || Tax_Type || "None";

//       // Update stock
//       await connection.query(
//         `UPDATE add_item 
//          SET Stock_Quantity = Stock_Quantity - ?, updated_at = NOW()
//          WHERE Item_Id = ?`,
//         [normalizeNumber(Quantity), Item_Id]
//       );

//       // Generate new sale item id safely
//       const newSaleItemId = "SIT" + nextSaleItemNum.toString().padStart(3, "0");
//       nextSaleItemNum++;

//       // Insert into add_sale_items
//       await connection.query(
//         `INSERT INTO add_sale_items 
//          (Sale_Items_Id, Sale_Id, Item_Id, Quantity, Sale_Price, 
//           Discount_On_Sale_Price, Discount_Type_On_Sale_Price, 
//           Tax_Type, Tax_Amount, Amount, created_at, updated_at)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//         [
//           newSaleItemId,
//           newSaleId,
//           Item_Id,
//           normalizeNumber(Quantity),
//           normalizeNumber(Sale_Price),
//           cleanDiscount(Discount_On_Sale_Price),
//           cleanValue(Discount_Type_On_Sale_Price),
//           cleanValue(safeTaxType),
//           normalizeNumber(Tax_Amount),
//           normalizeNumber(Amount),
//         ]
//       );
//     }

//     // 8️⃣ Commit everything
//     await connection.commit();

//     return res.status(201).json({
//       success: true,
//       message: "Sale and items added successfully",
//       saleId: newSaleId,
//     });
//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error adding sale:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Duplicate entry detected. Please use unique values.",
//       stack: err.stack,
//     });
//   } finally {
//     if (connection) connection.release();
//   }
// };
const addSale = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Sanitize + validate
    const cleanData = sanitizeObject(req.body);
    const validation = saleSchema.safeParse(cleanData);
    if (!validation.success) {
      await connection.rollback();
      return res.status(400).json({ errors: validation.error.errors });
    }

    const {
      Party_Name,
      GSTIN,
      Invoice_Number,
      Invoice_Date,
      State_Of_Supply,
      Total_Amount,
      Total_Received,
      Balance_Due,
      Payment_Type,
      Reference_Number,
      items,
    } = validation.data;

    if (
      !Party_Name ||
      !Invoice_Number ||
      !Invoice_Date ||
      !State_Of_Supply ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      await connection.rollback();
      return res.status(400).json({
        message: "Star marked fields missing or items empty",
      });
    }

    // 2️⃣ Check duplicate items
    const itemCountMap = new Map();
    for (const item of items) {
      const itemName = item.Item_Name?.trim().toLowerCase();
      if (!itemName) {
        await connection.rollback();
        return res.status(400).json({ message: "Item name missing." });
      }

      const qty = Number(item.Quantity) || 0;
      itemCountMap.set(itemName, (itemCountMap.get(itemName) || 0) + qty);

      const duplicates = [...itemCountMap.entries()].filter(([name]) =>
        items.filter((it) => it.Item_Name?.trim().toLowerCase() === name).length > 1
      );
      if (duplicates.length > 0) {
        const names = duplicates.map(([n]) => `'${n}'`).join(", ");
        await connection.rollback();
        return res.status(400).json({
          message: `Duplicate items detected: ${names}. Please ensure each item appears only once.`,
        });
      }
    }

    // 3️⃣ Validate unique invoice number
    // const [existingInvoice] = await connection.query(
    //   "SELECT Invoice_Number FROM add_sale WHERE Invoice_Number = ? LIMIT 1",
    //   [Invoice_Number]
    // );
    // if (existingInvoice.length > 0) {
    //   await connection.rollback();
    //   return res.status(400).json({
    //     message: "Invoice number already exists, please use a new one.",
    //   });
    // }

    // 4️⃣ Fetch Party_Id
    const [partyRows] = await connection.query(
      "SELECT Party_Id, GSTIN FROM add_party WHERE Party_Name = ? LIMIT 1",
      [Party_Name]
    );
    if (partyRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Party not found." });
    }
//  if (partyRows[0].GSTIN && partyRows[0].GSTIN !== GSTIN) {
//   console.error("GSTIN does not match with selected party.");
//   await connection.rollback();
//   return res.status(400).json({
//     message: "GSTIN does not match with selected party.",
//   });
// }
    const Party_Id = partyRows[0].Party_Id;

    // 5️⃣ Generate new Sale_Id
    const [lastSale] = await connection.query(
      "SELECT Sale_Id FROM add_sale ORDER BY id DESC LIMIT 1"
    );
    let newSaleId = "SAL001";
    if (lastSale.length > 0) {
      const num = parseInt(lastSale[0].Sale_Id.replace("SAL", "")) + 1;
      newSaleId = "SAL" + num.toString().padStart(3, "0");
    }

    // ⚡ 6️⃣ FETCH ACTIVE FINANCIAL YEAR (VERY IMPORTANT)
    const [fy] = await connection.query(
      `SELECT Financial_Year 
       FROM financial_year 
       WHERE Current_Financial_Year = 1
       LIMIT 1`
    );

    if (fy.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "No active financial year found. Please set one in settings.",
      });
    }

    const activeFY = fy[0].Financial_Year; // Example: "2025-2026"

    // 7️⃣ Insert into add_sale
    await connection.query(
      `INSERT INTO add_sale 
       (Party_Id, Sale_Id, Invoice_Number, Invoice_Date, State_Of_Supply,
        Total_Amount, Total_Received, Balance_Due, Payment_Type, Reference_Number,
        Financial_Year, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        Party_Id,
        newSaleId,
        Invoice_Number,
        Invoice_Date,
        State_Of_Supply,
        cleanValue(Total_Amount),
        cleanValue(Total_Received),
        cleanValue(Balance_Due),
        cleanValue(Payment_Type),
        cleanValue(Reference_Number),
        activeFY,            // ⚡ FINANCIAL YEAR SAVED HERE
      ]
    );

    // 8️⃣ Next Sale_Items_Id
    const [maxRow] = await connection.query(
      "SELECT MAX(CAST(SUBSTRING(Sale_Items_Id, 4) AS UNSIGNED)) AS maxNum FROM add_sale_items"
    );
    let nextSaleItemNum = (maxRow[0]?.maxNum || 0) + 1;

    // 9️⃣ Insert sale items
    for (const item of items) {
      const {
        Item_Name,
        Item_HSN,
        Item_Category,
        Quantity,
        Item_Unit,
        Sale_Price,
        Discount_On_Sale_Price,
        Discount_Type_On_Sale_Price,
        Tax_Type,
        Tax_Amount,
        Amount,
      } = item;

      // Check item exists
      const [itemRows] = await connection.query(
        "SELECT * FROM add_item WHERE Item_Name = ? LIMIT 1",
        [Item_Name]
      );
      if (itemRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          message: `Item '${Item_Name}' not found in inventory.`,
        });
      }

      const Item_Id = itemRows[0].Item_Id;

      // Fetch safe tax type
      const [purchaseTax] = await connection.query(
        `SELECT Tax_Type FROM add_purchase_items WHERE Item_Id = ?
         ORDER BY id DESC LIMIT 1`,
        [Item_Id]
      );
      const safeTaxType = purchaseTax[0]?.Tax_Type || Tax_Type || "None";

      // Update stock
      await connection.query(
        `UPDATE add_item 
         SET Stock_Quantity = Stock_Quantity - ?, updated_at = NOW()
         WHERE Item_Id = ?`,
        [normalizeNumber(Quantity), Item_Id]
      );

      // Sale item ID
      const newSaleItemId = "SIT" + nextSaleItemNum.toString().padStart(3, "0");
      nextSaleItemNum++;

      // Insert into add_sale_items
      await connection.query(
        `INSERT INTO add_sale_items 
         (Sale_Items_Id, Sale_Id, Item_Id, Quantity, Sale_Price,
          Discount_On_Sale_Price, Discount_Type_On_Sale_Price,
          Tax_Type, Tax_Amount, Amount, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          newSaleItemId,
          newSaleId,
          Item_Id,
          normalizeNumber(Quantity),
          normalizeNumber(Sale_Price),
          cleanDiscount(Discount_On_Sale_Price),
          cleanValue(Discount_Type_On_Sale_Price),
          cleanValue(safeTaxType),
          normalizeNumber(Tax_Amount),
          normalizeNumber(Amount),
        ]
      );
    }

    // Commit finally
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Sale and items added successfully",
      saleId: newSaleId,
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error adding sale:", err);
    return res.status(500).json({
      success: false,
      message: "Duplicate entry detected. Please use unique values.",
      stack: err.stack,
    });
  } finally {
    if (connection) connection.release();
  }
};


const addNewSale = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Sanitize + validate
    const cleanData = sanitizeObject(req.body);
    const validation = saleNewItemFormSchema.safeParse(cleanData);
    if (!validation.success) {
      await connection.rollback();
      return res.status(400).json({ errors: validation.error.errors });
    }

    const {
      Party_Name,
      Invoice_Number,
      Invoice_Date,
      State_Of_Supply,
      Total_Amount,
      GSTIN,
      Total_Received,
      Balance_Due,
      Payment_Type,
      Reference_Number,
      items,
    } = validation.data;

    if (
      !Party_Name ||
      !Invoice_Number ||
      !Invoice_Date ||
      !State_Of_Supply ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      await connection.rollback();
      return res.status(400).json({
        message: "Star marked fields missing or items empty",
      });
    }
    const itemCountMap = new Map();
    for (const item of items) {
      const itemName = item.Item_Name?.trim().toLowerCase();
      if (!itemName) {
        await connection.rollback();
        return res.status(400).json({ message: "Item name missing." });
      }

      const qty = Number(item.Quantity) || 0;
      itemCountMap.set(itemName, (itemCountMap.get(itemName) || 0) + qty);
          const duplicates = [...itemCountMap.entries()].filter(([name]) =>
      items.filter((it) => it.Item_Name?.trim().toLowerCase() === name).length > 1
    );
    if (duplicates.length > 0) {
      const names = duplicates.map(([n]) => `'${n}'`).join(", ");
     await connection.rollback();
      return res.status(400).json({
        message: `Duplicate items detected: ${names}. Please ensure each item appears only once.`,
      });
    }
    }
    // 2️⃣ Validate unique invoice number
    const [existingInvoice] = await connection.query(
      "SELECT Invoice_Number FROM add_sale WHERE Invoice_Number = ? LIMIT 1",
      [Invoice_Number]
    );
    if (existingInvoice.length > 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ message: "Invoice number already exists, please use a new one." });
    }

    // 3️⃣ Fetch Party_Id
    const [partyRows] = await connection.query(
      "SELECT Party_Id FROM add_party WHERE Party_Name = ? LIMIT 1",
      [Party_Name]
    );
    if (partyRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Party not found." });
    }
    const Party_Id = partyRows[0].Party_Id;

    // 4️⃣ Generate new Sale_Id
    const [lastSale] = await connection.query(
      "SELECT Sale_Id FROM  add_new_sale ORDER BY id DESC LIMIT 1"
    );
      // let newSaleId = "SAL001";
      // if (lastSale.length > 0) {
      //   const num = parseInt(lastSale[0].Sale_Id.replace("SAL", "")) + 1;
      //   newSaleId = "SAL" + num.toString().padStart(3, "0");
      // }

  let nextSaleNum = 1;
    // if (lastHotel.length > 0) {
    //   nextHotelNum = Number(lastHotel[0].hotel_id.replace(/\D/g, "")) + 1;
    // }
     if (lastSale.length > 0) {
        // const num = parseInt(lastSale[0].Sale_Id.replace("SAL", "")) + 1;
        // newSaleId = "SAL" + num.toString().padStart(3, "0");
        nextSaleNum = parseInt(lastSale[0].Sale_Id.replace(/\D/g, "")) + 1;
      }
    const newSaleId = "SALS" + nextSaleNum.toString().padStart(4, "0");
    // 5️⃣ Insert into add_sale
    await connection.query(
      `INSERT INTO add_new_sale
       (Party_Id, Sale_Id, Invoice_Number, Invoice_Date, State_Of_Supply,
        Total_Amount, Total_Received, Balance_Due, Payment_Type, Reference_Number, 
        created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        Party_Id,
        newSaleId,
        Invoice_Number,
        Invoice_Date,
        State_Of_Supply,
        cleanValue(Total_Amount),
        cleanValue(Total_Received),
        cleanValue(Balance_Due),
        cleanValue(Payment_Type),
        cleanValue(Reference_Number),
      ]
    );


const [maxRow] = await connection.query(
  "SELECT MAX(CAST(SUBSTRING(Sale_Items_Id, 5) AS UNSIGNED)) AS maxNum FROM add_new_sale_items"
);
let nextSaleItemNum = (maxRow[0]?.maxNum || 0) + 1;

    // 7️⃣ Insert each sale item
    for (const item of items) {
      const {
        Item_Name,
        Item_HSN,
        Item_Image,
        Item_Category,
        Quantity,
        Item_Unit,
        Sale_Price,
        Discount_On_Sale_Price,
        Discount_Type_On_Sale_Price,
        Tax_Type,
        Tax_Amount,
        Amount,
      } = item;
   
      let Item_Id;
      // Ensure item exists
      const [itemRows] = await connection.query(
        "SELECT * FROM add_item_sale WHERE Item_Name = ? LIMIT 1",
        [Item_Name]
      );
      if (itemRows.length === 0) {
       const [lastItem] = await connection.query(
          "SELECT Item_Id FROM add_item_sale ORDER BY id DESC LIMIT 1"
        );

        let newItemId = "ITMS001";
        if (lastItem.length > 0) {
          const lastNum = parseInt(lastItem[0].Item_Id.replace("ITMS", "")) + 1;
          newItemId = "ITMS" + lastNum.toString().padStart(4, "0");
        }

        await connection.execute(
          `INSERT INTO add_item_sale 
           (Item_Id, Item_Name, Item_HSN, Item_Unit, Item_Image, 
           Item_Category, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            newItemId,
            Item_Name,
            Item_HSN || "",
            Item_Unit || "",
            cleanValue(Item_Image),
            Item_Category || ""
            
          ]
        );

        Item_Id = newItemId;
      } else {
        // Existing item → update stock
        const existingItem = itemRows[0];
        Item_Id = existingItem.Item_Id;

        if (
          existingItem.Item_HSN &&
          Item_HSN &&
          existingItem.Item_HSN.trim() !== Item_HSN.trim()
        ) {
          await connection.rollback();
          return res.status(400).json({
            message: `Item '${Item_Name}' already exists with different HSN (${existingItem.Item_HSN}).`,
          });
        }

        await connection.execute(
          `UPDATE add_item_sale
           SET  updated_at = NOW()
           WHERE Item_Id = ?`,
          [ Item_Id]
        );
      }

   
 
      // // Generate new sale item id safely
      const newSaleItemId = "SITS" + nextSaleItemNum.toString().padStart(4, "0");
      nextSaleItemNum++;

      // Insert into add_sale_items
      await connection.query(
        `INSERT INTO add_new_sale_items 
         (Sale_Items_Id, Sale_Id, Item_Id, Quantity, Sale_Price, 
          Discount_On_Sale_Price, Discount_Type_On_Sale_Price, 
          Tax_Type, Tax_Amount, Amount, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          newSaleItemId,
          newSaleId,
          Item_Id,
          normalizeNumber(Quantity),
          normalizeNumber(Sale_Price),
          cleanDiscount(Discount_On_Sale_Price),
          cleanValue(Discount_Type_On_Sale_Price),
          cleanValue(Tax_Type),
          normalizeNumber(Tax_Amount),
          normalizeNumber(Amount),
        ]
      );
    }

    // 8️⃣ Commit everything
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Sale and items added successfully",
      saleId: newSaleId,
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error adding sale:", err);
    return res.status(500).json({
      success: false,
      message: "Duplicate entry detected. Please use unique values.",
      stack: err.stack,
    });
  } finally {
    if (connection) connection.release();
  }
};

const getAllSales = async (req, res, next) => {
  let connection;
  try {
 connection = await db.getConnection();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const search = req.query.search ? req.query.search.trim().toLowerCase() : "";
    const fromDate = req.query.fromDate || null;
    const toDate = req.query.toDate || null;

    console.log("🔍 Params =>", { page, search, fromDate, toDate });

    let whereClauses = [];
    let params = [];

    // 🔎 Search
    if (search) {
      whereClauses.push(`
        (LOWER(a.Party_Name) LIKE ? 
         OR LOWER(s.Payment_Type) LIKE ? 
         OR LOWER(s.Balance_Due) LIKE ? 
         OR LOWER(s.Total_Amount) LIKE ?)
      `);
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }

    // 📅 Date Range
    if (fromDate && toDate) {
      whereClauses.push("DATE(s.created_at) BETWEEN ? AND ?");
      params.push(fromDate, toDate);
    } else if (fromDate) {
      whereClauses.push("DATE(s.created_at) >= ?");
      params.push(fromDate);
    } else if (toDate) {
      whereClauses.push("DATE(s.created_at) <= ?");
      params.push(toDate);
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // 🧠 Main Paginated Query
    const query = `
      SELECT s.*, a.Party_Name
      FROM add_sale s
      LEFT JOIN add_party a ON s.Party_Id = a.Party_Id
      ${whereSQL}
      ORDER BY s.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);

    //const [rows] = await db.query(query, params);


    // const [rows] = await db.query(
    //   `SELECT s.*, a.Party_Name 
    //    FROM add_sale s
    //    LEFT JOIN add_party a ON s.Party_Id = a.Party_Id
    //    ORDER BY s.created_at DESC
    //    LIMIT ? OFFSET ?`,
    //   [limit, offset]
    // );
    const [count] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM add_sale s
      LEFT JOIN add_party a ON s.Party_Id = a.Party_Id
      ${whereSQL}
      `,
      params.slice(0, params.length - 2)
    );

    // const [count] = await db.query(
    //   `SELECT COUNT(*) AS total FROM add_sale`
    // )
    return res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(count[0].total / limit),
      totalSales: count[0].total,
      sales: rows,
    });

    //return res.status(200).json(rows);
  } catch (err) {
    if(connection)  connection.release();
    console.error("❌ Error fetching purchases:", err);
    next(err);
    // return res.status(500).json({ message: "Internal Server Error" });
  }finally {
    if(connection)  connection.release();
  }
};
const getAllNewSales = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const search = req.query.search ? req.query.search.trim().toLowerCase() : "";
    const fromDate = req.query.fromDate || null;
    const toDate = req.query.toDate || null;

    console.log("🔍 Params =>", { page, search, fromDate, toDate });

    let whereClauses = [];
    let params = [];

    // 🔎 Search
    if (search) {
      whereClauses.push(`
        (LOWER(a.Party_Name) LIKE ? 
         OR LOWER(s.Payment_Type) LIKE ? 
         OR LOWER(s.Balance_Due) LIKE ? 
         OR LOWER(s.Total_Amount) LIKE ?)
      `);
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }

    // 📅 Date Range
    if (fromDate && toDate) {
      whereClauses.push("DATE(s.created_at) BETWEEN ? AND ?");
      params.push(fromDate, toDate);
    } else if (fromDate) {
      whereClauses.push("DATE(s.created_at) >= ?");
      params.push(fromDate);
    } else if (toDate) {
      whereClauses.push("DATE(s.created_at) <= ?");
      params.push(toDate);
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // 🧠 Main Paginated Query
    const query = `
      SELECT s.*, a.Party_Name
      FROM add_new_sale s
      LEFT JOIN add_party a ON s.Party_Id = a.Party_Id
      ${whereSQL}
      ORDER BY GREATEST(s.updated_at, s.created_at) DESC 
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);

    //const [rows] = await db.query(query, params);


    // const [rows] = await db.query(
    //   `SELECT s.*, a.Party_Name 
    //    FROM add_sale s
    //    LEFT JOIN add_party a ON s.Party_Id = a.Party_Id
    //    ORDER BY s.created_at DESC
    //    LIMIT ? OFFSET ?`,
    //   [limit, offset]
    // );
    const [count] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM add_new_sale s
      LEFT JOIN add_party a ON s.Party_Id = a.Party_Id
      ${whereSQL}
      `,
      params.slice(0, params.length - 2)
    );

    // const [count] = await db.query(
    //   `SELECT COUNT(*) AS total FROM add_sale`
    // )
    return res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(count[0].total / limit),
      totalSales: count[0].total,
      sales: rows,
    });

    //return res.status(200).json(rows);
  } catch (err) {
    if(connection)  connection.release();
    console.error("❌ Error fetching purchases:", err);
    next(err);
    // return res.status(500).json({ message: "Internal Server Error" });
  }finally {
    if(connection)  connection.release();
  }
};
// const getSingleSale = async (req, res, next) => {
//   try {
//     const { Sale_Id: saleId } = req.params;

//     if (!saleId) {
//       return res.status(400).json({ success: false, message: "Sale ID is required." });
//     }

//     // ✅ Fetch sale header (includes invoice + party info)
//     const [saleData] = await db.query(
//       `
//       SELECT 
//         s.Sale_Id,
//         s.Invoice_Number,
//         s.Invoice_Date,
//         s.Reference_Number,
//         s.State_Of_Supply,
//         s.Payment_Type,
//         s.Total_Amount,
//         s.Total_Received,
//         s.Balance_Due,
//         s.Party_Id,
//         p.Party_Name,
//         p.GSTIN,
//         p.Billing_Address,
//         p.Shipping_Address
//       FROM add_sale s
//       LEFT JOIN add_party p ON s.Party_Id = p.Party_Id
//       WHERE s.Sale_Id = ?
//       `,
//       [saleId]
//     );

//     if (saleData.length === 0) {
//       return res.status(404).json({ success: false, message: "Sale not found." });
//     }

//     const saleHeader = saleData[0];

//     // ✅ Fetch all sale items related to that Sale_Id
//     const [items] = await db.query(
//       `
//       SELECT 
//         si.Sale_Items_Id,
//         si.Item_Id,
//         i.Item_Name,
//         i.Item_HSN,
//         i.Item_Unit,
//         i.Item_Category,
//         si.Quantity,
//         si.Sale_Price,
//         si.Discount_On_Sale_Price,
//         si.Discount_Type_On_Sale_Price,
//         si.Tax_Amount,
//         // si.Tax_Type,
//         si.Amount,
//         si.created_at
//       FROM add_sale_items si
//       LEFT JOIN add_item i ON si.Item_Id = i.Item_Id
//       WHERE si.Sale_Id = ?
//       ORDER BY si.created_at DESC
//       `,
//       [saleId]
//     );

//     const [Tax_Types]= await db.query(
//       `SELECT p.Tax_Type FROM add_purchase_items p 
//       LEFT JOIN add_item i ON p.Item_Id = i.Item_Id
//       WHERE p.Item_Id = ?`,
//       [ items[0].Item_Id]
//     )
//     if (items.length === 0) {
//       return res.status(404).json({ success: false, message: "No sale items found for this invoice." });
//     }

   

//     // ✅ Combine and send response
//     const response = {
//       success: true,
//       invoicePartyDetails: {
//         Sale_Id: saleHeader.Sale_Id,
//         Party_Name: saleHeader.Party_Name,
//         GSTIN: saleHeader.GSTIN,
//         State_Of_Supply: saleHeader.State_Of_Supply,
//         Reference_Number: saleHeader.Reference_Number,
//         Invoice_Number: saleHeader.Invoice_Number,
//         Invoice_Date: saleHeader.Invoice_Date,
//         Payment_Type: saleHeader.Payment_Type,
//         Total_Amount: saleHeader.Total_Amount,
//         Total_Received: saleHeader.Total_Received,
//         Balance_Due: saleHeader.Balance_Due,
//         Billing_Address: saleHeader.Billing_Address,
//         Shipping_Address: saleHeader.Shipping_Address,
//       },
//       items: items.map((it) => ({
//         Sale_Items_Id: it.Sale_Items_Id,
//         Item_Id: it.Item_Id,
//         Item_Name: it.Item_Name,
//         Item_HSN: it.Item_HSN,
//         Item_Unit: it.Item_Unit,
//         Item_Category: it.Item_Category,
//         Quantity: it.Quantity,
//         Sale_Price: it.Sale_Price,
//         Discount_On_Sale_Price: it.Discount_On_Sale_Price,
//         Discount_Type_On_Sale_Price: it.Discount_Type_On_Sale_Price,
//         Tax_Amount: it.Tax_Amount,
//            Tax_Type: Tax_Types[0].Tax_Type,
//         // Tax_Type: it.Tax_Type,
//         Amount: it.Amount,
//         created_at: it.created_at,
//       })),
//     };

//     return res.status(200).json(response);
//   } catch (err) {
//     console.error("❌ Error getting single sale:", err);
//     next(err);
//   }
// };

// const getSingleSale= async (req, res, next) => {

//     try{
//       //const saleId=req.params.id;
//         const {Sale_Id:saleId} = req.params;

//         if(!saleId){
//             return res.status(400).json({message:"Sale id is required"});
//         }
//         const [sale] = await db.query("SELECT * FROM add_sale WHERE Sale_Id = ?", [saleId]);
//         if(sale.length === 0){
//             return res.status(404).json({message:"Sale not found"});
//         }
//         const [saleItems] = await db.query(`SELECT * FROM add_sale_items WHERE Sale_Id IN (
//             SELECT Sale_Id FROM add_sale WHERE Sale_Id = ?
//         )`, 
//         [saleId]);

//         if(saleItems.length === 0){
//             return res.status(404).json({message:"Sale items not found"});
//         }
//         let itemIds=[];
//         let saleIds=[]
//         saleItems.forEach((item) => {

//           itemIds.push(item.Item_Id);
//           saleIds.push(item.Sale_Id);

//         })
//         const[items]=await db.query("SELECT * FROM add_item WHERE Item_Id IN (?)", [itemIds]);

//         const[salePartyDetails]=await db.query("SELECT * FROM add_sale WHERE Sale_Id IN (?)", [saleIds]);

//           let partyIds=[];
//           salePartyDetails.forEach((item) => {
//             console.log(item.Party_Id)
//             partyIds.push(item.Party_Id);
//           })
//           const[partyNames]=await db.query("SELECT * FROM add_party WHERE Party_Id IN (?)", [partyIds]);
//         //  console.log(items,salePartyDetails);
//       //   const combinedSaleItemsDetails = saleItems.map((item) => ({
//       //     ...item,
//       //     GSTIN: partyNames.find((p) => p.Party_Id === salePartyDetails.find((s) => s.Sale_Id === item.Sale_Id)?.Party_Id)?.GSTIN || "",
//       //     Party_Id: salePartyDetails.find((s) => s.Sale_Id === item.Sale_Id)?.Party_Id || "",
//       //     State_Of_Supply: salePartyDetails.find((s) => s.Sale_Id === item.Sale_Id)?.State_Of_Supply || "",
//       //     Invoice_Date: salePartyDetails.find((s) => s.Sale_Id === item.Sale_Id)?.Invoice_Date || "",
//       //     Invoice_Number: salePartyDetails.find((s) => s.Sale_Id === item.Sale_Id)?.Invoice_Number || "",
//       //     Reference_Number: salePartyDetails.find((s) => s.Sale_Id === item.Sale_Id)?.Reference_Number || "",
//       //     Payment_Type: salePartyDetails.find((s) => s.Sale_Id === item.Sale_Id)?.Payment_Type || "",
//       // Party_Name: partyNames.find((p) => p.Party_Id === salePartyDetails.find((s) => s.Sale_Id === item.Sale_Id)?.Party_Id)?.Party_Name || "",
//       //     Item_Name: items.find((i) => i.Item_Id === item.Item_Id)?.Item_Name || "",
//       //     Item_HSN: items.find((i) => i.Item_Id === item.Item_Id)?.Item_HSN || "",
//       //     Item_Unit: items.find((i) => i.Item_Id === item.Item_Id)?.Item_Unit || "",
//       //     Item_Category: items.find((i) => i.Item_Id === item.Item_Id)?.Item_Category || "",

//       //   }))
//       const combinedSaleItemsDetails=new Map();
//       saleItems.forEach((item) => {
//         const saleId = item.Sale_Id;
//         if (!combinedSaleItemsDetails.has(saleId)) {
//           combinedSaleItemsDetails.set(saleId, {
//             ...item,
//             GSTIN: partyNames.find((p) => p.Party_Id === salePartyDetails.find((s) => s.Sale_Id === item.Sale_Id)?.Party_Id)?.GSTIN || "",
//             Party_Id: salePartyDetails.find((s) => s.Sale_Id === item.Sale_Id)?.Party_Id || "",
//             State_Of_Supply: salePartyDetails.find((s) => s.Sale_Id === item.Sale_Id)?.State_Of_Supply || "",
//             Invoice_Date: salePartyDetails.find((s) => s.Sale_Id === item.Sale_Id)?.Invoice_Date || "",
//             Invoice_Number: salePartyDetails.find((s) => s.Sale_Id === item.Sale_Id)?.Invoice_Number || "",
//             Reference_Number: salePartyDetails.find((s) => s.Sale_Id === item.Sale_Id)?.Reference_Number || "",
//             Payment_Type: salePartyDetails.find((s) => s.Sale_Id === item.Sale_Id)?.Payment_Type || "",
//             Party_Name: partyNames.find((p) => p.Party_Id === salePartyDetails.find((s) => s.Sale_Id === item.Sale_Id)?.Party_Id)?.Party_Name || "",

//             Item_Name: items.find((i) => i.Item_Id === item.Item_Id)?.Item_Name || "",
//             Item_HSN: items.find((i) => i.Item_Id === item.Item_Id)?.Item_HSN || "",
//             Item_Unit: items.find((i) => i.Item_Id === item.Item_Id)?.Item_Unit || "",
//             Item_Category: items.find((i) => i.Item_Id === item.Item_Id)?.Item_Category || "",
//           });
//       }else{
//         combinedSaleItemsDetails.set(saleId, {
//           ...combinedSaleItemsDetails.get(saleId),
//           ...item
//         })
//       }
//       });
//       console.log(Array.from(combinedSaleItemsDetails.values()));  
//         return res.status(200).json({ success: true, saleItems: Array.from(combinedSaleItemsDetails.values()) });
//     }catch(err){
//         console.error("❌ Error getting single sale:", err);
//         next(err);
//         // return res.status(500).json({ message: "Internal Server Error" });
//     }
// }
// const getLatestInvoiceNumber = async (req, res, next) => {
//   try {
//     // Fetch the latest invoice by creation date
//     const [rows] = await db.query(`
//       SELECT 
//         Invoice_Number AS latestInvoice, 
//         created_at AS createdAt
//       FROM add_sale
//       ORDER BY created_at DESC
//       LIMIT 1
//     `);

//     const[InvoiceName]=await db.query("SELECT * FROM add_invoice ");
//     let newInvoiceNumber = "001";
//     let latestInvoiceInfo = null;

//     if (rows.length > 0 && rows[0].latestInvoice) {
//       // const lastInvoice = rows[0].latestInvoice;
//       // const num = parseInt(lastInvoice.replace("INV", "")) + 1;
//       // newInvoiceNumber = "INV" + num.toString().padStart(3, "0");

//      const lastInvoice = rows[0].latestInvoice;
//      const num= parseInt(lastInvoice.replace(InvoiceName[0].Invoice_Name, "")) + 1;
//      newInvoiceNumber = InvoiceName[0].Invoice_Name + num.toString()
//       latestInvoiceInfo = {
//         lastInvoiceNumber: lastInvoice,
//         createdAt: rows[0].createdAt,
//       };
//     }

//     return res.status(200).json({
//       newInvoiceNumber,
//       latestInvoiceInfo,
//     });
//   } catch (err) {
//     console.error("❌ Error getting latest invoice number:", err);
//     next(err);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };
// const getLatestInvoiceNumber = async (req, res, next) => {
//   try {
//     // 1️⃣ Fetch latest invoice (if any)
//     const [rows] = await db.query(`
//       SELECT 
//         Invoice_Number AS latestInvoice, 
//         created_at AS createdAt
//       FROM add_sale
//       ORDER BY created_at DESC
//       LIMIT 1
//     `);

//     // 2️⃣ Fetch user-defined invoice prefix
//     const [invoiceSettings] = await db.query(`SELECT Invoice_Name FROM add_invoice LIMIT 1`);

//     // 3️⃣ Validate that prefix exists
//     if (!invoiceSettings || invoiceSettings.length === 0 || !invoiceSettings[0].Invoice_Name) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invoice prefix not set. Please configure an invoice prefix in settings before generating invoices.",
//       });
//     }

//     const prefix = invoiceSettings[0].Invoice_Name.trim();
//     let newInvoiceNumber = `${prefix}001`;
//     let latestInvoiceInfo = null;

//     // 4️⃣ If previous invoices exist, increment the number
//     if (rows.length > 0 && rows[0].latestInvoice) {
//       const lastInvoice = rows[0].latestInvoice;

//       // remove prefix to get numeric part
//       const numericPart = lastInvoice.replace(prefix, "").trim();
//       const num = isNaN(parseInt(numericPart)) ? 1 : parseInt(numericPart) + 1;

//       // pad the number with leading zeros
//       newInvoiceNumber = `${prefix}${num.toString().padStart(4, "0")}`;

//       latestInvoiceInfo = {
//         lastInvoiceNumber: lastInvoice,
//         createdAt: rows[0].createdAt,
//       };
//     }

//     // 5️⃣ Send response
//     return res.status(200).json({
//       success: true,
//       newInvoiceNumber,
//       latestInvoiceInfo,
//     });
//   } catch (err) {
//     console.error("❌ Error getting latest invoice number:", err);
//     next(err);
//     // return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const getSingleSale = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    const { Sale_Id: saleId } = req.params;
    const isSaleForItemSale = saleId.startsWith("SALS");
    const itemTable = isSaleForItemSale ? "add_item_sale" : "add_item";
    const saleItemTable = isSaleForItemSale ? "add_new_sale_items" : "add_sale_items";
    const salesTable = isSaleForItemSale ? "add_new_sale" : "add_sale";
    const taxTypeTable = isSaleForItemSale ? "add_new_sale_items" : "add_purchase_items";
    if (!saleId) {
      return res.status(400).json({ success: false, message: "Sale ID is required." });
    }

    // 1️⃣ Fetch Sale Header
    const [saleData] = await db.query(
      `
      SELECT 
        s.Sale_Id,
        s.Invoice_Number,
        s.Invoice_Date,
        s.Reference_Number,
        s.State_Of_Supply,
        s.Payment_Type,
        s.Total_Amount,
        s.Total_Received,
        s.Balance_Due,
        s.Party_Id,
        p.Party_Name,
        p.GSTIN,
        p.Billing_Address,
        p.Shipping_Address
      FROM ${salesTable} s
      LEFT JOIN add_party p ON s.Party_Id = p.Party_Id
      WHERE s.Sale_Id = ?
      `,
      [saleId]
    );

    if (!saleData.length) {
      return res.status(404).json({ success: false, message: "Sale not found." });
    }

    const saleHeader = saleData[0];

    // 2️⃣ Determine which item table to use


    // 3️⃣ Fetch items for this sale
    const [items] = await db.query(
      `
      SELECT 
        si.Sale_Items_Id,
        si.Item_Id,
        i.Item_Name,
        i.Item_HSN,
        i.Item_Unit,
        i.Item_Category,
        si.Quantity,
        si.Sale_Price,
        si.Discount_On_Sale_Price,
        si.Discount_Type_On_Sale_Price,
        si.Tax_Amount,
        si.Amount,
        si.created_at,
        (
          SELECT p.Tax_Type 
          FROM ${taxTypeTable} p
          WHERE p.Item_Id = si.Item_Id
          ORDER BY GREATEST(p.created_at, p.updated_at) DESC 
          LIMIT 1
        ) AS Tax_Type
      FROM ${saleItemTable} si
      LEFT JOIN ${itemTable} i ON si.Item_Id = i.Item_Id
      WHERE si.Sale_Id = ?
      ORDER BY si.created_at DESC
      `,
      [saleId]
    );

    if (!items.length) {
      return res.status(404).json({ success: false, message: 
        "No sale items found for this invoice." });
    }

    // 4️⃣ Format response
    const response = {
      success: true,
      invoicePartyDetails: {
        Sale_Id: saleHeader.Sale_Id,
        Party_Name: saleHeader.Party_Name,
        GSTIN: saleHeader.GSTIN,
        State_Of_Supply: saleHeader.State_Of_Supply,
        Reference_Number: saleHeader.Reference_Number,
        Payment_Type: saleHeader.Payment_Type,
        Invoice_Number: saleHeader.Invoice_Number,
        Invoice_Date: saleHeader.Invoice_Date,
        Payment_Type: saleHeader.Payment_Type,
        Total_Amount: saleHeader.Total_Amount,
        Total_Received: saleHeader.Total_Received,
        Balance_Due: saleHeader.Balance_Due,
        Billing_Address: saleHeader.Billing_Address,
        Shipping_Address: saleHeader.Shipping_Address,
      },
      items: items.map((it) => ({
        Sale_Items_Id: it.Sale_Items_Id,
        Item_Id: it.Item_Id,
        Item_Name: it.Item_Name,
        Item_HSN: it.Item_HSN,
        Item_Unit: it.Item_Unit,
        Item_Category: it.Item_Category,
        Quantity: it.Quantity,
        Sale_Price: it.Sale_Price,
        Discount_On_Sale_Price: it.Discount_On_Sale_Price,
        Discount_Type_On_Sale_Price: it.Discount_Type_On_Sale_Price,
        Tax_Amount: it.Tax_Amount,
        Tax_Type: it.Tax_Type || "None",
        Amount: it.Amount,
        created_at: it.created_at,
      })),
    };

    return res.status(200).json(response);

  } catch (err) {
    if (connection) connection.release();
    console.error("❌ Error getting single sale:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


const generateInvoiceHtml = (sale) => {
  const { invoicePartyDetails, items } = sale;


  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 10px;
          }

          /* --- Invoice Meta Section --- */
          .meta-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 12px;
            margin: 20px 0;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 12px;
          }

          .meta-item {
            flex: 1 1 45%;
            min-width: 250px;
          }

          .meta-item strong {
            display: block;
            font-weight: bold;
            color: #222;
            margin-bottom: 4px;
          }

          /* --- Address Section --- */
          .address-section {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            overflow: hidden;
          }

          .address-box {
            flex: 1;
            padding: 12px 16px;
          }

          .address-box h4 {
            margin-bottom: 8px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 4px;
          }

          .divider {
            width: 1px;
            background-color: #e0e0e0;
          }

          /* --- Items Table --- */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: center;
          }

          th {
            background-color: #f8f8f8;
          }

          /* --- Totals Section --- */
          .totals {
            margin-top: 20px;
            float: right;
          }

          .totals table {
            border-collapse: collapse;
          }

          .totals td {
            padding: 6px 12px;
            border: 1px solid #ccc;
          }
    footer { position: fixed; bottom: 30px; left: 0; right: 0; text-align: center; font-size: 12px; 
    color: #555; }
         
        </style>
      </head>
      <body>
        <header>
          <h1>Invoice</h1>
          <div class="invoice-meta">
            <strong>Invoice Number:</strong> ${invoicePartyDetails?.Invoice_Number || "N/A"}<br/>
            <strong>Date:</strong> ${new Date(invoicePartyDetails?.Invoice_Date).toLocaleDateString("en-IN")}
          </div>
        </header>

        <!-- 🧾 Meta Information -->
        <div class="meta-container">
          <div class="meta-item">
            <strong>Party Name</strong>
            <span>${invoicePartyDetails?.Party_Name || "N/A"}</span>
          </div>

          <div class="meta-item">
            <strong>GSTIN</strong>
            <span>${invoicePartyDetails?.GSTIN || "N/A"}</span>
          </div>

          <div class="meta-item">
            <strong>State of Supply</strong>
            <span>${invoicePartyDetails?.State_Of_Supply || "N/A"}</span>
          </div>

          <div class="meta-item">
            <strong>Payment Type</strong>
            <span>${invoicePartyDetails?.Payment_Type || "N/A"}</span>
          </div>

          ${
            invoicePartyDetails?.Reference_Number
              ? `<div class="meta-item" style="flex: 1 1 100%;">
                  <strong>Reference Number</strong>
                  <span>${invoicePartyDetails.Reference_Number}</span>
                </div>`
              : ""
          }
        </div>

        
        
          
              <div class="address-section">
                ${
                  invoicePartyDetails?.Billing_Address
                    ? `<div class="address-box">
                        <h4>Billed To</h4>
                        <p>${invoicePartyDetails.Billing_Address}</p>
                      </div>`
                    : ""
                }
                ${
                  invoicePartyDetails?.Shipping_Address
                    ? `<div class="divider"></div>
                      <div class="address-box">
                        <h4>Shipped To</h4>
                        <p>${invoicePartyDetails.Shipping_Address}</p>
                      </div>`
                    : ""
                }
              </div>
            
        

        <!-- 📦 Items Table -->
        <table>
          <thead>
            <tr>
              <th>Sl.No</th>
              <th>Category</th>
              <th>Item</th>
              <th>HSN</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Tax Type</th>
              <th>Tax</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${
              items
                ?.map(
                  (it, idx) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>${it?.Item_Category || ""}</td>
                      <td>${it?.Item_Name || ""}</td>
                      <td>${it?.Item_HSN || ""}</td>
                      <td>${it?.Quantity || 0} ${it?.Item_Unit || ""}</td>
                      <td>${Number(it?.Sale_Price || 0).toFixed(2)}</td>
                      <td>${
                        it?.Discount_Type_On_Sale_Price === "Percentage"
                          ? it?.Discount_On_Sale_Price==0.00 ? "0%" : it?.Discount_On_Sale_Price + "%"
                          : "₹" + it?.Discount_On_Sale_Price
                      }</td>
                      <td>${
                        Object.keys(TAX_TYPES).includes(it?.Tax_Type)
                          ? TAX_TYPES[it?.Tax_Type]
                          : it?.Tax_Type
                      }</td>
                      <td>${Number(it?.Tax_Amount || 0).toFixed(2)}</td>
                      <td>${Number(it?.Amount || 0).toFixed(2)}</td>
                    </tr>
                  `
                )
                .join("") || ""
            }
          </tbody>
        </table>

        <!-- 💰 Totals Section -->
        <div class="totals">
          <table>
            <tr><td><strong>Total Amount</strong></td><td>${invoicePartyDetails?.Total_Amount || 0}</td></tr>
            <tr><td><strong>Received</strong></td><td>${invoicePartyDetails?.Total_Received || 0}</td></tr>
            <tr><td><strong>Balance Due</strong></td><td>${invoicePartyDetails?.Balance_Due || 0}</td></tr>
          </table>
        </div>

        <footer>Thank you for your business!</footer>
      </body>
    </html>
  `;

  return html;
};




// Main controller function to handle PDF creation
// const printSaleBill = async (req, res, next) => {
//   // 1. Fetch data (replace this with your actual DB query logic)
//   // For demonstration, assume 'sale' data is fetched here:
//  const sale = req.body;
//   console.log(sale);
//   if (!sale) {
//     return res.status(400).send("No invoice data provided.");
//   }

//   // 2. Generate the HTML content
//   const htmlContent = generateInvoiceHtml(sale);

//   let browser;
//   try {
//     // 3. Launch Puppeteer (headless Chrome)
//     browser = await puppeteer.launch({
//       args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
//     const page = await browser.newPage();

//     // 4. Set the HTML content
//     await page.setContent(htmlContent, {
//       waitUntil: 'networkidle0' // Wait until the network is idle
//     });

//     // 5. Generate PDF
//     const pdfBuffer = await page.pdf({
//       format: 'A4',
//       printBackground: true, // Ensure background colors/images are printed
//       preferCSSPageSize: true, // Use sizes defined in CSS @page rules if present
//     });

//     // 6. Send the PDF buffer back to the client
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `inline; filename=Invoice-${sale?.invoicePartyDetails?.Invoice_Number}.pdf`);
//     res.send(pdfBuffer);

//   } catch (error) {
//     console.error('PDF Generation Error:', error);
//     // next(error);
//     return res.status(500).send('Error generating PDF.');
//   } finally {
//     if (browser) {
//       await browser.close();
//     }
//   }
// };
// const printSaleBill = async (req, res) => {
//   const sale = req.body;
//   if (!sale) return res.status(400).send("No invoice data provided.");

//   const htmlContent = generateInvoiceHtml(sale);
//   const file = { content: htmlContent };

//   try {
//     const pdfBuffer = await pdf.generatePdf(file, {
//       format: "A4",
//       printBackground: true,
//       preferCSSPageSize: true,
//     });

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `inline; filename=Invoice-${sale?.invoicePartyDetails?.Invoice_Number}.pdf`
//     );
//     res.send(pdfBuffer);
//   } catch (err) {
//     console.error("PDF generation failed:", err);
//     res.status(500).send("Error generating PDF");
//   }
// };


const fonts = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};




const printer = new PdfPrinter(fonts);


const printSaleBill = async (req, res) => {
  try {
    const sale = req.body;
    if (!sale) return res.status(400).send("No invoice data provided.");

    const { invoicePartyDetails, items } = sale;
    const safe = (v) => (v ? v : "N/A");

    const docDefinition = {
      pageMargins: [30, 30, 30, 60], // left, top, right, bottom (space for footer)
      footer: (currentPage, pageCount) => ({
        text: `Thank you for your business! — Page ${currentPage} of ${pageCount}`,
        alignment: "center",
        fontSize: 10,
        color: "#555",
        margin: [0, 10, 0, 0],
      }),

      content: [
        // 🧾 HEADER (Centered)
        {
          stack: [
            { text: "INVOICE", style: "header", alignment: "center" },
            {
              columns: [
                {
                  width: "*",
                  alignment: "center",
                  stack: [
                    {
                      text: `Invoice Number: ${safe(invoicePartyDetails?.Invoice_Number)}`,
                      style: "meta",
                      alignment: "center",
                    },
                    {
                      text: `Date: ${new Date(
                        invoicePartyDetails?.Invoice_Date
                      ).toLocaleDateString("en-IN")}`,
                      style: "meta",
                      alignment: "center",
                    },
                  ],
                },
              ],
            },
          ],
          margin: [0, 0, 0, 15],
        },

      
{
  style: "section",
  table: {
    widths: ["50%", "50%"],
    body: [
      [
        {
          stack: [
            { text: "Party Name", style: "label", margin: [0, 2, 0, 1] },
            { text: safe(invoicePartyDetails?.Party_Name), style: "value", margin: [0, 0, 0, 4] },
            { text: "GSTIN", style: "label", margin: [0, 2, 0, 1] },
            { text: safe(invoicePartyDetails?.GSTIN), style: "value", margin: [0, 0, 0, 4] },
          ],
          border: [false, false, true, false],
        },
        {
          stack: [
            { text: "State of Supply", style: "label", margin: [0, 2, 0, 1] },
            { text: safe(invoicePartyDetails?.State_Of_Supply), style: "value", margin: [0, 0, 0, 4] },
            { text: "Payment Type", style: "label", margin: [0, 2, 0, 1] },
            { text: safe(invoicePartyDetails?.Payment_Type), style: "value", margin: [0, 0, 0, 4] },
            ...(invoicePartyDetails?.Reference_Number
              ? [
                  { text: "Reference Number", style: "label", margin: [0, 2, 0, 1] },
                  { text: invoicePartyDetails.Reference_Number, style: "value", margin: [0, 0, 0, 4] },
                ]
              : []),
          ],
        },
      ],
    ],
  },
  layout: "lightHorizontalLines",
  margin: [0, 5, 0, 5], // Adds spacing around the table itself
},

        // 🏠 Addresses
        {
          columns: [
            invoicePartyDetails?.Billing_Address
              ? {
                  width: "50%",
                  stack: [
                    { text: "Billed To", style: "labelBold" },
                    { text: invoicePartyDetails.Billing_Address, style: "value" },
                  ],
                }
              : {},
            invoicePartyDetails?.Shipping_Address
              ? {
                  width: "50%",
                  stack: [
                    { text: "Shipped To", style: "labelBold" },
                    { text: invoicePartyDetails.Shipping_Address, style: "value" },
                  ],
                }
              : {},
          ],
          columnGap: 20,
          margin: [0, 10, 0, 0],
        },

        // 📦 Items Table
        {
          style: "tableExample",
          table: {
            headerRows: 1,
            widths: [30, 50, 50, 45, 35, 40, 50, 50, 45, 55],
            body: [
              [
                { text: "Sl.No", style: "tableHeader" },
                { text: "Category", style: "tableHeader" },
                { text: "Item", style: "tableHeader" },
                { text: "HSN", style: "tableHeader" },
                { text: "Qty", style: "tableHeader" },
                { text: "Price", style: "tableHeader" },
                { text: "Discount", style: "tableHeader" },
                { text: "Tax Type", style: "tableHeader" },
                { text: "Tax", style: "tableHeader" },
                { text: "Amount", style: "tableHeader" },
              ],
              ...items.map((it, idx) => [
                { text: idx + 1, style: "numeric" },
                safe(it.Item_Category),
                safe(it.Item_Name),
                safe(it.Item_HSN),
                { text: `${it.Quantity || 0} ${safe(it.Item_Unit)}`, style: "numeric" },
                { text: Number(it?.Sale_Price || 0).toFixed(2), style: "numeric" },
                {
                  text:
                    it?.Discount_Type_On_Sale_Price === "Percentage"
                      ? it?.Discount_On_Sale_Price == 0.0
                        ? "0%"
                        : `${it.Discount_On_Sale_Price}%`
                      : "₹" + (it.Discount_On_Sale_Price || 0),
                  style: "numeric",
                },
                 Object.keys(TAX_TYPES).includes(it?.Tax_Type)
                          ? TAX_TYPES[it?.Tax_Type]
                          : it?.Tax_Type,
                // safe(it.Tax_Type),
                { text: Number(it?.Tax_Amount || 0).toFixed(2), style: "numeric" },
                { text: Number(it?.Amount || 0).toFixed(2), style: "numeric" },
              ]),
            ],
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? "#f2f2f2" : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
          },
          margin: [0, 10, 0, 0],
        },

        // 💰 Totals Box (Right Side)
        {
          columns: [
            { width: "*", text: "" },
            {
              width: "37%",
              table: {
                widths: ["*", "auto"],
                body: [
                  [{ text: "Total Amount", style: "labelBold" }, { text: `${invoicePartyDetails?.Total_Amount || 0}`, style: "numeric" }],
                  [{ text: "Received", style: "labelBold" }, { text: `${invoicePartyDetails?.Total_Received || 0}`, style: "numeric" }],
                  [
                    { text: "Balance Due", style: "labelBoldRed" },
                     //{ text: `${invoicePartyDetails?.Balance_Due || 0}` },
                    { text: `${invoicePartyDetails?.Balance_Due || 0}`, style: "numericRed" },
                  ],
                ],
              },
              layout: {
                hLineColor: "#999",
                vLineColor: "#999",
                fillColor: (rowIndex) => (rowIndex % 2 === 0 ? "#fafafa" : null),
              },
              margin: [0, 15, 0, 0],
            },
          ],
        },
      ],

      styles: {
        header: { fontSize: 18, bold: true, margin: [10, 10, 10, 10] },
        meta: { fontSize: 11, margin: [0, 2, 0, 2] },
        section: { margin: [0, 10, 0, 10] },
        tableHeader: { bold: true, fillColor: "#f2f2f2", fontSize: 11 },
        label: { bold: true, fontSize: 11 },
        labelBold: { bold: true, fontSize: 12, margin: [0, 5, 0, 3] },
        labelBoldRed: { bold: true, color: "black", fontSize: 11 },
        value: { fontSize: 11 },
        numeric: { alignment: "right", fontSize: 11 },
        numericRed: { alignment: "right", fontSize: 11, color: "black"},
        tableExample: { fontSize: 11 },
      },
      defaultStyle: { font: "Helvetica" },
    };

    // Generate PDF
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename=Invoice-${invoicePartyDetails?.Invoice_Number}.pdf`
      );
      res.send(pdfBuffer);
    });
    pdfDoc.end();
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).send("Error generating PDF");
  }
};

/**
 * Helper: Generate next ID (e.g., SIT001)
 */
const generateNextId = async (connection, table, column, prefix) => {
  const [latest] = await connection.query(
    `SELECT ${column} FROM ${table} ORDER BY id DESC LIMIT 1`
  );
  let nextNum = 1;
  if (latest.length > 0) {
    const lastId = latest[0][column];
    nextNum = parseInt(lastId.replace(prefix, "")) + 1;
  }
  return prefix + nextNum.toString().padStart(3, "0");
};

/**
 * Edit Sale Controller
 */

const editSale = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    const { Sale_Id: saleId } = req.params;

    // 1️⃣ Check if sale exists
    const [existingSale] = await connection.query(
      "SELECT * FROM add_sale WHERE Sale_Id = ?",
      [saleId]
    );
    if (existingSale.length === 0) {
      return res.status(404).json({ message: "No such Sale found." });
    }

    // 2️⃣ Validate & sanitize request
    const cleanData = sanitizeObject(req.body);
    const validation = saleSchema.safeParse(cleanData);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const {
      Party_Name,
      GSTIN,
      Invoice_Number,
      Invoice_Date,
      State_Of_Supply,
      Total_Amount,
      Total_Received,
      Balance_Due,
      Payment_Type,
      Reference_Number,
      items,
    } = validation.data;
 await connection.beginTransaction();

    if (!Array.isArray(items) || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "No sale items provided." });
    }
    const [partyRows] = await connection.query(
  "SELECT Party_Id, GSTIN FROM add_party WHERE Party_Name = ? LIMIT 1",
  [Party_Name]
);

if (partyRows.length === 0) {
  await connection.rollback();
  return res.status(404).json({ message: "Party not found." });
}
//    if (partyRows[0].GSTIN.trim() && partyRows[0].GSTIN.trim() !== GSTIN) {
//     console.error("GSTIN does not match with selected party.");
//   await connection.rollback();
//   return res.status(400).json({
//     message: "GSTIN does not match with selected party.",
//   });
// }
// 🔥 Important: Compare GSTIN from frontend with the one stored in DB
// if (partyRows[0].GSTIN.trim() !== GSTIN.trim()) {
//   await connection.rollback();
//   return res.status(400).json({
//     message: "GSTIN does not match the selected party. Invalid request.",
//   });
// }
   

    // 3️⃣ Prevent duplicate item names
    const seenItems = new Set();
    for (const item of items) {
      const name = item.Item_Name?.trim().toLowerCase();
      if (!name) {
        await connection.rollback();
        return res.status(400).json({ message: "Item name missing." });
      }
      if (seenItems.has(name)) {
        await connection.rollback();
        return res.status(400).json({
          message: `Duplicate item '${item.Item_Name}' found. Please ensure each item appears only once.`,
        });
      }
      seenItems.add(name);
    }

    // 4️⃣ Restore previous stock before re-updating sale
    const [oldItems] = await connection.query(
      "SELECT Item_Id, Quantity FROM add_sale_items WHERE Sale_Id = ?",
      [saleId]
    );


    for (const old of oldItems) {
      if(old.Item_Id===null || old.Item_Id===undefined) {
        await connection.rollback();
        return res.status(400).json({ message: "Invalid Item_Id in old sale items." });
      }
      if(old.Item_Id.startsWith("ITM")){
    await connection.query(
        `UPDATE add_item 
         SET Stock_Quantity = Stock_Quantity + ?, updated_at = NOW() 
         WHERE Item_Id = ?`,
        [old.Quantity, old.Item_Id]
      );
    
    }
    }

    // 5️⃣ Update sale master record
    await connection.query(
      `UPDATE add_sale SET 
        Party_Id = (SELECT Party_Id FROM add_party WHERE Party_Name = ? LIMIT 1),
        Invoice_Number = ?, 
        Invoice_Date = ?, 
        State_Of_Supply = ?, 
        Total_Amount = ?, 
        Total_Received = ?, 
        Balance_Due = ?, 
        Payment_Type = ?, 
        Reference_Number = ?, 
        updated_at = NOW()
       WHERE Sale_Id = ?`,
      [
        Party_Name,
        Invoice_Number,
        Invoice_Date,
        State_Of_Supply,
        cleanValue(Total_Amount),
        cleanValue(Total_Received),
        cleanValue(Balance_Due),
        cleanValue(Payment_Type),
        cleanValue(Reference_Number),
        saleId,
      ]
    );

    // 6️⃣ Fetch old sale items for reference
    const [oldSaleItems] = await connection.query(
      "SELECT Sale_Items_Id, Item_Id, Quantity, created_at FROM add_sale_items WHERE Sale_Id = ?",
      [saleId]
    );
    const oldSaleItemMap = new Map();
    for (const old of oldSaleItems) {
      oldSaleItemMap.set(old.Item_Id, old);
    }
const [maxIdRow] = await connection.query(
  "SELECT MAX(CAST(SUBSTRING(Sale_Items_Id, 4) AS UNSIGNED)) AS maxId FROM add_sale_items"
);
let nextSaleItemNum = (maxIdRow[0]?.maxId || 0) + 1;
   console.log(nextSaleItemNum);
    // Delete all old sale items (we’ll reinsert)
    await connection.query("DELETE FROM add_sale_items WHERE Sale_Id = ?", [saleId]);

    // 7️⃣ Fetch latest Sale_Items_Id once (to continue sequence safely)
    // const [latestItem] = await connection.query(
    //   "SELECT Sale_Items_Id FROM add_sale_items ORDER BY id DESC LIMIT 1"
    // );
    // let nextSaleItemNum = 1;
    // if (latestItem.length > 0) {
    //   const lastNum = parseInt(latestItem[0].Sale_Items_Id.replace("SIT", "")) + 1;
    //   nextSaleItemNum = lastNum;
    // }
 
 
    // 8️⃣ Reinsert sale items & adjust stock
    for (const item of items) {
      const [dbItem] = await connection.query(
        "SELECT Item_Id FROM add_item WHERE Item_Name = ? LIMIT 1",
        [item.Item_Name]
      );
 
      const Item_Id = dbItem[0]?.Item_Id;

      console.log("Item_Id:",Item_Id);
   

      if (!Item_Id) {
        await connection.rollback();
        return res
          .status(404)
          .json({ message: `Item '${item.Item_Name}' not found.` });
      }
  const [purchaseTax] = await connection.query(
    `SELECT Tax_Type 
     FROM add_purchase_items 
     WHERE Item_Id = ? 
     ORDER BY id DESC 
     LIMIT 1`,
    [Item_Id]
  );

  // 3️⃣ Use trusted tax type or fallback to frontend value
  const taxTypeFromDB = purchaseTax[0]?.Tax_Type;
  const safeTaxType = taxTypeFromDB || item.Tax_Type || "None";
      // Reuse old Sale_Items_Id if exists, else generate new one
      const oldData = oldSaleItemMap.get(Item_Id);
      let Sale_Items_Id;
      let createdAt;

      if (oldData) {
        Sale_Items_Id = oldData.Sale_Items_Id;
        createdAt = oldData.created_at;
      } else {
        Sale_Items_Id = "SIT" + nextSaleItemNum.toString().padStart(3, "0");
        nextSaleItemNum++;
        createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");
      }
      console.log(Sale_Items_Id);
      const taxType = item.Tax_Type ||  "None";
      // Insert the updated/new sale item
      await connection.query(
        `INSERT INTO add_sale_items 
         (Sale_Items_Id, Sale_Id, Item_Id, Quantity, Sale_Price, 
          Discount_On_Sale_Price, Discount_Type_On_Sale_Price, 
          Tax_Type, Tax_Amount, Amount, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          Sale_Items_Id,
          saleId,
          Item_Id,
          normalizeNumber(item.Quantity),
          normalizeNumber(item.Sale_Price),
          cleanDiscount(item.Discount_On_Sale_Price),
          cleanValue(item.Discount_Type_On_Sale_Price),
        cleanValue(safeTaxType),
          normalizeNumber(item.Tax_Amount),
          normalizeNumber(item.Amount),
          createdAt,
        ]
      );

      // Update stock (deduct sold quantity)
      await connection.query(
  `UPDATE add_item 
   SET Stock_Quantity = Stock_Quantity - ?, updated_at = NOW()
   WHERE Item_Id = ?`,
  [normalizeNumber(item.Quantity), Item_Id]
);

    
    }

    await connection.commit();
    return res.status(200).json({
      success: true,
      message: "Sale updated successfully",
      saleId,
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error editing sale:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (connection) connection.release();
  }
};
const editNewSale = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    const { Sale_Id: saleId } = req.params;

    // 1️⃣ Check if sale exists
    const [existingSale] = await connection.query(
      "SELECT * FROM add_new_sale WHERE Sale_Id = ?",
      [saleId]
    );
    if (existingSale.length === 0) {
      return res.status(404).json({ message: "No such Sale found." });
    }

    // 2️⃣ Validate & sanitize request
    const cleanData = sanitizeObject(req.body);
     const validation = saleNewItemFormSchema.safeParse(cleanData);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const {
      Party_Name,
      Invoice_Number,
      Invoice_Date,
      State_Of_Supply,
      Total_Amount,
      Total_Received,
      Balance_Due,
      Payment_Type,
      Reference_Number,
      items,
    } = validation.data;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No sale items provided." });
    }

    await connection.beginTransaction();

    // 3️⃣ Prevent duplicate item names
    const seenItems = new Set();
    for (const item of items) {
      const name = item.Item_Name?.trim().toLowerCase();
      if (!name) {
        await connection.rollback();
        return res.status(400).json({ message: "Item name missing." });
      }
      if (seenItems.has(name)) {
        await connection.rollback();
        return res.status(400).json({
          message: `Duplicate item '${item.Item_Name}' found. Please ensure each item appears only once.`,
        });
      }
      seenItems.add(name);
    }

    // 4️⃣ Restore previous stock before re-updating sale
    const [oldItems] = await connection.query(
      "SELECT Item_Id, Quantity FROM add_sale_items WHERE Sale_Id = ?",
      [saleId]
    );


    for (const old of oldItems) {
      if(old.Item_Id===null || old.Item_Id===undefined) {
        await connection.rollback();
        return res.status(400).json({ message: "Invalid Item_Id in old sale items." });
      }
      
    await connection.query(
        `UPDATE add_item_sale 
         SET updated_at = NOW() 
         WHERE Item_Id = ?`,
        [old.Item_Id]
      );
    
    
    }

    // 5️⃣ Update sale master record
    await connection.query(
      `UPDATE add_new_sale SET 
        Party_Id = (SELECT Party_Id FROM add_party WHERE Party_Name = ? LIMIT 1),
        Invoice_Number = ?, 
        Invoice_Date = ?, 
        State_Of_Supply = ?, 
        Total_Amount = ?, 
        Total_Received = ?, 
        Balance_Due = ?, 
        Payment_Type = ?, 
        Reference_Number = ?, 
        updated_at = NOW()
       WHERE Sale_Id = ?`,
      [
        Party_Name,
        Invoice_Number,
        Invoice_Date,
        State_Of_Supply,
        cleanValue(Total_Amount),
        cleanValue(Total_Received),
        cleanValue(Balance_Due),
        cleanValue(Payment_Type),
        cleanValue(Reference_Number),
        saleId,
      ]
    );

    // 6️⃣ Fetch old sale items for reference
    const [oldSaleItems] = await connection.query(
      "SELECT Sale_Items_Id, Item_Id, Quantity, created_at FROM add_new_sale_items WHERE Sale_Id = ?",
      [saleId]
    );
    const oldSaleItemMap = new Map();
    for (const old of oldSaleItems) {
      oldSaleItemMap.set(old.Item_Id, old);
    }
const [maxIdRow] = await connection.query(
 "SELECT MAX(CAST(SUBSTRING(Sale_Items_Id, 5) AS UNSIGNED)) AS maxNum FROM add_new_sale_items"
);
let nextSaleItemNum = (maxIdRow[0]?.maxId || 0) + 1;
   console.log(nextSaleItemNum);
    // Delete all old sale items (we’ll reinsert)
    await connection.query("DELETE FROM add_new_sale_items WHERE Sale_Id = ?", [saleId]);


 
    // 8️⃣ Reinsert sale items & adjust stock
    for (const item of items) {
      const [dbItem] = await connection.query(
        "SELECT Item_Id FROM add_item_sale WHERE Item_Name = ? LIMIT 1",
        [item.Item_Name]
      );
 
      const Item_Id = dbItem[0]?.Item_Id;

      console.log("Item_Id:",Item_Id);
   

      if (!Item_Id) {
        await connection.rollback();
        return res
          .status(404)
          .json({ message: `Item '${item.Item_Name}' not found.` });
      }
  const [purchaseTax] = await connection.query(
    `SELECT Tax_Type 
     FROM add_purchase_items 
     WHERE Item_Id = ? 
     ORDER BY id DESC 
     LIMIT 1`,
    [Item_Id]
  );

  // 3️⃣ Use trusted tax type or fallback to frontend value
  const taxTypeFromDB = purchaseTax[0]?.Tax_Type;
  const safeTaxType = taxTypeFromDB || item.Tax_Type || "None";
      // Reuse old Sale_Items_Id if exists, else generate new one
      const oldData = oldSaleItemMap.get(Item_Id);
      let Sale_Items_Id;
      let createdAt;

      if (oldData) {
        Sale_Items_Id = oldData.Sale_Items_Id;
        createdAt = oldData.created_at;
      } else {
        Sale_Items_Id = "SIT" + nextSaleItemNum.toString().padStart(3, "0");
        nextSaleItemNum++;
        createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");
      }
      console.log(Sale_Items_Id);
      const taxType = item.Tax_Type ||  "None";
      // Insert the updated/new sale item
      await connection.query(
        `INSERT INTO add_new_sale_items 
         (Sale_Items_Id, Sale_Id, Item_Id, Quantity, Sale_Price, 
          Discount_On_Sale_Price, Discount_Type_On_Sale_Price, 
          Tax_Type, Tax_Amount, Amount, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          Sale_Items_Id,
          saleId,
          Item_Id,
          normalizeNumber(item.Quantity),
          normalizeNumber(item.Sale_Price),
          cleanDiscount(item.Discount_On_Sale_Price),
          cleanValue(item.Discount_Type_On_Sale_Price),
        cleanValue(safeTaxType),
          normalizeNumber(item.Tax_Amount),
          normalizeNumber(item.Amount),
          createdAt,
        ]
      );

      // Update stock (deduct sold quantity)
      
          await connection.query(
        `UPDATE add_item_sale 
         SET updated_at = NOW()
         WHERE Item_Id = ?`,
        [ Item_Id]
      );
      
    
    }

    await connection.commit();
    return res.status(200).json({
      success: true,
      message: "Sale updated successfully",
      saleId,
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error editing sale:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (connection) connection.release();
  }
};
const getLatestInvoiceNumber = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();

    // 1️⃣ Fetch invoice prefix
    const [invoiceSettings] = await connection.query(
      `SELECT Invoice_Name FROM add_invoice LIMIT 1`
    );

    if (!invoiceSettings.length || !invoiceSettings[0].Invoice_Name) {
      return res.status(400).json({
        success: false,
        message: "Invoice prefix not set ,please set it first.",
      });
    }

    const prefix = invoiceSettings[0].Invoice_Name.trim();

    // 2️⃣ Get ACTIVE financial year
    const [fy] = await connection.query(
      `SELECT Financial_Year 
       FROM financial_year 
       WHERE Current_Financial_Year = 1
       LIMIT 1`
    );

    if (!fy.length) {
      return res.status(400).json({
        success: false,
        message: "No active financial year found.",
      });
    }

    const activeFY = fy[0].Financial_Year;

    // 3️⃣ Fetch latest invoice **ONLY inside this financial year**
    const [rows] = await connection.query(
      `
      SELECT Invoice_Number 
      FROM add_sale
      WHERE Invoice_Number LIKE '${prefix}%'
      AND Financial_Year = ?
      ORDER BY 
        CAST(SUBSTRING(Invoice_Number, LENGTH(?) + 1) AS UNSIGNED) DESC
      LIMIT 1
      `,
      [activeFY, prefix]
    );

    // 4️⃣ default new invoice number
    let newInvoiceNumber = `${prefix}0001`;

    // If an invoice already exists in this FY → increment
    if (rows.length > 0) {
      const last = rows[0].Invoice_Number;
      const numPart = last.replace(prefix, "");
      const nextNum = parseInt(numPart) + 1;
      newInvoiceNumber = prefix + nextNum.toString().padStart(4, "0");
    }

    return res.status(200).json({
      success: true,
      financialYear: activeFY,
      newInvoiceNumber,
    });
  } catch (err) {
    console.error("❌ Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

// const getLatestInvoiceNumber = async (req, res, next) => {
//   let connection;
//   try {
//     connection = await db.getConnection();
//     // 1️⃣ Fetch user-defined invoice prefix
//     const [invoiceSettings] = await db.query(`SELECT Invoice_Name FROM add_invoice LIMIT 1`);

//     if (!invoiceSettings || invoiceSettings.length === 0 || !invoiceSettings[0].Invoice_Name) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invoice prefix not set. Please configure an invoice prefix in settings before generating invoices.",
//       });
//     }

//     const prefix = invoiceSettings[0].Invoice_Name.trim();

//     // 2️⃣ Fetch latest invoice based on numeric part of invoice number
//     const [rows] = await db.query(`
//       SELECT 
//         Invoice_Number AS latestInvoice,
//         created_at AS createdAt
//       FROM add_sale
//       WHERE Invoice_Number LIKE '${prefix}%'
//       ORDER BY 
//         CAST(SUBSTRING(Invoice_Number, LENGTH('${prefix}') + 1) AS UNSIGNED) DESC
//       LIMIT 1
//     `);

//     // 3️⃣ Default new invoice number
//     let newInvoiceNumber = `${prefix}0001`;
//     let latestInvoiceInfo = null;

//     // 4️⃣ Increment if previous invoices exist
//     if (rows.length > 0 && rows[0].latestInvoice) {
//       const lastInvoice = rows[0].latestInvoice;

//       // Extract numeric part safely
//       const numericPart = lastInvoice.replace(prefix, "").trim();
//       const num = isNaN(parseInt(numericPart)) ? 1 : parseInt(numericPart) + 1;

//       // Generate next invoice number
//       newInvoiceNumber = `${prefix}${num.toString().padStart(4, "0")}`;

//       latestInvoiceInfo = {
//         lastInvoiceNumber: lastInvoice,
//         createdAt: rows[0].createdAt,
//       };
//     }

//     // 5️⃣ Return clean response
//     return res.status(200).json({
//       success: true,
//       newInvoiceNumber,
//       latestInvoiceInfo,
//     });
//   } catch (err) {
//     if(connection ) connection.release();
//     console.error("❌ Error getting latest invoice number:", err);
//     next(err);
//   }finally {
//     if(connection) connection.release();
//   }
// };
const getNewSaleLatestInvoiceNumber = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    // 1️⃣ Fetch user-defined invoice prefix
    const [invoiceSettings] = await db.query(`SELECT Invoice_Name FROM add_new_sale_invoice LIMIT 1`);

    if (!invoiceSettings || invoiceSettings.length === 0 || !invoiceSettings[0].Invoice_Name) {
      
      return res.status(400).json({
        
        success: false,
        message:
          "Invoice prefix not set. Please configure an invoice prefix in settings before generating invoices.",
      });
    }

    const prefix = invoiceSettings[0].Invoice_Name.trim();

    // 2️⃣ Fetch latest invoice based on numeric part of invoice number
    const [rows] = await db.query(`
      SELECT 
        Invoice_Number AS latestInvoice,
        created_at AS createdAt
      FROM add_new_sale
      WHERE Invoice_Number LIKE '${prefix}%'
      ORDER BY 
        CAST(SUBSTRING(Invoice_Number, LENGTH('${prefix}') + 1) AS UNSIGNED) DESC
      LIMIT 1
    `);

    // 3️⃣ Default new invoice number
    let newInvoiceNumber = `${prefix}0001`;
    let latestInvoiceInfo = null;

    // 4️⃣ Increment if previous invoices exist
    if (rows.length > 0 && rows[0].latestInvoice) {
      const lastInvoice = rows[0].latestInvoice;

      // Extract numeric part safely
      const numericPart = lastInvoice.replace(prefix, "").trim();
      const num = isNaN(parseInt(numericPart)) ? 1 : parseInt(numericPart) + 1;

      // Generate next invoice number
      newInvoiceNumber = `${prefix}${num.toString().padStart(4, "0")}`;

      latestInvoiceInfo = {
        lastInvoiceNumber: lastInvoice,
        createdAt: rows[0].createdAt,
      };
    }

    // 5️⃣ Return clean response
    return res.status(200).json({
      success: true,
      newInvoiceNumber,
      latestInvoiceInfo,
    });
  } catch (err) {
    if(connection ) connection.release();
    console.error("❌ Error getting latest invoice number:", err);
    next(err);
  }finally {
    if(connection) connection.release();
  }
};

const getTotalNewSalesEachDay = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();

    // ✅ Correct SQL: group by date, count total sales per day
    const [rows] = await connection.query(
      `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d') AS sale_date,
        COUNT(*) AS total_new_sales
      FROM add_new_sale
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      ORDER BY sale_date ASC;
      `
    );

    // ✅ Format response
    const result = rows.map((r) => ({
      date: r.sale_date,
      total_new_sales: r.total_new_sales,
    }));

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    if(connection) connection.release();
    console.error("❌ Error getting total new sales by day:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

const getTotalSalesEachDay = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();

    // 1️⃣ Get active financial year
    // const [fy] = await connection.query(
    //   `SELECT Financial_Year 
    //    FROM financial_year 
    //    WHERE Current_Financial_Year = 1
    //    LIMIT 1`
    // );

    // if (!fy.length) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "No active financial year found.",
    //   });
    // }

    const activeFY = fy[0].Financial_Year;

    // 2️⃣ Get sales count per day inside financial year
    const [rows] = await connection.query(
      `
      SELECT 
        DATE_FORMAT(Invoice_Date, '%Y-%m-%d') AS sale_date,
        COUNT(*) AS total_sales
      FROM add_sale
      WHERE Financial_Year = ?
      GROUP BY DATE_FORMAT(Invoice_Date, '%Y-%m-%d')
      ORDER BY sale_date ASC;
      `,
      [activeFY]
    );

    // 3️⃣ Format output
    const result = rows.map((r) => ({
      date: r.sale_date,
      total_sales: r.total_sales,
    }));

    return res.status(200).json({
      success: true,
      financialYear: activeFY,
      data: result,
    });
  } catch (err) {
    if (connection) connection.release();
    console.error("❌ Error getting total sales each day:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


export {
  addSale,addNewSale, getAllSales, getAllNewSales,getSingleSale, getLatestInvoiceNumber,
getNewSaleLatestInvoiceNumber,
  printSaleBill,editSale,editNewSale,getTotalNewSalesEachDay,getTotalSalesEachDay
};