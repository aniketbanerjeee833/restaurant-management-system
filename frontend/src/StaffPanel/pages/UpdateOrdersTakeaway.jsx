

// import { foodItemApi, useGetAllFoodItemsQuery } from "../../redux/api/foodItemApi";



// import {  useState } from "react";
// import { NavLink, useNavigate, useParams } from "react-router-dom";

// import { useFieldArray, useForm } from "react-hook-form";

// import { io } from "socket.io-client";

// import { useRef } from "react";
// import { useEffect } from "react";

// import { toast } from "react-toastify";



// import { LayoutDashboard, Minus, Plus, ShoppingCart } from "lucide-react";
// import { orderApi,  useGetTakeawayOrderDetailsQuery,  useUpdateTakeawayOrderMutation } from "../../redux/api/Staff/orderApi";
// import OrderTakeawayModal from "../../components/Modal/OrderTakeawayModal";
// import { useGetAllCategoriesQuery } from "../../redux/api/itemApi";
// import { useDispatch } from "react-redux";
// import { kitchenStaffApi } from "../../redux/api/KitchenStaff/kitchenStaffApi";
// import { useMemo } from "react";


// const socket = io("http://localhost:4000", {
//   transports: ["websocket"],
// });


// export default function UpdateOrdersTakeaway() {
// const formatTime = (time) => {
//   if (!time) return "--";
//   const d = new Date(time);
//   d.setSeconds(0);
//   return d.toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

//     const {Order_Id:Takeaway_Order_Id}=useParams();
//     const dispatch = useDispatch();
    
//       const [ordertakeawayModalOpen, setOrdertakeawayModalOpen] = useState(false);
//    //console.log(Order_Id);
//     const {data:takeawayOrderDetails}=useGetTakeawayOrderDetailsQuery(Takeaway_Order_Id);
//     console.log(takeawayOrderDetails,"takeawayOrderDetails",Takeaway_Order_Id);
//     const TAX_RATES = {
//         "None": 0,
//         "GST0": 0,
//         "GST0.25": 0.25,
//         "GST3": 3,
//         "GST5": 5,
//         "GST12": 12,
//         "GST18": 18,
//         "GST28": 28,
//         "GST40": 40,

//         "IGST0": 0,
//         "IGST0.25": 0.25,
//         "IGST3": 3,
//         "IGST5": 5,
//         "IGST12": 12,
//         "IGST18": 18,
//         "IGST28": 28,
//         "IGST40": 40,
//     };

//     const categoryRefs = useRef([]); // store refs for category dropdowns
//     const itemRefs = useRef([]);     // store refs for item dropdowns
//  const [activeCategory, setActiveCategory] = useState('All');
//   const lastCategoryRef = useRef(activeCategory);
// const[searchTerm,setSearchTerm]=useState("");
//     const navigate = useNavigate();
 
   
//     // const [selectedTables, setSelectedTables] = useState([]);

 
//     const { data: menuItems } = useGetAllFoodItemsQuery({});
//     //console.log(tables, isLoading, "tables", menuItems, isMenuItemsLoading);
//         const items = menuItems?.foodItems
//     const[updateTakewayOrder,{isLoading:isUpdateTakeawayOrderLoading}]=useUpdateTakeawayOrderMutation();
//     const [rows, setRows] = useState([
//         {
//             CategoryOpen: false, categorySearch: "", preview: null
//         }
//     ]);
//         const [cart, setCart] = useState({});
  
// const { data: categories } = useGetAllCategoriesQuery()
// //console.log(categories,"categories");
//   //const existingCategories=categories?.map((category) => category.Item_Category);
//   const existingCategories = [...new Set(categories?.map(c => c.Item_Category))];
//   const newCategories = ["All", ...existingCategories];
//    // 


//    const [kotNotifications, setKotNotifications] = useState([]);
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



// // Join the Socket.IO room for this order
// useEffect(() => {
//   if (!takeawayOrderDetails?.KOT_Id) return;

//   const room = `order_${takeawayOrderDetails.KOT_Id}`;

//   console.log("Joining room:", room);
//   socket.emit("join_order_room", takeawayOrderDetails.KOT_Id);

//   return () => {
//     console.log("Leaving room:", room);
//     socket.emit("leave_order_room", takeawayOrderDetails.KOT_Id);
//   };
// }, [takeawayOrderDetails?.KOT_Id]);

// useEffect(() => {
//   if (!takeawayOrderDetails?.kitchenItems) return;

//   // full reset when refreshing page
//   const fresh = takeawayOrderDetails.kitchenItems.map(it => ({
//     KOT_Id: takeawayOrderDetails.KOT_Id,
//     KOT_Item_Id: it.KOT_Item_Id,
//     itemName: it.Item_Name,
//     status: it.Item_Status,
//      time: it.updated_at ,
//      quantity: it.Quantity,
//     // time: null,
//   }));

