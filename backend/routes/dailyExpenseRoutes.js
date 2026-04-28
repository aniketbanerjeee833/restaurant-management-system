import express from "express";
const router = express.Router();

import userAuth from "../middleware/userAuth.js";
import { addDailyExpense, getAllDailyExpenseCategories, getMonthlyWeeklyExpenses } from "../controllers/dailyExpenseController.js";


router.post("/add-daily-expense",userAuth,addDailyExpense)
router.get("/get-all-daily-expense-categories",userAuth,getAllDailyExpenseCategories)
router.get("/get-monthly-weekly-expenses",userAuth,getMonthlyWeeklyExpenses)

export default router;