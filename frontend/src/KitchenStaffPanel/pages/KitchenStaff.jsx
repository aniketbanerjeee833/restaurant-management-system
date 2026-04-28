


import {  useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ChefHat, Clock, Package, CheckCircle, AlertCircle, Flame } from "lucide-react";
import { kitchenStaffApi, useGetKitchenOrdersQuery, useUpdateKitchenItemStatusMutation } from "../../redux/api/KitchenStaff/kitchenStaffApi";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { orderApi } from "../../redux/api/Staff/orderApi";
const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

export default function KitchenStaff() {
//     const { user } = useSelector((state) => state.user);
//   const [orders, setOrders] = useState([]);
//     const {data:kitchenOrders}=useGetKitchenOrdersQuery();
//     console.log("Kitchen Orders from API:", kitchenOrders);
   const dispatch=useDispatch()

const { user } = useSelector((state) => state.user);
console.log(user);
  const [orders, setOrders] = useState([]);

  const { data: kitchenOrders,refetch } = useGetKitchenOrdersQuery();
  console.log("Kitchen Orders from API:", kitchenOrders);
  const [updateKitchenItemStatus] = useUpdateKitchenItemStatusMutation();

  /* ---------------- JOIN CATEGORY ROOMS ---------------- */
  useEffect(() => {
    if (user?.role === "kitchen-staff" && Array.isArray(user.categories)) {
      socket.emit("join_kitchen_categories", user.categories);
      console.log("🍳 Joined categories:", user.categories);
    }

    refetch();

    return () => {
      if (user?.categories) {
        socket.emit("leave_kitchen_categories", user.categories);
      }
    };
  }, [user]);


useEffect(() => {
  if (!Array.isArray(kitchenOrders?.orders)) return;
  // refetch();
  // API is already category-filtered
  const pendingOrders = kitchenOrders.orders.filter(
    (o) => o.Status === "pending"
  );

  setOrders(pendingOrders);
}, [kitchenOrders]);

/* ---------------- SOCKET LISTENERS ---------------- */
  useEffect(() => {
    if (!socket) return;

    // 🔒 DEDUPLICATE ITEMS BY KOT_Item_Id
    const mergeItems = (oldItems = [], newItems = []) => {
      const map = new Map();
      [...oldItems, ...newItems].forEach((item) => {
        map.set(item.KOT_Item_Id, item);
      });
      return Array.from(map.values());
    };

    const onNewOrder = (data) => {
      setOrders((prev) => {
        const existing = prev.find((o) => o.KOT_Id === data.KOT_Id);

        if (existing) {
          return prev.map((o) =>
            o.KOT_Id === data.KOT_Id
              ? {
                  ...o,
                  items: mergeItems(o.items, data.items),
                }
              : o
          );
        }

         return [data, ...prev];
      });
    };
// const onOrderUpdated = (updated) => {
//   setOrders((prev) =>
//     prev
//       .map((order) => {
//         if (order.KOT_Id !== updated.KOT_Id) return order;

//         // 🟦 TAKEAWAY → remove READY items immediately
//         if (updated.Order_Type === "takeaway") {
//           const remainingItems = updated.items.filter(
//             (item) => item.Item_Status !== "ready"
//           );

//           // ❌ If no items left for this staff → remove order card
//           if (remainingItems.length === 0) {
//             return null;
//           }

//           return {
//             ...order,
//             items: remainingItems,
//           };
//         }

//         // 🟩 DINE-IN → keep everything
//         return {
//           ...order,
//           items: updated.items,
//         };
//       })
//       .filter(Boolean) // remove null orders
//   );
// };

    // const onOrderUpdated = (updated) => {
    //   setOrders((prev) =>
    //     prev.map((o) =>
    //       o.KOT_Id === updated.KOT_Id
    //         ? {
    //             ...o,
    //             items: updated.items, // already category-safe
    //             Status: updated.Status ?? o.Status,
    //           }
    //         : o
    //     )
    //   );
    // };
const onOrderUpdated = (updated) => {
  setOrders((prev) =>
    prev
      .map((order) => {
        if (order.KOT_Id !== updated.KOT_Id) return order;

        // 🔥 REMOVE ORDER IMMEDIATELY WHEN BACKEND SAYS SO
        if (updated.removeOrder) {
          return ;
        }

        // 🟦 TAKEAWAY → keep only non-ready items
        if (updated.Order_Type === "takeaway") {
          const remainingItems = updated.items.filter(
            (item) => item.Item_Status !== "ready"
          );

          if (remainingItems.length === 0) {
            return null;
          }

          return {
            ...order,
            items: remainingItems,
          };
        }

        // 🟩 DINE-IN → keep all items
        return {
          ...order,
          items: updated.items,
        };
      })
      .filter(Boolean)
  );
};

    const onOrderRemoved = ({ KOT_Id }) => {
      setOrders((prev) => prev.filter((o) => o.KOT_Id !== KOT_Id));
      toast.info(`Order ${KOT_Id} closed`);
    };

      const onTakeawayCancelled = ({ Takeaway_Order_Id, KOT_Id }) => {
    setOrders(prev =>
      prev.filter(
        o =>
          o.KOT_Id !== KOT_Id &&        // ✅ primary
          o.Order_Id !== Takeaway_Order_Id // ✅ fallback
      )
    );

    toast.info(`Takeaway order ${Takeaway_Order_Id} cancelled`);
  };

    socket.on("new_kitchen_order", onNewOrder);
    socket.on("kitchen_order_updated", onOrderUpdated);
    socket.on("kitchen_order_removed", onOrderRemoved);
    socket.on("takeaway_order_cancelled", onTakeawayCancelled);

    return () => {
      socket.off("new_kitchen_order", onNewOrder);
      socket.off("kitchen_order_updated", onOrderUpdated);
      socket.off("kitchen_order_removed", onOrderRemoved);
      socket.off("takeaway_order_cancelled", onTakeawayCancelled);
    };
  }, [socket]);

// useEffect(() => {
//   socket.on("takeaway_order_cancelled", ({ Takeaway_Order_Id }) => {
//     setOrders(prev =>
//       prev.filter(o => o.Takeaway_Order_Id !== Takeaway_Order_Id)
//     );
//     toast.info(`Order ${Takeaway_Order_Id} cancelled`);
//   });

//   return () => socket.off("takeaway_order_cancelled");
// }, [socket]);


  console.log("🍽 Kitchen Orders:", orders);


  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "preparing": return "bg-blue-100 text-blue-800 border-blue-300";
      case "ready": return "bg-green-100 text-green-800 border-green-300";
      case "completed": return "bg-gray-100 text-gray-800 border-gray-300";
      default: return "bg-orange-100 text-orange-800 border-orange-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "preparing": return <Flame className="w-4 h-4" />;
      case "ready": return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };


