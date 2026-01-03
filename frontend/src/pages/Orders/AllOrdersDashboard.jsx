
// import { useState } from "react";
// import {  useTotalInvoicesEachDayQuery } from "../../redux/api/Staff/orderApi";
// import { toast } from "react-toastify";
// import { NavLink } from "react-router-dom";
// import { CalendarDays, Filter, LayoutDashboard, X } from "lucide-react";
// import { useSelector } from "react-redux";
// import { useGetTotalSalesPurchasesReceivablesPayablesProfitQuery } from "../../redux/api/dashboardApi";
// import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, AlertCircle, FileText,  Armchair, Handbag } from 'lucide-react';

// export default function AllOrdersDashboard() {

//   const {user}=useSelector((state)=>state.user)
//   // const today = new Date().toISOString().split("T")[0];
//  const today = new Date().toLocaleDateString("en-CA");

//   const{data:totalInvoiceEachDay}=useTotalInvoicesEachDayQuery()
//     const [showRangeModal, setShowRangeModal] = useState(false);
//     const [dateRange, setDateRange] = useState({
//       startDate: '',
//       endDate: ''
//     });
//       // const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
//      console.log(today);
//        const [currentDate, setCurrentDate] = useState(new Date());
//        const [selectedDate, setSelectedDate] = useState(today);
// const formatDateDDMMYYYY = (dateStr) => {
//   if (!dateStr) return "";
//   const [y, m, d] = dateStr.split("-");
//   return `${d}-${m}-${y}`;
// };

//   //const[selectedYear, setSelectedYear] = useState("2025");


// // const {data: salesPurchasesProfitData} =
// //    useGetAllSalesAndPurchasesYearWiseQuery({year:selectedYear})
 
//   //console.log(selectedYear);
// const {data:totalSalesPurchasesReceivablesPayablesProfit}=
// useGetTotalSalesPurchasesReceivablesPayablesProfitQuery(selectedDate)
//   // Item-wise analysis
//   console.log(totalSalesPurchasesReceivablesPayablesProfit,
//     "totalSalesPurchasesReceivablesPayablesProfit");



//     // const profitMargin=totalSalesPurchasesReceivablesPayablesProfit?.profit
     
     





  
// const StatCard = ({ title, value, icon: Icon, color }) => {

 

//   return (
//     <div
//       className="flex flex-col justify-between bg-white rounded-xl shadow-sm 
//                  border border-gray-100 hover:shadow-md transition-all 
//                  p-4 w-full min-w-[180px] h-[120px]"
//     >
//       {/* 🔹 Icon + Title */}
//       <div className="flex items-center mb-1">
//         <div className="flex gap-2 items-center">
//           <div className={`p-2 rounded-full ${color}`}>
//             <Icon className="w-5 h-5 text-white" />
//           </div>
//           <p style={{color:"black"}} className="text-sm text-gray-600 font-medium truncate mt-2 ">{title}</p>
//         </div>
//       </div>

//       {/* 💰 Value */}
//       <h4 className="text-2xl font-bold text-gray-900 mt-2">
//         ₹{value?.toLocaleString() || 0}
//       </h4>

//       {/* 🔗 “View all …” link — only this is clickable */}
//       {/* {title.split(/\s+/).length > 1 && (
//         <NavLink
//           to={route}
//           className="text-xs text-gray-500 hover:text-[#ff0000] mt-2 transition-colors self-start"
//         >
//           View all {title.split(/\s+/)[1]}
//         </NavLink>
//       )} */}
//     </div>
//   );
// };

// const DineTakeawayStatCard = ({ title, value, icon: Icon, color }) => {

  

