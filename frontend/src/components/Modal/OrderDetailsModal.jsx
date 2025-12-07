import { useState } from "react";
import { useConfirmOrderBillPaidAndInvoiceGeneratedMutation } from "../../redux/api/Staff/orderApi";
import { toast } from "react-toastify";
import { tableApi } from "../../redux/api/tableApi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";



export default function OrderDetailsModal({ onClose, orderDetails,orderId }) {
    console.log(orderDetails,"orderDetails");
    const [activeTab, setActiveTab] = useState("Order Details");  
    const [confirmBillAndInvoiceGenerated,
        {isLoading:isConfirmingBillAndInvoiceGeneratedLoading}] = useConfirmOrderBillPaidAndInvoiceGeneratedMutation();
    const dispatch=useDispatch();
    const navigate=useNavigate();
     const [invoiceDetails, setInvoiceDetails] = useState({
        Sub_Total: orderDetails?.Sub_Total ?? "0.00",
        Amount: orderDetails?.Amount ?? "0.00",
        // Tax_Amount: orderDetails?.order?.Tax_Amount || "0.00",
        // Tax_Type: orderDetails?.order?.Tax_Type || "None",

        // New fields (empty initially)
        Customer_Name: "",
        Customer_Phone: "",
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

const handleConfirmBillAndGenerateInvoice = async () => {
  try {
    //const finalAmount = calculateGrandTotal();

    const payload = {
      Customer_Name: invoiceDetails.Customer_Name,
      Customer_Phone: invoiceDetails.Customer_Phone,
      Discount: invoiceDetails.Discount,
      Discount_Type: invoiceDetails.Discount_Type ?? "amount",
      Service_Charge: invoiceDetails.Service_Charge,
      Payment_Type: invoiceDetails.Payment_Type,
      Final_Amount: invoiceDetails.Final_Amount,
    };

    await confirmBillAndInvoiceGenerated({
      orderId,
      payload
    }).unwrap();

    toast.success("Invoice Generated & Bill Paid!");
    dispatch(tableApi.util.invalidateTags(["Table"]));
    navigate("/staff/orders/all-orders")
    onClose();
  } catch (error) {
    console.error("❌ Error confirming bill and generating invoice:", error);
    toast.error(error?.data?.message || "Failed to process payment");
  }
};

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
    // type={editingDailyExpense ? "date" : "text"}
    id="Customer_Name"
    value={invoiceDetails?.Customer_Name}

    onChange={(e)=> setInvoiceDetails({ ...invoiceDetails, Customer_Name: e.target.value })}
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
                         value={invoiceDetails?.Customer_Phone}
//                           onChange={(e) => {
//     if (editingDailyExpense) {
//       setDailyExpense({ ...dailyExpense, Purpose: e.target.value }); // update parent state
//     }
//   }}
                        //   readOnly={!editingDailyExpense}
                        
                        // {...register("Purpose")}
                        // {...register("Purpose")}
                        onChange={(e)=> setInvoiceDetails({ ...invoiceDetails, Customer_Phone: e.target.value })}
                        
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


  <div  style={{width:"100%",marginTop:"16px"}}
  className="input-field col s6 ">
      <span className="active">
          Service Charge
          {/* <span className="text-red-500 font-bold text-lg">&nbsp;*</span> */}
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
    {activeTab === "Invoice Details" && (
  <div className="flex flex-col">

        <div className="flex justify-center items-center">
    <h4 className="text-xl flex font-bold mb-4 mt-4 ">Invoice Preview</h4>
    </div>

    <div className="border p-4 flex flex-col rounded bg-gray-50 items-center justify-center">

      <p><strong>Customer:</strong> {invoiceDetails.Customer_Name}</p>
      <p><strong>Phone:</strong> {invoiceDetails.Customer_Phone}</p>

      <hr className="my-3" />

      <p><strong>Subtotal:</strong> ₹{invoiceDetails.Sub_Total}</p>
      {/* <p><strong>Tax:</strong> ₹{invoiceDetails.Tax_Amount}</p> */}
      <p><strong>Service Charge:</strong> ₹{invoiceDetails?.Service_Charge}</p>
      <p><strong>Discount:</strong> {invoiceDetails.Discount_Type === "percentage"
          ? `${invoiceDetails.Discount}%`
          : `₹${invoiceDetails.Discount}`}</p>

      {/* Calculate Grand Total dynamically */}
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
      </button> */}

      <button
      type="button"
      disabled={isConfirmingBillAndInvoiceGeneratedLoading}
         onClick={()=>handleConfirmBillAndGenerateInvoice()}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {isConfirmingBillAndInvoiceGeneratedLoading ? "Generating ..." : "Generate Bill & Invoice"}
      </button>
       </div>
    </div>

  </div>

)}
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