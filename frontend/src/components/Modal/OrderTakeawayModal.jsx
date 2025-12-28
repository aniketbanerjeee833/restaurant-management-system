import { useState } from "react";
import { orderApi, useConfirmTakeawayOrderBillPaidAndInvoiceGeneratedMutation, useGenerateSmsForTakeawayMutation,  useNextInvoiceNumberQuery, useTakeawayAddOrdersAndGenerateInvoicesMutation } from "../../redux/api/Staff/orderApi";
import { toast } from "react-toastify";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { kitchenStaffApi } from "../../redux/api/KitchenStaff/kitchenStaffApi";
import { tableApi } from "../../redux/api/tableApi";



export default function OrderTakeawayModal({ onClose, orderDetails,takeawayOrderId }) {
    console.log(orderDetails,"orderDetails",takeawayOrderId);
    const {user}=useSelector((state) => state.user);
    const [activeTab, setActiveTab] = useState("Order Details");
        const{data:invoiceNumberData}=useNextInvoiceNumberQuery();
        console.log(invoiceNumberData,"invoiceNumberData");  
        
        
            const[customerDetails,setCustomerDetails]=useState({})
            
        
            useEffect(() => {
              setCustomerDetails({
                Customer_Name: orderDetails?.customerDetails?.Customer_Name || "",
                Customer_Phone: orderDetails?.customerDetails?.Customer_Phone || ""
              })
            },[orderDetails])

            console.log(customerDetails,"customerDetails");
    // const [takeawayAddOrdersAndGenerateInvoices,
    //     {isLoading:istakeawayAddOrdersAndGenerateInvoicesLoading}] = useTakeawayAddOrdersAndGenerateInvoicesMutation();
        const [confirmTakeawayBillAndInvoiceGenerated,
            {isLoading:isConfirmBillAndInvoiceGeneratedLoading}] = useConfirmTakeawayOrderBillPaidAndInvoiceGeneratedMutation();
    const dispatch=useDispatch();
    const navigate=useNavigate();
const [generateSmsForTakeaway, { isLoading:isGenerateSmsLoading }] = useGenerateSmsForTakeawayMutation();
        // const[customerDetails,setCustomerDetails]=useState({})
    

    // useEffect(() => {
    //   setCustomerDetails({
    //     Customer_Name: orderDetails?.customerDetails?.Customer_Name || "",
    //     Customer_Phone: orderDetails?.customerDetails?.Customer_Phone || ""
    //   })
    // },[orderDetails])
    
     const [invoiceDetails, setInvoiceDetails] = useState({
        Sub_Total: orderDetails?.Sub_Total ?? "0.00",
        Amount: orderDetails?.Amount ?? "0.00",
        // Tax_Amount: orderDetails?.order?.Tax_Amount || "0.00",
        // Tax_Type: orderDetails?.order?.Tax_Type || "None",

        // New fields (empty initially)
     Customer_Name: customerDetails?.Customer_Name,
        Customer_Phone: customerDetails?.Customer_Phone,
        // Service_Charge: "0.00",
        Discount: "0.00",
        Discount_Type: "percentage",
        Final_Amount: "0.00",
        Payment_Type: "cash", // default
    });
    console.log(invoiceDetails,"invoiceDetails");
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


       useEffect(() => {
      setInvoiceDetails(prev => ({
        ...prev,
        Customer_Name: customerDetails?.Customer_Name ,
        Customer_Phone: customerDetails?.Customer_Phone ,
      }));
    }, [orderDetails]);
// const handleConfirmBillAndGenerateInvoice = async () => {
//   try {

// const payload = {
//       userId: user?.User_Id,
//       items: orderDetails?.items,
//       Sub_Total: orderDetails?.Sub_Total,
//       Amount: orderDetails?.Sub_Total,      // You can modify if tax applied
//       Final_Amount: invoiceDetails?.Final_Amount,

//       Customer_Name: invoiceDetails.Customer_Name,
//       Customer_Phone: invoiceDetails.Customer_Phone,
//       Discount: invoiceDetails.Discount,
//       Discount_Type: invoiceDetails.Discount_Type,
//       Payment_Type: invoiceDetails.Payment_Type,
//     };
//     console.log(payload,"payload");
//     await takeawayAddOrdersAndGenerateInvoices(payload).unwrap();

//     toast.success("Invoice Generated & Bill Paid!");
//     dispatch(orderApi.util.invalidateTags(["Order"]));
//     printInvoiceWindow();
//     navigate("/staff/orders/all-orders")
//     onClose();
//   } catch (error) {
//     console.error("❌ Error confirming bill and generating invoice:", error);
//     toast.error(error?.data?.message || "Failed to process payment");
//   }
// };
const handleShareSMS = async () => {
  try {
    const payload = {
            userId: user?.User_Id,
      items: orderDetails?.items,
      Sub_Total: orderDetails?.Sub_Total,
      Amount: orderDetails?.Sub_Total,
      Final_Amount: invoiceDetails?.Final_Amount,
      Customer_Name: invoiceDetails.Customer_Name,
      Customer_Phone: invoiceDetails.Customer_Phone,
      Discount: invoiceDetails.Discount,
      Discount_Type: invoiceDetails.Discount_Type,
      Payment_Type: invoiceDetails.Payment_Type,
      // Customer_Name: invoiceDetails?.Customer_Name,
      // Customer_Phone: invoiceDetails?.Customer_Phone,
      // Discount_Type: invoiceDetails?.Discount_Type,
      // Discount: invoiceDetails?.Discount,
      // Service_Charge: invoiceDetails?.Service_Charge,
      // Payment_Type: invoiceDetails?.Payment_Type,
      // Final_Amount: invoiceDetails?.Final_Amount,
    };
    console.log(payload,"payload");

     const response=await generateSmsForTakeaway({
     
      payload,
    }).unwrap();

    toast.success("📩 Bill sent via SMS successfully");
    console.log(response,"response");
    //    if (response?.success === true) {
    //   toast.success("📩 Bill sent via SMS successfully");
    // }
     
    dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
    onClose();
  navigate("/staff/orders/all-orders");
  } catch (err) {
    console.error(err);
    toast.error(err?.data?.message || "Failed to send SMS");
  }
};

// const handleConfirmBillAndGenerateInvoice = async () => {
//   // const printWindow = window.open("", "_blank", "width=320,height=600");

//   // if (!printWindow) {
//   //   toast.error("Please allow pop-ups to print invoice");
//   //   return;
//   // }

//   try {
//     const payload = {
//       userId: user?.User_Id,
//       items: orderDetails?.items,
//       Sub_Total: orderDetails?.Sub_Total,
//       Final_Amount: invoiceDetails?.Final_Amount,
//       Customer_Name: invoiceDetails?.Customer_Name,
//       Customer_Phone: invoiceDetails?.Customer_Phone,
//       Discount: invoiceDetails?.Discount,
//       Discount_Type: invoiceDetails?.Discount_Type,
//       Payment_Type: invoiceDetails?.Payment_Type,
//     };

//     const response=await confirmTakeawayBillAndInvoiceGenerated(payload).unwrap();
//     console.log(response,"response");
//     printInvoiceWindow();
//     toast.success("Invoice Generated & Bill Paid!");
//     dispatch(tableApi.util.invalidateTags(["Table"]));
//     dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
//     dispatch(orderApi.util.invalidateTags(["Order"]));
//     // renderInvoiceHTML(printWindow);
    
//     onClose();
//     navigate("/staff/orders/all-orders");

//   } catch (err) {
//    console.error(err);
//     toast.error("Failed to generate invoice");
//   }
// };


//  const renderInvoiceHTML = (w) => {
//   const getCurrentDate = () => new Date().toLocaleDateString("en-GB");
//   const getCurrentTime = () =>
//     new Date().toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });

//   const total = calculateGrandTotal();

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
//             width: 2.5in;
//             margin: 0 auto;
//             padding: 0;
//           }
          
//           .invoice {
//             width: 2.5in;
//             padding: 8px;
//           }

//           /* CENTER HEADER */
//           .header-center { 
//             text-align: center; 
//             margin-bottom: 8px;
//             border-bottom: 1px dashed #000;
//             padding-bottom: 8px;
//           }
          
//           .logo { 
//             width: 60px; 
//             height: auto; 
//             margin-bottom: 4px;
//             background-color: black;
//           }
          
//           .brand { 
//             font-size: 16px; 
//             font-weight: bold; 
//             text-transform: uppercase;
//             letter-spacing: 1px;
//             margin-bottom: 2px;
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
//             body {
//               width: 2.5in;
//               margin: 0;
//               padding: 0;
//             }
            
//             .invoice {
//               width: 2.5in;
//               padding: 8px;
//             }
            
//             @page {
//               size: 2.5in auto;
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
//             <img  src="${"http://localhost:5173"}/assets/images/restaurant-logo.png" 
//              class="logo" alt="Logo" />
//             <div class="brand">HELLO GUYS</div>
//           </div>

//           <!-- CUSTOMER INFO -->
//           <div class="info-row">
//             <span><span class="info-label">Customer:</span> ${invoiceDetails?.Customer_Name ?? "Walk-in"}</span>
//           </div>
//           ${invoiceDetails?.Customer_Phone ? `
//           <div class="info-row">
//             <span><span class="info-label">Phone:</span> ${invoiceDetails.Customer_Phone}</span>
//           </div>
//           ` : ''}
          
//           <div class="line"></div>

//           <!-- DATE & TIME -->
//           <div class="info-row">
//             <span><span class="info-label">Date:</span> ${getCurrentDate()}</span>
//             <span><span class="info-label">Time:</span> ${getCurrentTime()}</span>
//           </div>
//           <div class="info-row">
//             <span><span class="info-label">Invoice:</span> ${invoiceNumberData?.nextInvoiceNumber ?? "-"}</span>
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
//             (orderDetails?.items || []).map((it, i) => `
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

//   w.document.open();
//   w.document.write(html);
//   w.document.close();
// };
console.log(invoiceDetails,"invoiceDetails");

const handleConfirmBillAndGenerateInvoice = async () => {
  try {
    const payload = {
      Customer_Name: invoiceDetails?.Customer_Name,
      Customer_Phone: invoiceDetails?.Customer_Phone,
      Discount: invoiceDetails?.Discount,
      Discount_Type: invoiceDetails?.Discount_Type ?? "amount",
      Service_Charge: invoiceDetails.Service_Charge,
      Payment_Type: invoiceDetails?.Payment_Type,
      Final_Amount: invoiceDetails?.Final_Amount,
    };
    console.log(payload,"payload");

    // 🔥 API CALL
    const response = await confirmTakeawayBillAndInvoiceGenerated({
      takeawayOrderId,
      payload
    }).unwrap();

    toast.success("Invoice Generated & Bill Paid!");
    console.log(response,"response");
    // RESPONSE MUST INCLUDE invoice number
    //const newInvoiceNumber = response.invoiceNumber; 

    // 🔥 NOW PRINT THE INVOICE
    printInvoiceWindow();

    // Refresh UI & close modal
   
    dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
    dispatch(orderApi.util.invalidateTags(["Order"]));
    onClose();
  navigate("/staff/orders/all-orders");

  } catch (error) {
    console.error("❌ Error confirming bill and generating invoice:", error);
    toast.error(error?.data?.message || "Failed to generate invoice");
  }
};
const printInvoiceWindow = () => {
  const getCurrentDate = () =>
    new Date().toLocaleDateString("en-GB");

  const getCurrentTime = () =>
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const total = calculateGrandTotal();

const html = `
    <!DOCTYPE html>
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
            color: #000;
            width: 2.5in;
            margin: 0 auto;
            padding: 0;
          }
          
          .invoice {
            width: 2.5in;
            padding: 8px;
          }

          /* CENTER HEADER */
          .header-center { 
            text-align: center; 
            margin-bottom: 8px;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
          }
          
          .logo { 
            width: 60px; 
            height: auto; 
            margin-bottom: 4px;
            padding: 5px;
            background-color: black;
          }
          
          .brand { 
            font-size: 16px; 
            font-weight: bold; 
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 2px;
          }
          
          .line { 
            border-top: 1px dashed #000; 
            margin: 6px 0;
          }
          
          .line-solid {
            border-top: 1px solid #000;
            margin: 6px 0;
          }

          /* INFO SECTION */
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
            font-size: 10px;
          }
          
          .info-label {
            font-weight: bold;
          }

          /* ITEMS TABLE */
          .items-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding: 4px 0;
            font-size: 10px;
          }
          
          .item-row {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
            border-bottom: 1px dashed #ddd;
            font-size: 10px;
          }
          
          .item-name {
            flex: 1;
            padding-right: 8px;
            word-wrap: break-word;
          }
          
          .item-qty {
            width: 30px;
            text-align: center;
          }
          
          .item-price {
            width: 50px;
            text-align: right;
          }
          
          .item-amount {
            width: 55px;
            text-align: right;
            font-weight: bold;
          }

          /* SUMMARY */
          .summary {
            margin-top: 8px;
            font-size: 11px;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
          }
          
          .summary-row.total {
            font-size: 13px;
            font-weight: bold;
            border-top: 1px solid #000;
            border-bottom: 2px solid #000;
            margin-top: 4px;
            padding: 5px 0;
          }

          /* FOOTER */
          .footer {
            text-align: center;
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px dashed #000;
            font-size: 10px;
          }
          
          .footer-title {
            font-weight: bold;
            margin-bottom: 4px;
            font-size: 11px;
          }

          /* PRINT STYLES */
          @media print {
            body {
              width: 2.5in;
              margin: 0;
              padding: 0;
            }
            
            .invoice {
              width: 2.5in;
              padding: 8px;
            }
            
            @page {
              size: 2.5in auto;
              margin: 0;
            }
            
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice">

          <!-- HEADER -->
          <div class="header-center">
            <img  src="${"http://localhost:5173"}/assets/images/restaurant-logo.png" 
             class="logo" alt="Logo" />
            <div class="brand">HELLO GUYS</div>
          </div>

          <!-- CUSTOMER INFO -->
          <div class="info-row">
            <span><span class="info-label">Customer:</span> ${invoiceDetails?.Customer_Name ?? "Walk-in"}</span>
          </div>
          ${invoiceDetails?.Customer_Phone ? `
          <div class="info-row">
            <span><span class="info-label">Phone:</span> ${invoiceDetails.Customer_Phone}</span>
          </div>
          ` : ''}
          
          <div class="line"></div>

          <!-- DATE & TIME -->
          <div class="info-row">
            <span><span class="info-label">Date:</span> ${getCurrentDate()}</span>
            <span><span class="info-label">Time:</span> ${getCurrentTime()}</span>
          </div>
          <div class="info-row">
            <span><span class="info-label">Invoice:</span> ${invoiceNumberData?.nextInvoiceNumber ?? "-"}</span>
          </div>

          <div class="line-solid"></div>

          <!-- ITEMS HEADER -->
          <div class="items-header">
            <div style="width: 30px;">#</div>
            <div class="item-name">ITEM</div>
            <div class="item-qty">QTY</div>
            <div class="item-amount">AMOUNT</div>
          </div>

          <!-- ITEMS LIST -->
          ${
            (orderDetails?.items || []).map((it, i) => `
              <div class="item-row">
                <div style="width: 30px;">${i + 1}</div>
                <div class="item-name">${it.Item_Name ?? "-"}</div>
                <div class="item-qty">${it.Item_Quantity ?? 1}</div>
                <div class="item-amount">₹${Number(it.Amount ?? 0).toFixed(2)}</div>
              </div>
            `).join("")
          }

          <div class="line-solid"></div>

          <!-- SUMMARY -->
          <div class="summary">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹${Number(invoiceDetails?.Sub_Total ?? 0).toFixed(2)}</span>
            </div>
            ${Number(invoiceDetails?.Service_Charge ?? 0) > 0 ? `
            <div class="summary-row">
              <span>Service Charge</span>
              <span>₹${Number(invoiceDetails.Service_Charge).toFixed(2)}</span>
            </div>
            ` : ''}
            ${invoiceDetails?.Discount && Number(invoiceDetails.Discount) > 0 ? `
            <div class="summary-row">
              <span>Discount</span>
              <span>${
                invoiceDetails.Discount_Type === "percentage"
                  ? `${invoiceDetails.Discount}%`
                  : `₹${invoiceDetails.Discount}`
              }</span>
            </div>
            ` : ''}
            <div class="summary-row total">
              <span>TOTAL</span>
              <span>₹${Number(total).toFixed(2)}</span>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="footer">
            <div class="footer-title">THANK YOU!</div>
            <div>Please Visit Again</div>
          </div>

        </div>
      </body>
    </html>
  `;
  const w = window.open("", "_blank", "width=320,height=600");

  if (!w) {
    alert("Please allow pop-ups to print the invoice.");
    return;
  }

  w.document.write(html);
//   w.document.write(`
//   <button onclick="window.print()" 
//     style="position:fixed;top:10px;right:10px;padding:8px 12px;
//            background:#ff0000;color:white;border:none;border-radius:4px;
//            font-size:14px;cursor:pointer;z-index:9999;">
//       Print
//   </button>
// `);
  w.document.close();
};


// };
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
      style={{marginBottom:"10px"}}>
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
        
        <div className="border-b border-gray-300 flex space-x-8 mt-6">
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
    {/* <span className="text-red-500 font-bold text-lg">&nbsp;*</span> */}
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

                        //onChange={(e)=> setInvoiceDetails({ ...invoiceDetails, Customer_Phone: e.target.value })}
                        
                        className="w-full outline-none border-b-1  text-gray-900"
                      />
                     
                    </div>
  
  
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
          
<div style={{width:"100%",marginTop:"10px"}}
className="input-field col s6 flex flex-col gap-1">

  <span className="active ">
    Discount
  </span>

  <div className="flex items-center gap-2 w-full">

  

    {/* Discount Input */}
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
      {/* Discount Type Selector */}
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


  

    
 
    <div style={{width:"100%",marginTop:"16px"}}
    className="input-field col s6 ">
                      <span className="active">Payment Type</span>
                      {/* <span className="text-red-500 font-bold text-lg">&nbsp;*</span> */}
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

                    {/* <button
                      type="button"
                      
                      className=" text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "#ff0000" }}
                    >
                      Print
                    </button>  */}
                  </div> 
    </div>} 
    