//   return (
//     <div
//       className="flex flex-col justify-between bg-white rounded-xl shadow-sm 
//                  border border-gray-100 hover:shadow-md transition-all 
//                  p-4 w-full min-w-[180px] h-[120px]"
//     >
//       {/* 🔹 Icon + Title */}
//       <div className="flex items-center mb-1">
//         <div className="flex gap-2 items-center">
//           <div className={`p-2 rounded-full ${color}`}>
//             <Icon className="w-5 h-5 text-white" />
//           </div>
//           <p style={{color:"black"}} className="text-sm text-gray-600 font-medium truncate mt-2 ">{title}</p>
//         </div>
//       </div>

//       {/* 💰 Value */}
//       <h4 className="text-2xl font-bold text-gray-900 mt-2">
//         {value?.toLocaleString() || 0}
//       </h4>

//       {/* 🔗 “View all …” link — only this is clickable */}
//       {/* {title.split(/\s+/).length > 1 && (
//         <NavLink
//           to={route}
//           className="text-xs text-gray-500 hover:text-[#ff0000] mt-2 transition-colors self-start"
//         >
//           View all {title.split(/\s+/)[1]}
//         </NavLink>
//       )} */}
//     </div>
//   );
// };

//   console.log(totalInvoiceEachDay);
//    const getDaysInMonth = (year, month) => {
//      return new Date(year, month + 1, 0).getDate();
//    };
 
//    const getFirstDayOfMonth = (year, month) => {
//      return new Date(year, month, 1).getDay();
//    };
 
//    const formatDate = (year, month, day) => {
//      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
//    };
 
//    const handleDateClick = (day) => {
//      const year = currentDate.getFullYear();
//      const month = currentDate.getMonth();
//      const dateStr = formatDate(year, month, day);
     
//      console.log("Selected date:", dateStr);
     
//    // Clear leads immediately when a new date is selected
//      // dispatch(clearSelectedLeads());
//      setSelectedDate(dateStr);
//      //navigate(`/day-wise-report/${dateStr}`);
//     window.open(`/order/day-wise-invoices-order-report/${dateStr}`,"_blank");
//      // Remove the manual fetchLeadsByDate call - let the query handle it
//    };

//    const navigateMonth = (direction) => {
//         const newDate = new Date(currentDate);
//         newDate.setMonth(newDate.getMonth() + direction);
//             // dispatch(clearSelectedLeads()); // Clear leads when navigating months
//         setCurrentDate(newDate);
//         setSelectedDate(today);
//         // setSelectedLeads([]);
     
//       };
//        const handleDateRangeSubmit = () => {
       
//        if (dateRange?.startDate && dateRange?.endDate) {
//          // Validate that end date is after start date
//          if (new Date(dateRange.endDate) < new Date(dateRange.startDate)) {
//            alert('End date must be after start date');
//            return;
//          }
//           //window.open(`/accounts/date-range-report/${dateRange.startDate}/${dateRange.endDate}`, "_blank");
   
//          // Open report in new tab with date range
//          window.open(`/order/date-range-orders-takaway-report/${dateRange.startDate}/${dateRange.endDate}`, "_blank");
//     console.log(dateRange);
//          //window.open(`/date-range-report?fromDate=${dateRange.startDate}&toDate=${dateRange.endDate}`, '_blank');
//          //window.open(`/date-range-report/${dateRange.startDate}/${dateRange.endDate}`, '_blank');
//          setShowRangeModal(false);
         
//          // Reset the form
//          setDateRange({ startDate: '', endDate: '' });
//        } else {
//         toast.error('Please select both start and end dates');
//        }
//      };

//   const renderCalendar = () => {
//   const year = currentDate.getFullYear();
//   const month = currentDate.getMonth();
//   const daysInMonth = getDaysInMonth(year, month);
//   const firstDay = getFirstDayOfMonth(year, month);
//   const today = new Date().getDate();

//   // Convert API data to lookup maps
//   const invoicesEachDay =
//     totalInvoiceEachDay?.data?.reduce((acc, item) => {
//       acc[item.date] = item.total_invoices;
//       return acc;
//     }, {}) || {};