const handleSingleItemStatus = async (KOT_Id, KOT_Item_Id, newStatus) => {
  try {
    // Call RTK mutation
    const res = await updateKitchenItemStatus({
      KOT_Id,
      KOT_Item_Id,
      status: newStatus,
    }).unwrap();

    console.log("✔️ Item updated:", res);

    toast.success(`Item marked as ${newStatus}`);
    dispatch(kitchenStaffApi.util.invalidateTags(["Kitchen-Staff"]));
    dispatch(orderApi.util.invalidateTags(["Order","Takeaway-Order","Customer"]));
  } catch (err) {
    console.error("❌ Error updating item status:", err);
    toast.error(err?.data?.message || "Failed to update status");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 mt-8">
      {/* Header */}
      
      <div className="bg-gradient-to-r from-[#ff0000] to-[#120000] text-white shadow-lg">
      {/* <div style={{     background: "linear-gradient(90deg, red, darkred)"}}
       className=" text-white shadow-lg"> */}
  <div className="max-w-7xl mx-auto px-4 py-6">
    {/* <div className="flex items-center justify-between mt-12 sm:mt-4">

      
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
          <ChefHat className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Kitchen Order Panel</h1>
      
        </div>
      </div>

     
      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center">
        <span className="text-2xl font-bold text-white">{orders.length}</span>
        <span className="text-sm ml-2 text-white/90">Active Orders</span>
      </div>

    </div> */}
    <div className="flex items-center justify-center mt-12  
    sm:mt-4 flex-wrap sm:flex-nowrap 
    sm:justify-between gap-4">

  {/* LEFT — ICON + TITLE */}
  <div className="flex items-center gap-3">
    <div className="bg-white/20 p-2 sm:p-3 rounded-lg backdrop-blur-sm">
      <ChefHat className="w-6 h-6 sm:w-8 sm:h-8" />
    </div>
    <div>
      <h1 className="
        text-2xl sm:text-3xl 
        font-bold leading-tight
      ">
        Kitchen Order Panel
      </h1>
    </div>
  </div>

  {/* RIGHT — ACTIVE ORDER COUNT */}
  <div className="
    bg-white/20 backdrop-blur-sm 
    px-3 sm:px-4 py-1.5 sm:py-2 
    rounded-full 
    flex items-center
  ">
    <span className="text-xl sm:text-2xl font-bold text-white">
      {orders.length}
    </span>
    <span className="text-xs sm:text-sm ml-2 text-white/90">
      Active Orders
    </span>
  </div>

</div>

  </div>
</div>


      {/* Orders Container */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="bg-white rounded-full p-8 shadow-lg mb-6">
              <ChefHat className="w-20 h-20 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              No Orders Yet
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
        ) : (

<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
{orders.map((order, index) => (
  <div
    key={index}
    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 
               transform hover:-translate-y-1 border-2 border-gray-100 overflow-hidden"
  >
    {/* HEADER */}
    {/* <div className="bg-gradient-to-r from-[#ff0000] to-[#6CCBCD] text-white p-4"> */}
       {/* <div className=`bg-gradient-to-r ${} text-white p-4`> */}
    {/* <div
  className={`text-white p-4 bg-gradient-to-r ${
    order.Order_Type === "dinein"
      ? "from-black to-black"   // greenish for dine-in
      : "from-[#D64545] to-[#F08080]"   // reddish for takeaway
  }`}
> */}
    <div
  className={`text-white p-4 bg-black`}
>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-white" />
          <span className="font-bold text-lg">KOT {order?.KOT_Id}</span>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-semibold border-2
         flex items-center gap-1 
            ${getStatusColor(order?.status)}`}>
          {getStatusIcon(order?.status)}
          {order?.status}
        </div>
      </div>

          <div className="flex items-center justify-between">
      <div className="text-sm opacity-90">
        Order ID: <span className="font-semibold">{order?.Order_Id}</span>
      </div>
   
         <div className="font-semibold text-white mt-2">
        {order?.items?.reduce((acc, item) => acc + item.Quantity, 0)} items
      </div>
      </div>
    </div>

    {/* BODY */}
    <div className="p-5">

      <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
        <ChefHat className="w-4 h-4 text-[#ff0000]" />
        Order Items
      </h3>

      {/* SCROLLABLE ITEMS LIST */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {order?.items.map((item, i) => (
          <div
            key={i}
            className=" p-3 rounded-lg border border-[#4CA1AF33]"
          >
            {/* ITEM ROW */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#ff0000] rounded-full"></div>
                <span className="font-medium text-gray-800">
                  {item?.Item_Name}
                </span>
              </div>
                      <div className="font-semibold flex flex-row gap-2 mt-2">
        {item?.created_at} 
      
          <div>
              <span className="bg-[#6CCBCD33] text-[#3A8C98] px-3 py-1 rounded-full 
                             text-sm font-bold">
                × {item?.Quantity}
              </span>
              </div>
              </div>
            </div>

            {/* ACTION BUTTONS PER ITEM */}
            {/* <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSingleItemStatus(order.KOT_Id, item.KOT_Item_Id, "preparing")}
                className="bg-[#ff0000] hover:bg-[#3A8C98] text-white py-1.5 rounded-lg 
                         font-semibold text-xs transition shadow flex items-center justify-center gap-1"
              >
                <Flame className="w-3 h-3" />
                Start
              </button>

              <button
                onClick={() => handleSingleItemStatus(order.KOT_Id, item.KOT_Item_Id, "ready")}
                className="bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-lg 
                         font-semibold text-xs transition shadow flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-3 h-3" />
                Ready
              </button>
            </div> */}
            <div className="mt-3 grid grid-cols-2 gap-2">
  {/* START BUTTON */}
  <button
    disabled={item.Item_Status !== "pending"}   // ❌ disable when preparing or ready
    onClick={() =>
      item.Item_Status === "pending" &&
      handleSingleItemStatus(order.KOT_Id, item.KOT_Item_Id, "preparing")
    }
    className={`
      py-1.5 rounded-lg font-semibold text-xs transition flex items-center justify-center gap-1
      ${
        item.Item_Status === "pending"
          ? "bg-[#ff0000] hover:bg-[#3A8C98] text-white"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }
    `}
  >
    <Flame className="w-3 h-3" />
    Start
  </button>

  {/* READY BUTTON */}
  <button
    disabled={item.Item_Status === "ready"}   // ❌ cannot click after ready
    onClick={() =>
      item.Item_Status !== "ready" &&
      handleSingleItemStatus(order.KOT_Id, item.KOT_Item_Id, "ready")
    }
    className={`
      py-1.5 rounded-lg font-semibold text-xs transition flex items-center justify-center gap-1
      ${
        item.Item_Status === "ready"
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700 text-white"
      }
    `}
  >
    <CheckCircle className="w-3 h-3" />
    Ready
  </button>
</div>


            {/* ITEM STATUS LABEL */}
            <div className="text-xs mt-2 flex items-center justify-center gap-1 text-gray-600">
              Status: <span className="font-semibold text-[#ff0000]">{item?.Item_Status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* FOOTER */}
   
  </div>
))}
</div>
        )}
      </div>
    </div>
  );
}

    // const updateOrderStatus = (index, newStatus) => {
    //   setOrders((prev) =>
    //     prev.map((order, i) =>
    //       i === index ? { ...order, status: newStatus } : order
    //     )
    //   );
    //   // TODO: Emit socket event to update backend
    //   // socket.emit("update_order_status", { KOT_Id: orders[index].KOT_Id, status: newStatus });
    // };

     // setOrders((prev) =>
  //   prev.map((order) => {
  //     if (order.KOT_Id === KOT_Id) {
  //       return {
  //         ...order,
  //         items: order.items.map((item) => {
  //           if (item.Item_Id === Item_Id) {
  //             return { ...item, status: newStatus };
  //           }
  //           return item;
  //         }),
  //       };
  //     }
  //     return order;
  //   })
  // );
  //   useEffect(() => {
//   const onNewOrder = (data) => {
//     setOrders((prev) => {
//       const exists = prev.find(o => o.KOT_Id === data.KOT_Id);
//       if (exists) return prev;
//       return [...prev, data];
//     });
//   };

//   const onOrderUpdated = (updated) => {
//     setOrders((prev) =>
//       prev.map((o) =>
//         o.KOT_Id === updated.KOT_Id
//           ? {
//               ...o,
//               items: updated.items,   // already category-safe
//               Status: updated.Status ?? o.Status,
//             }
//           : o
//       )
//     );
//   };

//   const onOrderRemoved = ({ KOT_Id }) => {
//     setOrders((prev) => prev.filter((o) => o.KOT_Id !== KOT_Id));
//     toast.info(`Order ${KOT_Id} closed`);
//   };

//   socket.on("new_kitchen_order", onNewOrder);
//   socket.on("kitchen_order_updated", onOrderUpdated);
//   socket.on("kitchen_order_removed", onOrderRemoved);

//   return () => {
//     socket.off("new_kitchen_order", onNewOrder);
//     socket.off("kitchen_order_updated", onOrderUpdated);
//     socket.off("kitchen_order_removed", onOrderRemoved);
//   };
// }, []);

  // useEffect(() => {
  //   const onNewOrder = (data) => {
  //     console.log("🔥 New Kitchen Order:", data);

  //     setOrders((prev) => {
  //       if (prev.some((o) => o.KOT_Id === data.KOT_Id)) return prev;
  //       return [...prev, data];
  //     });
  //   };

  //   const onOrderUpdated = (updated) => {
  //     console.log("♻️ Kitchen Order Updated:", updated);

  //     setOrders((prev) =>
  //       prev.map((o) =>
  //         o.KOT_Id === updated.KOT_Id
  //           ? { ...o, items: updated.items, Status: updated.Status ?? o.Status }
  //           : o
  //       )
  //     );
  //   };

  //   const onOrderRemoved = ({ KOT_Id }) => {
  //     setOrders((prev) => prev.filter((o) => o.KOT_Id !== KOT_Id));
  //     toast.info(`Order ${KOT_Id} closed — bill generated`);
  //   };

  //   socket.on("new_kitchen_order", onNewOrder);
  //   socket.on("kitchen_order_updated", onOrderUpdated);
  //   socket.on("kitchen_order_removed", onOrderRemoved);

  //   return () => {
  //     socket.off("new_kitchen_order", onNewOrder);
  //     socket.off("kitchen_order_updated", onOrderUpdated);
  //     socket.off("kitchen_order_removed", onOrderRemoved);
  //   };
  // }, []);

  //           <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//            {orders.map((order, index) => (
//   <div
//     key={index}
//     className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-100 overflow-hidden"
//   >
//     {/* ===== HEADER - THEME GRADIENT ===== */}
//     <div className="bg-gradient-to-r from-[#ff0000] to-[#6CCBCD] text-white p-4">
//       <div className="flex items-center justify-between mb-2">
//         <div className="flex items-center gap-2">
//           <Package className="w-5 h-5 text-white" />
//           <span className="font-bold text-lg">KOT #{order.KOT_Id}</span>
//         </div>

//         <div
//           className={`px-3 py-1 rounded-full text-xs font-semibold border-2 flex items-center gap-1 ${getStatusColor(
//             order?.status
//           )}`}
//         >
//           {getStatusIcon(order?.status)}
//           {order.status}
//         </div>
//       </div>

//       <div className="text-sm opacity-90">
//         Order ID: <span className="font-semibold">{order.Order_Id}</span>
//       </div>
//     </div>

//     {/* ===== BODY ===== */}
//     <div className="p-5">
//       <div className="mb-4">
//         <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
//           <ChefHat className="w-4 h-4 text-[#ff0000]" />
//           Order Items
//         </h3>

//         {/* ITEMS LIST */}
//         <div className="space-y-2">
//           {order.items.map((item, i) => (
//             <div
//               key={i}
//               className="flex items-center justify-between bg-[#4CA1AF10] 
//                          p-3 rounded-lg border border-[#4CA1AF33] 
//                          hover:bg-[#4CA1AF15] transition-colors"
//             >
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-[#ff0000] rounded-full"></div>
//                 <span className="font-medium text-gray-800">
//                   {item.Item_Name}
//                 </span>
//               </div>

//               <div className="bg-[#6CCBCD33] text-[#3A8C98] px-3 py-1 rounded-full text-sm font-bold">
//                 × {item.Quantity}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ===== ACTION BUTTONS ===== */}
//       <div className="space-y-2 pt-4 border-t border-gray-200">
//         <div className="grid grid-cols-2 gap-2">
//           {/* PREPARING */}
//           <button
//             onClick={() => updateOrderStatus(index, "preparing")}
//             className="bg-[#ff0000] hover:bg-[#3A8C98] text-white px-4 py-2 
//                        rounded-lg font-semibold text-sm transition-colors 
//                        flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
//           >
//             <Flame className="w-4 h-4" />
//             Start Cooking
//           </button>

//           {/* READY */}
//           <button
//             onClick={() => updateOrderStatus(index, "ready")}
//             className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 
//                        rounded-lg font-semibold text-sm transition-colors 
//                        flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
//           >
//             <CheckCircle className="w-4 h-4" />
//             Mark Ready
//           </button>
//         </div>

//         {/* COMPLETE ORDER */}
//         {/* <button
//           onClick={() => updateOrderStatus(index, "completed")}
//           className="w-full bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 
//                      rounded-lg font-semibold text-sm transition-colors 
//                      shadow-md hover:shadow-lg"
//         >
//           Complete Order
//         </button> */}
//       </div>
//     </div>

//     {/* ===== FOOTER ===== */}
//     <div className="bg-[#4CA1AF10] px-5 py-3 flex items-center justify-between 
//                     text-xs text-gray-600 border-t border-[#4CA1AF22]">
//       <div className="flex items-center gap-1">
//         <Clock className="w-3 h-3 text-[#ff0000]" />
//         <span>Received just now</span>
//       </div>

//       <div className="font-semibold text-[#3A8C98]">
//         {order.items?.reduce((acc, item) => acc + item.Quantity, 0)} items
//       </div>
//     </div>
//   </div>
// ))}

//           </div>
  /* ---------------- LOAD INITIAL ORDERS (API) ---------------- */
  // useEffect(() => {
  //   if (Array.isArray(kitchenOrders?.orders)) {
  //     setOrders((prev) => {
  //       const existingIds = new Set(prev.map((o) => o.KOT_Id));

  //       const pendingFromApi = kitchenOrders.orders.filter(
  //         (o) => o.Status === "pending" && !existingIds.has(o.KOT_Id)
  //       );

  //       return [...prev, ...pendingFromApi];
  //     });
  //   }
  // }, [kitchenOrders]);
// useEffect(() => {
//   if (!Array.isArray(kitchenOrders?.orders)) return;

//   // API already category-filtered ✅
//   const pendingOrders = kitchenOrders.orders.filter(
//     (o) => o.Status === "pending"
//   );

//   setOrders(pendingOrders);
// }, [kitchenOrders]);
//     const[updateKitchenItemStatus]=useUpdateKitchenItemStatusMutation()


//   useEffect(() => {
//     if (user?.role === "kitchen-staff" && Array.isArray(user.categories)) {
//       socket.emit("join_kitchen_categories", user.categories);
//       console.log("🍳 Joined categories:", user.categories);
//     }

//     return () => {
//       if (user?.categories) {
//         socket.emit("leave_kitchen_categories", user.categories);
//       }
//     };
//   }, [user]);

//     useEffect(() => {
//   if (Array.isArray(kitchenOrders?.orders)) {
//     const pendingOrders = kitchenOrders.orders.filter(
//       (order) => order.Status === "pending"
//     );
//     setOrders(pendingOrders);
//   }
// }, [kitchenOrders]);


// useEffect(() => {
//   console.log("📡 Connected to kitchen socket:", socket.id);

//   // 🔥 NEW ORDER RECEIVED
//   socket.on("new_kitchen_order", (data) => {
//     console.log("🔥 New Order Received in Kitchen:", data);

//     setOrders((prev) => {
//       // Prevent duplicates
//       if (prev.some((o) => o.KOT_Id === data.KOT_Id)) return prev;
//       return [...prev, data];
//     });
//   });


//   socket.on("kitchen_order_updated", (updated) => {
//   console.log("♻️ Kitchen Order Updated:", updated);

//   setOrders((prev) =>
//     prev.map((o) =>
//       o.KOT_Id === updated.KOT_Id
//         ? {
//             ...o,
//             items: updated.items,
//             Status: updated.Status ?? o.Status, // keep correct status
//           }
//         : o
//     )
//   );
// });


//   return () => {
//     socket.off("new_kitchen_order");
//     socket.off("kitchen_order_updated");
//   };
// }, []);
// useEffect(() => {
//   socket.on("kitchen_order_removed", ({ KOT_Id }) => {
//     setOrders((prev) => prev.filter(o => o.KOT_Id !== KOT_Id));

//     toast.info(`Order ${KOT_Id} closed — bill generated`);
//   });

//   return () => socket.off("kitchen_order_removed");
// }, []);

//   console.log("Kitchen Orders:", orders);