
import { useGetAllFoodItemsQuery } from "../../redux/api/foodItemApi";
import { useGetAllTablesQuery } from "../../redux/api/tableApi";


import { useState } from "react";
import {  useNavigate } from "react-router-dom";

import { useFieldArray, useForm } from "react-hook-form";



import { useRef } from "react";
import { useEffect } from "react";





import {  Minus, Plus, ShoppingCart } from "lucide-react";





import { orderApi, useGenerateSmsForTakeawayMutation, useGetAllCustomersQuery,
   useTakeawayAddOrdersAndGenerateInvoicesMutation } from "../../redux/api/Staff/orderApi";

import { useMemo } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { kitchenStaffApi } from "../../redux/api/KitchenStaff/kitchenStaffApi";
import {useGetAllCategoriesQuery} from "../../redux/api/itemApi"



export default function OrdersTakeAway() {
  //const { userId } = useSelector((state) => state.user);
  // const dispatch = useDispatch();
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

  const categoryRefs = useRef([]); // store refs for category dropdowns
  const itemRefs = useRef([]);     // store refs for item dropdowns
  const [showSummary, setShowSummary] = useState(false);
  // const [ordertakeawayModalOpen, setOrdertakeawayModalOpen] = useState(false);
   const { data: categories } = useGetAllCategoriesQuery()
 const {user}=useSelector((state) => state.user);
  //const existingCategories=categories?.map((category) => category.Item_Category);
   const existingCategories = [...new Set(categories?.map(c => c.Item_Category))];
  const[searchTerm,setSearchTerm]=useState('');
  const newCategories = ["All", ...existingCategories];

  const navigate = useNavigate();
  // const { data: parties } = useGetAllPartiesQuery();

  // console.log(items, "items");

  //const [open, setOpen] = useState(false);
  //const[categoryOpen,setCategoryOpen] = useState(false);
  // const [showModal, setShowModal] = useState(false);
  //const[selected,setSelected] = useState([]);
  // const [tableSearch, setTableSearch] = useState("");
  // const [open, setOpen] = useState(false);
  // const [newCategory, setNewCategory] = useState("");

  // const [selectedTables, setSelectedTables] = useState([]);
  // const [addOrder, { isLoading: isAddingOrder }] = useAddOrderMutation();
  // const itemUnits = {

  //     "pcs": "Pcs",
  //     "plates": "Plates",
  //     "btl": "Bottle",

  // }
  const{ data: customers}=useGetAllCustomersQuery();
    console.log(customers,"customers");
     const [customerSearch, setCustomerSearch] = useState("");
  
     const[customerDropdownOpen,setCustomerDropdownOpen]=useState(false);
        // const[customerModal,setShowCustomerModal]=useState(false);
          //const[addParty, { isLoading }] = useAddPartyMutation();
       const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  
  
          

  
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  console.log(isExistingCustomer,"isExistingCustomer");
  

  const dispatch = useDispatch();
    const [takeawayAddOrdersAndGenerateInvoices
    ] = useTakeawayAddOrdersAndGenerateInvoicesMutation();

    const [generateSmsForTakeaway, { isLoading:isGenerateSmsLoading }] = 
    useGenerateSmsForTakeawayMutation();
    const [activeCategory, setActiveCategory] = useState('All');
const lastCategoryRef = useRef(activeCategory);
  const { data: tables, isLoading } = useGetAllTablesQuery({});
  const { data: menuItems, isMenuItemsLoading } = useGetAllFoodItemsQuery({});
  const items = menuItems?.foodItems
  console.log(tables, isLoading, "tables", menuItems, isMenuItemsLoading);
  // const[customerModal,setShowCustomerModal]=useState(false);

  const lastUpdatedItemRef = useRef(null);

  //  const [customerSearch, setCustomerSearch] = useState("");
// const [customerModal, setCustomerModal] = useState({
//   open: false,
//   mode: "add", // add | edit
// });
  //  const[customerDropdownOpen,setCustomerDropdownOpen]=useState(false);
  const [rows, setRows] = useState([
    {
      CategoryOpen: false, categorySearch: "", preview: null
    }
  ]);
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

    control,
    handleSubmit,
    setValue,
    watch,
    register,
    reset,
   
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


  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });




  const formValues = watch();
 
  //const totalPaid = watch("Total_Paid"); // watch Total_Paid
  // const num = (v) => (v === undefined || v === null || v === "" ? 0 : Number(v));

// const hasCustomer = Boolean(customerPhone); // phone is safest



  const [cart, setCart] = useState({});
  
  // const newCategories = ['All', existingCategories];


  // const filteredItems = activeCategory === 'All'
  //   ? items
  //   : items?.filter(item => item?.Item_Category === activeCategory);

// const filteredItems = useMemo(() => {
//   if (!items) return [];

//   const categoryChanged = lastCategoryRef.current !== activeCategory;

//   const result = items.filter((item) => {
//     const matchesCategory =
//       activeCategory === "All" ||
//       item.Item_Category === activeCategory;

//     // 🔥 Ignore search when category JUST changed
//     const matchesSearch =
//       categoryChanged
//         ? true
//         : !searchTerm.trim() ||
//           item.Item_Name.toLowerCase().includes(searchTerm.toLowerCase());

//     return matchesCategory && matchesSearch;
//   });

//   // update ref AFTER filtering
//   lastCategoryRef.current = activeCategory;

//   return result;
// }, [items, activeCategory, searchTerm]);
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

// const filteredItems = useMemo(() => {
//   if (!items) return [];

//   const term = searchTerm.trim().toLowerCase();

//   const list = !term
//     ? items
//     : items.filter(item =>
//         item.Item_Name?.toLowerCase().includes(term)
//       );

//   return [...list].sort((a, b) => {
//     const aId = a.id;     // ✅ FIX
//     const bId = b.id;

//     const aInCart = cart[aId] ? 1 : 0;
//     const bInCart = cart[bId] ? 1 : 0;

//     // 🔥 MOST RECENT ITEM ON TOP
//     if (aId === lastUpdatedItemRef.current) return -1;
//     if (bId === lastUpdatedItemRef.current) return 1;

//     // 🔥 CART ITEMS ABOVE OTHERS
//     if (aInCart !== bInCart) return bInCart - aInCart;

//     return 0;
//   });
// }, [items, searchTerm, cart]);

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

console.log(filteredItems,"filteredItems");
// const filteredItems = useMemo(() => {
//   if (!items) return [];

//   const term = searchTerm.trim().toLowerCase();

//   if (!term) return items; // 🔥 show all when search empty

//   return items.filter(item =>
//     item.Item_Name?.toLowerCase().includes(term)
//   );
// }, [items, searchTerm]);

  const itemRowMap = useRef({});
  // const updateTotals = () => {
  //   const itemsValues = watch("items") || [];

  //   let subTotal = 0;


  //   itemsValues.forEach(item => {
  //     const price = parseFloat(item.Item_Price) || 0;
  //     const qty = parseInt(item.Item_Quantity) || 0;


  //     subTotal += price * qty;

  //   });



  //   setValue("Sub_Total", subTotal.toFixed(2));

  //   setValue("Amount", subTotal.toFixed(2));
  // };

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
//   const updateCart = (itemId, delta, index, itemName, itemAmount) => {
//   const amount = parseFloat(itemAmount || 0);

//   setCart((prev) => {
//     const currentQty = Number(prev[itemId] || 0);
//     const newQty = currentQty + delta;

//     let rowIndex = itemRowMap.current[itemId];

//     // ❌ IF QTY BECOMES 0 → REMOVE ITEM COMPLETELY
//     if (newQty <= 0) {
//       if (rowIndex !== undefined) {
//         remove(rowIndex);                // 🔥 remove from RHF
//         delete itemRowMap.current[itemId]; // 🔥 remove mapping
//       }

//       const updatedCart = { ...prev };
//       delete updatedCart[itemId];        // 🔥 remove from cart

//       setTimeout(updateTotals, 0);
//       return updatedCart;
//     }

//     // ➤ If row does NOT exist yet → create one
//     if (rowIndex === undefined) {
//       rowIndex = fields.length;
//       itemRowMap.current[itemId] = rowIndex;

//       append({
//         Item_Name: itemName,
//         Item_Price: amount,
//         Item_Quantity: newQty,
//         Amount: (amount * newQty).toFixed(2),
//         id: itemId,
//       });
//     } else {
//       // ➤ Update existing row
//       setValue(`items.${rowIndex}.Item_Quantity`, newQty);
//       setValue(
//         `items.${rowIndex}.Amount`,
//         (amount * newQty).toFixed(2)
//       );
//     }

//     setTimeout(updateTotals, 0);

