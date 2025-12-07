
import { useGetAllFoodItemsQuery } from "../../redux/api/foodItemApi";
import { tableApi, useGetAllTablesQuery } from "../../redux/api/tableApi";


import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { Controller, useFieldArray, useForm } from "react-hook-form";



import { useRef } from "react";
import { useEffect } from "react";

import { toast } from "react-toastify";

import { useDispatch, useSelector } from "react-redux";

import { LayoutDashboard, Minus, Plus, ShoppingCart } from "lucide-react";




import { useAddOrderMutation } from "../../redux/api/Staff/orderApi";

import OrderTakeawayModal from "../../components/Modal/OrderTakeawayModal";
import { useGetAllCategoriesQuery } from "../../redux/api/itemApi";




export default function OrdersTakeAway() {
    const { userId } = useSelector((state) => state.user);
    const dispatch = useDispatch();
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

    const categoryRefs = useRef([]); // store refs for category dropdowns
    const itemRefs = useRef([]);     // store refs for item dropdowns

   const[ordertakeawayModalOpen,setOrdertakeawayModalOpen]=useState(false);
const { data: categories, isLoading: isLoadingCategories } = useGetAllCategoriesQuery()
console.log(categories,"categories");
  //const existingCategories=categories?.map((category) => category.Item_Category);
 const existingCategories = [...new Set(categories?.map(c => c.Item_Category))];

const newCategories = ["All", ...existingCategories];

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

    const [selectedTables, setSelectedTables] = useState([]);
    const [addOrder, { isLoading: isAddingOrder }] = useAddOrderMutation();
    const itemUnits = {

        "pcs": "Pcs",
        "plates": "Plates",
        "btl": "Bottle",

    }
    const { data: tables, isLoading } = useGetAllTablesQuery({});
    const { data: menuItems, isMenuItemsLoading } = useGetAllFoodItemsQuery({});
    const items = menuItems?.foodItems
    console.log(tables, isLoading, "tables", menuItems, isMenuItemsLoading);

    const [rows, setRows] = useState([
        {
            CategoryOpen: false, categorySearch: "", preview: null
        }
    ]);
    // const [addNewSale, { isLoading: isAddingSale }] = useAddNewSaleMutation();
    // const[addPurchase,{isLoading:isAddingPurchase}]=useAddPurchaseMutation();
    // helper to update a field in a specific row
    const handleRowChange = (index, field, value) => {
        setRows((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: value,
            };
            return updated;
        });
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            setRows((prev) =>
                prev.map((row, idx) => {
                    const catRef = categoryRefs.current[idx];
                    const itemRef = itemRefs.current[idx];

                    const clickedInsideCategory =
                        catRef && catRef.contains(event.target);
                    const clickedInsideItem =
                        itemRef && itemRef.contains(event.target);

                    // if clicked outside both → close
                    if (!clickedInsideCategory && !clickedInsideItem) {
                        return { ...row, CategoryOpen: false, itemOpen: false };
                    }

                    return row;
                })
            );
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
//   Tax_Type: "None",
//   Tax_Amount: "0.00",
  Amount: "0.00",
  Sub_Total: "0.00",
  items: []   // No pre-created empty row
}

        // defaultValues: {
        //     Tax_Type: "None",
        //     Tax_Amount: "0.00",
        //     Amount: "0.00",
        //     Sub_Total: "0.00",

        //     items: [
        //         {
        //             Item_Name: "",
        //             Item_Price: "",
        //             Item_Quantity: 1,
        //             Amount: "0.00",
        //         }
        //     ]
        // }
    });


    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });



    
    const formValues = watch();
    const itemsValues = watch("items");   // watch all item rows
    //const totalPaid = watch("Total_Paid"); // watch Total_Paid
    const num = (v) => (v === undefined || v === null || v === "" ? 0 : Number(v));

    
    console.log(items)
    const [cart, setCart] = useState({});
    const [activeCategory, setActiveCategory] = useState('All');

    // const newCategories = ['All', existingCategories];
    console.log(newCategories,"newCategories")

    const filteredItems = activeCategory === 'All'
        ? items
        : items?.filter(item => item?.Item_Category === activeCategory);

 
console.log(filteredItems,"filteredItems")

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

// const updateCart = (itemId, delta, index, itemName, itemAmount) => {
//     const amount = parseFloat(itemAmount || 0);

//     setCart(prev => {
//         const newQty = Math.max(0, (prev[itemId] || 0) + delta);

