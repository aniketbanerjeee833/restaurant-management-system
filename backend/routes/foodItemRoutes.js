import express from "express";
import { addFoodItem, editSingleFoodItem, getAllFoodItems } from "../controllers/foodItemController.js";
import { foodUpload } from "../utils/multer_food_item.js";

const router = express.Router();

import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js";
// Upload array of images, field name must match UI: "Item_Image"
router.post("/add-food-item",userAuth, adminAuth, foodUpload.array("images"), addFoodItem);

router.get("/all-food-items",userAuth, getAllFoodItems);

router.patch(
  "/edit-food-item/:Item_Id",
  userAuth,
  adminAuth,
  foodUpload.single("Item_Image"),   // 👈 NEW: single file input
  editSingleFoodItem
);


export default router;