
import { useGetAllFoodItemsQuery } from "../../redux/api/foodItemApi";
import { useGetAllTablesQuery } from "../../redux/api/tableApi";


import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useFieldArray, useForm } from "react-hook-form";



import { useRef } from "react";
import { useEffect } from "react";





import { LayoutDashboard, Minus, Plus, ShoppingCart } from "lucide-react";






import OrderTakeawayModal from "../../components/Modal/OrderTakeawayModal";
import { useGetAllCategoriesQuery } from "../../redux/api/itemApi";
import { useGetAllCustomersQuery } from "../../redux/api/Staff/orderApi";
import AddCustomerModal from "../../components/Modal/AddCustomerModal";
import { useMemo } from "react";




export default function OrdersTakeAway() {
  //const { userId } = useSelector((state) => state.user);
  // const dispatch = useDispatch();
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
  const [showSummary, setShowSummary] = useState(false);
  const [ordertakeawayModalOpen, setOrdertakeawayModalOpen] = useState(false);
  const { data: categories } = useGetAllCategoriesQuery()
  console.log(categories, "categories");
  //const existingCategories=categories?.map((category) => category.Item_Category);
  const existingCategories = [...new Set(categories?.map(c => c.Item_Category))];
  const[searchTerm,setSearchTerm]=useState('');
  const newCategories = ["All", ...existingCategories];

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

  // const [selectedTables, setSelectedTables] = useState([]);
  // const [addOrder, { isLoading: isAddingOrder }] = useAddOrderMutation();
  // const itemUnits = {

  //     "pcs": "Pcs",
  //     "plates": "Plates",
  //     "btl": "Bottle",

  // }
  const [activeCategory, setActiveCategory] = useState('All');
const lastCategoryRef = useRef(activeCategory);
  const { data: tables, isLoading } = useGetAllTablesQuery({});
  const { data: menuItems, isMenuItemsLoading } = useGetAllFoodItemsQuery({});
  const items = menuItems?.foodItems
  console.log(tables, isLoading, "tables", menuItems, isMenuItemsLoading);
  // const[customerModal,setShowCustomerModal]=useState(false);
  const{ data: customers}=useGetAllCustomersQuery();
  console.log(customers,"customers");
  //  const [customerSearch, setCustomerSearch] = useState("");
const [customerModal, setCustomerModal] = useState({
  open: false,
  mode: "add", // add | edit
});
  //  const[customerDropdownOpen,setCustomerDropdownOpen]=useState(false);
  const [rows, setRows] = useState([
    {
      CategoryOpen: false, categorySearch: "", preview: null
    }
  ]);
  // const [addNewSale, { isLoading: isAddingSale }] = useAddNewSaleMutation();
  // const[addPurchase,{isLoading:isAddingPurchase}]=useAddPurchaseMutation();
  // helper to update a field in a specific row
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


  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });




  const formValues = watch();
  const itemsValues = watch("items");   // watch all item rows
  //const totalPaid = watch("Total_Paid"); // watch Total_Paid
  const num = (v) => (v === undefined || v === null || v === "" ? 0 : Number(v));
const customerName = watch("Customer_Name");
const customerPhone = watch("Customer_Phone");

const hasCustomer = Boolean(customerPhone); // phone is safest


  console.log(items)
  const [cart, setCart] = useState({});
  
  // const newCategories = ['All', existingCategories];
  console.log(newCategories, "newCategories")

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


  const updateCart = (itemId, delta, index, itemName, itemAmount) => {
    const price = parseFloat(itemAmount || 0);

    setCart(prev => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, currentQty + delta);

      let rowIndex = itemRowMap.current[itemId];

      // 1️⃣ If quantity becomes ZERO → REMOVE row
      if (newQty === 0) {
        if (rowIndex !== undefined) {
          remove(rowIndex);               // remove row from RHF
          delete itemRowMap.current[itemId]; // delete mapping
        }

        return {
          ...prev,
          [itemId]: 0
        };
      }

      // 2️⃣ If row DOES NOT exist → CREATE one
      if (rowIndex === undefined) {
        rowIndex = fields.length;
        itemRowMap.current[itemId] = rowIndex;

        append({
          Item_Name: itemName,
          Item_Price: price,
          Item_Quantity: newQty,
          Amount: (price * newQty).toFixed(2)
        });
      }

      // 3️⃣ Update existing row values
      setValue(`items.${rowIndex}.Item_Name`, itemName);
      setValue(`items.${rowIndex}.Item_Price`, price);
      setValue(`items.${rowIndex}.Item_Quantity`, newQty);
      setValue(`items.${rowIndex}.Amount`, (price * newQty).toFixed(2));

      // 4️⃣ Recalculate totals
      setTimeout(updateTotals, 0);

      return {
        ...prev,
        [itemId]: newQty
      };
    });
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);








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
            <div style={{ padding: "20px", marginBottom: "20px" }}
              className="box-inn-sp">

              <div className="inn-title w-full px-2 py-3">

                <div className="flex
                                  flex-col mt-10 sm:flex-row justify-between items-start sm:items-center
                                  w-full sm:mt-0">

                  {/* LEFT HEADER */}
                  <div className="w-full flex justify-center items-center sm:w-auto">
                    <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Add Order Takeaway</h4>
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
                                className="
  grid
  grid-rows-2 grid-cols-1
  md:grid-rows-1 md:grid-cols-3
  p-2 mt-0 gap-6 w-full heading-wrapper
