

// import { foodItemApi, useGetAllFoodItemsQuery } from "../../redux/api/foodItemApi";
// import { tableApi, useGetAllTablesQuery } from "../../redux/api/tableApi";


// import { useState } from "react";
// import { NavLink, useNavigate, useParams } from "react-router-dom";

// import { useFieldArray, useForm } from "react-hook-form";



// import { useRef } from "react";
// import { useEffect } from "react";

// import { toast } from "react-toastify";

// import { useDispatch, useSelector } from "react-redux";

// import { LayoutDashboard, Minus, Plus, ShoppingCart } from "lucide-react";




// import { useAddOrderMutation, useGetAllCustomersQuery } from "../../redux/api/Staff/orderApi";

// import { io } from "socket.io-client";

// import { useMemo } from "react";
// import { useGetAllCategoriesQuery } from "../../redux/api/itemApi";





// const socket = io("http://localhost:4000", {
//   transports: ["websocket"],
// });
// export default function Orders() {
//   const { userId } = useSelector((state) => state.user);
//   const dispatch = useDispatch();
//   const TAX_RATES = {
//     "None": 0,
//     "GST0": 0,
//     "GST0.25": 0.25,
//     "GST3": 3,
//     "GST5": 5,
//     "GST12": 12,
//     "GST18": 18,
//     "GST28": 28,
//     "GST40": 40,

//     "IGST0": 0,
//     "IGST0.25": 0.25,
//     "IGST3": 3,
//     "IGST5": 5,
//     "IGST12": 12,
//     "IGST18": 18,
//     "IGST28": 28,
//     "IGST40": 40,
//   };
//   const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
//   const [showOrderDrawer, setShowOrderDrawer] = useState(false);
//   const { data: customers } = useGetAllCustomersQuery();
//   console.log(customers, "customers");
//   const [customerSearch, setCustomerSearch] = useState("");

//   const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
//   // const[customerModal,setShowCustomerModal]=useState(false);
//   //const[addParty, { isLoading }] = useAddPartyMutation();
//   const [isExistingCustomer, setIsExistingCustomer] = useState(false);






//   const dropdownRef = useRef(null);
//   const inputRef = useRef(null);
//   const tableRef = useRef(null);
//   console.log(isExistingCustomer, "isExistingCustomer");
//   // const categoryRefs = useRef([]); // store refs for category dropdowns
//   // const itemRefs = useRef([]);     // store refs for item dropdowns


//   const navigate = useNavigate();
//   // const { data: parties } = useGetAllPartiesQuery();

//   // console.log(items, "items");

//   //const [open, setOpen] = useState(false);

//   // const [showModal, setShowModal] = useState(false);
//   //const[selected,setSelected] = useState([]);
//     const { data: tables, isLoading } = useGetAllTablesQuery({});
//   //const [tableSearch, setTableSearch] = useState("");
//     const [selectedTables, setSelectedTables] = useState([]);
//   const [open, setOpen] = useState(false);
//   //  const [searchParams] = useSearchParams();
//   const { Table_Name } = useParams();
//   // const [newCategory, setNewCategory] = useState("");
//   const [showSummary, setShowSummary] = useState(false);
//   //const [categoryOpen, setCategoryOpen] = useState(false);
//   // const [categorySearch, setCategorySearch] = useState("");
// useEffect(() => {
//   if (!Table_Name || !tables?.tables) return;

//   const decoded = decodeURIComponent(Table_Name);

//   const match = tables.tables.find(
//     (t) => t.Table_Name === decoded
//   );

//   if (!match) return;

//   setSelectedTables([decoded]);

//   setValue("Table_Names", [decoded], {
//     shouldValidate: true,
//     shouldDirty: true,
//   });

//   //setTableSearch(decoded);

// }, [Table_Name, tables]);
//   //const categoryOpenRef = useRef(null);
//   // Close on outside click
//   // useEffect(() => {
//   //   const handleClickOutside = (e) => {
//   //     if (categoryOpenRef.current && !categoryOpenRef.current.contains(e.target)) {
//   //       setCategoryOpen(false);
//   //     }
//   //   };

//   //   document.addEventListener("mousedown", handleClickOutside);
//   //   return () => document.removeEventListener("mousedown", handleClickOutside);
//   // }, []);

//   const [addOrder] = useAddOrderMutation();
//   // const [customerModal, setCustomerModal] = useState({
//   //   open: false,
//   //   mode: "add", // add | edit
//   // });
//   // const[showCustomerModal,setShowCustomerModal]=useState(false);

//   //   // const[customerModal,setShowCustomerModal]=useState(false);
//   // const [selectedCustomer, setSelectedCustomer] = useState({
//   //   name: null,
//   //   phone: null,
//   // });

//   // const itemUnits = {

//   //   "pcs": "Pcs",
//   //   "plates": "Plates",
//   //   "btl": "Bottle",

//   // }
//   const { data: categories } = useGetAllCategoriesQuery()

//   //const existingCategories=categories?.map((category) => category.Item_Category);
//   const existingCategories = [...new Set(categories?.map(c => c.Item_Category))];

//   const newCategories = ["All", ...existingCategories];

//   const lastUpdatedItemRef = useRef(null);

//   const [activeCategory, setActiveCategory] = useState('All');
//   const lastCategoryRef = useRef(activeCategory);

//   const { data: menuItems, isLoading: isMenuItemsLoading, refetch: refetchMenuItems, isFetching } = useGetAllFoodItemsQuery({});
//   const items = menuItems?.foodItems
//   console.log(tables, isLoading, "tables", items, isMenuItemsLoading);
//   // const { data: categories,  } = useGetAllCategoriesQuery()
//   // console.log(categories, "categories");
//   //onst existingCategories=categories?.map((category) => category.Item_Category);
//   // const existingCategories = [...new Set(categories?.map(c => c.Item_Category))];
//   const [searchTerm, setSearchTerm] = useState('');
//   // const newCategories = ["All", ...existingCategories];
//   // const [rows, setRows] = useState([
//   //   {
//   //     CategoryOpen: false, categorySearch: "", preview: null
//   //   }
//   // ]);

//   useEffect(() => {
//     const handleAvailabilityChange = (data) => {
//       console.log("📢 Food status changed:", data);

//       // Force RTK Query to refetch
//       dispatch(foodItemApi.util.invalidateTags([{ type: "Food-Item", id: "LIST" }]));
//     };

//     socket.on("food_item_availability_changed", handleAvailabilityChange);

//     return () => {
//       socket.off("food_item_availability_changed", handleAvailabilityChange);
//     };
//   }, []);
//   useEffect(() => {
//     const handleSoftDeletedItem = (data) => {
//       console.log("📢 Food status changed:", data);

//       // Force RTK Query to refetch
//       dispatch(foodItemApi.util.invalidateTags([{ type: "Food-Item", id: "LIST" }]));
//     };

//     socket.on("food_item_deleted", handleSoftDeletedItem);

//     return () => {
//       socket.off("food_item_deleted", handleSoftDeletedItem);
//     };
//   }, []);

  
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(e.target) &&
//         inputRef.current &&
//         !inputRef.current.contains(e.target)
//       ) {
//         setCustomerDropdownOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (
//         tableRef.current &&
//         !tableRef.current.contains(e.target)
//       ) {
//         setOpen(false);

//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const {

//     control,
//     handleSubmit,
//     setValue,
//     watch,

//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       //   Tax_Type: "None",
//       //   Tax_Amount: "0.00",
//       Customer_Name: "",
//       Customer_Phone: "",
//       Amount: "0.00",
//       Sub_Total: "0.00",
//       items: []   // No pre-created empty row
//     }


//   });


//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "items",
//   });



//   // const handleAddRow = () => {
//   //   setRows((prev) => [
//   //     ...prev.map((row) => ({
//   //       ...row,
//   //       CategoryOpen: false,

//   //       //   itemOpen: false
//   //     })),
//   //     {
//   //       //   itemSearch: "",
//   //       //   itemOpen: false,
//   //       CategoryOpen: false,
//   //       categorySearch: "",