//     return {
//       ...prev,
//       [itemId]: newQty,
//     };
//   });
// };
//previous
// const updateCart = (itemId, delta, _index, itemName, itemPrice) => {
//   const price = Number(itemPrice); // ✅ UNIT PRICE ONLY

//   if (!price || price <= 0) {
//     console.warn("Invalid price passed to updateCart:", itemId, itemPrice);
//     return;
//   }

//   setCart((prev) => {
//     const currentQty = Number(prev[itemId] || 0);
//     const newQty = currentQty + delta;

//     let rowIndex = itemRowMap.current[itemId];

//     /* ---------------- REMOVE ITEM ---------------- */
//     if (newQty <= 0) {
//       if (rowIndex !== undefined) {
//         remove(rowIndex);

//         // 🔥 rebuild mapping safely
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
//     if (rowIndex === undefined) {
//       rowIndex = fields.length;
//       itemRowMap.current[itemId] = rowIndex;

//       append({
//         id: itemId,
//         Item_Name: itemName,      // ✅ name from param
//         Item_Price: price,        // ✅ unit price stored once
//         Item_Quantity: newQty,
//         Amount: (price * newQty).toFixed(2),
//       });
//     } else {
//       setValue(`items.${rowIndex}.Item_Quantity`, newQty);
//       setValue(
//         `items.${rowIndex}.Amount`,
//         (price * newQty).toFixed(2)
//       );
//     }

//     setTimeout(updateTotals, 0);

//     return {
//       ...prev,
//       [itemId]: newQty,
//     };
//   });
// };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

const summaryItems=watch("items")||[]



// const handleConfirmBillAndGenerateInvoice = async () => {
//   // const printWindow = window.open("", "_blank", "width=320,height=600");

//   // if (!printWindow) {
//   //   toast.error("Please allow pop-ups to print invoice");
//   //   return;
//   // }

//   try {
//     const payload = {
//       userId: user?.User_Id,
//       items: orderDetails?.items,
//       Sub_Total: orderDetails?.Sub_Total,
//       Final_Amount: invoiceDetails?.Final_Amount,
//       Customer_Name: invoiceDetails?.Customer_Name,
//       Customer_Phone: invoiceDetails?.Customer_Phone,
//       Discount: invoiceDetails?.Discount,
//       Discount_Type: invoiceDetails?.Discount_Type,
//       Payment_Type: invoiceDetails?.Payment_Type,
//     };

//     const response=await confirmTakeawayBillAndInvoiceGenerated(payload).unwrap();
//     console.log(response,"response");
//     printInvoiceWindow();
//     toast.success("Invoice Generated & Bill Paid!");
//     dispatch(tableApi.util.invalidateTags(["Table"]));
//     dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
//     dispatch(orderApi.util.invalidateTags(["Order"]));
//     // renderInvoiceHTML(printWindow);
    
//     onClose();
//     navigate("/staff/orders/all-orders");

//   } catch (err) {
//    console.error(err);
//     toast.error("Failed to generate invoice");
//   }
// };


//  const renderInvoiceHTML = (w) => {
//   const getCurrentDate = () => new Date().toLocaleDateString("en-GB");
//   const getCurrentTime = () =>
//     new Date().toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });

//   const total = calculateGrandTotal();

// const html = `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <title>Invoice - ${invoiceDetails?.Invoice_Number ?? ""}</title>
//         <meta charset="UTF-8">
//         <style>
//           * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//           }
          
//           body { 
//             font-family: 'Courier New', Courier, monospace;
//             font-size: 11px;
//             line-height: 1.3;
//             color: #000;
//             width: 2.5in;
//             margin: 0 auto;
//             padding: 0;
//           }
          
//           .invoice {
//             width: 2.5in;
//             padding: 8px;
//           }

//           /* CENTER HEADER */
//           .header-center { 
//             text-align: center; 
//             margin-bottom: 8px;
//             border-bottom: 1px dashed #000;
//             padding-bottom: 8px;
//           }
          
//           .logo { 
//             width: 60px; 
//             height: auto; 
//             margin-bottom: 4px;
//             background-color: black;
//           }
          
//           .brand { 
//             font-size: 16px; 
//             font-weight: bold; 
//             text-transform: uppercase;
//             letter-spacing: 1px;
//             margin-bottom: 2px;
//           }
          
//           .line { 
//             border-top: 1px dashed #000; 
//             margin: 6px 0;
//           }
          
//           .line-solid {
//             border-top: 1px solid #000;
//             margin: 6px 0;
//           }

//           /* INFO SECTION */
//           .info-row {
//             display: flex;
//             justify-content: space-between;
//             margin: 2px 0;
//             font-size: 10px;
//           }
          
//           .info-label {
//             font-weight: bold;
//           }

//           /* ITEMS TABLE */
//           .items-header {
//             display: flex;
//             justify-content: space-between;
//             font-weight: bold;
//             border-bottom: 1px solid #000;
//             padding: 4px 0;
//             font-size: 10px;
//           }
          
//           .item-row {
//             display: flex;
//             justify-content: space-between;
//             padding: 3px 0;
//             border-bottom: 1px dashed #ddd;
//             font-size: 10px;
//           }
          
//           .item-name {
//             flex: 1;
//             padding-right: 8px;
//             word-wrap: break-word;
//           }
          
//           .item-qty {
//             width: 30px;
//             text-align: center;
//           }
          
//           .item-price {
//             width: 50px;
//             text-align: right;
//           }
          
//           .item-amount {
//             width: 55px;
//             text-align: right;
//             font-weight: bold;
//           }

//           /* SUMMARY */
//           .summary {
//             margin-top: 8px;
//             font-size: 11px;
//           }
          
//           .summary-row {
//             display: flex;
//             justify-content: space-between;
//             padding: 3px 0;
//           }
          
//           .summary-row.total {
//             font-size: 13px;
//             font-weight: bold;
//             border-top: 1px solid #000;
//             border-bottom: 2px solid #000;
//             margin-top: 4px;
//             padding: 5px 0;
//           }

//           /* FOOTER */
//           .footer {
//             text-align: center;
//             margin-top: 10px;
//             padding-top: 8px;
//             border-top: 1px dashed #000;
//             font-size: 10px;
//           }
          
//           .footer-title {
//             font-weight: bold;
//             margin-bottom: 4px;
//             font-size: 11px;
//           }

//           /* PRINT STYLES */
//           @media print {
//             body {
//               width: 2.5in;
//               margin: 0;
//               padding: 0;
//             }
            
//             .invoice {
//               width: 2.5in;
//               padding: 8px;
//             }
            
//             @page {
//               size: 2.5in auto;
//               margin: 0;
//             }
            
//             .no-print {
//               display: none !important;
//             }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="invoice">

//           <!-- HEADER -->
//           <div class="header-center">
//             <img  src="${"http://localhost:5173"}/assets/images/restaurant-logo.png" 
//              class="logo" alt="Logo" />
//             <div class="brand">HELLO GUYS</div>
//           </div>

//           <!-- CUSTOMER INFO -->
//           <div class="info-row">
//             <span><span class="info-label">Customer:</span> ${invoiceDetails?.Customer_Name ?? "Walk-in"}</span>
//           </div>
//           ${invoiceDetails?.Customer_Phone ? `
//           <div class="info-row">
//             <span><span class="info-label">Phone:</span> ${invoiceDetails.Customer_Phone}</span>
//           </div>
//           ` : ''}
          
//           <div class="line"></div>

//           <!-- DATE & TIME -->
//           <div class="info-row">
//             <span><span class="info-label">Date:</span> ${getCurrentDate()}</span>
//             <span><span class="info-label">Time:</span> ${getCurrentTime()}</span>
//           </div>
//           <div class="info-row">
//             <span><span class="info-label">Invoice:</span> ${invoiceNumberData?.nextInvoiceNumber ?? "-"}</span>
//           </div>

//           <div class="line-solid"></div>

//           <!-- ITEMS HEADER -->
//           <div class="items-header">
//             <div style="width: 30px;">#</div>
//             <div class="item-name">ITEM</div>
//             <div class="item-qty">QTY</div>
//             <div class="item-amount">AMOUNT</div>
//           </div>

//           <!-- ITEMS LIST -->
//           ${
//             (orderDetails?.items || []).map((it, i) => `
//               <div class="item-row">
//                 <div style="width: 30px;">${i + 1}</div>
//                 <div class="item-name">${it.Item_Name ?? "-"}</div>
//                 <div class="item-qty">${it.Item_Quantity ?? 1}</div>
//                 <div class="item-amount">₹${Number(it.Amount ?? 0).toFixed(2)}</div>
//               </div>
//             `).join("")
//           }

//           <div class="line-solid"></div>

