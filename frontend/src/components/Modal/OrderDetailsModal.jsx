import { useEffect, useRef, useState } from "react";
import { orderApi, useConfirmOrderBillPaidAndInvoiceGeneratedMutation, useGenerateSmsMutation, useGetAllCustomersQuery, useNextInvoiceNumberQuery } from "../../redux/api/Staff/orderApi";
import { toast } from "react-toastify";
import { tableApi } from "../../redux/api/tableApi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { kitchenStaffApi } from "../../redux/api/KitchenStaff/kitchenStaffApi";
import { useForm } from "react-hook-form";




export default function OrderDetailsModal({ onClose, orderDetails,orderId }) {
    console.log(orderDetails,"orderDetails");
    // const [activeTab, setActiveTab] = useState("Order Details");  
const{ data: customers}=useGetAllCustomersQuery();
    console.log(customers,"customers");
     const [customerSearch, setCustomerSearch] = useState("");
  
     const[customerDropdownOpen,setCustomerDropdownOpen]=useState(false);
        // const[customerModal,setShowCustomerModal]=useState(false);
          //const[addParty, { isLoading }] = useAddPartyMutation();
       const [isExistingCustomer, setIsExistingCustomer] = useState(false);
    const{data:invoiceNumberData}=useNextInvoiceNumberQuery();

    const[customerDetails,setCustomerDetails]=useState({})
    console.log(invoiceNumberData,"invoiceNumberData");
  const[invoiceNumber,setInvoiceNumber]=useState("")
    useEffect(() => {
      setCustomerDetails({
        Customer_Name: orderDetails?.customerDetails?.Customer_Name || "",
        Customer_Phone: orderDetails?.customerDetails?.Customer_Phone || ""
      })
    },[orderDetails])
    const [confirmBillAndInvoiceGenerated,
        {isLoading:isConfirmingBillAndInvoiceGeneratedLoading}] = useConfirmOrderBillPaidAndInvoiceGeneratedMutation();
    const dispatch=useDispatch();
    const navigate=useNavigate();
const [generateSms, { isLoading:isGenerateSmsLoading }] = useGenerateSmsMutation();
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
   const {
     
    
      setValue,
     
      watch,
    
      formState: { errors },
    } = useForm({
     
     
    });
     const [invoiceDetails, setInvoiceDetails] = useState({
        Sub_Total: orderDetails?.Sub_Total ?? "0.00",
        Amount: orderDetails?.Amount ?? "0.00",
        // Tax_Amount: orderDetails?.order?.Tax_Amount || "0.00",
        // Tax_Type: orderDetails?.order?.Tax_Type || "None",

        // New fields (empty initially)
        Customer_Name: customerDetails?.Customer_Name,
        Customer_Phone: customerDetails?.Customer_Phone,
        Service_Charge: "0.00",
        Discount: "0.00",
        Discount_Type: "percentage",
        Final_Amount: "0.00",
        Payment_Type: "cash", // default
    });
      useEffect(() => {
        const handleClickOutside = (e) => {
          if (
            dropdownRef.current &&
            !dropdownRef.current.contains(e.target) &&
            inputRef.current &&
            !inputRef.current.contains(e.target)
          ) {
            setCustomerDropdownOpen(false);
          }
        };
      
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }, []);
      
   useEffect(() => {
  setInvoiceDetails(prev => ({
    ...prev,
    Customer_Name: customerDetails?.Customer_Name || "",
    Customer_Phone: customerDetails?.Customer_Phone || "",
  }));
}, [customerDetails]);
const calculateGrandTotal = () => {
  const subtotal = parseFloat(invoiceDetails?.Sub_Total);
//   const tax = parseFloat(invoiceDetails?.Tax_Amount);
  const service = parseFloat(invoiceDetails?.Service_Charge || 0);
  let discount = parseFloat(invoiceDetails?.Discount || 0);

  if (invoiceDetails.Discount_Type === "percentage") {
    discount = (subtotal * discount) / 100;
  }

  const finalAmount = subtotal + service - discount;
  invoiceDetails.Final_Amount = finalAmount.toFixed(2);

  return (subtotal +  service - discount).toFixed(2);
};
const formValues=watch()

console.log(formValues,"formValues");
const watchedCustomerName = watch("Customer_Name");
const watchedCustomerPhone = watch("Customer_Phone");
const handleConfirmBillAndGenerateInvoice = async () => {
  try {
    const payload = {
      Customer_Name: watchedCustomerName||null,
      Customer_Phone: watchedCustomerPhone,
      Discount: invoiceDetails?.Discount,
      Discount_Type: invoiceDetails?.Discount_Type ?? "amount",
      Service_Charge: invoiceDetails.Service_Charge,
      Payment_Type: invoiceDetails?.Payment_Type,
      Final_Amount: invoiceDetails?.Final_Amount,
    };
    console.log(payload,"payload");

    // 🔥 API CALL
    const response = await confirmBillAndInvoiceGenerated({
      orderId,
      payload
    }).unwrap();

    toast.success("Invoice Generated & Bill Paid!");
    console.log(response,"response");
//     setInvoiceDetails(prev => ({
//   ...prev,
//   Invoice_Number: response.Invoice_Id, // 🔥 map backend Invoice_Id
// }));
 const invoiceId = response.Invoice_Id;
setInvoiceNumber(invoiceId);
printInvoiceWindow(invoiceId);
    // RESPONSE MUST INCLUDE invoice number
    //const newInvoiceNumber = response.invoiceNumber; 

    // 🔥 NOW PRINT THE INVOICE
    // printInvoiceWindow();

    // Refresh UI & close modal
    dispatch(tableApi.util.invalidateTags(["Table"]));
    dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
    dispatch(orderApi.util.invalidateTags(["Order"]));
    onClose();
  navigate("/staff/orders/add");

  } catch (error) {
    console.error("❌ Error confirming bill and generating invoice:", error);
    toast.error(error?.data?.message || "Failed to generate invoice");
  }
};

const handleShareSMS = async () => {
  try {
    const payload = {
      Customer_Name: invoiceDetails?.Customer_Name,
      Customer_Phone: invoiceDetails?.Customer_Phone,
      Discount_Type: invoiceDetails?.Discount_Type,
      Discount: invoiceDetails?.Discount,
      Service_Charge: invoiceDetails?.Service_Charge,
      Payment_Type: invoiceDetails?.Payment_Type,
      Final_Amount: invoiceDetails?.Final_Amount,
    };
    console.log(payload,"payload");

     const response=await generateSms({
      Order_Id: orderId,
      payload,
    }).unwrap();

    toast.success("📩 Bill sent via SMS successfully");
    console.log(response,"response");
        dispatch(tableApi.util.invalidateTags(["Table"]));
    dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
    onClose();
  navigate("/staff/orders/all-orders");
  } catch (err) {
    console.error(err);
    toast.error(err?.data?.message || "Failed to send SMS");
  }
};
console.log(customerDetails,"customerDetails");
 console.log(invoiceDetails,"invoiceDetails");


const printInvoiceWindow = (invoiceId) => {
  const getCurrentDate = () =>
    new Date().toLocaleDateString("en-GB");

  const getCurrentTime = () =>
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
const total = invoiceDetails?.Final_Amount ?? 0;

  // const total = calculateGrandTotal();

// const html = `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <title>Invoice - ${invoiceDetails?.Invoice_Number ?? ""}</title>
//         <meta charset="UTF-8">
//         <style>
//           * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//           }
          
//           body { 
//             font-family: 'Courier New', Courier, monospace;
//             font-size: 11px;
//             line-height: 1.3;
//             color: #000;
//               width: 2.00in;     
//             margin: 0 auto;
//             padding: 0;
//           }
          
//           .invoice {
//              width: 2.00in; 
//             padding: 6px;
//           }

//           /* CENTER HEADER */
//           .header-center { 
//             text-align: center; 
//             margin-bottom: 8px;
//             border-bottom: 1px dashed #000;
//             padding-bottom: 8px;
//           }
//              .header-middle { 
//             text-align: center; 
//             margin-bottom: 8px;
//             border-bottom: 1px dashed #000;
//             padding-bottom: 8px;
//           }
          
//           .logo { 
//             width: 60px; 
//             height: auto; 
//             margin-bottom: 4px;
//             padding: 5px;
//             background-color: black;
//           }
          
//           .brand { 
//             font-size: 16px; 
//             font-weight: bold; 
//             text-transform: uppercase;
//             letter-spacing: 1px;
//             margin-bottom: 2px;
//           }
//               .thermal-strong {
//       font-size: 11px;
//       font-weight: 700;
//       letter-spacing: 0.3px;
//     }
//           .thermal-label {
//       font-weight: 700;
//     }
          
//           .line { 
//             border-top: 1px dashed #000; 
//             margin: 6px 0;
//           }
          
//           .line-solid {
//             border-top: 1px solid #000;
//             margin: 6px 0;
//           }

//           /* INFO SECTION */
//           .info-row {
//             display: flex;
//             justify-content: space-between;
//             margin: 2px 0;
//             font-size: 10px;
//             width: 2.10in;
//           }
          
//           .info-label {
//             font-weight: bold;
//           }

//           /* ITEMS TABLE */
//           .items-header {
//             display: flex;
//             justify-content: space-between;
//             font-weight: bold;
//             border-bottom: 1px solid #000;
//             padding: 4px 0;
//             font-size: 10px;
//           }
          
//           .item-row {
//             display: flex;
//             justify-content: space-between;
//             padding: 3px 0;
//             border-bottom: 1px dashed #ddd;
//             font-size: 10px;
//           }
          
//           .item-name {
//             flex: 1;
//             padding-right: 8px;
//             word-wrap: break-word;
//           }
          
//           .item-qty {
//             width: 30px;
//             text-align: center;
//           }
          
//           .item-price {
//             width: 50px;
//             text-align: right;
//           }
          
//           .item-amount {
//             width: 55px;
//             text-align: right;
//             font-weight: bold;
//           }

//           /* SUMMARY */
//           .summary {
//             margin-top: 8px;
//             font-size: 11px;
//             width: 2.10in;
//           }
          
//           .summary-row {
//             display: flex;
//             justify-content: space-between;
//             padding: 3px 0;
//           }
          
//           .summary-row.total {
//             font-size: 13px;
//             font-weight: bold;
//             border-top: 1px solid #000;
//             border-bottom: 2px solid #000;
//             margin-top: 4px;
//             padding: 5px 0;
//           }

//           /* FOOTER */
//           .footer {
//             text-align: center;
//             margin-top: 10px;
//             padding-top: 8px;
//             border-top: 1px dashed #000;
//             font-size: 10px;
//           }
          
//           .footer-title {
//             font-weight: bold;
//             margin-bottom: 4px;
//             font-size: 11px;
//           }

//           /* PRINT STYLES */
//           @media print {
//   body {
//     width: 2.00in;        /* ✅ 58mm */
//     margin: 0;
//     padding: 0;
//     -webkit-print-color-adjust: exact;
//     print-color-adjust: exact;
//   }

//   .invoice {
//     width: 2.00in;        /* ✅ 58mm */
//     padding: 6px;
//   }

//   @page {
//     size: 58mm auto;      /* 🔥 TELL PRINTER EXACT SIZE */
//     margin: 0;
//   }

//   .no-print {
//     display: none !important;
//   }
// }

       
//         </style>
//       </head>
//       <body>
//         <div class="invoice">

//           <!-- HEADER -->
//           <div class="header-center">
        
//         <div class="brand">HELLO GUYS</div>
//           <div style="font-size:10px; margin-top:4px; text-align:center;">
//     Phone: +91 99031 06989
//   </div>

//   <div style="font-size:10px; text-align:center;">
//     Mail: sparkhelloguys@gmail.com
//   </div>

//   <div style="font-size:9px; text-align:center; margin-top:2px;">
//     Address: 021D, Ho-Chi-Minh Sarani, Shakuntala Park, Behala,<br/>
//     Kolkata 700061, West Bengal
//   </div>
//    <div style="font-size:10px; text-align:center;">
//     Website: www.helloguys.co.in
//   </div>
//       </div>

//           <!-- CUSTOMER INFO -->
//            ${invoiceDetails?.Customer_Name ? `
//   <div class="info-row">
//     <div><span class="thermal-label">Customer:</span> ${invoiceDetails.Customer_Name}</div>
//   </div>` : ``}

//   ${invoiceDetails?.Customer_Phone ? `
//   <div class="info-row">
//     <div><span class="thermal-label">Phone:</span> ${invoiceDetails.Customer_Phone}</div>
//   </div>` : ``}
          
//           <div class="line"></div>
//             <div class="header-middle">
//             <h3>TAKEAWAY </h3>
//             </div>
//           <!-- DATE & TIME -->
//           <div class="info-row">
//             <span><span class="info-label">Date:</span> ${getCurrentDate()}</span>
//             <span><span class="info-label">Time:</span> ${getCurrentTime()}</span>
//           </div>
//           <div class="info-row">
//             <span><span class="info-label">Invoice:</span>${invoiceDetails?.Invoice_Number ?? "-"}
// </span>
//           </div>

//           <div class="line-solid"></div>

//           <!-- ITEMS HEADER -->
//           <div class="items-header">
//             <div style="width: 30px;">#</div>
//             <div class="item-name">ITEM</div>
//             <div class="item-qty">QTY</div>
//             <div class="item-amount">AMOUNT</div>
//           </div>

//           <!-- ITEMS LIST -->
//           ${
//             (data?.items || []).map((it, i) => `
//               <div class="item-row">
//                 <div style="width: 30px;">${i + 1}</div>
//                 <div class="item-name">${it.Item_Name ?? "-"}</div>
//                 <div class="item-qty">${it.Item_Quantity ?? 1}</div>
//                 <div class="item-amount">₹${Number(it.Amount ?? 0).toFixed(2)}</div>
//               </div>
//             `).join("")
//           }

//           <div class="line-solid"></div>

//           <!-- SUMMARY -->
//           <div class="summary">
//             <div class="summary-row">
//               <span>Subtotal</span>
//               <span>₹${Number(invoiceDetails?.Sub_Total ?? 0).toFixed(2)}</span>
//             </div>
//             ${Number(invoiceDetails?.Service_Charge ?? 0) > 0 ? `
//             <div class="summary-row">
//               <span>Service Charge</span>
//               <span>₹${Number(invoiceDetails.Service_Charge).toFixed(2)}</span>
//             </div>
//             ` : ''}
//             ${invoiceDetails?.Discount && Number(invoiceDetails.Discount) > 0 ? `
//             <div class="summary-row">
//               <span>Discount</span>
//               <span>${
//                 invoiceDetails.Discount_Type === "percentage"
//                   ? `${invoiceDetails.Discount}%`
//                   : `₹${invoiceDetails.Discount}`
//               }</span>
//             </div>
//             ` : ''}
//             <div class="summary-row total">
//               <span>TOTAL</span>
//               <span>₹${Number(total).toFixed(2)}</span>
//             </div>
//           </div>

//           <!-- FOOTER -->
//           <div class="footer">
//             <div class="footer-title">THANK YOU!</div>
//             <div>Please Visit Again</div>
//           </div>

//         </div>
//       </body>
//     </html>
//   `;
// const html = `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <title>Invoice - ${invoiceDetails?.Invoice_Number ?? ""}</title>
//         <meta charset="UTF-8">
//         <style>
//           * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//           }
          
//           body { 
//             font-family: 'Courier New', Courier, monospace;
//             font-size: 11px;
//             line-height: 1.3;
//             color: #000;
//             font-weight: 600;
//             width: 58mm;     
//             margin: 0 auto;
//             padding: 0;
//             -webkit-print-color-adjust: exact;
//             print-color-adjust: exact;
//           }
          
//           .invoice {
//             width: 100%; 
//             max-width: 54mm;
//             margin: 0 auto;
//             padding: 2mm;
//           }

//           /* CENTER HEADER */
//           .header-center { 
//             text-align: center; 
//             margin-bottom: 8px;
//             border-bottom: 1px dashed #000;
//             padding-bottom: 8px;
//           }
          
//           .header-middle { 
//             text-align: center; 
//             margin-bottom: 8px;
//             border-bottom: 1px dashed #000;
//             padding-bottom: 8px;
//           }
          
//           .logo { 
//             width: 60px; 
//             height: auto; 
//             margin-bottom: 4px;
//             padding: 5px;
//             background-color: black;
//           }
          
//           .brand { 
//             font-size: 16px; 
//             font-weight: bold; 
//             text-transform: uppercase;
//             letter-spacing: 1px;
//             margin-bottom: 2px;
//             color: #000;
//           }
          
//           .thermal-strong {
//             font-size: 11px;
//             font-weight: 700;
//             letter-spacing: 0.3px;
//             color: #000;
//           }
          
//           .thermal-label {
//             font-weight: 700;
//             color: #000;
//           }
          
//           .line { 
//             border-top: 1px dashed #000; 
//             margin: 6px 0;
//           }
          
//           .line-solid {
//             border-top: 1px solid #000;
//             margin: 6px 0;
//           }

//           /* INFO SECTION */
//           .info-row {
//             display: flex;
//             justify-content: space-between;
//             margin: 2px 0;
//             font-size: 10px;
//             width: 100%;
//             font-weight: 700;
//             color: #000;
//           }
          
//           .info-label {
//             font-weight: bold;
//             color: #000;
//           }

//           /* ITEMS TABLE */
//           .items-header {
//             display: flex;
//             justify-content: space-between;
//             font-weight: bold;
//             border-bottom: 1px solid #000;
//             padding: 4px 0;
//             font-size: 10px;
//             color: #000;
//             width: 100%;
//           }
          
//           .item-row {
//             display: flex;
//             justify-content: space-between;
//             padding: 3px 0;
//             border-bottom: 1px dashed #ddd;
//             font-size: 10px;
//             font-weight: 700;
//             color: #000;
//             width: 100%;
//           }
          
//           .item-name {
//             flex: 1;
//             padding-right: 8px;
//             word-wrap: break-word;
//             font-weight: 700;
//             color: #000;
//           }
          
//           .item-qty {
//             width: 30px;
//             text-align: center;
//             font-weight: 700;
//             color: #000;
//           }
          
//           .item-price {
//             width: 50px;
//             text-align: right;
//             font-weight: 700;
//             color: #000;
//           }
          
//           .item-amount {
//             width: 55px;
//             text-align: right;
//             font-weight: bold;
//             color: #000;
//           }

//           /* SUMMARY */
//           .summary {
//             margin-top: 8px;
//             font-size: 11px;
//             width: 100%;
//             font-weight: 700;
//             color: #000;
//           }
          
//           .summary-row {
//             display: flex;
//             justify-content: space-between;
//             padding: 3px 0;
//             font-weight: 700;
//             color: #000;
//             width: 100%;
//           }
          
//           .summary-row.total {
//             font-size: 13px;
//             font-weight: bold;
//             border-top: 1px solid #000;
//             border-bottom: 2px solid #000;
//             margin-top: 4px;
//             padding: 5px 0;
//             color: #000;
//           }

//           /* FOOTER */
//           .footer {
//             text-align: center;
//             margin-top: 10px;
//             padding-top: 8px;
//             border-top: 1px dashed #000;
//             font-size: 10px;
//             font-weight: 700;
//             color: #000;
//           }
          
//           .footer-title {
//             font-weight: bold;
//             margin-bottom: 4px;
//             font-size: 11px;
//             color: #000;
//           }

//           /* PRINT STYLES */
//           @media print {
//             body {
//               width: 58mm;
//               margin: 0;
//               padding: 0;
//               -webkit-print-color-adjust: exact;
//               print-color-adjust: exact;
//             }

//             .invoice {
//               width: 100%;
//               max-width: 54mm;
//               margin: 0 auto;
//               padding: 2mm;
//             }

//             @page {
//               size: 58mm auto;
//               margin: 0;
//             }

//             .no-print {
//               display: none !important;
//             }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="invoice">

//           <!-- HEADER -->
//           <div class="header-center">
        
//             <div class="brand">HELLO GUYS</div>
//             <div style="font-size:10px; margin-top:4px; text-align:center; font-weight:700; color:#000;">
//               Phone: +91 99031 06989
//             </div>

//             <div style="font-size:10px; text-align:center; font-weight:700; color:#000;">
//               Mail: sparkhelloguys@gmail.com
//             </div>

//             <div style="font-size:9px; text-align:center; margin-top:2px; font-weight:700; color:#000;">
//               Address: 021D, Ho-Chi-Minh Sarani, Shakuntala Park, Behala,<br/>
//               Kolkata 700061, West Bengal
//             </div>
//             <div style="font-size:10px; text-align:center; font-weight:700; color:#000;">
//               Website: www.helloguys.co.in
//             </div>
//           </div>

         
//           ${invoiceDetails?.Customer_Name ? `
//           <div class="info-row">
//             <div><span class="thermal-label">Customer:</span> ${invoiceDetails.Customer_Name}</div>
//           </div>` : ``}

//           ${invoiceDetails?.Customer_Phone ? `
//           <div class="info-row">
//             <div><span class="thermal-label">Phone:</span> ${invoiceDetails.Customer_Phone}</div>
//           </div>` : ``}
          
//           <div class="line"></div>
//           <div class="header-middle">
//             <h3 style="font-weight:bold; color:#000;">TAKEAWAY</h3>
//           </div>
          
        
//           <div class="info-row">
//             <span><span class="info-label">Date:</span> ${getCurrentDate()}</span>
//             <span><span class="info-label">Time:</span> ${getCurrentTime()}</span>
//           </div>
//           <div class="info-row">
//             <span><span class="info-label">Invoice:</span> ${invoiceDetails?.Invoice_Number ?? "-"}</span>
//           </div>

//           <div class="line-solid"></div>

          
//           <div class="items-header">
//             <div style="width: 30px;">No.</div>
//             <div class="item-name">ITEM</div>
//             <div class="item-qty">QTY</div>
//             <div class="item-amount">AMOUNT</div>
//           </div>

      
//           ${
//             (data?.items || []).map((it, i) => `
//               <div class="item-row">
//                 <div style="width: 30px;">${i + 1}</div>
//                 <div class="item-name">${it.Item_Name ?? "-"}</div>
//                 <div class="item-qty">${it.Item_Quantity ?? 1}</div>
//                 <div class="item-amount">₹${Number(it.Amount ?? 0).toFixed(2)}</div>
//               </div>
//             `).join("")
//           }

//           <div class="line-solid"></div>

        
//           <div class="summary">
//             <div class="summary-row">
//               <span>Subtotal</span>
//               <span>₹${Number(invoiceDetails?.Sub_Total ?? 0).toFixed(2)}</span>
//             </div>
//             ${Number(invoiceDetails?.Service_Charge ?? 0) > 0 ? `
//             <div class="summary-row">
//               <span>Service Charge</span>
//               <span>₹${Number(invoiceDetails.Service_Charge).toFixed(2)}</span>
//             </div>
//             ` : ''}
//             ${invoiceDetails?.Discount && Number(invoiceDetails.Discount) > 0 ? `
//             <div class="summary-row">
//               <span>Discount</span>
//               <span>${
//                 invoiceDetails.Discount_Type === "percentage"
//                   ? `${invoiceDetails.Discount}%`
//                   : `₹${invoiceDetails.Discount}`
//               }</span>
//             </div>
//             ` : ''}
//             <div class="summary-row total">
//               <span>TOTAL</span>
//               <span>₹${Number(total).toFixed(2)}</span>
//             </div>
//           </div>

//           <!-- FOOTER -->
//           <div class="footer">
//             <div class="footer-title">THANK YOU!</div>
//             <div>Please Visit Again</div>
//           </div>

//         </div>
//       </body>
//     </html>
//   `;
const html=`<!DOCTYPE html>
<html>
<head>
  <title>Invoice - ${invoiceDetails?.Invoice_Number ?? ""}</title>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      line-height: 1.3;
      font-weight: 700;
      color: #000;
      width: 58mm;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* 🔥 SAFE PRINTABLE WIDTH */
    .invoice {
      width: 48mm;
      margin: 0 auto;
      padding: 2mm;
    }
      .invoice-kitchen {
      width: 48mm;
      margin: 0 auto;
      padding: 2mm;
      margin-top: 10px;
    }


    .header-center,
    .header-middle {
      text-align: center;
      margin-bottom: 6px;
      border-bottom: 1px dashed #000;
      padding-bottom: 6px;
    }

    .brand {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .line {
      border-top: 1px dashed #000;
      margin: 5px 0;
    }

    .line-solid {
      border-top: 1px solid #000;
      margin: 5px 0;
    }

   .info-row.date-time {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  font-weight: 700;
  width: 100%;
}

.info-row.date-time span {
  white-space: nowrap;   /* 🔥 prevents wrapping */
}

    .info-label {
      font-weight: 800;
    }

    /* ITEMS */
    .items-header,
    .item-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      width: 100%;
    }

    .items-header {
      border-bottom: 1px solid #000;
      padding-bottom: 3px;
      font-weight: 800;
    }

    .item-row {
      border-bottom: 1px dashed #ccc;
      padding: 2px 0;
    }

    .col-no {
      width: 5mm;
    }

    .item-name {
      flex: 1;
      padding-right: 2mm;
      word-break: break-word;
    }

    .item-qty {
      width: 6mm;
      text-align: center;
    }

    .item-amount {
      width: 10mm;
      text-align: right;
    }

    /* SUMMARY */
    .summary {
      margin-top: 6px;
      font-size: 11px;
      width: 100%;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin: 2px 0;
    }

    .summary-row.total {
      font-size: 13px;
      font-weight: 900;
      border-top: 1px solid #000;
      border-bottom: 2px solid #000;
      padding: 4px 0;
      margin-top: 4px;
    }

    .footer {
      text-align: center;
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px dashed #000;
      font-size: 10px;
      font-weight: 700;
    }

    @media print {
      @page {
        size: 58mm auto;
        margin: 0;
      }
    }
  </style>
</head>

<body>
  <div class="invoice">

  <div class="header-center">
      <div class="brand" style="font-weight:900;">HELLO GUYS</div>
      <div>Ph: +91 9903106989</div>
  
      <div style="font-size:9px">
        Address:Shakuntala Park, Kolkata 700061
      </div>
     
    </div>

    ${watchedCustomerName? `
    <div class="info-row">
      <span class="info-label">Customer:</span>
      <span>${watchedCustomerName}</span>
    </div>` : ``}

    ${watchedCustomerPhone? `
    <div class="info-row">
      <span class="info-label">Phone:</span>
      <span>${watchedCustomerPhone}</span>
    </div>` : ``}

    <div class="line"></div>

<div class="header-middle">
  <b>TABLE: ${Array.isArray(orderDetails?.Table_Names) 
    ? orderDetails.Table_Names.join(", ") 
    : "-"}</b>
</div>


 <div class="info-row date-time">
  <span><b>Date:</b> ${getCurrentDate()}</span>
  <span><b>Time:</b> ${getCurrentTime()}</span>
</div>


    <div class="info-row">
      <span><b>Invoice:</b> ${invoiceId || "-"}</span>
    </div>

    <div class="line-solid"></div>

    <div class="items-header">
      <div class="col-no">No</div>
      <div class="item-name">ITEM</div>
      <div class="item-qty">QTY</div>
      <div class="item-amount">AMT</div>
    </div>

    ${(orderDetails?.items || []).map((it, i) => `
      <div class="item-row">
        <div class="col-no">${i + 1}</div>
        <div class="item-name">${it.Item_Name}</div>
        <div class="item-qty">${it.Item_Quantity}</div>
        <div class="item-amount">₹${Number(it.Amount).toFixed(2)}</div>
      </div>
    `).join("")}

    <div class="line-solid"></div>

    <div class="summary">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>₹${Number(invoiceDetails?.Sub_Total).toFixed(2)}</span>
      </div>

      ${invoiceDetails?.Discount ? `
      <div class="summary-row">
        <span>Discount</span>
        <span>
          ${invoiceDetails.Discount_Type === "percentage"
            ? invoiceDetails.Discount + "%"
            : "₹" + invoiceDetails.Discount}
        </span>
      </div>` : ``}

        ${invoiceDetails?.Service_Charge ? `
      <div class="summary-row">
        <span>Service Charge</span>
        <span>
          ${
            "₹" + invoiceDetails.Service_Charge}
        </span>
      </div>` : ``}

      <div class="summary-row total">
        <span>TOTAL</span>
        <span>₹${Number(total).toFixed(2)}</span>
      </div>
    </div>

    <div class="footer">
      <b>THANK YOU!</b><br>
      Please Visit Again
    </div>
      <div class="line"></div>
 <div class="invoice-kitchen">

    <div class="header-center">
      <div class="brand">KITCHEN COPY</div>
      <div style="font-size:10px">
        Invoice: ${invoiceId ?? "-"}
      </div>
    </div>

    <div class="info-row date-time">
      <span><b>Date:</b> ${getCurrentDate()}</span>
      <span><b>Time:</b> ${getCurrentTime()}</span>
    </div>

    <div class="line-solid"></div>

    <div class="items-header">
      <div class="col-no">No</div>
      <div class="item-name">ITEM</div>
      <div class="item-qty">QTY</div>
    </div>

    ${(orderDetails?.items || []).map((it, i) => `
      <div class="item-row">
        <div class="col-no">${i + 1}</div>
        <div class="item-name">${it.Item_Name}</div>
        <div class="item-qty">${it.Item_Quantity}</div>
      </div>
    `).join("")}

   

  </div>
  </div>
</body>
</html>
`

  // 🔥 CREATE HIDDEN IFRAME

const iframe = document.createElement("iframe");
iframe.style.position = "fixed";
iframe.style.right = "0";
iframe.style.bottom = "0";
iframe.style.width = "0";
iframe.style.height = "0";
iframe.style.border = "0";

document.body.appendChild(iframe);

const doc = iframe.contentWindow.document;
doc.open();
doc.write(html);
doc.close();

// ✅ THIS WAS MISSING
iframe.onload = () => {
  iframe.contentWindow.focus();
  iframe.contentWindow.print();
};

// 🧹 CLEANUP AFTER PRINT
setTimeout(() => {
  document.body.removeChild(iframe);
}, 1000);

};
useEffect(() => {
  if (customerDetails?.Customer_Phone) {
    setCustomerSearch(customerDetails.Customer_Phone);

    setValue("Customer_Phone", customerDetails.Customer_Phone);
    setValue("Customer_Name", customerDetails.Customer_Name || null);

    setIsExistingCustomer(true); // important
  }
}, [invoiceDetails, setValue]);
const isInvoiceCustomerLocked = Boolean(
  customerDetails?.Customer_Phone
);


console.log(invoiceNumber,"invoiceNumber");
  return (
 <div
  style={{
    position: "fixed",
    marginTop: "4rem",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)", // dim background
    backdropFilter: "blur(4px)", // blur effect
    zIndex: 50,
    padding: "1rem", // ensures spacing on small screens
  }}
>
     
     <div
      className="bg-white 
      w-full
       max-w-4xl rounded-lg 
      shadow-lg p-6 
    overflow-hidden max-h-[90vh]
      "
    >
         <div className="flex justify-end items-center "
      >
        <h4 className="text-xl font-semibold text-gray-900">
          {/* {editingDailyExpense ? "Edit Daily Expense" : "View Daily Expense"} */}
        </h4>
        <button
          type="button"
          style={{ backgroundColor: "transparent" ,height:"30px",width:"30px",
            fontSize:"20px"
          }}
           onClick={onClose}
          className="text-gray-500 hover:text-gray-700 "
        >
          ✕
        </button>
      </div>
        
       
<div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* REMOVE THE TAB BUTTONS - NO MORE TABS */}
  
  {/* ORDER DETAILS SECTION - Always Visible */}
  <div className="bg-white border rounded-lg p-2 ">
    <h3 className="text-xl text-center font-bold mb-2 text-gray-800">Order Details</h3>
    
    <div className="bg-gray-50 p-2">
      {/* <div className="row flex gap-2">
        <div className="input-field col s6 mt-2">
          <span className="active">
            Customer Name
          </span>
          <input
            type="text"
            readOnly
            id="Customer_Name"
            value={customerDetails?.Customer_Name}
            className="w-full outline-none border-b-2 text-gray-900"
          />
        </div>

        <div className="input-field col s6 mt-2">
          <span className="active">
            Phone Number
          </span>
          <input
            type="text"
            style={{resize:"none"}}
            id="Phone_Number"
            readOnly
            value={customerDetails?.Customer_Phone}
            className="w-full outline-none border-b-1 text-gray-900"
          />
        </div>
      </div>*/}
      
     <div className="row flex gap-2">
      <div style={{marginTop:"0px"}} className="input-field relative">
  <span className="active">
    Customer Phone 
  </span>

 
