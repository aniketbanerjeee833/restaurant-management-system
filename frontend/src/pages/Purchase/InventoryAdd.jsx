import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { purchaseFormSchema } from "../../schema/purchaseFormSchema";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetAllPartiesQuery } from "../../redux/api/partyAPi";

import { useRef } from "react";
import { useEffect } from "react";

import { useAddPurchaseMutation } from "../../redux/api/purchaseApi";
import { toast } from "react-toastify";

import { useDispatch } from "react-redux";
import PartyAddModal from "../../components/Modal/PartyAddModal";
import { LayoutDashboard } from "lucide-react";
import { materialApi, useGetAllMaterialsQuery } from "../../redux/api/materialApi";

export default function InventoryAdd() {

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
  const reorderLevelUnits = {
    "Kilogram": "Kg",
    "Litre": "lt",
    "Gram": "gm",
    "Pcs": "pcs"
  }
  const categoryRefs = useRef([]); // store refs for category dropdowns
  const itemRefs = useRef([]);     // store refs for item dropdowns


  const navigate = useNavigate();
  const { data: parties } = useGetAllPartiesQuery();
  // const { data: items, } = useGetAllItemsQuery();
    const { data: materials, isLoading } = useGetAllMaterialsQuery();
  
  console.log(materials, parties);

  const [open, setOpen] = useState(false);
  // console.log(categories, "categories");
  //const[categoryOpen,setCategoryOpen] = useState(false);
  // const [showModal, setShowModal] = useState(false);

  const [partySearch, setPartySearch] = useState("");
  // const [newCategory, setNewCategory] = useState("");

  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showGSTIN, setShowGSTIN] = useState("");
  const [originalTotal, setOriginalTotal] = useState(null);
  // const[chequeNumber,setChequeNumber]=useState(false);
  // const[neftNumber,setNeftNumber]=useState(false);
  // const [paymentType, setPaymentType] = useState("")
  // const [addCategory] = useAddCategoryMutation();
  // const units = {
  //   "gm": "Gram",
  //   "Kg": "Kilogram",
  //   "lt": "Litre",
  //   "pcs": "Piece",

  // }
 const units={
        "Kilogram":"Kg",
        "Litre":"lt",
        "Gram":"gm",
        "Pcs":"pcs"
    }
  // const handleAddCategory = async () => {

  //   if (newCategory.trim() === "") {
  //     return
  //   }
  //   else if (newCategory.trim() !== "") {
  //     try {
  //       // ✅ Call backend
  //       const res = await addCategory({
  //         body: { Item_Category: newCategory.trim() },
  //       });

  //       // Some RTK Query wrappers put the response under `.data`
  //       const data = res?.data || res;

  //       if (data?.success) {
  //         const addedCat = newCategory.trim();

  //         // ✅ Auto-select the new category (single value)
  //         //setSelected(addedCat);
  //         setValue("Item_Category", addedCat); // directly set single category

  //         // ✅ Refresh cache
  //         dispatch(itemApi.util.invalidateTags(["Category"]));

  //         // ✅ Reset modal & input
  //         setShowModal(false);
  //         // setNewCategory("");
  //         // setOpen(true);
  //       } else {
  //         console.warn("⚠️ Category not added. Response:", data);
  //       }
  //     } catch (err) {
  //       console.error("❌ Error adding category:", err);
  //     }
  //   }
  // };

  const [rows, setRows] = useState([
    {
      itemSearch: "", itemOpen: false, isExistingItem: false, isHSNLocked: false,
      isUnitLocked: false, CategoryOpen: false, categorySearch: ""
    }
  ]);

  const [addPurchase, { isLoading: isAddingPurchase }] = useAddPurchaseMutation();
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
    control,
    register,
    handleSubmit,
    setValue,
    watch,

    formState: { errors },
  } = useForm({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      Party_Name: "",

      Bill_Number: "",
      Bill_Date: "",
      State_Of_Supply: "",
      Total_Amount: "",
      Balance_Due: "",
      Total_Paid: "",
      Payment_Type: "Cash",
      Reference_Number: "",
      items: [{


        // Item_Category: "",
        Item_Name: "",
        Quantity: 1,
        Item_Unit: "",
        Purchase_Price: "",

        Discount_On_Purchase_Price: "",
        Discount_Type_On_Purchase_Price: "Percentage",
        Tax_Type: "None",
        Tax_Amount: "",
        Amount: "",
      }
      ]
    }

  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });


  const handleAddRow = () => {
    setRows((prev) => [
      // only close CategoryOpen, preserve lock states
      ...prev.map((row) => ({
        ...row,
        CategoryOpen: false,
        itemOpen: false, // also close item dropdown if open
      })),
      {
        itemSearch: "",
        itemOpen: false,
        CategoryOpen: false,
        isHSNLocked: false,
        isUnitLocked: false,
        isExistingItem: false,
        categorySearch: "",
      },
    ]);

    append({
      // Item_Category: "",
      Item_Name: "",
      // Item_HSN: "",
      Quantity: "1",
      Item_Unit: "",
      Purchase_Price: "",
      Discount_On_Purchase_Price: "",
      Discount_Type_On_Purchase_Price: "Percentage",
      Tax_Type: "None",
      Tax_Amount: "",
      Amount: "",
    });
  };

  const handleDeleteRow = (i) => {
    setRows((prev) => prev.filter((_, idx) => idx !== i)); // remove UI state
    remove(i); // remove from form
  };

  const itemsValues = watch("items");   // watch all item rows
  const totalPaid = watch("Total_Paid"); // watch Total_Paid
  const num = (v) => (v === undefined || v === null || v === "" ? 0 : Number(v));

  const calculateRowAmount = (row, index, itemsValues) => {
    const price = num(row.Purchase_Price);
    const qty = Math.max(1, num(row.Quantity)); // default 1
    const subtotal = price * qty;

    // discount
    let disc = num(row.Discount_On_Purchase_Price);
    if ((row.Discount_Type_On_Purchase_Price || "Percentage") === "Percentage") {
      disc = (subtotal * disc) / 100;
    }
    const afterDiscount = Math.max(0, subtotal - disc);

    // tax
    const taxPercent = TAX_RATES[row.Tax_Type] ?? 0;
    const taxAmount = (afterDiscount * taxPercent) / 100;

    const finalAmount = afterDiscount + taxAmount;

    // ✅ Recalculate total with current row updated
    let totalAmount = 0;
    itemsValues?.forEach((r, i) => {
      if (i === index) {
        // use updated values for current row
        totalAmount += parseFloat(finalAmount || 0);
      } else {
        totalAmount += parseFloat(r.Amount || 0);
      }
    });

    return {
      ...row,
      Quantity: String(qty),
      Tax_Amount: taxAmount.toFixed(2),
      Amount: finalAmount.toFixed(2),
      Total_Amount: totalAmount.toFixed(2), // ✅ correct grand total
      Balance_Due: (totalAmount - num(totalPaid)).toFixed(2),
    };
  };



  // const calcAll = (data) => {
  //   // ensure items exist & valid
  //   const cleanedItems = (data.items || [])
  //     .filter((it) => (it.Item_Name || "").trim() !== "")
  //     .map(calculateRowAmount);

  //   const totalAmount = cleanedItems.reduce(
  //     (sum, it) => sum + num(it.Amount),
  //     0
  //   );

  //   const totalPaid = num(data.Total_Paid); // optional
  //   const balanceDue = totalAmount - totalPaid;

  //   return {
  //     items: cleanedItems,
  //     totals: {
  //       Total_Amount: totalAmount.toFixed(2),
  //       Total_Paid: totalPaid.toFixed(2),
  //       Balance_Due: balanceDue.toFixed(2),
  //     },
  //   };
  // };


  //const itemsValues = watch("items"); // watch all rows
  const formValues = watch();

  // const handleSelect = (rowIndex, categoryName) => {
  //   setRows((prev) => {
  //     const updated = [...prev];
  //     updated[rowIndex] = {
  //       ...updated[rowIndex],
  //       Item_Category: categoryName,
  //       CategoryOpen: false,
  //       isExistingItem: false,   // user-typed, so still editable
  //     };
  //     return updated;
  //   });

  //   setValue(`items.${rowIndex}.Item_Category`, categoryName, { shouldValidate: true });
  // };



  const onSubmit = async (data) => {
    console.log("Form Data (from RHF):", data);

    // const { items, totals } = calcAll(data);

    // 2) build payload
    const payload = {
      ...data,
      Total_Paid: data.Total_Paid || 0,
      // items,
      // Total_Amount: totals.Total_Amount,
      // Total_Paid: totals.Total_Paid,           // blank -> 0.00
      // Balance_Due: totals.Balance_Due,
    };
    const seenItems = new Set();


    for (const item of payload.items) {
      const name = item.Item_Name?.trim().toLowerCase();
    

      const Quantity = item.Quantity

      if (!name || !Quantity) {
        toast.error("Each item must have a valid name and quantity.");
        return;
      }

      // ❌ Prevent duplicates
      if (seenItems.has(name)) {
        toast.error(
          `Duplicate item '${item.Item_Name}' found. Please ensure each item appears only once.`
        );
        return;
      }
      seenItems.add(name);


    }
    console.log("payload:", payload);
    try {
      const res = await addPurchase({
        body: payload,
      }).unwrap();
      console.log(" successfully:", res);
      const resData = res?.data || res;
      dispatch(materialApi.util.invalidateTags(["Material"]));
      if (!resData?.success) {
        toast.error("Failed to add new purchase");
        return;
      } else {
        toast.success("New Purchase of items added successfully!");
        navigate("/inventory/all-inventories");
      }

    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to add  purchase of items";
      toast.error(errorMessage);
      // toast.error("Failed to add lead");
      console.error("Submission failed", error);
    }
  }



  useEffect(() => {
    const gstin = parties?.parties?.find(
      (party) => party.Party_Name === watch("Party_Name")
    )?.GSTIN;

    setShowGSTIN(gstin || ""); // ✅ never undefined
  }, [watch("Party_Name"), parties]);


  console.log("showGSTIN:", showGSTIN, parties);

  console.log("Current form values:", formValues);
  console.log("Form errors:", errors);

  const paymentType = watch("Payment_Type", "");

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

                <div className="
    flex flex-col sm:flex-row 
    justify-between 
    items-start sm:items-center 
    w-full 
    
    mt-4               
  ">

                  {/* LEFT HEADER */}
                  <div className="w-full sm:w-auto">
                    <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 mt-4">Add New Inventory</h4>
                    {/* <p className="text-gray-500 mb-2 sm:mb-4">
        Add new purchase details
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
                      onClick={() => navigate("/inventory/all-inventories")}
                      className="text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "#4CA1AF" }}
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/inventory/all-inventories")}
                      className="text-white py-2 px-4 rounded"
                      style={{ backgroundColor: "#4CA1AF" }}
                    >
                      All Inventories
                    </button>
                  </div>

                </div>
              </div>
              <div style={{ padding: "0px", backgroundColor: "#f1f1f19d" }} className="tab-inn">
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* <div className="row"> */}
                  <div className="flex flex-col justify-between gap-6 w-full sm:flex-row heading-wrapper">
                    <div className="grid grid-rows-2 ml-2 w-full sm:w-1/2 lg:w-1/3 ">
                      {/* <div className="input-field col s6 relative"> */}
                      <div className="w-1/2 flex flex-col relative mt-2 gap-2 party-class"
                        style={{ marginBottom: "0px", marginTop: "0px" }}>
                        <span className="whitespace-nowrap active ">
                          Party
                          <span className="text-red-500">*</span>
                        </span>
                        
