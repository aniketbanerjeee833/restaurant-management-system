import express from "express";
import { getSalesNewSalesPurchasesEachDay, getSalesNewSalesPurchasesInDateRange, printDailyReport } from "../controllers/reportsController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.get("/get-sales-new-sales-purchases-each-day",userAuth, getSalesNewSalesPurchasesEachDay);
router.get("/get-sales-new-sales-purchases-in-date-range",userAuth, getSalesNewSalesPurchasesInDateRange);
router.post("/print-daily-report",userAuth,printDailyReport)
export default router;