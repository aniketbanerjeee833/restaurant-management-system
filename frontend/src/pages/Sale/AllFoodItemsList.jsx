import { useEffect, useState } from "react";
import {  useNavigate } from "react-router-dom";

import { foodItemApi, useGetAllFoodItemsQuery,  useSoftDeleteFoodItemMutation,  useToggleFoodItemAvailabilityMutation } from "../../redux/api/foodItemApi";
import { Eye,  SquarePen, Trash2} from "lucide-react";
import FoodItemModal from "../../components/Modal/FoodItemModal";
import EditFoodItemModal from "../../components/Modal/EditFoodItemModal";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import DeleteFoodItemModal from "../../components/Modal/DeleteFoodItemModal";





export default function AllFoodItemsList() {

  const [page, setPage] = useState(1);
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState('');
    const[selectedItem, setSelectedItem] = useState(null);
    const[editingFoodItem, setEditingFoodItem] = useState(false);
    const[showFoodItemModalForEdit, setShowFoodItemModalForEdit] = useState(false)
       const[showFoodItemModalForView, setShowFoodItemModalForView] = useState(false)
       const[showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  // const [fromDate, setFromDate] = useState('');
  // const [toDate, setToDate] = useState('');
// const { data: userMe  } = useGetUserQuery();

const{user}=useSelector((state) => state.user);
  const[toggleFoodItemAvailability]= useToggleFoodItemAvailabilityMutation();
  const[softDeleteFoodItem, { isLoading: isDeletingFoodItem }]=  useSoftDeleteFoodItemMutation()
  // const handleToggleAvailability = async (Item_Id) => {
  //   try {
  //     await toggleFoodItemAvailability(Item_Id).unwrap();
  //     console.log("Availability toggled successfully");
  //        toast.success(
  //     `${foodItem.Item_Name} is now ${foodItem.is_available ? "Unavailable" : "Available"}`
  //   );
  //   } catch (error) {
  //     console.error("Error toggling availability:", error);
  //   }
  // };
  const handleToggleAvailability = async (foodItem) => {
  try {
    const response = await toggleFoodItemAvailability(foodItem.Item_Id).unwrap();
    if(response?.success){
      toast.success(
      `${foodItem.Item_Name} is now ${foodItem.is_available ? "Unavailable" : "Available"}`
    );
    dispatch(foodItemApi.util.invalidateTags([{ type: "Food-Item", id: "LIST" }]));
    }
  
  } catch (err) {
    console.error("Toggle failed", err);
    toast.error("Failed to update status");
  }
};


useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm);
  }, 400); // 400ms is perfect for POS

  return () => clearTimeout(timer);
}, [searchTerm]);

  const { data: foodItems, isLoading, isFetching } = useGetAllFoodItemsQuery({
    page,
    search: debouncedSearch,
   
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
const handleSoftDeleteFoodItem = async () => {
  try {
    const res=await softDeleteFoodItem(selectedItem.Item_Id).unwrap();
    toast.success(`${res.Item_Name} Food item deleted successfully`);
    //dispatch(foodItemApi.util.invalidateTags([{ type: "Food-Item", id: "LIST" }]));
    //onClose();
     setShowDeleteConfirmation(false);
  } catch (err) {
    console.error("Delete failed", err);
    toast.error("Failed to delete food item");
  }
};
    
  return (
    <>
{/* 
      {user?.role === "admin" && <div className="sb2-2-2">
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
      </div>} */}

      {/* <div  className="sb2-2-3 ">
        <div className="row">
          <div className="col-md-12">
            <div className="box-inn-sp"> */}
      {user?.role === "admin" && 
      
            <div className="flex flex-col bg-white">

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
                        backgroundColor: "#ff0000",
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
                          <th className="text-left">Available</th>

                          <th className="text-left ">Created At</th>
                         
                          <th className="text-left">Item Category</th>
                           <th className="text-left ">Item Image</th>
                          <th className="text-left">Item Name</th>
                          {/* <th className="text-left">Item Quantity</th> */}
                          <th className="text-left">Item Price</th>
                          <th>View</th>
                          <th>Edit</th>
                          <th>Delete</th>
                        </tr>
                      </thead>
                     
<tbody>
  {(isLoading || isFetching) ? (

    /* 🔥 TABLE SKELETON */
    [...Array(8)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td><div className="h-4 bg-gray-200 rounded w-6" /></td>
        <td><div className="h-6 bg-gray-200 rounded-full w-20" /></td>
        <td><div className="h-4 bg-gray-200 rounded w-20" /></td>
        <td><div className="h-4 bg-gray-200 rounded w-24" /></td>
        <td><div className="h-12 w-12 bg-gray-200 rounded" /></td>
        <td><div className="h-4 bg-gray-200 rounded w-32" /></td>
        <td><div className="h-4 bg-gray-200 rounded w-16" /></td>
        <td><div className="h-5 bg-gray-200 rounded w-6 mx-auto" /></td>
        <td><div className="h-5 bg-gray-200 rounded w-6 mx-auto" /></td>
        <td><div className="h-5 bg-gray-200 rounded w-6 mx-auto" /></td>
      </tr>
    ))

  ) : foodItems && foodItems?.foodItems?.length > 0 ? (

    /* 🔥 REAL DATA */
    foodItems.foodItems.map((foodItem, idx) => (
      <tr key={foodItem?.Item_Id}>
        <td>
          {(foodItems?.currentPage - 1) * 10 + (idx + 1)}.
        </td>

        <td>
          <button
            style={{
              backgroundColor: foodItem?.is_available ? "#16a34a" : "#dc2626"
            }}
            onClick={() => handleToggleAvailability(foodItem)}
            className="px-3 py-1 rounded-full text-white text-xs font-semibold transition"
          >
            {foodItem?.is_available ? "Available" : "Unavailable"}
          </button>
        </td>

        <td>
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
            src={
              foodItem?.Item_Image &&
              `http://localhost:4000/uploads/food-item/${foodItem?.Item_Image}`
            }
            alt={foodItem?.Item_Name}
            style={{ width: "50px", height: "50px" }}
          />
        </td>

        <td>{foodItem?.Item_Name || "N/A"}</td>
        <td>
  <div className="flex flex-col text-sm">
    <span>
      <strong>Dine-In:</strong>{" "}
      {foodItem?.DineIn_Item_Price != null
        ? `₹${foodItem.DineIn_Item_Price}`
        : "N/A"}
    </span>
    <span>
      <strong>Takeaway:</strong>{" "}
      {foodItem?.Takeaway_Item_Price != null
        ? `₹${foodItem.Takeaway_Item_Price}`
        : "N/A"}
    </span>
  </div>
</td>
        {/* <td>{foodItem?.Item_Price || "N/A"}</td> */}

        <td>
          <Eye
            onClick={() => {
              setSelectedItem(foodItem);
              setEditingFoodItem(false);
              setShowFoodItemModalForView(true);
            }}
            style={{
              cursor: "pointer",
              backgroundColor: "transparent",
              color: "#ff0000"
            }}
          />
        </td>

        <td>
          <SquarePen
            onClick={() => {
              setSelectedItem(foodItem);
              setEditingFoodItem(true);
              setShowFoodItemModalForEdit(true);
            }}
            style={{
              cursor: "pointer",
              backgroundColor: "transparent",
              color: "#ff0000"
            }}
          />
        </td>

        <td>
          <Trash2
            onClick={() => {
              setSelectedItem(foodItem);
              setShowDeleteConfirmation(true);
            }}
            style={{
              cursor: "pointer",
              backgroundColor: "transparent",
              color: "#ff0000"
            }}
          />
        </td>
      </tr>
    ))

  ) : (

    /* 🔥 EMPTY STATE */
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

{/* {showDeleteConfirmation && (
  <DeleteFoodItemModal
    foodItem={selectedItem}
    onClose={() => setShowDeleteConfirmation(false)}
  />
)} */}
{showDeleteConfirmation && (
  <DeleteFoodItemModal
    title="Are You sure you want to Delete ?"
    description={`Delete ${selectedItem.Item_Name}?`}
    onClose={() => setShowDeleteConfirmation(false)}
    onConfirm={handleSoftDeleteFoodItem}
    isLoading={isLoading}
  />
)}

{showFoodItemModalForEdit && (
  <EditFoodItemModal
    foodItem={selectedItem}
    editingFoodItem={true}
    onClose={() => setShowFoodItemModalForEdit(false)}
  />
)}


              {/* <div className="flex justify-center align-center space-x-2 p-4">
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
                      `px-3 py-1 rounded ${page === index + 1 ? 'bg-[#ff0000] text-white' :
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
              </div> */}

              <div className="flex justify-center align-center p-4">
  <div className="flex items-center space-x-2 flex-wrap justify-center">

    {/* PREVIOUS */}
    <button
      type="button"
      onClick={() => handlePreviousPage()}
      disabled={page === 1}
      className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
        ${page === 1 ? 'opacity-50 ' : ''}
      `}
    >
      ← Previous
    </button>

    {/* PAGE NUMBERS — DESKTOP / TABLET */}
    <div style={{marginRight:"0px"}}
    className="hidden sm:flex space-x-2">
      {/* {[...Array(foodItems?.totalPages).keys()].map((index) => (
        <button
          key={index}
          onClick={() => handlePageChange(index + 1)}
          className={
            `px-3 py-1 rounded ${
              page === index + 1
                ? 'bg-[#ff0000] text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`
          }
        >
          {index + 1}
        </button>
      ))} */}
                  {(() => {
  const totalPages = foodItems?.totalPages || 1;
  const maxVisible = 5; // how many pages around current
  const pages = [];

  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, page + 2);

  // Adjust if near start
  if (page <= 3) {
    end = Math.min(totalPages, maxVisible);
  }

  // Adjust if near end
  if (page > totalPages - 3) {
    start = Math.max(1, totalPages - maxVisible + 1);
  }

  // First page + dots
  if (start > 1) {
    pages.push(
      <button
        key={1}
        onClick={() => handlePageChange(1)}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
      >
        1
      </button>
    );

    if (start > 2) {
      pages.push(
        <span key="start-dots" className="px-2">...</span>
      );
    }
  }

  // Middle pages
  for (let i = start; i <= end; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => handlePageChange(i)}
        className={`px-3 py-1 rounded ${
          page === i
            ? 'bg-[#ff0000] text-white'
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
      >
        {i}
      </button>
    );
  }

  // Last page + dots
  if (end < totalPages) {
    if (end < totalPages - 1) {
      pages.push(
        <span key="end-dots" className="px-2">...</span>
      );
    }

    pages.push(
      <button
        key={totalPages}
        onClick={() => handlePageChange(totalPages)}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
      >
        {totalPages}
      </button>
    );
  }

  return pages;
})()}
    </div>

    {/* CURRENT PAGE — MOBILE ONLY */}
    <div className="sm:hidden px-3 py-1 bg-gray-100 rounded text-sm">
      Page {page} / {foodItems?.totalPages || 1}
    </div>

    {/* NEXT */}
    <button
      type="button"
      onClick={() => handleNextPage()}
      disabled={page === foodItems?.totalPages || foodItems?.totalPages === 0}
      className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
        ${
          page === foodItems?.totalPages ||
          foodItems?.totalPages === 0
            ? 'opacity-50 '
            : ''
        }
      `}
    >
      Next →
    </button>

  </div>
</div>

            </div>
        
      
      }
        {user?.role === "kitchen-staff" && <div style={{padding:"12px",marginTop:"24px"}} className="sb2-2-3 ">
        <div className="row">
          <div className="col-md-12">
            <div className="box-inn-sp">

              
              <div className="inn-title w-full mt-4 sm:mt-0">
  <div
    className="
      flex 
      flex-col 
      items-center 
      gap-4
      mt-8
      sm:mt-0
      lg:flex-row 
      lg:justify-between 
      lg:items-center
    "
  >

    {/* CENTER TITLE ON ALL SCREENS */}
    <div className="flex-1 flex justify-center order-1 lg:order-none">
      <div className="text-center">
        <h4 className="text-2xl font-bold mb-1">All Food Items</h4>
        <p className="text-gray-500 text-sm sm:text-base">
          All Food Items Details
        </p>
      </div>
    </div>

    {/* SEARCH → RIGHT ON LARGE SCREENS */}
    <div className="w-full lg:w-auto flex justify-center lg:justify-end order-2 lg:order-none">
      <input
        type="text"
        placeholder="Search ..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="
          w-full 
          sm:w-64 
          lg:w-56 
          px-3 py-2 
        
         
        "
      />
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
                          <th className="text-left">Available</th>

                          <th className="text-left ">Created At</th>
                         
                          <th className="text-left">Item Category</th>
                           <th className="text-left ">Item Image</th>
                          <th className="text-left">Item Name</th>
                          {/* <th className="text-left">Item Quantity</th> */}
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
          <td>
<button
  style={{
    backgroundColor: foodItem?.is_available ? "#16a34a" : "#dc2626"
  }}
  onClick={() => handleToggleAvailability(foodItem)}
  className="px-3 py-1 rounded-full text-white text-xs font-semibold transition"
>
  {foodItem?.is_available ? "Available" : "Unavailable"}
</button>

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
                              {/* <td>{foodItem?.Item_Quantity || "N/A"}</td> */}
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
                                      color: "#ff0000"
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
                                      color: "#ff0000"
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
                 style={{ outline: "none",backgroundColor: "lightgray" }}
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
                  disabled={page === foodItems?.totalPages || foodItems?.totalPages === 0}
                  className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                ${page === foodItems?.totalPages || foodItems?.totalPages === 0 ? 
                  'opacity-50 ' : ''}
                `}
                >
                  Next →
                </button>
 


              </div>
            </div>
          </div>
        </div>
      </div>}

    </>


  )
}


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