<input
  ref={inputRef}
  type="number"
  id="Customer_Phone"
  placeholder="Search by phone"
  value={customerSearch}
  readOnly={isInvoiceCustomerLocked}
  // disabled={isInvoiceCustomerLocked}
  // {...register("Customer_Phone")}
  onChange={(e) => {
    if (isInvoiceCustomerLocked) return;

    let val = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
    setCustomerSearch(val);
    setValue("Customer_Phone", val, { shouldValidate: true });
// setInvoiceDetails({ ...invoiceDetails, Customer_Phone: val });
    setIsExistingCustomer(false);
    setCustomerDropdownOpen(true);
  }}
  onFocus={() => {
    if (!isInvoiceCustomerLocked) {
      setCustomerDropdownOpen(true);
    }
  }}
  className={`w-full outline-none border-b-2 text-gray-900 ${
    isInvoiceCustomerLocked ? "bg-gray-100 cursor-not-allowed" : ""
  }`}
/>


  {customerDropdownOpen && (
    
    <div
     ref={dropdownRef}
      className="
        absolute z-50 mt-1 w-full
        bg-white border border-gray-300 rounded-md shadow-lg
        max-h-48 overflow-y-auto
      "
    >
      {customers
        ?.filter(
          (c) =>
            c.Customer_Phone.includes(customerSearch) ||
            c.Customer_Name?.toLowerCase().includes(customerSearch.toLowerCase())
        )
        .map((c, i) => (
          <div
            key={i}
            onClick={() => {
              setCustomerSearch(c.Customer_Phone);

              setValue("Customer_Phone", c.Customer_Phone, {
                shouldValidate: true,
              });

              setValue(
                "Customer_Name",
                c.Customer_Name || null,
                { shouldValidate: true }
              );
              // setValue("Customer_Address", c.Customer_Address, {
              //   shouldValidate: true,
              // });
              // setValue("Customer_Date", c.Special_Date, {
              //   shouldValidate: true,
              // });
           

              setIsExistingCustomer(true);
              setCustomerDropdownOpen(false);
            }}
            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          >
            <span className="font-medium">
              {c.Customer_Name ?? ""}
            </span>{" "}
            <span className="text-gray-500">
              ({c.Customer_Phone})
            </span>
          </div>
        ))}

      {customers?.length === 0 && (
        <p className="px-3 py-2 text-gray-500">No customers found</p>
      )}
    </div>
  )}

  {errors?.Customer_Phone && (
    <p className="text-red-500 text-xs mt-1">
      Phone number is required
    </p>
  )}