//           <!-- SUMMARY -->
//           <div class="summary">
//             <div class="summary-row">
//               <span>Subtotal</span>
//               <span>₹${Number(invoiceDetails?.Sub_Total ?? 0).toFixed(2)}</span>
//             </div>
//             ${Number(invoiceDetails?.Service_Charge ?? 0) > 0 ? `
//             <div class="summary-row">
//               <span>Service Charge</span>
//               <span>₹${Number(invoiceDetails.Service_Charge).toFixed(2)}</span>
//             </div>
//             ` : ''}
//             ${invoiceDetails?.Discount && Number(invoiceDetails.Discount) > 0 ? `
//             <div class="summary-row">
//               <span>Discount</span>
//               <span>${
//                 invoiceDetails.Discount_Type === "percentage"
//                   ? `${invoiceDetails.Discount}%`
//                   : `₹${invoiceDetails.Discount}`
//               }</span>
//             </div>
//             ` : ''}
//             <div class="summary-row total">
//               <span>TOTAL</span>
//               <span>₹${Number(total).toFixed(2)}</span>
//             </div>
//           </div>

//           <!-- FOOTER -->
//           <div class="footer">
//             <div class="footer-title">THANK YOU!</div>
//             <div>Please Visit Again</div>
//           </div>

//         </div>
//       </body>
//     </html>
//   `;

//   w.document.open();
//   w.document.write(html);
//   w.document.close();
// };
// console.log(invoiceDetails,"invoiceDetails");
// const buildThermalPrintPayload = (response) => {
//   return {
//     Invoice_Number: response?.invoice?.Invoice_Number,
//     Order_Type: "takeaway",

//     Customer_Name: invoiceDetails?.Customer_Name || "Walk-in",
//     Customer_Phone: invoiceDetails?.Customer_Phone || "",

//     Payment_Type: invoiceDetails?.Payment_Type,
//     Date: new Date().toLocaleDateString("en-GB"),
//     Time: new Date().toLocaleTimeString("en-IN", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     }),

//     Sub_Total: invoiceDetails?.Sub_Total,
//     Discount: invoiceDetails?.Discount || 0,
//     Discount_Type: invoiceDetails?.Discount_Type,
//     Service_Charge: invoiceDetails?.Service_Charge || 0,
//     Final_Amount: invoiceDetails?.Final_Amount,

//     items: orderDetails?.items?.map((it) => ({
//       Item_Name: it.Item_Name,
//       Quantity: it.Item_Quantity,
//       Price: it.Item_Price,
//       Amount: it.Amount,
//     })),
//   };
// };
// const handleConfirmBillAndGenerateInvoice = async () => {
//   try {
//     const payload = {
//       Customer_Name: invoiceDetails?.Customer_Name,
//       Customer_Phone: invoiceDetails?.Customer_Phone,
//       Discount: invoiceDetails?.Discount,
//       Discount_Type: invoiceDetails?.Discount_Type ?? "amount",
//       Service_Charge: invoiceDetails?.Service_Charge,
//       Payment_Type: invoiceDetails?.Payment_Type,
//       Final_Amount: invoiceDetails?.Final_Amount,
//     };

//     // 1️⃣ Generate Invoice
//     const response = await confirmTakeawayBillAndInvoiceGenerated({
//       takeawayOrderId,
//       payload,
//     }).unwrap();

//     toast.success("Invoice Generated & Bill Paid!");

//     // 2️⃣ Build thermal print payload
//     const printPayload = buildThermalPrintPayload(response);

//     // 3️⃣ PRINT (BACKEND)
//     await printThermalInvoice(printPayload).unwrap();

//     toast.success("Bill Printed Successfully!");

//     // 4️⃣ Refresh UI
//     dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
//     dispatch(orderApi.util.invalidateTags(["Order"]));

//     onClose();
//     navigate("/staff/orders/all-orders");

//   } catch (error) {
//     console.error("❌ Invoice / Print Error:", error);
//     toast.error(error?.data?.message || "Invoice or Print failed");
//   }
// };

// const handleConfirmBillAndGenerateInvoice = async () => {
//   printInvoiceWindow(); // 👈 FIRST (user gesture)
//   try {
//     const payload = {
//       Customer_Name: invoiceDetails?.Customer_Name,
//       Customer_Phone: invoiceDetails?.Customer_Phone,
//       Discount: invoiceDetails?.Discount,
//       Discount_Type: invoiceDetails?.Discount_Type ?? "amount",
//       Service_Charge: invoiceDetails.Service_Charge,
//       Payment_Type: invoiceDetails?.Payment_Type,
//       Final_Amount: invoiceDetails?.Final_Amount,
//     };
//     console.log(payload,"payload");

//     // 🔥 API CALL
//     const response = await confirmTakeawayBillAndInvoiceGenerated({
//       takeawayOrderId,
//       payload
//     }).unwrap();

//     toast.success("Invoice Generated & Bill Paid!");
//     console.log(response,"response");
//     // RESPONSE MUST INCLUDE invoice number
//     //const newInvoiceNumber = response.invoiceNumber; 

//     // 🔥 NOW PRINT THE INVOICE
//     //printInvoiceWindow();

//     // Refresh UI & close modal
   
//     dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
//     dispatch(orderApi.util.invalidateTags(["Order"]));
    
//   navigate("/staff/orders/all-orders");

//   } catch (error) {
//     console.error("❌ Error confirming bill and generating invoice:", error);
//     toast.error(error?.data?.message || "Failed to generate invoice");
//   }
// };


// const onSubmit = async (data) => {
//   // const printWindow = window.open("", "_blank", "width=320,height=600");

//   // if (!printWindow) {
//   //   toast.error("Please allow pop-ups to print invoice");
//   //   return;
//   // }
 
// };


console.log(summaryItems,"summaryItems");
const subTotal = Number(watch("Sub_Total") || 0);
const discountType = watch("Discount_Type");
const discountValue = Number(watch("Discount") || 0);

// 1️⃣ Calculate discount amount
let discountAmount = 0;

if (discountType === "percentage") {
  discountAmount = (subTotal * discountValue) / 100;
} else {
  discountAmount = discountValue;
}

// safety
if (discountAmount > subTotal) discountAmount = subTotal;

// round
discountAmount = Number(discountAmount.toFixed(2));

// 2️⃣ Calculate final amount
const finalAmount = Number((subTotal - discountAmount).toFixed(2));

// const discountType = watch("Discount_Type", "amount");

  // console.log("updateCart", cart);
  console.log("Current form values:", formValues);
  console.log("Form errors:", errors);
// const handleGenerateInvoice= async (data) => {
//    console.log(data);
//  if (!data.items || data.items.length === 0) {
//       toast.error("Please add at least one item before saving.");
//       return;
//     }


   
//     // Remove empty rows
//     const cleanedItems = data.items.filter(
//       (it) => it.Item_Name && it.Item_Name.trim() !== ""
//     );
//     for (const item of cleanedItems) {
//   if (!item.Item_Quantity || Number(item.Item_Quantity) <= 0) {
//     toast.error(`Quantity for "${item.Item_Name}" must be greater than zero`);
//     return;
//   }
// }

//     if (cleanedItems.length === 0) {
//       toast.error("Please add at least one  item .");
//       return;
//     }
//   try {
//     const payload = {
//       userId: user?.User_Id,

//       items: data.items,
//       Sub_Total: data.Sub_Total,
//       // Final_Amount: data.Final_Amount,
//       Customer_Name: data.Customer_Name,
//       Customer_Phone: data.Customer_Phone,
//       Discount: data.Discount,
//       Discount_Type: data.Discount_Type,
//       Payment_Type: data.Payment_Type,
//       // Sub_Total: data.Sub_Total,
//       Final_Amount: data.Amount,
//       // items: orderDetails?.items,
//       // Sub_Total: orderDetails?.Sub_Total,
//       // Final_Amount: invoiceDetails?.Final_Amount,
//       // Customer_Name: invoiceDetails?.Customer_Name,
//       // Customer_Phone: invoiceDetails?.Customer_Phone,
//       // Discount: invoiceDetails?.Discount,
//       // Discount_Type: invoiceDetails?.Discount_Type,
//       // Payment_Type: invoiceDetails?.Payment_Type,
//     };
//     console.log(payload);

//     const response=await takeawayAddOrdersAndGenerateInvoices(payload).unwrap();
//     // console.log(response,"response");
// const { invoice, items } = response;

// // ✅ PRINT FIRST (IMPORTANT)
// printInvoiceWindow(invoice, { items });
//     toast.success("Takeaway Add Order Successfully!");
  
//     dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
//     dispatch(orderApi.util.invalidateTags(["Order"]));
//     // renderInvoiceHTML(printWindow);
    