//   //     },
//   //   ]);

//   //   append({
//   //     Item_Name: "",

//   //     Item_Price: "",
//   //     Item_Quantity: "1",
//   //   });
//   // };


//   // const handleDeleteRow = (i) => {
//   //   setRows((prev) => prev.filter((_, idx) => idx !== i)); // remove UI state
//   //   remove(i); // remove from form
//   // };
//   const formValues = watch();
//   //const itemsValues = watch("items");   // watch all item rows
//   //const totalPaid = watch("Total_Paid"); // watch Total_Paid
//   //const num = (v) => (v === undefined || v === null || v === "" ? 0 : Number(v));


//   console.log(items)
//   const [cart, setCart] = useState({});


//   //const categories = ['All', ...new Set(items?.map(item => items?.Item_Category))];

//   // const filteredItems = activeCategory === 'All'
//   //   ? items
//   //   : items?.filter(item => item?.Item_Category === activeCategory);

//   // const filteredItems = useMemo(() => {
//   //   if (!items) return [];

//   //   const categoryChanged = lastCategoryRef.current !== activeCategory;

//   //   const result = items.filter((item) => {
//   //     const matchesCategory =
//   //       activeCategory === "All" ||
//   //       item.Item_Category === activeCategory;

//   //     // 🔥 Ignore search when category JUST changed
//   //     const matchesSearch =
//   //       categoryChanged
//   //         ? true
//   //         : !searchTerm.trim() ||
//   //           item.Item_Name.toLowerCase().includes(searchTerm.toLowerCase());

//   //     return matchesCategory && matchesSearch;
//   //   });

//   //   // update ref AFTER filtering
//   //   lastCategoryRef.current = activeCategory;

//   //   return result;
//   // }, [items, activeCategory, searchTerm]);


//   const itemRowMap = useRef({});
//   const updateTotals = () => {
//     const itemsValues = watch("items") || [];

//     let subTotal = 0;


//     itemsValues.forEach(item => {
//       const price = parseFloat(item.Item_Price) || 0;
//       const qty = parseInt(item.Item_Quantity) || 0;


//       subTotal += price * qty;

//     });



//     setValue("Sub_Total", subTotal.toFixed(2));

//     setValue("Amount", subTotal.toFixed(2));
//   };


//   const updateCart = (itemId, delta, _index, itemName, itemPrice) => {
//     const price = Number(itemPrice);
//     if (!price || price <= 0) return;

//     // 🔥 MARK RECENT ONLY WHEN ADDING
//     if (delta > 0) {
//       lastUpdatedItemRef.current = itemId;
//     }

//     setCart((prev) => {
//       const currentQty = Number(prev[itemId] || 0);
//       const newQty = currentQty + delta;
//       let rowIndex = itemRowMap.current[itemId];

//       /* ---------------- REMOVE ITEM ---------------- */
//       if (newQty <= 0) {
//         if (rowIndex !== undefined) {
//           remove(rowIndex);

//           // rebuild mapping
//           const newMap = {};
//           watch("items")?.filter(Boolean).forEach((it, idx) => {
//             newMap[it.id] = idx;
//           });
//           itemRowMap.current = newMap;
//         }

//         const updated = { ...prev };
//         delete updated[itemId];

//         setTimeout(updateTotals, 0);
//         return updated;
//       }

//       /* ---------------- ADD / UPDATE ---------------- */
//       if (rowIndex === undefined) {
//         rowIndex = fields.length;
//         itemRowMap.current[itemId] = rowIndex;

//         append({
//           id: itemId,
//           Item_Name: itemName,
//           Item_Price: price,
//           Item_Quantity: newQty,
//           Amount: (price * newQty).toFixed(2),
//         });
//       } else {
//         setValue(`items.${rowIndex}.Item_Quantity`, newQty);
//         setValue(
//           `items.${rowIndex}.Amount`,
//           (price * newQty).toFixed(2)
//         );
//       }

//       setTimeout(updateTotals, 0);
//       return { ...prev, [itemId]: newQty };
//     });
//   };

//   // const filteredItems = useMemo(() => {
//   //   if (!items) return [];

//   //   const term = searchTerm.trim().toLowerCase();

//   //   const list = !term
//   //     ? items
//   //     : items.filter(item =>
//   //         item.Item_Name?.toLowerCase().includes(term)
//   //       );

//   //   return [...list].sort((a, b) => {
//   //     const aId = a.id;     // ✅ FIX
//   //     const bId = b.id;

//   //     const aInCart = cart[aId] ? 1 : 0;
//   //     const bInCart = cart[bId] ? 1 : 0;

//   //     // 🔥 MOST RECENT ITEM ON TOP
//   //     if (aId === lastUpdatedItemRef.current) return -1;
//   //     if (bId === lastUpdatedItemRef.current) return 1;

//   //     // 🔥 CART ITEMS ABOVE OTHERS
//   //     if (aInCart !== bInCart) return bInCart - aInCart;

//   //     return 0;
//   //   });
//   // }, [items, searchTerm, cart]);
//   const filteredItems = useMemo(() => {
//     if (!items) return [];

//     const term = searchTerm.trim().toLowerCase();
//     const categoryChanged = lastCategoryRef.current !== activeCategory;

//     const filtered = items.filter((item) => {
//       const matchesCategory =
//         activeCategory === "All" ||
//         item.Item_Category === activeCategory;

//       // 🔥 Ignore search when category JUST changed
//       const matchesSearch = categoryChanged
//         ? true
//         : !term || item.Item_Name?.toLowerCase().includes(term);

//       return matchesCategory && matchesSearch;
//     });

//     // update category ref AFTER filtering
//     //lastCategoryRef.current = activeCategory;
//     return filtered;
//     // return [...filtered].sort((a, b) => {
//     //   const aId = a.id;
//     //   const bId = b.id;

//     //   const aInCart = cart[aId] ? 1 : 0;
//     //   const bInCart = cart[bId] ? 1 : 0;

//     //   // 🔥 MOST RECENT ITEM ALWAYS ON TOP
//     //   if (aId === lastUpdatedItemRef.current) return -1;
//     //   if (bId === lastUpdatedItemRef.current) return 1;

//     //   // 🔥 CART ITEMS ABOVE NON-CART ITEMS
//     //   if (aInCart !== bInCart) return bInCart - aInCart;

//     //   return 0;
//     // });
//   }, [items, activeCategory, searchTerm, cart]);
//   useEffect(() => {
//     if (
//       activeCategory !== "All" &&
//       filteredItems.length === 0
//     ) {
//       setTimeout(() => {
//         setActiveCategory("All");
//       }, 1000);
//       // setActiveCategory("All");
//     }
//   }, [filteredItems, activeCategory]);
//   const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
//   const Table_Names = watch("Table_Names")
//   console.log(filteredItems, "filteredItems")
//   const printKOTInvoice = (kitchens) => {
//     const getCurrentDate = () =>
//       new Date().toLocaleDateString("en-GB");

//     const getCurrentTime = () =>
//       new Date().toLocaleTimeString("en-US", {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       });

//     const kitchenSections = Object.entries(kitchens).map(([kitchenName, items], index) => `
//       ${index > 0 ? `<div class="line"></div>` : ``}

//       <div class="invoice-kitchen">
//         <div class="header-center">
//         <div class="brand">DINE-IN</div>
         
           
//               <div style="font-size:14px;font-weight:800">TABLE: ${Table_Names.join(", ")}</div>
              
          
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
//       .join("");

//     const html = `<!DOCTYPE html>
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
//   @media print {
//       @page {
//         size: 58mm auto;
//         margin: 0;
//       }
//         .no-print {
//               display: none !important;
//             }
//     }
// </style>
// </head>
// <body>
//   <div class="invoice">
//     ${kitchenSections}
//   </div>
// </body>
// </html>`;



//     // iframe.contentDocument.open();
//     // iframe.contentDocument.write(html);
//     // iframe.contentDocument.close();

