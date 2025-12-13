import {  NavLink } from "react-router-dom"

import { useDispatch, useSelector } from "react-redux";

import { setPage } from "../../redux/reducer/userReducer";

import { useGetAllStaffsQuery } from "../../redux/api/staffApi";
import { Eye, SquarePen } from "lucide-react";
import { useState } from "react";
import EditStaffModal from "../../components/Modal/EditStaffModal";




export default function StaffList() {
  const { userId: adminId } = useSelector((state) => state.user);
const[editStaffModalOpen,setEditStaffModalOpen]=useState(false)
  console.log(adminId);
  //const [usersLoading, setUsersLoading] = useState(false);
 // const[staffs,setUsers]=useState([])
  const dispatch = useDispatch();
  const { page } = useSelector((state) => state.user);

  // const [staffs, setStaffs] = useState([]);
  console.log(adminId);
//   const { data: staffs, error: staffError, isLoading: userLoading } = 
//   useGetAllUsersForAdminQuery({adminId,page});
//   console.log(staffs, "staffs");

const{data:staffs,isLoading:usersLoading}=useGetAllStaffsQuery({adminId,page})
console.log(staffs,"staffs");
const[selectedStaff,setSelectedStaff]=useState(null)
   const handlePageChange = (newPage) => {
      dispatch(setPage(newPage));
    }
    const handleNextPage = () => {
      dispatch(setPage(page + 1));
    }
    const handlePreviousPage = () => {
      dispatch(setPage(page - 1));
    }
  
  //   const [deleteStaff] = useDeleteStaffByIdMutation();

//   const[deleteUser]=  useDeleteUserUnderAdminMutation();
  

//   const handleDelete = async (userId) => {
//     console.log(userId);
//     const confirmed = window.confirm("Are you sure you want to delete this staff?");
//     if (!confirmed) return;

//     try {
//       const response = await deleteUser(userId).unwrap();
    
//       console.log(response);
//       toast.success("Staff deleted successfully");
//       // No need to manually call useGetAllStaffsQuery again — RTK Query will refresh because of invalidatesTags
//     } catch (err) {
//       console.error("Failed to delete staff:", err);
//       toast.error("Failed to delete staff");
//     }
//   };

  return (
 
     
      <>
      
        {/* Main Content */}
        <div className="sb2-2-3">
          <div className="row">
            <div className="col-md-12">
              <div className="box-inn-sp">
                <div className="inn-title">
                <h4>Staff Details</h4>
                  <p>Manage all your staffs from one place</p>
                </div>

                <div className="tab-inn">
                  <div className="table-responsive table-desi">
                    {usersLoading ? <p className="text-center mt-4">Loading staffs...</p> :
                      (<table className="table table-hover">
                        <thead>
                          <tr>
                                   <th>Sl.No</th>
                            
                            <th> Name</th>
                            <th>Email</th>

                            <th>Phone Number</th>

                            <th>View</th>
                            <th>Edit</th>
                            {/* <th>Delete</th> */}
                          </tr>
                        </thead>

                        <tbody>
                          {staffs && staffs?.staffs?.map((user, index) => (
                            <tr key={user?.id}>
                                                                            <td>
          {(staffs.currentPage - 1) * 10 + (index + 1)}.
      </td>
                           
                                 <td>{user?.name}</td>
                              <td>{user?.email}</td>

                              <td>{user?.phone}</td>


                              <td>
                                 <Eye style={{ cursor: "pointer",
                                  backgroundColor: "transparent",
                                                                      color: "#4CA1AF"
                                                                    }} />
                                {/* <Link to={`/staff/view/${user.id}`}>
                                  <i className="fa fa-eye" aria-hidden="true"></i>
                                </Link> */}
                              </td>
                              <td>
                                    <SquarePen
                                    onClick={()=>{
                                      setSelectedStaff(user)
                                      setEditStaffModalOpen(true)}}
                                                                    style={{
                                                                      cursor: "pointer",
                                                                      backgroundColor: "transparent",
                                                                      color: "#4CA1AF"
                                                                    }} />
                                {/* <Link to={`/staff/update/${user.id}`}>
                                  <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                                </Link> */}

                              </td>
                              {/* <td>
                                <button>
                                  <i className="fa fa-trash-o" aria-hidden="true"></i>
                                </button>
                              </td> */}
                            </tr>
                          ))}
                        </tbody>
                      </table>)}

                    {/* Optional: No leads message */}
                    {staffs?.staffs?.length === 0 && (
                      <p className="text-center mt-4">No staffs found.</p>
                    )}
                  </div>
                     {editStaffModalOpen && (
          <EditStaffModal
            // editStaffModalOpen={editStaffModalOpen}
            setEditStaffModalOpen={setEditStaffModalOpen}
            selectedStaff={selectedStaff}
            onClose={() => setEditStaffModalOpen(false)}
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
                                {[...Array(staffs?.totalPages).keys()].map((index) => (
                                    <button
                                        key={index}
                                        onClick={() => handlePageChange(index + 1)}
                                        // className={
                                        //     `px-3 py-1 rounded ${page === index + 1 ? 'bg-[#7346ff] text-white' : 
                                        //         'bg-gray-200 hover:bg-gray-300'
                                        //     }`}
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
                                    disabled={page === staffs?.totalPages || staffs?.totalPages === 0}
                                    className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                ${page === staffs?.totalPages || staffs?.totalPages === 0 ? 'opacity-50 ' : ''}
                `}
                                >
                                    Next →
                                </button>
                            </div>
                </div>
              </div>
            </div>
          </div>
        
        </div>
       
      </>
  
  )
}