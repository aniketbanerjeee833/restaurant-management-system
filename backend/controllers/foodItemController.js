//import axios from "axios";
import { io } from "../app.js";
import db from "../config/db.js";
import fs from "fs";
// import { ensureDailyStockForDate } from "../utils/ensureDailyStock.js";
//import { GoogleGenerativeAI } from "@google/generative-ai";


const addFoodItem = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    if (!req.body || !req.body.items) {
      return res.status(400).json({
        success: false,
        message: "Missing items in request.",
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(req.body.items);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format for items.",
      });
    }

    const items = parsed.items;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No food items provided.",
      });
    }

    const images = req.files;

    const [lastItem] = await connection.query(
      `SELECT Item_Id FROM add_food_item ORDER BY id DESC LIMIT 1 FOR UPDATE`
    );

    let nextItemNo = lastItem.length
      ? parseInt(lastItem[0].Item_Id.replace("FDITM", "")) + 1
      : 1;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const uploadedFile = images?.[i];
      const imageFileName = uploadedFile ? uploadedFile.filename : null;

      const Item_Name = item.Item_Name?.trim();

      if (!Item_Name) {
        return res.status(400).json({
          success: false,
          message: "Item name is required.",
        });
      }

      const {
        Item_Category,
        DineIn_Item_Price,
        Takeaway_Item_Price,
        Tax_Type,
        Tax_Amount,
        Amount,
      } = item;

      const newItemId =
        "FDITM" + nextItemNo.toString().padStart(5, "0");
      nextItemNo++;

      /* ===============================
         1️⃣ INSERT INTO add_food_item
      =============================== */
      await connection.execute(
        `
        INSERT INTO add_food_item
        (Item_Id, Item_Name, Item_Image, Item_Category,
         Tax_Type, Tax_Amount, Amount,
         created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          newItemId,
          Item_Name,
          imageFileName,
          Item_Category,
          Tax_Type || "None",
          Number(Tax_Amount) || 0,
          Number(Amount) || 0,
        ]
      );

      /* ===============================
         2️⃣ INSERT INTO food_item_price
         DINE_IN
      =============================== */

      const dinePrice = Number(DineIn_Item_Price);

      if (!isNaN(dinePrice)) {
        await connection.execute(
          `
          INSERT INTO food_item_price
          (Item_Id, Order_Type, Item_Price, Tax_Type, Tax_Amount, Amount, created_at, updated_at)
          VALUES (?, 'DINE_IN', ?, ?, ?, ?, NOW(), NOW())
          `,
          [
            newItemId,
            dinePrice,
            Tax_Type || "None",
            Number(Tax_Amount) || 0,
            dinePrice, // Amount = price for now
          ]
        );
      }

      /* ===============================
         3️⃣ INSERT INTO food_item_price
         TAKEAWAY
      =============================== */

      const takeawayPrice = Number(Takeaway_Item_Price);

      if (!isNaN(takeawayPrice)) {
        await connection.execute(
          `
          INSERT INTO food_item_price
          (Item_Id, Order_Type, Item_Price, Tax_Type, Tax_Amount, Amount, created_at, updated_at)
          VALUES (?, 'TAKEAWAY', ?, ?, ?, ?, NOW(), NOW())
          `,
          [
            newItemId,
            takeawayPrice,
            Tax_Type || "None",
            Number(Tax_Amount) || 0,
            takeawayPrice, // Amount = price for now
          ]
        );
      }
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Food items added successfully",
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Food Add Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

const getAllFoodItems = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    const stockDate = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    const orderType = req.query.orderType || null;

    const page = req.query.page ? parseInt(req.query.page, 10) : null;
    const limit = 10;
    const offset = page ? (page - 1) * limit : 0;

    const search = req.query.search
      ? req.query.search.trim().toLowerCase()
      : "";

    let whereClauses = [`afi.is_deleted = 0`];
    let params = [];

    if (search) {
      whereClauses.push(`
        (
          LOWER(afi.Item_Name) LIKE ?
          OR LOWER(afi.Item_Category) LIKE ?
        )
      `);

      const like = `%${search}%`;
      params.push(like, like);
    }

    const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

    /* ==========================================================
       👤 USER / STAFF FLOW
       - orderType present
       - NO pagination
       - A → Z order
       - Single price
    ========================================================== */
    if (orderType) {
      const [rows] = await connection.query(
        `
        SELECT
          afi.*,
          fp.Order_Type AS Price_Type,
          fp.Item_Price,
          fp.Tax_Type,
          fp.Tax_Amount,
          fp.Amount,
          COALESCE(dfs.Closing_Quantity, 0) AS Current_Quantity
        FROM add_food_item afi
        LEFT JOIN food_item_price fp
          ON fp.Item_Id = afi.Item_Id
         AND fp.Order_Type = ?
        LEFT JOIN daily_food_stock dfs
          ON dfs.Item_Id = afi.Item_Id
         AND dfs.Stock_Date = ?
        ${whereSQL}
        ORDER BY LOWER(afi.Item_Name) ASC
        `,
        [orderType, stockDate, ...params]
      );

      return res.status(200).json({
        success: true,
        priceType: orderType,
        totalItems: rows.length,
        foodItems: rows,
      });
    }

    /* ==========================================================
       👨‍💼 ADMIN FLOW
       - NO orderType
       - Pagination + search
       - BOTH prices
       - created_at DESC
    ========================================================== */

    const [rows] = await connection.query(
      `
      SELECT
        afi.*,

        /* ===== DINE IN PRICE ===== */
        MAX(CASE WHEN fp.Order_Type = 'DINE_IN'
            THEN fp.Item_Price END) AS DineIn_Item_Price,
        MAX(CASE WHEN fp.Order_Type = 'DINE_IN'
            THEN fp.Tax_Type END) AS DineIn_Tax_Type,
        MAX(CASE WHEN fp.Order_Type = 'DINE_IN'
            THEN fp.Tax_Amount END) AS DineIn_Tax_Amount,
        MAX(CASE WHEN fp.Order_Type = 'DINE_IN'
            THEN fp.Amount END) AS DineIn_Amount,

        /* ===== TAKEAWAY PRICE ===== */
        MAX(CASE WHEN fp.Order_Type = 'TAKEAWAY'
            THEN fp.Item_Price END) AS Takeaway_Item_Price,
        MAX(CASE WHEN fp.Order_Type = 'TAKEAWAY'
            THEN fp.Tax_Type END) AS Takeaway_Tax_Type,
        MAX(CASE WHEN fp.Order_Type = 'TAKEAWAY'
            THEN fp.Tax_Amount END) AS Takeaway_Tax_Amount,
        MAX(CASE WHEN fp.Order_Type = 'TAKEAWAY'
            THEN fp.Amount END) AS Takeaway_Amount,

        COALESCE(dfs.Closing_Quantity, 0) AS Current_Quantity

      FROM add_food_item afi

      LEFT JOIN food_item_price fp
        ON fp.Item_Id = afi.Item_Id

      LEFT JOIN daily_food_stock dfs
        ON dfs.Item_Id = afi.Item_Id
       AND dfs.Stock_Date = ?

      ${whereSQL}

      GROUP BY afi.Item_Id
   ORDER BY LOWER(afi.Item_Name) ASC
      LIMIT ? OFFSET ?
      `,
      [stockDate, ...params, limit, offset]
    );

    // ✅ COUNT for pagination
    const [countResult] = await connection.query(
      `
      SELECT COUNT(DISTINCT afi.Item_Id) AS total
      FROM add_food_item afi
      LEFT JOIN food_item_price fp
        ON fp.Item_Id = afi.Item_Id
      ${whereSQL}
      `,
      params
    );

    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      priceType: "ALL",
      currentPage: page,
      totalItems,
      totalPages,
      pageSize: limit,
      foodItems: rows,
    });

  } catch (err) {
    console.error("❌ Error getting all food items:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
// const addFoodItem = async (req, res, next) => {
//     let connection;

//     try {
//         connection = await db.getConnection();
//         await connection.beginTransaction();
     
//         // Validation for items
//         if (!req.body || !req.body.items) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Missing items in request.",
//             });
//         }

//         // Parse JSON
//         let parsed;
//         try {
//             parsed = JSON.parse(req.body.items); // { items: [...] }
//         } catch (err) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid JSON format for items.",
//             });
//         }

//         const items = parsed.items;

//         if (!Array.isArray(items) || items.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "No food items provided.",
//             });
//         }

//         const images = req.files; // multer uploaded files

//         // Generate next Item_Id
//         const [lastItem] = await connection.query(
//             `SELECT Item_Id FROM add_food_item ORDER BY id DESC LIMIT 1`
//         );

//         let nextItemNo = lastItem.length
//             ? parseInt(lastItem[0].Item_Id.replace("FDITM", "")) + 1
//             : 1;

//         // Insert each item
//         for (let i = 0; i < items.length; i++) {
//             const item = items[i];
//             const uploadedFile = images?.[i];
//             const imageFileName = uploadedFile ? uploadedFile.filename : null;

//             const {
//                 Item_Name,
//                 Item_Category,
//                 Item_Price,
//                 // Item_Quantity,
              
//                 Tax_Type,
//                 Tax_Amount,
//                 Amount
//             } = item;

//             const newItemId = "FDITM" + nextItemNo.toString().padStart(5, "0");
//             nextItemNo++;

//             await connection.query(
//   `INSERT INTO add_food_item 
//   (Item_Id, Item_Name, Item_Image, Item_Category,
//    Item_Price,   Tax_Type, Tax_Amount, Amount,
//    created_at, updated_at)
//    VALUES (?, ?, ?, ?, ?, ?,  ?, ?, NOW(), NOW())`,
//   [
//     newItemId,
//     Item_Name,
//     imageFileName,
//     Item_Category,
//     Item_Price,
    
        
//     Tax_Type,         // correct
//     Tax_Amount,       // FIXED — was wrong earlier
//     Amount,           // correct
//   ]
// );

//         }

//         await connection.commit();

//         return res.status(201).json({
//             success: true,
//             message: "Food items added successfully",
//         });

//     } catch (err) {
//         if (connection) await connection.rollback();
//         console.error("❌ Food Add Error:", err);

//      next(err);
//     } finally {
//         if (connection) connection.release();
//     }
// };
// const getAllFoodItems = async (req, res, next) => {
//     let connection;

//     try {
//         connection = await db.getConnection();

//         // Page is optional
//         const page = req.query.page ? parseInt(req.query.page, 10) : null;
//         const limit = 10;
//         const offset = page ? (page - 1) * limit : 0;

//         // Search is optional
//         const search = req.query.search ? req.query.search.trim().toLowerCase() : "";

//         let whereClauses = [];
//         let params = [];

//         if (search) {
//             whereClauses.push(`
//                 (LOWER(Item_Name) LIKE ?
//                 OR LOWER(Item_Category) LIKE ?
//                 OR Item_Price LIKE ?) 
//             `);

//             const like = `%${search}%`;
//             params.push(like, like, like);
//         }

//         const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";


//         // ==========================================================
//         // CASE 1: ❌ no page AND ❌ no search  → Fetch ALL
//         // ==========================================================
//         if (!page && !search) {
//             const [rows] = await connection.query(
//                 `SELECT * FROM add_food_item ORDER BY LOWER(Item_Name) ASC`
//             );

//             return res.status(200).json({
//                 success: true,
//                 totalItems: rows.length,
//                 foodItems: rows,
             
//             });
//         }


//         // ==========================================================
//         // CASE 2: ❌ no page BUT ✔ search → All Filtered
//         // ==========================================================
//         if (!page && search) {
//             const [filtered] = await connection.query(
//                 `SELECT * FROM add_food_item ${whereSQL} ORDER BY created_at DESC`,
//                 params
//             );

//             return res.status(200).json({
//                 success: true,
//                 totalItems: filtered.length,
//                 foodItems: filtered,
                
//             });
//         }


//         // ==========================================================
//         // CASE 3: ✔ page (with or without search) → Paginated
//         // ==========================================================
//         const [rows] = await connection.query(
//             `
//             SELECT * FROM add_food_item
//             ${whereSQL}
//             ORDER BY created_at DESC
//             LIMIT ? OFFSET ?
//             `,
//             [...params, limit, offset]
//         );

//         const [count] = await connection.query(
//             `SELECT COUNT(*) AS count FROM add_food_item ${whereSQL}`,
//             params
//         );

//         const totalItems = count[0].count;
//         const totalPages = Math.ceil(totalItems / limit);

//         return res.status(200).json({
//             success: true,
//             currentPage: page,
//             totalItems,
//             totalPages,
//             foodItems: rows,
//             pageSize: limit,
          
//         });

//     } catch (err) {
//         console.error("❌ Error getting all food items:", err);
//         next(err);
//     } finally {
//         if (connection) connection.release();
//     }
// };

// const getAllFoodItems = async (req, res, next) => {
//     let connection;
//     try {
//         connection = await db.getConnection();

//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = 10;
//         const offset = (page - 1) * limit;

//         const search = req.query.search ? req.query.search.trim().toLowerCase() : "";

//         let whereClauses = [];
//         let params = [];

//         // 🔍 Search support
//         if (search) {
//             whereClauses.push(`
//                 (LOWER(Item_Name) LIKE ?
//                  OR LOWER(Item_Category) LIKE ?
//                  OR Item_Price LIKE ?) 
//             `);

//             const like = `%${search}%`;
//             params.push(like, like, like);
//         }

//         const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

//         // 🔹 Fetch paginated data
//         const [rows] = await connection.query(
//             `SELECT * FROM add_food_item 
//              ${whereSQL}
//              ORDER BY created_at DESC
//              LIMIT ? OFFSET ?`,
//             [...params, limit, offset]
//         );

//         // 🔹 Count total items
//         const [count] = await connection.query(
//             `SELECT COUNT(*) AS count FROM add_food_item ${whereSQL}`,
//             params // only search params
//         );

//         const totalItems = count[0].count;
//         const totalPages = Math.ceil(totalItems / limit);

//         return res.status(200).json({
//             success: true,
//             currentPage: page,
//             totalItems,
//             totalPages,
//             foodItems: rows,
//         });

//     } catch (err) {
//         console.error("❌ Error getting all food items:", err);
//         next(err);
//     } finally {
//         if (connection) connection.release();
//     }
// };

// const editSingleFoodItem = async (req, res, next) => {
//     let connection;
//     try {
//         connection = await db.getConnection();
//         await connection.beginTransaction();

//         const { Item_Id } = req.params;
//         const cleanData = sanitizeObject(req.body);
//         const validation = foodItemSchema.safeParse(cleanData);
//         if (!validation.success) {
//             return res.status(400).json({ errors: validation.error.errors });
//         }
//         const {
//             Item_Name,
//             Item_Category,
//             Item_Price,
//             Item_Image,
//             Item_Quantity,
//             Tax_Type,
//             Tax_Amount,
//             Amount
//         } = validation.data;

//         const [result] = await connection.query(
//             `UPDATE add_food_item SET Item_Name = ?, Item_Category = ?, Item_Price = ?, Item_Quantity = ?, Tax_Type = ?, Tax_Amount = ?, Amount = ?, updated_at = NOW() WHERE Item_Id = ?`,
//             [
//                 Item_Name,
//                 Item_Category,
//                 Item_Price,
//                 Item_Quantity,
//                 Tax_Type,
//                 Tax_Amount,
//                 Amount,
//                 Item_Id
//             ]
//         );

//         await connection.commit();
//         return res.status(200).json({
//             success: true,
//             message: "Food item edited successfully",
//             editedItem: result,
//         });
//         }catch (err) {
//         if (connection) await connection.rollback();
//         console.error("❌ Error editing food item:", err);
//         next(err);
//     } finally {
//         if (connection) connection.release();
//     }
// };

// const editSingleFoodItem = async (req, res, next) => {
//     let connection;

//     try {
//         connection = await db.getConnection();
//         await connection.beginTransaction();

//         const { Item_Id } = req.params;

//         // 1️⃣ Fetch existing item to get old image
//         const [existing] = await connection.query(
//             "SELECT Item_Image FROM add_food_item WHERE Item_Id = ?",
//             [Item_Id]
//         );

//         if (existing.length === 0) {
//             return res.status(404).json({ message: "Food item not found" });
//         }

//         let oldImage = existing[0].Item_Image; // filename

//         // 2️⃣ Sanitize and validate request body
//         const cleanData = sanitizeObject(req.body);
//         const validation = foodItemSchema.safeParse(cleanData);

//         if (!validation.success) {
//             return res.status(400).json({ errors: validation.error.errors });
//         }

//         const {
//             Item_Name,
//             Item_Category,
//             Item_Price,
//             Item_Quantity,
//             Tax_Type,
//             Tax_Amount,
            
//             Amount
//         } = validation.data;

//         // 3️⃣ Handle new uploaded image
//         let newImage = oldImage; // default (if no new upload)

//         if (req.file) {
//             newImage = req.file.filename; // saved by multer

//             // 4️⃣ Delete old image from server
//             if (oldImage) {
//                 const oldPath = `./uploads/food-item/${oldImage}`;
//                 if (fs.existsSync(oldPath)) {
//                     fs.unlinkSync(oldPath);
//                 }
//             }
//         }

//         // 5️⃣ Update DB record
//         await connection.query(
//             `UPDATE add_food_item 
//              SET Item_Name=?, Item_Category=?, Item_Price=?, 
//                  Item_Quantity=?, Tax_Type=?, Tax_Amount=?, Amount=?, 
//                  Item_Image=?, updated_at=NOW()
//              WHERE Item_Id=?`,
//             [
//                 Item_Name,
//                 Item_Category,
//                 Item_Price,
//                 Item_Quantity,
//                 Tax_Type,
//                 Tax_Amount,
//                 Amount,
//                 newImage,   // 👉 updated or existing image
//                 Item_Id
//             ]
//         );

//         await connection.commit();

//         return res.status(200).json({
//             success: true,
//             message: "Food item updated successfully",
//             image: newImage
//         });

//     } catch (err) {
//         if (connection) await connection.rollback();
//         console.error("❌ Error editing food item:", err);
//         next(err);
//     } finally {
//         if (connection) connection.release();
//     }
// };
// const editSingleFoodItem = async (req, res, next) => {
//     let connection;

//     try {
//         connection = await db.getConnection();
//         await connection.beginTransaction();

//         const { Item_Id } = req.params;

//         if (!Item_Id) {
//             return res.status(400).json({ message: "Item_Id is required" });
//         }

//         // 1) Get existing item (to delete old image later)
//         const [existing] = await connection.query(
//             "SELECT Item_Image FROM add_food_item WHERE Item_Id = ?",
//             [Item_Id]
//         );

//         if (existing.length === 0) {
//             return res.status(404).json({ message: "Food item not found" });
//         }

//         const oldImage = existing[0].Item_Image;

//         // 2) Sanitize input
//         // const cleanData = sanitizeObject(req.body);

//         // 3) Extract fields manually
//         const {
//             Item_Name,
//             Item_Category,
//             Item_Price,
            
//             Tax_Type,
//             Tax_Amount,
//             Amount
//         } = req.body;

//         // 4) Simple validation (manual)
//         if (!Item_Name ) {
//             return res.status(400).json({
//                 message: "Item_Name are required."
//             });
//         }

//         // 5) Handle new image (optional)
//         let newImage = oldImage;

//         if (req.file) {
//             newImage = req.file.filename;

//             // Delete old image
//             if (oldImage) {
//                 const oldPath = `./uploads/food-item/${oldImage}`;
//                 if (fs.existsSync(oldPath)) {
//                     fs.unlinkSync(oldPath);
//                 }
//             }
//         }

//         // 6) Update DB
//         await connection.query(
//             `UPDATE add_food_item 
//              SET Item_Name=?, Item_Category=?, Item_Price=?, 
//                   Tax_Type=?, Tax_Amount=?, Amount=?, 
//                  Item_Image=?, updated_at=NOW()
//              WHERE Item_Id=?`,
//             [
//                 Item_Name,
//                 Item_Category,
//                 Number(Item_Price),
                
//                 Tax_Type || "None",
//                 Number(Tax_Amount) || 0,
//                 Number(Amount) || 0,
//                 newImage,
//                 Item_Id
//             ]
//         );

//         await connection.commit();

//         return res.status(200).json({
//             success: true,
//             message: "Food item updated successfully",
//             Item_Id,
//             image: newImage
//         });

//     } catch (err) {
//         if (connection) await connection.rollback();
//         console.error("❌ Error editing food item:", err);
//         next(err);
//     } finally {
//         if (connection) connection.release();
//     }
// };

// const getAllFoodItems = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();

//     // Page is optional
//     const page = req.query.page ? parseInt(req.query.page, 10) : null;
//     const limit = 10;
//     const offset = page ? (page - 1) * limit : 0;

//     // Search is optional
//     const search = req.query.search ? req.query.search.trim().toLowerCase() : "";

//     let whereClauses = [`is_deleted = 0`]; // ✅ BASE CONDITION
//     let params = [];

//     if (search) {
//       whereClauses.push(`
//         (LOWER(Item_Name) LIKE ?
//          OR LOWER(Item_Category) LIKE ?
//          OR Item_Price LIKE ?)
//       `);

//       const like = `%${search}%`;
//       params.push(like, like, like);
//     }

//     const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

//     // ==========================================================
//     // CASE 1: ❌ no page AND ❌ no search → Fetch ALL (not deleted)
//     // ==========================================================
//     if (!page && !search) {
//       const [rows] = await connection.query(
//         `SELECT * FROM add_food_item ${whereSQL} ORDER BY LOWER(Item_Name) ASC`
//       );

//       return res.status(200).json({
//         success: true,
//         totalItems: rows.length,
//         foodItems: rows,
//       });
//     }

//     // ==========================================================
//     // CASE 2: ❌ no page BUT ✔ search → All Filtered (not deleted)
//     // ==========================================================
//     if (!page && search) {
//       const [filtered] = await connection.query(
//         `SELECT * FROM add_food_item ${whereSQL} ORDER BY created_at DESC`,
//         params
//       );

//       return res.status(200).json({
//         success: true,
//         totalItems: filtered.length,
//         foodItems: filtered,
//       });
//     }

//     // ==========================================================
//     // CASE 3: ✔ page (with or without search) → Paginated
//     // ==========================================================
//     const [rows] = await connection.query(
//       `
//       SELECT * FROM add_food_item
//       ${whereSQL}
//       ORDER BY created_at DESC
//       LIMIT ? OFFSET ?
//       `,
//       [...params, limit, offset]
//     );

//     const [count] = await connection.query(
//       `SELECT COUNT(*) AS count FROM add_food_item ${whereSQL}`,
//       params
//     );

//     const totalItems = count[0].count;
//     const totalPages = Math.ceil(totalItems / limit);

//     return res.status(200).json({
//       success: true,
//       currentPage: page,
//       totalItems,
//       totalPages,
//       foodItems: rows,
//       pageSize: limit,
//     });

//   } catch (err) {
//     console.error("❌ Error getting all food items:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };


// const getAllFoodItems = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();

//     const stockDate = new Date().toLocaleDateString("en-CA", {
//       timeZone: "Asia/Kolkata",
//     });

//     // ✅ NEW: Get orderType from query
//     const orderType = req.query.orderType || "TAKEAWAY";

//     // Page is optional
//     const page = req.query.page ? parseInt(req.query.page, 10) : null;
//     const limit = 10;
//     const offset = page ? (page - 1) * limit : 0;

//     // Search is optional
//     const search = req.query.search
//       ? req.query.search.trim().toLowerCase()
//       : "";

//     let whereClauses = [`afi.is_deleted = 0`];
//     let params = [];

//     if (search) {
//       whereClauses.push(`
//         (
//           LOWER(afi.Item_Name) LIKE ?
//           OR LOWER(afi.Item_Category) LIKE ?
//           OR CAST(fip.Item_Price AS CHAR) LIKE ?
//         )
//       `);

//       const like = `%${search}%`;
//       params.push(like, like, like);
//     }

//     const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

//     /* ==========================================================
//        CASE 1: ❌ no page AND ❌ no search → ALL
//     ========================================================== */
//     if (!page && !search) {
//       const [rows] = await connection.query(
//         `
//         SELECT
//           afi.*,
//           fip.Item_Price,
//           fip.Tax_Type,
//           fip.Tax_Amount,
//           fip.Amount,
//           COALESCE(dfs.Closing_Quantity, 0) AS Current_Quantity
//         FROM add_food_item afi
//         LEFT JOIN food_item_price fip
//           ON fip.Item_Id = afi.Item_Id
//          AND fip.Order_Type = ?
//         LEFT JOIN daily_food_stock dfs
//           ON dfs.Item_Id = afi.Item_Id
//          AND dfs.Stock_Date = ?
//         ${whereSQL}
//         ORDER BY LOWER(afi.Item_Name) ASC
//         `,
//         [orderType, stockDate, ...params]
//       );

//       return res.status(200).json({
//         success: true,
//         totalItems: rows.length,
//         foodItems: rows,
//       });
//     }

//     /* ==========================================================
//        CASE 2: ❌ no page BUT ✔ search → ALL FILTERED
//     ========================================================== */
//     if (!page && search) {
//       const [filtered] = await connection.query(
//         `
//         SELECT
//           afi.*,
//           fip.Item_Price,
//           fip.Tax_Type,
//           fip.Tax_Amount,
//           fip.Amount,
//           COALESCE(dfs.Closing_Quantity, 0) AS Current_Quantity
//         FROM add_food_item afi
//         LEFT JOIN food_item_price fip
//           ON fip.Item_Id = afi.Item_Id
//          AND fip.Order_Type = ?
//         LEFT JOIN daily_food_stock dfs
//           ON dfs.Item_Id = afi.Item_Id
//          AND dfs.Stock_Date = ?
//         ${whereSQL}
//         ORDER BY afi.created_at DESC
//         `,
//         [orderType, stockDate, ...params]
//       );

//       return res.status(200).json({
//         success: true,
//         totalItems: filtered.length,
//         foodItems: filtered,
//       });
//     }

//     /* ==========================================================
//        CASE 3: ✔ page (with / without search)
//     ========================================================== */
//     const [rows] = await connection.query(
//       `
//       SELECT
//         afi.*,
//         fip.Item_Price,
//         fip.Tax_Type,
//         fip.Tax_Amount,
//         fip.Amount,
//         COALESCE(dfs.Closing_Quantity, 0) AS Current_Quantity
//       FROM add_food_item afi
//       LEFT JOIN food_item_price fip
//         ON fip.Item_Id = afi.Item_Id
//        AND fip.Order_Type = ?
//       LEFT JOIN daily_food_stock dfs
//         ON dfs.Item_Id = afi.Item_Id
//        AND dfs.Stock_Date = ?
//       ${whereSQL}
//       ORDER BY afi.created_at DESC
//       LIMIT ? OFFSET ?
//       `,
//       [orderType, stockDate, ...params, limit, offset]
//     );

//     // ✅ COUNT (No change needed except base table)
//     const [count] = await connection.query(
//       `SELECT COUNT(*) AS count FROM add_food_item afi ${whereSQL}`,
//       params
//     );

//     const totalItems = count[0].count;
//     const totalPages = Math.ceil(totalItems / limit);

//     return res.status(200).json({
//       success: true,
//       currentPage: page,
//       totalItems,
//       totalPages,
//       pageSize: limit,
//       foodItems: rows,
//     });

//   } catch (err) {
//     console.error("❌ Error getting all food items:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
//OLD
// const getAllFoodItems = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();

//     const stockDate = new Date().toLocaleDateString("en-CA", {
//       timeZone: "Asia/Kolkata",
//     });

//     // Page is optional
//     const page = req.query.page ? parseInt(req.query.page, 10) : null;
//     const limit = 10;
//     const offset = page ? (page - 1) * limit : 0;

//     // Search is optional
//     const search = req.query.search ? req.query.search.trim().toLowerCase() : "";

//     let whereClauses = [`afi.is_deleted = 0`];
//     let params = [];

//     if (search) {
//       whereClauses.push(`
//         (
//           LOWER(afi.Item_Name) LIKE ?
//           OR LOWER(afi.Item_Category) LIKE ?
//           OR CAST(afi.Item_Price AS CHAR) LIKE ?
//         )
//       `);
//       const like = `%${search}%`;
//       params.push(like, like, like);
//     }

//     const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

//     /* ==========================================================
//        CASE 1: ❌ no page AND ❌ no search → ALL
//     ========================================================== */
//     if (!page && !search) {
//       const [rows] = await connection.query(
//         `
//         SELECT
//           afi.*,
//           COALESCE(dfs.Closing_Quantity, 0) AS Current_Quantity
//         FROM add_food_item afi
//         LEFT JOIN daily_food_stock dfs
//           ON dfs.Item_Id = afi.Item_Id
//          AND dfs.Stock_Date = ?
//         ${whereSQL}
//         ORDER BY LOWER(afi.Item_Name) ASC
//         `,
//         [stockDate]
//       );

//       return res.status(200).json({
//         success: true,
//         totalItems: rows.length,
//         foodItems: rows,
//       });
//     }

//     /* ==========================================================
//        CASE 2: ❌ no page BUT ✔ search → ALL FILTERED
//     ========================================================== */
//     if (!page && search) {
//       const [filtered] = await connection.query(
//         `
//         SELECT
//           afi.*,
//           COALESCE(dfs.Closing_Quantity, 0) AS Current_Quantity
//         FROM add_food_item afi
//         LEFT JOIN daily_food_stock dfs
//           ON dfs.Item_Id = afi.Item_Id
//          AND dfs.Stock_Date = ?
//         ${whereSQL}
//         ORDER BY afi.created_at DESC
//         `,
//         [stockDate, ...params]
//       );

//       return res.status(200).json({
//         success: true,
//         totalItems: filtered.length,
//         foodItems: filtered,
//       });
//     }

//     /* ==========================================================
//        CASE 3: ✔ page (with / without search)
//     ========================================================== */
//     const [rows] = await connection.query(
//       `
//       SELECT
//         afi.*,
//         COALESCE(dfs.Closing_Quantity, 0) AS Current_Quantity
//       FROM add_food_item afi
//       LEFT JOIN daily_food_stock dfs
//         ON dfs.Item_Id = afi.Item_Id
//        AND dfs.Stock_Date = ?
//       ${whereSQL}
//       ORDER BY afi.created_at DESC
//       LIMIT ? OFFSET ?
//       `,
//       [stockDate, ...params, limit, offset]
//     );

//     const [count] = await connection.query(
//       `SELECT COUNT(*) AS count FROM add_food_item afi ${whereSQL}`,
//       params
//     );

//     const totalItems = count[0].count;
//     const totalPages = Math.ceil(totalItems / limit);

//     return res.status(200).json({
//       success: true,
//       currentPage: page,
//       totalItems,
//       totalPages,
//       pageSize: limit,
//       foodItems: rows,
//     });

//   } catch (err) {
//     console.error("❌ Error getting all food items:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

const toggleFoodItemAvailability = async (req, res,next) => {

    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();
  const { Item_Id} = req.params;

  if (!Item_Id) {
    return res.status(400).json({ message: "Item_Id is required" });
  }

  const [item] = await db.query(
    `UPDATE add_food_item 
     SET is_available = NOT is_available
     WHERE Item_Id = ?`,
    [Item_Id]
  );
  if(item.affectedRows === 0) {
    return res.status(404).json({ message: "Food item not found" });
  }

    await connection.commit();
    const [updatedItem] = await connection.query(
    `SELECT is_available FROM add_food_item WHERE Item_Id = ?`,
    [Item_Id]
  );

  const newStatus = updatedItem[0].is_available === 1 ? "available" : "not available";
// After updating DB
io.emit("food_item_availability_changed", {
  Item_Id,
  is_available: newStatus,
});

  return res.status(200).json({ success: true, message: "Availability updated" });

} catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error toggling food item availability:", err);
     next(err);
  } finally {
    if (connection) connection.release();
  }
};

