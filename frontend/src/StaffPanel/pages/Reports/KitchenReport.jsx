 import { ChevronDown, ChevronUp } from "lucide-react";
import { useGetKitchenWiseReportAnalysisQuery } from "../../../redux/api/reportApi";

// export default function KitchenReport() {
// const today = new Date();

// const year = today.getFullYear();
// const month = today.getMonth() + 1;
//     const{data:kitchenWiseReportQuery}=useGetKitchenWiseReportAnalysisQuery({ year, month });
// //  const today = new Date().toISOString().split("T")[0]; // ✅ safest
//     console.log(kitchenWiseReportQuery,"kitchenWiseReportQuery");
//   return (
//     <div>KitchenReport</div>
//   )
// }

import React, { useState } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// import { Calendar, ChefHat, TrendingUp, Package, Users, ShoppingBag } from 'lucide-react';

// export default function KitchenReport() {
// //   const [reportData, setReportData] = useState(null);
// //   const [loading, setLoading] = useState(true);
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
// //   const [selectedDate, setSelectedDate] = useState(null);
// //   const [viewMode, setViewMode] = useState('table'); // table, chart, summary

//   const monthNames = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];

//   const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

//     const{data:kitchenWiseReportQuery,isLoading}=useGetKitchenWiseReportAnalysisQuery({ 
//        selectedYear, selectedMonth });
// //  const today = new Date().toISOString().split("T")[0]; // ✅ safest
//     console.log(kitchenWiseReportQuery,"kitchenWiseReportQuery");
// //   useEffect(() => {
// //     fetchReport();
// //   }, [selectedYear, selectedMonth]);

// //   const fetchReport = async () => {
// //     setLoading(true);
// //     try {
// //       const response = await fetch(
// //         `/api/kitchen-wise-report?year=${selectedYear}&month=${monthNames[selectedMonth - 1].toLowerCase()}`
// //       );
// //       const data = await response.json();
      
// //       if (data.success) {
// //         setReportData(data);
// //         // Auto-select first date
// //         const dates = Object.keys(data.report);
// //         if (dates.length > 0) {
// //           setSelectedDate(dates[0]);
// //         }
// //       }
// //     } catch (error) {
// //       console.error('Error fetching report:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

//   const calculateTotals = (kitchens) => {
//     return kitchens.reduce((acc, kitchen) => ({
      
//       totalQuantity: acc.totalQuantity + kitchen.totalQuantity,
//       dineInQuantity: acc.dineInQuantity + kitchen.dineInQuantity,
//       takeawayQuantity: acc.takeawayQuantity + kitchen.takeawayQuantity,
//     }), { totalKOTs: 0, totalQuantity: 0, dineInQuantity: 0, takeawayQuantity: 0 });
//   };

// //   const getMonthSummary = () => {
// //     if (!kitchenWiseReportQuery?.report) return null;
    
// //     const allKitchens = {};
// //     Object.values(kitchenWiseReportQuery.report).forEach(dayData => {
// //       dayData.forEach(kitchen => {
// //         if (!allKitchens[kitchen.kitchen]) {
// //           allKitchens[kitchen.kitchen] = {
// //             kitchen: kitchen.kitchen,
            
// //             totalQuantity: 0,
// //             dineInQuantity: 0,
// //             takeawayQuantity: 0,
// //           };
// //         }
       
// //         allKitchens[kitchen.kitchen].totalQuantity += kitchen.totalQuantity;
// //         allKitchens[kitchen.kitchen].dineInQuantity += kitchen.dineInQuantity;
// //         allKitchens[kitchen.kitchen].takeawayQuantity += kitchen.takeawayQuantity;
// //       });
// //     });
    
// //     return Object.values(allKitchens);
// //   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           <p className="mt-4 text-gray-600">Loading kitchen analysis...</p>
//         </div>
//       </div>
//     );
//   }

//   const dates = kitchenWiseReportQuery?.report ? Object.keys(kitchenWiseReportQuery.report) : [];
// //   const selectedDayData = selectedDate && kitchenWiseReportQuery?.report[selectedDate] ?
// //    kitchenWiseReportQuery.report[selectedDate] : [];
//   const dayTotals = selectedDayData.length > 0 ? calculateTotals(selectedDayData) : null;
// //   const monthSummary = getMonthSummary();

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center gap-3">
//               <ChefHat className="w-8 h-8 text-blue-600" />
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">Kitchen Wise Daily Analysis</h1>
//                 <p className="text-sm text-gray-600">Track daily performance across all kitchen stations</p>
//               </div>
//             </div>
            
//             <div className="flex gap-2">
            
//             </div>
//           </div>

//           {/* Filters */}
//           <div className="flex gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
//               <select
//                 value={selectedYear}
//                 onChange={(e) => setSelectedYear(Number(e.target.value))}
//                 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 {[2024, 2025, 2026].map(year => (
//                   <option key={year} value={year}>{year}</option>
//                 ))}
//               </select>
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
//               <select
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(Number(e.target.value))}
//                 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 {monthNames.map((month, idx) => (
//                   <option key={idx} value={idx + 1}>{month}</option>
//                 ))}
//               </select>
//             </div>

