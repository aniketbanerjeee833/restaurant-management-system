import { useEffect, useRef, useState } from "react";
import { 
     useConfirmPreOrderBillPaidAndInvoiceGeneratedMutation, useGenerateSmsForPreBookedMutation, useGenerateSmsMutation, useGetAllCustomersQuery, useNextInvoiceNumberQuery } from "../../redux/api/Staff/orderApi";
import { toast } from "react-toastify";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";




export default function PreBookBillModal({ onClose, orderDetails,Pre_Book_Order_Id,selectedTables }) {
    console.log(orderDetails,"orderDetails",Pre_Book_Order_Id);
    // const [activeTab, setActiveTab] = useState("Order Details");  
const{ data: customers}=useGetAllCustomersQuery();
    console.log(customers,"customers");
     const [customerSearch, setCustomerSearch] = useState("");
  
     const[customerDropdownOpen,setCustomerDropdownOpen]=useState(false);
        // const[customerModal,setShowCustomerModal]=useState(false);
          //const[addParty, { isLoading }] = useAddPartyMutation();
       const [isExistingCustomer, setIsExistingCustomer] = useState(false);
    const{data:invoiceNumberData}=useNextInvoiceNumberQuery();

    // const[customerDetails,setCustomerDetails]=useState({})
    console.log(invoiceNumberData,"invoiceNumberData");
  const[invoiceNumber,setInvoiceNumber]=useState("")
    // useEffect(() => {
    //   setCustomerDetails({
    //     Customer_Name: orderDetails?.customerDetails?.Customer_Name || "",
    //     Customer_Phone: orderDetails?.customerDetails?.Customer_Phone || ""
    //   })
    // },[orderDetails])
    // const [confirmBillAndInvoiceGenerated,
    //     {isLoading:isConfirmingBillAndInvoiceGeneratedLoading}] = useConfirmOrderBillPaidAndInvoiceGeneratedMutation();
    const[confirmPreOrderBillAndInvoiceGenerated,{isLoading:isConfirmingPreOrderBillAndInvoiceGeneratedLoading}]=useConfirmPreOrderBillPaidAndInvoiceGeneratedMutation();
    
    //const dispatch=useDispatch();
    const navigate=useNavigate();
const [generateSmsForPreBooked, { isLoading:isGenerateSmsForPreBookedLoading }] = useGenerateSmsForPreBookedMutation();
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
        Customer_Name: orderDetails?.Customer_Name,
        Customer_Phone: orderDetails?.Customer_Phone,
        Service_Charge: "0.00",
        Discount: "0.00",
        Discount_Type: "percentage",
        Final_Amount: "0.00",
        Advance_Payment:orderDetails?.Advance_Payment,
        Payment_Left:orderDetails?.Payment_Left,
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
// const calculatePaymentLeft = () => {
//   const grandTotal = Number(calculateGrandTotal());
//   const advance = Number(invoiceDetails?.Advance_Payment || 0);

//   const paymentLeft = grandTotal - advance;
 

//   return paymentLeft > 0 ? paymentLeft.toFixed(2) : "0.00";
// };
   useEffect(() => {
  setInvoiceDetails(prev => ({
    ...prev,
    Customer_Name: orderDetails?.Customer_Name || "",
    Customer_Phone: orderDetails?.Customer_Phone || "",
    
  }));
}, [orderDetails]);
useEffect(() => {
  const subtotal = Number(invoiceDetails?.Sub_Total || 0);
  const service = Number(invoiceDetails?.Service_Charge || 0);
  let discount = Number(invoiceDetails?.Discount || 0);

  if (invoiceDetails?.Discount_Type === "percentage") {
    discount = (subtotal * discount) / 100;
  }

  const total = subtotal + service - discount;
  const advance = Number(invoiceDetails?.Advance_Payment || 0);

  const left = total - advance;

  // setInvoiceDetails(prev => ({
  //   ...prev,
  //   Payment_Left: left > 0 ? left.toFixed(2) : "0.00",
    
  // }));
    setInvoiceDetails(prev => ({
    ...prev,
    Payment_Left: left > 0 ? left.toFixed(2) : left.toFixed(2),
    
  }));
}, [
  invoiceDetails?.Sub_Total,
  invoiceDetails?.Service_Charge,
  invoiceDetails?.Discount,
  invoiceDetails?.Discount_Type,
  invoiceDetails?.Advance_Payment,
]);

const formValues=watch()

console.log(formValues,"formValues");
const watchedCustomerName = watch("Customer_Name");
const watchedCustomerPhone = watch("Customer_Phone");
const handleConfirmBillAndGenerateInvoice = async () => {
  try {
    const payload = {
      Customer_Name: watchedCustomerName || null,
      Customer_Phone: watchedCustomerPhone || null,
      Discount: invoiceDetails?.Discount || 0,
      Discount_Type: invoiceDetails?.Discount_Type ?? "amount",
      Service_Charge: invoiceDetails?.Service_Charge || 0,
      Payment_Type: invoiceDetails?.Payment_Type,
      Final_Amount: invoiceDetails?.Final_Amount,
      Payment_Left: invoiceDetails?.Payment_Left,
    };

    console.log(payload, "payload");

    const response = await confirmPreOrderBillAndInvoiceGenerated({
      Pre_Book_Order_Id, // ✅ correct name
      payload,
    }).unwrap();

    toast.success("Invoice Generated & Bill Paid!");
    console.log(response, "response");

    // 🔥 BACKEND RETURNS Pre_Book_Invoice_Id (NOT Invoice_Id)
    const preBookInvoiceId = response.Pre_Book_Invoice_Id;

    setInvoiceNumber(preBookInvoiceId);
    printInvoiceWindow(preBookInvoiceId);

    onClose();

     setTimeout(() => {
                navigate("/staff/pre-book-order/all-pre-booked-orders");
              }, 100);

  } catch (error) {
    console.error("❌ Error confirming bill and generating invoice:", error);
    toast.error(error?.data?.message || "Failed to generate invoice");
  }
};


const handleShareSMS = async () => {
  try {
    const payload = {
      Customer_Name: watchedCustomerName,
      Customer_Phone: watchedCustomerPhone,
      Discount_Type: invoiceDetails?.Discount_Type,
      Discount: invoiceDetails?.Discount,
      Service_Charge: invoiceDetails?.Service_Charge,
      Payment_Type: invoiceDetails?.Payment_Type,
      Final_Amount: invoiceDetails?.Final_Amount,
    };
    console.log(payload,"payload");

     const response=await generateSmsForPreBooked({
      Pre_Book_Order_Id: Pre_Book_Order_Id,
      payload,
    }).unwrap();

    toast.success("📩 Bill sent via SMS successfully");
    console.log(response,"response");
       
    // dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
    onClose();
     navigate("/staff/pre-book-order/all-pre-booked-orders");

  } catch (err) {
    console.error(err);
       toast.warning(
          "⚠️ SMS request processed.it may take time.",
          { autoClose: 5000 }
        );
    // toast.error(err?.data?.message || "Failed to send SMS");
  }
};

 console.log(invoiceDetails,"invoiceDetails");


const printInvoiceWindow = (preBookInvoiceId) => {
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
// const paymentLeft = calculatePaymentLeft();

const html=`<!DOCTYPE html>
<html>
<head>
  <title>Invoice - ${orderDetails?.preBookInvoiceId ?? ""}</title>
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

${selectedTables && selectedTables.length > 0 && `
  <div class="header-middle">
    <b>TABLE: ${Array.isArray(selectedTables)
      ? selectedTables.join(", ")
      : "-"}</b>
  </div>
`}



 <div class="info-row date-time">
  <span><b>Date:</b> ${getCurrentDate()}</span>
  <span><b>Time:</b> ${getCurrentTime()}</span>
</div>


    <div class="info-row">
      <span><b>Invoice:</b> ${preBookInvoiceId || "-"}</span>
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

        ${invoiceDetails?.Advance_Payment ? `
      <div class="summary-row">
        <span>Advance</span>
        <span>
          ${
            "₹" + invoiceDetails.Advance_Payment}
        </span>
      </div>` : ``}


   ${Number(invoiceDetails?.Payment_Left) !== 0 ? `
  <div class="summary-row">
    <span>
      ${Number(invoiceDetails.Payment_Left) < 0 ? "Extra Paid" : "Payment Left"}
    </span>
    <span>
      ₹${Math.abs(Number(invoiceDetails.Payment_Left)).toFixed(2)}
    </span>
  </div>
` : ``}
    </div>

    <div class="footer">
      <b>THANK YOU!</b><br>
      Please Visit Again
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
  if (orderDetails?.Customer_Phone) {
    setCustomerSearch(orderDetails.Customer_Phone);

    setValue("Customer_Phone", orderDetails.Customer_Phone);
    setValue("Customer_Name", orderDetails.Customer_Name || null);

    setIsExistingCustomer(true); // important
  }
}, [invoiceDetails, setValue]);
const isInvoiceCustomerLocked = Boolean(
  orderDetails?.Customer_Phone
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
        
       
<div className="w-full mb-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* REMOVE THE TAB BUTTONS - NO MORE TABS */}
  
  {/* ORDER DETAILS SECTION - Always Visible */}
  <div className="bg-white mb-4 border rounded-lg p-2  max-h-[80vh]">
    <h3 className="text-xl text-center font-bold mb-2 text-gray-800">Order Details</h3>
    
    <div className="bg-gray-50 p-2 max-h-[70vh]">
      
      
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
 <div className="grid grid-rows-3  ">
      <div className="flex gap-4  w-full" style={{width:"100%",marginTop:"5px"}}>
 {/* PAYMENT LEFT */}
  {/* <div className="flex flex-col gap-1 w-1/2">
    <span className="active">Payment Left</span>
    <input
      type="text"
      value={invoiceDetails.Payment_Left}
      readOnly
      className="border-b-2 outline-none pb-1 text-gray-500 bg-gray-50 cursor-not-allowed"
    />
  </div> */}

  <div className="flex flex-col gap-1 w-1/2">
  <span className="active">
    {Number(invoiceDetails?.Payment_Left) < 0
      ? "Extra Paid"
      : "Payment Left"}
  </span>

  <input
    type="text"
    value={Math.abs(Number(invoiceDetails?.Payment_Left || 0)).toFixed(2)}
    readOnly
    className="
      border-b-2 outline-none pb-1 text-gray-500  bg-gray-50 cursor-not-allowed"
     
    
  />
</div>

  {/* ADVANCE PAYMENT */}
  <div className="flex flex-col gap-1 w-1/2">
    <span className="active">Advance Payment</span>
    <input
      type="text"
      value={invoiceDetails.Advance_Payment}
    readOnly
    //   onChange={(e) => {
    //     let val = e.target.value.replace(/[^0-9.]/g, "");
    //     const parts = val.split(".");
    //     if (parts.length > 2) {
    //       val = parts[0] + "." + parts.slice(1).join("");
    //     }
    //     if (val.includes(".")) {
    //       const [int, dec] = val.split(".");
    //       val = int + "." + dec.slice(0, 2);
    //     }

    //     const finalAmount = Number(invoiceDetails.Final_Amount || 0);
    //     if (Number(val) > finalAmount) {
    //       val = finalAmount.toString();
    //     }

    //     const paymentLeft = finalAmount - Number(val || 0);

    //     setInvoiceDetails({
    //       ...invoiceDetails,
    //       Advance_Payment: val,
    //       Payment_Left: paymentLeft.toFixed(2),
    //     });
    //   }}
      placeholder="0.00"
      className="border-b-2 outline-none pb-1 text-gray-900 cursor-not-allowed"
    />
  </div>

 

</div>

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
<div className="flex gap-4  w-full" style={{width:"100%",marginTop:"5px"}} >
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
  </div>

  {/* INVOICE DETAILS SECTION - Always Visible Below */}
  <div className="bg-white mb-4 border rounded-lg p-2">
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

        {invoiceDetails?.Advance_Payment > 0 && (
      <tr>
        <td style={{ padding: "2px 4px" }}>Advance</td>
        <td style={{ padding: "2px 4px", textAlign: "right" }}>
          ₹{Number(invoiceDetails.Advance_Payment).toFixed(2)}
        </td>
      </tr>
    )}

     {invoiceDetails?.Payment_Left > 0 && (
      <tr>
        <td style={{ padding: "2px 4px" }}>Payment_Left</td>
        <td style={{ padding: "2px 4px", textAlign: "right" }}>
          ₹{Number(invoiceDetails?.Payment_Left).toFixed(2)}
        </td>
      </tr>
    )}
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
            disabled={isConfirmingPreOrderBillAndInvoiceGeneratedLoading}
            onClick={handleConfirmBillAndGenerateInvoice}
            className="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            {isConfirmingPreOrderBillAndInvoiceGeneratedLoading ? "Generating..." : "Print Bill"}
          </button>
          <button
            type="button"
            
            disabled={isGenerateSmsForPreBookedLoading}
            onClick={() => handleShareSMS()}
            className="absolute right-0 top-0 px-4 py-2 bg-green-600 text-white 
                       rounded-lg shadow hover:bg-green-700 transition"
          >
            {isGenerateSmsForPreBookedLoading ? "Sharing..." : "Share"}
          </button>
        </div>
    </div>
  </div>
</div>

 </div>

  </div>
);

}
