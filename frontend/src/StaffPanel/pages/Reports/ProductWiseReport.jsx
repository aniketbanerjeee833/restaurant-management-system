import { CalendarDays, ChefHat, Filter, X } from "lucide-react";
import { useGetItemsSoldDateRangeReportQuery, useGetItemsSoldEachDayQuery } from "../../../redux/api/dashboardApi";
import { useState } from "react";
import { useEffect } from "react";





export default function ProductWiseReport() {
    const[page, setPage] = useState(1);
    const today = new Date().toISOString().split("T")[0]; // ✅ safest
    
          // const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
         console.log(today);
           
           const [selectedDate, setSelectedDate] = useState(today);
               const [showRangeModal, setShowRangeModal] = useState(false);
               const [dateRange, setDateRange] = useState({
                 startDate: '',
                 endDate: ''
               });
               
            //    const{data:itemsSoldDateRange}=useGetItemsSoldDateRangeReportQuery(
            //      {fromDate:dateRange.startDate,toDate:dateRange.endDate,page},
            //      {skip:!dateRange.startDate || !dateRange.endDate}
            //    )
            
const isRangeMode = Boolean(dateRange.startDate && dateRange.endDate);
            const { data: itemsSoldEachDay } = useGetItemsSoldEachDayQuery(
  { date: selectedDate, page },
  { skip: isRangeMode || !selectedDate }
);

const { data: itemsSoldDateRange } = useGetItemsSoldDateRangeReportQuery(
  { fromDate: dateRange.startDate, toDate: dateRange.endDate, page },
  { skip: !isRangeMode }
);

console.log(itemsSoldDateRange,"itemsSoldDateRange");
  console.log(itemsSoldEachDay,"itemsSoldEachDay");

 
  
//   const topSellingItems = itemsSoldEachDay?.data ?? [];
//   console.log(itemsSoldEachDay,"itemsSoldEachDay");
//   setItemsSold(topSellingItems)
//   const topSellingItemsDateRange=itemsSoldDateRange?.data??[]
//   setItemsSold(topSellingItemsDateRange)
const handleDateRangeSubmit = () => {

if (dateRange?.startDate && dateRange?.endDate) {
  // Validate that end date is after start date
  if (new Date(dateRange.endDate) < new Date(dateRange.startDate)) {
    alert('End date must be after start date');
        return;
  }
   setShowRangeModal(false);

}


}
  const topSellingItems = isRangeMode
  ? itemsSoldDateRange?.data ?? []
  : itemsSoldEachDay?.data ?? [];
console.log(topSellingItems,"topSellingItems");

useEffect(() => {
  setPage(1);
}, [selectedDate]);

useEffect(() => {
  if (isRangeMode) {
    setPage(1);
  }
}, [dateRange.startDate, dateRange.endDate]);
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

  return (
    <>
    <div className="flex justify-center sm:justify-end gap-4 mb-2">
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
          // 👉 call API / set state here
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


<div className="flex justify-center items-center  ">
          <button  style={{ backgroundColor: "#ff0000" }}
                     onClick={() => setShowRangeModal(true)}
                     className="px-4 py-2 bg-blue-600  
                     text-white rounded-lg transition text-sm sm:text-base 
                      flex items-center gap-2"
                   >
                     <Filter className="w-4 h-4" />
                     Date Range Report
                   </button>
                   </div>
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
                                              <tbody className="divide-y divide-gray-100">
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
                                                    </td>   */}
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
        
                        <button type="button"
                        style={{ outline: "none",backgroundColor: "lightgray" }}
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
  )
}
