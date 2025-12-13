import db from "../config/db.js"; // mysql2/promise connection
import purchaseSchema from "../validators/purchaseSchema.js";
import { sanitizeObject } from "../utils/sanitizeInput.js";






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

function normalizeUnit(unit) {
   if (!unit || typeof unit !== "string") return "";
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
function formatUnitForDB(unit) {
    if (!unit) return "";
    unit = unit.trim().toLowerCase();

    switch (unit) {
        case "kg":
        case "kilogram":
            return "Kilogram";
        case "g":
        case "gram":
            return "Gram";
        case "lt":
        case "liter":
        case "litre":
            return "Litre";
        case "ml":
        case "milliliter":
        case "millilitre":
            return "Milliliter";
        default:
            return unit.charAt(0).toUpperCase() + unit.slice(1);
    }
}

const addPurchase = async (req, res, next) => {
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const cleanData = sanitizeObject(req.body);
        const validation = purchaseSchema.safeParse(cleanData);

        if (!validation.success) {
            await connection.rollback();
            return res.status(400).json({ errors: validation.error.errors });
        }

        const {
            Party_Name,
            Bill_Number,
            Bill_Date,
            State_Of_Supply,
            Total_Amount,
            Total_Paid,
            Balance_Due,
            Payment_Type,
            Reference_Number,
            items
        } = validation.data;

        if (!Party_Name || !Bill_Number || !Bill_Date || !items.length) {
            await connection.rollback();
            return res.status(400).json({
                message: "Required fields missing or items empty."
            });
        }

        // 1️⃣ Check Party
        const [partyRows] = await connection.query(
            "SELECT Party_Id FROM add_party WHERE Party_Name = ? LIMIT 1",
            [Party_Name]
        );

        if (partyRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Party not found." });
        }

        const Party_Id = partyRows[0].Party_Id;

        // 2️⃣ Generate Purchase_Id
        const [lastPurchase] = await connection.query(
            "SELECT Purchase_Id FROM add_purchase ORDER BY id DESC LIMIT 1"
        );

        let newPurchaseId = "PUR001";
        if (lastPurchase.length > 0) {
            const nextNum = parseInt(lastPurchase[0].Purchase_Id.replace("PUR", "")) + 1;
            newPurchaseId = "PUR" + nextNum.toString().padStart(3, "0");
        }
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

    const activeFY = fy[0].Financial_Year; 
        // Insert Master
        await connection.execute(
            `INSERT INTO add_purchase 
            (Party_Id, Purchase_Id, Bill_Number, Bill_Date,financial_year, State_Of_Supply,
            Total_Amount, Total_Paid, Balance_Due, Payment_Type, Reference_Number,
            created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                Party_Id,
                newPurchaseId,
                Bill_Number,
                Bill_Date,
                activeFY,
                State_Of_Supply,
                Total_Amount,
                Total_Paid,
                Balance_Due,
                Payment_Type,
                Reference_Number
            ]
        );

        // 3️⃣ Next PIT ID
        const [maxRow] = await connection.query(
            `SELECT MAX(CAST(SUBSTRING(Purchase_items_Id, 4) AS UNSIGNED)) AS maxNum 
            FROM add_purchase_items`
        );

        let nextPurchaseItemNum = (maxRow[0]?.maxNum || 0) + 1;

        // 4️⃣ Loop All Items
        for (const item of items) {
            const {
                Item_Name,
                Quantity,
                Item_Unit,
                Purchase_Price,
                Discount_On_Purchase_Price,
                Discount_Type_On_Purchase_Price,
                Tax_Type,
                Tax_Amount,
                Amount
            } = item;

            // Format unit for DB storage
            const dbUnit = formatUnitForDB(Item_Unit);

            // Check material
            const [materialRows] = await connection.query(
                `SELECT material_id, base_unit, current_stock 
                 FROM add_material WHERE name = ? LIMIT 1`,
                [Item_Name]
            );

            let materialId;
            let baseUnit;

            // CASE A — New Material (first time ever)
            if (materialRows.length === 0) {

                const [lastMat] = await connection.query(
                    "SELECT Material_Id FROM add_material ORDER BY id DESC LIMIT 1"
                );

                let newMaterialId = "MAT00001";
                if (lastMat.length > 0) {
                    const nextNum = parseInt(lastMat[0].Material_Id.replace("MAT", "")) + 1;
                    newMaterialId = "MAT" + nextNum.toString().padStart(5, "0");
                }

                materialId = newMaterialId;
                baseUnit = dbUnit;   // store base unit properly formatted

                await connection.execute(
                    `INSERT INTO add_material
                    (Material_Id, name, current_stock, base_unit, current_stock_unit,
                    reorder_level, reorder_level_unit, shelf_life_days, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                    [
                        materialId,
                        Item_Name,
                        normalizeNumber(Quantity),
                        dbUnit,
                        dbUnit,
                        0.00,
                        dbUnit,
                        0
                    ]
                );

            } else {
                // CASE B — Existing Material
                materialId = materialRows[0].material_id;
                baseUnit = materialRows[0].base_unit;

                const qtyInBase = convertToBaseUnit(Quantity, Item_Unit, baseUnit);

                await connection.execute(
                    `UPDATE add_material
                     SET current_stock = current_stock + ?, updated_at = NOW()
                     WHERE material_id = ?`,
                    [qtyInBase, materialId]
                );
            }

            // INSERT ITEM ENTRY
            const newPurchaseItemId =
                "PIT" + nextPurchaseItemNum.toString().padStart(3, "0");
            nextPurchaseItemNum++;

            await connection.execute(
  `INSERT INTO add_purchase_items 
  (Purchase_items_Id, Purchase_Id, Material_Id, Quantity, Item_Unit,
   Purchase_Price, Discount_On_Purchase_Price, Discount_Type_On_Purchase_Price,
   Tax_Type, Tax_Amount, Amount, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
  [
    newPurchaseItemId,
    newPurchaseId,
    materialId,
    normalizeNumber(Quantity),
    formatUnitForDB(Item_Unit), // <-- NEWLY ADDED (stores Kg, Gram, Litre etc.)
    normalizeNumber(Purchase_Price),
    cleanDiscount(Discount_On_Purchase_Price),
    cleanValue(Discount_Type_On_Purchase_Price),
    cleanValue(Tax_Type),
    normalizeNumber(Tax_Amount),
    normalizeNumber(Amount)
  ]
);


            // await connection.execute(
            //     `INSERT INTO add_purchase_items 
            //     (Purchase_items_Id, Purchase_Id, Material_Id, Quantity, Purchase_Price,
            //     Discount_On_Purchase_Price, Discount_Type_On_Purchase_Price,
            //     Tax_Type, Tax_Amount, Amount, created_at, updated_at)
            //     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            //     [
            //         newPurchaseItemId,
            //         newPurchaseId,
            //         materialId,
            //         normalizeNumber(Quantity),
            //         normalizeNumber(Purchase_Price),
            //         cleanDiscount(Discount_On_Purchase_Price),
            //         cleanValue(Discount_Type_On_Purchase_Price),
            //         cleanValue(Tax_Type),
            //         normalizeNumber(Tax_Amount),
            //         normalizeNumber(Amount)
            //     ]
            // );
        }

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Purchase added successfully!",
            Purchase_Id: newPurchaseId
        });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error("❌ Error adding purchase:", err);
        next(err);
    } finally {
        if (connection) connection.release();
    }
};

// const addPurchase = async (req, res, next) => {
//   let connection;
//   try {
//     connection = await db.getConnection();
//     await connection.beginTransaction(); // ✅ Start transaction
// console.log(req.body);
//     const cleanData = sanitizeObject(req.body);
//     const validation = purchaseSchema.safeParse(cleanData);
//     if (!validation.success) {
//       await connection.rollback();
//       return res.status(400).json({ errors: validation.error.errors });
//     }

//     const {
//       Party_Name,
     
//       Bill_Number,
//       Bill_Date,
//       State_Of_Supply,
//       Total_Amount,
//       Total_Paid,
//       Balance_Due,
//       Payment_Type,
//       Reference_Number,
//       items,
//     } = validation.data;