//   setKotNotifications(fresh);

// }, [takeawayOrderDetails]);

// useEffect(() => {
//   const handleKotUpdate = (data) => {
   
//     console.log("📢 Frontend received KOT update:", data);
//     toast.info(`${data.itemName} → ${data.status}`);

//     // setKotNotifications((prev) => {
//     //   const index = prev.findIndex(n => n.KOT_Item_Id === data.KOT_Item_Id);
//   setKotNotifications((prev) => {
//       const index = prev.findIndex(
//         (n) => String(n.KOT_Item_Id) === String(data.KOT_Item_Id)
//       );

//       // 🟢 1. If item already exists → update status/time
//       if (index !== -1) {
//         const updated = [...prev];
//         updated[index] = {
//           ...updated[index],
//           status: data.status,
//         time: data.updated_at, // ✅ FIXED

//           // time: data.time,
//         };
//         return updated;
//       }

//       // 🟢 2. If the row is NEW (e.g., new biriyani added), append it
//       return [
//         ...prev,
//         {
//           KOT_Id: data.KOT_Id,
//           KOT_Item_Id: data.KOT_Item_Id,
//           itemName: data.itemName,
//           status: data.status,
//           time: data.updated_at,
//           // time: data.time,
//         }
//       ];
//     });
//   };
//   dispatch(orderApi.util.invalidateTags(["Order"]));

//   socket.on("frontend_kot_update", handleKotUpdate);

//   return () => {
//     socket.off("frontend_kot_update", handleKotUpdate);
//   };
// }, []);

// console.log(kotNotifications,"kotNotifications");
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             setRows((prev) =>
//                 prev.map((row, idx) => {
//                     const catRef = categoryRefs.current[idx];
//                     const itemRef = itemRefs.current[idx];

//                     const clickedInsideCategory =
//                         catRef && catRef.contains(event.target);
//                     const clickedInsideItem =
//                         itemRef && itemRef.contains(event.target);

//                     // if clicked outside both → close
//                     if (!clickedInsideCategory && !clickedInsideItem) {
//                         return { ...row, CategoryOpen: false, itemOpen: false };
//                     }

//                     return row;
//                 })
//             );
//         };

//         document.addEventListener("mousedown", handleClickOutside);
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, []);


//     const {
       
//          control,
//          handleSubmit,
//          setValue,
//          watch,
//          reset,
//          formState: { errors },
//      } = useForm({
//          defaultValues: {
//  //   Tax_Type: "None",
//  //   Tax_Amount: "0.00",
//    Amount: "0.00",
//    Sub_Total: "0.00",
//    items: []   // No pre-created empty row
//  }
//      });


//  const [showSummary, setShowSummary] = useState(false);




// useEffect(() => {
//   if (!takeawayOrderDetails) return;

//   const prefilledItems = takeawayOrderDetails?.orderItems?.map((item) => ({
//     Item_Name: item?.Item_Name,
//     Item_Price: item?.Price,
//     Item_Quantity: item?.Quantity,
//     Amount: item?.Amount,
//     id: item?.Item_Id   // ✅ USE Item_Id
//   }));



//   reset({
//     items: prefilledItems,
//     customerDetails: takeawayOrderDetails?.customer,
//     Sub_Total: takeawayOrderDetails?.order?.Sub_Total,
//     Amount: takeawayOrderDetails?.order?.Amount
  
//   });

//   // 🔥 Build mapping: Item_Id → rowIndex
//   const map = {};
//   takeawayOrderDetails?.orderItems.forEach((it, idx) => {
//     map[it.Item_Id] = idx;   // ✅ FIXED
//   });
//   itemRowMap.current = map;

//   // 🔥 Also sync cart quantities with Item_Id
//   const initialCart = {};
//   takeawayOrderDetails?.orderItems.forEach((it) => {
//     initialCart[it.Item_Id] = it.Quantity;  // ✅ FIXED
//   });
//   setCart(initialCart);

// }, [takeawayOrderDetails, reset]);



//     const { fields, append,remove } = useFieldArray({
//         control,
//         name: "items",
//     });


//     // const filteredItems = activeCategory === 'All'
//     //     ? items
//     //     : items?.filter(item => item?.Item_Category === activeCategory);

//   //  const filteredItems = useMemo(() => {
//   //    if (!items) return [];
   
//   //    const categoryChanged = lastCategoryRef.current !== activeCategory;
   
//   //    const result = items.filter((item) => {
//   //      const matchesCategory =
//   //        activeCategory === "All" ||
//   //        item.Item_Category === activeCategory;
   
