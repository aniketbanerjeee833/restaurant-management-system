import express from "express";

import userAuth from "../middleware/userAuth.js";
import { getAllStaffs } from "../controllers/staffController.js";
import adminAuth from "../middleware/adminAuth.js";
const router = express.Router();

router.get("/get-all-staffs/:adminId",userAuth,adminAuth,getAllStaffs)
export default router;