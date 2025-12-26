import  { useState } from 'react';

import { TrendingUp,  Armchair, Handbag, CalendarDays, Filter, X, ChefHat } from 'lucide-react';

import {  
  useGetItemsSoldEachDayQuery,
    useGetTotalSalesPurchasesReceivablesPayablesProfitQuery } from '../redux/api/dashboardApi';

import { useTotalInvoicesEachDayQuery } from '../redux/api/Staff/orderApi';
import { toast } from 'react-toastify';



// export default function Dashboard() {
//   // const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
//   // 🎨 Generate consistent color for each partyId
// //const partyColorMap = new Map();


// // 🎨 Base color palette to start cycling from
// const BASE_COLORS = [
//   "#3b82f6", // Blue
//   "#8b5cf6", // Purple
//   "#ef4444", // Red
//   "#10b981", // Green
//   "#f59e0b", // Amber
//   "#ec4899", // Pink
//   "#6366f1", // Indigo
//   "#14b8a6", // Teal
//   "#f97316", // Orange
//   "#84cc16", // Lime
// ];

// // 🌈 Generate a new color if we run out of base colors
// // const generateDynamicColor = (index) => {
// //   const hue = (index * 137.5) % 360; // golden angle → well-distributed hues
// //   return `hsl(${hue}, 70%, 55%)`;
// // };

// //  const generateColor = (partyId, index = 0) => {
// //   if (partyColorMap.has(partyId)) {
// //     return partyColorMap.get(partyId);
// //   }

// //   // Pick from base palette first, then generate dynamically
// //   const color =
// //     BASE_COLORS[index % BASE_COLORS.length] ||
// //     generateDynamicColor(index);

// //   partyColorMap.set(partyId, color);
// //   return color;
// // };
// // const generateCategoryColor = (str) => {
// //   let hash = 0;
// //   for (let i = 0; i < str.length; i++) {
// //     hash = str.charCodeAt(i) + ((hash << 5) - hash);
// //   }
// //   const hue = Math.abs(hash % 360); // ensures it's within 0–360
// //   return `hsl(${hue}, 70%, 55%)`; // vivid, medium-light colors
// // };
//   const[selectedYear, setSelectedYear] = useState("2025");
//  // const[selectedMonth, setSelectedMonth] = useState("October");
//   //const[selectedYearForCategory, setSelectedYearForCategory] = useState("2025");
//   //const[selectedYearForPartyPurchases, setSelectedYearForPartyPurchases] = useState("2025");
//   //const[selectedMonthForPartyPurchases, setSelectedMonthForPartyPurchases] = useState("October");

// // const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
// // const year="2025"

// const {data: salesPurchasesProfitData} =
//    useGetAllSalesAndPurchasesYearWiseQuery({year:selectedYear})
//   //Calculate metrics
  
// //const {data: categoryWiseItemCount}=useGetCategoriesWiseItemCountQuery({month:selectedMonth,year:selectedYearForCategory});
//   console.log(selectedYear);
// const {data:totalSalesPurchasesReceivablesPayablesProfit}=useGetTotalSalesPurchasesReceivablesPayablesProfitQuery()
//   // Item-wise analysis
//   console.log(totalSalesPurchasesReceivablesPayablesProfit,"totalSalesPurchasesReceivablesPayablesProfit");
//   console.log(salesPurchasesProfitData,"salesPurchasesProfitData",totalSalesPurchasesReceivablesPayablesProfit);
//   //const itemAnalysis = {};
//     // const profitMargin = ((totalSalesPurchasesReceivablesPayablesProfit?.profit /
//     //    totalSalesPurchasesReceivablesPayablesProfit?.sales) * 100).toFixed(1);

//     const profitMargin=totalSalesPurchasesReceivablesPayablesProfit?.profit
//       //  const{data: partyWiseSalesAndPurchases} =
//       //  useGetPartyWiseSalesAndPurchasesQuery({month:selectedMonthForPartyPurchases,year:selectedYearForPartyPurchases});
      
     