const editSingleFoodItem = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { Item_Id } = req.params;

    if (!Item_Id) {
      return res.status(400).json({ message: "Item_Id is required" });
    }

    /* ===================== 1️⃣ CHECK ITEM ===================== */
    const [existing] = await connection.execute(
      `SELECT Item_Image FROM add_food_item WHERE Item_Id = ?`,
      [Item_Id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Food item not found" });
    }

    const oldImage = existing[0].Item_Image;

    /* ===================== 2️⃣ EXTRACT BODY ===================== */
    const {
      Item_Category,
      Tax_Type,
      Tax_Amount,
      Amount, // ✅ FIXED

      DineIn_Item_Price,
      Takeaway_Item_Price,
    } = req.body;

    const Item_Name = req.body.Item_Name?.trim();

    if (!Item_Name) {
      return res.status(400).json({
        message: "Item_Name is required",
      });
    }

    /* ===================== 3️⃣ IMAGE ===================== */
    let newImage = oldImage;

    if (req.file) {
      newImage = req.file.filename;

      if (oldImage) {
        const oldPath = `./uploads/food-item/${oldImage}`;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    /* ===================== 4️⃣ UPDATE BASE TABLE ===================== */
    await connection.execute(
      `
      UPDATE add_food_item
      SET Item_Name = ?,
          Item_Category = ?,
          Tax_Type = ?,
          Tax_Amount = ?,
          Amount = ?,
          Item_Image = ?,
          updated_at = NOW()
      WHERE Item_Id = ?
      `,
      [
        Item_Name,
        Item_Category,
        Tax_Type || "None",
        Number(Tax_Amount) || 0,
        Number(Amount) || 0,
        newImage,
        Item_Id,
      ]
    );

    /* ===================== 5️⃣ UPSERT PRICE ===================== */
  const upsertPrice = async (orderType, price) => {
  // 🔥 convert safely
  const parsedPrice = Number(price);

  // ❌ skip if invalid number
  if (!price || isNaN(parsedPrice)) {
    return;
  }

  await connection.execute(
    `
    INSERT INTO food_item_price
      (Item_Id, Order_Type, Item_Price, Tax_Type, Tax_Amount, Amount)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      Item_Price = VALUES(Item_Price),
      Tax_Type = VALUES(Tax_Type),
      Tax_Amount = VALUES(Tax_Amount),
      Amount = VALUES(Amount),
      updated_at = NOW()
    `,
    [
      Item_Id,
      orderType,
      parsedPrice,
      Tax_Type || "None",
      Number(Tax_Amount) || 0,
     parsedPrice
    ]
  );
};
    /* ===================== 6️⃣ UPDATE BOTH PRICES ===================== */
    await upsertPrice("DINE_IN", DineIn_Item_Price);
    await upsertPrice("TAKEAWAY", Takeaway_Item_Price);

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Food item updated successfully",
      Item_Id,
      image: newImage,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error editing food item:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
//OLD
// const editSingleFoodItem = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     const { Item_Id } = req.params;

//     if (!Item_Id) {
//       return res.status(400).json({ message: "Item_Id is required" });
//     }

//     // 1️⃣ Get existing item
//     const [existing] = await connection.query(
//       "SELECT Item_Image FROM add_food_item WHERE Item_Id = ?",
//       [Item_Id]
//     );

//     if (existing.length === 0) {
//       return res.status(404).json({ message: "Food item not found" });
//     }

//     const oldImage = existing[0].Item_Image;

//     // 2️⃣ Extract & TRIM
//     const {
//       Item_Category,
//       Item_Price,
//       Tax_Type,
//       Tax_Amount,
//       Amount,
//     } = req.body;

//     const Item_Name = req.body.Item_Name?.trim();

//     // 3️⃣ Validate AFTER trim
//     if (!Item_Name) {
//       return res.status(400).json({
//         message: "Item_Name is required.",
//       });
//     }

//     // 4️⃣ Handle image
//     let newImage = oldImage;

//     if (req.file) {
//       newImage = req.file.filename;

//       if (oldImage) {
//         const oldPath = `./uploads/food-item/${oldImage}`;
//         if (fs.existsSync(oldPath)) {
//           fs.unlinkSync(oldPath);
//         }
//       }
//     }

//     // 5️⃣ Update DB
//     await connection.query(
//       `
//       UPDATE add_food_item
//       SET Item_Name=?, Item_Category=?, Item_Price=?,
//           Tax_Type=?, Tax_Amount=?, Amount=?,
//           Item_Image=?, updated_at=NOW()
//       WHERE Item_Id=?
//       `,
//       [
//         Item_Name,                       // ✅ trimmed
//         Item_Category,
//         Number(Item_Price),
//         Tax_Type || "None",
//         Number(Tax_Amount) || 0,
//         Number(Amount) || 0,
//         newImage,
//         Item_Id,
//       ]
//     );

//     await connection.commit();

//     return res.status(200).json({
//       success: true,
//       message: "Food item updated successfully",
//       Item_Id,
//       image: newImage,
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error editing food item:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
const softDeleteFoodItem = async (req, res, next) => {
  let connection;

  try {
    const { Item_Id } = req.params;

    if (!Item_Id) {
      return res.status(400).json({
        success: false,
        message: "Item_Id is required",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    /* ---------------- FETCH ITEM NAME ---------------- */
    const [[item]] = await connection.query(
      `SELECT Item_Name 
       FROM add_food_item 
       WHERE Item_Id = ? AND is_deleted = 0
       LIMIT 1`,
      [Item_Id]
    );

    if (!item) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Food item not found or already deleted",
      });
    }

    /* ---------------- SOFT DELETE ---------------- */
    await connection.query(
      `UPDATE add_food_item 
       SET is_deleted = 1
       WHERE Item_Id = ?`,
      [Item_Id]
    );

    await connection.commit();

    /* ---------------- SOCKET EMIT ---------------- */
    io.emit("food_item_deleted", {
      Item_Id,
      Item_Name: item.Item_Name,
    });

    /* ---------------- RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      message: "Food item soft-deleted successfully",
      Item_Id,
      Item_Name: item.Item_Name,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error deleting food item:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


const getAllCategoriesAndFoodItemsToBeShownOnMenu = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    // 1️⃣ Get categories shown on menu
    const [categoryRows] = await connection.query(
      `
      SELECT id, Item_Category
      FROM add_category
      WHERE is_shown_on_menu = 1
      ORDER BY created_at ASC
      `
    );

    if (!categoryRows.length) {
      return res.status(200).json({
        success: true,
        categories: [],
      });
    }

    const categoryNames = categoryRows.map(c => c.Item_Category);

    // 2️⃣ Get food items for those categories
    const [foodRows] = await connection.query(
      `
      SELECT id, Item_Name, Item_Price, Item_Category
      FROM add_food_item
      WHERE Item_Category IN (?)
      AND is_deleted = 0
      ORDER BY Item_Category, Item_Name
      `,
      [categoryNames]
    );

    // 3️⃣ Group food items by category
    const grouped = {};
    categoryRows.forEach(cat => {
      grouped[cat.Item_Category] = [];
    });

    foodRows.forEach(item => {
      if (grouped[item.Item_Category]) {
        grouped[item.Item_Category].push(item);
      }
    });

    return res.status(200).json({
      success: true,
      categories: grouped,
    });

  } catch (err) {
    console.error("❌ Error getting menu:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


 const toggleCategoryAvailabilityToBeShownOnMenu = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Category ID is required" });
    }
    
    const [result] = await connection.query(
      `
      UPDATE add_category
      SET is_shown_on_menu = NOT is_shown_on_menu,
      updated_at = NOW()
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Category menu visibility updated",

    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error toggling category menu visibility:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

const updateFoodItemCategory = async (req, res, next) => {
  let connection;

  try {
    const { Category_Id } = req.params;
    const { newCategoryName } = req.body;

    if (!Category_Id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    if (!newCategoryName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "New category name is required",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    /* ============================================
       1️⃣ GET OLD CATEGORY NAME
    ============================================ */

    const [[categoryRow]] = await connection.query(
      `SELECT Item_Category FROM add_category WHERE id = ?`,
      [Category_Id]
    );

    if (!categoryRow) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const oldCategoryName = categoryRow.Item_Category;

    /* ============================================
       2️⃣ UPDATE CATEGORY TABLE
    ============================================ */

    await connection.query(
      `
      UPDATE add_category
      SET Item_Category = ?, updated_at = NOW()
      WHERE id = ?
      `,
      [newCategoryName.trim(), Category_Id]
    );

    /* ============================================
       3️⃣ UPDATE FOOD ITEMS
    ============================================ */

    await connection.query(
      `
      UPDATE add_food_item
      SET Item_Category = ?, updated_at = NOW()
      WHERE Item_Category = ?
      `,
      [newCategoryName.trim(), oldCategoryName]
    );

    /* ============================================
       4️⃣ UPDATE kitchen_staff_categories ARRAY
    ============================================ */

    const [kitchenRows] = await connection.query(
      `
      SELECT id, Category_Names
      FROM kitchen_staff_categories
      WHERE Category_Names LIKE ?
      `,
      [`%${oldCategoryName}%`]
    );

    for (const row of kitchenRows) {
      const categoriesArray = row.Category_Names
        .split(",")
        .map(c => c.trim());

      const updatedArray = categoriesArray.map(cat =>
        cat === oldCategoryName ? newCategoryName.trim() : cat
      );

      await connection.query(
        `
        UPDATE kitchen_staff_categories
        SET Category_Names = ?, updated_at = NOW()
        WHERE id = ?
        `,
        [updatedArray.join(","), row.id]
      );
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error updating category:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

// Closing_Quantity = Opening_Quantity + Added_Quantity - Sold_Quantity
//Added_Quantity = (Sold_Quantity + New_Available) - Old_Opening

// const addOrUpdateDailyFoodItemStock = async (req, res, next) => {
//   let connection;

//   try {
//     const { Item_Id, quantity, Stock_Date } = req.body;

//     /* ================= BASIC VALIDATION ================= */
//     if (!Item_Id) {
//       return res.status(400).json({
//         success: false,
//         message: "Item_Id is required",
//       });
//     }

//     const qtyToAdd = Number(quantity);

//     if (Number.isNaN(qtyToAdd) || qtyToAdd <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Quantity must be a number greater than 0",
//       });
//     }

//     const stockDate =
//       Stock_Date ||
//       new Date().toLocaleDateString("en-CA", {
//         timeZone: "Asia/Kolkata",
//       });

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     /* ================= FETCH EXISTING STOCK (LOCK ROW) ================= */
//     const [[existing]] = await connection.query(
//       `
//       SELECT
//         id,
//         Opening_Quantity,
//         Added_Quantity,
//         Sold_Quantity
//       FROM daily_food_stock
//       WHERE Item_Id = ?
//         AND Stock_Date = ?
//       FOR UPDATE
//       `,
//       [Item_Id, stockDate]
//     );

//     /* ================= FIRST TIME TODAY ================= */
//     if (!existing) {
//       // 🔥 If first entry of the day:
//       // Opening = qtyToAdd (since no carry-forward logic here)
//       // Added = qtyToAdd
//       // Sold = 0
//       // Closing = qtyToAdd

//       await connection.query(
//         `
//         INSERT INTO daily_food_stock (
//           Item_Id,
//           Stock_Date,
//           Opening_Quantity,
//           Added_Quantity,
//           Sold_Quantity,
//           Closing_Quantity,
//           Updated_By
//         )
//         VALUES (?, ?, ?, ?, 0, ?, ?)
//         `,
//         [
//           Item_Id,
//           stockDate,
//           qtyToAdd, // opening
//           qtyToAdd, // added
//           qtyToAdd, // closing
//           req.user?.User_Id || "",
//         ]
//       );
//     } else {
//       /* ================= PROPER ADD MODE ================= */

//       const prevOpening = Number(existing.Opening_Quantity) || 0;
//       const prevAdded   = Number(existing.Added_Quantity) || 0;
//       const prevSold    = Number(existing.Sold_Quantity) || 0;

//       // 🔥 Opening DOES NOT CHANGE
//       const newAdded = prevAdded + qtyToAdd;

//       const newClosing =
//         prevOpening + newAdded - prevSold;

//       await connection.query(
//         `
//         UPDATE daily_food_stock
//         SET
//           Added_Quantity = ?,
//           Closing_Quantity = ?,
//           Updated_By = ?
//         WHERE id = ?
//         `,
//         [
//           newAdded,
//           newClosing,
//           req.user?.User_Id || "",
//           existing.id,
//         ]
//       );
//     }

//     /* ================= STOCK HISTORY ================= */
//     await connection.query(
//       `
//       INSERT INTO food_stock_movements
//         (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
//       VALUES (?, ?, 'ADD', ?, NULL, ?)
//       `,
//       [
//         Item_Id,
//         stockDate,
//         qtyToAdd,
//         req.user?.User_Id || "",
//       ]
//     );

//     await connection.commit();

//     res.status(200).json({
//       success: true,
//       message: "Quantity added successfully",
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error updating daily food stock:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };


// const addOrUpdateDailyFoodItemStock = async (req, res, next) => {
//   let connection;

//   try {
//     const { Item_Id, quantity, Stock_Date } = req.body;

//     /* ================= BASIC VALIDATION ================= */
//     if (!Item_Id) {
//       return res.status(400).json({
//         success: false,
//         message: "Item_Id is required",
//       });
//     }

//     const qtyToAdd = Number(quantity);

//     if (Number.isNaN(qtyToAdd) || qtyToAdd <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Quantity must be a number greater than 0",
//       });
//     }

//     const stockDate =
//       Stock_Date ||
//       new Date().toLocaleDateString("en-CA", {
//         timeZone: "Asia/Kolkata",
//       }); // YYYY-MM-DD

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     /* ================= FETCH EXISTING STOCK (LOCK ROW) ================= */
//     const [[existing]] = await connection.query(
//       `
//       SELECT
//         id,
//         Opening_Quantity,
//         Added_Quantity,
//         Sold_Quantity,
//         Closing_Quantity
//       FROM daily_food_stock
//       WHERE Item_Id = ?
//         AND Stock_Date = ?
//       FOR UPDATE
//       `,
//       [Item_Id, stockDate]
//     );

//     /* ================= FIRST TIME TODAY ================= */
//     if (!existing) {
//       await connection.query(
//         `
//         INSERT INTO daily_food_stock (
//           Item_Id,
//           Stock_Date,
//           Opening_Quantity,
//           Added_Quantity,
//           Sold_Quantity,
//           Closing_Quantity,
//           Updated_By
//         )
//         VALUES (?, ?, ?, ?, 0, ?, ?)
//         `,
//         [
//           Item_Id,
//           stockDate,
//           qtyToAdd, // opening
//           qtyToAdd, // added
//           qtyToAdd, // closing
//           req.user?.User_Id || "",
//         ]
//       );
//     } else {
//       /* ================= ADD MODE ================= */

//       const prevOpening = Number(existing.Opening_Quantity) || 0;
//       const prevAdded   = Number(existing.Added_Quantity) || 0;
//       const prevClosing = Number(existing.Closing_Quantity) || 0;

//       const newOpening = prevOpening + qtyToAdd;
//       const newAdded   = prevAdded + qtyToAdd;
//       const newClosing = prevClosing + qtyToAdd;

//       await connection.query(
//         `
//         UPDATE daily_food_stock
//         SET
//           Opening_Quantity = ?,
//           Added_Quantity = ?,
//           Closing_Quantity = ?,
//           Updated_By = ?
//         WHERE id = ?
//         `,
//         [
//           newOpening,
//           newAdded,
//           newClosing,
//           req.user?.User_Id || "",
//           existing.id,
//         ]
//       );
//     }

//     /* ================= 🔥 STOCK HISTORY (NO BUSINESS LOGIC CHANGE) ================= */
//    await connection.query(
//   `
//   INSERT INTO food_stock_movements
//     (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
//   VALUES (?,  ?, 'ADD', ?, NULL, ?)
//   `,
//   [
//     Item_Id,
//       // or fetch once from add_food_item
//     stockDate,
//     qtyToAdd,
//     req.user?.User_Id || "",
//   ]
// );


//     await connection.commit();

//     res.status(200).json({
//       success: true,
//       message: "Quantity added successfully",
//     });
//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error updating daily food stock:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
// const ensureTodayStockExists = async (connection, today) => {
//   // Check if today already exists
//   const [[exists]] = await connection.query(
//     `SELECT 1 FROM daily_food_stock WHERE Stock_Date = ? LIMIT 1`,
//     [today]
//   );

//   if (exists) return;

//   // Find last available stock date
//   const [[lastDateRow]] = await connection.query(
//     `
//     SELECT MAX(Stock_Date) AS lastDate
//     FROM daily_food_stock
//     `
//   );

//   if (!lastDateRow?.lastDate) return;

//   const lastDate = lastDateRow.lastDate;

//   // Carry forward from last date
//   const [lastStocks] = await connection.query(
//     `
//     SELECT Item_Id, Closing_Quantity
//     FROM daily_food_stock
//     WHERE Stock_Date = ?
//     `,
//     [lastDate]
//   );

//   for (const row of lastStocks) {
//     await connection.query(
//       `
//       INSERT IGNORE INTO daily_food_stock
//         (Item_Id, Stock_Date,
//          Opening_Quantity, Added_Quantity, Sold_Quantity, Closing_Quantity)
//       VALUES (?, ?, ?, 0, 0, ?)
//       `,
//       [
//         row.Item_Id,
//         today,
//         row.Closing_Quantity || 0,
//         row.Closing_Quantity || 0,
//       ]
//     );
//   }
// };

// const ensureTodayStockExists = async (connection, today) => {
//   // 1️⃣ last available day BEFORE today
//   const [[lastDateRow]] = await connection.query(
//     `
//     SELECT MAX(Stock_Date) AS lastDate
//     FROM daily_food_stock
//     WHERE Stock_Date < ?
//     `,
//     [today]
//   );

//   if (!lastDateRow?.lastDate) return;

//   const lastDate = lastDateRow.lastDate;

//   // 2️⃣ carry forward per item (safe with UNIQUE index)
//   const [result] = await connection.query(
//     `
//     INSERT INTO daily_food_stock
//       (Item_Id, Stock_Date,
//        Opening_Quantity, Added_Quantity, Sold_Quantity, Closing_Quantity)
//     SELECT
//       dfs.Item_Id,
//       ?,
//       dfs.Closing_Quantity,
//       0,
//       0,
//       dfs.Closing_Quantity
//     FROM daily_food_stock dfs
//     WHERE dfs.Stock_Date = ?
//       AND NOT EXISTS (
//         SELECT 1
//         FROM daily_food_stock t
//         WHERE t.Item_Id = dfs.Item_Id
//           AND t.Stock_Date = ?
//       )
//     `,
//     [today, lastDate, today]
//   );

//   // 🔥 DEBUG (temporary)
//   console.log("Carry-forward inserted rows:", result.affectedRows);
// };
const ensureTodayStockExists = async (connection, today) => {

  // 🔥 1️⃣ Get last available stock date before today
  const [[lastDateRow]] = await connection.query(
    `
    SELECT MAX(Stock_Date) AS lastDate
    FROM daily_food_stock
    WHERE Stock_Date < ?
    `,
    [today]
  );

  if (!lastDateRow?.lastDate) return;

  const lastDate = lastDateRow.lastDate;

  //  2️⃣ Carry forward ONLY missing rows
  await connection.query(
    `
    INSERT INTO daily_food_stock
      (Item_Id, Stock_Date,
       Opening_Quantity, Added_Quantity,
       Sold_Quantity, Closing_Quantity)
    SELECT
      dfs.Item_Id,
      ?,
      dfs.Closing_Quantity,
      0,
      0,
      dfs.Closing_Quantity
    FROM daily_food_stock dfs
    WHERE dfs.Stock_Date = ?
      AND NOT EXISTS (
        SELECT 1
        FROM daily_food_stock t
        WHERE t.Item_Id = dfs.Item_Id
          AND t.Stock_Date = ?
      )
    `,
    [today, lastDate, today]
  );
};
const addOrUpdateDailyFoodItemStock = async (req, res, next) => {
  let connection;

  try {
    const { Item_Id, quantity, Stock_Date } = req.body;

    if (!Item_Id) {
      return res.status(400).json({ success: false, message: "Item_Id is required" });
    }

    const qtyToAdd = Number(quantity);
    if (Number.isNaN(qtyToAdd) || qtyToAdd <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    const stockDate =
      Stock_Date ||
      new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

    connection = await db.getConnection();
    await connection.beginTransaction();

    /* ================= CHECK TODAY STOCK ================= */
    const [[todayStock]] = await connection.execute(
      `
      SELECT id, Opening_Quantity, Added_Quantity, Sold_Quantity
      FROM daily_food_stock
      WHERE Item_Id = ?
        AND Stock_Date = ?
      FOR UPDATE
      `,
      [Item_Id, stockDate]
    );

    let openingQty = 0;
    let addedQty = qtyToAdd;
    let soldQty = 0;

    /* ================= IF TODAY ROW DOES NOT EXIST ================= */
    if (!todayStock) {
      // 🔥 Fetch yesterday closing
      const [[prev]] = await connection.execute(
        `
        SELECT Closing_Quantity
        FROM daily_food_stock
        WHERE Item_Id = ?
          AND Stock_Date < ?
        ORDER BY Stock_Date DESC
        LIMIT 1
        `,
        [Item_Id, stockDate]
      );

      openingQty = Number(prev?.Closing_Quantity || 0);
      soldQty = 0;

      const closingQty = openingQty + addedQty;

      await connection.execute(
        `
        INSERT INTO daily_food_stock (
          Item_Id,
          Stock_Date,
          Opening_Quantity,
          Added_Quantity,
          Sold_Quantity,
          Closing_Quantity,
          Updated_By
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          Item_Id,
          stockDate,
          openingQty,
          addedQty,
          soldQty,
          closingQty,
          req.user?.User_Id || "",
        ]
      );
    } 
    /* ================= IF TODAY ROW EXISTS ================= */
    else {
      openingQty = Number(todayStock.Opening_Quantity) || 0;
      soldQty = Number(todayStock.Sold_Quantity) || 0;

      const newAdded = Number(todayStock.Added_Quantity) + qtyToAdd;
      const newClosing = openingQty + newAdded - soldQty;

      await connection.execute(
        `
        UPDATE daily_food_stock
        SET
          Added_Quantity = ?,
          Closing_Quantity = ?,
          Updated_By = ?
        WHERE id = ?
        `,
        [
          newAdded,
          newClosing,
          req.user?.User_Id || "",
          todayStock.id,
        ]
      );
    }

    /* ================= STOCK MOVEMENT ================= */
    await connection.execute(
      `
      INSERT INTO food_stock_movements
        (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
      VALUES (?, ?, 'ADD', ?, NULL, ?)
      `,
      [Item_Id, stockDate, qtyToAdd, req.user?.User_Id || ""]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Stock added successfully",
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Stock add error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
const getDailyFoodItemsStock = async (req, res, next) => {
  let connection;

  try {
    const stockDate =
      req.query.date || new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Kolkata",
});
const today = new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Kolkata",
});

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    const search = req.query.search
      ? req.query.search.trim().toLowerCase()
      : "";

    connection = await db.getConnection();
    if (stockDate === today) {
   await ensureTodayStockExists(connection, stockDate);
}

    // await ensureTodayStockExists(connection, stockDate);
    /* ================= SEARCH ================= */
    let whereClauses = [`afi.is_deleted = 0`];
    let params = [];

    if (search) {
      whereClauses.push(`
        (
          LOWER(afi.Item_Name) LIKE ?
          OR LOWER(afi.Item_Category) LIKE ?
          OR CAST(afi.Item_Price AS CHAR) LIKE ?
        )
      `);

      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const whereSQL =
      whereClauses.length > 0
        ? `WHERE ${whereClauses.join(" AND ")}`
        : "";

    /* ================= TOTAL COUNT ================= */
    const [[countRow]] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM add_food_item afi
      ${whereSQL}
      `,
      params
    );

    const totalItems = countRow.total;
    const totalPages = Math.ceil(totalItems / limit);

    /* ================= PAGED DATA ================= */
    // const [rows] = await connection.query(
    //   `
    //   SELECT
    //     afi.Item_Id,
    //     afi.Item_Name,
    //     afi.Item_Category,
    //     afi.Item_Image,
    //     afi.Item_Price,

    //     COALESCE(dfs.Closing_Quantity, 0) AS Available_Quantity,
    //     dfs.Updated_At,
    //     ? AS Stock_Date
    //   FROM add_food_item afi
    //   LEFT JOIN daily_food_stock dfs
    //     ON dfs.Item_Id = afi.Item_Id
    //    AND dfs.Stock_Date = ?
    //   ${whereSQL}
    //   ORDER BY
    //     CASE
    //       WHEN dfs.Updated_At IS NOT NULL THEN 0
    //       ELSE 1
    //     END,
    //     dfs.Updated_At DESC,
    //     LOWER(afi.Item_Name) ASC
    //   LIMIT ? OFFSET ?
    //   `,
    //   [stockDate, stockDate, ...params, limit, offset]
    // );
  const [rows] = await connection.query(
      `
      SELECT
        afi.Item_Id,
        afi.Item_Name,
        afi.Item_Category,
        afi.Item_Image,
        

        COALESCE(dfs.Closing_Quantity, 0) AS Available_Quantity,
        dfs.Updated_At,
        ? AS Stock_Date
      FROM add_food_item afi
      LEFT JOIN daily_food_stock dfs
        ON dfs.Item_Id = afi.Item_Id
       AND dfs.Stock_Date = ?
      ${whereSQL}
      ORDER BY
        CASE
          WHEN dfs.Updated_At IS NOT NULL THEN 0
          ELSE 1
        END,
        dfs.Updated_At DESC,
        LOWER(afi.Item_Name) ASC
      LIMIT ? OFFSET ?
      `,
      [stockDate, stockDate, ...params, limit, offset]
    );
    return res.status(200).json({
      success: true,
      date: stockDate,

      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,

      foodItems: rows,
    });
  } catch (err) {
    console.error("❌ Error fetching daily food stock:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
const setDailyFoodItemStockZero = async (req, res, next) => {
  let connection;

  try {
    const { Item_Id } = req.params;
    const { reason = "EXPIRY" } = req.body;

    if (!Item_Id) {
      return res.status(400).json({ message: "Item_Id required" });
    }

    const stockDate = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Lock today's stock row
    const [[stock]] = await connection.query(
      `
      SELECT id, Opening_Quantity, Added_Quantity, Sold_Quantity, Closing_Quantity
      FROM daily_food_stock
      WHERE Item_Id = ?
        AND Stock_Date = ?
      FOR UPDATE
      `,
      [Item_Id, stockDate]
    );

    if (!stock || stock.Closing_Quantity <= 0) {
      await connection.rollback();
      return res.status(200).json({
        success: true,
        message: "Stock already zero",
      });
    }

    const currentClosing = Number(stock.Closing_Quantity);

    // 2️⃣ Insert ADJUST movement (negative)
    const adjustmentQty = -currentClosing;

    await connection.query(
      `
      INSERT INTO food_stock_movements
        (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
      VALUES (?, ?, 'ADJUST', ?, ?, ?)
      `,
      [
        Item_Id,
        stockDate,
        adjustmentQty,
        reason, // EXPIRY / WASTAGE
        req.user?.User_Id,
      ]
    );

    // 3️⃣ Recalculate total Added (ADD + ADJUST)
    const [[sumRow]] = await connection.query(
      `
      SELECT COALESCE(SUM(Quantity), 0) AS totalAdded
      FROM food_stock_movements
      WHERE Item_Id = ?
        AND Stock_Date = ?
        AND Movement_Type IN ('ADD','ADJUST')
      `,
      [Item_Id, stockDate]
    );

    const totalAdded = Number(sumRow.totalAdded);

    // 4️⃣ Recalculate Closing properly
    const newClosing =
      Number(stock.Opening_Quantity) +
      totalAdded -
      Number(stock.Sold_Quantity);

    // 5️⃣ Update snapshot (DO NOT manually force closing)
    await connection.query(
      `
      UPDATE daily_food_stock
      SET
        Added_Quantity = ?,
        Closing_Quantity = ?,
        Updated_By = ?
      WHERE id = ?
      `,
      [
        totalAdded,
        newClosing,
        req.user?.User_Id,
        stock.id,
      ]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `Stock set to 0 (${reason})`,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


// const setDailyFoodItemStockZero = async (req, res, next) => {
//   let connection;

//   try {
//     // const { Item_Id, reason = "EXPIRY" } = req.body;
//        const { Item_Id } = req.params;
//     const { reason = "EXPIRY" } = req.body;
//     if (!Item_Id) {
//       return res.status(400).json({ message: "Item_Id required" });
//     }

//     const stockDate = new Date().toLocaleDateString("en-CA", {
//       timeZone: "Asia/Kolkata",
//     });

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     // 1️⃣ Lock today's stock
//     const [[stock]] = await connection.query(
//       `
//       SELECT id, Closing_Quantity
//       FROM daily_food_stock
//       WHERE Item_Id = ?
//         AND Stock_Date = ?
//       FOR UPDATE
//       `,
//       [Item_Id, stockDate]
//     );

//     if (!stock || stock.Closing_Quantity <= 0) {
//       await connection.rollback();
//       return res.status(200).json({
//         success: true,
//         message: "Stock already zero",
//       });
//     }

//     const expiredQty = stock.Closing_Quantity;

//     // 2️⃣ Set closing to 0
//     await connection.query(
//       `
//       UPDATE daily_food_stock
//       SET Closing_Quantity = 0,
//           Updated_By = ?
//       WHERE id = ?
//       `,
//       [req.user?.User_Id, stock.id]
//     );

//     // 3️⃣ History entry
//     await connection.query(
//       `
//       INSERT INTO food_stock_movements
//         (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
//       VALUES (?, ?, 'ADJUST', ?, ?, ?)
//       `,
//       [
//         Item_Id,
//         stockDate,
//         expiredQty,
//         reason,              // EXPIRY / WASTAGE
//         req.user?.User_Id,
//       ]
//     );

//     await connection.commit();

//     return res.status(200).json({
//       success: true,
//       message: `Stock set to 0 (${reason})`,
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
 

// const getFoodItemStockHistoryByDate = async (req, res, next) => {
//   let connection;

//   try {
//     const stockDate =
//       req.query.date ||
//       new Date().toISOString().split("T")[0];

//     const page = Number(req.query.page || 1);
//     const limit = Number(req.query.limit || 10);
//     const offset = (page - 1) * limit;

//     const search = req.query.search
//       ? req.query.search.trim().toLowerCase()
//       : "";

//     connection = await db.getConnection();

//     /* ================= ITEM FILTER ================= */
//     let whereClauses = [`afi.is_deleted = 0`];
//     let params = [];

//     if (search) {
//       whereClauses.push(`
//         (
//           LOWER(afi.Item_Name) LIKE ?
//           OR LOWER(afi.Item_Category) LIKE ?
//         )
//       `);
//       const like = `%${search}%`;
//       params.push(like, like);
//     }

//     const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

//     /* ================= TOTAL ITEMS ================= */
//     const [[countRow]] = await connection.query(
//       `
//       SELECT COUNT(*) AS total
//       FROM add_food_item afi
//       ${whereSQL}
//       `,
//       params
//     );

//     const totalItems = countRow.total;
//     const totalPages = Math.ceil(totalItems / limit);

//     /* ================= ITEMS ================= */
//     const [items] = await connection.query(
//       `
//       SELECT
//         afi.Item_Id,
//         afi.Item_Name,
//         afi.Item_Category,
//         afi.Item_Image
//       FROM add_food_item afi
//       ${whereSQL}
//       ORDER BY LOWER(afi.Item_Name) ASC
//       LIMIT ? OFFSET ?
//       `,
//       [...params, limit, offset]
//     );

//     if (!items.length) {
//       return res.status(200).json({
//         success: true,
//         date: stockDate,
//         items: [],
//         totalItems,
//         totalPages,
//       });
//     }

//     /* ================= HISTORY ================= */
//     const itemIds = items.map((i) => i.Item_Id);

//     const [movements] = await connection.query(
//       `
//       SELECT
//         fsm.Item_Id,
//         DATE_FORMAT(fsm.Stock_Date, "%d-%m-%Y") AS Stock_Date,
//         fsm.Quantity,
//         fsm.User_Id,
//         fsm.Movement_Type,
//         fsm.created_At
//       FROM food_stock_movements fsm
//       WHERE fsm.Item_Id IN (?)
//         AND fsm.Stock_Date >= ?
//       ORDER BY fsm.created_At DESC
//       `,
//       [itemIds, stockDate]
//     );

//     /* ================= GROUP HISTORY ================= */
//     const historyMap = {};
//     movements.forEach((m) => {
//       if (!historyMap[m.Item_Id]) {
//         historyMap[m.Item_Id] = [];
//       }
//       historyMap[m.Item_Id].push(m);
//     });

//     /* ================= MERGE ================= */
//     const result = items.map((item) => ({
//       ...item,
//       history: historyMap[item.Item_Id] || [],
//     }));

//     return res.status(200).json({
//       success: true,
//       date: stockDate,
//       currentPage: page,
//       pageSize: limit,
//       totalItems,
//       totalPages,
//       items: result,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching stock history by date:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

// const editDailyFoodStock = async (req, res, next) => {
//   let connection;

//   try {
//     const { Item_Id, New_Closing_Quantity, User_Id } = req.body;

//     if (!Item_Id) {
//       return res.status(400).json({ message: "Item_Id required" });
//     }

//     if (New_Closing_Quantity === undefined || New_Closing_Quantity === null) {
//       return res.status(400).json({ message: "New closing quantity required" });
//     }

//     if (New_Closing_Quantity < 0) {
//       return res.status(400).json({ message: "Stock cannot be negative" });
//     }

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     // 1️⃣ Get today's stock row
//     const [[stockRow]] = await connection.query(
//       `
//       SELECT Opening_Quantity, Added_Quantity, Sold_Quantity, Closing_Quantity
//       FROM daily_food_stock
//       WHERE Item_Id = ? AND Stock_Date = CURDATE()
//       `,
//       [Item_Id]
//     );

//     if (!stockRow) {
//       await connection.rollback();
//       return res.status(404).json({
//         message: "Stock record not found for today",
//       });
//     }

//     const oldClosing = Number(stockRow.Closing_Quantity);
//     const newClosing = Number(New_Closing_Quantity);
//     const difference = newClosing - oldClosing;

//     // 2️⃣ Adjust Added_Quantity (this is important)
//     const newAddedQty = Number(stockRow.Added_Quantity) + difference;

//     // 3️⃣ Recalculate closing properly
//     const recalculatedClosing =
//       Number(stockRow.Opening_Quantity) +
//       newAddedQty -
//       Number(stockRow.Sold_Quantity);

//     if (recalculatedClosing < 0) {
//       await connection.rollback();
//       return res.status(400).json({
//         message: "Invalid correction. Stock cannot be negative.",
//       });
//     }

//     // 4️⃣ Update daily_food_stock properly
//     await connection.query(
//       `
//       UPDATE daily_food_stock
//       SET Added_Quantity = ?,
//           Closing_Quantity = ?,
//           Updated_By = ?
//       WHERE Item_Id = ? AND Stock_Date = CURDATE()
//       `,
//       [newAddedQty, recalculatedClosing, User_Id, Item_Id]
//     );

//     // 5️⃣ Log adjustment in movement table
//     if (difference !== 0) {
//       await connection.query(
//         `
//         INSERT INTO food_stock_movements
//         (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
//         VALUES (?, CURDATE(), 'ADJUST', ?, NULL, ?)
//         `,
//         [Item_Id, difference, User_Id]
//       );
//     }

//     await connection.commit();

//     res.status(200).json({
//       success: true,
//       message: "Stock corrected successfully",
//       oldClosing,
//       newClosing: recalculatedClosing,
//       adjustment: difference,
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

const editDailyFoodStock = async (req, res, next) => {
  let connection;

  try {
    const { Movement_Id, New_Quantity, User_Id } = req.body;

    if (!Movement_Id) {
      return res.status(400).json({ message: "Movement_Id required" });
    }

    if (New_Quantity === undefined || New_Quantity === null) {
      return res.status(400).json({ message: "New quantity required" });
    }

    if (Number(New_Quantity) < 0) {
      return res.status(400).json({ message: "Quantity cannot be negative" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Fetch the ADD movement row (include Stock_Date!)
    const [[movement]] = await connection.execute(
      `
      SELECT Item_Id, Quantity, Stock_Date
      FROM food_stock_movements
      WHERE id = ? AND Movement_Type = 'ADD'
      `,
      [Movement_Id]
    );

    if (!movement) {
      await connection.rollback();
      return res.status(404).json({ message: "ADD movement not found" });
    }

    const itemId = movement.Item_Id;
    const stockDate = movement.Stock_Date;

    const oldQty = Number(movement.Quantity);
    const newQty = Number(New_Quantity);
    const difference = newQty - oldQty;

    if (difference === 0) {
      await connection.rollback();
      return res.status(200).json({
        success: true,
        message: "No change detected",
      });
    }

    // 2️⃣ Insert ADJUST movement (never edit old row)
    await connection.execute(
      `
      INSERT INTO food_stock_movements
      (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
      VALUES (?, ?, 'ADJUST', ?, NULL, ?)
      `,
      [itemId, stockDate, difference,  User_Id]
    );

    // 3️⃣ Recalculate total Added from movements (for that specific date)
    const [[sumRow]] = await connection.execute(
      `
      SELECT COALESCE(SUM(Quantity), 0) AS totalAdded
      FROM food_stock_movements
      WHERE Item_Id = ?
        AND Stock_Date = ?
        AND Movement_Type IN ('ADD', 'ADJUST')
      `,
      [itemId, stockDate]
    );

    const totalAdded = Number(sumRow.totalAdded);

    // 4️⃣ Get Opening and Sold for that same date
    const [[stockRow]] = await connection.execute(
      `
      SELECT Opening_Quantity, Sold_Quantity
      FROM daily_food_stock
      WHERE Item_Id = ? AND Stock_Date = ?
      `,
      [itemId, stockDate]
    );

    if (!stockRow) {
      await connection.rollback();
      return res.status(404).json({
        message: "Daily stock  not found",
      });
    }

    const newClosing =
      Number(stockRow.Opening_Quantity) +
      totalAdded -
      Number(stockRow.Sold_Quantity);

    if (newClosing < 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "Invalid correction. Closing stock cannot be negative.",
      });
    }

    // 5️⃣ Update only that day’s snapshot
    await connection.execute(
      `
      UPDATE daily_food_stock
      SET Added_Quantity = ?,
          Closing_Quantity = ?
      WHERE Item_Id = ? AND Stock_Date = ?
      `,
      [totalAdded, newClosing, itemId, stockDate]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Movement corrected successfully",
      oldQuantity: oldQty,
      newQuantity: newQty,
      adjustment: difference,
      updatedDate: stockDate,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
const removeDailyFoodStock = async (req, res, next) => {
  let connection;

  try {
    const { Movement_Id, User_Id } = req.body;

    if (!Movement_Id) {
      return res.status(400).json({ message: "Movement_Id required" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Get the ADD movement row
    const [[movement]] = await connection.execute(
      `
      SELECT id, Item_Id, Quantity, Stock_Date
      FROM food_stock_movements
      WHERE id = ?
        AND Movement_Type = 'ADD'
      `,
      [Movement_Id]
    );

    if (!movement) {
      await connection.rollback();
      return res.status(404).json({
        message: "ADD movement not found",
      });
    }

    const itemId = movement.Item_Id;
    const stockDate = movement.Stock_Date;
    const qtyToReverse = Number(movement.Quantity);

    // 2️⃣ Insert reversal ADJUST entry
    await connection.execute(
      `
      INSERT INTO food_stock_movements
        (Item_Id, Stock_Date, Movement_Type, Quantity, Ref_Id, User_Id)
      VALUES (?, ?, 'ADJUST', ?, NULL, ?)
      `,
      [
        itemId,
        stockDate,
        -qtyToReverse,     // 🔥 reverse
       
        User_Id,
      ]
    );

    // 3️⃣ Recalculate total added for that date
    const [[sumRow]] = await connection.execute(
      `
      SELECT COALESCE(SUM(Quantity),0) AS totalAdded
      FROM food_stock_movements
      WHERE Item_Id = ?
        AND Stock_Date = ?
        AND Movement_Type IN ('ADD','ADJUST')
      `,
      [itemId, stockDate]
    );

    const totalAdded = Number(sumRow.totalAdded);

    // 4️⃣ Get opening and sold
    const [[stockRow]] = await connection.execute(
      `
      SELECT Opening_Quantity, Sold_Quantity
      FROM daily_food_stock
      WHERE Item_Id = ?
        AND Stock_Date = ?
      `,
      [itemId, stockDate]
    );

    if (!stockRow) {
      await connection.rollback();
      return res.status(404).json({
        message: "Daily stock not found",
      });
    }

    const newClosing =
      Number(stockRow.Opening_Quantity) +
      totalAdded -
      Number(stockRow.Sold_Quantity);

    if (newClosing < 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "Cannot reverse. Stock would become negative.",
      });
    }

    // 5️⃣ Update daily snapshot
    await connection.execute(
      `
      UPDATE daily_food_stock
      SET Added_Quantity = ?,
          Closing_Quantity = ?
      WHERE Item_Id = ?
        AND Stock_Date = ?
      `,
      [totalAdded, newClosing, itemId, stockDate]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Wrong addition reversed successfully",
    });

  } catch (err) {
    if (connection) await connection.rollback();
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
//PROD
const getFoodItemStockHistoryByDate = async (req, res, next) => {
  let connection;

  try {
    const stockDate =
      req.query.date ||
      new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    const search = req.query.search
      ? req.query.search.trim().toLowerCase()
      : "";

    connection = await db.getConnection();




/* 🔥 AUTO-HEAL DAILY STOCK (CRON FALLBACK) */
//await ensureDailyStockForDate(connection, stockDate);
    /* ================= SEARCH ================= */
    let whereClauses = [`afi.is_deleted = 0`];
    let params = [];

    if (search) {
      whereClauses.push(`
        (
          LOWER(afi.Item_Name) LIKE ?
          OR LOWER(afi.Item_Category) LIKE ?
        )
      `);
      const like = `%${search}%`;
      params.push(like, like);
    }

    const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

    /* ================= TOTAL COUNT ================= */
    const [[countRow]] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM add_food_item afi
      ${whereSQL}
      `,
      params
    );

    const totalItems = countRow.total;
    const totalPages = Math.ceil(totalItems / limit);

    /* ================= ITEMS + DAILY STOCK ================= */
    const [items] = await connection.query(
      `
      SELECT
        afi.Item_Id,
        afi.Item_Name,
        afi.Item_Category,
        afi.Item_Image,

        COALESCE(dfs.Opening_Quantity, 0) AS Opening_Quantity,
        COALESCE(dfs.Added_Quantity, 0)   AS Added_Quantity,
        COALESCE(dfs.Sold_Quantity, 0)    AS Sold_Quantity,
        COALESCE(dfs.Closing_Quantity, 0) AS Closing_Quantity,
        dfs.Updated_At
      FROM add_food_item afi
      LEFT JOIN daily_food_stock dfs
        ON dfs.Item_Id = afi.Item_Id
       AND dfs.Stock_Date = ?
      ${whereSQL}
      ORDER BY LOWER(afi.Item_Name) ASC
      LIMIT ? OFFSET ?
      `,
      [stockDate, ...params, limit, offset]
    );

    if (!items.length) {
      return res.status(200).json({
        success: true,
        date: stockDate,
        items: [],
        totalItems,
        totalPages,
      });
    }

    /* ================= STOCK MOVEMENTS (HISTORY) ================= */
    const itemIds = items.map((i) => i.Item_Id);


    const [movements] = await connection.query(
  `
  SELECT
  fsm.id,
    fsm.Item_Id,
    fsm.Quantity,
    fsm.User_Id,
    u.username,
    fsm.Movement_Type,
    fsm.created_At
  FROM food_stock_movements fsm
  LEFT JOIN users u
    ON u.User_Id = fsm.User_Id
  WHERE fsm.Item_Id IN (?)
    AND fsm.Stock_Date = ?
  ORDER BY fsm.created_At DESC
  `,
  [itemIds, stockDate]
);


    /* ================= GROUP HISTORY ================= */
    const historyMap = {};
    movements.forEach((m) => {
      if (!historyMap[m.Item_Id]) {
        historyMap[m.Item_Id] = [];
      }
      historyMap[m.Item_Id].push(m);
    });

    /* ================= MERGE FINAL ================= */
    const result = items.map((item) => ({
      ...item,
      history: historyMap[item.Item_Id] || [],
    }));

    return res.status(200).json({
      success: true,
      date: stockDate,
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,
      items: result,
    });
  } catch (err) {
    console.error("❌ Error fetching stock history:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

//CURSOR + LAZY
const getEachFoodItemsStockReport = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    const { Item_Id } = req.params;
    const limit = Number(req.query.limit || 20);
    const cursor = req.query.cursor || null;

    if (!Item_Id) {
      return res.status(400).json({
        success: false,
        message: "Item_Id is required",
      });
    }

    let params = [Item_Id];
    let cursorCondition = "";

    /* 🔥 Cursor Logic */
    if (cursor) {
      // cursor = last Stock_Date
      cursorCondition = `AND dfs.Stock_Date < ?`;
      params.push(cursor);
    }

    /* ================= FETCH DATA ================= */
    const [rows] = await connection.query(
      `
      SELECT
        dfs.Stock_Date,
        dfs.Opening_Quantity,
        dfs.Added_Quantity,
        dfs.Sold_Quantity,
        dfs.Closing_Quantity,
        dfs.Updated_At
      FROM daily_food_stock dfs
      WHERE dfs.Item_Id = ?
      ${cursorCondition}
      ORDER BY dfs.Stock_Date DESC
      LIMIT ?
      `,
      [...params, limit + 1] // 🔥 fetch extra
    );

    /* 🔥 Next Cursor */
    let nextCursor = null;

    if (rows.length > limit) {
      const lastItem = rows[limit - 1];
      nextCursor = lastItem.Stock_Date;
      rows.pop(); // remove extra
    }

    return res.status(200).json({
      success: true,
      Item_Id,
      nextCursor, // 🔥 important
      hasMore: !!nextCursor,
      history: rows,
    });

  } catch (err) {
    console.error("❌ Error fetching lazy history:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
//LOCAL
// const getFoodItemStockHistoryByDate = async (req, res, next) => {
//   let connection;

//   try {
//     const stockDate =
//       req.query.date ||
//       new Date().toLocaleDateString("en-CA", {
//         timeZone: "Asia/Kolkata",
//       });

//     const page = Number(req.query.page || 1);
//     const limit = Number(req.query.limit || 10);
//     const offset = (page - 1) * limit;

//     const search = req.query.search
//       ? req.query.search.trim().toLowerCase()
//       : "";

//     connection = await db.getConnection();

//     /* =====================================================
//        🔥 AUTO-HEAL STOCK ROWS (SAFE FOR PROD + LOCAL)
//        Ensures 1 row per (Item_Id, Stock_Date)
//     ===================================================== */

// await connection.query(
//   `
//   INSERT INTO daily_food_stock
//     (Item_Id, Stock_Date, Opening_Quantity, Added_Quantity, Sold_Quantity, Closing_Quantity)
//   SELECT
//     afi.Item_Id,
//     ?,
//     0, 0, 0, 0
//   FROM add_food_item afi
//   WHERE afi.is_deleted = 0
//   ON DUPLICATE KEY UPDATE
//     Stock_Date = daily_food_stock.Stock_Date
//   `,
//   [stockDate]
// );

//     /* ================= SEARCH ================= */

//     let whereClauses = [`afi.is_deleted = 0`];
//     let params = [];

//     if (search) {
//       whereClauses.push(`
//         (
//           LOWER(afi.Item_Name) LIKE ?
//           OR LOWER(afi.Item_Category) LIKE ?
//         )
//       `);
//       const like = `%${search}%`;
//       params.push(like, like);
//     }

//     const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

//     /* ================= TOTAL COUNT ================= */

//     const [[countRow]] = await connection.query(
//       `
//       SELECT COUNT(*) AS total
//       FROM add_food_item afi
//       ${whereSQL}
//       `,
//       params
//     );

//     const totalItems = countRow.total;
//     const totalPages = Math.ceil(totalItems / limit);

//     /* ================= ITEMS + STOCK ================= */

//     const [items] = await connection.query(
//       `
//       SELECT
//         afi.Item_Id,
//         afi.Item_Name,
//         afi.Item_Category,
//         afi.Item_Image,

//         COALESCE(dfs.Opening_Quantity, 0) AS Opening_Quantity,
//         COALESCE(dfs.Added_Quantity, 0)   AS Added_Quantity,
//         COALESCE(dfs.Sold_Quantity, 0)    AS Sold_Quantity,
//         COALESCE(dfs.Closing_Quantity, 0) AS Closing_Quantity,
//         dfs.Updated_At

//       FROM add_food_item afi
//       LEFT JOIN daily_food_stock dfs
//         ON dfs.Item_Id = afi.Item_Id
//        AND dfs.Stock_Date = ?

//       ${whereSQL}
//       ORDER BY LOWER(afi.Item_Name) ASC
//       LIMIT ? OFFSET ?
//       `,
//       [stockDate, ...params, limit, offset]
//     );

//     if (!items.length) {
//       return res.status(200).json({
//         success: true,
//         date: stockDate,
//         items: [],
//         totalItems,
//         totalPages,
//       });
//     }

//     /* ================= STOCK MOVEMENTS ================= */

//     const itemIds = items.map((i) => i.Item_Id);

//     const [movements] = await connection.query(
//       `
//       SELECT
//         fsm.id,
//         fsm.Item_Id,
//         fsm.Quantity,
//         fsm.User_Id,
//         u.username,
//         fsm.Movement_Type,
//         fsm.created_At
//       FROM food_stock_movements fsm
//       LEFT JOIN users u
//         ON u.User_Id = fsm.User_Id
//       WHERE fsm.Item_Id IN (?)
//         AND fsm.Stock_Date = ?
//       ORDER BY fsm.created_At DESC
//       `,
//       [itemIds, stockDate]
//     );

//     /* ================= GROUP HISTORY ================= */

//     const historyMap = {};
//     movements.forEach((m) => {
//       if (!historyMap[m.Item_Id]) {
//         historyMap[m.Item_Id] = [];
//       }
//       historyMap[m.Item_Id].push(m);
//     });

//     /* ================= FINAL RESULT ================= */

//     const result = items.map((item) => ({
//       ...item,
//       history: historyMap[item.Item_Id] || [],
//     }));

//     return res.status(200).json({
//       success: true,
//       date: stockDate,
//       currentPage: page,
//       pageSize: limit,
//       totalItems,
//       totalPages,
//       items: result,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching stock history:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };




export { addFoodItem,getAllFoodItems,editSingleFoodItem,toggleFoodItemAvailability,softDeleteFoodItem 
,getAllCategoriesAndFoodItemsToBeShownOnMenu,toggleCategoryAvailabilityToBeShownOnMenu,
updateFoodItemCategory,
addOrUpdateDailyFoodItemStock,getDailyFoodItemsStock,setDailyFoodItemStockZero,
getFoodItemStockHistoryByDate,editDailyFoodStock,removeDailyFoodStock,getEachFoodItemsStockReport,

};