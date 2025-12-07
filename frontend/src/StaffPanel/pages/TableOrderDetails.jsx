

import { useGetAllFoodItemsQuery } from "../../redux/api/foodItemApi";
import {   useGetAllTablesQuery } from "../../redux/api/tableApi";


import { useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";

import { Controller, useFieldArray, useForm } from "react-hook-form";



import { useRef } from "react";
import { useEffect } from "react";

import { toast } from "react-toastify";

import { useDispatch, useSelector } from "react-redux";

import { LayoutDashboard, Minus, Plus, ShoppingCart } from "lucide-react";
import { useGetTableOrderDetailsQuery, useUpdateOrderMutation } from "../../redux/api/Staff/orderApi";
import OrderDetailsModal from "../../components/Modal/OrderDetailsModal";








export default function TableOrderDetails() {
    // const { userId } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const {Order_Id}=useParams();
    const[orderDetailsModalOpen,setOrderDetailsModalOpen]=useState(false);
   //console.log(Order_Id);
    const {data:tableOrderDetails}=useGetTableOrderDetailsQuery(Order_Id);
    console.log(tableOrderDetails,"tableOrderDetails");
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
   
    const [selectedTables, setSelectedTables] = useState([]);
    //const [addOrder, { isLoading: isAddingOrder }] = useAddOrderMutation();
    const itemUnits = {

        "pcs": "Pcs",
        "plates": "Plates",
        "btl": "Bottle",

    }
    const { data: tables, isLoading } = useGetAllTablesQuery({});
    const { data: menuItems, isMenuItemsLoading } = useGetAllFoodItemsQuery({});
    //console.log(tables, isLoading, "tables", menuItems, isMenuItemsLoading);
        const items = menuItems?.foodItems
    const[updateOrder,{isLoading:isUpdateOrderLoading}]=useUpdateOrderMutation();
    const [rows, setRows] = useState([
        {
            CategoryOpen: false, categorySearch: "", preview: null
        }
    ]);
        const [cart, setCart] = useState({});
    const [activeCategory, setActiveCategory] = useState('All');
const { data: categories, isLoading: isLoadingCategories } = useGetAllCategoriesQuery()
console.log(categories,"categories");
  //const existingCategories=categories?.map((category) => category.Item_Category);
  const existingCategories = [...new Set(categories?.map(c => c.Item_Category))];
  const newCategories = ["All", ...existingCategories];
   // 

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
         reset,
         formState: { errors },
     } = useForm({
         defaultValues: {
 //   Tax_Type: "None",
 //   Tax_Amount: "0.00",
   Amount: "0.00",
   Sub_Total: "0.00",
   items: []   // No pre-created empty row
 }
     });

    // const {
    //     register,
    //     control,
    //     handleSubmit,
    //     setValue,
    //     watch,
    //     reset,
    //     formState: { errors },
    // } = useForm({
    //     defaultValues: {
           
           
    //         Amount: "0.00",
    //         Sub_Total: "0.00",

    //         items: [
    //             {
    //                 Item_Name: "",
    //                 Item_Price: "",
    //                 Item_Quantity: 1,
    //                 Amount: "0.00",
    //             }
    //         ]
    //     }
    // });


// useEffect(() => 
//     { if (!tableOrderDetails) return; 
//         const prefilledItems = tableOrderDetails.items.map((item) =>
//              ({ Item_Name: item?.Item_Name, Item_Price: item?.Price,
                 
//                   item?.Quantity, Amount: item?.Amount, })); 
//                   setSelectedTables(tableOrderDetails.tables.map((t) => t.Table_Name));
//                    reset({ items: prefilledItems, Sub_Total: tableOrderDetails?.order?.Sub_Total, 
//                      Tax_Amount: tableOrderDetails?.order?.Tax_Amount, Amount: tableOrderDetails?.order.Amount,
//                       Tax_Type: tableOrderDetails?.order?.Tax_Type, Table_Names: tableOrderDetails?.tables?.map((t) 
//                       => t?.Table_Name),
//  OPTIONAL }); }, [tableOrderDetails, reset]);

    useEffect(() => {
  if (!tableOrderDetails) return;

  const prefilledItems = tableOrderDetails.items.map((item) => ({
    Item_Name: item?.Item_Name,
    Item_Price: item?.Price, 
    Item_Quantity: item?.Quantity,
    // Item_Image: item?.Item_Image,
    Amount: item?.Amount,
    // Food_Item_Price: item?.Food_Item_Price,
    id: item?.id
  }));
 setSelectedTables(tableOrderDetails.tables.map((t) => t.Table_Name));

  reset({
    items: prefilledItems,
    Sub_Total: tableOrderDetails?.order?.Sub_Total,
    Amount: tableOrderDetails?.order.Amount,
    Table_Names: tableOrderDetails?.tables?.map((t) => t?.Table_Name),
  });

  // 🔥 Build mapping: menuItemId → rowIndex
  const map = {};
  tableOrderDetails.items.forEach((it, idx) => {
    map[it.id] = idx; // or item.id if that is the menu item ID
  });

  itemRowMap.current = map;

  // 🔥 Also sync cart with existing quantities
  const initialCart = {};
  tableOrderDetails.items.forEach((it) => {
    initialCart[it.id] = it.Quantity;
  });

  setCart(initialCart);

}, [tableOrderDetails, reset]);

// useEffect(() => {
//   if (!tableOrderDetails) return;

//   const prefilledItems = tableOrderDetails.items.map((item) => ({
//     Item_Name: item?.Item_Name,
//     Item_Price: item?.Price,      // FIX: Use Price, not Item_Price
//     Item_Quantity: item?.Quantity,
//     Amount: item?.Amount,
//   }));

//   setSelectedTables(tableOrderDetails.tables.map((t) => t.Table_Name));
//   reset({
//     items: prefilledItems,
//     Sub_Total: tableOrderDetails?.order?.Sub_Total,
//     // Tax_Amount: tableOrderDetails?.order?.Tax_Amount,
//     Amount: tableOrderDetails?.order.Amount,
//     // Tax_Type: tableOrderDetails?.order?.Tax_Type,
//     Table_Names: tableOrderDetails?.tables?.map((t) => t?.Table_Name), // OPTIONAL
//   });

// }, [tableOrderDetails, reset]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });


    const filteredItems = activeCategory === 'All'
        ? items
        : items?.filter(item => item?.Item_Category === activeCategory);

   
// console.log(filteredItems,"filteredItems",cart)
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

// const updateCart = (itemId, delta, index, itemName, itemAmount) => {
//   const amount = parseFloat(itemAmount || 0);

//   setCart(prev => {
//     const newQty = Math.max(0, (prev[itemId] || 0) + delta);

//     let rowIndex = itemRowMap.current[itemId];

//     // ➤ Row doesn't exist → create one (ONLY for new additions)
//     if (rowIndex === undefined) {
//       rowIndex = fields.length;
//       itemRowMap.current[itemId] = rowIndex;

//       append({
//         Item_Name: itemName,
//         Item_Price: amount,
//         Item_Quantity: newQty,
//         Amount: (amount * newQty).toFixed(2),
//       });
//     }

//     // ➤ Update existing row
//     setValue(`items.${rowIndex}.Item_Name`, itemName);
//     setValue(`items.${rowIndex}.Item_Price`, amount);
//     setValue(`items.${rowIndex}.Item_Quantity`, newQty);
//     setValue(`items.${rowIndex}.Amount`, (amount * newQty).toFixed(2));

//     setTimeout(() => updateTotals(), 0);

//     return { ...prev, [itemId]: newQty };
//   });
// };
const updateCart = (itemId, delta, index, itemName, itemAmount) => {
  const amount = parseFloat(itemAmount || 0);

  setCart(prev => {
    const newQty = Math.max(0, (prev[itemId] || 0) + delta);

    // Does this menu item already exist inside RHF form?
    let rowIndex = itemRowMap.current[itemId];

    // ⭐ NEW menu item → create a new row
    if (rowIndex === undefined) {
      rowIndex = fields.length;
      itemRowMap.current[itemId] = rowIndex;

      append({
        Item_Name: itemName,
        Item_Price: amount,
        Item_Quantity: newQty,
        Amount: (amount * newQty).toFixed(2),
        id: itemId
      });
    }

    // ⭐ Update existing row
    setValue(`items.${rowIndex}.Item_Name`, itemName);
    setValue(`items.${rowIndex}.Item_Price`, amount);
    setValue(`items.${rowIndex}.Item_Quantity`, newQty);
    setValue(`items.${rowIndex}.Amount`, (amount * newQty).toFixed(2));

    // Recalculate totals
    setTimeout(updateTotals, 0);

    return { ...prev, [itemId]: newQty };
  });
};


    const handleAddRow = () => {
        setRows((prev) => [
            ...prev.map((row) => ({
                ...row,
                CategoryOpen: false,

                //   itemOpen: false
            })),
            {
                //   itemSearch: "",
                //   itemOpen: false,
                CategoryOpen: false,
                categorySearch: "",

            },
        ]);

        append({
            Item_Name: "",

            Item_Price: "",
            Item_Quantity: "1",
        });
    };


    const handleDeleteRow = (i) => {
        setRows((prev) => prev.filter((_, idx) => idx !== i)); // remove UI state
        remove(i); // remove from form
    };
    const formValues = watch();
    const itemsValues = watch("items");   // watch all item rows
    //const totalPaid = watch("Total_Paid"); // watch Total_Paid
    const num = (v) => (v === undefined || v === null || v === "" ? 0 : Number(v));

    // const calculateRowAmount = (row, index, itemsValues) => {
    //     const price = num(row.Item_Price);
    //     const qty = Math.max(1, num(row.Item_Quantity)); // default 1
    //     const subtotal = price * qty;

    //     // discount
    //     // let disc = num(row.Discount_On_Sale_Price);
    //     // if ((row.Discount_Type_On_Sale_Price || "Percentage") === "Percentage") {
    //     //     disc = (subtotal * disc) / 100;
    //     // }
    //     // const afterDiscount = Math.max(0, subtotal - disc);

    //     // tax
    //     const taxPercent = TAX_RATES[row.Tax_Type] ?? 0;
    //     const taxAmount = (subtotal * taxPercent) / 100;

    //     const finalAmount = subtotal + taxAmount;



    //     return {
    //         ...row,
    //         Item_Quantity: String(qty),
    //         Tax_Amount: taxAmount.toFixed(2),
    //         Amount: finalAmount.toFixed(2),
    //         Sub_Total: totalAmount.toFixed(2), // ✅ correct grand total

    //     };
    // };

    // const calculateRowAmount = (row, index, itemsValues) => {
    //     const price = num(row.Item_Price);
    //     const qty = Math.max(1, num(row.Item_Quantity));
    //     const subtotal = price * qty;

    //     // TAX
    //     const taxPercent = TAX_RATES[row.Tax_Type] ?? 0;
    //     const taxAmount = (subtotal * taxPercent) / 100;

    //     const finalAmount = subtotal + taxAmount;

    //     // -----------------------------------------
    //     // 🔥 Calculate TOTAL INVOICE SUBTOTAL here
    //     // -----------------------------------------
    //     let totalSubTotal = 0;

    //     itemsValues.forEach((item, i) => {
    //         const itemPrice = num(item.Item_Price);
    //         const itemQty = Math.max(1, num(item.Item_Quantity));
    //         totalSubTotal += itemPrice * itemQty;
    //     });

    //     return {
    //         Tax_Amount: taxAmount.toFixed(2),
    //         Amount: finalAmount.toFixed(2),
    //         Sub_Total: totalSubTotal.toFixed(2),
    //     };
    // };

    const calculateRowAmount = (row, index, itemsValues) => {
        const price = num(row.Item_Price);
        const qty = Math.max(1, num(row.Item_Quantity));
        const rowAmount = price * qty;

        // ---------------------------------------
        // 1️⃣ Calculate Subtotal (sum of all rows)
        // ---------------------------------------
        let subTotal = 0;

        itemsValues.forEach((item, i) => {
            const itemPrice = num(item.Item_Price);
            const itemQty = Math.max(1, num(item.Item_Quantity));
            subTotal += itemPrice * itemQty;
        });

        // ---------------------------------------
        // 2️⃣ Calculate Tax (ONCE on subtotal)
        // ---------------------------------------
        const taxPercent = TAX_RATES[row.Tax_Type] ?? 0;
        const taxAmount = (subTotal * taxPercent) / 100;

        // ---------------------------------------
        // 3️⃣ Final Total Amount
        // ---------------------------------------
        const finalAmount = subTotal + taxAmount;

        return {
            Row_Amount: rowAmount.toFixed(2),
            Sub_Total: subTotal.toFixed(2),
            Tax_Amount: taxAmount.toFixed(2),
            Amount: finalAmount.toFixed(2),
        };
    };



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


useEffect(() => {
  updateTotals();
}, [watch("items")]);


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

        if (cleanedItems.length === 0) {
            toast.error("Please add at least one valid item with a name.");
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
            const res = await updateOrder({ Order_Id , payload}).unwrap();

            if (!res?.success) {
                toast.error(res.message || "Failed to submit order.");
                return;
            }

            toast.success("Order updated Successfully!");
            //dispatch(tableApi.util.invalidateTags(["Table"]));
            navigate("/staff/orders/all-orders");

        } catch (error) {
            console.error("❌ Order update Error:", error);
            toast.error(error?.data?.message ?? "Failed to update order.");
        }
    };



    // const onSubmit = async (data) => {
    //     console.log("Form Data (from RHF):", data);

    //     if (!data.items || data.items.length === 0) {
    //         toast.error("Please add at least one item before saving.");
    //         return;
    //     }

    //     // Remove empty rows
    //     const cleanedItems = data.items.filter(
    //         (it) => it.Item_Name && it.Item_Name.trim() !== ""
    //     );

    //     if (cleanedItems.length === 0) {
    //         toast.error("Please add at least one valid item with a name.");
    //         return;
    //     }

    //     // Check duplicate names
    //     const seen = new Set();
    //     for (const item of cleanedItems) {
    //         const name = item.Item_Name.trim().toLowerCase();
    //         if (seen.has(name)) {
    //             toast.error(`Duplicate item: ${item.Item_Name}`);
    //             return;
    //         }
    //         seen.add(name);
    //     }

    //     // Ensure tax fields exist (auto values)
    //     const itemsSafe = cleanedItems.map((item) => ({
    //         ...item,
    //         Tax_Type: item.Tax_Type || "None",
    //         Tax_Amount: item.Tax_Amount || "0.00",
    //         Amount: item.Amount || "0.00",
    //     }));

    //     // ------------------------------
    //     // 🚀 Build FormData for multer
    //     // ------------------------------
    //     const formData = new FormData();

    //     // Add JSON items
    //     formData.append("items", JSON.stringify({ items: itemsSafe }));



    //     console.log("📦 Final FormData Prepared", formData);

    //     try {
    //         const res = await addOrder(formData).unwrap();

    //         if (!res?.success) {
    //             toast.error(res.message || "Failed to add Food Items");
    //             return;
    //         }

    //         toast.success("Food Items added successfully!");
    //         navigate("/new/all-new-food-items");

    //     } catch (error) {
    //         console.error("Submission Error:", error);
    //         toast.error(error?.data?.message || "Failed to add food items");
    //     }
    // };



