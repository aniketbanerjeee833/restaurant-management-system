
import { foodItemApi, useGetAllFoodItemsQuery } from "../../../redux/api/foodItemApi";



import { useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";

import { useFieldArray, useForm } from "react-hook-form";

import { io } from "socket.io-client";

import { useRef } from "react";
import { useEffect } from "react";

import { toast } from "react-toastify";



import { LayoutDashboard, Minus, Plus, ShoppingCart, Table } from "lucide-react";
import { orderApi, useGetTableOrderDetailsQuery, useUpdateOrderMutation } from "../../../redux/api/Staff/orderApi";


import { useDispatch } from "react-redux";
import { kitchenStaffApi } from "../../../redux/api/KitchenStaff/kitchenStaffApi";
import { useMemo } from "react";
import { useGetAllCategoriesQuery } from "../../../redux/api/itemApi";
import { waiterApi } from "../../../redux/Waiter/waiterApi";


const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});





export default function TableOrderDetails() {
  // const formatTime = (time) => {
  //   if (!time) return "--";
  //   const d = new Date(time);
  //   d.setSeconds(0);
  //   return d.toLocaleTimeString([], {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };

  const { Order_Id } = useParams();
  const dispatch = useDispatch();
 
  //console.log(Order_Id);
  const { data: tableOrderDetails } = useGetTableOrderDetailsQuery(Order_Id);
  //console.log(tableOrderDetails, "tableOrderDetails");
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
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);
  //const categoryRefs = useRef([]); // store refs for category dropdowns
  //const itemRefs = useRef([]);     // store refs for item dropdowns
  // const [activeCategory, setActiveCategory] = useState('All');
  // const lastCategoryRef = useRef(activeCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();


  const [selectedTables, setSelectedTables] = useState([]);

  //const [categoryOpen, setCategoryOpen] = useState(false);
  // const [categorySearch, setCategorySearch] = useState("");
  // const dropdownRef = useRef(null);
  //const categoryOpenRef = useRef(null);
  // Close on outside click
  // useEffect(() => {
  //   const handleClickOutside = (e) => {
  //     if (categoryOpenRef.current && !categoryOpenRef.current.contains(e.target)) {
  //       setCategoryOpen(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);
  const { data: menuItems,  isLoading: isMenuItemsLoading,
    isFetching
  } = useGetAllFoodItemsQuery({});
  //console.log(tables, isLoading, "tables", menuItems, isMenuItemsLoading);
  const items = menuItems?.foodItems
  const [updateOrder, { isLoading: isUpdateOrderLoading }] = useUpdateOrderMutation();
  //const lastUpdatedItemRef = useRef(null);

  // const [rows, setRows] = useState([
  //   {
  //     CategoryOpen: false, categorySearch: "", preview: null
  //   }
  // ]);
  const [cart, setCart] = useState({});

  const { data: categories } = useGetAllCategoriesQuery()
  console.log(categories, "categories");

  const existingCategories = [...new Set(categories?.map(c => c.Item_Category))];
  const newCategories = ["All", ...existingCategories];

  const [activeCategory, setActiveCategory] = useState('All');
  const lastCategoryRef = useRef(activeCategory);

  const [kotNotifications, setKotNotifications] = useState([]);
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



  // Join the Socket.IO room for this order
  useEffect(() => {
    if (!tableOrderDetails?.KOT_Id) return;

    const room = `order_${tableOrderDetails.KOT_Id}`;

    console.log("Joining room:", room);
    socket.emit("join_order_room", tableOrderDetails.KOT_Id);

    return () => {
      console.log("Leaving room:", room);
      socket.emit("leave_order_room", tableOrderDetails.KOT_Id);
    };
  }, [tableOrderDetails?.KOT_Id]);

  useEffect(() => {
    if (!tableOrderDetails?.kitchenItems) return;

    // full reset when refreshing page
    const fresh = tableOrderDetails.kitchenItems.map(it => ({
      KOT_Id: tableOrderDetails.KOT_Id,
      KOT_Item_Id: it.KOT_Item_Id,
      itemName: it.Item_Name,
      status: it.Item_Status,
      time: it.updated_at,
      quantity: it.Quantity,
      // time: null,
    }));

    setKotNotifications(fresh);

  }, [tableOrderDetails]);

  useEffect(() => {
    const handleKotUpdate = (data) => {

      console.log("📢 Frontend received KOT update:", data);
      toast.info(`${data.itemName} → ${data.status}`);

      // setKotNotifications((prev) => {
      //   const index = prev.findIndex(n => n.KOT_Item_Id === data.KOT_Item_Id);
      setKotNotifications((prev) => {
        const index = prev.findIndex(
          (n) => String(n.KOT_Item_Id) === String(data.KOT_Item_Id)
        );

        // 🟢 1. If item already exists → update status/time
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            status: data.status,
            time: data.updated_at, // ✅ FIXED

            // time: data.time,
          };
          return updated;
        }

        // 🟢 2. If the row is NEW (e.g., new biriyani added), append it
        return [
          ...prev,
          {
            KOT_Id: data.KOT_Id,
            KOT_Item_Id: data.KOT_Item_Id,
            itemName: data.itemName,
            status: data.status,
            time: data.updated_at,

            // time: data.time,
          }
        ];
      });
    };
    dispatch(orderApi.util.invalidateTags(["Order"]));

    socket.on("frontend_kot_update", handleKotUpdate);

    return () => {
      socket.off("frontend_kot_update", handleKotUpdate);
    };
  }, []);

  // console.log(kotNotifications,"kotNotifications");
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
      Amount: "0.00",
      Sub_Total: "0.00",
      items: []   // No pre-created empty row
    }
  });


  const [showSummary, setShowSummary] = useState(false);




  useEffect(() => {
    if (!tableOrderDetails) return;

    const prefilledItems = tableOrderDetails?.orderItems?.map((item) => ({
      Item_Name: item?.Item_Name,
      Item_Price: item?.Price,
      Item_Quantity: item?.Quantity,
      Amount: item?.Amount,
      id: item?.Item_Id   // ✅ USE Item_Id
    }));

    setSelectedTables(tableOrderDetails?.tables.map((t) => t));

    reset({
      items: prefilledItems,
      customerDetails: tableOrderDetails?.customer,
      Sub_Total: tableOrderDetails?.order?.Sub_Total,
      Amount: tableOrderDetails?.order?.Amount,
      Table_Names: tableOrderDetails?.tables?.map((t) => t),
    });

    // 🔥 Build mapping: Item_Id → rowIndex
    const map = {};
    tableOrderDetails?.orderItems.forEach((it, idx) => {
      map[it.Item_Id] = idx;   // ✅ FIXED
    });
    itemRowMap.current = map;

    // 🔥 Also sync cart quantities with Item_Id
    const initialCart = {};
    tableOrderDetails?.orderItems.forEach((it) => {
      initialCart[it.Item_Id] = it.Quantity;  // ✅ FIXED
    });
    setCart(initialCart);

  }, [tableOrderDetails, reset]);



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

  // const minQuantityOfItems=tableOrderDetails?.kitchenItems?.reduce((acc, item) => {
  //     acc[item.Item_Id] = item.Quantity;
  //     return acc;
  // })
  const minQuantityOfItems = new Map();

  tableOrderDetails?.kitchenItems?.forEach((item) => {
    if (!minQuantityOfItems.has(item.Item_Id))
      minQuantityOfItems.set(item.Item_Id, item.Quantity);
    else {
      minQuantityOfItems.set(item.Item_Id, minQuantityOfItems.get(item.Item_Id) + item.Quantity);
    }
  })

  // const minQty = minQuantityOfItems.get(Item_Id) || 0;
  // const currentQty = Number(cart[Item_Id] || 0);
  // const disableMinus =
  //   unavailable || currentQty <= minQty;

  // console.log(minQuantityOfItems, "minQuantityOfItems")
  // const updateCart = (itemId, delta, index, itemName, itemAmount) => {
  //   const amount = parseFloat(itemAmount || 0);

  //   setCart(prev => {
  //     const newQty = Math.max(0, (prev[itemId] || 0) + delta);

  //     // Does this menu item already exist inside RHF form?
  //     let rowIndex = itemRowMap.current[itemId];

  //     // ⭐ NEW menu item → create a new row
  //     if (rowIndex === undefined) {
  //       rowIndex = fields.length;
  //       itemRowMap.current[itemId] = rowIndex;

  //       append({
  //         Item_Name: itemName,
  //         Item_Price: amount,
  //         Item_Quantity: newQty,
  //         Amount: (amount * newQty).toFixed(2),
  //         id: itemId
  //       });
  //     }

  //     // ⭐ Update existing row
  //     setValue(`items.${rowIndex}.Item_Name`, itemName);
  //     setValue(`items.${rowIndex}.Item_Price`, amount);
  //     setValue(`items.${rowIndex}.Item_Quantity`, newQty);
  //     setValue(`items.${rowIndex}.Amount`, (amount * newQty).toFixed(2));

  //     // Recalculate totals
  //     setTimeout(updateTotals, 0);

  //     return { ...prev, [itemId]: newQty };
  //   });
  // };
  // const updateCart = (itemId, delta, index, itemName, itemAmount) => {
  //   const price = Number(itemAmount || 0);

  //   setCart((prev) => {
  //     const currentQty = Number(prev[itemId] || 0);
  //     const newQty = currentQty + delta;

  //     const rowIndex = itemRowMap.current[itemId];

  //     // ❌ REMOVE ITEM COMPLETELY WHEN QTY = 0
  //     if (newQty <= 0) {
  //       if (rowIndex !== undefined) {
  //         remove(rowIndex); // 🔥 remove from RHF form
  //         delete itemRowMap.current[itemId]; // 🔥 clean mapping
  //       }

  //       const updatedCart = { ...prev };
  //       delete updatedCart[itemId]; // 🔥 remove from cart

  //       setTimeout(updateTotals, 0);
  //       return updatedCart;
  //     }

  //     // ✅ ADD NEW ROW IF NOT EXISTS
  //     let finalRowIndex = rowIndex;
  //     if (finalRowIndex === undefined) {
  //       finalRowIndex = fields.length;
  //       itemRowMap.current[itemId] = finalRowIndex;

  //       append({
  //         Item_Name: itemName,
  //         Item_Price: price,
  //         Item_Quantity: newQty,
  //         Amount: (price * newQty).toFixed(2),
  //         id: itemId,
  //       });
  //     } else {
  //       // ✅ UPDATE EXISTING ROW
  //       setValue(`items.${finalRowIndex}.Item_Quantity`, newQty);
  //       setValue(
  //         `items.${finalRowIndex}.Amount`,
  //         (price * newQty).toFixed(2)
  //       );
  //     }

  //     setTimeout(updateTotals, 0);

  //     return { ...prev, [itemId]: newQty };
  //   });
  // };

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
    //lastCategoryRef.current = activeCategory;
    return filtered;
    // // 2️⃣ SPLIT: cart vs non-cart (preserve order)
    // const addedItems = [];
    // const newItems = [];

    // filtered.forEach((item) => {
    //   if (cart?.[item.Item_Id]) {
    //     addedItems.push(item);
    //   } else {
    //     newItems.push(item);
    //   }
    // });

    // // 3️⃣ MOST RECENT UPDATE → move to top of its group ONLY
    // const lastId = lastUpdatedItemRef.current;

    // if (lastId) {
    //   const idx = addedItems.findIndex(
    //     (item) => item.Item_Id === lastId
    //   );

    //   if (idx > 0) {
    //     const [recent] = addedItems.splice(idx, 1);
    //     addedItems.unshift(recent);
    //   }
    // }

    // // 4️⃣ MERGE: cart items first, then others
    // return [...addedItems, ...newItems];
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
  }, [filteredItems, activeCategory]);
  //console.log(filteredItems,"filteredItems",cart)
  const summaryItems = watch("items") || [];

  const formValues = watch();
  //const itemsValues = watch("items");   // watch all item rows
  //const totalPaid = watch("Total_Paid"); // watch Total_Paid
  // const num = (v) => (v === undefined || v === null || v === "" ? 0 : Number(v));
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
  // const finalAmount = Number((subTotal - discountAmount).toFixed(2));

  useEffect(() => {
    updateTotals();
  }, [watch("items")]);
  console.log(selectedTables, "selectedTables")

 const onSubmit = async (data) => {
    console.log("Form Data:", data);

    if (data.Table_Names.length === 0) {
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
      toast.error("Please add at least one valid item with a name.");
      return;
    }

    // Check duplicate item names
    //const seen = new Set();
    // for (const item of cleanedItems) {
    //     const name = item.Item_Name.trim().toLowerCase();
    //     if (seen.has(name)) {
    //         toast.error(`Duplicate item: ${item.Item_Name}`);
    //         return;
    //     }
    //     seen.add(name);
    // }

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
      // Or from redux/auth context
      Table_Names: data.Table_Names || [], // Array of table names from multi-select
      Tax_Type: data.Tax_Type || "None",
      Tax_Amount: data.Tax_Amount || "0.00",
      Sub_Total: data.Sub_Total || "0.00",
      Amount: data.Amount || "0.00",
      items: itemsSafe,
    };

    console.log("📦 Final JSON to send:", payload);

    try {
      const res = await updateOrder({ Order_Id, payload }).unwrap();
      console.log("✅ Order update response:", res);
      if (!res?.success) {
        toast.error(res.message || "Failed to update order.");
        return;
      }
if (res?.elligibleItems && res?.elligibleItems &&   Object.keys(res.elligibleItems).length > 0) {
  // printKOTInvoice(res.elligibleItems);
  console.log(res.elligibleItems,"res.elligibleItems");
  // dispatch(setWaiterOrdersToBePrinted(res.elligibleItems));
}

      toast.success("Order updated Successfully!");
      dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
      dispatch(waiterApi.util.invalidateTags(["waiter"]));
      //dispatch(tableApi.util.invalidateTags(["Table"]));
      navigate("/waiter/orders/all-orders");

    } catch (error) {
      console.error("❌ Order update Error:", error);
      toast.error(error?.data?.message ?? "Failed to update order.");
    }
  };

  //   const handleConfirmBillAndGenerateInvoice = async (data) => {
  //     try {
  //       const payload = {
  //         Customer_Name: data?.Customer_Name,
  //         Customer_Phone: data?.Customer_Phone,
  //         Discount: data?.Discount,
  //         Discount_Type: data?.Discount_Type ?? "amount",
  //         Service_Charge: data.Service_Charge,
  //         Payment_Type: data?.Payment_Type,
  //         Final_Amount: data?.Final_Amount,
  //       };

  //       // 🔥 API CALL
  //       const response = await confirmBillAndInvoiceGenerated({
  //         // orderId,
  //         payload
  //       }).unwrap();

  //       toast.success("Invoice Generated & Bill Paid!");
  //       console.log(response, "response");
  //       //     setInvoiceDetails(prev => ({
  //       //   ...prev,
  //       //   Invoice_Number: response.Invoice_Id, // 🔥 map backend Invoice_Id
  //       // }));
  //       // const invoiceId = response.Invoice_Id;
  //       //  setInvoiceNumber(invoiceId);
  // printInvoiceWindow(
  //   response.Invoice_Id,        // invoiceId
  //   response.invoiceDetails,    // invoiceDetails
  //   response.items,             // items (array)
  //   response.Table_Names        // Table_Names (array)
  // );

  //       // RESPONSE MUST INCLUDE invoice number
  //       //const newInvoiceNumber = response.invoiceNumber; 

  //       // 🔥 NOW PRINT THE INVOICE
  //       // printInvoiceWindow();

  //       // Refresh UI & close modal
  //       dispatch(tableApi.util.invalidateTags(["Table"]));
  //       dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
  //       dispatch(orderApi.util.invalidateTags(["Order"]));

  //       navigate("/staff/orders/all-orders");

  //     } catch (error) {
  //       console.error("❌ Error confirming bill and generating invoice:", error);
  //       toast.error(error?.data?.message || "Failed to generate invoice");
  //     }
  //   };

  //   const handleShareSMS = async (data) => {
  //     try {
  //       const payload = {
  //         Customer_Name: data?.Customer_Name,
  //         Customer_Phone: data?.Customer_Phone,
  //         Discount_Type: data?.Discount_Type,
  //         Discount: data?.Discount,
  //         Service_Charge: data?.Service_Charge,
  //         Payment_Type: data?.Payment_Type,
  //         Final_Amount: data?.Final_Amount,
  //       };
  //       console.log(payload, "payload");

  //       const response = await generateSms({
  //         // Order_Id: orderId,
  //         payload,
  //       }).unwrap();

  //       toast.success("📩 Bill sent via SMS successfully");
  //       console.log(response, "response");
  //       dispatch(tableApi.util.invalidateTags(["Table"]));
  //       dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));

  //       navigate("/staff/orders/all-orders");
  //     } catch (err) {
  //       console.error(err);
  //       toast.error(err?.data?.message || "Failed to send SMS");
  //     }
  //   };
  //   // console.log(customerDetails,"customerDetails");
  //   //  console.log(invoiceDetails,"invoiceDetails");

  //   const printInvoiceWindow = (invoiceId,invoiceDetails,items,Table_Names) => {
  //     const getCurrentDate = () =>
  //       new Date().toLocaleDateString("en-GB");

  //     const getCurrentTime = () =>
  //       new Date().toLocaleTimeString("en-US", {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //         hour12: true,
  //       });
  //     const total = invoiceDetails?.Final_Amount ?? 0;


  //     const html = `<!DOCTYPE html>
  // <html>
  // <head>
  //   <title>Invoice - ${invoiceDetails?.Invoice_Number ?? ""}</title>
  //   <meta charset="UTF-8">
  //   <style>
  //     * {
  //       margin: 0;
  //       padding: 0;
  //       box-sizing: border-box;
  //     }

  //     body {
  //       font-family: 'Courier New', Courier, monospace;
  //       font-size: 11px;
  //       line-height: 1.3;
  //       font-weight: 700;
  //       color: #000;
  //       width: 58mm;
  //       margin: 0;
  //       padding: 0;
  //       -webkit-print-color-adjust: exact;
  //       print-color-adjust: exact;
  //     }

  //     /* 🔥 SAFE PRINTABLE WIDTH */
  //     .invoice {
  //       width: 48mm;
  //       margin: 0 auto;
  //       padding: 2mm;
  //     }

  //     .header-center,
  //     .header-middle {
  //       text-align: center;
  //       margin-bottom: 6px;
  //       border-bottom: 1px dashed #000;
  //       padding-bottom: 6px;
  //     }

  //     .brand {
  //       font-size: 15px;
  //       font-weight: 800;
  //       letter-spacing: 1px;
  //     }

  //     .line {
  //       border-top: 1px dashed #000;
  //       margin: 5px 0;
  //     }

  //     .line-solid {
  //       border-top: 1px solid #000;
  //       margin: 5px 0;
  //     }

  //    .info-row.date-time {
  //   display: flex;
  //   justify-content: space-between;
  //   font-size: 9px;
  //   font-weight: 700;
  //   width: 100%;
  // }

  // .info-row.date-time span {
  //   white-space: nowrap;   /* 🔥 prevents wrapping */
  // }

  //     .info-label {
  //       font-weight: 800;
  //     }

  //     /* ITEMS */
  //     .items-header,
  //     .item-row {
  //       display: flex;
  //       justify-content: space-between;
  //       font-size: 10px;
  //       width: 100%;
  //     }

  //     .items-header {
  //       border-bottom: 1px solid #000;
  //       padding-bottom: 3px;
  //       font-weight: 800;
  //     }

  //     .item-row {
  //       border-bottom: 1px dashed #ccc;
  //       padding: 2px 0;
  //     }

  //     .col-no {
  //       width: 5mm;
  //     }

  //     .item-name {
  //       flex: 1;
  //       padding-right: 2mm;
  //       word-break: break-word;
  //     }

  //     .item-qty {
  //       width: 6mm;
  //       text-align: center;
  //     }

  //     .item-amount {
  //       width: 10mm;
  //       text-align: right;
  //     }

  //     /* SUMMARY */
  //     .summary {
  //       margin-top: 6px;
  //       font-size: 11px;
  //       width: 100%;
  //     }

  //     .summary-row {
  //       display: flex;
  //       justify-content: space-between;
  //       margin: 2px 0;
  //     }

  //     .summary-row.total {
  //       font-size: 13px;
  //       font-weight: 900;
  //       border-top: 1px solid #000;
  //       border-bottom: 2px solid #000;
  //       padding: 4px 0;
  //       margin-top: 4px;
  //     }

  //     .footer {
  //       text-align: center;
  //       margin-top: 8px;
  //       padding-top: 6px;
  //       border-top: 1px dashed #000;
  //       font-size: 10px;
  //       font-weight: 700;
  //     }

  //     @media print {
  //       @page {
  //         size: 58mm auto;
  //         margin: 0;
  //       }
  //     }
  //   </style>
  // </head>

  // <body>
  //   <div class="invoice">

  //     <div class="header-center">
  //       <div class="brand">HELLO GUYS</div>
  //       <div>Phone: +91 9903106989</div>
  //       <div>Mail: sparkhelloguys@gmail.com</div>
  //       <div style="font-size:9px">
  //         Address: 021D, Ho-Chi-Minh Sarani,
  //         Shakuntala Park, Kolkata 700061
  //       </div>
  //       <div>www.helloguys.co.in</div>
  //     </div>

  //     ${invoiceDetails?.Customer_Name ? `
  //     <div class="info-row">
  //       <span class="info-label">Customer:</span>
  //       <span>${invoiceDetails.Customer_Name}</span>
  //     </div>` : ``}

  //     ${invoiceDetails?.Customer_Phone ? `
  //     <div class="info-row">
  //       <span class="info-label">Phone:</span>
  //       <span>${invoiceDetails.Customer_Phone}</span>
  //     </div>` : ``}

  //     <div class="line"></div>

  // <div class="header-middle">
  //   <b>TABLE: ${
  //   Array.isArray(Table_Names) && Table_Names.length
  //     ? Table_Names.join(", ")
  //     : "-"
  // }</b>

  // </div>


  //  <div class="info-row date-time">
  //   <span><b>Date:</b> ${getCurrentDate()}</span>
  //   <span><b>Time:</b> ${getCurrentTime()}</span>
  // </div>


  //     <div class="info-row">
  //       <span><b>Invoice:</b> ${invoiceId || "-"}</span>
  //     </div>

  //     <div class="line-solid"></div>

  //     <div class="items-header">
  //       <div class="col-no">No</div>
  //       <div class="item-name">ITEM</div>
  //       <div class="item-qty">QTY</div>
  //       <div class="item-amount">AMT</div>
  //     </div>

  //     ${(items || []).map((it, i) => `
  //       <div class="item-row">
  //         <div class="col-no">${i + 1}</div>
  //         <div class="item-name">${it.Item_Name}</div>
  //         <div class="item-qty">${it.Item_Quantity}</div>
  //         <div class="item-amount">₹${Number(it.Amount).toFixed(2)}</div>
  //       </div>
  //     `).join("")}

  //     <div class="line-solid"></div>

  //     <div class="summary">
  //       <div class="summary-row">
  //         <span>Subtotal</span>
  //         <span>₹${Number(invoiceDetails?.Sub_Total).toFixed(2)}</span>
  //       </div>

  //       ${invoiceDetails?.Discount ? `
  //       <div class="summary-row">
  //         <span>Discount</span>
  //         <span>
  //           ${invoiceDetails.Discount_Type === "percentage"
  //           ? invoiceDetails.Discount + "%"
  //           : "₹" + invoiceDetails.Discount}
  //         </span>
  //       </div>` : ``}

  //       <div class="summary-row total">
  //         <span>TOTAL</span>
  //         <span>₹${Number(total).toFixed(2)}</span>
  //       </div>
  //     </div>

  //     <div class="footer">
  //       <b>THANK YOU!</b><br>
  //       Please Visit Again
  //     </div>

  //   </div>
  // </body>
  // </html>
  // `

  //     // 🔥 CREATE HIDDEN IFRAME

  //     const iframe = document.createElement("iframe");
  //     iframe.style.position = "fixed";
  //     iframe.style.right = "0";
  //     iframe.style.bottom = "0";
  //     iframe.style.width = "0";
  //     iframe.style.height = "0";
  //     iframe.style.border = "0";

  //     document.body.appendChild(iframe);

  //     const doc = iframe.contentWindow.document;
  //     doc.open();
  //     doc.write(html);
  //     doc.close();

  //     // ✅ THIS WAS MISSING
  //     iframe.onload = () => {
  //       iframe.contentWindow.focus();
  //       iframe.contentWindow.print();
  //     };

  //     // 🧹 CLEANUP AFTER PRINT
  //     setTimeout(() => {
  //       document.body.removeChild(iframe);
  //     }, 1000);

  //   };



  //console.log(summaryItems);
  console.log("Current form values:", formValues);
  //console.log("Form errors:", errors);

  console.log(summaryItems, "summaryItems");

  return (
    <>


  

      {/* Main Content */}
      <div className="sb2-2-3"  style={{marginTop:"40px"}}>
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
                      Update Order
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
                    {/* <button
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
                    </button> */}

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
              </div>
              <div style={{ padding: "0", backgroundColor: "#f1f1f19d" }}
                className="tab-inn">
                <form onSubmit={handleSubmit(onSubmit)}>


                  <div className="w-full mt-2 mb-2">
                    {/* ⭐ SELECTED TABLES — Centered on large screens, stacked on mobile */}
                    <div className=" grid
  grid-rows-2 grid-cols-1
  md:grid-rows-1 md:grid-cols-3
  p-2 mt-0 gap-2 w-full heading-wrapper
 mb-4">
                      <div className="flex flex-col lg:flex-row gap-2">
                        {selectedTables?.length > 0 ? (
                          <>
                            {/* Mobile: Stack vertically */}
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

                            {/* Large screens: Horizontal centered */}
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
                      </div>
                      <div className="sm:visible"></div>
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

                    {/* ⭐ KITCHEN ITEMS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
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
                              </span> */}

                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>


                  {/* ══════════════════════════════════════════════════════════
          MOBILE FAB BUTTONS — visible only on small screens
          Category drawer trigger (left) + Order summary (right)
      ══════════════════════════════════════════════════════════ */}
                  <div className="flex lg:hidden fixed bottom-4 left-0 right-0 z-40
       justify-between px-4 pointer-events-none">

                    {/* Category FAB */}
                    <button
                      type="button"
                      onClick={() => setShowCategoryDrawer(true)}
                      className="pointer-events-auto flex items-center gap-1 bg-white border border-gray-200 text-[#ff0000] font-bold px-4 py-2 rounded-full shadow-lg text-sm"
                    >
                      ☰ Categories
                    </button>

                    {/* Order FAB */}
                    <button
                      type="button"
                      onClick={() => setShowOrderDrawer(true)}
                      className="pointer-events-auto relative flex items-center gap-1 text-white font-bold px-4 py-2 rounded-full shadow-lg text-sm"
                      style={{ backgroundColor: "#ff0000" }}
                    >
                      🧾 Order
                      {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-white text-[#ff0000] text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow">
                          {totalItems}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* ══════════════════════════════════════════════════════════
          MOBILE — Category Side Drawer (slides from left)
      ══════════════════════════════════════════════════════════ */}
                  {showCategoryDrawer && (
                    <div className="lg:hidden fixed inset-0 z-50 flex mt-16 ">
                      {/* Backdrop */}
                      <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setShowCategoryDrawer(false)}
                      />
                      {/* Drawer */}
                      <div className="relative w-64 bg-white h-full flex flex-col shadow-2xl z-10">
                        <div className="px-4 py-3 bg-[#ff0000] flex justify-between items-center">
                          <h4 className="text-white font-bold text-sm uppercase tracking-wide">Categories</h4>
                          <button type="button"
                            onClick={() => setShowCategoryDrawer(false)} 
                            className="text-white text-xl font-bold">✖</button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
                          {newCategories.map((cat, index) => (
                            <button
                              type="button"
                              key={index}
                              onClick={() => { setActiveCategory(cat); setShowCategoryDrawer(false); }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === cat
                                  ? "bg-[#ff0000] text-white shadow-sm"
                                  : "bg-gray-50 hover:bg-red-50 text-gray-700 border border-gray-100"
                                }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ══════════════════════════════════════════════════════════
          MOBILE — Order Summary Bottom Drawer (slides from bottom)
      ══════════════════════════════════════════════════════════ */}
                  {showOrderDrawer && (
                    <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end ">
                      {/* Backdrop */}
                      <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setShowOrderDrawer(false)}
                      />
                      {/* Drawer */}
                      <div className="relative bg-white rounded-t-2xl shadow-2xl z-10 flex flex-col" 
                      style={{ maxHeight: "80vh" }}>
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                          <div className="w-10 h-1 bg-gray-300 rounded-full" />
                        </div>
                        {/* Header */}
                        <div className="px-4 py-3 bg-[#ff0000] flex justify-between items-center">
                          <h4 className="text-white font-bold text-sm uppercase tracking-wide">Order Summary</h4>
                          <div className="flex items-center gap-3">
                            <span className="relative">
                              <ShoppingCart size={20} className="text-white" />
                              {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-white text-[#ff0000] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                  {totalItems}
                                </span>
                              )}
                            </span>
                            <button type="button" onClick={() => setShowOrderDrawer(false)} className="text-white text-xl font-bold">✖</button>
                          </div>
                        </div>
                        {/* Scrollable items */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                          {summaryItems && summaryItems.length > 0 ? (
                            summaryItems.map((item, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                                <div className="flex justify-between items-start">
                                  <span className="font-semibold text-sm text-gray-800 flex-1 pr-2">
                                    {item?.Item_Name}</span>
                                  <span className="text-xs bg-red-100 text-[#ff0000] px-2 py-0.5 rounded-full font-medium whitespace-nowrap">x {item?.Item_Quantity}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>Amount</span>
                                  <span className="font-semibold text-gray-700">₹{item?.Amount}</span>
                                </div>
                                <div className="flex items-center justify-between bg-[#4CA1AF10] rounded-md p-1.5">
                                  <button
                                    type="button"
                                    disabled={Number(cart[item.id] || 0) === 0}
                                    onClick={() => updateCart(item.id, -1, index, item.Item_Name, item.Item_Price)}
                                    className={`w-7 h-7 flex items-center justify-center rounded-md shadow transition ${Number(cart[item.id] || 0) === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-[#ff0000]"}`}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-base font-semibold text-gray-800 px-2">
                                    {cart[item.id] || 0}</span>
                                  <button
                                    style={{ backgroundColor: "#ff0000" }}
                                    type="button"
                                    // disabled={unavailable}
                                    onClick={() => updateCart(item.id, 1, index,
                                      item.Item_Name, item.Item_Price)}
                                    className={`w-7 h-7 flex items-center 
                            justify-center rounded-md shadow transition
                             ${Number(cart[item.id] || 0) === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#ff0000] text-white hover:bg-[#3a8c98]"}`}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                              <ShoppingCart size={32} className="mb-2 opacity-30" />
                              <p className="text-sm">No items added yet</p>
                            </div>
                          )}
                        </div>
                        {/* Footer */}
                        <div className="border-t px-4 py-3 space-y-2 bg-white">
                          <div className="flex justify-between font-bold text-gray-900">
                            <span>Total</span>
                            <span className="text-[#ff0000] text-lg">₹{watch("Amount")}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => { setShowOrderDrawer(false); setShowSummary(true); }}
                              className="py-2.5 flex items-center justify-center gap-2 rounded-lg text-white font-bold shadow text-sm"
                              style={{ backgroundColor: "black" }}
                            >
                              {/* <ShoppingCart size={16} className="text-white" /> 
                  {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-white 
                text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow">
                  {totalItems}
                </span> */}
                              <span className="relative">
                                <ShoppingCart size={20} className="text-white" />
                                {totalItems > 0 && (
                                  <span className="absolute -top-2 -right-2 bg-white text-[#ff0000] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                    {totalItems}
                                  </span>
                                )}
                              </span>

                              {isUpdateOrderLoading ? "Saving..." : "Save & Hold"}
                              {/* Save &amp; Hold */}
                            </button>
                           
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ══════════════════════════════════════════════════════════
          DESKTOP — 3-column layout (sm and above)
      ══════════════════════════════════════════════════════════ */}
                  <div className="hidden lg:flex h-[calc(100vh-120px)] 
      overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50">

                    {/* LEFT — Categories */}
                    <aside className="w-[180px] lg:w-[200px] flex-shrink-0 bg-white shadow-md
                     flex flex-col overflow-y-auto border-r">
                      <div className="px-3 py-3 border-b bg-[#ff0000]">
                        <h4 className="text-white font-bold text-sm tracking-wide uppercase">Categories</h4>
                      </div>
                      <div className="flex flex-col overflow-y-auto flex-1 py-2 gap-1 px-2">
                        {newCategories.map((cat, index) => (
                          <button
                            type="button"
                            key={index}
                            onClick={() => setActiveCategory(cat)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === cat
                                ? "bg-[#ff0000] text-white shadow-sm"
                                : "bg-gray-50 hover:bg-red-50 text-gray-700 border border-gray-100"
                              }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </aside>

                    {/* MIDDLE — Items grid */}
                    <main className="flex-1 overflow-y-auto px-3 py-4 pb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {(isMenuItemsLoading || isFetching) ? (
                          [...Array(12)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                              <div className="h-32 bg-gray-200" />
                              <div className="p-2 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                                <div className="h-8 bg-gray-200 rounded" />
                              </div>
                            </div>
                          ))
                        ) : filteredItems && filteredItems.length > 0 ? (
                          filteredItems?.map((item, index) => {
                            const unavailable = item.is_available === 0;
                            return (
                              <div

                                key={item.id ?? index}
                                className={`group relative 
                      bg-white rounded-xl overflow-hidden shadow-md 
                      transition-all duration-300 ${unavailable ? "opacity-40 grayscale cursor-not-allowed" :
                                    "cursor-pointer hover:shadow-lg hover:-translate-y-1"

                                  }
                     ${summaryItems?.some(it => it.Item_Name === item.Item_Name)
                                    ? "border-2 border-green-500"
                                    : ""
                                  }
                    

                    `}
                                onClick={() => {
                                  if (unavailable) return; // 🚫 STOP HERE
                                  updateCart(item.id, 1, index, item.Item_Name, item.Item_Price);
                                }}
                              //onClick={()=> updateCart(item.id, 1, index, item.Item_Name, item.Item_Price)}
                              >
                                {unavailable && (
                                  <div className="absolute top-2 left-2 bg-red-600 
                      text-white text-[10px] px-2 py-1 rounded shadow">
                                    Unavailable
                                  </div>
                                )}
                                <div className="relative h-32 bg-gradient-to-br from-[#4CA1AF22] to-[#4CA1AF44]">
                                  {item?.Item_Image && (
                                    <img loading="lazy" src={`http://localhost:4000/uploads/food-item/${item.Item_Image}`} alt={item?.Item_Name} className="w-full h-full object-cover opacity-90" />
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                  <div className="absolute top-2 right-2">
                                    <span className="bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#ff0000] shadow">{item.Item_Category}</span>
                                  </div>
                                </div>
                                <div className="p-2">
                                  <div className="flex mb-2">
                                    <h5 style={{ color: "red" }} className="text-[20px] leading-tight">{item?.Item_Name}</h5>
                                  </div>
                                  <div className="flex justify-between items-center mb-2">
                                    <div>
                                      <div className="text-base font-semibold text-gray-800">₹{Number(item?.Item_Price || 0).toFixed(2)}</div>
                                      <div className="text-[10px] text-gray-500">Tax: {TAX_RATES[item?.Tax_Type]}%</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-bold text-[#ff0000]">₹{Number(item?.Amount || 0).toFixed(2)}</div>
                                      <div className="text-[10px] text-gray-500">Total</div>
                                    </div>
                                  </div>
                                  {/* <div className="flex items-center justify-between bg-[#4CA1AF10] rounded-md p-1.5">
                        <button
                          type="button"
                          disabled={unavailable || Number(cart[item.id] || 0) === 0}
                          onClick={() => !unavailable && 
                          updateCart(item.id, -1, index, item.Item_Name, item.Item_Price)}
                          className={`w-7 h-7 flex items-center justify-center rounded-md shadow transition ${unavailable ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-[#ff0000]"}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-base font-semibold text-gray-800 px-2">{cart[item.id] || 0}</span>
                        <button
                          style={{ backgroundColor: "#ff0000" }}
                          type="button"
                          disabled={unavailable}
                          onClick={() => !unavailable && updateCart(item.id, 1, index, item.Item_Name, item.Item_Price)}
                          className={`w-7 h-7 flex items-center justify-center rounded-md shadow transition ${unavailable ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#ff0000] text-white hover:bg-[#3a8c98]"}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div> */}
                                  <div className="flex mt-2 items-center gap-2">
                                    <span style={{ color: "#ff0000" }} className="text-base font-semibold">Quantity:</span>
                                    <span className="text-[16px]">{item?.Current_Quantity}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-gray-500 text-center col-span-full">No items found</p>
                        )}
                      </div>
                    </main>

                    {/* RIGHT — Order Summary (fixed height, scrollable list) */}
                    <aside className="w-[280px] lg:w-[300px] overflow-y-auto
        flex-shrink-0 bg-white shadow-md flex flex-col border-l">
                      {/* Header */}
                      <div className="px-4 py-3 bg-[#ff0000] flex items-center justify-between flex-shrink-0">
                        <h4 className="text-white font-bold text-sm tracking-wide uppercase">Order Summary</h4>
                        <span className="relative">
                          <ShoppingCart size={20} className="text-white" />
                          {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-white text-[#ff0000] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow">
                              {totalItems}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* ✅ Scrollable item list — grows and scrolls */}
                      <div
                        className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0 
         ">
                        {summaryItems && summaryItems.length > 0 ? (
                          summaryItems.map((item, index) => (
                            <div key={index} className="bg-gray-50  rounded-lg px-3 
                py-2 border border-gray-100">
                              <div className="flex justify-between items-start">
                                <span className="font-semibold text-sm text-gray-800 leading-tight flex-1 pr-2">{item?.Item_Name}</span>
                                <span className="text-xs bg-red-100 text-[#ff0000] px-2 py-0.5 rounded-full font-medium whitespace-nowrap">x {item?.Item_Quantity}</span>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Amount</span>
                                <span className="font-semibold text-gray-700">₹{item?.Amount}</span>
                              </div>
                              <div className="flex items-center justify-between bg-[#4CA1AF10] rounded-md p-1.5">
                                <button
                                  type="button"
                                  disabled={Number(cart[item.id] || 0) === 0}
                                  onClick={() => updateCart(item.id, -1, index, item.Item_Name, item.Item_Price)}
                                  className={`w-7 h-7 flex items-center justify-center rounded-md shadow transition ${Number(cart[item.id] || 0) === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-[#ff0000]"}`}
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-base font-semibold text-gray-800 px-2">
                                  {cart[item.id] || 0}</span>
                                <button
                                  style={{ backgroundColor: "#ff0000" }}
                                  type="button"
                                  // disabled={unavailable}
                                  onClick={() => updateCart(item.id, 1, index,
                                    item.Item_Name, item.Item_Price)}
                                  className={`w-7 h-7 flex items-center 
                            justify-center rounded-md shadow transition
                             ${Number(cart[item.id] || 0) === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#ff0000] text-white hover:bg-[#3a8c98]"}`}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <ShoppingCart size={36} className="mb-2 opacity-30" />
                            <p className="text-sm">No items added yet</p>
                          </div>
                        )}
                      </div>

                      {/* ✅ Pinned footer — never scrolls away */}
                      <div className="border-t bg-white px-4 py-3 space-y-3 flex-shrink-0">
                        <div className="flex justify-between items-center text-base font-bold text-gray-900">
                          <span>Total</span>
                          <span className="text-[#ff0000] text-lg">₹{watch("Amount")}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => setShowSummary(true)}
                            className="w-full py-2.5 px-4 flex items-center justify-center gap-2 rounded-lg text-white font-bold shadow transition hover:opacity-90"
                            style={{ backgroundColor: "black" }}
                          >
                            {/* <ShoppingCart size={18} className="text-white"/>
               {totalItems > 0 && (
                <span className="absolute -top-1  bg-white text-[#ff0000] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow">
                  {totalItems}
                </span> */}
                            <span className="relative">
                              <ShoppingCart size={20} className="text-white" />
                              {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-white text-[#ff0000] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                  {totalItems}
                                </span>
                              )}
                            </span>

                            {isUpdateOrderLoading ? "Saving..." : "Save & Hold"}
                            {/* Save &amp; Hold */}
                          </button>
                         
                        </div>
                      </div>
                    </aside>
                  </div>

                  {/* ══════════════════════════════════════════════════════════
          MOBILE — Items only (full width)
      ══════════════════════════════════════════════════════════ */}
                  <div className="lg:hidden bg-gradient-to-br from-orange-50 via-white to-red-50 pb-24">
                    <div className="px-3 py-4 grid grid-cols-2 gap-3">
                      {(isMenuItemsLoading || isFetching) ? (
                        [...Array(6)].map((_, i) => (
                          <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                            <div className="h-28 bg-gray-200" />
                            <div className="p-2 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4" />
                              <div className="h-3 bg-gray-200 rounded w-1/2" />
                              <div className="h-8 bg-gray-200 rounded" />
                            </div>
                          </div>
                        ))
                      ) : filteredItems && filteredItems.length > 0 ? (
                        filteredItems?.map((item, index) => {
                          const unavailable = item.is_available === 0;
                          return (
                            <div
                              key={item.id ?? index}
                              className={`relative bg-white rounded-xl overflow-hidden
                     shadow-md ${unavailable ? "opacity-40 grayscale cursor-not-allowed"
                                  : "cursor-pointer"}
                                       ${summaryItems?.some(it => it.Item_Name === item.Item_Name)
                                  ? "border-2 border-green-500"
                                  : ""
                                }
                       `}
                              onClick={() => {
                                if (unavailable) return; // 🚫 STOP HERE
                                updateCart(item.id, 1, index, item.Item_Name, item.Item_Price);
                              }}
                            //onClick={()=> updateCart(item.id, 1, index, item.Item_Name, item.Item_Price)}

                            >
                              {unavailable && (
                                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow z-10">
                                  Unavailable
                                </div>
                              )}
                              <div className="relative h-28 bg-gradient-to-br from-[#4CA1AF22] to-[#4CA1AF44]">
                                {item?.Item_Image && (
                                  <img loading="lazy" src={`http://localhost:4000/uploads/food-item/${item.Item_Image}`} alt={item?.Item_Name} className="w-full h-full object-cover opacity-90" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                <div className="absolute top-1 right-1">
                                  <span className="bg-white/90 px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-[#ff0000] shadow">{item.Item_Category}</span>
                                </div>
                              </div>
                              <div className="p-2">
                                <h5 style={{ color: "red" }} className="text-[15px] leading-tight mb-1 font-semibold">{item?.Item_Name}</h5>
                                <div className="flex justify-between items-center mb-1.5">
                                  <div>
                                    <div className="text-sm font-semibold text-gray-800">₹{Number(item?.Item_Price || 0).toFixed(2)}</div>
                                    <div className="text-[9px] text-gray-500">Tax: {TAX_RATES[item?.Tax_Type]}%</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs font-bold text-[#ff0000]">₹{Number(item?.Amount || 0).toFixed(2)}</div>
                                    <div className="text-[9px] text-gray-500">Total</div>
                                  </div>
                                </div>
                                {/* <div className="flex items-center justify-between bg-[#4CA1AF10] rounded-md p-1">
                      <button
                        type="button"
                        disabled={unavailable || Number(cart[item.id] || 0) === 0}
                        onClick={() => !unavailable && updateCart(item.id, -1, index, item.Item_Name, item.Item_Price)}
                        className={`w-6 h-6 flex items-center justify-center rounded-md shadow transition ${unavailable ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white text-[#ff0000]"}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold text-gray-800">{cart[item.id] || 0}</span>
                      <button
                        style={{ backgroundColor: "#ff0000" }}
                        type="button"
                        disabled={unavailable}
                        onClick={() => !unavailable && updateCart(item.id, 1, index, item.Item_Name, item.Item_Price)}
                        className={`w-6 h-6 flex items-center justify-center rounded-md shadow transition ${unavailable ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#ff0000] text-white"}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div> */}
                                <div className="flex mt-1.5 items-center gap-1">
                                  <span style={{ color: "#ff0000" }} className="text-xs font-semibold">Qty:</span>
                                  <span className="text-xs">{item.Current_Quantity}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-gray-500 text-center col-span-full">No items found</p>
                      )}
                    </div>
                  </div>

                  {/* ══════════════════════════════════════════════════════════
          BILL SUMMARY MODAL — unchanged logic, works on all screens
      ══════════════════════════════════════════════════════════ */}
                  {showSummary && (
                    <button type="button" onClick={() => setShowSummary(false)} className="fixed inset-0 bg-black/40 z-40" />
                  )}
                  <div className={`fixed left-0 bottom-0 w-full bg-white shadow-2xl rounded-t-2xl z-50 transform transition-transform duration-300 p-4 ${showSummary ? "translate-y-0" : "translate-y-full"}`}>
                    <div className="w-full flex justify-center py-2">
                      <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="px-4 pb-3 border-b">
                      <div className="flex justify-between items-center">
                        <div className="flex justify-center items-center mx-auto">
                          <h2 className="text-lg font-bold text-gray-700">Bill Summary</h2>
                        </div>
                        <div className="flex justify-end items-center gap-2">
                          <button type="button" style={{ backgroundColor: "transparent", fontSize: "30px" }} className="text-gray-500 text-2xl font-bold" onClick={() => setShowSummary(false)}>✖</button>
                        </div>
                      </div>
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
                        <button type="submit" style={{ backgroundColor: "#ff0000" }} className="w-16 h-10 flex items-center justify-center rounded-md text-white shadow">
                          OK
                        </button>
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
