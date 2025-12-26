
import  { useState, useEffect } from 'react';
import {  Clock,  Armchair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { orderApi, useCancelTakeawayOrderMutation, useCompleteTakeawayOrderMutation, useGetTablesHavingOrdersQuery } from '../../redux/api/Staff/orderApi';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { kitchenStaffApi } from '../../redux/api/KitchenStaff/kitchenStaffApi';
const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

export default function OrderDetails() {
  const formatTime = (time) => {
  if (!time) return "--";
  const d = new Date(time);
  d.setSeconds(0);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

    const navigate = useNavigate()
    const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
//   const [tables, setTables] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [kotNotifications, setKotNotifications] = useState({});

// const [kotNotifications, setKotNotifications] = useState([]);
const { data: tableHavingOrders, refetch } = useGetTablesHavingOrdersQuery();
const[takeawayCancelOrder,{isLoading:isTakeawayCancelOrderLoading}]=useCancelTakeawayOrderMutation();
const[takeawayCompleteOrder,{isLoading:isTakeawayCompleteOrderLoading}]=useCompleteTakeawayOrderMutation();

  // const {data:tableHavingOrders} = useGetTablesHavingOrdersQuery()
 useEffect(() => {
  console.log("API RESPONSE:", tableHavingOrders);
}, [tableHavingOrders]);
useEffect(() => {
  // const handleOrderUpdate = (data) => {
  //   console.log("📢 Dashboard received updated order:", data);

  //   // 🔥 Refresh the order list automatically
  //   refetch();
  // };
  const handleOrderUpdate = (data) => {
  console.log("📢 Dashboard received updated order:", data);

  // ⭐ If takeaway order completed → remove card immediately

 
     refetch();
  
  // Otherwise → normal refetch for dine-in updates
  // refetch();
};

  // dispatch(orderApi.util.invalidateTags(['Order']));
  socket.on("frontdesk_order_update", handleOrderUpdate);

  return () => {
    socket.off("frontdesk_order_update", handleOrderUpdate);
  };
}, []);
useEffect(() => {
  const handleKotUpdate = (data) => {
       if (data.orderType !== "takeaway") return; // 🔒 ignore dine-in
    console.log("📢 Frontend received KOT update:", data);

    const orderId = data.Order_Id; // <-- This connects to the correct takeaway card

    setKotNotifications((prev) => {
      const previous = prev[orderId] || [];

      // Check if item already exists
      const idx = previous.findIndex(
        (item) => String(item.KOT_Item_Id) === String(data.KOT_Item_Id)
      );

      let updatedList;

      if (idx !== -1) {
        // Update existing item
        updatedList = [...previous];
        updatedList[idx] = {
          ...updatedList[idx],
          status: data.status,
          time: data.updated_at,
        };
      } else {
        // Add new item
        updatedList = [
          ...previous,
          {
            KOT_Item_Id: data.KOT_Item_Id,
            itemName: data.itemName,
            status: data.status,
            time:data.updated_at
          },
        ];
      }

      return {
        ...prev,
        [orderId]: updatedList,
      };
    });

    // Optional toast
     dispatch(orderApi.util.invalidateTags(["Order"]));
    toast.info(`${data.itemName} → ${data.status}`);
  };

  socket.on("frontend_kot_update", handleKotUpdate);

  return () => socket.off("frontend_kot_update", handleKotUpdate);
}, []);
useEffect(() => {
  if (!tableHavingOrders) return;

  const allOrders = [
    ...(tableHavingOrders.tableHavingOrders ?? []),
    ...(tableHavingOrders.takeawayOrders ?? [])
  ];

  allOrders.forEach((o) => {
    if (o.KOT_Id) {
      socket.emit("join_order_room", o.KOT_Id);
      console.log("📡 Joined order room:", o.KOT_Id);
    }
  });
}, [tableHavingOrders]);



  
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
const rawTables = tableHavingOrders?.tableHavingOrders ?? [];
const takeawayTables = tableHavingOrders?.takeawayOrders ?? [];
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
const filteredTables = grouped.filter(order =>
  order.Tables.join(", ").toLowerCase().includes(searchTerm.toLowerCase()) ||
  order.Order_Id.toLowerCase().includes(searchTerm.toLowerCase())
);


console.log("Raw Tables Data:", rawTables,filteredTables, "Takeaway Tables Data:", takeawayTables);


const handleCancelTakeawayOrder = async(Takeaway_Order_Id) => {

  console.log("Takeaway order cancelled:",Takeaway_Order_Id);
try{
  const response=await takeawayCancelOrder(Takeaway_Order_Id).unwrap();
  console.log("Takeaway order cancelled response:", response);
  dispatch(orderApi.util.invalidateTags(["Order"]));
 dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
  toast.success("Takeaway Order Cancelled Successfully!");
}catch(error){
  console.error("Error cancelling takeaway order:", error);
}

};

const handleCompleteTakeawayOrder = async(Takeaway_Order_Id) => {

  console.log("Takeaway order completed:",Takeaway_Order_Id);
try{
  const response=await takeawayCompleteOrder(Takeaway_Order_Id).unwrap();
  console.log("Takeaway order completed response:", response);
  dispatch(orderApi.util.invalidateTags(["Order"]));
 dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
  toast.success("Takeaway Order Completed Successfully!");
}catch(error){
  console.error("Error completing takeaway order:", error);
}
}
console.log(filteredTables)
console.log("KOT Notifications:", kotNotifications);

  return (
    <>
      
      
      <div className="sb2-2-3">
        <div className="row" style={{ margin: "0px" }}>
          <div className="flex">
            <div style={{ padding: "20px" , width: "100%"}} className="box-inn-sp">
              
              <div className="inn-title w-full px-1 py-1">
                <div className="flex flex-col sm:flex-row justify-between 
                items-start sm:items-center w-full ">
                  
                  {/* LEFT HEADER */}
                  <div className="w-full sm:w-auto">
                    <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">All Table Details</h4>
                  </div>

                  {/* RIGHT BUTTON SECTION */}
                    <div className="
      w-full sm:w-auto 
      flex flex-wrap sm:flex-nowrap 
      justify-start sm:justify-end 
      gap-3
    ">
                    

                    <div className="hidden sm:block">
                    <button
                      type="button"
                      onClick={() =>navigate("/staff/orders/add")}
                      className="text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "#ff0000" }}
                    >
                      Add Order
                    </button>
                    </div>
                  </div>
                </div>
              </div>
              
             <div style={{height:"100vh"}}
              className="p-5 bg-gray-100">
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
              navigate(`/staff/orders/table-order-details/${order?.Order_Id}`)
            }
          >
            View Details
          </button>
        </div>
      </>
    )}

   


  </div>
))}


          {takeawayTables.length > 0 &&
  takeawayTables.map((order) => {
    // ✅ Get live KOT updates
    const kotItems = kotNotifications[order.Takeaway_Order_Id] || [];

    // ✅ Merge backend items with socket updates
    const mergedItems = order.items
  .map((backendItem) => {
    const updated = kotItems.find(
      (it) =>
        String(it.KOT_Item_Id) === String(backendItem.KOT_Item_Id)
    );

    return {
      KOT_Item_Id: backendItem?.KOT_Item_Id,
      itemName: updated?.itemName || backendItem?.Item_Name,
      status: updated?.status || backendItem?.Item_Status,
      time: updated?.time || backendItem?.updated_at,
    };
  })
  


    return (
      <div
        key={order?.Takeaway_Order_Id}
        className="bg-white rounded-lg p-4 shadow-md relative border"
        style={{
          borderColor:
            order?.Status === "hold" || order?.Status === "paid"
              ? "#ff9800"
              : "#ff0000",
        }}
      >
        {/* Status Badge */}
      {/* Status + Actions (Top Right) */}
<div className=" flex justify-end  w-full gap-2 mb-2">
  
  {/* Status Badge */}
  <button
  type="button"
    disabled={isTakeawayCompleteOrderLoading}
    onClick={()=>handleCompleteTakeawayOrder(order?.Takeaway_Order_Id)}
    className={`px-3 py-1  text-center text-xs font-semibold text-white capitalize
      ${
        order?.Status === "hold"
          ? "bg-orange-500"
          : order?.Status === "paid"
          ? "bg-green-500"
          : "bg-red-500"
      }`}
  >
    {isTakeawayCompleteOrderLoading ? "Completing..." : order?.Status}
  </button>

  {/* Cancel Button */}
  <button
    type="button"
    disabled={isTakeawayCancelOrderLoading}
    onClick={()=>handleCancelTakeawayOrder(order?.Takeaway_Order_Id)}
    className="px-3 py-1  text-xs font-semibold text-white
               bg-red-500 cursor-pointer"
  >
    {isTakeawayCancelOrderLoading ? "Canceling..." : "Cancel"}
  </button>

</div>

        {/* Title */}
        <div className='mt-2'>
        <h5 className="text-xs sm:text-sm font-bold mb-1 text-gray-700">
          Takeaway Order {order?.Takeaway_Order_Id}
        {/* <h5 className="font-semibold text-gray-800 sm:font-bold mb-3 text-xl "> */}
          {/* Takeaway Order {order.Takeaway_Order_Id} */}
          </h5>
            </div>
        {/* </h5> */}

        {/* Amount */}
        <div className=" pt-3 flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Amount:</span>
          <span className="text-xl font-bold text-teal-600">
            ₹{order?.Amount}
          </span>
        </div>

        {/* Kitchen Updates */}
        <div className="bg-gray-100 rounded p-2 mt-2">
          <h5 className="text-xs sm:text-sm font-bold mb-1 text-gray-700">
  Kitchen Updates:
</h5>

          {/* <h4 className="text-sm font-bold mb-1 text-gray-700">
            Kitchen Updates:
          </h4> */}

          {mergedItems.map((item) => (
            <div
              key={item.KOT_Item_Id}
              className="flex justify-between gap-1 py-1 border-b last:border-none "
            >
              {/* Item Name */}
              <span className="text-gray-800 text-sm">
                {item?.itemName}
              </span>

              {/* Item Status */}
              <span
                className={`text-xs font-bold ${
                  item.status === "ready"
                    ? "text-green-600"
                    : item.status === "preparing"
                    ? "text-orange-500"
                    : "text-gray-600"
                }`}
              >
                {item?.status}
              </span>
              <div className='flex whitespace-nowrap'>
                <span className="text-xs   text-gray-800">
            {formatTime(item?.time)}
              </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  })}


  </div>

    {/* No results */}
    {filteredTables.length === 0  && takeawayTables.length === 0 && (
     
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