//     if (
//       !Party_Name ||
//       !Bill_Number ||
//       !Bill_Date ||
//       !State_Of_Supply ||
//       !Array.isArray(items) ||
//       items.length === 0
//     ) {
//       await connection.rollback();
//       return res
//         .status(400)
//         .json({ message: "Star marked fields missing or items empty." });
//     }
//    const itemCountMap = new Map();
//     for (const item of items) {
//       const itemName = item.Item_Name?.trim().toLowerCase();
//       if (!itemName) {
        
//         return res.status(400).json({ message: "Item name missing." });
//       }

//       const qty = Number(item.Quantity) || 0;
//       itemCountMap.set(itemName, (itemCountMap.get(itemName) || 0) + qty);
//           const duplicates = [...itemCountMap.entries()].filter(([name]) =>
//       items.filter((it) => it.Item_Name?.trim().toLowerCase() === name).length > 1
//     );
//     if (duplicates.length > 0) {
//       const names = duplicates.map(([n]) => `'${n}'`).join(", ");
    
//       return res.status(400).json({
//         message: `Duplicate items detected: ${names}. Please ensure each item appears only once.`,
//       });
//     }
//     }
//     // 🔹 Get Party_Id
//     const [partyRows] = await connection.execute(
//       "SELECT Party_Id,GSTIN FROM add_party WHERE Party_Name = ? LIMIT 1",
//       [Party_Name]
//     );
//     if (partyRows.length === 0) {
//       await connection.rollback();
//       return res.status(404).json({ message: "Party not found." });
//     }

//     const Party_Id = partyRows[0].Party_Id;

//     // 🔹 Generate new Purchase_Id
//     const [lastPurchase] = await connection.query(
//       "SELECT Purchase_Id FROM add_purchase ORDER BY id DESC LIMIT 1"
//     );
//     let newPurchaseId = "PUR001";
//     if (lastPurchase.length > 0) {
//       const lastNum = parseInt(lastPurchase[0].Purchase_Id.replace("PUR", "")) + 1;
//       newPurchaseId = "PUR" + lastNum.toString().padStart(3, "0");
//     }
// //  const [fy] = await connection.query(
// //       `SELECT Financial_Year 
// //        FROM financial_year 
// //        WHERE Current_Financial_Year = 1
// //        LIMIT 1`
// //     );

// //     if (fy.length === 0) {
// //       await connection.rollback();
// //       return res.status(400).json({
// //         message: "No active financial year found. Please set one in settings.",
// //       });
// //     }

//     // const activeFY = fy[0].Financial_Year; 
//     // 🔹 Insert Purchase Master
//     await connection.execute(
//       `INSERT INTO add_purchase 
//        (Party_Id, Purchase_Id, Bill_Number, Bill_Date, State_Of_Supply,
//         Total_Amount, Total_Paid, Balance_Due, Payment_Type, Reference_Number, 
//         created_at, updated_at)
//        VALUES (?, ?, ?,?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//       [
//         Party_Id,
//         newPurchaseId,
//         Bill_Number,
//         Bill_Date,
        
//         State_Of_Supply,
//         cleanValue(Total_Amount),
//         cleanValue(Total_Paid),
//         cleanValue(Balance_Due),
//         cleanValue(Payment_Type),
//         cleanValue(Reference_Number),
//       ]
//     );

  
//     const [maxRow] = await connection.query(
//   `SELECT MAX(CAST(SUBSTRING(Purchase_items_Id, 4) AS UNSIGNED)) 
//   AS maxNum FROM add_purchase_items`
// );
// let nextPurchaseItemNum = (maxRow[0]?.maxNum || 0) + 1;
//     console.log("nextPurchaseItemNum", nextPurchaseItemNum);
//     // 🔹 Loop through items
//     for (const item of items) {
//       const {
        
//         Item_Name,
      
//         Quantity,
//         Item_Unit,
//         Purchase_Price,
//         Discount_On_Purchase_Price,
//         Discount_Type_On_Purchase_Price,
//         Tax_Type,
//         Tax_Amount,
//         Amount,
      
//       } = item;

      

//       // Check if item already exists
//       // const [itemRows] = await connection.execute(
//       //   "SELECT * FROM add_material WHERE name = ? LIMIT 1",
//       //   [Item_Name]
//       // );

//       // let Item_Id;
//       // if (itemRows.length === 0) {
//       //   // Create new item
//       //   const [lastMaterial] = await connection.query(
//       //     "SELECT Material_Id FROM add_material ORDER BY id DESC LIMIT 1"
//       //   );

//       //   let newMaterialId = "MAT00001";
//       //   if (lastMaterial.length > 0) {
//       //     const lastNum = parseInt(lastMaterial[0].Material_Id.replace("MAT", "")) + 1;
//       //     newMaterialId = "MAT" + lastNum.toString().padStart(5, "0");
//       //   }

//       //   await connection.execute(
//       //     `INSERT INTO add_material 
//       //   (Material_Id, name, unit, current_stock, reorder_level, shelf_life_days,created_at, updated_at)
//       //  VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//       //     [
//       //       newMaterialId,
//       //       Item_Name,
        
//       //       Item_Unit || "",
//       //       normalizeNumber(Quantity),
           
//       //       Item_Category || "",
//       //       normalizeNumber(Quantity),
//       //     ]
//       //   );

//       //   Item_Id = newItemId;
//       // } else {
//       //   // Existing item → update stock
//       //   const existingItem = itemRows[0];
//       //   Item_Id = existingItem.Item_Id;

    

//       //   await connection.execute(
//       //     `UPDATE add_material 
//       //      SET current_stock = current_stock + ?, updated_at = NOW()
//       //      WHERE Material_Id = ?`,
//       //     [normalizeNumber(Quantity), Material_Id]
//       //   );
//       // }
// // 🔍 Check if material exists
// const [materialRows] = await connection.query(
//   "SELECT material_id, current_stock FROM add_material WHERE name = ? LIMIT 1",
//   [Item_Name]
// );

// let materialId;

// // ▶️ CASE 1: Material DOES NOT EXIST → CREATE IT
// if (materialRows.length === 0) {

//   // Generate new Material ID
//   const [lastMat] = await connection.query(
//     "SELECT Material_Id FROM add_material ORDER BY id DESC LIMIT 1"
//   );

//   let newMaterialId = "MAT00001";
//   if (lastMat.length > 0) {
//     const lastNum = parseInt(lastMat[0]?.Material_Id?.replace("MAT", "")) + 1;
//     newMaterialId = "MAT" + String(lastNum).padStart(5, "0");
//   }

//   // Insert new material
//   // await connection.execute(
//   //   `INSERT INTO add_material
//   //     (Material_Id, name, unit, current_stock, reorder_level, shelf_life_days, created_at, updated_at)
//   //    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//   //   [
//   //     newMaterialId,
//   //     Item_Name,
//   //     Item_Unit || "",
//   //     normalizeNumber(Quantity),  // purchased qty as starting stock
//   //     0.00,
//   //     0.00
//   //   ]
//   // );
// await connection.execute(
//   `INSERT INTO add_material
//     (Material_Id, name, current_stock, current_stock_unit, 
//      reorder_level, reorder_level_unit, shelf_life_days, created_at, updated_at)
//    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//   [
//     newMaterialId,
//     Item_Name,
//     normalizeNumber(Quantity),   // starting stock
//     Item_Unit,                    // base unit
//     0.00,                            // reorder level default
//     Item_Unit,                    // reorder unit = base unit
//     0                             // shelf life default
//   ]
// );

//   materialId = newMaterialId;

// } else {
// const existingUnit = materialRows[0].current_stock_unit || Item_Unit;

//   // ▶️ CASE 2: Material EXISTS → UPDATE STOCK
//   materialId = materialRows[0].material_id;
//   const releasedBaseQty = convertToBaseUnit(
//   Quantity,
//   Item_Unit,
//    existingUnit
// );

