import express from "express";

import userAuth from "../middleware/userAuth.js";
import { availableCategoriesForKitchenStaffs, editStaff, getAllStaffs } from "../controllers/staffController.js";
import adminAuth from "../middleware/adminAuth.js";
const router = express.Router();

router.get("/get-all-staffs/:adminId",userAuth,adminAuth,getAllStaffs)

router.get("/available-categories-for-kitchen-staffs",userAuth,adminAuth,availableCategoriesForKitchenStaffs)
router.patch("/update-staff",userAuth,adminAuth,editStaff)

export default router;