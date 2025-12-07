import  { useState } from 'react';
import { BarChart, Bar,  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, AlertCircle, FileText, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useGetAllSalesAndPurchasesYearWiseQuery, useGetCategoriesWiseItemCountQuery, useGetPartyWiseSalesAndPurchasesQuery, useGetTotalSalesPurchasesReceivablesPayablesProfitQuery } from '../redux/api/dashboardApi';



export default function Dashboard() {
  // const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  // 🎨 Generate consistent color for each partyId
const partyColorMap = new Map();


// 🎨 Base color palette to start cycling from
const BASE_COLORS = [
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ef4444", // Red
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#84cc16", // Lime
];

// 🌈 Generate a new color if we run out of base colors
const generateDynamicColor = (index) => {
  const hue = (index * 137.5) % 360; // golden angle → well-distributed hues
  return `hsl(${hue}, 70%, 55%)`;
};

 const generateColor = (partyId, index = 0) => {
  if (partyColorMap.has(partyId)) {
    return partyColorMap.get(partyId);
  }

  // Pick from base palette first, then generate dynamically
  const color =
    BASE_COLORS[index % BASE_COLORS.length] ||
    generateDynamicColor(index);

  partyColorMap.set(partyId, color);
  return color;
};
const generateCategoryColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360); // ensures it's within 0–360
  return `hsl(${hue}, 70%, 55%)`; // vivid, medium-light colors
};
  const[selectedYear, setSelectedYear] = useState("2025");
  const[selectedMonth, setSelectedMonth] = useState("October");
  const[selectedYearForCategory, setSelectedYearForCategory] = useState("2025");
  const[selectedYearForPartyPurchases, setSelectedYearForPartyPurchases] = useState("2025");
  const[selectedMonthForPartyPurchases, setSelectedMonthForPartyPurchases] = useState("October");

// const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
// const year="2025"

const {data: salesPurchasesProfitData} =
   useGetAllSalesAndPurchasesYearWiseQuery({year:selectedYear})
  //Calculate metrics
  
const {data: categoryWiseItemCount}
=useGetCategoriesWiseItemCountQuery({month:selectedMonth,year:selectedYearForCategory});
  console.log(selectedYear,selectedMonth);
const {data:totalSalesPurchasesReceivablesPayablesProfit}=useGetTotalSalesPurchasesReceivablesPayablesProfitQuery()
  // Item-wise analysis
  console.log(totalSalesPurchasesReceivablesPayablesProfit,"totalSalesPurchasesReceivablesPayablesProfit");
  console.log(salesPurchasesProfitData,"salesPurchasesProfitData",totalSalesPurchasesReceivablesPayablesProfit);
  //const itemAnalysis = {};
    // const profitMargin = ((totalSalesPurchasesReceivablesPayablesProfit?.profit /
    //    totalSalesPurchasesReceivablesPayablesProfit?.sales) * 100).toFixed(1);

    const profitMargin=totalSalesPurchasesReceivablesPayablesProfit?.profit
       const{data: partyWiseSalesAndPurchases} =
       useGetPartyWiseSalesAndPurchasesQuery({month:selectedMonthForPartyPurchases,year:selectedYearForPartyPurchases});
      
     






  console.log(salesPurchasesProfitData?.data,categoryWiseItemCount);
 console.log(partyWiseSalesAndPurchases,"partyWiseSalesAndPurchases",
  partyWiseSalesAndPurchases?.data,profitMargin);
 

  
