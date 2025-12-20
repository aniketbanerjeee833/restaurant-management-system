import db from "../config/db.js";

// const getAllStaffs = async (req, res, next) => {
//   let connection;
//   try {
//     connection = await db.getConnection();

//     // Params
//     const page = req.query.page ? parseInt(req.query.page, 10) : 1;
//     const limit = 10; // page size
//     const offset = (page - 1) * limit;

//     const search = req.query.search ? req.query.search.trim().toLowerCase() : "";

//     const { adminId: User_Id } = req.params;

//     // 1️⃣ Validate user exists
//     const [users] = await connection.query(
//       `SELECT * FROM users WHERE User_Id = ?`,
//       [User_Id]
//     );

//     if (users.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // 2️⃣ Only admin can fetch staff
//     if (users[0].role !== "admin") {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     // 3️⃣ Build search SQL
//     let whereClause = `WHERE role = 'staff' OR role = 'kitchen-staff'`;

//     if (search) {
//       whereClause += ` AND (
//           LOWER(name) LIKE ? OR 
//           LOWER(email) LIKE ? OR
//           LOWER(phone) LIKE ? 
//       )`;
//     }

//     const searchQuery = [`%${search}%`, `%${search}%`, `%${search}%`];

//     // 4️⃣ Get paginated users
//     const [staffRows] = await connection.query(
//       `
//       SELECT *
//       FROM users
//       ${whereClause}
//       ORDER BY created_at DESC
//       LIMIT ? OFFSET ?
//       `,
//       search ? [...searchQuery, limit, offset] : [limit, offset]
//     );

//     // 5️⃣ Get total count for pagination
//     const [totalResult] = await connection.query(
//       `
//       SELECT COUNT(*) AS total
//       FROM users
//       ${whereClause}
//       `,
//       search ? searchQuery : []
//     );

//     const totalItems = totalResult[0].total;
//     const totalPages = Math.ceil(totalItems / limit);

//     // 6️⃣ Final response
//     return res.status(200).json({
//       success: true,
//       staffs: staffRows,
//       currentPage: page,
//       totalPages,
//       totalItems,
//       pageSize: limit,
//     });

