import express from "express";
import {  addSale, editSale, getAllSales, 
     getSingleSale, printSaleBill,getTotalSalesEachDay} from "../controllers/saleController.js";
import userAuth from "../middleware/userAuth.js";
const router = express.Router();



router.post("/add-sale",userAuth,addSale)

router.get("/get-all-sales",userAuth,getAllSales)

router.get("/get-single-sale/:Sale_Id",userAuth,getSingleSale)




router.post("/print-sale-invoice",userAuth,printSaleBill)
router.put("/edit-sale/:Sale_Id",userAuth,editSale)



router.get("/total-sales-by-day",userAuth,getTotalSalesEachDay)

export default router;