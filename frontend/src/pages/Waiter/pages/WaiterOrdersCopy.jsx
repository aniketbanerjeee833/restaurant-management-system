





// import { useState, useEffect } from 'react';
// import { Clock, Armchair } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import {
//   orderApi,
 
  
// } from '../../../redux/api/Staff/orderApi';
// import { io } from 'socket.io-client';
// import { useDispatch, useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import { useGetAllTablesQuery } from '../../../redux/api/tableApi';
// import { useGetOrdersByWaiterQuery } from '../../../redux/Waiter/waiterApi';

// const socket = io("http://localhost:4000", { transports: ["websocket"] });

// export default function WaiterOrders() {

//   // const formatTime = (time) => {
//   //   if (!time) return "--";
//   //   const d = new Date(time);
//   //   d.setSeconds(0);
//   //   return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   // };
//  const { user } = useSelector((state) => state.user);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [kotNotifications, setKotNotifications] = useState({});

//   // const { data: tableHavingOrders } = useGetTablesHavingOrdersQuery();
//    const { data: waiterOrders } = useGetOrdersByWaiterQuery();
//   const { data: tables } = useGetAllTablesQuery({});
//   console.log("Tables:", tables);
  
// const [localOrders, setLocalOrders] = useState([]);

//   // ── Sockets ────────────────────────────────────────────────────────────────
//   // useEffect(() => {
//   //   const handleOrderUpdate = (data) => {
//   //     console.log("📢 Dashboard received updated order:", data);
//   //   };
//   //   socket.on("frontdesk_order_update", handleOrderUpdate);
//   //   return () => socket.off("frontdesk_order_update", handleOrderUpdate);
//   // }, []);
//   useEffect(() => {
//   if (waiterOrders?.waiterOrders && localOrders.length === 0) {
//     setLocalOrders(waiterOrders.waiterOrders);
//   }
// }, [waiterOrders]);
// useEffect(() => {
//   if (!user?.User_Id || user?.role !== "waiter") return;

//   socket.connect(); // 🔥 connect now (not earlier)

//   socket.emit("join_waiter_room", user.User_Id);
//   console.log("🧑‍🍳 Joined waiter room:", user.User_Id);

//   return () => {
//     socket.emit("leave_waiter_room", user.User_Id);
//     socket.disconnect();
//   };
// }, [user?.User_Id]);

//   useEffect(() => {
//     const handleKotUpdate = (data) => {
//       if (data.orderType !== "takeaway") return;
//       const orderId = data.Order_Id;
//       setKotNotifications((prev) => {
//         const previous = prev[orderId] || [];
//         const idx = previous.findIndex(
//           (item) => String(item.KOT_Item_Id) === String(data.KOT_Item_Id)
//         );
//         let updatedList;
//         if (idx !== -1) {
//           updatedList = [...previous];
//           updatedList[idx] = { ...updatedList[idx], status: data.status, time: data.updated_at };
//         } else {
//           updatedList = [...previous, {
//             KOT_Item_Id: data.KOT_Item_Id,
//             itemName: data.itemName,
//             status: data.status,
//             time: data.updated_at
//           }];
//         }
//         return { ...prev, [orderId]: updatedList };
//       });
//       dispatch(orderApi.util.invalidateTags(["Order"]));
//       toast.info(`${data.itemName} → ${data.status}`);
//     };
//     socket.on("frontend_kot_update", handleKotUpdate);
//     return () => socket.off("frontend_kot_update", handleKotUpdate);
//   }, []);

 
  
// // useEffect(() => {
// //   if (!waiterOrders) return;

// //   const allOrders = [
// //     ...(waiterOrders.waiterOrders ?? []),
   
// //   ];

// //   allOrders.forEach((o) => {
// //     if (o.KOT_Id) {
      
// //       console.log("📡 Joined order room:", o.KOT_Id);
// //     }
// //   });
// // }, [waiterOrders]);

// useEffect(() => {
//   const onOrderClosed = ({ Order_Id, message }) => {
//     console.log("🔥 waiter_order_closed:", Order_Id, message);

//     // 🔥 instant UI update
//     setLocalOrders(prev =>
//       prev.filter(o => String(o.Order_Id) !== String(Order_Id))
//     );

