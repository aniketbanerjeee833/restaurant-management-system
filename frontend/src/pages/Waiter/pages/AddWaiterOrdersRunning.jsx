


import {  useGetAllFoodItemsQuery } from "../../../redux/api/foodItemApi";
import { tableApi, useGetAllTablesQuery } from "../../../redux/api/tableApi";


import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useFieldArray, useForm } from "react-hook-form";



import { useRef } from "react";
import { useEffect } from "react";

import { toast } from "react-toastify";

import { useDispatch, useSelector } from "react-redux";

import { LayoutDashboard, Minus, Plus, ShoppingCart } from "lucide-react";




import { useAddOrderMutation, useGetAllCustomersQuery } from "../../../redux/api/Staff/orderApi";



import { useMemo } from "react";
import { useGetAllCategoriesQuery } from "../../../redux/api/itemApi";
import { waiterApi } from "../../../redux/Waiter/waiterApi";





// const socket = io("http://localhost:4000", {
//   transports: ["websocket"],
// });

export default function AddWaiterOrders() {
  
  // const{setWaiterOrdersToBePrinted}=useSelector((state)=>state.user)
  const { userId } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const TAX_RATES = {
    "None": 0,
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
  const{ data: customers}=useGetAllCustomersQuery();
    console.log(customers,"customers");
     const [customerSearch, setCustomerSearch] = useState("");
  
     const[customerDropdownOpen,setCustomerDropdownOpen]=useState(false);
        // const[customerModal,setShowCustomerModal]=useState(false);
          //const[addParty, { isLoading }] = useAddPartyMutation();
       const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  
  
          

  
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const tableRef = useRef(null);
  console.log(isExistingCustomer,"isExistingCustomer");
  // const categoryRefs = useRef([]); // store refs for category dropdowns
  // const itemRefs = useRef([]);     // store refs for item dropdowns


  const navigate = useNavigate();
  // const { data: parties } = useGetAllPartiesQuery();

  // console.log(items, "items");

  //const [open, setOpen] = useState(false);
  //const[categoryOpen,setCategoryOpen] = useState(false);
  // const [showModal, setShowModal] = useState(false);
  //const[selected,setSelected] = useState([]);
  const [tableSearch, setTableSearch] = useState("");
  const [open, setOpen] = useState(false);
  // const [newCategory, setNewCategory] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  const [selectedTables, setSelectedTables] = useState([]);
  const [addOrder] = useAddOrderMutation();

    const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  
  const categoryOpenRef = useRef(null);
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryOpenRef.current && !categoryOpenRef.current.contains(e.target)) {
        setCategoryOpen(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
// const [customerModal, setCustomerModal] = useState({
//   open: false,
//   mode: "add", // add | edit
// });
// const[showCustomerModal,setShowCustomerModal]=useState(false);

//   // const[customerModal,setShowCustomerModal]=useState(false);
// const [selectedCustomer, setSelectedCustomer] = useState({
//   name: null,
//   phone: null,
// });

  // const itemUnits = {

  //   "pcs": "Pcs",
  //   "plates": "Plates",
  //   "btl": "Bottle",

  // }
   const { data: categories } = useGetAllCategoriesQuery()
  
    //const existingCategories=categories?.map((category) => category.Item_Category);
     const existingCategories = [...new Set(categories?.map(c => c.Item_Category))];
   
    const newCategories = ["All", ...existingCategories];
  
    const lastUpdatedItemRef = useRef(null);

    const [activeCategory, setActiveCategory] = useState('All');
const lastCategoryRef = useRef(activeCategory);
  const { data: tables, isLoading } = useGetAllTablesQuery({});
  const { data: menuItems, isMenuItemsLoading } = useGetAllFoodItemsQuery({});
  const items = menuItems?.foodItems
  console.log(tables, isLoading, "tables", items, isMenuItemsLoading);
  // const { data: categories,  } = useGetAllCategoriesQuery()
  // console.log(categories, "categories");
  //onst existingCategories=categories?.map((category) => category.Item_Category);
  // const existingCategories = [...new Set(categories?.map(c => c.Item_Category))];
  const[searchTerm,setSearchTerm]=useState('');
  // const newCategories = ["All", ...existingCategories];
  // const [rows, setRows] = useState([
  //   {
  //     CategoryOpen: false, categorySearch: "", preview: null
  //   }
  // ]);

// useEffect(() => {
//   const handleAvailabilityChange = (data) => {
//     console.log("📢 Food status changed:", data);

//     // Force RTK Query to refetch
//     dispatch(foodItemApi.util.invalidateTags([{ type: "Food-Item", id: "LIST" }]));
//   };

//   socket.on("food_item_availability_changed", handleAvailabilityChange);

//   return () => {
//     socket.off("food_item_availability_changed", handleAvailabilityChange);
//   };
// }, []);
// useEffect(() => {
//   const handleSoftDeletedItem = (data) => {
//     console.log("📢 Food status changed:", data);

//     // Force RTK Query to refetch
//     dispatch(foodItemApi.util.invalidateTags([{ type: "Food-Item", id: "LIST" }]));
//   };

//   socket.on("food_item_deleted", handleSoftDeletedItem);

//   return () => {
//     socket.off("food_item_deleted", handleSoftDeletedItem);
//   };
// }, []);
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     setRows((prev) =>
  //       prev.map((row, idx) => {
  //         const catRef = categoryRefs.current[idx];
  //         const itemRef = itemRefs.current[idx];

  //         const clickedInsideCategory =
  //           catRef && catRef.contains(event.target);
  //         const clickedInsideItem =
  //           itemRef && itemRef.contains(event.target);

  //         // if clicked outside both → close
  //         if (!clickedInsideCategory && !clickedInsideItem) {
  //           return { ...row, CategoryOpen: false, itemOpen: false };
  //         }

  //         return row;
  //       })
  //     );
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);
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
  const handleClickOutside = (e) => {
    if (
      tableRef.current &&
      !tableRef.current.contains(e.target)
    ) {
      setOpen(false);
      
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  const {
   
    control,
    handleSubmit,
    setValue,
    watch,
  
    formState: { errors },
  } = useForm({
    defaultValues: {
      //   Tax_Type: "None",
      //   Tax_Amount: "0.00",
      Customer_Name: "",
      Customer_Phone: "",
      Amount: "0.00",
      Sub_Total: "0.00",
      items: []   // No pre-created empty row
    }

   
  });


  const { fields, append,remove } = useFieldArray({
    control,
    name: "items",
  });



  const formValues = watch();
  //const itemsValues = watch("items");   // watch all item rows
  //const totalPaid = watch("Total_Paid"); // watch Total_Paid
  //const num = (v) => (v === undefined || v === null || v === "" ? 0 : Number(v));

 
  console.log(items)
  const [cart, setCart] = useState({});



  
  const itemRowMap = useRef({});
  const updateTotals = () => {
    const itemsValues = watch("items") || [];

    let subTotal = 0;


    itemsValues.forEach(item => {
      const price = parseFloat(item.Item_Price) || 0;
      const qty = parseInt(item.Item_Quantity) || 0;


      subTotal += price * qty;

    });



    setValue("Sub_Total", subTotal.toFixed(2));

    setValue("Amount", subTotal.toFixed(2));
  };


const updateCart = (itemId, delta, _index, itemName, itemPrice) => {
  const price = Number(itemPrice);
  if (!price || price <= 0) return;

  // 🔥 MARK RECENT ONLY WHEN ADDING
  if (delta > 0) {
    lastUpdatedItemRef.current = itemId;
  }

  setCart((prev) => {
    const currentQty = Number(prev[itemId] || 0);
    const newQty = currentQty + delta;
    let rowIndex = itemRowMap.current[itemId];

    /* ---------------- REMOVE ITEM ---------------- */
    if (newQty <= 0) {
      if (rowIndex !== undefined) {
        remove(rowIndex);

        // rebuild mapping
        const newMap = {};
        watch("items")?.filter(Boolean).forEach((it, idx) => {
          newMap[it.id] = idx;
        });
        itemRowMap.current = newMap;
      }

      const updated = { ...prev };
      delete updated[itemId];

      setTimeout(updateTotals, 0);
      return updated;
    }

    /* ---------------- ADD / UPDATE ---------------- */
    if (rowIndex === undefined) {
      rowIndex = fields.length;
      itemRowMap.current[itemId] = rowIndex;

      append({
        id: itemId,
        Item_Name: itemName,
        Item_Price: price,
        Item_Quantity: newQty,
        Amount: (price * newQty).toFixed(2),
      });
    } else {
      setValue(`items.${rowIndex}.Item_Quantity`, newQty);
      setValue(
        `items.${rowIndex}.Amount`,
        (price * newQty).toFixed(2)
      );
    }

    setTimeout(updateTotals, 0);
    return { ...prev, [itemId]: newQty };
  });
};


const filteredItems = useMemo(() => {
  if (!items) return [];

  const term = searchTerm.trim().toLowerCase();
  const categoryChanged = lastCategoryRef.current !== activeCategory;

  const filtered = items.filter((item) => {
    const matchesCategory =
      activeCategory === "All" ||
      item.Item_Category === activeCategory;

    // 🔥 Ignore search when category JUST changed
    const matchesSearch = categoryChanged
      ? true
      : !term || item.Item_Name?.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  // update category ref AFTER filtering
  lastCategoryRef.current = activeCategory;

  return [...filtered].sort((a, b) => {
    const aId = a.id;
    const bId = b.id;

    const aInCart = cart[aId] ? 1 : 0;
    const bInCart = cart[bId] ? 1 : 0;

    // 🔥 MOST RECENT ITEM ALWAYS ON TOP
    if (aId === lastUpdatedItemRef.current) return -1;
    if (bId === lastUpdatedItemRef.current) return 1;

    // 🔥 CART ITEMS ABOVE NON-CART ITEMS
    if (aInCart !== bInCart) return bInCart - aInCart;

    return 0;
  });
}, [items, activeCategory, searchTerm, cart]);

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
 useEffect(() => {
  if (
    activeCategory !== "All" &&
    filteredItems.length === 0
  ) {
    setTimeout(() => {
      setActiveCategory("All");
    }, 1000);
    // setActiveCategory("All");
  }
}, [filteredItems, activeCategory]);
  console.log(filteredItems, "filteredItems")

// const printKOTInvoice = (kitchens) => {
//   const getCurrentDate = () =>
//     new Date().toLocaleDateString("en-GB");

//   const getCurrentTime = () =>
//     new Date().toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });

//   const kitchenSections = Object.entries(kitchens).map(([kitchenName, items], index) => `
//       ${index > 0 ? `<div class="line"></div>` : ``}

//       <div class="invoice-kitchen">
//         <div class="header-center">
//         <div class="brand">DINE-IN</div>
//           <div class="brand">${kitchenName}</div>
         
//         </div>

//         <div class="info-row date-time">
//           <span><b>Date:</b> ${getCurrentDate()}</span>
//           <span><b>Time:</b> ${getCurrentTime()}</span>
//         </div>

//         <div class="line-solid"></div>

//         <div class="items-header">
//           <div class="col-no">No</div>
//           <div class="item-name">ITEM</div>
//           <div class="item-qty">QTY</div>
//         </div>

//         ${items.map((it, i) => `
//           <div class="item-row">
//             <div class="col-no">${i + 1}</div>
//             <div class="item-name">${it.Item_Name}</div>
//             <div class="item-qty">${it.Item_Quantity}</div>
//           </div>
//         `).join("")}
//       </div>
//     `)
//     .join("");

//   const html = `<!DOCTYPE html>
// <html>
// <head>
// <meta charset="UTF-8">
// <style>
//   body {
//     font-family: 'Courier New', monospace;
//     font-size: 16px;
//     font-weight: 700;
//     width: 58mm;
//     margin: 0;
//   }
//   .invoice { width: 48mm; padding: 2mm; }
//   .invoice-kitchen { margin-top: 8px; }
//   .header-center {
//     text-align: center;
//     border-bottom: 1px dashed #000;
//     margin-bottom: 6px;
//     padding-bottom: 6px;
//   }
//   .brand { font-size: 20px; font-weight: 800; }
//   .line { border-top: 1px dashed #000; margin: 6px 0; }
//   .line-solid { border-top: 1px solid #000; margin: 5px 0; }
//   .items-header, .item-row {
//     display: flex;
//     justify-content: space-between;
//     font-size: 15px;
//   }
//   .items-header { border-bottom: 1px solid #000; font-weight: 800; gap: 4px; padding-bottom: 4px; }
//   .col-no { width: 5mm; }
//   .item-name { flex: 1; }
//   .item-qty { width: 6mm; text-align: center; }
//   .info-row.date-time {
//     display: flex;
    
//     justify-content: space-between;
//     font-size: 12px;
//   }
  
//   @page { size: 58mm auto; margin: 0; }
// </style>
// </head>
// <body>
//   <div class="invoice">
//     ${kitchenSections}
//   </div>
// </body>
// </html>`;

//   const iframe = document.createElement("iframe");
//   iframe.style.display = "none";
//   document.body.appendChild(iframe);

//   // iframe.contentDocument.open();
//   // iframe.contentDocument.write(html);
//   // iframe.contentDocument.close();

//   // iframe.onload = () => {
//   //   iframe.contentWindow.print();
//   // };
//   iframe.onload = () => {
//   iframe.contentWindow.focus();
//   iframe.contentWindow.print();
// };

// iframe.contentDocument.open();
// iframe.contentDocument.write(html);
// iframe.contentDocument.close();


//   setTimeout(() => document.body.removeChild(iframe), 1000);
// };

  const onSubmit = async (data) => {
    console.log("Form Data:", data);

    if (!data.Table_Names || data?.Table_Names?.length === 0) {
      toast.error("Please select at least one table.");
      return;
    }
    if (!data.items || data.items.length === 0) {
      toast.error("Please add at least one item before saving.");
      return;
    }


   
    // Remove empty rows
    const cleanedItems = data.items.filter(
      (it) => it.Item_Name && it.Item_Name.trim() !== ""
    );
    for (const item of cleanedItems) {
  if (!item.Item_Quantity || Number(item.Item_Quantity) <= 0) {
    toast.error(`Quantity for "${item.Item_Name}" must be greater than zero`);
    return;
  }
}

    if (cleanedItems.length === 0) {
      toast.error("Please add at least one  item .");
      return;
    }

    // Check duplicate item names
    const seen = new Set();
    for (const item of cleanedItems) {
      const name = item.Item_Name.trim().toLowerCase();
      if (seen.has(name)) {
        toast.error(`Duplicate item: ${item.Item_Name}`);
        return;
      }
      seen.add(name);
    }

    // Prepare items safely
    const itemsSafe = cleanedItems.map((item) => ({
      Item_Name: item.Item_Name,
      Item_Price: item.Item_Price,
      Item_Quantity: item.Item_Quantity,
      Amount: item.Amount,
    }));

    // ------------------------------
    // 🚀 Prepare FINAL JSON Payload
    // ------------------------------
    const payload = {
      Customer_Name: data?.Customer_Name ,
      Customer_Phone: data?.Customer_Phone ,
      userId,                     // Or from redux/auth context
      Table_Names: data.Table_Names || [], // Array of table names from multi-select
      Tax_Type: data.Tax_Type || "None",
      Tax_Amount: data.Tax_Amount || "0.00",
      Sub_Total: data.Sub_Total || "0.00",
      Amount: data.Amount || "0.00",
      items: itemsSafe,
    };

    console.log("📦 Final JSON to send:", payload);

    try {
      const res = await addOrder(payload).unwrap();
// printKOTInvoice(res?.elligibleItems)
      if (!res?.success) {
        toast.error(res.message || "Failed to submit order.");
        return;
      }
      // ✅ SAFE PRINT
if (res?.elligibleItems && res?.elligibleItems &&   Object.keys(res.elligibleItems).length > 0) {
  // printKOTInvoice(res.elligibleItems);
  console.log(res.elligibleItems,"res.elligibleItems");
  // setWaiterOrdersToBePrinted(res.elligibleItems);
  // dispatch(setWaiterOrdersToBePrinted(res.elligibleItems));
  
}

      toast.success("Order Created Successfully!");
      dispatch(tableApi.util.invalidateTags(["Table"]));
      dispatch(waiterApi.util.invalidateTags(["waiter"]));
      navigate("/waiter/orders/all-orders");

    } catch (error) {
      console.error("❌ Order Submit Error:", error);
      toast.error(error?.data?.message || "Failed to submit order.");
    }
  };


const summaryItems=watch("items")||[]

// const customerName = watch("Customer_Name");
// const customerPhone = watch("Customer_Phone");
    const watchedCustomerName = watch("Customer_Name");
//const hasCustomer = Boolean(customerPhone); // phone is safest




console.log(summaryItems,"summaryItems");
  // console.log("updateCart", cart);
  console.log("Current form values:", formValues);
  console.log("Form errors:", errors);



  return (
    <>


      

      {/* Main Content */}
      <div className="sb2-2-3" style={{marginTop:"40px"}} >
        <div className="row" style={{ margin: "0px" }}>
          <div className="col-md-12">
            <div style={{ padding: "20px",marginBottom:"20px",height:"100%" }}
              className="box-inn-sp">

              <div className="inn-title w-full px-2 py-3">

                <div className="flex flex-col mt-10 sm:flex-row justify-between items-start sm:items-center
                                 w-full sm:mt-0">

                  {/* LEFT HEADER */}
                  <div className="w-full flex justify-center items-center sm:w-auto">
                    <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Add New Order</h4>
                    {/* <p className="text-gray-500 mb-2 sm:mb-4">
        Add new sale details
      </p> */}
                  </div>

                  {/* RIGHT BUTTON SECTION */}
                  {/* <div className="
      w-full sm:w-auto 
      flex flex-wrap sm:flex-nowrap 
      justify-start sm:justify-end 
      gap-3
    "> */}
                                 <div className="
       w-full flex justify-center items-center sm:w-auto 
       flex flex-wrap sm:flex-nowrap 
        sm:justify-end 
       gap-3
     ">
                    <button
                      type="button"
                      onClick={() => navigate("/waiter/orders/all-orders")}
                      className="text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "black" }}
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/waiter/orders/all-orders")}
                      className="text-white py-2 px-4 rounded"
                      style={{ backgroundColor: "#ff0000" }}
                    >
                      All Orders
                    </button>
                  </div>

                </div>
{/* 
                  <div style={{  backgroundColor: "#f1f1f19d" }} 
                    className="w-full flex flex-col p-2  mt-2 gap-2 heading-wrapper "
                                          >
                                         
              
                   {/* <div 
                  className="relative sm:w-1/4">

                     <span className="whitespace-nowrap active ">
                                            Customer
                                            <span className="text-red-500">*</span>
                          <span
      onClick={() => setShowCustomerModal(true)}
      className="block  py-2 text-[#ff0000] font-medium hover:bg-gray-100 cursor-pointer"
    >
      + Add Customer
    </span>
                                          </span>
                                          
          


                  </div>
                   
 <div className="relative sm:w-full">

 {!hasCustomer ? (
  <span className="text-sm font-medium text-gray-700">
    Customer
  </span>
) : (
  <div className="flex items-center gap-2 text-sm text-gray-700 w-full">
    <i className="fa fa-user-circle text-gray-400" />
    <span className="font-semibold ">
      Customer Name:
      <span>{customerName ??""}</span>
    </span>
    <span className="font-semibold">
      <span className="font-semibold">Phone:</span>
      {customerPhone}
    </span>
  </div>
)}


  {/* {!hasCustomer ? (
 
    <span
      onClick={() =>     setCustomerModal({ open: true, mode: "add" })}
      className="block py-2 text-[#ff0000] font-medium cursor-pointer hover:bg-gray-100"
    >
      + Add Customer
    </span>
  ) : (
    
    <span
      onClick={() =>
        setCustomerModal({
          open: true,
          mode: "edit",
        })
      }
      className="block py-2 text-blue-600 font-medium cursor-pointer hover:bg-gray-100"
    >
      ✏️ Edit Customer
    </span>
  )} 

  {!hasCustomer && (
  <span
    onClick={() => setCustomerModal({ open: true, mode: "add" })}
    className="block py-2 text-[#ff0000] font-medium cursor-pointer hover:bg-gray-100"
  >
    + Add Customer
  </span>
)}

</div>

{customerModal.open && (
  <AddCustomerModal
    mode="add"          // 🔒 force add-only
    initialData={null}  // 🔒 no edit data
    onClose={() => setCustomerModal({ open: false, mode: "add" })}
    onSave={(customer) => {
      setValue("Customer_Name", customer.Customer_Name || null, {
        shouldValidate: true,
      });
      setValue("Customer_Phone", customer.Customer_Phone, {
        shouldValidate: true,
      });
    }}
  />
)}


{/* {customerModal.open && (
  <AddCustomerModal
    mode={customerModal.mode}
    initialData={
      customerModal.mode === "edit"
        ? {
            Customer_Name: customerName || "",
            Customer_Phone: customerPhone || "",
          }
        : null
    }
    onClose={() => setCustomerModal({ open: false, mode: "add" })}
    onSave={(customer) => {
      setValue("Customer_Name", customer.Customer_Name || null, {
        shouldValidate: true,
      });
      setValue("Customer_Phone", customer.Customer_Phone, {
        shouldValidate: true,
      });
    }}
  />
)} 


                  
                                         
                                          {/* {errors?.Customer_Name && (
                                            <p className="text-red-500 text-xs mt-1">{errors?.Customer_Name?.message}</p>
                                          )} 
                                        </div> */}
                                        
            
                                <div style={{  backgroundColor: "#f1f1f19d" }}  
                                className="

  p-2  heading-wrapper
">
                                   
  <div style={{marginTop:"0px"}}
   className="  gap-2 flex flex-col w-full
  p-2  gap-6 sm:w-full sm:flex-row">
  
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

<div style={{marginTop:"0px"}} className="input-field  ">
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
             


                 {/* <div className="sm:visible"></div> */}
        {/* <div className="w-full ">
      <input
        type="text"
        placeholder="Search ..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
    </div> */}
     

                                                          </div>
             
              </div>
              <div style={{ padding: "0", backgroundColor: "#f1f1f19d" }} className="tab-inn">
                <form onSubmit={handleSubmit(onSubmit)}>

                  <div className="
  grid
  grid-rows-2 grid-cols-1
  md:grid-rows-1 md:grid-cols-3
  p-2 mt-0 gap-6 w-full heading-wrapper
">

                  {/* <div className="grid grid-cols-3  p-2 mt-0 gap-6 w-full heading-wrapper"> */}


                    <div ref={tableRef} className="relative">
                      <div
                        className="flex flex-row border rounded-md bg-white cursor-pointer h-[3rem]"
                        onClick={() => setOpen((prev) => !prev)}
                      >
                        <input
                          type="text"
                          placeholder="Search tables..."
                          value={tableSearch}
                          onChange={(e) => {
                            const value = e.target.value;
                            setTableSearch(value);
                            setOpen(true);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpen(true);
                          }}
                          onBlur={() => {
                            setTimeout(() => setOpen(false), 150);
                          }}
                          className="w-full outline-none py-1 px-2 text-gray-900"
                          style={{ marginTop: "4px", border: "none", height: "2rem" }}
                        />

                        <span className="absolute right-0 px-3 top-1/3 text-gray-700">
                          ▼
                        </span>
                      </div>

                      {open && (
                        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">

                          {tables?.tables
                            ?.filter((table) =>
                              table.Table_Name.toLowerCase().includes(tableSearch.toLowerCase())
                            )
                            .map((table, i) => {
                              const isSelected = selectedTables.includes(table.Table_Name);
                              const isAvailable = table.Status === "available";

                              return (
                                <div
                                  key={i}
                                  onClick={() => {
                                    if (!isAvailable) return; // ❌ Prevent clicking occupied tables

                                    let updatedSelection;

                                    if (isSelected) {
                                      updatedSelection = selectedTables.filter(
                                        (t) => t !== table.Table_Name
                                      );
                                    } else {
                                      updatedSelection = [...selectedTables, table.Table_Name];
                                    }

                                    setSelectedTables(updatedSelection);

                                    setValue("Table_Names", updatedSelection, {
                                      shouldValidate: true,
                                      shouldDirty: true,
                                    });
                                  }}
                                  className={`px-3 py-2 flex justify-between items-center 
                                ${isAvailable ? "cursor-pointer hover:bg-gray-100" : "bg-gray-200 cursor-not-allowed"} 
                                ${isSelected && isAvailable ? "bg-blue-100" : ""}
                            `}
                                >
                                  {/* Table Name */}
                                  <span className={`${!isAvailable ? "text-gray-500" : ""}`}>
                                    {table.Table_Name}
                                    {!isAvailable && (
                                      <span className="ml-2 text-red-500 text-xs">(occupied)</span>
                                    )}
                                  </span>

                                  {/* Checkmark only for selected available tables */}
                                  {isSelected && isAvailable && (
                                    <span className="text-blue-600 font-bold">✔</span>
                                  )}
                                </div>
                              );
                            })}

                          {tables?.tables?.filter((table) =>
                            table.Table_Name.toLowerCase().includes(tableSearch.toLowerCase())
                          ).length === 0 && (
                              <p className="px-3 py-2 text-gray-500">No table found</p>
                            )}
                        </div>
                      )}
                    </div>


                    {/* EMPTY MIDDLE COLUMN */}
                    {/* <div className="hidden md:block"></div> */}

                    {/* <div className="sm:visible"></div> */}

                    {/* RIGHT PANEL showing selected tables */}
                    <div className="flex flex-wrap gap-2">
                      {selectedTables.map((name, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-200 text-blue-900 rounded-md text-sm flex items-center gap-2"
                        >
                          {name}
                          <button
                           type="button"
                            className="text-red-600 font-bold"
                            onClick={() => {
                              const updated = selectedTables.filter((t) => t !== name);
                              setSelectedTables(updated);
                              setValue("Table_Names", updated);
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      {selectedTables.length === 0 && (
                        <p className="text-gray-500 flex w-full
                        items-center justify-center">No tables selected</p>
                      )}
                    </div>
                      <div className="w-full ">
      <input
        type="text"
        placeholder="Search ..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
    </div>
                  </div>

                  <div
                    style={{ backgroundColor: "#f1f1f19d" }} className=" mx-auto px-2 py-2">
                    {/* <div
                      className="
      flex 
      flex-wrap 
      gap-2 
      overflow-x-auto 
      scrollbar-hide
    "
                    >
                      {newCategories.map((cat, index) => (
                        <button
                          type="button"
                          key={index}
                          onClick={() => setActiveCategory(cat)}
                          className={`
          px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all
          ${activeCategory === cat
                              ? "text-white shadow-lg scale-105"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                            }
        `}
                          style={{
                            backgroundColor: activeCategory === cat ? "#ff0000" : "",
                            borderColor: activeCategory === cat ? "#ff0000" : "",
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div> */}
                                    <div className="sm:hidden px-2 relative">
  {/* <div
    onClick={() => setCategoryOpen(!categoryOpen)}
    className="w-full px-4 py-2  border text-sm flex justify-between items-center"
  >
    {activeCategory}
    <span>▼</span>
  </div> */}
  <div>
     <span style={{color:"#ff0000"}}
    className="active">Category</span>
    <input
                      type="text"
                      id="Category"
                       value={categorySearch}
                  style={{outline:"none"}}
                      placeholder="Category"
                      className="w-full outline-none  text-gray-900"
                      onFocus={() => setCategoryOpen(true)}
                         onChange={(e) => {
        setCategorySearch(e.target.value);
        setCategoryOpen(true);
         
      }}
         onBlur={() => {
        setTimeout(() => setCategoryOpen(false), 150);
      }}
      />
      </div>

 {categoryOpen && (
  <div className="absolute mt-1 w-full bg-white border rounded-lg shadow-md max-h-60 overflow-y-auto z-50">

    {(() => {
      const filteredCategories = newCategories?.filter((cat) =>
        cat.toLowerCase().includes(categorySearch.toLowerCase())
      );

      if (!filteredCategories || filteredCategories.length === 0) {
        return (
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No categories found
          </div>
        );
      }

      return filteredCategories.map((cat, idx) => (
        <div
          key={idx}
          onClick={() => {
            setActiveCategory(cat);
            setCategoryOpen(false);
            setCategorySearch(cat);
          }}
          className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
        >
          {cat}
        </div>
      ));
    })()}

  </div>
)}

  
</div>

<div className="hidden sm:flex flex-wrap gap-2">
  {newCategories.map((cat, index) => (
    <button
     type="button"
      key={index}
      onClick={() => setActiveCategory(cat)}
      className={`px-6 py-2 rounded-full transition ${
        activeCategory === cat
          ? "bg-[#ff0000] text-white"
          : "bg-white border"
      }`}
    >
      {cat}
    </button>
  ))}
</div>
                  </div>








                  <div>
                    {/* <div className="table-responsive table-desi mt-2"> */}
                    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">

                      <div className="bg-white shadow-md sticky top-0 ">
                        {/* TOP HEADER */}
                       



                      </div>


                      {/* Food Items Grid */}
                      <div className=" mx-auto px-2 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 
                                                lg:grid-cols-4 xl:grid-cols-6 gap-6">
                    
                          {filteredItems && filteredItems.length > 0 ? filteredItems?.map((item, index) => {

  const unavailable = item.is_available === 0; //  unavailable items

  return (
    <div
      key={item.id ?? index}
      className={`
        group relative bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 
        ${unavailable 
          ? "opacity-40 grayscale cursor-not-allowed" 
          : "hover:shadow-lg hover:-translate-y-1"
        }
      `}
    >

      {/* ===== UNAVAILABLE BADGE ===== */}
      {unavailable && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow">
          Unavailable
        </div>
      )}

      {/* ===== IMAGE SECTION ===== */}
      <div className="relative h-32 bg-gradient-to-br from-[#4CA1AF22] to-[#4CA1AF44]">

        <img
          src={
            item?.Item_Image
              ? `http://localhost:4000/uploads/food-item/${item.Item_Image}`
              : ""
          }
          alt={item.Item_Name}
          className="w-full h-full object-cover opacity-90"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute top-2 right-2">
          <span className="bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#ff0000] shadow">
            {item.Item_Category}
          </span>
        </div>

      
      </div>

      {/* ===== DETAILS SECTION ===== */}
      <div className="p-2">
            <div className="flex  mb-2">
          <h5 style={{color:"red"}}
          className="text-red text-[20px] leading-tight">
            {item?.Item_Name}
          </h5>
        </div>
        {/* PRICE ROW */}
        <div className="flex justify-between items-center mb-2">
          
          <div>
            <div className="text-base font-semibold text-gray-800">
              ₹{parseFloat(item.Item_Price).toFixed(2)}
            </div>
            <div className="text-[10px] text-gray-500">
              Tax: {TAX_RATES[item?.Tax_Type]}%
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-bold text-[#ff0000]">
              ₹{parseFloat(item.Amount).toFixed(2)}
            </div>
            <div className="text-[10px] text-gray-500">Total</div>
          </div>
        </div>

        {/* ===== CART CONTROLS ===== */}
        <div className="flex items-center justify-between bg-[#4CA1AF10] rounded-md p-1.5">

          {/* MINUS BUTTON */}
          <button
            type="button"
            disabled={unavailable || Number(cart[item.id] || 0) === 0}
            onClick={() =>
              !unavailable &&
              updateCart(item.id, -1, index, item.Item_Name, item.Item_Price)
              // updateCart(item.id, -1, index, item.Item_Name, item.Amount)
            }
            className={`
              w-7 h-7 flex items-center justify-center rounded-md shadow transition
              ${unavailable
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-white hover:bg-gray-100 text-[#ff0000]"
              }
            `}
          >
            <Minus className="w-3 h-3" />
          </button>
          {/* <button
  type="button"
  disabled={unavailable || Number(cart[item.id] || 0) === 0}
  onClick={() =>
    !unavailable &&
    updateCart(item.id -1, index, item?.Item_Name, item?.Amount)
  }
  className={`
    w-7 h-7 flex items-center justify-center rounded-md shadow transition
    ${unavailable || Number(cart[item.id] || 0) === 0
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-white hover:bg-gray-100 text-[#ff0000]"
    }
  `}
>
  <Minus className="w-3 h-3" />
</button> */}

{/* <span className="text-base font-semibold text-gray-800 px-2">
  {cart[item.Item_Id] || 0}
</span> */}

{/* <button
  type="button"
  disabled={unavailable}
  onClick={() =>
    !unavailable &&
    updateCart(item?.Item_Id, 1, index, item?.Item_Name, item?.Amount)
  }
  className={`
    w-7 h-7 flex items-center justify-center rounded-md shadow transition
    ${unavailable
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-[#ff0000] text-white hover:bg-[#3a8c98]"
    }
  `}
>
  <Plus className="w-3 h-3" />
</button> */}


          {/* QUANTITY DISPLAY */}
          <span className="text-base font-semibold text-gray-800 px-2">
            {cart[item.id] || 0}
          </span>

          {/* PLUS BUTTON */}
          <button
            style={{ backgroundColor: "#ff0000" }}
            type="button"
            disabled={unavailable}
            onClick={() =>
              !unavailable &&
              updateCart(item.id, 1, index, item.Item_Name, item.Item_Price)
              // updateCart(item.id, 1, index, item.Item_Name, item.Amount)
            }
            className={`
              w-7 h-7 flex items-center justify-center rounded-md shadow transition
              ${unavailable
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#ff0000] text-white hover:bg-[#3a8c98]"
              }
            `}
          >
            <Plus className="w-3 h-3" />
          </button>

        </div>
 <div className="flex mt-2 items-left gap-2 " >
              <span style={{color:"#ff0000"}}
               className="text-base font-semibold text-gray-800"> Quantity: </span>
              <span className="text-[16px] ">
                {item.Current_Quantity}
              </span>
            </div>
      </div>
    </div>
  );
}):(
                            <p className="text-gray-500 text-center col-span-full">
                              No items found
                            </p>
                          )}

                        </div>
                      </div>


                      <div className="
    fixed bottom-0 left-0 w-full 
    bg-white shadow-lg 
    px-4 py-2 z-50
  "
                      >
                 
                        <div className="flex justify-center items-center gap-12 w-full">
                          {/* <div className="grid grid-cols-3"> */}


                          {/* SAVE & HOLD */}
                          <button
                            type="button"
                            onClick={() => setShowSummary(true)}   // open bottom sheet
                            // disabled={formValues.errorCount > 0 || isAddingOrder}
                            className="relative w-full py-2 px-4 md:w-auto 
                            flex items-center justify-center gap-3 
                            
                                  text-white font-bold  rounded shadow sm:py-3 px-6"
                            style={{ backgroundColor: "black" }}
                          >
                            Save & Hold
                            {/* {isAddingOrder ? "Saving..." : "Save & Hold"} */}

                            <span className="relative">
                              <ShoppingCart size={22} />
                              {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white 
                                                                             text-[10px] font-bold w-4 h-4 flex items-center justify-center 
                                                                             rounded-full shadow">
                                  {totalItems}
                                </span>
                              )}
                            </span>
                          </button>

                          {/* <div></div> */}
                          {/* SAVE & PAY BILL */}


                        </div>
                      </div>

                      {/* BACKDROP */}
                      {showSummary && (
                        <div>

                          <button
                            type="button"
                            onClick={() => setShowSummary(false)}
                            className="fixed inset-0 bg-black/40 z-40"></button>
                        </div>
                      )}

                      {/* BOTTOM SHEET */}
                      <div
                        className={`
    fixed left-0 bottom-0 w-full 
    bg-white shadow-2xl rounded-t-2xl z-50
    transform transition-transform duration-300 p-4
    ${showSummary ? "translate-y-0" : "translate-y-full"}
  `}
                        // style={{ maxHeight: "vh" }}
                      >
                        {/* HANDLE BAR */}
                        <div className="w-full flex justify-center py-2">
                          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                        </div>

                        {/* HEADER */}
                        <div className="px-4 pb-3 border-b">
                          <div className="flex justify-between items-center">
                            <div className="flex justify-center items-center mx-auto">
                              <h2 className="text-lg font-bold text-gray-700">Bill Summary</h2>
                            </div>
                            <div className="flex justify-enditems-center gap-2">
                              <button type="button" style={{ backgroundColor: "transparent",fontSize: "30px" }}
                                className="text-gray-500 text-2xl font-bold"
                                onClick={() => setShowSummary(false)}>✖</button>
                            </div>
                          </div>
                        </div>

                        {/* SUMMARY CONTENT */}
                        <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: "55vh" }}>
                          {summaryItems?.map((item, index) => (
                            <div key={index} className="border-b pb-2 mb-2">
                              <div className="flex justify-between">
                                <span className="font-semibold">{item?.Item_Name}</span>
                                <span>x {item?.Item_Quantity}</span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>Amount</span>
                                <span>₹{item?.Amount}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* TOTAL FOOTER */}
                        <div className="px-4 py-3 border-t">
                          <div className="flex justify-between text-lg font-bold text-gray-900">
                            <span>Total</span>
                            <span>₹{watch("Amount")}</span>
                          </div>
                          <div className="flex justify-center mt-4">
                            <button type="submit"
                            style={{backgroundColor:"#ff0000"}}
                              className="w-16 h-10 flex items-center justify-center 
          rounded-md text-white shadow  ">
                              OK
                            </button>

                          </div>
                        </div>
                      </div>



                    </div>


                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
  /*  screens between 1000px and 640px */
  @media (max-width: 1000px) and (min-width: 641px) {

    /* Keep sale-wrapper horizontal but avoid tight spacing */
    .sale-wrapper{
      flex-direction: row !important;
      gap: 10px !important;
    }

    /* Left section slightly wider */
    .sale-left {
      width: 45% !important;
    }

    /* Right section slightly narrower */
    .sale-right {
      width: 55% !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
    }

    /* Inputs must not stretch too much */
    .sale-right > div > input {
      width: 80% !important;
    }

    /* Select dropdowns also */
    .state-of-supply-class > select {
      width: 80% !important;
    }

    /* Party, Invoice, GSTIN fields */
    .party-class,
    .invoice-number-class,
    .gstin-class,
    .invoice-date-class,
    .state-of-supply-class {
      width: 100% !important;
    }
  }

@media (max-width: 640px) {

  /* Make Party + GSTIN stack vertically */
  .heading-wrapper {
    flex-direction: column !important;
    gap: 16px !important;
    width: 100% !important;
  }

  /* Fix Party container */
  .party-class {
    width: 100% !important;
  }

  /* Make Party input full width */
  .party-class input {
    width: 100% !important;
  }

  /* Dropdown fix so it does NOT go off-screen */
  // .party-class .absolute {
  //   width: 100% !important;
  //   left: 0 !important;
  // }

  /* GSTIN block full width */
  .gstin-class {
    width: 100% !important;
    justify-content: flex-start !important;
  }

  /* GSTIN input also full width */
  .gstin-class input {
    width: 80% !important;
  }
  .party-class input {
    width: 80% !important;
  }
}

  /* below 640px */
  @media (max-width: 640px) {

  .party-class{
     width: 95% !important;
  }
    .invoice-number-class,
    .gstin-class,
    .invoice-date-class,
    .state-of-supply-class {
      width: 100% !important;
    }

    .state-of-supply-class > select {
      width: 100% !important;
    }

    .sale-wrapper {
      flex-direction: column !important;
      gap: 20px !important;
    }

    .sale-left {
      width: 100% !important;
    }

    .sale-right {
      width: 100% !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
    }

    .sale-right > div {
      width: 100% !important;
    }

    .sale-right > div > input {
      width: 100% !important;
    }

    .sale-input {
      width: 100% !important;
    }

    .sale-checkbox-label {
      padding-left: 30px !important;
    }
  }
`}
      </style>
    </>
  );
}