//     // iframe.onload = () => {
//     //   iframe.contentWindow.print();
//     // };

//     //   const w = window.open("", "_blank");
//     //   if (!w) {
//     //     alert("Please allow pop-ups to print the invoice.");
//     //     return;
//     //   }

//     //   w.document.write(html);
//     //   w.document.write(`
//     //   <button onclick="window.print()" 
//     //     class="no-print"
//     //     style="position:fixed;top:10px;right:10px;padding:8px 12px;
//     //            background:#ff0000;color:white;border:none;border-radius:4px;
//     //            font-size:14px;cursor:pointer;z-index:9999;">
//     //       Print
//     //   </button>
//     // `);
//     // w.document.close();
//     const iframe = document.createElement("iframe");
//     iframe.style.display = "none";
//     document.body.appendChild(iframe);
//     iframe.onload = () => {
//       iframe.contentWindow.focus();
//       iframe.contentWindow.print();
//     };

//     iframe.contentDocument.open();
//     iframe.contentDocument.write(html);
//     iframe.contentDocument.close();


//     setTimeout(() => document.body.removeChild(iframe), 1000);
//   };

//   const onSubmit = async (data) => {
//     console.log("Form Data:", data);

//     if (!data.Table_Names || data?.Table_Names?.length === 0) {
//       toast.error("Please select at least one table.");
//       return;
//     }
//     if (!data.items || data.items.length === 0) {
//       toast.error("Please add at least one item before saving.");
//       return;
//     }



//     // Remove empty rows
//     const cleanedItems = data.items.filter(
//       (it) => it.Item_Name && it.Item_Name.trim() !== ""
//     );
//     for (const item of cleanedItems) {
//       if (!item.Item_Quantity || Number(item.Item_Quantity) <= 0) {
//         toast.error(`Quantity for "${item.Item_Name}" must be greater than zero`);
//         return;
//       }
//     }

//     if (cleanedItems.length === 0) {
//       toast.error("Please add at least one  item .");
//       return;
//     }

//     // Check duplicate item names
//     const seen = new Set();
//     for (const item of cleanedItems) {
//       const name = item.Item_Name.trim().toLowerCase();
//       if (seen.has(name)) {
//         toast.error(`Duplicate item: ${item.Item_Name}`);
//         return;
//       }
//       seen.add(name);
//     }

//     // Prepare items safely
//     const itemsSafe = cleanedItems.map((item) => ({
//       Item_Name: item.Item_Name,
//       Item_Price: item.Item_Price,
//       Item_Quantity: item.Item_Quantity,
//       Amount: item.Amount,
//     }));

//     // ------------------------------
//     // 🚀 Prepare FINAL JSON Payload
//     // ------------------------------
//     const payload = {
//       Customer_Name: data?.Customer_Name,
//       Customer_Phone: data?.Customer_Phone,
//       userId,                     // Or from redux/auth context
//       Table_Names: data.Table_Names || [], // Array of table names from multi-select
//       Tax_Type: data.Tax_Type || "None",
//       Tax_Amount: data.Tax_Amount || "0.00",
//       Sub_Total: data.Sub_Total || "0.00",
//       Amount: data.Amount || "0.00",
//       items: itemsSafe,
//     };

//     console.log("📦 Final JSON to send:", payload);

//     try {
//       const res = await addOrder(payload).unwrap();
//       // printKOTInvoice(res?.elligibleItems)
//       if (!res?.success) {
//         toast.error(res.message || "Failed to submit order.");
//         return;
//       }
//       // ✅ SAFE PRINT
//       if (res?.elligibleItems && res?.elligibleItems && Object.keys(res.elligibleItems).length > 0) {
//         printKOTInvoice(res.elligibleItems);
//       }

//       toast.success("Order Created Successfully!");
//       dispatch(tableApi.util.invalidateTags(["Table"]));
//       dispatch(
//         foodItemApi.util.invalidateTags([
//           { type: "Daily-Food-Item-Stock", id: "LIST" },
//         ]))
//       refetchMenuItems();
//       // dispatch(foodItemApi.util.invalidateTags(["Daily-Food-Item-Stock"]));
//       //navigate("/staff/orders/all-orders");
//       navigate("/staff/orders/all-tables");
//     } catch (error) {
//       console.error("❌ Order Submit Error:", error);
//       toast.error(error?.data?.message || "Failed to submit order.");
//     }
//   };

//   // const isPhoneSearch = /^\d+$/.test(customerSearch);

//   // const filteredCustomer = customers?.filter((party) => {
//   //   if (isPhoneSearch) {
//   //     return party?.Customer_Phone?.includes(customerSearch);
//   //   }
//   //   return party?.Customer_Name
//   //     ?.toLowerCase()
//   //     ?.includes(customerSearch.toLowerCase());
//   // });


//   const summaryItems = watch("items") || []

//   // const customerName = watch("Customer_Name");
//   // const customerPhone = watch("Customer_Phone");
//   const watchedCustomerName = watch("Customer_Name");
//   //const hasCustomer = Boolean(customerPhone); // phone is safest




//   console.log(summaryItems, "summaryItems");
//   // console.log("updateCart", cart);
//   console.log("Current form values:", formValues);
//   console.log("Form errors:", errors);



//   return (
//     <>


//       {/* <div className="sb2-2-2">
//         <ul>
//           <li>
//             {/* <NavLink to="/">
//                                 <i className="fa fa-home mr-2" aria-hidden="true"></i>
//                                 Dashboard
//                             </NavLink> *
//             <NavLink style={{ display: "flex", flexDirection: "row" }}
//               to="/home"

//             >
//               <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
             
//               Dashboard
//             </NavLink>
//           </li>

//         </ul>
//       </div> */}

//       {/* Main Content */}
//       <div style={{ marginTop: "40px" }} className="sb2-2-3" >
//         <div className="row" style={{ margin: "0px" }}>
//           <div className="col-md-12">
//             <div style={{ padding: "20px", marginBottom: "20px", height: "100%" }}
//               className="box-inn-sp">

//               <div className="inn-title w-full px-2 py-3">

//                 <div className="flex flex-col mt-10 sm:flex-row justify-between items-start sm:items-center
//                                  w-full sm:mt-0">

//                   {/* LEFT HEADER */}
//                   <div className="w-full flex justify-center items-center sm:w-auto">
//                     <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Add New Order</h4>
//                     {/* <p className="text-gray-500 mb-2 sm:mb-4">
//         Add new sale details
//       </p> */}
//                   </div>

//                   {/* RIGHT BUTTON SECTION */}
//                   {/* <div className="
//       w-full sm:w-auto 
//       flex flex-wrap sm:flex-nowrap 
//       justify-start sm:justify-end 
//       gap-3
//     "> */}
//                   <div className="
//        w-full flex justify-center items-center sm:w-auto 
//        flex flex-wrap sm:flex-nowrap 
//         sm:justify-end 
//        gap-3
//      ">
//                     {/* <button
//                       type="button"
//                       onClick={() => navigate("/staff/orders/all-orders")}
//                       className="text-white font-bold py-2 px-4 rounded"
//                       style={{ backgroundColor: "black" }}
//                     >
//                       Back
//                     </button> */}
//                     <button
//                       type="button"
//                       onClick={() => navigate("/staff/orders/all-tables")}
//                       className="text-white font-bold py-2 px-4 rounded"
//                       style={{ backgroundColor: "black" }}
//                     >
//                       Back
//                     </button>
//                     {/* /staff/orders/all-tables */}
//                     {/* <button
//                       type="button"
//                       onClick={() => navigate("/staff/orders/all-orders")}
//                       className="text-white py-2 px-4 rounded"
//                       style={{ backgroundColor: "#ff0000" }}
//                     >
//                       All Orders
//                     </button> */}
//                     <button
//                       type="button"
//                       onClick={() => navigate("/order/all-orders")}
//                       className="text-white py-2 px-4 rounded"
//                       style={{ backgroundColor: "#ff0000" }}
//                     >
//                       All Orders
//                     </button>

//                   </div>

