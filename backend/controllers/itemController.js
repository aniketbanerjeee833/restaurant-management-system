

import db from "../config/db.js";
import { sanitizeObject } from "../utils/sanitizeInput.js";
import itemFormSchema from "../validators/itemSchema.js";
import PdfPrinter from "pdfmake";
const cleanValue = (value) => {
  if (value === undefined || value === null || value === "" || value === " ") {
    return null; // store as NULL in DB
  }
  return value;  // ✅ returns the original value for valid data
};
{/* Add Item */}
const addItem = async (req, res, next) => {
  let connection;
  try {
        connection = await db.getConnection();
    await connection.beginTransaction(); // ✅ Start transaction
    // ✅ Validate request body with Zod
    const cleanData = sanitizeObject(req.body);
    const validation = itemFormSchema.safeParse(cleanData);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }
    const { Item_Name, Item_HSN, Item_Unit, Item_Image, Item_Category } =
      validation.data;

    // ✅ Check duplicate
    const [rows] = await db.query(
      `SELECT * FROM add_item WHERE Item_Name = ?`,
      [Item_Name]
    );
    if (rows.length > 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ message: "Item already exists, please add a new item" });
    }

    // ✅ Generate new Item_Id
    const [last] = await db.query(
      "SELECT Item_Id FROM add_item ORDER BY id DESC LIMIT 1"
    );

    let itemId = "ITM001";
    if (last.length > 0) {
      const lastId = last[0].Item_Id; // e.g. "ITM005"
      const num = parseInt(lastId.replace("ITM", "")) + 1;
      itemId = "ITM" + num.toString().padStart(3, "0");
    }

    // ✅ Insert into DB
    const [result] = await db.execute(
      `INSERT INTO add_item (
        Item_Name, Item_Id, Item_HSN, Item_Unit, Item_Image, Item_Category,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [Item_Name, itemId, Item_HSN, Item_Unit, cleanValue(Item_Image), Item_Category]
    );
    await connection.commit();
    return res.status(201).json({
      message: "Item added successfully",
      success: true,
      id: result.insertId,
      itemId,
    });
  } catch (err) {
    // if (err.code === "ER_DUP_ENTRY") {
    //   return res.status(400).json({ message: "Duplicate entry" });
    // }
    if(connection) await connection.rollback();
    console.error("❌ Error adding item:", err);
    next(err);
    // return res.status(500).json({ message: "Internal Server Error" });
  }finally {
    if (connection) connection.release();
  }
};


const editItem = async (req, res, next) => {
    let connection;
  try {
        connection = await db.getConnection();
    await connection.beginTransaction(); // ✅ Start transaction

        const { Item_Id } = req.params;
        const cleanData = sanitizeObject(req.body);
        const validation = itemFormSchema.safeParse(cleanData);
        if (!validation.success) {
          return res.status(400).json({ errors: validation.error.errors });
        }
        const { Item_Name, Item_HSN, Item_Unit, Item_Image, Item_Category } =validation.data;

        const [result] = await db.execute(
          `UPDATE add_item SET Item_Name = ?, Item_HSN = ?, Item_Unit = ?, 
          Item_Image = ?, Item_Category = ?, updated_at = NOW() WHERE Item_Id = ?`,
          [Item_Name, Item_HSN, Item_Unit, cleanValue(Item_Image), Item_Category, Item_Id]
        );

        if (result.affectedRows === 0) {
          await connection.rollback();
          return res.status(404).json({ message: "Item not found" });
        }

        if (result.affectedRows > 0) {
          await connection.commit();
          return res.status(200).json({ success: true, message: "Item updated successfully" });
        }


  } catch (err) {
    if(connection) await connection.rollback();
    console.error("❌ Error editing item:", err);
    next(err);
    // return res.status(500).json({ message: "Internal Server Error" });
  }finally {
    if (connection) connection.release();
  }
}

const eachItemBillAndInvoiceNumbers = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();

    const { Item_Id } = req.params;
    if (!Item_Id) {
      return res.status(400).json({ message: "Item Id is required" });
    }

    // 1️⃣ Fetch purchase & sale references
    const [purchases] = await connection.query(
      "SELECT Purchase_Id FROM add_purchase_items WHERE Item_Id = ?",
      [Item_Id]
    );

    const [sales] = await connection.query(
      "SELECT Sale_Id FROM add_sale_items WHERE Item_Id = ?",
      [Item_Id]
    );

    const purchaseIds = purchases.map((p) => p.Purchase_Id);
    const saleIds = sales.map((s) => s.Sale_Id);

    let purchaseDetails = [];
    let saleDetails = [];

    // 2️⃣ Fetch purchase bill numbers (only if exists)
    if (purchaseIds.length > 0) {
      [purchaseDetails] = await connection.query(
        `SELECT  Purchase_Id,Bill_Number, Bill_Date 
         FROM add_purchase 
         WHERE Purchase_Id IN (?)`,
        [purchaseIds]
      );
    }

    // 3️⃣ Fetch sale invoice numbers (only if exists)
    if (saleIds.length > 0) {
      [saleDetails] = await connection.query(
        `SELECT Sale_Id, Invoice_Number, Invoice_Date 
         FROM add_sale 
         WHERE Sale_Id IN (?)`,
        [saleIds]
      );
    }

    // 4️⃣ Final output format
    const billAndInvoiceNumbers = {
      purchaseDetails: {
        type: "Purchase",
        count: purchaseDetails.length,
        details: purchaseDetails,
      },
      saleDetails: {
        type: "Sale",
        count: saleDetails.length,
        details: saleDetails,
      },
    };

    return res.status(200).json({
      success: true,
      message: "Bill and Invoice Numbers fetched successfully",
      billAndInvoiceNumbers,
    });

  } catch (err) {
    console.error("❌ Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


// const getAllItems = async (req, res, next) => {
//   try {
//     const page = req.query.page ? parseInt(req.query.page, 10) : null;
//     const search = req.query.search ? req.query.search.trim().toLowerCase() : "";
//     const limit = 10;

//     const offset = page ? (page - 1) * limit : 0;

//     // ✅ Base SQL query
//     let baseQuery = `SELECT * FROM add_item`;
//     let whereClause = "";
//     const params = [];

//     // ✅ Search filter across multiple columns
//     if (search) {
//       whereClause = `
//         WHERE LOWER(Item_Name) LIKE ? 
//         OR LOWER(Item_Category) LIKE ? 
//         OR LOWER(Item_HSN) LIKE ? 
//         OR LOWER(Item_Id) LIKE ? 
//         OR LOWER(Item_Unit) LIKE ?
//       `;
//       const likeSearch = `%${search}%`;
//       params.push(likeSearch, likeSearch, likeSearch, likeSearch, likeSearch);
//     }

//     // ✅ Pagination support
//     let query = `${baseQuery} ${whereClause} ORDER BY created_at DESC`;
//     if (page) query += ` LIMIT ? OFFSET ?`, params.push(limit, offset);

//     const [items] = await db.query(query, params);

//     // ✅ Get total count for pagination
//     let totalItems = [{ total: 0 }];
//     if (page) {
//       const [countRows] = await db.query(
//         `SELECT COUNT(*) AS total FROM add_item ${whereClause}`,
//         search ? Array(5).fill(`%${search}%`) : []
//       );
//       totalItems = countRows;
//     } else {
//       totalItems = [{ total: items.length }];
//     }

//     // ✅ Fetch purchase & sale prices
//     const [purchaseItems] = await db.query(
//       `SELECT Item_Id, Purchase_Price 
//        FROM add_purchase_items 
//        ORDER BY created_at DESC`
//     );
//     const [salesItems] = await db.query(
//       `SELECT Item_Id, Sale_Price 
//        FROM add_sale_items 
//        ORDER BY created_at DESC`
//     );

//     const latestPurchasePrice = {};
//     purchaseItems.forEach((row) => {
//       if (!latestPurchasePrice[row.Item_Id]) {
//         latestPurchasePrice[row.Item_Id] = row.Purchase_Price;
//       }
//     });
//     const latestSalePrice = {};
//     salesItems.forEach((row) => {
//       if (!latestSalePrice[row.Item_Id]) {
//         latestSalePrice[row.Item_Id] = row.Sale_Price;
//       }
//     });

//     // ✅ Combine results
//     const combined = items.map((item) => ({
//       Item_Id: item.Item_Id,
//       Item_Category: item.Item_Category,
//       Item_Name: item.Item_Name,
//       Item_HSN: item.Item_HSN,
//       Item_Unit: item.Item_Unit,
//       Stock_Quantity: item.Stock_Quantity || 0,
//       Purchase_Price: latestPurchasePrice[item.Item_Id] || 0.0,
//       Sale_Price: latestSalePrice[item.Item_Id] || 0.0,
//       created_at: item.created_at,
//     }));

//     // ✅ Response
//     if (page) {
//       return res.status(200).json({
//         currentPage: page,
//         totalPages: Math.ceil(totalItems[0].total / limit),
//         totalItems: totalItems[0].total,
//         items: combined,
//       });
//     } else {
//       return res.status(200).json({
//         items: combined,
//       });
//     }
//   } catch (err) {
//     console.error("❌ Error getting all items:", err);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

//Recent items purchase and sale

const getAllItems = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    const page = req.query.page ? parseInt(req.query.page, 10) : null;
    const search = req.query.search ? req.query.search.trim().toLowerCase() : "";
    const fromDate = req.query.fromDate || null;
    const toDate = req.query.toDate || null;
    console.log("🔍 Params =>", { page, search, fromDate, toDate }) ;
    console.log(fromDate, toDate,search,page);
    const limit = 10;
    const offset = page ? (page - 1) * limit : 0;

    // ✅ Build WHERE clause dynamically
    let whereClauses = [];
    let params = [];

    // 🧠 Search term condition
    if (search) {
      whereClauses.push(`
        (LOWER(Item_Name) LIKE ? 
         OR LOWER(Item_Category) LIKE ? 
         OR LOWER(Item_HSN) LIKE ? 
         OR LOWER(Item_Id) LIKE ? 
         OR LOWER(Item_Unit) LIKE ?)
      `);
      const like = `%${search}%`;
      params.push(like, like, like, like, like);
    }

    // 📅 Date range condition
    if (fromDate && toDate) {
      whereClauses.push("DATE(created_at) BETWEEN ? AND ?");
      params.push(fromDate, toDate);
    } else if (fromDate) {
      whereClauses.push("DATE(created_at) >= ?");
      params.push(fromDate);
    } else if (toDate) {
      whereClauses.push("DATE(created_at) <= ?");
      params.push(toDate);
    }

    // Combine WHERE clauses
    const whereSQL = whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : "";

    // ✅ Fetch items
    const query = `
      SELECT * FROM add_item 
      ${whereSQL}
      ORDER BY created_at DESC
      ${page ? "LIMIT ? OFFSET ?" : ""}
    `;
    if (page) params.push(limit, offset);

    const [items] = await db.query(query, params);

    // ✅ Count total for pagination
    let [totalItems] = await db.query(
      `SELECT COUNT(*) AS total FROM add_item ${whereSQL}`,
      params.slice(0, params.length - (page ? 2 : 0))
    );

    // ✅ Get latest purchase and sales prices
    const [purchaseItems] = await db.query(`
      SELECT Item_Id, Purchase_Price,Tax_Type 
      FROM add_purchase_items 
      ORDER BY created_at DESC
    `);
    const [salesItems] = await db.query(`
      SELECT Item_Id, Sale_Price 
      FROM add_sale_items 
      ORDER BY created_at DESC
    `);

    const latestPurchasePrice = {};
    const latestTaxType = {};
    purchaseItems.forEach((row) => {
      if (!latestPurchasePrice[row.Item_Id]) {
        latestPurchasePrice[row.Item_Id] = row.Purchase_Price;
        latestTaxType[row.Item_Id] = row.Tax_Type;
      }
    });
    const latestSalePrice = {};
    salesItems.forEach((row) => {
      if (!latestSalePrice[row.Item_Id]) {
        latestSalePrice[row.Item_Id] = row.Sale_Price;
      }
    });

    console.log(latestPurchasePrice, latestTaxType, latestSalePrice);
    // ✅ Merge results
    const combined = items.map((item) => ({
      ...item,
      Purchase_Price: latestPurchasePrice[item.Item_Id] || 0.0,
      Tax_Type: latestTaxType[item.Item_Id],
      Sale_Price: latestSalePrice[item.Item_Id] || 0.0,
    }));

      console.log(combined);
    // ✅ Response
    return res.status(200).json({
      success: true,
      currentPage: page || 1,
      totalPages: page ? Math.ceil(totalItems[0].total / limit) : 1,
      totalItems: totalItems[0].total,
      items: combined,
    });
  } catch (err) {
    if(connection) connection.release();
    console.error("❌ Error fetching items:", err);
    next(err);
    // return res.status(500).json({ message: "Internal Server Error" });
  }finally {
    if (connection)  connection.release();
  }
};