//         let rowIndex = itemRowMap.current[itemId];

//         // ➤ If row does NOT exist yet → create one
//         if (rowIndex === undefined) {
//             rowIndex = fields.length; // next row index
//             itemRowMap.current[itemId] = rowIndex;

//             append({
//                 Item_Name: itemName,
//                 Item_Price: amount,
//                 Item_Quantity: newQty,
//                 Amount: (amount * newQty).toFixed(2),
//             });
//         }

//         // ➤ Update existing row
//         setValue(`items.${rowIndex}.Item_Name`, itemName);
//         setValue(`items.${rowIndex}.Item_Price`, amount);
//         setValue(`items.${rowIndex}.Item_Quantity`, newQty);
//         setValue(`items.${rowIndex}.Amount`, (amount * newQty).toFixed(2));
        
//  setTimeout(() => updateTotals(), 0);
//         return {
//             ...prev,
//             [itemId]: newQty
//         };
//     });
// };

const updateCart = (itemId, delta, index, itemName, itemAmount) => {
  const price = parseFloat(itemAmount || 0);

  setCart(prev => {
    const currentQty = prev[itemId] || 0;
    const newQty = Math.max(0, currentQty + delta);

    let rowIndex = itemRowMap.current[itemId];

    // 1️⃣ If quantity becomes ZERO → REMOVE row
    if (newQty === 0) {
      if (rowIndex !== undefined) {
        remove(rowIndex);               // remove row from RHF
        delete itemRowMap.current[itemId]; // delete mapping
      }

      return {
        ...prev,
        [itemId]: 0
      };
    }

    // 2️⃣ If row DOES NOT exist → CREATE one
    if (rowIndex === undefined) {
      rowIndex = fields.length;
      itemRowMap.current[itemId] = rowIndex;

      append({
        Item_Name: itemName,
        Item_Price: price,
        Item_Quantity: newQty,
        Amount: (price * newQty).toFixed(2)
      });
    }

    // 3️⃣ Update existing row values
    setValue(`items.${rowIndex}.Item_Name`, itemName);
    setValue(`items.${rowIndex}.Item_Price`, price);
    setValue(`items.${rowIndex}.Item_Quantity`, newQty);
    setValue(`items.${rowIndex}.Amount`, (price * newQty).toFixed(2));

    // 4️⃣ Recalculate totals
    setTimeout(updateTotals, 0);

    return {
      ...prev,
      [itemId]: newQty
    };
  });
};

    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    


    const calculateInvoiceTotals = (taxType, itemsValues) => {
        // 1️⃣ Calculate subtotal from all rows
        let subTotal = 0;
        itemsValues.forEach((item) => {
            const price = num(item.Item_Price);
            const qty = Math.max(1, num(item.Item_Quantity));
            subTotal += price * qty;
        });

        // 2️⃣ Tax calculation (based on subtotal)
        const taxPercent = TAX_RATES[taxType] ?? 0;
        const taxAmount = (subTotal * taxPercent) / 100;

        // 3️⃣ Final total
        const finalAmount = subTotal + taxAmount;

        return {
            Sub_Total: subTotal.toFixed(2),
            Tax_Amount: taxAmount.toFixed(2),
            Amount: finalAmount.toFixed(2),
        };
    };

    //const itemsValues = watch("items"); // watch all rows


    const handleSelect = (rowIndex, categoryName) => {
        setRows((prev) => {
            const updated = [...prev];
            updated[rowIndex] = {
                ...updated[rowIndex],
                Item_Category: categoryName,
                CategoryOpen: false,
                isExistingItem: false,   // user-typed, so still editable
            };
            return updated;
        });

        setValue(`items.${rowIndex}.Item_Category`, categoryName, { shouldValidate: true });
    };




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

            if (!res?.success) {
                toast.error(res.message || "Failed to submit order.");
                return;
            }

            toast.success("Order Created Successfully!");
            dispatch(tableApi.util.invalidateTags(["Table"]));
            navigate("/staff/orders/all-orders");

        } catch (error) {
            console.error("❌ Order Submit Error:", error);
            toast.error(error?.data?.message || "Failed to submit order.");
        }
    };





    console.log("updateCart", cart);
    console.log("Current form values:", formValues);
    console.log("Form errors:", errors);


 return (
         <>
 
 
             <div className="sb2-2-2">
                 <ul>
                     <li>
                         {/* <NavLink to="/">
                                 <i className="fa fa-home mr-2" aria-hidden="true"></i>
                                 Dashboard
                             </NavLink> */}
                         <NavLink style={{ display: "flex", flexDirection: "row" }}
                             to="/home"
 
                         >
                             <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
                             {/* <i className="fa fa-home mr-2" aria-hidden="true"></i> */}
                             Dashboard
                         </NavLink>
                     </li>
 
                 </ul>
             </div>
 
             {/* Main Content */}
             <div className="sb2-2-3" >
                 <div className="row" style={{ margin: "0px" }}>
                     <div className="col-md-12">
                         <div style={{ padding: "20px" }}
                             className="box-inn-sp">
 
                             <div className="inn-title w-full px-2 py-3">
 
                                 <div className="flex flex-col mt-2 sm:flex-row justify-between items-start sm:items-center
                                  w-full sm:m-0">
 
                                     {/* LEFT HEADER */}
                                     <div className="w-full sm:w-auto">
                                         <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Add Order Takeaway</h4>
                                         {/* <p className="text-gray-500 mb-2 sm:mb-4">
         Add new sale details
       </p> */}
                                     </div>
 
                                     {/* RIGHT BUTTON SECTION */}
                                     <div className="
       w-full sm:w-auto 
       flex flex-wrap sm:flex-nowrap 
       justify-start sm:justify-end 
       gap-3
     ">
                                         <button
                                             type="button"
                                             onClick={() => navigate("/staff/orders/all-orders")}
                                             className="text-white font-bold py-2 px-4 rounded"
                                             style={{ backgroundColor: "#4CA1AF" }}
                                         >
                                             Back
                                         </button>
 
                                         <button
                                             type="button"
                                             onClick={() => navigate("/staff/orders/all-orders")}
                                             className="text-white py-2 px-4 rounded"
                                             style={{ backgroundColor: "#4CA1AF" }}
                                         >
                                             All Orders
                                         </button>
                                     </div>
 
                                 </div>
                             </div>
                             <div style={{ padding: "0", backgroundColor: "#f1f1f19d" }} className="tab-inn">
                                 <form onSubmit={handleSubmit(onSubmit)}>
 
 
                                     {/* <div className="grid grid-cols-3  p-2 mt-2 gap-6 w-full heading-wrapper">
 
 
                                         <div className="relative">
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
                                                                    
                                                                     <span className={`${!isAvailable ? "text-gray-500" : ""}`}>
                                                                         {table.Table_Name}
                                                                         {!isAvailable && (
                                                                             <span className="ml-2 text-red-500 text-xs">(occupied)</span>
                                                                         )}
                                                                     </span>
 
                                                                    
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
 
 
                                         <div></div>
 
                                         <div className="flex flex-wrap gap-2">
                                             {selectedTables.map((name, idx) => (
                                                 <span
                                                     key={idx}
                                                     className="px-3 py-1 bg-blue-200 text-blue-900 rounded-md text-sm flex items-center gap-2"
                                                 >
                                                     {name}
                                                     <button
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
                                                 <p className="text-gray-500">No tables selected</p>
                                             )}
                                         </div>
                                         </div> */}
 
            <div 
                                                 style={{ backgroundColor: "#f1f1f19d"}} className=" mx-auto px-2 py-2">
   <div
     className="
       flex 
       flex-wrap 
       gap-2 
       overflow-x-auto 
       scrollbar-hide
     "
   >
     {newCategories.map((cat,index) => (
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
           backgroundColor: activeCategory === cat ? "#4CA1AF" : "",
           borderColor: activeCategory === cat ? "#4CA1AF" : "",
         }}
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
                                                 
 
 
                                             </div>
 
 
                                             {/* Food Items Grid */}
                                             <div className=" mx-auto px-4 py-4">
                                                 <div className="grid grid-cols-1 sm:grid-cols-2 
                                                 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                                                     {filteredItems?.map((item,index)=> {
                                                       
                                                         return(
                                                          
             <div key={item.id ?? index}
   className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg 
     transition-all duration-300 hover:-translate-y-1"
 >
 
   {/* IMAGE SECTION (Reduced Height) */}
   <div className="relative h-32 bg-gradient-to-br from-[#4CA1AF22] to-[#4CA1AF44]">
 
     {/* Background Image */}
     <img
       src={
         item?.Item_Image
           ? `http://localhost:4000/uploads/food-item/${item.Item_Image}`
           : ""
       }
       alt={item.Item_Name}
       className="w-full h-full object-cover opacity-90"
     />
 
     {/* Gradient Overlay */}
     <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
 
     {/* CATEGORY BADGE */}
     <div className="absolute top-2 right-2">
       <span className="bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#4CA1AF] shadow">
         {item.Item_Category}
       </span>
     </div>
 
     {/* ITEM TITLE */}
     <div className="absolute bottom-1 left-2 right-2">
       <h4 className="text-white text-[20px]  leading-tight">
         {item.Item_Name}
       </h4>
     </div>
   </div>
 
   {/* DETAILS SECTION */}
   <div className="p-2">
     {/* PRICE & TOTAL (Compact Row) */}
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
         <div className="text-sm font-bold text-[#4CA1AF]">
           ₹{parseFloat(item.Amount).toFixed(2)}
         </div>
         <div className="text-[10px] text-gray-500">Total</div>
       </div>
     </div>
 
     {/* CART CONTROLS — VERY COMPACT */}
     <div className="flex items-center justify-between bg-[#4CA1AF10] rounded-md p-1.5">
       <button
         type="button"
         onClick={() =>
           updateCart(item.id, -1, index, item.Item_Name, item.Amount)
         }
       
         className="w-7 h-7 flex items-center justify-center bg-white 
           rounded-md shadow hover:bg-gray-100 text-[#4CA1AF] transition"
       >
         <Minus className="w-3 h-3" />
       </button>
 
       <span className="text-base font-semibold text-gray-800 px-2">
         {cart[item.id] || 0}
       </span>
 
       <button
         type="button"
         onClick={() =>
           updateCart(item.id, 1, index, item.Item_Name, item.Amount)
         }
         className="w-7 h-7 flex items-center justify-center bg-[#4CA1AF] 
           rounded-md text-white shadow hover:bg-[#3a8c98] transition"
       >
         <Plus className="w-3 h-3" />
       </button>
     </div>
   </div>
 </div>
 
                                                         )
 
 })}
                                                 </div>
                                             </div>
 
       <div className="w-full flex justify-center md:justify-end sale-wrapper px-4">
 
   <div className="w-full md:w-1/2 lg:w-1/3 flex flex-col gap-4">
 
     {/* Subtotal */}
     <div className="flex justify-between items-center gap-4  ">
       <span className="font-medium whitespace-nowrap">Sub Total</span>
       <input
         type="text"
         {...register("Sub_Total")}
         readOnly
         className="form-control bg-transparent text-right"
         style={{ height: "1.2rem" }}
       />
     </div>
 
     {/* Amount */}
     <div className="flex justify-between items-center gap-4">
       <span className="font-medium whitespace-nowrap">Amount</span>
       <input
         type="text"
         {...register("Amount")}
         readOnly
         className="form-control bg-transparent text-right"
         style={{ height: "1.2rem" }}
       />
     </div>
 
     {/* BUTTONS SECTION */}
     <div className="
         flex flex-col 
         md:flex-row 
         gap-3 
         md:justify-end 
         w-full
       "
     >
 
       {/* SAVE & HOLD */}
       <button
         type="button"
         onClick={()=>setOrdertakeawayModalOpen(true)}
         disabled={formValues.errorCount > 0 || isAddingOrder}
         className="relative w-full md:w-auto flex items-center justify-center gap-3 
                    text-white font-bold py-2 px-5 rounded shadow"
         style={{ backgroundColor: "#4CA1AF" }}
       >
         {isAddingOrder ? "Saving..." : "Save & Pay Bill"}
 
         {/* Cart Icon with Badge */}
         <span className="relative">
           <ShoppingCart size={22} />
           {totalItems > 0 && (
             <span className="
                 absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold 
                 w-4 h-4 flex items-center justify-center rounded-full shadow
               "
             >
               {totalItems}
             </span>
           )}
         </span>
       </button>
 
       {/* SAVE AND PAY BILL */}
       {/* <button
         type="submit"
         className="w-full md:w-auto text-white font-bold py-2 px-5 rounded shadow"
         style={{ backgroundColor: "#4CA1AF" }}
       >
         Save & Pay Bill
       </button> */}
 
     </div>
   </div>
 </div>
 
     
                                         </div>
 
 
                                     </div>
                                 </form>
                                   {ordertakeawayModalOpen && 
                                                                 <OrderTakeawayModal
                                                                 onClose={() => setOrdertakeawayModalOpen(false)}
                                                                 orderDetails={formValues} 
                                                                 setOpen={setOrdertakeawayModalOpen} 
                                                                  />}
 
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