//   //      // 🔥 Ignore search when category JUST changed
//   //      const matchesSearch =
//   //        categoryChanged
//   //          ? true
//   //          : !searchTerm.trim() ||
//   //            item.Item_Name.toLowerCase().includes(searchTerm.toLowerCase());
   
//   //      return matchesCategory && matchesSearch;
//   //    });
   
//   //    // update ref AFTER filtering
//   //    lastCategoryRef.current = activeCategory;
   
//   //    return result;
//   //  }, [items, activeCategory, searchTerm]);
//   const filteredItems = useMemo(() => {
//   if (!items) return [];

//   const search = searchTerm.trim().toLowerCase();
//   const categoryChanged = lastCategoryRef.current !== activeCategory;

//   // 1️⃣ Filter first
//   const filtered = items.filter((item) => {
//     const matchesCategory =
//       activeCategory === "All" ||
//       item.Item_Category === activeCategory;

//     const matchesSearch =
//       categoryChanged ||
//       !search ||
//       item.Item_Name.toLowerCase().includes(search);

//     return matchesCategory && matchesSearch;
//   });

//   // 2️⃣ Split: already-added vs not-added
//   const addedItems = [];
//   const newItems = [];

//   filtered.forEach((item) => {
//     if (cart?.[item.Item_Id]) {
//       addedItems.push(item);   // 🔥 SHOW FIRST
//     } else {
//       newItems.push(item);
//     }
//   });

//   lastCategoryRef.current = activeCategory;

//   // 3️⃣ Merge → added items on top
//   return [...addedItems, ...newItems];
// }, [items, activeCategory, searchTerm, cart]);

// // console.log(filteredItems,"filteredItems",cart)
//     const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
// const itemRowMap = useRef({});
// const updateTotals = () => {
//     const itemsValues = watch("items") || [];

//     let subTotal = 0;
   

//     itemsValues.forEach(item => {
//         const price = parseFloat(item.Item_Price) || 0;
//         const qty = parseInt(item.Item_Quantity) || 0;
      

//         subTotal += price * qty;
       
//     });



//     setValue("Sub_Total", subTotal.toFixed(2));

//     setValue("Amount", subTotal.toFixed(2));
// };

// // const minQuantityOfItems=takeawayOrderDetails?.kitchenItems?.reduce((acc, item) => {
// //     acc[item.Item_Id] = item.Quantity;
// //     return acc;
// // })
// const minQuantityOfItems=new Map();

// takeawayOrderDetails?.kitchenItems?.forEach((item) => {
//   if(!minQuantityOfItems.has(item.Item_Id))
//     minQuantityOfItems.set(item.Item_Id, item.Quantity);
//   else{
//     minQuantityOfItems.set(item.Item_Id, minQuantityOfItems.get(item.Item_Id)+item.Quantity);
//   }
// })

// // const minQty = minQuantityOfItems.get(Item_Id) || 0;
// // const currentQty = Number(cart[Item_Id] || 0);
// // const disableMinus =
// //   unavailable || currentQty <= minQty;

// console.log(minQuantityOfItems,"minQuantityOfItems")

// // const updateCart = (itemId, delta, index, itemName, itemAmount) => {
// //   const price = Number(itemAmount || 0);

// //   setCart((prev) => {
// //     const currentQty = Number(prev[itemId] || 0);
// //     const newQty = currentQty + delta;

// //     const rowIndex = itemRowMap.current[itemId];

// //     // ❌ REMOVE ITEM COMPLETELY WHEN QTY = 0
// //     if (newQty <= 0) {
// //       if (rowIndex !== undefined) {
// //         remove(rowIndex); // 🔥 remove from RHF form
// //         delete itemRowMap.current[itemId]; // 🔥 clean mapping
// //       }

// //       const updatedCart = { ...prev };
// //       delete updatedCart[itemId]; // 🔥 remove from cart

// //       setTimeout(updateTotals, 0);
// //       return updatedCart;
// //     }

// //     // ✅ ADD NEW ROW IF NOT EXISTS
// //     let finalRowIndex = rowIndex;
// //     if (finalRowIndex === undefined) {
// //       finalRowIndex = fields.length;
// //       itemRowMap.current[itemId] = finalRowIndex;

// //       append({
// //         Item_Name: itemName,
// //         Item_Price: price,
// //         Item_Quantity: newQty,
// //         Amount: (price * newQty).toFixed(2),
// //         id: itemId,
// //       });
// //     } else {
// //       // ✅ UPDATE EXISTING ROW
// //       setValue(`items.${finalRowIndex}.Item_Quantity`, newQty);
// //       setValue(
// //         `items.${finalRowIndex}.Amount`,
// //         (price * newQty).toFixed(2)
// //       );
// //     }

