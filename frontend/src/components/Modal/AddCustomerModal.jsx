import { toast } from "react-toastify";

import { useForm } from "react-hook-form";
import { useAddNewCustomerMutation, useGetAllCustomersQuery } from "../../redux/api/Staff/orderApi";
import { useEffect,  useRef, useState } from "react";



export default function AddCustomerModal({ onClose, onSave , mode }) {
        
       
         const{ data: customers}=useGetAllCustomersQuery();
  console.log(customers,"customers",mode);
   const [customerSearch, setCustomerSearch] = useState("");

   const[customerDropdownOpen,setCustomerDropdownOpen]=useState(false);
      // const[customerModal,setShowCustomerModal]=useState(false);
        //const[addParty, { isLoading }] = useAddPartyMutation();
     const [isExistingCustomer, setIsExistingCustomer] = useState(false);


// const findExistingCustomer = (value) => {
//   if (!value) return null;

//   const lower = value.toLowerCase().trim();

//   return customers?.find((c) => {
//     return (
//       c.Customer_Name?.toLowerCase() === lower ||
//       c.Customer_Phone === value
//     );
//   }) || null;
// };

//           
const {
            
            
            handleSubmit,
           
          register,
            formValues,
            watch,
        
            setValue,
        
            formState: { errors },
          } = useForm({
            defaultValues: {
              Customer_Name: "",
              Customer_Phone: "",
              Customer_Address: "",
              Customer_Date:"",
            },
          })
    
    const[addCustomer, { isLoading }] = useAddNewCustomerMutation();

const dropdownRef = useRef(null);
const inputRef = useRef(null);
console.log(isExistingCustomer,"isExistingCustomer");

  const watchedCustomerName = watch("Customer_Name");
  const watchedCustomerAddress = watch("Customer_Address");

  const watchSpecialDate=watch("Customer_Date");


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

const onSubmit = async (data) => {
  console.log("Form Data:", data);

  try {
    // 🔥 ALWAYS call upsert API
    const res = await addCustomer({
      Customer_Name: data.Customer_Name || null,
      Customer_Phone: data.Customer_Phone,
      Customer_Address: data.Customer_Address || null,
      Customer_Date: data.Customer_Date || null,
    }).unwrap();

    if (!res?.success) {
      toast.error("Customer save failed!");
      return;
    }

    toast.success(
      isExistingCustomer
        ? "Customer updated successfully!"
        : "Customer added successfully!"
    );

    // ✅ Parent still receives ONLY name + phone
    onSave({
      Customer_Name: res.Customer_Name || data.Customer_Name || null,
      Customer_Phone: res.Customer_Phone || data.Customer_Phone,
    });

    onClose();
  } catch (err) {
    toast.error(err?.data?.message || "Customer save failed!");
    console.error(err);
  }
};

// const onSubmit = async (data) => {
//   console.log("Form Data:", data);

//   /* ---------------- EXISTING CUSTOMER ---------------- */
//   if (isExistingCustomer) {
//     // ✅ Parent only needs name + phone
//     onSave({
//       Customer_Name: data.Customer_Name || null,
//       Customer_Phone: data.Customer_Phone,
//     });

//     toast.success("Customer selected");
//     onClose();
//     return;
//   }

//   /* ---------------- NEW CUSTOMER ---------------- */
//   try {
//     // 🔥 Save EVERYTHING to DB
//     const res = await addCustomer({
//       Customer_Name: data.Customer_Name || null,
//       Customer_Phone: data.Customer_Phone,
//       Customer_Address: data.Customer_Address || null,
//       Customer_Date: data.Customer_Date || null,
//     }).unwrap();

//     if (!res?.success) {
//       toast.error("Customer Add Failed!");
//       return;
//     }

//     toast.success("Customer Added Successfully!");

//     // ✅ Parent still gets ONLY name + phone
//     onSave({
//       Customer_Name: res.Customer_Name || null,
//       Customer_Phone: res.Customer_Phone,
//     });

//     onClose();
//   } catch (err) {
//     toast.error(err?.data?.message || "Customer Add Failed!");
//     console.error(err);
//   }
// };



// const onSubmit = async (data) => {
//   console.log("Form Data:", data);

//   // ✅ EDIT MODE → ALWAYS update parent
//   // if (mode === "edit") {
//   //   onSave({
//   //     Customer_Name: data.Customer_Name || null,
//   //     Customer_Phone: data.Customer_Phone,
//   //   });

//   //   toast.success("Customer updated");
//   //   onClose();
//   //   return;
//   // }

//   // ✅ ADD MODE + EXISTING CUSTOMER → just select
//   if (isExistingCustomer) {
//     onSave({
//       Customer_Name: data.Customer_Name || null,
//       Customer_Phone: data.Customer_Phone,
//     });

//     toast.success("Customer selected");
//     onClose();
//     return;
//   }

//   // ✅ ADD MODE + NEW CUSTOMER → save to DB
//   try {
//     const res = await addCustomer(data).unwrap();
//     const resData = res?.data || res;

//     if (!resData?.success) {
//       toast.error("Customer Add Failed!");
//       return;
//     }

//     toast.success("Customer Added Successfully!");

//     onSave({
//       Customer_Name: resData.Customer_Name || null,
//       Customer_Phone: resData.Customer_Phone,
//     });

//     onClose();
//   } catch (err) {
//     toast.error(err?.data?.message || "Customer Add Failed!");
//     console.error("Customer Add error:", err);
//   }
// };
console.log({
  watchedCustomerName,
  watchedCustomerAddress,
  watchSpecialDate,
});
       console.log("errors",errors);
       console.log(formValues,"formValues");
  return (
 <div
  style={{
  
    position: "fixed",
    marginTop: "1.5rem",
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
    style={{height:"80%"}}
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
  
<div className="input-field col s6 relative">
  <span className="active">
    Customer Phone <span className="text-red-500">*</span>
  </span>

  <input
    ref={inputRef}
    type="number"
    id="Customer_Phone"
    placeholder="Search by phone"
    value={customerSearch}
    onChange={(e) => {
      let val = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);

      setCustomerSearch(val);

      setValue("Customer_Phone", val, { shouldValidate: true });

      // typing ≠ existing selection
      setIsExistingCustomer(false);
      setCustomerDropdownOpen(true);
    }}
    onFocus={() => setCustomerDropdownOpen(true)}
    className="w-full outline-none border-b-2 text-gray-900"
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
              setValue("Customer_Address", c.Customer_Address, {
                shouldValidate: true,
              });
              setValue("Customer_Date", c.Special_Date, {
                shouldValidate: true,
              });
           

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

<div className="input-field col s6 ">
  <span className="active">Customer Name</span>

  <input
    type="text"
    id="Customer_Name"
    placeholder="Customer Name"
       value={watchedCustomerName || ""} 
       readOnly={isExistingCustomer} 
    className="w-full outline-none border-b-2 text-gray-900"
    onChange={(e) => {
      setValue("Customer_Name", e.target.value || null, {
        shouldValidate: true,
      });
    }}
  />

  {errors?.Customer_Name && (
    <p className="text-red-500 text-xs mt-1">
      {errors.Customer_Name.message}
    </p>
  )}
</div>


  
  
                  </div>
                  

                  <div className="row flex gap-2">
                  <div className="input-field col s6 relative">
  <span className="active">
    Customer Address
  </span>

  <input
    type="text"
    id="Customer_Address"
    placeholder="Address"
    value={watchedCustomerAddress || ""}
    {...register("Customer_Address")} 
    // readOnly={isExistingCustomer} 
    className="w-full outline-none border-b-2 text-gray-900"
    onChange={(e) => {
      setValue("Customer_Address", e.target.value || null, {
        shouldValidate: true,
      });
    }}
  />

  {errors?.Customer_Address && (
    <p className="text-red-500 text-xs mt-1">
      {errors.Customer_Address.message}
    </p>
  )}


     
  </div>

  <div className="input-field col s6 relative">
  <span className="active">
    Special Date
  </span>

  <input
    type="date"
    id="Customer_Date"
    // placeholder="Email"
    // value={watchedCustomerEmail || ""} 
    // readOnly={isExistingCustomer} 
    {...register("Customer_Date")}
  value={watchSpecialDate || ""}
    min={new Date().toISOString().split("T")[0]}
    className="w-full outline-none border-b-2 text-gray-900"
    onChange={(e) => {
      setValue("Customer_Date", e.target.value || null, {
        shouldValidate: true,
      });
    }}
  />

  {errors?.Customer_Date && (
    <p className="text-red-500 text-xs mt-1">
      {errors.Customer_Date.message}
    </p>
  )}
 </div>
  
  </div>
  
                 
  
                  <div className="flex justify-end mt-4 gap-4">
                      <button
                      type="submit"
                //   onClick={handleSave}
    //   disabled={isLoading}
                      className=" text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "#ff0000" }}
                    >
                       
                           {isLoading ? "Saving..." : "Save"}
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
                  </form>
    </div>
  </div>
);

}

 {/* <input
        type="text"
        id="Customer_Name"
        placeholder="Search By Name / Phone"
        value={customerSearch}
        // {...register("Customer_Name")}

onChange={(e) => {
  const value = e.target.value;
  setCustomerSearch(value);

  setValue("Customer_Name", value || null, {
    shouldValidate: true,
    shouldDirty: true,
  });

  const matchedCustomer = findExistingCustomer(value);

  if (matchedCustomer) {
    // ✅ Existing customer detected
    setIsExistingCustomer(true);

    setValue("Customer_Name", matchedCustomer.Customer_Name || null, {
      shouldValidate: true,
    });

    setValue("Customer_Phone", matchedCustomer.Customer_Phone, {
      shouldValidate: true,
    });
  } else {
    // ✅ New customer
    setIsExistingCustomer(false);
  }

  setCustomerDropdownOpen(true);
}}

        // onChange={(e) => {
        //   const value = e.target.value;
        //   setCustomerSearch(value);

        //   // 🔑 sync with RHF
        //   setValue("Customer_Name", value || null, {
        //     shouldValidate: true,
        //     shouldDirty: true,
        //   });

        //   setCustomerDropdownOpen(true);
        // }}
        onClick={(e) => {
          e.stopPropagation();
          setCustomerDropdownOpen(true);
        }}
        className="w-full outline-none py-1 px-2 text-gray-900"
        style={{
          marginTop: "4px",
          border: "none",
          height: "2rem",
        }}
      /> */}

      //      useEffect(() => {
//   if (mode === "edit" && initialData) {
//     reset({
//       Customer_Name: initialData.Customer_Name,
//       Customer_Phone: initialData.Customer_Phone,
//     });
//   }
// }, [mode, initialData, reset]);
// useEffect(() => {
//   if (mode === "edit" && initialData) {
//     reset({
//       Customer_Name: initialData.Customer_Name,
//       Customer_Phone: initialData.Customer_Phone,
//     });

//     // 🔥 IMPORTANT: sync visible input
//     setCustomerSearch(
//       initialData.Customer_Name ||
//       initialData.Customer_Phone ||
//       ""
//     );

//     setIsExistingCustomer(true); // editing existing
//   }
// }, [mode, initialData, reset]);





  // onChange={(e) => {
  //   const value = e.target.value;
  //   setCustomerSearch(value);

  //   setValue("Customer_Name", value || null, {
  //     shouldValidate: true,
  //     shouldDirty: true,
  //   });

  //   const matchedCustomer = findExistingCustomer(value);

  //   // if (matchedCustomer) {
  //   //   setIsExistingCustomer(true);

  //   //   setValue("Customer_Name", matchedCustomer.Customer_Name || null);
  //   //   setValue("Customer_Phone", matchedCustomer.Customer_Phone);
  //   // } 
  //     if (matchedCustomer) {
  //   // ✅ Existing customer detected
  //   setIsExistingCustomer(true);

  //   setValue("Customer_Name", matchedCustomer.Customer_Name || null, {
  //     shouldValidate: true,
  //   });

  //   setValue("Customer_Phone", matchedCustomer.Customer_Phone, {
  //     shouldValidate: true,
  //   });
  // }
  //   else {
  //     setIsExistingCustomer(false);
  //   }

  //   setCustomerDropdownOpen(true);
  // }}











//   <div className="input-field col s6 mt-4">
//   <span className="active">Customer Name</span>

//   <div className="relative ">
//     <div
//       className="flex flex-row border rounded-md bg-white cursor-pointer"
//       onClick={() => setCustomerDropdownOpen(true)}
//     >
     
//       <input
//   type="text"
//   id="Customer_Name"
//   placeholder="Search By Name / Phone"
//   value={customerSearch}

//  onChange={(e) => {
//   const value = e.target.value;

//   setCustomerSearch(value);

//   setValue("Customer_Name", value || null, {
//     shouldValidate: true,
//     shouldDirty: true,
//   });

//   // ✅ only flip in ADD mode
//   // if (mode !== "edit") {
//   //   setIsExistingCustomer(false);
//   // }

//   setCustomerDropdownOpen(true);
// }}

//   onClick={(e) => {
//     e.stopPropagation();
//     setCustomerDropdownOpen(true);
//   }}
//   className="w-full outline-none py-1 px-2 text-gray-900"
//   style={{ marginTop: "4px", border: "none", height: "2rem" }}
// />


//       <div className="w-10" />
//       <span className="absolute right-0 px-2 top-1/3 text-gray-700">▼</span>
//     </div>

//     {/* DROPDOWN */}
//     {customerDropdownOpen && (
//       <div
//   className="
//     absolute z-50 mt-1 w-full
//     bg-white border border-gray-300 rounded-md shadow-lg
//     max-h-48 overflow-y-auto
//   "
//   style={{ overscrollBehavior: "contain" }}
// >

//        {/* <div className="absolute z-20 flex 
//      flex-col mt-1 w-full bg-white 
//        border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"> */}
        
//         {/* <span
//           onClick={() => setShowCustomerModal(true)}
//           className="block px-3 py-2 text-[#ff0000] font-medium hover:bg-gray-100 cursor-pointer"
//         >
//           + Add Customer
//         </span> */}

//         {(() => {
//           const isPhoneSearch = /^\d+$/.test(customerSearch);

//           const filteredCustomers = customers?.filter((party) =>
//             isPhoneSearch
//               ? party?.Customer_Phone?.includes(customerSearch)
//               : party?.Customer_Name
//                   ?.toLowerCase()
//                   ?.includes(customerSearch.toLowerCase())
//           );

//           return (
//             <>
//               {filteredCustomers?.map((party, i) => (
//                 <div
//                   key={i}
//                   onClick={() => {
//                     const displayValue =
//                       party?.Customer_Name?.trim() ||
//                       party?.Customer_Phone ||
//                       "";

//                     setCustomerSearch(displayValue);

//                     // ✅ RHF sync
//                     setValue("Customer_Name", party?.Customer_Name || null, {
//                       shouldValidate: true,
//                       shouldDirty: true,
//                     });

//                     setValue("Customer_Phone", party?.Customer_Phone || null, {
//                       shouldValidate: true,
//                     });
//                         setIsExistingCustomer(true);

//                     setCustomerDropdownOpen(false);
//                   }}
//                   className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
//                 >
//                   <span className="font-medium">
//                     {party?.Customer_Name || "Unknown"}
//                   </span>{" "}
//                   <span className="text-gray-500">
//                     ({party?.Customer_Phone})
//                   </span>
//                 </div>
//               ))}

//               {filteredCustomers?.length === 0 && (
//                 <p className="px-3 py-2 text-gray-500">No Customers found</p>
//               )}
//             </>
//           );
//         })()}
//       </div>
//     )}
//   </div>

//   {/* RHF Error */}
//   {errors?.Customer_Name && (
//     <p className="text-red-500 text-xs mt-1">
//       {errors.Customer_Name.message}
//     </p>
//   )}
// </div>


//  <div className="input-field col s6 ">
//       <span className="active">
//          Customer Phone
//           <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
//       </span>

//       <input
//   type="text"
//   id="Customer_Phone"
//      {...register("Customer_Phone", { required: true })}
//     // {...register("Customer_Phone")}
// //   value={dailyExpense?.Amount}
//    onChange={(e) => {
   
//       let val = e.target.value;

//   // ✅ allow digits and one dot
//   val = val.replace(/[^0-9.]/g, "");
//   if (val.length > 10) val = val.slice(0, 10);
//   // ✅ if more than one dot, keep only the first
// //   const parts = val.split(".");
// //   if (parts.length > 2) {
// //     val = parts[0] + "." + parts.slice(1).join(""); // collapse extra dots
// //   }

//   // ✅ limit to 2 decimal places
//   if (val.includes(".")) {
//     return
//     // const [int, dec] = val.split(".");
//     // val = int + "." + dec.slice(0, 2);
//   }

//   e.target.value = val;

//       //setDailyExpense({ ...dailyExpense, Amount: e.target.value }); // update parent state
//       setValue("Customer_Phone", val, { shouldValidate: true });
//   }}

//   placeholder=" Customer Phone"
//   className="w-full outline-none border-b-2 text-gray-900"
// //   readOnly={!editingDailyExpense}
// />

      
//       {errors.Customer_Phone && (
//     <p className="text-red-500 text-xs">Phone number is required</p>
//   )} 
//   </div>


// useEffect(() => {
//   if (mode === "edit" && initialData) {
//     reset({
//       Customer_Name: initialData.Customer_Name,
//       Customer_Phone: initialData.Customer_Phone,
//     });

//     setIsExistingCustomer(true);
//   }
// }, [mode, initialData, reset]);
// useEffect(() => {
//   if (mode === "edit" && initialData) {
//     reset({
//       Customer_Name: initialData.Customer_Name,
//       Customer_Phone: initialData.Customer_Phone,
//     });

//     // ✅ IMPORTANT: sync visible input
//     setCustomerSearch(
//       initialData.Customer_Name ||
//       initialData.Customer_Phone ||
//       ""
//     );

//     setIsExistingCustomer(true);
//   }
// }, [mode, initialData, reset]);

// const watchedName = watch("Customer_Name");
// const watchedPhone = watch("Customer_Phone");

// useEffect(() => {
//   // Keep visible input in sync with form state
//   if (watchedName || watchedPhone) {
//     setCustomerSearch(watchedName || watchedPhone || "");
//   }
// }, [watchedName, watchedPhone]);
// useEffect(() => {
//   // ✅ Only sync from NAME, never from phone
//   if (watchedName !== undefined) {
//     setCustomerSearch(watchedName || "");
//   }
// }, [watchedName]);

// const onSubmit = async (data) => {
//   console.log("Form Data:", data);

//   // ✅ CASE 1: EXISTING CUSTOMER → just pass to parent
//   if (isExistingCustomer) {
//     onSave({
//       Customer_Name: data.Customer_Name || null,
//       Customer_Phone: data.Customer_Phone,
//     });

//     toast.success("Customer selected");
//     onClose();
//     return;
//   }

//   // ✅ CASE 2: NEW CUSTOMER → save to DB
//   try {
//     const res = await addCustomer(data).unwrap();
//     const resData = res?.data || res;

//     if (!resData?.success) {
//       toast.error("Customer Add Failed!");
//       return;
//     }

//     toast.success("Customer Added Successfully!");

//     onSave({
//       Customer_Name: resData.Customer_Name || null,
//       Customer_Phone: resData.Customer_Phone,
//     });

//     onClose();
//   } catch (err) {
//     toast.error(err?.data?.message || "Customer Add Failed!");
//     console.error("Customer Add error:", err);
//   }
// };


    
  //      const onSubmit = async (data) => {
  //           console.log("Form Data (from RHF):", data);
  //       try{
  //           const res = await addCustomer(data).unwrap();
  //           console.log(" successfully:", res);
  //           const resData = res?.data || res;
  //           console.log(resData);
  //           if(!resData?.success) {
  //             toast.error("Customer Add Failed!");
  //             return;
  //           }else{
  //             toast.success("Customer Added Successfully!");
  //               onClose();  // close modal
  //                 onSave({
  //   Customer_Name: res.Customer_Name || null,
  //   Customer_Phone: res.Customer_Phone,
  // });
  //           }
          
  //         } catch (err) {
  //           toast.error(err?.data?.message || "Customer Add Failed!");
  //           console.error("Customer Add error:", err);
  //       }
  //      }

  //     const filteredCustomers = useMemo(() => {
//     if (!customerSearch || customerSearch.length < 3) return [];

//     return customers.filter(
//       (c) =>
//         c.Customer_Phone.includes(customerSearch) ||
//         c.Customer_Name?.toLowerCase().includes(customerSearch.toLowerCase())
//     );
//   }, [customerSearch, customers]);
// useEffect(() => {
//   if (
//     customerDropdownOpen &&
//     customerSearch.length >= 3 &&
//     filteredCustomers.length === 0
//   ) {
//     const t = setTimeout(() => {
//       setCustomerDropdownOpen(false);
//     }, 800); // 👈 UX delay so user sees message

//     return () => clearTimeout(t);
//   }
// }, [customerSearch, filteredCustomers, customerDropdownOpen]);