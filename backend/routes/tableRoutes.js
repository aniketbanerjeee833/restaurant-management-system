import express from "express";

import userAuth from "../middleware/userAuth.js";
import { addTable, getAllTables } from "../controllers/tableController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/add-table",userAuth,adminAuth,addTable)
router.get("/get-all-tables",userAuth,getAllTables)
export default router;