{activeTab === "Invoice Details" && (
  <div className="flex flex-col w-full items-center">

    <h4 className="text-2xl font-bold mt-2 mb-2">Invoice Preview</h4>

    {/* WRAPPER WITH FIXED HEIGHT & SCROLL */}
    <div className="w-full max-w-md bg-white shadow-md border rounded-lg p-6
                    max-h-[70vh] overflow-y-auto">

   
      <div className="relative flex items-center justify-center mb-4">
  {/* LOGO CENTER */}
  <img
  style={{backgroundColor:"black",padding:"5px"}}
    src="/assets/images/restaurant-logo.png"
    alt="logo"
    className="w-16 h-auto "
  />

  {/* SHARE BUTTON TOP-RIGHT */}
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
{/* STORE NAME */}
<h2 className="text-xl font-bold text-center">
   HELLO GUYS
</h2>
      <div className="border-t my-3"></div>

      {/* CUSTOMER INFO */}
      <div className="flex justify-between text-sm">
        <div>
          <p><strong>Customer:</strong> {customerDetails?.Customer_Name}</p>
          <p><strong>Phone:</strong> {customerDetails?.Customer_Phone}</p>
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
                <th  class="text-right">Amount</th>
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

      {/* SUMMARY TABLE */}
      <table className="w-full text-sm">
        <tbody>
          <tr>
            <td className="py-1">Subtotal</td>
            <td className="py-1 text-right">₹{invoiceDetails.Sub_Total}</td>
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

      {/* BUTTONS */}
      <div className="flex justify-center gap-3">
        <button
          type="button"
           disabled={isConfirmBillAndInvoiceGeneratedLoading}
         onClick={()=>handleConfirmBillAndGenerateInvoice()}
          className="px-5 py-2 bg-green-600 text-white rounded-lg
           shadow hover:bg-green-700 transition"
        >
          {isConfirmBillAndInvoiceGeneratedLoading ? "Generating ..." : "Generate Bill & Invoice"}
        </button>
      </div>
    </div>
  </div>
)}

 </div>

  </div>
);

}