// await connection.execute(
//   `UPDATE add_material
//    SET current_stock = current_stock + ?, updated_at = NOW()
//    WHERE material_id = ?`,
//   [releasedBaseQty, materialId]
// );


//   // await connection.execute(
//   //   `UPDATE add_material
//   //    SET current_stock = current_stock + ?, updated_at = NOW()
//   //    WHERE material_id = ?`,
//   //   [normalizeNumber(Quantity), materialId]
//   // );
// }


//    const newPurchaseItemId = "PIT" + nextPurchaseItemNum.toString().padStart(3, "0");
//       nextPurchaseItemNum++;

//       // Insert purchase item
//       await connection.execute(
//         `INSERT INTO add_purchase_items 
//          (Purchase_items_Id, Purchase_Id, Material_Id, Quantity, Purchase_Price,
//           Discount_On_Purchase_Price, Discount_Type_On_Purchase_Price,
//           Tax_Type, Tax_Amount, Amount, created_at, updated_at)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//         [
//           newPurchaseItemId,
//           newPurchaseId,
//           materialId,
//           normalizeNumber(Quantity),
//           normalizeNumber(Purchase_Price),
//           cleanDiscount(Discount_On_Purchase_Price),
//           cleanValue(Discount_Type_On_Purchase_Price),
//           cleanValue(Tax_Type),
//           normalizeNumber(Tax_Amount),
//           normalizeNumber(Amount),
//         ]
//       );
//     }

//     await connection.commit(); // ✅ Commit only if all inserts succeed

//     return res.status(201).json({
//       success: true,
//       message: "Purchase and items added successfully",
//       purchaseId: newPurchaseId,
//     });
//   } catch (err) {
//     if (connection) await connection.rollback(); // ❌ Rollback everything on failure
//     console.error("❌ Error adding purchase:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release(); // ✅ Always release connection
//   }
// };

const getAllPurchases = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const search = req.query.search ? req.query.search.trim().toLowerCase() : "";
    const fromDate = req.query.fromDate || null;
    const toDate = req.query.toDate || null;

    

    let whereClauses = [];
    let params = [];

    // 🔎 Search
    if (search) {
      whereClauses.push(`
        (LOWER(a.Party_Name) LIKE ? 
         OR LOWER(p.Payment_Type) LIKE ? 
         OR LOWER(p.Balance_Due) LIKE ? 
         OR LOWER(p.Total_Amount) LIKE ?)
      `);
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }

    // 📅 Date Range
    if (fromDate && toDate) {
      whereClauses.push("DATE(p.created_at) BETWEEN ? AND ?");
      params.push(fromDate, toDate);
    } else if (fromDate) {
      whereClauses.push("DATE(p.created_at) >= ?");
      params.push(fromDate);
    } else if (toDate) {
      whereClauses.push("DATE(p.created_at) <= ?");
      params.push(toDate);
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // 🧠 Main Paginated Query
    const query = `
      SELECT p.*, a.Party_Name
      FROM add_purchase p
      LEFT JOIN add_party a ON p.Party_Id = a.Party_Id
      ${whereSQL}
     ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);

    // 🧾 Get total count
    const [countResult] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM add_purchase p
      LEFT JOIN add_party a ON p.Party_Id = a.Party_Id
      ${whereSQL}
      `,
      params.slice(0, params.length - 2)
    );

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(countResult[0].total / limit),
      totalPurchases: countResult[0].total,
      purchases: rows,
    });
  } catch (err) {
     if (connection) connection.release();
    console.error("❌ Error fetching purchases:", err);
    next(err);
    //return res.status(500).json({ message: "Internal Server Error" });
  }finally {
    if (connection) connection.release();
  }
};


// const editPurchase = async (req, res, next) => {
//   let connection;
//   try {
//     const { Purchase_Id: purchaseId } = req.params;

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     // 1️⃣ Check purchase exists
//     const [existingPurchase] = await connection.query(
//       "SELECT * FROM add_purchase WHERE Purchase_Id = ?",
//       [purchaseId]
//     );
//     if (existingPurchase.length === 0) {
//       return res.status(404).json({ message: "Purchase not found." });
//     }

//     // 2️⃣ Validate input
//     const cleanData = sanitizeObject(req.body);
//     const validation = purchaseSchema.safeParse(cleanData);

//     if (!validation.success) {
//       await connection.rollback();
//       return res.status(400).json({ errors: validation.error.errors });
//     }

//     const {
//       Party_Name,
//       Bill_Number,
//       Bill_Date,
//       State_Of_Supply,
//       Total_Amount,
//       Total_Paid,
//       Balance_Due,
//       Payment_Type,
//       Reference_Number,
//       items,
//     } = validation.data;

//     if (!items.length) {
//       return res.status(400).json({ message: "At least one item required." });
//     }

//     // 3️⃣ Restore old material stock (convert back units)
//     const [oldItems] = await connection.query(
//       `
//       SELECT pi.Material_Id, pi.Quantity, m.current_stock_unit AS oldUnit
//       FROM add_purchase_items pi
//       LEFT JOIN add_material m ON pi.Material_Id = m.Material_Id
//       WHERE pi.Purchase_Id = ?
//       `,
//       [purchaseId]
//     );

//     for (const old of oldItems) {
//       const restoreQty = convertToBaseUnit(
//         old.Quantity,
//         old.oldUnit,
//         old.oldUnit // same unit → no change
//       );

//       await connection.query(
//         `UPDATE add_material 
//          SET current_stock = current_stock - ?
//          WHERE material_id = ?`,
//         [restoreQty, old.Material_Id]
//       );
//     }

//     // 4️⃣ Update purchase master
//     await connection.query(
//       `UPDATE add_purchase SET
//         Party_Id = (SELECT Party_Id FROM add_party WHERE Party_Name = ? LIMIT 1),
//         Bill_Number = ?, 
//         Bill_Date = ?, 
//         State_Of_Supply = ?, 
//         Total_Amount = ?, 
//         Total_Paid = ?, 
//         Balance_Due = ?, 
//         Payment_Type = ?, 
//         Reference_Number = ?, 
//         updated_at = NOW()
//        WHERE Purchase_Id = ?`,
//       [
//         Party_Name,
//         Bill_Number,
//         Bill_Date,
//         State_Of_Supply,
//         cleanValue(Total_Amount),
//         cleanValue(Total_Paid),
//         cleanValue(Balance_Due),
//         cleanValue(Payment_Type),
//         cleanValue(Reference_Number),
//         purchaseId,
//       ]
//     );

//     // Remove old items
//     await connection.query("DELETE FROM add_purchase_items WHERE Purchase_Id = ?", [purchaseId]);

//     // 5️⃣ Generate next Material_Id numbers
//     const [maxMaterialRow] = await connection.query(
//       `SELECT MAX(CAST(SUBSTRING(Material_Id, 4) AS UNSIGNED)) AS maxMat FROM add_material`
//     );
//     let nextMaterialNum = (maxMaterialRow[0]?.maxMat || 0) + 1;

//     // 6️⃣ Generate next purchase item ID
//     const [maxPurchaseRow] = await connection.query(
//       `SELECT MAX(CAST(SUBSTRING(Purchase_items_Id, 4) AS UNSIGNED)) AS maxId FROM add_purchase_items`
//     );
//     let nextPurchaseItemNum = (maxPurchaseRow[0]?.maxId || 0) + 1;

//     // 7️⃣ Process each purchase item
//     for (const item of items) {
//       const {
//         Item_Name,
//         Item_Unit,
//         Quantity,
//         Purchase_Price,
//         Discount_On_Purchase_Price,
//         Discount_Type_On_Purchase_Price,
//         Tax_Type,
//         Tax_Amount,
//         Amount,
//       } = item;

//       let Material_Id;

//       // Check existing material
//       const [matRows] = await connection.query(
//         "SELECT * FROM add_material WHERE name = ? LIMIT 1",
//         [Item_Name]
//       );

//       if (matRows.length === 0) {
//         // ➤ New material → insert
//         Material_Id = "MAT" + String(nextMaterialNum).padStart(5, "0");
//         nextMaterialNum++;