//   const takeawayInvoicesEachDay =
//     totalInvoiceEachDay?.takeawayInvoices?.reduce((acc, item) => {
//       acc[item.date] = item.total_takeaway_invoices;
//       return acc;
//     }, {}) || {};

//   const days = [];

//   // Blank cells before the first day
//   for (let i = 0; i < firstDay; i++) {
//     days.push(<div key={`e-${i}`} className="h-20 sm:h-24 bg-gray-50 border"></div>);
//   }

//   // Calendar days
//   for (let d = 1; d <= daysInMonth; d++) {
//     const dateStr = formatDate(year, month, d);

//     const isToday =
//       d === today &&
//       month === new Date().getMonth() &&
//       year === new Date().getFullYear();

//     const isSelected = selectedDate === dateStr;

//     const totalInvoices = invoicesEachDay[dateStr] || 0;
//     const totalTakeawayInvoices = takeawayInvoicesEachDay[dateStr] || 0;

//     days.push(
//       <div
//         key={d}
//         onClick={() => handleDateClick(d)}
//         className={`
//           h-20 sm:h-24 border p-1 cursor-pointer relative rounded-md transition
//           ${isSelected ? "bg-blue-100 border-blue-400" :
//           isToday ? "bg-green-100 border-green-400" :
//           "bg-white hover:bg-gray-50"}
//         `}
//       >
//         {/* Day Number */}
//         <div className="text-sm sm:text-base font-semibold text-gray-700">
//           {d}
//         </div>

//         {/* Bottom values (Orders, Takeaways) */}
//         <div
//           className="
//             absolute bottom-1 right-1 flex flex-col space-y-[1px]
//             max-w-[85%] sm:max-w-full text-right
//           "
//         >

//           {/* Orders */}
//           {totalInvoices > 0 && (
//             <span
//               style={{ color: "red" }}
//               className="
//                 text-[10px] sm:text-[13px] md:text-[15px]
//                 font-medium leading-tight break-words
//               "
//             >
//               Orders: {totalInvoices}
//             </span>
//           )}

//           {/* Takeaways */}
//           {totalTakeawayInvoices > 0 && (
//             <span
//               style={{ color: "blue" }}
//               className="
//                 text-[10px] sm:text-[13px] md:text-[15px]
//                 font-medium leading-tight break-words
//               "
//             >
//               Takeaways: {totalTakeawayInvoices}
//             </span>
//           )}
//         </div>
//       </div>
//     );
//   }

//   return days;
// };

 
  
//     return (
//    <>
    
 
//        {/* Calendar & Leads */}
//        <div className="sb2-2-3">
//          <div className="row">
//            <div className="col-md-12">
//              <div className="box-inn-sp">
//                {/* Stats Grid */}
//                  <div className="tab-inn border-b border-gray-200">
//                 <div className="flex justify-end items-center p-2 gap-2">
//                   <span className="border-b border-black">
//                        {formatDateDDMMYYYY(selectedDate)}
//                   </span>
//     <div className="relative">
//       {/* Hidden Date Input */}
//       <input
//         type="date"
//         id="dashboard-date"
//         className="absolute inset-0 opacity-0 "
//         onChange={(e) => {
//        setSelectedDate(e.target.value);
//           // 👉 call API / set state here
//         }}
//       />

