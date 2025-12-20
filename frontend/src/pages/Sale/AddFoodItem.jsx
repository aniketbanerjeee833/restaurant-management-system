import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { itemApi, useAddCategoryMutation, useGetAllCategoriesQuery, useGetAllNewItemsQuery } from "../../redux/api/itemApi";
import { useRef } from "react";
import { useEffect } from "react";

import { toast } from "react-toastify";

import { useDispatch } from "react-redux";

import { LayoutDashboard } from "lucide-react";


import { foodFormSchema } from "../../schema/foodFormSchema";
import { useAddFoodItemMutation } from "../../redux/api/foodItemApi";


export default function AddFoodItem() {

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
    const { data: items } = useGetAllNewItemsQuery();
    console.log(items, "items");
    const { data: categories } = useGetAllCategoriesQuery()
    //const [open, setOpen] = useState(false);
    //const[categoryOpen,setCategoryOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    //const[selected,setSelected] = useState([]);
    //const [partySearch, setPartySearch] = useState("");
    const [newCategory, setNewCategory] = useState("");
    
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
    const[addFoodItem, {isLoading:isAddingFoodItem}] = useAddFoodItemMutation();
    // const itemUnits = {
        
    //     "pcs": "Pcs",
    //     "plates": "Plates",
    //     "btl": "Bottle",

    // }

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
  resolver: zodResolver(foodFormSchema),
  defaultValues: {
    items: [
      {
        Item_Name: "",
        Item_Image: "",
        Item_Category: "",
        Item_Price: "",
        // Item_Quantity: "1",
        Tax_Type: "None",
        Tax_Amount: "",
        Amount: "",
      },
    ],
  },
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
    Item_Image: "",
    Item_Category: "",
    Item_Price: "",
    // Item_Quantity: "1",
  });
};


    const handleDeleteRow = (i) => {
        setRows((prev) => prev.filter((_, idx) => idx !== i)); // remove UI state
        remove(i); // remove from form
    };

    //const itemsValues = watch("items");   // watch all item rows
    //const totalPaid = watch("Total_Paid"); // watch Total_Paid
    const num = (v) => (v === undefined || v === null || v === "" ? 0 : Number(v));

    const calculateRowAmount = (row, index, itemsValues) => {
        const price = num(row.Item_Price);
        const qty = Math.max(1, num(row.Item_Quantity)); // default 1
        const subtotal = price * qty;

        // discount
        // let disc = num(row.Discount_On_Sale_Price);
        // if ((row.Discount_Type_On_Sale_Price || "Percentage") === "Percentage") {
        //     disc = (subtotal * disc) / 100;
        // }
        // const afterDiscount = Math.max(0, subtotal - disc);

        // tax
        const taxPercent = TAX_RATES[row.Tax_Type] ?? 0;
        const taxAmount = (subtotal * taxPercent) / 100;

        const finalAmount = subtotal + taxAmount;

        // ✅ Recalculate total with current row updated
        //let totalAmount = 0;
        // itemsValues?.forEach((r, i) => {
        //     if (i === index) {
        //         // use updated values for current row
        //         //totalAmount += parseFloat(finalAmount || 0);
        //     } else {
        //         //totalAmount += parseFloat(r.Amount || 0);
        //     }
        // });

        return {
            ...row,
            Item_Quantity: String(qty),
            Tax_Amount: taxAmount.toFixed(2),
            Amount: finalAmount.toFixed(2),
            //Total_Amount: totalAmount.toFixed(2), // ✅ correct grand total
          
        };
    };





    const itemsValues = watch("items"); // watch all rows
    const formValues = watch();

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
    console.log("Form Data (from RHF):", data);

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

    // Check duplicate names
    const seen = new Set();
    for (const item of cleanedItems) {
        const name = item.Item_Name.trim().toLowerCase();
        if (seen.has(name)) {
            toast.error(`Duplicate item: ${item.Item_Name}`);
            return;
        }
        seen.add(name);
    }

    // Ensure tax fields exist (auto values)
    const itemsSafe = cleanedItems.map((item) => ({
        ...item,
        Tax_Type: item.Tax_Type || "None",
        Tax_Amount: item.Tax_Amount || "0.00",
        Amount: item.Amount || "0.00",
    }));

    // ------------------------------
    // 🚀 Build FormData for multer
    // ------------------------------
    const formData = new FormData();

    // Add JSON items
    formData.append("items", JSON.stringify({ items: itemsSafe }));

    //Add images (skip only if empty)
//     itemsSafe.forEach((item) => {
//     const file = item.Item_Image?.[0]; // FileList → File

