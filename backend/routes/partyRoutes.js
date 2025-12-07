import express from "express";
const router = express.Router();

import {addParty, editParty, getAllParties, getSinglePartyDetailsSalesPurchases, printSinglePartyDetailsSalesPurchasesReport} from "../controllers/partyController.js"
import userAuth from "../middleware/userAuth.js";


router.post("/add-party",userAuth,addParty)
router.patch("/edit-party/:Party_Id",userAuth,editParty)
router.get("/get-all-parties",userAuth,getAllParties)

router.get("/get-single-party-details-sales-purchases/:Party_Id",userAuth,getSinglePartyDetailsSalesPurchases)
router.post("/print-single-party-details-sales-purchases-report",userAuth,printSinglePartyDetailsSalesPurchasesReport)
export default router;