import express from "express";
const router = express.Router();

import { addNewCustomer, addOrder, confirmOrderBillPaidAndInvoiceGenerated, getAllCustomers, getAllInvoicesAndOrdersEachDay, 
   
    getAllInvoicesOfOrdersAndTakeawaysInDateRange, 
   
    getTableOrderDetails, getTablesHavingOrders, 
    nextInvoiceNumber, takeawayAddOrdersAndGenerateInvoices, totalInvoicesEachDay, updateOrder } from "../../controllers/staff/orderItemController.js";
import userAuth from "../../middleware/userAuth.js";




router.post("/add-new-customer",userAuth,addNewCustomer)
router.get("/all-customers",userAuth,getAllCustomers)
router.post("/add-order",userAuth,addOrder)
router.get("/get-tables-having-orders",userAuth,getTablesHavingOrders)

router.get("/get-table-order-details/:Order_Id",userAuth,getTableOrderDetails)
router.patch("/update-order/:Order_Id",userAuth,updateOrder)
router.post("/confirm-bill/:Order_Id",userAuth,
    confirmOrderBillPaidAndInvoiceGenerated);

    router.get("/get-all-invoices-orders-each-day",userAuth,getAllInvoicesAndOrdersEachDay)
     router.get("/get-all-invoices-orders-takeaways-in-date-range",userAuth,getAllInvoicesOfOrdersAndTakeawaysInDateRange)
    router.get("/total-invoices-orders-each-day",userAuth,
        totalInvoicesEachDay)

        router.post("/takeaway-add-orders-and-generate-invoices",userAuth,
            takeawayAddOrdersAndGenerateInvoices);

            router.get("/next-invoice-number",userAuth,
            nextInvoiceNumber);
export default router;