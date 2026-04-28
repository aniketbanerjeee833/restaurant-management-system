

export const ensureDailyStockForDate = async (connection, targetDate) => {
  /* 1️⃣ Check if stock already exists for date */
  const [[existsRow]] = await connection.query(
    `
    SELECT 1
    FROM daily_food_stock
    WHERE Stock_Date = ?
    LIMIT 1
    `,
    [targetDate]
  );

  if (existsRow) {
    return; // ✅ already exists, nothing to do
  }

  /* 2️⃣ Get last available stock date */
  const [[lastDateRow]] = await connection.query(
    `
    SELECT MAX(Stock_Date) AS lastDate
    FROM daily_food_stock
    WHERE Stock_Date < ?
    `,
    [targetDate]
  );

  if (!lastDateRow?.lastDate) {
    console.log("⚠️ No previous stock to carry forward");
    return;
  }

  const lastDate = lastDateRow.lastDate;

  /* 3️⃣ Get last day's closing stock */
  const [lastStocks] = await connection.query(
    `
    SELECT Item_Id, Closing_Quantity
    FROM daily_food_stock
    WHERE Stock_Date = ?
    `,
    [lastDate]
  );

  if (!lastStocks.length) return;

  /* 4️⃣ Insert carry-forward rows */
  for (const row of lastStocks) {
    await connection.query(
      `
      INSERT INTO daily_food_stock
        (Item_Id, Stock_Date,
         Opening_Quantity, Added_Quantity,
         Sold_Quantity, Closing_Quantity)
      VALUES (?, ?, ?, 0, 0, ?)
      `,
      [
        row.Item_Id,
        targetDate,
        row.Closing_Quantity || 0,
        row.Closing_Quantity || 0,
      ]
    );
  }

  console.log(`🔁 Stock carried forward for ${targetDate}`);
};