// //     setTimeout(updateTotals, 0);

// //     return { ...prev, [itemId]: newQty };
// //   });
// // };

// // const updateCart = (itemId, delta, itemName, itemAmount) => {
// //   const price = Number(itemAmount || 0);

// //   setCart((prev) => {
// //     const currentQty = Number(prev[itemId] || 0);
// //     const newQty = currentQty + delta;

// //     const rowIndex = itemRowMap.current[itemId];

// //     /* ---------------- REMOVE ITEM ---------------- */
// //     if (newQty <= 0) {
// //       if (rowIndex !== undefined) {
// //         remove(rowIndex);

// //         // 🔥 Rebuild itemRowMap after remove
// //         const newMap = {};
// //         watch("items")
// //           ?.filter(Boolean)
// //           .forEach((it, idx) => {
// //             newMap[it.id] = idx;
// //           });

// //         itemRowMap.current = newMap;
// //       }

// //       const updatedCart = { ...prev };
// //       delete updatedCart[itemId];

// //       setTimeout(updateTotals, 0);
// //       return updatedCart;
// //     }

// //     /* ---------------- ADD / UPDATE ---------------- */
// //     let finalIndex = rowIndex;

// //     if (finalIndex === undefined) {
// //       finalIndex = fields.length;

// //       append({
// //         Item_Name: itemName,
// //         Item_Price: price,
// //         Item_Quantity: newQty,
// //         Amount: (price * newQty).toFixed(2),
// //         id: itemId,
// //       });

// //       itemRowMap.current[itemId] = finalIndex;
// //     } else {
// //       setValue(`items.${finalIndex}.Item_Quantity`, newQty);
// //       setValue(
// //         `items.${finalIndex}.Amount`,
// //         (price * newQty).toFixed(2)
// //       );
// //     }

// //     setTimeout(updateTotals, 0);
// //     return { ...prev, [itemId]: newQty };
// //   });
// // };
// const updateCart = (itemId, delta, _index, itemName, itemPrice) => {
//   const price = Number(itemPrice); // ✅ unit price only

//   if (!price || price <= 0) {
//     console.warn("Invalid item price:", itemId, itemPrice);
//     return;
//   }

//   setCart((prev) => {
//     const currentQty = Number(prev[itemId] || 0);
//     const newQty = currentQty + delta;

//     const rowIndex = itemRowMap.current[itemId];

//     /* ---------------- REMOVE ITEM ---------------- */
//     if (newQty <= 0) {
//       if (rowIndex !== undefined) {
//         remove(rowIndex);

//         // 🔥 rebuild map safely
//         const newMap = {};
//         watch("items")
//           ?.filter(Boolean)
//           .forEach((it, idx) => {
//             newMap[it.id] = idx;
//           });
//         itemRowMap.current = newMap;
//       }

//       const updatedCart = { ...prev };
//       delete updatedCart[itemId];

//       setTimeout(updateTotals, 0);
//       return updatedCart;
//     }

//     /* ---------------- ADD / UPDATE ---------------- */
//     let finalIndex = rowIndex;

//     if (finalIndex === undefined) {
//       finalIndex = fields.length;
//       itemRowMap.current[itemId] = finalIndex;

//       append({
//         id: itemId,
//         Item_Name: itemName,       // ✅ from argument
//         Item_Price: price,         // ✅ unit price stored once
//         Item_Quantity: newQty,
//         Amount: (price * newQty).toFixed(2),
//       });
//     } else {
//       setValue(`items.${finalIndex}.Item_Quantity`, newQty);
//       setValue(
//         `items.${finalIndex}.Amount`,
//         (price * newQty).toFixed(2)
//       );
//     }

//     setTimeout(updateTotals, 0);

//     return { ...prev, [itemId]: newQty };
//   });
// };

//     const formValues = watch();
//   const summaryItems = watch("items") || [];   // watch all item rows
//     //const totalPaid = watch("Total_Paid"); // watch Total_Paid
//     // const num = (v) => (v === undefined || v === null || v === "" ? 0 : Number(v));


// useEffect(() => {
//   updateTotals();
// }, [watch("items")]);


//     const onSubmit = async (data) => {
//         console.log("Form Data:", data);

//         if (!data.items || data.items.length === 0) {
//             toast.error("Please add at least one item before saving.");
//             return;
//         }

//         // Remove empty rows
//         const cleanedItems = data.items.filter(
//             (it) => it.Item_Name && it.Item_Name.trim() !== ""
//         );
//         for (const item of cleanedItems) {
//   if (!item.Item_Quantity || Number(item.Item_Quantity) <= 0) {
//     toast.error(`Quantity for "${item.Item_Name}" must be greater than zero`);
//     return;
//   }
// }
//         if (cleanedItems.length === 0) {
//             toast.error("Please add at least one valid item with a name.");
//             return;
//         }