<div className="relative w-full">
  <div
    className="flex flex-row border rounded-md bg-white cursor-pointer"
    onClick={() => setOpen((prev) => !prev)}
  >
    <input
      type="text"
      id="Party_Name"
      value={partySearch}
      // value={partySearch.length>10?partySearch.slice(0,15)+"...":partySearch}
      onChange={(e) => {
        const value = e.target.value;
        setPartySearch(value);
        setValue("Party_Name", value, { shouldValidate: true });
        setOpen(true);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setOpen(true);
      }}
      onBlur={() => {
        setTimeout(() => {
          const typedValue = partySearch?.trim()?.toLowerCase();
          const matchedParty = parties?.parties?.find(
            (p) => p.Party_Name.toLowerCase() === typedValue
          );

          if (matchedParty) {
            setPartySearch(matchedParty.Party_Name);
            setValue("Party_Name", matchedParty.Party_Name, { shouldValidate: true });
            setValue("GSTIN", matchedParty.GSTIN || "", { shouldValidate: true });
          }

          setOpen(false);
        }, 150);
      }}
      placeholder="Search By Name/Phone"
      className="w-full outline-none py-1 px-2 text-gray-900"
      style={{ marginBottom: 0, marginTop: "4px", border: "none",borderBottom:"none", height: "2rem" }}
    />
    <div className="w-10 "></div>
    <span className=" absolute right-0 px-2  top-1/3  text-gray-700">▼</span>
  </div>

  {open && (
    <div className="absolute z-20 flex flex-col mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
      <span
        onClick={() => setShowPartyModal(true)}
        className="block px-3 py-2 text-[#4CA1AF] font-medium hover:bg-gray-100 cursor-pointer"
      >
        + Add Party
      </span>

      {parties?.parties
        ?.filter(
          (party) =>
            party?.Party_Name?.toLowerCase()?.includes(partySearch.toLowerCase()) ||
            party?.Phone_Number?.includes(partySearch)
        )
        .map((party, i) => (
          <div
            key={i}
            onClick={() => {
              setPartySearch(party.Party_Name);
              setValue("Party_Name", party.Party_Name, { shouldValidate: true });
              setValue("GSTIN", party.GSTIN || "", { shouldValidate: true });
              setOpen(false);
            }}
            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          >
            {party.Party_Name} ({party.Phone_Number})
          </div>
        ))}

      {parties?.parties?.filter((party) =>
        party?.Party_Name?.toLowerCase()?.includes(partySearch.toLowerCase())
      ).length === 0 && (
        <p className="px-3 py-2 text-gray-500">No Party found</p>
      )}
    </div>
  )}