//     // navigate("/staff/orders/all-orders");

//   } catch (err) {
//    console.error(err);
     
//          toast.error(err?.data?.message || "Failed to submit order.");
//   }
// }
const resetOrderForm = () => {
  remove();                 // 🔥 clears RHF field array
  reset({
    Customer_Name: "",
    Customer_Phone: "",
    Discount: "0",
    Discount_Type: "percentage",
    Payment_Type: "Cash",
    Sub_Total: "0.00",
    Amount: "0.00",
    items: [],
  });

  setCart({});               // clear cart
  itemRowMap.current = {};   // clear map
  lastUpdatedItemRef.current = null;
  setShowSummary(false);
};
const resetCustomerUI = () => {
  setCustomerSearch("");        // 🔥 clears phone input
  setIsExistingCustomer(false);
  setCustomerDropdownOpen(false);
};

const handleGenerateInvoice = async (data) => {
  if (!data.items || data.items.length === 0) {
    toast.error("Please add at least one item before saving.");
    return;
  }

  const cleanedItems = data.items.filter(
    (it) => it.Item_Name && it.Item_Name.trim() !== ""
  );

  for (const item of cleanedItems) {
    if (!item.Item_Quantity || Number(item.Item_Quantity) <= 0) {
      toast.error(`Quantity for "${item.Item_Name}" must be greater than zero`);
      return;
    }
  }

  try {
    const payload = {
      userId: user?.User_Id,
      items: cleanedItems,
      Sub_Total: data.Sub_Total,
      Final_Amount: data.Amount,
      Customer_Name: data.Customer_Name,
      Customer_Phone: data.Customer_Phone,
      Discount: data.Discount,
      Discount_Type: data.Discount_Type,
      Payment_Type: data.Payment_Type,
    };

    const response = await takeawayAddOrdersAndGenerateInvoices(payload).unwrap();

    const { invoice, items } = response;

    // ✅ PRINT
    printInvoiceWindow(invoice, { items });

    toast.success("Takeaway Order Added & Invoice Printed!");

    // 🔥🔥 RESET EVERYTHING (IMPORTANT)
       resetOrderForm();
    resetCustomerUI();

    // optional
    setShowSummary(false);

    dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
    dispatch(orderApi.util.invalidateTags(["Order"]));

    // ❌ NO NAVIGATE
    // stay on same page with blank form

  } catch (err) {
    console.error(err);
    toast.error(err?.data?.message || "Failed to submit order.");
  }
};

