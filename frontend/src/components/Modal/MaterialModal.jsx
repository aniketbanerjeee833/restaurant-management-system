import { zodResolver } from "@hookform/resolvers/zod";

import { useRef } from "react";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";


import { materialApi, useEditMaterialMutation } from "../../redux/api/materialApi";
import materialFormSchema from "../../schema/materialFormSchema";


export default function MaterialModal({materialDetails,editingMaterial,onClose}) {
    const dropdownRef = useRef(null);
    const dispatch = useDispatch()
      const itemUnits = {
    "gm": "Gram",
    "Kg": "Kilogram",
    "lt": "Litre",
    "pcs": "Piece",

  }
    const units={
        "Kilogram":"Kg",
        "Litre":"lt",
        "Gram":"gm",
        "Pcs":"pcs"
    }
   const reorderLevelUnits = {
    "Kilogram": "Kg",
    "Litre": "lt",
    "Gram": "gm",
    "Pcs": "pcs"
  }
    // const { data: categories } = useGetAllCategoriesQuery()
    // console.log(categories)
      //  const [newCategory, setNewCategory] = useState("");
   
   const [search, setSearch] = useState("");
     const [open, setOpen] = useState(false);
    //  const [selected, setSelected] = useState(null);
    // const [showModal, setShowModal] = useState(false);
    //const[eachItemBillAndInvoiceNumbersModalOpen,setEachItemBillAndInvoiceNumbersModalOpen]=useState(false)
    const[editMaterial,{isLoading:isEditingMaterial}]=useEditMaterialMutation()

    console.log(materialDetails)
// const [shouldFetchBills, setShouldFetchBills] = useState(false);

// const { data: apiResponse } =
//   useGetEachItemBillAndInvoiceNumbersQuery(materialDetails?.Item_Id, {
//     skip: !shouldFetchBills,  // fetch only when user clicks
//   });

   
//     const eachItemBillAndInvoiceNumbers = apiResponse?.billAndInvoiceNumbers || {
//   purchaseDetails: { count: 0, details: [] },
//   saleDetails: { count: 0, details: [] },
// };
    //  const [showModal, setShowModal] = useState(false);
      const {
        register,
        
        setValue,
        reset,
        watch,
   
        
        formState: { errors },
      } = useForm({
        resolver: zodResolver(materialFormSchema)
      })


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
  if (!editingMaterial) return;
  if (!materialDetails) return;
  if (Object.keys(materialDetails).length === 0) return;

  setSearch(materialDetails.current_stock);

  // CORRECT RESET
  reset({
    name: materialDetails.name,
    //unit: materialDetails.unit,           // important
    current_stock: materialDetails.current_stock,   // ONLY number
    current_stock_unit: materialDetails.current_stock_unit,
    reorder_level: materialDetails.reorder_level,
    reorder_level_unit:materialDetails.reorder_level_unit,
    shelf_life_days: materialDetails.shelf_life_days,
  });
}, [materialDetails, editingMaterial]);

  

 const formValues = watch();
//   const handleSubmit=async()=>{
    
//     if(!editingItem) return
//     try{
//       const res=await editItem({
//         body:formValues,
//         Item_Id:materialDetails.Item_Id
//       }).unwrap()
//       const resData=  res;
//       console.log(res,"res")
//       if(resData?.success){
//         toast.success("Item Updated Successfully")
//         onClose()
//         dispatch(itemApi.util.invalidateTags(["Item"]))
//       }
//     }
//     catch(err){
//       console.error(err)
//       toast.error("Failed to update item")
//     }
//   }

// const fetchEachItemBillAndSaleNumbers=async()=>{
//     setEachItemBillAndInvoiceNumbersModalOpen(true)
// }
const handleEdit=async()=>{
  if(!editingMaterial) return
  console.log(formValues)
  try{
    const res=await editMaterial({
      body:formValues,
      Material_Id:materialDetails.Material_Id
    }).unwrap()
    const resData=  res;
    console.log(res,"res")
    if(resData?.success){
      toast.success("Item Updated Successfully")
      //  setEachItemBillAndInvoiceNumbersModalOpen(false);
      onClose()
      dispatch(materialApi.util.invalidateTags(["Material"]))
   

    }
  }
  catch(err){
    console.error(err)
    toast.error("Failed to update item")
  }
}

