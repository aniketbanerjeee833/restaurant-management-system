import db from "../config/db.js";
import fs from "fs";



const addFoodItem = async (req, res, next) => {
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();
     
        // Validation for items
        if (!req.body || !req.body.items) {
            return res.status(400).json({
                success: false,
                message: "Missing items in request.",
            });
        }

        // Parse JSON
        let parsed;
        try {
            parsed = JSON.parse(req.body.items); // { items: [...] }
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

        const images = req.files; // multer uploaded files

        // Generate next Item_Id
        const [lastItem] = await connection.query(
            `SELECT Item_Id FROM add_food_item ORDER BY id DESC LIMIT 1`
        );

        let nextItemNo = lastItem.length
            ? parseInt(lastItem[0].Item_Id.replace("FDITM", "")) + 1
            : 1;

        // Insert each item
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const uploadedFile = images?.[i];
            const imageFileName = uploadedFile ? uploadedFile.filename : null;

            const {
                Item_Name,
                Item_Category,
                Item_Price,
                Item_Quantity,
              
                Tax_Type,
                Tax_Amount,
                Amount
            } = item;

            const newItemId = "FDITM" + nextItemNo.toString().padStart(5, "0");
            nextItemNo++;

            await connection.query(
  `INSERT INTO add_food_item 
  (Item_Id, Item_Name, Item_Image, Item_Category,
   Item_Price, Item_Quantity,  Tax_Type, Tax_Amount, Amount,
   created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
  [
    newItemId,
    Item_Name,
    imageFileName,
    Item_Category,
    Item_Price,
    Item_Quantity,
        
    Tax_Type,         // correct
    Tax_Amount,       // FIXED — was wrong earlier
    Amount,           // correct
  ]
);

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

        // Page is optional
        const page = req.query.page ? parseInt(req.query.page, 10) : null;
        const limit = 10;
        const offset = page ? (page - 1) * limit : 0;

        // Search is optional
        const search = req.query.search ? req.query.search.trim().toLowerCase() : "";

        let whereClauses = [];
        let params = [];

        if (search) {
            whereClauses.push(`
                (LOWER(Item_Name) LIKE ?
                OR LOWER(Item_Category) LIKE ?
                OR Item_Price LIKE ?) 
            `);

            const like = `%${search}%`;
            params.push(like, like, like);
        }

        const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";


        // ==========================================================
        // CASE 1: ❌ no page AND ❌ no search  → Fetch ALL
        // ==========================================================
        if (!page && !search) {
            const [rows] = await connection.query(
                `SELECT * FROM add_food_item ORDER BY created_at DESC`
            );

            return res.status(200).json({
                success: true,
                totalItems: rows.length,
                foodItems: rows,
             
            });
        }


        // ==========================================================
        // CASE 2: ❌ no page BUT ✔ search → All Filtered
        // ==========================================================
        if (!page && search) {
            const [filtered] = await connection.query(
                `SELECT * FROM add_food_item ${whereSQL} ORDER BY created_at DESC`,
                params
            );

            return res.status(200).json({
                success: true,
                totalItems: filtered.length,
                foodItems: filtered,
                
            });
        }


        // ==========================================================
        // CASE 3: ✔ page (with or without search) → Paginated
        // ==========================================================
        const [rows] = await connection.query(
            `
            SELECT * FROM add_food_item
            ${whereSQL}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            `,
            [...params, limit, offset]
        );

        const [count] = await connection.query(
            `SELECT COUNT(*) AS count FROM add_food_item ${whereSQL}`,
            params
        );

        const totalItems = count[0].count;
        const totalPages = Math.ceil(totalItems / limit);

        return res.status(200).json({
            success: true,
            currentPage: page,
            totalItems,
            totalPages,
            foodItems: rows,
            pageSize: limit,
          
        });

    } catch (err) {
        console.error("❌ Error getting all food items:", err);
        next(err);
    } finally {
        if (connection) connection.release();
    }
};

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
const editSingleFoodItem = async (req, res, next) => {
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const { Item_Id } = req.params;

        if (!Item_Id) {
            return res.status(400).json({ message: "Item_Id is required" });
        }

        // 1) Get existing item (to delete old image later)
        const [existing] = await connection.query(
            "SELECT Item_Image FROM add_food_item WHERE Item_Id = ?",
            [Item_Id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: "Food item not found" });
        }

        const oldImage = existing[0].Item_Image;

        // 2) Sanitize input
        // const cleanData = sanitizeObject(req.body);

        // 3) Extract fields manually
        const {
            Item_Name,
            Item_Category,
            Item_Price,
            Item_Quantity,
            Tax_Type,
            Tax_Amount,
            Amount
        } = req.body;

        // 4) Simple validation (manual)
        if (!Item_Name || !Item_Category || !Item_Price || !Item_Quantity) {
            return res.status(400).json({
                message: "Item_Name, Item_Category, Item_Price, and Item_Quantity are required."
            });
        }

        // 5) Handle new image (optional)
        let newImage = oldImage;

        if (req.file) {
            newImage = req.file.filename;

            // Delete old image
            if (oldImage) {
                const oldPath = `./uploads/food-item/${oldImage}`;
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        }

        // 6) Update DB
        await connection.query(
            `UPDATE add_food_item 
             SET Item_Name=?, Item_Category=?, Item_Price=?, 
                 Item_Quantity=?, Tax_Type=?, Tax_Amount=?, Amount=?, 
                 Item_Image=?, updated_at=NOW()
             WHERE Item_Id=?`,
            [
                Item_Name,
                Item_Category,
                Number(Item_Price),
                Number(Item_Quantity),
                Tax_Type || "None",
                Number(Tax_Amount) || 0,
                Number(Amount) || 0,
                newImage,
                Item_Id
            ]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Food item updated successfully",
            Item_Id,
            image: newImage
        });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error("❌ Error editing food item:", err);
        next(err);
    } finally {
        if (connection) connection.release();
    }
};
export { addFoodItem,getAllFoodItems,editSingleFoodItem };