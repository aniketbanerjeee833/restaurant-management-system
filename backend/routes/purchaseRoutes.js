import express from "express";
const router = express.Router();


import { addPurchase, editPurchase, getAllPurchases, getSinglePurchase, getTotalPurchasesEachDay } from "../controllers/purchaseController.js";
import userAuth from "../middleware/userAuth.js";
router.post("/add-purchase",userAuth,addPurchase)
router.get("/get-single-purchase/:Purchase_Id",userAuth,getSinglePurchase)
router.get("/get-all-purchases",userAuth,getAllPurchases)
router.get("/total-purchases-by-day",userAuth,getTotalPurchasesEachDay)
router.put("/edit-purchase/:Purchase_Id",userAuth,editPurchase)
export default router;