</div>

<div style={{marginTop:"0px"}} className="input-field  ">
  <span className="active">Customer Name</span>

  {/* <input
    type="text"
    id="Customer_Name"
    placeholder="Customer Name"
      //  value={watchedCustomerName || ""} 
       readOnly={isExistingCustomer} 
    className="w-full outline-none border-b-2 text-gray-900"
    onChange={(e) => {
      setValue("Customer_Name", e.target.value || null, {
        shouldValidate: true,
      });
    }}
  /> */}
  <input
  type="text"
  id="Customer_Name"
  placeholder="Customer Name"
  readOnly={isInvoiceCustomerLocked || isExistingCustomer}
  // {...register("Customer_Name")}
  value={watchedCustomerName}
  className={`w-full outline-none border-b-2 text-gray-900 ${
    isInvoiceCustomerLocked || isExistingCustomer
      ? "bg-gray-100 cursor-not-allowed"
      : ""
  }`}
  onChange={(e) => {
    if (isInvoiceCustomerLocked || isExistingCustomer) return;

    setValue("Customer_Name", e.target.value || null, {
      shouldValidate: true,
    });
    // setInvoiceDetails({ ...invoiceDetails, Customer_Name: e.target.value });
  }}
  
/>


  {errors?.Customer_Name && (
    <p className="text-red-500 text-xs mt-1">
      {errors.Customer_Name.message}
    </p>
  )}