//   //console.log(salesPurchasesProfitData?.data,categoryWiseItemCount);
// //  console.log(partyWiseSalesAndPurchases,"partyWiseSalesAndPurchases",
// //   partyWiseSalesAndPurchases?.data,profitMargin);
 

  
// const StatCard = ({ title, value, icon: Icon, color }) => {
//   // ✅ Determine the route dynamically
//   const lowerTitle = title.toLowerCase();
//   let route = "";
//   if (lowerTitle.includes("sale")) route = "/order/all-orders";
//   else if (lowerTitle.includes("purchase")) route = "/inventory/all-inventories";

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
//       {title.split(/\s+/).length > 1 && (
//         <NavLink
//           to={route}
//           className="text-xs text-gray-500 hover:text-[#ff0000] mt-2 transition-colors self-start"
//         >
//           View all {title.split(/\s+/)[1]}
//         </NavLink>
//       )}
//     </div>
//   );
// };

// const DineTakeawayStatCard = ({ title, value, icon: Icon, color }) => {
//   // ✅ Determine the route dynamically
//   // const lowerTitle = title.toLowerCase();
//   // let route = "";
//   // if (lowerTitle.includes("sale")) route = "/sale/all-sales";
//   // else if (lowerTitle.includes("purchase")) route = "/purchase/all-purchases";

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



//   return (
//     <>
//       {/* <div className="sb2-2-2">
//           <ul >
//             <li>
//               <NavLink style={{display:"flex",flexDirection:"row"}}
//                 to="/home"
    
//               >
//                 <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
             
//                 Dashboard
//               </NavLink>
//             </li>
    
//           </ul>
//         </div> */}
// {/* <div className="max-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto"> */}
   
//            <div >
//       {/* Header */}

      
        
//           <div className="inn-title ">
           
//            <h4 className="text-2xl font-bold mb-2">Dashboard</h4>
//               <p className="text-gray-500 mb-6">Sales & Purchase Analytics</p>
            
         
       
//         </div>
     

//       <div style={{backgroundColor:"white"}} className="tab-inn ">
     
//           {/* <div className='flex justify-end'>
//                  <select 
//         style={{width:"100px"}}
//           value={selectedYear}
//           onChange={(e) => setSelectedYear(e.target.value)}
//           className="border border-gray-300 rounded-md px-3 py-1 mb-1 text-gray-700 cursor-pointer
//            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//         >
//           <option value="2023">2023</option>
//           <option value="2024">2024</option>
//           <option value="2025">2025</option>
//           <option value="2026">2026</option>
//         </select>
//           </div> */}
//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
//           <StatCard
//             title="Total Sales"
//             value={totalSalesPurchasesReceivablesPayablesProfit?.total_sales || 0}
//             icon={TrendingUp}
//             trend="up"
//             trendValue="+12.5%"
//             color="bg-blue-600"
//           />
//           <StatCard
//             title="Total Purchases"
//             value={totalSalesPurchasesReceivablesPayablesProfit?.total_purchases|| 0}
//             icon={ShoppingCart}
//                  trend="up"
//             trendValue="+12.5%"
//             color="bg-purple-600"
//           />
//           <DineTakeawayStatCard
//             title="Orders(Dine-In)"
//             value={totalSalesPurchasesReceivablesPayablesProfit?.total_dineIn?? 0}
//             icon={Armchair}
//             color="bg-orange-600"
//           />
//           <DineTakeawayStatCard
//             title="Orders(Takeaway)"
//             value={totalSalesPurchasesReceivablesPayablesProfit?.total_takeaway ?? 0}
//             icon={Handbag}
//             color="bg-red-600"
//           />
//           <StatCard
//             title="Profit"
//             value={totalSalesPurchasesReceivablesPayablesProfit?.profit || 0}
//             icon={profitMargin > 0 ? TrendingUp : TrendingDown}
//             trend={profitMargin > 0 ? 'up' : 'down'}
//             trendValue={profitMargin + '%'}
//             color={profitMargin > 0 ? "bg-green-600" : "bg-red-600"}
//           />
//         </div>

       
//           <>

//   {/* 📊 Bar Chart (takes 2/3 width on desktop) */}
  
// <div className="grid grid-cols-1 lg:grid-cols-1 mb-4 gap-6">
//  <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 sm:p-6">
//   <div className='flex justify-between'>
//   <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 mt-2 text-center sm:text-left">
//     Month-wise Sales & Purchases 
//   </h4>
//         <select 
//         style={{width:"100px"}}
//           value={selectedYear}
//           onChange={(e) => setSelectedYear(e.target.value)}
//           className="border border-gray-300 rounded-md px-3 py-1 mb-4 text-gray-700 cursor-pointer
//            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//         >
//           <option value="2023">2023</option>
//           <option value="2024">2024</option>
//           <option value="2025">2025</option>
//           <option value="2026">2026</option>
//         </select>
//   </div>
    
