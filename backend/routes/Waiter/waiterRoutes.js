import express from "express";
import { getOrdersByWaiter } from "../../controllers/Waiter/waiterController.js";
import userAuth from "../../middleware/userAuth.js";
const router = express.Router();



router.get("/waiter-orders", userAuth, getOrdersByWaiter);



export default router;