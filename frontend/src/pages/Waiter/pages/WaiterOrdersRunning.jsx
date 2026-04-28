

// import  { useState, useEffect } from 'react';
// import {  Clock,  Armchair } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';


// import { useDispatch, useSelector } from 'react-redux';

// import { useGetOrdersByWaiterQuery } from '../../../redux/Waiter/waiterApi';
// import { io } from 'socket.io-client';
// import { toast } from 'react-toastify';

// const socket = io("http://localhost:4000", {
//   transports: ["websocket"],
// });
  

// export default function WaiterOrders() {
// //   const formatTime = (time) => {
// //   if (!time) return "--";
// //   const d = new Date(time);
// //   d.setSeconds(0);
// //   return d.toLocaleTimeString([], {
// //     hour: "2-digit",
// //     minute: "2-digit",
// //   });
// // };
// const { user } = useSelector((state) => state.user);
// //console.log(user);
//     const navigate = useNavigate()
//     const dispatch = useDispatch();
//   const [searchTerm, setSearchTerm] = useState('');
// //   const [tables, setTables] = useState([]);
//   const [currentTime, setCurrentTime] = useState(new Date());

//   // const { data: userMe,  } = useGetUserQuery();
//   // console.log(userMe,"userMe in header");
// // const [kotNotifications, setKotNotifications] = useState([]);
// const { data: waiterOrders } = useGetOrdersByWaiterQuery();
// // const { data: waiterOrders } = useGetOrdersByWaiterQuery(undefined, {
// //   refetchOnMountOrArgChange: false,
// //   refetchOnFocus: false,
// //   refetchOnReconnect: false,
// // });

// const [localOrders, setLocalOrders] = useState([]);

// //const[takeawayCancelOrder,{isLoading:isTakeawayCancelOrderLoading}]=useCancelTakeawayOrderMutation();
// // const[takeawayCompleteOrder,{isLoading:isTakeawayCompleteOrderLoading}]=useCompleteTakeawayOrderMutation();
// //console.log("Waiter Orders Data:", waiterOrders);
//   // const {data:waiterOrders} = useGetTablesHavingOrdersQuery()
// //  useEffect(() => {
// //   console.log("API RESPONSE:", waiterOrders);
// // }, [waiterOrders]);
// useEffect(() => {
//   if (waiterOrders?.waiterOrders && localOrders.length === 0) {
//     setLocalOrders(waiterOrders.waiterOrders);
//   }
// }, [waiterOrders]);

// // useEffect(() => {
// //   if (waiterOrders?.waiterOrders && localOrders.length === 0) {
// //     setLocalOrders(waiterOrders.waiterOrders);
// //   }
// // }, [waiterOrders]);
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
// const rawTables = localOrders;

//  //Step 2: Group by Order_Id
// const grouped = Object.values(
//   rawTables.reduce((acc, row) => {
//     if (!acc[row.Order_Id]) {
//       acc[row.Order_Id] = {
//         Order_Id: row.Order_Id,
//         Amount: row.Amount,
//         Status: row.Status,
//         User_Id: row.User_Id,
//         Tax_Type: row.Tax_Type,
//         Tax_Amount: row.Tax_Amount,
//         Sub_Total: row.Sub_Total,
//         Payment_Type: row.Payment_Type,
//         Payment_Status: row.Payment_Status,
//         orderType: row.orderType, 
//         Tables: [],    // Will store all table names
//         TableIds: [],  // Optional: useful for split/merge later
//         Table_Start_Time: row.Table_Start_Time, // same for all tables in same order
//       };
//     }

//     // Push table into group
//     acc[row.Order_Id].Tables.push(row.Table_Name);
//     acc[row.Order_Id].TableIds.push(row.Table_Id);

//     return acc;
//   }, {})
// );
// // const filteredTables = grouped.filter(order =>
// //   order.Tables.join(", ").toLowerCase().includes(searchTerm.toLowerCase()) ||
// //   order.Order_Id.toLowerCase().includes(searchTerm.toLowerCase())
// // );
// // const filteredTables = grouped.filter(order =>
// //   order.Tables.join(", ").toLowerCase()||
// //   order.Order_Id.toLowerCase()
// // );

// const filteredTables = grouped.filter((order) => {
//   if (!searchTerm) return true;

//   const search = searchTerm.trim().toLowerCase();

//   const tableNames = order.Tables.join(", ").toLowerCase();
//   const orderId = order.Order_Id?.toLowerCase() || "";
//   const customerName = order.Customer_Name?.toLowerCase() || "";
//   const customerPhone = order.Customer_Phone || "";

//   const itemMatch = order.items?.some(item =>
//     item.Item_Name?.toLowerCase().includes(search)
//   );

//   return (
//     tableNames.includes(search) ||
//     orderId.includes(search) ||
//     customerName.includes(search) ||
//     customerPhone.includes(search) ||
//     itemMatch
//   );
// });


