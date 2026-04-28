import express from "express";
import { addFoodItem, addOrUpdateDailyFoodItemStock,  editDailyFoodStock, editSingleFoodItem,      
  getAllCategoriesAndFoodItemsToBeShownOnMenu,      
   
  getAllFoodItems,  getDailyFoodItemsStock, getEachFoodItemsStockReport, getFoodItemStockHistoryByDate,
   removeDailyFoodStock, setDailyFoodItemStockZero, softDeleteFoodItem,
    toggleCategoryAvailabilityToBeShownOnMenu, toggleFoodItemAvailability, 
  updateFoodItemCategory} from "../controllers/foodItemController.js";
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

router.patch("/toggle-food-item-status/:Item_Id",userAuth,  toggleFoodItemAvailability);
router.patch("/soft-delete-food-item/:Item_Id",userAuth,  softDeleteFoodItem);
router.get("/all-categories-for-menu",  getAllCategoriesAndFoodItemsToBeShownOnMenu);
router.patch("/category-visibility-on-menu/:id",userAuth, adminAuth,  
  toggleCategoryAvailabilityToBeShownOnMenu);

  router.patch("/update-food-item-category/:Category_Id",userAuth, adminAuth, updateFoodItemCategory)
  router.put("/add-or-update-daily-food-item-stock",userAuth,addOrUpdateDailyFoodItemStock)
  router.get("/daily-food-items-stock",userAuth,getDailyFoodItemsStock)
  router.patch("/set-daily-food-items-stock-zero/:Item_Id",userAuth,adminAuth,setDailyFoodItemStockZero)
  router.get("/stock-history-by-date",userAuth,getFoodItemStockHistoryByDate);
  router.patch("/edit-daily-food-stock",userAuth,adminAuth,editDailyFoodStock);
  router.patch("/remove-daily-food-stock",userAuth,adminAuth,removeDailyFoodStock);

  router.get("/all-food-items-stock-report/:Item_Id",userAuth,getEachFoodItemsStockReport)
// router.post("/generate-image-from-text",userAuth,generateImageFromText)
export default router;