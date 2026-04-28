
import db from "../config/db.js";
// async function generateNextId(connection, prefix, column, table) {
//     const [rows] = await connection.query(
//         `SELECT ${column} FROM ${table} ORDER BY id DESC LIMIT 1 FOR UPDATE`
//     );

//     if (rows.length === 0) return prefix + "00001";

//     const lastId = rows[0][column];
//     const num = parseInt(lastId.replace(prefix, ""), 10) + 1;

//     return prefix + num.toString().padStart(5, "0");
// }
const addDailyExpense = async (req, res, next) => {
  let connection;

  try {
    const {
      Expense_Date,
      Category,
      Product_Description,
      Notes,
      Amount
    } = req.body;

    if (!Expense_Date ) {
      return res.status(400).json({
        success: false,
        message: "Expense date is required",
      });
    }
  if (Number(Amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }


    
     connection = await db.getConnection();
    await connection.beginTransaction(); // ✅ Start transaction

   
    // const Expense_Id = await generateNextId(
    //   connection,
    //   "EXP",
    //   "Expense_Id",
    //   "daily_expenses"
    // );

    const [result]=await connection.query(
      `
      INSERT INTO daily_expenses
      ( Expense_Date, Category,
       Product_Description, Notes, Amount, Created_By)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        
        Expense_Date,
        Category,
        Product_Description,
        Notes || null,
        Amount,
        req.user?.User_Id || null,
      ]
    );
    const Expense_Id= result.insertId;
    const ExpenseNum = "EXP" + Expense_Id.toString().padStart(5, "0");
    await connection.query(
      `UPDATE daily_expenses SET Expense_Id = ? WHERE id = ?`,
      [ExpenseNum, Expense_Id]
    );
        await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Expense added successfully",
    });

  } catch (err) {
    console.error("❌ Add Expense Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


const getAllDailyExpenseCategories= async (req, res, next) => {
    let connection;
    try{

    connection = await db.getConnection();

    const [rows] = await connection.query(`SELECT DISTINCT Category FROM daily_expenses`);
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
const getMonthlyWeeklyExpenses = async (req, res, next) => {
  let connection;

  try {
    const { month, year, search = "" } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and Year are required",
      });
    }

    const paddedMonth = String(month).padStart(2, "0");
    const startDate = `${year}-${paddedMonth}-01`;
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const endDate = `${year}-${paddedMonth}-${lastDayOfMonth}`;

    connection = await db.getConnection();

    const [rows] = await connection.query(
      `
      SELECT 
        Expense_Id,
        Expense_Date,
        Category,
        Product_Description,
        Notes,
        Amount,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS Created_At,

        FLOOR((DAY(Expense_Date) - 1) / 7) + 1 AS Week_Number
      FROM daily_expenses
      WHERE Expense_Date BETWEEN ? AND ?
        AND LOWER(Category) LIKE ?
      ORDER BY Expense_Date ASC
      `,
      [startDate, endDate, `%${search.toLowerCase()}%`]
    );

    const weeklyMap = {};
    let monthlyTotal = 0;

   rows.forEach((row) => {
  const weekNumber = row.Week_Number;

  const weekStartDay = (weekNumber - 1) * 7 + 1;
  const weekEndDay = Math.min(weekStartDay + 6, lastDayOfMonth);

  const weekStart = `${String(weekStartDay).padStart(2, "0")}`;
  const weekEnd = `${String(weekEndDay).padStart(2, "0")}`;

  const monthName = new Date(year, month - 1).toLocaleString("default", {
    month: "short",
  });

  const weekLabel = `Week ${weekNumber} (${weekStart} ${monthName} - ${weekEnd} ${monthName})`;

  if (!weeklyMap[weekNumber]) {
    weeklyMap[weekNumber] = {
      weekNumber,
      weekLabel,
      total: 0,
      expenses: [],
    };
  }

  weeklyMap[weekNumber].expenses.push(row);
  weeklyMap[weekNumber].total += Number(row.Amount);
  monthlyTotal += Number(row.Amount);
});


    const weeklyData = Object.values(weeklyMap);

    return res.status(200).json({
      success: true,
      monthlyTotal,
      data: weeklyData,
    });

  } catch (err) {
    console.error("❌ Get Weekly Expense Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};


export { addDailyExpense,getAllDailyExpenseCategories, getMonthlyWeeklyExpenses };