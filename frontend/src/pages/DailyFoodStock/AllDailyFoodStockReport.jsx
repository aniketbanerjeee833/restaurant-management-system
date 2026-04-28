

import React, { useState } from "react";
import {
 
  ChevronDown,
  ChevronUp,
 
  Package
  
} from "lucide-react";
import { useGetAllFoodItemsQuery,  useLazyGetEachFoodItemsStockReportQuery,
   } from "../../redux/api/foodItemApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetUserQuery } from "../../redux/api/userApi";

import { useEffect } from "react";



export default function AllDailyFoodStockReport() {
  // const today = new Date().toLocaleDateString("en-CA", {
  //   timeZone: "Asia/Kolkata",
  // });

  //const [selectedDate, setSelectedDate] = useState(today);
  //const [searchTerm, setSearchTerm] = useState("");
  //const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedItem, setExpandedItem] = useState(null);
  // const [editingTxId, setEditingTxId] = useState(null);
  // const [editedQty, setEditedQty] = useState("");

  const { data: userMe, } = useGetUserQuery();
  console.log(userMe, "userMe in header");

  //const[page,setPage]= useState(1);
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams();

  // const initialDate = searchParams.get("date") || today;
  const initialSearch = searchParams.get("search") || "";
  const initialPage = Number(searchParams.get("page")) || 1;

  // const [selectedDate, setSelectedDate] = useState(initialDate);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(initialPage);

 // const [editDailyFoodStock] = useEditDailyFoodStockMutation();
  //const [removeDailyFoodStock] = useRemoveDailyFoodStockMutation();
  // const [updatingDailyFoodStock, setUpdatingDailyFoodStock] = useState(null);
  // const handleDeleteTransaction = async (tx) => {
  //   console.log(tx);
  //   if (window.confirm("Are you sure you want to delete this added food stock ?")) {
  //     try {
  //       await removeDailyFoodStock({
  //         Movement_Id: tx.id,
  //         User_Id: userMe?.user?.User_Id,
  //       }).unwrap();
  //       toast.success("Stock  deleted successfully");
  //     } catch (err) {
  //       console.error(err);
  //       toast.error("Failed to delete stock ");
  //     }
  //   }
  // }

  // const [triggerHistoryData,{ data: foodItemStockHistory, 
  //   isFetching: isFetchingEachFoodItemStockHistory }]= useGetAllFoodItemsStockReportMutation();
  const [
  triggerHistoryData,
  {
    data: foodItemStockHistory,
    isFetching: isFetchingEachFoodItemStockHistory,
  },
] = useLazyGetEachFoodItemsStockReportQuery();
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

  // const {
  //   data: foodItemStockReport,
  //   isLoading,
  //   isFetching,
  //   isError,
  // } =   useGetAllFoodItemsStockReportMutation({
   
  //   page,
  //   search: debouncedSearch,
  // });

  const { data: foodItemStockReport, isLoading, isError, isFetching  } =
   useGetAllFoodItemsQuery({
    page,
    search: debouncedSearch,
   
  });
  console.log(foodItemStockReport, "foodItemStockReport");
  const allFoodItems = foodItemStockReport?.foodItems || [];
  console.log(allFoodItems, "allFoodItems");

 

  useEffect(() => {
    setSearchParams({
      
      search: debouncedSearch,
      page: page.toString(),
    });
  }, [debouncedSearch, page]);

  // const toggleExpand = (itemId) => {
  //   setExpandedItem(expandedItem === itemId ? null : itemId);
  // };

const [historyMap, setHistoryMap] = useState({});
// const toggleExpand = async (itemId) => {
//   const isOpening = expandedItem !== itemId;

//   setExpandedItem(isOpening ? itemId : null);

//   // ✅ Only fetch when opening
//   if (isOpening) {
//     try {
//       await triggerHistoryData(itemId);
//     } catch (err) {
//       console.error("Error fetching history:", err);
//     }
//   }
// };
const toggleExpand = async (Item_Id) => {
  const isOpening = expandedItem !== Item_Id;

  setExpandedItem(isOpening ? Item_Id : null);

  // ✅ fetch only once
  if (isOpening && !historyMap[Item_Id]) {
    try {
      const res = await triggerHistoryData(Item_Id).unwrap();

      setHistoryMap((prev) => ({
        ...prev,
        [Item_Id]: res.history,
      }));
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  }
};
//  useEffect(() => {
//   if (foodItemStockHistory?.itemId) {
//     setHistoryMap((prev) => ({
//       ...prev,
//       [foodItemStockHistory.itemId]: foodItemStockHistory.history,
//     }));
//   }
// }, [foodItemStockHistory]);

console.log(foodItemStockHistory, "foodItemStockHistory");
  // const getMovementBadge = (type) => {
  //   const badges = {
  //     ADD: (
  //       <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
  //         ADD
  //       </span>
  //     ),
  //     ADJUST: (
  //       <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-black-700">
  //         ADJUST
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
              <h4 className="text-2xl font-bold mb-1">All Food Items Stock Report</h4>
              <p style={{ color: "#ff0000" }}
                className="text-gray-500 text-sm sm:text-base">
                All Food Items Stock Report Details
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

                {/* <input
                  type="date"
                  id="dashboard-date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    // 👉 call API / set state here
                  }}
                /> */}

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

                    {/* <th className=" text-center">
                      Opening
                    </th> */}

                    {/* <th className=" text-center">
                      Added
                    </th> */}

                    {/* <th className=" text-center">
                      Sold
                    </th> */}

                    {/* <th className=" text-center">
                      Closing
                    </th> */}

                    <th className=" text-left whitespace-nowrap">
                      Action
                    </th>

                  </tr>
                </thead>

                {/* BODY */}
                <tbody>

                  {allFoodItems && allFoodItems.length > 0 && allFoodItems?.map((item, idx) => (

                    <React.Fragment key={item.Item_Id}>

                      <tr className="border-t hover:bg-gray-50">

                        {/* SL */}
                        <td className="  ">
                          {(foodItemStockReport?.currentPage - 1) * 10 + (idx + 1)}.
                        </td>

                        {/* ITEM */}
                        <td className=" ">
                          {item.Item_Name}
                        </td>

                        {/* OPENING */}
                        {/* <td className="text-center">
                          {item.Opening_Quantity}
                        </td> */}

                        {/* ADDED */}
                        {/* <td style={{ color: "green" }}
                        className=" text-center">
                          <TrendingUp className="w-3 h-3 inline mr-1" />
                          {item.Added_Quantity}
                        </td> */}

                        {/* SOLD */}
                        {/* <td style={{color:"red"}}
                        className="text-center  ">
                          <TrendingDown className="w-3 h-3 inline mr-1" />
                          {item.Sold_Quantity}
                        </td> */}

                        {/* CLOSING */}
                        {/* <td className="text-center">
                          {item.Closing_Quantity}
                        </td> */}

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

      <div className="border-t pt-3">

        {/* ===================== LOADING SKELETON ===================== */}
        {isFetchingEachFoodItemStockHistory &&
        !historyMap[item.Item_Id] ? (

          <div className="overflow-x-auto">
            <div className="max-h-[250px] overflow-y-auto border rounded animate-pulse">

              <table className="w-full text-sm">

                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    {["Date", "Opening", "Added", "Sold", "Closing"].map((_, i) => (
                      <th key={i} className="border p-2">
                        <div className="h-3 bg-gray-300 rounded w-16 mx-auto"></div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="border p-2">
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </td>

                      <td className="border p-2 text-right">
                        <div className="h-3 bg-gray-200 rounded w-10 ml-auto"></div>
                      </td>

                      <td className="border p-2 text-right">
                        <div className="h-3 bg-gray-200 rounded w-10 ml-auto"></div>
                      </td>

                      <td className="border p-2 text-right">
                        <div className="h-3 bg-gray-200 rounded w-10 ml-auto"></div>
                      </td>

                      <td className="border p-2 text-right">
                        <div className="h-3 bg-gray-200 rounded w-12 ml-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          </div>

        ) : (historyMap[item.Item_Id] || []).length > 0 ? (

          /* ===================== REAL DATA ===================== */
          <div className="overflow-x-auto">
            <div className="max-h-[250px] overflow-y-auto border rounded scroll-smooth">

              <table className="w-full text-sm">

                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="border p-2 text-left">Date</th>
                    <th className="border p-2 text-right">Opening</th>
                    <th className="border p-2 text-right">Added</th>
                    <th className="border p-2 text-right">Sold</th>
                    <th className="border p-2 text-right">Closing</th>
                  </tr>
                </thead>

                <tbody>
                  {(historyMap[item.Item_Id] || []).map((h, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">

                      <td className="border p-2">
                        {new Date(h.Stock_Date).toLocaleDateString("en-IN")}
                      </td>

                      <td className="border p-2 text-right">
                        {h.Opening_Quantity}
                      </td>

                      <td style={{ color: "green" }}
                       className="border p-2 text-right ">
                        {h.Added_Quantity}
                      </td>

                      <td style={{ color: "red" }}
                      className="border p-2 text-right">
                        {h.Sold_Quantity}
                      </td>

                      <td className="border p-2 text-right ">
                        {h.Closing_Quantity}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          </div>

        ) : (

          /* ===================== EMPTY ===================== */
          <p className="text-sm text-gray-500 text-center">
            No stock history
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
            {allFoodItems.length === 0 && (

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
            {/* {[...Array(foodItemStockReport?.totalPages || 0).keys()].map(
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
              const totalPages = foodItemStockReport?.totalPages || 1;
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
            Page {page} / {foodItemStockReport?.totalPages || 1}
          </div>

          {/* NEXT */}
          <button
            type="button"
            onClick={() => handleNextPage()}
            disabled={
              page === foodItemStockReport?.totalPages ||
              foodItemStockReport?.totalPages === 0
            }
            className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
        ${page === foodItemStockReport?.totalPages ||
                foodItemStockReport?.totalPages === 0
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