//         // Prepare items safely
//         const itemsSafe = cleanedItems.map((item) => ({
//             Item_Name: item.Item_Name,
//             Item_Price: item.Item_Price,
//             Item_Quantity: item.Item_Quantity,
//             Amount: item.Amount,
//         }));

//         // ------------------------------
//         // 🚀 Prepare FINAL JSON Payload
//         // ------------------------------
//         const payload = {
//                           // Or from redux/auth context
            
//             Tax_Type: data.Tax_Type || "None",
//             Tax_Amount: data.Tax_Amount || "0.00",
//             Sub_Total: data.Sub_Total || "0.00",
//             Amount: data.Amount || "0.00",
//             items: itemsSafe,
//         };

//         console.log("📦 Final JSON to send:", payload);

//         try {
//             const res = await updateTakewayOrder({ Takeaway_Order_Id , payload}).unwrap();

//             if (!res?.success) {
//                 toast.error(res.message || "Failed to update order.");
//                 return;
//             }

//             toast.success("Takeaway Order updated Successfully!");
//             dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
//             //dispatch(tableApi.util.invalidateTags(["Table"]));
//             navigate("/staff/orders/all-orders");

//         } catch (error) {
//             console.error("❌ Order update Error:", error);
//             toast.error(error?.data?.message ?? "Failed to update order.");
//         }
//     };





// console.log(summaryItems);
//     console.log("Current form values:", formValues);
//     console.log("Form errors:", errors);



//     return (
//         <>


//             <div className="sb2-2-2">
//                 <ul>
//                     <li>
                       
//                         <NavLink style={{ display: "flex", flexDirection: "row" }}
//                             to="/home"

//                         >
//                             <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
//                             {/* <i className="fa fa-home mr-2" aria-hidden="true"></i> */}
//                             Dashboard
//                         </NavLink>
//                     </li>

//                 </ul>
//             </div>

//             {/* Main Content */}
//             <div className="sb2-2-3" >
//                 <div className="row" style={{ margin: "0px" }}>
//                     <div className="col-md-12">
//                         <div style={{ padding: "20px",marginBottom:"20px" }}
//                             className="box-inn-sp">

//                             <div className="inn-title w-full px-2 py-3">

//                                 <div className="flex flex-col mt-10 
//                                 sm:flex-row justify-between items-start 
//                                 sm:items-center w-full sm:mt-0">

//                                     {/* LEFT HEADER */}
//                                     <div className="w-full flex justify-center items-center sm:w-auto">
//                                         <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
//                                             Update Takeaway Order
//                                         </h4>
//                                         {/* <p className="text-gray-500 mb-2 sm:mb-4">
//         Add new sale details
//       </p> */}
//                                     </div>

//                                     {/* RIGHT BUTTON SECTION */}
      
//                                 <div className="
//        w-full flex justify-center items-center sm:w-auto 
//        flex flex-wrap sm:flex-nowrap 
//         sm:justify-end 
//        gap-3
//      ">
//                                         <button
//                                             type="button"
//                                             onClick={() => navigate("/staff/orders/all-orders")}
//                                             className="text-white font-bold py-2 px-4 rounded"
//                                              style={{ backgroundColor: "black" }}
//                                         >
//                                             Back
//                                         </button>

//                                         <button
//                                             type="button"
//                                             onClick={() => navigate("/staff/orders/all-orders")}
//                                             className="text-white py-2 px-4 rounded"
//                                             style={{ backgroundColor: "#ff0000" }}
//                                         >
//                                             All Orders
//                                         </button>
//                                     </div>

//                                 </div>
//                             </div>
//                             <div style={{ padding: "0", backgroundColor: "#f1f1f19d" }} 
//                             className="tab-inn">
//                                 <form onSubmit={handleSubmit(onSubmit)}>


// <div className="w-full mt-2 mb-2">
//       {/* ⭐ SELECTED TABLES — Centered on large screens, stacked on mobile */}
//       <div className="flex justify-center sm:justify-end w-full heading-wrapper
//  mb-4">
        

//                       <div className="flex w-1/3 justify-end ">
//       <input
//         type="text"
//         placeholder="Search ..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="w-full"
//       />
//     </div>
//       </div>

