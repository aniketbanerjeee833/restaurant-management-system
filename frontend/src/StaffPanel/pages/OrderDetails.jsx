
import  { useState, useEffect } from 'react';
import { LayoutDashboard, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetTablesHavingOrdersQuery } from '../../redux/api/Staff/orderApi';

export default function OrderDetails() {
    const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('');
//   const [tables, setTables] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());


  const {data:tableHavingOrders} = useGetTablesHavingOrdersQuery()
 useEffect(() => {
  console.log("API RESPONSE:", tableHavingOrders);
}, [tableHavingOrders]);

  // Mock data - replace with your API call
//   useEffect(() => {
//     const mockData = [
//       {
//         "Order_Id": "ODR00012",
//         "User_Id": "USR003",
//         "Order_Start_Time": "2025-02-28T10:30:20.000Z",
//         "Status": "hold",
//         "Sub_Total": "138.00",
//         "Tax_Amount": "6.90",
//         "Amount": "144.90",
//         "Table_Id": "TBL001",
//         "Table_Name": "Table 1",
//         "Table_Start_Time": "2025-02-28T10:30:20.000Z"
//       },
//       {
//         "Order_Id": "ODR00013",
//         "Table_Id": "TBL003",
//         "Table_Name": "Table 3",
//         "Table_Start_Time": "2025-02-28T10:30:20.000Z"
//       },
//       {
//         "Order_Id": "ODR00014",
//         "Table_Id": "TBL005",
//         "Table_Name": "Table 5",
//         "Table_Start_Time": "2025-02-28T12:15:30.000Z"
//       }
//     ];
//     setTables(mockData);
//   }, []);

  // Update timer every second
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

// Step 2: Group by Order_Id
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


  return (
    <>
      <div className="sb2-2-2">
        <ul>
          <li>
            <a style={{ display: "flex", flexDirection: "row" }} href="/home">
              <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
              Dashboard
            </a>
          </li>
        </ul>
      </div>
      
      <div className="sb2-2-3">
        <div className="row" style={{ margin: "0px" }}>
          <div className="col-md-12">
            <div style={{ padding: "20px" }} className="box-inn-sp">
              
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
                    {/* <div className="flex items-center w-full sm:w-56">
                      <input
                        type="text"
                        placeholder="Search ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-56"
                      />
                    </div> */}

                    <div className="hidden sm:block">
                    <button
                      type="button"
                      onClick={() =>navigate("/staff/orders/add")}
                      className="text-white font-bold py-2 px-4 rounded"
                      style={{ backgroundColor: "#4CA1AF" }}
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
  {filteredTables.map((order) => (
  <div
    key={order.Order_Id}
    className="bg-white rounded-lg p-4 shadow-md relative border"
    style={{ borderColor: order.Status === "hold" ? "#ff9800" : "#4CA1AF" }}
  >

    <div
      className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold text-white 
        ${order.Status === "hold" ? "bg-orange-500" : "bg-green-500"}`}
    >
      {order.Status}
    </div>

    {/* Combined Table Names */}
    <div>
    <h4 className="text-xl font-bold text-gray-800 mb-1">
      {order.Tables.join(", ")}
    </h4>
    </div>

    {/* <p className="text-sm text-gray-600 mb-2">
      Order: <span className="font-semibold">{order.Order_Id}</span>
    </p> */}

    {/* Timer */}
    <div className="flex items-center bg-gray-100 p-3 rounded-md mb-4">
      <Clock size={18} className="text-teal-600 mr-2" />
      <span className="font-mono font-bold text-lg text-gray-800">
        {getElapsedTime(order.Table_Start_Time)}
      </span>
    </div>

    {/* Amount */}
    <div className="border-t pt-3 flex justify-between items-center">
      <span className="text-sm text-gray-600">Amount:</span>
      <span className="text-xl font-bold text-teal-600">₹{order.Amount}</span>
    </div>

<div className='flex justify-center items-center'>
    <button
      style={{ backgroundColor: "#4CA1AF" }}
      className="text-white mt-2 font-bold py-2 px-4 rounded"
      onClick={()=>navigate(`/staff/orders/table-order-details/${order.Order_Id}`)}
    >
      View Details
    </button>
    </div>
  </div>
))}


    {/* No results */}
    {filteredTables.length === 0 && (
      <div className="col-span-full text-center text-gray-500 py-10">
        No tables having orders found
      </div>
    )}
  </div>
</div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}