//                 </div>
//                 {/* 
//                   <div style={{  backgroundColor: "#f1f1f19d" }} 
//                     className="w-full flex flex-col p-2  mt-2 gap-2 heading-wrapper "
//                                           >
                                         
              
//                    {/* <div 
//                   className="relative sm:w-1/4">

//                      <span className="whitespace-nowrap active ">
//                                             Customer
//                                             <span className="text-red-500">*</span>
//                           <span
//       onClick={() => setShowCustomerModal(true)}
//       className="block  py-2 text-[#ff0000] font-medium hover:bg-gray-100 cursor-pointer"
//     >
//       + Add Customer
//     </span>
//                                           </span>
                                          
          


//                   </div>
                   
//  <div className="relative sm:w-full">

//  {!hasCustomer ? (
//   <span className="text-sm font-medium text-gray-700">
//     Customer
//   </span>
// ) : (
//   <div className="flex items-center gap-2 text-sm text-gray-700 w-full">
//     <i className="fa fa-user-circle text-gray-400" />
//     <span className="font-semibold ">
//       Customer Name:
//       <span>{customerName ??""}</span>
//     </span>
//     <span className="font-semibold">
//       <span className="font-semibold">Phone:</span>
//       {customerPhone}
//     </span>
//   </div>
// )}


//   {/* {!hasCustomer ? (
 
//     <span
//       onClick={() =>     setCustomerModal({ open: true, mode: "add" })}
//       className="block py-2 text-[#ff0000] font-medium cursor-pointer hover:bg-gray-100"
//     >
//       + Add Customer
//     </span>
//   ) : (
    
//     <span
//       onClick={() =>
//         setCustomerModal({
//           open: true,
//           mode: "edit",
//         })
//       }
//       className="block py-2 text-blue-600 font-medium cursor-pointer hover:bg-gray-100"
//     >
//       ✏️ Edit Customer
//     </span>
//   )} 

//   {!hasCustomer && (
//   <span
//     onClick={() => setCustomerModal({ open: true, mode: "add" })}
//     className="block py-2 text-[#ff0000] font-medium cursor-pointer hover:bg-gray-100"
//   >
//     + Add Customer
//   </span>
// )}

// </div>

// {customerModal.open && (
//   <AddCustomerModal
//     mode="add"          // 🔒 force add-only
//     initialData={null}  // 🔒 no edit data
//     onClose={() => setCustomerModal({ open: false, mode: "add" })}
//     onSave={(customer) => {
//       setValue("Customer_Name", customer.Customer_Name || null, {
//         shouldValidate: true,
//       });
//       setValue("Customer_Phone", customer.Customer_Phone, {
//         shouldValidate: true,
//       });
//     }}
//   />
// )}


// {/* {customerModal.open && (
//   <AddCustomerModal
//     mode={customerModal.mode}
//     initialData={
//       customerModal.mode === "edit"
//         ? {
//             Customer_Name: customerName || "",
//             Customer_Phone: customerPhone || "",
//           }
//         : null
//     }
//     onClose={() => setCustomerModal({ open: false, mode: "add" })}
//     onSave={(customer) => {
//       setValue("Customer_Name", customer.Customer_Name || null, {
//         shouldValidate: true,
//       });
//       setValue("Customer_Phone", customer.Customer_Phone, {
//         shouldValidate: true,
//       });
//     }}
//   />
// )} 


                  
                                         
//                                           {/* {errors?.Customer_Name && (
//                                             <p className="text-red-500 text-xs mt-1">{errors?.Customer_Name?.message}</p>
//                                           )} 
//                                         </div> */}


//                 <div style={{ backgroundColor: "#f1f1f19d" }}
//                   className="

//   p-2  heading-wrapper mt-2
// ">

//                   <div style={{ marginTop: "0px" }}
//                     className="  gap-2 flex flex-col w-full
//   p-2  gap-6 sm:w-full sm:flex-row">

//                     <div style={{ marginTop: "0px" }} className="input-field relative">
//                       <span className="active">
//                         Customer Phone
//                       </span>

//                       <input
//                         ref={inputRef}

//                         type="number"
//                         id="Customer_Phone"
//                         placeholder="Search by phone"
//                         value={customerSearch}
//                         onChange={(e) => {
//                           let val = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);

//                           setCustomerSearch(val);

//                           setValue("Customer_Phone", val, { shouldValidate: true });

//                           // typing ≠ existing selection
//                           setIsExistingCustomer(false);
//                           setCustomerDropdownOpen(true);
//                         }}
//                         onFocus={() => setCustomerDropdownOpen(true)}
//                         className="w-full outline-none border-b-2 text-gray-900"
//                       />


//                       {customerDropdownOpen && (

//                         <div
//                           ref={dropdownRef}
//                           className="
//         absolute z-50 mt-1 w-full
//         bg-white border border-gray-300 rounded-md shadow-lg
//         max-h-48 overflow-y-auto
//       "
//                         >
//                           {customers
//                             ?.filter(
//                               (c) =>
//                                 c.Customer_Phone.includes(customerSearch) ||
//                                 c.Customer_Name?.toLowerCase().includes(customerSearch.toLowerCase())
//                             )
//                             .map((c, i) => (
//                               <div
//                                 key={i}
//                                 onClick={() => {
//                                   setCustomerSearch(c.Customer_Phone);

//                                   setValue("Customer_Phone", c.Customer_Phone, {
//                                     shouldValidate: true,
//                                   });

//                                   setValue(
//                                     "Customer_Name",
//                                     c.Customer_Name || null,
//                                     { shouldValidate: true }
//                                   );
//                                   setValue("Customer_Address", c.Customer_Address, {
//                                     shouldValidate: true,
//                                   });
//                                   setValue("Customer_Date", c.Special_Date, {
//                                     shouldValidate: true,
//                                   });


//                                   setIsExistingCustomer(true);
//                                   setCustomerDropdownOpen(false);
//                                 }}
//                                 className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
//                               >
//                                 <span className="font-medium">
//                                   {c.Customer_Name ?? ""}
//                                 </span>{" "}
//                                 <span className="text-gray-500">
//                                   ({c.Customer_Phone})
//                                 </span>
//                               </div>
//                             ))}

//                           {customers?.length === 0 && (
//                             <p className="px-3 py-2 text-gray-500">No customers found</p>
//                           )}
//                         </div>
//                       )}

//                       {errors?.Customer_Phone && (
//                         <p className="text-red-500 text-xs mt-1">
//                           Phone number is required
//                         </p>
//                       )}
//                     </div>

//                     <div style={{ marginTop: "0px" }} className="input-field  ">
//                       <span className="active">Customer Name</span>

//                       <input
//                         type="text"
//                         id="Customer_Name"
//                         placeholder="Customer Name"

//                         value={watchedCustomerName || ""}
//                         readOnly={isExistingCustomer}
//                         className="w-full outline-none border-b-2 text-gray-900"
//                         onChange={(e) => {
//                           setValue("Customer_Name", e.target.value || null, {
//                             shouldValidate: true,
//                           });
//                         }}
//                       />

//                       {errors?.Customer_Name && (
//                         <p className="text-red-500 text-xs mt-1">
//                           {errors.Customer_Name.message}
//                         </p>
//                       )}
//                     </div>




//                   </div>



//                   {/* <div className="sm:visible"></div> */}
//                   {/* <div className="w-full ">
//       <input
//         type="text"
//         placeholder="Search ..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="w-full"
//       />
//     </div> */}


//                 </div>

//               </div>
//               <div style={{ padding: "0", backgroundColor: "#f1f1f19d" }} className="tab-inn">
//                 <form onSubmit={handleSubmit(onSubmit)}>

//                   {/* ─── TOP BAR: Table selector + search ─── */}
//                   <div className="grid grid-rows-2 grid-cols-1 
//                   md:grid-rows-1 md:grid-cols-2 p-2 mt-0 gap-6 w-full heading-wrapper">

