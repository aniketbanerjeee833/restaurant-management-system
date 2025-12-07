import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { itemApi, useAddCategoryMutation, useGetAllCategoriesQuery, useGetAllNewItemsQuery } from "../../redux/api/itemApi";
import { useRef } from "react";
import { useEffect } from "react";

import { toast } from "react-toastify";

import { useDispatch } from "react-redux";



import { foodFormSchema } from "../../schema/foodFormSchema";
import { foodItemApi, useEditSingleFoodItemMutation } from "../../redux/api/foodItemApi";



export default function EditFoodItemModal({ onClose, foodItem, editingFoodItem }) {
    console.log("foodItem", foodItem, editingFoodItem);
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
    const categoryRef = useRef(null);

    const navigate = useNavigate();
    // const { data: parties } = useGetAllPartiesQuery();
    const { data: items } = useGetAllNewItemsQuery();
    console.log(items, "items");
    const { data: categories } = useGetAllCategoriesQuery()
    const [categorySearch, setCategorySearch] = useState("");
    //const [open, setOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    //const[selected,setSelected] = useState([]);
    //const [partySearch, setPartySearch] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [preview, setPreview] = useState(null);
    //const dropdownRef=useRef(null);
    //const[search,setSearch] = useState("");
    //const [showPartyModal, setShowPartyModal] = useState(false);
    // const[showGSTIN,setShowGSTIN]=useState("");
    // const[chequeNumber,setChequeNumber]=useState(false);
    // const[neftNumber,setNeftNumber]=useState(false);
    // const [paymentType, setPaymentType] = useState("")
    const [addCategory] = useAddCategoryMutation();
    //const { data: latestInvoiceNumber } = useGetLatestNewSaleInvoiceNumberQuery();
    // const [showGSTIN, setShowGSTIN] = useState("");
    //console.log(latestInvoiceNumber, "latestInvoiceNumber");
    const [editFoodItem, { isLoading: isAddingFoodItem }] = useEditSingleFoodItemMutation();
    const itemUnits = {

        "pcs": "Pcs",
        "plates": "Plates",
        "btl": "Bottle",

    }

    const handleAddCategory = async () => {

        if (newCategory.trim() === "") {
            return
        }
        else if (newCategory.trim() !== "") {
            try {
                // ✅ Call backend
                const res = await addCategory({
                    body: { Item_Category: newCategory.trim() },
                });

                // Some RTK Query wrappers put the response under `.data`
                const data = res?.data || res;
                console.log("Add Category Response:", data);
                if (data?.success) {
                    const addedCat = newCategory.trim();

                    // ✅ Auto-select the new category (single value)
                    // setSelected(addedCat);
                    setValue("Item_Category", addedCat); // directly set single category

                    // ✅ Refresh cache
                    dispatch(itemApi.util.invalidateTags(["Category"]));

                    // ✅ Reset modal & input
                    setShowModal(false);
                    setNewCategory("");
                    // setOpen(true);
                } else {
                    console.warn("⚠️ Category not added. Response:", data);
                }
            } catch (err) {
                console.error("❌ Error adding category:", err);
            }
        }
    };

    // const [rows, setRows] = useState([
    //     {
    //         CategoryOpen: false, categorySearch: "", preview: null
    //     }
    // ]);
    // const [addNewSale, { isLoading: isAddingSale }] = useAddNewSaleMutation();
    // const[addPurchase,{isLoading:isAddingPurchase}]=useAddPurchaseMutation();
    // // helper to update a field in a specific row
    // const handleRowChange = (index, field, value) => {
    //     setRows((prev) => {
    //         const updated = [...prev];
    //         updated[index] = {
    //             ...updated[index],
    //             [field]: value,
    //         };
    //         return updated;
    //     });
    // };
    // useEffect(() => {
    //     const handleClickOutside = (event) => {
    //         // setRows((prev) =>
    //         //     prev.map((row, idx) => {
    //         //         const catRef = categoryRefs.current[idx];
    //         //         const itemRef = itemRefs.current[idx];

    //         //         const clickedInsideCategory =
    //         //             catRef && catRef.contains(event.target);
    //         //         const clickedInsideItem =
    //         //             itemRef && itemRef.contains(event.target);

    //         //         // if clicked outside both → close
    //         //         if (!clickedInsideCategory && !clickedInsideItem) {
    //         //             return { ...row, CategoryOpen: false, itemOpen: false };
    //         //         }

    //         //         return row;
    //         //     })
    //         // );
    //     };

    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () => {
    //         document.removeEventListener("mousedown", handleClickOutside);
    //     };
    // }, []);

    useEffect(() => {
        function handleClickOutside(e) {
            if (categoryRef.current && !categoryRef.current.contains(e.target)) {
                setCategoryOpen(false);   // CLOSE DROPDOWN
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const {
        register,
        control,

        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(foodFormSchema)
    });


    //    const { fields, append, remove } = useFieldArray({
    //   control,
    //   name: "items",
    // });



    // const handleAddRow = () => {
    //   setRows((prev) => [
    //     ...prev.map((row) => ({
    //       ...row,
    //       CategoryOpen: false,

    //     //   itemOpen: false
    //     })),
    //     {
    //     //   itemSearch: "",
    //     //   itemOpen: false,
    //       CategoryOpen: false,
    //       categorySearch: "",

    //     },
    //   ]);

    //   append({
    //     Item_Name: "",
    //     Item_Image: "",
    //     Item_Category: "",
    //     Item_Price: "",
    //     Item_Quantity: "1",
    //   });
    // };


    // const handleDeleteRow = (i) => {
    //     setRows((prev) => prev.filter((_, idx) => idx !== i)); // remove UI state
    //     remove(i); // remove from form
    // };

    //const itemsValues = watch("items");   // watch all item rows
    //const totalPaid = watch("Total_Paid"); // watch Total_Paid
    const num = (v) => (v === undefined || v === null || v === "" ? 0 : Number(v));

    // const calculateRowAmount = (row) => {
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
    //         //Total_Amount: totalAmount.toFixed(2), // ✅ correct grand total

    //     };
    // };





    //const itemsValues = watch("items"); // watch all rows
    const formValues = watch();
    const price = watch("Item_Price");
    const qty = watch("Item_Quantity");
    const tax = watch("Tax_Type");
    const calculateRowAmount = ({ Item_Price, Item_Quantity, Tax_Type }) => {
        const price = Number(Item_Price) || 0;
        const qty = Number(Item_Quantity) || 1;
        const subtotal = price * qty;

        const taxPercent = TAX_RATES[Tax_Type] || 0;
        const taxAmount = (subtotal * taxPercent) / 100;

        const finalAmount = subtotal + taxAmount;

        return {
            Tax_Amount: taxAmount.toFixed(2),
            Amount: finalAmount.toFixed(2),
        };
    };

    const handleSelect = () => {
        // setRows((prev) => {
        //     const updated = [...prev];
        //     updated[rowIndex] = {
        //         ...updated[rowIndex],
        //         Item_Category: categoryName,
        //         CategoryOpen: false,
        //         isExistingItem: false,   // user-typed, so still editable
        //     };
        //     return updated;
        // });
        setCategoryOpen(false);
        // setValue(`items.${rowIndex}.Item_Category`, categoryName, { shouldValidate: true });
    };





    const handleEdit = async () => {
        const data = formValues; // ← from watch()
        console.log("Editing Food Item:", data);

        // Basic validation
        if (!data.Item_Name || !data.Item_Name.trim()) {
            toast.error("Item Name is required");
            return;
        }
        if (!data.Item_Category || !data.Item_Category.trim()) {
            toast.error("Category is required");
            return;
        }
        if (!data.Item_Price) {
            toast.error("Price is required");
            return;
        }
        if (!data.Item_Quantity) {
            toast.error("Quantity is required");
            return;
        }

        // Build FormData
        const formData = new FormData();

        formData.append("Item_Name", data.Item_Name);
        formData.append("Item_Category", data.Item_Category);
        formData.append("Item_Price", data.Item_Price);
        formData.append("Item_Quantity", data.Item_Quantity);
        formData.append("Tax_Type", data.Tax_Type || "None");
        formData.append("Tax_Amount", data.Tax_Amount || "0.00");
        formData.append("Amount", data.Amount || "0.00");

        // If user selected a new image → upload it
        if (data.Item_Image instanceof File) {
            formData.append("Item_Image", data.Item_Image);
        }
        console.log("Form Data (from RHF):", formData);

        try {
            const res = await editFoodItem({
                Item_Id: foodItem.Item_Id,
                formData
            }).unwrap();


            if (res.success) {
                toast.success("Food Item updated successfully");
                onClose();
                dispatch(foodItemApi.util.invalidateTags(["Food-Item"]));
            }

        } catch (err) {
            console.error("Edit Error:", err);
            toast.error(err?.data?.message || "Failed to update food item");
        }
    };


    // const handleEdit = async () => {
    //     const data=formValues;
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


    // itemsSafe.forEach((item) => {
    //     if (item.Item_Image instanceof File) {
    //         formData.append("images", item.Item_Image);
    //     }
    // });
    //     console.log("📦 Final FormData Prepared",formData);

    //     try {
    //         const res = await editFoodItem(formData).unwrap();

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

    useEffect(() => {
        if (!editingFoodItem) return;

        if (!foodItem) return;
        setPreview(`http://localhost:4000/uploads/food-item/${foodItem?.Item_Image}`);
        reset({
            Item_Name: foodItem.Item_Name,
            Item_Category: foodItem.Item_Category,
            Item_Price: foodItem.Item_Price,
            Item_Quantity: foodItem.Item_Quantity,
            Tax_Type: foodItem.Tax_Type,
            Tax_Amount: foodItem.Tax_Amount,
            Amount: foodItem.Amount

        })
    }, [editingFoodItem, foodItem])



    console.log("Current form values:", formValues);
    console.log("Form errors:", errors);



    return (
        <>
            <div
                style={{
                    position: "fixed",
                    marginTop: "4rem",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0,0,0,0.3)", // dim background
                    backdropFilter: "blur(4px)", // blur effect
                    zIndex: 50,
                    padding: "1rem", // ensures spacing on small screens
                }}
            >
                <div
                    className="bg-white 
      w-full
       max-w-4xl rounded-lg 
      shadow-lg p-6 
    overflow-hidden max-h-[90vh]
      "
                >

                    <div className="flex justify-between items-center mb-6"
                        style={{ marginBottom: "20px", paddingBottom: "10px" }}>
                        <h4 className="text-xl font-semibold text-gray-900">
                            {editingFoodItem ? "Edit Food Item" : "View Food Item"}
                        </h4>
                        <button
                            type="button"
                            style={{
                                backgroundColor: "transparent", height: "30px", width: "30px",
                                fontSize: "20px"
                            }}
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 "
                        >
                            ✕
                        </button>
                    </div>



                    {/* Main Content */}












                    <div>


                        <div className="row">





                            <div className="input-field col s6">

                                <div ref={categoryRef}>
                                    <span className="active">
                                        Category
                                        <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
                                    </span>

                                    <input
                                        type="text"
                                        value={watch(`Item_Category`) || ""}
                                        style={{ marginBottom: "0px" }}
                                        onClick={() => {
                                            setCategoryOpen(true);
                                            // if (!rows[i]?.isExistingItem) {
                                            //     setRows((prev) =>
                                            //         prev.map((row, idx) => ({
                                            //             ...row,
                                            //             CategoryOpen: idx === i ? !row.CategoryOpen : false,
                                            //         }))
                                            //     );
                                            // }
                                        }}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // handleRowChange( "categorySearch", value);
                                            setValue(`Item_Category`, value);
                                            setCategorySearch(value);

                                            // ✅ If user clears or types new item → unlock
                                            // if (!rows[i]?.isExistingItem) {
                                            //     handleRowChange(i, "isExistingItem", false);
                                            // }
                                        }}
                                        onBlur={() => {
                                            const typedValue = watch(`Item_Category`) || "";
                                            // const typedValue = categorySearch || "";
                                            const exists = categories?.some(
                                                (cat) =>
                                                    cat.Item_Category.toLowerCase() === typedValue.toLowerCase()
                                            );

                                            if (!exists) {
                                                // reset if category doesn't exist
                                                // handleRowChange( "categorySearch", "");
                                                setValue(`Item_Category`, "");
                                            }
                                        }}
                                        placeholder="Category"
                                        className="w-full outline-none border-b-2 text-gray-900"
                                    //readOnly={isExistingItem} // 🔒 lock if item exists
                                    />
                                    {errors?.Item_Category && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.Item_Category.message}
                                        </p>
                                    )}



                                    {/* Dropdown List */}
                                    {categoryOpen && (
                                        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {/* Add Category Option */}
                                            <span
                                                onClick={() => {
                                                    setShowModal(true);
                                                    // handleRowChange( "CategoryOpen", false);
                                                }}
                                                className="block px-3 py-2 text-[#4CA1AF] font-medium hover:bg-gray-100 cursor-pointer"
                                            >
                                                + Add Category
                                            </span>

                                            {categories
                                                ?.filter((cat) =>
                                                    cat.Item_Category.toLowerCase().includes(
                                                        (categorySearch || "").toLowerCase()
                                                    )
                                                )
                                                .map((cat, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => {
                                                            handleSelect(cat.Item_Category);
                                                            //handleRowChange("categorySearch", cat.Item_Category);
                                                        }}
                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        {cat.Item_Category}
                                                    </div>
                                                ))}

                                            {categories?.filter((cat) =>
                                                cat.Item_Category.toLowerCase().includes(
                                                    (categorySearch || "").toLowerCase()
                                                )
                                            ).length === 0 && (
                                                    <p className="px-3 py-2 text-gray-500">No categories found</p>
                                                )}
                                        </div>
                                    )}
                                </div>



                                {showModal && (

                                    <div
                                        style={{
                                            position: "fixed",
                                            inset: 0,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "rgba(0,0,0,0.4)", // ✅ transparent dark
                                            backdropFilter: "blur(4px)",        // ✅ hazy blur
                                            zIndex: 30
                                        }}>
                                        {/* // <div className="fixed inset-0 flex items-center justify-center bg-gray-800  z-30"> */}
                                        <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
                                            {/* Close Button (top-right) */}
                                            <button
                                                type="button"
                                                style={{ backgroundColor: "transparent" }}
                                                onClick={() => setShowModal(false)}
                                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                            >
                                                ✕
                                            </button>

                                            <h4 className="text-lg font-semibold mb-4">Add New Category</h4>
                                            <input
                                                type="text"
                                                value={newCategory}
                                                onChange={(e) => setNewCategory(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#4CA1AF]"
                                                placeholder="Enter category name"
                                            />
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    type="button"
                                                    style={{ backgroundColor: "lightgray" }}
                                                    onClick={() => setShowModal(false)}
                                                    className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleAddCategory}
                                                    style={{ backgroundColor: "#4CA1AF" }}
                                                    className="px-4 py-2 rounded-md bg-[#4CA1AF] text-white hover:bg-[#5c52d4]"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                            {/* Item Dropdown */}
                            <div className="input-field col s6 ">
                                <span className="active">
                                    Item Name
                                    <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
                                </span>
                                <input
                                    type="text"

                                    {...register(`Item_Name`)}

                                    placeholder="Item Name"
                                    className="w-full outline-none border-b-2 text-gray-900"
                                />

                                {errors?.Item_Name && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors?.Item_Name?.message}
                                    </p>
                                )}
                            </div>





                            {/*Item_Image */}

                            <div className="input-field col s6">
                                <span className="active">
                                    Item Image
                                    <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
                                </span>
                                <div className="flex items-center gap-3">
                                    {/* Preview Box */}
                                    <div className="w-20 h-20 border rounded overflow-hidden flex items-center justify-center bg-gray-50">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="preview"
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-xs">No Image</span>
                                        )}
                                    </div>

                                    {/* File Input */}
                                    <div className="w-28">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="w-full text-sm"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;

                                                // Update form
                                                setValue("Item_Image", file, { shouldValidate: true });

                                                // NEW preview
                                                const url = URL.createObjectURL(file);
                                                setPreview(url);
                                            }}
                                        />


                                    </div>


                                </div>

                                {/* Error */}
                                {errors?.Item_Image && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.Item_Image.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s6">
                                <span className="active">
                                    Item Quantity
                                    <span className="text-red-500 font-bold text-lg">&nbsp;*</span>

                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ width: "100%" }}
                                    value={watch(`Item_Quantity`)?.toString() || ""}
                                    {...register(`Item_Quantity`)}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/[^0-9]/g, "");


                                        // if (!itemsValues[i]?.Item_Name?.trim()) return;

                                        // ✅ Clamp value
                                        // let num = parseInt(value, 10);

                                        // if (isNaN(num) || num < 0) {
                                        //     num = 0; // reset to 0
                                        // }
                                        if (value === "") {
                                            setValue(`Item_Quantity`, "", { shouldValidate: true });
                                            return;
                                        }
                                        const price = watch("Item_Price");
                                        const tax = watch("Tax_Type");

                                        const { Tax_Amount, Amount } = calculateRowAmount({
                                            Item_Price: price,
                                            Item_Quantity: value,
                                            Tax_Type: tax,
                                        });
                                        setValue("Tax_Amount", Tax_Amount, { shouldValidate: true });
                                        setValue("Amount", Amount, { shouldValidate: true });
                                        // ✅ Update only via RHF
                                        setValue(`Item_Quantity`, value, { shouldValidate: true });

                                        // ✅ Recalculate row + totals



                                    }}
                                    placeholder="Qty"
                                />
                                {errors?.Item_Quantity && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.Item_Quantity.message}
                                    </p>
                                )}
                            </div>

                            {/* Unit */}

                            {/* <div className="input-field col s6">
                                              <span className="active">
                                          Item Unit
        <span className="text-red-500 font-bold text-lg">&nbsp;*</span>

        </span>
                                                            <Controller
                                                                control={control}
                                                                name={`Item_Unit`}
                                                                render={({ field }) => (
                                                                    <select
                                                                        {...field}
                                                                        className="form-select "
                                                                        style={{ width: "100%", fontSize: "12px", marginLeft: "0px" }}
                                                                        //disabled={isUnitLocked} // ✅ lock only if item is from dropdown
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            // handleRowChange( "Item_Unit", value);
                                                                            setValue(`Item_Unit`, value);
                                                                        }}
                                                                    >
                                                                        <option value="">Select</option>
                                                                        {Object.entries(itemUnits).map(([key, value]) => (
                                                                            <option key={key} value={key}>
                                                                                {`${value} (${key})`}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                )}
                                                            />
                                                            {errors?.Item_Unit && (
                                                                <p className="text-red-500 text-xs mt-1">
                                                                    {errors.Item_Unit.message}
                                                                </p>
                                                            )}
                                                        </div> */}

                            {/*  Price */}
                            <div className="input-field col s6">
                                <span className="active">
                                    Item Price
                                    <span className="text-red-500 font-bold text-lg">&nbsp;*</span>

                                </span>
                                <div className="d-flex align-items-center">
                                    {/* <input
                                        type="text"
                                        className="form-control"
                                        style={{ width: "100%", marginBottom: "0px" }}
                                        {...register(`Item_Price`)}
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

                                            // if (!Item_Name || itemsValues[i]?.Item_Name.trim() === "") {
                                            //     return;
                                            // }

                                            const { Tax_Amount, Amount, Total_Amount } = calculateRowAmount({
                                                //   ...itemsValues[i],
                                                Item_Price: val,
                                            });

                                            setValue(`Tax_Amount`, Tax_Amount, { shouldValidate: true, shouldDirty: true });
                                            setValue(`Amount`, Amount, { shouldValidate: true, shouldDirty: true });
                                            // setValue("Total_Amount", Total_Amount);


                                        }}

                                        placeholder="Price"
                                    /> */}
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={{ width: "100%", marginBottom: "0px" }}
                                        {...register("Item_Price")}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/[^0-9.]/g, "");

                                            const parts = val.split(".");
                                            if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
                                            if (val.includes(".")) {
                                                const [int, dec] = val.split(".");
                                                val = int + "." + dec.slice(0, 2);
                                            }

                                            e.target.value = val;

                                            // 🔥 use current form values
                                            const currentQty = watch("Item_Quantity");
                                            const currentTax = watch("Tax_Type");

                                            const { Tax_Amount, Amount } = calculateRowAmount({
                                                Item_Price: val,
                                                Item_Quantity: currentQty,
                                                Tax_Type: currentTax,
                                            });

                                            setValue("Tax_Amount", Tax_Amount, { shouldValidate: true });
                                            setValue("Amount", Amount, { shouldValidate: true });
                                        }}
                                        placeholder="Price"
                                    />


                                </div>
                                {errors?.Item_Price && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.Item_Price.message}
                                    </p>
                                )}
                            </div>




                            <div className="input-field col s6">
                                <span className="active">
                                    Tax Type
                                    <span className="text-red-500 font-bold text-lg">&nbsp;*</span>

                                </span>
                                <Controller
                                    control={control}
                                    name={`Tax_Type`}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className="form-select"
                                            style={{ width: "100%", fontSize: "12px", marginBottom: "0px" }}
                                            onChange={(e) => {
                                                field.onChange(e); // ✅ update RHF value


                                                // const { Tax_Amount, Amount, Total_Amount } = calculateRowAmount(
                                                //     { Tax_Type: e.target.value },

                                                //     // itemsValues
                                                // );
                                                const price = watch("Item_Price");
                                                const qty = watch("Item_Quantity");


                                                const { Tax_Amount, Amount } = calculateRowAmount({
                                                    Item_Price: price,
                                                    Item_Quantity: qty,
                                                    Tax_Type: e.target.value, // 👈 updated tax type
                                                });
                                                setValue(`Tax_Amount`, Tax_Amount, { shouldValidate: true, shouldDirty: true });
                                                setValue(`Amount`, Amount, { shouldValidate: true, shouldDirty: true });
                                                // setValue("Total_Amount", Total_Amount);

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

                        </div>
                        {/* Tax Amount */}
                        <div className="row">

                            <div className="input-field col s6 mt-3">
                                <span className="active">
                                    Tax Amount
                                    <span className="text-red-500 font-bold text-lg">&nbsp;*</span>

                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ backgroundColor: "transparent" }}
                                    {...register(`Tax_Amount`)}
                                    readOnly
                                />
                            </div>

                            {/* Amount */}
                            <div className="input-field col s6">
                                <span className="active">
                                    Amount
                                    <span className="text-red-500 font-bold text-lg">&nbsp;*</span>

                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ backgroundColor: "transparent" }}
                                    {...register(`Amount`)}
                                    readOnly
                                />
                            </div>
                        </div>


                    </div>





                    <div className="flex justify-end gap-4">
                        <button
                            type="button"

                            onClick={onClose}
                            className=" text-white font-bold py-2 px-4 rounded"
                            style={{ backgroundColor: "#4CA1AF" }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={formValues.errorCount > 0 || isAddingFoodItem}
                            onClick={() => handleEdit()}

                            className=" text-white font-bold py-2 px-4 rounded"
                            style={{ backgroundColor: "#4CA1AF" }}
                        >
                            {isAddingFoodItem ? "Saving..." : "Save"}
                        </button>
                    </div>









                </div>
            </div>

        </>
    );
}