//       {/* ⭐ KITCHEN ITEMS GRID */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
//         {kotNotifications?.length === 0 ? (
//           <p className="text-gray-500 text-sm text-center col-span-full py-8">
//             No active kitchen updates
//           </p>
//         ) : (
//           kotNotifications.map((n, i) => (
//             <div
//               key={i}
//               className="bg-white shadow-md hover:shadow-lg 
//               rounded-lg p-2 flex flex-col gap-3 text-sm transition-all
//                duration-300 border border-gray-100"
//             >
//               <div className="flex justify-between items-start gap-2">
//                 <span className="font-semibold text-gray-800 text-base leading-tight flex-1">
//                   {n?.itemName} X{n?.quantity}
//                 </span>

//                 <span
//                   className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
//                     n.status === "ready"
//                       ? "bg-green-100 text-green-700 border border-green-300"
//                       : n.status === "preparing"
//                       ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
//                       : "bg-gray-100 text-gray-500 border border-gray-300"
//                   }`}
//                 >
//                   {n?.status}
//                 </span>
//         <span className="text-xs px-3 py-1 text-gray-500">
//             {formatTime(n?.time)}
//               </span>

//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>

// <div 
//   style={{ backgroundColor: "#f1f1f19d"}} className=" mx-auto px-2 py-2">
//   <div
//     className="
//       flex 
//       flex-wrap 
//       gap-2 
//       overflow-x-auto 
//       scrollbar-hide
//     "
//   >
//     {newCategories?.map((cat,index) => (
//       <button
//       type="button"
//         key={index}
//         onClick={() => setActiveCategory(cat)}
//         className={`
//           px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all
//           ${activeCategory === cat
//             ? "text-white shadow-lg scale-105"
//             : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
//           }
//         `}
//         style={{
//           backgroundColor: activeCategory === cat ? "#ff0000" : "",
//           borderColor: activeCategory === cat ? "#ff0000" : "",
//         }}
//       >
//         {cat}
//       </button>
//     ))}
//   </div>
// </div>


//                                               <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
                                                                                        
//                                                                                         <div className="bg-white shadow-md sticky top-0 ">
                                                                                            
                                            
                                            
//                                                                                         </div>
                                            
                                            
//                                                                                         {/* Food Items Grid */}
//                                                                                         <div className=" mx-auto px-2 py-4">
//                                                                                             <div className="grid grid-cols-1 sm:grid-cols-2 
//                                                                                             lg:grid-cols-4 xl:grid-cols-6 gap-6">
                                             
//                                             {filteredItems?.map((item, index) => {
                                            
//                                               const unavailable = item.is_available === 0; //  unavailable items
                                            
//   // const minQty = minQuantityOfItems.get(item.Item_Id) || 0;
//   // const currentQty = Number(cart[item.Item_Id] || 0);

//   // const disableMinus =
//   //   unavailable || currentQty <= minQty;

//                                               return (
//                                                 <div
//                                                   key={item.id ?? index}
//                                                   className={`
//                                                     group relative bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 
//                                                     ${unavailable 
//                                                       ? "opacity-40 grayscale cursor-not-allowed" 
//                                                       : "hover:shadow-lg hover:-translate-y-1"
//                                                     }
//                                                   `}
//                                                 >
                                            
//                                                   {/* ===== UNAVAILABLE BADGE ===== */}
//                                                   {unavailable && (
//                                                     <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow">
//                                                       Unavailable
//                                                     </div>
//                                                   )}
                                            
//                                                   {/* ===== IMAGE SECTION ===== */}
//                                                   <div className="relative h-32 bg-gradient-to-br from-[#4CA1AF22] to-[#4CA1AF44]">
                                            
//                                                     <img
//                                                       src={
//                                                         item?.Item_Image
//                                                           ? `http://localhost:4000/uploads/food-item/${item?.Item_Image}`
//                                                           : ""
//                                                       }
//                                                       alt={item?.Item_Name}
//                                                       className="w-full h-full object-cover opacity-90"
//                                                     />
                                            
//                                                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                            
//                                                     <div className="absolute top-2 right-2">
//                                                       <span className="bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#ff0000] shadow">
//                                                         {item?.Item_Category}
//                                                       </span>
//                                                     </div>
                                            
//                                                     {/* <div className="absolute bottom-1 left-2 right-2">
//                                                       <h4 className="text-white text-[20px] leading-tight">
//                                                         {item?.Item_Name}
//                                                       </h4>
//                                                     </div> */}
//                                                   </div>
                                            
//                                                   {/* ===== DETAILS SECTION ===== */}
//                                                   <div className="p-2">
//                     <div className="flex  mb-2">
//           <h5 style={{color:"red"}}
//           className="text-red text-[20px] leading-tight">
//             {item?.Item_Name}
//           </h5>
//         </div>
                                            
