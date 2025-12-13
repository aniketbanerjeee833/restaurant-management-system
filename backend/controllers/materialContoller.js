
import PdfPrinter from "pdfmake";
import db from "../config/db.js";
import { sanitizeObject } from "../utils/sanitizeInput.js";
import materialSchema from "../validators/materialSchema.js";
async function generateNextId(connection, prefix, column, table) {
    const [rows] = await connection.query(
        `SELECT ${column} FROM ${table} ORDER BY id DESC LIMIT 1`
    );

    if (rows.length === 0) return prefix + "00001";

    const lastId = rows[0][column];
    const num = parseInt(lastId.replace(prefix, ""), 10) + 1;

    return prefix + num.toString().padStart(5, "0");
}
function normalizeMaterialInput(data) {
  return {
    ...data,

    current_stock:
      data.current_stock === "" || data.current_stock === undefined
        ? 0
        : Number(data.current_stock),

    reorder_level:
      data.reorder_level === "" || data.reorder_level === undefined
        ? null
        : Number(data.reorder_level),

    shelf_life_days:
      data.shelf_life_days === "" || data.shelf_life_days === undefined
        ? null
        : Number(data.shelf_life_days),
  };
}
function normalizeUnit(unit) {
   if (!unit || typeof unit !== "string") return "";
    return unit.trim().toLowerCase();
}
const addMaterial = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    let cleanData = sanitizeObject(req.body);
    cleanData = normalizeMaterialInput(cleanData);

    const validation = materialSchema.safeParse(cleanData);

    if (!validation.success) {
      await connection.rollback();
      return res.status(400).json({
        message: validation.error.errors[0].message,
      });
    }

    const {
      name,
      reorder_level,
      reorder_level_unit,
      shelf_life_days
    } = validation.data;

    // CHECK IF MATERIAL ALREADY EXISTS
    const [exists] = await connection.query(
      "SELECT * FROM add_material WHERE name = ? LIMIT 1",
      [name]
    );

    if (exists.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "Material already exists",
      });
    }

    // GENERATE Material_Id
    const [last] = await connection.query(
      "SELECT Material_Id FROM add_material ORDER BY id DESC LIMIT 1"
    );

    let newId = "MAT00001";
    if (last.length > 0) {
      const nextNum = parseInt(last[0].Material_Id.replace("MAT", "")) + 1;
      newId = "MAT" + nextNum.toString().padStart(5, "0");
    }

    // INSERT MATERIAL (stock is always 0 initially)
    await connection.execute(
      `INSERT INTO add_material
      (Material_Id, name,
       current_stock, base_unit, current_stock_unit,
       reorder_level, reorder_level_unit,
       shelf_life_days, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        newId,
        name,
        0.00,               // starting stock = 0
        reorder_level_unit, // base unit = initial unit chosen
        reorder_level_unit, // stock unit = base unit
        reorder_level,
        reorder_level_unit,
        shelf_life_days
      ]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Material created successfully",
      Material_Id: newId
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error adding material:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
// const addMaterial = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     // 1️⃣ Sanitize the input
//     let cleanData = sanitizeObject(req.body);

//     // 2️⃣ Convert empty string → null BEFORE validation
//     cleanData = {
//       ...cleanData,
//       reorder_level:
//         cleanData.reorder_level === "" || cleanData.reorder_level === undefined
//           ? null
//           : Number(cleanData.reorder_level),

//       shelf_life_days:
//         cleanData.shelf_life_days === "" || cleanData.shelf_life_days === undefined
//           ? null
//           : Number(cleanData.shelf_life_days),

//       current_stock:
//         cleanData.current_stock === "" || cleanData.current_stock === undefined
//           ? 0
//           : Number(cleanData.current_stock),
//     };

//     // 3️⃣ Zod validation
//     const validation = materialSchema.safeParse(cleanData);

//     if (!validation.success) {
//       await connection.rollback();
//       return res
//         .status(400)
//         .json({ message: validation.error.errors[0].message });
//     }

//     // 4️⃣ Extract validated data
//     const {
//       name,
//       unit,
//       current_stock,
//       reorder_level,
//       shelf_life_days,
//     } = validation.data;

//     // 🔥 Now use validated values throughout your logic...

//         // ✅ Check duplicate
//         const [rows] = await db.query(
//           `SELECT * FROM add_material WHERE name = ?`,
//           [name]
//         );
//         if (rows.length > 0) {
//           await connection.rollback();
//           return res
//             .status(400)
//             .json({ message: "Material already exists, please add a new material" });
//         }

//         // ✅ Generate new Material_Id
//         const [last] = await db.query(
//           "SELECT Material_Id FROM add_material ORDER BY id DESC LIMIT 1"
//         );
//         let newId = "MAT00001";
//         if (last.length > 0) {
//           const lastId = last[0].Material_Id;
//           const lastNum = parseInt(lastId.replace("MAT", ""));
//           newId = `MAT${(lastNum + 1).toString().padStart(5, "0")}`;
//         }

//         // 1️⃣ Insert material record
//         await db.execute(
//           `INSERT INTO add_material 
//            (Material_Id, name, unit, current_stock, reorder_level, shelf_life_days)
//            VALUES (?, ?, ?, ?, ?, ?)`,
//           [newId, name, unit, current_stock, reorder_level, shelf_life_days]
//         );

//         // 2️⃣ Commit transaction
//         await connection.commit();
//         return res.status(200).json({ success: true, message: "Material added successfully" });
//       } catch (err) {
//         // 3️⃣ Rollback transaction on error
//         await connection.rollback();
//         console.error("Error adding material:", err);
//         next(err);
//       } finally {
//         // 4️⃣ Release connection
//         if (connection){
//               connection.release();
//         }
      
//       }
// }
//  const addMaterial = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     // 1️⃣ Sanitize input
//     let cleanData = sanitizeObject(req.body);

//     // 2️⃣ Normalize numeric fields
//     cleanData = normalizeMaterialInput(cleanData);

//     // 3️⃣ Validate with Zod
//     const validation = materialSchema.safeParse(cleanData);
//     if (!validation.success) {
//       await connection.rollback();
//       return res.status(400).json({
//         message: validation.error.errors[0].message,
//       });
//     }

//     const { name, reorder_level_unit,  reorder_level, shelf_life_days } =
//       validation.data;

//     // 4️⃣ Prevent duplicate names
//     const [rows] = await connection.query(
//       `SELECT * FROM add_material WHERE name = ?`,
//       [name]
//     );

//     if (rows.length > 0) {
//       await connection.rollback();
//       return res.status(400).json({
//         message: "Material already exists, please add a new material",
//       });
//     }

//     // 5️⃣ Generate new material ID
//     const [last] = await connection.query(
//       "SELECT Material_Id FROM add_material ORDER BY id DESC LIMIT 1"
//     );

//     let newId = "MAT00001";
//     if (last.length > 0) {
//       const lastNum = parseInt(last[0].Material_Id.replace("MAT", ""));
//       newId = `MAT${String(lastNum + 1).padStart(5, "0")}`;
//     }

//     // 6️⃣ Insert into DB
//     await connection.execute(
//       `INSERT INTO add_material 
//         (Material_Id, name, unit, current_stock, reorder_level, shelf_life_days)
//        VALUES (?, ?, ?, ?, ?, ?)`,
//       [newId, name, unit, current_stock, reorder_level, shelf_life_days]
//     );

//     await connection.commit();

//     return res.status(200).json({
//       success: true,
//       message: "Material added successfully",
//     });
//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("Error adding material:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
// const getAllMaterials = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();

//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = 10;
//     const offset = (page - 1) * limit;

//     const search = req.query.search ? req.query.search.trim().toLowerCase() : "";

//     let whereClauses = [];
//     let params = [];

//     // 🔍 Search
//     if (search) {
//       whereClauses.push(`
//         (
//           LOWER(name) LIKE ? OR 
//           LOWER(unit) LIKE ? OR 
//           CAST(current_stock AS CHAR) LIKE ? OR 
//           CAST(reorder_level AS CHAR) LIKE ? OR 
//           CAST(shelf_life_days AS CHAR) LIKE ?
//         )
//       `);
//       const like = `%${search}%`;
//       params.push(like, like, like, like, like);
//     }

//     const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

//     // 1️⃣ Count total rows
//     const [countRows] = await connection.query(
//       `SELECT COUNT(*) AS total FROM add_material ${whereSQL}`,
//       params
//     );

//     const total = countRows[0].total;
//     const totalPages = Math.ceil(total / limit);

//     // 2️⃣ Fetch materials
//     const [materials] = await connection.query(
//       `
//       SELECT * FROM add_material
//       ${whereSQL}
//       ORDER BY id DESC
//       LIMIT ? OFFSET ?
//       `,
//       [...params, limit, offset]   // FIXED: pass params + pagination
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Materials fetched successfully",
//       materials,
//       currentPage: page,
//       totalPages,
//       totalMaterials: total,
//     });

//   } catch (error) {
//     console.error("Error getting materials:", error);
//     next(error);

//   } finally {
//     if (connection) connection.release();
//   }
// };

// const editSingleMaterial=async (req, res, next) => {
//     let connection;
//     try {
//         connection = await db.getConnection();
       
//         const { Material_Id, name, unit, current_stock, reorder_level, shelf_life_days } = req.body;
//         await db.execute(
//           `UPDATE add_material 
//            SET name = ?, unit = ?, current_stock = ?, reorder_level = ?, shelf_life_days = ?
//            WHERE Material_Id = ?`,
//           [name, unit, current_stock, reorder_level, shelf_life_days, Material_Id]
//         );
//         return res.status(200).json({ success: true, message: "Material updated successfully" });
//       } catch (error) {
//         await connection.rollback();
//         console.error("Error updating material:", error);
//         next(error);
//       }finally{
//         if(connection){
//             connection.release();
//         }
//       }
// }

// const addMaterial = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     let cleanData = sanitizeObject(req.body);
//     cleanData = normalizeMaterialInput(cleanData);

//     const validation = materialSchema.safeParse(cleanData);
//     if (!validation.success) {
//       await connection.rollback();
//       return res.status(400).json({
//         message: validation.error.errors[0].message,
//       });
//     }

//     const {
//       name,
//       reorder_level,
//       reorder_level_unit,
//       shelf_life_days
//     } = validation.data;

//     // 1️⃣ Prevent duplicate
//     const [exists] = await connection.query(
//       "SELECT * FROM add_material WHERE name = ? LIMIT 1",
//       [name]
//     );

//     if (exists.length > 0) {
//       await connection.rollback();
//       return res.status(400).json({
//         message: "Material already exists",
//       });
//     }

//     // 2️⃣ Generate Material ID
//     const [last] = await connection.query(
//       "SELECT Material_Id FROM add_material ORDER BY id DESC LIMIT 1"
//     );

//     let newId = "MAT00001";
//     if (last.length > 0) {
//       const nextNum = parseInt(last[0].Material_Id.replace("MAT", "")) + 1;
//       newId = "MAT" + nextNum.toString().padStart(5, "0");
//     }

//     // 3️⃣ INSERT MATERIAL (no units, stock starts at 0)
//     await connection.execute(
//       `INSERT INTO add_material
//       (Material_Id, name,
//        current_stock,
//        reorder_level, reorder_level_unit,
//        shelf_life_days,
//        created_at, updated_at)
//       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//       [
//         newId,
//         name,
//         0.00,                        // stock always starts at zero
//         reorder_level,
//         reorder_level_unit,
//         shelf_life_days
//       ]
//     );

//     await connection.commit();

//     return res.status(200).json({
//       success: true,
//       message: "Material created successfully ",
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("Error adding material:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
// const getAllMaterials = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();

//     const page = req.query.page ? parseInt(req.query.page, 10) : null;
//     const limit = 10;
//     const offset = page ? (page - 1) * limit : null;

//     const search = req.query.search ? req.query.search.trim().toLowerCase() : "";

//     let whereClauses = [];
//     let params = [];

//     if (search) {
//       whereClauses.push(`
//         (
//           LOWER(name) LIKE ? OR 
//           CAST(current_stock AS CHAR) LIKE ? OR 
//           LOWER(current_stock_unit) LIKE ? OR 
//           CAST(reorder_level AS CHAR) LIKE ? OR 
//           LOWER(reorder_level_unit) LIKE ? OR 
//           CAST(shelf_life_days AS CHAR) LIKE ?
//         )
//       `);

//       const like = `%${search}%`;

//       params.push(
//         like, // name
//         like, // current_stock
//         like, // current_stock_unit
//         like, // reorder_level
//         like, // reorder_level_unit
//         like  // shelf_life_days
//       );
//     }

//     const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

//     // COUNT QUERY
//     const [countRows] = await connection.query(
//       `SELECT COUNT(*) AS total FROM add_material ${whereSQL}`,
//       params
//     );

//     const total = countRows[0].total;
//     const totalPages = page ? Math.ceil(total / limit) : 1;

//     // MAIN QUERY
//     let sql = `
//       SELECT 
//         Material_Id, 
//         name, 
//         current_stock, 
//         current_stock_unit,
//         reorder_level,
//         reorder_level_unit,
//         shelf_life_days,
//         created_at,
//         updated_at
//       FROM add_material
//       ${whereSQL}
//       ORDER BY id DESC
//     `;

//     let sqlParams = [...params];

//     if (page) {
//       sql += " LIMIT ? OFFSET ?";
//       sqlParams.push(limit, offset);
//     }

//     const [materials] = await connection.query(sql, sqlParams);

//     return res.status(200).json({
//       success: true,
//       message: "Materials fetched successfully",
//       materials,
//       currentPage: page || 1,
//       totalPages,
//       totalMaterials: total,
//     });

//   } catch (error) {
//     console.error("Error getting materials:", error);
//     next(error);
//   } finally {
//     if (connection) connection.release();
//   }
// };
function formatStockForUI(stock, baseUnit) {
  const qty = parseFloat(stock);
  const unit = normalizeUnit(baseUnit);

  // ----- WEIGHT -----
  if (unit === "gram") {
    if (qty >= 1000) return (qty / 1000).toFixed(2).replace(/\.00$/, "") + " Kg";
    return qty + " g";
  }
  if (unit === "kilogram") {
    return qty + " Kg";
  }

  // ----- LIQUID -----
  if (unit === "milliliter") {
    if (qty >= 1000) return (qty / 1000).toFixed(2).replace(/\.00$/, "") + " Litre";
    return qty + " ml";
  }
  if (unit === "litre"|| unit === "liter") {
    return qty + " Litre";
  }

  // Fallback
  return qty + " " + baseUnit;
}
const getAllMaterials = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    const page = req.query.page ? parseInt(req.query.page, 10) : null;
    const limit = 10;
    const offset = page ? (page - 1) * limit : null;

    const search = req.query.search ? req.query.search.trim().toLowerCase() : "";

    let whereClauses = [];
    let params = [];

    // 🔍 SEARCH FILTER
    if (search) {
      whereClauses.push(`
        (
          LOWER(name) LIKE ? OR 
          CAST(current_stock AS CHAR) LIKE ? OR 
          LOWER(current_stock_unit) LIKE ? OR 
          CAST(reorder_level AS CHAR) LIKE ? OR 
          LOWER(reorder_level_unit) LIKE ? OR 
          CAST(shelf_life_days AS CHAR) LIKE ?
        )
      `);

      const like = `%${search}%`;

      params.push(
        like,
        like,
        like,
        like,
        like,
        like
      );
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // 📌 COUNT QUERY
    const [countRows] = await connection.query(
      `SELECT COUNT(*) AS total FROM add_material ${whereSQL}`,
      params
    );

    const total = countRows[0].total;
    const totalPages = page ? Math.ceil(total / limit) : 1;

    // 📌 MAIN SELECT QUERY
    let sql = `
      SELECT 
        Material_Id, 
        name, 
        current_stock, 
        current_stock_unit,
        reorder_level,
        reorder_level_unit,
        shelf_life_days,
        created_at,
        updated_at
      FROM add_material
      ${whereSQL}
      ORDER BY id DESC
    `;

    let sqlParams = [...params];

    if (page) {
      sql += " LIMIT ? OFFSET ?";
      sqlParams.push(limit, offset);
    }

    const [materials] = await connection.query(sql, sqlParams);

    // 🎨 FORMAT UNITS FOR UI
    const formattedMaterials = materials.map(m => ({
      ...m,
      formatted_current_stock: formatStockForUI(m.current_stock, m.current_stock_unit),
      formatted_reorder_level: formatStockForUI(m.reorder_level, m.reorder_level_unit),
    }));

    // 📤 RESPONSE
    return res.status(200).json({
      success: true,
      message: "Materials fetched successfully",
      materials: formattedMaterials,
      currentPage: page || 1,
      totalPages,
      totalMaterials: total,
    });

  } catch (error) {
    console.error("Error getting materials:", error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
};



function convertToBaseUnit(qty, fromUnit, baseUnit) {
    qty = parseFloat(qty);

    const from = normalizeUnit(fromUnit);
    const base = normalizeUnit(baseUnit);

    if (from === base) return qty;

    // Weight conversions
    if (from === "gram" && base === "kilogram") return qty / 1000;
    if (from === "kilogram" && base === "gram") return qty * 1000;

    // Liquid conversions
    if (from === "milliliter" && base === "liter") return qty / 1000;
    if (from === "liter" && base === "milliliter") return qty * 1000;

    throw new Error(`Unit conversion not supported: ${fromUnit} → ${baseUnit}`);
}
const editSingleMaterial = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { Material_Id } = req.params;

    if (!Material_Id) {
      await connection.rollback();
      return res.status(404).json({ message: "Material not found" });
    }

    // 1️⃣ Sanitize input
    let cleanData = sanitizeObject(req.body);

    // 2️⃣ Validate using SAME schema (excluding stock fields)
    const validation = materialSchema.safeParse(cleanData);

    if (!validation.success) {
      await connection.rollback();
      return res.status(400).json({ errors: validation.error.errors });
    }

    const {
      name,
      reorder_level,
      reorder_level_unit,
      shelf_life_days
    } = validation.data;

    // 3️⃣ Update ONLY editable fields
    await connection.execute(
      `UPDATE add_material 
       SET 
         name = ?, 
         reorder_level = ?, 
         reorder_level_unit = ?, 
         shelf_life_days = ?, 
         updated_at = NOW()
       WHERE Material_Id = ?`,
      [
        name,
        reorder_level,
        reorder_level_unit,
        shelf_life_days,
        Material_Id
      ]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Material updated successfully",
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error updating material:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


const addReleaseMaterials = async (req, res, next) => {
  let connection;

  try {
    const { Release_Date, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one material entry is required."
      });
    }
    if(!Release_Date){
      return res.status(400).json({
        success: false,
        message: "Release Date is required."
      });
    }
    connection = await db.getConnection();
    await connection.beginTransaction();

    const results = [];
    const warnings = [];

    for (const item of items) {
      const { Material_Name, Material_Quantity, Material_Unit } = item;

      // 1️⃣ Fetch material
      const [mat] = await connection.query(
        `SELECT 
            Material_Id,
            name,
            current_stock,
            base_unit,
            current_stock_unit,
            reorder_level
         FROM add_material
         WHERE name = ? LIMIT 1`,
        [Material_Name]
      );

      if (mat.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Material not found: ${Material_Name}`
        });
      }

      const material = mat[0];

      const baseUnitDb = material.base_unit;  // ex: "Kilogram"
      const baseUnit = normalizeUnit(baseUnitDb); // -> "kilogram"

      const inputUnit = normalizeUnit(Material_Unit);
      const currentStock = parseFloat(material.current_stock);

      // 2️⃣ Convert qty → base unit
      let releasedQtyBase;
      try {
        releasedQtyBase = convertToBaseUnit(
          Material_Quantity,
          inputUnit,
          baseUnit
        );
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (releasedQtyBase > currentStock) {
        return res.status(400).json({
          success: false,
          message: `${Material_Name} release exceeds available stock`
        });
      }

      // 3️⃣ Generate Release ID
      const Material_Release_Id = await generateNextId(
        connection,
        "MRL",
        "Material_Release_Id",
        "material_release"
      );

      // 4️⃣ INSERT release record
      await connection.query(
        `INSERT INTO material_release 
         (Material_Release_Id, Material_Id, Released_Quantity, Released_Unit, Released_By, Release_Date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          Material_Release_Id,
          material.Material_Id,
          releasedQtyBase,
          baseUnitDb,                       // store DB version ("Kilogram")
          req.user?.User_Id || null,
          Release_Date
        ]
      );

      // 5️⃣ Update stock
      const newStock = (currentStock - releasedQtyBase).toFixed(2);

      await connection.query(
        `UPDATE add_material 
         SET current_stock = ?, updated_at = NOW()
         WHERE Material_Id = ?`,
        [newStock, material.Material_Id]
      );

      // 6️⃣ Low stock warning
      if (newStock <= material.reorder_level) {
        warnings.push(`⚠ Low stock: ${Material_Name} is now ${newStock} ${baseUnitDb}`);
      }

      // 7️⃣ Prepare UI response
      results.push({
        Material_Name,
        Released_Input: `${Material_Quantity} ${Material_Unit}`,
        Released_Base: `${releasedQtyBase} ${baseUnitDb}`,
        Remaining_Stock: `${newStock} ${baseUnitDb}`
      });
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Materials released successfully.",
      releases: results,
      warnings
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Material Release Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  } finally {
    if (connection) connection.release();
  }
};


// ----------------------
// MAIN CONTROLLER
// ----------------------
// const addReleaseMaterials = async (req, res, next) => {
//     let connection;

//     try {
//         const { Release_Date, items } = req.body;

//         if (!items || items.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "At least one material entry is required."
//             });
//         }

//         connection = await db.getConnection();
//         await connection.beginTransaction();

//         const results = [];
//         const warnings = [];

//         for (const item of items) {
//             const { Material_Name, Material_Quantity, Material_Unit } = item;

//             // 1️⃣ Fetch material
//             const [mat] = await connection.query(
//                 `SELECT material_id, name, unit, current_stock, reorder_level 
//                  FROM add_material WHERE name = ?`,
//                 [Material_Name]
//             );

//             if (mat.length === 0) {
//                 return res.status(404).json({
//                     success: false,
//                     message: `Material not found: ${Material_Name}`
//                 });
//             }

//             const material = mat[0];
//             const baseUnit = material.unit;            // e.g., Kilogram
//             const currentStock = parseFloat(material.current_stock);

//             // 2️⃣ Convert released qty into base unit
//             let releasedQtyBase;

//             try {
//                 releasedQtyBase = convertToBaseUnit(
//                     Material_Quantity,
//                     Material_Unit,
//                     baseUnit
//                 );
//             } catch (err) {
//                 return res.status(400).json({
//                     success: false,
//                     message: err.message
//                 });
//             }

//             if (releasedQtyBase > currentStock) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `${Material_Name} release exceeds available stock`
//                 });
//             }

//             // 3️⃣ Generate Release ID
//             const Material_Release_Id = await generateNextId(
//                 connection,
//                 "MRL",
//                 "Material_Release_Id",
//                 "material_release"
//             );

//             // 4️⃣ Insert release record (save the ORIGINAL input)
//             await connection.query(
//                 `INSERT INTO material_release 
//                  (Material_Release_Id, Material_Id, Released_Quantity, Released_By, Release_Date)
//                  VALUES (?, ?, ?, ?, ?)`,
//                 [
//                     Material_Release_Id,
//                     material.material_id,
//                     releasedQtyBase,          // Save converted qty (base unit)
//                     req.user?.User_Id || null,
//                     Release_Date || null
//                 ]
//             );

//             // 5️⃣ Update remaining stock
//             const newStock = (currentStock - releasedQtyBase).toFixed(2);

//             await connection.query(
//                 `UPDATE add_material SET current_stock = ? WHERE material_id = ?`,
//                 [newStock, material.material_id]
//             );

//             // 6️⃣ Reorder alert
//             if (newStock <= material.reorder_level) {
//                 warnings.push(`⚠ Low stock: ${Material_Name} is now ${newStock}`);
//             }

//             results.push({
//                 Material_Name,
//                 Released_Quantity_Input: Material_Quantity + " " + Material_Unit,
//                 Released_Quantity_Base: releasedQtyBase + " " + baseUnit,
//                 Remaining_Stock: newStock + " " + baseUnit
//             });
//         }

//         await connection.commit();

//         return res.status(200).json({
//             success: true,
//             message: "Materials released successfully.",
//             releases: results,
//             warnings
//         });

//     } catch (err) {
//         if (connection) await connection.rollback();
//         console.error("❌ Material Release Error:", err.message);
//         return res.status(500).json({
//             success: false,
//             message: err.message
//         });
//     } finally {
//         if (connection) connection.release();
//     }
// };
// const addReleaseMaterials = async (req, res, next) => {
//   let connection;

//   try {
//     const { Release_Date, items } = req.body;

//     if (!items || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one material entry is required."
//       });
//     }

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     const results = [];
//     const warnings = [];

//     for (const item of items) {
//       const { Material_Name, Material_Quantity, Material_Unit } = item;

//       // 1️⃣ Fetch material
//       const [mat] = await connection.query(
//         `SELECT 
//             Material_Id,
//             name,
//             current_stock,
//             current_stock_unit,
//             reorder_level,
//             reorder_level_unit
//          FROM add_material
//          WHERE name = ? LIMIT 1`,
//         [Material_Name]
//       );

//       if (mat.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: `Material not found: ${Material_Name}`
//         });
//       }

//       const material = mat[0];

//       const baseUnit = material.current_stock_unit;  // ex: Kilogram
//       const currentStock = parseFloat(material.current_stock);

//       // 2️⃣ Convert qty → base unit using YOUR function
//       let releasedQtyBase;
//       try {
//         releasedQtyBase = convertToBaseUnit(
//           Material_Quantity,
//           Material_Unit,
//           baseUnit
//         );
//       } catch (err) {
//         return res.status(400).json({
//           success: false,
//           message: err.message
//         });
//       }

//       if (releasedQtyBase > currentStock) {
//         return res.status(400).json({
//           success: false,
//           message: `${Material_Name} release exceeds available stock`
//         });
//       }

//       // 3️⃣ Generate Release ID
//       const Material_Release_Id = await generateNextId(
//         connection,
//         "MRL",
//         "Material_Release_Id",
//         "material_release"
//       );

//       // 4️⃣ INSERT release record
//       await connection.query(
//         `INSERT INTO material_release 
//          (Material_Release_Id, Material_Id, Released_Quantity, Released_Unit, Released_By, Release_Date)
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [
//           Material_Release_Id,
//           material.Material_Id,
//           releasedQtyBase,
//           baseUnit,                        // store converted unit
//           req.user?.User_Id || null,
//           Release_Date
//         ]
//       );

//       // 5️⃣ Update remaining stock
//       const newStock = (currentStock - releasedQtyBase).toFixed(2);

//       await connection.query(
//         `UPDATE add_material 
//          SET current_stock = ?, updated_at = NOW()
//          WHERE Material_Id = ?`,
//         [newStock, material.Material_Id]
//       );

//       // 6️⃣ Reorder alert
//       if (newStock <= material.reorder_level) {
//         warnings.push(`⚠ Low stock: ${Material_Name} is now ${newStock} ${baseUnit}`);
//       }

//       // 7️⃣ Prepare response info
//       results.push({
//         Material_Name,
//         Released_Input: `${Material_Quantity} ${Material_Unit}`,
//         Released_Base: `${releasedQtyBase} ${baseUnit}`,
//         Remaining_Stock: `${newStock} ${baseUnit}`
//       });
//     }

//     await connection.commit();

//     return res.status(200).json({
//       success: true,
//       message: "Materials released successfully.",
//       releases: results,
//       warnings
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Material Release Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   } finally {
//     if (connection) connection.release();
//   }
// };
const singleMaterialReport = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    const { Material_Name } = req.params;

    console.log("Generating report for material:", Material_Name);

    if (!Material_Name) {
      return res.status(400).json({
        success: false,
        message: "Material name is required.",
      });
    }

    // 1️⃣ FETCH MATERIAL BASE DETAILS
    const [materialRows] = await connection.query(
      `
      SELECT 
        Material_Id,
        name AS Material_Name,
        current_stock AS Current_Stock,
        base_unit AS Base_Unit,
        current_stock_unit AS Current_Stock_Unit,
        reorder_level AS Reorder_Level,
        reorder_level_unit AS Reorder_Level_Unit,
        shelf_life_days AS Shelf_Life_Days,
        created_at AS Created_At,
        updated_at AS Updated_At
      FROM add_material
      WHERE name = ?
      LIMIT 1
      `,
      [Material_Name]
    );

    if (materialRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Material not found.",
      });
    }

    const material = materialRows[0];

    // 2️⃣ PURCHASE HISTORY FOR THIS MATERIAL
    const [purchases] = await connection.query(
      `
      SELECT 
        pi.Purchase_Id,
        ap.Bill_Number,
        
        DATE_FORMAT(ap.Bill_Date, '%Y-%m-%d') AS Bill_Date,
        pi.Quantity,
        pi.Item_Unit,
        pi.Purchase_Price,
        pi.Amount,
        p.Party_Name
      FROM add_purchase_items pi
      JOIN add_purchase ap ON ap.Purchase_Id = pi.Purchase_Id
      LEFT JOIN add_party p ON ap.Party_Id = p.Party_Id
      WHERE pi.Material_Id = ?
      ORDER BY ap.Bill_Date DESC
      `,
      [material.Material_Id]
    );

      const [purchaseTotals] = await connection.query(
      `
      SELECT 
        
        SUM(Amount) AS Total_Amount
      FROM add_purchase_items
      WHERE Material_Id = ?
      `,
      [material.Material_Id]
    );
    // 3️⃣ RELEASE HISTORY FOR THIS MATERIAL
    const [releases] = await connection.query(
      `
      SELECT 
        mr.Material_Release_Id,
        mr.Material_Id,
        u.name AS Released_By_Name,
        mr.Released_Quantity,
        mr.Released_Unit,
        mr.Released_By,
        DATE_FORMAT(mr.Release_Date, '%Y-%m-%d') AS Release_Date
      FROM material_release mr
      JOIN users u ON mr.Released_By = u.User_Id
      WHERE mr.Material_Id = ?
      ORDER BY mr.Release_Date DESC
      `,
      [material.Material_Id]
    );

    // 4️⃣ BUILD FINAL RESPONSE
    return res.status(200).json({
      success: true,
      message: "Material-wise report generated successfully.",
      materialDetails: material,
      purchaseHistory: purchases,
      purchaseTotals: purchaseTotals[0],
      releaseHistory: releases
    });

  } catch (err) {
    console.error("❌ Error generating material-wise report:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

// const printDailyReport = async (req, res) => {
//   try {
//     // Accept BOTH daily OR range
//     const {
//       // sales = [],
    
//       // purchases = [],

//       // date,        // for single-day
//       // fromDate,    // for range
//       // toDate,

//       // totalSalesAmount,
//       // totalSalesReceivedAmount,
//       // totalSalesBalanceDue,

     

//       // totalPurchasesAmount,
//       // totalPurchasesPaidAmount,
//       // totalPurchasesBalanceDue
//       materialDetails,
//       purchaseHistory,
//       releaseHistory
//     } = req.body;



//     const safe = (v) => (v !== undefined && v !== null ? v : "N/A");

  
//   const buildSection = (title, list, type) => {
//   if (!list || list.length === 0) return [];

//   let rows = [
//     {
//       text: title.toUpperCase(),
//       style: "sectionHeader",
//       alignment: "center",
//       margin: [0, 20, 0, 10]
//     }
//   ];

//   list.forEach((entry, idx) => {
//     rows.push({
//       unbreakable: true,  // 🔥🔥🔥 THE MAGIC FIX
//       stack: [
//         {
//           text: `${title.slice(0, -1)} ${idx + 1}`,
//           style: "subTitle",
//           alignment: "left",
//           margin: [0, 0, 0, 5]
//         },

//         // PARTY DETAILS
//         {
//           columns: [
//             {
//               width: "48%",
//               stack: [
//                 { text: "Party Name", style: "label" },
//                 { text: safe(entry.Party_Name), style: "value" },

//                 { text: "GSTIN", style: "label" },
//                 { text: safe(entry.GSTIN), style: "value" }
//               ]
//             },
//             {
//               width: "48%",
//               alignment: "right",
//               stack: [
//                 {
//                   text: type === "purchase" ? "Bill Number" : "Invoice Number",
//                   style: "label"
//                 },
//                 {
//                   text: safe(entry.Bill_Number|| entry.Invoice_Number),
//                   style: "value"
//                 },

//                 {
//                   text: type === "purchase" ? "Bill Date" : "Invoice Date",
//                   style: "label"
//                 },
//                 {
//                   text: safe(entry.Bill_Date|| entry.Invoice_Date),
//                   style: "value"
//                 }
//               ]
//             }
//           ],
//           columnGap: 20,
//           margin: [0, 0, 0, 10]
//         },

//         // TABLE
//         {
//           style: "tableSmall",
//           table: {
//             headerRows: 1,
//             widths: ["auto", "*", "*", "*", "*", "*", "*", "*"],
//             body: [
//               [
//                 { text: "Sl", style: "tableHeader" },
//                 { text: "Category", style: "tableHeader" },
//                 { text: "Item", style: "tableHeader" },
//                 { text: "HSN", style: "tableHeader" },
//                 { text: "Qty", style: "tableHeader" },
//                 { text: "Price", style: "tableHeader" },
//                 { text: "Tax", style: "tableHeader" },
//                 { text: "Amount", style: "tableHeader" }
//               ],

//               ...entry.items.map((it, i) => [
//                 i + 1,
//                 safe(it.Item_Category),
//                 safe(it.Item_Name),
//                 safe(it.Item_HSN),
//                 safe(it.Quantity + " " + safe(it.Item_Unit)),
//                 safe(it.Sale_Price || it.Purchase_Price),
//                 safe(TAX_TYPES[it.Tax_Type] || it.Tax_Type),
//                 Number(it.Amount || 0).toFixed(2)
//               ])
//             ]
//           },
//           layout: "lightHorizontalLines",
//           margin: [0, 0, 0, 8]
//         },

//         // TOTALS SECTION
//         {
//           columns: [
//             { width: "*", text: "" },
//             {
//               width: "40%",
//               table: {
//                 widths: ["*", "auto"],
//                 body: [
//                   ["Total Amount", safe(entry.Total_Amount)],
//                   [
//                     type === "purchase" ? "Paid" : "Received",
//                     safe(entry.Total_Paid || entry.Total_Received)
//                   ],
//                   ["Balance Due", safe(entry.Balance_Due)]
//                 ]
//               },
//               layout: "noBordersBox"
//             }
//           ],
//           margin: [0, 0, 0, 15]
//         }
//       ]
//     });
//   });

//   return rows;
// };

//     // HEADER TITLE
//     let headerTitle = "";

//     if (fromDate && toDate) {
//       headerTitle = `DATE RANGE REPORT`;
//     } else if (date) {
//       headerTitle = `DAILY REPORT`;
//     }

    
// const docDefinition = {
//   pageMargins: [18, 18, 18, 30],
//   defaultStyle: { font: "Helvetica" },

//   footer: (p, pc) => ({
//     text: `Page ${p} of ${pc}`,
//     alignment: "center",
//     margin: [10, 10, 10, 10]
//   }),

//   content: [
//     {
//       text: headerTitle,
//       style: "header",
//       alignment: "center",
//       margin: [0, 0, 0, 10]
//     },

//     ...buildSection("Purchases", purchases, "purchase"),
//     ...buildSection("Sales", sales, "sale"),
    
//   ],

//   styles: {
//     header: { fontSize: 20, bold: true },
//     sectionHeader: { fontSize: 15, bold: true },
//     subTitle: { fontSize: 12, bold: true },
//     label: { bold: true, fontSize: 10 },
//     value: { fontSize: 10 },
//     tableHeader: { bold: true, fillColor: "#eee" },
//     tableSmall: { fontSize: 9 }
//   }
// };

//     const pdfDoc = printer.createPdfKitDocument(docDefinition);
//     const chunks = [];

//     pdfDoc.on("data", (c) => chunks.push(c));
//     pdfDoc.on("end", () => {
//       res.setHeader("Content-Type", "application/pdf");
//       res.send(Buffer.concat(chunks));
//     });

//     pdfDoc.end();

//   } catch (err) {
//     console.error("Print failed:", err);
//     res.status(500).json({ message: "PDF Print Error" });
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
const noInnerLines = {
  hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0),
  vLineWidth: () => 0,
  hLineColor: () => "#000",
};

// const printEachMaterialDetailsReport = async (req, res) => {
//   try {
//     const {
//       materialDetails,
//       purchaseHistory,
//       releaseHistory
//     } = req.body;
//     console.log("Printing material details report for:", materialDetails, purchaseHistory, releaseHistory);
//     const safe = (v) => (v ?? "N/A");

// const materialSection = materialDetails
//   ? [
//       {
//         text: "MATERIAL DETAILS",
//         style: "sectionHeader",
//         alignment: "center",
//         margin: [0, 10, 0, 10],
//       },

//       {
//         table: {
//           widths: ["auto", "*", "auto", "*", "auto", "*"],
//           body: [
//             [
//               "Material",
//               safe(materialDetails?.Material_Name),
//               "Base Unit",
//               safe(materialDetails?.Base_Unit),
//               "Shelf Life (Days)",
//               safe(materialDetails?.Shelf_Life_Days),
//             ],
//             [
//               "Current Stock",
//               `${safe(materialDetails?.Current_Stock)} ${safe(materialDetails?.Current_Stock_Unit)}`,
//               "Reorder Level",
//               `${safe(materialDetails?.Reorder_Level)} ${safe(materialDetails?.Reorder_Level_Unit)}`,
//               "",
//               ""  // keep 6 columns alignment
//             ],
//           ],
//         },
//         layout: noInnerLines,
//         margin: [0, 0, 0, 5],
//       },

//       //separatorLine   // 🔥 Draw line under Material section
//     ]
//   : [];


//     // PURCHASE HISTORY SECTION
// const purchaseSection = purchaseHistory?.length
//   ? [
//       {
//         text: "PURCHASE HISTORY",
//         style: "sectionHeader",
//         alignment: "center",
//         margin: [0, 10, 0, 10],
//       },

//       ...purchaseHistory.map((p, i) => ({
//         unbreakable: true,
//         margin: [0, 5, 0, 5],
//         stack: [
//           { text: `Purchase ${i + 1}`, style: "subTitle", margin: [0, 3] },

//           {
//             table: {
//               widths: ["auto", "*", "auto", "*", "auto", "*"],
//               body: [
//                 [
//                   "Party",
//                   safe(p?.Party_Name),
//                   "Bill No.",
//                   safe(p?.Bill_Number),
//                   "Date",
//                   safe(p?.Bill_Date),
//                 ],
//                 [
//                   "Quantity",
//                   `${safe(p?.Quantity)} ${safe(p?.Item_Unit)}`,
//                   "Price",
//                   safe(p?.Purchase_Price),
//                   "Amount",
//                   safe(p?.Amount),
//                 ],
//               ],
//             },
//             layout: noInnerLines,
//           },
//         ],
//       })),

//       //separatorLine  // 🔥 Draw line after all purchases
//     ]
//   : [];



//     // RELEASE HISTORY SECTION
// const releaseSection = releaseHistory?.length
//   ? [
//       {
//         text: "RELEASE HISTORY",
//         style: "sectionHeader",
//         alignment: "center",
//         margin: [0, 10, 0, 10],
//       },

//       ...releaseHistory.map((r, i) => ({
//         unbreakable: true,
//         margin: [0, 5, 0, 5],
//         stack: [
//           { text: `Release ${i + 1}`, style: "subTitle", margin: [0, 3] },

//           {
//             table: {
//               widths: ["auto", "*", "auto", "*", "auto", "*"],
//               body: [
//                 [
//                   "Released By",
//                   safe(r?.Released_By_Name),
//                   "Date",
//                   safe(r?.Release_Date),
//                   "Quantity",
//                   `${safe(r?.Released_Quantity)} ${safe(r?.Released_Unit)}`,
//                 ]
//               ],
//             },
//             layout: noInnerLines,
//           },
//         ],
//       })),

//       //separatorLine   // 🔥 Draw line after release section
//     ]
//   : [];




//     const docDefinition = {
//       pageMargins: [18, 18, 18, 30],
//       defaultStyle: { font: "Helvetica" },

//       footer: (p, pc) => ({
//         text: `Page ${p} of ${pc}`,
//         alignment: "center",
//         margin: [10, 10, 10, 10]
//       }),

//       content: [
//         { text: "MATERIAL WISE REPORT", style: "header", alignment: "center", margin: [0, 0, 0, 10] },

//         ...materialSection,
//         ...purchaseSection,
//         ...releaseSection
//       ],

//       styles: {
//         header: { fontSize: 20, bold: true },
//         sectionHeader: { fontSize: 15, bold: true },
//         subTitle: { fontSize: 12, bold: true },
//         label: { bold: true, fontSize: 10 },
//         value: { fontSize: 10 },
//         tableHeader: { bold: true, fillColor: "#eee" },
//         tableSmall: { fontSize: 9 }
//       }
//     };

//     const pdfDoc = printer.createPdfKitDocument(docDefinition);
//     const chunks = [];

//     pdfDoc.on("data", (c) => chunks.push(c));
//     pdfDoc.on("end", () => {
//       res.setHeader("Content-Type", "application/pdf");
//       res.send(Buffer.concat(chunks));
//     });

//     pdfDoc.end();

//   } catch (err) {
//     console.error("Print failed:", err);
//     res.status(500).json({ message: "PDF Print Error" });
//   }
// };

// const printEachMaterialDetailsReport = async (req, res) => {
//   try {
//     const { materialDetails, purchaseHistory = [], releaseHistory = [] } = req.body;

//     const safe = (v) => (v !== undefined && v !== null ? v : "N/A");

//     // ---------------------------------------------------
//     // BUILD MATERIAL DETAILS BLOCK (LIKE SALES/PURCHASE BLOCK)
//     // ---------------------------------------------------
//     // const buildMaterialDetails = () => {
//     //   if (!materialDetails) return [];

//     //   return [
//     //     {
//     //       text: "MATERIAL DETAILS",
//     //       style: "sectionHeader",
//     //       alignment: "center",
//     //       margin: [0, 20, 0, 10],
//     //     },

//     //     {
//     //       unbreakable: true,
//     //       stack: [
//     //         {
//     //           columns: [
//     //             {
//     //               width: "48%",
//     //               stack: [
//     //                 { text: "Material Name", style: "label" },
//     //                 { text: safe(materialDetails.Material_Name), style: "value" },

//     //                 { text: "Base Unit", style: "label" },
//     //                 { text: safe(materialDetails.Base_Unit), style: "value" },
//     //               ],
//     //             },
//     //             {
//     //               width: "48%",
//     //               alignment: "right",
//     //               stack: [
//     //                 { text: "Current Stock", style: "label" },
//     //                 { text: `${safe(materialDetails.Current_Stock)} ${safe(materialDetails.Current_Stock_Unit)}`, style: "value" },

//     //                 { text: "Reorder Level", style: "label" },
//     //                 { text: `${safe(materialDetails.Reorder_Level)} ${safe(materialDetails.Reorder_Level_Unit)}`, style: "value" },
//     //               ],
//     //             },
//     //           ],
//     //           columnGap: 20,
//     //           margin: [0, 0, 0, 15],
//     //         },
//     //       ],
//     //     },
//     //   ];
//     // };
// const materialSection = materialDetails
//   ? [
//       {
//         text: "MATERIAL DETAILS",
//         style: "sectionHeader",
//         alignment: "center",
//         margin: [0, 20, 0, 10],
//       },

//       {
//         unbreakable: true,
//         table: {
//           widths: ["auto", "*", "auto", "*", "auto", "*"], // 3 label/value pairs
//           body: [
//             // ------------------ ROW 1 ------------------
//             [
//               { text: "Material Name", style: "label" },
//               { text: safe(materialDetails.Material_Name), style: "value" },

//               { text: "Base Unit", style: "label" },
//               { text: safe(materialDetails.Base_Unit), style: "value" },

//               { text: "Shelf Life (Days)", style: "label" },
//               { text: safe(materialDetails.Shelf_Life_Days), style: "value" },
//             ],

//             // ------------------ ROW 2 ------------------
//             [
//               { text: "Current Stock", style: "label" },
//               {
//                 text: `${safe(materialDetails.Current_Stock)} ${safe(materialDetails.Current_Stock_Unit)}`,
//                 style: "value",
//               },

//               { text: "Reorder Level", style: "label" },
//               {
//                 text: `${safe(materialDetails.Reorder_Level)} ${safe(materialDetails.Reorder_Level_Unit)}`,
//                 style: "value",
//               },

//               { text: "Updated On", style: "label" },
//               { text: safe(materialDetails.Updated_At)?.slice(0, 10), style: "value" },
//             ],
//           ],
//         },

//         layout: {
//           hLineWidth: () => 0,
//           vLineWidth: () => 0,
//           paddingLeft: () => 4,
//           paddingRight: () => 4,
//           paddingTop: () => 4,
//           paddingBottom: () => 6,
//         },

//         margin: [0, 0, 0, 10],
//       },
//     ]
//   : [];


//     // ---------------------------------------------------
//     // BUILD PURCHASE HISTORY SECTION
//     // ---------------------------------------------------
//     const buildPurchaseBlocks = () => {
//       if (!purchaseHistory.length) return [];

//       let rows = [
//         {
//           text: "PURCHASE HISTORY",
//           style: "sectionHeader",
//           alignment: "center",
//           margin: [0, 20, 0, 10],
//         },
//       ];

//       purchaseHistory.forEach((entry, idx) => {
//         rows.push({
//           unbreakable: true,
//           stack: [
//             { text: `Purchase ${idx + 1}`, style: "subTitle", margin: [0, 0, 0, 5] },

//             {
//               columns: [
//                 {
//                   width: "48%",
//                   stack: [
//                     { text: "Party Name", style: "label" },
//                     { text: safe(entry.Party_Name), style: "value" },
//                   ],
//                 },
//                 {
//                   width: "48%",
//                   alignment: "right",
//                   stack: [
//                     { text: "Bill No.", style: "label" },
//                     { text: safe(entry.Bill_Number), style: "value" },

//                     { text: "Bill Date", style: "label" },
//                     { text: safe(entry.Bill_Date), style: "value" },
//                   ],
//                 },
//               ],
//               columnGap: 20,
//               margin: [0, 0, 0, 10],
//             },

//             {
//               style: "tableSmall",
//               table: {
//                 headerRows: 1,
//                 widths: ["auto", "*", "*", "auto"],
//                 body: [
//                   [
//                     { text: "Qty", style: "tableHeader" },
//                     { text: "Unit", style: "tableHeader" },
//                     { text: "Price", style: "tableHeader" },
//                     { text: "Amount", style: "tableHeader" },
//                   ],
//                   [
//                     safe(entry.Quantity),
//                     safe(entry.Item_Unit),
//                     safe(entry.Purchase_Price),
//                     safe(entry.Amount),
//                   ],
//                 ],
//               },
//               layout: "lightHorizontalLines",
//               margin: [0, 0, 0, 10],
//             },
//           ],
//         });
//       });

//       return rows;
//     };

//     // ---------------------------------------------------
//     // BUILD RELEASE HISTORY SECTION
//     // ---------------------------------------------------
//     const buildReleaseBlocks = () => {
//       if (!releaseHistory.length) return [];

//       let rows = [
//         {
//           text: "MATERIAL RELEASE HISTORY",
//           style: "sectionHeader",
//           alignment: "center",
//           margin: [0, 20, 0, 10],
//         },
//       ];

//       releaseHistory.forEach((entry, idx) => {
//         rows.push({
//           unbreakable: true,
//           stack: [
//             { text: `Release ${idx + 1}`, style: "subTitle", margin: [0, 0, 0, 5] },

//             {
//               columns: [
//                 {
//                   width: "48%",
//                   stack: [
//                     { text: "Released By", style: "label" },
//                     { text: safe(entry.Released_By_Name), style: "value" },
//                   ],
//                 },
//                 {
//                   width: "48%",
//                   alignment: "right",
//                   stack: [
//                     { text: "Release Date", style: "label" },
//                     { text: safe(entry.Release_Date), style: "value" },
//                   ],
//                 },
//               ],
//               columnGap: 20,
//               margin: [0, 0, 0, 10],
//             },

//             {
//               style: "tableSmall",
//               table: {
//                 headerRows: 1,
//                 widths: ["auto", "auto"],
//                 body: [
//                   [
//                     { text: "Quantity", style: "tableHeader" },
//                     { text: "Unit", style: "tableHeader" },
//                   ],
//                   [
//                     safe(entry.Released_Quantity),
//                     safe(entry.Released_Unit),
//                   ],
//                 ],
//               },
//               layout: "lightHorizontalLines",
//               margin: [0, 0, 0, 10],
//             },
//           ],
//         });
//       });

//       return rows;
//     };

//     // ---------------------------------------------------
//     // FINAL PDF DEFINITION
//     // ---------------------------------------------------
//     const docDefinition = {
//       pageMargins: [18, 18, 18, 30],
//       defaultStyle: { font: "Helvetica" },

//       content: [
//         {
//           text: "MATERIAL WISE REPORT",
//           style: "header",
//           alignment: "center",
//           margin: [0, 0, 0, 10],
//         },
//          ...materialSection,
//         // ...buildMaterialDetails(),
//         ...buildPurchaseBlocks(),
//         ...buildReleaseBlocks(),
//       ],

//       styles: {
//         header: { fontSize: 20, bold: true },
//         sectionHeader: { fontSize: 15, bold: true },
//         subTitle: { fontSize: 12, bold: true },
//         label: { bold: true, fontSize: 10 },
//         value: { fontSize: 10 },
//         tableHeader: { bold: true, fillColor: "#eee" },
//         tableSmall: { fontSize: 9 },
//       },
//     };

//     const pdfDoc = printer.createPdfKitDocument(docDefinition);
//     const chunks = [];

//     pdfDoc.on("data", (c) => chunks.push(c));
//     pdfDoc.on("end", () => {
//       res.setHeader("Content-Type", "application/pdf");
//       res.send(Buffer.concat(chunks));
//     });

//     pdfDoc.end();
//   } catch (err) {
//     console.error("Print failed:", err);
//     res.status(500).json({ message: "PDF Print Error" });
//   }
// };
const printEachMaterialDetailsReport = async (req, res) => {
  try {
    const { materialDetails, purchaseHistory = [], releaseHistory = [] } = req.body;

    const safe = (v) => (v !== undefined && v !== null ? v : "N/A");

    // ---------------------------------------------------
    // NON-PUSHING SEPARATOR LINE (does NOT add height)
    // ---------------------------------------------------
    const separatorLine = {
      table: { widths: ["*"], body: [[""]] },
      layout: {
        hLineWidth: (i) => (i === 1 ? 1 : 0),
        vLineWidth: () => 0,
        hLineColor: () => "#000",
        paddingTop: () => 0,
        paddingBottom: () => -5 // prevents vertical push
      },
      margin: [0, 5, 0, 5]
    };

    // ---------------------------------------------------
    // MATERIAL SECTION (2-row layout)
    // ---------------------------------------------------
    const materialSection = materialDetails
      ? [
          {
            text: "MATERIAL DETAILS",
            style: "sectionHeader",
            alignment: "center",
            margin: [0, 20, 0, 10],
          },

          {
            unbreakable: true,
            table: {
              widths: ["auto", "*", "auto", "*", "auto", "*"],
              body: [
                [
                  { text: "Material Name", style: "label" },
                  { text: safe(materialDetails.Material_Name), style: "value" },

                  { text: "Base Unit", style: "label" },
                  { text: safe(materialDetails.Base_Unit), style: "value" },

                  { text: "Shelf Life (Days)", style: "label" },
                  { text: safe(materialDetails.Shelf_Life_Days), style: "value" },
                ],
                [
                  { text: "Current Stock", style: "label" },
                  { text: `${safe(materialDetails.Current_Stock)} ${safe(materialDetails.Current_Stock_Unit)}`, style: "value" },

                  { text: "Reorder Level", style: "label" },
                  { text: `${safe(materialDetails.Reorder_Level)} ${safe(materialDetails.Reorder_Level_Unit)}`, style: "value" },

                  { text: ""},
                  { text: "", style: "" },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0,
              vLineWidth: () => 0,
            },
            margin: [0, 0, 0, 10],
          },

          separatorLine
        ]
      : [];

    // ---------------------------------------------------
    // BUILD PURCHASE HISTORY BLOCKS
    // ---------------------------------------------------
    const buildPurchaseBlocks = () => {
      if (!purchaseHistory.length) return [];

      let rows = [
        {
          text: "PURCHASE DETAILS",
          style: "sectionHeader",
          alignment: "center",
          margin: [0, 20, 0, 10],
        },
      ];

      purchaseHistory.forEach((entry, idx) => {
        rows.push({
          unbreakable: true,
          stack: [
            { text: `${idx + 1}`, style: "subTitle", margin: [0, 0, 0, 5] },

            // FIRST ROW: Party Name, GSTIN, Bill No, Bill Date
            {
              table: {
                widths: ["auto", "*", "auto", "*", "auto", "*", "auto", "*"],
                body: [
                  [
                    { text: "Party Name", style: "label" },
                    { text: safe(entry.Party_Name), style: "value" },

                    { text: "GSTIN", style: "label" },
                    { text: safe(entry.GSTIN), style: "value" },

                    { text: "Bill No.", style: "label" },
                    { text: safe(entry.Bill_Number), style: "value" },

                    { text: "Bill Date", style: "label" },
                    { text: safe(entry.Bill_Date), style: "value" },
                  ],
                ],
              },
              layout: {
                hLineWidth: () => 0,
                vLineWidth: () => 0,
              },
              margin: [0, 0, 0, 8],
            },

            // SECOND ROW: Table of Qty / Unit / Price / Amount
            {
              style: "tableSmall",
              table: {
                headerRows: 1,
                widths: ["auto", "*", "*", "auto"],
                body: [
                  [
                    { text: "Qty", style: "tableHeader" },
                    { text: "Unit", style: "tableHeader" },
                    { text: "Price", style: "tableHeader" },
                    { text: "Amount", style: "tableHeader" },
                  ],
                  [
                    safe(entry.Quantity),
                    safe(entry.Item_Unit),
                    safe(entry.Purchase_Price),
                    safe(entry.Amount),
                  ],
                ],
              },
              layout: "lightHorizontalLines",
              margin: [0, 0, 0, 12],
            },
          ],
        });
      });

      rows.push(separatorLine); // add clean horizontal line

      return rows;
    };

    // ---------------------------------------------------
    // BUILD RELEASE HISTORY BLOCKS
    // ---------------------------------------------------
    const buildReleaseBlocks = () => {
      if (!releaseHistory.length) return [];

      let rows = [
        {
          text: " RELEASE DETAILS",
          style: "sectionHeader",
          alignment: "center",
          margin: [0, 20, 0, 10],
        },
      ];

      releaseHistory.forEach((entry, idx) => {
        rows.push({
          // unbreakable: true,
          // stack: [
          //   { text: `Release ${idx + 1}`, style: "subTitle", margin: [0, 0, 0, 5] },

          //   // FIRST ROW: Released By + Date
          //   {
          //     table: {
          //       widths: ["auto", "*", "auto", "*"],
          //       body: [
          //         [
          //           { text: "Released By", style: "label" },
          //           { text: safe(entry.Released_By_Name), style: "value" },

          //           { text: "Release Date", style: "label" },
          //           { text: safe(entry.Release_Date), style: "value" },
          //         ],
          //       ],
          //     },
          //     layout: {
          //       hLineWidth: () => 0,
          //       vLineWidth: () => 0,
          //     },
          //     margin: [0, 0, 0, 8],
          //   },

          //   // SECOND ROW: Qty + Unit
          //   {
          //     style: "tableSmall",
          //     table: {
          //       headerRows: 1,
          //       widths: ["50%", "50%"],

          //       // widths: ["auto", "auto"],
          //       body: [
          //         [
          //           { text: "Quantity", style: "tableHeader" },
          //           { text: "Unit", style: "tableHeader" },
          //         ],
          //         [
          //           safe(entry.Released_Quantity),
          //           safe(entry.Released_Unit),
          //         ],
          //       ],
          //     },
          //     layout: "lightHorizontalLines",
          //     margin: [0, 0, 0, 12],
          //   },
          // ],

          // RELEASE ROW (ALL INFO IN ONE CLEAN BLOCK)

  unbreakable: true,
  margin: [0, 5, 0, 10],
  stack: [
    { text: `${idx + 1}`, style: "subTitle", margin: [0, 2] },

    // FIRST ROW
    // {
    //   columns: [
    //     {
    //       width: "50%",
    //       text: `Released By: ${safe(entry.Released_By_Name)}`,
    //       style: "value"
    //     },
    //     {
    //       width: "50%",
    //       text: `Release Date: ${safe(entry.Release_Date)}`,
    //       style: "value",
    //       alignment: "right"
    //     }
    //   ],
    //   columnGap: 10,
    //   margin: [0, 0, 0, 4]
    // },

    // // SECOND ROW: Quantity + Unit
    // {
    //   columns: [
    //     {
    //       width: "50%",
    //       text: `Quantity: ${safe(entry.Released_Quantity)}`,
    //       style: "value"
    //     },
    //     {
    //       width: "50%",
    //       text: `Unit: ${safe(entry.Released_Unit)}`,
    //       style: "value",
    //       alignment: "right"
    //     }
    //   ],
    //   columnGap: 10
    // }
      {
              table: {
                widths: ["auto", "*", "auto", "*", "auto", "*", "auto", "*"],
                body: [
                  [
                    { text: "Released By", style: "label" },
                    { text: safe(entry.Released_By_Name), style: "value" },

                    { text: "Release Date", style: "label" },
                    { text: safe(entry.Release_Date), style: "value" },

                    { text: "Quantity.", style: "label" },
                    { text: safe(entry.Released_Quantity), style: "value" },

                    { text: "Unit", style: "label" },
                    { text: safe(entry.Released_Unit), style: "value" },
                  ],
                ],
              },
              layout: {
                hLineWidth: () => 0,
                vLineWidth: () => 0,
              },
              margin: [0, 0, 0, 8],
            },
  ]
        });
      });

      rows.push(separatorLine);

      return rows;
    };

    // ---------------------------------------------------
    // FINAL PDF DEFINITION
    // ---------------------------------------------------
    const docDefinition = {
      pageMargins: [18, 18, 18, 30],
      defaultStyle: { font: "Helvetica" },

      content: [
        {
          text: "MATERIAL WISE REPORT",
          style: "header",
          alignment: "center",
          margin: [0, 0, 0, 10],
        },

        ...materialSection,
        ...buildPurchaseBlocks(),
        ...buildReleaseBlocks(),
      ],

      styles: {
        header: { fontSize: 20, bold: true },
        sectionHeader: { fontSize: 15, bold: true },
        subTitle: { fontSize: 12, bold: true },
        label: { bold: true, fontSize: 10 },
        value: { fontSize: 10 },
        tableHeader: { bold: true, fillColor: "#eee" },
        tableSmall: { fontSize: 9 },
      },
    };

    // Generate PDF
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

export  {addMaterial,getAllMaterials,editSingleMaterial,addReleaseMaterials, 
  singleMaterialReport,printEachMaterialDetailsReport};


    // GLOBAL TOTALS
    // const globalTotals = {
    //   totalSalesAmount: totalSalesAmount || 0,
    //   totalSalesReceivedAmount: totalSalesReceivedAmount || 0,
    //   totalSalesBalanceDue: totalSalesBalanceDue || 0,

     

    //   totalPurchasesAmount: totalPurchasesAmount || 0,
    //   totalPurchasesPaidAmount: totalPurchasesPaidAmount || 0,
    //   totalPurchasesBalanceDue: totalPurchasesBalanceDue || 0
    // };