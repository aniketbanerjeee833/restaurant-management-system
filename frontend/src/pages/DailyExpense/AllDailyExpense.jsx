import { ChevronDown, ChevronUp } from "lucide-react";

import { useState } from "react";
import { useGetMonthlyWeeklyExpensesQuery } from "../../redux/api/dailyExpenseApi";

export default function AllDailyExpense() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );
  const [openWeek, setOpenWeek] = useState(null);
//   const [search, setSearch] = useState("");

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const { data, isLoading } =
    useGetMonthlyWeeklyExpensesQuery({
      year: selectedYear,
      month: selectedMonth,
      
    });

  const report = data?.data || {};

  console.log(report);

  if (isLoading) {
    return <div className="p-6">Loading expense report…</div>;
  }

return (
  <div style={{height:"100%"}}
  className="flex flex-col bg-white p-6">
    <div>
      <div className="flex flex-col justify-center items-center mb-4 sm:flex-row sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Daily Expense Report
        </h1>

        <div className="flex gap-2 mt-3 sm:mt-0">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border px-3 py-2 rounded"
          >
            {[2024, 2025, 2026].map((y) => (
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

      {/* MONTHLY TOTAL */}
      {data?.monthlyTotal > 0 && (
        <div style={{color:"#ff0000"}}
        className="mb-6 text-right text-lg font-semibold ">
          Monthly Total: ₹{data.monthlyTotal}
        </div>
      )}

      {/* NO DATA */}
      {report?.length === 0 && (
        <div className="bg-white p-10 text-center rounded shadow">
          No daily expense data for this month
        </div>
      )}

      {/* WEEKLY ACCORDION */}
      {report?.map((weekItem) => {
        const isOpen = openWeek === weekItem.weekNumber;

        return (
          <div
            key={weekItem.weekNumber}
            className="bg-white rounded shadow mb-4 overflow-hidden"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-4 bg-gray-100">
              <div>
                <span className="font-semibold text-gray-800">
                  {weekItem.weekLabel}
                </span>
                <span style={{color:"#ff0000"}}
                className="ml-4 font-bold ">
                  ₹{weekItem.total}
                </span>
              </div>

              <button
                type="button"
                style={{backgroundColor:"transparent"}}
                onClick={() =>
                  setOpenWeek(isOpen ? null : weekItem.weekNumber)
                }
                className="p-1 rounded hover:bg-gray-300 transition"
              >
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>

            {/* BODY */}
            {isOpen && (
              <div className="border-t overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Category</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-left">Notes</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekItem.expenses.map((exp) => (
                      <tr
                        key={exp.Expense_Id}
                        className="border-t hover:bg-gray-50"
                      >
<td className="p-3">
  {new Date(exp.Created_At).toLocaleString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}
</td>



                        <td className="p-3 font-medium">
                          {exp.Category}
                        </td>
                        <td className="p-3">
                          {exp.Product_Description || "-"}
                        </td>
                        <td className="p-3">
                          {exp.Notes || "-"}
                        </td>
                        <td className="p-3 text-right font-semibold">
                          ₹{exp.Amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

}