//       {/* Calendar Icon */}
//       <button
//         type="button"
//         className="flex items-center justify-center
//                    w-10 h-10 rounded-full
//                    border border-gray-300
//                    hover:bg-gray-100"
//       >
//         <CalendarDays className="w-5 h-5 text-gray-600 cursor-pointer" />
//       </button>
//     </div>
//   </div>
//                       <div className="grid grid-cols-1 p-2
//                       md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//                         <StatCard
//                           title="Total Sales"
//                           value={totalSalesPurchasesReceivablesPayablesProfit?.total_sales || 0}
//                           icon={TrendingUp}
//                           trend="up"
//                           trendValue="+12.5%"
//                           color="bg-blue-600"
//                         />
//                         {/* <StatCard
//                           title="Total Purchases"
//                           value={totalSalesPurchasesReceivablesPayablesProfit?.total_purchases|| 0}
//                           icon={ShoppingCart}
//                                trend="up"
//                           trendValue="+12.5%"
//                           color="bg-purple-600"
//                         /> */}
//                         <DineTakeawayStatCard
//                           title="Orders(Dine-In)"
//                           value={totalSalesPurchasesReceivablesPayablesProfit?.total_dineIn?? 0}
//                           icon={Armchair}
//                           color="bg-orange-600"
//                         />
//                         <DineTakeawayStatCard
//                           title="Orders(Takeaway)"
//                           value={totalSalesPurchasesReceivablesPayablesProfit?.total_takeaway ?? 0}
//                           icon={Handbag}
//                           color="bg-red-600"
//                         />
//                         {/* <StatCard
//                           title="Profit"
//                           value={totalSalesPurchasesReceivablesPayablesProfit?.profit || 0}
//                           icon={profitMargin > 0 ? TrendingUp : TrendingDown}
//                           trend={profitMargin > 0 ? 'up' : 'down'}
//                           trendValue={profitMargin + '%'}
//                           color={profitMargin > 0 ? "bg-green-600" : "bg-red-600"}
//                         /> */}
//                       </div>
//                       </div>
//              {/* Header with month and nav */}
//               <div style={{border:"none"}} 
//               className="inn-title ">
//              <div className="flex flex-col sm:flex-row items-center 
//              justify-between mb-4 mt-4 mx-auto px-4 gap-3">
//                <h4 >
//                  {currentDate.toLocaleString("default", {
//                    month: "long",
//                    year: "numeric",
//                  })}
//                </h4>
 
//                <div className="flex gap-2 sm:gap-4">
//                  <button style={{ outline: "none",backgroundColor: "lightgray" }}
//                    onClick={() => navigateMonth(-1)}
//                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 
//                    focus:outline-none rounded text-sm sm:text-base"
//                  >
//                    ← Previous
//                  </button>
//                        <button  style={{ backgroundColor: "#ff0000" }}
//                  onClick={() => setShowRangeModal(true)}
//                  className="px-4 py-2 bg-blue-600  text-white rounded-lg transition text-sm sm:text-base  flex items-center gap-2"
//                >
//                  <Filter className="w-4 h-4" />
//                  Date Range Report
//                </button>
//                  <button  style={{ outline: "none",backgroundColor: "lightgray" }}
//                    onClick={() => navigateMonth(1)}
//                    className="px-3 py-1 bg-gray-200
//                     rounded text-sm sm:text-base"
//                  >
//                    Next →
//                  </button>
//                </div>
//              </div>
//              </div>
 
//              {/* Calendar grid */}
//              <div className="tab-inn">
//              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                <div className="lg:col-span-2">
//                  <div className="grid grid-cols-7 gap-1 mb-4 text-xs sm:text-sm">
//                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
//                      (day) => (
//                        <div
//                          key={day}
//                          className="text-center font-medium text-gray-600 py-2"
//                        >
//                          {day}
//                        </div>
//                      )
//                    )}
//                    {renderCalendar()}
//                  </div>
//                </div>
 