//                     {/* Table dropdown */}
//                     {/* <div ref={tableRef} className="relative">
//                       <div
//                         className="flex flex-row border rounded-md bg-white cursor-pointer h-[3rem]"
//                         onClick={() => setOpen((prev) => !prev)}
//                       >
//                         <input
//                           type="text"
//                           placeholder="Search tables..."
//                           value={tableSearch}
//                           onChange={(e) => { setTableSearch(e.target.value); setOpen(true); }}
//                           onClick={(e) => { e.stopPropagation(); setOpen(true); }}
//                           onBlur={() => setTimeout(() => setOpen(false), 150)}
//                           className="w-full outline-none py-1 px-2 text-gray-900"
//                           style={{ marginTop: "4px", border: "none", height: "2rem" }}
//                         />
//                         <span className="absolute right-0 px-3 top-1/3 text-gray-700">▼</span>
//                       </div>

//                       {open && (
//                         <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
//                           {tables?.tables
//                             ?.filter((table) => table.Table_Name.toLowerCase().includes(tableSearch.toLowerCase()))
//                             .map((table, i) => {
//                               const isSelected = selectedTables.includes(table.Table_Name);
//                               const isAvailable = table.Status === "available";
//                               return (
//                                 <div
//                                   key={i}
//                                   onClick={() => {
//                                     if (!isAvailable) return;
//                                     const updatedSelection = isSelected
//                                       ? selectedTables.filter((t) => t !== table.Table_Name)
//                                       : [...selectedTables, table.Table_Name];
//                                     setSelectedTables(updatedSelection);
//                                     setValue("Table_Names", updatedSelection, { shouldValidate: true, shouldDirty: true });
//                                   }}
//                                   className={`px-3 py-2 flex justify-between items-center
//                         ${isAvailable ? "cursor-pointer hover:bg-gray-100" : "bg-gray-200 cursor-not-allowed"}
//                         ${isSelected && isAvailable ? "bg-blue-100" : ""}`}
//                                 >
//                                   <span className={`${!isAvailable ? "text-gray-500" : ""}`}>
//                                     {table.Table_Name}
//                                     {!isAvailable && <span className="ml-2 text-red-500 text-xs">(occupied)</span>}
//                                   </span>
//                                   {isSelected && isAvailable && <span className="text-blue-600 font-bold">✔</span>}
//                                 </div>
//                               );
//                             })}
//                           {tables?.tables?.filter((t) => t.Table_Name.toLowerCase().includes(tableSearch.toLowerCase())).length === 0 && (
//                             <p className="px-3 py-2 text-gray-500">No table found</p>
//                           )}
//                         </div>
//                       )}
//                     </div> */}

//                     {/* Selected table chips */}
//                     <div className="flex flex-wrap gap-2">
//                       {selectedTables.map((name, idx) => (
//                         <span key={idx} className="px-3 py-1 bg-blue-200 text-blue-900 rounded-md text-sm flex items-center gap-2">
//                           {name}
//                           <button
//                             type="button"
//                             className="text-red-600 font-bold"
//                             onClick={() => {
//                               const updated = selectedTables.filter((t) => t !== name);
//                               setSelectedTables(updated);
//                               setValue("Table_Names", updated);
//                             }}
//                           >×</button>
//                         </span>
//                       ))}
//                       {selectedTables.length === 0 && (
//                         <p className="text-gray-500 flex w-full items-center justify-center">No tables selected</p>
//                       )}
//                     </div>

//                     {/* Search */}
//                     <div className="w-full">
//                       <input
//                         type="text"
//                         placeholder="Search ..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full"
//                       />
//                     </div>
//                   </div>

//                   {/* ══════════════════════════════════════════════════════════
//           MOBILE FAB BUTTONS — visible only on small screens
//           Category drawer trigger (left) + Order summary (right)
//       ══════════════════════════════════════════════════════════ */}
//                   <div className="flex lg:hidden fixed bottom-4 left-0 right-0 z-40
//        justify-between px-4 pointer-events-none">

//                     {/* Category FAB */}
//                     <button
//                       type="button"
//                       onClick={() => setShowCategoryDrawer(true)}
//                       className="pointer-events-auto flex items-center gap-1 bg-white border border-gray-200 text-[#ff0000] font-bold px-4 py-2 rounded-full shadow-lg text-sm"
//                     >
//                       ☰ Categories
//                     </button>

//                     {/* Order FAB */}
//                     <button
//                       type="button"
//                       onClick={() => setShowOrderDrawer(true)}
//                       className="pointer-events-auto relative flex items-center gap-1 text-white font-bold px-4 py-2 rounded-full shadow-lg text-sm"
//                       style={{ backgroundColor: "#ff0000" }}
//                     >
//                       🧾 Order
//                       {totalItems > 0 && (
//                         <span className="absolute -top-2 -right-2 bg-white text-[#ff0000] text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow">
//                           {totalItems}
//                         </span>
//                       )}
//                     </button>
//                   </div>

