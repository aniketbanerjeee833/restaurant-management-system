import { useState } from "react";
import { orderApi, useNextInvoiceNumberQuery, useTakeawayAddOrdersAndGenerateInvoicesMutation } from "../../redux/api/Staff/orderApi";
import { toast } from "react-toastify";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";



export default function OrderTakeawayModal({ onClose, orderDetails }) {
    console.log(orderDetails,"orderDetails");
    const {user}=useSelector((state) => state.user);
    const [activeTab, setActiveTab] = useState("Order Details");
        const{data:invoiceNumberData}=useNextInvoiceNumberQuery();
        console.log(invoiceNumberData,"invoiceNumberData");  
    const [takeawayAddOrdersAndGenerateInvoices,
        {isLoading:istakeawayAddOrdersAndGenerateInvoicesLoading}] = useTakeawayAddOrdersAndGenerateInvoicesMutation();
    const dispatch=useDispatch();
    const navigate=useNavigate();

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
     Customer_Name: orderDetails?.Customer_Name,
        Customer_Phone: orderDetails?.Customer_Phone,
        Service_Charge: "0.00",
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
        Customer_Name: orderDetails?.Customer_Name ,
        Customer_Phone: orderDetails?.Customer_Phone ,
      }));
    }, [orderDetails]);