const handleShareSMS = async (data) => {
  try {
    const payload = {
            userId: user?.User_Id,
      items: data?.items,
      Sub_Total: data?.Sub_Total,
      // Amount: data?.Sub_Total,
      Final_Amount: data?.Amount,
      Customer_Name: data.Customer_Name,
      Customer_Phone: data.Customer_Phone,
      Discount: data.Discount,
      Discount_Type: data.Discount_Type,
      Payment_Type: data.Payment_Type,
      // Customer_Name: invoiceDetails?.Customer_Name,
      // Customer_Phone: invoiceDetails?.Customer_Phone,
      // Discount_Type: invoiceDetails?.Discount_Type,
      // Discount: invoiceDetails?.Discount,
      // Service_Charge: invoiceDetails?.Service_Charge,
      // Payment_Type: invoiceDetails?.Payment_Type,
      // Final_Amount: invoiceDetails?.Final_Amount,
    };
    console.log(payload,"payload");

     const response=await generateSmsForTakeaway({
     
      payload,
    }).unwrap();

    toast.success("📩 Bill sent via SMS successfully");
    console.log(response,"response");
    //    if (response?.success === true) {
    //   toast.success("📩 Bill sent via SMS successfully");
    // }
           resetOrderForm();
    resetCustomerUI();
    dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
   
  // navigate("/staff/orders/all-orders");
  } catch (err) {
    console.error(err);
    toast.error(err?.data?.message || "Failed to send SMS");
  }
};
const printInvoiceWindow = (invoiceDetails, data) => {
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

// const html = `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <title>Invoice - ${invoiceDetails?.Invoice_Number ?? ""}</title>
//         <meta charset="UTF-8">
//         <style>
//           * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//           }
          
//           body { 
//             font-family: 'Courier New', Courier, monospace;
//             font-size: 11px;
//             line-height: 1.3;
//             color: #000;
//               width: 2.00in;     
//             margin: 0 auto;
//             padding: 0;
//           }
          
//           .invoice {
//              width: 2.00in; 
//             padding: 6px;
//           }

//           /* CENTER HEADER */
//           .header-center { 
//             text-align: center; 
//             margin-bottom: 8px;
//             border-bottom: 1px dashed #000;
//             padding-bottom: 8px;
//           }
//              .header-middle { 
//             text-align: center; 
//             margin-bottom: 8px;
//             border-bottom: 1px dashed #000;
//             padding-bottom: 8px;
//           }
          
//           .logo { 
//             width: 60px; 
//             height: auto; 
//             margin-bottom: 4px;
//             padding: 5px;
//             background-color: black;
//           }
          
//           .brand { 
//             font-size: 16px; 
//             font-weight: bold; 
//             text-transform: uppercase;
//             letter-spacing: 1px;
//             margin-bottom: 2px;
//           }
//               .thermal-strong {
//       font-size: 11px;
//       font-weight: 700;
//       letter-spacing: 0.3px;
//     }
//           .thermal-label {
//       font-weight: 700;
//     }
          
//           .line { 
//             border-top: 1px dashed #000; 
//             margin: 6px 0;
//           }
          
//           .line-solid {
//             border-top: 1px solid #000;
//             margin: 6px 0;
//           }

//           /* INFO SECTION */
//           .info-row {
//             display: flex;
//             justify-content: space-between;
//             margin: 2px 0;
//             font-size: 10px;
//             width: 2.10in;
//           }
          
//           .info-label {
//             font-weight: bold;
//           }

//           /* ITEMS TABLE */
//           .items-header {
//             display: flex;
//             justify-content: space-between;
//             font-weight: bold;
//             border-bottom: 1px solid #000;
//             padding: 4px 0;
//             font-size: 10px;
//           }
          
//           .item-row {
//             display: flex;
//             justify-content: space-between;
//             padding: 3px 0;
//             border-bottom: 1px dashed #ddd;
//             font-size: 10px;
//           }
          
//           .item-name {
//             flex: 1;
//             padding-right: 8px;
//             word-wrap: break-word;
//           }
          
//           .item-qty {
//             width: 30px;
//             text-align: center;
//           }
          
//           .item-price {
//             width: 50px;
//             text-align: right;
//           }
          
//           .item-amount {
//             width: 55px;
//             text-align: right;
//             font-weight: bold;
//           }

//           /* SUMMARY */
//           .summary {
//             margin-top: 8px;
//             font-size: 11px;
//             width: 2.10in;
//           }
          
//           .summary-row {
//             display: flex;
//             justify-content: space-between;
//             padding: 3px 0;
//           }
          
//           .summary-row.total {
//             font-size: 13px;
//             font-weight: bold;
//             border-top: 1px solid #000;
//             border-bottom: 2px solid #000;
//             margin-top: 4px;
//             padding: 5px 0;
//           }

//           /* FOOTER */
//           .footer {
//             text-align: center;
//             margin-top: 10px;
//             padding-top: 8px;
//             border-top: 1px dashed #000;
//             font-size: 10px;
//           }
          
//           .footer-title {
//             font-weight: bold;
//             margin-bottom: 4px;
//             font-size: 11px;
//           }

//           /* PRINT STYLES */
//           @media print {
//   body {
//     width: 2.00in;        /* ✅ 58mm */
//     margin: 0;
//     padding: 0;
//     -webkit-print-color-adjust: exact;
//     print-color-adjust: exact;
//   }

//   .invoice {
//     width: 2.00in;        /* ✅ 58mm */
//     padding: 6px;
//   }

//   @page {
//     size: 58mm auto;      /* 🔥 TELL PRINTER EXACT SIZE */
//     margin: 0;
//   }

//   .no-print {
//     display: none !important;
//   }
// }

       
//         </style>
//       </head>
//       <body>
//         <div class="invoice">

//           <!-- HEADER -->
//           <div class="header-center">
        
//         <div class="brand">HELLO GUYS</div>
//           <div style="font-size:10px; margin-top:4px; text-align:center;">
//     Phone: +91 99031 06989
//   </div>

//   <div style="font-size:10px; text-align:center;">
//     Mail: sparkhelloguys@gmail.com
//   </div>

//   <div style="font-size:9px; text-align:center; margin-top:2px;">
//     Address: 021D, Ho-Chi-Minh Sarani, Shakuntala Park, Behala,<br/>
//     Kolkata 700061, West Bengal
//   </div>
//    <div style="font-size:10px; text-align:center;">
//     Website: www.helloguys.co.in
//   </div>
//       </div>

//           <!-- CUSTOMER INFO -->
//            ${invoiceDetails?.Customer_Name ? `
//   <div class="info-row">
//     <div><span class="thermal-label">Customer:</span> ${invoiceDetails.Customer_Name}</div>
//   </div>` : ``}

//   ${invoiceDetails?.Customer_Phone ? `
//   <div class="info-row">
//     <div><span class="thermal-label">Phone:</span> ${invoiceDetails.Customer_Phone}</div>
//   </div>` : ``}
          
//           <div class="line"></div>
//             <div class="header-middle">
//             <h3>TAKEAWAY </h3>
//             </div>
//           <!-- DATE & TIME -->
//           <div class="info-row">
//             <span><span class="info-label">Date:</span> ${getCurrentDate()}</span>
//             <span><span class="info-label">Time:</span> ${getCurrentTime()}</span>
//           </div>
//           <div class="info-row">
//             <span><span class="info-label">Invoice:</span>${invoiceDetails?.Invoice_Number ?? "-"}
// </span>
//           </div>

//           <div class="line-solid"></div>

//           <!-- ITEMS HEADER -->
//           <div class="items-header">
//             <div style="width: 30px;">#</div>
//             <div class="item-name">ITEM</div>
//             <div class="item-qty">QTY</div>
//             <div class="item-amount">AMOUNT</div>
//           </div>

//           <!-- ITEMS LIST -->
//           ${
//             (data?.items || []).map((it, i) => `
//               <div class="item-row">
//                 <div style="width: 30px;">${i + 1}</div>
//                 <div class="item-name">${it.Item_Name ?? "-"}</div>
//                 <div class="item-qty">${it.Item_Quantity ?? 1}</div>
//                 <div class="item-amount">₹${Number(it.Amount ?? 0).toFixed(2)}</div>
//               </div>
//             `).join("")
//           }

//           <div class="line-solid"></div>

//           <!-- SUMMARY -->
//           <div class="summary">
//             <div class="summary-row">
//               <span>Subtotal</span>
//               <span>₹${Number(invoiceDetails?.Sub_Total ?? 0).toFixed(2)}</span>
//             </div>
//             ${Number(invoiceDetails?.Service_Charge ?? 0) > 0 ? `
//             <div class="summary-row">
//               <span>Service Charge</span>
//               <span>₹${Number(invoiceDetails.Service_Charge).toFixed(2)}</span>
//             </div>
//             ` : ''}
//             ${invoiceDetails?.Discount && Number(invoiceDetails.Discount) > 0 ? `
//             <div class="summary-row">
//               <span>Discount</span>
//               <span>${
//                 invoiceDetails.Discount_Type === "percentage"
//                   ? `${invoiceDetails.Discount}%`
//                   : `₹${invoiceDetails.Discount}`
//               }</span>
//             </div>
//             ` : ''}
//             <div class="summary-row total">
//               <span>TOTAL</span>
//               <span>₹${Number(total).toFixed(2)}</span>
//             </div>
//           </div>

//           <!-- FOOTER -->
//           <div class="footer">
//             <div class="footer-title">THANK YOU!</div>
//             <div>Please Visit Again</div>
//           </div>

//         </div>
//       </body>
//     </html>
//   `;
// const html = `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <title>Invoice - ${invoiceDetails?.Invoice_Number ?? ""}</title>
//         <meta charset="UTF-8">
//         <style>
//           * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//           }
          
//           body { 
//             font-family: 'Courier New', Courier, monospace;
//             font-size: 11px;
//             line-height: 1.3;
//             color: #000;
//             font-weight: 600;
//             width: 58mm;     
//             margin: 0 auto;
//             padding: 0;
//             -webkit-print-color-adjust: exact;
//             print-color-adjust: exact;
//           }
          
//           .invoice {
//             width: 100%; 
//             max-width: 54mm;
//             margin: 0 auto;
//             padding: 2mm;
//           }

//           /* CENTER HEADER */
//           .header-center { 
//             text-align: center; 
//             margin-bottom: 8px;
//             border-bottom: 1px dashed #000;
//             padding-bottom: 8px;
//           }
          
//           .header-middle { 
//             text-align: center; 
//             margin-bottom: 8px;
//             border-bottom: 1px dashed #000;
//             padding-bottom: 8px;
//           }
          
//           .logo { 
//             width: 60px; 
//             height: auto; 
//             margin-bottom: 4px;
//             padding: 5px;
//             background-color: black;
//           }
          
//           .brand { 
//             font-size: 16px; 
//             font-weight: bold; 
//             text-transform: uppercase;
//             letter-spacing: 1px;
//             margin-bottom: 2px;
//             color: #000;
//           }
          
//           .thermal-strong {
//             font-size: 11px;
//             font-weight: 700;
//             letter-spacing: 0.3px;
//             color: #000;
//           }
          
//           .thermal-label {
//             font-weight: 700;
//             color: #000;
//           }
          
//           .line { 
//             border-top: 1px dashed #000; 
//             margin: 6px 0;
//           }
          
//           .line-solid {
//             border-top: 1px solid #000;
//             margin: 6px 0;
//           }

//           /* INFO SECTION */
//           .info-row {
//             display: flex;
//             justify-content: space-between;
//             margin: 2px 0;
//             font-size: 10px;
//             width: 100%;
//             font-weight: 700;
//             color: #000;
//           }
          
//           .info-label {
//             font-weight: bold;
//             color: #000;
//           }

//           /* ITEMS TABLE */
//           .items-header {
//             display: flex;
//             justify-content: space-between;
//             font-weight: bold;
//             border-bottom: 1px solid #000;
//             padding: 4px 0;
//             font-size: 10px;
//             color: #000;
//             width: 100%;
//           }
          
//           .item-row {
//             display: flex;
//             justify-content: space-between;
//             padding: 3px 0;
//             border-bottom: 1px dashed #ddd;
//             font-size: 10px;
//             font-weight: 700;
//             color: #000;
//             width: 100%;
//           }
          
//           .item-name {
//             flex: 1;
//             padding-right: 8px;
//             word-wrap: break-word;
//             font-weight: 700;
//             color: #000;
//           }
          
//           .item-qty {
//             width: 30px;
//             text-align: center;
//             font-weight: 700;
//             color: #000;
//           }
          
//           .item-price {
//             width: 50px;
//             text-align: right;
//             font-weight: 700;
//             color: #000;
//           }
          
//           .item-amount {
//             width: 55px;
//             text-align: right;
//             font-weight: bold;
//             color: #000;
//           }

//           /* SUMMARY */
//           .summary {
//             margin-top: 8px;
//             font-size: 11px;
//             width: 100%;
//             font-weight: 700;
//             color: #000;
//           }
          
//           .summary-row {
//             display: flex;
//             justify-content: space-between;
//             padding: 3px 0;
//             font-weight: 700;
//             color: #000;
//             width: 100%;
//           }
          
//           .summary-row.total {
//             font-size: 13px;
//             font-weight: bold;
//             border-top: 1px solid #000;
//             border-bottom: 2px solid #000;
//             margin-top: 4px;
//             padding: 5px 0;
//             color: #000;
//           }

//           /* FOOTER */
//           .footer {
//             text-align: center;
//             margin-top: 10px;
//             padding-top: 8px;
//             border-top: 1px dashed #000;
//             font-size: 10px;
//             font-weight: 700;
//             color: #000;
//           }
          
//           .footer-title {
//             font-weight: bold;
//             margin-bottom: 4px;
//             font-size: 11px;
//             color: #000;
//           }

//           /* PRINT STYLES */
//           @media print {
//             body {
//               width: 58mm;
//               margin: 0;
//               padding: 0;
//               -webkit-print-color-adjust: exact;
//               print-color-adjust: exact;
//             }

//             .invoice {
//               width: 100%;
//               max-width: 54mm;
//               margin: 0 auto;
//               padding: 2mm;
//             }

//             @page {
//               size: 58mm auto;
//               margin: 0;
//             }

//             .no-print {
//               display: none !important;
//             }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="invoice">

//           <!-- HEADER -->
//           <div class="header-center">
        
//             <div class="brand">HELLO GUYS</div>
//             <div style="font-size:10px; margin-top:4px; text-align:center; font-weight:700; color:#000;">
//               Phone: +91 99031 06989
//             </div>

//             <div style="font-size:10px; text-align:center; font-weight:700; color:#000;">
//               Mail: sparkhelloguys@gmail.com
//             </div>

//             <div style="font-size:9px; text-align:center; margin-top:2px; font-weight:700; color:#000;">
//               Address: 021D, Ho-Chi-Minh Sarani, Shakuntala Park, Behala,<br/>
//               Kolkata 700061, West Bengal
//             </div>
//             <div style="font-size:10px; text-align:center; font-weight:700; color:#000;">
//               Website: www.helloguys.co.in
//             </div>
//           </div>

         
//           ${invoiceDetails?.Customer_Name ? `
//           <div class="info-row">
//             <div><span class="thermal-label">Customer:</span> ${invoiceDetails.Customer_Name}</div>
//           </div>` : ``}

//           ${invoiceDetails?.Customer_Phone ? `
//           <div class="info-row">
//             <div><span class="thermal-label">Phone:</span> ${invoiceDetails.Customer_Phone}</div>
//           </div>` : ``}
          
//           <div class="line"></div>
//           <div class="header-middle">
//             <h3 style="font-weight:bold; color:#000;">TAKEAWAY</h3>
//           </div>
          
        
//           <div class="info-row">
//             <span><span class="info-label">Date:</span> ${getCurrentDate()}</span>
//             <span><span class="info-label">Time:</span> ${getCurrentTime()}</span>
//           </div>
//           <div class="info-row">
//             <span><span class="info-label">Invoice:</span> ${invoiceDetails?.Invoice_Number ?? "-"}</span>
//           </div>

//           <div class="line-solid"></div>

          
//           <div class="items-header">
//             <div style="width: 30px;">No.</div>
//             <div class="item-name">ITEM</div>
//             <div class="item-qty">QTY</div>
//             <div class="item-amount">AMOUNT</div>
//           </div>

      
//           ${
//             (data?.items || []).map((it, i) => `
//               <div class="item-row">
//                 <div style="width: 30px;">${i + 1}</div>
//                 <div class="item-name">${it.Item_Name ?? "-"}</div>
//                 <div class="item-qty">${it.Item_Quantity ?? 1}</div>
//                 <div class="item-amount">₹${Number(it.Amount ?? 0).toFixed(2)}</div>
//               </div>
//             `).join("")
//           }

//           <div class="line-solid"></div>

        
//           <div class="summary">
//             <div class="summary-row">
//               <span>Subtotal</span>
//               <span>₹${Number(invoiceDetails?.Sub_Total ?? 0).toFixed(2)}</span>
//             </div>
//             ${Number(invoiceDetails?.Service_Charge ?? 0) > 0 ? `
//             <div class="summary-row">
//               <span>Service Charge</span>
//               <span>₹${Number(invoiceDetails.Service_Charge).toFixed(2)}</span>
//             </div>
//             ` : ''}
//             ${invoiceDetails?.Discount && Number(invoiceDetails.Discount) > 0 ? `
//             <div class="summary-row">
//               <span>Discount</span>
//               <span>${
//                 invoiceDetails.Discount_Type === "percentage"
//                   ? `${invoiceDetails.Discount}%`
//                   : `₹${invoiceDetails.Discount}`
//               }</span>
//             </div>
//             ` : ''}
//             <div class="summary-row total">
//               <span>TOTAL</span>
//               <span>₹${Number(total).toFixed(2)}</span>
//             </div>
//           </div>

//           <!-- FOOTER -->
//           <div class="footer">
//             <div class="footer-title">THANK YOU!</div>
//             <div>Please Visit Again</div>
//           </div>

//         </div>
//       </body>
//     </html>
//   `;
const html=`<!DOCTYPE html>
<html>
<head>
  <title>Invoice - ${invoiceDetails?.Invoice_Number ?? ""}</title>
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

    ${invoiceDetails?.Customer_Name ? `
    <div class="info-row">
      <span class="info-label">Customer:</span>
      <span>${invoiceDetails.Customer_Name}</span>
    </div>` : ``}

    ${invoiceDetails?.Customer_Phone ? `
    <div class="info-row">
      <span class="info-label">Phone:</span>
      <span>${invoiceDetails.Customer_Phone}</span>
    </div>` : ``}

    <div class="line"></div>

    <div class="header-middle"><b>TAKEAWAY</b></div>

 <div class="info-row date-time">
  <span><b>Date:</b> ${getCurrentDate()}</span>
  <span><b>Time:</b> ${getCurrentTime()}</span>
</div>


    <div class="info-row">
      <span><b>Invoice:</b> ${invoiceDetails?.Invoice_Number ?? "-"}</span>
    </div>

    <div class="line-solid"></div>

    <div class="items-header">
      <div class="col-no">No</div>
      <div class="item-name">ITEM</div>
      <div class="item-qty">QTY</div>
      <div class="item-amount">AMT</div>
    </div>

    ${(data?.items || []).map((it, i) => `
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

      <div class="summary-row total">
        <span>TOTAL</span>
        <span>₹${Number(total).toFixed(2)}</span>
      </div>
    </div>

    <div class="footer">
      <b>THANK YOU!</b><br>
      Please Visit Again
    </div>
  </div> <!-- end of .invoice -->

  <!-- ================= KITCHEN COPY ================= -->
  <div class="line"></div>
  <div class="invoice-kitchen">

    <div class="header-center">
      <div class="brand">KITCHEN COPY</div>
      <div style="font-size:10px">
        Invoice: ${invoiceDetails?.Invoice_Number ?? "-"}
      </div>
    </div>

    <div class="info-row date-time">
      <span><b>Date:</b> ${getCurrentDate()}</span>
      <span><b>Time:</b> ${getCurrentTime()}</span>
    </div>

    <div class="line-solid"></div>

    <div class="items-header">
      <div class="col-no">No</div>
      <div class="item-name">ITEM</div>
      <div class="item-qty">QTY</div>
    </div>

    ${(data?.items || []).map((it, i) => `
      <div class="item-row">
        <div class="col-no">${i + 1}</div>
        <div class="item-name">${it.Item_Name}</div>
        <div class="item-qty">${it.Item_Quantity}</div>
      </div>
    `).join("")}

   

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
  // const w = window.open("", "_blank", "width=320,height=600");
// const w = window.open("", "_blank");
//   if (!w) {
//     alert("Please allow pop-ups to print the invoice.");
//     return;
//   }

//   w.document.write(html);
//   w.document.write(`
//   <button onclick="window.print()" 
//     style="position:fixed;top:10px;right:10px;padding:8px 12px;
//            background:#ff0000;color:white;border:none;border-radius:4px;
//            font-size:14px;cursor:pointer;z-index:9999;">
//       Print
//   </button>
// `);
//   w.document.close();

};
useEffect(() => {
  setValue("Amount", finalAmount.toFixed(2));
}, [finalAmount, setValue]);
// const customerName = watch("Customer_Name");
// const customerPhone = watch("Customer_Phone");
    const watchedCustomerName = watch("Customer_Name");
  return (
    <>


      <div className="sb2-2-2">
       <ul>
          <li>
            {/* <NavLink to="/">
                                 <i className="fa fa-home mr-2" aria-hidden="true"></i>
                                 Dashboard
                             </NavLink> */}
            {/* <NavLink style={{ display: "flex", flexDirection: "row" }}
              to="/home"

            >
              <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
          
              Dashboard
            </NavLink> */}
          </li>

        </ul> 
      </div>

      {/* Main Content */}
      <div style={{marginTop:"40px"}} className="sb2-2-3" >
        <div className="row" style={{ margin: "0px" }}>
          <div className="col-md-12">
            <div style={{ padding: "20px", marginBottom: "20px" }}
              className="box-inn-sp">

              <div className="inn-title w-full px-2 py-3">

                <div className="flex
                                  flex-col mt-10 sm:flex-row justify-between 
                                  items-start sm:items-center
                                  w-full sm:mt-0">

                  {/* LEFT HEADER */}
                  <div className="w-full flex justify-center items-center sm:w-auto">
                    <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Add Order Takeaway</h4>
                    {/* <p className="text-gray-500 mb-2 sm:mb-4">
         Add new sale details
       </p> */}
                  </div>

                  {/* RIGHT BUTTON SECTION */}
                  <div className="
       w-full flex justify-center items-center sm:w-auto 
       flex flex-wrap sm:flex-nowrap 
        sm:justify-end 
       gap-3
     ">
                    <button
                      type="button"
                      onClick={() => navigate("/staff/orders/all-orders")}
                      className="text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "black" }}
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/staff/orders/all-orders")}
                      className="text-white py-2 px-4 rounded"
                      style={{ backgroundColor: "#ff0000" }}
                    >
                      All Orders
                    </button>
                  </div>
                     </div>
            {/* <input type="hidden" {...register("Customer_Phone", { required: true })} />
<input type="hidden" {...register("Customer_Name")} />
<input type="hidden" {...register("Customer_Address")} />
<input type="hidden" {...register("Customer_Date")} /> */}

                                <div style={{  backgroundColor: "#f1f1f19d" }}  
                                className="
  grid
  grid-rows-1 grid-cols-1
  md:grid-rows-1 md:grid-cols-3
  p-2 mt-2 gap-6 w-full heading-wrapper
">
                                   
  <div style={{marginTop:"0px"}}
   className="row flex gap-2">
  
<div style={{marginTop:"0px"}} className="input-field col s6 relative">
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

<div style={{marginTop:"0px"}} className="input-field col s6 ">
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
                <div className="invisible sm:visible"></div>


                 {/* <div className="sm:visible"></div> */}
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
             
              </div>
              <div style={{ padding: "0", backgroundColor: "#f1f1f19d" }} className="tab-inn">
                {/* <form onSubmit={handleSubmit(onSubmit)}> */}
                     <form >



                  <div style={{ backgroundColor: "#f1f1f19d" }} className=" mx-auto px-2 py-2">
                    <div
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
                    </div>
                  </div>








                  <div>
                    {/* <div className="table-responsive table-desi mt-2"> */}
                    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">

                      <div className="bg-white shadow-md sticky top-0 ">



                      </div>


                      {/* Food Items Grid */}
                      <div className=" mx-auto px-2 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 
                                                 lg:grid-cols-4 xl:grid-cols-6 gap-6">

                          {filteredItems?.map((item, index) => {

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

                                  {/* <div className="absolute bottom-1 left-2 right-2">
                                    <h4 className="text-white text-[20px] leading-tight">
                                      {item.Item_Name}
                                    </h4>
                                  </div> */}
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
                                      disabled={unavailable}
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

                                </div>
                              </div>
                            );
                          })}

                        </div>
                      </div>


                      <div className="
    fixed bottom-0 left-0 w-full 
    bg-white shadow-lg 
    px-4 py-2 z-50
  "
                      >

                        <div className="grid grid-cols-1 sm:grid-cols-7 items-center gap-2">
                          {/* <div className="grid grid-cols-3"> */}
                          {/* <div></div> */}

                                                  
                        
                          {/* SAVE & PAY BILL */}

