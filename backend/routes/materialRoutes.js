import express from "express";


const router = express.Router();

import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js";
import {  addMaterial, addReleaseMaterials, editSingleMaterial, getAllMaterials } from "../controllers/materialContoller.js";

router.post("/add-material",userAuth, adminAuth, addMaterial);

router.get("/get-all-materials",userAuth,adminAuth, getAllMaterials);

router.patch("/edit-material/:Material_Id",userAuth,adminAuth, editSingleMaterial);

router.post("/release-material",userAuth,adminAuth, addReleaseMaterials);

export default router;