const handleConfirmBillAndGenerateInvoice = async () => {
  try {
    //const finalAmount = calculateGrandTotal();

    // const payload = {
    //   Customer_Name: invoiceDetails.Customer_Name,
    //   Customer_Phone: invoiceDetails.Customer_Phone,
    //   Discount: invoiceDetails.Discount,
    //   Discount_Type: invoiceDetails.Discount_Type ?? "percentage",
      
    //   Payment_Type: invoiceDetails.Payment_Type,
    //   Final_Amount: invoiceDetails.Final_Amount,
    //   items:orderDetails?.items
    // };
const payload = {
      userId: user?.User_Id,
      items: orderDetails?.items,
      Sub_Total: orderDetails?.Sub_Total,
      Amount: orderDetails?.Sub_Total,      // You can modify if tax applied
      Final_Amount: invoiceDetails?.Final_Amount,

      Customer_Name: invoiceDetails.Customer_Name,
      Customer_Phone: invoiceDetails.Customer_Phone,
      Discount: invoiceDetails.Discount,
      Discount_Type: invoiceDetails.Discount_Type,
      Payment_Type: invoiceDetails.Payment_Type,
    };
    console.log(payload,"payload");
    await takeawayAddOrdersAndGenerateInvoices(payload).unwrap();

    toast.success("Invoice Generated & Bill Paid!");
    dispatch(orderApi.util.invalidateTags(["Order"]));
    printInvoiceWindow();
    navigate("/staff/orders/all-orders")
    onClose();
  } catch (error) {
    console.error("❌ Error confirming bill and generating invoice:", error);
    toast.error(error?.data?.message || "Failed to process payment");
  }
};
 const printInvoiceWindow = () => {
// Format: DD/MM/YYYY
const getCurrentDate = () => {
  return new Date().toLocaleDateString("en-GB");
};

// Format: HH:MM AM/PM (no seconds)
const getCurrentTime = () => {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

  const total = calculateGrandTotal();

  const html = `
    <html>
      <head>
        <title>Invoice - ${invoiceDetails?.Invoice_Number ?? ""}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial; 
            color:#111; margin:0; padding:12px;
          }
          .invoice { max-width: 700px; margin: 0 auto; }

          /* CENTER HEADER */
          .header-center { text-align:center; margin-bottom:10px; }
          .logo { width:80px; height:auto; margin-bottom:6px; }
          .brand { font-size:22px; font-weight:700; letter-spacing:0.5px; }
          .line { border-top:1px solid #ddd; margin:10px 0; }

          /* CUSTOMER + DATE ROW */
          .top-info { display:flex; justify-content:space-between; margin: 8px 0; }
          .left, .right { font-size:14px; }
          .right { text-align:right; }

          /* ITEMS TABLE */
          table { width:100%; border-collapse:collapse; margin-top:10px; }
          th, td { padding:8px 6px; border:1px solid #e5e5e5; font-size:14px; }
          th { background:#f2f2f2; text-align:left; font-weight:600; }
          .text-right { text-align:right; }

          /* SUMMARY BOX */
          .summary { 
            width:100%;
            display:flex;
            justify-content:center;
            align-items:center; 
            
          }
            .center {
               width:100%;
            display:flex;
            flex-direction:column;
            justify-content:center;
            align-items:center; 
            }
          .summary table td { padding:6px; font-size:14px; }
          .total { font-size:17px; font-weight:700; }

          /* PRINT MODE */
          @media print {
            body { padding: 6mm; }
            @page { size: auto; margin: 6mm; }
          }
        </style>
      </head>
      <body>
        <div class="invoice">

          <!-- ===== TOP CENTER LOGO & NAME ===== -->
          <div class="header-center">
            <img src="/logo.png" class="logo" />
            <div class="brand">${invoiceDetails?.Store_Name ?? "Restaurant"}</div>
          </div>

          <div class="line"></div>

          <!-- ===== CUSTOMER + DATE BLOCK ===== -->
          <div class="top-info">
            <div class="left">
              <div><strong>Customer:</strong> ${invoiceDetails?.Customer_Name ?? "Walk-in"}</div>
              <div><strong>Phone:</strong> ${invoiceDetails?.Customer_Phone ?? "-"}</div>
            </div>

    <div class="right">
  <div><strong>Date:</strong> ${getCurrentDate()}</div>
  <div><strong>Time:</strong> ${getCurrentTime()}</div>
  <div><strong>Invoice No:</strong> ${invoiceNumberData?.nextInvoiceNumber ?? "-"}</div>
</div>


          </div>

          <div class="line"></div>

          <!-- ===== ITEMS TABLE ===== -->
          <table>
            <thead>
              <tr>
                <th style="width:8%;">Sl.No</th>
                <th style="width:48%;">Item</th>
                <th style="width:14%;">Qty</th>
                <th style="width:15%;">Price</th>
                <th style="width:15%;" class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${
                (orderDetails?.items || []).map((it, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${it.Item_Name ??  "-"}</td>
                    <td>${it.Item_Quantity  ?? 1}</td>
                    <td>${Number(it.Amount??  0).toFixed(2)}</td>
                    <td class="text-right">${Number(it.Amount ?? 0).toFixed(2)}</td>
                  </tr>
                `).join("")
              }
            </tbody>
          </table>

          <!-- ===== SUMMARY (CENTERED) ===== -->
          <div class="summary">
            <table style="width:100%;">
              <tr>
                <td>Subtotal</td>
                <td class="text-right">₹${Number(invoiceDetails?.Sub_Total ?? 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Service Charge</td>
                <td class="text-right">₹${Number(invoiceDetails?.Service_Charge ?? 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Discount</td>
                <td class="text-right">
                  ${
                    invoiceDetails?.Discount_Type === "percentage"
                      ? `${invoiceDetails.Discount}%`
                      : `₹${invoiceDetails.Discount ?? 0}`
                  }
                </td>
              </tr>
              <tr>
                <td class="total">Total</td>
                <td class="text-right total">₹${Number(total).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="line"></div>
          <div class="center muted">
          <h4>Terms & Conditions</h4>
          <span>Thank you. Please Visit again.</span>
          </div>

        </div>
      </body>
    </html>
  `;

  const w = window.open(
  "",
  "_blank",
  `toolbar=0,location=0,menubar=0,
   width=${window.screen.availWidth},
   height=${window.screen.availHeight},
   left=0,top=0`
);

if (!w) return alert("Allow pop-ups to print the invoice.");

w.document.write(html);

// Add Print Button inside the new window
w.document.write(`
  <button onclick="window.print()" 
    style="position:fixed;top:10px;right:10px;padding:8px 12px;
            background:#4CA1AF;color:white;border:none;border-radius:4px;
           font-size:14px;cursor:pointer;z-index:9999;">
      Print
  </button>
`);

w.document.close();
 }

//   const w = window.open(
//   "",
//   "_blank",
//   `toolbar=0,location=0,menubar=0,
//    width=${window.screen.availWidth},
//    height=${window.screen.availHeight},
//    left=0,top=0`
// );
//   if (!w) return alert("Allow pop-ups to print the invoice.");
//   w.document.write(html);
//   w.document.close();

//   setTimeout(() => { w.print(); }, 300);
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
    value={invoiceDetails?.Customer_Name}

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
                         value={invoiceDetails?.Customer_Phone}

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

{/* 
  <div  style={{width:"100%",marginTop:"16px"}}
  className="input-field col s6 ">
      <span className="active">
          Service Charge
          
      </span>

      <input
  type="text"
  id="Service_Charge"
  value={invoiceDetails?.Service_Charge}
//   value={dailyExpense?.Amount}
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

      
     
  </div> */}
  

    
 
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
                       {/* <button
                      type="button"
    //               onClick={handleSave}
    //   disabled={isLoading}
                      className=" text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "#4CA1AF" }}
                    >
                        Next 
                       
                    </button> */}
                    <button
  type="button"
  onClick={() => setActiveTab("Invoice Details")}
  className="text-white font-bold py-2 px-4 rounded"
  style={{ backgroundColor: "#4CA1AF" }}
>
  Next
</button>

                    {/* <button
                      type="button"
                      
                      className=" text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "#4CA1AF" }}
                    >
                      Print
                    </button>  */}
                  </div> 
    </div>} 
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
      {/* <p><strong>Service Charge:</strong> ₹{invoiceDetails?.Service_Charge}</p> 
      <p><strong>Discount:</strong> {invoiceDetails.Discount_Type === "percentage"
          ? `${invoiceDetails.Discount}%`
          : `₹${invoiceDetails.Discount}`}</p>

      {/* Calculate Grand Total dynamically 
      <p className="text-xl font-bold mt-3">
        Total: ₹{calculateGrandTotal()}
      </p>

      <hr className="my-4" />

        <div className="flex ">
      {/* <button
      type="button"
      disabled
      
        // onClick={() => setActiveTab()}
        className="px-4 py-2 bg-gray-300 rounded mr-2"
      >
       Close
      </button> 

      <button
      type="button"
      disabled={istakeawayAddOrdersAndGenerateInvoicesLoading}
         onClick={()=>handleConfirmBillAndGenerateInvoice()}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {istakeawayAddOrdersAndGenerateInvoicesLoading ? "Generating ..." : "Generate Bill & Invoice"}
      </button>
       </div>
    </div>

  </div>

)} */}

{activeTab === "Invoice Details" && (
  <div className="flex flex-col w-full items-center">

    <h4 className="text-2xl font-bold mt-2 mb-2">Invoice Preview</h4>

    {/* WRAPPER WITH FIXED HEIGHT & SCROLL */}
    <div className="w-full max-w-md bg-white shadow-md border rounded-lg p-6
                    max-h-[70vh] overflow-y-auto">

      {/* HEADER */}
      <div className="flex flex-col items-center mb-4">
        <img src="/logo.png" alt="logo" className="w-16 h-auto mb-2" />
        <h2 className="text-xl font-bold">{invoiceDetails.Store_Name ?? "Restaurant"}</h2>
      </div>

      <div className="border-t my-3"></div>

      {/* CUSTOMER INFO */}
      <div className="flex justify-between text-sm">
        <div>
          <p><strong>Customer:</strong> {invoiceDetails.Customer_Name}</p>
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
           disabled={istakeawayAddOrdersAndGenerateInvoicesLoading}
         onClick={()=>handleConfirmBillAndGenerateInvoice()}
          className="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          {istakeawayAddOrdersAndGenerateInvoicesLoading ? "Generating ..." : "Generate Bill & Invoice"}
        </button>
      </div>
    </div>
  </div>
)}

 </div>

  </div>
);

}