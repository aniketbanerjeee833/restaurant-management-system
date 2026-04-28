
import  { useState } from 'react';
import {  Clock,  Armchair,CalendarDays, Filter, X, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


// import { useDispatch } from 'react-redux';

import { useGetAllPreBookingOrdersQuery,  useLazyGetPreBookOrderItemsForKOTQuery }
 from '../../../redux/api/Staff/orderApi';






// import { useTotalPreBookOrdersEachDayQuery } from '../../redux/api/Staff/orderApi';
import { toast } from 'react-toastify';

// const socket = io("http://localhost:4000", {
//   transports: ["websocket"],
// });

export default function AllPreBookOrders() {
//   const formatTime = (time) => {
//   if (!time) return "--";
//   const d = new Date(time);
//   d.setSeconds(0);
//   return d.toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };
const [printingOrderId, setPrintingOrderId] = useState(null);

    const navigate = useNavigate()
    //const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
//   const [tables, setTables] = useState([]);
  //const [currentTime, setCurrentTime] = useState(new Date());
  //const [kotNotifications, setKotNotifications] = useState({});

// const [kotNotifications, setKotNotifications] = useState([]);
//const { data: tableHavingOrders} = useGetTablesHavingOrdersQuery();
const { data: preBookedOrdersData} = useGetAllPreBookingOrdersQuery();
console.log("PreBooked Orders Data:", preBookedOrdersData);
//const[takeawayCancelOrder,{isLoading:isTakeawayCancelOrderLoading}]=useCancelTakeawayOrderMutation();
// const[takeawayCompleteOrder,{isLoading:isTakeawayCompleteOrderLoading}]=useCompleteTakeawayOrderMutation();
// const[getPreBookItemsForKOT,{isLoading:isGetPreBookItemsForKOTLoading}]=useGetPreBookOrderItemsForKOTQuery();
const [
  triggerGetPreBookItemsForKOT,
  {
    data: preBookItemsForKOTData,
    isLoading: isGetPreBookItemsForKOTLoading,
    
  }
] = useLazyGetPreBookOrderItemsForKOTQuery();

  // const {data:tableHavingOrders} = useGetTablesHavingOrdersQuery()
//  useEffect(() => {
//   console.log("API RESPONSE:", preBookedOrders);
// }, [preBookedOrders]);
// useEffect(() => {
//   // const handleOrderUpdate = (data) => {
//   //   console.log("📢 Dashboard received updated order:", data);

//   //   // 🔥 Refresh the order list automatically
//   //   refetch();
//   // };
//   const handleOrderUpdate = (data) => {
//   console.log("📢 Dashboard received updated order:", data);

//   // ⭐ If takeaway order completed → remove card immediately

 
//     //  refetch();
  
//   // Otherwise → normal refetch for dine-in updates
//   // refetch();
// };

//   // dispatch(orderApi.util.invalidateTags(['Order']));
//   socket.on("frontdesk_order_update", handleOrderUpdate);

//   return () => {
//     socket.off("frontdesk_order_update", handleOrderUpdate);
//   };
// }, []);
// useEffect(() => {
//   const handleKotUpdate = (data) => {
//        if (data.orderType !== "takeaway") return; // 🔒 ignore dine-in
//     console.log("📢 Frontend received KOT update:", data);

//     const orderId = data.Order_Id; // <-- This connects to the correct takeaway card

//     setKotNotifications((prev) => {
//       const previous = prev[orderId] || [];

//       // Check if item already exists
//       const idx = previous.findIndex(
//         (item) => String(item.KOT_Item_Id) === String(data.KOT_Item_Id)
//       );

//       let updatedList;

//       if (idx !== -1) {
//         // Update existing item
//         updatedList = [...previous];
//         updatedList[idx] = {
//           ...updatedList[idx],
//           status: data.status,
//           time: data.updated_at,
//         };
//       } else {
//         // Add new item
//         updatedList = [
//           ...previous,
//           {
//             KOT_Item_Id: data.KOT_Item_Id,
//             itemName: data.itemName,
//             status: data.status,
//             time:data.updated_at
//           },
//         ];
//       }

//       return {
//         ...prev,
//         [orderId]: updatedList,
//       };
//     });

//     // Optional toast
//      dispatch(orderApi.util.invalidateTags(["Order"]));
//     toast.info(`${data.itemName} → ${data.status}`);
//   };

//   socket.on("frontend_kot_update", handleKotUpdate);

//   return () => socket.off("frontend_kot_update", handleKotUpdate);
// }, []);
// useEffect(() => {
//   if (!tableHavingOrders) return;

//   const allOrders = [
//     ...(tableHavingOrders.tableHavingOrders ?? []),
//     ...(tableHavingOrders.takeawayOrders ?? [])
//   ];

//   allOrders.forEach((o) => {
//     if (o.KOT_Id) {
//       socket.emit("join_order_room", o.KOT_Id);
//       console.log("📡 Joined order room:", o.KOT_Id);
//     }
//   });
// }, [tableHavingOrders]);


const preBookedOrders = preBookedOrdersData?.preBookedOrders || [];
  



// console.log("Raw Tables Data:", rawTables, "Takeaway Tables Data:", takeawayTables);






const filteredPreBookedOrders = preBookedOrders?.filter((order) => {
  if (!searchTerm) return true;

  const search = searchTerm.trim().toLowerCase();

  const orderId = order.Pre_Booked_Order_Id?.toLowerCase() || "";
  const customerName = order.Customer_Name?.toLowerCase() || "";
  const customerPhone = order.Customer_Phone || "";
  const amount = order.Amount || "";
  const date=order.Booking_Date||"";
  const time=order.Booking_Time||"";
  const advance=order.Advance_Payment||""

  const itemMatch = order.items?.some(item =>
    item.Item_Name?.toLowerCase().includes(search)
  );

  return (
    orderId.includes(search) ||
    customerName.includes(search) ||
    customerPhone.includes(search) ||
    amount.includes(search) ||
    date.includes(search) ||
    time.includes(search) ||
    advance.includes(search) ||
    itemMatch
  );
});
console.log("Filtered PreBooked Orders:", filteredPreBookedOrders);

//console.log(filteredTables,filteredTakeawayOrders);
//console.log("KOT Notifications:", kotNotifications);
// const printPreOrderKOTInvoice = (kitchens) => {
//   const getCurrentDate = () =>
//     new Date().toLocaleDateString("en-GB");

//   const getCurrentTime = () =>
//     new Date().toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });

//   const kitchenSections = Object.entries(kitchens)
//     .map(([kitchenName, items], index) => `
//       ${index > 0 ? `<div class="line"></div>` : ``}

//       <div class="invoice-kitchen">
//         <div class="header-center">
//         <div class="brand">TAKEAWAY</div>
//           <div class="brand">${kitchenName}</div>
        
//         </div>

//         <div class="info-row date-time">
//           <span><b>Date:</b> ${getCurrentDate()}</span>
//           <span><b>Time:</b> ${getCurrentTime()}</span>
//         </div>

//         <div class="line-solid"></div>

//         <div class="items-header">
//           <div class="col-no">No</div>
//           <div class="item-name">ITEM</div>
//           <div class="item-qty">QTY</div>
//         </div>

//         ${items.map((it, i) => `
//           <div class="item-row">
//             <div class="col-no">${i + 1}</div>
//             <div class="item-name">${it.Item_Name}</div>
//             <div class="item-qty">${it.Item_Quantity}</div>
//           </div>
//         `).join("")}
//       </div>
//     `)
//     .join("");

//   const html = `<!DOCTYPE html>
// <html>
// <head>
// <meta charset="UTF-8">
// <style>
//   body {
//     font-family: 'Courier New', monospace;
//     font-size: 16px;
//     font-weight: 700;
//     width: 58mm;
//     margin: 0;
//   }
//   .invoice { width: 48mm; padding: 2mm; }
//   .invoice-kitchen { margin-top: 8px; }
//   .header-center {
//     text-align: center;
//     border-bottom: 1px dashed #000;
//     margin-bottom: 6px;
//     padding-bottom: 6px;
//   }
//   .brand { font-size: 20px; font-weight: 800; }
//   .line { border-top: 1px dashed #000; margin: 6px 0; }
//   .line-solid { border-top: 1px solid #000; margin: 5px 0; }
//   .items-header, .item-row {
//     display: flex;
//     justify-content: space-between;
//     font-size: 15px;
//   }
//   .items-header { border-bottom: 1px solid #000; font-weight: 800; gap: 4px; padding-bottom: 4px; }
//   .col-no { width: 5mm; }
//   .item-name { flex: 1; }
//   .item-qty { width: 6mm; text-align: center; }
//   .info-row.date-time {
//     display: flex;
    
//     justify-content: space-between;
//     font-size: 12px;
//   }
  
//   @page { size: 48mm auto; margin: 0; }
//             /* PRINT STYLES */
//           @media print {
//             body {
//               width: 58mm;
//               margin: 0;
//               padding: 0;
//             }
            
//             .invoice {
//               width: 58mm;
//               padding: 8px;
//             }
            
//             @page {
//               size: 58mm auto;
//               margin: 0;
//             }
            
//             .no-print {
//               display: none !important;
//             }
//           }
// </style>
// </head>
// <body>
//   <div class="invoice">
//     ${kitchenSections}
//   </div>
// </body>
// </html>`;
// // const win = window.open(
// //   "",
// //   "_blank",
// //   `width=${screen.width},height=${screen.height},left=0,top=0`
// // );
// // const win = window.open(
// //   "",
// //   "_blank",
// //   "width=800,height=600,left=0,top=0"
// // );
// // if (!win) return;

// // win.document.open();
// // win.document.write(html);
// // win.document.close();

// // win.onload = () => {
// //   setTimeout(() => {
// //     win.focus();
// //     win.print();
// //     win.close();
// //   }, 300);
// // };


//   const iframe = document.createElement("iframe");
//   iframe.style.display = "none";
//   document.body.appendChild(iframe);

//   iframe.contentDocument.open();
//   iframe.contentDocument.write(html);
//   iframe.contentDocument.close();

//   iframe.onload = () => {
//     iframe.contentWindow.print();
//   };

//   setTimeout(() => document.body.removeChild(iframe), 1000);
// };

const printPreBookKOT = (kitchens) => {
    const getCurrentDate = () =>
    new Date().toLocaleDateString("en-GB");

  const getCurrentTime = () =>
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const kitchenSections = Object.entries(kitchens)
  .map(([kitchenName, items], index) => `
    ${index > 0 ? `<div class="line"></div>` : ``}

    <div class="invoice-kitchen">
      <div class="header-center">
        <div class="brand">PRE ORDER</div>
        <div class="brand">${kitchenName}</div>
      </div>

      <div class="info-row date-time">
        <span><b>Date:</b> ${getCurrentDate()}</span>
        <span><b>Time:</b> ${getCurrentTime()}</span>
      </div>

      <div class="line-solid"></div>

   
         ${items?.length > 0? `
    <div class="items-header">
      <div class="col-no">No</div>
      <div class="item-name">ITEM</div>
      <div class="item-qty">QTY</div>
     
    </div>
    `
    : ``}

      ${items
        .map(
          (it, i) => `
          <div class="item-row">
            <div class="col-no">${i + 1}</div>
            <div class="item-name">${it.Item_Name}</div>
            <div class="item-qty">${it.Item_Quantity}</div>
          </div>
        `
        )
        .join("")}
    </div>
  `)
  .join("");


  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body {
    font-family: 'Courier New', monospace;
    font-size: 16px;
    font-weight: 700;
    width: 58mm;
    margin: 0;
  }
  .invoice { width: 48mm; padding: 2mm; }
  .invoice-kitchen { margin-top: 8px; }
  .header-center {
    text-align: center;
    border-bottom: 1px dashed #000;
    margin-bottom: 6px;
    padding-bottom: 6px;
  }
  .brand { font-size: 20px; font-weight: 800; }
  .line { border-top: 1px dashed #000; margin: 6px 0; }
  .line-solid { border-top: 1px solid #000; margin: 5px 0; }
  .items-header, .item-row {
    display: flex;
    justify-content: space-between;
    font-size: 15px;
  }
  .items-header { border-bottom: 1px solid #000; font-weight: 800; gap: 4px; padding-bottom: 4px; }
  .col-no { width: 5mm; }
  .item-name { flex: 1; }
  .item-qty { width: 6mm; text-align: center; }
  .info-row.date-time {
    display: flex;
    
    justify-content: space-between;
    font-size: 12px;
  }
  
  @page { size: 48mm auto; margin: 0; }
            /* PRINT STYLES */
          @media print {
            body {
              width: 58mm;
              margin: 0;
              padding: 0;
            }
            
            .invoice {
              width: 58mm;
              padding: 8px;
            }
            
            @page {
              size: 58mm auto;
              margin: 0;
            }
            
            .no-print {
              display: none !important;
            }
          }
</style>
</head>
<body>
  <div class="invoice">
    ${kitchenSections}
  </div>
</body>
</html>`;
// const win = window.open(
//   "",
//   "_blank",
//   `width=${screen.width},height=${screen.height},left=0,top=0`
// );
// const win = window.open(
//   "",
//   "_blank",
//   "width=800,height=600,left=0,top=0"
// );
// if (!win) return;

// win.document.open();
// win.document.write(html);
// win.document.close();

// win.onload = () => {
//   setTimeout(() => {
//     win.focus();
//     win.print();
//     win.close();
//   }, 300);
// };


  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();

  iframe.onload = () => {
    iframe.contentWindow.print();
  };

  setTimeout(() => document.body.removeChild(iframe), 1000);
  
}
const handlePreOrderPrintKOT = async (Pre_Booked_Order_Id) => {
  console.log("PRINT KOT FOR:", Pre_Booked_Order_Id);
setPrintingOrderId(Pre_Booked_Order_Id);
  try {
    const res = await triggerGetPreBookItemsForKOT(
      Pre_Booked_Order_Id
    ).unwrap();

    console.log("KOT DATA:", res);

 
        const kitchens = res?.preBookedOrderItems || {};

    // ✅ CHECK: any kitchen has items?
    const hasItems = Object.values(kitchens).some(
      (items) => Array.isArray(items) && items.length > 0
    );

    if (!hasItems) {
      toast.error("No items available for KOT printing.");
      return;
    }

    // 🔥 PRINT ONLY WHEN ITEMS EXIST
    printPreBookKOT(kitchens);
    // printPreBookKOT(res?.preBookedOrderItems);

  } catch (err) {
    console.error("❌ KOT fetch error:", err);
  }finally{
      setPrintingOrderId(null);
  }
};
const formatBookingDate = (dateStr) => {
  if (!dateStr) return null;

  const [dd, mm, yyyy] = dateStr.split("-");
  return `${yyyy}-${mm}-${dd}`;
};
// const now = new Date();

// const [selectedYear, setSelectedYear] = useState(
//   now.getFullYear()
// );

// const [selectedMonth, setSelectedMonth] = useState(
//   now.getMonth() + 1 // 1–12
// );

//   // const {user}=useSelector((state)=>state.user)
//   // const today = new Date().toISOString().split("T")[0];
//  const today = new Date().toLocaleDateString("en-CA");

//   // const{data:preBookedInvoicesEachDay}=useTotalInvoicesEachDayQuery()
//   const { data: preBookedInvoicesEachDay } =
//   useTotalPreBookOrdersEachDayQuery({
//     year: selectedYear,
//     month: selectedMonth,
//   });

//     const [showRangeModal, setShowRangeModal] = useState(false);
//     const [dateRange, setDateRange] = useState({
//       startDate: '',
//       endDate: ''
//     });
      // const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    //  console.log(today);
    //    const [currentDate, setCurrentDate] = useState(new Date());
    //    const [selectedDate, setSelectedDate] = useState(today);
// const formatDateDDMMYYYY = (dateStr) => {
//   if (!dateStr) return "";
//   const [y, m, d] = dateStr.split("-");
//   return `${d}-${m}-${y}`;
// };


// const{data:itemsSoldEachDay}=useGetItemsSoldEachDayQuery(selectedDate)
// const topSellingItems = itemsSoldEachDay?.data ?? [];
// console.log(itemsSoldEachDay,"itemsSoldEachDay");
// const {data: salesPurchasesProfitData} =
//    useGetAllSalesAndPurchasesYearWiseQuery({year:selectedYear})
 
  //console.log(selectedYear);
// const {data:totalSalesPurchasesReceivablesPayablesProfit}=
// useGetTotalSalesPurchasesReceivablesPayablesProfitQuery(selectedDate)
  // Item-wise analysis
//   console.log(totalSalesPurchasesReceivablesPayablesProfit,
//     "totalSalesPurchasesReceivablesPayablesProfit");
// const[page,setPage]=useState(1)


    // const profitMargin=totalSalesPurchasesReceivablesPayablesProfit?.profit
     
     
//  const topSellingItems = [
//     { name: 'Chicken Biryani', qtySold: 120, revenue: 24000, contribution: 18 },
//     { name: 'Butter Chicken', qtySold: 95, revenue: 18050, contribution: 14 },
//     { name: 'Paneer Tikka', qtySold: 90, revenue: 13500, contribution: 10 },
//     { name: 'Dal Makhani', qtySold: 85, revenue: 10200, contribution: 8 },
//     { name: 'Tandoori Roti', qtySold: 280, revenue: 8400, contribution: 6 }
//   ];





  

  //console.log(preBookedInvoicesEachDay,"preBookedInvoicesEachDay");
  //  const getDaysInMonth = (year, month) => {
  //    return new Date(year, month + 1, 0).getDate();
  //  };
 
  //  const getFirstDayOfMonth = (year, month) => {
  //    return new Date(year, month, 1).getDay();
  //  };
 
  //  const formatDate = (year, month, day) => {
  //    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  //  };
 
  //  const handleDateClick = (day) => {
  //    const year = currentDate.getFullYear();
  //    const month = currentDate.getMonth();
  //    const dateStr = formatDate(year, month, day);
     
  //    console.log("Selected date:", dateStr);
     
  //  // Clear leads immediately when a new date is selected
  //    // dispatch(clearSelectedLeads());
  //    setSelectedDate(dateStr);
  //    //navigate(`/day-wise-report/${dateStr}`);
  //   window.open(`/staff/day-wise-pre-book-order-report/${dateStr}`,"_blank");
  //    // Remove the manual fetchLeadsByDate call - let the query handle it
  //  };

  //  const navigateMonth = (direction) => {
  //       const newDate = new Date(currentDate);
  //       newDate.setMonth(newDate.getMonth() + direction);
  //           // dispatch(clearSelectedLeads()); // Clear leads when navigating months
  //       setCurrentDate(newDate);
  //       setSelectedDate(today);
  //       // setSelectedLeads([]);
     
  //     };
//   const navigateMonth = (direction) => {
//   const newDate = new Date(currentDate);
//   newDate.setMonth(newDate.getMonth() + direction);

//   setCurrentDate(newDate);

//   // 👇 derive selected year & month from currentDate
//   setSelectedYear(newDate.getFullYear());
//   setSelectedMonth(newDate.getMonth() + 1); // 1–12
// };

//        const handleDateRangeSubmit = () => {
       
//        if (dateRange?.startDate && dateRange?.endDate) {
//          // Validate that end date is after start date
//          if (new Date(dateRange.endDate) < new Date(dateRange.startDate)) {
//            alert('End date must be after start date');
//            return;
//          }
//           //window.open(`/accounts/date-range-report/${dateRange.startDate}/${dateRange.endDate}`, "_blank");
   
//          // Open report in new tab with date range
//          //window.open(`/order/date-range-orders-takaway-report/${dateRange.startDate}/${dateRange.endDate}`, "_blank");
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
//     preBookedInvoicesEachDay?.preBookedInvoicesEachDay
//       ?.reduce((acc, item) => {
//       acc[item.date] = item.total_invoices;
//       return acc;
//     }, {}) || {};

// //   const takeawayInvoicesEachDay =
// //     preBookedInvoicesEachDay?.takeawayInvoices?.reduce((acc, item) => {
// //       acc[item.date] = item.total_takeaway_invoices;
// //       return acc;
// //     }, {}) || {};

// //       const cancelledTakeawayInvoicesEachDay=
// //     preBookedInvoicesEachDay?.cancelledTakeawayInvoices?.reduce((acc, item) => {
// //       acc[item.date] = item.cancelled_takeaway_invoices;
// //       return acc;
// //     }, {}) || {};

//     const totalSalesEachDay=
//     preBookedInvoicesEachDay?.totalSalesEachDay?.reduce((acc, item) => {
//       acc[item.date] = item.total_sales;
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
   

// const totalSales = totalSalesEachDay[dateStr] || 0;
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
//                text-[8px] sm:text-[12px] md:text-[12px]
//                 font-medium leading-tight break-words
//               "
//             >
//               Pre Order: {totalInvoices}
//             </span>
//           )}

//           {/* Takeaways */}
        
 
//             {totalSales > 0 && <span
//               style={{ color: "green" }}
//               className="
//                 text-[8px] sm:text-[12px] md:text-[12px]
//                 font-medium leading-tight break-words
//               "
//             >
//               Total Sales:  ₹{totalSales }
//             </span>}
         

//         </div>
//       </div>
//     );
//   }

//   return days;
// };
  return (
    <>
      
      
      
          
            <div style={{ padding: "20px" , width: "100%",height:"100%"}} className="box-inn-sp">
              
              <div className="inn-title w-full px-1 py-1">
                <div className="flex flex-col sm:flex-row justify-between 
                items-start sm:items-center w-full ">
                  
                  {/* LEFT HEADER */}
                  <div className="w-full sm:w-auto">
                    <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Pre Booked Orders</h4>
                  </div>

                  {/* RIGHT BUTTON SECTION */}
                    {/* <div className="
      w-full sm:w-auto 
      flex 
      justify-start sm:justify-end 
      gap-4
    ">
                    

                   

                        
      <input
        type="text"
        placeholder="Search ..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
    
                    <button
                      type="button"
                      onClick={() =>navigate("/staff/orders/add")}
                      className="text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "#ff0000" }}
                    >
                      Add Order
                    </button>
                  
                   
                  </div> */}
<div
  className="
    w-full
    flex
    flex-col
    
    sm:flex-row
    sm:justify-end
    sm:items-center
    sm:w-1/2
    gap-3
  "
>
  {/* Search Input */}
  <input
    type="text"
    placeholder="Search ..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
      className='w-1/2'                
  />

  {/* Add Order Button */}
   <button
  type="button"
  onClick={() => navigate("/staff/pre-book-order/add-pre-booked-orders")}
  className="
    h-12
    px-4
    text-white
    font-bold
    rounded
    flex items-center justify-center
    whitespace-nowrap
  "
  style={{ backgroundColor: "#ff0000" }}
>
  Add Pre Book Order
</button>

</div>


                </div>
              </div>
              
             <div 
              className="p-2 bg-gray-100">
  <div className="
    grid 
    grid-cols-1 
    sm:grid-cols-2 
    md:grid-cols-3 
    lg:grid-cols-4 
    gap-6
  ">

    
{filteredPreBookedOrders?.length > 0 && filteredPreBookedOrders?.map((order) => 
{
  const today = new Date().toISOString().split("T")[0];
const bookingDate = formatBookingDate(order?.Booking_Date);

const isToday = bookingDate === today;
  // const today = new Date().toISOString().split("T")[0];
  // const isToday = order?.Booking_Date === today;
  return(
  // <div
  //   key={order?.Pre_Booked_Order_Id }
  //   className="bg-white rounded-lg p-4 shadow-md relative border"
  
  // >
<div
  key={order?.Pre_Booked_Order_Id}
  style={{
    border: isToday ? "2px solid #b91c1c" : "1px solid #e5e7eb", // red-800 / gray-200
  
  }}
  className="bg-white rounded-lg p-4  relative"
>

   
    {/* <div
      className={`absolute top-2 right-2 px-3 py-1  text-xs font-bold text-white 
        ${
          order.Payment_Status
 === "hold" || order.Payment_Status
            ? "bg-orange-500"
            : "bg-green-500"
        }`}
    >
      {order?.Payment_Status
}
    </div> */}

<div className=' flex gap-2 justify-end'>
    {order?.tables?.length>0 && 
    <div>
          <div className="text-sm text-gray-600">
            {order?.tables?.map((table) => table.Table_Name).join(", ")}
          </div>

           </div>
      }
     <div
      className={` px-3 py-1 bg-orange-500 text-xs font-bold text-white 
      `}
    >
      pending
    </div>
    </div>

    
   
      <>
      
        {/* <h5 className=" font-bold text-gray-800  sm:text-xl mb-1"> */}
        
        {/* </h5> */}
       

        {/* Timer */}
        
         <div className=" pt-3 flex justify-between items-center">
          <span className="text-sm text-gray-600">Date:</span>
          <span className="text-sm  text-teal-600">{order?.Booking_Date}</span>
        </div>
         <div className="border-t pt-3 flex justify-between items-center">
          <span className="text-sm text-gray-600">Time:</span>
          <span className="text-sm  text-teal-600">{order?.Booking_Time}</span>
        </div>
       
        {/* Amount */}
      

        {order?.Customer_Name && <div className="border-t pt-3 flex justify-between items-center">
          <span className="text-sm text-gray-600">Customer Name:</span>
          <span className="text-sm  text-teal-600">{order?.Customer_Name}</span>
        </div>}
           <div className="border-t pt-3 flex justify-between items-center">
          <span className="text-sm text-gray-600">Customer Phone:</span>
          <span className="text-sm  text-teal-600">{order?.Customer_Phone}</span>
        </div>

          <div className="border-t pt-3 flex justify-between items-center">
          <span className="text-sm text-gray-600">Amount:</span>
          <span className="text-sm  text-teal-600">₹{order?.Amount}</span>
        </div>

        <div className="border-t pt-3 flex justify-between items-center">
          <span className="text-sm text-gray-600">Advance:</span>
          <span className="text-sm  text-teal-600">₹{order?.Advance_Payment}</span>
        </div>

        {/* KOT */}
         <div className="flex justify-center items-center">
     {/* <button
  type="button"
   disabled={!isToday || printingOrderId === order?.Pre_Booked_Order_Id}
  style={{
    backgroundColor: "#ffa600",
    opacity: isToday ? 1 : 0.4,          // 👈 fade when disabled
    cursor: isToday ? "pointer" : "not-allowed"
  }}
  onClick={() => handlePreOrderPrintKOT(order?.Pre_Booked_Order_Id)}
  className="text-white mt-2 font-bold py-2 px-4 rounded"
>
    {printingOrderId === order?.Pre_Booked_Order_Id
    ? "Printing..."
    : "Print KOT"}
  
</button> */}
        </div>
         {/* View Details */}
        <div className="flex justify-center items-center">
          <button
          type="button"
            style={{ backgroundColor: "#ff0000" }}
            className="text-white mt-2 font-bold py-2 px-4 rounded"
            onClick={() =>
              navigate(`/staff/pre-book-order/update-pre-booked-order/${order?.Pre_Booked_Order_Id }`)
            }
          >
            View Details
          </button>
        </div>
      </>
    

   


  </div>)
})}


     

  </div>

    {/* No results */}
    {filteredPreBookedOrders?.length === 0   && (
     
         <div className="flex flex-col items-center justify-center w-full  text-center">
                  <div className="bg-white rounded-full p-8 shadow-lg mb-6">
                  <Armchair className="w-20 h-20 text-gray-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-700 mb-2">
                    No  pre booked orders found
                  </h2>
                  <p className="text-gray-500">
                    Waiting for new orders to arrive...
                  </p>
                  <div className="mt-6 flex gap-2">
                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
    )}

</div>

            </div>
         
           {/* <div className='bg-white'>
             
                 <div  style={{padding:"0px"}} className="tab-inn border-b border-gray-200">
                <div className="flex justify-end items-center p-2 gap-2">
                  <span className="border-b border-black">
                       {formatDateDDMMYYYY(selectedDate)}
                  </span>
    <div className="relative">
    
      <input
        type="date"
        id="dashboard-date"
        className="absolute inset-0 opacity-0 "
        onChange={(e) => {
       setSelectedDate(e.target.value);
          // 👉 call API / set state here
        }}
      />

      {/* Calendar Icon 
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
                    
                      </div>
             {/* Header with month and nav 
           
 
                 {/* <div className="tab-inn border-b border-gray-200">
         
          </div> 
             <div style={{border:"none",padding:"0px"}} 
              className="inn-title ">
             <div className="flex flex-col sm:flex-row items-center 
             justify-between mb-2 mt-2 mx-auto px-4 gap-3">
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
                       {/* <button  style={{ backgroundColor: "#ff0000" }}
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
             {/* Calendar grid 
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
 
               {/* Selected Leads 
               <div className="lg:col-span-1">
                 {/* <div className="bg-gray-50 rounded-lg p-4 h-full">
                   {renderSelectedLeads()}
                 </div> 
               </div>
             </div>
             </div>
           </div> */}
       
      

     
    
 
       {/* Calendar & Leads */}
      
         {/* <div className="row">
           <div className="col-md-12">
            
           </div>
         </div> */}
       
 {/* {showRangeModal && (
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
       )} */}
     
   
    </>
  );
}


