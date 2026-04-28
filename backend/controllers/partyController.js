
import db from "../config/db.js";
import { sanitizeObject } from "../utils/sanitizeInput.js";
import partySchema from "../validators/partySchema.js";

import PdfPrinter from "pdfmake";
const cleanValue = (value) => {
  if (value === undefined || value === null || value === "" || value === " ") {
    return null; // store as NULL in DB
  }
  return value;  // ✅ returns the original value for valid data
};

  const reorderLevelUnits = {
    "Kilogram": "Kg",
    "Litre": "lt",
    "Gram": "gm",
    "Pcs": "pcs"
  }
const addParty = async (req, res, next) => {
  let connection;
  try {
  

    connection = await db.getConnection();
    await connection.beginTransaction();
    const cleanData = sanitizeObject(req.body);
    const validation = partySchema.safeParse(cleanData);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }
    const {
      Party_Name,
      GSTIN,
      Phone_Number,
     
      State,
      Email_Id,
      Billing_Address,
      Shipping_Address,
      
    } = validation.data;

    if (!Party_Name) {
      await connection.rollback();
      return res.status(400).json({ message: "Party name is required" });
    }
// 🔥 Correct duplicate check
const [existingParty] = await db.query(
  `SELECT Party_Id FROM add_party 
   WHERE GSTIN = ? OR Phone_Number = ?
   LIMIT 1`,
  [GSTIN, Phone_Number]
);

if (existingParty.length > 0) {
  await connection.rollback();
  return res.status(400).json({
    message: "GSTIN or Phone Number already exists for another party",
  });
}


  // const [existingParty] = await db.query(
  //     "SELECT Party_Id, GSTIN, Phone_Number FROM add_party "
  //   );

  //    if(existingParty[0].GSTIN === GSTIN || existingParty[0].Phone_Number === Phone_Number){
  //     await connection.rollback();
  //     return res.status(400).json({ message: "GSTIN or Phone Number for another party already exists" });
  //   }
    // Get last party code
    const [last] = await db.query(
      "SELECT Party_Id FROM add_party ORDER BY id DESC LIMIT 1"
    );

   
    let newId = "PTY001";
    if (last.length > 0) {
      const lastId = last[0].Party_Id; // e.g. "PTY005"
      const num = parseInt(lastId.replace("PTY", "")) + 1;
      newId = "PTY" + num.toString().padStart(3, "0");
    }
  const cleanValue = (val) =>
    val !== undefined && val !== null && String(val).trim() !== "" ? val : null;
    // Insert into DB
    const [result] = await db.execute(
      `INSERT INTO add_party 
       (Party_Id, Party_Name, GSTIN, Phone_Number,  State, Email_Id, Billing_Address, Shipping_Address)
       VALUES (?, ?, ?, ?, ?, ?, ?,?)`,
      [
        newId,
        Party_Name,
        cleanValue(GSTIN),
        cleanValue(Phone_Number),
      
        cleanValue(State),
        cleanValue(Email_Id),
        cleanValue(Billing_Address),
        cleanValue(Shipping_Address),
        
      ]
    );

      await connection.commit();
    return res.status(201).json({
      message: "Party added successfully",
      success: true,
      id: result.insertId, // auto-increment primary key
      Party_Id: newId,     // custom party code
      Party_Name,
      GSTIN,
      Phone_Number,
     
      State,
      Email_Id,
      Billing_Address,
      Shipping_Address,
     
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error("❌ Error adding party:", err);
    next(err);
    // return res.status(500).json({ message: "Internal Server Error" });
  }finally {
    if (connection) {
      connection.release();
    }
  }
};

const editParty= async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const cleanData = sanitizeObject(req.body);
    const validation = partySchema.safeParse(cleanData);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }
    const {
      Party_Name,
      GSTIN,
      Phone_Number,
      State,
      Email_Id,
      Billing_Address,
      Shipping_Address,
      
    } = validation.data;

    if (!Party_Name) {
      await connection.rollback();
      return res.status(400).json({ message: "Party name is required" });
    }
    const { Party_Id: partyId } = req.params;

 
    const [result] = await db.execute(
      `UPDATE add_party 
       SET Party_Name = ?, GSTIN = ?, Phone_Number = ?, State = ?, Email_Id = ?, Billing_Address = ?, Shipping_Address = ?
       WHERE Party_Id = ?`,
      [
        Party_Name,
        cleanValue(GSTIN),
        cleanValue(Phone_Number),
       
        cleanValue(State),
        cleanValue(Email_Id),
        cleanValue(Billing_Address),
        cleanValue(Shipping_Address),
        partyId,
      ]
    );

    await connection.commit();
    return res.status(200).json({
      message: "Party updated successfully",
      success: true,
      id: partyId,
      Party_Name,
      GSTIN,
      Phone_Number,
     
      State,
      Email_Id,
      Billing_Address,
      Shipping_Address,
     
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error("❌ Error updating party:", err);
    next(err);
    // return res.status(500).json({ message: "Internal Server Error" });
  }finally {
    if (connection) {
      connection.release();
    }
  }
}
const getAllParties = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    const page = req.query.page ? parseInt(req.query.page, 10) : null;
    const limit = 10;
    const search = req.query.search ? req.query.search.trim().toLowerCase() : "";

    let whereClause = "";
    let params = [];

    // 🔎 Search (optional)
    if (search) {
      whereClause = `
        WHERE LOWER(Party_Name) LIKE ? 
           OR LOWER(GSTIN) LIKE ? 
           OR LOWER(Phone_Number) LIKE ? 
           OR LOWER(State) LIKE ? 
           OR LOWER(Email_Id) LIKE ? 
           OR LOWER(Billing_Address) LIKE ?
      `;
      const like = `%${search}%`;
      params.push(like, like, like, like, like, like);
    }

    let rows, totalParties;

    if (page) {
      // 📄 Pagination mode
      const offset = (page - 1) * limit;
      const query = `
        SELECT * 
        FROM add_party
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      const countQuery = `
        SELECT COUNT(*) AS total 
        FROM add_party
        ${whereClause}
      `;
      const [data] = await db.query(query, [...params, limit, offset]);
      const [count] = await db.query(countQuery, params);

      rows = data;
      totalParties = count[0].total;

      return res.status(200).json({
        success: true,
        currentPage: page,
        totalPages: Math.ceil(totalParties / limit),
        totalParties,
        parties: rows,
      });
    } else {
      // 🧾 Non-paginated mode (used in dropdowns, exports, etc.)
      const query = `
        SELECT * 
        FROM add_party
        ${whereClause}
        ORDER BY created_at DESC
      `;
      const [data] = await db.query(query, params);

      return res.status(200).json({
        success: true,
        totalParties: data.length,
        parties: data,
      });
    }
  } catch (err) {
    if (connection ) connection.release();
    console.error("❌ Error getting all parties:", err);
    next(err);
    // return res.status(500).json({ message: "Internal Server Error" });
  }finally {
    if (connection) {
      connection.release();
    }
  }
};

// const getSinglePartyDetailsSalesPurchases = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();

//     const { Party_Id } = req.params;
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = 10;
//     const offset = (page - 1) * limit;
//       // const fromDate = req.query.fromDate || null;
//       // const toDate = req.query.toDate || null;

//     if(!Party_Id){
//       connection.release();
//       return res.status(400).json({
//         success: false,
//         message: "Party Id is required",
//       });
//     }
//     const [partyDetails]= await connection.query(
//       `SELECT * FROM add_party WHERE Party_Id=?`,
//       [Party_Id]
//     )
//     // Fetch ALL purchases + sales
//     const [purchases] = await connection.query(
//       `SELECT Purchase_Id , Bill_Date , Bill_Number, Total_Amount, State_Of_Supply, Total_Paid, Balance_Due, Payment_Type, 
//       "Purchase" AS Type
//        FROM add_purchase WHERE Party_Id=?`,
//       [Party_Id]
//     );

//     // const [sales] = await connection.query(
//     //   `SELECT Sale_Id , Invoice_Date , Invoice_Number, Total_Amount,State_Of_Supply, Total_Received, Balance_Due, Payment_Type, "Sale" AS Type
//     //    FROM add_sale WHERE Party_Id=?`,
//     //   [Party_Id]
//     // );

//     // Pagination across purchases → sales
//     let pagedPurchases = [];
//     //let pagedSales = [];

//     if (offset < purchases.length) {
//       pagedPurchases = purchases.slice(offset, offset + limit);
//     } 

//     const totalRecords = purchases.length ;
//     const totalPages = Math.ceil(totalRecords / limit);

//     // Fetch item details for only paged ones
//     const purchaseIds = pagedPurchases.map(r => r.Purchase_Id);
//     //const saleIds = pagedSales.map(r => r.Sale_Id);

//     // ITEMS
//     if (purchaseIds.length > 0) {
//       const [purchaseItems] = await connection.query(
//         `SELECT pi.Material_Id, 
//         pi.Purchase_Id,
//         pi.Quantity,
//         pi.Item_Unit,
//         pi.Purchase_Price,
//         pi.Discount_On_Purchase_Price,
//         pi.Discount_Type_On_Purchase_Price,
//         pi.Tax_Type,
//         pi.Tax_Amount,
//         pi.Amount,
//          m.name,m.base_unit
//          FROM add_purchase_items pi
//          LEFT JOIN add_material m ON m.Material_Id = pi.Material_Id
//          WHERE pi.Purchase_Id IN (?)`,
//         [purchaseIds]
//       );

//       pagedPurchases = pagedPurchases.map(p => ({
//         ...p,
//         items: purchaseItems.filter(i => i.Purchase_Id === p.Purchase_Id)
//       }));
//     }

//     // if (saleIds.length > 0) {
//     //   const [saleItems] = await connection.query(
//     //     `SELECT si.*, it.Item_Name,it.Item_HSN,it.Item_Category,it.Item_Unit
//     //      FROM add_sale_items si
//     //      LEFT JOIN add_item it ON it.Item_Id = si.Item_Id
//     //      WHERE si.Sale_Id IN (?)`,
//     //     [saleIds]
//     //   );

//     //   pagedSales = pagedSales.map(s => ({
//     //     ...s,
//     //     items: saleItems.filter(i => i.Sale_Id === s.Sale_Id)
//     //   }));
//     // }

//     // Summary
//     const [[purchaseSummary]] = await connection.query(
//       `SELECT SUM(Total_Amount) AS Total_Amount, SUM(Total_Paid) AS Total_Paid, SUM(Balance_Due) AS Balance_Due
//        FROM add_purchase WHERE Party_Id=?`,
//       [Party_Id]
//     );

//     // const [[salesSummary]] = await connection.query(
//     //   `SELECT SUM(Total_Amount) AS Total_Amount, SUM(Total_Received) AS Total_Received, SUM(Balance_Due) AS Balance_Due
//     //    FROM add_sale WHERE Party_Id=?`,
//     //   [Party_Id]
//     // );

//     return res.status(200).json({
//       success: true,
//       partyId: Party_Id,
//       partyDetails:partyDetails[0],
//       totalRecords,
//       totalPages,
//       page,
//       limit,
//       summary: {
//         purchases: purchaseSummary,
//         // sales: salesSummary,
//       },
//       purchases: pagedPurchases,
//       // sales: pagedSales,
//     });

//   } catch (err) {
//     console.error("❌ Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

const getSinglePartyDetailsSalesPurchases = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    const { Party_Id } = req.params;

    if (!Party_Id) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: "Party Id is required",
      });
    }

    // --------------------------
    // PARTY DETAILS
    // --------------------------
    const [partyDetails] = await connection.query(
      `SELECT * FROM add_party WHERE Party_Id=?`,
      [Party_Id]
    );

    // --------------------------
    // GET ALL PURCHASES (NO PAGINATION)
    // --------------------------
    const [purchases] = await connection.query(
      `SELECT Purchase_Id, Bill_Date, Bill_Number, Total_Amount, State_Of_Supply,
              Total_Paid, Balance_Due, Payment_Type, "Purchase" AS Type
       FROM add_purchase 
       WHERE Party_Id=? 
       ORDER BY Bill_Date DESC`,
      [Party_Id]
    );

    const purchaseIds = purchases.map(p => p.Purchase_Id);

    // --------------------------
    // ADD ITEMS FOR ALL PURCHASES
    // --------------------------
    if (purchaseIds.length > 0) {
      const [purchaseItems] = await connection.query(
        `SELECT 
            pi.Material_Id,
            pi.Purchase_Id,
            pi.Quantity,
            pi.Item_Unit,
            pi.Purchase_Price,
            pi.Discount_On_Purchase_Price,
            pi.Discount_Type_On_Purchase_Price,
            pi.Tax_Type,
            pi.Tax_Amount,
            pi.Amount,
            m.name AS Material_Name,
            m.base_unit AS Base_Unit
         FROM add_purchase_items pi
         LEFT JOIN add_material m ON m.Material_Id = pi.Material_Id
         WHERE pi.Purchase_Id IN (?)`,
        [purchaseIds]
      );

      // attach items to each purchase
      purchases.forEach(p => {
        p.items = purchaseItems.filter(i => i.Purchase_Id === p.Purchase_Id);
      });
    }

    // --------------------------
    // SUMMARY TOTALS (CALCULATED FROM DATABASE)
    // --------------------------
    const [[purchaseSummary]] = await connection.query(
      `SELECT 
         COALESCE(SUM(Total_Amount),0) AS Total_Amount,
         COALESCE(SUM(Total_Paid),0) AS Total_Paid,
         COALESCE(SUM(Balance_Due),0) AS Balance_Due
       FROM add_purchase 
       WHERE Party_Id=?`,
      [Party_Id]
    );

    return res.status(200).json({
      success: true,
      partyId: Party_Id,
      partyDetails: partyDetails[0] || null,
      totalRecords: purchases.length,
      purchases,
      summary: {
        purchases: purchaseSummary
      }
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
const printSinglePartyDetailsSalesPurchasesReport = async (req, res) => {
  try {
    const {
      party = {},          // Party Details
      purchases = [],      // Purchase Records
      sales = [],          // Sales Records
      summary = {}         // { purchases: {}, sales: {} }
    } = req.body;

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
          unbreakable: true,
          stack: [
            // Title
            {
              text: `${title.slice(0, -1)} ${idx + 1}`,
              style: "subTitle",
              margin: [0, 0, 0, 5]
            },

            // Basic details section
            {
              columns: [
                {
                  width: "48%",
                  stack: [
                    { text: "Party Name", style: "label" },
                    { text: safe(party.Party_Name), style: "value" },

                    { text: "GSTIN", style: "label" },
                    { text: safe(party.GSTIN), style: "value" }
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
                    }
                  ]
                }
              ],
              columnGap: 20,
              margin: [0, 0, 0, 10]
            },

            // ITEMS TABLE
           {
  style: "tableSmall",
  table: {
    headerRows: 1,
    widths: ["auto", "*", "*", "*", "*", "*"],
    body: [
      [
        { text: "Sl", style: "tableHeader" },
        { text: "Item", style: "tableHeader" },
        { text: "Qty", style: "tableHeader" },
        { text: "Price", style: "tableHeader" },
        { text: "Tax", style: "tableHeader" },
        { text: "Amount", style: "tableHeader" }
      ],
      ...entry.items.map((it, i) => [
        i + 1,
        safe(it.name),
     `${safe(it.Quantity)} ${safe(reorderLevelUnits[it.unit])}`,


        safe(it.Sale_Price || it.Purchase_Price),
        safe(it.Tax_Type),
        Number(it.Amount || 0).toFixed(2)
      ])
    ]
  },
  layout: "lightHorizontalLines",
  margin: [0, 0, 0, 10]
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
                  layout:  "noBordersBox"
                }
              ],
              margin: [0, 0, 0, 15]
            }
          ]
        });
      });

      return rows;
    };

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
          text: `${party.Party_Name}`,
          style: "header",
          alignment: "center",
          margin: [0, 0, 0, 8]
        },

        {
          text: `GSTIN: ${party.GSTIN || "N/A"}`,
          alignment: "center",
          margin: [0, 0, 0, 15]
        },
          {
          text: `Billing Address: ${party.Billing_Address || "N/A"}`,
          alignment: "center",
          margin: [0, 0, 0, 15]
        },

        ...buildSection("Purchases", purchases, "purchase"),

        // ...buildSection("Sales", sales, "sale")
      ],

      styles: {
        header: { fontSize: 18, bold: true },
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
    console.error("❌ PDF Print failed:", err);
    res.status(500).json({ message: "PDF Print Error" });
  }
};



export { addParty,editParty,getAllParties,getSinglePartyDetailsSalesPurchases,
  printSinglePartyDetailsSalesPurchasesReport
 };  // ✅ for ESM