//   <div
//     className="
//       w-full
//        h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px]
//       overflow-x-auto 
      
//       rounded-lg
//         select-none outline-none focus:outline-none active:outline-none
//     "
//   >
//     <ResponsiveContainer width="100%" height="100%">
//       <BarChart
//         // data={salesDataMonthWise}
//           data={salesPurchasesProfitData?.data || []}
//         margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
//       >
//         <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//         <XAxis
//           dataKey="month"
//           stroke="#6b7280"
//           tick={{ fontSize: 12 }}
//           interval={0}
//         />
//         <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
//         <Tooltip
//           contentStyle={{
//             backgroundColor: "#fff",
//             border: "1px solid #e5e7eb",
//             borderRadius: "8px",
//             fontSize: "13px",
//           }}
//         />
//         <Legend
//           wrapperStyle={{
//             fontSize: "12px",
//             paddingTop: "10px",
//           }}
//         />
//         <Bar dataKey="sales" fill="green" name="Sales" radius={[6, 6, 0, 0]} />
//         <Bar
//           dataKey="purchases"
//           fill="red"
//           name="Purchases"
//           radius={[6, 6, 0, 0]}
//         />
//         {/* <Bar
//           dataKey="profit"
//           fill="#10b981"
//           name="Profit"
//           radius={[6, 6, 0, 0]}
//         /> */}
//       </BarChart>
//     </ResponsiveContainer>
//   </div>
// </div>

 

//   {/* 🥧 Pie Chart (1/3 width on desktop) */}
//  {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 p-4 sm:p-6 flex flex-col ">
//   <div className='flex justify-between '>
//     <div>
//   <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mt-2 text-center">
//  Category distribution
//   </h4>
//   </div>
//   <div className='flex flex-col gap-2'>
//         <select 
//         style={{width:"100px"}}
//           value={selectedYearForCategory}
//           onChange={(e) => setSelectedYearForCategory(e.target.value)}
//           className="border border-gray-300 rounded-md px-3 py-1  text-gray-700 cursor-pointer
//            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//         >
//           <option value="2023">2023</option>
//           <option value="2024">2024</option>
//           <option value="2025">2025</option>
//           <option value="2026">2026</option>
//         </select>
//     <select 
//         style={{width:"100px"}}

//             value={selectedMonth}
//           onChange={(e) => setSelectedMonth(e.target.value)}
//           className="border border-gray-300 rounded-md px-2 py-1 mb-4 text-gray-700 cursor-pointer
//            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//         >
//           <option value="January">January</option>
//           <option value="February">February</option>
//           <option value="March">March</option>
//           <option value="April">April</option>
//           <option value="May">May</option>
//           <option value="June">June</option>
//           <option value="July">July</option>
//           <option value="August">August</option>
//           <option value="September">September</option>
//           <option value="October">October</option>
//           <option value="November">November</option>
//           <option value="December">December</option>
//         </select>
//         </div>
// </div>
//   {categoryWiseItemCount?.data && categoryWiseItemCount?.data?.length>0 ?<div className="w-full h-[250px] sm:h-[350px] md:h-[300px]">
//      <ResponsiveContainer width="100%" height="100%">
//       <PieChart>
//    <Pie
//   data={categoryWiseItemCount?.data || []} // Fallback to demo data
//   cx="50%"
//   cy="50%"
//   labelLine={false}
// outerRadius="80%"
//    dataKey="total_items"        // ✅ use total_items for slice size
//       nameKey="Item_Category"      // ✅ use Item_Category for labels
//   fill="#3b82f6"
//   // label={({ name, percent }) =>
//   //   percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
//   // }
// >
//      {categoryWiseItemCount?.data?.map((entry, index) => (
//         <Cell
//           key={`cell-${index}`}
//           fill={generateCategoryColor(entry.Item_Category)} // ✅ dynamically generated
//         />
//       ))}
// </Pie>