</div>
</div>
 <div className="grid grid-rows-3 gap-2">
        <div style={{width:"100%",marginTop:"5px"}}
          className="  flex flex-col gap-1">
          <span className="active">
            Discount
          </span>
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              id="Discount"
              value={invoiceDetails.Discount}
              onChange={(e) => {
                let val = e.target.value.replace(/[^0-9.]/g, "");
                const parts = val.split(".");
                if (parts.length > 2) {
                  val = parts[0] + "." + parts.slice(1).join("");
                }
                if (val.includes(".")) {
                  const [int, dec] = val.split(".");
                  val = int + "." + dec.slice(0, 2);
                }
                if (invoiceDetails.Discount_Type === "percentage" && parseFloat(val) > 100) {
                  val = "100";
                }
                setInvoiceDetails({ ...invoiceDetails, Discount: val });
              }}
              placeholder={
                invoiceDetails.Discount_Type === "percentage" ? "0 %" : "0.00"
              }
              className="flex-grow border-b-2 outline-none pb-1 text-gray-900"
            />
            <select
              className="border rounded-md px-1 py-1 text-sm w-28"
              value={invoiceDetails.Discount_Type || "amount"} 
              onChange={(e) =>
                setInvoiceDetails({
                  ...invoiceDetails,
                  Discount_Type: e.target.value,
                  Discount: "0.00"
                })
              }
            >
              <option value="amount">Amount</option>
              <option value="percentage">%</option>
            </select>
          </div>
        </div>

        <div style={{width:"100%"}}
          className="flex flex-col  ">
          <span  className="active">
            Service Charge
          </span>
          <input
            type="text"
            id="Service_Charge"
            value={invoiceDetails?.Service_Charge}
            onChange={(e) => {
              let val = e.target.value;
              val = val.replace(/[^0-9.]/g, "");
              const parts = val.split(".");
              if (parts.length > 2) {
                val = parts[0] + "." + parts.slice(1).join("");
              }
              if (val.includes(".")) {
                const [int, dec] = val.split(".");
                val = int + "." + dec.slice(0, 2);
              }
              e.target.value = val;
              setInvoiceDetails({ ...invoiceDetails, Service_Charge: val });
            }}
            placeholder="0.00"
            className="w-full outline-none border-b-2 text-gray-900"
          />
        </div>

        <div style={{width:"100%"}}
          className=" ">
          <span className="active">Payment Type</span>
          <select                         
            id="Payment Mode"
            onChange={(e)=>setInvoiceDetails({...invoiceDetails,
              Payment_Type: e.target.value
            })}
            value={invoiceDetails?.Payment_Type}
            className="w-full border border-gray-300 text-gray-900 bg-white rounded-md p-2"
          >
            <option value="Cash">Cash</option>
            <option value="Online">Online</option>
            <option value="Upi">Upi</option>
          </select>
        </div>
      </div> 
    </div>
  </div>

  {/* INVOICE DETAILS SECTION - Always Visible Below */}
  <div className="bg-white border rounded-lg p-2">
    <div className="flex flex-col w-full items-center">
      <div className="flex">
        <h3 className="text-xl font-bold mb-2 text-gray-800">Invoice Preview</h3>
      </div>
      
      {/* INVOICE PREVIEW */}
      <div className="w-full max-w-md bg-white shadow-md border rounded-lg p-6
                      max-h-[60vh] overflow-y-auto">
        
        {/* HEADER */}
      

        <h4 className="text-xl font-bold text-center">
          HELLO GUYS
        </h4>

        <div className="border-t my-1"></div>

        {/* CUSTOMER INFO */}
        {/* <div className="flex justify-between text-sm">
          <div>
            <p><strong>Name:</strong> {invoiceDetails.Customer_Name}</p>
            <p><strong>Phone:</strong> {invoiceDetails.Customer_Phone}</p>
          </div>
          <div className="text-right">
            <p><strong>Date:</strong> {new Date().toLocaleDateString("en-GB")}</p>
            <p><strong>Time:</strong> {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })}</p>
            {/* <p><strong>Invoice No:</strong> {invoiceNumberData?.nextInvoiceNumber}</p> 
            {/* <p><strong>Invoice No:</strong> {invoiceNumber}</p> 
          </div>
        </div> */}
        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",      // 🔥 smaller text
    lineHeight: "1.2",     // 🔥 tight rows
    marginBottom: "4px",
  }}
