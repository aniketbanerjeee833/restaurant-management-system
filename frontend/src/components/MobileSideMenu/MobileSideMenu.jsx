import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {LayoutDashboard,Users, Package, ShoppingCart, DollarSign,
   ClipboardMinus, CalendarDays, Settings, CookingPot,
    Armchair, Handbag, ListOrdered, Calendar, Utensils, X } from 'lucide-react'

import "./MobileSideMenu.css";
import { useGetUserQuery } from "../../redux/api/userApi";
const MobileSideMenu = ({onClose}) => {
  // const { userId } = useSelector((state) => state.user);
   const { data: userMe } = useGetUserQuery();
  const [openMenu, setOpenMenu] = useState(null);
  const location=useLocation(); // ✅ correct way
  const toggleMenu = (menuKey) => {
    setOpenMenu((prev) => (prev === menuKey ? null : menuKey));
  };
  useEffect(() => {
   

const currentPath = location.pathname;
  //const from = location.state?.from || new URLSearchParams(location.search).get("from");
   

    if(currentPath.startsWith("/items/add") || currentPath.startsWith("/items/all-items") ||
    currentPath.startsWith("/items/add-category"))
     {
      setOpenMenu("Items");
      
    }
    
 
 
    if(currentPath.startsWith("/party/add") || currentPath.startsWith("/party/all-parties") )
     {
      setOpenMenu("Parties");
      
    }
  //  if(currentPath.startsWith("/sale/add") || currentPath.startsWith("/sale/all-sales") ||
  //   currentPath.startsWith("/sale/invoice") )
  //    {
  //     setOpenMenu("Sales");
      
  //   }
  // if(currentPath.startsWith("/sale/add") || currentPath.startsWith("/sale/all-sales") ||
  //   currentPath.startsWith("/sale/invoice") || currentPath.startsWith("/sale/edit") 
  // || currentPath.startsWith("/sale/view")|| currentPath.startsWith("/new/sale/add")||
  //   currentPath.startsWith("/sale/all-new-sales")|| currentPath.startsWith("/new/sale/edit") )
  //    {
  //     setOpenMenu("Sales");
      
  //   }
     if(currentPath.startsWith("/new/food-items/add") || currentPath.startsWith("/sale/all-sales") ||
   currentPath.startsWith("/sale/edit") 
  || currentPath.startsWith("/sale/view")|| currentPath.startsWith("/new/food-items/add")||
    currentPath.startsWith("/new/all-new-food-items")|| currentPath.startsWith("/new/sale/edit") )
     {
      setOpenMenu("Food Items");
      
    }
    // if(currentPath.startsWith("/purchase/add") || currentPath.startsWith("/purchase/all-purchases") )
    //  {
    //   setOpenMenu("Purchase");
      
    // }
 
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
    (cleanLink === "/items/add" && current.startsWith("/items/add")) ||
    (cleanLink === "/items/add-category" && current.startsWith("/items/add-category")) ||
    (cleanLink === "/items/all-items" && current.startsWith("/items/all-items"))
   
  )
    return true;

  // 🔹 Parties Section
  if (
    (cleanLink === "/party/add" && current.startsWith("/party/add")) ||
    (cleanLink === "/party/all-parties" && current.startsWith("/party/all-parties"))
  )
    return true;

  
if (
  (cleanLink === "/sale/add" && current.startsWith("/sale/add")) ||
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
  (cleanLink === "/new/sale/add" && current.startsWith("/new/sale/add")) ||
  (cleanLink === "/sale/all-new-sales" &&
    (current.startsWith("/sale/all-new-sales") ||
      (current.startsWith("/new/sale/edit") && from === "all-new-sale-list") ||
      (current.startsWith("/sale/view") &&
        (from === "all-new-sale-list" ||
          // fallback: match Sale_Id that starts with "SALS"
          /^\/sale\/view\/SALS/.test(location.pathname)))))
)
  return true;


  // 🔹 Purchase
  if (
    (cleanLink === "/purchase/add" && current.startsWith("/purchase/add")) ||
    (cleanLink === "/purchase/all-purchases" && current.startsWith("/purchase/all-purchases"))
  )
    return true;

  return false;
};
// const handleDashBoardClick = () => {
//   setOpenMenu(null);
//   onClose();
// };
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
                     onClick={onClose}
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
            <div
        className="mobile-overlay"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 999,
        }}
      ></div>
       <div className="mobile-drawer"
       style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "280px",
          height: "100%",
          background: "#fff",
          zIndex: 1000,
          overflowY: "auto",
          boxShadow: "2px 0 8px rgba(0,0,0,0.2)",
          paddingTop: "20px",
        }}>
      <div  className="sb2-12 flex items-center justify-center  ">
      
          <X onClick={onClose}
             style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#666",
         
          }}/>

        <ul className="flex flex-col items-center">
        
          <li className="mt-4">
            <h5>Inventory Management</h5>
          </li>
        </ul>
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
       </div>

    </>
  );
  // return (
  //   <>
  //     {/* Sidebar Header */}
  //       <div
  //       className="mobile-overlay"
  //       onClick={onClose}
  //       style={{
  //         position: "fixed",
  //         top: 0,
  //         left: 0,
  //         right: 0,
  //         bottom: 0,
  //         backgroundColor: "rgba(0,0,0,0.5)",
  //         zIndex: 999,
  //       }}
  //     ></div>
  //      <div className="mobile-drawer"
  //      style={{
  //         position: "fixed",
  //         top: 0,
  //         left: 0,
  //         width: "280px",
  //         height: "100%",
  //         background: "#fff",
  //         zIndex: 1000,
  //         overflowY: "auto",
  //         boxShadow: "2px 0 8px rgba(0,0,0,0.2)",
  //         paddingTop: "20px",
  //       }}>
  //     <div  className="sb2-12 flex items-center justify-center  ">
      
  //         <X onClick={onClose}
  //            style={{
  //           position: "absolute",
  //           top: "10px",
  //           right: "10px",
  //           border: "none",
  //           background: "transparent",
  //           cursor: "pointer",
  //           color: "#666",
         
  //         }}/>

  //       <ul className="flex flex-col items-center">
        
  //         <li className="mt-4">
  //           <h5>Inventory Management</h5>
  //         </li>
  //       </ul>
  //     </div>

  //     {/* Sidebar Navigation */}
  //     <div
  //       className="sb2-13"
  //       style={{
  //         height: "100%",
  //         display: "flex",
  //         flexDirection: "column",
         
  //       }}
  //     >
  //       <ul
  //         className="collapsible"
  //         style={{
  //           height: "100%",
  //           display: "flex",
  //           flexDirection: "column",
  //           margin: 0,
  //           padding: 0,
  //         }}
  //       >
  //          <NavLink
  //             to="/home"
  //             className={({ isActive }) => (isActive ? "menu-active" : "")}
  //             style={{ display: 'block', padding: '10px 16px',
  //               color: "#666", textDecoration: 'none' }}
  //                   onClick={() => 
  //                   handleDashBoardClick()

                       
  //                   } // ✅ Close all submenus
  //           >
  //             <i className="fa fa-bar-chart" aria-hidden="true"></i> Dashboard
  //           </NavLink>
  //              {renderMenu("Parties", <Users size={20}/>, [
  //          { to: "/party/add", text: "Add Parties" },
  //           { to: "/party/all-parties", text: "Party Details" },
             
  //         ])}
  //         {renderMenu("Items",  <Package size={20} />, [
  //            { to: "/items/add-category", text: "Add Category" },
  //           { to: "/items/add", text: "Add Items" },
  //           { to: "/items/all-items", text: "Item Details" },
             
         
  //         ])}
        
  //            {renderMenu("Purchase",  <ShoppingCart size={20} />, [
           
  //           { to: "/purchase/add", text: "Add Purchase" },
  //           { to: "/purchase/all-purchases", text: " Purchase List " },
  //         ])}
  //              {renderMenu("Sales", <DollarSign size={20} />, [
           
         
  //                 { to: "/new/sale/add", text: "Add New Sale" },
  //             { to: "/sale/all-new-sales", text: "New Sale List" },
  //         ])}
          
  //       </ul>
  //     </div>
  //   </div>
  //   </>
  // );
};
export default MobileSideMenu;