import  { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {LayoutDashboard,Users, Package, ShoppingCart, DollarSign,
   ClipboardMinus, CalendarDays, 
   Settings, CookingPot, Armchair, Handbag, ListOrdered, Calendar, Utensils } from 'lucide-react'
import { useGetUserQuery } from "../../redux/api/userApi";


const REACT_APP_API_URL = "http://localhost:4000";

const SideMenu = () => {
  // const { userId } = useSelector((state) => state.user);
  const [openMenu, setOpenMenu] = useState(null);
// const {user,userRole} = useSelector((state) => state.user);
  const { data: userMe } = useGetUserQuery();
console.log(userMe);
  const toggleMenu = (menuKey) => {
    setOpenMenu((prev) => (prev === menuKey ? null : menuKey));
  };
  const location=useLocation(); // ✅ correct way
  useEffect(() => {
   

const currentPath = location.pathname;
// console.log("currentPath", currentPath);
  //const from = location.state?.from || new URLSearchParams(location.search).get("from");
     //const searchParams = new URLSearchParams(location.search);
  //const from = location.state?.from || searchParams.get("from");
//const from = location.state?.from || new URLSearchParams(location.search).get("from");
    if(currentPath.startsWith("/table/add") || currentPath.startsWith("/table/all-tables") )
     {
      setOpenMenu("Table");
      
    }
    

 
    if(currentPath.startsWith("/party/add") || currentPath.startsWith("/party/all-parties") )
     {
      setOpenMenu("Parties");
      
    }
   if(currentPath.startsWith("/new/food-items/add") || currentPath.startsWith("/sale/all-sales") ||
   currentPath.startsWith("/sale/edit") 
  || currentPath.startsWith("/sale/view")|| currentPath.startsWith("/new/food-items/add")||
    currentPath.startsWith("/new/all-new-food-items")|| currentPath.startsWith("/new/sale/edit") )
     {
      setOpenMenu("Food Items");
      
    }
 
    if(currentPath.startsWith("/inventory/add") || currentPath.startsWith("/inventory/all-inventories") )
     {
      setOpenMenu("Inventory");
      
    }

   

    if(currentPath.startsWith("/staff/add")|| currentPath.startsWith("/staff/all-staffs") )
     {
      setOpenMenu("Settings");
      
    }

    if(currentPath.startsWith("/material/add")||
     currentPath.startsWith("/material/all-materials") ||
     currentPath.startsWith("/material/materials-release") )
     {
      setOpenMenu("Material");
      
    }
    if( currentPath.startsWith("/order/all-orders") )
    {
      setOpenMenu("Orders");
    }

    if(userMe?.user?.role=="staff" && currentPath.startsWith("/staff/table/items-add")|| 
    currentPath.startsWith("/staff/table/all-tables") )
    {
      setOpenMenu("Table");
    }
  if(userMe?.user?.role=="staff" && currentPath.startsWith("/staff/orders/add")|| 
    currentPath.startsWith("/staff/orders/all-orders") )
    {
      setOpenMenu("Orders");
    }

 
  }, [location]);

const isLinkActive = (linkTo) => {
  const normalize = (path) => path.replace(/\/+$/, "");
  const current = normalize(location.pathname);
  const searchParams = new URLSearchParams(location.search);
  const from =location.state?.from ||searchParams.get("from") ||localStorage.getItem("lastFrom");

  // const from = location.state?.from || searchParams.get("from");
  const cleanLink = normalize(linkTo);

  // 🔹 Exact match
  if (current === cleanLink) return true;

  // 🔹 Items Section
  if (
    (cleanLink === "/table/add" && current.startsWith("/table/add")) ||
   
    (cleanLink === "/table/all-tables" && current.startsWith("/table/all-tables"))
   
  )
    return true;

  // 🔹 Parties Section
  // if (
  //   (cleanLink === "/party/add" && current.startsWith("/party/add")) ||
  //   (cleanLink === "/party/all-parties" && current.startsWith("/party/all-parties"))
  // )
  //   return true;

 
if (
  (cleanLink === "/new/food-items/add" && current.startsWith("/new/food-items/add")) ||
  (cleanLink === "/sale/all-sales" &&
    (current.startsWith("/sale/all-sales") ||
      (current.startsWith("/sale/edit") && from === "all-sale-list") ||
      (current.startsWith("/sale/view") &&
        (from === "all-sale-list" ||
          // fallback: match Sale_Id that starts with "SAL" but NOT "SALS"
          /^\/sale\/view\/SAL(?!S)/.test(location.pathname)))))
)
  return true;

// 🔹 New Sale
if (
  (cleanLink === "/new/food-items/add" && current.startsWith("/new/food-items/add")) ||
  (cleanLink === "/new/all-new-food-items" &&
    (current.startsWith("/new/all-new-food-items") ||
      (current.startsWith("/new/sale/edit") && from === "all-new-sale-list") ||
      (current.startsWith("/sale/view") &&
        (from === "all-new-sale-list" ||
          // fallback: match Sale_Id that starts with "SALS"
          /^\/sale\/view\/SALS/.test(location.pathname)))))
)
  return true;


  // 🔹 inventory
  if (
    (cleanLink === "/inventory/add" && current.startsWith("/inventory/add")) ||
    (cleanLink === "/inventory/all-inventories" && current.startsWith("/inventory/all-inventories"))
  )
    return true;

  if((cleanLink==="/staff/orders/add" && current.startsWith("/staff/orders/add")) ||
  (cleanLink==="/staff/orders/all-orders" && current.startsWith("/staff/orders/all-orders"))
  )
  return true;

  
  return false;
};


  const renderMenu = (label, iconClass, links, menuKey = label) => {
    return (
      <li key={label}>
        <NavLink
          to="#"
          className={`collapsible-header ${openMenu === menuKey ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            toggleMenu(menuKey);
          }}
        >
          {/* <i className={`fa ${iconClass}`} aria-hidden="true"></i> {label} */}
          <span className="flex items-center gap-2 ">{iconClass } {label}</span>
        </NavLink>

       {openMenu === menuKey && (
          <div className="collapsible-body left-sub-menu">
            <ul>
              {links.map(({ to, text }, index) => (
                <li key={index}>
                  <NavLink
                    to={to}
                    className={isLinkActive(to) ? "menu-active" : ""}
                  >
                    {text}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Sidebar Header */}
      <div  className="sb2-12 flex items-center justify-center  ">
        {/* <ul className="flex flex-col items-center">
        
          <li className="mt-4">
            <h5>Inventory Management</h5>
          </li>
        </ul> */}
      </div>

      {/* Sidebar Navigation */}
      <div
        className="sb2-13"
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
         
        }}
      >
        <ul
        className="collapsible"
          // className="collapsible"
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            margin: 0,
            padding: 0,
          }}
        >
           {userMe?.user?.role === "admin" && <NavLink
              to="/home"
              className={({ isActive }) => (isActive ? "menu-active" : "")}
              style={{ display: 'block', padding: '10px 16px',
                color: "#666", textDecoration: 'none' }}
                  onClick={() => setOpenMenu(null)} // ✅ Close all submenus
            >
              
              {/* <i className="fa fa-bar-chart" aria-hidden="true"></i> Dashboard */}
                 <span className="flex items-center gap-2"><LayoutDashboard size={20}/> 
                 Dashboard
                 </span>
            </NavLink>}
               {userMe?.user?.role === "admin" && renderMenu("Parties",     <Users size={20}/>, [
           { to: "/party/add", text: "Add Parties" },
            { to: "/party/all-parties", text: "Party Details" },
             
          ])}
      
           {userMe?.user?.role === "admin" && renderMenu("Material", <Handbag   size={20} />, [
           
            // { to: "/material/add", text: "Add Material" },
            { to: "/material/all-materials", text: "Material List" },
            { to: "/material/materials-release", text: "Material Release" },
          
          ])}

          
             {userMe?.user?.role === "admin" && renderMenu("Inventory", <ShoppingCart size={20} />, [
            { to: "/items/add-category", text: "Add Category" },
            { to: "/inventory/add", text: "Add Inventory" },
            { to: "/inventory/all-inventories", text: " All Inventory" },
          ])}

             {userMe?.user?.role === "admin" && renderMenu("Table", <Armchair size={20} />, [
          
            { to: "/table/add", text: "Add Table" },
            { to: "/table/all-tables", text: "Table Details" },
            // { to: "/items/all-items", text: "Item Details" },
         
          ])}
               {userMe?.user?.role === "admin" && renderMenu("Food Items", <CookingPot  size={20} />, [
           
          //  {to: "/sale/invoice", text: " Invoice" },
          //   { to: "/food-items/add", text: "Add Sale" },
            
          //    { to: "/sale/all-sales", text: " All Sales" },
             
             { to: "/new/food-items/add", text: "Add  Food Items" },
              { to: "/new/all-new-food-items", text: "Food Items List" },
          
          ])}
          {userMe?.user?.role === "admin" && renderMenu("Orders", <Calendar size={20} />, [
           
          //  {to: "/sale/invoice", text: " Invoice" },
          //   { to: "/food-items/add", text: "Add Sale" },
            
          //    { to: "/sale/all-sales", text: " All Sales" },
             
            
              { to: "/order/all-orders", text: "All Orders" },
          
          ])}

        
          
          {userMe?.user?.role === "admin" && renderMenu("Settings", <Settings  size={20} />, [
           
            { to: "/staff/add", text: "Add Staff" },
            { to: "/staff/all-staffs", text: "Staff List" },
             { to: "/financial-year/add", text: "Financial Year" },
          
          ])}

            {/* {userMe?.user?.role==="staff" && renderMenu("Table", <Armchair size={20} />, [
          
            { to: "/staff/table/items-add", text: " Table" },
            // { to: "/staff/table/all-tables", text: "Table Details" },
            // { to: "/items/all-items", text: "Item Details" },
         
          ])} */}

          {userMe?.user?.role==="staff" && <NavLink
              to="/staff/orders/all-orders"
              className={({ isActive }) => (isActive ? "menu-active" : "")}
              style={{ display: 'block', padding: '10px 16px',
                color: "#666", textDecoration: 'none' }}
                  onClick={() => setOpenMenu(null)} // ✅ Close all submenus
            >
              
              {/* <i className="fa fa-bar-chart" aria-hidden="true"></i> Dashboard */}
                 <span className="flex items-center gap-2">  <Armchair  size={20}/> 
                Tables
                 </span>
            </NavLink>}
{/* 
           {userMe?.user?.role==="staff" && renderMenu("Orders", <ListOrdered size={20} />, [
          //  { to: "/staff/orders/all-orders", text: "Table Details" },
            
            { to: "/staff/orders/add", text: "Add Order" },
           
         
          ])} */}
          {userMe?.user?.role==="staff" && <NavLink
              to="/staff/orders/add"
              className={({ isActive }) => (isActive ? "menu-active" : "")}
              style={{ display: 'block', padding: '10px 16px',
                color: "#666", textDecoration: 'none' }}
                  onClick={() => setOpenMenu(null)} // ✅ Close all submenus
            >
              
              {/* <i className="fa fa-bar-chart" aria-hidden="true"></i> Dashboard */}
                 <span className="flex items-center gap-2">  <ListOrdered  size={20}/> 
                Add Order
                 </span>
            </NavLink>}

            {userMe?.user?.role==="staff" && <NavLink
              to="/staff/orders-takeaway/add"
              className={({ isActive }) => (isActive ? "menu-active" : "")}
              style={{ display: 'block', padding: '10px 16px',
                color: "#666", textDecoration: 'none' }}
                  onClick={() => setOpenMenu(null)} // ✅ Close all submenus
            >
              
             
                 <span className="flex items-center gap-2">  <Utensils  size={20}/> 
                Add Takeaway
                 </span>
            </NavLink>}


             {userMe?.user?.role==="staff" && <NavLink
              to="/order/all-orders"
              className={({ isActive }) => (isActive ? "menu-active" : "")}
              style={{ display: 'block', padding: '10px 16px',
                color: "#666", textDecoration: 'none' }}
                  onClick={() => setOpenMenu(null)} // ✅ Close all submenus
            >
              
             
                 <span className="flex items-center gap-2">  <Calendar  size={20}/> 
                All Orders
                 </span>
            </NavLink>}

           {userMe?.user?.role === "admin" && <NavLink
              to="/reports"
              className={({ isActive }) => (isActive ? "menu-active" : "")}
              style={{ display: 'block', padding: '10px 16px',
                color: "#666", textDecoration: 'none' }}
                  onClick={() => setOpenMenu(null)} // ✅ Close all submenus
            >
              
              {/* <i className="fa fa-bar-chart" aria-hidden="true"></i> Dashboard */}
                 <span className="flex items-center gap-2">  <ClipboardMinus  size={20}/> 
                 Reports
                 </span>
            </NavLink>}


        </ul>
      </div>
    </>
  );
};



export default SideMenu;


