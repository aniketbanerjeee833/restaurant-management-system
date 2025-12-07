import express from "express";
const router = express.Router();

import { addOrder, confirmOrderBillPaidAndInvoiceGenerated, getAllInvoicesAndOrdersEachDay, 
   
    getAllInvoicesOfOrdersAndTakeawaysInDateRange, 
   
    getTableOrderDetails, getTablesHavingOrders, takeawayAddOrdersAndGenerateInvoices, totalInvoicesEachDay, updateOrder } from "../../controllers/staff/orderItemController.js";
import userAuth from "../../middleware/userAuth.js";
import adminAuth from "../../middleware/adminAuth.js";



router.post("/add-order",userAuth,addOrder)
router.get("/get-tables-having-orders",userAuth,getTablesHavingOrders)

router.get("/get-table-order-details/:Order_Id",userAuth,getTableOrderDetails)
router.patch("/update-order/:Order_Id",userAuth,updateOrder)
router.post("/confirm-bill/:Order_Id",userAuth,
    confirmOrderBillPaidAndInvoiceGenerated);

    router.get("/get-all-invoices-orders-each-day",userAuth,adminAuth,getAllInvoicesAndOrdersEachDay)
     router.get("/get-all-invoices-orders-takeaways-in-date-range",userAuth,adminAuth,getAllInvoicesOfOrdersAndTakeawaysInDateRange)
    router.get("/total-invoices-orders-each-day",userAuth,adminAuth,
        totalInvoicesEachDay)

        router.post("/takeaway-add-orders-and-generate-invoices",userAuth,
            takeawayAddOrdersAndGenerateInvoices);
export default router;