//                                                     {/* PRICE ROW */}
//                                                     <div className="flex justify-between items-center mb-2">
//                                                       <div>
//                                                         <div className="text-base font-semibold text-gray-800">
//                                                           ₹{parseFloat(item?.Item_Price).toFixed(2)}
//                                                         </div>
//                                                         <div className="text-[10px] text-gray-500">
//                                                           Tax: {TAX_RATES[item?.Tax_Type]}%
//                                                         </div>
//                                                       </div>
                                            
//                                                       <div className="text-right">
//                                                         <div className="text-sm font-bold text-[#ff0000]">
//                                                           ₹{parseFloat(item?.Amount).toFixed(2)}
//                                                         </div>
//                                                         <div className="text-[10px] text-gray-500">Total</div>
//                                                       </div>
//                                                     </div>
                                            
//                                                     {/* ===== CART CONTROLS ===== */}
//                                                     <div className="flex items-center justify-between bg-[#4CA1AF10] rounded-md p-1.5">
                                            
//                                                       {/* MINUS BUTTON */}
//                                                       <button
//                                                         type="button"
//                                                         disabled={unavailable || cart[item.Item_Id] === 0}
//                                                         onClick={() =>
//                                                           !unavailable &&
//                                                           updateCart(item.Item_Id, -1, index, item?.Item_Name, item?.Item_Price)
//                                                         }
//                                                         className={`
//                                                           w-7 h-7 flex items-center justify-center rounded-md shadow transition
//                                                           ${unavailable
//                                                             ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                                                             : "bg-white hover:bg-gray-100 text-[#ff0000]"
//                                                           }
//                                                         `}
//                                                       >
//                                                         <Minus className="w-3 h-3" />
//                                                       </button>
//                                                              {/* <button
//                                                         type="button"
                                                          
//                                                  disabled={disableMinus||unavailable || Number(cart[item.Item_Id] || 0) === 0}
//                                                   onClick={() =>
//                                                                     !disableMinus &&
//                                                     updateCart(item.Item_Id, -1, index, item?.Item_Name, item?.Amount)
//                                                               }
          
                                                        
//                                                          className={`
//       w-7 h-7 flex items-center justify-center rounded-md shadow transition
//       ${disableMinus
//         ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//         : "bg-white hover:bg-gray-100 text-[#ff0000]"
//       }
//     `}
                                                        
//                                                       >
//                                                         <Minus className="w-3 h-3" />
//                                                       </button> */}
                                            
//                                                       {/* QUANTITY DISPLAY */}
//                                                       <span className="text-base font-semibold text-gray-800 px-2">
//                                                         {cart[item.Item_Id] || 0}
//                                                       </span>
                                            
//                                                       {/* PLUS BUTTON */}
//                                                       <button
//                                                       style={{backgroundColor: "#ff0000"}}
//                                                         type="button"
//                                                         disabled={unavailable}
//                                                         onClick={() =>
//                                                           !unavailable &&
//                                                           updateCart(item?.Item_Id, 1, index, item?.Item_Name, item?.Item_Price)
//                                                         }
//                                                         className={`
//                                                           w-7 h-7 flex items-center justify-center rounded-md shadow transition
//                                                           ${unavailable
//                                                             ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                                                             : "bg-[#ff0000] text-white hover:bg-[#3a8c98]"
//                                                           }
//                                                         `}
//                                                       >
//                                                         <Plus className="w-3 h-3" />
//                                                       </button>
                                            
//                                                     </div>
                                            
//                                                   </div>
//                                                 </div>
//                                               );
//                                             })}
                                            
//                                                                   </div>
//                                                           </div>
 
//                                                 <div className="
//                                                     fixed bottom-0 left-0 w-full 
//                                                     bg-white shadow-lg 
//                                                     px-4 py-2 z-50
//                                                   "
//                                                 >
//                                                    <div className="flex justify-center items-center gap-12 w-full">
//                                                   {/* <div className="grid grid-cols-3"> */}
                                                    
                                                  
//                                                     {/* SAVE & HOLD */}
//                                                     <button
//                                                       type="button"
//                                                       onClick={() => setShowSummary(true)}   // open bottom sheet
//                                                       // disabled={formValues.errorCount > 0 || isAddingOrder}
//                                                       className="relative w-full py-2 px-4 md:w-auto 
//                                                       flex items-center justify-center gap-3 
                                                      
//                                                             text-white font-bold  rounded shadow sm:py-3 px-6"
//                                                      style={{ backgroundColor: "black" }}
//                                                     >
//                                                       {isUpdateTakeawayOrderLoading ? "Saving..." : "Save & Hold"}
//                                                       {/* {isAddingOrder ? "Saving..." : "Save & Hold"} */}
                                                