// // console.log("Raw Tables Data:", rawTables, "Takeaway Tables Data:", takeawayTables);


// // const handleCancelTakeawayOrder = async(Takeaway_Order_Id) => {

// //   console.log("Takeaway order cancelled:",Takeaway_Order_Id);
// // try{
// //   const response=await takeawayCancelOrder(Takeaway_Order_Id).unwrap();
// //   console.log("Takeaway order cancelled response:", response);
// //   dispatch(orderApi.util.invalidateTags(["Order"]));
// //  dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
// //   toast.success("Takeaway Order Cancelled Successfully!");
// // }catch(error){
// //   console.error("Error cancelling takeaway order:", error);
// // }

// // };






// //console.log(filteredTables,filteredTakeawayOrders);
// //console.log("KOT Notifications:", kotNotifications);

//   return (
//     <>
      
      
//       <div className="sb2-2-3" style={{height:"100%"}}>
//         <div className="row" style={{ margin: "0px" }}>
//           <div className="flex">
//             <div style={{ padding: "20px" , width: "100%",height:"100%"}} className="box-inn-sp">
              
//               <div className="inn-title w-full px-1 py-1">
//                 <div className="flex flex-col sm:flex-row justify-between 
//                 items-start sm:items-center w-full ">
                  
//                   {/* LEFT HEADER */}
//                   <div className="w-full sm:w-auto">
//                     <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">All Table Details</h4>
//                   </div>

//                   {/* RIGHT BUTTON SECTION */}
//                     {/* <div className="
//       w-full sm:w-auto 
//       flex 
//       justify-start sm:justify-end 
//       gap-4
//     ">
                    

                   

                        
//       <input
//         type="text"
//         placeholder="Search ..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="w-full"
//       />
    
//                     <button
//                       type="button"
//                       onClick={() =>navigate("/staff/orders/add")}
//                       className="text-white font-bold py-2 px-4 rounded"
//                       style={{ backgroundColor: "#ff0000" }}
//                     >
//                       Add Order
//                     </button>
                  
                   
//                   </div> */}
// <div
//   className="
//     w-full
//     flex
//     flex-col
    
//     sm:flex-row
//     sm:justify-end
//     sm:items-center
//     sm:w-1/2
//     gap-3
//   "
// >
//   {/* Search Input */}
//   <input
//     type="text"
//     placeholder="Search ..."
//     value={searchTerm}
//     onChange={(e) => setSearchTerm(e.target.value)}
//       className='w-1/2'                
//   />

//   {/* Add Order Button */}
//    <button
//   type="button"
//   onClick={() => navigate("/waiter/orders/add")}
//   className="
//     h-12
//     px-4
//     text-white
//     font-bold
//     rounded
//     flex items-center justify-center
//     whitespace-nowrap
//   "
//   style={{ backgroundColor: "#ff0000" }}
// >
//   Add Order
// </button>

// </div>


//                 </div>
//               </div>
              
//              <div 
//               className="p-2 bg-gray-100">
//   <div className="
//     grid 
//     grid-cols-1 
//     sm:grid-cols-2 
//     md:grid-cols-3 
//     lg:grid-cols-4 
//     gap-6
//   ">

    
// {filteredTables.length > 0 && filteredTables.map((order) => (
//   <div
//     key={order.Order_Id || order.Takeaway_Order_Id}
//     className="bg-white rounded-lg p-4 shadow-md relative border"
//     style={{
//       borderColor:
//         order.Status === "hold" || order.Status === "paid"
//           ? "#ff9800"
//           : "#ff0000"
//     }}
//   >

//     {/* Status Badge */}
//     <div
//       className={`absolute top-2 right-2 px-3 py-1  text-xs font-bold text-white 
//         ${
//           order.Status === "hold" || order.Status === "paid"
//             ? "bg-orange-500"
//             : "bg-green-500"
//         }`}
//     >
//       {order?.Status}
//     </div>

//     {/* 🟩 DINE-IN ORDER CARD */}
//     {order?.orderType === "dinein" && (
//       <>
//       <h5 className="text-xs sm:text-sm font-bold mb-1 text-gray-700">
//         {/* <h5 className=" font-bold text-gray-800  sm:text-xl mb-1"> */}
//           {order?.Tables.join(", ")}
//         {/* </h5> */}
//         </h5>

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

//         {/* View Details */}
//         <div className="flex justify-center items-center">
//           <button
//             style={{ backgroundColor: "#ff0000" }}
//             className="text-white mt-2 font-bold py-2 px-4 rounded"
//             onClick={() =>
//               navigate(`/waiter/orders/update-order/${order?.Order_Id}`)
//             }
//           >
//             View Details
//           </button>
//         </div>
//       </>
//     )}

   


//   </div>
// ))}


    


//   </div>

//     {/* No results */}
//     {filteredTables.length === 0   && (
     
