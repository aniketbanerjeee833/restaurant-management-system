import {  useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useGetAllPurchasesQuery } from "../../redux/api/purchaseApi";
import { Eye, LayoutDashboard, SquarePen } from "lucide-react";


export default function AllInventoryList() {

  const [page, setPage] = useState(1);


  // const [selectedPurchase, setSelectedPurchases] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const { data: purchases, isLoading } = useGetAllPurchasesQuery({
    page,
    search: searchTerm,
    fromDate,
    toDate,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  }
  const handleNextPage = () => {
    setPage(page + 1);
  }
  const handlePreviousPage = () => {
    setPage(page - 1);
  }

  // useEffect(() => {
  //     if (purchases && purchases.length > 0) {
  //         setSelectedPurchases(purchases[0]);
  //     }
  // }, [purchases]);

  // Set first party as default when data is loaded

  // const filteredPurchases = useMemo(() =>{

  //   const lowerSearch = searchTerm.toLowerCase();
  // return purchases?.purchases?.filter((purchase) => {
  //   if (!searchTerm.trim()) return true; // show all if search is empty

  //    const purchaseDate = new Date(purchase?.created_at);

  //   const createdDate = new Date(purchase?.created_at).toLocaleDateString("en-IN", {
  //       day: "numeric",
  //       month: "numeric",
  //       year: "numeric",
  //     });
  //        const matchesSearch = !lowerSearch || (purchase?.Party_Name &&
  //       purchase.Party_Name.toLowerCase().startsWith(lowerSearch)) ||
  //     (purchase?.Payment_Type &&
  //       purchase.Payment_Type.toLowerCase().startsWith(lowerSearch)) ||
  //     (purchase?.created_at &&
  //       createdDate.startsWith(lowerSearch)) ||
  //     (purchase?.Total_Amount &&
  //       purchase.Total_Amount.toString().startsWith(lowerSearch)) ||
  //     (purchase?.Balance_Due &&
  //       purchase.Balance_Due.toString().startsWith(lowerSearch))

  //      const matchesDate =
  //       (!fromDate && !toDate) ||
  //       (fromDate && !toDate && purchaseDate >= new Date(fromDate)) ||
  //       (!fromDate && toDate && purchaseDate <= new Date(toDate)) ||
  //       (fromDate && toDate && purchaseDate >= new Date(fromDate) && purchaseDate <= new Date(toDate));

  //     return matchesSearch && matchesDate;
  // });
  // }, [purchases, searchTerm, fromDate, toDate]);
  // const normalizeToLocalMidnight = (dateStr) => {
  //   const d = new Date(dateStr);
  //   d.setHours(0, 0, 0, 0);
  //   return d;
  // };

  // const filteredPurchases = useMemo(() => {
  //   if (!purchases?.purchases) return [];

  //   const lowerSearch = searchTerm.trim().toLowerCase();

  //   return purchases.purchases.filter((purchase) => {
  //     if (!purchase.created_at) return false;

  //     // 🕒 Convert to local date only (ignore time zones)
  //     const purchaseDate = new Date(purchase.created_at);
  //     const purchaseLocalDate = new Date(
  //       purchaseDate.getFullYear(),
  //       purchaseDate.getMonth(),
  //       purchaseDate.getDate()
  //     );

  //     // 🧭 Date filters normalized to local midnight
  //     const from = fromDate ? normalizeToLocalMidnight(fromDate) : null;
  //     const to = toDate ? normalizeToLocalMidnight(toDate) : null;

  //     const createdDate = purchaseLocalDate.toLocaleDateString("en-IN", {
  //       day: "2-digit",
  //       month: "2-digit",
  //       year: "numeric",
  //     });

  //     // 🔍 Search filter
  //     const matchesSearch =
  //       !lowerSearch ||
  //       purchase.Party_Name?.toLowerCase().includes(lowerSearch) ||
  //       purchase.Payment_Type?.toLowerCase().includes(lowerSearch) ||
  //       createdDate.includes(lowerSearch) ||
  //       purchase.Total_Amount?.toString().includes(lowerSearch) ||
  //       purchase.Balance_Due?.toString().includes(lowerSearch);

  //     // 📅 Date range filter (local-safe)
  //     const matchesDate =
  //       (!from && !to) ||
  //       (from && !to && purchaseLocalDate >= from) ||
  //       (!from && to && purchaseLocalDate <= to) ||
  //       (from && to && purchaseLocalDate >= from && purchaseLocalDate <= to);

  //     return matchesSearch && matchesDate;
  //   });
  // }, [purchases, searchTerm, fromDate, toDate]);


  // console.log(filteredPurchases,toDate,fromDate);


  //    useEffect(() => {
  //         if (purchases && purchases?.purchases?.length > 0) {
  //             setSelectedPurchases(purchases?.purchases[0]);
  //         }
  //     }, [purchases]);
  return (
    <>
      {/* // <div className="container-fluid sb2  ">
        //     <div className="row">
               
        //         <div className="sb2-1">

        //             <SideMenu/>
        //         </div>

               
        //         <div className="sb2-2"> */}
      {/* <div className="sb2-2-2">
        <ul >
          <li>
           
            <NavLink style={{ display: "flex", flexDirection: "row" }}
              to="/home"

            >
              <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
             
              Dashboard
            </NavLink>
          </li>

        </ul>
      </div> */}
      <div className="sb2-2-3 ">
        <div className="row">
          <div className="col-md-12">
            <div className="box-inn-sp">
             

              <div className="inn-title">
                <div className="flex flex-col sm:flex-col lg:flex-row justify-between lg:items-center">

                  <div className="flex flex-row justify-between items-center mb-4 sm:mb-4">
                    <div>
                      <h4 className="text-2xl font-bold mb-1">All Inventories</h4>
                      <p className="text-gray-500 text-sm sm:text-base">
                        All Inventory Details
                      </p>
                    </div>


                    <button
                      style={{
                        outline: "none",
                        boxShadow: "none",
                        backgroundColor: "#ff0000",
                      }}
                      className="text-white px-4 py-2 rounded-md sm:hidden"
                      onClick={() => navigate("/inventory/add")}
                    >
                      Add Inventory
                    </button>
                  </div>


                  <div
                    className="
        flex flex-col gap-2 sm:flex-row sm:flex-wrap gap-0
        sm:space-x-4 space-y-3 sm:space-y-0
        sm:items-center
        sm:justify-between

      "
                  >

                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 font-medium mb-1">From Date</span>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border p-1 rounded-md shadow-sm text-gray-700 sm:w-auto"
                        title="Search from date"
                      />
                    </div>


                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 font-medium mb-1">To Date</span>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="border p-1 rounded-md shadow-sm text-gray-700 sm:w-auto"
                        title="Search to date"
                      />
                    </div>


                    <div className="flex items-center w-full sm:w-56">
                      <input
                        type="text"
                        placeholder="Search ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-56"
                      />
                    </div>


                    <div className="hidden sm:block">
                      <button
                        style={{
                          outline: "none",
                          boxShadow: "none",
                          backgroundColor: "#ff0000",
                        }}
                        className="hidden sm:block text-white px-4 py-2 rounded-md sm:w-auto"
                        onClick={() => navigate("/inventory/add")}
                      >
                        Add Inventory
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="tab-inn">
                <div className="table-responsive table-desi">
                  {isLoading ? (
                    <p className="text-center mt-4">Fetching inventories...</p>
                  ) : purchases?.length === 0 ? (
                    <p className="text-center mt-4">No inventories found.</p>
                  ) : (





                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr>
                          <th className="text-left">Sl.No</th>
                          <th className="text-left ">Bill Date</th>
                          <th className="text-left ">Party Name</th>
                          <th className="text-left">Payment Type</th>
                          <th className="text-left">Amount </th>
                          <th className="text-left">Balance Due</th>
                          <th>View</th>
                          <th>Edit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchases && purchases?.purchases?.length > 0 ? (
                          purchases?.purchases?.map((purchase, idx) => (
                            <tr key={purchase?.Purchase_Id}>
                              <td>
                                {(purchases?.currentPage - 1) * 10 + (idx + 1)}.
                              </td>
                              <td>
                                {purchase?.Bill_Date
                                  ? new Date(purchase?.Bill_Date).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "numeric",
                                    year: "numeric",
                                  })
                                  : "N/A"}
                              </td>
                              <td>{purchase?.Party_Name || "N/A"}</td>
                              <td>{purchase?.Payment_Type || "N/A"}</td>
                              <td>{purchase?.Total_Amount || "N/A"}</td>
                              <td>{purchase?.Balance_Due || "N/A"}</td>

                              <td >
                                {/* <i
                                                                    style={{
                                                                        cursor: "pointer",
                                                                        backgroundColor: "transparent",
                                                                        color: "#7346ff"
                                                                    }}
                                                                    onClick={() => navigate(`/purchase/view/${purchase?.Purchase_Id}`)}
                                                                   className="fa fa-eye mr-o" aria-hidden="true"></i> */}
                                <Eye onClick={() => navigate(`/inventory/view/${purchase?.Purchase_Id}`)}
                                  style={{
                                    cursor: "pointer",
                                    backgroundColor: "transparent",
                                    color: "#ff0000"
                                  }} />
                              </td>
                              <td
                              >
                                <SquarePen onClick={() => navigate(`/inventory/edit/${purchase?.Purchase_Id}`)}
                                  style={{
                                    cursor: "pointer",
                                    backgroundColor: "transparent",
                                    color: "#ff0000"
                                  }} />

                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="mx-auto text-center" colSpan={10}>
                              No inventories found
                            </td>
                          </tr>
                        )}
                      </tbody>

                    </table>









                  )}
                </div>
              </div>

              <div className="flex justify-center align-center space-x-2 p-4">
                <button type="button"
                  onClick={() => handlePreviousPage()}
                  disabled={page === 1}
                  className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                ${page === 1 ? 'opacity-50 ' : ''}
                `}
                >
                  ← Previous
                </button>
                {[...Array(purchases?.totalPages).keys()].map((index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    //   className={`px-3 py-1 rounded ${page === index + 1 ? 'bg-[#7346ff] text-white' : 'bg-gray-200 hover:bg-gray-300'
                    //     }`}
                    className={
                      `px-3 py-1 rounded ${page === index + 1 ? 'bg-[#ff0000] text-white' :
                        'bg-gray-200 hover:bg-gray-300'
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button type="button"
                  onClick={() => handleNextPage()}
                  disabled={page === purchases?.totalPages || purchases?.totalPages === 0}
                  className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                ${page === purchases?.totalPages || purchases?.totalPages === 0 ? 'opacity-50 ' : ''}
                `}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>


  )
}

{/* <div className="p-2 border-r border-gray-300 overflow-x-auto ">
                                                    <table className="w-full ">
                                                        <thead>
                                                            <tr>
                                                                <th className="text-left">Item Name</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {purchases &&
                                                                purchases.length > 0 &&
                                                                purchases.map((purchase) => (
                                                                    <tr
                                                                        key={ purchase?.Purchase_Id }
                                                                        className={
                                                                            selectedPurchase?.Purchase_Id=== purchase?.Purchase_Id
                                                                                ? "bg-[#f3f2fd]  text-[#7346ff]"
                                                                                : ""
                                                                        }
                                                                    >
                                                                        <td
                                                                            onClick={() => handleItemClick(purchase?.Item_Id)}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            {item?.Item_Name}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                        </tbody>
                                                    </table>
                                                </div> */}

{/* Right side (Party Details) */ }