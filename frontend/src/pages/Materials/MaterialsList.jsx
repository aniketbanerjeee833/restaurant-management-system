
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { Eye, LayoutDashboard, SquarePen } from "lucide-react";
import { useGetAllMaterialsQuery } from "../../redux/api/materialApi";
import MaterialModal from "../../components/Modal/MaterialModal";

export default function MaterialsList() {

  // const reorderLevelUnits = {
  //   "Kilogram": "Kg",
  //   "Litre": "lt",
  //   "Gram": "gm",
  //   "Pcs": "pcs"
  // }
  const [page, setPage] = useState(1);


  const navigate = useNavigate();
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 search text
  const[showMaterialModalForEdit, setShowMaterialModalForEdit] = useState(false);
  const { data: materials, isLoading } = useGetAllMaterialsQuery({
    page,
    search: searchTerm
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

   const handleSingleMaterialView = (Material_Name) => {
    //  const year = currentDate.getFullYear();
    //  const month = currentDate.getMonth();
    //  const dateStr = formatDate(year, month, day);
     
    //  console.log("Selected date:", dateStr);
     
   // Clear leads immediately when a new date is selected
     // dispatch(clearSelectedLeads());
     //setSelectedDate(dateStr);
     //navigate(`/day-wise-report/${dateStr}`);
     console.log("MaterialName", Material_Name);
    window.open(`/material/material-view/${Material_Name}`,"_blank");
     // Remove the manual fetchLeadsByDate call - let the query handle it
   };


  console.log("materials", materials, materials?.materials);
  //   console.log("Filtered materials:", filteredItems);
  return (
    <>

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
                <div className="flex flex-col 
                sm:flex-col lg:flex-row justify-between lg:materials-center">

                  <div className="flex flex-row justify-between materials-center mb-4 sm:mb-4">
                    <div>
                      <h4 className="text-2xl font-bold mb-1">All Materials</h4>
                      <p className="text-gray-500 text-sm sm:text-base">
                        All Materials Details
                      </p>
                    </div>



                  </div>


                  <div
                    className="
        flex flex-col gap-2 sm:flex-row sm:flex-wrap gap-0
        sm:space-x-4 space-y-3 sm:space-y-0
        sm:materials-center
         sm:justify-between
      "
                  >






                    <div className="flex materials-center w-full sm:w-56">
                      <input
                        type="text"
                        placeholder="Search..."
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
                        onClick={() => navigate("/material/add")}
                      >
                        Add Material
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tab-inn">
                <div className="material-responsive material-desi">
                  {isLoading ? (
                    <p className="text-center mt-4">Fetching Materials...</p>
                  ) : materials?.materials?.length === 0 ? (
                    <p className="text-center mt-4">No Materials found.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {/* Left side (material List) */}
                      <div className="p-2 border-r border-gray-300 overflow-x-auto ">
                        
                        <table className="w-full ">
  <thead>
    <tr>
      <th className="text-left">Sl.No</th>
      <th className="text-left">Added At</th>
      <th className="text-left">Material Name</th>
      <th className="text-left">Current Stock</th>
      <th className="text-left">Reorder Level</th>
      <th className="text-left">Shelf Life (Days)</th>
      <th className="text-left">View</th>
      <th className="text-left">Edit</th>
    </tr>
  </thead>

  <tbody>
    {materials &&
      materials?.materials?.length > 0 &&
      materials?.materials?.map((material, idx) => (
        <tr key={material.Material_Id}>
          
          {/* ➤ SERIAL NO */}
          <td>
            {(materials?.currentPage - 1) * 10 + (idx + 1)}.
          </td>

          {/* ➤ CREATED DATE */}
          <td>
            {new Date(material?.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "numeric",
              year: "numeric"
            })}
          </td>

          {/* ➤ MATERIAL NAME */}
          <td>{material?.name ?? "N/A"}</td>

          {/* ➤ CURRENT STOCK (LOW STOCK = RED) */}
          {/* <td
            className={
              Number(material?.current_stock) < Number(material?.reorder_level)
                ? "text-red-600 font-bold"
                : ""
            }
          >
            {material?.formatted_current_stock
              ? `${material?.formatted_current_stock}`
              : "N/A"}

           
          </td> */}
          <td
  className={
    Number(material?.current_stock) < Number(material?.reorder_level)
      ? "text-red-600 font-bold"
      : ""
  }
>
  {material?.formatted_current_stock || "N/A"}
</td>


          {/* ➤ REORDER LEVEL */}
          <td>
            {material?.formatted_reorder_level
              ? `${material?.formatted_reorder_level}`
              : "N/A"}
          </td>

          {/* ➤ SHELF LIFE */}
          <td>{material?.shelf_life_days ?? "N/A"}</td>

          {/* ➤ VIEW */}
          <td>
            <Eye
            onClick={()=>handleSingleMaterialView(material?.name)}
              style={{
                cursor: "pointer",
                backgroundColor: "transparent",
                color: "#ff0000"
              }}
            />
          </td>

          {/* ➤ EDIT */}
          <td>
            <SquarePen
              onClick={() => {
                setSelectedMaterial(material);
                setShowMaterialModalForEdit(true);
              }}
              style={{
                cursor: "pointer",
                backgroundColor: "transparent",
                color: "#ff0000"
              }}
            />
          </td>

        </tr>
      ))}
  </tbody>
</table>

                      </div>


                    </div>



                  )}

                </div>
              </div>
                {showMaterialModalForEdit && (
                                             <MaterialModal
                                                materialDetails={selectedMaterial}
                                                editingMaterial={true}
                                                onClose={() => setShowMaterialModalForEdit(false)}
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
                {[...Array(materials?.totalPages).keys()].map((index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    // className={
                    //     `px-3 py-1 rounded ${page === index + 1 ? 'bg-[#7346ff] text-white' : 
                    //         'bg-gray-200 hover:bg-gray-300'
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
                  disabled={page === materials?.totalPages || materials?.totalPages === 0}
                  className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                ${page === materials?.totalPages || materials?.totalPages === 0 ? 'opacity-50 ' : ''}
                `}
                >
                  Next →
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
      <style>
        {`
              .text-red-500 {
 
  color: red !important;
}
  .text-green-500 {
 
  color: green !important;
},

               `
        }
      </style>
    </>


  )
}