<div className="flex items-center gap-3 sm:col-span-2 ">
  {/* Label */}
  <span className="text-sm font-medium whitespace-nowrap">
    Discount
  </span>

  {/* Input */}
  <input
    type="text"
    placeholder={discountType === "percentage" ? "0 %" : "0.00"}
    className="w-24 border-b-2 outline-none text-gray-900 text-sm"
    {...register("Discount")}
    onChange={(e) => {
      let val = e.target.value.replace(/[^0-9.]/g, "");

      // allow only one dot
      const parts = val.split(".");
      if (parts.length > 2) {
        val = parts[0] + "." + parts.slice(1).join("");
      }

      // limit decimals
      if (val.includes(".")) {
        const [int, dec] = val.split(".");
        val = int + "." + dec.slice(0, 2);
      }

      // percentage cap
      if (discountType === "percentage" && Number(val) > 100) {
        val = "100";
      }

      setValue("Discount", val, { shouldValidate: true });
    }}
  />

  {/* Type */}
  <select
    className="w-24 border rounded-md px-1 py-1 text-sm"
    {...register("Discount_Type")}
    defaultValue="percentage"
    onChange={(e) => {
      setValue("Discount_Type", e.target.value);
      setValue("Discount", "0.00");
    }}
  >
    <option value="amount">Amt</option>
    <option value="percentage">%</option>
  </select>