">
                                    <div 
                                      className="w-full flex flex-col   mt-2 gap-2  "
                                                            >
                                                            {/* <span className="whitespace-nowrap active ">
                                                              Customer
                                                              <span className="text-red-500">*</span>
                                                            </span> */}
                                                            
                                 

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
             
              </div>
              <div style={{ padding: "0", backgroundColor: "#f1f1f19d" }} className="tab-inn">
                <form >




                  <div style={{ backgroundColor: "#f1f1f19d" }} className=" mx-auto px-2 py-2">
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



                      </div>


                      {/* Food Items Grid */}
                      <div className=" mx-auto px-2 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 
                                                 lg:grid-cols-4 xl:grid-cols-6 gap-6">

                          {filteredItems?.map((item, index) => {

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

                                  {/* <div className="absolute bottom-1 left-2 right-2">
                                    <h4 className="text-white text-[20px] leading-tight">
                                      {item.Item_Name}
                                    </h4>
                                  </div> */}
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
                                      disabled={unavailable}
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

                            className="relative w-full md:w-auto flex items-center justify-center gap-3 
                                                                   text-white font-bold py-3 px-6 rounded shadow"
                            style={{ backgroundColor: "#ff0000" }}
                          >
                            Save & Pay Bill


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

                          {/* <button
                            type="button"
                            className="w-full md:w-auto text-white font-bold py-3 px-6 rounded shadow"
                            style={{ backgroundColor: "#ff0000" }}
                          >
                            Save & Pay Bill
                          </button> */}

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
  // `}
                      //                       style={{ maxHeight: "vh" }}
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
                              <button type="button" style={{ backgroundColor: "transparent", fontSize: "30px" }}
                                className="text-gray-500 text-2xl font-bold"
                                onClick={() => setShowSummary(false)}>✖</button>
                            </div>
                          </div>
                        </div>

                        {/* SUMMARY CONTENT */}
                        <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: "55vh" }}>
                          {itemsValues && itemsValues?.map((item, index) => (
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
                            <button type="button"
                            style={{ backgroundColor: "#ff0000" }}
                              onClick={() => setOrdertakeawayModalOpen(true)}
                              className="w-16 h-10 flex items-center justify-center bg-[#ff0000] 
          rounded-md text-white shadow hover:bg-[#3a8c98] ">
                              OK
                            </button>

                          </div>
                        </div>
                      </div>


                    </div>


                  </div>
                </form>
                {ordertakeawayModalOpen &&
                  <OrderTakeawayModal
                    onClose={() => setOrdertakeawayModalOpen(false)}
                    orderDetails={formValues}
                    setOpen={setOrdertakeawayModalOpen}
                  />}

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
         type="button"
         onClick={()=>setOrdertakeawayModalOpen(true)}
         disabled={formValues.errorCount > 0 || isAddingOrder}
         className="relative w-full md:w-auto flex items-center justify-center gap-3 
                    text-white font-bold py-2 px-5 rounded shadow"
         style={{ backgroundColor: "#ff0000" }}
       >
         {isAddingOrder ? "Saving..." : "Save & Pay Bill"}
 
         
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
                  
                                // onClick={() => {
                                //   setCustomerSearch(party?.Customer_Name || "");
                                //   setValue("Customer_Name", party?.Customer_Name || "", {
                                //     shouldValidate: true,
                                //   });
                                //   setValue("Customer_Phone", party?.Customer_Phone || "", {
                                //     shouldValidate: true,
                                //   });
                                //   setCustomerDropdownOpen(false);
                                // }}
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
                                      )} 
                                    </div>
                                    
                                    
                                                          
                                                            {customerModal && (
                                                              <AddCustomerModal
                                                                onClose={() => setShowCustomerModal(false)}
                                                                onSave={(newParty) => {
                                                                  setCustomerSearch(newParty);
                                                                  setValue("Customer_Name", newParty, { shouldValidate: true });
                                                                  setShowCustomerModal(false);
                                                                }}
                                                              />
                                                            )}
                                    
                                                           
                                                            {errors?.Customer_Name && (
                                                              <p className="text-red-500 text-xs mt-1">{errors?.Customer_Name?.message}</p>
                                                            )} */}