console.log(itemsValues,filteredItems,cart)
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

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mt-4">

                                    {/* LEFT HEADER */}
                                    <div className="w-full sm:w-auto">
                                        <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                                            Update Order
                                        </h4>
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


                                    <div className="grid grid-cols-1  mt-2 gap-6 w-full heading-wrapper">

                                        
                                        


                                        {/* EMPTY MIDDLE COLUMN */}
                                        <div></div>

                                        {/* RIGHT PANEL showing selected tables */}
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {selectedTables.map((name, idx) => (
                                                <h4
                                                    key={idx}
                                                    className="px-3 py-2 bg-blue-200 text-blue-900 rounded-md text-sm flex items-center gap-2"
                                                >
                                                    {name}
                                                    {/* <button
                                                        className="text-red-600 font-bold"
                                                        // onClick={() => {
                                                        //     const updated = selectedTables.filter((t) => t !== name);
                                                        //     setSelectedTables(updated);
                                                        //     setValue("Table_Names", updated);
                                                        // }}
                                                    >
                                                        
                                                    </button> */}
                                                </h4>
                                            ))}

                                            {selectedTables.length === 0 && (
                                                <p className="text-gray-500">No tables selected</p>
                                            )}
                                        </div>

                                    </div>
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
    {newCategories?.map((cat,index) => (
      <button
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


                                              <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
                                                                                        
                                                                                        <div className="bg-white shadow-md sticky top-0 ">
                                                                                            
                                            
                                            
                                                                                        </div>
                                            
                                            
                                                                                        {/* Food Items Grid */}
                                                                                        <div className=" mx-auto px-4 py-4">
                                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 
                                                                                            lg:grid-cols-4 xl:grid-cols-6 gap-6">
                                                                                        {filteredItems?.map((item, index) => {
                                                                                                  
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
                                                      ? `http://localhost:4000/uploads/food-item/${item?.Item_Image}`
                                                      : ""
                                                  }
                                                  alt={item?.Item_Name}
                                                  className="w-full h-full object-cover opacity-90"
                                                />
                                            
                                                {/* Gradient Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                            
                                                {/* CATEGORY BADGE */}
                                                <div className="absolute top-2 right-2">
                                                  <span className="bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#4CA1AF] shadow">
                                                    {item?.Item_Category}
                                                  </span>
                                                </div>
                                            
                                                {/* ITEM TITLE */}
                                                <div className="absolute bottom-1 left-2 right-2">
                                                  <h4 className="text-white text-[20px]  leading-tight">
                                                    {item?.Item_Name}
                                                  </h4>
                                                </div>
                                              </div>
                                            
                                              {/* DETAILS SECTION */}
                                              <div className="p-2">
                                                {/* PRICE & TOTAL (Compact Row) */}
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
                                                      updateCart(item.id, -1, index, item?.Item_Name, item?.Amount)
                                                    }
                                                    className="w-7 h-7 flex items-center justify-center bg-white 
                                                      rounded-md shadow hover:bg-gray-100 text-[#4CA1AF] transition"
                                                  >
                                                    <Minus className="w-3 h-3" />
                                                  </button>
                                            
                                                  <span className="text-base font-semibold text-gray-800 px-2">
                                                    {cart[item?.id] || 0}
                                                  </span>
                                            
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      updateCart(item.id, 1, index, item.Item_Name, item?.Amount)
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
                                                    type="submit"
                                                    disabled={formValues.errorCount > 0 || isUpdateOrderLoading}
                                                    className="relative w-full md:w-auto flex items-center justify-center gap-3 
                                                               text-white font-bold py-2 px-5 rounded shadow"
                                                    style={{ backgroundColor: "#4CA1AF" }}
                                                  >
                                                    {isUpdateOrderLoading ? "Saving..." : "Save & Hold"}
                                            
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
                                                  <button
                                                    type="button"
                                                    onClick={()=>setOrderDetailsModalOpen(true)}
                                                    className="w-full md:w-auto text-white font-bold py-2 px-5 rounded shadow"
                                                    style={{ backgroundColor: "#4CA1AF" }}
                                                  >
                                                    Save & Pay Bill
                                                  </button>
                                            
                                                </div>
                                              </div>
                                            </div>
                                            
                                                
                                                                                    </div>





                                    
                                </form>
                                {orderDetailsModalOpen && 
                                <OrderDetailsModal
                                onClose={() => setOrderDetailsModalOpen(false)}
                                orderDetails={formValues} 
                                setOpen={setOrderDetailsModalOpen} 
                                orderId={Order_Id} />}
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

    // <div className="table-responsive table-desi mt-4">
    //                                     <table className="table table-hover">
    //                                         <thead>
    //                                             <tr>

    //                                                 <th>Sl.No</th>

    //                                                 <th>Name</th>

    //                                                 <th>Qty</th>
    //                                                 {/* <th>Unit</th> */}
    //                                                 <th>Price/Unit</th>
    //                                                 {/* <th>Discount</th> */}


    //                                                 <th>Amount</th>
    //                                             </tr>
    //                                         </thead>
    //                                         <tbody style={{ maxHeight: "10rem", overflowY: "scroll" }}>
    //                                             {fields.map((field, i) => (
    //                                                 <tr key={field.id}>
    //                                                     {/* Action + Serial Number */}
    //                                                     <td style={{ padding: "0px", textAlign: "center", verticalAlign: "middle" }}>
    //                                                         <div
    //                                                             className="flex align-center justify-center text-center gap-2"
    //                                                             style={{ whiteSpace: "nowrap" }}
    //                                                         >
    //                                                             <button
    //                                                                 type="button"
    //                                                                 onClick={() => handleDeleteRow(i)}
    //                                                                 style={{
    //                                                                     background: "transparent",
    //                                                                     border: "none",
    //                                                                     color: "red",
    //                                                                     cursor: "pointer",
    //                                                                 }}
    //                                                             >
    //                                                                 🗑
    //                                                             </button>
    //                                                             <span>{i + 1}</span>
    //                                                         </div>
    //                                                     </td>



    //                                                     {/* Item Dropdown */}
    //                                                     <td style={{ padding: "0px", width: "70%", position: "relative" }}>
    //                                                         <div ref={(el) => (itemRefs.current[i] = el)}> {/* ✅ attach ref */}
    //                                                             <input
    //                                                                 type="text"
    //                                                                 value={rows[i]?.itemSearch || watch(`items.${i}.Item_Name`)}
    //                                                                 onChange={(e) => {
    //                                                                     const typedValue = e.target.value;
    //                                                                     handleRowChange(i, "itemSearch", typedValue);
    //                                                                     // handleRowChange(i, "CategoryOpen", false);

    //                                                                     setValue(`items.${i}.Item_Name`, typedValue, { shouldValidate: true, shouldDirty: true });
    //                                                                     // setValue(`items.${i}.Item_Name`, typedValue);

    //                                                                     handleRowChange(i, "isExistingItem", false);
    //                                                                     handleRowChange(i, "isUnitLocked", false);
    //                                                                     // ✅ If typed value doesn’t match any existing item → unlock category
    //                                                                     const exists = menuItems?.foodItems?.some(
    //                                                                         (it) => it.Item_Name.trim().toLowerCase() === typedValue.toLowerCase()
    //                                                                     );
    //                                                                     handleRowChange(i, "isExistingItem", exists); // false if new item
    //                                                                 }}
    //                                                                 onClick={() => handleRowChange(i, "itemOpen", !rows[i]?.itemOpen)}
    //                                                                 placeholder="Item Name"
    //                                                                 className="w-full outline-none border-b-2 text-gray-900"
    //                                                             />
    //                                                             {/* RHF error */}
    //                                                             {errors?.items?.[i]?.Item_Name && (
    //                                                                 <p className="text-red-500 text-xs mt-1">
    //                                                                     {errors?.items?.[i]?.Item_Name?.message}
    //                                                                 </p>
    //                                                             )}
    //                                                             {/* Dropdown List */}
    //                                                             {rows[i]?.itemOpen && (
    //                                                                 <div
    //                                                                     style={{ width: "40rem" }}
    //                                                                     className="absolute z-20  w-full bg-white border
    //   border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
    //                                                                 >
    //                                                                     <table className="w-full text-sm border-collapse">
    //                                                                         <thead className="bg-gray-100 border-b">
    //                                                                             <tr>
    //                                                                                 <th>Sl.No</th>
    //                                                                                 <th className="text-left px-3 py-2"> Name</th>
    //                                                                                 <th className="text-left px-3 py-2">Item Price</th>
    //                                                                                 {/* <th className="text-left px-3 py-2">Purchase Price (Previous)</th> */}
    //                                                                                 {/* <th className="text-left px-3 py-2">Current Stock</th> */}
    //                                                                             </tr>
    //                                                                         </thead>
    //                                                                         <tbody>
    //                                                                             {menuItems?.foodItems
    //                                                                                 ?.filter((it) =>
    //                                                                                     it.Item_Name.toLowerCase().includes(
    //                                                                                         (rows[i]?.itemSearch || "").toLowerCase()
    //                                                                                     )
    //                                                                                 )
    //                                                                                 .map((it, idx) => (
    //                                                                                     <tr
    //                                                                                         key={idx}
    //                                                                                         // onClick={() => {

    //                                                                                         //     setRows((prev) => {
    //                                                                                         //         const updated = [...prev];
    //                                                                                         //         updated[i] = {
    //                                                                                         //             ...updated[i],
    //                                                                                         //             // Item_Category: it.Item_Category || "",
    //                                                                                         //             // Item_HSN: it.Item_HSN || "",
    //                                                                                         //             //categorySearch: it.Item_Category || "", // ✅ sync UI state
    //                                                                                         //             isExistingItem: true,   // lock category
    //                                                                                         //             //isHSNLocked: true,      
    //                                                                                         //             //isUnitLocked: true,     // lock unit
    //                                                                                         //         };
    //                                                                                         //         return updated;
    //                                                                                         //     });
    //                                                                                         //     handleRowChange(i, "itemSearch", it.Item_Name);
    //                                                                                         //     handleRowChange(i, "isExistingItem", true); // ✅ mark as existing
    //                                                                                         //     //handleRowChange(i, "CategoryOpen", false);
    //                                                                                         //     //setValue(`items.${i}.Item_Category`, it.Item_Category, { shouldValidate: true , shouldDirty: true});
    //                                                                                         //     setValue(`items.${i}.Item_Price`, it.Item_Price, { shouldValidate: true, shouldDirty: true });
    //                                                                                         //     setValue(`items.${i}.Item_Name`, it.Item_Name, { shouldValidate: true, shouldDirty: true });
    //                                                                                         //     // setValue(`items.${i}.Item_HSN`, it.Item_HSN, { shouldValidate: true , shouldDirty: true});

    //                                                                                         //     setValue(`items.${i}.Quantity`, 1, { shouldValidate: true, shouldDirty: true });

    //                                                                                         //     handleRowChange(i, "itemOpen", false);
    //                                                                                         //     const updated = calculateRowAmount(
    //                                                                                         //         {
    //                                                                                         //             ...itemsValues[i],
    //                                                                                         //             Item_Name: it.Item_Name,

    //                                                                                         //             Quantity: itemsValues[i]?.Quantity || 1,


    //                                                                                         //         },
    //                                                                                         //         i,
    //                                                                                         //         itemsValues
    //                                                                                         //     );

    //                                                                                         //     setValue(`items.${i}.Amount`, updated.Row_Amount);
    //                                                                                         //     setValue("Sub_Total", updated.Sub_Total);
    //                                                                                         //     setValue("Tax_Amount", updated.Tax_Amount);
    //                                                                                         //     setValue("Amount", updated.Amount);


    //                                                                                         //     // const { Tax_Amount, Amount, Sub_Total } = calculateRowAmount(
    //                                                                                         //     //     {
    //                                                                                         //     //         ...itemsValues[i],
    //                                                                                         //     //         Item_Name: it.Item_Name,

    //                                                                                         //     //         Quantity: itemsValues[i]?.Quantity || 1,


    //                                                                                         //     //     },
    //                                                                                         //     //     i,
    //                                                                                         //     //     itemsValues
    //                                                                                         //     // );

    //                                                                                         //     // setValue(`Tax_Amount`, Tax_Amount, { shouldValidate: true, shouldDirty: true });
    //                                                                                         //     // setValue(`items.${i}.Amount`, Amount, { shouldValidate: true, shouldDirty: true });
    //                                                                                         //     // setValue("Sub_Total", Sub_Total, { shouldValidate: true, shouldDirty: true });

    //                                                                                         //     //setValue(`items.${i}.Tax_Amount`, Tax_Amount, { shouldValidate: true, shouldDirty: true });
    //                                                                                         //     // setValue(`items.${i}.Amount`, Amount, { shouldValidate: true, shouldDirty: true });
    //                                                                                         //     // setValue(`Sub_Total`, Sub_Total, { shouldValidate: true, shouldDirty: true });
    //                                                                                         //     // setValue(`Balance_Due`, Balance_Due, { shouldValidate: true, shouldDirty: true });
    //                                                                                         // }}
    //                                                                                         onClick={() => {
    //                                                                                             setRows((prev) => {
    //                                                                                                 const updated = [...prev];
    //                                                                                                 updated[i] = {
    //                                                                                                     ...updated[i],
    //                                                                                                     // Item_Category: it.Item_Category || "",
    //                                                                                                     // Item_HSN: it.Item_HSN || "",
    //                                                                                                     //categorySearch: it.Item_Category || "", // ✅ sync UI state
    //                                                                                                     isExistingItem: true,   // lock category
    //                                                                                                     //isHSNLocked: true,      
    //                                                                                                     //isUnitLocked: true,     // lock unit
    //                                                                                                 };
    //                                                                                                 return updated;
    //                                                                                             });
    //                                                                                             // 1️⃣ Update form values for the selected row
    //                                                                                             //setValue(`items.${i}.Item_Name`, it.Item_Name);
    //                                                                                             //setValue(`items.${i}.Item_Price`, it.Item_Price);
    //                                                                                             setValue(`items.${i}.Item_Quantity`, itemsValues[i]?.Item_Quantity ?? 1);
    //                                                                                             handleRowChange(i, "itemSearch", it.Item_Name);
    //                                                                                             handleRowChange(i, "isExistingItem", true); // ✅ mark as existing


    //                                                                                             setValue(`items.${i}.Item_Price`, it.Item_Price, { shouldValidate: true, shouldDirty: true });
    //                                                                                             setValue(`items.${i}.Item_Name`, it.Item_Name, { shouldValidate: true, shouldDirty: true });

    //                                                                                             handleRowChange(i, "itemOpen", false);

    //                                                                                             // 2️⃣ Build updated items array for accurate subtotal/tax calculation
    //                                                                                             const updatedItems = itemsValues.map((r, idx) =>
    //                                                                                                 idx === i
    //                                                                                                     ? {
    //                                                                                                         ...r,
    //                                                                                                         Item_Name: it.Item_Name,
    //                                                                                                         Item_Price: it.Item_Price,
    //                                                                                                         Item_Quantity: r.Item_Quantity ?? 1,
    //                                                                                                     }
    //                                                                                                     : r
    //                                                                                             );

    //                                                                                             // 3️⃣ Get current Tax Type (needed for correct tax calculation)
    //                                                                                             const taxType = watch("Tax_Type");

    //                                                                                             // 4️⃣ Calculate totals using updated items
    //                                                                                             const updated = calculateInvoiceTotals(taxType, updatedItems);

    //                                                                                             // 5️⃣ Update UI fields
    //                                                                                             setValue(`items.${i}.Amount`, (it.Item_Price * (itemsValues[i]?.Item_Quantity || 1)).toFixed(2));
    //                                                                                             setValue("Sub_Total", updated.Sub_Total);
    //                                                                                             setValue("Tax_Amount", updated.Tax_Amount);
    //                                                                                             setValue("Amount", updated.Amount);
    //                                                                                         }}

    //                                                                                         className="hover:bg-gray-100 cursor-pointer border-b"
    //                                                                                     >
    //                                                                                         <td>{idx + 1}</td>
    //                                                                                         <td className="px-3 py-2">{it.Item_Name}</td>

    //                                                                                         <td className="px-3 py-2 text-gray-600">{it.Item_Price}</td>
    //                                                                                         {/* <td className="px-3 py-2 text-gray-600">{it.Purchase_Price || 0}</td> */}
    //                                                                                         {/* <td style={{color:"transparent"}}
    //           className={`px-3 py-2 ${it.Stock_Quantity <= 0 ? "text-red-500" : "text-green-500"}`}>
    //             {it.Stock_Quantity || 0}</td> */}

    //                                                                                     </tr>
    //                                                                                 ))}

    //                                                                             {menuItems?.foodItems?.filter((it) =>
    //                                                                                 it.Item_Name.toLowerCase().includes(
    //                                                                                     (rows[i]?.itemSearch || "").toLowerCase()
    //                                                                                 )
    //                                                                             ).length === 0 && (
    //                                                                                     <tr>
    //                                                                                         <td colSpan={4} className="px-3 py-2 text-gray-400 text-center">
    //                                                                                             No material found
    //                                                                                         </td>
    //                                                                                     </tr>
    //                                                                                 )}
    //                                                                         </tbody>
    //                                                                     </table>
    //                                                                 </div>
    //                                                             )}



    //                                                         </div>
    //                                                     </td>





    //                                                     <td style={{ padding: "0px", width: "5%" }}>
    //                                                         <input
    //                                                             type="text"
    //                                                             className="form-control"
    //                                                             style={{ width: "100%" }}
    //                                                             value={watch(`items.${i}.Item_Quantity`)?.toString() || ""}
    //                                                             {...register(`items.${i}.Item_Quantity`)}
    //                                                             // onChange={(e) => {
    //                                                             //     let value = e.target.value.replace(/[^0-9]/g, "");


    //                                                             //     // if (!itemsValues[i]?.Item_Name?.trim()) return;

    //                                                             //     // ✅ Clamp value
    //                                                             //     // let num = parseInt(value, 10);

    //                                                             //     // if (isNaN(num) || num < 0) {
    //                                                             //     //     num = 0; // reset to 0
    //                                                             //     // }
    //                                                             //     if (value === "") {
    //                                                             //         setValue(`items.${i}.Item_Quantity`, "", { shouldValidate: true });
    //                                                             //         return;
    //                                                             //     }

    //                                                             //     // ✅ Update only via RHF
    //                                                             //     setValue(`items.${i}.Item_Quantity`, value, { shouldValidate: true });

    //                                                             //     // ✅ Recalculate row + totals
    //                                                             //     const updated = calculateRowAmount(
    //                                                             //         { ...itemsValues[i], Item_Quantity: value },
    //                                                             //         i,
    //                                                             //         itemsValues
    //                                                             //     );

    //                                                             //     setValue(`items.${i}.Amount`, updated.Row_Amount);
    //                                                             //     setValue("Sub_Total", updated.Sub_Total);
    //                                                             //     setValue("Tax_Amount", updated.Tax_Amount);
    //                                                             //     setValue("Amount", updated.Amount);


    //                                                             //     // const updated = calculateRowAmount(
    //                                                             //     //     {
    //                                                             //     //         ...itemsValues[i],
    //                                                             //     //         Item_Quantity: value,
    //                                                             //     //     },
    //                                                             //     //     i,
    //                                                             //     //     itemsValues
    //                                                             //     // )
    //                                                             //     // setValue(`Tax_Amount`, updated.Tax_Amount);
    //                                                             //     // setValue(`items.${i}.Amount`, updated.Amount);
    //                                                             //     // setValue("Sub_Total", updated.Sub_Total);
    //                                                             // }}
    //                                                             onChange={(e) => {
    //                                                                 let value = e.target.value.replace(/[^0-9]/g, "");

    //                                                                 if (value === "") {
    //                                                                     setValue(`items.${i}.Item_Quantity`, "", { shouldValidate: true });
    //                                                                     return;
    //                                                                 }

    //                                                                 // Update RHF
    //                                                                 setValue(`items.${i}.Item_Quantity`, value, { shouldValidate: true });

    //                                                                 // 🔥 Create updated items list
    //                                                                 const updatedItems = itemsValues.map((row, idx) =>
    //                                                                     idx === i
    //                                                                         ? { ...row, Item_Quantity: value }  // updated quantity
    //                                                                         : row
    //                                                                 );

    //                                                                 // 🔥 Get selected Tax Type
    //                                                                 const taxType = watch("Tax_Type");

    //                                                                 // 🔥 Recalculate using the updated items
    //                                                                 const updated = calculateInvoiceTotals(taxType, updatedItems);

    //                                                                 // Update row amount
    //                                                                 const price = Number(updatedItems[i].Item_Price ?? 0);
    //                                                                 const rowAmount = (price * Number(value)).toFixed(2);

    //                                                                 setValue(`items.${i}.Amount`, rowAmount);
    //                                                                 setValue("Sub_Total", updated.Sub_Total);
    //                                                                 setValue("Tax_Amount", updated.Tax_Amount);
    //                                                                 setValue("Amount", updated.Amount);
    //                                                             }}

    //                                                             placeholder="Qty"
    //                                                         />
    //                                                         {errors?.items?.[i]?.Item_Quantity && (
    //                                                             <p className="text-red-500 text-xs mt-1">
    //                                                                 {errors.items[i].Item_Quantity.message}
    //                                                             </p>
    //                                                         )}
    //                                                     </td>



    //                                                     {/*  Price */}
    //                                                     <td style={{ padding: "0px", width: "10%" }}>
    //                                                         <div className="d-flex align-items-center">
    //                                                             <input
    //                                                                 readOnly
    //                                                                 type="text"
    //                                                                 className="form-control"
    //                                                                 style={{ width: "100%", marginBottom: "0px" }}
    //                                                                 {...register(`items.${i}.Item_Price`)}
    //                                                                 onChange={(e) => {
    //                                                                     let val = e.target.value;

    //                                                                     // ✅ allow digits and one dot
    //                                                                     val = val.replace(/[^0-9.]/g, "");

    //                                                                     // ✅ if more than one dot, keep only the first
    //                                                                     const parts = val.split(".");
    //                                                                     if (parts.length > 2) {
    //                                                                         val = parts[0] + "." + parts.slice(1).join(""); // collapse extra dots
    //                                                                     }

    //                                                                     // ✅ limit to 2 decimal places
    //                                                                     if (val.includes(".")) {
    //                                                                         const [int, dec] = val.split(".");
    //                                                                         val = int + "." + dec.slice(0, 2);
    //                                                                     }

    //                                                                     e.target.value = val;

    //                                                                     if (!itemsValues[i]?.Item_Name || itemsValues[i]?.Item_Name.trim() === "") {
    //                                                                         return;
    //                                                                     }

                                     
    //                                                                     const updated = calculateRowAmount(
    //                                                                         { ...itemsValues[i], Item_Price: val },
    //                                                                         i,
    //                                                                         itemsValues
    //                                                                     );

    //                                                                     setValue(`items.${i}.Amount`, updated.Row_Amount);
    //                                                                     setValue("Sub_Total", updated.Sub_Total);
    //                                                                     setValue("Tax_Amount", updated.Tax_Amount);
    //                                                                     setValue("Amount", updated.Amount);


    //                                                                 }}

    //                                                                 placeholder="Price"
    //                                                             />

    //                                                         </div>
    //                                                         {errors?.items?.[i]?.Item_Price && (
    //                                                             <p className="text-red-500 text-xs mt-1">
    //                                                                 {errors.items[i].Item_Price.message}
    //                                                             </p>
    //                                                         )}
    //                                                     </td>



    //                                                     {/* Amount */}
    //                                                     <td style={{ width: "10%" }}>
    //                                                         <input
    //                                                             type="text"
    //                                                             className="form-control"
    //                                                             style={{ backgroundColor: "transparent" }}
    //                                                             {...register(`items.${i}.Amount`)}
    //                                                             readOnly
    //                                                         />
    //                                                     </td>
    //                                                 </tr>
    //                                             ))}
    //                                         </tbody>


    //                                     </table>

    //                                     <div className="grid grid-cols-3 mt-2 px-2 sm:grid-cols-3  gap-4 w-full sale-wrapper">
    //                                         {/* Add Row Button */}
    //                                         <div className="flex flex-col px-2 w-full sm:w-64 sale-left">
    //                                             <button
    //                                                 type="button"
    //                                                 onClick={handleAddRow}
    //                                                 className=" text-white font-bold py-2 px-4 w-1/2 rounded "
    //                                                 style={{ backgroundColor: "#4CA1AF" }}
    //                                             >
    //                                                 + Add Row
    //                                             </button>


    //                                         </div>
    //                                         <div></div>
    //                                         <div style={{ width: "100%" }}
    //                                             className="grid grid-rows-1 px-4 gap-2 w-full sm:w-1/2 lg:w-1/3 ml-auto mr-2 sale-right">

    //                                             <div style={{ width: "100%" }}
    //                                                 className="flex justify-between items-start gap-6 w-full mr-4">
    //                                                 {/* <div className="flex items-center gap-2">
    //                                                     <input
    //                                                         type="checkbox"
    //                                                         id="roundOffCheck"
    //                                                         className="w-4 h-4 cursor-pointer"
    //                                                         onChange={(e) => {
    //                                                             const isChecked = e.target.checked;
    //                                                             const totalAmount = parseFloat(watch("Sub_Total"));
    //                                                             //const totalPaid = parseFloat(watch("Total_Paid")) || 0;

    //                                                             if (!totalAmount || isNaN(totalAmount)) return;

    //                                                             if (isChecked) {
    //                                                                 setOriginalTotal(totalAmount);

    //                                                                 // Round off to nearest integer
    //                                                                 const rounded = Math.round(totalAmount);

    //                                                                 setValue("Sub_Total", rounded.toFixed(2), { shouldValidate: true });
    //                                                                 //setValue("Balance_Due", (rounded - totalPaid).toFixed(2), { shouldValidate: true });

    //                                                             } else {
    //                                                                 if (originalTotal !== null) {
    //                                                                     setValue("Sub_Total", originalTotal.toFixed(2), { shouldValidate: true });

    //                                                                     // setValue(
    //                                                                     //   "Balance_Due",
    //                                                                     //   (originalTotal - totalPaid).toFixed(2),
    //                                                                     //   { shouldValidate: true }
    //                                                                     // );
    //                                                                 }
    //                                                             }
    //                                                         }}
    //                                                     />

    //                                                     <span className="font-medium whitespace-nowrap">Round Off</span>


    //                                                     <input

    //                                                         type="text"

    //                                                         style={{ marginTop: "10px", width: "60px", height: "1.5rem" }}
    //                                                         className="w-3  border border-gray-300  text-right text-sm"
    //                                                         {...register("Round_Off")}
    //                                                         onChange={(e) => {
    //                                                             const val = parseFloat(e.target.value) || 0;
    //                                                             const totalAmount = originalTotal ?? parseFloat(watch("Sub_Total"));
    //                                                             //const totalPaid = parseFloat(watch("Total_Paid")) || 0;

    //                                                             if (isNaN(totalAmount)) return;

    //                                                             // New Total
    //                                                             const newTotal = totalAmount + val;

    //                                                             setValue("Sub_Total", newTotal.toFixed(2));
    //                                                             //setValue("Balance_Due", (newTotal - totalPaid).toFixed(2), { shouldValidate: true });
    //                                                         }}
    //                                                     // disabled={!watch("roundOffCheck") && originalTotal === null}
    //                                                     />
    //                                                 </div> */}

    //                                                 <div style={{ width: "100%" }}
    //                                                     className="flex flex-col gap-4 mt-3 w-full">
    //                                                     <div className="flex gap-3 items-center  w-full sm:w-auto">

    //                                                         <div style={{ width: "100%" }} className="flex gap-2 ">
    //                                                             <span className="font-medium whitespace-nowrap">Sub Total</span>

    //                                                             <input
    //                                                                 style={{ backgroundColor: "transparent", height: "1rem" }}
    //                                                                 type="text"
    //                                                                 className="form-control"
    //                                                                 {...register("Sub_Total")}
    //                                                                 readOnly
    //                                                             />
    //                                                         </div>
    //                                                     </div>




    //                                                     {/* <div className="grid grid-cols-2 gap-6 w-full">

                                                           
    //                                                         <div className="flex flex-col gap-2">
    //                                                             <label className="text-sm font-medium text-gray-700">Tax Type</label>

    //                                                             <Controller
    //                                                                 control={control}
    //                                                                 name="Tax_Type"
    //                                                                 render={({ field }) => (
    //                                                                     <select
    //                                                                         {...field}
    //                                                                         className="w-full border rounded-md p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
    //                                                                         // onChange={(e) => {
    //                                                                         //     field.onChange(e);

    //                                                                         //     const { Tax_Amount, Amount, Sub_Total } = calculateRowAmount(
    //                                                                         //         { Tax_Type: e.target.value },
    //                                                                         //         itemsValues
    //                                                                         //     );

    //                                                                         //     setValue("Tax_Amount", Tax_Amount);
    //                                                                         //     setValue("Amount", Amount);
    //                                                                         // }}
    //                                                                         onChange={(e) => {
    //                                                                             field.onChange(e);

    //                                                                             const taxType = e.target.value;

    //                                                                             const updated = calculateInvoiceTotals(taxType, itemsValues);

    //                                                                             setValue("Tax_Amount", updated.Tax_Amount);
    //                                                                             setValue("Amount", updated.Amount);
    //                                                                         }}
    //                                                                     >
    //                                                                         <option value="None">None</option>
    //                                                                         <option value="GST0">GST @0%</option>
    //                                                                         <option value="IGST0">IGST @0%</option>
    //                                                                         <option value="GST0.25">GST @0.25%</option>
    //                                                                         <option value="IGST0.25">IGST @0.25%</option>
    //                                                                         <option value="GST3">GST @3%</option>
    //                                                                         <option value="IGST3">IGST @3%</option>
    //                                                                         <option value="GST5">GST @5%</option>
    //                                                                         <option value="IGST5">IGST @5%</option>
    //                                                                         <option value="GST12">GST @12%</option>
    //                                                                         <option value="IGST12">IGST @12%</option>
    //                                                                         <option value="GST18">GST @18%</option>
    //                                                                         <option value="IGST18">IGST @18%</option>
    //                                                                         <option value="GST28">GST @28%</option>
    //                                                                         <option value="IGST28">IGST @28%</option>
    //                                                                         <option value="GST40">GST @40%</option>
    //                                                                         <option value="IGST40">IGST @40%</option>
    //                                                                     </select>
    //                                                                 )}
    //                                                             />
    //                                                         </div>

                                                            
    //                                                         <div className="flex flex-col gap-2">
    //                                                             <label className="text-sm font-medium text-gray-700">Tax Amount</label>

    //                                                             <input
    //                                                                 type="text"
    //                                                                 {...register("Tax_Amount")}
    //                                                                 readOnly
    //                                                                 className="form-control"
    //                                                             />
    //                                                         </div>

    //                                                     </div> */}


    //                                                     <div style={{ width: "100%" }}
    //                                                         className="flex  gap-2 items-center ">

    //                                                         <span className="font-medium whitespace-nowrap">Amount</span>
    //                                                         <input
    //                                                             style={{ backgroundColor: "transparent", marginBottom: "0px", height: "1rem", width: "100%" }}
    //                                                             type="text"
    //                                                             className="form-control  "
    //                                                             {...register("Amount")}

    //                                                             readOnly
    //                                                         />
    //                                                     </div>



    //                                                     <div style={{ width: "100%" }} className="flex gap-2 justify-end">
    //                                                         <button
    //                                                             type="submit"
    //                                                             disabled={formValues.errorCount > 0 }
    //                                                             // onClick={() => navigate("/staff/orders/all-orders")}
    //                                                             className=" text-white font-bold py-2 px-4 rounded"
    //                                                             style={{ backgroundColor: "#4CA1AF" }}
    //                                                         >
    //                                                             Save and Hold
    //                                                             {/* {isAddingOrder ? "Saving..." : "Save and Hold"} */}
    //                                                         </button>
    //                                                         <button
    //                                                             type="button"
    //                                                             onClick={()=>setOrderDetailsModalOpen(true)}
    //                                                             className=" text-white font-bold py-2 px-4 rounded"
    //                                                             style={{ backgroundColor: "#4CA1AF" }}
    //                                                         >
                                                            
    //                                                             Save and Pay Bill
    //                                                         </button>
    //                                                     </div>
    //                                                 </div>

    //                                             </div>
    //                                         </div>



    //                                     </div>
    //                                 </div>
}{/* <div className="relative">
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
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">

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
</div> */}