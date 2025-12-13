import { toast } from "react-toastify";

import { useForm } from "react-hook-form";
import { useAddNewCustomerMutation } from "../../redux/api/Staff/orderApi";



export default function AddCustomerModal({ onClose}) {
        
       
       
    
        //const[addParty, { isLoading }] = useAddPartyMutation();
     
          const {
            
            register,
            handleSubmit,
           
         
            formValues,
            setValue,
        
            formState: { errors },
          } = useForm()
    
    const[addCustomer, { isLoading }] = useAddNewCustomerMutation();



//       const handleSave = async () => {
//     try {
//       const res = await editSingleDailyExpense({
//       expenseId: dailyExpense?.Expense_Id,
//       body: dailyExpense,
//     }).unwrap();
//     console.log(" successfully:", res);
//       const resData = res?.data || res;
//       console.log(resData);
//       if(!resData?.success) {
//         toast.error("Update Failed!");
//         return;
//       }else{
//         toast.success("Daily Expense Updated Successfully!");
//           onClose();  // close modal
//       }
    
//     } catch (err) {
//       toast.error(err?.data?.message || "Daily Expense Update Failed!");
//       console.error("Daily Expense Update error:", err);
//     }
//   };
    
       const onSubmit = async (data) => {
            console.log("Form Data (from RHF):", data);
        try{
            const res = await addCustomer(data).unwrap();
            console.log(" successfully:", res);
            const resData = res?.data || res;
            console.log(resData);
            if(!resData?.success) {
              toast.error("Customer Add Failed!");
              return;
            }else{
              toast.success("Customer Added Successfully!");
                onClose();  // close modal
            }
          
          } catch (err) {
            toast.error(err?.data?.message || "Customer Add Failed!");
            console.error("Customer Add error:", err);
        }
       }

       console.log("errors",errors);
       console.log(formValues,"formValues");
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
     
       <div className="flex justify-between items-center mb-6"
      style={{marginBottom:"20px",paddingBottom:"10px"}}>
        <h4 className="text-xl font-semibold text-gray-900">
          Add Customer
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

         <form onSubmit={handleSubmit(onSubmit)}>
    <div >
      <div className="row flex gap-2">
  

<div className="input-field col s6 ">
  <span className="active">
    Customer Name
    <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
  </span>

  <input
    type="text"
    id="Date"
 
    
    {...register("Customer_Name", { required: true })}
    className="w-full outline-none border-b-2 text-gray-900"
  />
</div>

 <div className="input-field col s6 ">
      <span className="active">
         Customer Phone
          <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
      </span>

      <input
  type="text"
  id="Customer_Phone"
    {...register("Customer_Phone")}
//   value={dailyExpense?.Amount}
   onChange={(e) => {
   
      let val = e.target.value;

  // ✅ allow digits and one dot
  val = val.replace(/[^0-9.]/g, "");
  if (val.length > 10) val = val.slice(0, 10);
  // ✅ if more than one dot, keep only the first
//   const parts = val.split(".");
//   if (parts.length > 2) {
//     val = parts[0] + "." + parts.slice(1).join(""); // collapse extra dots
//   }

  // ✅ limit to 2 decimal places
  if (val.includes(".")) {
    return
    // const [int, dec] = val.split(".");
    // val = int + "." + dec.slice(0, 2);
  }

  e.target.value = val;

      //setDailyExpense({ ...dailyExpense, Amount: e.target.value }); // update parent state
      setValue("Customer_Phone", val, { shouldValidate: true });
  }}

  placeholder=" Customer Phone"
  className="w-full outline-none border-b-2 text-gray-900"
//   readOnly={!editingDailyExpense}
/>

      
      {errors.Customer_Phone && (
    <p className="text-red-500 text-xs">Phone number is required</p>
  )} 
  </div>


  
                 {/* <div className="input-field col s6 ">
                      <span className="active">
                        Purpose
                        <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
                      </span>
                      <textarea
                        type="text"
                        style={{resize:"none"}}
                        id="Purpose"
                        // value={dailyExpense?.Purpose}
//                           onChange={(e) => {
//     if (editingDailyExpense) {
//       setDailyExpense({ ...dailyExpense, Purpose: e.target.value }); // update parent state
//     }
//   }}
                        //   readOnly={!editingDailyExpense}
                        
                        // {...register("Purpose")}
                        // {...register("Purpose")}
                        
                        className="w-full outline-none border-b-1  py-2 px-1 text-gray-900">
                      </textarea>
                     
                    </div> */}

  
                  </div>
                  
                  {/* <div className="row">
 
  
  {!editingDailyExpense && <div className="input-field col s6 ">
                      <span className="active">Select Payment Mode</span>
                      <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
                      
                      <input
          type="text"
          id="Payment_Mode"
  className="w-full outline-none border-b-2 text-gray-900"
          value={dailyExpense?.Payment_Method}
          //  onChange={(e) => {
          //   if (editingDailyExpense) {
          //     setDailyExpense({ ...dailyExpense, Payment_Method: e.target.value }); // update parent state
          //   }
          //  }}
          readOnly

      />
                    </div>}
    
  {editingDailyExpense && 
   <div className="input-field col s6 ">
                      <span className="active">Select Payment Mode</span>
                      <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
                      <select
                        id="Payment Mode"
    onChange={(e) => {
            if (editingDailyExpense) {
              setDailyExpense({ ...dailyExpense, Payment_Method: e.target.value }); // update parent state
            }
           }}
                        // {...register("Item_Unit")}
                       value={dailyExpense?.Payment_Method}
                        className="w-full border border-gray-300 text-gray-900 bg-white rounded-md p-2"
                      >
                        
                          
                          <option value="Cash">Cash</option>
                          
                          <option value="Online">Online</option>
                         
       
                      </select>
  
                 
                    </div>
                    }
  </div> */}
                  {/* Paid via*/}
                  {/* <div className="row  w-1/2 ">
                        <div className="input-field col s6 ">
                               <span className="active">Paid Via</span>
                             <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
                 
                     <input
          type="text"
          id="Paid_Via"
          
       
          value={dailyExpense?.Paid_Via}
          readOnly={!editingDailyExpense}
          onChange={(e)=>{
            if(editingDailyExpense){
              setDailyExpense({...dailyExpense,Paid_Via:e.target.value})
            }
          }}
          placeholder=" Paid_Via"
          className="w-full outline-none border-b-2 text-gray-900"

     
      />
  
                    </div>
  
  </div> */}
  </div>

  
  
  
                 
  
                  <div className="flex justify-end mt-4 gap-4">
                      <button
                      type="submit"
                //   onClick={handleSave}
    //   disabled={isLoading}
                      className=" text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "#4CA1AF" }}
                    >
                       
                           {isLoading ? "Saving..." : "Save"}
                    </button>
                    {/* {editingDailyExpense===false && <button
                      type="button"
                      
                      className=" text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "#4CA1AF" }}
                    >
                      Print
                    </button>} */}
                  </div>
                  </form>
    </div>
  </div>
);

}