{/* add category */}
const addCategory = async (req, res, next) => {
  let connection;
  try {
    const { Item_Category } = req.body;
    connection = await db.getConnection();

    if (!Item_Category) {
      await connection.rollback();
      return res.status(400).json({success: false, message: "Item_Category is required" });
    }

    // Trim + collapse spaces
    const updatedCategory = Item_Category.trim().replace(/\s+/g, " ");

    // Check if already exists (case-insensitive)
    const [rows] = await db.query(
      `SELECT * FROM add_category WHERE LOWER(Item_Category) = LOWER(?)`,
      [updatedCategory]
    );

    if (rows.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Item_Category already exists" });
    }

    // Generate Category_Id
    let newId = "CAT001";
    const [last] = await db.query(
      "SELECT Category_Id FROM add_category ORDER BY id DESC LIMIT 1"
    );

    if (last.length > 0) {
      const lastId = last[0].Category_Id; // e.g. "CAT005"
      const num = parseInt(lastId.replace("CAT", "")) + 1;
      newId = "CAT" + num.toString().padStart(3, "0");
    }

    // ✅ Insert new category (2 placeholders for 2 values)
    const [result] = await db.execute(
      `INSERT INTO add_category (Category_Id, Item_Category, created_at, updated_at) 
       VALUES (?, ?, NOW(), NOW())`,
      [newId, updatedCategory]
    );
await connection.commit();
   return res.status(201).json({
  message: "Item_Category added successfully",
  success: true,
  id: result.insertId, // auto-increment primary key
  Category_Id: newId,
  Item_Category: updatedCategory,
});
  } catch (err) {
    if(connection) await connection.rollback();
    console.error("❌ Error adding Item_Category:", err);
    next(err);
    // return res.status(500).json({ message: "Internal Server Error" });
  }finally {
        if(connection) await connection.rollback()
  }
};