//         await connection.query(
//           `
//           INSERT INTO add_material
//           (Material_Id, name, current_stock, current_stock_unit, 
//            reorder_level, reorder_level_unit, shelf_life_days, created_at, updated_at)
//           VALUES (?, ?, ?, ?, 0, ?, 0, NOW(), NOW())
//           `,
//           [
//             Material_Id,
//             Item_Name,
//             Quantity,
//             Item_Unit,
//             Item_Unit
//           ]
//         );
//       } else {
//         // ➤ Existing material → update stock
//         Material_Id = matRows[0].Material_Id;

//         const convertedQty = convertToBaseUnit(
//           Quantity,
//           Item_Unit,
//           matRows[0].current_stock_unit
//         );

//         await connection.query(
//           `UPDATE add_material 
//            SET current_stock = current_stock + ?, updated_at = NOW()
//            WHERE Material_Id = ?`,
//           [convertedQty, Material_Id]
//         );
//       }

//       // Insert purchase item
//       const Purchase_items_Id = "PIT" + String(nextPurchaseItemNum).padStart(3, "0");
//       nextPurchaseItemNum++;

//       await connection.query(
//         `INSERT INTO add_purchase_items 
//         (Purchase_items_Id, Purchase_Id, Material_Id, Quantity, Purchase_Price, 
//          Discount_On_Purchase_Price, Discount_Type_On_Purchase_Price,
//          Tax_Type, Tax_Amount, Amount, created_at, updated_at)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//         [
//           Purchase_items_Id,
//           purchaseId,
//           Material_Id,
//           Quantity,
//           Purchase_Price,
//           Discount_On_Purchase_Price,
//           Discount_Type_On_Purchase_Price,
//           Tax_Type,
//           Tax_Amount,
//           Amount
//         ]
//       );
//     }

//     await connection.commit();
//     return res.status(200).json({
//       success: true,
//       message: "Purchase updated successfully",
//       purchaseId,
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error editing purchase:", err);
//     return res.status(500).json({ message: "Internal Server Error" });
//   } finally {
//     if (connection) connection.release();
//   }
// };

// const editPurchase = async (req, res, next) => {
//   let connection;

//   try {
//     const { Purchase_Id: purchaseId } = req.params;

//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     // 1️⃣ Check purchase exists
//     const [existingPurchase] = await connection.query(
//       "SELECT * FROM add_purchase WHERE Purchase_Id = ?",
//       [purchaseId]
//     );

//     if (existingPurchase.length === 0) {
//       return res.status(404).json({ message: "Purchase not found." });
//     }

//     // 2️⃣ Validate data
//     const cleanData = sanitizeObject(req.body);
//     const validation = purchaseSchema.safeParse(cleanData);

//     if (!validation.success) {
//       await connection.rollback();
//       return res.status(400).json({ errors: validation.error.errors });
//     }

//     const {
//       Party_Name,
//       Bill_Number,
//       Bill_Date,
//       State_Of_Supply,
//       Total_Amount,
//       Total_Paid,
//       Balance_Due,
//       Payment_Type,
//       Reference_Number,
//       items,
//     } = validation.data;

//     if (!items.length) {
//       return res.status(400).json({ message: "Items cannot be empty." });
//     }

//     // 3️⃣ Restore old stock (reverse old purchase effect)
//     const [oldItems] = await connection.query(
//       `
//       SELECT pi.Material_Id, pi.Quantity, m.base_unit 
//       FROM add_purchase_items pi
//       JOIN add_material m ON m.Material_Id = pi.Material_Id
//       WHERE pi.Purchase_Id = ?
//       `,
//       [purchaseId]
//     );

//     for (const old of oldItems) {
//       const qtyToSubtract = convertToBaseUnit(
//         old.Quantity,
//         old.base_unit,
//         old.base_unit
//       );

//       await connection.query(
//         `UPDATE add_material 
//          SET current_stock = current_stock - ?
//          WHERE Material_Id = ?`,
//         [qtyToSubtract, old.Material_Id]
//       );
//     }

//     // 4️⃣ Update purchase master
//     await connection.query(
//       `UPDATE add_purchase SET
//         Party_Id = (SELECT Party_Id FROM add_party WHERE Party_Name = ? LIMIT 1),
//         Bill_Number = ?, 
//         Bill_Date = ?, 
//         State_Of_Supply = ?, 
//         Total_Amount = ?, 
//         Total_Paid = ?, 
//         Balance_Due = ?, 
//         Payment_Type = ?, 
//         Reference_Number = ?, 
//         updated_at = NOW()
//        WHERE Purchase_Id = ?`,
//       [
//         Party_Name,
//         Bill_Number,
//         Bill_Date,
//         State_Of_Supply,
//         cleanValue(Total_Amount),
//         cleanValue(Total_Paid),
//         cleanValue(Balance_Due),
//         cleanValue(Payment_Type),
//         cleanValue(Reference_Number),
//         purchaseId,
//       ]
//     );

//     // 5️⃣ Delete previous item entries
//     await connection.query("DELETE FROM add_purchase_items WHERE Purchase_Id = ?", [
//       purchaseId,
//     ]);

//     // 6️⃣ Next purchase item ID
//     const [maxPIT] = await connection.query(
//       `SELECT MAX(CAST(SUBSTRING(Purchase_items_Id,4) AS UNSIGNED)) AS maxNum 
//        FROM add_purchase_items`
//     );

//     let nextPurchaseItemNum = (maxPIT[0]?.maxNum || 0) + 1;

//     // 7️⃣ Process each updated item
//     for (const item of items) {
//       const {
//         Item_Name,
//         Item_Unit,
//         Quantity,
//         Purchase_Price,
//         Discount_On_Purchase_Price,
//         Discount_Type_On_Purchase_Price,
//         Tax_Type,
//         Tax_Amount,
//         Amount,
//       } = item;

//       const dbUnit = formatUnitForDB(Item_Unit); // store unit properly

//       // Check if material exists
//       const [matRows] = await connection.query(
//         "SELECT Material_Id, base_unit FROM add_material WHERE name = ? LIMIT 1",
//         [Item_Name]
//       );

//       let Material_Id;
//       let baseUnit;

//       if (matRows.length === 0) {
//         // 7A️⃣ NEW MATERIAL → CREATE IT
//         const [lastMat] = await connection.query(
//           "SELECT Material_Id FROM add_material ORDER BY id DESC LIMIT 1"
//         );

//         let newId = "MAT00001";
//         if (lastMat.length > 0) {
//           const nextNum = parseInt(lastMat[0].Material_Id.replace("MAT", "")) + 1;
//           newId = "MAT" + nextNum.toString().padStart(5, "0");
//         }

//         Material_Id = newId;
//         baseUnit = dbUnit;

//         await connection.query(
//           `
//           INSERT INTO add_material
//           (Material_Id, name, current_stock, base_unit, current_stock_unit,
//            reorder_level, reorder_level_unit, shelf_life_days,
//            created_at, updated_at)
//           VALUES (?, ?, ?, ?, ?, 0, ?, 0, NOW(), NOW())
//           `,
//           [
//             Material_Id,
//             Item_Name,
//             normalizeNumber(Quantity),
//             dbUnit,
//             dbUnit,
//             dbUnit,
//           ]
//         );
//       } else {
//         // 7B️⃣ EXISTING MATERIAL → UPDATE STOCK
//         Material_Id = matRows[0].Material_Id;
//         baseUnit = matRows[0].base_unit;

//         const qtyInBase = convertToBaseUnit(Quantity, Item_Unit, baseUnit);

//         await connection.query(
//           `UPDATE add_material 
//            SET current_stock = current_stock + ?, updated_at = NOW()
//            WHERE Material_Id = ?`,
//           [qtyInBase, Material_Id]
//         );
//       }

//       // 8️⃣ Insert new purchase item entry
//       const Purchase_items_Id =
//         "PIT" + String(nextPurchaseItemNum).padStart(3, "0");
//       nextPurchaseItemNum++;