>
  <div>
    <div>
      <strong>Name:</strong> {invoiceDetails.Customer_Name || "-"}
    </div>
    <div>
      <strong>Phone:</strong> {invoiceDetails.Customer_Phone || "-"}
    </div>
  </div>

  <div style={{ textAlign: "right" }}>
    <div>
      <strong>Date:</strong>{" "}
      {new Date().toLocaleDateString("en-GB")}
    </div>
    <div>
      <strong>Time:</strong>{" "}
      {new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}
    </div>
  </div>
</div>


        <div className="border-t my-1"></div>
        
        {/* <table>
          <thead>
            <tr>
              <th style={{ width: "5%" }}>Sl.No</th>
              <th style={{ width: "5%" }}>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails?.items?.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item?.Item_Name ?? "-"}</td>
                <td>{item?.Item_Quantity ?? 1}</td>
                <td>₹{Number(item.Amount ?? 0).toFixed(2)}</td>
                <td className="text-right">₹{Number(item?.Amount || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table> */}
<table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",        // 🔥 smaller text
    lineHeight: "1.2",       // 🔥 tighter rows
  }}
>
  <thead>
    <tr>
      <th style={{ width: "6%", padding: "2px 4px", textAlign: "left" }}>
       No.
      </th>
      <th style={{ width: "44%", padding: "2px 4px", textAlign: "left" }}>
        Item
      </th>
      <th style={{ width: "10%", padding: "2px 4px", textAlign: "center" }}>
        Qty
      </th>
      <th style={{ width: "20%", padding: "2px 4px", textAlign: "right" }}>
        Price
      </th>
      <th style={{ width: "20%", padding: "2px 4px", textAlign: "right" }}>
        Amount
      </th>
    </tr>
  </thead>

  <tbody>
    {orderDetails?.items?.map((item, index) => (
      <tr key={index}>
        <td style={{ padding: "2px 4px" }}>{index + 1}</td>
        <td style={{ padding: "2px 4px" }}>
          {item?.Item_Name ?? "-"}
        </td>
        <td style={{ padding: "2px 4px", textAlign: "center" }}>
          {item?.Item_Quantity ?? 1}
        </td>
        <td style={{ padding: "2px 4px", textAlign: "right" }}>
          ₹{Number(item?.Item_Price ?? 0).toFixed(2)}
        </td>
        <td style={{ padding: "2px 4px", textAlign: "right" }}>
          ₹{Number(item?.Amount ?? 0).toFixed(2)}
        </td>
      </tr>
    ))}
  </tbody>
