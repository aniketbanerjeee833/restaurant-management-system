

import React, { useState } from "react";
import {
  Calendar,
  Search,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Package,
  CalendarDays,
  Trash2,
  Eye,
  Pencil,
} from "lucide-react";
import { useEditDailyFoodStockMutation, useGetFoodItemStockHistoryByDateQuery, useRemoveDailyFoodStockMutation } from "../../redux/api/foodItemApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetUserQuery } from "../../redux/api/userApi";
import { toast } from "react-toastify";
import { useEffect } from "react";



export default function AllDailyFoodStockDashboard() {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  //const [selectedDate, setSelectedDate] = useState(today);
  //const [searchTerm, setSearchTerm] = useState("");
  //const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedItem, setExpandedItem] = useState(null);
  const [editingTxId, setEditingTxId] = useState(null);
  const [editedQty, setEditedQty] = useState("");

  const { data: userMe, } = useGetUserQuery();
  console.log(userMe, "userMe in header");

  //const[page,setPage]= useState(1);
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams();

  const initialDate = searchParams.get("date") || today;
  const initialSearch = searchParams.get("search") || "";
  const initialPage = Number(searchParams.get("page")) || 1;

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(initialPage);

  const [editDailyFoodStock] = useEditDailyFoodStockMutation();
  const [removeDailyFoodStock] = useRemoveDailyFoodStockMutation();
  const [updatingDailyFoodStock, setUpdatingDailyFoodStock] = useState(null);
  const handleDeleteTransaction = async (tx) => {
    console.log(tx);
    if (window.confirm("Are you sure you want to delete this added food stock ?")) {
      try {
        await removeDailyFoodStock({
          Movement_Id: tx.id,
          User_Id: userMe?.user?.User_Id,
        }).unwrap();
        toast.success("Stock  deleted successfully");
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete stock ");
      }
    }
  }
  const handlePageChange = (newPage) => {
    setPage(newPage);
  }
  const handleNextPage = () => {
    setPage(page + 1);
  }
  const handlePreviousPage = () => {
    setPage(page - 1);
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400); // 400ms is perfect for POS

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: foodItemStockHistoryByDate,
    isLoading,
    isFetching,
    isError,
  } = useGetFoodItemStockHistoryByDateQuery({
    date: selectedDate,
    page,
    search: debouncedSearch,
  });


  console.log(foodItemStockHistoryByDate, "foodItemStockHistoryByDate");
  const inventoryItems = foodItemStockHistoryByDate?.items || [];
  console.log(inventoryItems, "inventoryItems");

  // const handleEditSave = async (tx) => {
  // console.log(tx);
  //   // try {
  //   //   setSavingTx(true);

  //   //   await editDailyFoodStock({
  //   //     Item_Id: item.Item_Id,
  //   //     New_Closing_Quantity: Number(editedQty),
  //   //     User_Id: userMe?.user?.id,
  //   //   });

  //   //   setEditingTxId(null);
  //   // } catch (err) {
  //   //   console.error(err);
  //   // } finally {
  //   //   setSavingTx(false);
  //   // }
  // };





  // const inventoryItems = useMemo(() => {
  //   return inventoryData.filter((item) => {
  //     const matchesSearch =
  //       item.Item_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       item.Item_Id?.toLowerCase().includes(searchTerm.toLowerCase());



  //     return matchesSearch;
  //   });
  // }, [inventoryData, searchTerm,]);
  const handleEditSave = async (tx) => {
    console.log(tx);
    try {

      setUpdatingDailyFoodStock(tx.id);
      const newQty = Number(editedQty);
      const oldQty = Number(tx.Quantity);

      if (newQty < 0) {
        alert("Quantity cannot be negative");
        toast.error("Quantity cannot be negative");
        return;
      }

      if (newQty === oldQty) {
        setEditingTxId(null);
        return;
      }

      await editDailyFoodStock({
        Movement_Id: tx.id,              // 👈 THIS IS movement id
        New_Quantity: newQty,
        User_Id: userMe?.user?.User_Id,
      }).unwrap();

      setEditingTxId(null);

    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingDailyFoodStock(null);
    }
  };
  useEffect(() => {
    setSearchParams({
      date: selectedDate,
      search: debouncedSearch,
      page: page.toString(),
    });
  }, [selectedDate, debouncedSearch, page]);

  const toggleExpand = (itemId) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  // const getStockBadge = (quantity) => {
  //   if (quantity === 0)
  //     return (
  //       <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
  //         Out of Stock
  //       </span>
  //     );
  //   if (quantity < 5)
  //     return (
  //       <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
  //         Low Stock
  //       </span>
  //     );
  //   return (
  //     <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
  //       In Stock
  //     </span>
  //   );
  // };

  // const getMovementBadge = (type) => {
  //   const badges = {
  //     ADD: (
  //       <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
  //         ADD
  //       </span>
  //     ),
  //     TAKEAWAY: (
  //       <span className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-700">
  //         TAKEAWAY
  //       </span>
  //     ),
  //     DINE_IN: (
  //       <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
  //         DINE IN
  //       </span>
  //     ),
  //     SOLD: (
  //       <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">
  //         SOLD
  //       </span>
  //     ),
  //     RETURN:(
  //       <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-black-700">
  //         RETURN
  //       </span>
  //     )
  //   };

  //   return (
  //     badges[type] || (
  //       <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
  //         {type}
  //       </span>
  //     )
  //   );
  // };
  const getMovementBadge = (type) => {
    const badges = {
      ADD: (
        <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
          ADD
        </span>
      ),
      ADJUST: (
        <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-black-700">
          ADJUST
        </span>
      )

    };

    return (
      badges[type] || (
        <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
          {type}
        </span>
      )
    );
  };

  return (
    <div className="flex flex-col bg-white">
      {/* HEADER */}
      <div>

        <div className="inn-title">
          {/* <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Inventory Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Monitor and track your inventory
              </p>
            </div> */}
          <div className="flex flex-col sm:flex-col lg:flex-row justify-between lg:items-center">
            <div>
              <h4 className="text-2xl font-bold mb-1">All Daily Stock</h4>
              <p style={{ color: "#ff0000" }}
                className="text-gray-500 text-sm sm:text-base">
                All Daily Stock Details
              </p>
            </div>

            {/* <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-900 border-none focus:outline-none cursor-pointer"
              />
            </div> */}


            {/* SEARCH + FILTER */}
            {/* <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by item name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white"
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div> */}
            <div

              className="
        flex flex-col gap-2 sm:flex-row sm:flex-wrap gap-0
        sm:space-x-4 space-y-3 sm:space-y-0
        sm:items-center"
            >

              <div className="relative flex  items-center gap-2">
                {/* Hidden Date Input */}


                {/* Calendar Icon */}
                {/* <button
                                              type="button"
                                              className="flex items-center justify-center
                                                         w-10 h-10 rounded-full
                                                         border border-gray-300
                                                         hover:bg-gray-100"
                                            > */}

                <input
                  type="date"
                  id="dashboard-date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    // 👉 call API / set state here
                  }}
                />

                {/* </button> */}

              </div>


              <div className="flex items-center w-full sm:w-56">
                <input
                  type="text"
                  placeholder="Search ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-56"
                />
              </div>


              <div className="hidden sm:block">
                <button
                  style={{
                    outline: "none",
                    boxShadow: "none",
                    backgroundColor: "#ff0000",
                  }}
                  className="hidden sm:block text-white px-4 py-2 rounded-md sm:w-auto"
                  onClick={() => navigate("/food-items/daily-food-stock")}
                >
                  Add  Daily Stock
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div className="flex flex-col bg-white px-6 py-6">

        {isError && (
          <div className="text-center py-10 text-red-500">
            Failed to load inventory
          </div>
        )}

        {/* ===================== LOADING SKELETON ===================== */}
        {/* {(isLoading || isFetching) && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">

           
            <div className="bg-gray-100 border-b px-2 sm:px-6 py-2 sm:py-3">
              <div className="grid grid-cols-12 gap-2 sm:gap-4 text-[10px] sm:text-xs font-semibold uppercase animate-pulse">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-3 bg-gray-300 rounded w-full" />
                ))}
              </div>
            </div>

            
            <div className="divide-y">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-6 py-4 animate-pulse">
                  <div className="grid grid-cols-12 gap-4 items-center">

                    <div className="col-span-1">
                      <div className="h-4 bg-gray-200 rounded w-6" />
                    </div>

                    <div className="col-span-6">
                      <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-24" />
                    </div>

                    <div className="col-span-1 text-center">
                      <div className="h-4 bg-gray-200 rounded w-8 mx-auto" />
                    </div>

                    <div className="col-span-1 text-center">
                      <div className="h-4 bg-gray-200 rounded w-8 mx-auto" />
                    </div>

                    <div className="col-span-1 text-center">
                      <div className="h-4 bg-gray-200 rounded w-8 mx-auto" />
                    </div>

                    <div className="col-span-1 text-center hidden sm:block">
                      <div className="h-4 bg-gray-200 rounded w-10 mx-auto" />
                    </div>

                    <div className="col-span-1 text-center">
                      <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto" />
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}
{(isLoading || isFetching) && (
  <div className="bg-white rounded-lg shadow-sm overflow-x-auto">

    <table className="w-full min-w-[500px] animate-pulse">

      {/* HEADER */}
      <thead className="bg-gray-100 border-b">
        <tr className="text-xs font-semibold uppercase text-gray-700">

          <th className="p-3 text-left">
            <div className="h-3 bg-gray-300 rounded w-10"></div>
          </th>

          <th className="p-3 text-left">
            <div className="h-3 bg-gray-300 rounded w-32"></div>
          </th>

          <th className="p-3 text-center">
            <div className="h-3 bg-gray-300 rounded w-16 mx-auto"></div>
          </th>

          <th className="p-3 text-center">
            <div className="h-3 bg-gray-300 rounded w-16 mx-auto"></div>
          </th>

          <th className="p-3 text-center">
            <div className="h-3 bg-gray-300 rounded w-16 mx-auto"></div>
          </th>

          <th className="p-3 text-center hidden sm:table-cell">
            <div className="h-3 bg-gray-300 rounded w-16 mx-auto"></div>
          </th>

          <th className="p-3 text-center">
            <div className="h-3 bg-gray-300 rounded w-16 mx-auto"></div>
          </th>

        </tr>
      </thead>


      {/* BODY */}
      <tbody>

        {[...Array(6)].map((_, i) => (
          <tr key={i} className="border-t">

            <td className="p-3">
              <div className="h-4 bg-gray-200 rounded w-6"></div>
            </td>

            <td className="p-3">
              <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </td>

            <td className="p-3 text-center">
              <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
            </td>

            <td className="p-3 text-center">
              <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
            </td>

            <td className="p-3 text-center">
              <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
            </td>

            <td className="p-3 text-center hidden sm:table-cell">
              <div className="h-4 bg-gray-200 rounded w-10 mx-auto"></div>
            </td>

            <td className="p-3 text-center">
              <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto"></div>
            </td>

          </tr>
        ))}

      </tbody>

    </table>

  </div>
)}
        {/* ===================== REAL DATA ===================== */}
        {/* {!isLoading && !isError && (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto ">
   
        <div className="bg-gray-100 border-b px-2 min-w-[500px] sm:px-6 py-2 sm:py-3">
          <div className="grid grid-cols-12 gap-2 sm:gap-4 
              text-[10px] sm:text-xs min-w-[500px]
              font-semibold text-gray-700 uppercase"
          >
            <div className="col-span-1  whitespace-nowrap">Sl No.</div>
            <div className="col-span-4 sm:col-span-6">Item</div>
            <div className="col-span-2 sm:col-span-1 text-center">Opening</div>
            <div className="col-span-2 sm:col-span-1 text-center">Added</div>
            <div className="col-span-2 sm:col-span-1 text-center">Sold</div>
            <div className="hidden sm:block col-span-1 text-center">Closing</div>
            <div className="col-span-1 text-center  whitespace-nowrap">Action</div>
          </div>
        </div>
           {/* <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Sl No.</th>
                   
                    <th className="p-3 text-right">Item</th>
                    
                    <th 
                     className="p-3 text-right text-green-600">Opening</th>
                    <th className="p-3 text-right text-orange-600">Added</th>
                     <th className="p-3 text-right text-blue-600">Sold</th>
                    <th className=" sm:block p-3 text-right">Closing</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead> 

       
        <div className="divide-y">
          {inventoryItems.map((item, idx) => (
            <div key={item.Item_Id} className="overflow-x-auto min-w-[500px]">
              <div className="px-6 py-4 hover:bg-gray-50">
                <div className="grid grid-cols-12 gap-4 items-center  min-w-[500px]">

                  <div className="col-span-1">
                    <h5 className="font-semibold text-gray-900">
                      {(foodItemStockHistoryByDate?.currentPage - 1) * 10 + (idx + 1)}.
                    </h5>
                  </div>

                  <div className="col-span-6">
                    <h5 className="font-semibold text-gray-900">
                      {item.Item_Name}
                    </h5>
                  </div>

                  <div className="col-span-1 text-center">
                    {item.Opening_Quantity}
                  </div>

                  <div className="col-span-1 text-center text-green-600 font-semibold">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    {item.Added_Quantity}
                  </div>

                  <div className="col-span-1 text-center text-red-600 font-semibold">
                    <TrendingDown className="w-3 h-3 inline mr-1" />
                    {item.Sold_Quantity}
                  </div>

                  <div className="col-span-1 text-center font-bold hidden sm:block">
                    {item.Closing_Quantity}
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      style={{ background: "none" }}
                      onClick={() => toggleExpand(item.Item_Id)}
                      className="p-2 hover:bg-gray-200 rounded-lg"
                    >
                      {expandedItem === item.Item_Id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                </div>
              </div>

             
              {expandedItem === item.Item_Id && (
                <div className="px-6 pb-4 bg-gray-50 w-full">
                  <div className="border-t pt-3 space-y-2">

                    {item.history?.filter(tx =>
                      tx.Movement_Type === "ADD" || tx.Movement_Type === "ADJUST"
                    ).length ? (

                      item.history
                        .filter(tx =>
                          tx.Movement_Type === "ADD" || tx.Movement_Type === "ADJUST"
                        )
                        .map((tx, idx) => {

                          const isEditing = editingTxId === tx.id;

                          return (
                            <div
                              key={idx}
                              className="flex justify-between bg-white p-3 rounded border"
                            >

                              <div className="flex gap-3 items-center">

                                {getMovementBadge(tx.Movement_Type)}

                                {isEditing ? (
                                  <input
                                    type="number"
                                    className="w-20 border-b outline-none text-green-600 font-semibold"
                                    value={editedQty}
                                    onChange={(e) => setEditedQty(e.target.value)}
                                  />
                                ) : (
                                  <span
                                    className={`font-semibold ${
                                      tx.Quantity < 0
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {tx.Quantity > 0
                                      ? `+${tx.Quantity}`
                                      : tx.Quantity}
                                  </span>
                                )}

                                <span className="text-xs text-gray-500">
                                  by {tx.username}
                                </span>

                              </div>

                              <div className="flex items-center gap-3">

                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                  {new Date(tx.created_At).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </span>

                                {userMe?.user?.role === "admin" &&
                                  tx.Movement_Type === "ADD" && (
                                  <>
                                    {isEditing ? (
                                      <>
                                        <button
                                          style={{ backgroundColor: "#ff0000" }}
                                          disabled={updatingDailyFoodStock === tx.id}
                                          onClick={() => handleEditSave(tx)}
                                          className="text-white px-2 py-1 rounded text-xs"
                                        >
                                          {updatingDailyFoodStock === tx.id
                                            ? "Saving..."
                                            : "Save"}
                                        </button>

                                        <button
                                          style={{ backgroundColor: "transparent" }}
                                          onClick={() => setEditingTxId(null)}
                                          className="px-2 py-1 rounded text-xs"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <div className="flex items-center">
                                        <Pencil
                                          onClick={() => {
                                            setEditingTxId(tx.id);
                                            setEditedQty(tx.Quantity);
                                          }}
                                          className="text-xs text-blue-500 cursor-pointer"
                                        />
                                        <Trash2
                                          onClick={() => handleDeleteTransaction(tx)}
                                          className="ml-2 text-red-500 cursor-pointer"
                                        />
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })

                    ) : (
                      <p className="text-sm text-gray-500">
                        No transactions
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
      </div>

      
      {inventoryItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm mt-4">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-semibold text-gray-700">
            No items found
          </h3>
          <p className="text-gray-500">
            Try adjusting search or filters
          </p>
        </div>
      )}
    </>
  )} */}
        {!isLoading && !isError && (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto 
            table-responsive table-desi">

              <table className="w-full min-w-[500px] ">

                {/* HEADER */}
                <thead className="bg-gray-50  
                ">
                  <tr>

                    <th className=" text-left whitespace-nowrap">
                      Sl No.
                    </th>

                    <th className=" text-left">
                      Item
                    </th>

                    <th className=" text-center">
                      Opening
                    </th>

                    <th className=" text-center">
                      Added
                    </th>

                    <th className=" text-center">
                      Sold
                    </th>

                    <th className=" text-center">
                      Closing
                    </th>

                    <th className=" text-left whitespace-nowrap">
                      Action
                    </th>

                  </tr>
                </thead>

                {/* BODY */}
                <tbody>

                  {inventoryItems.map((item, idx) => (

                    <React.Fragment key={item.Item_Id}>

                      <tr className="border-t hover:bg-gray-50">

                        {/* SL */}
                        <td className="  ">
                          {(foodItemStockHistoryByDate?.currentPage - 1) * 10 + (idx + 1)}.
                        </td>

                        {/* ITEM */}
                        <td className=" ">
                          {item.Item_Name}
                        </td>

                        {/* OPENING */}
                        <td className="text-center">
                          {item.Opening_Quantity}
                        </td>

                        {/* ADDED */}
                        <td style={{ color: "green" }}
                        className=" text-center">
                          <TrendingUp className="w-3 h-3 inline mr-1" />
                          {item.Added_Quantity}
                        </td>

                        {/* SOLD */}
                        <td style={{color:"red"}}
                        className="text-center  ">
                          <TrendingDown className="w-3 h-3 inline mr-1" />
                          {item.Sold_Quantity}
                        </td>

                        {/* CLOSING */}
                        <td className="text-center">
                          {item.Closing_Quantity}
                        </td>

                        {/* ACTION */}
                        <td className="">

                          <button
                            style={{ background: "none" }}
                            onClick={() => toggleExpand(item.Item_Id)}
                            className="p-2 hover:bg-gray-200 rounded-lg"
                          >

                            {expandedItem === item.Item_Id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}

                          </button>

                        </td>

                      </tr>


                      {/* EXPAND ROW */}
                      {expandedItem === item.Item_Id && (

                        <tr>

                          <td colSpan="7" className="bg-gray-50 p-4">

                            <div className="border-t pt-3 space-y-2">

                              {item.history?.filter(tx =>
                                tx.Movement_Type === "ADD" || tx.Movement_Type === "ADJUST"
                              ).length ? (

                                item.history
                                  .filter(tx =>
                                    tx.Movement_Type === "ADD" || tx.Movement_Type === "ADJUST"
                                  )
                                  .map((tx, idx) => {

                                    const isEditing = editingTxId === tx.id;

                                    return (

                                      <div
                                        key={idx}
                                        className="flex justify-between bg-white p-3 rounded border"
                                      >

                                        <div className="flex gap-3 items-center">

                                          {getMovementBadge(tx.Movement_Type)}

                                          {isEditing ? (

                                            <input
                                              type="number"
                                              className="w-20 border-b outline-none text-green-600 font-semibold"
                                              value={editedQty}
                                              onChange={(e) => setEditedQty(e.target.value)}
                                            />

                                          ) : (

                                            <span
                                              className={`font-semibold ${tx.Quantity < 0
                                                  ? "text-red-600"
                                                  : "text-green-600"
                                                }`}
                                            >

                                              {tx.Quantity > 0
                                                ? `+${tx.Quantity}`
                                                : tx.Quantity}

                                            </span>

                                          )}

                                          <span className="text-xs text-gray-500">
                                            by {tx.username}
                                          </span>

                                        </div>


                                        <div className="flex items-center gap-3">

                                          <span className="text-sm text-gray-600 whitespace-nowrap">

                                            {new Date(tx.created_At).toLocaleTimeString("en-IN", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              hour12: true
                                            })}

                                          </span>

                                          {userMe?.user?.role === "admin" &&
                                            tx.Movement_Type === "ADD" && (

                                              <>

                                                {isEditing ? (

                                                  <>

                                                    <button
                                                      style={{ backgroundColor: "#ff0000" }}
                                                      disabled={updatingDailyFoodStock === tx.id}
                                                      onClick={() => handleEditSave(tx)}
                                                      className="text-white px-2 py-1 rounded text-xs"
                                                    >

                                                      {updatingDailyFoodStock === tx.id
                                                        ? "Saving..."
                                                        : "Save"}

                                                    </button>

                                                    <button
                                                      style={{ backgroundColor: "transparent" }}
                                                      onClick={() => setEditingTxId(null)}
                                                      className="px-2 py-1 rounded text-xs"
                                                    >
                                                      Cancel
                                                    </button>

                                                  </>

                                                ) : (

                                                  <div className="flex items-center">

                                                    <Pencil
                                                      onClick={() => {
                                                        setEditingTxId(tx.id)
                                                        setEditedQty(tx.Quantity)
                                                      }}
                                                      className="text-xs text-blue-500 cursor-pointer"
                                                    />

                                                    <Trash2
                                                      onClick={() => handleDeleteTransaction(tx)}
                                                      className="ml-2 text-red-500 cursor-pointer"
                                                    />

                                                  </div>

                                                )}

                                              </>

                                            )}

                                        </div>

                                      </div>

                                    )

                                  })

                              ) : (

                                <p className="text-sm text-gray-500 text-center">
                                  No transactions
                                </p>

                              )}

                            </div>

                          </td>

                        </tr>

                      )}

                    </React.Fragment>

                  ))}

                </tbody>

              </table>

            </div>


            {/* EMPTY STATE */}
            {inventoryItems.length === 0 && (

              <div className="text-center py-12 bg-white rounded-lg shadow-sm mt-4">

                <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />

                <h3 className="text-lg font-semibold text-gray-700">
                  No items found
                </h3>

                <p className="text-gray-500">
                  Try adjusting search or filters
                </p>

              </div>

            )}

          </>
        )}
      </div>

      <div className="flex justify-center align-center p-4">
        <div className="flex items-center space-x-2 flex-wrap justify-center">

          {/* PREVIOUS */}
          <button
            type="button"
            onClick={() => handlePreviousPage()}
            disabled={page === 1}
            className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
        ${page === 1 ? 'opacity-50' : ''}
      `}
          >
            ← Previous
          </button>

          {/* PAGE NUMBERS (HIDE ON SMALL SCREENS) */}
          <div style={{ marginRight: '0px' }}
            className="hidden sm:flex space-x-2">
            {/* {[...Array(foodItemStockHistoryByDate?.totalPages || 0).keys()].map(
        (index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-3 py-1 rounded ${
              page === index + 1
                ? 'bg-[#ff0000] text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {index + 1}
          </button>
        )
      )} */}
            {(() => {
              const totalPages = foodItemStockHistoryByDate?.totalPages || 1;
              const maxVisible = 5; // how many pages around current
              const pages = [];

              let start = Math.max(1, page - 2);
              let end = Math.min(totalPages, page + 2);

              // Adjust if near start
              if (page <= 3) {
                end = Math.min(totalPages, maxVisible);
              }

              // Adjust if near end
              if (page > totalPages - 3) {
                start = Math.max(1, totalPages - maxVisible + 1);
              }

              // First page + dots
              if (start > 1) {
                pages.push(
                  <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    1
                  </button>
                );

                if (start > 2) {
                  pages.push(
                    <span key="start-dots" className="px-2">...</span>
                  );
                }
              }

              // Middle pages
              for (let i = start; i <= end; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 rounded ${page === i
                        ? 'bg-[#ff0000] text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                  >
                    {i}
                  </button>
                );
              }

              // Last page + dots
              if (end < totalPages) {
                if (end < totalPages - 1) {
                  pages.push(
                    <span key="end-dots" className="px-2">...</span>
                  );
                }

                pages.push(
                  <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    {totalPages}
                  </button>
                );
              }

              return pages;
            })()}
          </div>

          {/* CURRENT PAGE (ONLY ON SMALL SCREENS) */}
          <div className="sm:hidden px-3 py-1 bg-gray-100 rounded text-sm">
            Page {page} / {foodItemStockHistoryByDate?.totalPages || 1}
          </div>

          {/* NEXT */}
          <button
            type="button"
            onClick={() => handleNextPage()}
            disabled={
              page === foodItemStockHistoryByDate?.totalPages ||
              foodItemStockHistoryByDate?.totalPages === 0
            }
            className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
        ${page === foodItemStockHistoryByDate?.totalPages ||
                foodItemStockHistoryByDate?.totalPages === 0
                ? 'opacity-50'
                : ''
              }
      `}
          >
            Next →
          </button>

        </div>
      </div>

    </div>
  );
}