//                   {/* ══════════════════════════════════════════════════════════
//           MOBILE — Category Side Drawer (slides from left)
//       ══════════════════════════════════════════════════════════ */}
//                   {showCategoryDrawer && (
//                     <div className="lg:hidden fixed inset-0 z-50 flex ">
//                       {/* Backdrop */}
//                       <button
//                         type="button"
//                         className="absolute inset-0 bg-black/40"
//                         onClick={() => setShowCategoryDrawer(false)}
//                       />
//                       {/* Drawer */}
//                       <div className="relative w-64 bg-white h-full flex flex-col shadow-2xl z-10">
//                         <div className="px-4 py-3 bg-[#ff0000] flex justify-between items-center">
//                           <h4 className="text-white font-bold text-sm uppercase tracking-wide">Categories</h4>
//                           <button type="button"
//                             onClick={() => setShowCategoryDrawer(false)} className="text-white text-xl font-bold">✖</button>
//                         </div>
//                         <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
//                           {newCategories.map((cat, index) => (
//                             <button
//                               type="button"
//                               key={index}
//                               onClick={() => { setActiveCategory(cat); setShowCategoryDrawer(false); }}
//                               className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === cat
//                                   ? "bg-[#ff0000] text-white shadow-sm"
//                                   : "bg-gray-50 hover:bg-red-50 text-gray-700 border border-gray-100"
//                                 }`}
//                             >
//                               {cat}
//                             </button>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* ══════════════════════════════════════════════════════════
//           MOBILE — Order Summary Bottom Drawer (slides from bottom)
//       ══════════════════════════════════════════════════════════ */}
//                   {showOrderDrawer && (
//                     <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end ">
//                       {/* Backdrop */}
//                       <button
//                         type="button"
//                         className="absolute inset-0 bg-black/40"
//                         onClick={() => setShowOrderDrawer(false)}
//                       />
//                       {/* Drawer */}
//                       <div className="relative bg-white rounded-t-2xl shadow-2xl z-10 flex flex-col" style={{ maxHeight: "80vh" }}>
//                         {/* Handle */}
//                         <div className="flex justify-center pt-3 pb-1">
//                           <div className="w-10 h-1 bg-gray-300 rounded-full" />
//                         </div>
//                         {/* Header */}
//                         <div className="px-4 py-3 bg-[#ff0000] flex justify-between items-center">
//                           <h4 className="text-white font-bold text-sm uppercase tracking-wide">Order Summary</h4>
//                           <div className="flex items-center gap-3">
//                             <span className="relative">
//                               <ShoppingCart size={20} className="text-white" />
//                               {totalItems > 0 && (
//                                 <span className="absolute -top-2 -right-2 bg-white text-[#ff0000] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
//                                   {totalItems}
//                                 </span>
//                               )}
//                             </span>
//                             <button type="button" onClick={() => setShowOrderDrawer(false)} className="text-white text-xl font-bold">✖</button>
//                           </div>
//                         </div>
//                         {/* Scrollable items */}
//                         <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
//                           {summaryItems && summaryItems.length > 0 ? (
//                             summaryItems.map((item, index) => (
//                               <div key={index} className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
//                                 <div className="flex justify-between items-start">
//                                   <span className="font-semibold text-sm text-gray-800 flex-1 pr-2">{item?.Item_Name}</span>
//                                   <span className="text-xs bg-red-100 text-[#ff0000] px-2 py-0.5 rounded-full font-medium whitespace-nowrap">x {item?.Item_Quantity}</span>
//                                 </div>
//                                 <div className="flex justify-between text-xs text-gray-500 mt-1">
//                                   <span>Amount</span>
//                                   <span className="font-semibold text-gray-700">₹{item?.Amount}</span>
//                                 </div>
//                                 <div className="flex items-center justify-between bg-[#4CA1AF10] rounded-md p-1.5">
//                                   <button
//                                     type="button"
//                                     disabled={Number(cart[item.id] || 0) === 0}
//                                     onClick={() => updateCart(item.id, -1, index, item.Item_Name, item.Item_Price)}
//                                     className={`w-7 h-7 flex items-center justify-center rounded-md shadow transition ${Number(cart[item.id] || 0) === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-[#ff0000]"}`}
//                                   >
//                                     <Minus className="w-3 h-3" />
//                                   </button>
//                                   <span className="text-base font-semibold text-gray-800 px-2">
//                                     {cart[item.id] || 0}</span>
//                                   <button
//                                     style={{ backgroundColor: "#ff0000" }}
//                                     type="button"
//                                     // disabled={unavailable}
//                                     onClick={() => updateCart(item.id, 1, index,
//                                       item.Item_Name, item.Item_Price)}
//                                     className={`w-7 h-7 flex items-center 
//                             justify-center rounded-md shadow transition
//                              ${Number(cart[item.id] || 0) === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#ff0000] text-white hover:bg-[#3a8c98]"}`}
//                                   >
//                                     <Plus className="w-3 h-3" />
//                                   </button>
//                                 </div>
//                               </div>
//                             ))
//                           ) : (
//                             <div className="flex flex-col items-center justify-center h-32 text-gray-400">
//                               <ShoppingCart size={32} className="mb-2 opacity-30" />
//                               <p className="text-sm">No items added yet</p>
//                             </div>
//                           )}
//                         </div>
//                         {/* Footer */}
//                         <div className="border-t px-4 py-3 space-y-2 bg-white">
//                           <div className="flex justify-between font-bold text-gray-900">
//                             <span>Total</span>
//                             <span className="text-[#ff0000] text-lg">₹{watch("Amount")}</span>
//                           </div>
//                           <div className="grid grid-cols-2 gap-2">
//                             <button
//                               type="button"
//                               onClick={() => { setShowOrderDrawer(false); setShowSummary(true); }}
//                               className="py-2.5 flex items-center justify-center gap-2 rounded-lg text-white font-bold shadow text-sm"
//                               style={{ backgroundColor: "black" }}
//                             >
//                               {/* <ShoppingCart size={16} /> Save &amp; Hold */}
//                               <span className="relative">
//                                 <ShoppingCart size={20} className="text-white" />
//                                 {totalItems > 0 && (
//                                   <span className="absolute -top-2 -right-2 bg-white text-[#ff0000] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
//                                     {totalItems}
//                                   </span>
//                                 )}
//                               </span>
//                               Save &amp; Hold
//                             </button>
//                             <button
//                               type="button"
//                               className="py-2.5 rounded-lg text-white font-bold shadow text-sm"
//                               style={{ backgroundColor: "#ff0000" }}
//                             >
//                               Save &amp; Pay Bill
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* ══════════════════════════════════════════════════════════
//           DESKTOP — 3-column layout (sm and above)
//       ══════════════════════════════════════════════════════════ */}
//                   <div className="hidden lg:flex h-[calc(100vh-120px)] 
//       overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50">

//                     {/* LEFT — Categories */}
//                     <aside className="w-[180px] lg:w-[200px] flex-shrink-0 bg-white shadow-md flex flex-col overflow-hidden border-r">
//                       <div className="px-3 py-3 border-b bg-[#ff0000]">
//                         <h4 className="text-white font-bold text-sm tracking-wide uppercase">Categories</h4>
//                       </div>
//                       <div className="flex flex-col overflow-y-auto flex-1 py-2 gap-1 px-2">
//                         {newCategories.map((cat, index) => (
//                           <button
//                             type="button"
//                             key={index}
//                             onClick={() => setActiveCategory(cat)}
//                             className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === cat
//                                 ? "bg-[#ff0000] text-white shadow-sm"
//                                 : "bg-gray-50 hover:bg-red-50 text-gray-700 border border-gray-100"
//                               }`}
//                           >
//                             {cat}
//                           </button>
//                         ))}
//                       </div>
//                     </aside>

//                     {/* MIDDLE — Items grid */}
//                     <main className="flex-1 overflow-y-auto px-3 py-4 pb-4">
//                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                         {(isMenuItemsLoading || isFetching) ? (
//                           [...Array(12)].map((_, i) => (
//                             <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
//                               <div className="h-32 bg-gray-200" />
//                               <div className="p-2 space-y-2">
//                                 <div className="h-4 bg-gray-200 rounded w-3/4" />
//                                 <div className="h-3 bg-gray-200 rounded w-1/2" />
//                                 <div className="h-8 bg-gray-200 rounded" />
//                               </div>
//                             </div>
//                           ))
//                         ) : filteredItems && filteredItems.length > 0 ? (
//                           filteredItems?.map((item, index) => {
//                             const unavailable = item.is_available === 0;
//                             return (
//                               <div

//                                 key={item.id ?? index}
//                                 className={`group relative 
//                       bg-white rounded-xl overflow-hidden shadow-md 
//                       transition-all duration-300 ${unavailable ? "opacity-40 grayscale cursor-not-allowed" : "cursor-pointer hover:shadow-lg hover:-translate-y-1"
//                                   }
//                               ${summaryItems?.some(it => it.Item_Name === item.Item_Name)
//                                     ? "border-2 border-green-500"
//                                     : ""
//                                   }
//                     `
//                                 }
//                                 onClick={() => {
//                                   if (unavailable) return; // 🚫 STOP HERE
//                                   updateCart(item.id, 1, index, item.Item_Name, item.Item_Price);
//                                 }}
//                               //onClick={()=> updateCart(item.id, 1, index, item.Item_Name, item.Item_Price)}
//                               >
//                                 {unavailable && (
//                                   <div className="absolute top-2 left-2 bg-red-600 
//                       text-white text-[10px] px-2 py-1 rounded shadow">
//                                     Unavailable
//                                   </div>
//                                 )}
//                                 <div className="relative h-32 bg-gradient-to-br from-[#4CA1AF22] to-[#4CA1AF44]">
//                                   {item?.Item_Image && (
//                                     <img loading="lazy" src={`http://localhost:4000/uploads/food-item/${item.Item_Image}`} alt={item?.Item_Name} className="w-full h-full object-cover opacity-90" />
//                                   )}
//                                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
//                                   <div className="absolute top-2 right-2">
//                                     <span className="bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#ff0000] shadow">{item.Item_Category}</span>
//                                   </div>
//                                 </div>
//                                 <div className="p-2">
//                                   <div className="flex mb-2">
//                                     <h5 style={{ color: "red" }} className="text-[20px] leading-tight">{item?.Item_Name}</h5>
//                                   </div>
//                                   <div className="flex justify-between items-center mb-2">
//                                     <div>
//                                       <div className="text-base font-semibold text-gray-800">₹{Number(item?.Item_Price || 0).toFixed(2)}</div>
//                                       <div className="text-[10px] text-gray-500">Tax: {TAX_RATES[item?.Tax_Type]}%</div>
//                                     </div>
//                                     <div className="text-right">
//                                       <div className="text-sm font-bold text-[#ff0000]">₹{Number(item?.Amount || 0).toFixed(2)}</div>
//                                       <div className="text-[10px] text-gray-500">Total</div>
//                                     </div>
//                                   </div>
//                                   {/* <div className="flex items-center justify-between bg-[#4CA1AF10] rounded-md p-1.5">
//                         <button
//                           type="button"
//                           disabled={unavailable || Number(cart[item.id] || 0) === 0}
//                           onClick={() => !unavailable && 
//                           updateCart(item.id, -1, index, item.Item_Name, item.Item_Price)}
//                           className={`w-7 h-7 flex items-center justify-center rounded-md shadow transition ${unavailable ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-[#ff0000]"}`}
//                         >
//                           <Minus className="w-3 h-3" />
//                         </button>
//                         <span className="text-base font-semibold text-gray-800 px-2">{cart[item.id] || 0}</span>
//                         <button
//                           style={{ backgroundColor: "#ff0000" }}
//                           type="button"
//                           disabled={unavailable}
//                           onClick={() => !unavailable && updateCart(item.id, 1, index, item.Item_Name, item.Item_Price)}
//                           className={`w-7 h-7 flex items-center justify-center rounded-md shadow transition ${unavailable ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#ff0000] text-white hover:bg-[#3a8c98]"}`}
//                         >
//                           <Plus className="w-3 h-3" />
//                         </button>
//                       </div> */}
//                                   <div className="flex mt-2 items-center gap-2">
//                                     <span style={{ color: "#ff0000" }} className="text-base font-semibold">Quantity:</span>
//                                     <span className="text-[16px]">{item?.Current_Quantity}</span>
//                                   </div>
//                                 </div>
//                               </div>
//                             );
//                           })
//                         ) : (
//                           <p className="text-gray-500 text-center col-span-full">No items found</p>
//                         )}
//                       </div>
//                     </main>

