import db from "../config/db.js";

const addTable = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { Table_Name, Table_Capacity } = req.body;

    if (!Table_Name || !Table_Capacity) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Table_Name and Table_Capacity are required",
      });
    }

    // 1️⃣ Check if table name already exists
    const [exists] = await connection.query(
      "SELECT Table_Name FROM add_table WHERE Table_Name = ? LIMIT 1",
      [Table_Name]
    );

    if (exists.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Table name already exists.",
      });
    }

    // 2️⃣ Generate Table_Id
    const [lastTable] = await connection.query(
      "SELECT Table_Id FROM add_table ORDER BY id DESC LIMIT 1"
    );

    let newTableId = "TAB001";

    if (lastTable.length > 0) {
      const lastNum = parseInt(lastTable[0].Table_Id.replace("TAB", "")) + 1;
      newTableId = "TAB" + lastNum.toString().padStart(3, "0");
    }

    // 3️⃣ Insert Row
    const [result] = await connection.execute(
      `INSERT INTO add_table 
        (Table_Id, Table_Name, Table_Capacity, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [newTableId, Table_Name, Table_Capacity]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Table added successfully",
      tableId: newTableId,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error adding table:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  } finally {
    if (connection) connection.release();
  }
};



const getAllTables = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();

    const search = req.query.search ? req.query.search.trim().toLowerCase() : "";
    const page = req.query.page ? parseInt(req.query.page, 10) : null;

    let whereClause = "";
    let params = [];

    // 🔍 Search condition
    // if (search) {
    //   whereClause = "WHERE Table_Name OR Table_Capacity LIKE ?";
    //   params.push(`%${search}%`);
    // }
if (search) {
      whereClause = `
        WHERE LOWER(Table_Name) LIKE ?
           OR CAST(Table_Capacity AS CHAR) LIKE ?
      `;
      const like = `%${search}%`;
      params.push(like, like);
    }
    // =====================================================
    // CASE 1 : ❌ No page & ❌ No search -> Fetch ALL tables
    // =====================================================
    if (!page && !search) {
      const [rows] = await connection.query(
        `SELECT * FROM add_table ORDER BY created_at DESC`
      );

      return res.status(200).json({
        success: true,
        tables: rows,
        totalTables: rows.length,
       
      });
    }

    // =====================================================
    // CASE 2 : ❌ No page BUT ✔ search -> ALL filtered tables
    // =====================================================
    if (!page && search) {
      const [filteredRows] = await connection.query(
        `SELECT * FROM add_table ${whereClause} ORDER BY created_at DESC`,
        params
      );

      return res.status(200).json({
        success: true,
        tables: filteredRows,
        totalTables: filteredRows.length,
       
      });
    }

    // =====================================================
    // CASE 3 : ✔ page (WITH or WITHOUT search) -> PAGINATED
    // =====================================================
    const limit = 10;
    const offset = (page - 1) * limit;

    const [rows] = await connection.query(
      `
      SELECT *
      FROM add_table
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [countResult] = await connection.query(
      `
      SELECT COUNT(*) AS total 
      FROM add_table
      ${whereClause}
      `,
      params
    );

    const totalTables = countResult[0].total;
    const totalPages = Math.ceil(totalTables / limit);

    return res.status(200).json({
      success: true,
      tables: rows,
      currentPage: page,
      totalPages,
      totalTables,
      pageSize: limit,
     
    });

  } catch (err) {
    console.error("❌ Error getting all tables:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


const updateTable = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();

    const { Table_Id } = req.params;
    const {  Table_Name, Table_Capacity } = req.body;
    if(!Table_Id || !Table_Name || !Table_Capacity){
      return res.status(400).json({
        success: false,
        message: "Table Id, Table Name and Table Capacity are required",
      });
    }

    await connection.query(
      `UPDATE add_table SET Table_Name = ?, Table_Capacity = ?, updated_at = NOW() WHERE Table_Id = ?`,
      [Table_Name, Table_Capacity, Table_Id]
    );

    return res.status(200).json({
      success: true,
      message: "Table updated successfully",
    });
  } catch (err) {
    console.error("❌ Error updating table:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};



export {addTable,getAllTables,updateTable}