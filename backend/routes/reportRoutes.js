import express from "express";
import { getItemsSoldDailyCategoryWiseAnalysis, 
    
    getKitchenWiseReportAnalysis, getSalesNewSalesPurchasesEachDay, getSalesNewSalesPurchasesInDateRange, 
    getTotalSalesDineInTakeawayDailyAnalysis, 
    getTotalSalesDineInTakeawayMonthlyAnalysis, 
    getTotalSalesDineInTakeawayWeeklyAnalysis, 
    getTotalSalesDineInTakeawayYearlyAnalysis, 
    printDailyReport } from "../controllers/reportsController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.get("/get-sales-new-sales-purchases-each-day",userAuth, getSalesNewSalesPurchasesEachDay);
router.get("/get-sales-new-sales-purchases-in-date-range",userAuth, getSalesNewSalesPurchasesInDateRange);
router.post("/print-daily-report",userAuth,printDailyReport)

//SALES DINE-IN TAKEAWAY ROUTES
router.get("/get-total-sales-dine-in-takeaway-daily-analysis",userAuth,
    getTotalSalesDineInTakeawayDailyAnalysis)

    router.get("/get-total-sales-dine-in-takeaway-weekly-analysis",userAuth,getTotalSalesDineInTakeawayWeeklyAnalysis)
    router.get("/get-total-sales-dine-in-takeaway-monthly-analysis",userAuth,getTotalSalesDineInTakeawayMonthlyAnalysis)
    router.get("/get-total-sales-dine-in-takeaway-yearly-analysis",userAuth,getTotalSalesDineInTakeawayYearlyAnalysis)
    router.get("/get-items-sold-daily-category-wise-analysis",userAuth, getItemsSoldDailyCategoryWiseAnalysis)

    router.get("/get-kitchen-wise-report",userAuth,getKitchenWiseReportAnalysis)
    export default router;