const getAllCategories = async (req, res, next) => {
  let connection;
  try{
      connection = await db.getConnection();
      const [rows] = await db.query("SELECT * FROM add_category  ORDER BY created_at DESC");
      return res.status(200).json(rows);
  }catch(err){
       if(connection) connection.release();
      console.error("❌ Error getting all categories:", err);
      next(err);
      // return res.status(500).json({ message: "Internal Server Error" });
  }finally{
      if(connection) connection.release();
  }
}


const eachItemSalesPurchaseDetails = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();
    const { Item_Id } = req.params;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    // Fetch the item
    const [items] = await connection.query(
      `SELECT Item_Id, Item_Name FROM add_item WHERE Item_Id = ?`,
      [Item_Id]
    );

    // Fetch full purchase rows for that item
    const [purchaseItemsList] = await connection.query(
      `SELECT * FROM add_purchase_items 
       WHERE Item_Id = ?
       ORDER BY created_at DESC`,
      [Item_Id]
    );

    // Fetch full sale rows
    const [salesItemsList] = await connection.query(
      `SELECT * FROM add_sale_items 
       WHERE Item_Id = ?
       ORDER BY created_at DESC`,
      [Item_Id]
    );

    const totalRecords = purchaseItemsList.length + salesItemsList.length;
    const totalPages = Math.ceil(totalRecords / limit);

    // Pagination
    let pagedPurchaseItemRows = [];
    let pagedSalesItemRows = [];

    if (offset < purchaseItemsList.length) {
      pagedPurchaseItemRows = purchaseItemsList.slice(offset, offset + limit);
    } else {
      let salesOffset = offset - purchaseItemsList.length;
      pagedSalesItemRows = salesItemsList.slice(salesOffset, salesOffset + limit);
    }

    // Extract bill IDs
    const purchaseIds = pagedPurchaseItemRows.map((item) => item.Purchase_Id);
    const saleIds = pagedSalesItemRows.map((item) => item.Sale_Id);

    // 🟢 Fetch Purchase bills + Party Name
    const [purchases] = purchaseIds.length
      ? await connection.query(
          `SELECT ap.*, pt.Party_Name, pt.Phone_Number, pt.GSTIN
           FROM add_purchase ap
           LEFT JOIN add_party pt ON pt.Party_Id = ap.Party_Id
           WHERE ap.Purchase_Id IN (?)`,
          [purchaseIds]
        )
      : [[]];

    // 🟢 Fetch Sale bills + Party Name
    const [sales] = saleIds.length
      ? await connection.query(
          `SELECT s.*, pt.Party_Name, pt.Phone_Number, pt.GSTIN
           FROM add_sale s
           LEFT JOIN add_party pt ON pt.Party_Id = s.Party_Id
           WHERE s.Sale_Id IN (?)`,
          [saleIds]
        )
      : [[]];

    // Fetch all items for those bills
    const [purchaseItemsAll] = purchaseIds.length
      ? await connection.query(
          `SELECT pi.*, it.Item_Name, it.Item_HSN, it.Item_Category,it.Item_Unit
           FROM add_purchase_items pi
           LEFT JOIN add_item it ON it.Item_Id = pi.Item_Id
           WHERE pi.Purchase_Id IN (?)`,
          [purchaseIds]
        )
      : [[]];

    const [saleItemsAll] = saleIds.length
      ? await connection.query(
          `SELECT si.*, it.Item_Name, it.Item_HSN, it.Item_Category,it.Item_Unit
           FROM add_sale_items si
           LEFT JOIN add_item it ON it.Item_Id = si.Item_Id
           WHERE si.Sale_Id IN (?)`,
          [saleIds]
        )
      : [[]];

    // Build final objects
    const purchaseBills = purchases.map((bill) => ({
      Type: "Purchase",
      ...bill,
      Party_Name: bill.Party_Name,
      Party_GST: bill.GSTIN,
      Party_Phone: bill.Phone_Number,
      items: purchaseItemsAll.filter((it) => it.Purchase_Id === bill.Purchase_Id),
    }));

    const saleBills = sales.map((bill) => ({
      Type: "Sale",
      ...bill,
      Party_Name: bill.Party_Name,
      Party_GST: bill.GSTIN,
      Party_Phone: bill.Phone_Number,
      items: saleItemsAll.filter((it) => it.Sale_Id === bill.Sale_Id),
    }));

    return res.status(200).json({
      success: true,
      Item_Id,
      Item_Name: items[0]?.Item_Name ?? "",
      page,
      limit,
      totalRecords,
      totalPages,
      purchases: purchaseBills,
      sales: saleBills,
    });
  } catch (err) {
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

const printEachItemSalesPurchasesReport = async (req, res) => {
  try {
    const {
      itemName,
      purchases = [],
      sales = [],
    } = req.body;

    const safe = (v) => (v !== undefined && v !== null ? v : "N/A");

    // 🔵 Build each Purchase/Sale section
    const buildSection = (title, list, type) => {
      if (!list.length) return [];

      const rows = [
        {
          text: title.toUpperCase(),
          style: "sectionHeader",
          alignment: "center",
          margin: [0, 20, 0, 10],
        },
      ];

      list.forEach((entry, idx) => {
        rows.push({
          unbreakable: true,
          stack: [
            // Small title
            {
              text: `${title.slice(0, -1)} ${idx + 1}`,
              style: "subTitle",
              margin: [0, 0, 0, 5],
            },

            // Party + Bill/Invoice details
            {
              columns: [
                {
                  width: "48%",
                  stack: [
                    { text: "Party Name", style: "label" },
                    { text: safe(entry.Party_Name), style: "value" },

                    { text: "GSTIN", style: "label" },
                    { text: safe(entry.GSTIN), style: "value" },

                    { text: "Phone", style: "label" },
                    { text: safe(entry.Phone_Number), style: "value" },
                  ],
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
  text: safe(entry.Bill_Number || entry.Invoice_Number),
  style: "value"
},

{
  text: type === "purchase" ? "Bill Date" : "Invoice Date",
  style: "label"
},
{
  text: safe(
    new Date(entry.Bill_Date || entry.Invoice_Date)
      .toLocaleDateString("en-IN", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      })
  ),
  style: "value"
},

                  ],
                },
              ],
              columnGap: 20,
              margin: [0, 0, 0, 10],
            },

            // ITEMS TABLE
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
                    { text: "Amount", style: "tableHeader" },
                  ],

                  ...(entry.items || []).map((it, i) => [
                    i + 1,
                    safe(it.Item_Category),
                    safe(it.Item_Name),
                    safe(it.Item_HSN),
                    safe(it.Quantity),
                    safe(it.Sale_Price || it.Purchase_Price),
                    safe(it.Tax_Type),
                    Number(it.Amount || 0).toFixed(2),
                  ]),
                ],
              },
              layout: "lightHorizontalLines",
              margin: [0, 0, 0, 10],
            },

            // TOTALS
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
                        safe(entry.Total_Paid || entry.Total_Received),
                      ],
                      ["Balance Due", safe(entry.Balance_Due)],
                    ],
                  },
                  layout: "noBordersBox",
                },
              ],
              margin: [0, 0, 0, 15],
            },
          ],
        });
      });

      return rows;
    };

    // HEADER — print first party from first purchase or sale
    const firstEntry = purchases[0] || sales[0] || {};

    const docDefinition = {
      pageMargins: [18, 18, 18, 30],
      defaultStyle: { font: "Helvetica" },

      footer: (p, pc) => ({
        text: `Page ${p} of ${pc}`,
        alignment: "center",
        margin: [10, 10, 10, 10],
      }),

      content: [
        {
          text: safe(itemName),
          style: "header",
          alignment: "center",
          margin: [0, 0, 0, 8],
        },


        ...buildSection("Purchases", purchases, "purchase"),
        ...buildSection("Sales", sales, "sale"),
      ],

      styles: {
        header: { fontSize: 18, bold: true },
        sectionHeader: { fontSize: 15, bold: true },
        subTitle: { fontSize: 12, bold: true },
        label: { bold: true, fontSize: 10 },
        value: { fontSize: 10 },
        tableHeader: { bold: true, fillColor: "#eee" },
        tableSmall: { fontSize: 9 },
      },
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
    console.error("❌ PDF Print failed:", err);
    res.status(500).json({ message: "PDF Print Error" });
  }
};


export { addItem ,editItem,addCategory,getAllItems,getAllCategories,eachItemSalesPurchaseDetails,
  printEachItemSalesPurchasesReport,eachItemBillAndInvoiceNumbers
};