//                {/* Selected Leads */}
//                <div className="lg:col-span-1">
//                  {/* <div className="bg-gray-50 rounded-lg p-4 h-full">
//                    {renderSelectedLeads()}
//                  </div> */}
//                </div>
//              </div>
//              </div>
//            </div>
//            </div>
//          </div>
//        </div>
//  {showRangeModal && (
//          // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center
//          //  justify-center z-50 p-4">
//          <div
//    style={{
//      width: "100%",
//      position: "fixed",
//      inset: 0,
//      display: "flex",
//      alignItems: "center",
//      justifyContent: "center",
//      backgroundColor: "rgba(0,0,0,0.4)", // dim background
//      backdropFilter: "blur(4px)", // blur effect
//      zIndex: 50,
//      padding: "1rem", // ensures spacing on small screens
//    }}
//  >
//            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
//              <div className="flex items-center justify-between mb-4">
//                <h3 className="text-xl font-bold text-gray-800">Select Date Range</h3>
//                <button
//                  onClick={() => setShowRangeModal(false)}
//                  className="text-gray-400 hover:text-gray-600 transition"
//                >
//                  <X className="w-6 h-6" />
//                </button>
//              </div>
 
//              <div className="space-y-4">
//                <div>
//                  <label className="block text-sm font-medium text-gray-700 mb-2">
//                    Start Date
//                  </label>
//                  <input
//                    type="date"
//                    value={dateRange.startDate}
//                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
//                    className="w-full outline-none border-b-2 text-gray-900"
//                  />
//                </div>
 
//                <div>
//                  <label className="block text-sm font-medium text-gray-700 mb-2">
//                    End Date
//                  </label>
//                  <input
//                    type="date"
//                    value={dateRange.endDate}
//                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
//                    min={dateRange.startDate}
//                    className="w-full outline-none border-b-2 text-gray-900"
//                  />
//                </div>
 
//                <div className="flex gap-3 mt-6">
//                  <button
//                   style={{ backgroundColor: "lightgray" }}
//                    onClick={() => setShowRangeModal(false)}
//                    className="flex-1 px-4 py-2 
//                     text-gray-800 rounded-lg  font-medium"
//                  >
//                    Cancel
//                  </button>
//                  <button
//                    onClick={handleDateRangeSubmit}
//                    style={{ backgroundColor: "#ff0000" }}
//                    className="flex-1 px-4 py-2 
//                    text-white rounded-lg  font-medium"
//                  >
//                    Generate Report
//                  </button>
//                </div>
//              </div>
//            </div>
//          </div>
//        )}
     
//    </>
//  );
// }


import  { useState } from 'react';

import { TrendingUp,  Armchair, Handbag, CalendarDays, Filter, X, ChefHat } from 'lucide-react';

import {  
  
    useGetTotalSalesPurchasesReceivablesPayablesProfitQuery } from '../../redux/api/dashboardApi';

import { useTotalInvoicesEachDayQuery } from '../../redux/api/Staff/orderApi';
import { toast } from 'react-toastify';




export default function AllOrdersDashboard() {

  // const {user}=useSelector((state)=>state.user)
  // const today = new Date().toISOString().split("T")[0];
//  const today = new Date().toLocaleDateString("en-CA");
const today = new Date().toISOString().split("T")[0]; // ✅ safest
// const[page,setPage]=useState(1)
  const{data:totalInvoiceEachDay}=useTotalInvoicesEachDayQuery()
    const [showRangeModal, setShowRangeModal] = useState(false);
    const [dateRange, setDateRange] = useState({
      startDate: '',
      endDate: ''
    });
      // const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
     console.log(today);
       const [currentDate, setCurrentDate] = useState(new Date());
       const [selectedDate, setSelectedDate] = useState(today);
const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
};

  //const[selectedYear, setSelectedYear] = useState("2025");


// const {data: salesPurchasesProfitData} =
//    useGetAllSalesAndPurchasesYearWiseQuery({year:selectedYear})
  //  const handlePageChange = (newPage) => {
  //   setPage(newPage);
  // }
  // const handleNextPage = () => {
  //   setPage(page + 1);
  // }
  // const handlePreviousPage = () => {
  //   setPage(page - 1);
  // }

  //console.log(selectedYear);