//     // ✅ show backend message
//     toast.success(message || "Order completed");
//   };

//   socket.on("waiter_order_closed", onOrderClosed);

//   return () => {
//     socket.off("waiter_order_closed", onOrderClosed);
//   };
// }, []);




  
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   // Calculate elapsed time
//   const getElapsedTime = (startTime) => {
//     const start = new Date(startTime);
//     const diff = Math.floor((currentTime - start) / 1000); // seconds
    
//     const hours = Math.floor(diff / 3600);
//     const minutes = Math.floor((diff % 3600) / 60);
//     const seconds = diff % 60;
    
//     return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
//   };

//   // Step 1: Extract raw rows safely
// // const rawTables = waiterOrders?.waiterOrders ?? [];
//    const rawTables = localOrders;
// // ── Timer ──────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     const interval = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(interval);
//   }, []);

 
//   // ── Group dine-in orders by Order_Id ──────────────────────────────────────
//   //const rawTables = tableHavingOrders?.tableHavingOrders ?? [];
//   //const takeawayTables = tableHavingOrders?.takeawayOrders ?? [];

//   const grouped = Object.values(
//     rawTables.reduce((acc, row) => {
//       if (!acc[row.Order_Id]) {
//         acc[row.Order_Id] = {
//           Order_Id: row.Order_Id,
//           Amount: row.Amount,
//           Status: row.Status,
//           User_Id: row.User_Id,
//           Tax_Type: row.Tax_Type,
//           Tax_Amount: row.Tax_Amount,
//           Sub_Total: row.Sub_Total,
//           Payment_Type: row.Payment_Type,
//           Payment_Status: row.Payment_Status,
//           orderType: row.orderType,
//           Tables: [],
//           TableIds: [],
//           Table_Start_Time: row.Table_Start_Time,
//           name: row.name,
//           role: row.role,
//           orderBy: row.orderBy
//         };
//       }
//       acc[row.Order_Id].Tables.push(row.Table_Name);
//       acc[row.Order_Id].TableIds.push(row.Table_Id);
//       return acc;
//     }, {})
//   );

//   // ── Build a quick lookup: Table_Name → order ───────────────────────────────
//   // e.g. { "T1": { Order_Id, Status, Amount, ... }, "T2": { ... } }
//   const tableOrderMap = {};
//   grouped.forEach((order) => {
//     order.Tables.forEach((tableName) => {
//       tableOrderMap[tableName] = order;
//     });
//   });

//   // ── All restaurant tables from API ────────────────────────────────────────
//   const allTables = tables?.tables ?? [];

//   // ── Split into Available vs Occupied ─────────────────────────────────────
//   const availableTables = allTables.filter(
//     (t) => !tableOrderMap[t.Table_Name]
//   );
//   const occupiedTables = allTables.filter(
//     (t) => !!tableOrderMap[t.Table_Name]
//   );

//   // ── Search filter helpers ─────────────────────────────────────────────────
//   const matchesSearch = (tableName) => {
//     if (!searchTerm) return true;
//     const s = searchTerm.trim().toLowerCase();
//     const order = tableOrderMap[tableName];
//     if (tableName.toLowerCase().includes(s)) return true;
//     if (!order) return false;
//     return (
//       order.Order_Id?.toLowerCase().includes(s) ||
//       order.name?.toLowerCase().includes(s) ||
//       order.role?.toLowerCase().includes(s) ||
//       String(order.Amount || "").includes(s)
//     );
//   };

//   const filteredAvailable = availableTables.filter((t) => matchesSearch(t.Table_Name));
//   const filteredOccupied  = occupiedTables.filter((t)  => matchesSearch(t.Table_Name));

//   // ── Takeaway filter (unchanged) ───────────────────────────────────────────
//   // const filteredTakeawayOrders = takeawayTables.filter((order) => {
//   //   if (!searchTerm) return true;
//   //   const search = searchTerm.trim().toLowerCase();
//   //   return (
    
//   //     order.Customer_Name?.toLowerCase().includes(search) ||
//   //     order.Customer_Phone?.includes(search) ||
//   //     order.items?.some((item) => item.Item_Name?.toLowerCase().includes(search))
//   //   );
//   // });