//         <Tooltip
//           formatter={(value) => `${value} items`}
//           labelFormatter={(label) => `Category: ${label}`}
//         />


//         {/* <Tooltip
//           content={({ active, payload }) => {
//             if (active && payload && payload.length) {
//               const data = payload[0].payload;
//               return (
//                 <div
//                   style={{
//                     background: "#fff",
//                     border: "1px solid #e5e7eb",
//                     borderRadius: "8px",
//                     padding: "8px 12px",
//                     boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//                   }}
//                 >
//                   <p className="font-semibold text-gray-800">{data.name}</p>
//                   <p className="text-sm text-blue-600">
//                     Sales: ₹{data.sales.toLocaleString()}
//                   </p>
//                   <p className="text-sm text-purple-600">
//                     Purchases: ₹{data.purchases.toLocaleString()}
//                   </p>
//                   <p
//                     className={`text-sm ${
//                       data.profit >= 0 ? "text-green-600" : "text-red-600"
//                     }`}
//                   >
//                     Profit: ₹{data.profit.toLocaleString()}
//                   </p>
//                 </div>
//               );
//             }
//             return null;
//           }}
//         /> 

//         <Legend
//           verticalAlign="bottom"
//           height={36}
//           wrapperStyle={{ fontSize: "12px" }}
//         />
//       </PieChart>
//     </ResponsiveContainer>
//   </div>:(

//       <div className="flex items-center justify-center mx-auto
//        w-full h-[250px] sm:h-[350px] md:h-[300px] ">
//         No category wise items data available for this month
//       </div>
//     )}
// </div> */}
// </div>
// {/* <div className="bg-white mb-4 rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 ">
//    <div className='flex  justify-around justify-items-center'>
//   <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 mt-1 text-center">
//     Party-wise Sales, Purchases Distribution
//   </h4>
//   <div className='flex flex-row gap-2'>
//         <select 
//         style={{width:"100px"}}
//           value={selectedYearForPartyPurchases}
//           onChange={(e) => setSelectedYearForPartyPurchases(e.target.value)}
//           className="border border-gray-300 rounded-md px-3 py-1  text-gray-700 cursor-pointer
//            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//         >
//           <option value="2023">2023</option>
//           <option value="2024">2024</option>
//           <option value="2025">2025</option>
//           <option value="2026">2026</option>
//         </select>
//     <select 
//         style={{width:"100px"}}

//             value={selectedMonthForPartyPurchases}
//           onChange={(e) => setSelectedMonthForPartyPurchases(e.target.value)}
//           className="border border-gray-300 rounded-md px-2 py-1 mb-4 text-gray-700 cursor-pointer
//            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//         >
//           <option value="January">January</option>
//           <option value="February">February</option>
//           <option value="March">March</option>
//           <option value="April">April</option>
//           <option value="May">May</option>
//           <option value="June">June</option>
//           <option value="July">July</option>
//           <option value="August">August</option>
//           <option value="September">September</option>
//           <option value="October">October</option>
//           <option value="November">November</option>
//           <option value="December">December</option>
//         </select>
//         </div>
// </div>

  
//   {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
    
    
//  <div className="flex flex-col items-center justify-center w-full">
//   <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-2 text-center">
//     Sales Distribution
//   </h4>

//   {partyWiseSalesAndPurchases?.data && partyWiseSalesAndPurchases?.data?.length > 0 ?<div className="w-full h-[220px] sm:h-[250px] md:h-[300px]">
//     <ResponsiveContainer width="100%" height="100%">
//       <PieChart>
//         <Pie
//           data={partyWiseSalesAndPurchases?.data || []}
//           cx="50%"
//           cy="50%"
//           labelLine={false}
//           outerRadius="80%"
//           dataKey="totalSales"
//           nameKey="partyName"
//         >
//           {partyWiseSalesAndPurchases?.data?.map((entry, index) => (
//             <Cell
//               key={`sales-${entry.partyId}`}
//               fill={generateColor(entry.partyId, index)}// ✅ fixed dynamic colors
//             />
//           ))}
//         </Pie>

//         <Tooltip
//           formatter={(value) => `₹${value.toLocaleString()}`}
//           labelFormatter={(label) => `Party: ${label}`}
//         />
//       </PieChart>
//     </ResponsiveContainer>
//   </div>:(

