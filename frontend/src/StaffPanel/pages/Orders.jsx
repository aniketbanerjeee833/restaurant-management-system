import { foodItemApi, useGetAllFoodItemsQuery } from "../../redux/api/foodItemApi";
import { tableApi, useGetAllTablesQuery } from "../../redux/api/tableApi";


import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useFieldArray, useForm } from "react-hook-form";



import { useRef } from "react";
import { useEffect } from "react";

import { toast } from "react-toastify";

import { useDispatch, useSelector } from "react-redux";

import { LayoutDashboard, Minus, Plus, ShoppingCart } from "lucide-react";




import { useAddOrderMutation } from "../../redux/api/Staff/orderApi";
import { useGetAllCategoriesQuery } from "../../redux/api/itemApi";
import { io } from "socket.io-client";
import AddCustomerModal from "../../components/Modal/AddCustomerModal";
import { useMemo } from "react";




const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});


export default function Orders() {
  const { userId } = useSelector((state) => state.user);
  const dispatch = useDispatch();
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
  const [showSummary, setShowSummary] = useState(false);

  const [selectedTables, setSelectedTables] = useState([]);
  const [addOrder] = useAddOrderMutation();
const [customerModal, setCustomerModal] = useState({
  open: false,
  mode: "add", // add | edit
});
// const[showCustomerModal,setShowCustomerModal]=useState(false);

//   // const[customerModal,setShowCustomerModal]=useState(false);
// const [selectedCustomer, setSelectedCustomer] = useState({
//   name: null,
//   phone: null,
// });

  // const itemUnits = {

  //   "pcs": "Pcs",
  //   "plates": "Plates",
  //   "btl": "Bottle",

  // }
    const [activeCategory, setActiveCategory] = useState('All');
  const lastCategoryRef = useRef(activeCategory);

  const { data: tables, isLoading } = useGetAllTablesQuery({});
  const { data: menuItems, isMenuItemsLoading } = useGetAllFoodItemsQuery({});
  const items = menuItems?.foodItems
  console.log(tables, isLoading, "tables", items, isMenuItemsLoading);
  const { data: categories,  } = useGetAllCategoriesQuery()
  console.log(categories, "categories");
  //onst existingCategories=categories?.map((category) => category.Item_Category);
  const existingCategories = [...new Set(categories?.map(c => c.Item_Category))];
  const[searchTerm,setSearchTerm]=useState('');
  const newCategories = ["All", ...existingCategories];
  const [rows, setRows] = useState([
    {
      CategoryOpen: false, categorySearch: "", preview: null
    }
  ]);
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


  const { fields, append,remove } = useFieldArray({
    control,
    name: "items",
  });



  // const handleAddRow = () => {
  //   setRows((prev) => [
  //     ...prev.map((row) => ({
  //       ...row,
  //       CategoryOpen: false,

  //       //   itemOpen: false
  //     })),
  //     {
  //       //   itemSearch: "",
  //       //   itemOpen: false,
  //       CategoryOpen: false,
  //       categorySearch: "",

  //     },
  //   ]);

  //   append({
  //     Item_Name: "",

  //     Item_Price: "",
  //     Item_Quantity: "1",
  //   });
  // };


  // const handleDeleteRow = (i) => {
  //   setRows((prev) => prev.filter((_, idx) => idx !== i)); // remove UI state
  //   remove(i); // remove from form
  // };
  const formValues = watch();
  //const itemsValues = watch("items");   // watch all item rows
  //const totalPaid = watch("Total_Paid"); // watch Total_Paid
  //const num = (v) => (v === undefined || v === null || v === "" ? 0 : Number(v));

 
  console.log(items)
  const [cart, setCart] = useState({});


  //const categories = ['All', ...new Set(items?.map(item => items?.Item_Category))];

  // const filteredItems = activeCategory === 'All'
  //   ? items
  //   : items?.filter(item => item?.Item_Category === activeCategory);

const filteredItems = useMemo(() => {
  if (!items) return [];

  const categoryChanged = lastCategoryRef.current !== activeCategory;

  const result = items.filter((item) => {
    const matchesCategory =
      activeCategory === "All" ||
      item.Item_Category === activeCategory;

    // 🔥 Ignore search when category JUST changed
    const matchesSearch =
      categoryChanged
        ? true
        : !searchTerm.trim() ||
          item.Item_Name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // update ref AFTER filtering
  lastCategoryRef.current = activeCategory;

  return result;
}, [items, activeCategory, searchTerm]);

  console.log(filteredItems, "filteredItems")
  
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

  //     // ➤ If row does NOT exist yet → create one
  //     if (rowIndex === undefined) {
  //       rowIndex = fields.length; // next row index
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
  //     return {
  //       ...prev,
  //       [itemId]: newQty
  //     };
  //   });
  // };
const updateCart = (itemId, delta, index, itemName, itemAmount) => {
  const amount = parseFloat(itemAmount || 0);

  setCart((prev) => {
    const currentQty = Number(prev[itemId] || 0);
    const newQty = currentQty + delta;

    let rowIndex = itemRowMap.current[itemId];

    // ❌ IF QTY BECOMES 0 → REMOVE ITEM COMPLETELY
    if (newQty <= 0) {
      if (rowIndex !== undefined) {
        remove(rowIndex);                // 🔥 remove from RHF
        delete itemRowMap.current[itemId]; // 🔥 remove mapping
      }

      const updatedCart = { ...prev };
      delete updatedCart[itemId];        // 🔥 remove from cart

      setTimeout(updateTotals, 0);
      return updatedCart;
    }

    // ➤ If row does NOT exist yet → create one
    if (rowIndex === undefined) {
      rowIndex = fields.length;
      itemRowMap.current[itemId] = rowIndex;

      append({
        Item_Name: itemName,
        Item_Price: amount,
        Item_Quantity: newQty,
        Amount: (amount * newQty).toFixed(2),
        id: itemId,
      });
    } else {
      // ➤ Update existing row
      setValue(`items.${rowIndex}.Item_Quantity`, newQty);
      setValue(
        `items.${rowIndex}.Amount`,
        (amount * newQty).toFixed(2)
      );
    }

    setTimeout(updateTotals, 0);

    return {
      ...prev,
      [itemId]: newQty,
    };
  });
};


  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
 

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
    for (const item of cleanedItems) {
  if (!item.Item_Quantity || Number(item.Item_Quantity) <= 0) {
    toast.error(`Quantity for "${item.Item_Name}" must be greater than zero`);
    return;
  }
}

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
      Customer_Name: data?.Customer_Name ,
      Customer_Phone: data?.Customer_Phone ,
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

// const isPhoneSearch = /^\d+$/.test(customerSearch);

// const filteredCustomer = customers?.filter((party) => {
//   if (isPhoneSearch) {
//     return party?.Customer_Phone?.includes(customerSearch);
//   }
//   return party?.Customer_Name
//     ?.toLowerCase()
//     ?.includes(customerSearch.toLowerCase());
// });




const customerName = watch("Customer_Name");
const customerPhone = watch("Customer_Phone");

const hasCustomer = Boolean(customerPhone); // phone is safest




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
            <div style={{ padding: "20px",marginBottom:"20px" }}
              className="box-inn-sp">

              <div className="inn-title w-full px-2 py-3">

                <div className="flex flex-col mt-10 sm:flex-row justify-between items-start sm:items-center
                                 w-full sm:mt-0">

                  {/* LEFT HEADER */}
                  <div className="w-full flex justify-center items-center sm:w-auto">
                    <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Add New Order</h4>
                    {/* <p className="text-gray-500 mb-2 sm:mb-4">
        Add new sale details
      </p> */}
                  </div>

                  {/* RIGHT BUTTON SECTION */}
                  {/* <div className="
      w-full sm:w-auto 
      flex flex-wrap sm:flex-nowrap 
      justify-start sm:justify-end 
      gap-3
    "> */}
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

                  <div style={{  backgroundColor: "#f1f1f19d" }} 
                    className="w-full flex flex-col p-2  mt-2 gap-2 heading-wrapper "
                                          >
                                         
              
                   {/* <div 
                  className="relative sm:w-1/4">

                     <span className="whitespace-nowrap active ">
                                            Customer
                                            <span className="text-red-500">*</span>
                          <span
      onClick={() => setShowCustomerModal(true)}
      className="block  py-2 text-[#ff0000] font-medium hover:bg-gray-100 cursor-pointer"
    >
      + Add Customer
    </span>
                                          </span>
                                          
          


                  </div>
                   */}
 <div className="relative sm:w-full">
  {/* LABEL AREA */}
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


  {/* ACTION */}
  {/* {!hasCustomer ? (
 
    <span
      onClick={() =>     setCustomerModal({ open: true, mode: "add" })}
      className="block py-2 text-[#ff0000] font-medium cursor-pointer hover:bg-gray-100"
    >
      + Add Customer
    </span>
  ) : (
    
    <span
      onClick={() =>
        setCustomerModal({
          open: true,
          mode: "edit",
        })
      }
      className="block py-2 text-blue-600 font-medium cursor-pointer hover:bg-gray-100"
    >
      ✏️ Edit Customer
    </span>
  )} */}

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


{/* {customerModal.open && (
  <AddCustomerModal
    mode={customerModal.mode}
    initialData={
      customerModal.mode === "edit"
        ? {
            Customer_Name: customerName || "",
            Customer_Phone: customerPhone || "",
          }
        : null
    }
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
)} */}


                  
                                          {/* RHF Error */}
                                          {/* {errors?.Customer_Name && (
                                            <p className="text-red-500 text-xs mt-1">{errors?.Customer_Name?.message}</p>
                                          )} */}
                                        </div>
              </div>
              <div style={{ padding: "0", backgroundColor: "#f1f1f19d" }} className="tab-inn">
                <form onSubmit={handleSubmit(onSubmit)}>

                  <div className="
  grid
  grid-rows-2 grid-cols-1
  md:grid-rows-1 md:grid-cols-3
  p-2 mt-0 gap-6 w-full heading-wrapper
">

                  {/* <div className="grid grid-cols-3  p-2 mt-0 gap-6 w-full heading-wrapper"> */}


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
                    {/* <div className="hidden md:block"></div> */}

                    {/* <div className="sm:visible"></div> */}

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
                        <p className="text-gray-500 flex w-full
                        items-center justify-center">No tables selected</p>
                      )}
                    </div>
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

                  <div
                    style={{ backgroundColor: "#f1f1f19d" }} className=" mx-auto px-2 py-2">
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
                        {/* TOP HEADER */}
                       



                      </div>


                      {/* Food Items Grid */}
                      <div className=" mx-auto px-2 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 
                                                lg:grid-cols-4 xl:grid-cols-6 gap-6">
                    
                          {filteredItems && filteredItems.length > 0 && filteredItems?.map((item, index) => {

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
            disabled={unavailable || Number(cart[item.id] || 0) === 0}
            onClick={() =>
              !unavailable &&
              updateCart(item.id, -1, index, item.Item_Name, item.Amount)
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
  disabled={unavailable || Number(cart[item.id] || 0) === 0}
  onClick={() =>
    !unavailable &&
    updateCart(item.id -1, index, item?.Item_Name, item?.Amount)
  }
  className={`
    w-7 h-7 flex items-center justify-center rounded-md shadow transition
    ${unavailable || Number(cart[item.id] || 0) === 0
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-white hover:bg-gray-100 text-[#ff0000]"
    }
  `}
>
  <Minus className="w-3 h-3" />
</button> */}

{/* <span className="text-base font-semibold text-gray-800 px-2">
  {cart[item.Item_Id] || 0}
</span> */}

{/* <button
  type="button"
  disabled={unavailable}
  onClick={() =>
    !unavailable &&
    updateCart(item?.Item_Id, 1, index, item?.Item_Name, item?.Amount)
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
</button> */}


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
              updateCart(item.id, 1, index, item.Item_Name, item.Amount)
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
                 
                        <div className="flex justify-center items-center gap-12 w-full">
                          {/* <div className="grid grid-cols-3"> */}


                          {/* SAVE & HOLD */}
                          <button
                            type="button"
                            onClick={() => setShowSummary(true)}   // open bottom sheet
                            // disabled={formValues.errorCount > 0 || isAddingOrder}
                            className="relative w-full py-2 px-4 md:w-auto 
                            flex items-center justify-center gap-3 
                            
                                  text-white font-bold  rounded shadow sm:py-3 px-6"
                            style={{ backgroundColor: "black" }}
                          >
                            Save & Hold
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
                            className="w-full md:w-auto
                             text-white font-bold py-2 px-4 rounded shadow sm:py-3 px-6"
                            style={{ backgroundColor: "#ff0000" }}
                          >
                            Save & Pay Bill
                          </button>

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
                      <div
                        className={`
    fixed left-0 bottom-0 w-full 
    bg-white shadow-2xl rounded-t-2xl z-50
    transform transition-transform duration-300 p-4
    ${showSummary ? "translate-y-0" : "translate-y-full"}
  `}
                        // style={{ maxHeight: "vh" }}
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
                              <button type="button" style={{ backgroundColor: "transparent",fontSize: "30px" }}
                                className="text-gray-500 text-2xl font-bold"
                                onClick={() => setShowSummary(false)}>✖</button>
                            </div>
                          </div>
                        </div>

                        {/* SUMMARY CONTENT */}
                        <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: "55vh" }}>
                          {fields.map((item, index) => (
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
                          <div className="flex justify-center mt-4">
                            <button type="submit"
                            style={{backgroundColor:"#ff0000"}}
                              className="w-16 h-10 flex items-center justify-center 
          rounded-md text-white shadow  ">
                              OK
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
//                                                         <span className="bg-white/90 px-2 py-1 rounded-full text-xs font-semibold text-[#ff0000] shadow">
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
//                                                             <div className="text-sm font-bold text-[#ff0000]">
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
//            rounded-md shadow hover:bg-gray-100 text-[#ff0000]
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
//                                                                     className="w-9 h-9 flex items-center justify-center bg-[#ff0000] 
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
//                                                                 <div style={{ backgroundColor: "#ff0000" }}
//                                                                 className="flex flex-row rounded">
//                                                                 <button
//                                                                     type="submit"
//                                                                     disabled={formValues.errorCount > 0 || isAddingOrder}
//                                                                     className="relative text-white
//                                                                      font-bold py-2 px-5 rounded flex items-center gap-3"
//                                                                     style={{ backgroundColor: "#ff0000" }}
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
//                                                                     style={{ backgroundColor: "#ff0000" }}
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
//                                                                 style={{ backgroundColor: "#ff0000" }}
//                                                             >
//                                                                 {isAddingOrder ? "Saving..." : "Save and Hold"}
//                                                             </button>
//                                                             <button
//                                                                 type="submit"

//                                                                 className=" text-white font-bold py-2 px-4 rounded"
//                                                                 style={{ backgroundColor: "#ff0000" }}
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
            bg-[#ff0000] text-white rounded-lg 
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





{/* Floating Cart Summary */ }
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
        type="submit"
        disabled={formValues.errorCount > 0 || isAddingOrder}
        className="relative w-full md:w-auto flex items-center justify-center gap-3 
                   text-white font-bold py-2 px-5 rounded shadow"
        style={{ backgroundColor: "#ff0000" }}
      >
        {isAddingOrder ? "Saving..." : "Save & Hold"}

     
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
                    )} */}

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

                
                  </div>
                   */}

                                                             {/* Add Customer Modal */}
                                          {/* {customerModal && (
                                            <AddCustomerModal
                                              onClose={() => setShowCustomerModal(false)}
                                              // onSave={(newParty) => {
                                              //   setCustomerSearch(newParty);
                                              //   setValue("Customer_Name", newParty, { shouldValidate: true });
                                              //   setShowCustomerModal(false);
                                              // }}
                                            />
                                          )} */}
                                          {/* {customerModal && (
  <AddCustomerModal
    onClose={() => setShowCustomerModal(false)}
    onSave={(customer) => {
      // 🔥 SINGLE SOURCE OF TRUTH
      setSelectedCustomer({
        name: customer.Customer_Name || null,
        phone: customer.Customer_Phone,
      });

      // 🔥 Update dropdown + RHF
      // setCustomerSearch(
      //   customer.Customer_Name || customer.Customer_Phone
      // );

      setValue("Customer_Name", customer.Customer_Name || null, {
        shouldValidate: true,
      });

      setValue("Customer_Phone", customer.Customer_Phone, {
        shouldValidate: true,
      });

      setShowCustomerModal(false);
    }}
  />
)} */}