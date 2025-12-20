import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useGetUserQuery, useLogoutUserMutation } from "../../redux/api/userApi";
import "./Header.css";
import { toast } from "react-toastify";
import MobileSideMenu from "../MobileSideMenu/MobileSideMenu";
import { LogOut,ChevronUp, ChevronDown, TableOfContents } from 'lucide-react';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
 const[mobileViewSideBarOpen, setMobileViewSideBarOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
   //const dispatch = useDispatch();
   const IconComponent = dropdownOpen ? ChevronUp : ChevronDown;
  const { data: userMe,  } = useGetUserQuery();
  console.log(userMe,"userMe");
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    console.log("Dropdown toggled", !dropdownOpen);
    setDropdownOpen(!dropdownOpen);
  };

  const[logoutUser]= useLogoutUserMutation();

  const handleLogout = async () => {
    

    try{
      const response = await logoutUser().unwrap();
      console.log("Logout Response:", response);
      if(response?.success){
        console.log(response?.message);
        // ✅ Clear Redux user slice completely
        // dispatch(setLoggedIn(false));
        // dispatch(setUserId(null));
        //  dispatch(setUser(null));
        //  dispatch(setUserRole(null));
         toast.success(response?.message || 'Logout successful');
        window.location.href = "/login"; // hard redirect clears memory
    }
  } catch(err){
    console.error('Logout error:', err);
    toast.error(err?.data?.message || 'Logout failed');
  }
  // console.error('Server responded with:', error.response.data);
  //     }
    }
  const handleToggleMobileViewOpen = () => {
    setMobileViewSideBarOpen(!mobileViewSideBarOpen);
  };
  
  const handleCloseMobileMenu = () => {
    setMobileViewSideBarOpen(false);
  };

  return (
    <>
       
        <div className="container-fluid sb1 ">
          <div className="row ">
               

<div style={{paddingLeft:"0px",paddingRight:"0px"}}
className="w-full flex flex-wrap items-center justify-between header sm:mt-0">

  {/* LEFT SECTION */}
  {/* <div style={{border:"none"
    
  }} className="
  flex  w-full items-center justify-around gap-2 flex-shrink-0 border-b border-gray-200  
  sm:justify-start sm:w-auto">
    {userMe?.user?.role!=="kitchen-staff" &&<span
      className="atab-menu cursor-pointer block flex items-start justify-start sm:hidden"
      onClick={() => handleToggleMobileViewOpen()}
    >
      <i className="fa fa-bars tab-menu text-lg"></i>
    </span>}

     <i className="fa fa-cubes text-xl text-blue-500"></i>

    <div  className="flex justify-center items-center ">
  
     <img src="/assets/images/logo.png" className="w-22 " alt="" />
     </div>
  </div> */}
{/* LEFT SECTION */}
{/* <div
  className="
    relative
    flex w-full items-center justify-center  gap-2 flex-shrink-0
 
    sm:justify-start sm:w-auto
  "
>

  {userMe?.user?.role !== "kitchen-staff" && (
    <span
      className="
        absolute left-2
        cursor-pointer
        flex items-center
        lg:hidden
      "
      onClick={handleToggleMobileViewOpen}
    >
        <TableOfContents/>
         {/* <i style={{fontSize:"2rem"}}
         className="fa fa-bars  text-2xl">
          
         </i> 
      {/* <i className="fa fa-bars text-2xl"></i> 
    </span>
  )}


  <div className="flex justify-center items-center">
    <img
      src="/assets/images/logo.png"
      className="w-22 sm:ml-4 mr-8"
      alt="logo"
    />
  </div>
</div> */}
<div 
  className="
    relative
    flex w-full items-center justify-center
    gap-2 flex-shrink-0
    md:justify-start
    sm:pl-12
    lg:pl-0
    sm:w-auto
  "
>
  {userMe?.user?.role !== "kitchen-staff" && (
    <span
      className="
        absolute left-2
        cursor-pointer
        flex items-center
        lg:hidden
      "
      onClick={handleToggleMobileViewOpen}
    >
      <TableOfContents />
    </span>
  )}

  <div className="flex justify-center items-center">
    <img
      src="/assets/images/logo.png"
      className="w-22 sm:ml-4 mr-8"
      alt="logo"
    />
  </div>
</div>


  {/* RIGHT SECTION */}
  <div className="flex items-center w-full justify-center gap-2 sm:gap-4 sm:w-auto ">

    {/* Buttons */}
    {userMe?.user?.role==="admin" &&<button
      type="button"
      style={{backgroundColor:"red"}}
      onClick={() => navigate("/inventory/add")}
      className="text-white text-sm sm:text-base font-semibold py-2 px-2 
      sm:px-4  rounded"
    >
      Add Inventory
    </button>}

    {userMe?.user?.role==="admin" && <button
      type="button"
       style={{backgroundColor:"black"}}
      onClick={() => navigate("/new/food-items/add")}
      className="text-white text-sm sm:text-base font-semibold py-2 px-2 sm:px-4 
      rounded "
    >
      Add Food Item
    </button>}

    {userMe?.user?.role==="staff" &&<button
      type="button"
      style={{backgroundColor:"red"}}
      onClick={() => navigate("/staff/orders/add")}
      className="text-white text-sm sm:text-base font-semibold py-2 px-3 
      sm:px-4 rounded"
    >
     Order
    </button>}

    {userMe?.user?.role==="staff" && <button
      type="button"
       style={{backgroundColor:"black"}}
      onClick={() => navigate("/staff/orders-takeaway/add")}
      className="text-white text-sm sm:text-base font-semibold py-2 px-3 sm:px-4 
      rounded "
    >
      Takeaway
    </button>}
   {userMe?.user?.role==="kitchen-staff" && <button
      type="button"
       style={{backgroundColor:"black"}}
      onClick={() => navigate("/new/all-new-food-items")}
      className="text-white text-sm sm:text-base font-semibold py-2 px-3 sm:px-4 
      rounded "
    >
      Food Items
    </button>}

      {userMe?.user?.role==="kitchen-staff" && <button
      type="button"
       style={{backgroundColor:"red"}}
      onClick={() => navigate("/kitchen-staff/orders/all-orders")}
      className="text-white text-sm sm:text-base font-semibold py-2 px-3 sm:px-4 
      rounded "
    >
      Orders
    </button>}


    {/* ADMIN DROPDOWN */}
    <div ref={dropdownRef} className="relative">
      <NavLink
        className="top-user-pro flex items-center cursor-pointer text-sm sm:text-base"
        onClick={(e) => {
          e.preventDefault();
          toggleDropdown();
        }}
      >
        {userMe?.user?.role==="admin"&&<span>Admin Account</span>}
        {userMe?.user?.role==="staff"&&<span>Staff Account</span>}
        {userMe?.user?.role==="kitchen-staff"&&
        <span>{userMe?.user?.name} Staff Account</span>
        }
        <IconComponent size={18} className="ml-1" />
      </NavLink>

      {dropdownOpen && (
        <ul
          className="absolute bg-white border rounded-md shadow-lg z-50 top-10
           min-w-[150px] mt-1 right-0"
        >
          <li>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-100 text-sm"
              style={{backgroundColor:"transparent"}}
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </button>
          </li>
        </ul>
      )}
    </div>
  </div>

</div>

      </div>
    </div>
  
  {mobileViewSideBarOpen && 
     <div className="sb2-1">
  <MobileSideMenu onClose={handleCloseMobileMenu} 
  
  />
   </div>}
   
    </>
  );
};
export default Header;