</div>

<div 
    className="flex items-center gap-3 sm:col-span-2 ">
                      <span className="text-sm font-medium whitespace-nowrap">Payment Type</span>
                      {/* <span className="text-red-500 font-bold text-lg">&nbsp;*</span> */}
                      <select                         
                      id="Payment Mode"
                      {...register("Payment_Type")}
                      
                      // onChange={(e)=>setInvoiceDetails({...invoiceDetails,
                      //   Payment_Type: e.target.value
                      // })}

                        // value={invoiceDetails?.Payment_Type}
                        className="w-full border border-gray-300 text-gray-900 bg-white rounded-md p-2"
                      >
                        
                          
                          <option value="Cash">Cash</option>
                          
                          <option value="Online">Online</option>
                           <option value="Online">Upi</option>
                         
       
                      </select>
  
                 
                    </div>

  <button
                                                      type="button"
                                                      onClick={() => setShowSummary(true)}   // open bottom sheet
                                                      // disabled={formValues.errorCount > 0 || isAddingOrder}
                                                      className="relative w-full py-2 px-4 md:w-auto 
                                                      flex items-center justify-center gap-3 
                                                      
                                                            text-white font-bold  rounded shadow sm:py-3 px-6"
                                                      style={{ backgroundColor: "black" }}
                                                    >
                                                      View
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
                           <button
                            type="button"
                              onClick={handleSubmit(handleGenerateInvoice)}
                            className="relative w-full py-2 px-4 md:w-auto 
                                                      flex items-center justify-center gap-3 
                                                      sm:whitespace-nowrap
                                                            text-white font-bold  rounded shadow sm:py-3 px-6"
                            style={{ backgroundColor: "#ff0000" }}
                          >
                       Print Bill
                          </button>

                              <button
                            type="button"
                            onClick={handleSubmit(handleShareSMS)}
                            className="relative w-full py-2 px-4 md:w-auto 
                                                      flex items-center justify-center gap-3 
                                                      
                                                            text-white font-bold  rounded shadow sm:py-3 px-6"
                            style={{ backgroundColor: "#ff0000" }}
                          >
                          {isGenerateSmsLoading ? "Sharing..." : "Share"}
                          </button>
<div className="w-1/2"></div>
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
                      {/* <div
                        className={`
    fixed left-0 bottom-0 w-full 
    bg-white shadow-2xl rounded-t-2xl z-50
    transform transition-transform duration-300 p-4
    ${showSummary ? "translate-y-0" : "translate-y-full"}
  // `}
                      //                       style={{ maxHeight: "vh" }}
                      >
                        
                        <div className="w-full flex justify-center py-2">
                          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                        </div>

                     
                        <div className="px-4 pb-3 border-b">
                          <div className="flex justify-between items-center">
                            <div className="flex justify-center items-center mx-auto">
                              <h2 className="text-lg font-bold text-gray-700">Bill Summary</h2>
                            </div>
                            <div className="flex justify-enditems-center gap-2">
                              <button type="button" style={{ backgroundColor: "transparent", fontSize: "30px" }}
                                className="text-gray-500 text-2xl font-bold"
                                onClick={() => setShowSummary(false)}>✖</button>
                            </div>
                          </div>
                        </div>

                        {/* <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: "55vh" }}>
                          {itemsValues && itemsValues?.map((item, index) => (
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

                      
                        <div className="px-4 py-3 border-t">
                          <div className="flex justify-between text-lg font-bold text-gray-900">
                            <span>Total</span>
                            <span>₹{watch("Amount")}</span>
                          </div>
                          <div className="flex justify-center mt-4">
                            {/* <button type="submit"
                            style={{ backgroundColor: "#ff0000" }}
                              // onClick={() => setOrdertakeawayModalOpen(true)}
                              className="w-16 h-10 flex items-center justify-center bg-[#ff0000] 
          rounded-md text-white shadow hover:bg-[#3a8c98] ">
                              OK
                            </button> 

                          </div>
                        </div>
                      </div> */}
<div
  className={`
    fixed left-0 bottom-0 w-full 
    bg-white shadow-2xl rounded-t-2xl z-50
    transform transition-transform duration-300 p-4
    ${showSummary ? "translate-y-0" : "translate-y-full"}
  `}
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
        <button
          type="button"
          style={{ backgroundColor: "transparent", fontSize: "30px" }}
          className="text-gray-500 text-2xl font-bold"
          onClick={() => setShowSummary(false)}
        >
          ✖
        </button>
      </div>
    </div>
  </div>

  {/* SUMMARY ITEMS */}
  <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: "55vh" }}>
    {summaryItems?.map((item, index) => (
      <div key={index} className="border-b pb-2 mb-2">
        <div className="flex justify-between">
          <span className="font-semibold">{item?.Item_Name}</span>
          <span>x {item?.Item_Quantity}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Amount</span>
          <span>₹{Number(item?.Amount).toFixed(2)}</span>
        </div>
      </div>
    ))}
  </div>

  {/* TOTAL FOOTER */}
  <div className="px-4 py-3 border-t space-y-2">

    {/* SUB TOTAL */}
    <div className="flex justify-between text-sm text-gray-700">
      <span>Sub Total</span>
      <span>₹{subTotal.toFixed(2)}</span>
    </div>

    {/* DISCOUNT */}
    {discountValue > 0 && (
      <div className="flex justify-between text-sm text-gray-700">
        <span>
          Discount{" "}
          <span className="text-gray-500">
            (
            {discountType === "percentage"
              ? `${discountValue}%`
              : `₹${discountValue}`}
            )
          </span>
        </span>
        <span className="text-red-600">
          − ₹{discountAmount.toFixed(2)}
        </span>
      </div>
    )}

    {/* FINAL TOTAL */}
    <div className="border-t pt-2">
      <div className="flex justify-between text-lg font-bold text-gray-900">
        <span>Total</span>
        <span>₹{finalAmount.toFixed(2)}</span>
      </div>
    </div>

  </div>