console.log(formValues,"formValues")
   return (
   
   <>
  
  
    
    

  
   
 <div
  style={{
    marginTop: "50px",
    position: "fixed",
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
      w-full max-w-4xl rounded-lg 
      shadow-lg p-6 
      overflow-y-auto max-h-[90vh]"
    >
          <div className="flex justify-between items-center mb-6"
      style={{paddingBottom:"10px"}}>
        <div className="flex flex-col">
        <h4 className="text-xl font-semibold text-gray-900">
          Edit Item
        </h4>
        
              </div>
        <button
          type="button"
          style={{ backgroundColor: "transparent" }}
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ✕
        </button>
      </div>
                <div >
                    
                  <div className="row">

  
  
  
  
                  <div 
                  style={{width:"100%"}} className="input-field col s6 mt-4  ">
                    <span className="active">
                      Current Stock
                     
                     
                    </span>
                    <div className="flex items-center gap-2 border-b-1 mt-2">
                    <input
                      type="text"
                      id="Current_Stock"
                         placeholder="Current_Stock"
                      className="w-full outline-none border-b-2 text-gray-900"
                          style={{width:"15%",border:"none",outline:"none",marginBottom:"0px"}} 
                      {...register("current_stock", {
    onChange: (e) => {
      let val = e.target.value;

      // allow only digits + dot
      val = val.replace(/[^0-9.]/g, "");

      // only 1 dot
      const parts = val.split(".");
      if (parts.length > 2) {
        val = parts[0] + "." + parts.slice(1).join("");
      }

      // limit decimals
      if (val.includes(".")) {
        const [i, d] = val.split(".");
        val = i + "." + d.slice(0, 2);
      }

      e.target.value = val; // allowed
    }
  })}
                    />
                     <span >
    {reorderLevelUnits[materialDetails?.unit] ?? materialDetails?.unit}
  </span>
                      </div>
                    {errors?.current_stock && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?.current_stock}
                      </p>
                    )}
                  </div>
  
                  
                
                 
  <div className="input-field col s6 mt-4 ">
      <span className="active">
        Shelf Life Days
          <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
      </span>
  
      <input
          type="text"
          id="Shelf_Life_Days"
           placeholder=" Shelf_Life_Days"
          className="w-full outline-none border-b-2 text-gray-900"
          {...register("shelf_life_days",{
         
          
        
      onInput:(e) => {
        // ✅ Allow only digits
        e.target.value = e.target.value.replace(/[^0-9]/g, "");
      }
           })}
      />
      
      {errors?.shelf_life_days && (
          <p className="text-red-500 text-xs mt-1">
              {errors?.shelf_life_days?.message}
          </p>
      )}
  </div>

                      <div style={{ width: "100%" }}
                       className="input-field col s6 flex flex-row gap-2 mt-4">
                         <div className="w-1/2">
      <span className="active">
        Reorder Level
          <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
      </span>
  
     
       {/* <div className="flex items-center gap-2 border-b-1 mt-2"> */}
        
                    <input
          type="text"
          id="reorder_level"
             placeholder="Reorder Level"
     
                      className="w-full outline-none border-b-2 text-gray-900"
                          style={{outline:"none",marginBottom:"0px"}} 
          {...register("reorder_level",{
             onChange: (e) => {
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
                                     }
  })}
                  
                    />
                     <span >
    {reorderLevelUnits[materialDetails?.unit] ?? materialDetails?.unit}
  </span>
  </div>

    <div className="w-1/2">
    <span className="active">
      Unit<span className="text-red-500 font-bold text-lg">&nbsp;*</span>
    </span>

    <select
      id="Material_Unit"
      {...register("reorder_level_unit")}
      className="w-full outline-none border-b-2 text-gray-900"
    >
      <option value="">Select Unit</option>
      {Object.entries(units).map(([key, value]) => (
        <option key={key} value={key}>
          {`${value} (${key})`}
        </option>
      ))}
    </select>

    {errors?.unit && (
      <p className="text-red-500 text-xs mt-1">{errors?.unit}</p>
    )}
  </div>
                     
      {errors?.reorder_level && (
          <p className="text-red-500 text-xs mt-1">
              {errors?.reorder_level?.message}
          </p>
      )}
       </div>
  </div>
  
  </div>
                  
                 
  
                  <div className="flex justify-end mt-4">
                    {/* <button
  type="button"
  disabled={formValues.errorCount > 0}
  onClick={() => {
    if (materialDetails?.Item_Id) {
      fetchItemBills(materialDetails.Item_Id);  // CALL API HERE
    }
    setEachItemBillAndInvoiceNumbersModalOpen(true);
  }}
  className="text-white font-bold py-2 px-4 rounded"
  style={{ backgroundColor: "#4CA1AF" }}
>
  {isEditingMaterial ? "Saving..." : "Save"}
</button> */}
<button
  type="button"
  disabled={formValues.errorCount > 0}
  onClick={()=>handleEdit()}

  className="text-white font-bold py-2 px-4 rounded"
  style={{ backgroundColor: "#4CA1AF" }}
>
  {isEditingMaterial ? "Saving..." : "Save"}
</button>


                    {/* <button
                      type="button"
                      disabled={formValues.errorCount > 0}
                      onClick={()=>setEachItemBillAndInvoiceNumbersModalOpen(true)}
                      className=" text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "#4CA1AF" }}
                    >
                      {isEditingMaterial ? "Saving..." : "Save"}
                    </button> */}
                  </div>
                </div>

              </div>
  
 
            



  
  
    </>
    );
}
