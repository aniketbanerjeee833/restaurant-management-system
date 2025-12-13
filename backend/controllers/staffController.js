import db from "../config/db.js";

const getAllStaffs = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();

    // Params
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = 10; // page size
    const offset = (page - 1) * limit;

    const search = req.query.search ? req.query.search.trim().toLowerCase() : "";

    const { adminId: User_Id } = req.params;

    // 1️⃣ Validate user exists
    const [users] = await connection.query(
      `SELECT * FROM users WHERE User_Id = ?`,
      [User_Id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Only admin can fetch staff
    if (users[0].role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 3️⃣ Build search SQL
    let whereClause = `WHERE role = 'staff' OR role = 'kitchen-staff'`;

    if (search) {
      whereClause += ` AND (
          LOWER(name) LIKE ? OR 
          LOWER(email) LIKE ? OR
          LOWER(phone) LIKE ? 
      )`;
    }

    const searchQuery = [`%${search}%`, `%${search}%`, `%${search}%`];

    // 4️⃣ Get paginated users
    const [staffRows] = await connection.query(
      `
      SELECT *
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
      `,
      search ? [...searchQuery, limit, offset] : [limit, offset]
    );

    // 5️⃣ Get total count for pagination
    const [totalResult] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM users
      ${whereClause}
      `,
      search ? searchQuery : []
    );

    const totalItems = totalResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // 6️⃣ Final response
    return res.status(200).json({
      success: true,
      staffs: staffRows,
      currentPage: page,
      totalPages,
      totalItems,
      pageSize: limit,
    });

  } catch (err) {
    if (connection) connection.release();
    console.error("❌ Error getting all staffs:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


export { getAllStaffs }