</div>


                    </div>


                  </div>
                </form>
                {/* {ordertakeawayModalOpen &&
                  <OrderTakeawayModal
                    onClose={() => setOrdertakeawayModalOpen(false)}
                    data={formValues}
                    setOpen={setOrdertakeawayModalOpen}
                  />} */}

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

{/* <div className="w-full flex justify-center md:justify-end sale-wrapper px-4">
 
   <div className="w-full md:w-1/2 lg:w-1/3 flex flex-col gap-4">
 
 
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
 
   
     <div className="
         flex flex-col 
         md:flex-row 
         gap-3 
         md:justify-end 
         w-full
       "
     >
 
    
       <button
         type="button"
         onClick={()=>setOrdertakeawayModalOpen(true)}
         disabled={formValues.errorCount > 0 || isAddingOrder}
         className="relative w-full md:w-auto flex items-center justify-center gap-3 
                    text-white font-bold py-2 px-5 rounded shadow"
         style={{ backgroundColor: "#ff0000" }}
       >
         {isAddingOrder ? "Saving..." : "Save & Pay Bill"}
 
         
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
 
      
       <button
         type="submit"
         className="w-full md:w-auto text-white font-bold py-2 px-5 rounded shadow"
         style={{ backgroundColor: "#ff0000" }}
       >
         Save & Pay Bill
       </button> 
 
     </div>
   </div>
 </div> */}

    {/* <div 
                                    className="relative sm:w-1/4">
                                      <div
                                        className="flex flex-row border rounded-md bg-white cursor-pointer"
                                        onClick={() => setCustomerDropdownOpen((prev) => !prev)}
                                      >
                                        <input
                                          type="text"
                                          id="Customer_Name"
                                          value={customerSearch}
                                          // value={customerSearch.length>10?customerSearch.slice(0,15)+"...":customerSearch}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            setCustomerSearch(value);
                                            setValue("Customer_Name", value, { shouldValidate: true });
                                            setCustomerDropdownOpen(true);
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setCustomerDropdownOpen(true);
                                          }}
                                          onBlur={() => {
                                            setTimeout(() => {
                                              const typedValue = customerSearch?.trim()?.toLowerCase();
                                              const matchedParty = customers?.parties?.find(
                                                (p) => p.Customer_Name.toLowerCase() === typedValue
                                              );
                                    
                                              if (matchedParty) {
                                                setCustomerSearch(matchedParty.Customer_Name);
                                                setValue("Customer_Name", matchedParty.Customer_Name, { shouldValidate: true });
                                                //setValue("GSTIN", matchedParty.GSTIN || "", { shouldValidate: true });
                                              }
                                    
                                              setCustomerDropdownOpen(false);
                                            }, 150);
                                          }}
                                          placeholder="Search By Name/Phone"
                                          className="w-full outline-none py-1 px-2 text-gray-900"
                                          style={{ marginBottom: 0, marginTop: "4px", border: "none",borderBottom:"none", height: "2rem" }}
                                        />
                                        <div className="w-10 "></div>
                                        <span className=" absolute right-0 px-2  top-1/3  text-gray-700">▼</span>
                                      </div>
                                    {customerDropdownOpen && (
                    <div className="absolute z-20 flex flex-col mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      
                    
                      <span
                        onClick={() => setShowCustomerModal(true)}
                        className="block px-3 py-2 text-[#ff0000] font-medium hover:bg-gray-100 cursor-pointer"
                      >
                        + Add Customer
                      </span>
                  
                      {(() => {
                        const isPhoneSearch = /^\d+$/.test(customerSearch);
                  
                        const filteredCustomers = customers?.filter((party) => {
                          if (isPhoneSearch) {
                            return party?.Customer_Phone?.includes(customerSearch);
                          }
                          return party?.Customer_Name
                            ?.toLowerCase()
                            ?.includes(customerSearch.toLowerCase());
                        });
                  
                        return (
                          <>
                            {filteredCustomers?.map((party, i) => (
                              <div
                                key={i}
                                onClick={() => {
                    const displayValue =
                      party?.Customer_Name?.trim() ||
                      party?.Customer_Phone ||
                      "";
                  
                    setCustomerSearch(displayValue);
                  
                    setValue(
                      "Customer_Name",
                      party?.Customer_Name?.trim() || "",
                      { shouldValidate: true }
                    );
                  
                    setValue(
                      "Customer_Phone",
                      party?.Customer_Phone || "",
                      { shouldValidate: true }
                    );
                  
                    setCustomerDropdownOpen(false);
                  }}
                  
                                // onClick={() => {
                                //   setCustomerSearch(party?.Customer_Name || "");
                                //   setValue("Customer_Name", party?.Customer_Name || "", {
                                //     shouldValidate: true,
                                //   });
                                //   setValue("Customer_Phone", party?.Customer_Phone || "", {
                                //     shouldValidate: true,
                                //   });
                                //   setCustomerDropdownOpen(false);
                                // }}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              >
                                <span className="font-medium">
                                  {party?.Customer_Name || "Unknown"}
                                </span>{" "}
                                <span className="text-gray-500">
                                  ({party?.Customer_Phone})
                                </span>
                              </div>
                            ))}
                  
                         
                            {filteredCustomers?.length === 0 && (
                              <p className="px-3 py-2 text-gray-500">No Customers found</p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                  
                                      {/* {customerDropdownOpen && (
                                        <div className="absolute z-20 flex flex-col mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                          <span
                                            onClick={() => setShowCustomerModal(true)}
                                            className="block px-3 py-2 text-[#ff0000] font-medium hover:bg-gray-100 cursor-pointer"
                                          >
                                            + Add Customer
                                          </span>
                                    
                                          {customers
                                            ?.filter(
                                              (party) =>
                                                party?.Customer_Name?.toLowerCase()?.includes(customerSearch.toLowerCase()) ||
                                                party?.Customer_Phone?.includes(customerSearch)
                                            )
                                            .map((party, i) => (
                                              <div
                                                key={i}
                                                onClick={() => {
                                                    setCustomerSearch(`${party?.Customer_Name} (${party?.Customer_Phone})`);
                                                  setCustomerSearch(party?.Customer_Name);
                                                  setValue("Customer_Name", party?.Customer_Name, { shouldValidate: true });
                                                  setValue("Customer_Phone", party?.Customer_Phone, { shouldValidate: true });
                                                 
                                                  setCustomerDropdownOpen(false);
                                                }}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                              >
                                                     <span className="font-medium">{party?.Customer_Name}</span>{" "}
                                <span className="text-gray-500">({party?.Customer_Phone})</span>
                                              </div>
                                            ))}
                                    
                                          {customers?.filter((party) =>
                                            party?.Customer_Name?.toLowerCase()?.includes(customerSearch.toLowerCase())
                                          ).length === 0 && (
                                            <p className="px-3 py-2 text-gray-500">No Customers found</p>
                                          )}
                                        </div>
                                      )} 
                                    </div>
                                    
                                    
                                                          
                                                            {customerModal && (
                                                              <AddCustomerModal
                                                                onClose={() => setShowCustomerModal(false)}
                                                                onSave={(newParty) => {
                                                                  setCustomerSearch(newParty);
                                                                  setValue("Customer_Name", newParty, { shouldValidate: true });
                                                                  setShowCustomerModal(false);
                                                                }}
                                                              />
                                                            )}
                                    
                                                           
                                                            {errors?.Customer_Name && (
                                                              <p className="text-red-500 text-xs mt-1">{errors?.Customer_Name?.message}</p>
                                                            )} */}


                                                             {/* <div 
                                      className="w-full flex flex-col   mt-2 gap-2  "
                                                            >
                                                            {/* <span className="whitespace-nowrap active ">
                                                              Customer
                                                              <span className="text-red-500">*</span>
                                                            </span>
                                                            
                                 

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
                                                            
                                                          </div> */}