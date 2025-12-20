import { useState } from "react";
import { NavLink } from "react-router-dom";
import {  useGetTotalSalesEachDayQuery } from "../redux/api/saleApi";
import { useGetTotalPurchasesEachDayQuery } from "../redux/api/purchaseApi";
import {  Filter, X } from 'lucide-react';
import { toast } from "react-toastify";

export default function Reports() {
//  const { data: user} = useGetUserByIdQuery()
//    const {  userId } = useSelector((state) => state.user);
//    const{selectedLeads,page}=useSelector((state) => state.lead);
//    const dispatch = useDispatch();
//    const { data, isLoading, isError } = useGetUserByIdQuery()
 //const navigate=useNavigate()
const { data: salesData } = useGetTotalSalesEachDayQuery();
// const { data: newSalesData } = useGetTotalNewSalesEachDayQuery();
const { data: purchasesData } = useGetTotalPurchasesEachDayQuery();
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
const totalSalesByDate = salesData?.data || [];
// const totalNewSalesByDate = newSalesData?.data || [];
const totalPurchasesByDate = purchasesData?.data || [];

console.log(
  totalSalesByDate,
  
  totalPurchasesByDate,
);
//    useEffect(() => {
//      if (isLoading) return;
 
//      if (isError || !data?.user?.id) {
//        dispatch(setLoggedIn(false));
//        return;
//      }
//      dispatch(setUserId(data.user.id));
//      dispatch(setLoggedIn(true));
//    }, [data, isLoading, isError, dispatch]);
     const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
     console.log(today);
   const [currentDate, setCurrentDate] = useState(new Date());
   const [selectedDate, setSelectedDate] = useState(today);
   
   // const [selectedLeads, setSelectedLeads] = useState([]);
   
 
 
 
   // Only call the query when selectedDate exists
//    const { data: leadsForToday, error: leadsForTodayError, isLoading: leadsLoading } = 
//    useGetLeadsByFollowUpDateQuery({
//      date: selectedDate,
//      userId,page
//    }, {
//      skip:  !userId // Skip query if no date selected or no userId
//    });
 
//    const { data: leadsCountData, isLoading: leadsCountLoading } = useGetLeadCountEachDayQuery(userId);
 
//    console.log(currentDate,leadsForToday,leadsCountData);
//    // Handle leads data when it changes
//    useEffect(() => {
//      if (!selectedDate) {
//        dispatch(clearSelectedLeads()); // Clear leads if no date is selected
//        return;
//      }
 
//      if (leadsLoading) {
//        return; // Keep current state while loading
//      }
 
//      if (leadsForToday && Array.isArray(leadsForToday?.results)) {
//        console.log("Leads for today:", leadsForToday);
      
//        dispatch(setSelectedLeads(leadsForToday?.results));
//      } else if (leadsForToday?.message || leadsForTodayError) {
      
      
//        dispatch(clearSelectedLeads()); // Clear leads when no leads found or error setSelectedLeads([]);
//      }
//    }, [leadsForToday, leadsForTodayError, leadsLoading, selectedDate]);
 
   const getDaysInMonth = (year, month) => {
     return new Date(year, month + 1, 0).getDate();
   };
 
   const getFirstDayOfMonth = (year, month) => {
     return new Date(year, month, 1).getDay();
   };
 
   const formatDate = (year, month, day) => {
     return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
   };
 
   const handleDateClick = (day) => {
     const year = currentDate.getFullYear();
     const month = currentDate.getMonth();
     const dateStr = formatDate(year, month, day);
     
     console.log("Selected date:", dateStr);
     
   // Clear leads immediately when a new date is selected
     // dispatch(clearSelectedLeads());
     setSelectedDate(dateStr);
     //navigate(`/day-wise-report/${dateStr}`);
    window.open(`/day-wise-report/${dateStr}`,"_blank");
     // Remove the manual fetchLeadsByDate call - let the query handle it
   };
 
   const navigateMonth = (direction) => {
     const newDate = new Date(currentDate);
     newDate.setMonth(newDate.getMonth() + direction);
         // dispatch(clearSelectedLeads()); // Clear leads when navigating months
     setCurrentDate(newDate);
     setSelectedDate(today);
     // setSelectedLeads([]);
  
   };
    const handleDateRangeSubmit = () => {
    if (dateRange.startDate && dateRange.endDate) {
      // Validate that end date is after start date
      if (new Date(dateRange.endDate) < new Date(dateRange.startDate)) {
        alert('End date must be after start date');
        return;
      }
       //window.open(`/accounts/date-range-report/${dateRange.startDate}/${dateRange.endDate}`, "_blank");

      // Open report in new tab with date range
      window.open(`/date-range-report/${dateRange.startDate}/${dateRange.endDate}`, "_blank");

      //window.open(`/date-range-report?fromDate=${dateRange.startDate}&toDate=${dateRange.endDate}`, '_blank');
      //window.open(`/date-range-report/${dateRange.startDate}/${dateRange.endDate}`, '_blank');
      setShowRangeModal(false);
      
      // Reset the form
      setDateRange({ startDate: '', endDate: '' });
    } else {
     toast.error('Please select both start and end dates');
    }
  };
 const renderCalendar = () => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date().getDate();

  // Convert API data → lookup maps
  const salesEachDay = totalSalesByDate?.reduce((acc, item) => {
    acc[item.date] = item.total_sales;
    return acc;
  }, {}) || {};


  const purchasesEachDay = totalPurchasesByDate?.reduce((acc, item) => {
    acc[item.date] = item.total_purchases;
    return acc;
  }, {}) || {};

  const days = [];

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`e-${i}`} className="h-24 bg-gray-50 border"></div>);
  }

  // Days with sales/purchase/new sale data
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(year, month, d);

    const isToday =
      d === today &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();

    const isSelected = selectedDate === dateStr;

    const totalSales = salesEachDay[dateStr] || 0;
    const totalPurchases = purchasesEachDay[dateStr] || 0;
    // const totalNewSales = newSalesEachDay[dateStr] || 0;

    days.push(
    
    <div
  key={d}
  onClick={() => handleDateClick(d)}
  className={`
    h-24 border p-1 cursor-pointer relative rounded-md transition
    ${isSelected ? "bg-blue-100 border-blue-400" :
    isToday ? "bg-green-100 border-green-400" :
    "bg-white hover:bg-gray-50"}
  `}
>
  {/* Day number */}
  <div className="text-sm font-semibold text-gray-700">{d}</div>

  {/* BOTTOM STACKED SECTION */}
  <div className="absolute bottom-1 right-1 flex flex-col space-y-[2px]">

    {/* Total Sales */}
    {totalSales > 0 && (
      <span className="text-[12px] text-green-700 font-medium">
        Sales: {totalSales}
      </span>
    )}

    {/* Total Purchases */}
    {totalPurchases > 0 && (
      <span className="text-[12px] text-red-700 font-medium">
        Purchases: {totalPurchases}
      </span>
    )}

    {/* Total New Sales */}
    {/* {totalNewSales > 0 && (
      <span className="text-[12px] text-purple-700 font-medium">
        New Sales: {totalNewSales}
      </span>
    )} */}

  </div>
</div>

    
    );
  }

  return days;
};

 

 
   return (
  <>
    {/* Sidebar */}
    {/* <div className="sb2-1 ">
      <SideMenu />
    </div> */}

    {/* Main content */}
   
      {/* Breadcrumb / Nav */}
   

      {/* Calendar & Leads */}
      <div className="sb2-2-3">
        <div className="row">
          <div className="col-md-12">
            <div className="box-inn-sp">
            {/* Header with month and nav */}
             <div className="inn-title ">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 mt-4 mx-auto px-4 gap-3">
              <h4 >
                {currentDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h4>

              <div className="flex gap-2 sm:gap-4">
                <button style={{ outline: "none" }}
                  onClick={() => navigateMonth(-1)}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 
                  focus:outline-none rounded text-sm sm:text-base"
                >
                  ← Previous
                </button>
                      <button  style={{ backgroundColor: "#ff0000" }}
                onClick={() => setShowRangeModal(true)}
                className="px-4 py-2 bg-blue-600  text-white rounded-lg transition text-sm sm:text-base  flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Date Range Report
              </button>
                <button  style={{ outline: "none" }}
                  onClick={() => navigateMonth(1)}
                  className="px-3 py-1 bg-gray-200
                   rounded text-sm sm:text-base"
                >
                  Next →
                </button>
              </div>
            </div>
            </div>

            {/* Calendar grid */}
            <div className="tab-inn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-7 gap-1 mb-4 text-xs sm:text-sm">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center font-medium text-gray-600 py-2"
                      >
                        {day}
                      </div>
                    )
                  )}
                  {renderCalendar()}
                </div>
              </div>

              {/* Selected Leads */}
              <div className="lg:col-span-1">
                {/* <div className="bg-gray-50 rounded-lg p-4 h-full">
                  {renderSelectedLeads()}
                </div> */}
              </div>
            </div>
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
                  onClick={handleDateRangeSubmit}
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
);

}