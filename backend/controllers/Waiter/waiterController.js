import db from "../../config/db.js";

const getOrdersByWaiter = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    // ✅ get waiter id from JWT
    const Waiter_Id = req.user.User_Id;

    const [dineinOrders] = await connection.query(
      `SELECT 
        o.Order_Id,
        o.User_Id,
        o.Status,
        o.Sub_Total,
        o.Discount,
        o.Amount,
        o.Payment_Status,
        t.Table_Id,
        t.Table_Name,
        t.Start_Time AS Table_Start_Time
      FROM orders o
      JOIN order_tables ot ON o.Order_Id = ot.Order_Id
      JOIN add_table t ON t.Table_Id = ot.Table_Id
      WHERE o.Status = 'hold'
        AND o.User_Id = ?`,
      [Waiter_Id]
    );

    const dineinFormatted = dineinOrders.map(o => ({
      ...o,
      orderType: "dinein",
    }));

    return res.status(200).json({
      success: true,
      waiterOrders: dineinFormatted,
    });

  } catch (err) {
    console.error("❌ Error getting waiter orders:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

export { getOrdersByWaiter };