//   } catch (err) {
//     if (connection) connection.release();
//     console.error("❌ Error getting all staffs:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
const getAllStaffs = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim().toLowerCase() : "";

    const { adminId: User_Id } = req.params;

    // 1️⃣ Validate admin
    const [adminRows] = await connection.query(
      `SELECT role FROM users WHERE User_Id = ?`,
      [User_Id]
    );

    if (adminRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (adminRows[0].role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 2️⃣ Build WHERE clause
    let whereClause = `WHERE (role = 'staff' OR role = 'kitchen-staff')`;
    let params = [];

    if (search) {
      whereClause += `
        AND (
          LOWER(name) LIKE ? OR
          LOWER(email) LIKE ? OR
          LOWER(phone) LIKE ?
        )
      `;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // 3️⃣ Fetch staff
    const [staffRows] = await connection.query(
      `
      SELECT *
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    // 4️⃣ Attach categories ONLY for kitchen-staff
    for (let staff of staffRows) {
      if (staff.role === "kitchen-staff") {
        const [categories] = await connection.query(
          `SELECT Category_Names FROM kitchen_staff_categories WHERE User_Id = ?`,
          [staff.User_Id]
        );

        staff.categories = categories.map(c => c.Category_Names);
      } else {
        staff.categories = [];
      }
    }

    // 5️⃣ Count total
    const [countResult] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM users
      ${whereClause}
      `,
      params
    );

    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      staffs: staffRows,
      currentPage: page,
      totalPages,
      totalItems,
      pageSize: limit,
    });

  } catch (err) {
    console.error("❌ Error getting all staffs:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

const availableCategoriesForKitchenStaffs = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(`
      SELECT c.*
      FROM add_category c
      LEFT JOIN kitchen_staff_categories ksc
        ON ksc.Category_Names = c.Item_Category
      WHERE ksc.Category_Names IS NULL
    `);

    return res.status(200).json({
      success: true,
      availableCategories: rows,
    });

  } catch (err) {
    console.error("❌ Error getting available kitchen categories:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

// const editStaff = async (req, res, next) => {
//   let connection;

//   try {
//     connection = await db.getConnection();

//     const {
//       User_Id,
//       name,
//       email,
//       phone,
//       username,
//       city,
//       address,
//       pincode,
//       role,
//       categories = [],
//     } = req.body;

//     if (!User_Id) {
//       return res.status(400).json({
//         success: false,
//         message: "User_Id is required",
//       });
//     }

//     // ------------------------------------------------
//     // 1️⃣ Update USER basic details
//     // ------------------------------------------------
//     await connection.query(
//       `
//       UPDATE users SET
//         name = ?,
//         email = ?,
//         phone = ?,
//         username = ?,
//         city = ?,
//         address = ?,
//         pincode = ?,
//         role = ?
//       WHERE User_Id = ?
//       `,
//       [
//         name,
//         email,
//         phone,
//         username,
//         city,
//         address,
//         pincode,
//         role,
//         User_Id,
//       ]
//     );

//     // ------------------------------------------------
//     // 2️⃣ Handle Kitchen Staff Categories
//     // ------------------------------------------------
//     if (role === "kitchen-staff") {
//       if (!categories.length) {
//         return res.status(400).json({
//           success: false,
//           message: "At least one category is required for kitchen staff",
//         });
//       }

//       // 🔍 Check if any category is already assigned to OTHER staff
//       const [existing] = await connection.query(
//         `
//         SELECT Category_Names, User_Id
//         FROM kitchen_staff_categories
//         WHERE Category_Names IN (?)
//           AND User_Id != ?
//         `,
//         [categories, User_Id]
//       );

//       if (existing.length > 0) {
//         return res.status(400).json({
//           success: false,
//           message: `Category already assigned: ${existing
//             .map((e) => e.Category_Names)
//             .join(", ")}`,
//         });
//       }

//       // 🧹 Remove old categories of this staff
//       await connection.query(
//         `DELETE FROM kitchen_staff_categories WHERE User_Id = ?`,
//         [User_Id]
//       );

//       // ➕ Insert new categories
//       for (const cat of categories) {
//         await connection.query(
//           `
//           INSERT INTO kitchen_staff_categories (User_Id, Category_Names)
//           VALUES (?, ?)
//           `,
//           [User_Id, cat]
//         );
//       }
//     } else {
//       // 🚫 If role changed from kitchen-staff → remove categories
//       await connection.query(
//         `DELETE FROM kitchen_staff_categories WHERE User_Id = ?`,
//         [User_Id]
//       );
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Staff updated successfully",
//     });

//   } catch (err) {
//     console.error("❌ Error editing staff:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
 const editStaff = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const {
      User_Id,
      name,
      email,
      phone,
      username,
      city,
      address,
      pincode,
      role,
      categories = [],
    } = req.body;

    if (!User_Id) {
      return res.status(400).json({
        success: false,
        message: "User_Id is required",
      });
    }

    /* ------------------------------------------------
       1️⃣ UPDATE USER BASIC DETAILS
    ------------------------------------------------ */
    await connection.query(
      `
      UPDATE users SET
        name = ?,
        email = ?,
        phone = ?,
        username = ?,
        city = ?,
        address = ?,
        pincode = ?,
        role = ?
      WHERE User_Id = ?
      `,
      [
        name,
        email,
        phone,
        username,
        city,
        address,
        pincode,
        role,
        User_Id,
      ]
    );

    /* ------------------------------------------------
       2️⃣ HANDLE KITCHEN STAFF CATEGORIES
    ------------------------------------------------ */
    // if (role === "kitchen-staff") {
    //   if (!Array.isArray(categories) || categories.length === 0) {
    //     await connection.rollback();
    //     return res.status(400).json({
    //       success: false,
    //       message: "At least one category is required for kitchen staff",
    //     });
    //   }

    //   // 🔍 Check category already assigned to OTHER staff
    //   const [existing] = await connection.query(
    //     `
    //     SELECT Category_Names, User_Id
    //     FROM kitchen_staff_categories
    //     WHERE Category_Names IN (?)
    //       AND User_Id != ?
    //     `,
    //     [categories, User_Id]
    //   );

    //   if (existing.length > 0) {
    //     await connection.rollback();
    //     return res.status(400).json({
    //       success: false,
    //       message: `Category already assigned: ${existing
    //         .map((e) => e.Category_Names)
    //         .join(", ")}`,
    //     });
    //   }

    //   // 🧹 Remove old categories of this staff
    //   await connection.query(
    //     `DELETE FROM kitchen_staff_categories WHERE User_Id = ?`,
    //     [User_Id]
    //   );

    //   // ➕ Insert new categories (BULK INSERT)
    //   const values = categories.map((cat) => [User_Id, cat]);

    //   await connection.query(
    //     `
    //     INSERT INTO kitchen_staff_categories (User_Id, Category_Names)
    //     VALUES ?
    //     `,
    //     [values]
    //   );
    // } else {
    //   // 🚫 If role is NOT kitchen-staff → remove categories
    //   await connection.query(
    //     `DELETE FROM kitchen_staff_categories WHERE User_Id = ?`,
    //     [User_Id]
    //   );
    // }
    if (role === "kitchen-staff") {

  if (!Array.isArray(categories) || categories.length === 0) {
    await connection.rollback();
    return res.status(400).json({
      success: false,
      message: "At least one category is required",
    });
  }

  // 🔍 Check if categories assigned to OTHER staff
  const [existing] = await connection.query(
    `
    SELECT User_Id, Category_Names
    FROM kitchen_staff_categories
    WHERE FIND_IN_SET(?, Category_Names)
      AND User_Id != ?
    `,
    [categories[0], User_Id] // lightweight check
  );

  if (existing.length) {
    await connection.rollback();
    return res.status(400).json({
      success: false,
      message: "Category already assigned to another staff",
    });
  }

  // 🔄 UPDATE EXISTING ROW
  const [row] = await connection.query(
    `SELECT id FROM kitchen_staff_categories WHERE User_Id = ?`,
    [User_Id]
  );

  if (row.length) {
    // UPDATE
    await connection.query(
      `
      UPDATE kitchen_staff_categories
      SET Category_Names = ?, updated_at = NOW()
      WHERE User_Id = ?
      `,
      [categories.join(","), User_Id]
    );
  } else {
    // INSERT (edge case)
    const [lastRow] = await connection.query(
      `SELECT Staff_Category_Id FROM kitchen_staff_categories ORDER BY id DESC LIMIT 1`
    );

    let nextNum = 1;
    if (lastRow.length) {
      nextNum =
        parseInt(lastRow[0].Staff_Category_Id.replace("KSC", ""), 10) + 1;
    }

    const staffCategoryId = "KSC" + String(nextNum).padStart(5, "0");

    await connection.query(
      `
      INSERT INTO kitchen_staff_categories
      (Staff_Category_Id, User_Id, Category_Names, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
      `,
      [staffCategoryId, User_Id, categories.join(",")]
    );
  }

} else {
  // 🚫 Role changed → remove mapping
  await connection.query(
    `DELETE FROM kitchen_staff_categories WHERE User_Id = ?`,
    [User_Id]
  );
}


    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Staff updated successfully",
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error editing staff:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


export { getAllStaffs,editStaff, availableCategoriesForKitchenStaffs };