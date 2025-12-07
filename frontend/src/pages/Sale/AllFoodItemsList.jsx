import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useGetAllFoodItemsQuery } from "../../redux/api/foodItemApi";
import { Eye, LayoutDashboard, SquarePen } from "lucide-react";
import FoodItemModal from "../../components/Modal/FoodItemModal";
import EditFoodItemModal from "../../components/Modal/EditFoodItemModal";


export default function AllFoodItemsList() {

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
    const[selectedItem, setSelectedItem] = useState(null);
    const[editingFoodItem, setEditingFoodItem] = useState(false);
    const[showFoodItemModalForEdit, setShowFoodItemModalForEdit] = useState(false)
       const[showFoodItemModalForView, setShowFoodItemModalForView] = useState(false)
  // const [fromDate, setFromDate] = useState('');
  // const [toDate, setToDate] = useState('');
  const { data: foodItems, isLoading } = useGetAllFoodItemsQuery({
    page,
    search: searchTerm,
   
  });
  console.log(foodItems);

  // const[selecedSales,setSelectedSales]= useState(null);

  const navigate = useNavigate();

  const handlePageChange = (newPage) => {
    setPage(newPage);
  }
  const handleNextPage = () => {
    setPage(page + 1);
  }
  const handlePreviousPage = () => {
    setPage(page - 1);
  }

  console.log(foodItems?.foodItems);

  return (
    <>

      <div className="sb2-2-2">
        <ul >
          <li>

            <NavLink style={{ display: "flex", flexDirection: "row" }}
              to="/home"

            >
              <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
              {/* <i className="fa fa-home mr-2" aria-hidden="true"></i> */}
              Dashboard
            </NavLink>
          </li>

        </ul>
      </div>
      <div className="sb2-2-3 ">
        <div className="row">
          <div className="col-md-12">
            <div className="box-inn-sp">

              <div className="inn-title">
                <div className="flex flex-col sm:flex-col lg:flex-row justify-between lg:items-center">

                  <div className="flex flex-row justify-between items-center mb-4 sm:mb-4">
                    <div>
                      <h4 className="text-2xl font-bold mb-1">All Food Items</h4>
                      <p className="text-gray-500 text-sm sm:text-base">
                        All Food Items Details
                      </p>
                    </div>


                    <button
                      style={{
                        outline: "none",
                        boxShadow: "none",
                        backgroundColor: "#4CA1AF",
                      }}
                      className="text-white px-4 py-2 rounded-md sm:hidden"
                      onClick={() => navigate("/new/food-items/add")}
                    >
                      Add Food Item
                    </button>
                  </div>


                  <div

                    className="
        flex flex-col gap-2 md:flex-row md:gap-2 sm:flex-row sm:flex-wrap 
        sm:space-x-4 space-y-3 sm:space-y-0 
        sm:items-center 
        sm:justify-between
        
      "
                  >

                    {/* <div className="flex flex-col">
                      <span className="text-sm text-gray-600 font-medium mb-1">From Date</span>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border p-2 rounded-md shadow-sm text-gray-700 sm:w-auto"
                        title="Search from date"
                      />
                    </div> */}


                    {/* <div className="flex flex-col">
                      <span className="text-sm text-gray-600 font-medium mb-1">To Date</span>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="border p-2 rounded-md shadow-sm text-gray-700 sm:w-auto"
                        title="Search to date"
                      />
                    </div> */}


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
                          backgroundColor: "#4CA1AF",
                        }}
                        className="hidden sm:block text-white px-4 py-2 rounded-md sm:w-auto"
                        onClick={() => navigate("/new/food-items/add")}
                      >
                        Add Food Item
                      </button>
                    </div>
                  </div>
                </div>
              </div>





              <div className="tab-inn">
                <div className="table-responsive table-desi">
                  {isLoading ? (
                    <p className="text-center mt-4">Fetching foodItems...</p>
                  ) : foodItems?.length === 0 ? (
                    <p className="text-center mt-4">No foodItems found.</p>
                  ) : (





                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr>
                          <th className="text-left">Sl.No</th>
                          <th className="text-left ">Created At</th>
                         
                          <th className="text-left">Item Category</th>
                           <th className="text-left ">Item Image</th>
                          <th className="text-left">Item Name</th>
                          <th className="text-left">Item Quantity</th>
                          <th className="text-left">Item Price</th>
                          <th>View</th>
                          <th>Edit</th>

                        </tr>
                      </thead>
                      <tbody>
                        {foodItems && foodItems?.foodItems?.length > 0 ? (
                          foodItems?.foodItems?.map((foodItem, idx) => (
                            <tr key={foodItem?.Item_Id}>
                              <td>
                                {(foodItems?.currentPage - 1) * 10 + (idx + 1)}.
                              </td>
                              <td >
                                {foodItem?.created_at
                                  ? new Date(foodItem?.created_at).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "numeric",
                                    year: "numeric",
                                  })
                                  : "N/A"}
                              </td>
                              
                                 <td>{foodItem?.Item_Category || "N/A"}</td>
                                 <td>
                              <img
                                src={foodItem?.Item_Image &&
                                  `http://localhost:4000/uploads/food-item/${foodItem?.Item_Image}`
                                }
                                alt={foodItem?.Item_Name}
                                style={{ width: "50px", height: "50px" }}
                              />
                              </td>
                             
                              <td>{foodItem?.Item_Name || "N/A"}</td>
                              <td>{foodItem?.Item_Quantity || "N/A"}</td>
                              <td>{foodItem?.Item_Price || "N/A"}</td>
                              
                              <td >
                               
     
                                  <Eye
                                  onClick={() => { setSelectedItem(foodItem);     // ← STORE PARTY CLICKED
                                          setEditingFoodItem(false);
                                           setShowFoodItemModalForView(true);
                                                                            }}
                                    style={{
                                      cursor: "pointer",
                                      backgroundColor: "transparent",
                                      color: "#4CA1AF"
                                    }} />
                               
                                
                              </td>
                              <td>
                                
                             
        
                                

                                  <SquarePen
                                            onClick={() => 
                                              { 
                                                setSelectedItem(foodItem);     // ← STORE PARTY CLICKED
                                           setEditingFoodItem(true);
                                           setShowFoodItemModalForEdit(true);
                                                                            }}
                                    style={{
                                      cursor: "pointer",
                                      backgroundColor: "transparent",
                                      color: "#4CA1AF"
                                    }} />
                               

                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="mx-auto text-center" colSpan={10}>
                              No Food Items found
                            </td>
                          </tr>
                        )}
                      </tbody>

                    </table>









                  )}
                </div>
              </div>
           {showFoodItemModalForView && (
  <FoodItemModal
    foodItem={selectedItem}
    editingFoodItem={false}
    onClose={() => setShowFoodItemModalForView(false)}
  />
)}

{showFoodItemModalForEdit && (
  <EditFoodItemModal
    foodItem={selectedItem}
    editingFoodItem={true}
    onClose={() => setShowFoodItemModalForEdit(false)}
  />
)}


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
                {[...Array(foodItems?.totalPages).keys()].map((index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    // className={`px-3 py-1 rounded ${page === index + 1 ? 'bg-[#7346ff] text-white' : 'bg-gray-200 hover:bg-gray-300'
                    //   }`}
                    className={
                      `px-3 py-1 rounded ${page === index + 1 ? 'bg-[#4CA1AF] text-white' :
                        'bg-gray-200 hover:bg-gray-300'
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button type="button"
                  onClick={() => handleNextPage()}
                  disabled={page === foodItems?.totalPages || foodItems?.totalPages === 0}
                  className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                ${page === foodItems?.totalPages || foodItems?.totalPages === 0 ? 'opacity-50 ' : ''}
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