</div>


                        {/* Add Party Modal */}
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

                        {/* RHF Error */}
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
                          id=" GSTIN"
                          style={{ marginBottom: "0px" }}
                          value={showGSTIN || ""}
                          placeholder="GSTIN"
                          className="w-full outline-none border-b-2 text-gray-900
                          gstin-class"
                          readOnly
                        />
                        {errors?.GSTIN && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors?.GSTIN?.message}
                          </p>
                        )}
                      </div>


                    </div>
                    {/* <div className="row  "> */}
                    <div className="grid grid-rows-3 w-full sm:w-1/2 lg:w-1/3 
          ml-auto gap-0  mr-2">




                      {/* Bill Number */}
                      <div className="flex items-center w-full gap-3  justify-end">
                        {/* <div className="input-field col s6 mt-4"> */}
                        <span className="whitespace-nowrap ">
                          Bill Number
                          <span className="text-red-500">*</span>
                        </span>

                        <input
                          style={{ marginBottom: 0, border: "none", width: "50%" }}
                          type="text"
                          id=" Bill_Number"
                          {...register("Bill_Number")}
                          placeholder="Bill_Number"
                          className=" invoice-number-class w-full outline-none text-gray-900"
                        />
                        {errors?.Bill_Number && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors?.Bill_Number?.message}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center w-full gap-3  justify-end">
                        {/* <div className="input-field col s6 mt-4"> */}
                        <span className="whitespace-nowrap ">
                          Bill Date
                          <span className="text-red-500">*</span>
                        </span>

                        <input
                          type="date"
                          style={{ marginBottom: 0, width: "50%", border: "none" }}
                          id=" Bill_Date"
                          {...register("Bill_Date")}
                          placeholder=" Bill_Date"
                          className="w-full outline-none invoice-date-class  text-gray-900"
                        />
                        {errors?.Bill_Date && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors?.Bill_Date?.message}
                          </p>
                        )}
                      </div>
                      {/* State of Supply */}



                      <div className="flex
                                           items-center w-full gap-3 justify-end
                                           state-of-supply-class">
                        {/* <div className="row w-1/2"> */}

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



                    </div>
                  </div>








                  <div className="table-responsive table-desi mt-4">
                    <table className="table table-hover">
                      <thead>
                        <tr>

                          <th>Sl.No</th>
                          {/* <th>Category</th> */}
                          <th>Item</th>
                          
                          <th>Qty</th>
                          <th>Unit</th>
                          <th>Price/Unit</th>
                          <th>Discount</th>
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

                      
{/* <td style={{ padding: "0px", width: "10%", position: "relative" }}>
  <div ref={(el) => (categoryRefs.current[i] = el)}>
  <input
  type="text"
  value={watch(`items.${i}.Item_Category`) || rows[i]?.categorySearch || ""}
  style={{ marginBottom: "0px" }}
  readOnly={rows[i]?.isExistingItem}
  placeholder="Category"
  className="w-full outline-none border-b-2 text-gray-900"
  onClick={() => {
     setShowModal(false);
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
    setValue(`items.${i}.Item_Category`, value, { shouldValidate: true });
    handleRowChange(i, "isExistingItem", false);
  }}
/>


    {errors?.items?.[i]?.Item_Category && (
      <p className="text-red-500 text-xs mt-1">
        {errors.items[i].Item_Category.message}
      </p>
    )}

    {rows[i]?.CategoryOpen && !rows[i]?.isExistingItem && (
      <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
        <span className="block px-3 py-2 text-[#4CA1AF] font-medium hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            setShowModal(true);
            handleRowChange(i, "CategoryOpen", false);
          }}>
          + Add Category
        </span>

        {categories
          ?.filter((cat) =>
            cat.Item_Category.toLowerCase().startsWith(
              (rows[i]?.categorySearch || "").toLowerCase()
            )
          )
          .map((cat, idx) => (
            <div
              key={idx}
              onClick={() => {
  handleSelect(i, cat.Item_Category);
  handleRowChange(i, "categorySearch", cat.Item_Category);
  setValue(`items.${i}.Item_Category`, cat.Item_Category, { shouldValidate: true });
  handleRowChange(i, "CategoryOpen", false);
}}
            
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {cat.Item_Category}
            </div>
          ))}

        {categories?.filter((cat) =>
          cat.Item_Category.toLowerCase().startsWith(
            (rows[i]?.categorySearch || "").toLowerCase()
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
        backgroundColor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)",
        zIndex: 30,
      }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <button
          type="button"
          onClick={() => setShowModal(false)}
          style={{ backgroundColor: "transparent" }}
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
            onClick={() => setShowModal(false)}
            style={{ backgroundColor: "lightgray" }}
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
</td> */}

                            {/* Item Dropdown */}
                            <td style={{ padding: "0px", width: "25%", position: "relative" }}>
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
                                    handleRowChange(i, "isHSNLocked", false);
                                    handleRowChange(i, "isExistingItem", false);
                                    handleRowChange(i, "isUnitLocked", false);
                                    // ✅ If typed value doesn’t match any existing item → unlock category
                                    const exists = materials?.materials?.some(
                                      (it) => it.name.trim().toLowerCase() === typedValue.toLowerCase()
                                    );
                                    handleRowChange(i, "isExistingItem", exists); // false if new item
                                  }}
                                  onClick={() => handleRowChange(i, "itemOpen", !rows[i]?.itemOpen)}
                                  placeholder="Item Name"
                                  className="w-full outline-none border-b-2 text-gray-900"
                                />
                                {/* RHF error */}
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
                                          {/* <th className="text-left px-3 py-2">Sale Price</th> */}
                                          <th className="text-left px-3 py-2">Purchase Price (Previous)</th>
                                          <th className="text-left px-3 py-2">Current Stock</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {materials?.materials
                                          ?.filter((it) =>
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
                                                    isUnitLocked: true,     // lock unit
                                                  };
                                                  return updated;
                                                });
                                                handleRowChange(i, "itemSearch", it.name);
                                                handleRowChange(i, "isExistingItem", true); // ✅ mark as existing
                                                //handleRowChange(i, "CategoryOpen", false);
                                                //setValue(`items.${i}.Item_Category`, it.Item_Category, { shouldValidate: true , shouldDirty: true});

                                                setValue(`items.${i}.Item_Name`, it.name, { shouldValidate: true, shouldDirty: true });
                                                // setValue(`items.${i}.Item_HSN`, it.Item_HSN, { shouldValidate: true , shouldDirty: true});
                                                setValue(`items.${i}.Purchase_Price`, it.Purchase_Price || 0, { shouldValidate: true , shouldDirty: true});
                                                setValue(`items.${i}.Quantity`, 1, { shouldValidate: true , shouldDirty: true});
                                                setValue(`items.${i}.Item_Unit`, it.unit, { shouldValidate: true , shouldDirty: true});
                                                handleRowChange(i, "itemOpen", false);


                                                const { Tax_Amount, Amount, Total_Amount, Balance_Due } = calculateRowAmount(
                                                  {
                                                    ...itemsValues[i],
                                                    Item_Name: it.name,
                                                    Purchase_Price: it.Purchase_Price || 0,
                                                    Quantity: itemsValues[i]?.Quantity || 1,
                                                    Discount_On_Purchase_Price: itemsValues[i]?.Discount_On_Purchase_Price || 0,
                                                    Discount_Type_On_Purchase_Price: itemsValues[i]?.Discount_Type_On_Purchase_Price,
                                                    Tax_Type: itemsValues[i]?.Tax_Type
                                                  },
                                                  i,
                                                  itemsValues
                                                );

                                                setValue(`items.${i}.Tax_Amount`, Tax_Amount, { shouldValidate: true, shouldDirty: true });
                                                setValue(`items.${i}.Amount`, Amount, { shouldValidate: true, shouldDirty: true });
                                                setValue(`Total_Amount`, Total_Amount,{ shouldValidate: true, shouldDirty: true });
                                                setValue(`Balance_Due`, Balance_Due, { shouldValidate: true, shouldDirty: true });
                                              }}

                                              className="hover:bg-gray-100 cursor-pointer border-b"
                                            >
                                              <td>{idx + 1}</td>
                                              <td className="px-3 py-2">{it.name}</td>
                                              {/* <td className="px-3 py-2 text-gray-600">{it.Sale_Price || 0}</td> */}
                                              <td className="px-3 py-2 text-gray-600">{it.Purchase_Price || 0}</td>
                                              {/* <td style={{color:"transparent"}}
              className={`px-3 py-2 ${it.Stock_Quantity <= 0 ? "text-red-500" : "text-green-500"}`}>
                {it.Stock_Quantity || 0}</td> */}
                                              <td
                                                style={{
                                                  padding: "0.5rem 0.75rem", // same as Tailwind px-3 py-2
                                                  color: it.currentStock <= 0 ? "red" : "limegreen",
                                                  fontWeight: "500", // optional: matches Tailwind's medium weight
                                                }}
                                              >
                                                         {it?.current_stock
                                      ? `${it.current_stock} ${reorderLevelUnits[it.unit] || ""}`
                                      : "N/A"}
                                                {/* {it.currentStock || 0} */}
                                              </td>
                                            </tr>
                                          ))}

                                        {materials?.materials?.filter((it) =>
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

                         
                            {/* <td style={{ padding: "0px", width: "8%" }}>
                              <input
                                type="text"
                                value={rows[i]?.Item_HSN || watch(`items.${i}.Item_HSN`) || ""}
                                maxLength={8}              // limit to 8 digits

                                onChange={(e) => {
                                  if (!rows[i]?.isHSNLocked) {
                                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                                    handleRowChange(i, "Item_HSN", e.target.value);
                                    setValue(`items.${i}.Item_HSN`, e.target.value, { shouldValidate: true, shouldDirty: true });
                                    // setValue(`items.${i}.Item_HSN`, e.target.value);
                                  }
                                }}
                                placeholder="HSN Code"
                                className="w-full outline-none border-b-2 text-gray-900"
                                readOnly={rows[i]?.isHSNLocked} // ✅ lock if item is from dropdown
                              />
                              {errors?.items?.[i]?.Item_HSN && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.items[i].Item_HSN.message}
                                </p>
                              )}
                            </td> */}

                            {/* Qty */}
                            <td style={{ padding: "0px", width: "4%" }}>
                              <input
                                type="text"
                                className="form-control"
                                style={{ width: "100%" }}
                                {...register(`items.${i}.Quantity`)}


                                onChange={(e) => {

                                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                                  if (!itemsValues[i]?.Item_Name || itemsValues[i]?.Item_Name.trim() === "") {
                                    return;
                                  }


                                  const { Tax_Amount, Amount, Total_Amount, Balance_Due } = calculateRowAmount(
                                    {
                                      ...itemsValues[i],
                                      Quantity: Number(e.target.value),
                                    },
                                    i,
                                    itemsValues
                                  );

                                  setValue(`items.${i}.Tax_Amount`, Tax_Amount, { shouldValidate: true, shouldDirty: true });
                                  setValue(`items.${i}.Amount`, Amount, { shouldValidate: true, shouldDirty: true });
                                  setValue("Total_Amount", Total_Amount, { shouldValidate: true, shouldDirty: true });
                                  setValue("Balance_Due", Balance_Due, { shouldValidate: true, shouldDirty: true });
                                }}
                                placeholder="Qty"
                              />
                              {errors?.items?.[i]?.Quantity && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.items[i].Quantity.message}
                                </p>
                              )}
                            </td>

                            {/* Unit */}
                            <td style={{ padding: "0px",width: "15%" }}>
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
                                      handleRowChange(i, "Item_Unit", value);
                                      setValue(`items.${i}.Item_Unit`, value, { shouldValidate: true, shouldDirty: true });
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
                              {errors?.items?.[i]?.Item_Unit && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.items[i].Item_Unit.message}
                                </p>
                              )}
                            </td>


                            {/* Price/Unit */}
                           <td style={{ padding: "0px", width: "6%" }}>
                              <div className="d-flex align-items-center"> 
                                 <input
                                  type="text"
                                  className="form-control"
                                  style={{ width: "100%", marginBottom: "0px" }}
                                  {...register(`items.${i}.Purchase_Price`)}
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
                                    setValue(`items.${i}.Purchase_Price`,val, { shouldValidate: true , shouldDirty: true });
                                    if (!itemsValues[i]?.Item_Name || itemsValues[i]?.Item_Name.trim() === "") {
                                      return;
                                    }


                                    const { Tax_Amount, Amount, Total_Amount, Balance_Due } = calculateRowAmount(
                                      { ...itemsValues[i], Purchase_Price: val },
                                      i,
                                      itemsValues
                                    );

                                    setValue(`items.${i}.Tax_Amount`, Tax_Amount, { shouldValidate: true, shouldDirty: true });
                                    setValue(`items.${i}.Amount`, Amount, { shouldValidate: true, shouldDirty: true });
                                    setValue("Total_Amount", Total_Amount, { shouldValidate: true, shouldDirty: true });
                                    setValue("Balance_Due", Balance_Due, { shouldValidate: true, shouldDirty: true });
                                  }}

                                  placeholder="Price"
                                />

                              {/* </div>
                              {errors?.items?.[i]?.Purchase_Price && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.items[i].Purchase_Price.message}
                                </p>
                              )} */}
                           