</table>

        {/* SUMMARY TABLE */}
       <table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "11px",     // 🔥 smaller text
    lineHeight: "1.2",    // 🔥 tighter rows
  }}
>
  <tbody>
    <tr>
      <td style={{ padding: "2px 4px" }}>Subtotal</td>
      <td style={{ padding: "2px 4px", textAlign: "right" }}>
        ₹{Number(invoiceDetails.Sub_Total || 0).toFixed(2)}
      </td>
    </tr>

    {Number(invoiceDetails.Service_Charge) > 0 && (
      <tr>
        <td style={{ padding: "2px 4px" }}>Service Charge</td>
        <td style={{ padding: "2px 4px", textAlign: "right" }}>
          ₹{Number(invoiceDetails.Service_Charge).toFixed(2)}
        </td>
      </tr>
    )}

    {Number(invoiceDetails.Discount) > 0 && (
      <tr>
        <td style={{ padding: "2px 4px" }}>Discount</td>
        <td style={{ padding: "2px 4px", textAlign: "right" }}>
          {invoiceDetails.Discount_Type === "percentage"
            ? `${invoiceDetails.Discount}%`
            : `₹${Number(invoiceDetails.Discount).toFixed(2)}`}
        </td>
      </tr>
    )}

    <tr style={{ borderTop: "1px solid #000" }}>
      <td
        style={{
          padding: "4px 4px",
          fontWeight: "bold",
          fontSize: "13px",
        }}
      >
        TOTAL
      </td>
      <td
        style={{
          padding: "4px 4px",
          fontWeight: "bold",
          fontSize: "13px",
          textAlign: "right",
        }}
      >
        ₹{Number(calculateGrandTotal()).toFixed(2)}
      </td>
    </tr>
  </tbody>
</table>


        <div className="border-t my-1"></div>

        {/* BUTTONS */}
        {/* <div className="flex justify-center gap-3">
         
        </div> */}
         
      </div>
       <div className="relative flex w-full mt-4 fixed bottom-0  gap-4 mb-2">
          {/* <img
            style={{backgroundColor:"black",padding:"4px"}}
            src="/assets/images/restaurant-logo.png"
            alt="logo"
            className="w-16 h-auto"
          /> */}
           <button
            type="button"
            disabled={isConfirmingBillAndInvoiceGeneratedLoading}
            onClick={handleConfirmBillAndGenerateInvoice}
            className="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            {isConfirmingBillAndInvoiceGeneratedLoading ? "Generating..." : "Print Bill"}
          </button>
          <button
            type="button"
            disabled={isGenerateSmsLoading}
            onClick={() => handleShareSMS()}
            className="absolute right-0 top-0 px-4 py-2 bg-green-600 text-white 
                       rounded-lg shadow hover:bg-green-700 transition"
          >
            {isGenerateSmsLoading ? "Sharing..." : "Share"}
          </button>
        </div>
    </div>
  </div>
</div>

 </div>

  </div>
);

}

            {/* <div className="input-field col s6 ">
      <span className="active">
          Discount
       
      </span>

      <input
  type="text"
  id="Discount"
 
  value={invoiceDetails?.Discount}
   onChange={(e) => {
  
      let val = e.target.value;

  // ✅ allow digits and one dot
  val = val.replace(/[^0-9.]/g, "");

  // ✅ if more than one dot, keep only the first
  const parts = val.split(".");
  if (parts.length > 2) {
    val = parts[0] + "." + parts.slice(1).join(""); // collapse extra dots
  }

  // ✅ limit to 2 decimal places
  if (val.includes(".")) {
    const [int, dec] = val.split(".");
    val = int + "." + dec.slice(0, 2);
  }

  e.target.value = val;

      setInvoiceDetails({ ...invoiceDetails, Discount: val }); // update parent state
    
  }}
  placeholder="0.00"
  className="w-full outline-none border-b-2 text-gray-900"
//   readOnly={!editingDailyExpense}
/>

      
     
  </div> */}

  {/* {activeTab === "Invoice Details" && (
  <div className="flex flex-col">

        <div className="flex justify-center items-center">
    <h4 className="text-xl flex font-bold mb-4 mt-4 ">Invoice Preview</h4>
    </div>

    <div className="border p-4 flex flex-col rounded bg-gray-50 items-center justify-center">

      <p><strong>Customer:</strong> {invoiceDetails.Customer_Name}</p>
      <p><strong>Phone:</strong> {invoiceDetails.Customer_Phone}</p>

      <hr className="my-3" />

      <p><strong>Subtotal:</strong> ₹{invoiceDetails.Sub_Total}</p>
      {/* <p><strong>Tax:</strong> ₹{invoiceDetails.Tax_Amount}</p> 
      <p><strong>Service Charge:</strong> ₹{invoiceDetails?.Service_Charge}</p>
      <p><strong>Discount:</strong> {invoiceDetails.Discount_Type === "percentage"
          ? `${invoiceDetails.Discount}%`
          : `₹${invoiceDetails.Discount}`}</p>

   
      <p className="text-xl font-bold mt-3">
        Total: ₹{calculateGrandTotal()}
      </p>

      <hr className="my-4" />

        <div className="flex ">
    

      <button
      type="button"
      disabled={isConfirmingBillAndInvoiceGeneratedLoading}
         onClick={()=>handleConfirmBillAndGenerateInvoice()}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {isConfirmingBillAndInvoiceGeneratedLoading ? "Generating ..." : "Generate Bill & Invoice"}
      </button>
         {/* <button
                type="button"
                onClick={printInvoiceWindow}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Print Invoice
              </button> 
       </div>
    </div>

  </div>

)} */}