//   // ── KOT print (unchanged) ─────────────────────────────────────────────────



//   // ── Shared occupied order card (reused for both sections) ─────────────────
//   const OccupiedTableCard = ({ table }) => {
//     const order = tableOrderMap[table.Table_Name];
//     const isHoldOrPaid = order.Status === "hold" || order.Status === "paid";
//     const borderColor = isHoldOrPaid ? "#ff9800" : "#22c55e"; // orange or green
//     const badgeBg    = isHoldOrPaid ? "bg-orange-500" : "bg-green-500";

//     return (
//       <div
//         className="bg-white rounded-lg p-4 shadow-md relative border-2 cursor-pointer"
//         style={{ borderColor }}
//         onClick={() =>
//           navigate(`/staff/orders/table-order-details/${order.Order_Id}`)
//         }
//       >
//         {/* Status badge */}
//         <div className="flex justify-end items-center w-full gap-2 mb-2">
//           <div className={`px-3 py-1 text-sm font-bold text-white ${badgeBg}`}>
//             {order.Status}
//           </div>
//         </div>

//         {/* Table name + waiter */}
//         <div className="mt-2 flex justify-between items-start">
//           <h5 className="text-xs sm:text-sm font-bold mb-1 text-gray-700">
//             {order.Tables.join(", ")}
//           </h5>
//           {order.orderBy === "waiter" && (
//             <h5 className="text-xs sm:text-sm font-bold mb-1" style={{ color: "#ff0000" }}>
//               {order?.name} ({order?.role})
//             </h5>
//           )}
//         </div>

//         {/* Timer */}
//         <div className="flex items-center bg-gray-100 p-3 rounded-md mb-4">
//           <Clock size={18} className="text-teal-600 mr-2" />
//           <span className="font-mono font-bold text-lg text-gray-800">
//             {getElapsedTime(order?.Table_Start_Time)}
//           </span>
//         </div>

//         {/* Amount */}
//         <div className="border-t pt-3 flex justify-between items-center">
//           <span className="text-sm text-gray-600">Amount:</span>
//           <span className="text-xl font-bold text-teal-600">₹{order?.Amount}</span>
//         </div>

//         {/* Buttons */}
//         <div
//           className="flex justify-center items-center flex-col gap-2 mt-2"
//           onClick={(e) => e.stopPropagation()} // prevent card click when clicking buttons
//         >
//           <button
//             style={{ backgroundColor: "#ff0000" }}
//             className="text-white mt-2 font-bold py-2 px-4 rounded whitespace-nowrap"
//             onClick={() =>
//               navigate(`/staff/orders/table-order-details/${order?.Order_Id}`)
//             }
//           >
//             View Details
//           </button>

       
//         </div>
//       </div>
//     );
//   };

//   // ── Available table card ───────────────────────────────────────────────────
//   const AvailableTableCard = ({ table }) => (
//     <div
//       className="bg-white rounded-lg p-4 shadow-md relative border-2 cursor-pointer
//                  hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
//       style={{ borderColor: "#d1d5db" }}   // gray border
//       onClick={() =>
//         //navigate(`/staff/orders/add?table=${encodeURIComponent(table?.Table_Name)}`)
//                navigate(`/waiter/orders/add/${encodeURIComponent(table?.Table_Name)}`)
//       }
//     >
//       {/* Available badge */}
//       <div className="flex justify-end mb-2">
//         <div className="px-3 py-1 text-sm font-bold text-white bg-green-600">
//           Available
//         </div>
//       </div>

//       {/* Table name */}
//       <div className="flex items-center justify-center h-16">
//         <h5 className="text-base sm:text-lg font-bold text-gray-700 text-center">
//           {table?.Table_Name}
//         </h5>
//       </div>

//       {/* Capacity if present */}
//       {table?.Table_Capacity && (
//         <div className="border-t pt-2 flex justify-between items-center mt-2">
//           <span className="text-xs ">Capacity</span>
//           <span className="text-sm font-semibold text-gray-600">{table?.Table_Capacity}</span>
//         </div>
//       )}

