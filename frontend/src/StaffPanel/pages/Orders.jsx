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
import { useGetAllCategoriesQuery } from "../../redux/api/itemApi";




export default function Orders() {
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
const { data: categories, isLoading: isLoadingCategories } = useGetAllCategoriesQuery()
console.log(categories,"categories");
  //onst existingCategories=categories?.map((category) => category.Item_Category);
const existingCategories = [...new Set(categories?.map(c => c.Item_Category))];

const newCategories = ["All", ...existingCategories];
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

    console.log(items)
    const [cart, setCart] = useState({});
    const [activeCategory, setActiveCategory] = useState('All');

    //const categories = ['All', ...new Set(items?.map(item => items?.Item_Category))];

    const filteredItems = activeCategory === 'All'
        ? items
        : items?.filter(item => item?.Item_Category === activeCategory);

    // const updateCart = (itemId, delta) => {
    //     setCart(prev => ({
    //         ...prev,
    //         [itemId]: Math.max(0, (prev[itemId] || 0) + delta)
    //     }));
    // };
//     const updateCart = (itemId, delta, index) => {
//     setCart(prev => {
//         const newQty = Math.max(0, (prev[itemId] || 0) + delta);

//         // 👉 Sync with RHF form values
//         setValue(`items.${index}.Item_Quantity`, newQty, {
//             shouldValidate: true,
//             shouldDirty: true,
//         });

//         // 👉 Recalculate amount automatically
//         const price = watch(`items.${index}.Item_Price`);
//         const amount = newQty * parseFloat(price || 0);

//         setValue(`items.${index}.Amount`, amount.toFixed(2));

//         return {
//             ...prev,
//             [itemId]: newQty,
//         };
//     });
// };
console.log(filteredItems,"filteredItems")
// const updateCart = (itemId, delta, index, itemName, itemPrice) => {
//     setCart(prev => {
//         // New Quantity
//         const newQty = Math.max(0, (prev[itemId] || 0) + delta);

//         // 👉 Sync Quantity inside RHF
//         setValue(`items.${index}.Item_Quantity`, newQty, {
//             shouldValidate: true,
//             shouldDirty: true,
//         });

//         // 👉 Sync Name (only when first time added)
//         if (itemName) {
//             setValue(`items.${index}.Item_Name`, itemName, {
//                 shouldValidate: true,
//                 shouldDirty: true,
//             });
//         }

//         // 👉 Sync Price
//         const price = parseFloat(itemPrice || 0);
//         setValue(`items.${index}.Item_Price`, price, {
//             shouldValidate: true,
//             shouldDirty: true,
//         });

//         // 👉 Auto-calc Amount = Price × Qty
//         const amount = (price * newQty).toFixed(2);
//         setValue(`items.${index}.Amount`, amount, {
//             shouldValidate: true,
//             shouldDirty: true,
//         });

//         return {
//             ...prev,
//             [itemId]: newQty,
//         };
//     });
// };
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

const updateCart = (itemId, delta, index, itemName, itemAmount) => {
    const amount = parseFloat(itemAmount || 0);

    setCart(prev => {
        const newQty = Math.max(0, (prev[itemId] || 0) + delta);

        let rowIndex = itemRowMap.current[itemId];

        // ➤ If row does NOT exist yet → create one
        if (rowIndex === undefined) {
            rowIndex = fields.length; // next row index
            itemRowMap.current[itemId] = rowIndex;

            append({
                Item_Name: itemName,
                Item_Price: amount,
                Item_Quantity: newQty,
                Amount: (amount * newQty).toFixed(2),
            });
        }

        // ➤ Update existing row
        setValue(`items.${rowIndex}.Item_Name`, itemName);
        setValue(`items.${rowIndex}.Item_Price`, amount);
        setValue(`items.${rowIndex}.Item_Quantity`, newQty);
        setValue(`items.${rowIndex}.Amount`, (amount * newQty).toFixed(2));
        
 setTimeout(() => updateTotals(), 0);
        return {
            ...prev,
            [itemId]: newQty
        };
    });
};


    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
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
                                        <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Add New Order</h4>
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


                                    <div className="grid grid-cols-3  p-2 mt-2 gap-6 w-full heading-wrapper">


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
                                        <div></div>

                                        {/* RIGHT PANEL showing selected tables */}
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
                                                {/* TOP HEADER */}
                                                {/* <div
    className="
      max-w-7xl mx-auto 
      flex flex-col gap-3
      sm:flex-row sm:justify-between sm:items-center
    "
  >
    
    <div className="text-center sm:text-left">
      {/* <h1 className="text-3xl font-bold text-gray-800">Food Menu</h1>
      <p className="text-gray-500 text-sm">Fresh & Delicious</p> 
    </div>

    
   
  </div> */}


                                                {/* <div className="max-w-7xl mx-auto px-4">
                                                    <div className="
    flex items-center justify-between 
    gap-4 
    overflow-x-auto 
    scrollbar-hide 
    py-2
  ">

                                                       
                                                        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
                                                            {categories.map(cat => (
                                                                <button
                                                                    key={cat}
                                                                    onClick={() => setActiveCategory(cat)}
                                                                    className={`
            px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all
            ${activeCategory === cat
                                                                            ? 'text-white shadow-lg scale-105'
                                                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
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

                                                       
                                                         <div className="relative min-w-[40px] flex justify-end">
                                                            <ShoppingCart className="w-8 h-8" style={{ color: "#4CA1AF" }} />
                                                            {totalItems > 0 && (
                                                                <span className="
          absolute -top-2 -right-2 bg-red-500 text-white 
          text-xs font-bold rounded-full w-6 h-6 
          flex items-center justify-center
        ">
                                                                    {totalItems}
                                                                </span>
                                                            )}
                                                        </div> 

                                                    </div>
                                                </div> */}
  


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

                                            {/* Floating Cart Summary */}
                                            {/* {totalItems > 0 && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6" />
            <div>
              <div className="font-bold">{totalItems} Items</div>
              <div className="text-sm opacity-90">View Cart</div>
            </div>
          </div>
        </div>
      )} */}
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
        disabled={formValues.errorCount > 0 || isAddingOrder}
        className="relative w-full md:w-auto flex items-center justify-center gap-3 
                   text-white font-bold py-2 px-5 rounded shadow"
        style={{ backgroundColor: "#4CA1AF" }}
      >
        {isAddingOrder ? "Saving..." : "Save & Hold"}

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
        type="submit"
        className="w-full md:w-auto text-white font-bold py-2 px-5 rounded shadow"
        style={{ backgroundColor: "#4CA1AF" }}
      >
        Save & Pay Bill
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

            //                                                 key={item.id}
            //                                                 className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl 
            //  transition-all duration-300 hover:-translate-y-1"
            //                                             >
            //                                                 {/* IMAGE SECTION */}
            //                                                 <div className="relative bg-gradient-to-br from-[#4CA1AF33] to-[#4CA1AF55]">

            //                                                     {/* Background Image */}
            //                                                     <img
            //                                                         src={
            //                                                             item?.Item_Image
            //                                                                 ? `http://localhost:4000/uploads/food-item/${item.Item_Image}`
            //                                                                 : ""
            //                                                         }
            //                                                         alt={item.Item_Name}
            //                                                         className="w-full h-full object-cover opacity-90"
            //                                                     />

            //                                                     {/* Soft Overlay */}
            //                                                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            //                                                     {/* CATEGORY BADGE */}
            //                                                     <div className="absolute top-2 right-2">
            //                                                         <span className="bg-white/90 px-2 py-1 rounded-full text-xs font-semibold text-[#4CA1AF] shadow">
            //                                                             {item.Item_Category}
            //                                                         </span>
            //                                                     </div>

            //                                                     {/* ITEM TITLE */}
            //                                                     <div className="absolute bottom-2 left-3 right-3">
            //                                                         <h3 className="text-white text-lg font-semibold">{item.Item_Name}</h3>
            //                                                         {/* <p className="text-white/80 text-xs">{item.Item_Id}</p> */}
            //                                                     </div>
            //                                                     {/* DETAILS */}
            //                                                 <div className="p-3">
            //                                                     <div className="flex justify-between items-center mb-3">
            //                                                         <div>
            //                                                             <div className="text-xl font-semibold text-gray-800">
            //                                                                 ₹{parseFloat(item.Item_Price).toFixed(2)}
            //                                                             </div>
            //                                                             <div className="text-xs text-gray-500">
            //                                                                 {/* +₹{item?.Tax_Amount} {`${TAX_RATES[item?.Tax_Type]+"%"}`} */}
            //                                                                 {`Tax:-${TAX_RATES[item?.Tax_Type] + "%"}`}
            //                                                             </div>
            //                                                         </div>

            //                                                         <div className="text-right">
            //                                                             <div className="text-sm font-bold text-[#4CA1AF]">
            //                                                                 ₹{parseFloat(item.Amount).toFixed(2)}
            //                                                             </div>
            //                                                             <div className="text-xs text-gray-500">Total</div>
            //                                                         </div>
            //                                                     </div>

            //                                                     {/* COMPACT CART CONTROLS */}
            //                                                     <div className="flex items-center justify-between bg-[#4CA1AF10] rounded-lg p-2">
                                                                  
                                                                   
            //                                                             <div className="flex items-center justify-between w-full">
                                                                       
            //                                                                 <button
            //                                                                     type="button"
            //                                                                     onClick={() => updateCart(item.id, -1,index,item
            //                                                                         ?.Item_Name,
            //                                                                         item?.Amount
            //                                                                     )}
            //                                                                     className="w-9 h-9 flex items-center justify-center bg-white 
            //            rounded-md shadow hover:bg-gray-100 text-[#4CA1AF]
            //            transition"
            //                                                                 >
            //                                                                     <Minus className="w-4 h-4" />
            //                                                                 </button>

                                                                          
            //                                                                 <span className="text-lg font-semibold text-gray-800 px-3">
            //                                                                     {cart[item.id]|| 0}
            //                                                                 </span>

                                                                        
            //                                                                 <button
            //                                                                     type="button"
            //                                                                     onClick={() => updateCart(
            //                                                                         item.id, 1,index,item
            //                                                                         ?.Item_Name,
            //                                                                         item?.Amount)}
            //                                                                     className="w-9 h-9 flex items-center justify-center bg-[#4CA1AF] 
            //            rounded-md text-white shadow hover:bg-[#3a8c98] transition"
            //                                                                 >
            //                                                                     <Plus className="w-4 h-4" />
            //                                                                 </button>
            //                                                             </div>
                                                                   
            //                                                     </div>
            //                                                 </div>
            //                                                 </div>

                                                            
            //                                             </div>
//   <div className="flex justify-center md:justify-end md:w-1/2 sale-wrapper">
//                                             {/* <div className="grid grid-cols-1 mt-2 px-2  lg:grid-cols-3  gap-4 w-full sale-wrapper"> */}
//                                                 {/* Add Row Button */}

//                                                 {/* <div></div> */}
//                                                 {/* <div></div> */}
//                                                 <div style={{ width: "100%" }}
//                                                     className="grid grid-rows-1 px-4 gap-2 w-full sm:w-1/2 lg:w-1/3 ml-auto mr-2 sale-right">

//                                                     <div style={{ width: "100%" }}
//                                                         className="flex justify-between items-start gap-6 w-full mr-4">


//                                                         <div style={{ width: "100%" }}
//                                                             className="flex flex-col gap-4 mt-3 w-full">
//                                                             <div className="flex gap-3 items-center  w-full sm:w-auto">

//                                                                 <div style={{ width: "100%" }} className="flex gap-2 ">
//                                                                     <span className="font-medium whitespace-nowrap">Sub Total</span>

//                                                                     <input
//                                                                         style={{ backgroundColor: "transparent", height: "1rem" }}
//                                                                         type="text"
//                                                                         className="form-control"
//                                                                         {...register("Sub_Total")}
//                                                                         readOnly
//                                                                     />
//                                                                 </div>
//                                                             </div>







//                                                             <div style={{ width: "100%" }}
//                                                                 className="flex  gap-2 items-center ">

//                                                                 <span className="font-medium whitespace-nowrap">Amount</span>
//                                                                 <input
//                                                                     style={{ backgroundColor: "transparent", marginBottom: "0px", height: "1rem", width: "100%" }}
//                                                                     type="text"
//                                                                     className="form-control  "
//                                                                     {...register("Amount")}

//                                                                     readOnly
//                                                                 />
//                                                             </div>

//                                                             <div className="w-full flex gap-3 justify-end items-center">

//                                                                 {/* SAVE AND HOLD — (CART ICON + BADGE) */}
//                                                                 <div style={{ backgroundColor: "#4CA1AF" }}
//                                                                 className="flex flex-row rounded">
//                                                                 <button
//                                                                     type="submit"
//                                                                     disabled={formValues.errorCount > 0 || isAddingOrder}
//                                                                     className="relative text-white
//                                                                      font-bold py-2 px-5 rounded flex items-center gap-3"
//                                                                     style={{ backgroundColor: "#4CA1AF" }}
//                                                                 >
//                                                                     {isAddingOrder ? "Saving..." : "Save and Hold"}
//                                                                 </button>
                                                                
//                                                                     {/* Cart Icon + Badge */}
//                                                                     <span className="relative flex items-center">
//                                                                         <ShoppingCart size={22} />

//                                                                         {totalItems > 0 && (
//                                                                             <span
//                                                                                 className="
//                                                                             absolute -top-2 -right-2 bg-red-500 text-white 
//                                                                                 text-[10px] font-bold w-4 h-4 flex items-center justify-center 
//                                                                                                      rounded-full shadow
//                                                                                                                         "
//                                                                             >
//                                                                                 {totalItems}
//                                                                             </span>
//                                                                         )}
//                                                                     </span>
                                                                    
                                                                
//                                                                 </div>

//                                                                         <div>
//                                                                 {/* SAVE & PAY BILL — Normal Button */}
//                                                                 <button
//                                                                     type="submit"
//                                                                     className="text-white font-bold py-2 px-5 rounded"
//                                                                     style={{ backgroundColor: "#4CA1AF" }}
//                                                                 >
//                                                                     Save and Pay Bill
//                                                                 </button>
//                                                                 </div>

//                                                             </div>


//                                                             {/* <div style={{ width: "100%" }} className="flex gap-2 justify-end">
//                                                             <button
//                                                                 type="submit"
//                                                                 disabled={formValues.errorCount > 0 || isAddingOrder}
//                                                                 // onClick={() => navigate("/staff/orders/all-orders")}
//                                                                 className=" text-white font-bold py-2 px-4 rounded"
//                                                                 style={{ backgroundColor: "#4CA1AF" }}
//                                                             >
//                                                                 {isAddingOrder ? "Saving..." : "Save and Hold"}
//                                                             </button>
//                                                             <button
//                                                                 type="submit"

//                                                                 className=" text-white font-bold py-2 px-4 rounded"
//                                                                 style={{ backgroundColor: "#4CA1AF" }}
//                                                             >
//                                                                 Save and Pay Bill
//                                                             </button>
//                                                         </div> */}
//                                                         </div>

//                                                     </div>
//                                                 </div>



//                                             </div>

                                                                        {/* <button
                                                                            type="button"
                                                                            onClick={() => updateCart(item.id, 1,index,item
                                                                                ?.Item_Name,
                                                                                item?.Amount)}
                                                                            className="
            w-full py-2 
            bg-[#4CA1AF] text-white rounded-lg 
            shadow hover:bg-[#3a8c98] 
            font-medium transition
          "
                                                                        >
                                                                            Add to Cart
                                                                        </button>
                                                                    } */}
  // <div
                                                        //   key={item.id}
                                                        //   className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                                                        // >
                                                        //   {/* Image Background */}
                                                        //   <div className="relative h-56 overflow-hidden bg-gradient-to-br from-orange-200 to-red-200">
                                                        //     <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
                                                        //       <img
                                                        //         src={item?.Item_Image ? `http://localhost:4000/uploads/food-item/${item.Item_Image}` : ''}
                                                        //         alt={item.Item_Name}
                                                        //         className="w-full h-full object-cover"
                                                        //       />
                                                        //     </div>
                                                        //     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                                        //     {/* Category Badge */}
                                                        //     <div className="absolute top-3 right-3">
                                                        //       <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-orange-600">
                                                        //         {item.Item_Category}
                                                        //       </span>
                                                        //     </div>

                                                        //     {/* Item Name */}
                                                        //     <div className="absolute bottom-3 left-3 right-3">
                                                        //       <h3 className="text-white text-xl font-bold capitalize">
                                                        //         {item.Item_Name}
                                                        //       </h3>
                                                        //       <p className="text-white/80 text-xs mt-1">{item.Item_Id}</p>
                                                        //     </div>
                                                        //   </div>

                                                        //   {/* Details Section */}
                                                        //   <div className="p-4">
                                                        //     <div className="flex justify-between items-center mb-4">
                                                        //       <div>
                                                        //         <div className="text-2xl font-bold text-gray-800">
                                                        //           ₹{parseFloat(item.Item_Price).toFixed(2)}
                                                        //         </div>
                                                        //         <div className="text-xs text-gray-500">
                                                        //           +₹{item.Tax_Amount} {item.Tax_Type}
                                                        //         </div>
                                                        //       </div>
                                                        //       <div className="text-right">
                                                        //         <div className="text-sm font-semibold text-orange-600">
                                                        //           ₹{parseFloat(item.Amount).toFixed(2)}
                                                        //         </div>
                                                        //         <div className="text-xs text-gray-500">Total</div>
                                                        //       </div>
                                                        //     </div>

                                                        //     {/* Quantity Controls */}
                                                        //     <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-2">
                                                        //       {cart[item.id] > 0 ? (
                                                        //         <div className="flex items-center justify-between w-full">
                                                        //           <button
                                                        //           type="button"
                                                        //             onClick={() => updateCart(item.id, -1)}
                                                        //             className="w-10 h-10 rounded-lg bg-white shadow-md hover:shadow-lg flex items-center justify-center text-orange-600 hover:bg-orange-50 transition-all"
                                                        //           >
                                                        //             <Minus className="w-5 h-5" />
                                                        //           </button>
                                                        //           <span className="text-xl font-bold text-gray-800 px-4">
                                                        //             {cart[item.id]}
                                                        //           </span>
                                                        //           <button
                                                        //           type="button"
                                                        //             onClick={() => updateCart(item.id, 1)}
                                                        //             className="w-10 h-10 rounded-lg bg-orange-500 shadow-md hover:shadow-lg flex items-center justify-center text-white hover:bg-orange-600 transition-all"
                                                        //           >
                                                        //             <Plus className="w-5 h-5" />
                                                        //           </button>
                                                        //         </div>
                                                        //       ) : (
                                                        //         <button
                                                        //           onClick={() => updateCart(item.id, 1)}
                                                        //           className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-orange-600 hover:to-red-600 transition-all"
                                                        //         >
                                                        //           Add to Cart
                                                        //         </button>
                                                        //       )}
                                                        //     </div>
                                                        //   </div>
                                                        // </div>
{/* <div className="grid grid-cols-2 gap-6 w-full">

                                                            
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-sm font-medium text-gray-700">Tax Type</label>

                                                                <Controller
                                                                    control={control}
                                                                    name="Tax_Type"
                                                                    render={({ field }) => (
                                                                        <select
                                                                            {...field}
                                                                            className="w-full border rounded-md p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                                       
                                                                            onChange={(e) => {
                                                                                field.onChange(e);

                                                                                const taxType = e.target.value;

                                                                                const updated = calculateInvoiceTotals(taxType, itemsValues);

                                                                                setValue("Tax_Amount", updated.Tax_Amount);
                                                                                setValue("Amount", updated.Amount);
                                                                            }}
                                                                        >
                                                                            <option value="None">None</option>
                                                                            <option value="GST0">GST @0%</option>
                                                                            <option value="IGST0">IGST @0%</option>
                                                                            <option value="GST0.25">GST @0.25%</option>
                                                                            <option value="IGST0.25">IGST @0.25%</option>
                                                                            <option value="GST3">GST @3%</option>
                                                                            <option value="IGST3">IGST @3%</option>
                                                                            <option value="GST5">GST @5%</option>
                                                                            <option value="IGST5">IGST @5%</option>
                                                                            <option value="GST12">GST @12%</option>
                                                                            <option value="IGST12">IGST @12%</option>
                                                                            <option value="GST18">GST @18%</option>
                                                                            <option value="IGST18">IGST @18%</option>
                                                                            <option value="GST28">GST @28%</option>
                                                                            <option value="IGST28">IGST @28%</option>
                                                                            <option value="GST40">GST @40%</option>
                                                                            <option value="IGST40">IGST @40%</option>
                                                                        </select>
                                                                    )}
                                                                />
                                                            </div>

                                                          
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-sm font-medium text-gray-700">Tax Amount</label>

                                                                <input
                                                                    type="text"
                                                                    {...register("Tax_Amount")}
                                                                    readOnly
                                                                    className="form-control"
                                                                />
                                                            </div>

                                                        </div> */}