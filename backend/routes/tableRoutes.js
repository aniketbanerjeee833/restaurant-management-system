import express from "express";

import userAuth from "../middleware/userAuth.js";
import { addTable, getAllTables, getAllTablesForPreBooking, updateTable } from "../controllers/tableController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/add-table",userAuth,adminAuth,addTable)
router.get("/get-all-tables",userAuth,getAllTables)
router.get("/get-all-tables-for-prebooking",userAuth,getAllTablesForPreBooking)
router.patch("/update-table/:Table_Id",userAuth,adminAuth,updateTable)
export default router;