const {data:totalSalesPurchasesReceivablesPayablesProfit}=
useGetTotalSalesPurchasesReceivablesPayablesProfitQuery(selectedDate)
  // Item-wise analysis
  console.log(totalSalesPurchasesReceivablesPayablesProfit,
    "totalSalesPurchasesReceivablesPayablesProfit");
// const{data:itemsSoldEachDay}=useGetItemsSoldEachDayQuery(selectedDate)
// const {
//   data: itemsSoldEachDay
// } = useGetItemsSoldEachDayQuery(
//   { date: selectedDate, page },
//   {
//     skip: !selectedDate,
//   }
// );

// const topSellingItems = itemsSoldEachDay?.data ?? [];
// console.log(itemsSoldEachDay,"itemsSoldEachDay");


    // const profitMargin=totalSalesPurchasesReceivablesPayablesProfit?.profit
     
     




  
const StatCard = ({ title, value, icon: Icon, color }) => {

 

  return (
    <div
      className="flex flex-col justify-between bg-white rounded-xl shadow-sm 
                 border border-gray-100 hover:shadow-md transition-all 
                 p-4 w-full min-w-[180px] h-[120px]"
    >
      {/* 🔹 Icon + Title */}
      <div className="flex items-center mb-1">
        <div className="flex gap-2 items-center">
          <div className={`p-2 rounded-full ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <p style={{color:"black"}} className="text-sm text-gray-600 font-medium truncate mt-2 ">{title}</p>
        </div>
      </div>

      {/* 💰 Value */}
      <h4 className="text-2xl font-bold text-gray-900 mt-2">
        ₹{value?.toLocaleString() || 0}
      </h4>

      {/* 🔗 “View all …” link — only this is clickable */}
      {/* {title.split(/\s+/).length > 1 && (
        <NavLink
          to={route}
          className="text-xs text-gray-500 hover:text-[#ff0000] mt-2 transition-colors self-start"
        >
          View all {title.split(/\s+/)[1]}
        </NavLink>
      )} */}
    </div>
  );
};

const DineTakeawayStatCard = ({ title, value, icon: Icon, color }) => {

  

  return (
    <div
      className="flex flex-col justify-between bg-white rounded-xl shadow-sm 
                 border border-gray-100 hover:shadow-md transition-all 
                 p-4 w-full min-w-[180px] h-[120px]"
    >
      {/* 🔹 Icon + Title */}
      <div className="flex items-center mb-1">
        <div className="flex gap-2 items-center">
          <div className={`p-2 rounded-full ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <p style={{color:"black"}} className="text-sm text-gray-600 font-medium truncate mt-2 ">{title}</p>
        </div>
      </div>

      {/* 💰 Value */}
      <h4 className="text-2xl font-bold text-gray-900 mt-2">
        {value?.toLocaleString() || 0}
      </h4>

      {/* 🔗 “View all …” link — only this is clickable */}
      {/* {title.split(/\s+/).length > 1 && (
        <NavLink
          to={route}
          className="text-xs text-gray-500 hover:text-[#ff0000] mt-2 transition-colors self-start"
        >
          View all {title.split(/\s+/)[1]}
        </NavLink>
      )} */}
    </div>
  );
};

  console.log(totalInvoiceEachDay);
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
    window.open(`/order/day-wise-invoices-order-report/${dateStr}`,"_blank");
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
       
       if (dateRange?.startDate && dateRange?.endDate) {
         // Validate that end date is after start date
         if (new Date(dateRange.endDate) < new Date(dateRange.startDate)) {
           alert('End date must be after start date');
           return;
         }
          //window.open(`/accounts/date-range-report/${dateRange.startDate}/${dateRange.endDate}`, "_blank");
   
         // Open report in new tab with date range
         window.open(`/order/date-range-orders-takaway-report/${dateRange.startDate}/${dateRange.endDate}`, "_blank");
    console.log(dateRange);
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

  // Convert API data to lookup maps
  const invoicesEachDay =
    totalInvoiceEachDay?.data?.reduce((acc, item) => {
      acc[item.date] = item.total_invoices;
      return acc;
    }, {}) || {};

  const takeawayInvoicesEachDay =
    totalInvoiceEachDay?.takeawayInvoices?.reduce((acc, item) => {
      acc[item.date] = item.total_takeaway_invoices;
      return acc;
    }, {}) || {};

    const cancelledTakeawayInvoicesEachDay=
    totalInvoiceEachDay?.cancelledTakeawayInvoices?.reduce((acc, item) => {
      acc[item.date] = item.cancelled_takeaway_invoices;
      return acc;
    }, {}) || {};
  const days = [];

  // Blank cells before the first day
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`e-${i}`} className="h-20 sm:h-24 bg-gray-50 border"></div>);
  }

  // Calendar days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(year, month, d);

    const isToday =
      d === today &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();

    const isSelected = selectedDate === dateStr;

    const totalInvoices = invoicesEachDay[dateStr] || 0;
    const totalTakeawayInvoices = takeawayInvoicesEachDay[dateStr] || 0;