//          <div className="flex flex-col items-center justify-center w-full  text-center">
//                   <div className="bg-white rounded-full p-8 shadow-lg mb-6">
//                   <Armchair className="w-20 h-20 text-gray-300" />
//                   </div>
//                   <h2 className="text-2xl font-bold text-gray-700 mb-2">
//                     No tables having orders found
//                   </h2>
//                   <p className="text-gray-500">
//                     Waiting for new orders to arrive...
//                   </p>
//                   <div className="mt-6 flex gap-2">
//                     <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
//                     <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
//                     <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
//                   </div>
//                 </div>
//     )}

// </div>

//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }




import  { useState, useEffect } from 'react';
import {  Clock,  Armchair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


import { useDispatch, useSelector } from 'react-redux';

import { useGetOrdersByWaiterQuery } from '../../../redux/Waiter/waiterApi';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});
  

export default function WaiterOrders() {
//   const formatTime = (time) => {
//   if (!time) return "--";
//   const d = new Date(time);
//   d.setSeconds(0);
//   return d.toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };
const { user } = useSelector((state) => state.user);
//console.log(user);
    const navigate = useNavigate()
    const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
//   const [tables, setTables] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // const { data: userMe,  } = useGetUserQuery();
  // console.log(userMe,"userMe in header");
// const [kotNotifications, setKotNotifications] = useState([]);
const { data: waiterOrders } = useGetOrdersByWaiterQuery();
// const { data: waiterOrders } = useGetOrdersByWaiterQuery(undefined, {
//   refetchOnMountOrArgChange: false,
//   refetchOnFocus: false,
//   refetchOnReconnect: false,
// });

const [localOrders, setLocalOrders] = useState([]);

//const[takeawayCancelOrder,{isLoading:isTakeawayCancelOrderLoading}]=useCancelTakeawayOrderMutation();
// const[takeawayCompleteOrder,{isLoading:isTakeawayCompleteOrderLoading}]=useCompleteTakeawayOrderMutation();
//console.log("Waiter Orders Data:", waiterOrders);
  // const {data:waiterOrders} = useGetTablesHavingOrdersQuery()
//  useEffect(() => {
//   console.log("API RESPONSE:", waiterOrders);
// }, [waiterOrders]);
useEffect(() => {
  if (waiterOrders?.waiterOrders && localOrders.length === 0) {
    setLocalOrders(waiterOrders.waiterOrders);
  }
}, [waiterOrders]);

// useEffect(() => {
//   if (waiterOrders?.waiterOrders && localOrders.length === 0) {
//     setLocalOrders(waiterOrders.waiterOrders);
//   }
// }, [waiterOrders]);
useEffect(() => {
  if (!user?.User_Id || user?.role !== "waiter") return;

  socket.connect(); // 🔥 connect now (not earlier)

  socket.emit("join_waiter_room", user.User_Id);
  console.log("🧑‍🍳 Joined waiter room:", user.User_Id);

  return () => {
    socket.emit("leave_waiter_room", user.User_Id);
    socket.disconnect();
  };
}, [user?.User_Id]);



// useEffect(() => {
//   if (!waiterOrders) return;

//   const allOrders = [
//     ...(waiterOrders.waiterOrders ?? []),
   
//   ];

//   allOrders.forEach((o) => {
//     if (o.KOT_Id) {
      
//       console.log("📡 Joined order room:", o.KOT_Id);
//     }
//   });
// }, [waiterOrders]);

useEffect(() => {
  const onOrderClosed = ({ Order_Id, message }) => {
    console.log("🔥 waiter_order_closed:", Order_Id, message);

    // 🔥 instant UI update
    setLocalOrders(prev =>
      prev.filter(o => String(o.Order_Id) !== String(Order_Id))
    );

    // ✅ show backend message
    toast.success(message || "Order completed");
  };

  socket.on("waiter_order_closed", onOrderClosed);

  return () => {
    socket.off("waiter_order_closed", onOrderClosed);
  };
}, []);




  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate elapsed time
  const getElapsedTime = (startTime) => {
    const start = new Date(startTime);
    const diff = Math.floor((currentTime - start) / 1000); // seconds
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Step 1: Extract raw rows safely
// const rawTables = waiterOrders?.waiterOrders ?? [];
const rawTables = localOrders;

 //Step 2: Group by Order_Id
const grouped = Object.values(
  rawTables.reduce((acc, row) => {
    if (!acc[row.Order_Id]) {
      acc[row.Order_Id] = {
        Order_Id: row.Order_Id,
        Amount: row.Amount,
        Status: row.Status,
        User_Id: row.User_Id,
        Tax_Type: row.Tax_Type,
        Tax_Amount: row.Tax_Amount,
        Sub_Total: row.Sub_Total,
        Payment_Type: row.Payment_Type,
        Payment_Status: row.Payment_Status,
        orderType: row.orderType, 
        Tables: [],    // Will store all table names
        TableIds: [],  // Optional: useful for split/merge later
        Table_Start_Time: row.Table_Start_Time, // same for all tables in same order
      };
    }

    // Push table into group
    acc[row.Order_Id].Tables.push(row.Table_Name);
    acc[row.Order_Id].TableIds.push(row.Table_Id);

    return acc;
  }, {})
);
// const filteredTables = grouped.filter(order =>
//   order.Tables.join(", ").toLowerCase().includes(searchTerm.toLowerCase()) ||
//   order.Order_Id.toLowerCase().includes(searchTerm.toLowerCase())
// );
// const filteredTables = grouped.filter(order =>
//   order.Tables.join(", ").toLowerCase()||
//   order.Order_Id.toLowerCase()
// );

const filteredTables = grouped.filter((order) => {
  if (!searchTerm) return true;

  const search = searchTerm.trim().toLowerCase();

  const tableNames = order.Tables.join(", ").toLowerCase();
  const orderId = order.Order_Id?.toLowerCase() || "";
  const customerName = order.Customer_Name?.toLowerCase() || "";
  const customerPhone = order.Customer_Phone || "";

  const itemMatch = order.items?.some(item =>
    item.Item_Name?.toLowerCase().includes(search)
  );

  return (
    tableNames.includes(search) ||
    orderId.includes(search) ||
    customerName.includes(search) ||
    customerPhone.includes(search) ||
    itemMatch
  );
});


// console.log("Raw Tables Data:", rawTables, "Takeaway Tables Data:", takeawayTables);


// const handleCancelTakeawayOrder = async(Takeaway_Order_Id) => {

//   console.log("Takeaway order cancelled:",Takeaway_Order_Id);
// try{
//   const response=await takeawayCancelOrder(Takeaway_Order_Id).unwrap();
//   console.log("Takeaway order cancelled response:", response);
//   dispatch(orderApi.util.invalidateTags(["Order"]));
//  dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
//   toast.success("Takeaway Order Cancelled Successfully!");
// }catch(error){
//   console.error("Error cancelling takeaway order:", error);
// }

// };






//console.log(filteredTables,filteredTakeawayOrders);
//console.log("KOT Notifications:", kotNotifications);

  return (
    <>
      
      
      <div className="sb2-2-3" style={{height:"100%"}}>
        <div className="row" style={{ margin: "0px" }}>
          <div className="flex">
            <div style={{ padding: "20px" , width: "100%",height:"100%"}} className="box-inn-sp">
              
              <div className="inn-title w-full px-1 py-1">
                <div className="flex flex-col sm:flex-row justify-between 
                items-start sm:items-center w-full ">
                  
                  {/* LEFT HEADER */}
                  <div className="w-full sm:w-auto">
                    <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">All Table Details</h4>
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
  onClick={() => navigate("/waiter/orders/add")}
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
  Add Order
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

    
{filteredTables.length > 0 && filteredTables.map((order) => (
  <div
    key={order.Order_Id || order.Takeaway_Order_Id}
    className="bg-white rounded-lg p-4 shadow-md relative border"
    style={{
      borderColor:
        order.Status === "hold" || order.Status === "paid"
          ? "#ff9800"
          : "#ff0000"
    }}
  >

    {/* Status Badge */}
    <div
      className={`absolute top-2 right-2 px-3 py-1  text-xs font-bold text-white 
        ${
          order.Status === "hold" || order.Status === "paid"
            ? "bg-orange-500"
            : "bg-green-500"
        }`}
    >
      {order?.Status}
    </div>

    {/* 🟩 DINE-IN ORDER CARD */}
    {order?.orderType === "dinein" && (
      <>
      <h5 className="text-xs sm:text-sm font-bold mb-1 text-gray-700">
        {/* <h5 className=" font-bold text-gray-800  sm:text-xl mb-1"> */}
          {order?.Tables.join(", ")}
        {/* </h5> */}
        </h5>

        {/* Timer */}
        <div className="flex items-center bg-gray-100 p-3 rounded-md mb-4">
          <Clock size={18} className="text-teal-600 mr-2" />
          <span className="font-mono font-bold text-lg text-gray-800">
            {getElapsedTime(order?.Table_Start_Time)}
          </span>
        </div>

        {/* Amount */}
        <div className="border-t pt-3 flex justify-between items-center">
          <span className="text-sm text-gray-600">Amount:</span>
          <span className="text-xl font-bold text-teal-600">₹{order?.Amount}</span>
        </div>

        {/* View Details */}
        <div className="flex justify-center items-center">
          <button
            style={{ backgroundColor: "#ff0000" }}
            className="text-white mt-2 font-bold py-2 px-4 rounded"
            onClick={() =>
              navigate(`/waiter/orders/update-order/${order?.Order_Id}`)
            }
          >
            View Details
          </button>
        </div>
      </>
    )}

   


  </div>
))}


    


  </div>

    {/* No results */}
    {filteredTables.length === 0   && (
     
         <div className="flex flex-col items-center justify-center w-full  text-center">
                  <div className="bg-white rounded-full p-8 shadow-lg mb-6">
                  <Armchair className="w-20 h-20 text-gray-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-700 mb-2">
                    No tables having orders found
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
          </div>
        </div>
      </div>
    </>
  );
}









// import  { useState, useEffect } from 'react';
// import {  Clock,  Armchair } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { orderApi,   useKOTOfOrdersTakenByWaiterMutation,   useGetTablesHavingOrdersQuery } from '../../redux/api/Staff/orderApi';
// import { io } from 'socket.io-client';
// import { useDispatch } from 'react-redux';
// import { toast } from 'react-toastify';


// const socket = io("http://localhost:4000", {
//   transports: ["websocket"],
// });


// export default function OrderDetails() {
//   //  const {waiterOrdersToBePrinted} =useSelector((state)=>state.user)
//   const formatTime = (time) => {
//   if (!time) return "--";
//   const d = new Date(time);
//   d.setSeconds(0);
//   return d.toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

//     const navigate = useNavigate()
//     const dispatch = useDispatch();
//   const [searchTerm, setSearchTerm] = useState('');
// //   const [tables, setTables] = useState([]);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [kotNotifications, setKotNotifications] = useState({});

// // const [kotNotifications, setKotNotifications] = useState([]);
// const { data: tableHavingOrders} = useGetTablesHavingOrdersQuery();
// //const[takeawayCancelOrder,{isLoading:isTakeawayCancelOrderLoading}]=useCancelTakeawayOrderMutation();
// // const[takeawayCompleteOrder,{isLoading:isTakeawayCompleteOrderLoading}]=useCompleteTakeawayOrderMutation();

//   // const {data:tableHavingOrders} = useGetTablesHavingOrdersQuery()

//   const [waiterOrdersToBePrinted]=useKOTOfOrdersTakenByWaiterMutation()
//  useEffect(() => {
//   console.log("API RESPONSE:", tableHavingOrders);
// }, [tableHavingOrders]);
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
// const rawTables = tableHavingOrders?.tableHavingOrders ?? [];
// const takeawayTables = tableHavingOrders?.takeawayOrders ?? [];
//  //Step 2: Group by Order_Id
// const grouped = Object.values(
//   rawTables.reduce((acc, row) => {
//     if (!acc[row.Order_Id]) {
//       acc[row.Order_Id] = {
//         Order_Id: row.Order_Id,
//         Amount: row.Amount,
//         Status: row.Status,
//         User_Id: row.User_Id,
//         Tax_Type: row.Tax_Type,
//         Tax_Amount: row.Tax_Amount,
//         Sub_Total: row.Sub_Total,
//         Payment_Type: row.Payment_Type,
//         Payment_Status: row.Payment_Status,
//         orderType: row.orderType, 
//         Tables: [],    // Will store all table names
//         TableIds: [],  // Optional: useful for split/merge later
//         Table_Start_Time: row.Table_Start_Time, // same for all tables in same order
//         name: row.name,
//         role: row.role,
//         orderBy: row.orderBy
//       };
//     }

//     // Push table into group
//     acc[row.Order_Id].Tables.push(row.Table_Name);
//     acc[row.Order_Id].TableIds.push(row.Table_Id);

//     return acc;
//   }, {})
// );
// // const filteredTables = grouped.filter(order =>
// //   order.Tables.join(", ").toLowerCase().includes(searchTerm.toLowerCase()) ||
// //   order.Order_Id.toLowerCase().includes(searchTerm.toLowerCase())
// // );
// // const filteredTables = grouped.filter(order =>
// //   order.Tables.join(", ").toLowerCase()||
// //   order.Order_Id.toLowerCase()
// // );

// const filteredTables = grouped.filter((order) => {
//   if (!searchTerm) return true;

//   const search = searchTerm.trim().toLowerCase();

//   const tableNames = order.Tables.join(", ").toLowerCase();
//   const orderId = order.Order_Id?.toLowerCase() || "";
//   const customerName = order.Customer_Name?.toLowerCase() || "";
//   const customerPhone = order.Customer_Phone || "";
//   const Name=order?.name||"";
//   const role=order?.role||"";
//   const orderBy=order?.orderBy||"";
//   const itemMatch = order.items?.some(item =>
//     item.Item_Name?.toLowerCase().includes(search)
//   );

//   return (
//     tableNames.includes(search) ||
//     orderId.includes(search) ||
//     customerName.includes(search) ||
//     customerPhone.includes(search) ||
//     Name.includes(search) ||
//     role.includes(search) ||
//     orderBy.includes(search) ||
//     itemMatch
//   );
// });


// // console.log("Raw Tables Data:", rawTables, "Takeaway Tables Data:", takeawayTables);


// // const handleCancelTakeawayOrder = async(Takeaway_Order_Id) => {

// //   console.log("Takeaway order cancelled:",Takeaway_Order_Id);
// // try{
// //   const response=await takeawayCancelOrder(Takeaway_Order_Id).unwrap();
// //   console.log("Takeaway order cancelled response:", response);
// //   dispatch(orderApi.util.invalidateTags(["Order"]));
// //  dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
// //   toast.success("Takeaway Order Cancelled Successfully!");
// // }catch(error){
// //   console.error("Error cancelling takeaway order:", error);
// // }

// // };

// // console.log(waiterOrdersToBePrinted,"waiterOrdersToBePrinted");
// const printKOTInvoice = (kitchens) => {
//   if (!kitchens || Object.keys(kitchens).length === 0) {
//     console.log("No kitchens to print");
//     return;
//   }
//   console.log("Preparing to print KOT invoice for kitchens:", kitchens);
//   const getCurrentDate = () =>
//     new Date().toLocaleDateString("en-GB");

//   const getCurrentTime = () =>
//     new Date().toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });

//   const kitchenSections = Object.entries(kitchens).map(([kitchenName, items], index) => `
//       ${index > 0 ? `<div class="line"></div>` : ``}

//       <div class="invoice-kitchen">
//         <div class="header-center">
//         <div class="brand">DINE-IN</div>
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
  
//   @page { size: 58mm auto; margin: 0; }
// </style>
// </head>
// <body>
//   <div class="invoice">
//     ${kitchenSections}
//   </div>
// </body>
// </html>`;

//   const iframe = document.createElement("iframe");
//   iframe.style.display = "none";
//   document.body.appendChild(iframe);

//   // iframe.contentDocument.open();
//   // iframe.contentDocument.write(html);
//   // iframe.contentDocument.close();

//   // iframe.onload = () => {
//   //   iframe.contentWindow.print();
//   // };
//   iframe.onload = () => {
//   iframe.contentWindow.focus();
//   iframe.contentWindow.print();
// };

// iframe.contentDocument.open();
// iframe.contentDocument.write(html);
// iframe.contentDocument.close();


//   setTimeout(() => document.body.removeChild(iframe), 1000);
// };

// const filteredTakeawayOrders = takeawayTables.filter((order) => {
//   if (!searchTerm) return true;

//   const search = searchTerm.trim().toLowerCase();

//   const orderId = order.Takeaway_Order_Id?.toLowerCase() || "";
//   const customerName = order.Customer_Name?.toLowerCase() || "";
//   const customerPhone = order.Customer_Phone || "";

//   const itemMatch = order.items?.some(item =>
//     item.Item_Name?.toLowerCase().includes(search)
//   );

//   return (
//     orderId.includes(search) ||
//     customerName.includes(search) ||
//     customerPhone.includes(search) ||
//     itemMatch
//   );
// });
// const handleKOTOfOrderTakenByWaiter= async(Order_Id) => {
//   if(!Order_Id) return;
//   try{
// const res=await waiterOrdersToBePrinted({Order_Id}).unwrap();
// console.log("KOT API response for Order_Id", Order_Id, ":", res);
// if (res?.elligibleItems && Object.keys(res.elligibleItems).length > 0) {
//   printKOTInvoice(res.elligibleItems);
// } else {
//  toast.info("No items available for KOT for this order.");
// }

//   }catch(err){
//     console.log(err);
//   }
// }
// //console.log(filteredTables);
// //console.log("KOT Notifications:", kotNotifications);

//   return (
//     <>
//        {/* <div className="sb2-2-3" style={{height:"100%"}}>
//         <div className="row" style={{ margin: "0px" }}> */}
      
   
          
//             <div style={{ padding: "20px" , width: "100%",height:"100%"}} 
//             className="box-inn-sp">
              
//               <div className="inn-title w-full px-1 py-1">
//                 <div className="flex flex-col sm:flex-row justify-between 
//                 items-start sm:items-center w-full h-full">
                  
//                   {/* LEFT HEADER */}
//                   <div className="w-full sm:w-auto">
//                     <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">All Table Details</h4>
//                   </div>

//                   {/* RIGHT BUTTON SECTION */}
//                     {/* <div className="
//       w-full sm:w-auto 
//       flex 
//       justify-start sm:justify-end 
//       gap-4
//     ">
                    

                   

                        
//       <input
//         type="text"
//         placeholder="Search ..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="w-full"
//       />
    
//                     <button
//                       type="button"
//                       onClick={() =>navigate("/staff/orders/add")}
//                       className="text-white font-bold py-2 px-4 rounded"
//                       style={{ backgroundColor: "#ff0000" }}
//                     >
//                       Add Order
//                     </button>
                  
                   
//                   </div> */}
// <div
//   className="
//     w-full
//     flex
//     flex-col
    
//     sm:flex-row
//     sm:justify-end
//     sm:items-center
//     sm:w-1/2
//     gap-3
//   "
// >
//   {/* Search Input */}
//   <input
//     type="text"
//     placeholder="Search ..."
//     value={searchTerm}
//     onChange={(e) => setSearchTerm(e.target.value)}
//       className='w-1/2'                
//   />

//   {/* Add Order Button */}
//    <button
//   type="button"
//   onClick={() => navigate("/staff/orders/add")}
//   className="
//     h-12
//     px-4
//     text-white
//     font-bold
//     rounded
//     flex items-center justify-center
//     whitespace-nowrap
//   "
//   style={{ backgroundColor: "#ff0000" }}
// >
//   Add Order
// </button>

// </div>


//                 </div>
//               </div>
              
//              <div 
             
//               className="p-2 bg-gray-100">
//   <div className="
//     grid 
//     grid-cols-1 
//     sm:grid-cols-2 
//     md:grid-cols-3 
//     lg:grid-cols-4 
//     gap-6
//   ">

    
// {filteredTables.length > 0 && filteredTables.map((order) => (
//   <div
//     key={order.Order_Id || order.Takeaway_Order_Id}
//     className="bg-white rounded-lg p-4 shadow-md relative border"
//     style={{
//       borderColor:
//         order.Status === "hold" || order.Status === "paid"
//           ? "#ff9800"
//           : "#ff0000"
//     }}
//   >
// {/* {order?.Waiter_Name &&<h5 className="text-xs sm:text-sm font-bold mb-1 text-gray-700">
//         {/* <h5 className=" font-bold text-gray-800  sm:text-xl mb-1"> 
//           {order?.Waiter_Name}
        
//         </h5>} */}
//     {/* Status Badge */}
//    <div className='flex justify-end items-center w-full gap-2 mb-2'>
//       {/* {order?.Waiter_Name && <div className="text-xs sm:text-sm font-bold mb-1 text-gray-700">
//          <h5 className=" font-bold text-gray-800  sm:text-xl mb-1"> 
//           {order?.Waiter_Name}
//         </h5>
//         </div>} */}
//     <div
//       className={` px-3 py-1  text-xs font-bold text-white 
//         ${
//           order.Status === "hold" || order.Status === "paid"
//             ? "bg-orange-500"
//             : "bg-green-500"
//         }`}
//     >
//       {order?.Status}
//     </div>
//     </div>
//     {/* 🟩 DINE-IN ORDER CARD */}
//     {order?.orderType === "dinein" && (
//       <>
//       <div className='mt-2 flex justify-between items-start'>
//       <h5 className="text-xs sm:text-sm font-bold mb-1 text-gray-700">
//         {/* <h5 className=" font-bold text-gray-800  sm:text-xl mb-1"> */}
//           {order?.Tables.join(", ")}
//         {/* </h5> */}
//         </h5>
//         {order?.orderBy =="waiter" &&<h5 className="
//         text-xs sm:text-sm font-bold mb-1 text-red-700"
//         style={{color:"#ff0000"}}>
//         {/* <h5 className=" font-bold text-gray-800  sm:text-xl mb-1"> */}
//           {order?.name} ({order?.role})
//         {/* </h5> */}
//         </h5>}
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

//         {/* View Details */}
//         <div className="flex justify-center items-center flex-col gap-2 mt-2">
//           <button
//             style={{ backgroundColor: "#ff0000" }}
//             className="text-white mt-2 font-bold py-2 px-4 rounded whitespace-nowrap"
//             onClick={() =>
//               navigate(`/staff/orders/table-order-details/${order?.Order_Id}`)
//             }
//           >
//             View Details
//           </button>

//            {order?.orderBy =="waiter" &&<button
//   type="button"
//   //  disabled={!isToday || printingOrderId === order?.Pre_Booked_Order_Id}
//   style={{
//     backgroundColor: "#ffa600",
   
//   }}
//   onClick={() => handleKOTOfOrderTakenByWaiter(order?.Order_Id)}
//   className="text-white mt-2 font-bold py-2 px-4 rounded whitespace-nowrap"
// >
//     {/* {printingOrderId === order?.Pre_Booked_Order_Id
//     ? "Printing..."
//     : "Print KOT"} */}
//   Print KOT
// </button>}
//         </div>
//       </>
//     )}

   


//   </div>
// ))}


//           {filteredTakeawayOrders.length > 0 &&
//   filteredTakeawayOrders.map((order) => {
//     // ✅ Get live KOT updates
//     const kotItems = kotNotifications[order.Takeaway_Order_Id] || [];

//     // ✅ Merge backend items with socket updates
//     const mergedItems = order.items
//   .map((backendItem) => {
//     const updated = kotItems.find(
//       (it) =>
//         String(it.KOT_Item_Id) === String(backendItem.KOT_Item_Id)
//     );

//     return {
//       KOT_Item_Id: backendItem?.KOT_Item_Id,
//       itemName: updated?.itemName || backendItem?.Item_Name,
//       quantity: updated?.quantity || backendItem?.Quantity,
//       status: updated?.status || backendItem?.Item_Status,
//       time: updated?.time || backendItem?.updated_at,
//     };
//   })
  


//     return (
//       <div
//         key={order?.Takeaway_Order_Id}
//         className="bg-white rounded-lg p-4 shadow-md relative border"
//         style={{
//           borderColor:
//             order?.Status === "hold" || order?.Status === "paid"
//               ? "#ff9800"
//               : "#ff0000",
//         }}
//       >
//         {/* Status Badge */}
//       {/* Status + Actions (Top Right) */}
// <div className=" flex justify-end  w-full gap-2 mb-2">
  
//   {/* Status Badge */}
//   {/* <button
//   type="button"
//     disabled={isTakeawayCompleteOrderLoading}
//     onClick={()=>handleCompleteTakeawayOrder(order?.Takeaway_Order_Id)}
//     className={`px-3 py-1  text-center text-xs font-semibold text-white capitalize
//       ${
//         order?.Status === "hold"
//           ? "bg-orange-500"
//           : order?.Status === "paid"
//           ? "bg-green-500"
//           : "bg-red-500"
//       }`}
//   >
//     {isTakeawayCompleteOrderLoading ? "Completing..." : order?.Status}
//   </button> */}

//   {/* Cancel Button */}
//   {/* <button
//     type="button"
//     disabled={isTakeawayCancelOrderLoading}
//     onClick={()=>handleCancelTakeawayOrder(order?.Takeaway_Order_Id)}
//     className="px-3 py-1  text-xs font-semibold text-white
//                bg-red-500 cursor-pointer"
//   >
//     {isTakeawayCancelOrderLoading ? "Canceling..." : "Cancel"}
//   </button> */}

// </div>

//         {/* Title */}
//         <div className='mt-2'>
//         {/* <h5 className="text-xs sm:text-sm font-bold mb-1 text-gray-700">
//           Takeaway Order {order?.Takeaway_Order_Id}
//         {/* <h5 className="font-semibold text-gray-800 sm:font-bold mb-3 text-xl "> 
          
//           </h5> */}

//           <h5 className="text-xs sm:text-sm font-bold  text-gray-700">
//           Takeaway
          
      
//           </h5>
//           <div className='flex flex-col'>
//           {order?.Customer_Name&&<span>{order?.Customer_Name}</span>}
//            <span>{order?.Customer_Phone}</span>
//            </div>
//             </div>
//         {/* </h5> */}

//         {/* Amount */}
//         <div className=" pt-3 flex justify-between items-center mb-2">
//           <span className="text-sm text-gray-600">Amount:</span>
//           <span className="text-xl font-bold text-teal-600">
//             ₹{order?.Amount}
//           </span>
//         </div>

//         {/* Kitchen Updates */}
//         <div className="bg-gray-100 rounded p-2 mt-2">
//           <h5 className="text-xs sm:text-sm font-bold mb-1 text-gray-700">
//   Kitchen Updates:
// </h5>

//           {/* <h4 className="text-sm font-bold mb-1 text-gray-700">
//             Kitchen Updates:
//           </h4> */}

//           {mergedItems.map((item) => (
//             <div
//               key={item.KOT_Item_Id}
//               className="flex justify-between gap-1 py-1 border-b last:border-none "
//             >
//               {/* Item Name */}
//               <span className="text-gray-800 text-sm">
//                 {item?.itemName} X{item?.quantity}
//               </span>

//               {/* Item Status */}
//               <span
//                 className={`text-xs font-bold ${
//                   item.status === "ready"
//                     ? "text-green-600"
//                     : item.status === "preparing"
//                     ? "text-orange-500"
//                     : "text-gray-600"
//                 }`}
//               >
//                 {item?.status}
//               </span>
//               <div className='flex whitespace-nowrap'>
//                 <span className="text-xs   text-gray-800">
//             {formatTime(item?.time)}
//               </span>
//               </div>
//             </div>
//           ))}
//                <div className="flex justify-center items-center">
//           <button
//             style={{ backgroundColor: "#ff0000" }}
//             className="text-white mt-2 font-bold py-2 px-4 rounded"
//             onClick={() =>
//               navigate(`/staff/update-orders-takeaway/${order?.Takeaway_Order_Id}`)
//             }
//           >
//             View Details
//           </button>
//         </div>
//         </div>
//       </div>
//     );
//   })}


//   </div>

//     {/* No results */}
//     {filteredTables.length === 0  && filteredTakeawayOrders.length === 0 && (
     
//          <div className="flex flex-col  items-center justify-center w-full  text-center">
//                   <div className="bg-white rounded-full p-8 shadow-lg mb-6">
//                   <Armchair className="w-20 h-20 text-gray-300" />
//                   </div>
//                   <h2 className="text-2xl font-bold text-gray-700 mb-2">
//                     No tables having orders found
//                   </h2>
//                   <p className="text-gray-500">
//                     Waiting for new orders to arrive...
//                   </p>
//                   <div className="mt-6 flex gap-2">
//                     <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
//                     <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
//                     <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
//                   </div>
//                 </div>
//     )}

// </div>

//             </div>
        
       
//     </>
//   );
// }