//                     {/* RIGHT — Order Summary (fixed height, scrollable list) */}
//                     <aside className="w-[280px] lg:w-[300px] overflow-y-auto
//         flex-shrink-0 bg-white shadow-md flex flex-col border-l">
//                       {/* Header */}
//                       <div className="px-4 py-3 bg-[#ff0000] flex items-center justify-between flex-shrink-0">
//                         <h4 className="text-white font-bold text-sm tracking-wide uppercase">Order Summary</h4>
//                         <span className="relative">
//                           <ShoppingCart size={20} className="text-white" />
//                           {totalItems > 0 && (
//                             <span className="absolute -top-2 -right-2 bg-white text-[#ff0000] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow">
//                               {totalItems}
//                             </span>
//                           )}
//                         </span>
//                       </div>

//                       {/* ✅ Scrollable item list — grows and scrolls */}
//                       <div
//                         className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0 
//          ">
//                         {summaryItems && summaryItems.length > 0 ? (
//                           summaryItems.map((item, index) => (
//                             <div key={index} className="bg-gray-50  rounded-lg px-3 
//                 py-2 border border-gray-100">
//                               <div className="flex justify-between items-start">
//                                 <span className="font-semibold text-sm text-gray-800 leading-tight flex-1 pr-2">{item?.Item_Name}</span>
//                                 <span className="text-xs bg-red-100 text-[#ff0000] px-2 py-0.5 rounded-full font-medium whitespace-nowrap">x {item?.Item_Quantity}</span>
//                               </div>
//                               <div className="flex justify-between text-xs text-gray-500 mt-1">
//                                 <span>Amount</span>
//                                 <span className="font-semibold text-gray-700">₹{item?.Amount}</span>
//                               </div>
//                               <div className="flex items-center justify-between bg-[#4CA1AF10] rounded-md p-1.5">
//                                 <button
//                                   type="button"
//                                   disabled={Number(cart[item.id] || 0) === 0}
//                                   onClick={() => updateCart(item.id, -1, index, item.Item_Name, item.Item_Price)}
//                                   className={`w-7 h-7 flex items-center justify-center rounded-md shadow transition ${Number(cart[item.id] || 0) === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-[#ff0000]"}`}
//                                 >
//                                   <Minus className="w-3 h-3" />
//                                 </button>
//                                 <span className="text-base font-semibold text-gray-800 px-2">
//                                   {cart[item.id] || 0}</span>
//                                 <button
//                                   style={{ backgroundColor: "#ff0000" }}
//                                   type="button"
//                                   // disabled={unavailable}
//                                   onClick={() => updateCart(item.id, 1, index,
//                                     item.Item_Name, item.Item_Price)}
//                                   className={`w-7 h-7 flex items-center 
//                             justify-center rounded-md shadow transition
//                              ${Number(cart[item.id] || 0) === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#ff0000] text-white hover:bg-[#3a8c98]"}`}
//                                 >
//                                   <Plus className="w-3 h-3" />
//                                 </button>
//                               </div>
//                             </div>
//                           ))
//                         ) : (
//                           <div className="flex flex-col items-center justify-center h-40 text-gray-400">
//                             <ShoppingCart size={36} className="mb-2 opacity-30" />
//                             <p className="text-sm">No items added yet</p>
//                           </div>
//                         )}
//                       </div>

//                       {/* ✅ Pinned footer — never scrolls away */}
//                       <div className="border-t bg-white px-4 py-3 space-y-3 flex-shrink-0">
//                         <div className="flex justify-between items-center text-base font-bold text-gray-900">
//                           <span>Total</span>
//                           <span className="text-[#ff0000] text-lg">₹{watch("Amount")}</span>
//                         </div>
//                         <div className="flex flex-col gap-2">
//                           <button
//                             type="button"
//                             onClick={() => setShowSummary(true)}
//                             className="w-full py-2.5 px-4 flex items-center justify-center gap-2 rounded-lg text-white font-bold shadow transition hover:opacity-90"
//                             style={{ backgroundColor: "black" }}
//                           >
//                             <span className="relative">
//                               <ShoppingCart size={20} className="text-white" />
//                               {totalItems > 0 && (
//                                 <span className="absolute -top-2 -right-2 bg-white text-[#ff0000] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
//                                   {totalItems}
//                                 </span>
//                               )}
//                             </span>
//                             Save &amp; Hold
//                             {/* <ShoppingCart size={18} /> Save &amp; Hold */}
//                           </button>
//                           <button
//                             type="button"
//                             className="w-full py-2.5 px-4 rounded-lg text-white font-bold shadow transition hover:opacity-90"
//                             style={{ backgroundColor: "#ff0000" }}
//                           >
//                             Save &amp; Pay Bill
//                           </button>
//                         </div>
//                       </div>
//                     </aside>
//                   </div>