const cancelledTakeawayInvoices =
  cancelledTakeawayInvoicesEachDay[dateStr] || 0;
    days.push(
      <div
        key={d}
        onClick={() => handleDateClick(d)}
        className={`
          h-20 sm:h-24 border p-1 cursor-pointer relative rounded-md transition
          ${isSelected ? "bg-blue-100 border-blue-400" :
          isToday ? "bg-green-100 border-green-400" :
          "bg-white hover:bg-gray-50"}
        `}
      >
        {/* Day Number */}
        <div className="text-sm sm:text-base font-semibold text-gray-700">
          {d}
        </div>

        {/* Bottom values (Orders, Takeaways) */}
        <div
          className="
            absolute bottom-1 right-1 flex flex-col space-y-[1px]
            max-w-[85%] sm:max-w-full text-right
          "
        >

          {/* Orders */}
          {totalInvoices > 0 && (
            <span
              style={{ color: "red" }}
              className="
                text-[8px] sm:text-[12px] md:text-[12px]
                font-medium leading-tight break-words
              "
            >
              Dine-In: {totalInvoices}
            </span>
          )}

          {/* Takeaways */}
          {totalTakeawayInvoices > 0 && (
            <span
              style={{ color: "blue" }}
              className="
                text-[8px] sm:text-[12px] md:text-[12px]
                font-medium leading-tight break-words
              "
            >
              Takeaways: {totalTakeawayInvoices}
            </span>
          )}
          {cancelledTakeawayInvoices > 0 && (
            <span
              style={{ color: "red" }}
              className="
                text-[8px] sm:text-[12px] md:text-[12px]
                font-medium leading-tight break-words
              "
            >
              Cancel : {cancelledTakeawayInvoices}
            </span>
          )}
        </div>
      </div>
    );
  }

  return days;
};

 
  
    return (
   <>
    
 
       {/* Calendar & Leads */}
       <div className="sb2-2-3">
         <div className="row">
           <div className="col-md-12">
             <div className="box-inn-sp">
               {/* Stats Grid */}
                 <div className="tab-inn border-b border-gray-200">
                <div className="flex justify-end items-center p-2 gap-2">
                  <span className="border-b border-black">
                       {formatDateDDMMYYYY(selectedDate)}
                  </span>
    <div className="relative">
      {/* Hidden Date Input */}
      <input
        type="date"
        id="dashboard-date"
        className="absolute inset-0 opacity-0 "
        onChange={(e) => {
       setSelectedDate(e.target.value);
          // 👉 call API / set state here
        }}
      />

      {/* Calendar Icon */}
      <button
        type="button"
        className="flex items-center justify-center
                   w-10 h-10 rounded-full
                   border border-gray-300
                   hover:bg-gray-100"
      >
        <CalendarDays className="w-5 h-5 text-gray-600 cursor-pointer" />
      </button>
    </div>
  </div>
                      <div className="grid grid-cols-1 p-2
                      md:grid-cols-2 lg:grid-cols-3 gap-6 mb-2">
                        <StatCard
                          title="Total Sales"
                          value={totalSalesPurchasesReceivablesPayablesProfit?.total_sales || 0}
                          icon={TrendingUp}
                          trend="up"
                          trendValue="+12.5%"
                          color="bg-blue-600"
                        />
                        {/* <StatCard
                          title="Total Purchases"
                          value={totalSalesPurchasesReceivablesPayablesProfit?.total_purchases|| 0}
                          icon={ShoppingCart}
                               trend="up"
                          trendValue="+12.5%"
                          color="bg-purple-600"
                        /> */}
                        <DineTakeawayStatCard
                          title="Orders(Dine-In)"
                          value={totalSalesPurchasesReceivablesPayablesProfit?.total_dineIn?? 0}
                          icon={Armchair}
                          color="bg-orange-600"
                        />
                        <DineTakeawayStatCard
                          title="Orders(Takeaway)"
                          value={totalSalesPurchasesReceivablesPayablesProfit?.total_takeaway ?? 0}
                          icon={Handbag}
                          color="bg-red-600"
                        />
                        {/* <StatCard
                          title="Profit"
                          value={totalSalesPurchasesReceivablesPayablesProfit?.profit || 0}
                          icon={profitMargin > 0 ? TrendingUp : TrendingDown}
                          trend={profitMargin > 0 ? 'up' : 'down'}
                          trendValue={profitMargin + '%'}
                          color={profitMargin > 0 ? "bg-green-600" : "bg-red-600"}
                        /> */}
                      </div>
                                     {/* <div className="p-4 bg-gradient-to-r from-green-50 to-white">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                      <ChefHat size={20} className="text-green-600" />
                                      Top Selling Items
                                    </h3>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Item</th>
                                          <th className="px-4 py-3 text-center font-semibold text-gray-700">Qty</th>
                                          <th className="px-4 py-3 text-right font-semibold text-gray-700">Revenue</th>
                                        
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {topSellingItems && topSellingItems.length > 0 ? topSellingItems?.map((item, idx) => (
                                          <tr key={idx} className="hover:bg-gray-50">
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
                                      </tbody>
                                    </table>
                                          <div className="flex justify-center align-center space-x-2 p-4">
                <button type="button"
                 style={{ outline: "none",backgroundColor: "lightgray" }}
                  onClick={() => handlePreviousPage()}
                  disabled={page === 1}
                  className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                ${page === 1 ? 'opacity-50 ' : ''}
                `}
                >
                  ← Previous
                </button>
                {[...Array(itemsSoldEachDay?.totalPages).keys()].map((index) => (
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

                <button type="button"
                style={{ outline: "none",backgroundColor: "lightgray" }}
                  onClick={() => handleNextPage()}
                  disabled={page === itemsSoldEachDay?.totalPages || itemsSoldEachDay?.totalPages === 0}
                  className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                ${page === itemsSoldEachDay?.totalPages || itemsSoldEachDay?.totalPages === 0 ? 
                  'opacity-50 ' : ''}
                `}
                >
                  Next →
                </button>
 


              </div>
                                  </div> */}
                      </div>
             {/* Header with month and nav */}
              <div style={{border:"none",padding:"0px"}} 
              className="inn-title ">
             <div className="flex flex-col sm:flex-row items-center 
             justify-between mb-4 mt-4 mx-auto px-4 gap-3">
               <h4 >
                 {currentDate.toLocaleString("default", {
                   month: "long",
                   year: "numeric",
                 })}
               </h4>
 
               <div className="flex gap-2 sm:gap-4">
                 <button style={{ outline: "none",backgroundColor: "lightgray" }}
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
                 <button  style={{ outline: "none",backgroundColor: "lightgray" }}
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