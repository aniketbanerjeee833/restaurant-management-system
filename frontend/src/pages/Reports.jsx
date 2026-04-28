import { useState } from "react";

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
// import  { useState } from 'react';
// import { 
//   TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
//   Package, Users, Calendar, PieChart, BarChart3, 
//   AlertTriangle, ChefHat, Clock, Filter
// } from 'lucide-react';

// export default function Reports() {
//   const [dateRange, setDateRange] = useState('today');
//   const [reportType, setReportType] = useState('overview');

//   // Mock Data
//   const kpiData = {
//     totalSales: 145680,
//     totalPurchases: 52340,
//     grossProfit: 93340,
//     totalOrders: 342,
//     dineInOrders: 215,
//     takeawayOrders: 127,
//     avgOrderValue: 426
//   };

//   const topSellingItems = [
//     { name: 'Chicken Biryani', qtySold: 120, revenue: 24000, contribution: 18 },
//     { name: 'Butter Chicken', qtySold: 95, revenue: 18050, contribution: 14 },
//     { name: 'Paneer Tikka', qtySold: 90, revenue: 13500, contribution: 10 },
//     { name: 'Dal Makhani', qtySold: 85, revenue: 10200, contribution: 8 },
//     { name: 'Tandoori Roti', qtySold: 280, revenue: 8400, contribution: 6 }
//   ];

//   const lowStockItems = [
//     { material: 'Chicken', currentStock: 5, unit: 'kg', reorderLevel: 10, daysLeft: 2 },
//     { material: 'Paneer', currentStock: 3, unit: 'kg', reorderLevel: 8, daysLeft: 1 },
//     { material: 'Onion', currentStock: 12, unit: 'kg', reorderLevel: 15, daysLeft: 3 },
//     { material: 'Tomato', currentStock: 8, unit: 'kg', reorderLevel: 12, daysLeft: 2 }
//   ];

//   const supplierPurchases = [
//     { supplier: 'Fresh Farm Suppliers', totalPurchased: 25600, paid: 20000, due: 5600 },
//     { supplier: 'Spencers', totalPurchased: 15340, paid: 15340, due: 0 },
//     { supplier: 'Metro Cash & Carry', totalPurchased: 11400, paid: 8000, due: 3400 }
//   ];

//   const hourlyData = [
//     { hour: '12 PM', orders: 45, revenue: 12500 },
//     { hour: '1 PM', orders: 52, revenue: 15200 },
//     { hour: '2 PM', orders: 38, revenue: 11000 },
//     { hour: '7 PM', orders: 68, revenue: 22400 },
//     { hour: '8 PM', orders: 72, revenue: 24800 },
//     { hour: '9 PM', orders: 48, revenue: 16200 }
//   ];

//   const profitMargin = ((kpiData.grossProfit / kpiData.totalSales) * 100).toFixed(1);
//   const foodCostPercent = ((kpiData.totalPurchases / kpiData.totalSales) * 100).toFixed(1);

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
        
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports Dashboard</h1>
//           <p className="text-gray-600">Business insights and analytics</p>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow-md p-4 mb-6">
//           <div className="flex flex-wrap gap-4 items-center">
//             <div className="flex items-center gap-2">
//               <Calendar size={20} className="text-gray-600" />
//               <select 
//                 value={dateRange}
//                 onChange={(e) => setDateRange(e.target.value)}
//                 className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="today">Today</option>
//                 <option value="yesterday">Yesterday</option>
//                 <option value="week">This Week</option>
//                 <option value="month">This Month</option>
//                 <option value="custom">Custom Range</option>
//               </select>
//             </div>

//             <div className="flex items-center gap-2">
//               <Filter size={20} className="text-gray-600" />
//               <select 
//                 value={reportType}
//                 onChange={(e) => setReportType(e.target.value)}
//                 className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="overview">Overview</option>
//                 <option value="sales">Sales Details</option>
//                 <option value="inventory">Inventory</option>
//                 <option value="profit">Profit Analysis</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* KPI Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-5">
//             <div className="flex items-center justify-between mb-2">
//               <DollarSign size={24} />
//               <TrendingUp size={20} className="opacity-80" />
//             </div>
//             <div className="text-2xl font-bold mb-1">₹{kpiData.totalSales.toLocaleString()}</div>
//             <div className="text-sm opacity-90">Total Sales</div>
//           </div>

