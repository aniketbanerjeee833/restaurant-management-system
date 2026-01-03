import express from "express";
const router = express.Router();

import { addNewCustomer, addOrder, cancelTakeawayOrder, completeTakeawayOrder, confirmOrderBillPaidAndInvoiceGenerated, confirmTakeawayOrderBillPaidAndInvoiceGenerated, getAllCustomers, getAllInvoicesAndOrdersEachDay, 
   
    getAllInvoicesOfOrdersAndTakeawaysInDateRange, 
   
    getTableOrderDetails, getTablesHavingOrders, 
    getTakeawayOrderDetails, 
    nextInvoiceNumber,  takeawayAddOrdersAndGenerateInvoices, totalInvoicesEachDay, updateOrder, 
    updateTakeawayOrder} 
    from "../../controllers/staff/orderItemController.js";
import userAuth from "../../middleware/userAuth.js";
import { generateSms, generateSmsForTakeaway, getPublicInvoiceHtml } from "../../controllers/smsController.js";




router.put("/add-new-customer",userAuth,addNewCustomer)
router.get("/all-customers",userAuth,getAllCustomers)
router.post("/add-order",userAuth,addOrder)
router.get("/get-tables-having-orders",userAuth,getTablesHavingOrders)

router.get("/get-table-order-details/:Order_Id",userAuth,getTableOrderDetails)

router.get("/get-takeaway-order-details/:Takeaway_Order_Id",userAuth,getTakeawayOrderDetails)

router.patch("/update-order/:Order_Id",userAuth,updateOrder)

router.patch("/update-takeaway-order/:Takeaway_Order_Id",userAuth,updateTakeawayOrder)
router.post("/confirm-bill/:Order_Id",userAuth,
    confirmOrderBillPaidAndInvoiceGenerated);

router.post("/confirm-takeaway-bill/:Takeaway_Order_Id",userAuth,
    confirmTakeawayOrderBillPaidAndInvoiceGenerated);
    
    router.get("/get-all-invoices-orders-each-day",userAuth,getAllInvoicesAndOrdersEachDay)
     router.get("/get-all-invoices-orders-takeaways-in-date-range",userAuth,getAllInvoicesOfOrdersAndTakeawaysInDateRange)
    router.get("/total-invoices-orders-each-day",userAuth,
        totalInvoicesEachDay)

        router.post("/takeaway-add-orders-and-generate-invoices",userAuth,
            takeawayAddOrdersAndGenerateInvoices);

            router.get("/next-invoice-number",userAuth,
            nextInvoiceNumber);


            router.post("/generate-sms/:Order_Id",userAuth,generateSms)
            router.post("/generate-sms-for-takeaway",userAuth,generateSmsForTakeaway)

            router.get("/:Invoice_Id", getPublicInvoiceHtml);

            router.patch(
  "/cancel-takeaway-order/:Takeaway_Order_Id",
  userAuth,
  cancelTakeawayOrder
);
            router.patch(
  "/complete-takeaway-order/:Takeaway_Order_Id",
  userAuth,
  completeTakeawayOrder
);


// router.post("/print-thermal-invoice",userAuth, printThermalInvoice);

export default router;