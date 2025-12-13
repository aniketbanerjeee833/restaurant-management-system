import express from "express";
import { getKitchenOrders, updateKitchenItemStatus } from "../../controllers/KitchenStaff/KitchenStaffContoller.js";
import userAuth from "../../middleware/userAuth.js";
import kitchenStaffAuth from "../../middleware/kitchenStaffAuth.js";


const router = express.Router();

// GET all kitchen orders
router.get("/orders",userAuth ,kitchenStaffAuth,   getKitchenOrders);

router.patch("/update-item-status/:KOT_Id/:KOT_Item_Id", updateKitchenItemStatus);

export default router;
