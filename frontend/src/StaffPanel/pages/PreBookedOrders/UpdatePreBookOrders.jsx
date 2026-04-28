



import { foodItemApi, useGetAllFoodItemsQuery } from "../../../redux/api/foodItemApi";



import { useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";

import { useFieldArray, useForm } from "react-hook-form";

import { io } from "socket.io-client";

import { useRef } from "react";
import { useEffect } from "react";

import { toast } from "react-toastify";



import { LayoutDashboard, Minus, Plus, ShoppingCart, Table } from "lucide-react";

// import OrderDetailsModal from "../../components/Modal/OrderDetailsModal";

import { useDispatch } from "react-redux";

import { useMemo } from "react";
import { useGetAllCategoriesQuery } from "../../../redux/api/itemApi";
import { useGetAllCustomersQuery, useGetPreBookOrderDetailsQuery, useUpdateAndPrintPreBookKOTMutation, useUpdatePreBookOrderMutation } from "../../../redux/api/Staff/orderApi";
import PreBookBillModal from "../../../components/Modal/PreBookBillModal";
import { useGetAllTablesQuery } from "../../../redux/api/tableApi";


const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});







export default function UpdatePreBookOrders() {
  // const formatTime = (time) => {
  //   if (!time) return "--";
  //   const d = new Date(time);
  //   d.setSeconds(0);
  //   return d.toLocaleTimeString([], {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };

  const { Pre_Booked_Order_Id } = useParams();
  const dispatch = useDispatch();
  const [preBookBillModalOpen, setPreBookBillModalOpen] = useState(false);
  //console.log(Order_Id);
  const { data: preBookedOrderDetails } = useGetPreBookOrderDetailsQuery(Pre_Booked_Order_Id);
  console.log(preBookedOrderDetails, "preBookedOrderDetails");
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

  //const categoryRefs = useRef([]); // store refs for category dropdowns
  //const itemRefs = useRef([]);     // store refs for item dropdowns
  // const [activeCategory, setActiveCategory] = useState('All');
  // const lastCategoryRef = useRef(activeCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const tableRef = useRef(null);
  const { data: customers } = useGetAllCustomersQuery();
  console.log(customers, "customers");
  const [customerSearch, setCustomerSearch] = useState("");

  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  // const[customerModal,setShowCustomerModal]=useState(false);
  //const[addParty, { isLoading }] = useAddPartyMutation();
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);


  const { data: menuItems, isLoading: isMenuItemsLoading, isFetching } = useGetAllFoodItemsQuery({});
  //console.log(tables, isLoading, "tables", menuItems, isMenuItemsLoading);
  const items = menuItems?.foodItems
  const [updatePreBookOrder, { isLoading: isUpdateOrderLoading }] = useUpdatePreBookOrderMutation();
  const lastUpdatedItemRef = useRef(null);
  const [updateAndPrintPreBookKOT, { isLoading: isUpdateAndPrintPreBookKOTLoading }] = useUpdateAndPrintPreBookKOTMutation();
  const [cart, setCart] = useState({});
  //const [selectedTables, setSelectedTables] = useState([]);
  const { data: categories } = useGetAllCategoriesQuery()
  //console.log(categories,"categories");
  const { data: tables, isLoading } = useGetAllTablesQuery({});
  const [tableSearch, setTableSearch] = useState("");
  const existingCategories = [...new Set(categories?.map(c => c.Item_Category))];
  const newCategories = ["All", ...existingCategories];
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
  const [activeCategory, setActiveCategory] = useState('All');
  const lastCategoryRef = useRef(activeCategory);

  //const [kotNotifications, setKotNotifications] = useState([]);
  useEffect(() => {
    const handleAvailabilityChange = (data) => {
      console.log("📢 Food status changed:", data);

      // Force RTK Query to refetch
      dispatch(foodItemApi.util.invalidateTags([{ type: "Food-Item", id: "LIST" }]));
    };

    socket.on("food_item_availability_changed", handleAvailabilityChange);

    return () => {
      socket.off("food_item_availability_changed", handleAvailabilityChange);
    };
  }, []);
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

  // Join the Socket.IO room for this order
  //   useEffect(() => {
  //     if (!preBookedOrderDetails?.KOT_Id) return;

  //     const room = `order_${preBookedOrderDetails.KOT_Id}`;

  //     console.log("Joining room:", room);
  //     socket.emit("join_order_room", preBookedOrderDetails.KOT_Id);

  //     return () => {
  //       console.log("Leaving room:", room);
  //       socket.emit("leave_order_room", preBookedOrderDetails.KOT_Id);
  //     };
  //   }, [preBookedOrderDetails?.KOT_Id]);

  //   useEffect(() => {
  //     if (!preBookedOrderDetails?.kitchenItems) return;

  //     // full reset when refreshing page
  //     const fresh = preBookedOrderDetails.kitchenItems.map(it => ({
  //       KOT_Id: preBookedOrderDetails.KOT_Id,
  //       KOT_Item_Id: it.KOT_Item_Id,
  //       itemName: it.Item_Name,
  //       status: it.Item_Status,
  //       time: it.updated_at,
  //       quantity: it.Quantity,
  //       // time: null,
  //     }));

  //     setKotNotifications(fresh);

  //   }, [preBookedOrderDetails]);

  //   useEffect(() => {
  //     const handleKotUpdate = (data) => {

  //       console.log("📢 Frontend received KOT update:", data);
  //       toast.info(`${data.itemName} → ${data.status}`);

  //       // setKotNotifications((prev) => {
  //       //   const index = prev.findIndex(n => n.KOT_Item_Id === data.KOT_Item_Id);
  //       setKotNotifications((prev) => {
  //         const index = prev.findIndex(
  //           (n) => String(n.KOT_Item_Id) === String(data.KOT_Item_Id)
  //         );

  //         // 🟢 1. If item already exists → update status/time
  //         if (index !== -1) {
  //           const updated = [...prev];
  //           updated[index] = {
  //             ...updated[index],
  //             status: data.status,
  //             time: data.updated_at, // ✅ FIXED

  //             // time: data.time,
  //           };
  //           return updated;
  //         }

  //         // 🟢 2. If the row is NEW (e.g., new biriyani added), append it
  //         return [
  //           ...prev,
  //           {
  //             KOT_Id: data.KOT_Id,
  //             KOT_Item_Id: data.KOT_Item_Id,
  //             itemName: data.itemName,
  //             status: data.status,
  //             time: data.updated_at,

  //             // time: data.time,
  //           }
  //         ];
  //       });
  //     };
  //     dispatch(orderApi.util.invalidateTags(["Order"]));

  //     socket.on("frontend_kot_update", handleKotUpdate);

  //     return () => {
  //       socket.off("frontend_kot_update", handleKotUpdate);
  //     };
  //   }, []);

  // console.log(kotNotifications,"kotNotifications");
  //   useEffect(() => {
  //     const handleClickOutside = (event) => {
  //       setRows((prev) =>
  //         prev.map((row, idx) => {
  //           const catRef = categoryRefs.current[idx];
  //           const itemRef = itemRefs.current[idx];

  //           const clickedInsideCategory =
  //             catRef && catRef.contains(event.target);
  //           const clickedInsideItem =
  //             itemRef && itemRef.contains(event.target);

  //           // if clicked outside both → close
  //           if (!clickedInsideCategory && !clickedInsideItem) {
  //             return { ...row, CategoryOpen: false, itemOpen: false };
  //           }

  //           return row;
  //         })
  //       );
  //     };

  //     document.addEventListener("mousedown", handleClickOutside);
  //     return () => {
  //       document.removeEventListener("mousedown", handleClickOutside);
  //     };
  //   }, []);



  const {

    control,
    handleSubmit,
    setValue,
    watch,

    reset,

  } = useForm({
    defaultValues: {
      //   Tax_Type: "None",
      //   Tax_Amount: "0.00",


      Customer_Name: "",
      Customer_Phone: "",
      Address: "",
      Booking_Date: "",
      Booking_Hour: "",
      Booking_Minute: "",
      Booking_Period: "",
      Amount: "0.00",
      Sub_Total: "0.00",
      Advance_Payment: "0.00",
      Payment_Left: "0.00",
      items: []   // No pre-created empty row
    }
  });


  const [showSummary, setShowSummary] = useState(false);

  const [open, setOpen] = useState(false);

  const selectedTables = watch("Table_Names") || [];
  useEffect(() => {
    if (!preBookedOrderDetails) return;

    const timeStr = preBookedOrderDetails?.order?.Booking_Time; // "12:30 PM"

    let hour = "";
    let minute = "";
    let period = "";

    if (timeStr) {
      const [timePart, ampm] = timeStr.split(" "); // ["12:30", "PM"]
      const [h, m] = timePart.split(":");          // ["12", "30"]

      hour = h;
      minute = m;
      period = ampm; // AM / PM
    }
    const tableNames =
      preBookedOrderDetails?.tables?.map(t => t.Table_Name) || [];

    // if (tableNames.length > 0) {
    //   setSelectedTables(tableNames);
    // }

    reset({
      items: preBookedOrderDetails.items.map((item) => ({
        Item_Name: item.Item_Name,
        Item_Price: item.Booked_Price,
        Item_Quantity: item.Quantity,
        Amount: item.Amount,
        id: item.Item_Id,
      })),

      Customer_Phone: preBookedOrderDetails.order.Customer_Phone,
      Customer_Name: preBookedOrderDetails.order.Customer_Name,
      Address: preBookedOrderDetails.order.Address,

      Booking_Date: preBookedOrderDetails.order.Booking_Date,

      Booking_Hour: hour,
      Booking_Minute: minute,
      Booking_Period: period || "AM",

      Sub_Total: preBookedOrderDetails.order.Sub_Total,
      Amount: preBookedOrderDetails.order.Total,
      Advance_Payment: preBookedOrderDetails.order.Advance_Payment,
      Payment_Left: preBookedOrderDetails.order.Payment_Left,
      Table_Names: tableNames,
    });

    setCustomerSearch(preBookedOrderDetails.order.Customer_Phone || "");
    const map = {};
    preBookedOrderDetails?.items.forEach((it, idx) => {
      map[it.Item_Id] = idx;   // ✅ FIXED
    });
    itemRowMap.current = map;

    // 🔥 Also sync cart quantities with Item_Id
    const initialCart = {};
    preBookedOrderDetails?.items.forEach((it) => {
      initialCart[it.Item_Id] = it.Quantity;  // ✅ FIXED
    });
    setCart(initialCart);
  }, [preBookedOrderDetails, reset]);



  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });


  // const filteredItems = activeCategory === 'All'
  //     ? items
  //     : items?.filter(item => item?.Item_Category === activeCategory);


  // const filteredItems = useMemo(() => {
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
  // const filteredItems = useMemo(() => {
  //   if (!items) return [];

  //   const term = searchTerm.trim().toLowerCase();
  //   const categoryChanged = lastCategoryRef.current !== activeCategory;

  //   const filtered = items.filter((item) => {
  //     const matchesCategory =
  //       activeCategory === "All" ||
  //       item.Item_Category === activeCategory;

  //     // 🔥 Ignore search when category JUST changed
  //     const matchesSearch = categoryChanged
  //       ? true
  //       : !term || item.Item_Name?.toLowerCase().includes(term);

  //     return matchesCategory && matchesSearch;
  //   });

  //   // update category ref AFTER filtering
  //   lastCategoryRef.current = activeCategory;

  //   return [...filtered].sort((a, b) => {
  //     const aId = a.id;
  //     const bId = b.id;

  //     const aInCart = cart[aId] ? 1 : 0;
  //     const bInCart = cart[bId] ? 1 : 0;

  //     // 🔥 MOST RECENT ITEM ALWAYS ON TOP
  //     if (aId === lastUpdatedItemRef.current) return -1;
  //     if (bId === lastUpdatedItemRef.current) return 1;

  //     // 🔥 CART ITEMS ABOVE NON-CART ITEMS
  //     if (aInCart !== bInCart) return bInCart - aInCart;

  //     return 0;
  //   });
  // }, [items, activeCategory, searchTerm, cart]);



  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
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

  // const minQuantityOfItems=preBookedOrderDetails?.kitchenItems?.reduce((acc, item) => {
  //     acc[item.Item_Id] = item.Quantity;
  //     return acc;
  // })
  const minQuantityOfItems = new Map();

  preBookedOrderDetails?.kitchenItems?.forEach((item) => {
    if (!minQuantityOfItems.has(item.Item_Id))
      minQuantityOfItems.set(item.Item_Id, item.Quantity);
    else {
      minQuantityOfItems.set(item.Item_Id, minQuantityOfItems.get(item.Item_Id) + item.Quantity);
    }
  })


  const updateCart = (itemId, delta, _index, itemName, itemPrice) => {
    const price = Number(itemPrice); // ✅ UNIT PRICE ONLY

    if (!price || price <= 0) {
      console.warn("Invalid price passed to updateCart:", itemId, itemPrice);
      return;
    }

    setCart((prev) => {
      const currentQty = Number(prev[itemId] || 0);
      const newQty = currentQty + delta;

      let rowIndex = itemRowMap.current[itemId];

      /* ---------------- REMOVE ITEM ---------------- */
      if (newQty <= 0) {
        if (rowIndex !== undefined) {
          remove(rowIndex);

          // 🔥 rebuild mapping safely
          const newMap = {};
          watch("items")
            ?.filter(Boolean)
            .forEach((it, idx) => {
              newMap[it.id] = idx;
            });
          itemRowMap.current = newMap;
        }

        const updatedCart = { ...prev };
        delete updatedCart[itemId];

        setTimeout(updateTotals, 0);
        return updatedCart;
      }

      /* ---------------- ADD / UPDATE ---------------- */
      if (rowIndex === undefined) {
        rowIndex = fields.length;
        itemRowMap.current[itemId] = rowIndex;

        append({
          id: itemId,
          Item_Name: itemName,      // ✅ name from param
          Item_Price: price,        // ✅ unit price stored once
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

      return {
        ...prev,
        [itemId]: newQty,
      };
    });
  };
  const filteredItems = useMemo(() => {
    if (!items) return [];

    const term = searchTerm.trim().toLowerCase();
    const categoryChanged = lastCategoryRef.current !== activeCategory;

    // 1️⃣ FILTER: category + smart search
    const filtered = items.filter((item) => {
      const matchesCategory =
        activeCategory === "All" ||
        item.Item_Category === activeCategory;

      const matchesSearch =
        categoryChanged ||
        !term ||
        item.Item_Name?.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });

    // update category ref AFTER filtering
    lastCategoryRef.current = activeCategory;

    // 2️⃣ SPLIT: cart vs non-cart (preserve order)
    const addedItems = [];
    const newItems = [];

    filtered.forEach((item) => {
      if (cart?.[item.Item_Id]) {
        addedItems.push(item);
      } else {
        newItems.push(item);
      }
    });

    // 3️⃣ MOST RECENT UPDATE → move to top of its group ONLY
    const lastId = lastUpdatedItemRef.current;

    if (lastId) {
      const idx = addedItems.findIndex(
        (item) => item.Item_Id === lastId
      );

      if (idx > 0) {
        const [recent] = addedItems.splice(idx, 1);
        addedItems.unshift(recent);
      }
    }

    // 4️⃣ MERGE: cart items first, then others
    return [...addedItems, ...newItems];
  }, [items, activeCategory, searchTerm, cart]);
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
  }, [filteredItems, activeCategory])
  //console.log(filteredItems,"filteredItems",cart)
  const summaryItems = watch("items") || [];

  const formValues = watch();
  //const itemsValues = watch("items");   // watch all item rows
  //const totalPaid = watch("Total_Paid"); // watch Total_Paid
  // const num = (v) => (v === undefined || v === null || v === "" ? 0 : Number(v));
  //   const subTotal = Number(watch("Sub_Total") || 0);
  const subTotal = parseFloat(watch("Sub_Total") || 0.00);
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
  // const finalAmount = Number((subTotal - discountAmount).toFixed(2));

  useEffect(() => {
    updateTotals();
  }, [watch("items")]);

  const toMySQLTime = (hour, minute, period) => {
    let h = parseInt(hour, 10);
    let m = minute !== undefined && minute !== null && minute !== ""
      ? parseInt(minute, 10)
      : 0; // 🔥 default to 00

    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  };

  const printPreBookReceipt = (invoiceDetails, bookingTimeForReceipt) => {
    // const getCurrentDate = () =>
    //   new Date().toLocaleDateString("en-GB");

    // const getCurrentTime = () =>
    //   new Date().toLocaleTimeString("en-US", {
    //     hour: "2-digit",
    //     minute: "2-digit",
    //     hour12: true,
    //   });
    // const total = invoiceDetails?.Final_Amount ?? 0;

    const html = `<!DOCTYPE html>
<html>
<head>
 
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
      width: 46mm;
      margin: 0 auto;
      padding: 1mm;
    }
       .invoice-kitchen {
      width: 46mm;
      margin: 0 auto;
      padding: 1mm;
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
  flex-direction: column;
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
      padding-right: 1mm;
      word-break: break-word;
    }

    .item-qty {
      width: 5mm;
      text-align: center;
    }

    .item-amount {
      width: 8mm;
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

 



 <div class="info-row date-time">
  <span><b>Booking Date:</b> ${invoiceDetails?.Booking_Date}</span>
  <span><b>Booking Time:</b> ${bookingTimeForReceipt}</span>
</div>

   

    <div class="line-solid"></div>

    ${invoiceDetails?.items?.length > 0
        ? `
    <div class="items-header">
      <div class="col-no">No</div>
      <div class="item-name">ITEM</div>
      <div class="item-qty">QTY</div>
      <div class="item-amount">AMT</div>
    </div>
    `
        : ``
      }

    ${(invoiceDetails?.items || []).map((it, i) => `
      <div class="item-row">
        <div class="col-no">${i + 1}</div>
        <div class="item-name">${it.Item_Name}</div>
        <div class="item-qty">${it.Item_Quantity}</div>
        <div class="item-amount">₹${Number(it.Amount).toFixed(2)}</div>
      </div>
    `).join("")}

    <div class="line-solid"></div>
<div class="summary">
      ${invoiceDetails?.items?.length > 0 ? `
      <div class="summary-row">
        <span>Subtotal</span>
        <span>₹${Number(invoiceDetails?.Sub_Total).toFixed(2)}</span>
      </div> ` : ``}

        <div class="summary-row">
        <span>Advance</span>
        <span>₹${Number(invoiceDetails?.Advance_Payment).toFixed(2)}</span>
      </div>
  ${invoiceDetails?.items?.length > 0 &&
        Number(invoiceDetails?.Payment_Left) !== 0
        ? `
  <div class="summary-row">
    <span>
      ${Number(invoiceDetails.Payment_Left) < 0
          ? "Extra Paid"
          : "Payment Left"
        }
    </span>
    <span>
      ₹${Math.abs(Number(invoiceDetails.Payment_Left)).toFixed(2)}
    </span>
  </div>
`
        : ``
      }


    

    </div>

    <div class="footer">
      <b>THANK YOU!</b><br>
      Please Visit Again
    </div>
  </div> <!-- end of .invoice -->

  <!-- ================= KITCHEN COPY ================= -->
  
  

  </div>
</body>
</html>
`

    // 🔥 CREATE HIDDEN IFRAME
    // const iframe = document.createElement("iframe");
    // iframe.style.position = "fixed";
    // iframe.style.right = "0";
    // iframe.style.bottom = "0";
    // iframe.style.width = "0";
    // iframe.style.height = "0";
    // iframe.style.border = "0";

    // document.body.appendChild(iframe);

    // const doc = iframe.contentWindow.document;
    // doc.open();
    // doc.write(html);
    // doc.close();

    // // ✅ THIS WAS MISSING
    // iframe.onload = () => {
    //   iframe.contentWindow.focus();
    //   iframe.contentWindow.print();
    // };

    // // 🧹 CLEANUP AFTER PRINT
    // setTimeout(() => {
    //   document.body.removeChild(iframe);
    // }, 1000);
    //  const iframe = document.createElement("iframe");
    // iframe.style.position = "fixed";
    // iframe.style.right = "0";
    // iframe.style.bottom = "0";
    // iframe.style.width = "0";
    // iframe.style.height = "0";
    // iframe.style.border = "0";

    // document.body.appendChild(iframe);

    // const doc = iframe.contentWindow.document;
    // doc.open();
    // doc.write(html);
    // doc.close();

    // // ✅ THIS WAS MISSING
    // iframe.onload = () => {
    //   iframe.contentWindow.focus();
    //   iframe.contentWindow.print();
    // };

    // // 🧹 CLEANUP AFTER PRINT
    // setTimeout(() => {
    //   document.body.removeChild(iframe);
    // }, 1000);
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();

    iframe.onload = () => {
      iframe.contentWindow.print();
    };

    setTimeout(() => document.body.removeChild(iframe), 1000);
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
  //  const onSubmit = async (data) => {
  //   console.log("Form Data:", data);

  //   /* ---------------- ITEMS VALIDATION ---------------- */
  //   if (!data.items || data.items.length === 0) {
  //     toast.error("Please add at least one item before saving.");
  //     return;
  //   }

  //   /* ---------------- BOOKING VALIDATION ---------------- */
  //   if (!data.Booking_Date) {
  //     toast.error("Please select a date before saving.");
  //     return;
  //   }

  //   if (!data.Booking_Hour) {
  //     toast.error("Please select hour before saving.");
  //     return;
  //   }

  //   if (!data.Booking_Period) {
  //     toast.error("Please select AM/PM before saving.");
  //     return;
  //   }

  //   // Minute is optional → default to 00
  //   if (
  //     data.Booking_Minute &&
  //     (Number(data.Booking_Minute) < 0 || Number(data.Booking_Minute) > 59)
  //   ) {
  //     toast.error("Minute must be between 00 and 59.");
  //     return;
  //   }



  //   /* ---------------- CLEAN ITEMS ---------------- */
  //   const cleanedItems = data.items.filter(
  //     (it) => it.Item_Name && it.Item_Name.trim() !== ""
  //   );

  //   for (const item of cleanedItems) {
  //     if (!item.Item_Quantity || Number(item.Item_Quantity) <= 0) {
  //       toast.error(
  //         `Quantity for "${item.Item_Name}" must be greater than zero`
  //       );
  //       return;
  //     }
  //   }

  //   if (cleanedItems.length === 0) {
  //     toast.error("Please add at least one valid item.");
  //     return;
  //   }

  //   /* ---------------- TIME CONVERSION ---------------- */
  //   const bookingTime = toMySQLTime(
  //     data.Booking_Hour,
  //     data.Booking_Minute || "00",
  //     data.Booking_Period
  //   );

  //   /* ---------------- PREPARE ITEMS ---------------- */
  //   const itemsSafe = cleanedItems.map((item) => ({
  //     Item_Name: item.Item_Name,
  //     Item_Price: item.Item_Price, // may be null → backend keeps old price
  //     Item_Quantity: item.Item_Quantity,
  //     Amount: item.Amount,
  //   }));



  //   /* ---------------- FINAL PAYLOAD ---------------- */
  //   const payload = {
  //     Customer_Name: data.Customer_Name || null,
  //     Customer_Phone: data.Customer_Phone || null,

  //    Address: data.Address, // ✅ FIXED
  //     Booking_Date: data.Booking_Date,
  //     Booking_Time: bookingTime,

  //     Sub_Total: data.Sub_Total || "0.00",
  //     Amount: data.Amount || "0.00",
  //     Advance_Payment: data.Advance_Payment || "0.00",
  //     Payment_Left: data.Payment_Left || "0.00",

  //     items: itemsSafe,
  //   };

  //   const bookingTimeForReceipt=data.Booking_Hour + ":" + data.Booking_Minute + " " + data.Booking_Period
  //   console.log("📦 Final JSON to send:", payload);

  //   /* ---------------- API CALL ---------------- */
  //   try {
  //     const res = await updatePreBookOrder({
  //       Pre_Booked_Order_Id,
  //       ...payload, // ✅ FIXED (no nested payload)
  //     }).unwrap();

  //     if (!res?.success) {
  //       toast.error(res.message || "Failed to update order.");
  //       return;
  //     }
  //     printPreBookReceipt (payload, bookingTimeForReceipt);
  //     toast.success("Order updated successfully!");
  //      setTimeout(() => {
  //       navigate("/staff/pre-book-order/all-pre-booked-orders");
  //     }, 100);
  //     // navigate("/staff/pre-book-order/all-pre-booked-orders");

  //   } catch (error) {
  //     console.error("❌ Order update Error:", error);
  //     toast.error(error?.data?.message || "Failed to update order.");
  //   }
  // };
  const onSubmit = async (data) => {
    console.log("Form Data:", data);

    /* ---------------- BOOKING VALIDATION ---------------- */
    if (!data.Booking_Date) {
      toast.error("Please select a date before saving.");
      return;
    }

    if (!data.Booking_Hour) {
      toast.error("Please select hour before saving.");
      return;
    }

    if (!data.Booking_Period) {
      toast.error("Please select AM/PM before saving.");
      return;
    }

    if (
      data.Booking_Minute &&
      (Number(data.Booking_Minute) < 0 || Number(data.Booking_Minute) > 59)
    ) {
      toast.error("Minute must be between 00 and 59.");
      return;
    }

    /* ---------------- CLEAN ITEMS (OPTIONAL) ---------------- */
    const cleanedItems = Array.isArray(data.items)
      ? data.items.filter(
        (it) => it.Item_Name && it.Item_Name.trim() !== ""
      )
      : [];

    /* 🔥 VALIDATE ITEMS ONLY IF PRESENT */
    if (cleanedItems.length > 0) {
      for (const item of cleanedItems) {
        if (!item.Item_Quantity || Number(item.Item_Quantity) <= 0) {
          toast.error(
            `Quantity for "${item.Item_Name}" must be greater than zero`
          );
          return;
        }
      }

      // Duplicate check
      const seen = new Set();
      for (const item of cleanedItems) {
        const name = item.Item_Name.trim().toLowerCase();
        if (seen.has(name)) {
          toast.error(`Duplicate item: ${item.Item_Name}`);
          return;
        }
        seen.add(name);
      }
    }

    /* ---------------- TIME CONVERSION ---------------- */
    const bookingTime = toMySQLTime(
      data.Booking_Hour,
      data.Booking_Minute || "00",
      data.Booking_Period
    );

    /* ---------------- PREPARE ITEMS (EMPTY OK) ---------------- */
    const itemsSafe = cleanedItems.map((item) => ({
      Item_Name: item.Item_Name,
      Item_Price: item.Item_Price,
      Item_Quantity: item.Item_Quantity,
      Amount: item.Amount,
    }));

    /* ---------------- FINAL PAYLOAD ---------------- */
    const payload = {
      Customer_Name: data.Customer_Name || null,
      Customer_Phone: data.Customer_Phone || null,
      Address: data.Address || "",

      Booking_Date: data.Booking_Date,
      Booking_Time: bookingTime,
      Table_Names: data.Table_Names,
      Sub_Total: data.Sub_Total || "0.00",
      Amount: data.Amount || "0.00",
      Advance_Payment: data.Advance_Payment || "0.00",
      Payment_Left: data.Payment_Left || "0.00",

      items: itemsSafe, // ✅ empty array allowed

    };

    const bookingTimeForReceipt =
      `${data.Booking_Hour}:${data.Booking_Minute || "00"} ${data.Booking_Period}`;

    console.log("📦 Final JSON to send:", payload);

    /* ---------------- API CALL ---------------- */
    try {
      const res = await updatePreBookOrder({
        Pre_Booked_Order_Id,
        ...payload,
      }).unwrap();

      if (!res?.success) {
        toast.error(res.message || "Failed to update order.");
        return;
      }

      printPreBookReceipt(payload, bookingTimeForReceipt);
      toast.success("Order updated successfully!");

      setTimeout(() => {
        navigate("/staff/pre-book-order/all-pre-booked-orders");
      }, 100);

    } catch (error) {
      console.error("❌ Order update Error:", error);
      toast.error(error?.data?.message || "Failed to update order.");
    }
  };


  const advance = parseFloat(watch("Advance_Payment") || 0.00);
  const paymentLeft = subTotal - advance;

  useEffect(() => {
    setValue("Payment_Left", paymentLeft < 0 ? paymentLeft : paymentLeft, {
      shouldValidate: true,
      shouldDirty: true
    });
  }, [subTotal, advance, setValue]);


  //console.log(summaryItems);
  console.log("Current form values:", formValues);
  //console.log("Form errors:", errors);
  console.log(summaryItems, selectedTables)
  const printPreBookKOT = (kitchens) => {
    console.log(kitchens)
    const getCurrentDate = () =>
      new Date().toLocaleDateString("en-GB");

    const getCurrentTime = () =>
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

    const kitchenSections = Object.entries(kitchens)
      .map(([kitchenName, items], index) => `
    ${index > 0 ? `<div class="line"></div>` : ``}

    <div class="invoice-kitchen">
      <div class="header-center">
        <div class="brand">PRE ORDER</div>
        <div class="brand">${kitchenName}</div>
      </div>

      <div class="info-row date-time">
        <span><b>Date:</b> ${getCurrentDate()}</span>
        <span><b>Time:</b> ${getCurrentTime()}</span>
      </div>

      <div class="line-solid"></div>

   
         ${items?.length > 0 ? `
    <div class="items-header">
      <div class="col-no">No</div>
      <div class="item-name">ITEM</div>
      <div class="item-qty">QTY</div>
     
    </div>
    `
          : ``}

      ${items
          .map(
            (it, i) => `
          <div class="item-row">
            <div class="col-no">${i + 1}</div>
            <div class="item-name">${it.Item_Name}</div>
            <div class="item-qty">${it.Item_Quantity}</div>
          </div>
        `
          )
          .join("")}
    </div>
  `)
      .join("");


    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body {
    font-family: 'Courier New', monospace;
    font-size: 16px;
    font-weight: 700;
    width: 58mm;
    margin: 0;
  }
  .invoice { width: 48mm; padding: 2mm; }
  .invoice-kitchen { margin-top: 8px; }
  .header-center {
    text-align: center;
    border-bottom: 1px dashed #000;
    margin-bottom: 6px;
    padding-bottom: 6px;
  }
  .brand { font-size: 20px; font-weight: 800; }
  .line { border-top: 1px dashed #000; margin: 6px 0; }
  .line-solid { border-top: 1px solid #000; margin: 5px 0; }
  .items-header, .item-row {
    display: flex;
    justify-content: space-between;
    font-size: 15px;
  }
  .items-header { border-bottom: 1px solid #000; font-weight: 800; gap: 4px; padding-bottom: 4px; }
  .col-no { width: 5mm; }
  .item-name { flex: 1; }
  .item-qty { width: 6mm; text-align: center; }
  .info-row.date-time {
    display: flex;
    
    justify-content: space-between;
    font-size: 12px;
  }
  
  @page { size: 48mm auto; margin: 0; }
            /* PRINT STYLES */
          @media print {
            body {
              width: 58mm;
              margin: 0;
              padding: 0;
            }
            
            .invoice {
              width: 58mm;
              padding: 8px;
            }
            
            @page {
              size: 58mm auto;
              margin: 0;
            }
            
            .no-print {
              display: none !important;
            }
          }
</style>
</head>
<body>
  <div class="invoice">
    ${kitchenSections}
  </div>
</body>
</html>`;
    // const win = window.open(
    //   "",
    //   "_blank",
    //   `width=${screen.width},height=${screen.height},left=0,top=0`
    // );
    // const win = window.open(
    //   "",
    //   "_blank",
    //   "width=800,height=600,left=0,top=0"
    // );
    // if (!win) return;

    // win.document.open();
    // win.document.write(html);
    // win.document.close();

    // win.onload = () => {
    //   setTimeout(() => {
    //     win.focus();
    //     win.print();
    //     win.close();
    //   }, 300);
    // };


    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();

    iframe.onload = () => {
      iframe.contentWindow.print();
    };

    setTimeout(() => document.body.removeChild(iframe), 1000);
    //   const iframe = document.createElement("iframe");
    // iframe.style.display = "none";
    // iframe.src = "about:blank";          // 🔥 important
    // document.body.appendChild(iframe);

    // iframe.contentDocument.open();
    // iframe.contentDocument.write(html);
    // iframe.contentDocument.close();

    // // 🔥 Give browser time to render
    // setTimeout(() => {
    //   iframe.contentWindow.focus();
    //   iframe.contentWindow.print();
    // }, 300);

    // // 🔥 Remove iframe AFTER print dialog opens
    // setTimeout(() => {
    //   document.body.removeChild(iframe);
    // }, 3000);


  }
  // const handleKOTPrint = async () => {
  //   try {
  //     const payload = {
  //       Pre_Book_Order_Id: Pre_Booked_Order_Id,
  //       items: summaryItems.map(it => ({
  //         Item_Name: it.Item_Name,
  //         Item_Quantity: it.Item_Quantity,
  //       })),
  //     };

  //     const res = await updateAndPrintPreBookKOT(payload);
  //     console.log("🟢 KOT Print Response:", res);

  //     if (!res?.data?.success) {
  //       toast.error(res?.data?.message || "Failed to send KOT to kitchen");
  //       return;
  //     }

  //     const kitchenMap = res?.data?.preBookedOrderItems;

  //     // ✅ PRINT ONLY IF THERE ARE ITEMS
  //     if (kitchenMap && Object.keys(kitchenMap).length > 0) {
  //       console.log("🖨️ Printing KOT for kitchens:", kitchenMap);
  //       printPreBookKOT(kitchenMap);
  //     } else {
  //       toast.info("No new items to send to kitchen");
  //       return;
  //     }

  //   } catch (err) {
  //     console.error("❌ KOT API Error:", err);
  //     toast.error("Failed to send KOT to kitchen");
  //   }
  // };
  const Sub_Total = watch("Sub_Total");
  const Customer_Name = watch("Customer_Name");
  const Customer_Phone = watch("Customer_Phone");
  const Address = watch("Address");
  const Booking_Date = watch("Booking_Date");
  const Booking_Hour = watch("Booking_hour");
  const Booking_Minute = watch("Booking_Minute");
  const Booking_Period = watch("Booking_Period");
  const Advance_Payment = watch("Advance_Payment");
  const Payment_Left = watch("Payment_Left");
  const Amount = watch("Amount");
  const handleKOTPrint = async () => {

    const bookingTime = toMySQLTime(Booking_Hour, Booking_Minute, Booking_Period);
    try {
      const payload = {
        Pre_Booked_Order_Id,
        Customer_Name,
        Customer_Phone,
        Address,
        Booking_Date,
        Booking_Time: bookingTime,
        Sub_Total,
        Amount,
        Advance_Payment,
        Payment_Left,

        items: summaryItems.map(it => ({
          Item_Name: it.Item_Name,
          Item_Quantity: it.Item_Quantity,
          Item_Price: it.Item_Price,
          Amount: it.Amount,
        })),
      };
      console.log(payload);
      const res = await updateAndPrintPreBookKOT(payload).unwrap();

      console.log("🟢 API Response:", res);

      const kitchenMap = res.preBookedOrderItems;

      // ✅ NOTHING NEW
      if (!kitchenMap || Object.keys(kitchenMap).length === 0) {
        toast.info("No new items to send to kitchen");
        return;
      }

      // ✅ PRINT KOT (DELTA ONLY)
      printPreBookKOT(kitchenMap);
      navigate("/staff/pre-book-order/all-pre-booked-orders");
      toast.success("KOT sent to kitchen");

    } catch (err) {
      console.error("❌ KOT Error:", err);
      toast.error(
        err?.data?.message || "Failed to print KOT"
      );
    }
  };

  return (
    <>




      {/* Main Content */}
      <div className="sb2-2-3" style={{ marginTop: "48px" }} >
        <div className="row" style={{ margin: "0px" }}>
          <div className="col-md-12">
            <div style={{ padding: "20px", marginBottom: "20px" }}
              className="box-inn-sp">

              <div className="inn-title w-full px-2 py-3">

                <div className="flex flex-col mt-10 
                                sm:flex-row justify-between items-start 
                                sm:items-center w-full sm:mt-0">

                  {/* LEFT HEADER */}
                  <div className="w-full flex justify-center items-center sm:w-auto">
                    <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                      Update Pre Book Order
                    </h4>
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
                      onClick={() => navigate("/staff/pre-book-order/all-pre-booked-orders")}
                      className="text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "black" }}
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/staff/pre-book-order/all-pre-booked-orders")}
                      className="text-white py-2 px-4 rounded"
                      style={{ backgroundColor: "#ff0000" }}
                    >
                      All Orders
                    </button>
                  </div>

                </div>
              </div>
              <div style={{ backgroundColor: "#f1f1f19d" }}
                className="

  p-2  heading-wrapper
">

                <div style={{ marginTop: "0px" }}
                  className="  gap-2 flex flex-col w-full
  p-2  gap-6 sm:w-full sm:grid grid-cols-5 sm:flex-row">

                  <div style={{ marginTop: "0px" }} className="input-field relative">
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


                  </div>

                  <div style={{ marginTop: "0px" }} className="input-field  ">
                    <span className="active">Customer Name</span>

                    <input
                      type="text"
                      id="Customer_Name"
                      placeholder="Customer Name"
                      value={watch("Customer_Name") || ""}
                      // value={watchedCustomerName || ""}
                      readOnly={isExistingCustomer}
                      className="w-full outline-none border-b-2 text-gray-900"
                      onChange={(e) => {
                        setValue("Customer_Name", e.target.value || null, {
                          shouldValidate: true,
                        });
                      }}
                    />


                  </div>
                  <div style={{ marginTop: "0px" }} className="input-field  ">
                    <span className="active">
                      Address
                    </span>


                    <textarea
                      type="text"
                      id="Address"
                      value={watch("Address") || ""}

                      //value={watchedCustomerAddress || ""} 
                      //readOnly={isExistingCustomer} 
                      className="w-full outline-none border-b-1 border-gray-400 text-gray-900"
                      style={{ outline: "none", resize: "none" }}
                      onChange={(e) => {
                        setValue("Address", e.target.value || "", {
                          shouldValidate: true,
                        });
                      }}
                    >
                    </textarea>



                  </div>
                  <div style={{ marginTop: "0px" }} className="input-field  ">
                    <span className="active">
                      Date<span className="text-red-500">*</span></span>

                    <input
                      type="date"
                      id="Booking_Date"
                      value={watch("Booking_Date") || ""}

                      //value={watchedCustomerAddress || ""} 
                      //readOnly={isExistingCustomer} 
                      className="w-full outline-none border-b-1 border-gray-400 text-gray-900"
                      style={{ outline: "none", resize: "none" }}
                      onChange={(e) => {
                        setValue("Booking_Date", e.target.value, {
                          shouldValidate: true,
                        });
                      }}
                      min={new Date().toISOString().split("T")[0]}

                    />


                  </div>

                  <div style={{ marginTop: "0px" }} className="input-field">
                    <span className="active">
                      Time <span className="text-red-500">*</span>
                    </span>

                    <div className="flex gap-2">
                      {/* HH */}
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        placeholder="HH"
                        value={watch("Booking_Hour") || ""}
                        className="w-1/3 border-b outline-none"

                        onInput={(e) => {
                          let value = e.target.value.replace(/\D/g, "").slice(0, 2);

                          if (value === "") {
                            setValue("Booking_Hour", "", { shouldValidate: true });
                            return;
                          }

                          const num = Number(value);

                          // 🔒 block > 12
                          if (num > 12) {
                            value = "12";
                          }

                          // allow 0 / 00 / 5 / 05 while typing
                          setValue("Booking_Hour", value, { shouldValidate: true });
                        }}

                        onBlur={() => {
                          let value = watch("Booking_Hour");

                          if (!value) return;

                          // 🔥 0 or 00 → 12
                          if (value === "0" || value === "00") {
                            setValue("Booking_Hour", "12", { shouldValidate: true });
                            return;
                          }

                          // 🔥 pad single digit
                          if (value.length === 1) {
                            setValue("Booking_Hour", value.padStart(2, "0"), {
                              shouldValidate: true,
                            });
                          }
                        }}
                      />


                      {/* MM */}
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        placeholder="MM"
                        value={watch("Booking_Minute") || ""}
                        className="w-1/3 border-b outline-none"

                        onInput={(e) => {
                          let value = e.target.value.replace(/\D/g, "").slice(0, 2);

                          if (value === "") {
                            setValue("Booking_Minute", "", { shouldValidate: true });
                            return;
                          }

                          let num = Number(value);

                          // 🔒 block > 59
                          if (num > 59) {
                            value = "59";
                          }

                          // allow 0 / 00 / 5 / 05 while typing
                          setValue("Booking_Minute", value, { shouldValidate: true });
                        }}

                        onBlur={() => {
                          let value = watch("Booking_Minute");

                          if (!value) return;

                          // 🔥 0 → 00
                          if (value === "0") {
                            setValue("Booking_Minute", "00", { shouldValidate: true });
                            return;
                          }

                          // 🔥 pad single digit (5 → 05)
                          if (value.length === 1) {
                            setValue("Booking_Minute", value.padStart(2, "0"), {
                              shouldValidate: true,
                            });
                          }
                        }}
                      />




                      {/* AM / PM */}
                      <select
                        className="w-1/3 border-b outline-none"
                        value={watch("Booking_Period")}
                        onChange={(e) =>
                          setValue("Booking_Period", e.target.value, {
                            shouldValidate: true,
                          })
                        }
                      >

                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>


                </div>




              </div>





            </div>
            <div style={{ padding: "0", backgroundColor: "#f1f1f19d" }}
              className="tab-inn">
              <form onSubmit={handleSubmit(onSubmit)}>


                <div className="w-full mt-2 mb-2">
                  {/* ⭐ SELECTED TABLES — Centered on large screens, stacked on mobile */}



                  {/* <div className="flex flex-col lg:flex-row gap-2">
                        {selectedTables?.length > 0 ? (
                          <>
                            
                            <div className="flex flex-col gap-2   justify-center items-center lg:hidden">
                              {selectedTables.map((name, idx) => (
                                <div
                                  key={idx}
                                  className="px-4 py-3 bg-blue-200 text-blue-900 rounded-lg text-base font-semibold text-center shadow-md"
                                >
                                  {name}
                                </div>
                              ))}
                            </div>

                            <div className="hidden lg:flex lg:flex-wrap lg:gap-3 lg:justify-center">
                              {selectedTables.map((name, idx) => (
                                <div
                                  key={idx}
                                  className="px-4 py-3 bg-blue-200 text-blue-900 rounded-lg text-base font-semibold shadow-md"
                                >
                                  {name}
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-500 text-center w-full py-4">No tables selected</p>
                        )}
                      </div> */}
                  <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-3">
                    <div ref={tableRef} className="relative">
                      <div
                        className="flex border rounded-md bg-white cursor-pointer h-[3rem]"
                        onClick={() => setOpen(prev => !prev)}
                      >
                        <input
                          type="text"
                          placeholder="Search tables..."
                          value={tableSearch}
                          onChange={(e) => {
                            setTableSearch(e.target.value);
                            setOpen(true);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpen(true);
                          }}
                          className="w-full outline-none px-2"
                        />
                        <span className="absolute right-0 px-3 top-1/3">▼</span>
                      </div>

                      {open && (
                        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-48 overflow-y-auto">
                          {tables?.tables
                            ?.filter(t =>
                              t.Table_Name.toLowerCase().includes(tableSearch.toLowerCase())
                            )
                            .map(table => {
                              const isSelected = selectedTables.includes(table.Table_Name);
                              //const isAvailable = table.Status === "available";

                              return (
                                <div
                                  key={table.Table_Id}
                                  onClick={() => {
                                    // if (!isAvailable) return;

                                    const updated = isSelected
                                      ? selectedTables.filter(t => t !== table.Table_Name)
                                      : [...selectedTables, table.Table_Name];

                                    setValue("Table_Names", updated, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    });
                                  }}
                                  className={`px-3 py-2 flex justify-between
                
                ${isSelected ? "bg-blue-100" : ""}`}
                                >
                                  <span className="text-gray-500" >
                                    {table.Table_Name}
                                  </span>

                                  {isSelected && <span className="text-blue-600">✔</span>}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 ">
                      {selectedTables.length > 0 ? (
                        selectedTables.map(name => (
                          <div
                            key={name}
                            className="px-3 py-1 bg-blue-200 text-blue-900 rounded-md text-sm flex items-center gap-2"

                          >
                            {name}
                            <button
                              className="text-red-600 font-bold"
                              onClick={() => {
                                const updated = selectedTables.filter((t) => t !== name);
                                // setSelectedTables(updated);
                                setValue("Table_Names", updated);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 flex w-full
                        items-center justify-center">No tables selected</p>
                      )}
                    </div>

                    {/* <div className="hidden sm:block"></div> */}
                    {/* <div className="hidden sm:block"></div> */}
                    <div className=" w-full ">
                      <input
                        type="text"
                        placeholder="Search ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full "
                      />
                    </div>
                  </div>

                  {/* ⭐ KITCHEN ITEMS GRID */}
                  {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                      {kotNotifications?.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center col-span-full py-8">
                          No active kitchen updates
                        </p>
                      ) : (
                        kotNotifications.map((n, i) => (
                          <div
                            key={i}
                            className="bg-white shadow-md hover:shadow-lg 
              rounded-lg p-2 flex flex-col gap-3 text-sm transition-all
               duration-300 border border-gray-100"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-semibold text-gray-800 text-base leading-tight flex-1">
                                {n?.itemName} X{n?.quantity}
                              </span>

                              {/* <span
                                className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${n.status === "ready"
                                    ? "bg-green-100 text-green-700 border border-green-300"
                                    : n.status === "preparing"
                                      ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                      : "bg-gray-100 text-gray-500 border border-gray-300"
                                  }`}
                              >
                                {n?.status}
                              </span>
                              <span className="text-xs px-3 py-1 text-gray-500">
                                {formatTime(n?.time)}
                              </span> 

                            </div>
                          </div>
                        ))
                      )}
                    </div> */}
                </div>

                <div
                  style={{ backgroundColor: "#f1f1f19d" }} className=" mx-auto px-2 py-2">
                  <div className="sm:hidden px-2 relative">
                    {/* <div
    onClick={() => setCategoryOpen(!categoryOpen)}
    className="w-full px-4 py-2  border text-sm flex justify-between items-center"
  >
    {activeCategory}
    <span>▼</span>
  </div> */}
                    <div>
                      <span style={{ color: "#ff0000" }}
                        className="active">Category</span>
                      <input
                        type="text"
                        id="Category"
                        value={categorySearch}
                        style={{ outline: "none" }}
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

                  {/* Desktop */}
                  <div className="hidden sm:flex flex-wrap gap-2">
                    {newCategories.map((cat, index) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2 rounded-full transition ${activeCategory === cat
                            ? "bg-[#ff0000] text-white"
                            : "bg-white border"
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>


                <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">




                  {/* Food Items Grid */}
                  <div className=" mx-auto px-2 py-4">
                    <div className="grid grid-cols-1 mb-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                      {(isMenuItemsLoading || isFetching) ? (
                        [...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse"
                          >
                            <div className="h-32 bg-gray-200" />
                            <div className="p-2 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4" />
                              <div className="h-3 bg-gray-200 rounded w-1/2" />
                              <div className="h-8 bg-gray-200 rounded" />
                            </div>
                          </div>
                        ))
                      ) :
                        filteredItems?.length > 0 ? (filteredItems?.map((item, index) => {

                          const unavailable = item.is_available === 0; //  unavailable items

                          // const minQty = minQuantityOfItems.get(item.Item_Id) || 0;
                          // const currentQty = Number(cart[item.Item_Id] || 0);

                          // const disableMinus =
                          //   unavailable || currentQty <= minQty;

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

                                {/* <img
                                loading="lazy"
                                  src={
                                    item?.Item_Image
                                      ? `http://localhost:4000/uploads/food-item/${item?.Item_Image}`
                                      : ""
                                  }
                                  alt={item?.Item_Name}
                                  className="w-full h-full object-cover opacity-90"
                                /> */}
                                {item?.Item_Image && (
                                  <img
                                    loading="lazy"
                                    src={`http://localhost:4000/uploads/food-item/${item.Item_Image}`}
                                    alt={item.Item_Name}
                                    className="w-full h-full object-cover opacity-90"
                                  />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                                <div className="absolute top-2 right-2">
                                  <span className="bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#ff0000] shadow">
                                    {item?.Item_Category}
                                  </span>
                                </div>

                                {/* <div className="absolute bottom-1 left-2 right-2">
                                                      <h4 className="text-white text-[20px] leading-tight">
                                                        {item?.Item_Name}
                                                      </h4>
                                                    </div> */}
                              </div>

                              {/* ===== DETAILS SECTION ===== */}
                              <div className="p-2">
                                <div className="flex  mb-2">
                                  <h5 style={{ color: "red" }}
                                    className="text-red text-[20px] leading-tight">
                                    {item?.Item_Name}
                                  </h5>
                                </div>

                                {/* PRICE ROW */}
                                <div className="flex justify-between items-center mb-2">
                                  <div>
                                    <div className="text-base font-semibold text-gray-800">
                                      ₹{parseFloat(item?.Item_Price).toFixed(2)}
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                      Tax: {TAX_RATES[item?.Tax_Type]}%
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <div className="text-sm font-bold text-[#ff0000]">
                                      ₹{parseFloat(item?.Amount).toFixed(2)}
                                    </div>
                                    <div className="text-[10px] text-gray-500">Total</div>
                                  </div>
                                </div>

                                {/* ===== CART CONTROLS ===== */}
                                <div className="flex items-center justify-between bg-[#4CA1AF10] rounded-md p-1.5">

                                  {/* MINUS BUTTON */}
                                  <button
                                    type="button"
                                    disabled={unavailable || cart[item.Item_Id] === 0}
                                    onClick={() =>
                                      !unavailable &&
                                      updateCart(item.Item_Id, -1, index, item?.Item_Name, item?.Item_Price)
                                      // updateCart(item.Item_Id, -1, index, item?.Item_Name, item?.Amount)
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
                                                          
                                                 disabled={disableMinus||unavailable || Number(cart[item.Item_Id] || 0) === 0}
                                                  onClick={() =>
                                                                    !disableMinus &&
                                                    updateCart(item.Item_Id, -1, index, item?.Item_Name, item?.Amount)
                                                              }
          
                                                        
                                                         className={`
      w-7 h-7 flex items-center justify-center rounded-md shadow transition
      ${disableMinus
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-white hover:bg-gray-100 text-[#ff0000]"
      }
    `}
                                                        
                                                      >
                                                        <Minus className="w-3 h-3" />
                                                      </button> */}

                                  {/* QUANTITY DISPLAY */}
                                  <span className="text-base font-semibold text-gray-800 px-2">
                                    {cart[item.Item_Id] || 0}
                                  </span>

                                  {/* PLUS BUTTON */}
                                  <button
                                    style={{ backgroundColor: "#ff0000" }}
                                    type="button"
                                    disabled={unavailable}
                                    onClick={() =>
                                      !unavailable &&
                                      updateCart(item?.Item_Id, 1, index, item?.Item_Name, item?.Item_Price)
                                      // updateCart(item?.Item_Id, 1, index, item?.Item_Name, item?.Amount)
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
                        })) : (
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
                    {/* <div className="flex justify-center 
                                                   items-center flex-col gap-6  w-full sm:flex-row sm:gap-12"> */}

                    <div className="grid grid-cols-2 sm:grid-cols-3  items-center gap-2">
                      {/* <div className="grid grid-cols-3"> */}


                      {/* SAVE & HOLD */}
                      <button
                        type="button"
                        disabled={isUpdateOrderLoading}
                        onClick={() => setShowSummary(true)}   // open bottom sheet
                        // disabled={formValues.errorCount > 0 || isAddingOrder}
                        className="relative w-full py-2 px-4 whitespace-nowrap md:w-auto 
                                                      flex items-center justify-center gap-3 
                                                      
                                                            text-white font-bold  rounded shadow sm:py-3 sm:x-6"
                        style={{ backgroundColor: "black" }}
                      >
                        {isUpdateOrderLoading ? "Saving..." : "Save & Hold"}
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

                      <button
                        type="button"
                        disabled={summaryItems.length === 0 || isUpdateOrderLoading}
                        onClick={() => setPreBookBillModalOpen(true)}
                        className="relative w-full whitespace-nowrap py-2 px-4 md:w-auto 
                                                      flex items-center justify-center gap-3 
                                                      
                                                            text-white font-bold  rounded shadow sm:py-4 sm:px-6"
                        style={{ backgroundColor: "#ff0000" }}
                      >
                        Save & Pay Bill
                      </button>
                      <button
                        type="button"
                        disabled={summaryItems.length === 0 || isUpdateAndPrintPreBookKOTLoading}
                        onClick={() => handleKOTPrint()}
                        className="relative w-full whitespace-nowrap py-2 px-4 md:w-auto 
                                                      flex items-center justify-center gap-3 
                                                      
                                                            text-white font-bold  rounded shadow sm:py-4 sm:px-6"
                        style={{ backgroundColor: "#ffa600" }}
                      >
                        Print KOT
                      </button>


                    </div>
                  </div>
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

                  >
                    {/* HANDLE BAR */}
                    <div className="w-full flex justify-center py-2">
                      <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                    </div>

                    <div className="px-4 pb-3 border-b">
                      <div className="flex justify-between items-center">
                        <div className="flex justify-center items-center mx-auto">
                          <h2 className="text-lg font-bold text-gray-700">Bill Summary</h2>
                        </div>
                        <div className="flex justify-enditems-center gap-2">
                          <button type="button" style={{ backgroundColor: "transparent" }}
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
                      <div className="border-b pb-2 mb-2"></div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="hidden sm:block"></div>
                        <div className="hidden sm:block"></div>
                        <div style={{ marginTop: "0px" }} className="flex gap-4  justify-center items-center">

                          <span className="active whitespace-nowrap">Advance payment</span>

                          {/* <input
                                                                type="number"
                                                                id="Advance_Payment"

                                                                value={watch("Advance_Payment") || 0}
                                                                min={preBookedOrderDetails?.Advance_Payment || 0}
                                                                //value={watchedCustomerAddress || ""} 
                                                                //readOnly={isExistingCustomer} 
                                                                className="w-full outline-none border-b-1 
                                                            border-gray-400 text-gray-900"
                                                                style={{ outline: "none", resize: "none", marginBottom: "0px" }}
                                                                onChange={(e)=>{
                                                                    const advancePayment = parseFloat(e.target.value) || 0;
                                                                    setValue("Advance_Payment", advancePayment, {
                                                                        shouldValidate: true,
                                                                    });
                                                                }}
                                                            /> */}
                          <input
                            type="number"
                            id="Advance_Payment"
                            value={watch("Advance_Payment") ?? ""}
                            min={preBookedOrderDetails?.order?.Advance_Payment ?? 0}
                            className="w-full outline-none border-b border-gray-400 text-gray-900"
                            onChange={(e) => {
                              const value = e.target.value;

                              // allow empty while editing
                              if (value === "") {
                                setValue("Advance_Payment", "", { shouldValidate: false });
                                return;
                              }

                              setValue("Advance_Payment", Number(value), { shouldValidate: false });
                            }}
                            onBlur={() => {
                              const minAdvance = preBookedOrderDetails?.order?.Advance_Payment ?? 0;
                              const current = Number(watch("Advance_Payment")) || 0;

                              // 🔒 HARD RULE APPLIED ONLY HERE
                              if (current < minAdvance) {
                                setValue("Advance_Payment", minAdvance, {
                                  shouldValidate: true,
                                });
                              }
                            }}
                          />




                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="hidden sm:block"></div>
                        <div className="hidden sm:block"></div>
                        {/* <div style={{ marginTop: "0px" }} className="flex gap-4  justify-center items-center">

                                                            <span className="active whitespace-nowrap">
                                                              {paymentLeft>0?"Payment Left":" Extra Paid"}
                                                              </span>

                                                            <input
                                                                type="number"
                                                                readOnly
                                                                id="Payment_Left"
                                                                value={(watch("Payment_Left") )}
                                                                //value={parseFloat(watch("Sub_Total") || 0) - parseFloat(watch("Advance_Payment") || 0)}

                                                                //value={watchedCustomerAddress || ""} 
                                                                //readOnly={isExistingCustomer} 
                                                                className="w-full outline-none border-b-1 
                                                            border-gray-400 text-gray-900"
                                                                style={{
                                                                    outline: "none", resize: "none",
                                                                    marginBottom: "0px"
                                                                }}

                                                            />

                                                            {/* {errors?.Payment_Left && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {errors.Advance_Payment.message}
                                                            </p>
                                                        )} 
                                                        </div> */}
                        <div style={{ marginTop: "0px" }} className="flex gap-4 justify-center items-center">
                          <span className="active whitespace-nowrap">
                            {paymentLeft < 0 ? "Extra Paid" : "Payment Left"}
                          </span>

                          <input
                            type="number"
                            readOnly
                            id="Payment_Left"
                            value={
                              paymentLeft < 0
                                ? Math.abs(paymentLeft).toFixed(2)
                                : paymentLeft.toFixed(2)
                            }
                            className="w-full outline-none border-b border-gray-400 text-gray-900"
                            style={{ outline: "none", marginBottom: "0px" }}
                          />
                        </div>

                      </div>
                      <div
                        className="flex justify-center mt-4">
                        <button style={{ backgroundColor: "#ff0000" }}
                          type="submit"
                          className="w-16 h-10 flex items-center justify-center bg-[#ff0000] 
                                                          rounded-md text-white shadow hover:bg-[#3a8c98] ">
                          {isUpdateOrderLoading ? "Saving..." : "OK"}
                        </button>

                      </div>
                    </div>
                  </div>
                  {/* </div>
                                            </div> */}


                </div>






              </form>
              {preBookBillModalOpen &&
                <PreBookBillModal
                  onClose={() => setPreBookBillModalOpen(false)}
                  orderDetails={formValues}
                  setOpen={setPreBookBillModalOpen}
                  Pre_Book_Order_Id={Pre_Booked_Order_Id}
                  selectedTables={selectedTables}

                />}
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

};