//             {/* {dates.length > 0 && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//                 <select
//                   value={selectedDate || ''}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   {dates.map(date => (
//                     <option key={date} value={date}>
//                       {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )} */}
//           </div>
//         </div>

//         {dates.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-sm p-12 text-center">
//             <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
//             <p className="text-gray-600">No kitchen orders found for {monthNames[selectedMonth - 1]} {selectedYear}</p>
//           </div>
//         ) : (
//           <>
//             {/* Summary Cards */}
//             {dayTotals && viewMode !== 'summary' && (
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//                 <div className="bg-white rounded-lg shadow-sm p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-600 mb-1">Total KOTs</p>
//                       <p className="text-2xl font-bold text-gray-900">{dayTotals.totalKOTs}</p>
//                     </div>
//                     <Package className="w-10 h-10 text-blue-600" />
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg shadow-sm p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-600 mb-1">Total Quantity</p>
//                       <p className="text-2xl font-bold text-gray-900">{dayTotals.totalQuantity}</p>
//                     </div>
//                     <TrendingUp className="w-10 h-10 text-green-600" />
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg shadow-sm p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-600 mb-1">Dine-In</p>
//                       <p className="text-2xl font-bold text-gray-900">{dayTotals.dineInQuantity}</p>
//                     </div>
//                     <Users className="w-10 h-10 text-purple-600" />
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg shadow-sm p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-600 mb-1">Takeaway</p>
//                       <p className="text-2xl font-bold text-gray-900">{dayTotals.takeawayQuantity}</p>
//                     </div>
//                     <ShoppingBag className="w-10 h-10 text-orange-600" />
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Table View */}
//             {viewMode === 'table' && (
//               <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead className="bg-gray-50 border-b border-gray-200">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kitchen</th>
//                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total KOTs</th>
//                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
//                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Dine-In</th>
//                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Takeaway</th>
//                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% Dine-In</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {selectedDayData.map((kitchen, idx) => (
//                         <tr key={idx} className="hover:bg-gray-50 transition">
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
//                               <span className="font-medium text-gray-900">{kitchen.kitchen}</span>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{kitchen.totalKOTs}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">{kitchen.totalQuantity}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-right text-green-600">{kitchen.dineInQuantity}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-right text-orange-600">{kitchen.takeawayQuantity}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
//                             {kitchen.totalQuantity > 0 ? Math.round((kitchen.dineInQuantity / kitchen.totalQuantity) * 100) : 0}%
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}


           
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