//       // await connection.query(
//       //   `INSERT INTO add_purchase_items 
//       //   (Purchase_items_Id, Purchase_Id, Material_Id, Quantity, Purchase_Price, 
//       //    Discount_On_Purchase_Price, Discount_Type_On_Purchase_Price,
//       //    Tax_Type, Tax_Amount, Amount, created_at, updated_at)
//       //    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//       //   [
//       //     Purchase_items_Id,
//       //     purchaseId,
//       //     Material_Id,
//       //     normalizeNumber(Quantity),
//       //     normalizeNumber(Purchase_Price),
//       //     cleanDiscount(Discount_On_Purchase_Price),
//       //     cleanValue(Discount_Type_On_Purchase_Price),
//       //     cleanValue(Tax_Type),
//       //     normalizeNumber(Tax_Amount),
//       //     normalizeNumber(Amount),
//       //   ]
//       // );
//       await connection.query(
//   `INSERT INTO add_purchase_items 
//   (Purchase_items_Id, Purchase_Id, Material_Id, Quantity, Item_Unit,
//    Purchase_Price, Discount_On_Purchase_Price, Discount_Type_On_Purchase_Price,
//    Tax_Type, Tax_Amount, Amount, created_at, updated_at)
//    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//   [
//     Purchase_items_Id,
//     purchaseId,
//     Material_Id,
//    normalizeNumber(Quantity),
//     formatUnitForDB(Item_Unit),  // <-- FIXED HERE
//     normalizeNumber(Purchase_Price),
//    cleanDiscount(Discount_On_Purchase_Price),
//        cleanValue(Discount_Type_On_Purchase_Price),
//     Tax_Type,
//     Tax_Amount,
//     Amount
//   ]
// );

//     }

//     await connection.commit();

//     return res.status(200).json({
//       success: true,
//       message: "Purchase updated successfully",
//       purchaseId,
//     });

