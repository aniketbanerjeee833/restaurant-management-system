import { useGetAllFoodItemsQuery } from "../../redux/api/foodItemApi";
import { tableApi, useGetAllTablesQuery } from "../../redux/api/tableApi";


import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {  useFieldArray, useForm } from "react-hook-form";



import { useRef } from "react";
import { useEffect } from "react";

import { toast } from "react-toastify";

import { useDispatch, useSelector } from "react-redux";

import { LayoutDashboard } from "lucide-react";




import { useAddOrderMutation } from "../../redux/api/Staff/orderApi";



export default function Orders1() {
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
            Tax_Type: "None",
            Tax_Amount: "0.00",
            Amount: "0.00",
            Sub_Total: "0.00",

            items: [
                {
                    Item_Name: "",
                    Item_Price: "",
                    Item_Quantity: 1,
                    Amount: "0.00",
                }
            ]
        }
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
                                            style={{ backgroundColor: "#ff0000" }}
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
                            </div>
                            <div style={{ padding: "0", backgroundColor: "#f1f1f19d" }} className="tab-inn">
                                <form onSubmit={handleSubmit(onSubmit)}>


                                    <div className="grid grid-cols-3 p-2 mt-2 gap-6 w-full heading-wrapper">

                                        
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







                                    <div className="table-responsive table-desi mt-4">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>

                                                    <th>Sl.No</th>

                                                    <th>Name</th>

                                                    <th>Qty</th>
                                                    {/* <th>Unit</th> */}
                                                    <th>Price/Unit</th>
                                                    {/* <th>Discount</th> */}


                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ maxHeight: "10rem", overflowY: "scroll" }}>
                                                {fields.map((field, i) => (
                                                    <tr key={field.id}>
                                                        {/* Action + Serial Number */}
                                                        <td style={{ padding: "0px", textAlign: "center", verticalAlign: "middle" }}>
                                                            <div
                                                                className="flex align-center justify-center text-center gap-2"
                                                                style={{ whiteSpace: "nowrap" }}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteRow(i)}
                                                                    style={{
                                                                        background: "transparent",
                                                                        border: "none",
                                                                        color: "red",
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    🗑
                                                                </button>
                                                                <span>{i + 1}</span>
                                                            </div>
                                                        </td>



                                                    
                                                        <td style={{ padding: "0px", width: "70%", position: "relative" }}>
                                                            <div ref={(el) => (itemRefs.current[i] = el)}> {/* ✅ attach ref */}
                                                                <input
                                                                    type="text"
                                                                    value={rows[i]?.itemSearch || ""}
                                                                    onChange={(e) => {
                                                                        const typedValue = e.target.value;
                                                                        handleRowChange(i, "itemSearch", typedValue);
                                                                        // handleRowChange(i, "CategoryOpen", false);

                                                                        setValue(`items.${i}.Item_Name`, typedValue, { shouldValidate: true, shouldDirty: true });
                                                                        // setValue(`items.${i}.Item_Name`, typedValue);

                                                                        handleRowChange(i, "isExistingItem", false);
                                                                        handleRowChange(i, "isUnitLocked", false);
                                                                        // ✅ If typed value doesn’t match any existing item → unlock category
                                                                        const exists = menuItems?.foodItems?.some(
                                                                            (it) => it.Item_Name.trim().toLowerCase() === typedValue.toLowerCase()
                                                                        );
                                                                        handleRowChange(i, "isExistingItem", exists); // false if new item
                                                                    }}
                                                                    onClick={() => handleRowChange(i, "itemOpen", !rows[i]?.itemOpen)}
                                                                    placeholder="Item Name"
                                                                    className="w-full outline-none border-b-2 text-gray-900"
                                                                />
                                                               
                                                                {errors?.items?.[i]?.Item_Name && (
                                                                    <p className="text-red-500 text-xs mt-1">
                                                                        {errors?.items?.[i]?.Item_Name?.message}
                                                                    </p>
                                                                )}
                                                                {/* Dropdown List */}
                                                                {rows[i]?.itemOpen && (
                                                                    <div
                                                                        style={{ width: "40rem" }}
                                                                        className="absolute z-20  w-full bg-white border
      border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                                                                    >
                                                                        <table className="w-full text-sm border-collapse">
                                                                            <thead className="bg-gray-100 border-b">
                                                                                <tr>
                                                                                    <th>Sl.No</th>
                                                                                    <th className="text-left px-3 py-2"> Name</th>
                                                                                    <th className="text-left px-3 py-2">Item Price</th>
                                                                                    {/* <th className="text-left px-3 py-2">Purchase Price (Previous)</th> */}
                                                                                    {/* <th className="text-left px-3 py-2">Current Stock</th> */}
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {menuItems?.foodItems
                                                                                    ?.filter((it) =>
                                                                                        it.Item_Name.toLowerCase().includes(
                                                                                            (rows[i]?.itemSearch || "").toLowerCase()
                                                                                        )
                                                                                    )
                                                                                    .map((it, idx) => (
                                                                                        <tr
                                                                                            key={idx}
                                                                                            // onClick={() => {

                                                                                            //     setRows((prev) => {
                                                                                            //         const updated = [...prev];
                                                                                            //         updated[i] = {
                                                                                            //             ...updated[i],
                                                                                            //             // Item_Category: it.Item_Category || "",
                                                                                            //             // Item_HSN: it.Item_HSN || "",
                                                                                            //             //categorySearch: it.Item_Category || "", // ✅ sync UI state
                                                                                            //             isExistingItem: true,   // lock category
                                                                                            //             //isHSNLocked: true,      
                                                                                            //             //isUnitLocked: true,     // lock unit
                                                                                            //         };
                                                                                            //         return updated;
                                                                                            //     });
                                                                                            //     handleRowChange(i, "itemSearch", it.Item_Name);
                                                                                            //     handleRowChange(i, "isExistingItem", true); // ✅ mark as existing
                                                                                            //     //handleRowChange(i, "CategoryOpen", false);
                                                                                            //     //setValue(`items.${i}.Item_Category`, it.Item_Category, { shouldValidate: true , shouldDirty: true});
                                                                                            //     setValue(`items.${i}.Item_Price`, it.Item_Price, { shouldValidate: true, shouldDirty: true });
                                                                                            //     setValue(`items.${i}.Item_Name`, it.Item_Name, { shouldValidate: true, shouldDirty: true });
                                                                                            //     // setValue(`items.${i}.Item_HSN`, it.Item_HSN, { shouldValidate: true , shouldDirty: true});

                                                                                            //     setValue(`items.${i}.Quantity`, 1, { shouldValidate: true, shouldDirty: true });

                                                                                            //     handleRowChange(i, "itemOpen", false);
                                                                                            //     const updated = calculateRowAmount(
                                                                                            //         {
                                                                                            //             ...itemsValues[i],
                                                                                            //             Item_Name: it.Item_Name,

                                                                                            //             Quantity: itemsValues[i]?.Quantity || 1,


                                                                                            //         },
                                                                                            //         i,
                                                                                            //         itemsValues
                                                                                            //     );

                                                                                            //     setValue(`items.${i}.Amount`, updated.Row_Amount);
                                                                                            //     setValue("Sub_Total", updated.Sub_Total);
                                                                                            //     setValue("Tax_Amount", updated.Tax_Amount);
                                                                                            //     setValue("Amount", updated.Amount);


                                                                                            //     // const { Tax_Amount, Amount, Sub_Total } = calculateRowAmount(
                                                                                            //     //     {
                                                                                            //     //         ...itemsValues[i],
                                                                                            //     //         Item_Name: it.Item_Name,

                                                                                            //     //         Quantity: itemsValues[i]?.Quantity || 1,


                                                                                            //     //     },
                                                                                            //     //     i,
                                                                                            //     //     itemsValues
                                                                                            //     // );

                                                                                            //     // setValue(`Tax_Amount`, Tax_Amount, { shouldValidate: true, shouldDirty: true });
                                                                                            //     // setValue(`items.${i}.Amount`, Amount, { shouldValidate: true, shouldDirty: true });
                                                                                            //     // setValue("Sub_Total", Sub_Total, { shouldValidate: true, shouldDirty: true });

                                                                                            //     //setValue(`items.${i}.Tax_Amount`, Tax_Amount, { shouldValidate: true, shouldDirty: true });
                                                                                            //     // setValue(`items.${i}.Amount`, Amount, { shouldValidate: true, shouldDirty: true });
                                                                                            //     // setValue(`Sub_Total`, Sub_Total, { shouldValidate: true, shouldDirty: true });
                                                                                            //     // setValue(`Balance_Due`, Balance_Due, { shouldValidate: true, shouldDirty: true });
                                                                                            // }}
                                                                                            onClick={() => {
                                                                                                setRows((prev) => {
                                                                                                    const updated = [...prev];
                                                                                                    updated[i] = {
                                                                                                        ...updated[i],
                                                                                                        // Item_Category: it.Item_Category || "",
                                                                                                        // Item_HSN: it.Item_HSN || "",
                                                                                                        //categorySearch: it.Item_Category || "", // ✅ sync UI state
                                                                                                        isExistingItem: true,   // lock category
                                                                                                        //isHSNLocked: true,      
                                                                                                        //isUnitLocked: true,     // lock unit
                                                                                                    };
                                                                                                    return updated;
                                                                                                });
                                                                                                // 1️⃣ Update form values for the selected row
                                                                                                //setValue(`items.${i}.Item_Name`, it.Item_Name);
                                                                                                //setValue(`items.${i}.Item_Price`, it.Item_Price);
                                                                                                setValue(`items.${i}.Item_Quantity`, itemsValues[i]?.Item_Quantity || 1);
                                                                                                handleRowChange(i, "itemSearch", it.Item_Name);
                                                                                                handleRowChange(i, "isExistingItem", true); // ✅ mark as existing


                                                                                                setValue(`items.${i}.Item_Price`, it.Item_Price, { shouldValidate: true, shouldDirty: true });
                                                                                                setValue(`items.${i}.Item_Name`, it.Item_Name, { shouldValidate: true, shouldDirty: true });

                                                                                                handleRowChange(i, "itemOpen", false);

                                                                                                // 2️⃣ Build updated items array for accurate subtotal/tax calculation
                                                                                                const updatedItems = itemsValues.map((r, idx) =>
                                                                                                    idx === i
                                                                                                        ? {
                                                                                                            ...r,
                                                                                                            Item_Name: it.Item_Name,
                                                                                                            Item_Price: it.Item_Price,
                                                                                                            Item_Quantity: r.Item_Quantity || 1,
                                                                                                        }
                                                                                                        : r
                                                                                                );

                                                                                                // 3️⃣ Get current Tax Type (needed for correct tax calculation)
                                                                                                const taxType = watch("Tax_Type");

                                                                                                // 4️⃣ Calculate totals using updated items
                                                                                                const updated = calculateInvoiceTotals(taxType, updatedItems);

                                                                                                // 5️⃣ Update UI fields
                                                                                                setValue(`items.${i}.Amount`, (it.Item_Price * (itemsValues[i]?.Item_Quantity || 1)).toFixed(2));
                                                                                                setValue("Sub_Total", updated.Sub_Total);
                                                                                                setValue("Tax_Amount", updated.Tax_Amount);
                                                                                                setValue("Amount", updated.Amount);
                                                                                            }}

                                                                                            className="hover:bg-gray-100 cursor-pointer border-b"
                                                                                        >
                                                                                            <td>{idx + 1}</td>
                                                                                            <td className="px-3 py-2">{it.Item_Name}</td>

                                                                                            <td className="px-3 py-2 text-gray-600">{it.Item_Price}</td>
                                                                                            {/* <td className="px-3 py-2 text-gray-600">{it.Purchase_Price || 0}</td> */}
                                                                                            {/* <td style={{color:"transparent"}}
              className={`px-3 py-2 ${it.Stock_Quantity <= 0 ? "text-red-500" : "text-green-500"}`}>
                {it.Stock_Quantity || 0}</td> */}

                                                                                        </tr>
                                                                                    ))}

                                                                                {menuItems?.foodItems?.filter((it) =>
                                                                                    it.Item_Name.toLowerCase().includes(
                                                                                        (rows[i]?.itemSearch || "").toLowerCase()
                                                                                    )
                                                                                ).length === 0 && (
                                                                                        <tr>
                                                                                            <td colSpan={4} className="px-3 py-2 text-gray-400 text-center">
                                                                                                No material found
                                                                                            </td>
                                                                                        </tr>
                                                                                    )}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                )}



                                                            </div>
                                                        </td>





                                                        <td style={{ padding: "0px", width: "5%" }}>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                style={{ width: "100%" }}
                                                                value={watch(`items.${i}.Item_Quantity`)?.toString() || ""}
                                                                {...register(`items.${i}.Item_Quantity`)}
                                                                // onChange={(e) => {
                                                                //     let value = e.target.value.replace(/[^0-9]/g, "");


                                                                //     // if (!itemsValues[i]?.Item_Name?.trim()) return;

                                                                //     // ✅ Clamp value
                                                                //     // let num = parseInt(value, 10);

                                                                //     // if (isNaN(num) || num < 0) {
                                                                //     //     num = 0; // reset to 0
                                                                //     // }
                                                                //     if (value === "") {
                                                                //         setValue(`items.${i}.Item_Quantity`, "", { shouldValidate: true });
                                                                //         return;
                                                                //     }

                                                                //     // ✅ Update only via RHF
                                                                //     setValue(`items.${i}.Item_Quantity`, value, { shouldValidate: true });

                                                                //     // ✅ Recalculate row + totals
                                                                //     const updated = calculateRowAmount(
                                                                //         { ...itemsValues[i], Item_Quantity: value },
                                                                //         i,
                                                                //         itemsValues
                                                                //     );

                                                                //     setValue(`items.${i}.Amount`, updated.Row_Amount);
                                                                //     setValue("Sub_Total", updated.Sub_Total);
                                                                //     setValue("Tax_Amount", updated.Tax_Amount);
                                                                //     setValue("Amount", updated.Amount);


                                                                //     // const updated = calculateRowAmount(
                                                                //     //     {
                                                                //     //         ...itemsValues[i],
                                                                //     //         Item_Quantity: value,
                                                                //     //     },
                                                                //     //     i,
                                                                //     //     itemsValues
                                                                //     // )
                                                                //     // setValue(`Tax_Amount`, updated.Tax_Amount);
                                                                //     // setValue(`items.${i}.Amount`, updated.Amount);
                                                                //     // setValue("Sub_Total", updated.Sub_Total);
                                                                // }}
                                                                onChange={(e) => {
                                                                    let value = e.target.value.replace(/[^0-9]/g, "");

                                                                    if (value === "") {
                                                                        setValue(`items.${i}.Item_Quantity`, "", { shouldValidate: true });
                                                                        return;
                                                                    }

                                                                    // Update RHF
                                                                    setValue(`items.${i}.Item_Quantity`, value, { shouldValidate: true });

                                                                    // 🔥 Create updated items list
                                                                    const updatedItems = itemsValues.map((row, idx) =>
                                                                        idx === i
                                                                            ? { ...row, Item_Quantity: value }  // updated quantity
                                                                            : row
                                                                    );

                                                                    // 🔥 Get selected Tax Type
                                                                    const taxType = watch("Tax_Type");

                                                                    // 🔥 Recalculate using the updated items
                                                                    const updated = calculateInvoiceTotals(taxType, updatedItems);

                                                                    // Update row amount
                                                                    const price = Number(updatedItems[i].Item_Price || 0);
                                                                    const rowAmount = (price * Number(value)).toFixed(2);

                                                                    setValue(`items.${i}.Amount`, rowAmount);
                                                                    setValue("Sub_Total", updated.Sub_Total);
                                                                    setValue("Tax_Amount", updated.Tax_Amount);
                                                                    setValue("Amount", updated.Amount);
                                                                }}

                                                                placeholder="Qty"
                                                            />
                                                            {errors?.items?.[i]?.Item_Quantity && (
                                                                <p className="text-red-500 text-xs mt-1">
                                                                    {errors.items[i].Item_Quantity.message}
                                                                </p>
                                                            )}
                                                        </td>



                                                        {/*  Price */}
                                                        <td style={{ padding: "0px", width: "10%" }}>
                                                            <div className="d-flex align-items-center">
                                                                <input
                                                                    readOnly
                                                                    type="text"
                                                                    className="form-control"
                                                                    style={{ width: "100%", marginBottom: "0px" }}
                                                                    {...register(`items.${i}.Item_Price`)}
                                                                    onChange={(e) => {
                                                                        let val = e.target.value;

                                                                        // ✅ allow digits and one dot
                                                                        val = val.replace(/[^0-9.]/g, "");

                                                                        // ✅ if more than one dot, keep only the first
                                                                        const parts = val.split(".");
                                                                        if (parts.length > 2) {
                                                                            val = parts[0] + "." + parts.slice(1).join(""); // collapse extra dots
                                                                        }

                                                                        // ✅ limit to 2 decimal places
                                                                        if (val.includes(".")) {
                                                                            const [int, dec] = val.split(".");
                                                                            val = int + "." + dec.slice(0, 2);
                                                                        }

                                                                        e.target.value = val;

                                                                        if (!itemsValues[i]?.Item_Name || itemsValues[i]?.Item_Name.trim() === "") {
                                                                            return;
                                                                        }

                                                                        // const { Tax_Amount, Amount, Sub_Total } = calculateRowAmount({
                                                                        //     ...itemsValues[i],
                                                                        //     Item_Price: val,
                                                                        // });

                                                                        // setValue(`Tax_Amount`, Tax_Amount);
                                                                        // setValue(`items.${i}.Amount`, Amount);
                                                                        // setValue("Sub_Total", Sub_Total);
                                                                        // setValue("Sub_Total", Sub_Total);
                                                                        // ✅ Recalculate row + totals
                                                                        const updated = calculateRowAmount(
                                                                            { ...itemsValues[i], Item_Price: val },
                                                                            i,
                                                                            itemsValues
                                                                        );

                                                                        setValue(`items.${i}.Amount`, updated.Row_Amount);
                                                                        setValue("Sub_Total", updated.Sub_Total);
                                                                        setValue("Tax_Amount", updated.Tax_Amount);
                                                                        setValue("Amount", updated.Amount);


                                                                    }}

                                                                    placeholder="Price"
                                                                />

                                                            </div>
                                                            {errors?.items?.[i]?.Item_Price && (
                                                                <p className="text-red-500 text-xs mt-1">
                                                                    {errors.items[i].Item_Price.message}
                                                                </p>
                                                            )}
                                                        </td>



                                                        {/* Amount */}
                                                        <td style={{ width: "10%" }}>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                style={{ backgroundColor: "transparent" }}
                                                                {...register(`items.${i}.Amount`)}
                                                                readOnly
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>


                                        </table>

                                        <div className="grid grid-cols-3 mt-2 px-2 sm:grid-cols-3  gap-4 w-full sale-wrapper">
                                            {/* Add Row Button */}
                                            <div className="flex flex-col px-2 w-full sm:w-64 sale-left">
                                                <button
                                                    type="button"
                                                    onClick={handleAddRow}
                                                    className=" text-white font-bold py-2 px-4 w-1/2 rounded "
                                                    style={{ backgroundColor: "#ff0000" }}
                                                >
                                                    + Add Row
                                                </button>


                                            </div>
                                            <div></div>
                                            <div style={{ width: "100%" }}
                                                className="grid grid-rows-1 px-4 gap-2 w-full sm:w-1/2 lg:w-1/3 ml-auto mr-2 sale-right">

                                                <div style={{ width: "100%" }}
                                                    className="flex justify-between items-start gap-6 w-full mr-4">
                                                    {/* <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id="roundOffCheck"
                                                            className="w-4 h-4 cursor-pointer"
                                                            onChange={(e) => {
                                                                const isChecked = e.target.checked;
                                                                const totalAmount = parseFloat(watch("Sub_Total"));
                                                                //const totalPaid = parseFloat(watch("Total_Paid")) || 0;

                                                                if (!totalAmount || isNaN(totalAmount)) return;

                                                                if (isChecked) {
                                                                    setOriginalTotal(totalAmount);

                                                                    // Round off to nearest integer
                                                                    const rounded = Math.round(totalAmount);

                                                                    setValue("Sub_Total", rounded.toFixed(2), { shouldValidate: true });
                                                                    //setValue("Balance_Due", (rounded - totalPaid).toFixed(2), { shouldValidate: true });

                                                                } else {
                                                                    if (originalTotal !== null) {
                                                                        setValue("Sub_Total", originalTotal.toFixed(2), { shouldValidate: true });

                                                                        // setValue(
                                                                        //   "Balance_Due",
                                                                        //   (originalTotal - totalPaid).toFixed(2),
                                                                        //   { shouldValidate: true }
                                                                        // );
                                                                    }
                                                                }
                                                            }}
                                                        />

                                                        <span className="font-medium whitespace-nowrap">Round Off</span>


                                                        <input

                                                            type="text"

                                                            style={{ marginTop: "10px", width: "60px", height: "1.5rem" }}
                                                            className="w-3  border border-gray-300  text-right text-sm"
                                                            {...register("Round_Off")}
                                                            onChange={(e) => {
                                                                const val = parseFloat(e.target.value) || 0;
                                                                const totalAmount = originalTotal ?? parseFloat(watch("Sub_Total"));
                                                                //const totalPaid = parseFloat(watch("Total_Paid")) || 0;

                                                                if (isNaN(totalAmount)) return;

                                                                // New Total
                                                                const newTotal = totalAmount + val;

                                                                setValue("Sub_Total", newTotal.toFixed(2));
                                                                //setValue("Balance_Due", (newTotal - totalPaid).toFixed(2), { shouldValidate: true });
                                                            }}
                                                        // disabled={!watch("roundOffCheck") && originalTotal === null}
                                                        />
                                                    </div> */}

                                                    <div style={{ width: "100%" }}
                                                        className="flex flex-col gap-4 mt-3 w-full">
                                                        <div className="flex gap-3 items-center  w-full sm:w-auto">

                                                            <div style={{ width: "100%" }} className="flex gap-2 ">
                                                                <span className="font-medium whitespace-nowrap">Sub Total</span>

                                                                <input
                                                                    style={{ backgroundColor: "transparent", height: "1rem" }}
                                                                    type="text"
                                                                    className="form-control"
                                                                    {...register("Sub_Total")}
                                                                    readOnly
                                                                />
                                                            </div>
                                                        </div>




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


                                                        <div style={{ width: "100%" }}
                                                            className="flex  gap-2 items-center ">

                                                            <span className="font-medium whitespace-nowrap">Amount</span>
                                                            <input
                                                                style={{ backgroundColor: "transparent", marginBottom: "0px", height: "1rem", width: "100%" }}
                                                                type="text"
                                                                className="form-control  "
                                                                {...register("Amount")}

                                                                readOnly
                                                            />
                                                        </div>



                                                        <div style={{ width: "100%" }} className="flex gap-2 justify-end">
                                                            <button
                                                                type="submit"
                                                                disabled={formValues.errorCount > 0 || isAddingOrder}
                                                                // onClick={() => navigate("/staff/orders/all-orders")}
                                                                className=" text-white font-bold py-2 px-4 rounded"
                                                                style={{ backgroundColor: "#ff0000" }}
                                                            >
                                                                {isAddingOrder ? "Saving..." : "Save and Hold"}
                                                            </button>
                                                            <button
                                                                type="button"

                                                                className=" text-white font-bold py-2 px-4 rounded"
                                                                style={{ backgroundColor: "#ff0000" }}
                                                            >
                                                                Save and Pay Bill
                                                            </button>
                                                        </div>
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

{/* Discount */ }
{/* <td style={{ padding: "0px", width: "14%" }}>
                                                            <div className="d-flex align-items-center">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    style={{ width: "50%", marginBottom: "0px" }}
                                                                    {...register(`items.${i}.Discount_On_Sale_Price`)}
                                                                    onInput={(e) => {
                                                                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                                                                        //                 const { Tax_Amount, Amount ,Sub_Total} = calculateRowAmount({
                                                                        //   ...itemsValues[i],

                                                                        //   Discount_On_Sale_Price: e.target.value,

                                                                        // });
                                                                        const { Tax_Amount, Amount, Sub_Total, Balance_Due } = calculateRowAmount(
                                                                            { ...itemsValues[i], Discount_On_Sale_Price: e.target.value },
                                                                            i,
                                                                            itemsValues
                                                                        );

                                                                        setValue(`items.${i}.Tax_Amount`, Tax_Amount, { shouldValidate: true });
                                                                        setValue(`items.${i}.Amount`, Amount, { shouldValidate: true });
                                                                        setValue("Sub_Total", Sub_Total, { shouldValidate: true });
                                                                        setValue("Balance_Due", Balance_Due, { shouldValidate: true });
                                                                        // setValue(`items.${i}.Tax_Amount`, Tax_Amount);
                                                                        // setValue(`items.${i}.Amount`, Amount);

                                                                    }}
                                                                    placeholder="Discount"
                                                                />
                                                                <Controller
                                                                    control={control}
                                                                    name={`items.${i}.Discount_Type_On_Sale_Price`}
                                                                    render={({ field }) => (
                                                                        <select
                                                                            {...field}
                                                                            className="form-select ms-2"
                                                                            style={{ width: "50%", fontSize: "12px" }}
                                                                            onChange={(e) => {
                                                                                field.onChange(e);


                                                                                const { Tax_Amount, Amount, Sub_Total, Balance_Due } = calculateRowAmount(
                                                                                    { ...itemsValues[i], Discount_Type_On_Sale_Price: e.target.value },
                                                                                    i,
                                                                                    itemsValues
                                                                                );

                                                                                setValue(`items.${i}.Tax_Amount`, Tax_Amount, { shouldValidate: true });
                                                                                setValue(`items.${i}.Amount`, Amount, { shouldValidate: true });
                                                                                setValue("Sub_Total", Sub_Total, { shouldValidate: true });
                                                                                setValue("Balance_Due", Balance_Due, { shouldValidate: true });
                                                                            }}
                                                                        >
                                                                            <option value="Percentage">%</option>
                                                                            <option value="Amount">Amount</option>
                                                                        </select>
                                                                    )}
                                                                />
                                                            </div>
                                                        </td> */}



{/* <td style={{ padding: "0px", width: "10%" }}>
                                                            <Controller
                                                                control={control}
                                                                name={`items.${i}.Tax_Type`}
                                                                render={({ field }) => (
                                                                    <select
                                                                        {...field}
                                                                        className="form-select"
                                                                        style={{ width: "100%", fontSize: "12px", marginBottom: "0px" }}
                                                                        onChange={(e) => {
                                                                            field.onChange(e); // ✅ update RHF value

                                                                            // const { Tax_Amount, Amount,Sub_Total } = calculateRowAmount({
                                                                            //   ...itemsValues[i],
                                                                            //   Tax_Type: e.target.value,
                                                                            // });
                                                                            const { Tax_Amount, Amount, Sub_Total } = calculateRowAmount(
                                                                                { ...itemsValues[i], Tax_Type: e.target.value },
                                                                                i,
                                                                                itemsValues
                                                                            );

                                                                            setValue(`items.${i}.Tax_Amount`, Tax_Amount);
                                                                            setValue(`items.${i}.Amount`, Amount);
                                                                            // setValue("Sub_Total", Sub_Total);
                                                                          
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
                                                        </td>  */}

{/* Tax Amount */ }
{/* <td style={{ width: "8%" }}>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                style={{ backgroundColor: "transparent" }}
                                                                {...register(`items.${i}.Tax_Amount`)}
                                                                readOnly
                                                            />
                                                        </td> */}
{/* <span
                              htmlFor="totalPaidCheck"
                              className="font-medium whitespace-nowrap"
                            >
                              Total Paid
                            </span>
                          
                          </div>

                        
                          <input
                            type="text"
                            {...register("Total_Paid")}
                            style={{ marginBottom: "0px", height: "1rem", width: "100%" }}
                            
                            onChange={(e) => {
                              let val = e.target.value.replace(/[^0-9.]/g, "");

                              // Allow only one dot
                              const parts = val.split(".");
                              if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");

                              // Limit to 2 decimals
                              if (val.includes(".")) {
                                const [int, dec] = val.split(".");
                                val = int + "." + dec.slice(0, 2);
                              }

                              e.target.value = val;
                              setValue("Total_Paid", val);

                              const totalPaid = parseFloat(val || 0);
                              const totalAmount = parseFloat(watch("Sub_Total") || 0);
                              setValue("Balance_Due", (totalAmount - totalPaid).toFixed(2), { shouldValidate: true });
                            }}
                            className="form-control"
                          /> */}



{/* <div style={{width:"100%"}} className="grid grid-cols-2   gap-6 relative ">
                        
                          <div  style={{width:"100%"}} className="grid grid-cols-2   gap-4 relative">
                        
                         
                            <div className="flex flex-col gap-2">
                                <span>Tax Type</span>
                          <Controller control={control}
                                                                 name={`Tax_Type`}
                                                                render={({ field }) => (
                                                                    <select
                                                                        {...field}
                                                                        className="form-select"
                                                                        style={{ width: "100%", fontSize: "12px", marginBottom: "0px" }}
                                                                        onChange={(e) => {
                                                                            field.onChange(e); // ✅ update RHF value

                                                                          
                                                                            const { Tax_Amount, Amount, Sub_Total } = calculateRowAmount(
                                                                                {  Tax_Type: e.target.value },
                                                                                
                                                                                itemsValues
                                                                            );

                                                                            setValue(`Tax_Amount`, Tax_Amount);
                                                                            setValue(`Amount`, Amount);
                                                                            // setValue("Sub_Total", Sub_Total);
                                                                          
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

                                                   
                                                        <div >
                                                               <span>Tax Amount</span>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                style={{ backgroundColor: "transparent" }}
                                                                {...register(`Tax_Amount`)}
                                                                readOnly
                                                            />
                                                            </div>
                                                        
                        </div>
                        </div> */}