export default function KitchenReport() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
const [openDate, setOpenDate] = useState(null);

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const[page,setPage]=useState(1)
  const { data, isLoading } =
    useGetKitchenWiseReportAnalysisQuery({
        
      year: selectedYear,
      month: selectedMonth,
      page,
    },  {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
console.log(data,"kitchen report data");
  const report = data?.report || {};
  console.log(report,"kitchen report");

  // if (isLoading) {
  //   return <div className="p-6">Loading kitchen report…</div>;
  // }

  const handlePageChange = (newPage) => {
    setPage(newPage);
  }
  const handleNextPage = () => {
    setPage(page + 1);
  }
  const handlePreviousPage = () => {
    setPage(page - 1);
  }
  return (
    <div className="flex flex-col bg-white p-6">
      <div >
  <div className="flex flex-col justify-center items-center mb-2 sm:flex-row
       sm:justify-between">
        {/* HEADER */}
       
          <h1 className=" text-2xl whitespace-nowrap sm:text-3xl sm:font-bold ">Kitchen Report</h1>
      

      <div className="flex gap-2">
  <select
    value={selectedYear}
    onChange={(e) => setSelectedYear(Number(e.target.value))}
    className="border px-3 py-2 rounded w-28"
  >
    {[2024, 2025, 2026].map(y => (
      <option key={y} value={y}>{y}</option>
    ))}
  </select>

  <select
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(Number(e.target.value))}
    className="border px-3 py-2 rounded min-w-[120px]"
  >
    {monthNames.map((m, i) => (
      <option key={i} value={i + 1}>{m}</option>
    ))}
  </select>
</div>

        
        </div>

        {/* NO DATA */}
        {/* {Object.keys(report).length === 0 && (
          <div className="bg-white p-10 text-center rounded shadow">
            No kitchen data for this month
          </div>
        )}

       
{Object.entries(report)
  .sort(([a], [b]) => new Date(b) - new Date(a)) 
  .map(([date, kitchens]) => {
  const isOpen = openDate === date;

  return (
    <div
      key={date}
      className="bg-white rounded shadow mb-4 overflow-hidden"
    >
  
      <div
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-100"
      >
        <span className="font-semibold text-gray-800">
          {new Date(date).toDateString()}
        </span>

       
        <button
          type="button"
          style={{backgroundColor:"transparent"}}
          onClick={() => setOpenDate(isOpen ? null : date)}
          className="p-1 rounded hover:bg-gray-300 transition"
        >
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

    
      {isOpen && (
        <div className="border-t">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Kitchen</th>
                <th className="p-3 text-right">Total Qty</th>
                <th className="p-3 text-right">Dine-In</th>
                <th className="p-3 text-right">Takeaway</th>
              </tr>
            </thead>
            <tbody>
              {kitchens.map((k, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{k.kitchen}</td>
                  <td className="p-3 text-right font-semibold">
                    {k.totalQuantity}
                  </td>
                  <td className="p-3 text-right text-green-600">
                    {k.dineInQuantity}
                  </td>
                  <td className="p-3 text-right text-orange-600">
                    {k.takeawayQuantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
})} */}

{/* DAILY SECTIONS */}
{isLoading ? (
  /* 🔥 ACCORDION SKELETON */
  [...Array(10)].map((_, index) => (
    <div
      key={index}
      className="bg-white rounded shadow mb-4 overflow-hidden animate-pulse"
    >
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-100">
        <div className="h-4 bg-gray-300 rounded w-40" />
        <div className="h-5 w-5 bg-gray-300 rounded" />
      </div>

      {/* Table Skeleton */}
      <div className="border-t ">
        <table className="w-full min-w-[500px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-20" />
              </th>
              <th className="p-3 text-right">
                <div className="h-3 bg-gray-200 rounded w-16 ml-auto" />
              </th>
              <th className="p-3 text-right">
                <div className="h-3 bg-gray-200 rounded w-16 ml-auto" />
              </th>
              <th className="p-3 text-right">
                <div className="h-3 bg-gray-200 rounded w-16 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(3)].map((_, i) => (
              <tr key={i} className="border-t">
                <td className="p-3">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </td>
                <td className="p-3 text-right">
                  <div className="h-4 bg-gray-200 rounded w-10 ml-auto" />
                </td>
                <td className="p-3 text-right">
                  <div className="h-4 bg-gray-200 rounded w-10 ml-auto" />
                </td>
                <td className="p-3 text-right">
                  <div className="h-4 bg-gray-200 rounded w-10 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ))
) : Object.keys(report).length === 0 ? (
  /* 🔹 NO DATA */
  <div className="bg-white p-10 text-center rounded shadow">
    No kitchen data for this month
  </div>
) : (
  /* 🔹 REAL DATA */
  Object.entries(report)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .map(([date, kitchens]) => {
      const isOpen = openDate === date;

      return (
        <div
          key={date}
          className="bg-white rounded shadow mb-4  "
        >
          <div className="w-full flex items-center justify-between px-6 py-4 bg-gray-100">
            <span className="font-semibold text-gray-800">
              {new Date(date).toDateString()}
            </span>

            <button
              type="button"
              style={{ backgroundColor: "transparent" }}
              onClick={() => setOpenDate(isOpen ? null : date)}
              className="p-1 rounded hover:bg-gray-300 transition"
            >
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          {isOpen && (
            <div className="border-t overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Kitchen</th>
                   
                    <th className="p-3 text-right">Total Qty</th>
                    
                    <th 
                     className="p-3 text-right text-green-600">Dine-In</th>
                    <th className="p-3 text-right text-orange-600">Takeaway</th>
                     <th className="p-3 text-right text-blue-600">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {kitchens.map((k, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{k.kitchen}</td>
                    
                      <td className="p-3 text-right font-semibold">
                        {k?.totalQuantity ?? 0}
                      </td>
                      <td className="p-3 text-right text-green-600">
                        {k?.dineInQuantity ?? 0}
                      </td>
                      <td className="p-3 text-right text-orange-600">
                        {k?.takeawayQuantity ?? 0}
                      </td>
                        <td className="p-3 text-right font-semibold text-blue-600">
                     ₹{k?.totalAmount ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    })
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
        ${page === 1 ? 'opacity-50 ' : ''}
      `}
    >
      ← Previous
    </button>

    {/* PAGE NUMBERS — DESKTOP / TABLET */}
    <div style={{marginRight:"0px"}}
     className="hidden sm:flex space-x-2">
      {[...Array(data?.totalPages).keys()].map((index) => (
        <button
          key={index}
          onClick={() => handlePageChange(index + 1)}
          className={
            `px-3 py-1 rounded ${
              page === index + 1
                ? 'bg-[#ff0000] text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`
          }
        >
          {index + 1}
        </button>
      ))}
    </div>

    {/* CURRENT PAGE — MOBILE ONLY */}
    <div className="sm:hidden px-3 py-1 bg-gray-100 rounded text-sm">
      Page {page} / {data?.totalPages || 1}
    </div>

    {/* NEXT */}
    <button
      type="button"
      onClick={() => handleNextPage()}
      disabled={page === data?.totalPages || data?.totalPages === 0}
      className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
        ${
          page === data?.totalPages ||
          data?.totalPages === 0
            ? 'opacity-50 '
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

  