//       <div className="flex items-center justify-center mx-auto
//        w-full h-[250px] sm:h-[350px] md:h-[300px] ">
//         No party wise sales data available for this month
//       </div>
//   )}
// </div>


// <div className="flex flex-col items-center justify-center w-full">
//   <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-2 text-center">
//     Purchases Distribution
//   </h4>
//   {partyWiseSalesAndPurchases?.data && partyWiseSalesAndPurchases?.data?.length > 0 ?<div className="w-full h-[220px] sm:h-[250px] md:h-[300px]">
//     <ResponsiveContainer width="100%" height="100%">
//       <PieChart>
//         <Pie
//           data={partyWiseSalesAndPurchases?.data || []}
//           cx="50%"
//           cy="50%"
//           labelLine={false}
//           outerRadius="80%"
//           dataKey="totalPurchases"
//           nameKey="partyName"
//         >
//           {partyWiseSalesAndPurchases?.data?.map((entry, index) => (
//             <Cell
//               key={`purchase-${entry.partyId}`}
//               fill={generateColor(entry.partyId, index)} // ✅ consistent color mapping
//             />
//           ))}
//         </Pie>
//         <Tooltip
//           formatter={(value) => `₹${value.toLocaleString()}`}
//           labelFormatter={(label) => `Party: ${label}`}
//         />
//       </PieChart>
//     </ResponsiveContainer>
//   </div>:(
//         <div className="flex items-center justify-center mx-auto
//        w-full h-[250px] sm:h-[350px] md:h-[300px] ">
//         No party wise sales data available for this month
//       </div>
//   )}
// </div>

//   </div>
//    <div className="mt-6 flex overflow-x-auto justify-center align-center space-x-4 pb-2">
//   {partyWiseSalesAndPurchases?.data?.map((party, index) => (
//     <div key={party.partyName} className="flex items-center space-x-2 flex-shrink-0">
//       <span
//         className="w-4 h-4 rounded-full"
//         // style={{ backgroundColor: COLORS[index % COLORS.length] }}
//         style={{backgroundColor: generateColor(party.partyId, index)}}
//       ></span>
//       <span className="text-gray-700 text-sm">{party.partyName}</span>
//     </div>
//   ))}
// </div> 
// </div> */}

 







          
//           </>
       

        
//       </div>
//       </div>
    
//     </>
//   );
// }

export default function Dashboard() {

  // const {user}=useSelector((state)=>state.user)
  // const today = new Date().toISOString().split("T")[0];
 const today = new Date().toLocaleDateString("en-CA");

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

const{data:itemsSoldEachDay}=useGetItemsSoldEachDayQuery(selectedDate)
const topSellingItems = itemsSoldEachDay?.data ?? [];
console.log(itemsSoldEachDay,"itemsSoldEachDay");
// const {data: salesPurchasesProfitData} =
//    useGetAllSalesAndPurchasesYearWiseQuery({year:selectedYear})
 
  //console.log(selectedYear);
const {data:totalSalesPurchasesReceivablesPayablesProfit}=
useGetTotalSalesPurchasesReceivablesPayablesProfitQuery(selectedDate)
  // Item-wise analysis
  console.log(totalSalesPurchasesReceivablesPayablesProfit,
    "totalSalesPurchasesReceivablesPayablesProfit");



    // const profitMargin=totalSalesPurchasesReceivablesPayablesProfit?.profit
     
     
//  const topSellingItems = [
//     { name: 'Chicken Biryani', qtySold: 120, revenue: 24000, contribution: 18 },
//     { name: 'Butter Chicken', qtySold: 95, revenue: 18050, contribution: 14 },
//     { name: 'Paneer Tikka', qtySold: 90, revenue: 13500, contribution: 10 },
//     { name: 'Dal Makhani', qtySold: 85, revenue: 10200, contribution: 8 },
//     { name: 'Tandoori Roti', qtySold: 280, revenue: 8400, contribution: 6 }
//   ];





  
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
              Cancelled Takeaways: {cancelledTakeawayInvoices}
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
                  {topSellingItems && topSellingItems?.map((item, idx) => (
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
                  ))}
                </tbody>
              </table>
            </div> */}
                      </div>
             {/* Header with month and nav */}
           
 
                 {/* <div className="tab-inn border-b border-gray-200">
         
          </div> */}
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