{/* <input
  type="text"
  className="form-control"
  style={{ width: "100%", marginBottom: "0px" }}
  {...register(`items.${i}.Purchase_Price`)}
  onChange={(e) => {
    let val = e.target.value;

    val = val.replace(/[^0-9.]/g, "");   // allow only digits + dot

    const parts = val.split(".");
    if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");

    if (val.includes(".")) {
      const [int, dec] = val.split(".");
      val = int + "." + dec.slice(0, 2);     // limit decimals to 2
    }

    e.target.value = val;

    const priceNumber = Number(val) || 0; // convert safely

    setValue(`items.${i}.Purchase_Price`, priceNumber, { shouldValidate: true });

    if (!itemsValues[i]?.Item_Name?.trim()) return;

    const { Tax_Amount, Amount, Total_Amount, Balance_Due } = calculateRowAmount(
      { ...itemsValues[i], Purchase_Price: priceNumber }, // numeric value
      i,
      itemsValues
    );

    setValue(`items.${i}.Tax_Amount`, Tax_Amount);
    setValue(`items.${i}.Amount`, Amount);
    setValue("Total_Amount", Total_Amount);
    setValue("Balance_Due", Balance_Due);
  }}
  placeholder="Price"
/> */}

  </div>
                              {errors?.items?.[i]?.Purchase_Price && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.items[i].Purchase_Price.message}
                                </p>
                              )}
                            </td> 

                            {/* Discount */}
                            <td style={{ padding: "0px", width: "14%" }}>
                              <div className="d-flex align-items-center">
                                <input
                                  type="text"
                                  className="form-control"
                                  style={{ width: "50%", marginBottom: "0px" }}
                                  {...register(`items.${i}.Discount_On_Purchase_Price`)}

                                  onInput={(e) => {
                                    let val = e.target.value;

                                    // allow digits + 1 dot
                                    val = val.replace(/[^0-9.]/g, "");

                                    const parts = val.split(".");
                                    if (parts.length > 2) {
                                      val = parts[0] + "." + parts.slice(1).join("");
                                    }

                                    if (val.includes(".")) {
                                      const [int, dec] = val.split(".");
                                      val = int + "." + dec.slice(0, 2);
                                    }

                                    e.target.value = val;

                                    const { Tax_Amount, Amount, Total_Amount, Balance_Due } = calculateRowAmount(
                                      { ...itemsValues[i], Discount_On_Purchase_Price: val },
                                      i,
                                      itemsValues
                                    );

                                    setValue(`items.${i}.Tax_Amount`, Tax_Amount, { shouldValidate: true, shouldDirty: true });
                                    setValue(`items.${i}.Amount`, Amount, { shouldValidate: true, shouldDirty: true });
                                    setValue("Total_Amount", Total_Amount, { shouldValidate: true, shouldDirty: true });
                                    setValue("Balance_Due", Balance_Due, { shouldValidate: true, shouldDirty: true });
                                  }}

                                  placeholder="Discount"
                                />
                                <Controller
                                  control={control}
                                  name={`items.${i}.Discount_Type_On_Purchase_Price`}
                                  render={({ field }) => (
                                    <select
                                      {...field}
                                      className="form-select ms-2"
                                      style={{ width: "50%", fontSize: "12px" }}
                                      onChange={(e) => {
                                        field.onChange(e); // ✅ let RHF handle its state



                                        const { Tax_Amount, Amount, Total_Amount, Balance_Due } = calculateRowAmount(
                                          { ...itemsValues[i], Discount_Type_On_Purchase_Price: e.target.value },
                                          i,
                                          itemsValues
                                        );

                                        setValue(`items.${i}.Tax_Amount`, Tax_Amount, { shouldValidate: true, shouldDirty: true });
                                        setValue(`items.${i}.Amount`, Amount, { shouldValidate: true, shouldDirty: true });
                                        setValue("Total_Amount", Total_Amount, { shouldValidate: true, shouldDirty: true });
                                        setValue("Balance_Due", Balance_Due, { shouldValidate: true, shouldDirty: true });
                                      }}
                                    >
                                      <option value="Percentage">%</option>
                                      <option value="Amount">Amount</option>
                                    </select>
                                  )}
                                />
                              </div>
                            </td>


                            <td style={{ padding: "0px", width: "12%" }}>
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
                                      const { Tax_Amount, Amount, Total_Amount, Balance_Due } = calculateRowAmount(
                                        { ...itemsValues[i], Tax_Type: e.target.value },
                                        i,
                                        itemsValues
                                      );

                                      setValue(`items.${i}.Tax_Amount`, Tax_Amount, { shouldValidate: true, shouldDirty: true });
                                      setValue(`items.${i}.Amount`, Amount, { shouldValidate: true, shouldDirty: true });
                                      setValue("Total_Amount", Total_Amount, { shouldValidate: true, shouldDirty: true });
                                      setValue("Balance_Due", Balance_Due, { shouldValidate: true, shouldDirty: true });
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

                      <div className="flex flex-col px-2 w-full sm:w-64 sale-left">
                        {/* <div className="flex flex-col w-1/8"> */}
                        <button
                          type="button"
                          onClick={handleAddRow}
                          className=" text-white font-bold py-2 px-4 sm:px-2 md:px-2 w-1/2  rounded "
                          style={{ backgroundColor: "#4CA1AF" }}
                        >
                          + Add Row
                        </button>
                        <div className="flex flex-col  mt-3 gap-2  w-full sm:w-64">
                          {/* <div className="flex flex-col  w-full mt-3"> */}
                          <div className="flex flex-col w-1/2">
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

                            <div className="flex flex-col w-full">
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
                        </div>
                      </div>
        <div style={{width:"100%"}}
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
        setValue("Balance_Due", (newTotal - totalPaid).toFixed(2), { shouldValidate: true });
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
                        
                            <input
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
                                  setValue("Balance_Due", 0, { shouldValidate: true });
                                } else {
                                  // ✅ When unchecked, restore Balance_Due = Total_Amount
                                  setValue("Total_Paid", "");
                                  setValue("Balance_Due", totalAmount.toFixed(2), { shouldValidate: true });
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
                              const totalAmount = parseFloat(watch("Total_Amount") || 0);
                              setValue("Balance_Due", (totalAmount - totalPaid).toFixed(2), { shouldValidate: true });
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
                        

                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-4">
                    <button
                      type="button"

                      onClick={() => navigate("/inventory/all-inventories")}
                      className=" text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "#4CA1AF" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formValues.errorCount > 0 || isAddingPurchase}
                      className=" text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "#4CA1AF" }}
                    >
                      {isAddingPurchase ? "Saving..." : "Save"}
                    </button>
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

{/* <div className="relative w-full">

                          
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
                              className="w-full outline-none py-1 px-2  text-gray-900"
                              style={{
                                marginBottom: 0, marginTop: "4px", border: "none",
                                height: "2rem", borderBottom: "0px"
                              }}
                            />
                            <span className="ml-2  absolute right-5 top-1/3  text-gray-700">
                              ▼
                            </span>
                          </div>
                      
                          {open && (
                            <div className="absolute z-20 flex flex-col mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                              <span
                                onClick={() => setShowPartyModal(true)}
                                className="block px-3 py-2 text-[#4CA1AF] font-medium hover:bg-gray-100 cursor-pointer"
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
                        </div> */}