//  const printInvoiceWindow = () => {
// // Format: DD/MM/YYYY
// const getCurrentDate = () => {
//   return new Date().toLocaleDateString("en-GB");
// };

// // Format: HH:MM AM/PM (no seconds)
// const getCurrentTime = () => {
//   return new Date().toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });
// };

//   const total = calculateGrandTotal();

//   const html = `
//     <html>
//       <head>
//         <title>Invoice - ${invoiceDetails?.Invoice_Number ?? ""}</title>
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <style>
//           body { 
//             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial; 
//             color:#111; margin:0; padding:12px;
//           }
//           .invoice { max-width: 2.5in; margin: 0 auto; }

//           /* CENTER HEADER */
//           .header-center { text-align:center; margin-bottom:10px; }
//           .logo { width:80px; height:auto; margin-bottom:6px; }
//           .brand { font-size:22px; font-weight:700; letter-spacing:0.5px; }
//           .line { border-top:1px solid #ddd; margin:10px 0; }

//           /* CUSTOMER + DATE ROW */
//           .top-info { display:flex; justify-content:space-between; margin: 8px 0; }
//           .left, .right { font-size:14px; }
//           .right { text-align:right; }

//           /* ITEMS TABLE */
//           table { width:100%; border-collapse:collapse; margin-top:10px; }
//           th, td { padding:8px 6px; border:1px solid #e5e5e5; font-size:14px; }
//           th { background:#f2f2f2; text-align:left; font-weight:600; }
//           .text-right { text-align:right; }

//           /* SUMMARY BOX */
//           .summary { 
//             width:100%;
//             display:flex;
//             justify-content:center;
//             align-items:center; 
            
//           }
//             .center {
//                width:100%;
//             display:flex;
//             flex-direction:column;
//             justify-content:center;
//             align-items:center; 
//             }
//           .summary table td { padding:6px; font-size:14px; }
//           .total { font-size:17px; font-weight:700; }

//           /* PRINT MODE */
//           @media print {
//             body { padding: 6mm; }
//             @page { size: auto; margin: 6mm; }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="invoice">

//           <!-- ===== TOP CENTER LOGO & NAME ===== -->
//           <div class="header-center">
//             <img src="/logo.png" class="logo" />
//             <div class="brand">${invoiceDetails?.Store_Name ?? "Restaurant"}</div>
//           </div>

//           <div class="line"></div>

//           <!-- ===== CUSTOMER + DATE BLOCK ===== -->
//           <div class="top-info">
//             <div class="left">
//               <div><strong>Customer:</strong> ${invoiceDetails?.Customer_Name ?? "Walk-in"}</div>
//               <div><strong>Phone:</strong> ${invoiceDetails?.Customer_Phone ?? "-"}</div>
//             </div>

//     <div class="right">
//   <div><strong>Date:</strong> ${getCurrentDate()}</div>
//   <div><strong>Time:</strong> ${getCurrentTime()}</div>
//   <div><strong>Invoice No:</strong> ${invoiceNumberData?.nextInvoiceNumber ?? "-"}</div>
// </div>


//           </div>

//           <div class="line"></div>

//           <!-- ===== ITEMS TABLE ===== -->
//           <table>
//             <thead>
//               <tr>
//                 <th style="width:8%;">Sl.No</th>
//                 <th style="width:48%;">Item</th>
//                 <th style="width:14%;">Qty</th>
//                 <th style="width:15%;">Price</th>
//                 <th style="width:15%;" class="text-right">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${
//                 (orderDetails?.items || []).map((it, i) => `
//                   <tr>
//                     <td>${i + 1}</td>
//                     <td>${it.Item_Name ??  "-"}</td>
//                     <td>${it.Item_Quantity  ?? 1}</td>
//                     <td>${Number(it.Amount??  0).toFixed(2)}</td>
//                     <td class="text-right">${Number(it.Amount ?? 0).toFixed(2)}</td>
//                   </tr>
//                 `).join("")
//               }
//             </tbody>
//           </table>

//           <!-- ===== SUMMARY (CENTERED) ===== -->
//           <div class="summary">
//             <table style="width:100%;">
//               <tr>
//                 <td>Subtotal</td>
//                 <td class="text-right">₹${Number(invoiceDetails?.Sub_Total ?? 0).toFixed(2)}</td>
//               </tr>
//               <tr>
//                 <td>Service Charge</td>
//                 <td class="text-right">₹${Number(invoiceDetails?.Service_Charge ?? 0).toFixed(2)}</td>
//               </tr>
//               <tr>
//                 <td>Discount</td>
//                 <td class="text-right">
//                   ${
//                     invoiceDetails?.Discount_Type === "percentage"
//                       ? `${invoiceDetails.Discount}%`
//                       : `₹${invoiceDetails.Discount ?? 0}`
//                   }
//                 </td>
//               </tr>
//               <tr>
//                 <td class="total">Total</td>
//                 <td class="text-right total">₹${Number(total).toFixed(2)}</td>
//               </tr>
//             </table>
//           </div>

//           <div class="line"></div>
//           <div class="center muted">
//           <h4>Terms & Conditions</h4>
//           <span>Thank you. Please Visit again.</span>
//           </div>

//         </div>
//       </body>
//     </html>
//   `;

// //   const w = window.open("", "_blank", "width=800,height=900");
// //   if (!w) return alert("Allow pop-ups to print the invoice.");
// //   w.document.write(html);
// //   w.document.close();

// //   setTimeout(() => { w.print(); }, 300);
// // };

//    const w = window.open(
//   "",
//   "_blank",
//   `toolbar=0,location=0,menubar=0,
//    width=${window.screen.availWidth},
//    height=${window.screen.availHeight},
//    left=0,top=0`
// );

// if (!w) return alert("Allow pop-ups to print the invoice.");

// w.document.write(html);

// // Add Print Button inside the new window
// w.document.write(`
//   <button onclick="window.print()" 
//     style="position:fixed;top:10px;right:10px;padding:8px 12px;
//            background:#ff0000;color:white;border:none;border-radius:4px;
//            font-size:14px;cursor:pointer;z-index:9999;">
//       Print
//   </button>
// `);

// w.document.close();
//  }


/*THERMAL PRINTER PACKAGE*/
// const handleConfirmBillAndGenerateInvoice = async () => {
//   try {
//     const payload = {
//       Customer_Name: invoiceDetails?.Customer_Name,
//       Customer_Phone: invoiceDetails?.Customer_Phone,
//       Discount: invoiceDetails?.Discount,
//       Discount_Type: invoiceDetails?.Discount_Type ?? "amount",
//       Service_Charge: invoiceDetails.Service_Charge,
//       Payment_Type: invoiceDetails?.Payment_Type,
//       Final_Amount: invoiceDetails?.Final_Amount,
//     };

//     const response = await confirmBillAndInvoiceGenerated({
//       orderId,
//       payload
//     }).unwrap();

//     toast.success("Invoice Generated!");

//     /* 🔥 THERMAL PRINT */
//     await axios.post("/api/print/thermal", {
//       invoice: response.invoice, // backend must send full invoice
//     });

//     toast.success("Bill Printed");

//     dispatch(tableApi.util.invalidateTags(["Table"]));
//     onClose();
//     navigate("/staff/orders/all-orders");