//           <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-lg p-5">
//             <div className="flex items-center justify-between mb-2">
//               <ShoppingCart size={24} />
//               <TrendingDown size={20} className="opacity-80" />
//             </div>
//             <div className="text-2xl font-bold mb-1">₹{kpiData.totalPurchases.toLocaleString()}</div>
//             <div className="text-sm opacity-90">Total Purchases</div>
//           </div>

//           <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-5">
//             <div className="flex items-center justify-between mb-2">
//               <TrendingUp size={24} />
//               <span className="text-sm bg-white/20 px-2 py-1 rounded">{profitMargin}%</span>
//             </div>
//             <div className="text-2xl font-bold mb-1">₹{kpiData.grossProfit.toLocaleString()}</div>
//             <div className="text-sm opacity-90">Gross Profit</div>
//           </div>

//           <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-5">
//             <div className="flex items-center justify-between mb-2">
//               <Package size={24} />
//               <span className="text-sm bg-white/20 px-2 py-1 rounded">₹{kpiData.avgOrderValue}</span>
//             </div>
//             <div className="text-2xl font-bold mb-1">{kpiData.totalOrders}</div>
//             <div className="text-sm opacity-90">Total Orders</div>
//           </div>
//         </div>

//         {/* Order Type Split */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//           <div className="bg-white rounded-lg shadow-md p-5">
//             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
//               <PieChart size={20} className="text-blue-600" />
//               Order Type Distribution
//             </h3>
//             <div className="space-y-3">
//               <div>
//                 <div className="flex justify-between mb-1 text-sm">
//                   <span className="text-gray-600">Dine-in</span>
//                   <span className="font-semibold">{kpiData.dineInOrders} ({((kpiData.dineInOrders/kpiData.totalOrders)*100).toFixed(0)}%)</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div className="bg-blue-600 h-2 rounded-full" style={{width: `${(kpiData.dineInOrders/kpiData.totalOrders)*100}%`}}></div>
//                 </div>
//               </div>
//               <div>
//                 <div className="flex justify-between mb-1 text-sm">
//                   <span className="text-gray-600">Takeaway</span>
//                   <span className="font-semibold">{kpiData.takeawayOrders} ({((kpiData.takeawayOrders/kpiData.totalOrders)*100).toFixed(0)}%)</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div className="bg-green-600 h-2 rounded-full" style={{width: `${(kpiData.takeawayOrders/kpiData.totalOrders)*100}%`}}></div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-5">
//             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
//               <BarChart3 size={20} className="text-green-600" />
//               Profit Metrics
//             </h3>
//             <div className="space-y-4">
//               <div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Profit Margin</span>
//                   <span className={`font-bold text-lg ${profitMargin >= 50 ? 'text-green-600' : 'text-yellow-600'}`}>
//                     {profitMargin}%
//                   </span>
//                 </div>
//               </div>
//               <div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Food Cost %</span>
//                   <span className={`font-bold text-lg ${foodCostPercent <= 35 ? 'text-green-600' : 'text-red-600'}`}>
//                     {foodCostPercent}%
//                   </span>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">Ideal: 28-35%</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-lg shadow-lg p-5">
//             <h3 className="font-bold mb-3 flex items-center gap-2">
//               <AlertTriangle size={20} />
//               Critical Alerts
//             </h3>
//             <div className="space-y-2 text-sm">
//               <div className="bg-white/20 rounded p-2">
//                 <div className="font-semibold">4 Items Low Stock</div>
//                 <div className="text-xs opacity-90">Action needed today</div>
//               </div>
//               <div className="bg-white/20 rounded p-2">
//                 <div className="font-semibold">₹9,000 Payment Due</div>
//                 <div className="text-xs opacity-90">2 suppliers pending</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Two Column Layout */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
//           {/* Top Selling Items */}
//           <div className="bg-white rounded-lg shadow-md">
//             <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
//               <h3 className="font-bold text-gray-800 flex items-center gap-2">
//                 <ChefHat size={20} className="text-green-600" />
//                 Top Selling Items
//               </h3>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3 text-left font-semibold text-gray-700">Item</th>
//                     <th className="px-4 py-3 text-center font-semibold text-gray-700">Qty</th>
//                     <th className="px-4 py-3 text-right font-semibold text-gray-700">Revenue</th>
//                     <th className="px-4 py-3 text-right font-semibold text-gray-700">%</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {topSellingItems.map((item, idx) => (
//                     <tr key={idx} className="hover:bg-gray-50">
//                       <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
//                       <td className="px-4 py-3 text-center text-gray-600">{item.qtySold}</td>
//                       <td className="px-4 py-3 text-right font-semibold text-green-600">₹{item.revenue.toLocaleString()}</td>
//                       <td className="px-4 py-3 text-right">
//                         <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
//                           {item.contribution}%
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Low Stock Alert */}
//           <div className="bg-white rounded-lg shadow-md">
//             <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
//               <h3 className="font-bold text-gray-800 flex items-center gap-2">
//                 <AlertTriangle size={20} className="text-red-600" />
//                 Low Stock Items
//               </h3>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3 text-left font-semibold text-gray-700">Material</th>
//                     <th className="px-4 py-3 text-center font-semibold text-gray-700">Current</th>
//                     <th className="px-4 py-3 text-center font-semibold text-gray-700">Reorder</th>
//                     <th className="px-4 py-3 text-center font-semibold text-gray-700">Days Left</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {lowStockItems.map((item, idx) => (
//                     <tr key={idx} className="hover:bg-gray-50">
//                       <td className="px-4 py-3 font-medium text-gray-800">{item.material}</td>
//                       <td className="px-4 py-3 text-center">
//                         <span className="text-red-600 font-semibold">{item.currentStock} {item.unit}</span>
//                       </td>
//                       <td className="px-4 py-3 text-center text-gray-600">{item.reorderLevel} {item.unit}</td>
//                       <td className="px-4 py-3 text-center">
//                         <span className={`px-2 py-1 rounded text-xs font-semibold ${
//                           item.daysLeft <= 1 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
//                         }`}>
//                           {item.daysLeft}d
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         {/* Supplier Purchases */}
//         <div className="bg-white rounded-lg shadow-md mb-6">
//           <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
//             <h3 className="font-bold text-gray-800 flex items-center gap-2">
//               <Users size={20} className="text-purple-600" />
//               Supplier Purchase Summary
//             </h3>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left font-semibold text-gray-700">Supplier</th>
//                   <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Purchased</th>
//                   <th className="px-4 py-3 text-right font-semibold text-gray-700">Paid</th>
//                   <th className="px-4 py-3 text-right font-semibold text-gray-700">Due</th>
//                   <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {supplierPurchases.map((supplier, idx) => (
//                   <tr key={idx} className="hover:bg-gray-50">
//                     <td className="px-4 py-3 font-medium text-gray-800">{supplier.supplier}</td>
//                     <td className="px-4 py-3 text-right font-semibold text-gray-700">₹{supplier.totalPurchased.toLocaleString()}</td>
//                     <td className="px-4 py-3 text-right text-green-600">₹{supplier.paid.toLocaleString()}</td>
//                     <td className="px-4 py-3 text-right text-red-600 font-semibold">₹{supplier.due.toLocaleString()}</td>
//                     <td className="px-4 py-3 text-center">
//                       <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                         supplier.due === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//                       }`}>
//                         {supplier.due === 0 ? 'Paid' : 'Pending'}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Peak Hours */}
//         <div className="bg-white rounded-lg shadow-md">
//           <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
//             <h3 className="font-bold text-gray-800 flex items-center gap-2">
//               <Clock size={20} className="text-blue-600" />
//               Peak Hours Analysis
//             </h3>
//           </div>
//           <div className="p-6">
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
//               {hourlyData.map((hour, idx) => (
//                 <div key={idx} className="text-center">
//                   <div className="text-xs text-gray-500 mb-2">{hour.hour}</div>
//                   <div className="bg-blue-100 rounded-lg p-3 mb-2">
//                     <div className="text-2xl font-bold text-blue-600">{hour.orders}</div>
//                     <div className="text-xs text-gray-600">orders</div>
//                   </div>
//                   <div className="text-sm font-semibold text-gray-700">₹{(hour.revenue/1000).toFixed(1)}k</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }