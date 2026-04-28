


import { useGetItemsSoldDailyCategoryWiseAnalysisQuery, 
  useGetTotalSalesDineInTakeawayDailyAnalysisQuery, 
  useGetTotalSalesDineInTakeawayMonthlyAnalysisQuery,
   useGetTotalSalesDineInTakeawayWeeklyAnalysisQuery, 
   useGetTotalSalesDineInTakeawayYearlyAnalysisQuery } from "../redux/api/reportApi";
import {  useMemo, useState } from "react";

import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList} from 'recharts';
const formatCount = (value) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value;
};
import { useGetAllCategoriesQuery } from "../redux/api/itemApi";
export default function SalesDineInTakeawayReport() {
  const months = [
  { label: "January", value: "january" },
  { label: "February", value: "february" },
  { label: "March", value: "march" },
  { label: "April", value: "april" },
  { label: "May", value: "may" },
  { label: "June", value: "june" },
  { label: "July", value: "july" },
  { label: "August", value: "august" },
  { label: "September", value: "september" },
  { label: "October", value: "october" },
  { label: "November", value: "november" },
  { label: "December", value: "december" },
];

const years=[
  
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
  { label: "2028", value: "2028" },
  { label: "2029", value: "2029" },
  { label: "2030", value: "2030" },
]
const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
const now = new Date();
const currentMonthName = MONTHS[now.getMonth()]; // 👈 0-based
const currentYear = String(now.getFullYear());
const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
const[selectedYear, setSelectedYear] = useState(currentYear);
  const [timeFrame, setTimeFrame] = useState("daily");
  const { data: categories } = useGetAllCategoriesQuery()    
 
 console.log("categories:", categories)
// const year="2026"
// const month="january"
const {
  data: dailyData,
  // isLoading: dailyLoading,
} = useGetTotalSalesDineInTakeawayDailyAnalysisQuery(
  { year: selectedYear, month: selectedMonth },
  { skip: timeFrame !== "daily" }
);
;
const {
  data: weeklyData,
  // isLoading: weeklyLoading,
} = useGetTotalSalesDineInTakeawayWeeklyAnalysisQuery(
  { year: selectedYear, month: selectedMonth },
  { skip: timeFrame !== "weekly" }
);

const {
  data: monthlyData,
  // isLoading: monthlyLoading,
} = useGetTotalSalesDineInTakeawayMonthlyAnalysisQuery(
  { year: selectedYear },
  { skip: timeFrame !== "monthly" }
);
const {
  data: yearlyData,
  // isLoading: yearlyLoading,
} = useGetTotalSalesDineInTakeawayYearlyAnalysisQuery(
  {},
  { skip: timeFrame !== "yearly" }
);
const chartData = useMemo(() => {
  switch (timeFrame) {
    case "daily":
      return dailyData?.data ?? [];

    case "weekly":
      return weeklyData?.data ?? [];

    case "monthly":
      return monthlyData?.data ?? [];

    case "yearly":
      return yearlyData?.data ?? [];

    default:
      return [];
  }
}, [timeFrame, dailyData, weeklyData, monthlyData, yearlyData]);

const{data:itemsSoldCategoryWiseData}=useGetItemsSoldDailyCategoryWiseAnalysisQuery({
  year:selectedYear,
  month:selectedMonth
})
const apiData = itemsSoldCategoryWiseData?.data ?? [];
console.log(apiData)
const categoryWiseData = apiData.map(d => {
  const row = { day: d.day };

  d.categories.forEach(c => {
    row[c.category] = c.total_sales;
  });

  return row;
});
console.log("categoryWiseData:", categoryWiseData);
const hasData = Array.isArray(chartData) && chartData.length > 0;
// const safeChartData = useMemo(() => {
//   if (!Array.isArray(chartData)) return [];

//   return chartData.map(d => ({
//     ...d,
//     dineIn: Number(d.dineIn || 0),
//     takeaway: Number(d.takeaway || 0),
//     total_sales: Number(d.total_sales || 0),
//   }));
// }, [chartData]);
// const categoryNames = useMemo(() => {
//   if (!Array.isArray(categories)) return [];

//   return categories.map(c => c.Item_Category);
// }, [categories]);

  console.log(dailyData, weeklyData,chartData);

  // const currentData = salesDineInTakeawayDailyAnalysis[timeFrame];
// const chartData =
//   dailyData?.data ?? [];

  // const totalSales = currentData.reduce((s, i) => s + i.total_sales, 0);
  // const totalDineIn = currentData.reduce((s, i) => s + i.dineIn, 0);
  // const totalTakeaway = currentData.reduce((s, i) => s + i.takeaway, 0);
  // const avgSales = Math.round(totalSales / currentData.length);

  // const labels = currentData.map((row) =>
  //   row[timeFrame === "daily" ? "date" : timeFrame === "weekly" ? "week" : timeFrame === "monthly" ? "month" : "year"]
  // );
  // const labels = chartData.map(d => d.date);
// const labels = useMemo(() => {
//   if (!safeChartData.length) return [];

//   if (timeFrame === "daily") return safeChartData.map(d => d.date);
//   if (timeFrame === "weekly") return safeChartData.map(d => d.week);
//   if (timeFrame === "monthly") return safeChartData.map(d => d.month);
//   if (timeFrame === "yearly") return safeChartData.map(d => d.year);

//   return [];
// }, [safeChartData, timeFrame]);

// const totalDineIn = chartData.reduce(
//   (sum, d) => sum + (d.dineIn || 0),
//   0
// );

// const totalTakeaway = chartData.reduce(
//   (sum, d) => sum + (d.takeaway || 0),
//   0
// );

// const totalSales=chartData.reduce(
  
// )
// const totalSales=chartData.to
  /* ================= SALES AREA CHART ================= */
  // const salesChart = useMemo(() => ({
  //   options: {
  //     chart: { type: "area", toolbar: { show: false } },
  //     // xaxis: { categories: labels },
  //     colors: ["#3b82f6"],
  //     dataLabels: { enabled: false },
  //     stroke: { curve: "smooth", width: 3 },
  //     fill: {
  //       type: "gradient",
  //       gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 },
  //     },
  //     tooltip: { theme: "dark" },
  //   },
  //   series: [{ name: "Total Sales", data: currentData.map(d => d.total_sales) }],
  // }), [timeFrame]);
// const salesChart = useMemo(() => ({
//   options: {
//     chart: {
//       type: "area",
//       toolbar: { show: false },
//       zoom: { enabled: false },        // 🚫 no zoom
//       selection: { enabled: false },   // 🚫 no drag select
//     },

//     xaxis: {
//       categories: safeChartData.map(d => d.date),
//       labels: { rotate: -45 },
//     },

//     colors: ["#3b82f6"],

//     dataLabels: { enabled: false },

//     stroke: {
//       curve: "smooth",
//       width: 3,
//     },

//     fill: {
//       type: "gradient",
//       gradient: {
//         shadeIntensity: 1,
//         opacityFrom: 0.4,
//         opacityTo: 0.1,
//       },
//     },

//     tooltip: {
//       theme: "dark",
//     },
//   },

//   series: [
//     {
//       name: "Total Sales",
//       data: safeChartData.map(d => d.total_sales),
//     },
//   ],
// }), [safeChartData]);


  /* ================= PIE CHART ================= */
  // const pieChart = {
  //   options: {
  //     labels: ["Dine-In", "Takeaway"],
  //     colors: ["#3b82f6", "#10b981"],
  //     legend: { position: "bottom" },
  //   },
  //   series: [totalDineIn, totalTakeaway],
  // };
// const pieChart = {
//   options: {
//     labels: ["Dine-In", "Takeaway"],
//     colors: ["#3b82f6", "#10b981"],
//     legend: { position: "bottom" },
//     tooltip: {
//       y: {
//         formatter: (val) => `${val} Orders`,
//       },
//     },
//   },
//   series: [totalDineIn, totalTakeaway],
// };

  /* ================= BAR CHART ================= */
  // const barChart = {
  //   options: {
  //     chart: { type: "bar" },
  //     plotOptions: { bar: { borderRadius: 6, columnWidth: "45%" } },
  //     xaxis: { categories: labels },
  //     colors: ["#3b82f6", "#10b981"],
  //     tooltip: { theme: "dark" },
  //   },
  //   series: [
  //     { name: "Dine-In", data: currentData.map(d => d.dineIn) },
  //     { name: "Takeaway", data: currentData.map(d => d.takeaway) },
  //   ],
  // };
//   const barChart = {
//   options: {
//     chart: { type: "bar", toolbar: { show: false } },
//     plotOptions: {
//       bar: {
//         borderRadius: 6,
//         columnWidth: "45%",
//       },
//     },
//      xaxis: { categories: labels },
//     // xaxis: {
//     //   categories: labels,
//     //   labels: { rotate: -45 },
//     // },
//     colors: ["#3b82f6", "#10b981"],
//     tooltip: { theme: "dark" },
//      legend: {
//       position: "bottom",
//       horizontalAlign: "center",
//       markers: {
//         radius: 12,
//       },
//       itemMargin: {
//         horizontal: 10,
//         vertical: 8,
//       },
//     }
//   },
//   series: [
//     {
//       name: "Dine-In",
//       data: chartData.map(d => d.dineIn),
//     },
//     {
//       name: "Takeaway",
//       data: chartData.map(d => d.takeaway),
//     },
//   ],
// };
// const barChart = {
//   options: {
//     chart: { type: "bar", toolbar: { show: false } },
//     plotOptions: {
//       bar: {
//         borderRadius: 6,
//         columnWidth: "45%",
//       },
//     },
//     xaxis: {
//       categories: labels,
//       labels: { rotate: -30 },
//     },
//     colors: ["#10b981", "#3b82f6"],
//     tooltip: { theme: "dark" },
//     legend: {
//       position: "bottom",
//       horizontalAlign: "center",
//     },
//   },
//   series: [
//     {
//       name: "Dine-In",
//       data: safeChartData.map(d => d.dineIn),
//     },
//     {
//       name: "Takeaway",
//       data: safeChartData.map(d => d.takeaway),
//     },
//   ],
// };
const formatCount = (value) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value;
};
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const dayData = apiData.find(d => d.day === label);

  return (
    <div className="bg-white p-3 shadow rounded">
      <strong>Day {label}</strong>

      {dayData.categories.map(cat => (
        <div key={cat.category}>
          <b>{cat.category}</b>
          {cat.items.map(it => (
            <div key={it.name} className="text-sm">
              {it.name} × {it.qty} — ₹{it.amount}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
];

const formatCurrency = (value) => {
  if (value >= 1e7) return `${(value / 1e7).toFixed(2)} Cr`;
  if (value >= 1e5) return `${(value / 1e5).toFixed(2)} L`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)} K`;
  return value;
};
const NoData = ({ text = "No data available" }) => (
  <div className="flex items-center justify-center h-[300px] text-gray-500 text-lg">
    {text}
  </div>
);


  return (
    <div className="min-h-screen bg-white  p-6">
      <div className="flex flex-col justify-center items-center mb-2 sm:flex-row
       sm:justify-between">
      <h1 className=" text-2xl whitespace-nowrap sm:text-3xl sm:font-bold ">Sales Analytics Dashboard</h1>
      
  <div className="flex justify-center items-center gap-2" >
       {  (timeFrame === "daily" || timeFrame === "weekly")  && (
        <div >
          <select
          id="monthSelect"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="
              border rounded-md px-3 py-2
              bg-white shadow-md
              w-60
              outline-none
              focus:ring-2 focus:ring-blue-500
            "
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      )}
      {(timeFrame!= "yearly") && <div>
          <select
          id="yearSelect"
             value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="
              border rounded-md px-3 py-2
              bg-white shadow-md
              w-40
              outline-none
              focus:ring-2 focus:ring-blue-500
            "
          >
            {years.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          </div>}
        
      </div>
      </div>

      {/* Time selector */}
      {/* <div className="flex gap-2 mb-6">
        {["daily", "weekly", "monthly", "yearly"].map(p => (
          <button
            key={p}
            onClick={() => setTimeFrame(p)}
            className={`px-4 py-2 rounded ${timeFrame === p ? "bg-blue-600 text-white" : "bg-white"}`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>
   
{timeFrame === "daily" && (
  <div className="mb-6 flex items-center gap-3">
    <span className="font-semibold text-gray-700">Month:</span>

    <select
      value={selectedMonth}
      onChange={(e) => setSelectedMonth(e.target.value)}
      className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
    >
      {months.map((m) => (
        <option key={m.value} value={m.value}>
          {m.label}
        </option>
      ))}
    </select>
  </div>
)} */}
<div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
  {["daily", "weekly", "monthly", "yearly"].map((p) => (
    <div key={p} className="relative ">
      <button
      style={{border:"none",cursor:"pointer",backgroundColor:"#f00"}}
        onClick={() => setTimeFrame(p)}
        className={`px-4 py-2 rounded ${
          timeFrame === p ? "bg-blue-600 text-white" : "bg-white"
        }`}
      >
        {p.toUpperCase()}
      </button>

      {/* 🔽 Month dropdown directly under DAILY */}
   
    </div>
  ))}
</div>


      {/* Summary */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* <Card title="Total Sales" value={`₹${totalSales.toLocaleString()}`} icon={<DollarSign />} />
        <Card title="Average Sales" value={`₹${avgSales.toLocaleString()}`} icon={<TrendingUp />} />
        <Card title="Dine-In Orders" value={totalDineIn} icon={<Calendar />} />
        <Card title="Takeaway Orders" value={totalTakeaway} icon={<ShoppingBag />} />
      </div> */}

      {/* Charts */}
      <div className="grid grid-cols-1 grid-rows-3 sm:grid-cols-1 sm:grid-rows-1 gap-4  mb-6">
        <div>
          
        <h4 className="text-xl font-bold  flex  justify-center items-center gap-2 mb-4">Sales Analytics</h4>
        {/* {safeChartData.length > 0 && (
  <Chart {...salesChart} type="area" height={300} />
)} */}
  {/* {hasData ? (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <XAxis
          dataKey={
            timeFrame === "daily"
              ? "date"
              : timeFrame === "weekly"
              ? "week"
              : timeFrame === "monthly"
              ? "month"
              : "year"
          }
        />
        <YAxis tickFormatter={formatCurrency} />
        <Tooltip
        formatter={(value) => [`₹ ${formatCurrency(value)}`, "Total Sales"]}
      />
        {/* <Area
          type="monotone"
          dataKey="total_sales"
          stroke="#3b82f6"
          fill="#bfdbfe"
        /> 
        <Area
  type="monotone"
  dataKey="total_sales"
  stroke="#3b82f6"
  fill="#bfdbfe"
>
  <LabelList 
    dataKey="total_sales" 
    position="top" 
    formatter={(value) => `₹${formatCurrency(value)}`}
  />
</Area>

      </AreaChart>
    </ResponsiveContainer>
  ) : (
    <NoData text="No sales data for selected period" />
  )} */}

  {hasData ? (
  <ResponsiveContainer width="100%" height={350}>
  <BarChart
    data={chartData}
    margin={{ top: 40, right: 20, left: 10, bottom: 10 }}
  >
    <XAxis
      dataKey={
        timeFrame === "daily"
          ? "date"
          : timeFrame === "weekly"
          ? "week"
          : timeFrame === "monthly"
          ? "month"
          : "year"
      }
    />

    <YAxis
      tickFormatter={formatCurrency}
      domain={[0, (dataMax) => dataMax * 1.2]}
    />

    <Tooltip
      formatter={(value) => [`₹ ${formatCurrency(value)}`, "Total Sales"]}
    />

    <Bar
      dataKey="total_sales"
      fill="#3bf6ce"
      radius={[6, 6, 0, 0]}
    >
      <LabelList
        dataKey="total_sales"
        position="top"
        offset={10}
        style={{ fontSize: 12, fontWeight: 600 }}
        formatter={(value) => `₹${formatCurrency(value)}`}
      />
    </Bar>
  </BarChart>
</ResponsiveContainer>

) : (
  <NoData text="No sales data for selected period" />
)}

        </div>
        {/* <Chart {...pieChart} type="pie" height={300} /> */}
      
{/* <div className="grid grid-cols-1 lg:grid-cols-1  mb-6"> */}
        {/* <Chart {...salesChart} type="area" height={300} /> */}
        {/* <Chart {...pieChart} type="pie" height={300} />
      */}
      {/* <div>
          <h4 className="text-xl font-bold  flex  justify-center items-center gap-2 mb-4">
            Product Analytics</h4>
    
{hasData ? (
<ResponsiveContainer width="100%" height={350}>
  <AreaChart data={categoryWiseData}>
    <XAxis dataKey="day" />
    <YAxis tickFormatter={formatCurrency} />
    <Tooltip content={<CustomTooltip />} />

    {categoryNames.map((category, index) => (
      <Area
        key={category}              // ✅ unique string
        dataKey={category}          // ✅ matches chartData
        stackId="1"
        stroke={COLORS[index % COLORS.length]}
        fill={COLORS[index % COLORS.length]}
        fillOpacity={0.6}
      />
    ))}
  </AreaChart>
</ResponsiveContainer>

  ) : (
    <NoData text="No order data for selected period" />
  )}

      </div> */}
<div>
          <h4 className="text-xl font-bold  flex  justify-center items-center gap-2 mb-4">Orders Analytics</h4>
      {/* {safeChartData.length > 0 && <Chart {...barChart} type="bar" height={350} />} */}
{hasData ? (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey={
            timeFrame === "daily"
              ? "date"
              : timeFrame === "weekly"
              ? "week"
              : timeFrame === "monthly"
              ? "month"
              : "year"
          }
        />
        <YAxis tickFormatter={formatCount} />

      {/* ✅ TOOLTIP FORMAT */}
      <Tooltip
        formatter={(value, name) => [
          formatCount(value),
          name === "dineIn" ? "Dine-In Orders" : "Takeaway Orders",
        ]}
      />
        <Legend />
        <Bar dataKey="dineIn" fill="#3b82f6" />
        <Bar dataKey="takeaway" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <NoData text="No order data for selected period" />
  )}

      </div>
    </div>
      </div>
  );
}

/* ================= CARD ================= */
function Card({ title, value, icon }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex items-center gap-2 mb-2">{icon}{title}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

 