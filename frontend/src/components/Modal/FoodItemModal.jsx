




export default function FoodItemModal({ onClose,foodItem,editingFoodItem}) {
        
          const TAX_RATES = {
        "GST0": 0,
        "GST0.25": 0.25,
        "GST3": 3,
        "GST5": 5,
        "GST12": 12,
        "GST18": 18,
        "GST28": 28,
        "GST40": 40,

        "IGST0": 0,
        "IGST0.25": 0.25,
        "IGST3": 3,
        "IGST5": 5,
        "IGST12": 12,
        "IGST18": 18,
        "IGST28": 28,
        "IGST40": 40,
    };
       
    
        //const[addParty, { isLoading }] = useAddPartyMutation();
        console.log("foodItem",foodItem,editingFoodItem);
    //   console.log(dailyExpense, editingDailyExpense,"editingDailyExpense");
        
    
    
    //const[editSingleDailyExpense, { isLoading }] = useEditSingleDailyExpenseMutation();

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
        {editingFoodItem ? "Edit Food Item" : "View Food Item"}
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

      
    <div >
      <div className="row flex gap-2">
  

                 <div className="input-field col s6 ">
                      <span className="active">
                        Category
                        
                       
                        {/* <span className="text-red-500 font-bold text-lg">&nbsp;*</span> */}
                      </span>
                      <input
                        type="text"
                       
                        id="ItemCategory"
                        value={foodItem?.Item_Category}

                        readOnly={!editingFoodItem}
                        className="w-full outline-none border-b-1  py-2 px-1 text-gray-900"
                      />
                     
                    </div>



  
                 <div className="input-field col s6 ">
                      <span className="active">
                        Name
                       
                       
                      </span>
                      <input
                        type="text"
                        
                        id="ItemName"
                        value={foodItem?.Item_Name}

                        readOnly={!editingFoodItem}
                        
                        className="w-full outline-none border-b-1  py-2 px-1 text-gray-900"
                      />
                     
                    </div>
    <div className="input-field col s6 ">
      <span className="active">
         Image
         
                       
      </span>
 <img src={foodItem?.Item_Image &&
 `http://localhost:4000/uploads/food-item/${foodItem?.Item_Image}`
                                }
                                alt={foodItem?.Item_Name}
                                style={{ width: "100px", height: "60px" }}
                              />

      
     
  </div>
  
                  </div>
                  
                  <div className="row">
                       {/* <div className="input-field col s6 ">
                      <span className="active">Quantity</span>
                      
                      
                      <input
          type="text"
          id="Item_Quantity"
  className="w-full outline-none border-b-2 text-gray-900"
          value={foodItem?.Item_Quantity}
    
          readOnly={!editingFoodItem}

      />
                    </div> */}

  
   <div className="input-field col s6 ">
                      <span className="active">Price</span>
                      
                      
                      <input
          type="text"
          id="Item_Price"
  className="w-full outline-none border-b-2 text-gray-900"
          //value={dailyExpense?.Payment_Method}
           value={foodItem?.Item_Price}
          readOnly={!editingFoodItem}

      />
                    </div>
    
  
   <div className="input-field col s6 ">
                      <span className="active">Tax Type</span>
                      
                    <input type="text"
                      className="w-full outline-none border-b-2 text-gray-900"
                      readOnly={!editingFoodItem}
                      value={`${TAX_RATES[foodItem?.Tax_Type]}%`}
                      />
                         
       
                     
  
                 
                    </div>
                    
  </div>
                  {/* Paid via*/}
                  <div className="row  w-1/2 ">
                        <div className="input-field col s6 ">
                               <span className="active">Amount</span>
                            
                 
                     <input
          type="text"
          id="Amount"
          
      
          placeholder="Amount"
          className="w-full outline-none border-b-2 text-gray-900"
  readOnly={!editingFoodItem}
  value={foodItem?.Amount}
     
      />
  
                    </div>
  
  </div>
  </div>
  
  
  
                 
  
                  <div className="flex justify-end mt-4 gap-4">
                      <button
                      type="button"
                      onClick={onClose}
    //               onClick={handleSave}
    //   disabled={isLoading}
                      className=" text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "#ff0000" }}
                    >
                        Cancel
                           {/* {isLoading ? "Saving..." : "Save"} */}
                    </button>
                    {/* {editingDailyExpense===false && <button
                      type="button"
                      
                      className=" text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "#ff0000" }}
                    >
                      Print
                    </button>} */}
                  </div>
    </div>
  </div>
);

}