//       {/* CTA */}
//       <div className="flex justify-center mt-3">
//         <span className="text-xs  font-medium">Click to take order →</span>
//       </div>
//     </div>
//   );

//   const nothingFound =
//     filteredAvailable.length === 0 &&
//     filteredOccupied.length === 0

//   // ══════════════════════════════════════════════════════════════════════════
//   return (
//     <>
//       <div style={{ padding: "20px", width: "100%", height: "100%" }} className="box-inn-sp">

//         {/* ── Header ── */}
//         <div className="inn-title w-full px-1 py-1">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full h-full">
//             <div className="w-full sm:w-auto">
//               <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">All Table Details</h4>
//             </div>
//             <div className="w-full flex flex-col sm:flex-row sm:justify-end sm:items-center sm:w-1/2 gap-3">
//               <input
//                 type="text"
//                 placeholder="Search ..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-1/2"
//               />
//               {/* <button
//                 type="button"
//                 onClick={() => navigate("/staff/orders/add")}
//                 className="h-12 px-4 text-white font-bold rounded flex items-center justify-center whitespace-nowrap"
//                 style={{ backgroundColor: "#ff0000" }}
//               >
//                 Add Order
//               </button> */}
//             </div>
//           </div>
//         </div>

//         {/* ── Legend ── */}
//         <div className="flex flex-wrap gap-3 px-2 mt-4 mb-4">
//           <div className="flex items-center gap-1.5">
//             <div className="w-4 h-4 rounded-full bg-green-600" />
//             <span className="text-sm ">Active order</span>
//           </div>
//           <div className="flex items-center gap-1.5">
//             <div className="w-4 h-4 rounded-full bg-orange-600" />
//             <span className="text-sm ">Hold / Paid</span>
//           </div>
//           <div className="flex items-center gap-1.5">
//             <div className="w-4 h-4 rounded-full bg-gray-400" />
//             <span className="text-sm ">Available</span>
//           </div>
//         </div>

//         <div className="p-2 bg-gray-100">

//           {/* ══════════════════════════════════════════
//               SECTION 1 — OCCUPIED TABLES (with orders)
//           ══════════════════════════════════════════ */}
//           {filteredOccupied?.length > 0 && (
//             <div className="mb-8">
//               <div className="flex items-center gap-2 mb-3">
//                 <div className="w-4 h-4 rounded-full bg-green-600 flex-shrink-0" />
//                 <h5 className="text-base font-bold text-gray-700">
//                   Occupied Tables
//                   <span className="ml-2  font-normal ">
//                     ({filteredOccupied?.length})
//                   </span>
//                 </h5>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                 {filteredOccupied.map((table) => (
//                   <OccupiedTableCard key={table.Table_Id || table.Table_Name} table={table} />
//                 ))}
//               </div>
//             </div>
//           )}

       
//           {/* ══════════════════════════════════════════
//               SECTION 3 — AVAILABLE TABLES
//           ══════════════════════════════════════════ */}
//           {filteredAvailable.length > 0 && (
//             <div className="mb-8">
//               <div className="flex items-center gap-2 mb-3">
//                 <div className="w-4 h-4 rounded-full bg-gray-400 flex-shrink-0" />
//                 <h5 className="text-base font-bold text-gray-700">
//                   Available Tables
//                   <span className="ml-2  font-normal ">
//                     ({filteredAvailable.length})
//                   </span>
//                 </h5>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                 {filteredAvailable.map((table) => (
//                   <AvailableTableCard key={table.Table_Id || table.Table_Name} table={table} />
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* ── Nothing found ── */}
//           {nothingFound && (
//             <div className="flex flex-col items-center justify-center w-full text-center py-16">
//               <div className="bg-white rounded-full p-8 shadow-lg mb-6">
//                 <Armchair className="w-20 h-20 text-gray-300" />
//               </div>
//               <h2 className="text-2xl font-bold text-gray-700 mb-2">No tables found</h2>
//               <p className="text-gray-500">Waiting for new orders to arrive...</p>
//               <div className="mt-6 flex gap-2">
//                 <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" />
//                 <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
//                 <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
//               </div>
//             </div>
//           )}

//         </div>
//       </div>
//     </>
//   );
// }