//   } catch (error) {
//     toast.error("Print failed");
//     console.error(error);
//   }
// };


 {/* <div className="border-b border-gray-300 flex space-x-8 mt-0">
                                        {["Order Details","Invoice Details"].map((tab) => (
                                            <button
                                                type="button"
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                style={{
                                                    cursor: "pointer",
                                                    backgroundColor: "transparent",
                                                    border: "none",
                                                    outline: "none",
                                                    padding: "0.5rem 1rem",
                                                    borderBottom: activeTab === tab ? "1px solid red" : "none",
                                                    color: activeTab === tab ? "red" : "gray",
                                                    fontWeight: activeTab === tab ? "600" : "500",
                                                }}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                          </div>
   
                                   
                                  
     
     {activeTab === "Order Details" && <div className="mt-2">
     

      
    <div className="bg-gray-50 p-2">
      <div className="row flex gap-2">
  

<div className="input-field col s6 mt-2">
  <span className="active">
    Customer Name
   
  </span>

  <input
  type="text"
  readOnly
    // type={editingDailyExpense ? "date" : "text"}
    id="Customer_Name"
    value={customerDetails?.Customer_Name}

    //onChange={(e)=> setInvoiceDetails({ ...invoiceDetails, Customer_Name: e.target.value })}
    className="w-full outline-none border-b-2 text-gray-900"
  />
</div>


  
                 <div className="input-field col s6 mt-2 ">
                      <span className="active">
                        Phone Number
                       
                      </span>
                      <input
                        type="text"
                        style={{resize:"none"}}
                        id="Phone_Number"
                        readOnly
                        value={customerDetails?.Customer_Phone}
                        //  value={invoiceDetails?.Customer_Phone}

                        //onChange={(e)=> setInvoiceDetails({ ...invoiceDetails, Customer_Phone: e.target.value })}
                        
                        className="w-full outline-none border-b-1  text-gray-900"
                      />
                     
                    </div>
  
  
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
          
<div style={{width:"100%",marginTop:"10px"}}
className="input-field col s6 flex flex-col gap-1">

  <span className="active ">
    Discount
  </span>

  <div className="flex items-center gap-2 w-full">

  

   
    <input
      type="text"
      id="Discount"
      value={invoiceDetails.Discount}
      onChange={(e) => {
        let val = e.target.value.replace(/[^0-9.]/g, "");

        // Limit dot usage
        const parts = val.split(".");
        if (parts.length > 2) {
          val = parts[0] + "." + parts.slice(1).join("");
        }

        // Limit decimals to 2
        if (val.includes(".")) {
          const [int, dec] = val.split(".");
          val = int + "." + dec.slice(0, 2);
        }

        // Limit % to 100
        if (invoiceDetails.Discount_Type === "percentage" && parseFloat(val) > 100) {
          val = "100";
        }

        setInvoiceDetails({ ...invoiceDetails, Discount: val });
      }}
      placeholder={
        invoiceDetails.Discount_Type === "percentage" ? "0 %" : "0.00"
      }
      className="flex-grow border-b-2 outline-none pb-1 text-gray-900"
    />
   
    <select
      className="border rounded-md px-1 py-1 text-sm w-28"  // ← fixed small width
      value={invoiceDetails.Discount_Type || "amount"} 
      onChange={(e) =>
        setInvoiceDetails({
          ...invoiceDetails,
          Discount_Type: e.target.value,
          Discount: "0.00"
        })
      }
    >
      <option value="amount">Amount</option>
      <option value="percentage">% </option>
    </select>
  </div>
</div>


  <div  style={{width:"100%",marginTop:"16px"}}
  className="input-field col s6 ">
      <span className="active">
          Service Charge
      
      </span>

      <input
  type="text"
  id="Service_Charge"
  value={invoiceDetails?.Service_Charge}

   onChange={(e) => {
    
      let val = e.target.value;

  // ✅ allow digits and one dot
  val = val.replace(/[^0-9.]/g, "");

  // ✅ if more than one dot, keep only the first
  const parts = val.split(".");
  if (parts.length > 2) {
    val = parts[0] + "." + parts.slice(1).join(""); // collapse extra dots
  }

  // ✅ limit to 2 decimal places
  if (val.includes(".")) {
    const [int, dec] = val.split(".");
    val = int + "." + dec.slice(0, 2);
  }

  e.target.value = val;

      setInvoiceDetails({ ...invoiceDetails, Service_Charge: val }); // update parent state
    
  }}
  placeholder="0.00"
  className="w-full outline-none border-b-2 text-gray-900"
//  
/>

      
     
  </div>
  

    
 
    <div style={{width:"100%",marginTop:"16px"}}
    className="input-field col s6 ">
                      <span className="active">Payment Type</span>
          
                      <select                         
                      id="Payment Mode"
                      
                      onChange={(e)=>setInvoiceDetails({...invoiceDetails,
                        Payment_Type: e.target.value
                      })}

                        value={invoiceDetails?.Payment_Type}
                        className="w-full border border-gray-300 text-gray-900 bg-white rounded-md p-2"
                      >
                        
                          
                          <option value="Cash">Cash</option>
                          
                          <option value="Online">Online</option>
                           <option value="Online">Upi</option>
                         
       
                      </select>
  
                 
                    </div>
                    
  </div>
              
     
  </div>
  
  
  
                 
  
                   <div className="flex justify-end mt-4 gap-4">
   
                    <button
  type="button"
  onClick={() => setActiveTab("Invoice Details")}
  className="text-white font-bold py-2 px-4 rounded"
  style={{ backgroundColor: "#ff0000" }}
>
  Next
</button>

                   
                  </div> 
    </div>} 
    
{activeTab === "Invoice Details" && (
  <div className="flex flex-col w-full items-center">
    <div className="flex ">
    <h4 className="text-2xl font-bold mt-2 mb-2">Invoice Preview</h4>
    
       </div>
   
    <div className="w-full max-w-md bg-white shadow-md border rounded-lg p-6
                    max-h-[70vh] overflow-y-auto">

      
    
<div className="relative flex items-center justify-center mb-4">

 <img
  style={{backgroundColor:"black",padding:"5px"}}
    src="/assets/images/restaurant-logo.png"
    alt="logo"
    className="w-16 h-auto "
  />


  <button
    type="button"
    disabled={isGenerateSmsLoading}
     onClick={() => handleShareSMS()}
    className="absolute right-0 top-0 px-4 py-2 bg-green-600 text-white 
               rounded-lg shadow hover:bg-green-700 transition"
  >
    {isGenerateSmsLoading ? "Sharing..." : "Share"}
  </button>
</div>


<h2 className="text-xl font-bold text-center">
  HELLO GUYS
</h2>


      <div className="border-t my-3"></div>

      <div className="flex justify-between text-sm">
        <div>
          <p><strong>Name:</strong> {invoiceDetails.Customer_Name}</p>
          <p><strong>Phone:</strong> {invoiceDetails.Customer_Phone}</p>
        </div>
        <div className="text-right">
          <p><strong>Date:</strong> {new Date().toLocaleDateString("en-GB")}</p>
          <p><strong>Time:</strong> {new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            })}</p>
          <p><strong>Invoice No:</strong> {invoiceNumberData?.nextInvoiceNumber}</p>
        </div>
      </div>

      <div className="border-t my-3"></div>
      <table>
            <thead>
              <tr>
                <th style={{ width: "5%" }}>Sl.No</th>
                <th style={{ width: "5%" }}>Item</th>
                <th >Qty</th>
                <th >Price</th>
                <th  className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
           
              {orderDetails?.items?.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item?.Item_Name ?? "-"}</td>
                  <td>{item?.Item_Quantity ?? 1}</td>
                  <td>₹{Number(item.Amount ?? 0).toFixed(2)}</td>
                  <td className="text-right">₹{Number(item?.Amount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

    
      <table className="w-full text-sm">
        <tbody>
          <tr>
            <td className="py-1">Subtotal</td>
            <td className="py-1 text-right">₹{invoiceDetails.Sub_Total}</td>
          </tr>
          <tr>
            <td className="py-1">Service Charge</td>
            <td className="py-1 text-right">₹{invoiceDetails.Service_Charge}</td>
          </tr>
          <tr>
            <td className="py-1">Discount</td>
            <td className="py-1 text-right">
              {invoiceDetails.Discount_Type === "percentage"
                ? `${invoiceDetails.Discount}%`
                : `₹${invoiceDetails.Discount}`}
            </td>
          </tr>
          <tr className="border-t">
            <td className="py-2 font-bold text-lg">Total</td>
            <td className="py-2 font-bold text-lg text-right">
              ₹{calculateGrandTotal()}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="border-t my-4"></div>

     
      <div className="flex justify-center gap-3">
        <button
          type="button"
          disabled={isConfirmingBillAndInvoiceGeneratedLoading}
          onClick={handleConfirmBillAndGenerateInvoice}
          className="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          {isConfirmingBillAndInvoiceGeneratedLoading ? "Generating..." : "Generate Bill & Invoice"}
        </button>
      </div>
    </div>
  </div>
)} 
 // Remove the tabs and display both sections in one scrollable page */}
