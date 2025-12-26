import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetAllTablesQuery } from "../../redux/api/tableApi";
import { Eye, SquarePen } from "lucide-react";
import EditTableModal from "../../components/Modal/EditTableModal";

export default function AllItemsList() {

    const [page, setPage] = useState(1);


    const navigate = useNavigate();
    //const [selectedItem, setSelectedItems] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // 🔍 search text

    const { data: tables, isLoading } = useGetAllTablesQuery({
        page,
        search: searchTerm
    });

    const[selectedTable, setSelectedTable] = useState(null);
    const[showTableModalForEdit, setShowTableModalForEdit] = useState(false)
    // const { data: eachItemHistory } = useGetEachItemHistoryQuery(selectedItem?.Item_Id,
    //     { skip: !selectedItem?.Item_Id }
    // )
    // console.log(eachItemHistory, "eachItemHistory")

    // const handleItemClick = (itemId) => {
    //     const table = tables?.tables?.find((p) => p.Item_Id === itemId);
    //     setSelectedItems(table);
    // };
    const handlePageChange = (newPage) => {
        setPage(newPage);
    }
    const handleNextPage = () => {
        setPage(page + 1);
    }
    const handlePreviousPage = () => {
        setPage(page - 1);
    }




    console.log("tables", tables, tables?.tables);
    //   console.log("Filtered tables:", filteredItems);
    return (
        <>

            
            <div className="sb2-2-3 ">
                <div className="row">
                    <div className="col-md-12">
                        <div className="box-inn-sp">

                            <div className="inn-title">
                                <div className="flex flex-col sm:flex-col lg:flex-row justify-between lg:tables-center">

                                    <div className="flex flex-row justify-between tables-center mb-4 sm:mb-4">
                                        <div>
                                            <h4 className="text-2xl font-bold mb-1">All Tables</h4>
                                            <p className="text-gray-500 text-sm sm:text-base">
                                                All Table Details
                                            </p>
                                        </div>


                                       
                                    </div>


                                    <div
                                        className="
        flex flex-col gap-2 sm:flex-row sm:flex-wrap gap-0
        sm:space-x-4 space-y-3 sm:space-y-0
        sm:tables-center
         sm:justify-between
      "
                                    >

                                     


                                      

                                        <div className="flex tables-center w-full sm:w-56">
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
                                                onClick={() => navigate("/table/add")}
                                            >
                                                Add Table
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="tab-inn">
                                <div className="table-responsive table-desi">
                                    {isLoading ? (
                                        <p className="text-center mt-4">Fetching tables...</p>
                                    ) : tables?.tables?.length === 0 ? (
                                        <p className="text-center mt-4">No tables found.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4">
                                            {/* Left side (table List) */}
                                            <div className="p-2 border-r border-gray-300 overflow-x-auto ">
                                                <table className="w-full ">
                                                    <thead>
                                                        <tr>
                                                            <th className="text-left">Sl.No</th>
                                                            
                                                            <th className="text-left">Table Name</th>
                                                            
                                                           
                                                            
                                                            <th className="text-left">Table Capacity</th>

                                                            {/* <th className="text-left">View</th> */}
                                                            <th className="text-left">View/Edit</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {tables &&
                                                            tables?.tables?.length > 0 &&
                                                            tables?.tables?.map((table, idx) => (
                                                                <tr
                                                                    key={table.Table_Id}
                                                             
                                                                >
                                                                    <td>
                                                                        {(tables?.currentPage - 1) * 10 + (idx + 1)}.
                                                                    </td>
                                                                    <td>{table?.Table_Name || "N/A"}</td>
                                                                    <td
                                                                        // onClick={() => handleItemClick(table.Item_Id)}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        {table?.Table_Capacity || "N/A"}
                                                                    </td>
                                                         
                                                                   

                                                                    {/* <td>
                                                                       
                                                                            <Eye
                                                                                style={{
                                                                                    cursor: "pointer",
                                                                                    backgroundColor: "transparent",
                                                                                    color: "#ff0000",
                                                                                }}
                                                                            />
                                                                       
                                                                    </td> */}
                                                                    <td>
                                                                        <SquarePen
                                                                            onClick={() => {
                                                                                setSelectedTable(table);     // ← STORE PARTY CLICKED
                                                                                setShowTableModalForEdit(true);
                                                                            }}
                                                                            style={{
                                                                                cursor: "pointer",
                                                                                backgroundColor: "transparent",
                                                                                color: "#ff0000"
                                                                            }} />

                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>


                                        </div>



                                    )}

                                </div>
                                {showTableModalForEdit && (
                                    <EditTableModal
                                        table={selectedTable}
                                        onClose={() => setShowTableModalForEdit(false)}
                                    />
                                )}
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
                                {[...Array(tables?.totalPages).keys()].map((index) => (
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
                                    disabled={page === tables?.totalPages || tables?.totalPages === 0}
                                    className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                ${page === tables?.totalPages || tables?.totalPages === 0 ? 'opacity-50 ' : ''}
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