//                   {/* ══════════════════════════════════════════════════════════
//           MOBILE — Items only (full width)
//       ══════════════════════════════════════════════════════════ */}
//                   <div className="lg:hidden bg-gradient-to-br from-orange-50 via-white to-red-50 pb-24">
//                     <div className="px-3 py-4 grid grid-cols-2 gap-3">
//                       {(isMenuItemsLoading || isFetching) ? (
//                         [...Array(6)].map((_, i) => (
//                           <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
//                             <div className="h-28 bg-gray-200" />
//                             <div className="p-2 space-y-2">
//                               <div className="h-4 bg-gray-200 rounded w-3/4" />
//                               <div className="h-3 bg-gray-200 rounded w-1/2" />
//                               <div className="h-8 bg-gray-200 rounded" />
//                             </div>
//                           </div>
//                         ))
//                       ) : filteredItems && filteredItems.length > 0 ? (
//                         filteredItems?.map((item, index) => {
//                           const unavailable = item.is_available === 0;
//                           return (
//                             <div
//                               key={item.id ?? index}
//                               className={`relative bg-white rounded-xl overflow-hidden
//                      shadow-md ${unavailable ? "opacity-40 grayscale cursor-not-allowed"
//                                   : "cursor-pointer"}
//                        ${summaryItems?.some(it => it.Item_Name === item.Item_Name)
//                                   ? "border-2 border-green-500"
//                                   : ""
//                                 }
//                        `}
//                               onClick={() => {
//                                 if (unavailable) return; // 🚫 STOP HERE
//                                 updateCart(item.id, 1, index, item.Item_Name, item.Item_Price);
//                               }}
//                             //onClick={()=> updateCart(item.id, 1, index, item.Item_Name, item.Item_Price)}
//                             >
//                               {unavailable && (
//                                 <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow z-10">
//                                   Unavailable
//                                 </div>
//                               )}
//                               <div className="relative h-28 bg-gradient-to-br from-[#4CA1AF22] to-[#4CA1AF44]">
//                                 {item?.Item_Image && (
//                                   <img loading="lazy" src={`http://localhost:4000/uploads/food-item/${item.Item_Image}`} alt={item?.Item_Name} className="w-full h-full object-cover opacity-90" />
//                                 )}
//                                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
//                                 <div className="absolute top-1 right-1">
//                                   <span className="bg-white/90 px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-[#ff0000] shadow">{item.Item_Category}</span>
//                                 </div>
//                               </div>
//                               <div className="p-2">
//                                 <h5 style={{ color: "red" }} className="text-[15px] leading-tight mb-1 font-semibold">{item?.Item_Name}</h5>
//                                 <div className="flex justify-between items-center mb-1.5">
//                                   <div>
//                                     <div className="text-sm font-semibold text-gray-800">₹{Number(item?.Item_Price || 0).toFixed(2)}</div>
//                                     <div className="text-[9px] text-gray-500">Tax: {TAX_RATES[item?.Tax_Type]}%</div>
//                                   </div>
//                                   <div className="text-right">
//                                     <div className="text-xs font-bold text-[#ff0000]">₹{Number(item?.Amount || 0).toFixed(2)}</div>
//                                     <div className="text-[9px] text-gray-500">Total</div>
//                                   </div>
//                                 </div>
//                                 {/* <div className="flex items-center justify-between bg-[#4CA1AF10] rounded-md p-1">
//                       <button
//                         type="button"
//                         disabled={unavailable || Number(cart[item.id] || 0) === 0}
//                         onClick={() => !unavailable && updateCart(item.id, -1, index, item.Item_Name, item.Item_Price)}
//                         className={`w-6 h-6 flex items-center justify-center rounded-md shadow transition ${unavailable ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white text-[#ff0000]"}`}
//                       >
//                         <Minus className="w-3 h-3" />
//                       </button>
//                       <span className="text-sm font-semibold text-gray-800">{cart[item.id] || 0}</span>
//                       <button
//                         style={{ backgroundColor: "#ff0000" }}
//                         type="button"
//                         disabled={unavailable}
//                         onClick={() => !unavailable && updateCart(item.id, 1, index, item.Item_Name, item.Item_Price)}
//                         className={`w-6 h-6 flex items-center justify-center rounded-md shadow transition ${unavailable ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#ff0000] text-white"}`}
//                       >
//                         <Plus className="w-3 h-3" />
//                       </button>
//                     </div> */}
//                                 <div className="flex mt-1.5 items-center gap-1">
//                                   <span style={{ color: "#ff0000" }} className="text-xs font-semibold">Qty:</span>
//                                   <span className="text-xs">{item.Current_Quantity}</span>
//                                 </div>
//                               </div>
//                             </div>
//                           );
//                         })
//                       ) : (
//                         <p className="text-gray-500 text-center col-span-full">No items found</p>
//                       )}
//                     </div>
//                   </div>

//                   {/* ══════════════════════════════════════════════════════════
//           BILL SUMMARY MODAL — unchanged logic, works on all screens
//       ══════════════════════════════════════════════════════════ */}
//                   {showSummary && (
//                     <button type="button" onClick={() => setShowSummary(false)} className="fixed inset-0 bg-black/40 z-40" />
//                   )}
//                   <div className={`fixed left-0 bottom-0 w-full bg-white shadow-2xl rounded-t-2xl z-50 transform transition-transform duration-300 p-4 ${showSummary ? "translate-y-0" : "translate-y-full"}`}>
//                     <div className="w-full flex justify-center py-2">
//                       <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
//                     </div>
//                     <div className="px-4 pb-3 border-b">
//                       <div className="flex justify-between items-center">
//                         <div className="flex justify-center items-center mx-auto">
//                           <h2 className="text-lg font-bold text-gray-700">Bill Summary</h2>
//                         </div>
//                         <div className="flex justify-end items-center gap-2">
//                           <button type="button" style={{ backgroundColor: "transparent", fontSize: "30px" }} className="text-gray-500 text-2xl font-bold" onClick={() => setShowSummary(false)}>✖</button>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: "55vh" }}>
//                       {summaryItems?.map((item, index) => (
//                         <div key={index} className="border-b pb-2 mb-2">
//                           <div className="flex justify-between">
//                             <span className="font-semibold">{item?.Item_Name}</span>
//                             <span>x {item?.Item_Quantity}</span>
//                           </div>
//                           <div className="flex justify-between text-sm text-gray-500">
//                             <span>Amount</span>
//                             <span>₹{item?.Amount}</span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="px-4 py-3 border-t">
//                       <div className="flex justify-between text-lg font-bold text-gray-900">
//                         <span>Total</span>
//                         <span>₹{watch("Amount")}</span>
//                       </div>
//                       <div className="flex justify-center mt-4">
//                         <button type="submit" style={{ backgroundColor: "#ff0000" }} className="w-16 h-10 flex items-center justify-center rounded-md text-white shadow">
//                           OK
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <style>
//         {`
//   /*  screens between 1000px and 640px */
//   @media (max-width: 1000px) and (min-width: 641px) {

//     /* Keep sale-wrapper horizontal but avoid tight spacing */
//     .sale-wrapper{
//       flex-direction: row !important;
//       gap: 10px !important;
//     }

//     /* Left section slightly wider */
//     .sale-left {
//       width: 45% !important;
//     }

//     /* Right section slightly narrower */
//     .sale-right {
//       width: 55% !important;
//       margin-left: 0 !important;
//       margin-right: 0 !important;
//     }

//     /* Inputs must not stretch too much */
//     .sale-right > div > input {
//       width: 80% !important;
//     }

//     /* Select dropdowns also */
//     .state-of-supply-class > select {
//       width: 80% !important;
//     }

//     /* Party, Invoice, GSTIN fields */
//     .party-class,
//     .invoice-number-class,
//     .gstin-class,
//     .invoice-date-class,
//     .state-of-supply-class {
//       width: 100% !important;
//     }
//   }

// @media (max-width: 640px) {

//   /* Make Party + GSTIN stack vertically */
//   .heading-wrapper {
//     flex-direction: column !important;
//     gap: 16px !important;
//     width: 100% !important;
//   }

//   /* Fix Party container */
//   .party-class {
//     width: 100% !important;
//   }

//   /* Make Party input full width */
//   .party-class input {
//     width: 100% !important;
//   }

//   /* Dropdown fix so it does NOT go off-screen */
//   // .party-class .absolute {
//   //   width: 100% !important;
//   //   left: 0 !important;
//   // }

//   /* GSTIN block full width */
//   .gstin-class {
//     width: 100% !important;
//     justify-content: flex-start !important;
//   }

//   /* GSTIN input also full width */
//   .gstin-class input {
//     width: 80% !important;
//   }
//   .party-class input {
//     width: 80% !important;
//   }
// }

//   /* below 640px */
//   @media (max-width: 640px) {

//   .party-class{
//      width: 95% !important;
//   }
//     .invoice-number-class,
//     .gstin-class,
//     .invoice-date-class,
//     .state-of-supply-class {
//       width: 100% !important;
//     }

//     .state-of-supply-class > select {
//       width: 100% !important;
//     }

//     .sale-wrapper {
//       flex-direction: column !important;
//       gap: 20px !important;
//     }

//     .sale-left {
//       width: 100% !important;
//     }

//     .sale-right {
//       width: 100% !important;
//       margin-left: 0 !important;
//       margin-right: 0 !important;
//     }

//     .sale-right > div {
//       width: 100% !important;
//     }

//     .sale-right > div > input {
//       width: 100% !important;
//     }

//     .sale-input {
//       width: 100% !important;
//     }

//     .sale-checkbox-label {
//       padding-left: 30px !important;
//     }
//   }
// `}
//       </style>
//     </>
//   );
// }