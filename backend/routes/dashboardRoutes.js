
import express from "express";
const router = express.Router();

import { eachItemHistory, getAllSalesAndPurchasesYearWise,
     getCategoriesWiseItemCount, getItemsSoldCount, 
     
     getItemsSoldDateRangeReport, 
     
     getItemsSoldEachDayReport, 
     getPartyWiseItemsSoldAndPurchased, getPartyWiseSalesAndPurchases,
      getTotalSalesPurchasesReceivablesPayablesProfit  } 
      from "../controllers/dashboardController.js"
import userAuth from "../middleware/userAuth.js";
router.get("/total-sales-purchases-receivables-payables-profit", userAuth,getTotalSalesPurchasesReceivablesPayablesProfit);
router.get("/sales-purchases-profit", userAuth,getAllSalesAndPurchasesYearWise);
router.get("/categories-wise-item-count",userAuth, getCategoriesWiseItemCount);
router.get("/party-wise-sales-purchases",userAuth, getPartyWiseSalesAndPurchases);
router.get("/each-item-history",userAuth,eachItemHistory);
router.get("/each-item-sold-count",userAuth,getItemsSoldCount);
router.get("/each-party-items-sold-purchased",userAuth,getPartyWiseItemsSoldAndPurchased);

router.get("/items-sold-each-day",userAuth,getItemsSoldEachDayReport);

router.get("/items-sold-date-range-report",userAuth,getItemsSoldDateRangeReport)
export default router;