//                                                       <span className="relative">
//                                                         <ShoppingCart size={22} />
//                                                         {totalItems > 0 && (
//                                                           <span className="absolute -top-2 -right-2 bg-red-500 text-white 
//                                                                            text-[10px] font-bold w-4 h-4 flex items-center justify-center 
//                                                                            rounded-full shadow">
//                                                             {totalItems}
//                                                           </span>
//                                                         )}
//                                                       </span>
//                                                     </button>
                                                
//                                                 {/* <div></div> */}
//                                                     {/* SAVE & PAY BILL */}
                                                    
//                                                     <button
//                                                       type="button"
//                                                        onClick={()=>setOrdertakeawayModalOpen(true)}
//                                                       className="relative w-full py-2 px-4 md:w-auto 
//                                                       flex items-center justify-center gap-3 
                                                      
//                                                             text-white font-bold  rounded shadow sm:py-3 px-6"
//                                                       style={{ backgroundColor: "#ff0000" }}
//                                                     >
//                                                       Save & Pay Bill
//                                                     </button>
                                                
//                                                   </div>
//                                                 </div>
                                                
//                                                 {/* BACKDROP */}
//                                                 {showSummary && (
//                                                   <div>
                                                
//                                                     <button
//                                                     type="button"
//                                                     onClick={() => setShowSummary(false)}
//                                                     className="fixed inset-0 bg-black/40 z-40"></button>
//                                                   </div>
//                                                 )}
                                                
//                                                 {/* BOTTOM SHEET */}
//                                                 <div
//                                                   className={`
//                                                     fixed left-0 bottom-0 w-full 
//                                                     bg-white shadow-2xl rounded-t-2xl z-50
//                                                     transform transition-transform duration-300 p-4
//                                                     ${showSummary ? "translate-y-0" : "translate-y-full"}
//                                                   `}
//                                                   style={{ maxHeight: "vh" }}
//                                                 >
//                                                   {/* HANDLE BAR */}
//                                                   <div className="w-full flex justify-center py-2">
//                                                     <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
//                                                   </div>
                                               
//                     <div className="px-4 pb-3 border-b">
//     <div className="flex justify-between items-center">
//       <div className="flex justify-center items-center mx-auto">
//       <h2 className="text-lg font-bold text-gray-700">Bill Summary</h2>
//       </div>
//       <div className="flex justify-enditems-center gap-2">
//       <button type="button" style={{backgroundColor:"transparent"}} 
//       className="text-gray-500 text-2xl font-bold"
//       onClick={() => setShowSummary(false)}>✖</button>
//       </div>
//     </div>
//   </div>
                                                
//                                                   {/* SUMMARY CONTENT */}
//                                                   <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: "55vh" }}>
//                                                     {summaryItems?.map((item, index) => (
//                                                       <div key={index} className="border-b pb-2 mb-2">
//                                                         <div className="flex justify-between">
//                                                           <span className="font-semibold">{item?.Item_Name}</span>
//                                                           <span>x {item?.Item_Quantity}</span>
//                                                         </div>
//                                                         <div className="flex justify-between text-sm text-gray-500">
//                                                           <span>Amount</span>
//                                                           <span>₹{item?.Amount}</span>
//                                                         </div>
//                                                       </div>
//                                                     ))}
//                                                   </div>
                                                
//                                                   {/* TOTAL FOOTER */}
//                                                   <div className="px-4 py-3 border-t">
//                                                     <div className="flex justify-between text-lg font-bold text-gray-900">
//                                                       <span>Total</span>
//                                                       <span>₹{watch("Amount")}</span>
//                                                     </div>
//                                                     <div 
//                                                     className="flex justify-center mt-4">
//                                                       <button style={{backgroundColor:"#ff0000"}}
//                                                        type="submit"
//                                                        className="w-16 h-10 flex items-center justify-center bg-[#ff0000] 
//                                                           rounded-md text-white shadow hover:bg-[#3a8c98] ">
//                                                           OK
//                                                       </button>
                                                      
//                                                     </div>
//                                                   </div>
//                                                 </div>
//                                               {/* </div>
//                                             </div> */}
                                            
                                                
//                                               </div>





                                    
//                                 </form>
//                                 {/* {orderDetailsModalOpen && 
//                                 <OrderDetailsModal
//                                 onClose={() => setOrderDetailsModalOpen(false)}
//                                 orderDetails={formValues} 
//                                 setOpen={setOrderDetailsModalOpen} 
//                                 orderId={Order_Id} />} */}
//                                  {ordertakeawayModalOpen &&
//                   <OrderTakeawayModal
//                     onClose={() => setOrdertakeawayModalOpen(false)}
//                     orderDetails={formValues}
//                     takeawayOrderId={Takeaway_Order_Id}
//                     setOpen={setOrdertakeawayModalOpen}
//                   />}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <style>
//                 {`
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
//             </style>
//         </>
//     );
// }
    