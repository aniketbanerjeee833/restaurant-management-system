import express from "express";
const router = express.Router();

import { addNewCustomer, addOrder,  cancelTakeawayOrder, checkItemElligibleForKOTPrint, completeTakeawayOrder, confirmOrderBillPaidAndInvoiceGenerated, confirmTakeawayOrderBillPaidAndInvoiceGenerated, getAllCustomers, getAllInvoicesAndOrdersEachDay, 
   
    getAllInvoicesOfOrdersAndTakeawaysInDateRange, 
   
     
   
    getTableOrderDetails, getTablesHavingOrders, 
    getTakeawayOrderDetails, 
    nextInvoiceNumber,  takeawayAddOrdersAndGenerateInvoices, totalInvoicesEachDay, updateOrder, 
    updateTakeawayOrder,addPreBookOrder,getAllPreBookingOrders,
    confirmPreOrderBillPaidAndInvoiceGenerated,
    getPreBookOrderDetails,
    updatePreBookOrder,
    updateTakeawayAndDineInDeliveryStatus,
    getPreBookOrderItemsForKOT,
    deleteInvoice,
   
    updateAndPrintPreBookKOT,
    KOTOfOrdersTakenByWaiter} 
    from "../../controllers/staff/orderItemController.js";
import userAuth from "../../middleware/userAuth.js";
import { generateSms, generateSmsForTakeaway, getPublicInvoiceHtml, generateSmsForPreBooked } from "../../controllers/smsController.js";
import adminAuth from "../../middleware/adminAuth.js";




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
router.patch("/update-takeaway-and-dine-in-delivery-status",userAuth,updateTakeawayAndDineInDeliveryStatus)

router.post("/confirm-takeaway-bill/:Takeaway_Order_Id",userAuth,
    confirmTakeawayOrderBillPaidAndInvoiceGenerated);
    
    router.get("/get-all-invoices-orders-each-day",userAuth,getAllInvoicesAndOrdersEachDay)

     router.get("/get-all-invoices-orders-takeaways-in-date-range",userAuth,getAllInvoicesOfOrdersAndTakeawaysInDateRange)
    router.get("/total-invoices-orders-each-day",userAuth, totalInvoicesEachDay)

        router.post("/takeaway-add-orders-and-generate-invoices",userAuth,
            takeawayAddOrdersAndGenerateInvoices);

            router.get("/next-invoice-number",userAuth,
            nextInvoiceNumber);


            router.post("/generate-sms/:Order_Id",userAuth,generateSms)
            router.post("/generate-sms-for-takeaway",userAuth,generateSmsForTakeaway)
            router.post(
  "/generate-sms-for-pre-booked/:Pre_Book_Order_Id",
  userAuth,
  generateSmsForPreBooked
);

         

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

router.post("/check-item-elligible-for-kot-print",userAuth,checkItemElligibleForKOTPrint)

// router.post("/print-thermal-invoice",userAuth, printThermalInvoice);
router.delete("/delete-invoice/:Invoice_Id",userAuth,adminAuth,deleteInvoice);
router.post("/add-pre-book-order",userAuth,addPreBookOrder);
router.get("/get-all-pre-booking-orders",userAuth,getAllPreBookingOrders);
router.get("/get-pre-book-order-details/:Pre_Booked_Order_Id",userAuth,getPreBookOrderDetails);

router.get("/get-pre-book-order-items-for-kot/:Pre_Booked_Order_Id",userAuth,getPreBookOrderItemsForKOT);

router.patch("/update-pre-book-order/:Pre_Booked_Order_Id",userAuth,updatePreBookOrder);

router.post("/confirm-pre-book-order-bill-paid-and-invoice-generated/:Pre_Book_Order_Id",userAuth,
    confirmPreOrderBillPaidAndInvoiceGenerated);
router.patch("/kot-and-update-pre-book-order/:Pre_Booked_Order_Id",userAuth,updateAndPrintPreBookKOT);
    // router.post("/kot-for-pre-booked-order",userAuth,KOTForPreBookedOrder)
//    router.get("/total-pre-book-orders-each-day",userAuth,totalPreBookedOrdersEachDay)

//  router.get("/get-pre-book-orders-orders-each-day",userAuth,getPreBookedOrdersDayWise)

router.post("/KOT-of-orders-taken-by-waiter/:Order_Id",userAuth,KOTOfOrdersTakenByWaiter)
   router.get("/:Invoice_Id", getPublicInvoiceHtml);


export default router;