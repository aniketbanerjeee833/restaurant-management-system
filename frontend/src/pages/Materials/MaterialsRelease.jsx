


import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { Controller, useFieldArray, useForm } from "react-hook-form";



import { useRef } from "react";
import { useEffect } from "react";

import { toast } from "react-toastify";

import { useDispatch, useSelector } from "react-redux";

import { LayoutDashboard } from "lucide-react";





import { materialApi, useAddReleaseMaterialsMutation, useGetAllMaterialsQuery } from "../../redux/api/materialApi";



export default function MaterialsRelease() {
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
 
    const [addReleaseMaterial, { isLoading: isAddingReleaseMaterial }] =  useAddReleaseMaterialsMutation();
    // const units = {

    //     "pcs": "Pcs",
    //     "plates": "Plates",
    //     "btl": "Bottle",

    // }
     const units={
        "Kilogram":"Kg",
        "Litre":"lt",
        "Gram":"gm",
        "Pcs":"pcs"
    }
    const { data: materialsData, isLoading } = useGetAllMaterialsQuery();
    const materials=materialsData?.materials??[]
    console.log(materials, isLoading, "materials");

    // const { data: tables, isLoading } = useGetAllTablesQuery({});
    // const { data: menuItems, isMenuItemsLoading } = useGetAllFoodItemsQuery({});
    // console.log(tables, isLoading, "tables", menuItems, isMenuItemsLoading);
    console.log(materials, isLoading, "materials");
    const [rows, setRows] = useState([
        {
            CategoryOpen: false, categorySearch: "", preview: null
        }
    ]);

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
            Release_Date:"",
          

            items: [
                {
                    Material_Name: "",
                    
                    Material_Quantity: 1,
                    Material_Unit: "",
                   
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
            Material_Name: "",

            Item_Price: "",
            Material_Quantity: "1",
            Material_Unit: "",
        });
    };


    const handleDeleteRow = (i) => {
        setRows((prev) => prev.filter((_, idx) => idx !== i)); // remove UI state
        remove(i); // remove from form
    };
    const formValues = watch();
    //const itemsValues = watch("items");   // watch all item rows
    //const totalPaid = watch("Total_Paid"); // watch Total_Paid
    // const num = (v) => (v === undefined || v === null || v === "" ? 0 : Number(v));


  

    //const itemsValues = watch("items"); // watch all rows


    // const handleSelect = (rowIndex, categoryName) => {
    //     setRows((prev) => {
    //         const updated = [...prev];
    //         updated[rowIndex] = {
    //             ...updated[rowIndex],
    //             Item_Category: categoryName,
    //             CategoryOpen: false,
    //             isExistingItem: false,   // user-typed, so still editable
    //         };
    //         return updated;
    //     });

    //     setValue(`items.${rowIndex}.Item_Category`, categoryName, { shouldValidate: true });
    // };




    const onSubmit = async (data) => {
        console.log("Form Data:", data);

        if (!data.Release_Date || data.Release_Date.trim() === "") {
            toast.error("Please select release date.");
            return;
        }
        if (!data.items || data.items.length === 0) {
            toast.error("Please add at least one item before saving.");
            return;
        }

        // Remove empty rows
        const cleanedItems = data.items.filter(
            (it) => it.Material_Name && it.Material_Name.trim() !== ""
        );

        if (cleanedItems.length === 0) {
            toast.error("Please add at least one  item .");
            return;
        }

        // Check duplicate item names
        const seen = new Set();
        for (const item of cleanedItems) {
            const name = item.Material_Name.trim().toLowerCase();
            if (seen.has(name)) {
                toast.error(`Duplicate item: ${item.Material_Name}`);
                return;
            }
            seen.add(name);
        }

        // Prepare items safely
        const itemsSafe = cleanedItems.map((item) => ({
            Material_Name: item.Material_Name,
          
            Material_Quantity: item.Material_Quantity,
            Material_Unit: item.Material_Unit,
            
            
        }));

        // ------------------------------
        // 🚀 Prepare FINAL JSON Payload
        // ------------------------------
        const payload = {
            userId,                     // Or from redux/auth context
            Release_Date: data.Release_Date,
            Amount: data.Amount || "0.00",
            items: itemsSafe,
        };

        console.log("📦 Final JSON to send:", payload);

        try {
            const res = await addReleaseMaterial(payload).unwrap();

            if (!res?.success) {
                toast.error(res.message || "Failed to add release materials.");
                return;
            }

            toast.success("Release materials added successfully!");
            dispatch(materialApi.util.invalidateTags(["Material"]));
            navigate("/material/all-materials");

        } catch (error) {
            console.error("❌ Submission error:", error);
            toast.error(error?.data?.message || "Failed to add release materials.");
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
                            // className="box-inn-sp"
                            className="h-screen box-inn-sp"
                            >

                            <div className="inn-title w-full px-2 py-3">

                                <div className="flex flex-col sm:flex-row justify-between
                                 items-start sm:items-center w-full mt-2">

                                    {/* LEFT HEADER */}
                                    <div className="w-full sm:w-auto">
                                        <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Release Materials</h4>
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
                                        {/* <button
                                            type="button"
                                            onClick={() => navigate("/staff/orders/all-orders")}
                                            className="text-white font-bold py-2 px-4 rounded"
                                            style={{ backgroundColor: "#4CA1AF" }}
                                        >
                                            Back
                                        </button> */}

                                        {/* <button
                                            type="button"
                                            onClick={() => navigate("/staff/orders/all-orders")}
                                            className="text-white py-2 px-4 rounded"
                                            style={{ backgroundColor: "#4CA1AF" }}
                                        >
                                            All Orders
                                        </button> */}
                                <div 
                  style={{width:"100%"}} className="flex  gap-4 justify-center items-center">
                    <span className="active ">
                      Date
                      <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
                    </span>
                    <input
                    style={{marginBottom:"0px"}}
                      type="date"
                      id="Release_Date"
                      {...register("Release_Date")}
                      
                      className="w-full outline-none border-b-2 text-gray-900"
                    />
                   
                  </div>
                                    </div>

                                </div>
                            </div>
                            <div style={{ padding: "0", backgroundColor: "#f1f1f19d" }} className="tab-inn">
                                <form onSubmit={handleSubmit(onSubmit)}>


                                    {/* <div className="grid grid-cols-3 p-2 mt-2 gap-6 w-full heading-wrapper">

                                            <div></div>


                                      
                               
                  <div></div>

                                       

                                    </div> */}







                                    <div 
                                    className="table-responsive table-desi mt-4">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>

                                                    <th>Sl.No</th>

                                                    <th>Name</th>

                                                    <th>Qty</th>
                                                    <th>Unit</th>
                                                    
                                                    {/* <th>Discount</th> */}


                                                  
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



                                                        {/* Item Dropdown */}
                                                        <td style={{ padding: "0px", width: "70%", position: "relative" }}>
                                                            <div ref={(el) => (itemRefs.current[i] = el)}> {/* ✅ attach ref */}
                                                                <input
                                                                    type="text"
                                                                    value={rows[i]?.itemSearch || ""}
                                                                    onChange={(e) => {
                                                                        const typedValue = e.target.value;
                                                                        handleRowChange(i, "itemSearch", typedValue);
                                                                        // handleRowChange(i, "CategoryOpen", false);

                                                                        setValue(`items.${i}.Material_Name`, typedValue, { shouldValidate: true, shouldDirty: true });
                                                                        // setValue(`items.${i}.Material_Name`, typedValue);

                                                                        handleRowChange(i, "isExistingItem", false);
                                                                       
                                                                        // ✅ If typed value doesn’t match any existing item → unlock category
                                                                        const exists = materials?.name?.some(
                                                                            (it) => it.name.trim().toLowerCase() === typedValue.toLowerCase()
                                                                        );
                                                                        handleRowChange(i, "isExistingItem", exists); // false if new item
                                                                    }}
                                                                    onClick={() => handleRowChange(i, "itemOpen", !rows[i]?.itemOpen)}
                                                                    placeholder="Item Name"
                                                                    className="w-full outline-none border-b-2 text-gray-900"
                                                                />
                                                                {/* RHF error */}
                                                                {errors?.items?.[i]?.Material_Name && (
                                                                    <p className="text-red-500 text-xs mt-1">
                                                                        {errors?.items?.[i]?.Material_Name?.message}
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
                                                                                    <th className="text-left px-3 py-2">Reorder Level</th>
                                                                                       <th className="text-left px-3 py-2">Current Stock</th>
                                                                                    {/* <th className="text-left px-3 py-2">Purchase Price (Previous)</th> */}
                                                                                    {/* <th className="text-left px-3 py-2">Current Stock</th> */}
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {materials?.
                                                                                    filter((it) =>
                                                                                        it.name.toLowerCase().includes(
                                                                                            (rows[i]?.itemSearch || "").toLowerCase()
                                                                                        )
                                                                                    )
                                                                                    .map((it, idx) => (
                                                                                        <tr
                                                                                            key={idx}
                                         


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
                                                                                                //setValue(`items.${i}.Material_Name`, it.Material_Name);
                                                                                                //setValue(`items.${i}.Item_Price`, it.Item_Price);
                                                                                                // setValue(`items.${i}.Material_Quantity`, itemsValues[i]?.Material_Quantity || 1);
                                                                                                handleRowChange(i, "itemSearch", it.name);
                                                                                                handleRowChange(i, "isExistingItem", true); // ✅ mark as existing


                                                                                                setValue(`items.${i}.Material_Name`, it.name, { shouldValidate: true, shouldDirty: true });

                                                                                                handleRowChange(i, "itemOpen", false);

                                                                                              
                                 
                                                                                            }}

                                                                                            className="hover:bg-gray-100 cursor-pointer border-b"
                                                                                        >
                                                                                            <td>{idx + 1}</td>
                                                                                            <td className="px-3 py-2">{it.name}</td>

                                                                                            <td className="px-3 py-2 text-gray-600">{it.reorder_level}</td>
                                                                                            <td className="px-3 py-2 text-gray-600">{it.current_stock}</td>
                                                                                            {/* <td style={{color:"transparent"}}
              className={`px-3 py-2 ${it.Stock_Quantity <= 0 ? "text-red-500" : "text-green-500"}`}>
                {it.Stock_Quantity || 0}</td> */}

                                                                                        </tr>
                                                                                    ))}

                                                                                {materials?.name?.filter((it) =>
                                                                                    it.name.toLowerCase().includes(
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





                                                        {/* <td style={{ padding: "0px", width: "5%" }}>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                style={{ width: "100%" }}
                                                                value={watch(`items.${i}.Material_Quantity`)?.toString() || ""}
                                                                {...register(`items.${i}.Material_Quantity`)}

                                                                onChange={(e) => {
                                                                    let value = e.target.value.replace(/[^0-9]/g, "");

                                                                    if (value === "") {
                                                                        setValue(`items.${i}.Material_Quantity`, "", { shouldValidate: true });
                                                                        return;
                                                                    }

                                                                    // Update RHF
                                                                    setValue(`items.${i}.Material_Quantity`, value, { shouldValidate: true });

                                                                    // 🔥 Create updated items list
                                                                 

                                                                    
                                                                }}

                                                                placeholder="Qty"
                                                            />
                                                            {errors?.items?.[i]?.Material_Quantity && (
                                                                <p className="text-red-500 text-xs mt-1">
                                                                    {errors.items[i].Material_Quantity.message}
                                                                </p>
                                                            )}
                                                        </td> */}
<td style={{ padding: "0px", width: "8%" }}>
    
    {/* Quantity Input */}
    <input
        type="text"
        className="form-control"
      
        value={watch(`items.${i}.Material_Quantity`)?.toString() || ""}
        {...register(`items.${i}.Material_Quantity`)}
        onChange={(e) => {
            let value = e.target.value.replace(/[^0-9.]/g, "");

            if (value === "") {
                setValue(`items.${i}.Material_Quantity`, "", { shouldValidate: true });
                return;
            }

            setValue(`items.${i}.Material_Quantity`, value, { shouldValidate: true });
        }}
        placeholder="Qty"
    />
</td>
    
<td style={{ padding: "0px" }}>
                              <Controller
                                control={control}
                                name={`items.${i}.Material_Unit`}
                                render={({ field }) => (
                                  <select
                                    {...field}
                                    className="form-select "
                                    style={{ width: "100%", fontSize: "12px", marginLeft: "0px" }}
                                    disabled={rows[i]?.isUnitLocked} // ✅ lock only if item is from dropdown
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      handleRowChange(i, "Material_Unit", value);
                                      setValue(`items.${i}.Material_Unit`, value);
                                    }}
                                  >
                                    <option value="">Select</option>
                                    {Object.entries(units).map(([key, value]) => (
                                      <option key={key} value={key}>
                                        {`${value} (${key})`}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              />
                              {errors?.items?.[i]?.Material_Unit && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.items[i].Material_Unit.message}
                                </p>
                              )}
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
                                                    style={{ backgroundColor: "#4CA1AF" }}
                                                >
                                                    + Add Row
                                                </button>


                                            </div>
                                            <div></div>
                                            {/* <div style={{ width: "100%" }}
                                                className="grid grid-rows-1 px-4 gap-2 w-full sm:w-1/2 lg:w-1/3 ml-auto mr-2 sale-right">

                                                <div style={{ width: "100%" }}
                                                    className="flex justify-between items-start gap-6 w-full mr-4">
                                                */}

                                                    <div style={{ width: "100%" }}
                                                        // className="flex flex-col gap-4 mt-3 w-full"> 
                                                        className="flex flex-col px-2  w-full">









                                                        <div style={{ width: "100%" }} className="flex gap-2 justify-end">
                                                            <button
                                                                type="submit"
                                                                disabled={formValues.errorCount > 0 ||isAddingReleaseMaterial}
                                                                // onClick={() => navigate("/staff/orders/all-orders")}
                                                                className=" text-white font-bold py-2 px-4 rounded"
                                                                style={{ backgroundColor: "#4CA1AF" }}
                                                            >
                                                               {isAddingReleaseMaterial ? "Saving..." : "Save"}
                                                            </button>

                                                        </div>
                                                        </div>
                                                    {/*
                                                     

                                                </div>
                                            </div> */}



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


                            //             <div className="relative">
                            //                 <div
                            //                     className="flex flex-row border rounded-md bg-white cursor-pointer h-[3rem]"
                            //                     onClick={() => setOpen((prev) => !prev)}
                            //                 >
                            //                     <input
                            //                         type="text"
                            //                         placeholder="Search tables..."
                            //                         value={tableSearch}
                            //                         onChange={(e) => {
                            //                             const value = e.target.value;
                            //                             setTableSearch(value);
                            //                             setOpen(true);
                            //                         }}
                            //                         onClick={(e) => {
                            //                             e.stopPropagation();
                            //                             setOpen(true);
                            //                         }}
                            //                         onBlur={() => {
                            //                             setTimeout(() => setOpen(false), 150);
                            //                         }}
                            //                         className="w-full outline-none py-1 px-2 text-gray-900"
                            //                         style={{ marginTop: "4px", border: "none", height: "2rem" }}
                            //                     />

                            //                     <span className="absolute right-0 px-3 top-1/3 text-gray-700">
                            //                         ▼
                            //                     </span>
                            //                 </div>

                            //                 {open && (
                            //                     <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">

                            //                         {tables?.tables
                            //                             ?.filter((table) =>
                            //                                 table.Table_Name.toLowerCase().includes(tableSearch.toLowerCase())
                            //                             )
                            //                             .map((table, i) => {
                            //                                 const isSelected = selectedTables.includes(table.Table_Name);
                            //                                 const isAvailable = table.Status === "available";

                            //                                 return (
                            //                                     <div
                            //                                         key={i}
                            //                                         onClick={() => {
                            //                                             if (!isAvailable) return; // ❌ Prevent clicking occupied tables

                            //                                             let updatedSelection;

                            //                                             if (isSelected) {
                            //                                                 updatedSelection = selectedTables.filter(
                            //                                                     (t) => t !== table.Table_Name
                            //                                                 );
                            //                                             } else {
                            //                                                 updatedSelection = [...selectedTables, table.Table_Name];
                            //                                             }

                            //                                             setSelectedTables(updatedSelection);

                            //                                             setValue("Table_Names", updatedSelection, {
                            //                                                 shouldValidate: true,
                            //                                                 shouldDirty: true,
                            //                                             });
                            //                                         }}
                            //                                         className={`px-3 py-2 flex justify-between items-center 
                            //     ${isAvailable ? "cursor-pointer hover:bg-gray-100" : "bg-gray-200 cursor-not-allowed"} 
                            //     ${isSelected && isAvailable ? "bg-blue-100" : ""}
                            // `}
                            //                                     >
                            //                                         {/* Table Name */}
                            //                                         <span className={`${!isAvailable ? "text-gray-500" : ""}`}>
                            //                                             {table.Table_Name}
                            //                                             {!isAvailable && (
                            //                                                 <span className="ml-2 text-red-500 text-xs">(occupied)</span>
                            //                                             )}
                            //                                         </span>

                            //                                         {/* Checkmark only for selected available tables */}
                            //                                         {isSelected && isAvailable && (
                            //                                             <span className="text-blue-600 font-bold">✔</span>
                            //                                         )}
                            //                                     </div>
                            //                                 );
                            //                             })}

                            //                         {tables?.tables?.filter((table) =>
                            //                             table.Table_Name.toLowerCase().includes(tableSearch.toLowerCase())
                            //                         ).length === 0 && (
                            //                                 <p className="px-3 py-2 text-gray-500">No table found</p>
                            //                             )}
                            //                     </div>
                            //                 )}
                            //             </div>