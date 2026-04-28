import { CalendarDays, ChefHat, Filter, X } from "lucide-react";
import { useGetItemsSoldDateRangeReportQuery, useGetItemsSoldEachDayQuery } from "../../../redux/api/dashboardApi";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { useGetAllCategoriesQuery } from "../../../redux/api/itemApi";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";






export default function ProductWiseReport() {
  const TableSkeleton = () => {
    return (
      <>
        {[...Array(6)].map((_, idx) => (
          <tr key={idx} className="animate-pulse">
            <td className="px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-6"></div>
            </td>
            <td className="px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-40"></div>
            </td>
            <td className="px-4 py-3 text-center">
              <div className="h-4 bg-gray-200 rounded w-10 mx-auto"></div>
            </td>
            <td className="px-4 py-3 text-right">
              <div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
            </td>
          </tr>
        ))}
      </>
    );
  };

  const [searchParams, setSearchParams] = useSearchParams();
  // const location = useLocation();

  const [page, setPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const isValidDate = (value) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value);

  const today = new Date().toISOString().split("T")[0]; // ✅ safest
  const urlDate = searchParams.get("date");
  // const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
  console.log(today);
  //            const [selectedDate, setSelectedDate] = useState(
  //   searchParams.get("date") || today
  // );
  const [selectedDate, setSelectedDate] = useState(
    isValidDate(urlDate) ? urlDate : today
  );

  //  const [selectedDate, setSelectedDate] = useState(today);
  const [showRangeModal, setShowRangeModal] = useState(false);
  //  const [dateRange, setDateRange] = useState({
  //    startDate: '',
  //    endDate: ''
  //  });
  const [dateRange, setDateRange] = useState({
    startDate: searchParams.get("fromDate") || "",
    endDate: searchParams.get("toDate") || ""
  });


  //    const{data:itemsSoldDateRange}=useGetItemsSoldDateRangeReportQuery(
  //      {fromDate:dateRange.startDate,toDate:dateRange.endDate,page},
  //      {skip:!dateRange.startDate || !dateRange.endDate}
  //    )
  const [categorySearch, setCategorySearch] = useState(
    searchParams.get("category") || ""
  );

  const [categoryOpen, setCategoryOpen] = useState(false)

  const { data: categories } = useGetAllCategoriesQuery()
  const isRangeMode = Boolean(dateRange.startDate && dateRange.endDate);
  const { data: itemsSoldEachDay,
    isLoading: isLoadingDay,
    isFetching: isFetchingDay
  } = useGetItemsSoldEachDayQuery(
    { date: selectedDate, page, search: categorySearch },
    { skip: isRangeMode || !selectedDate }
  );

  const { data: itemsSoldDateRange,
    isLoading: isLoadingRange,
    isFetching: isFetchingRange
  } = useGetItemsSoldDateRangeReportQuery(
    { fromDate: dateRange.startDate, toDate: dateRange.endDate, page, search: categorySearch },
    { skip: !isRangeMode }
  );


  console.log(itemsSoldDateRange, "itemsSoldDateRange");
  console.log(itemsSoldEachDay, "itemsSoldEachDay");
  console.log(categories)

  //   const topSellingItems = itemsSoldEachDay?.data ?? [];
  //   console.log(itemsSoldEachDay,"itemsSoldEachDay");
  //   setItemsSold(topSellingItems)
  //   const topSellingItemsDateRange=itemsSoldDateRange?.data??[]
  //   setItemsSold(topSellingItemsDateRange)
  const handleSelect = (category) => {
    setCategorySearch(category); // 👈 triggers refetch automatically
    setCategoryOpen(false);
    setPage(1);               // reset page on new search
  };
  const handleDateRangeSubmit = () => {
    console.log("dateRange", dateRange);
    if (!dateRange?.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (dateRange?.startDate && dateRange?.endDate) {
      // Validate that end date is after start date
      if (new Date(dateRange.endDate) < new Date(dateRange.startDate)) {
        toast.error("End date must be after start date");
        // alert('End date must be after start date');
        return;
      }
      setShowRangeModal(false);

    }


  }
  const topSellingItems = isRangeMode
    ? itemsSoldDateRange?.data ?? []
    : itemsSoldEachDay?.data ?? [];
  console.log(topSellingItems, "topSellingItems");
  const isFirstRender = useRef(true);



  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setPage(1);


  }, [

    selectedDate,
    categorySearch,
    dateRange.startDate,
    dateRange.endDate,
    isRangeMode
  ]);

  // useEffect(() => {
  //   const params = {};

  //   if (categorySearch) params.category = categorySearch;
  //   if (page > 1) params.page = page;

  //   setSearchParams(params, { replace: true });
  // }, [categorySearch, page, setSearchParams]);
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());

    // CATEGORY
    if (categorySearch) params.category = categorySearch;
    else delete params.category;

    // PAGE
    if (page > 1) params.page = page;
    else delete params.page;

    // SINGLE DATE (only if NOT range mode)
    if (!isRangeMode && isValidDate(selectedDate)) {
      params.date = selectedDate;
    } else {
      delete params.date;
    }

    // DATE RANGE
    if (isRangeMode) {
      params.fromDate = dateRange.startDate;
      params.toDate = dateRange.endDate;
    } else {
      delete params.fromDate;
      delete params.toDate;
    }

    setSearchParams(params, { replace: true });
  }, [
    categorySearch,
    page,
    selectedDate,
    dateRange.startDate,
    dateRange.endDate,
    isRangeMode,
    searchParams,
    setSearchParams
  ]);


  // useEffect(() => {
  //   setPage(1);
  // }, [selectedDate, categorySearch]);

  // useEffect(() => {
  //   if (isRangeMode) {
  //     setPage(1);
  //   }
  // }, [dateRange.startDate, dateRange.endDate, isRangeMode]);
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  const paginationMeta = isRangeMode
    ? itemsSoldDateRange
    : itemsSoldEachDay;

  const currentPage = paginationMeta?.currentPage ?? 1;
  const pageSize = paginationMeta?.pageSize ?? 10;
  const totalPages = paginationMeta?.totalPages ?? 0;
  const isTableLoading = isRangeMode
    ? (isLoadingRange || isFetchingRange)
    : (isLoadingDay || isFetchingDay);

  return (
    <>
      <div className="flex flex-col bg-white">
        {/* <div className="flex  flex-col justify-center sm:flex-row sm:justify-end gap-4 mb-2"> */}
        <div
          className="
    flex flex-col gap-4 mb-2 p-2
    lg:flex-row lg:items-center lg:justify-end
  "
        >
          {/* <div className="flex flex-col sm:flex sm:flex-row sm:justify-end gap-2">
  <div className="relative flex">
  <input
    type="text"
    value={categorySearch}
    placeholder="Category"
    className="w-full outline-none border-b-2 text-gray-900"
    onFocus={() => setCategoryOpen(true)}   // ✅ OPEN
    onChange={(e) => {
      setCategorySearch(e.target.value);
      setCategoryOpen(true);                // ✅ KEEP OPEN WHILE TYPING
    }}
    onBlur={() => {
      // ⏱ Delay so click can register
      setTimeout(() => {
        setCategoryOpen(false);
      }, 150);
    }}
  />


  {categoryOpen && (
    <div className="absolute top-10 z-20 mt-1
     w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
      {categories
        ?.filter((cat) =>
          cat.Item_Category.toLowerCase().includes(
            (categorySearch || "").toLowerCase()
          )
        )
        .map((cat, idx) => (
          <div
            key={idx}
            onMouseDown={() => {              // ✅ IMPORTANT
              handleSelect(cat.Item_Category);
              setCategoryOpen(false);
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

    <div style={{ backgroundColor: "#ff0000" }} 
    className=" relative
    flex items-center gap-2
    px-2 py-1
    cursor-pointer ">
{isRangeMode ? (
  <div className="flex items-center gap-1 text-white font-semibold">
    <span>{dateRange.startDate}</span>
    <span className="mx-1">–</span>
    <span>{dateRange.endDate}</span>
  </div>
) : (
  <span className="text-white font-semibold">
    {selectedDate}
  </span>
)}

       
   
      <input
        type="date"
        id="dashboard-date"
        className="absolute inset-0 opacity-0 "
        onChange={(e) => {
       setSelectedDate(e.target.value);
         setDateRange({ startDate: "", endDate: "" });
         
        }}
      />

     
      <button
        type="button"
        className="flex items-center justify-center
                   w-6 h-6 rounded-full cursor-pointer
                 "
                  
      >
        <CalendarDays className="w-5 h-5 text-white cursor-pointer" />
      </button>
    </div>
    </div> */}
          <div
            className="
    flex flex-col gap-3
    sm:flex-row sm:items-center
  "
          >
            {/* CATEGORY SEARCH */}
            <div className="relative w-full lg:w-56">
              <input
                type="text"
                value={categorySearch}
                placeholder="Search By Category..."
                className="w-full outline-none border-b-2 text-gray-900"
                onFocus={() => setCategoryOpen(true)}
                onChange={(e) => {
                  setCategorySearch(e.target.value);
                  setCategoryOpen(true);
                }}
                onBlur={() => {
                  setTimeout(() => setCategoryOpen(false), 150);
                }}
              />

              {categoryOpen && (
                <div className="absolute top-14 z-20 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {categories
                    ?.filter((cat) =>
                      cat.Item_Category.toLowerCase().includes(
                        (categorySearch || "").toLowerCase()
                      )
                    )
                    .map((cat, idx) => (
                      <div
                        key={idx}
                        onMouseDown={() => {
                          handleSelect(cat.Item_Category);
                          setCategoryOpen(false);
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {cat.Item_Category}
                      </div>
                    ))}

                  {!categories?.some((cat) =>
                    cat.Item_Category
                      .toLowerCase()
                      .includes((categorySearch || "").toLowerCase())
                  ) && (
                      <p className="px-3 py-2 text-gray-500">No categories found</p>
                    )}
                </div>
              )}
            </div>

            {/* DATE PICKER */}
            {/* <div
    className="
      relative flex justify-center items-center gap-2
      px-4 py-2 cursor-pointer
      w-full lg:w-auto
    "
    style={{ backgroundColor: "#ff0000" }}
  >
    {isRangeMode ? (
      <div className="flex items-center gap-1 text-white font-semibold text-sm">
        <span>{dateRange.startDate}</span>
        <span>–</span>
        <span>{dateRange.endDate}</span>
      </div>
    ) : (
      <span className="text-white font-semibold text-sm">
        {selectedDate}
      </span>
    )}

     <input
        type="date"
        id="dashboard-date"
        className="absolute inset-0 opacity-0 "
        onChange={(e) => {
       setSelectedDate(e.target.value);
         setDateRange({ startDate: "", endDate: "" });
         
        }}
      />
 <button
        type="button"
        className="flex items-center justify-center
                   w-5 h-5 rounded-full cursor-pointer
                 "
                  
      >
        <CalendarDays className="w-5 h-5 text-white cursor-pointer" />
      </button>
  </div> */}
            <div style={{ backgroundColor: "#ff0000" }}
              className=" relative
    flex justify-center items-center gap-2
    px-2 py-1
    cursor-pointer ">
              {isRangeMode ? (
                <div className="flex justify-center items-center gap-1 text-white font-semibold">
                  <span className="whitespace-nowrap">{dateRange.startDate}</span>
                  <span className="mx-1 whitespace-nowrap">–</span>
                  <span className="whitespace-nowrap">{dateRange.endDate}</span>
                </div>
              ) : (
                <span className="text-white font-semibold">
                  {selectedDate}
                </span>
              )}





              <button
                type="button"
                className="flex items-center justify-center
                    h-6 rounded-full cursor-pointer
                 "

              >
                <input
                  style={{ marginBottom: "0px", padding: "0px" }}
                  type="date"
                  id="dashboard-date"
                  className="absolute inset-0 opacity-0 "
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setDateRange({ startDate: "", endDate: "" });

                  }}
                />

                <CalendarDays className="w-5 h-5 text-white cursor-pointer" />
              </button>
            </div>
          </div>

          {/* <div
  className="
    relative
    flex items-center gap-2
    px-4 py-2
    cursor-pointer
  "
  style={{ backgroundColor: "#ff0000" }}
>
 
  <span className="text-white font-semibold text-sm">
    {selectedDate}
  </span>


  <CalendarDays className="w-5 h-5 text-white" />

  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="
      absolute inset-0
      opacity-0
      cursor-pointer
      z-10
    "
  />
</div> */}

          <div className="flex w-full sm:w-auto sm:justify-end">
            <button
              style={{ backgroundColor: "#ff0000" }}
              onClick={() => setShowRangeModal(true)}
              className="
      px-2 py-1
      text-white rounded-lg
      flex justify-center items-center gap-2
      text-sm sm:text-base
      w-full lg:w-auto
    "
            >
              <Filter className="w-5 h-5" />
              Date Range Report
            </button>
          </div>

          {/* <div className="flex w-full sm:justify-end ">
          <button  style={{ backgroundColor: "#ff0000" }}
                     onClick={() => setShowRangeModal(true)}
                     className="px-4 py-2 bg-blue-600  
                     text-white rounded-lg transition text-sm sm:text-base 
                      flex items-center gap-2"
                   >
                     <Filter className="w-4 h-4" />
                     Date Range Report
                   </button>
                   </div> */}
        </div>
        <div>
          <div className="p-3 bg-gradient-to-r from-green-50 to-white">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <ChefHat size={20} className="text-green-600" />
              Product Report
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">No.</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Item</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Qty</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Revenue</th>

                </tr>
              </thead>
              {/* <tbody className="divide-y divide-gray-100">
                                                {topSellingItems && topSellingItems.length > 0 ? topSellingItems?.map((item, idx) => (
                                                  <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-800">
  {(currentPage - 1) * pageSize + idx + 1}

</td>
                                                    <td className="px-4 py-3 font-medium text-gray-800">{item?.Item_Name}</td>
                                                    <td className="px-4 py-3 text-center text-gray-600">{item?.sold_count}</td>
                                                    <td className="px-4 py-3 text-right font-semibold text-green-600">₹{item?.total_price.toLocaleString()}</td>
                                                      {/* <td className="px-4 py-3 text-right">
                                                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                                                        {item.contribution}%
                                                      </span>
                                                    </td> 
                                                  </tr>
                                                )):(
                                                  <tr>
                                                    <td className=" w-full font-medium  text-center">No items found</td>
                                                  </tr>
                                                )}
                                              </tbody> */}
              <tbody className="divide-y divide-gray-100">
                {isTableLoading ? (
                  <TableSkeleton />
                ) : topSellingItems && topSellingItems.length > 0 ? (
                  topSellingItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {item?.Item_Name}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {item?.sold_count}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">
                        ₹{item?.total_price.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                   <tr>
                    <td className=" w-full font-medium  text-center">
                      No items found
                      </td>
                       </tr>
                )}
              </tbody>

            </table>
            <div className="flex justify-center align-center p-4">
              <div className="flex items-center space-x-2 flex-wrap justify-center">
                <button type="button"
                  style={{ outline: "none", backgroundColor: "lightgray" }}
                  onClick={() => handlePreviousPage()}
                  disabled={page === 1}
                  className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                        ${page === 1 ? 'opacity-50 ' : ''}
                        `}
                >
                  ← Previous
                </button>
                <div style={{ marginRight: "0px" }}
                  className="hidden sm:flex ">
                  {[...Array(totalPages).keys()].map((index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      // className={`px-3 py-1 rounded ${page === index + 1 ? 'bg-[#7346ff] text-white' : 'bg-gray-200 hover:bg-gray-300'
                      //   }`}
                      className={
                        `px-3 py-1 rounded ${page === index + 1 ? 'bg-[#ff0000] text-white' :
                          'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="sm:hidden px-3 py-1 bg-gray-100 rounded text-sm">
                  Page {page} / {totalPages || 1}
                </div>


                <button type="button"
                  style={{ outline: "none", backgroundColor: "lightgray" }}
                  onClick={() => handleNextPage()}
                  disabled={page === totalPages || totalPages === 0}
                  className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                        ${page === totalPages || totalPages === 0 ?
                      'opacity-50 ' : ''}
                        `}
                >
                  Next →
                </button>



              </div>
            </div>
          </div>
        </div>
      </div>
      {showRangeModal && (
        // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center
        //  justify-center z-50 p-4">
        <div
          style={{
            width: "100%",
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.4)", // dim background
            backdropFilter: "blur(4px)", // blur effect
            zIndex: 50,
            padding: "1rem", // ensures spacing on small screens
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Select Date Range</h3>
              <button
                onClick={() => setShowRangeModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="w-full outline-none border-b-2 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  min={dateRange.startDate}
                  className="w-full outline-none border-b-2 text-gray-900"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  style={{ backgroundColor: "lightgray" }}
                  onClick={() => setShowRangeModal(false)}
                  className="flex-1 px-4 py-2 
                        text-gray-800 rounded-lg  font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDateRangeSubmit()}
                  style={{ backgroundColor: "#ff0000" }}
                  className="flex-1 px-4 py-2 
                       text-white rounded-lg  font-medium"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

