
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

    // 1️⃣ Prevent duplicate
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

    // 2️⃣ Generate Material ID
    const [last] = await connection.query(
      "SELECT Material_Id FROM add_material ORDER BY id DESC LIMIT 1"
    );

    let newId = "MAT00001";
    if (last.length > 0) {
      const nextNum = parseInt(last[0].Material_Id.replace("MAT", "")) + 1;
      newId = "MAT" + nextNum.toString().padStart(5, "0");
    }

    // 3️⃣ INSERT MATERIAL (no units, stock starts at 0)
    await connection.execute(
      `INSERT INTO add_material
      (Material_Id, name,
       current_stock,
       reorder_level, reorder_level_unit,
       shelf_life_days,
       created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        newId,
        name,
        0.00,                        // stock always starts at zero
        reorder_level,
        reorder_level_unit,
        shelf_life_days
      ]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Material created successfully ",
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error adding material:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
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
        like, // name
        like, // current_stock
        like, // current_stock_unit
        like, // reorder_level
        like, // reorder_level_unit
        like  // shelf_life_days
      );
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // COUNT QUERY
    const [countRows] = await connection.query(
      `SELECT COUNT(*) AS total FROM add_material ${whereSQL}`,
      params
    );

    const total = countRows[0].total;
    const totalPages = page ? Math.ceil(total / limit) : 1;

    // MAIN QUERY
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

    return res.status(200).json({
      success: true,
      message: "Materials fetched successfully",
      materials,
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
//           LOWER(unit) LIKE ? OR 
//           CAST(current_stock AS CHAR) LIKE ? OR 
//           CAST(reorder_level AS CHAR) LIKE ? OR 
//           CAST(shelf_life_days AS CHAR) LIKE ?
//         )
//       `);
//       const like = `%${search}%`;
//       params.push(like, like, like, like, like);
//     }

//     const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

//     // COUNT
//     const [countRows] = await connection.query(
//       `SELECT COUNT(*) AS total FROM add_material ${whereSQL}`,
//       params
//     );
//     const total = countRows[0].total;

//     let totalPages = 1;
//     if (page) totalPages = Math.ceil(total / limit);

//     // MAIN QUERY
//     let sql = `
//       SELECT * FROM add_material
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

// const editSingleMaterial = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();
//     await connection.beginTransaction();
//  const { Material_Id } = req.params;
//  console.log(Material_Id);
//  if(!Material_Id){
//   await connection.rollback();
//     return res.status(404).json({ message: "Material not found" });
//  }
//     // 1️⃣ Sanitize
//     let cleanData = sanitizeObject(req.body);

//     // 2️⃣ Normalize values (convert "" → null)
//     // cleanData = normalizeMaterialInput(cleanData);

//     // 3️⃣ Validate fields using SAME Zod schema
//     const validation = materialSchema.safeParse(cleanData);

//     // if (!validation.success) {
//     //  
//     //   return res.status(400).json({
//     //     message: validation.error.errors[0].message,
//     //   });
//     // }
//     if (!validation.success) {
//        await connection.rollback();
//           return res.status(400).json({ errors: validation.error.errors });
//         }
//     const {
//       name,
//       unit,
//       current_stock,
//       reorder_level,
//       shelf_life_days,
//     } = validation.data;

//   console.log(name, unit, current_stock, reorder_level, shelf_life_days);

//     // 4️⃣ Update record
//     await connection.execute(
//       `UPDATE add_material 
//         SET name = ?, unit = ?, current_stock = ?, reorder_level = ?, shelf_life_days = ?
//        WHERE Material_Id = ?`,
//       [name, unit, current_stock, reorder_level, shelf_life_days, Material_Id]
//     );

//     await connection.commit();

//     return res.status(200).json({
//       success: true,
//       message: "Material updated successfully",
//     });
//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("Error updating material:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

function normalizeUnit(unit) {
    return unit.trim().toLowerCase();
}

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
            current_stock_unit,
            reorder_level,
            reorder_level_unit
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

      const baseUnit = material.current_stock_unit;  // ex: Kilogram
      const currentStock = parseFloat(material.current_stock);

      // 2️⃣ Convert qty → base unit using YOUR function
      let releasedQtyBase;
      try {
        releasedQtyBase = convertToBaseUnit(
          Material_Quantity,
          Material_Unit,
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
          baseUnit,                        // store converted unit
          req.user?.User_Id || null,
          Release_Date
        ]
      );

      // 5️⃣ Update remaining stock
      const newStock = (currentStock - releasedQtyBase).toFixed(2);

      await connection.query(
        `UPDATE add_material 
         SET current_stock = ?, updated_at = NOW()
         WHERE Material_Id = ?`,
        [newStock, material.Material_Id]
      );

      // 6️⃣ Reorder alert
      if (newStock <= material.reorder_level) {
        warnings.push(`⚠ Low stock: ${Material_Name} is now ${newStock} ${baseUnit}`);
      }

      // 7️⃣ Prepare response info
      results.push({
        Material_Name,
        Released_Input: `${Material_Quantity} ${Material_Unit}`,
        Released_Base: `${releasedQtyBase} ${baseUnit}`,
        Remaining_Stock: `${newStock} ${baseUnit}`
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


export  {addMaterial,getAllMaterials,editSingleMaterial,addReleaseMaterials};