//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error editing purchase:", err);
//     return res.status(500).json({ message: "Internal Server Error" });
//   } finally {
//     if (connection) connection.release();
//   }
// };
const editPurchase = async (req, res, next) => {
  let connection;

  try {
    const { Purchase_Id: purchaseId } = req.params;
      if(!purchaseId){
      
        return res.status(400).json({  success: false,message:"Purchase ID is required"});
      }
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Check existing purchase
    const [existingPurchase] = await connection.query(
      "SELECT * FROM add_purchase WHERE Purchase_Id = ?",
      [purchaseId]
    );

    if (existingPurchase.length === 0) {
      return res.status(404).json({ message: "Purchase not found." });
    }

    // 2️⃣ Validate request body
    const cleanData = sanitizeObject(req.body);
    const validation = purchaseSchema.safeParse(cleanData);

    if (!validation.success) {
      await connection.rollback();
      return res.status(400).json({ errors: validation.error.errors });
    }

    const {
      Party_Name,
      Bill_Number,
      Bill_Date,
      State_Of_Supply,
      Total_Amount,
      Total_Paid,
      Balance_Due,
      Payment_Type,
      Reference_Number,
      items,
    } = validation.data;

    if (!items.length) {
      return res.status(400).json({ message: "Items cannot be empty." });
    }

    // 3️⃣ RESTORE OLD STOCK using actual Item_Unit from purchase_items
    const [oldItems] = await connection.query(
      `
      SELECT 
        pi.Material_Id, 
        pi.Quantity, 
        pi.Item_Unit, 
        m.base_unit 
      FROM add_purchase_items pi
      JOIN add_material m ON m.Material_Id = pi.Material_Id
      WHERE pi.Purchase_Id = ?
      `,
      [purchaseId]
    );

    for (const old of oldItems) {
      const qtyToSubtract = convertToBaseUnit(
        old.Quantity,
        old.Item_Unit,
        old.base_unit
      );

      await connection.query(
        `UPDATE add_material 
         SET current_stock = current_stock - ?, updated_at = NOW()
         WHERE Material_Id = ?`,
        [qtyToSubtract, old.Material_Id]
      );
    }

    // 4️⃣ Update purchase master table
    await connection.query(
      `UPDATE add_purchase SET
        Party_Id = (SELECT Party_Id FROM add_party WHERE Party_Name = ? LIMIT 1),
        Bill_Number = ?, 
        Bill_Date = ?, 
        State_Of_Supply = ?, 
        Total_Amount = ?, 
        Total_Paid = ?, 
        Balance_Due = ?, 
        Payment_Type = ?, 
        Reference_Number = ?, 
        updated_at = NOW()
       WHERE Purchase_Id = ?`,
      [
        Party_Name,
        Bill_Number,
        Bill_Date,
        State_Of_Supply,
        cleanValue(Total_Amount),
        cleanValue(Total_Paid),
        cleanValue(Balance_Due),
        cleanValue(Payment_Type),
        cleanValue(Reference_Number),
        purchaseId,
      ]
    );

    // 5️⃣ Remove old purchase_items
    await connection.query(
      "DELETE FROM add_purchase_items WHERE Purchase_Id = ?",
      [purchaseId]
    );

    // 6️⃣ Generate next PIT ID
    const [maxPIT] = await connection.query(
      `SELECT MAX(CAST(SUBSTRING(Purchase_items_Id,4) AS UNSIGNED)) AS maxNum 
       FROM add_purchase_items`
    );
    let nextPurchaseItemNum = (maxPIT[0]?.maxNum || 0) + 1;

    // 7️⃣ Process each new purchase item
    for (const item of items) {
      const {
        Item_Name,
        Item_Unit,
        Quantity,
        Purchase_Price,
        Discount_On_Purchase_Price,
        Discount_Type_On_Purchase_Price,
        Tax_Type,
        Tax_Amount,
        Amount,
      } = item;

      const dbUnit = formatUnitForDB(Item_Unit);

      // 7A️⃣ Check if material exists
      const [matRows] = await connection.query(
        "SELECT Material_Id, base_unit FROM add_material WHERE name = ? LIMIT 1",
        [Item_Name]
      );

      let Material_Id;
      let baseUnit;

      if (matRows.length === 0) {
        // NEW MATERIAL — CREATE IT
        const [lastMat] = await connection.query(
          "SELECT Material_Id FROM add_material ORDER BY id DESC LIMIT 1"
        );

        let newMaterialId = "MAT00001";
        if (lastMat.length > 0) {
          const nextNum = parseInt(lastMat[0].Material_Id.replace("MAT", "")) + 1;
          newMaterialId = "MAT" + nextNum.toString().padStart(5, "0");
        }

        Material_Id = newMaterialId;
        baseUnit = dbUnit;

        await connection.query(
          `
          INSERT INTO add_material
          (Material_Id, name, current_stock, base_unit, current_stock_unit,
           reorder_level, reorder_level_unit, shelf_life_days,
           created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 0, ?, 0, NOW(), NOW())
          `,
          [
            Material_Id,
            Item_Name,
            normalizeNumber(Quantity),
            dbUnit,
            dbUnit,
            dbUnit,
          ]
        );
      } else {
        // EXISTING MATERIAL — ADD STOCK
        Material_Id = matRows[0].Material_Id;
        baseUnit = matRows[0].base_unit;

        const qtyInBase = convertToBaseUnit(
          Quantity,
          Item_Unit,
          baseUnit
        );

        await connection.query(
          `UPDATE add_material 
           SET current_stock = current_stock + ?, updated_at = NOW()
           WHERE Material_Id = ?`,
          [qtyInBase, Material_Id]
        );
      }

      // 8️⃣ INSERT NEW PURCHASE ITEM
      const Purchase_items_Id =
        "PIT" + String(nextPurchaseItemNum).padStart(3, "0");
      nextPurchaseItemNum++;

      await connection.query(
        `INSERT INTO add_purchase_items 
        (Purchase_items_Id, Purchase_Id, Material_Id, Quantity, Item_Unit,
         Purchase_Price, Discount_On_Purchase_Price, Discount_Type_On_Purchase_Price,
         Tax_Type, Tax_Amount, Amount, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          Purchase_items_Id,
          purchaseId,
          Material_Id,
          normalizeNumber(Quantity),
          dbUnit,
          normalizeNumber(Purchase_Price),
          cleanDiscount(Discount_On_Purchase_Price),
          cleanValue(Discount_Type_On_Purchase_Price),
          cleanValue(Tax_Type),
          normalizeNumber(Tax_Amount),
          normalizeNumber(Amount),
        ]
      );
    }

    // 9️⃣ Commit
    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Purchase updated successfully",
      purchaseId,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error editing purchase:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (connection) connection.release();
  }
};

const getSinglePurchase = async (req, res, next) => {
  let connection;
  try {
    const { Purchase_Id: purchaseId } = req.params;

    connection = await db.getConnection();

    if (!purchaseId) {
      return res.status(400).json({ success: false, message: "Purchase ID is required." });
    }

    // 1️⃣ Fetch purchase header
    const [purchaseData] = await connection.query(
      `
      SELECT 
        pu.Purchase_Id,
        pu.Bill_Number,
        pu.Bill_Date,
        pu.Reference_Number,
        pu.State_Of_Supply,
        pu.Payment_Type,
        pu.Total_Amount,
        pu.Total_Paid,
        pu.Balance_Due,
        pu.Party_Id,
        p.Party_Name,
        p.GSTIN,
        p.Billing_Address,
        p.Shipping_Address
      FROM add_purchase pu
      LEFT JOIN add_party p ON pu.Party_Id = p.Party_Id
      WHERE pu.Purchase_Id = ?
      `,
      [purchaseId]
    );

    if (purchaseData.length === 0) {
      return res.status(404).json({ success: false, message: "Purchase not found." });
    }

    const purchaseHeader = purchaseData[0];

    // 2️⃣ Fetch purchase items including the actual Item_Unit used during entry
    const [items] = await connection.query(
      `
      SELECT 
        pi.Purchase_items_Id,
        pi.Material_Id,
        pi.Quantity,
        pi.Item_Unit,    -- ✅ UNIT USED AT PURCHASE TIME (IMPORTANT)
        pi.Purchase_Price,
        pi.Discount_On_Purchase_Price,
        pi.Discount_Type_On_Purchase_Price,
        pi.Tax_Amount,
        pi.Tax_Type,
        pi.Amount,
        pi.created_at,
        m.name AS Material_Name,
        m.current_stock_unit AS Material_Unit
      FROM add_purchase_items pi
      LEFT JOIN add_material m 
        ON pi.Material_Id = m.Material_Id
      WHERE pi.Purchase_Id = ?
      ORDER BY pi.created_at DESC
      `,
      [purchaseId]
    );

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: "No purchase items found." });
    }

    // 3️⃣ Build response
    const response = {
      success: true,
      billPurchaseDetails: {
        Purchase_Id: purchaseHeader.Purchase_Id,
        Party_Name: purchaseHeader.Party_Name,
        GSTIN: purchaseHeader.GSTIN,
        State_Of_Supply: purchaseHeader.State_Of_Supply,
        Payment_Type: purchaseHeader.Payment_Type,
        Reference_Number: purchaseHeader.Reference_Number,
        Bill_Number: purchaseHeader.Bill_Number,
        Bill_Date: purchaseHeader.Bill_Date,
        Total_Amount: purchaseHeader.Total_Amount,
        Total_Paid: purchaseHeader.Total_Paid,
        Balance_Due: purchaseHeader.Balance_Due,
        Billing_Address: purchaseHeader.Billing_Address,
        Shipping_Address: purchaseHeader.Shipping_Address,
      },

      items: items.map((it) => ({
        Purchase_Items_Id: it.Purchase_items_Id,
        Material_Id: it.Material_Id,
        Item_Name: it.Material_Name,

        // ✅ Correct Unit: the unit that was used during purchase entry (Kg, Gram, Litre...)
        Item_Unit: it.Item_Unit,

        Quantity: it.Quantity,
        Purchase_Price: it.Purchase_Price,
        Discount_On_Purchase_Price: it.Discount_On_Purchase_Price,
        Discount_Type_On_Purchase_Price: it.Discount_Type_On_Purchase_Price,
        Tax_Amount: it.Tax_Amount,
        Tax_Type: it.Tax_Type,
        Amount: it.Amount,
        created_at: it.created_at,
      }))
    };

    return res.status(200).json(response);

  } catch (err) {
    if (connection) connection.release();
    console.error("❌ Error getting single purchase:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


// const getSinglePurchase = async (req, res, next) => {
//   let connection;
//   try {
//     const { Purchase_Id: purchaseId } = req.params;

//     connection = await db.getConnection();

//     if (!purchaseId) {
//       return res.status(400).json({ success: false, message: "Purchase ID is required." });
//     }

//     // ✅ Fetch purchase header
//     const [purchaseData] = await db.query(
//       `
//       SELECT 
//         pu.Purchase_Id,
//         pu.Bill_Number,
//         pu.Bill_Date,
//         pu.Reference_Number,
//         pu.State_Of_Supply,
//         pu.Payment_Type,
//         pu.Total_Amount,
//         pu.Total_Paid,
//         pu.Balance_Due,
//         pu.Party_Id,
//         p.Party_Name,
//         p.GSTIN,
//         p.Billing_Address,
//         p.Shipping_Address
//       FROM add_purchase pu
//       LEFT JOIN add_party p ON pu.Party_Id = p.Party_Id
//       WHERE pu.Purchase_Id = ?
//       `,
//       [purchaseId]
//     );

//     if (purchaseData.length === 0) {
//       return res.status(404).json({ success: false, message: "Purchase not found." });
//     }

//     const purchaseHeader = purchaseData[0];

//     // ✅ Fetch all purchase items
//     const [items] = await db.query(
//       `
//       SELECT 
//         pi.Purchase_Items_Id,
//         pi.Material_Id,
//         pi.Quantity,
//         pi.Purchase_Price,
//         pi.Discount_On_Purchase_Price,
//         pi.Discount_Type_On_Purchase_Price,
//         pi.Tax_Amount,
//         pi.Tax_Type,
//         pi.Amount,
//         pi.created_at,
//         m.name AS Material_Name,
//         m.current_stock_unit AS Material_Unit
//       FROM add_purchase_items pi
//       LEFT JOIN add_material m ON pi.Material_Id = m.Material_Id
//       WHERE pi.Purchase_Id = ?
//       ORDER BY pi.created_at DESC
//       `,
//       [purchaseId]
//     );

//     if (items.length === 0) {
//       return res.status(404).json({ success: false, message: "No purchase items found." });
//     }

//     // ✅ Build final response
//     const response = {
//       success: true,
//       billPurchaseDetails: {
//         Purchase_Id: purchaseHeader.Purchase_Id,
//         Party_Name: purchaseHeader.Party_Name,
//         GSTIN: purchaseHeader.GSTIN,
//         State_Of_Supply: purchaseHeader.State_Of_Supply,
//         Payment_Type: purchaseHeader.Payment_Type,
//         Reference_Number: purchaseHeader.Reference_Number,
//         Bill_Number: purchaseHeader.Bill_Number,
//         Bill_Date: purchaseHeader.Bill_Date,
//         Total_Amount: purchaseHeader.Total_Amount,
//         Total_Paid: purchaseHeader.Total_Paid,
//         Balance_Due: purchaseHeader.Balance_Due,
//         Billing_Address: purchaseHeader.Billing_Address,
//         Shipping_Address: purchaseHeader.Shipping_Address
//       },

//       items: items.map((it) => ({
//         Purchase_Items_Id: it.Purchase_Items_Id,
//         Material_Id: it.Material_Id,
//         Item_Name: it.Material_Name,
//         Item_Unit: it.Material_Unit, // ✔ correct unit from material table
//         Quantity: it.Quantity,
//         Purchase_Price: it.Purchase_Price,
//         Discount_On_Purchase_Price: it.Discount_On_Purchase_Price,
//         Discount_Type_On_Purchase_Price: it.Discount_Type_On_Purchase_Price,
//         Tax_Amount: it.Tax_Amount,
//         Tax_Type: it.Tax_Type,
//         Amount: it.Amount,
//         created_at: it.created_at,
//       }))
//     };

//     return res.status(200).json(response);

//   } catch (err) {
//     if (connection) connection.release();
//     console.error("❌ Error getting single purchase:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };

//  const editPurchase = async (req, res, next) => {
//   let connection;
//   try {

//     const { Purchase_Id: purchaseId } = req.params;
//     connection = await db.getConnection();
//     await connection.beginTransaction();
//     // 1️⃣ Check if sale exists
//     const [existingPurchase] = await connection.query(
//       "SELECT * FROM add_purchase WHERE Purchase_Id = ?",
//       [purchaseId]
//     );
//     if (existingPurchase.length === 0) {
//       return res.status(404).json({ message: "No such Sale found." });
//     }

//     console.log(req.body)
//     // 2️⃣ Validate & sanitize request
//     const cleanData = sanitizeObject(req.body);
//     const validation = purchaseSchema.safeParse(cleanData);
//     if (!validation.success) {
//       await connection.rollback();
//       return res.status(400).json({ errors: validation.error.errors });
//     }

//     const {
     
//             Party_Name,
//             GSTIN,
//       Bill_Number,
//       Bill_Date,
//       State_Of_Supply,
//       Total_Amount,
//       Total_Paid,
//       Balance_Due,
//       Payment_Type,
//       Reference_Number,
//       items,
//     } = validation.data;

//     if (!Array.isArray(items) || items.length === 0) {
//       await connection.rollback();
//       return res.status(400).json({ message: "No purchase items provided, please add at least one item." });
//     }


//    const itemCountMap = new Map();
//     for (const item of items) {
//       const name = item.Item_Name?.trim().toLowerCase();
//       if (!name) {
//         await connection.rollback();
//         return res.status(400).json({ message: "Item name missing in one or more entries." });
//       }

//       itemCountMap.set(name, (itemCountMap.get(name) || 0) + item.Quantity);
//     }

//     const duplicates = [...itemCountMap.entries()].filter(([name]) =>
//       items.filter((it) => it.Item_Name?.trim().toLowerCase() === name).length > 1
//     );
//     if (duplicates.length > 0) {
//       const names = duplicates.map(([n]) => `'${n}'`).join(", ");
//       await connection.rollback();
//       return res.status(400).json({
//         message: `Duplicate items detected: ${names}. Please ensure each item appears only once.`,
//       });
//     }

//     // 🧩 4️⃣ Fetch Party_Id
//     const [partyRows] = await connection.query(
//       "SELECT Party_Id, GSTIN FROM add_party WHERE Party_Name = ? LIMIT 1",
//       [Party_Name]
//     );
//     if (partyRows.length === 0) {
//       await connection.rollback();
//       return res.status(404).json({ message: "Party not found." });
//     }
// //   if (partyRows[0].GSTIN && partyRows[0].GSTIN !== GSTIN) {
// //   await connection.rollback();
// //   return res.status(400).json({
// //     message: "GSTIN does not match with selected party.",
// //   });
// // }
//     // 3️⃣ Restore previous stock before validation
//     const [oldItems] = await connection.query(
//       "SELECT Item_Id, Quantity FROM add_purchase_items WHERE Purchase_Id = ?",
//       [purchaseId]
//     );

//     for (const old of oldItems) {
//       await connection.query(
//         `UPDATE add_item 
//          SET Stock_Quantity = Stock_Quantity - ?, updated_at = NOW() 
//          WHERE Item_Id = ?`,
//         [old.Quantity, old.Item_Id]
//       );
//     }

 

//     // 5️⃣ Update sale master
//     await connection.query(
//       `UPDATE add_purchase SET 
//         Party_Id = (SELECT Party_Id FROM add_party WHERE Party_Name = ? LIMIT 1),
//         Bill_Number = ?, 
//         Bill_Date = ?, 
//         State_Of_Supply = ?, 
//         Total_Amount = ?, 
//         Total_Paid = ?, 
//         Balance_Due = ?, 
//         Payment_Type = ?, 
//         Reference_Number = ?, 
//         updated_at = NOW()
//        WHERE Purchase_Id = ?`,
//       [
//         Party_Name,
//         Bill_Number,
//         Bill_Date,
//         State_Of_Supply,
//         cleanValue(Total_Amount),
//         cleanValue(Total_Paid),
//         cleanValue(Balance_Due),
//         cleanValue(Payment_Type),
//         cleanValue(Reference_Number),
//         purchaseId,
//       ]
//     );

//     // 6️⃣ Fetch old sale items and build map
//     const [oldPurchaseItems] = await connection.query(
//       "SELECT Purchase_items_Id, Item_Id, Quantity, created_at FROM add_purchase_items WHERE Purchase_Id = ?",
//       [purchaseId]
//     );
//     const oldPurchaseItemMap = new Map();
//     for (const old of oldPurchaseItems) {
//       oldPurchaseItemMap.set(old.Item_Id, old);
//     }
// const [maxIdRow] = await connection.query(
//   "SELECT MAX(CAST(SUBSTRING(Purchase_items_Id, 4) AS UNSIGNED)) AS maxId FROM add_purchase_items"
// );
// let nextPurchaseItemNum = (maxIdRow[0]?.maxId || 0) + 1;
//    console.log(nextPurchaseItemNum);
//     // Delete old sale items (to reinsert updated)
//     await connection.query("DELETE FROM add_purchase_items WHERE Purchase_Id = ?", [purchaseId]);

    
// const [maxItemRow] = await connection.query(`
//   SELECT MAX(CAST(SUBSTRING(Item_Id, 4) AS UNSIGNED)) AS maxItem 
//   FROM add_item
// `);
// let nextItemNum = (maxItemRow[0]?.maxItem || 0) + 1;
// // 7️⃣ Reinsert updated purchase items & adjust stock
// for (const item of items) {
//   const {
//     Item_Name,
//     Item_Category,
//     Item_HSN,
//     Item_Unit,
//     Quantity,
//     Purchase_Price,
//     Discount_On_Purchase_Price,
//     Discount_Type_On_Purchase_Price,
//     Tax_Type,
//     Tax_Amount,
//     Amount,
//   } = item;

//   // 1️⃣ Check if item exists
//   const [existingItem] = await connection.query(
//     "SELECT * FROM add_item WHERE Item_Name = ? LIMIT 1",
//     [Item_Name]
//   );

//   let Item_Id;
//   let isNewItem = false;
// if (existingItem.length === 0) {
//   Item_Id = "ITM" + nextItemNum.toString().padStart(3, "0");
//   nextItemNum++;

//   await connection.query(
//     `INSERT INTO add_item 
//      (Item_Id, Item_Name, Item_Category, Item_HSN, Item_Unit, Stock_Quantity, created_at, updated_at)
//      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//     [
//       Item_Id,   // 👈 Correct reference
//       Item_Name,
//       Item_Category || "",
//       Item_HSN || "",
//       Item_Unit || "",
//       normalizeNumber(Quantity),
//     ]
//   );

//   isNewItem = true;
// }

//   // if (existingItem.length === 0) {
 
//   // Item_Id = "ITM" + nextItemNum.toString().padStart(3, "0");
//   //   nextItemNum++; // increment counter safely for next item
//   //   await connection.query(
//   //     `INSERT INTO add_item 
//   //      (Item_Id, Item_Name, Item_Category, Item_HSN, Item_Unit, Stock_Quantity, created_at, updated_at)
//   //      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//   //     [
//   //       newItemId,
//   //       Item_Name,
//   //       Item_Category || "",
//   //       Item_HSN || "",
//   //       Item_Unit || "",
//   //       normalizeNumber(Quantity),
//   //     ]
//   //   );

//   //   Item_Id = newItemId;
//   //   isNewItem = true;
//   // } 
//   else {
//     Item_Id = existingItem[0].Item_Id;
//   }

//   // 2️⃣ Reuse or create new Purchase_items_Id
//   const oldData = oldPurchaseItemMap.get(Item_Id);
//   let Purchase_items_Id;
//   let createdAt;

//   if (oldData) {
//     Purchase_items_Id = oldData.Purchase_items_Id;
//     createdAt = oldData.created_at;
//   } else {
//     // Generate next unique ID safely
//      Purchase_items_Id = "PIT" + nextPurchaseItemNum.toString().padStart(3, "0")
//     // Purchase_items_Id = "PIT" + nextItemNumber.toString().padStart(3, "0");
//     nextPurchaseItemNum++; // increment safely for next new item
//     createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");
//   }

//   // 3️⃣ Insert into add_purchase_items
//   await connection.query(
//     `INSERT INTO add_purchase_items 
//      (Purchase_items_Id, Purchase_Id, Item_Id, Quantity, Purchase_Price, 
//       Discount_On_Purchase_Price, Discount_Type_On_Purchase_Price, 
//       Tax_Type, Tax_Amount, Amount, created_at, updated_at)
//      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
//     [
//       Purchase_items_Id,
//       purchaseId,
//       Item_Id,
//       normalizeNumber(Quantity),
//       normalizeNumber(Purchase_Price),
//       cleanDiscount(Discount_On_Purchase_Price),
//       cleanValue(Discount_Type_On_Purchase_Price),
//       cleanValue(Tax_Type),
//       normalizeNumber(Tax_Amount),
//       normalizeNumber(Amount),
//       createdAt,
//     ]
//   );

//   // 4️⃣ Update stock (increase for purchases)
//   if (!isNewItem) {
//     await connection.query(
//       `UPDATE add_item 
//        SET Stock_Quantity = Stock_Quantity + ?, updated_at = NOW()
//        WHERE Item_Id = ?`,
//       [normalizeNumber(Quantity), Item_Id]
//     );
//   }
// }


//     await connection.commit();
//     return res.status(200).json({
//       success: true,
//       message: "Purchase updated successfully",
//       purchaseId,
//     });
//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error editing purchase:", err);
//     return res.status(500).json({ message: "Internal Server Error" });
//   } finally {
//     if (connection) connection.release();
//   }
// };
// const getSinglePurchase = async (req, res, next) => {
//   let connection;
//   try {
//     const { Purchase_Id: purchaseId } = req.params;

//     connection = await db.getConnection();

//     if (!purchaseId) {
//       return res.status(400).json({ success: false, message: "Purchase ID is required." });
//     }

//     // ✅ Fetch sale header (includes invoice + party info)
//     const [purchaseData] = await db.query(
//       `
//       SELECT 
//         pu.Purchase_Id,
//         pu.Bill_Number,
//         pu.Bill_Date,
//         pu.Reference_Number,
//         pu.State_Of_Supply,
//         pu.Payment_Type,
//         pu.Total_Amount,
//         pu.Total_Paid,
//         pu.Balance_Due,
//         pu.Party_Id,
//         p.Party_Name,
//         p.GSTIN,
//         p.Billing_Address,
//         p.Shipping_Address
//       FROM add_purchase pu
//       LEFT JOIN add_party p ON pu.Party_Id = p.Party_Id
//       WHERE pu.Purchase_Id = ?
//       `,
//       [purchaseId]
//     );

//     if (purchaseData.length === 0) {
//       return res.status(404).json({ success: false, message: "Sale not found." });
//     }

//     const purchaseHeader = purchaseData[0];

//     // ✅ Fetch all sale items related to that Sale_Id
//     const [items] = await db.query(
//       `
//       SELECT 
//         pi.Purchase_Items_Id,
//         pi.Material_Id,
//         m.name,
//         m.unit,
        
       
//         pi.Quantity,
//         pi.Purchase_Price,
//         pi.Discount_On_Purchase_Price,
//         pi.Discount_Type_On_Purchase_Price,
//         pi.Tax_Amount,
//         pi.Tax_Type,
//         pi.Amount,
//         pi.created_at
//       FROM add_purchase_items pi
//       LEFT JOIN add_material m ON pi.Material_Id = m.Material_Id
//       WHERE pi.Purchase_Id = ?
//       ORDER BY pi.created_at DESC
//       `,
//       [purchaseId]
//     );

//     if (items.length === 0) {
//       return res.status(404).json({ success: false, message: "No sale items found for this invoice." });
//     }

//     // ✅ Combine and send response
//     const response = {
//       success: true,
//       billPurchaseDetails: {
//         Purchase_Id: purchaseHeader.Purchase_Id,
//         Party_Name: purchaseHeader.Party_Name,
//         GSTIN: purchaseHeader.GSTIN,
//         State_Of_Supply: purchaseHeader.State_Of_Supply,
//         Payment_Type: purchaseHeader.Payment_Type,
//         Reference_Number: purchaseHeader.Reference_Number,
//         Bill_Number: purchaseHeader.Bill_Number,
//         Bill_Date: purchaseHeader.Bill_Date,
//         Payment_Type: purchaseHeader.Payment_Type,
//         Total_Amount: purchaseHeader.Total_Amount,
//         Total_Paid: purchaseHeader.Total_Paid,
//         Balance_Due: purchaseHeader.Balance_Due,
//         Billing_Address: purchaseHeader.Billing_Address,
//         Shipping_Address: purchaseHeader.Shipping_Address,
//       },
//       items: items.map((it) => ({
//         Purchase_Items_Id: it.Purchase_Items_Id,
//         Item_Id: it.Item_Id,
//         Item_Name: it.name,
       
//         Item_Unit: it.unit,
        
//         Quantity: it.Quantity,
//         Purchase_Price: it.Purchase_Price,
//         Discount_On_Purchase_Price: it.Discount_On_Purchase_Price,
//         Discount_Type_On_Purchase_Price: it.Discount_Type_On_Purchase_Price,
//         Tax_Amount: it.Tax_Amount,
//         Tax_Type: it.Tax_Type,
//         Amount: it.Amount,
//         created_at: it.created_at,
//       })),
//     };

//     return res.status(200).json(response);
//   } catch (err) {
//         if (connection) connection.release();
//     console.error("❌ Error getting single sale:", err);
//     next(err);
//   }finally {
//     if (connection) connection.release();
//   }
// };

// const getTotalPurchasesEachDay = async (req, res, next) => {
//   let connection;
//   try {
//     connection = await db.getConnection();

//     // ✅ Correct SQL: group by date, count total sales per day
//     const [rows] = await connection.query(
//       `
//       SELECT 
//         DATE_FORMAT(created_at, '%Y-%m-%d') AS purchase_date,
//         COUNT(*) AS total_purchases
//       FROM add_purchase
//       GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
//       ORDER BY purchase_date ASC;
//       `
//     );

//     // ✅ Format response
//     const result = rows.map((r) => ({
//       date: r.purchase_date,
//       total_purchases: r.total_purchases,
//     }));

//     return res.status(200).json({
//       success: true,
//       data: result,
//     });
//   } catch (err) {
//     if(connection) connection.release();
//     console.error("❌ Error getting total new sales by day:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
const getTotalPurchasesEachDay = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();

    // 1️⃣ Get active financial year
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

    // 2️⃣ Get purchase count per day inside financial year
    const [rows] = await connection.query(
      `
      SELECT 
        DATE_FORMAT(Bill_Date, '%Y-%m-%d') AS purchase_date,
        COUNT(*) AS total_purchases
      FROM add_purchase
      WHERE Financial_Year = ?
      GROUP BY DATE_FORMAT(Bill_Date, '%Y-%m-%d')
      ORDER BY purchase_date ASC;
      `,
      [activeFY]
    );

    // 3️⃣ Format output
    const result = rows.map((r) => ({
      date: r.purchase_date,
      total_purchases: r.total_purchases,
    }));

    return res.status(200).json({
      success: true,
      financialYear: activeFY,
      data: result,
    });
  } catch (err) {
    if (connection) connection.release();
    console.error("❌ Error getting total purchases each day:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

export  { addPurchase,editPurchase,getSinglePurchase,getAllPurchases,getTotalPurchasesEachDay };