//     if (file instanceof File) {
//         formData.append("images", file);
//     }
// });
itemsSafe.forEach((item) => {
    if (item.Item_Image instanceof File) {
        formData.append("images", item.Item_Image);
    }
});
    console.log("📦 Final FormData Prepared",formData);

    try {
        const res = await addFoodItem(formData).unwrap();

        if (!res?.success) {
            toast.error(res.message || "Failed to add Food Items");
            return;
        }

        toast.success("Food Items added successfully!");
        navigate("/new/all-new-food-items");

    } catch (error) {
        console.error("Submission Error:", error);
        toast.error(error?.data?.message || "Failed to add food items");
    }
};


 

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

                                <div className="flex flex-col 
                                sm:flex-row justify-between items-start 
                                sm:items-center w-full  mt-10  sm:mt-0">

                                    {/* LEFT HEADER */}
                                    <div className="w-full sm:w-auto">
                                        <h4 className="text-xl sm:text-2xl font-bold mb-1 mt-4 sm:mb-0 sm:-mt-0 ">Add Food Item</h4>
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
                                            onClick={() => navigate("/new/all-new-food-items")}
                                            className="text-white font-bold py-2 px-4 rounded"
                                            style={{ backgroundColor: "black" }}
                                        >
                                            Back
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => navigate("/new/all-new-food-items")}
                                            className="text-white py-2 px-4 rounded"
                                            style={{ backgroundColor: "#ff0000" }}
                                        >
                                            All Food Items
                                        </button>
                                    </div>

                                </div>
                            </div>
                            <div style={{ padding: "0", backgroundColor: "#f1f1f19d" }} className="tab-inn">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="flex flex-col justify-between gap-6 w-full sm:flex-row heading-wrapper">
                                        
                                    </div>






                                    <div className="table-responsive table-desi">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>

                                                    <th>Sl.No</th>
                                                    <th>Category</th>
                                                    <th>Name</th>
                                                    <th>Image</th>
                                                    {/* <th>Qty</th> */}
                                                    {/* <th>Unit</th> */}
                                                    <th>Price/Unit</th>
                                                    {/* <th>Discount</th> */}
                                                    <th>Tax</th>
                                                    <th>Tax Amount</th>
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

                                                        <td
                                                            style={{ padding: "0px", position: "relative" }}>

                                                            <div ref={(el) => (categoryRefs.current[i] = el)}>


                                                                <input
                                                                    type="text"
                                                                    value={rows[i]?.categorySearch || watch(`items.${i}.Item_Category`) || ""}
                                                                    style={{ marginBottom: "0px" }}
                                                                    onClick={() => {
                                                                        if (!rows[i]?.isExistingItem) {
                                                                            setRows((prev) =>
                                                                                prev.map((row, idx) => ({
                                                                                    ...row,
                                                                                    CategoryOpen: idx === i ? !row.CategoryOpen : false,
                                                                                }))
                                                                            );
                                                                        }
                                                                    }}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        handleRowChange(i, "categorySearch", value);
                                                                        setValue(`items.${i}.Item_Category`, value);

                                                                        // ✅ If user clears or types new item → unlock
                                                                        if (!rows[i]?.isExistingItem) {
                                                                            handleRowChange(i, "isExistingItem", false);
                                                                        }
                                                                    }}
                                                                    onBlur={() => {
                                                                        const typedValue = rows[i]?.categorySearch || "";
                                                                        const exists = categories?.some(
                                                                            (cat) =>
                                                                                cat.Item_Category.toLowerCase() === typedValue.toLowerCase()
                                                                        );

                                                                        if (!exists) {
                                                                            // reset if category doesn't exist
                                                                            handleRowChange(i, "categorySearch", "");
                                                                            setValue(`items.${i}.Item_Category`, "");
                                                                        }
                                                                    }}
                                                                    placeholder="Category"
                                                                    className="w-full outline-none border-b-2 text-gray-900"
                                                                    readOnly={rows[i]?.isExistingItem} // 🔒 lock if item exists
                                                                />
                                                                {errors?.items?.[i]?.Item_Category && (
                                                                    <p className="text-red-500 text-xs mt-1">
                                                                        {errors.items[i].Item_Category.message}
                                                                    </p>
                                                                )}



                                                                {/* Dropdown List */}
                                                                {rows[i]?.CategoryOpen && !rows[i]?.isExistingItem && (
                                                                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                                        {/* Add Category Option */}
                                                                        <span
                                                                            onClick={() => {
                                                                                setShowModal(true);
                                                                                handleRowChange(i, "CategoryOpen", false);
                                                                            }}
                                                                            className="block px-3 py-2 text-[#ff0000] font-medium hover:bg-gray-100 cursor-pointer"
                                                                        >
                                                                            + Add Category
                                                                        </span>

                                                                        {categories
                                                                            ?.filter((cat) =>
                                                                                cat.Item_Category.toLowerCase().includes(
                                                                                    (rows[i]?.categorySearch || "").toLowerCase()
                                                                                )
                                                                            )
                                                                            .map((cat, idx) => (
                                                                                <div
                                                                                    key={idx}
                                                                                    onClick={() => {
                                                                                        handleSelect(i, cat.Item_Category);
                                                                                        handleRowChange(i, "categorySearch", cat.Item_Category);
                                                                                    }}
                                                                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                                                >
                                                                                    {cat.Item_Category}
                                                                                </div>
                                                                            ))}

                                                                        {categories?.filter((cat) =>
                                                                            cat.Item_Category.toLowerCase().includes(
                                                                                (rows[i]?.categorySearch || "").toLowerCase()
                                                                            )
                                                                        ).length === 0 && (
                                                                                <p className="px-3 py-2 text-gray-500">No categories found</p>
                                                                            )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {/* Hidden input for react-hook-form */}
                                                            {/* <input type="hidden" {...register("Item_Category")} value={selected || ""} /> */}

                                                            {/* Modal */}
                                                            {showModal && (
                                                                // <div className="fixed inset-0 flex items-center justify-center 
                                                                //               bg-black bg-opacity-40 backdrop-blur-sm z-30">
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
                                                                            className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
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
                                                                                style={{ backgroundColor: "#ff0000" }}
                                                                                className="px-4 py-2 rounded-md bg-[#ff0000] text-white hover:bg-[#5c52d4]"
                                                                            >
                                                                                Add
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* Item Dropdown */}
                                                        <td style={{ padding: "0px",width: "25%", position: "relative" }}>
                                                            <div ref={(el) => (itemRefs.current[i] = el)}> {/* ✅ attach ref */}
                                                                <input
                                                                    type="text"
                                                                    
                                                                      {...register(`items.${i}.Item_Name`)}
                                                                    // onChange={(e) => {
                                                                    //     const typedValue = e.target.value;
                                                                    //     // handleRowChange(i, "itemSearch", typedValue);
                                                                    //     handleRowChange(i, "CategoryOpen", false);
                                                                        
                                                                    //     // setValue(`items.${i}.Item_Name`, typedValue);
                                                                    //     // handleRowChange(i, "isHSNLocked", false);
                                                                    //     // handleRowChange(i, "isExistingItem", false);
                                                                    //     // handleRowChange(i, "isUnitLocked", false);
                                                                    //     // ✅ If typed value doesn’t match any existing item → unlock category
                                                                    //     // const exists = items?.items?.some(
                                                                    //     //     (it) => it.Item_Name.trim().toLowerCase() === typedValue.toLowerCase()
                                                                    //     // );
                                                                    //     // handleRowChange(i, "isExistingItem", exists); 
                                                                    // }}
                                                                    
                                                                    placeholder="Item Name"
                                                                    className="w-full outline-none border-b-2 text-gray-900"
                                                                />
                                                                {/* RHF error */}
                                                                {errors?.items?.[i]?.Item_Name && (
                                                                    <p className="text-red-500 text-xs mt-1">
                                                                        {errors?.items?.[i]?.Item_Name?.message}
                                                                    </p>
                                                                )}
                                                                


                                                            </div>
                                                        </td>

                                                        {/*Item_Image */}
<td style={{ padding: "0px", width: "20%" }}>
  <div className="flex items-center gap-3">
      {/* Preview Box */}
    <div className="w-20 h-20 border rounded overflow-hidden flex items-center justify-center bg-gray-50">
      {rows[i]?.preview ? (
        <img
          src={rows[i].preview}
          alt="preview"
          className="object-cover w-full h-full"
        />
      ) : (
        <span className="text-gray-400 text-xs">No Image</span>
      )}
    </div>

    {/* File Input */}
    <div className="w-28">
      <input style={{color:"grey"}}
        type="file"
        accept="image/*"
       
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            setValue(`items.${i}.Item_Image`, file || null, {
      shouldValidate: true,
    });

            // preview
            setRows((prev) => {
              const updated = [...prev];
              updated[i] = {
                ...updated[i],
                preview: URL.createObjectURL(file),
              };
              return updated;
            });
          }
        }}
        className="w-full text-sm"
      />
    </div>

  
  </div>

  {/* Error */}
  {errors?.items?.[i]?.Item_Image && (
    <p className="text-red-500 text-xs mt-1">
      {errors.items[i].Item_Image.message}
    </p>
  )}
</td>

                                                        
                                                        {/* <td style={{ padding: "0px",width:"5%" }}>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                style={{ width: "100%" }}
                                                                value={watch(`items.${i}.Item_Quantity`)?.toString() || ""}
                                                                {...register(`items.${i}.Item_Quantity`)}
                                                                onChange={(e) => {
                                                                    let value = e.target.value.replace(/[^0-9]/g, "");
                                                                  

                                                                   // if (!itemsValues[i]?.Item_Name?.trim()) return;

                                                                    // ✅ Clamp value
                                                                    // let num = parseInt(value, 10);

                                                                    // if (isNaN(num) || num < 0) {
                                                                    //     num = 0; // reset to 0
                                                                    // }
                                                                   if (value === "") {
                                                     setValue(`items.${i}.Item_Quantity`, "", { shouldValidate: true });
                                                                                return;
                                                                                                }

                                                                    // ✅ Update only via RHF
                                                                    setValue(`items.${i}.Item_Quantity`, value, { shouldValidate: true });

                                                                    // ✅ Recalculate row + totals
                                                                    

                                                                    
                                                                }}
                                                                placeholder="Qty"
                                                            />
                                                            {errors?.items?.[i]?.Item_Quantity && (
                                                                <p className="text-red-500 text-xs mt-1">
                                                                    {errors.items[i].Item_Quantity.message}
                                                                </p>
                                                            )}
                                                        </td> */}

                                                        {/* Unit */}
                                                        {/* <td style={{ padding: "0px",width:"10%" }}>
                                                            <Controller
                                                                control={control}
                                                                name={`items.${i}.Item_Unit`}
                                                                render={({ field }) => (
                                                                    <select
                                                                        {...field}
                                                                        className="form-select "
                                                                        style={{ width: "100%", fontSize: "12px", marginLeft: "0px" }}
                                                                        disabled={rows[i]?.isUnitLocked} // ✅ lock only if item is from dropdown
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                             field.onChange(value);   
                                                                            handleRowChange(i, "Item_Unit", value);
                                                                            setValue(`items.${i}.Item_Unit`, value);
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
                                                            {errors?.items?.[i]?.Item_Unit && (
                                                                <p className="text-red-500 text-xs mt-1">
                                                                    {errors.items[i].Item_Unit.message}
                                                                </p>
                                                            )}
                                                        </td> */}

                                                        {/*  Price */}
                                                        <td style={{ padding: "0px",width:"5%" }}>
                                                            <div className="d-flex align-items-center">
                                                                <input
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

                                                                        const { Tax_Amount, Amount,Total_Amount } = calculateRowAmount({
                                                                          ...itemsValues[i],
                                                                          Item_Price: val,
                                                                        });
                                                                       
                                                                            setValue(`items.${i}.Tax_Amount`, Tax_Amount);
                                                                            setValue(`items.${i}.Amount`, Amount);
                                                                            // setValue("Total_Amount", Total_Amount);

                                                                        
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

                                                        {/* Discount */}
                                                        {/* <td style={{ padding: "0px", width: "14%" }}>
                                                            <div className="d-flex align-items-center">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    style={{ width: "50%", marginBottom: "0px" }}
                                                                    {...register(`items.${i}.Discount_On_Sale_Price`)}
                                                                    onInput={(e) => {
                                                                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                                                                        //                 const { Tax_Amount, Amount ,Total_Amount} = calculateRowAmount({
                                                                        //   ...itemsValues[i],

                                                                        //   Discount_On_Sale_Price: e.target.value,

                                                                        // });
                                                                        const { Tax_Amount, Amount, Total_Amount, Balance_Due } = calculateRowAmount(
                                                                            { ...itemsValues[i], Discount_On_Sale_Price: e.target.value },
                                                                            i,
                                                                            itemsValues
                                                                        );

                                                                        setValue(`items.${i}.Tax_Amount`, Tax_Amount, { shouldValidate: true });
                                                                        setValue(`items.${i}.Amount`, Amount, { shouldValidate: true });
                                                                        setValue("Total_Amount", Total_Amount, { shouldValidate: true });
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


                                                                                const { Tax_Amount, Amount, Total_Amount, Balance_Due } = calculateRowAmount(
                                                                                    { ...itemsValues[i], Discount_Type_On_Sale_Price: e.target.value },
                                                                                    i,
                                                                                    itemsValues
                                                                                );

                                                                                setValue(`items.${i}.Tax_Amount`, Tax_Amount, { shouldValidate: true });
                                                                                setValue(`items.${i}.Amount`, Amount, { shouldValidate: true });
                                                                                setValue("Total_Amount", Total_Amount, { shouldValidate: true });
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



                                                        <td style={{ padding: "0px", width: "10%" }}>
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

                                                                            // const { Tax_Amount, Amount,Total_Amount } = calculateRowAmount({
                                                                            //   ...itemsValues[i],
                                                                            //   Tax_Type: e.target.value,
                                                                            // });
                                                                            const { Tax_Amount, Amount, Total_Amount } = calculateRowAmount(
                                                                                { ...itemsValues[i], Tax_Type: e.target.value },
                                                                                i,
                                                                                itemsValues
                                                                            );

                                                                            setValue(`items.${i}.Tax_Amount`, Tax_Amount);
                                                                            setValue(`items.${i}.Amount`, Amount);
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
                                                        </td> 

                                                        {/* Tax Amount */}
                                                        <td style={{ width: "8%" }}>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                style={{ backgroundColor: "transparent" }}
                                                                {...register(`items.${i}.Tax_Amount`)}
                                                                readOnly
                                                            />
                                                        </td>

                                                        {/* Amount */}
                                                        <td style={{ width: "8%" }}>
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

                                       <div className="grid grid-cols-2 px-2 sm:grid-cols-2  gap-4 w-full sale-wrapper">
                                            {/* Add Row Button */}
                                            <div className="flex flex-col px-2 w-full sm:w-64 sale-left">
                                                <button
                                                    type="button"
                                                    onClick={handleAddRow}
                                                     className=" text-white font-bold py-1 px-2 sm:px-2 py-2 md:px-2 w-1/2" 
                                                    style={{ backgroundColor: "#ff0000" }}
                                                >
                                                    + Add Row
                                                </button>

                                                {/* <div className="flex flex-col  mt-3 gap-2  w-full sm:w-64">
                                                    <div className="flex flex-col w-full">
                                                        <span className="active">Payment Type</span>

                                                        <select id="Payment_Type" {...register("Payment_Type")}
                                                        >
                                                            <option value="">Select Payment Type</option>
                                                            <option value="Cash">Cash</option>
                                                            <option value="Cheque">Cheque</option>
                                                            <option value="Neft">Neft</option>
                                                        </select>
                                                        {errors?.Payment_Type && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {errors?.Payment_Type?.message}
                                                            </p>
                                                        )}
                                                    </div>




                                                    {(paymentType === "Cheque" || paymentType === "Neft") && (

                                                        <div className="flex flex-col w-full ">
                                                            <span className="active whitespace-nowrap">
                                                                {paymentType === "Cheque" ? "Cheque Number" : "NEFT Reference Number"}
                                                            </span>

                                                            <input
                                                                type="text"
                                                                id="Reference_Number"
                                                                {...register("Reference_Number")}
                                                                placeholder={`Enter ${paymentType} number`}
                                                                className="w-full outline-none border-b-2 text-gray-900"
                                                            />

                                                            {errors?.Reference_Number && (
                                                                <p className="text-red-500 text-xs mt-1">
                                                                    {errors?.Reference_Number?.message}
                                                                </p>
                                                            )}
                                                        </div>

                                                    )}
                                                </div> */}
                                            </div>
                                            {/* <div className="grid grid-rows-3 gap-2 w-full sm:w-1/2 lg:w-1/3 ml-auto mr-2 sale-right">
                                                
                                                <div className="flex  gap-3 items-center justify-end w-full sm:w-auto">
                                                    <span className="font-medium whitespace-nowrap"
                                                    >Total Amount</span>
                                                    <input
                                                        style={{
                                                            backgroundColor: "transparent", marginBottom: "0px", width: "50%",
                                                            height: "1rem"
                                                        }}
                                                        type="text"
                                                        className="form-control  "
                                                        {...register("Total_Amount")}
                                                        value={watch("Total_Amount") || ""}
                                                        readOnly
                                                    />
                                                </div>

                                               
                                                <div className="flex items-center  gap-3 relative justify-end">

                                                  
                                                    <div className="flex items-center gap-4 relative">
                                                        <input
                                                            type="checkbox"


                                                            id="totalPaidCheck"
                                                            className="w-4 h-4 cursor-pointer "
                                                            onChange={(e) => {
                                                                const isChecked = e.target.checked;
                                                                const totalAmount = parseFloat(watch("Total_Amount"));

                                                                // 🧠 If no total amount entered, do nothing
                                                                if (!totalAmount || isNaN(totalAmount)) {
                                                                    // Optional: visually reset the checkbox


                                                                    // Clear both fields to stay consistent
                                                                    setValue("Total_Received", "");
                                                                    setValue("Balance_Due", "");
                                                                    return;
                                                                }

                                                                if (isChecked) {
                                                                    // ✅ Set Total_Received = Total_Amount, Balance_Due = 0
                                                                    setValue("Total_Received", totalAmount.toFixed(2));
                                                                    setValue("Balance_Due", 0);
                                                                } else {
                                                                    // ✅ When unchecked, restore Balance_Due = Total_Amount
                                                                    setValue("Total_Received", "");
                                                                    setValue("Balance_Due", totalAmount.toFixed(2));
                                                                }
                                                            }}
                                                        />
                                                       
                                                        <span
                                                            htmlFor="totalReceivedCheck"
                                                            className="font-medium whitespace-nowrap"
                                                        >
                                                            Total Received
                                                        </span>
                                                    </div>

                                                   
                                                    <input
                                                        type="text"
                                                        {...register("Total_Received")}
                                                        style={{ marginBottom: "0px", height: "1rem", width: "50%" }}
                                                        placeholder="Enter received amount"
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
                                                            setValue("Total_Received", val);

                                                            const totalPaid = parseFloat(val || 0);
                                                            const totalAmount = parseFloat(watch("Total_Amount") || 0);
                                                            setValue("Balance_Due", (totalAmount - totalPaid).toFixed(2));
                                                        }}
                                                        className="form-control"
                                                    />
                                                </div>


                                                
                                                <div className="flex  gap-3 items-center justify-end">
                                                    <span className="font-medium whitespace-nowrap">Balance Due</span>
                                                    <input
                                                        style={{ backgroundColor: "transparent", marginBottom: "0px", height: "1rem", width: "50%" }}
                                                        type="text"
                                                        className="form-control  "
                                                        {...register("Balance_Due")}
                                                       
                                                        readOnly
                                                    />
                                                </div>
                                            </div> */}
                                            {/* <div style={{width:"100%"}}
        className="grid grid-rows-1 px-4 gap-2 w-full sm:w-1/2 lg:w-1/3 ml-auto mr-2 sale-right">
                        
<div style={{width:"100%"}}
className="flex justify-between items-start gap-6 w-full mr-4">
   <div className="flex items-center gap-2">
             <input
                              type="checkbox"
                              id="roundOffCheck"
                              className="w-4 h-4 cursor-pointer"
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                const totalAmount = parseFloat(watch("Total_Amount"));
                                const totalPaid = parseFloat(watch("Total_Paid")) || 0;

                                if (!totalAmount || isNaN(totalAmount)) return;

                                if (isChecked) {
                                  setOriginalTotal(totalAmount);

                                  // Round off to nearest integer
                                  const rounded = Math.round(totalAmount);

                                  setValue("Total_Amount", rounded.toFixed(2), { shouldValidate: true });
                                  setValue("Balance_Due", (rounded - totalPaid).toFixed(2), { shouldValidate: true });

                                } else {
                                  if (originalTotal !== null) {
                                    setValue("Total_Amount", originalTotal.toFixed(2), { shouldValidate: true });

                                    setValue(
                                      "Balance_Due",
                                      (originalTotal - totalPaid).toFixed(2),
                                      { shouldValidate: true }
                                    );
                                  }
                                }
                              }}
                            />
    
    <span className="font-medium whitespace-nowrap">Round Off</span>

   
    <input
    
      type="text"
      
      style={{marginTop:"10px",width:"60px",height:"1.5rem"}}
      className="w-3  border border-gray-300  text-right text-sm"
      {...register("Round_Off")}
      onChange={(e) => {
        const val = parseFloat(e.target.value) || 0;
        const totalAmount = originalTotal ?? parseFloat(watch("Total_Amount"));
        const totalPaid = parseFloat(watch("Total_Paid")) || 0;

        if (isNaN(totalAmount)) return;

        // New Total
        const newTotal = totalAmount + val;

        setValue("Total_Amount", newTotal.toFixed(2));
        setValue("Balance_Due", (newTotal - totalPaid).toFixed(2));
      }}
      // disabled={!watch("roundOffCheck") && originalTotal === null}
    />
</div>

<div  style={{width:"100%"}}
className="flex flex-col gap-4 mt-3 w-full">
   <div  className="flex gap-3 items-center  w-full sm:w-auto">
  
<div  style={{width:"100%"}} className="flex gap-2 ">
  <span className="font-medium whitespace-nowrap">Total Amount</span>

  <input
    style={{ backgroundColor: "transparent", height: "1rem" }}
    type="text"
    className="form-control"
    {...register("Total_Amount")}
    readOnly
  />
    </div>
</div>



                        <div
                        style={{width:"100%"}} className="flex items-center  gap-3 relative ">
                        
                          <div className="flex items-center gap-2 relative">
                        
                            {/* <input
                              type="checkbox"


                              id="totalPaidCheck"
                              className="w-4 h-4 cursor-pointer"
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                const totalAmount = parseFloat(watch("Total_Amount"));

                                // 🧠 If no total amount entered, do nothing
                                if (!totalAmount || isNaN(totalAmount)) {
                                  // Optional: visually reset the checkbox


                                  // Clear both fields to stay consistent
                                  setValue("Total_Paid", "");
                                  setValue("Balance_Due", "");
                                  return;
                                }

                                if (isChecked) {
                                  // ✅ Set Total_Paid = Total_Amount, Balance_Due = 0
                                  setValue("Total_Paid", totalAmount.toFixed(2));
                                  setValue("Balance_Due", 0);
                                } else {
                                  // ✅ When unchecked, restore Balance_Due = Total_Amount
                                  setValue("Total_Paid", "");
                                  setValue("Balance_Due", totalAmount.toFixed(2));
                                }
                              }}
                            /> 
                               
                            <span
                              htmlFor="totalPaidCheck"
                              className="font-medium whitespace-nowrap"
                            >
                              Total Paid
                            </span>
                          
                          </div>
                                 <input type="text"
                                                 {...register("Total_Received")}
                                                        style={{ marginBottom: "0px", height: "1rem", width: "100%" }}
                                                        placeholder="Enter received amount"
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
                                                            setValue("Total_Received", val);

                                                            const totalPaid = parseFloat(val || 0);
                                                            const totalAmount = parseFloat(watch("Total_Amount") || 0);
                                                            setValue("Balance_Due", (totalAmount - totalPaid).toFixed(2));
                                                        }}
                                                        className="form-control"
                                                    />
                            
                                                      
                      
                        </div>



                       
                        <div style={{width:"100%"}}
                        className="flex  gap-2 items-center ">
                        
                          <span className="font-medium whitespace-nowrap">Balance Due</span>
                          <input
                            style={{ backgroundColor: "transparent", marginBottom: "0px", height: "1rem", width: "100%" }}
                            type="text"
                            className="form-control  "
                            {...register("Balance_Due")}
                           
                            readOnly
                          />
                        </div>
                        </div>
                        </div>
                        

                      </div> */}
                       <div className="flex justify-end gap-4">
                                        <button
                                            type="button"

                                            onClick={() => navigate("/new/all-new-food-items")}
                                            className=" text-white font-bold py-2 px-4 rounded"
                                            style={{ backgroundColor: "black" }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={formValues.errorCount > 0 || isAddingFoodItem}
                                            className=" text-white font-bold py-2 px-4 rounded"
                                            style={{ backgroundColor: "#ff0000" }}
                                        >
                                            {isAddingFoodItem ? "Saving..." : "Save"}
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
{/* <div className="grid grid-rows-2 ml-2 w-full sm:w-1/2 lg:w-1/3 ">


                                            <div className="w-1/2 flex flex-col relative mt-2 gap-2 party-class"
                                                style={{ marginBottom: "0px", marginTop: "0px" }}>

                                              
                                                <span className="whitespace-nowrap active ">
                                                    Party
                                                    <span className="text-red-500">*</span>
                                                </span>
                                                <div className="relative w-full">

                                                   
                                                    <div
                                                        className="flex  justify-between border rounded-md  bg-white cursor-pointer"
                                                        onClick={() => setOpen((prev) => !prev)}
                                                    >
                                                        <input
                                                            type="text"
                                                            id="Party_Name"

                                                            value={partySearch}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                setPartySearch(value);
                                                                setValue("Party_Name", value, { shouldValidate: true });
                                                                setOpen(true);
                                                            }}
                                                            onClick={() => setOpen((prev) => !prev)}
                                                            onBlur={() => {
                                                                const typedValue = partySearch.trim().toLowerCase();

                                                                // ✅ Full match only (not partial)
                                                                const matchedParty = parties?.parties?.find(
                                                                    (party) => party.Party_Name.toLowerCase() === typedValue
                                                                );

                                                                if (matchedParty) {
                                                                    // ✅ Set full party info
                                                                    setPartySearch(matchedParty.Party_Name);
                                                                    setValue("Party_Name", matchedParty.Party_Name, { shouldValidate: true, shouldDirty: true });

                                                                    // ✅ Check GSTIN (must be present)
                                                                    if (!matchedParty.GSTIN || matchedParty.GSTIN.trim() === "") {

                                                                        setValue("GSTIN", "", { shouldValidate: true });
                                                                    } else {
                                                                        setValue("GSTIN", matchedParty.GSTIN, { shouldValidate: true, shouldDirty: true });
                                                                    }


                                                                } else {
                                                                    // ❌ Not an exact match → clear field
                                                                    setPartySearch("");
                                                                    setValue("Party_Name", "");
                                                                }

                                                                setTimeout(() => setOpen(false), 150);
                                                            }}
                                                            placeholder="Search By Name/Phone"
                                                            className="w-full outline-none py-1 px-2 text-gray-900"
                                                            style={{ marginBottom: 0, marginTop: "4px", border: "none", height: "2rem", borderBottom: "0px" }}
                                                        />
                                                        <span className="ml-2  absolute right-5 top-1/3  text-gray-700">
                                                            ▼
                                                        </span>
                                                    </div>                                      
                                                    {open && (
                                                        <div className="absolute z-20 flex flex-col mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                            <span
                                                                onClick={() => setShowPartyModal(true)}
                                                                className="block px-3 py-2 text-[#ff0000] font-medium hover:bg-gray-100 cursor-pointer"
                                                            >
                                                                + Add Party
                                                            </span>

                                                            {parties?.parties
                                                                ?.filter(
                                                                    (party) =>
                                                                        party?.Party_Name?.toLowerCase().includes(partySearch.toLowerCase()) ||
                                                                        party?.Phone_Number?.includes(partySearch)
                                                                )
                                                                .map((party, i) => (
                                                                    <div
                                                                        key={i}
                                                                        onClick={() => {
                                                                            // Select from dropdown
                                                                            setPartySearch(party.Party_Name);
                                                                            setValue("Party_Name", party.Party_Name, { shouldValidate: true, shouldDirty: true });

                                                                            // ✅ GSTIN validation on selection
                                                                            if (!party.GSTIN || party.GSTIN.trim() === "") {

                                                                                setValue("GSTIN", "", { shouldValidate: true });
                                                                            } else {
                                                                                setValue("GSTIN", party.GSTIN, { shouldValidate: true, shouldDirty: true });
                                                                            }


                                                                            setOpen(false);
                                                                        }}
                                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                                    >
                                                                        {party.Party_Name} ({party.Phone_Number})
                                                                    </div>
                                                                ))}

                                                            
                                                            {parties?.parties?.filter((party) =>
                                                                party?.Party_Name?.toLowerCase().includes(partySearch.toLowerCase())
                                                            ).length === 0 && (
                                                                    <p className="px-3 py-2 text-gray-500">No Party found</p>
                                                                )}
                                                        </div>
                                                    )}
                                                </div>
                                           
                                                {showPartyModal && (
                                                    <PartyAddModal
                                                        onClose={() => setShowPartyModal(false)}
                                                        onSave={(newParty) => {
                                                            setPartySearch(newParty);
                                                            setValue("Party_Name", newParty, { shouldValidate: true });
                                                            setShowPartyModal(false);
                                                        }}
                                                    />
                                                )}

                                               
                                                {errors?.Party_Name && (
                                                    <p className="text-red-500 text-xs mt-1">{errors?.Party_Name?.message}</p>
                                                )}
                                            </div>

                                            <div className="input-field  flex gap-4
                              justify-center items-center w-1/2 gstin-class">
                                                <span className=" whitespace-nowrap active ">
                                                    GSTIN

                                                </span>
                                                <input
                                                    type="text"
                                                    style={{ marginBottom: "0px" }}
                                                    id=" GSTIN"
                                                    value={showGSTIN || ""}
                                                    {...register("GSTIN")}
                                                    placeholder="GSTIN"
                                                    className="w-full outline-none border-b-2 text-gray-900"
                                                    readOnly

                                                />
                                                {errors?.GSTIN && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors?.GSTIN?.message}
                                                    </p>
                                                )}
                                            </div> 


                                        </div>*/}
                                        {/*<div className="grid grid-rows-3 w-full sm:w-1/2 lg:w-1/3 ml-auto gap-0  mr-2">





                                          
                                            <div className="flex items-center w-full gap-3  justify-end">

                                                
                                                <span className="whitespace-nowrap ">
                                                    Invoice Number <span className="text-red-500">*</span>
                                                </span>

                                                <input
                                                    type="text"
                                                    id=" Invoice_Number"
                                                    {...register("Invoice_Number")}
                                                    placeholder=" Invoice_Number"

                                                    className="invoice-number-class 
                                                    outline-none 
                                                    text-gray-900 
                                                            py-1 
                                                        bg-transparent "



                                                    style={{ marginBottom: 0, border: "none", width: "50%" }}
                                                    readOnly
                                                />
                                                {errors?.Invoice_Number && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors?.Invoice_Number?.message}
                                                    </p>
                                                )}
                                            </div> 

                                            

                                            <div className="flex items-center w-full gap-3 justify-end">
                                               
                                                <span className=" whitespace-nowrap active">
                                                    Invoice Date
                                                    <span className="text-red-500">*</span>
                                                </span>
                                                <input
                                                    type="date"
                                                    style={{ marginBottom: 0, width: "50%", border: "none" }}
                                                    id=" Invoice_Date"
                                                    {...register("Invoice_Date")}
                                                    placeholder=" Invoice_Date"
                                                  className="w-full outline-none text-gray-900 invoice-date-class"
                                                    min={
                                                        latestInvoiceNumber?.latestInvoiceInfo?.createdAt
                                                            ? new Date(latestInvoiceNumber?.latestInvoiceInfo?.createdAt).toISOString().split("T")[0]
                                                            : ""
                                                    } // ✅ Prevent earlier dates
                                                />
                                                {errors?.Invoice_Date && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors?.Invoice_Date?.message}
                                                    </p>
                                                )}
                                            </div>

                                           



                                            <div className="flex items-center w-full gap-3 justify-end
                                           state-of-supply-class"
                                           >
                                              
                                                <span className=" whitespace-nowrap active">
                                                    State of Supply
                                                    <span className="text-red-500">*</span>
                                                </span>
                                                <select
                                                    style={{ marginBottom: "0px", width: "50%", border: "none" }}
                                                    id="stateOfSupply"
                                                    className="validate mt-2"
                                                    {...register("State_Of_Supply")}
                                                >
                                                    <option value="">Select State</option>
                                                    <option value="West Bengal">West Bengal</option>
                                                    <option value="Maharashtra">Maharashtra</option>
                                                    <option value="Karnataka">Karnataka</option>
                                                    <option value="Delhi">Delhi</option>
                                                </select>
                                                {errors?.State_Of_Supply && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors?.State_Of_Supply?.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>*/}