const StatCard = ({ title, value, icon: Icon, color }) => {
  // ✅ Determine the route dynamically
  const lowerTitle = title.toLowerCase();
  let route = "";
  if (lowerTitle.includes("sale")) route = "/sale/all-sales";
  else if (lowerTitle.includes("purchase")) route = "/purchase/all-purchases";

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
      {title.split(/\s+/).length > 1 && (
        <NavLink
          to={route}
          className="text-xs text-gray-500 hover:text-[#4CA1AF] mt-2 transition-colors self-start"
        >
          View all {title.split(/\s+/)[1]}
        </NavLink>
      )}
    </div>
  );
};




  return (
    <>
      <div className="sb2-2-2">
          <ul >
            <li>
              <NavLink style={{display:"flex",flexDirection:"row"}}
                to="/home"
    
              >
                <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
                {/* <i className="fa fa-home mr-2" aria-hidden="true"></i> */}
                Dashboard
              </NavLink>
            </li>
    
          </ul>
        </div>
{/* <div className="max-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto"> */}
     <div className='sb2-2-3'> 
       <div className="row">
        <div className="col-md-12">
           <div className="box-inn-sp">
      {/* Header */}

      
        
          <div className="inn-title">
           
           <h4 className="text-2xl font-bold mb-2">Dashboard</h4>
              <p className="text-gray-500 mb-6">Sales & Purchase Analytics</p>
            
         
       
        </div>
     

      <div className="tab-inn">
     
          {/* <div className='flex justify-end'>
                 <select 
        style={{width:"100px"}}
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 mb-1 text-gray-700 cursor-pointer
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
          </div> */}
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Sales"
            value={totalSalesPurchasesReceivablesPayablesProfit?.total_sales || 0}
            icon={TrendingUp}
            trend="up"
            trendValue="+12.5%"
            color="bg-blue-600"
          />
          <StatCard
            title="Total Purchases"
            value={totalSalesPurchasesReceivablesPayablesProfit?.total_purchases|| 0}
            icon={ShoppingCart}
                 trend="up"
            trendValue="+12.5%"
            color="bg-purple-600"
          />
          <StatCard
            title="Receivables"
            value={totalSalesPurchasesReceivablesPayablesProfit?.total_receivables|| 0}
            icon={AlertCircle}
            color="bg-orange-600"
          />
          <StatCard
            title="Payables"
            value={totalSalesPurchasesReceivablesPayablesProfit?.total_payables || 0}
            icon={DollarSign}
            color="bg-red-600"
          />
          <StatCard
            title="Profit"
            value={totalSalesPurchasesReceivablesPayablesProfit?.profit || 0}
            icon={profitMargin > 0 ? TrendingUp : TrendingDown}
            trend={profitMargin > 0 ? 'up' : 'down'}
            trendValue={profitMargin + '%'}
            color={profitMargin > 0 ? "bg-green-600" : "bg-red-600"}
          />
        </div>

       
          <>

  {/* 📊 Bar Chart (takes 2/3 width on desktop) */}
  
<div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] mb-4 gap-6">
 <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 sm:p-6">
  <div className='flex justify-between'>
  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 mt-2 text-center sm:text-left">
    Month-wise Sales & Purchases 
  </h4>
        <select 
        style={{width:"100px"}}
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 mb-4 text-gray-700 cursor-pointer
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
  </div>
    
  <div
    className="
      w-full
      h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px]
      overflow-x-auto 
      
      rounded-lg
        select-none outline-none focus:outline-none active:outline-none
    "
  >
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        // data={salesDataMonthWise}
          data={salesPurchasesProfitData?.data || []}
        margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="month"
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
          interval={0}
        />
        <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        />
        <Legend
          wrapperStyle={{
            fontSize: "12px",
            paddingTop: "10px",
          }}
        />
        <Bar dataKey="sales" fill="#3b82f6" name="Sales" radius={[6, 6, 0, 0]} />
        <Bar
          dataKey="purchases"
          fill="#8b5cf6"
          name="Purchases"
          radius={[6, 6, 0, 0]}
        />
        {/* <Bar
          dataKey="profit"
          fill="#10b981"
          name="Profit"
          radius={[6, 6, 0, 0]}
        /> */}
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

 

  {/* 🥧 Pie Chart (1/3 width on desktop) */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 p-4 sm:p-6 flex flex-col ">
  <div className='flex justify-between '>
    <div>
  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mt-2 text-center">
 Category distribution
  </h4>
  </div>
  <div className='flex flex-col gap-2'>
        <select 
        style={{width:"100px"}}
          value={selectedYearForCategory}
          onChange={(e) => setSelectedYearForCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1  text-gray-700 cursor-pointer
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
    <select 
        style={{width:"100px"}}

            value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 mb-4 text-gray-700 cursor-pointer
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="April">April</option>
          <option value="May">May</option>
          <option value="June">June</option>
          <option value="July">July</option>
          <option value="August">August</option>
          <option value="September">September</option>
          <option value="October">October</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>
        </div>
</div>
  {categoryWiseItemCount?.data && categoryWiseItemCount?.data?.length>0 ?<div className="w-full h-[250px] sm:h-[350px] md:h-[300px]">
     <ResponsiveContainer width="100%" height="100%">
      <PieChart>
   <Pie
  data={categoryWiseItemCount?.data || []} // Fallback to demo data
  cx="50%"
  cy="50%"
  labelLine={false}
outerRadius="80%"
   dataKey="total_items"        // ✅ use total_items for slice size
      nameKey="Item_Category"      // ✅ use Item_Category for labels
  fill="#3b82f6"
  // label={({ name, percent }) =>
  //   percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
  // }
>
     {categoryWiseItemCount?.data?.map((entry, index) => (
        <Cell
          key={`cell-${index}`}
          fill={generateCategoryColor(entry.Item_Category)} // ✅ dynamically generated
        />
      ))}
</Pie>

        <Tooltip
          formatter={(value) => `${value} items`}
          labelFormatter={(label) => `Category: ${label}`}
        />


        {/* <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <p className="font-semibold text-gray-800">{data.name}</p>
                  <p className="text-sm text-blue-600">
                    Sales: ₹{data.sales.toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-600">
                    Purchases: ₹{data.purchases.toLocaleString()}
                  </p>
                  <p
                    className={`text-sm ${
                      data.profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Profit: ₹{data.profit.toLocaleString()}
                  </p>
                </div>
              );
            }
            return null;
          }}
        /> */}

        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ fontSize: "12px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>:(

      <div className="flex items-center justify-center mx-auto
       w-full h-[250px] sm:h-[350px] md:h-[300px] ">
        No category wise items data available for this month
      </div>
    )}
</div>
</div>
<div className="bg-white mb-4 rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 ">
   <div className='flex  justify-around justify-items-center'>
  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 mt-1 text-center">
    Party-wise Sales, Purchases Distribution
  </h4>
  <div className='flex flex-row gap-2'>
        <select 
        style={{width:"100px"}}
          value={selectedYearForPartyPurchases}
          onChange={(e) => setSelectedYearForPartyPurchases(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1  text-gray-700 cursor-pointer
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
    <select 
        style={{width:"100px"}}

            value={selectedMonthForPartyPurchases}
          onChange={(e) => setSelectedMonthForPartyPurchases(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 mb-4 text-gray-700 cursor-pointer
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="April">April</option>
          <option value="May">May</option>
          <option value="June">June</option>
          <option value="July">July</option>
          <option value="August">August</option>
          <option value="September">September</option>
          <option value="October">October</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>
        </div>
</div>

  {/* Responsive 1-3 column grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
    
    {/* 🟦 SALES PIE */}
 <div className="flex flex-col items-center justify-center w-full">
  <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-2 text-center">
    Sales Distribution
  </h4>

  {partyWiseSalesAndPurchases?.data && partyWiseSalesAndPurchases?.data?.length > 0 ?<div className="w-full h-[220px] sm:h-[250px] md:h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={partyWiseSalesAndPurchases?.data || []}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius="80%"
          dataKey="totalSales"
          nameKey="partyName"
        >
          {partyWiseSalesAndPurchases?.data?.map((entry, index) => (
            <Cell
              key={`sales-${entry.partyId}`}
              fill={generateColor(entry.partyId, index)}// ✅ fixed dynamic colors
            />
          ))}
        </Pie>

        <Tooltip
          formatter={(value) => `₹${value.toLocaleString()}`}
          labelFormatter={(label) => `Party: ${label}`}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>:(

      <div className="flex items-center justify-center mx-auto
       w-full h-[250px] sm:h-[350px] md:h-[300px] ">
        No party wise sales data available for this month
      </div>
  )}
</div>

{/* 🟪 PURCHASE PIE */}
<div className="flex flex-col items-center justify-center w-full">
  <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-2 text-center">
    Purchases Distribution
  </h4>
  {partyWiseSalesAndPurchases?.data && partyWiseSalesAndPurchases?.data?.length > 0 ?<div className="w-full h-[220px] sm:h-[250px] md:h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={partyWiseSalesAndPurchases?.data || []}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius="80%"
          dataKey="totalPurchases"
          nameKey="partyName"
        >
          {partyWiseSalesAndPurchases?.data?.map((entry, index) => (
            <Cell
              key={`purchase-${entry.partyId}`}
              fill={generateColor(entry.partyId, index)} // ✅ consistent color mapping
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => `₹${value.toLocaleString()}`}
          labelFormatter={(label) => `Party: ${label}`}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>:(
        <div className="flex items-center justify-center mx-auto
       w-full h-[250px] sm:h-[350px] md:h-[300px] ">
        No party wise sales data available for this month
      </div>
  )}
</div>
{/* 

    <div className="flex flex-col items-center justify-center w-full">
      <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-2 text-center">
        Profit Distribution by Party
      </h4>
      <div className="w-full h-[220px] sm:h-[250px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={partyWiseData.map((party) => ({
                ...party,
                profit: Math.max(party.profit, 0), // ✅ No negative slices
              }))}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius="80%"
              dataKey="profit"
              nameKey="name"
            >
              {partyWiseData.map((entry, index) => (
                <Cell
                  key={`party-${index}`}
                  fill={entry.profit > 0 ? COLORS[index % COLORS.length] : "#d1d5db"}
                />
              ))}
            </Pie>

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <p className="font-semibold text-gray-800">{data.name}</p>
                      <p className="text-sm text-green-600">
                        Profit: ₹{Math.max(data.profit, 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-blue-600">
                        Sales: ₹{data.sales.toLocaleString()}
                      </p>
                      <p className="text-sm text-purple-600">
                        Purchases: ₹{data.purchases.toLocaleString()}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

     
     
    </div>

<div className="flex flex-col items-center justify-center w-full mt-6">
  <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-2 text-center">
    Loss Distribution by Party
  </h4>
  <div className="w-full h-[220px] sm:h-[250px] md:h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={partyWiseData.map((party) => ({
            ...party,
            loss: Math.max(-party.profit, 0), // ✅ Convert negative profits to positive loss values
          }))}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius="80%"
          dataKey="loss"
          nameKey="name"
        >
          {partyWiseData.map((entry, index) => (
            <Cell
              key={`loss-${index}`}
              fill={entry.profit < 0 ? "#f87171": "#d1d5db"}
            />
          ))}
        </Pie>

        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <p className="font-semibold text-gray-800">{data.name}</p>
                  <p className="text-sm text-red-600">
                    Loss: ₹{Math.max(-data.profit, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-600">
                    Sales: ₹{data.sales.toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-600">
                    Purchases: ₹{data.purchases.toLocaleString()}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>



</div> */}

  </div>
   <div className="mt-6 flex overflow-x-auto justify-center align-center space-x-4 pb-2">
  {partyWiseSalesAndPurchases?.data?.map((party, index) => (
    <div key={party.partyName} className="flex items-center space-x-2 flex-shrink-0">
      <span
        className="w-4 h-4 rounded-full"
        // style={{ backgroundColor: COLORS[index % COLORS.length] }}
        style={{backgroundColor: generateColor(party.partyId, index)}}
      ></span>
      <span className="text-gray-700 text-sm">{party.partyName}</span>
    </div>
  ))}
</div>
</div>

 



{/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 col-span-1 lg:col-span-2">
    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 text-center lg:text-left">
     Party Wise Analysis
    </h3>

    <div className="max-w-full overflow-x-auto h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={partyWiseData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} interval={0} />
          <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Bar dataKey="sales" fill="#3b82f6" name="Sales" radius={[6, 6, 0, 0]} />
          <Bar dataKey="purchases" fill="#8b5cf6" name="Purchases" radius={[6, 6, 0, 0]} />
          <Bar dataKey="profit" fill="#10b981" name="Profit" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div> */}





            {/* Product Performance Table */}
     {/* Product Performance Table */}
{/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 
                overflow-y-auto overflow-x-auto
               p-4 sm:p-6
                w-full">
  <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Product Performance</h3>
  </div>

  <div className="min-w-full">
    <table className="w-full text-sm sm:text-base">
      <thead className="bg-gray-50 sticky top-[57px] sm:top-[65px] z-10">
        <tr>
          <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Product</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Sold Qty</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Sales Revenue</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Purchase Cost</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Profit</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Margin</th>
        </tr>
      </thead>

      <tbody className="bg-white divide-y divide-gray-200">
        {Object.values(itemAnalysis).map((item, idx) => {
          const profit = item.soldAmount - item.purchasedAmount;
          const margin = item.soldAmount > 0 ? ((profit / item.soldAmount) * 100).toFixed(1) : 0;

          return (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-3 text-sm text-gray-700">{item.soldQty}</td>
              <td className="px-4 sm:px-6 py-3 text-sm font-medium text-gray-900">₹{item.soldAmount.toLocaleString()}</td>
              <td className="px-4 sm:px-6 py-3 text-sm text-gray-700">₹{item.purchasedAmount.toLocaleString()}</td>
              <td className="px-4 sm:px-6 py-3">
                <span className={`text-sm font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{profit.toLocaleString()}
                </span>
              </td>
              <td className="px-4 sm:px-6 py-3">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                  margin >= 20 ? 'bg-green-100 text-green-800' : 
                  margin >= 10 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {margin}%
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div> */}

          </>
       

        {/* {activeTab === 'sales' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Sales Invoices</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesData.map((sale, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{sale.Invoice_Number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{sale.Party_Name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{sale.Invoice_Date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{sale.Total_Amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">₹{sale.Total_Received.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          sale.Balance_Due === 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          ₹{sale.Balance_Due.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Purchase Bills</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchaseData.map((purchase, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-purple-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{purchase.Bill_Number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{purchase.Party_Name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{purchase.Bill_Date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{purchase.Total_Amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">₹{purchase.Total_Paid.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          purchase.Balance_Due === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          ₹{purchase.Balance_Due.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )} */}
      </div>
      </div>
      </div>
    </div>
    </div>
    </>
  );
}

