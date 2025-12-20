import { lazy, Suspense } from 'react';
import { Routes, Route, BrowserRouter, Navigate, useLocation, Outlet } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout/Layout';
import { useGetUserQuery } from './redux/api/userApi';
import Spinner from './components/Layout/Spinner';




// 🧩 Lazy imports
const Header = lazy(() => import('./components/Header/Header'));
const Login = lazy(() => import('./pages/User/Login/Login'));

const Dashboard = lazy(() => import('./pages/Dashboard'));

const Reports = lazy(() => import('./pages/Reports'));
const DayWiseReport = lazy(() => import('./pages/DayWiseReport'));
const DateRangeReport = lazy(() => import('./pages/DateRangeReport'));
const AddCategory = lazy(() => import('./pages/Items/AddCategories'));


const AddMaterial = lazy(() => import('./pages/Materials/AddMaterial'));
const MaterialsList = lazy(() => import('./pages/Materials/MaterialsList'));
const MaterialsRelease = lazy(() => import('./pages/Materials/MaterialsRelease'));
const EachMaterialReport = lazy(() => import('./pages/Materials/EachMaterialReport'));

const PartyAdd = lazy(() => import('./pages/Party/PartyAdd'));
const AllPartiesList = lazy(() => import('./pages/Party/AllPartiesList'));
const PartySalesPurchasesDetails = lazy(() => import('./pages/Party/PartySalesPurchasesDetails'));



const Table= lazy(() => import('./pages/Items/Table'));
const AllTablesList = lazy(() => import('./pages/Items/AllTablesList'));

const ItemSalesPurchasesDetails = lazy(() => import('./pages/Items/ItemsSalesPurchasesDetails'));


const InventoryAdd = lazy(() => import('./pages/Purchase/InventoryAdd'));
const InventoryView = lazy(() => import('./pages/Purchase/InventoryView'));
const AllInventoryList = lazy(() => import('./pages/Purchase/AllInventoryList'));
const InventoryEdit = lazy(() => import('./pages/Purchase/InventoryEdit'));


const AddFoodItem = lazy(() => import('./pages/Sale/AddFoodItem'));
const SaleView = lazy(() => import('./pages/Sale/SaleView'));
const NewSaleEdit = lazy(() => import('./pages/Sale/NewSaleEdit'));
const AllFoodItemsList = lazy(() => import('./pages/Sale/AllFoodItemsList'));


const AllOrdersDashboard = lazy(() => import('./pages/Orders/AllOrdersDashboard'));
const AllOrdersDayWise = lazy(() => import('./pages/Orders/AllOrdersDayWise'));
const AllOrdersTakeawayDateRange = lazy(() => import('./pages/Orders/AllOrdersTakeawayDateRange'));

const AddStaff = lazy(() => import('./pages/Settings/AddStaff'));
const StaffList = lazy(() => import('./pages/Settings/StaffList'));

const FinancialYear = lazy(() => import('./pages/Settings/FinancialYear'));
// const StaffTables=lazy(()=>import('./staff/pages/Tables/StaffTables'))
// const StaffTablesList=lazy(()=>import('./staff/pages/Tables/StaffTablesList'))

// ==========================================
// Staff PAnel Routes
// ==========================================



const Orders=lazy(()=>import('./StaffPanel/pages/Orders'))
const OrdersTakeAway=lazy(()=>import('./StaffPanel/pages/OrdersTakeAway'))
const OrderDetails=lazy(()=>import('./StaffPanel/pages/OrderDetails'))
const TableOrderDetails=lazy(()=>import('./StaffPanel/pages/TableOrderDetails'))




// ==========================================
// Kitchen Staff PAnel Routes
// ==========================================
const KitchenStaff=lazy(()=>import('./KitchenStaffPanel/pages/KitchenStaff'))


const InvoicePublicView=lazy(()=>import('./pages/InvoicePublicView'))
// ==========================================
// 🔒 Auth Route Guards
// ==========================================




function ProtectedRoute() {
  const location = useLocation();
  const { data, isLoading, isError } = useGetUserQuery(undefined, {
    skip: location.pathname === "/login", // ⛔ Skip fetch on login
  });

  if (isLoading) return <div className='flex justify-center align-center w-full'>Loading...</div>;

  const isAuthenticated = data?.authenticated || data?.user;

  if (isError || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// 🔓 Public Route — prevent logged-in users from accessing /login
function PublicRoute() {
  const location = useLocation();
  const { data, isLoading } = useGetUserQuery(undefined, {
    skip: location.pathname !== "/login", // ✅ Only run this check on login page
  });

  if (isLoading) return <div>Loading...</div>;

  const isAuthenticated = data?.authenticated;

  return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />;
}

function RouterWrapper({ userRole }) {
  const location = useLocation();
  console.log(location, userRole);
  const hideHeader = location.pathname === "/login" || 
  location.pathname.startsWith("/day-wise-report") ||
  location.pathname.startsWith("/date-range-report") ||
  location.pathname.startsWith("/material/material-view")||
  location.pathname.startsWith("/order/day-wise-invoices-order-report")||
  location.pathname.startsWith("/party/party-sales-purchases-details");

  return (
    <>
      {!hideHeader && <Header />}
    <Suspense fallback={<Spinner size="lg" text="Loading Dashboard..." />}>
        <Routes>
          {/* Public Route: Login */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
   
          </Route>
{/* Admin Routes */}
          {userRole=="admin" && (

         <>
  

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/home"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />


            <Route
              path="/items/add-category"
              element={
                <Layout>
                  <AddCategory />
                </Layout>
              }
            />
            <Route
              path="/table/add"
              element={
                <Layout>
                  <Table/>
                </Layout>
              }
            />
            <Route
              path="/table/all-tables"
              element={
                <Layout>
                  <AllTablesList />
                </Layout>
              }
            />
                  <Route
              path="/item/item-sales-purchases-details/:id"
              element={
                
                  <ItemSalesPurchasesDetails/>
               
              }
            />
            <Route
              path="/party/add"
              element={
                <Layout>
                  <PartyAdd />
                </Layout>
              }
            />
            <Route
              path="/party/all-parties"
              element={
                <Layout>
                  <AllPartiesList />
                </Layout>
              }
            />
              <Route
              path="/party/party-sales-purchases-details/:id"
              element={
                
                  <PartySalesPurchasesDetails/>
               
              }
            />

             <Route
              path="/material/add"
              element={
                <Layout>
                  <AddMaterial/>
                </Layout>
              }
            />

           
            <Route
              path="/material/all-materials"
              element={
                <Layout>
                  <MaterialsList/>
                </Layout>
              }
            />
                <Route
              path="/material/materials-release"
              element={
                <Layout>
                  <MaterialsRelease/>
                </Layout>
              }
            />
  <Route
              path="/material/material-view/:Material_Name"
              element={
             
                  <EachMaterialReport/>
             
              }
            />
            
              <Route
              path="/new/food-items/add"
              element={
               
                  <AddFoodItem />
              
              }
            />
             <Route
              path="/new/sale/edit/:id"
              element={
               
                  <NewSaleEdit/>
              
              }
            />
              <Route
              path="/new/all-new-food-items"
              element={
                <Layout>
                  <AllFoodItemsList/>
                </Layout>
              }
            />
              <Route
              path="/sale/view/:id"
              element={
               
                  <SaleView />
             
              }
            />
            <Route
              path="/inventory/add"
              element={
             
                  <InventoryAdd />
                
              }
            />
              <Route
              path="/inventory/edit/:id"
              element={
             
                  <InventoryEdit />
                
              }
            />
            <Route
              path="/inventory/view/:id"
              element={
               
                  <InventoryView/>
             
              }
            />
            <Route
              path="/inventory/all-inventories"
              element={
                <Layout>
                  <AllInventoryList />
                </Layout>
              }
            />

            <Route path="/order/all-orders" element={
              <Layout>
                <AllOrdersDashboard />
              </Layout>
            } />

            <Route
              path="/order/day-wise-invoices-order-report/:date"
              element={
                
                  <AllOrdersDayWise/>
              
              }
            />
            {/* /order/date-range-orders-takaway-report */}
               <Route
              path="/order/date-range-orders-takaway-report/:fromDate/:toDate"
              element={
                
                  <AllOrdersTakeawayDateRange/>
              
              }
            />
            {/* <Route path="/order/view/:id" element={
              <Layout>
                <OrderView />
              </Layout>
            } /> */}
 
            <Route
              path="/staff/add"
              element={
                <Layout>
                  <AddStaff/>
                </Layout>
              }
            />

           
            <Route
              path="/staff/all-staffs"
              element={
                <Layout>
                  <StaffList/>
                </Layout>
              }
            />
            
            <Route
              path="/reports"
              element={
                <Layout>
                  <Reports />
                </Layout>
              }
            />
             <Route
              path="/reports"
              element={
                <Layout>
                  <Reports />
                </Layout>
              }
            />
              <Route
              path="/day-wise-report/:date"
              element={
                
                  <DayWiseReport/>
              
              }
            />
        
              <Route
             path="/date-range-report/:fromDate/:toDate" 
            element={<DateRangeReport/>} 
            />

                   <Route
              path="/financial-year/add"
              element={
                <Layout>
                  <FinancialYear/>
                </Layout>
              }
            />

          </Route>
          </>
        
        )}

        

        { userRole==="staff" && (
          <>
          {/* <Route
              path="/staff/table/items-add"
              element={
                <Layout>
                  <StaffTables/>
                </Layout>
              }
            /> */}
              {/* <Route
              path="/staff/table/all-tables"
              element={
                <Layout>
                  <StaffTablesList/>
                </Layout>
              }
            /> */}
              <Route
              path="/staff/orders/add"
              element={
               
                  <Orders/>
              
              }
            />
            <Route
              path="/staff/orders-takeaway/add"
              element={
               
                  <OrdersTakeAway/>
              
              }
            />
              <Route
              path="/staff/orders/all-orders"
              element={
                <Layout>
                  <OrderDetails/>
                </Layout>
              }
            />
            <Route
              path="/staff/orders/table-order-details/:Order_Id"
              element={
               
                  <TableOrderDetails/>
              
              }
            />
            <Route path="/order/all-orders" element={
              <Layout>
                <AllOrdersDashboard />
              </Layout>
            
            } />

               <Route
              path="/order/day-wise-invoices-order-report/:date"
              element={
                
                  <AllOrdersDayWise/>
              
              }
            />
            {/* /order/date-range-orders-takaway-report */}
               <Route
              path="/order/date-range-orders-takaway-report/:fromDate/:toDate"
              element={
                
                  <AllOrdersTakeawayDateRange/>
              
              }
            />


          </>
        )}

       {userRole==="kitchen-staff" && (
          <>
            <Route
              path="/kitchen-staff/orders/all-orders"
              element={
                
                  <KitchenStaff/>
               
              }
            />
                <Route
              path="/new/all-new-food-items"
              element={
              
                  <AllFoodItemsList/>
              
              }
            />
            </>
              )}

               <Route
          path="/invoice/view/:token"
          element={<InvoicePublicView/>}
        />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
export default function App() {
  const { data: userMe, isLoading } = useGetUserQuery();

  // ⛔ Prevent router from rendering repeatedly
  if (isLoading) return <div>Loading...</div>;

  // ❌ Not logged in → redirect userRole=null
  const role = userMe?.user?.role || null;

  return (
    <BrowserRouter>
      <RouterWrapper userRole={role} />
    </BrowserRouter>
  );
}




// const AdminOnly = ({ children }) => {
//   const { data } = useGetUserQuery();
//   if (data?.user?.role !== "admin") {
//     return <Navigate to="/login" replace />;
//   }
//   return children;
// };
// const StaffOnly = ({ children }) => {
//   const { data } = useGetUserQuery();
//   if (data?.user?.role !== "staff") {
//     return <Navigate to="/login" replace />;
//   }
//   return children;
// };
// const KitchenOnly = ({ children }) => {
//   const { data } = useGetUserQuery();
//   if (data?.user?.role !== "kitchen-staff") {
//     return <Navigate to="/login" replace />;
//   }
//   return children;
// };
// const AdminOnly = ({ role, children }) => {
//   if (!role) return <Spinner size="lg" text="Loading role..." />;
//   if (role !== "admin") return <Navigate to="/login" replace />;
//   return children;
// };

// const StaffOnly = ({ role, children }) => {
//   if (!role) return <Spinner size="lg" text="Loading role..." />;
//   if (role !== "staff") return <Navigate to="/login" replace />;
//   return children;
// };

// const KitchenOnly = ({ role, children }) => {
//   if (!role) return <Spinner size="lg" text="Loading role..." />;
//   if (role !== "kitchen-staff") return <Navigate to="/login" replace />;
//   return children;
// };

// function AppLayout() {
//   const dispatch = useDispatch();
//   const { loggedIn } = useSelector((state) => state.user);

//   const [isAuthChecking, setIsAuthChecking] = useState(true);

//   const { data, isLoading, isError } = useGetUserQuery();
//   const role=data?.user?.role
//   /* ================= AUTH BOOTSTRAP ================= */
//   useEffect(() => {
//     if (isLoading) {
//       setIsAuthChecking(true);
//       return;
//     }

//     if (isError || !data?.authenticated) {
//       dispatch(setLoggedIn(false));
//       setIsAuthChecking(false);
//       return;
//     }

//     dispatch(setUser(data.user));
//     dispatch(setUserId(data.user.User_Id));
//     dispatch(setLoggedIn(true));
//     setIsAuthChecking(false);
//   }, [data, isLoading, isError, dispatch]);

//   /* ================= ROUTE GUARDS ================= */

//   const RequireAuth = ({ children }) => {
//     if (isAuthChecking) return <Spinner size="lg" text="Checking session..." />;
//     return loggedIn ? children : <Navigate to="/login" replace />;
//   };

//   // const RedirectIfAuth = ({ children }) => {
//   //   if (isAuthChecking) return <Spinner size="lg" text="Checking session..." />;

//   //   if (loggedIn && data?.user?.role) {
//   //     const role = data.user.role;

//   //     if (role === "staff") return <Navigate to="/staff/orders/all-orders" replace />;
//   //     if (role === "kitchen-staff") return <Navigate to="/kitchen-staff/orders/all-orders" replace />;
//   //     return <Navigate to="/home" replace />;
//   //   }

//   //   return children;
//   // };
// //   const RedirectIfAuth = ({ children }) => {
// //   if (isAuthChecking) {
// //     return <Spinner size="lg" text="Checking session..." />;
// //   }

// //   return loggedIn ? <Navigate to="/home" replace /> : children;
// // };
// const RedirectIfAuth = ({ children }) => {
//   if (isAuthChecking ) {
//     return <Spinner size="lg" text="Checking session..." />;
//   }

//   if (loggedIn) {
//     if (role === "staff") return <Navigate to="/staff/orders/all-orders" replace />;
//     if (role === "kitchen-staff") return <Navigate to="/kitchen-staff/orders/all-orders" replace />;
//     return <Navigate to="/home" replace />;
//   }

//   return children;
// };


//     const location = useLocation();

//   const hideHeader = location.pathname === "/login" || 
//   location.pathname.startsWith("/day-wise-report") ||
//   location.pathname.startsWith("/date-range-report") ||
//   location.pathname.startsWith("/material/material-view")||
//   location.pathname.startsWith("/order/day-wise-invoices-order-report")||
//   location.pathname.startsWith("/party/party-sales-purchases-details");

  
//     return (
//     <>
     
//       {!hideHeader && <Header />}
//     <Suspense fallback={<Spinner size="lg" text="Loading Dashboard..." />}>
//         <Routes>
//           {/* Public Route: Login */}
          
//             <Route path="/login" element={
//                <RedirectIfAuth>
//               <Login />
//               </RedirectIfAuth>
//               } />
   
       
// {/* Admin Routes */}
          

//          <>
  

//           {/* Protected Routes */}
//           {/* <Route element={<ProtectedRoute />}>
//             <Route
//               path="/home"
//               element={
//                 <Layout>
//                   <Dashboard />
//                 </Layout>
//               }
//             /> */}
//                <Route
//             path="/home"
//             element={
//               <RequireAuth>
//                 <AdminOnly role={role}>
//                 <Layout>
//                   <Dashboard />
//                 </Layout>
//                 </AdminOnly>
//               </RequireAuth>
//             }
//           />


//             <Route
//               path="/items/add-category"
//               element={
//                   <RequireAuth>
//                     <AdminOnly role={role}>
//                 <Layout>
//                   <AddCategory />
//                 </Layout>
//                 </AdminOnly>
//                 </RequireAuth>
//               }
//             />
//             <Route
//               path="/table/add"
//               element={
//                 <RequireAuth>
//                   <AdminOnly role={role}>
//                 <Layout>
//                   <Table/>
//                 </Layout>
//                 </AdminOnly>
//                 </RequireAuth>
//               }
//             />
//             <Route
//               path="/table/all-tables"
//               element={
//                 <RequireAuth>
//                   <AdminOnly role={role}>
//                 <Layout>
//                   <AllTablesList />
//                 </Layout>
//                 </AdminOnly>
//                 </RequireAuth>
//               }
//             />
//                   <Route
//               path="/item/item-sales-purchases-details/:id"
//               element={
//                 <RequireAuth>
//                   <AdminOnly role={role}>
//                   <ItemSalesPurchasesDetails/>
//                   </AdminOnly>
//                   </RequireAuth>
               
//               }
//             />
//             <Route
//               path="/party/add"
//               element={
//                  <RequireAuth>
//                   <AdminOnly role={role}>
//                 <Layout>
//                   <PartyAdd />
//                 </Layout>
//                 </AdminOnly>
//                 </RequireAuth>
//               }
//             />
//             <Route
//               path="/party/all-parties"
//               element={
//                  <RequireAuth>
//                   <AdminOnly role={role}>
//                 <Layout>
//                   <AllPartiesList />
//                 </Layout>
//                 </AdminOnly>
//                 </RequireAuth>
//               }
//             />
//               <Route
//               path="/party/party-sales-purchases-details/:id"
//               element={

//                   <RequireAuth>
//                     <AdminOnly role={role}>
//                   <PartySalesPurchasesDetails/>
//                   </AdminOnly>
//                   </RequireAuth>
                
                 
               
//               }
//             />

//              <Route
//               path="/material/add"
//               element={
//                   <RequireAuth>
//                     <AdminOnly role={role}>
//                 <Layout>
//                   <AddMaterial/>
//                 </Layout>
//                 </AdminOnly>
//                 </RequireAuth>
//               }
//             />

           
//             <Route
//               path="/material/all-materials"
//               element={
//                <RequireAuth>
//                   <AdminOnly role={role}>
//                 <Layout>
//                   <MaterialsList/>
//                 </Layout>
//                 </AdminOnly>
//                 </RequireAuth>
//               }
//             />
//                 <Route
//               path="/material/materials-release"
//               element={
//                  <RequireAuth>
//                   <AdminOnly role={role}>
//                 <Layout>
//                   <MaterialsRelease/>
//                 </Layout>
//                 </AdminOnly>
//                 </RequireAuth>
//               }
//             />
//   <Route
//               path="/material/material-view/:Material_Name"
//               element={
//               <RequireAuth>
//                     <AdminOnly role={role}>
//                   <EachMaterialReport/>
//                   </AdminOnly>
//                   </RequireAuth>
             
//               }
//             />
            
//               <Route
//               path="/new/food-items/add"
//               element={
//                 <RequireAuth>
//                   <AdminOnly role={role}>
//                   <AddFoodItem />
//                   </AdminOnly>
//                   </RequireAuth>
              
//               }
//             />
//              <Route
//               path="/new/sale/edit/:id"
//               element={
//                 <RequireAuth>
//                   <AdminOnly role={role}>
//                   <NewSaleEdit/>
//                   </AdminOnly>
//                   </RequireAuth>
              
//               }
//             />
//               <Route
//               path="/new/all-new-food-items"
//               element={
//                 <RequireAuth>
                 
//                 <Layout>
//                   <AllFoodItemsList/>
//                 </Layout>
                
//                 </RequireAuth>
//               }
//             />
//               <Route
//               path="/sale/view/:id"
//               element={
//                  <RequireAuth>
//                   <AdminOnly role={role}>
//                   <SaleView />
//                   </AdminOnly>
//                   </RequireAuth>
             
//               }
//             />
//             <Route
//               path="/inventory/add"
//               element={
//              <RequireAuth>
//               <AdminOnly role={role}>
//                   <InventoryAdd />
//                   </AdminOnly>
//                   </RequireAuth>
                
//               }
//             />
//               <Route
//               path="/inventory/edit/:id"
//               element={
//              <RequireAuth>
//                 <AdminOnly role={role}>
//                   <InventoryEdit />
//                   </AdminOnly>
//                   </RequireAuth>
                
//               }
//             />
//             <Route
//               path="/inventory/view/:id"
//               element={
//                 <RequireAuth>
//                   <AdminOnly role={role}>
//                   <InventoryView/>
//                   </AdminOnly>
//                   </RequireAuth>
             
//               }
//             />
//             <Route
//               path="/inventory/all-inventories"
//               element={
//                 <RequireAuth>
//                   <AdminOnly role={role}>
//                 <Layout>
//                   <AllInventoryList />
//                 </Layout>
//                 </AdminOnly>
//                 </RequireAuth>
//               }
//             />

//             <Route path="/order/all-orders" element={
//               <RequireAuth>
               
//               <Layout>
//                 <AllOrdersDashboard />
//               </Layout>
             
//               </RequireAuth>
//             } />

//             <Route
//               path="/order/day-wise-invoices-order-report/:date"
//               element={
//                   <RequireAuth>
//                       <AdminOnly role={role}>
//                   <AllOrdersDayWise/>
//                   </AdminOnly>
//                   </RequireAuth>
              
//               }
//             />
//             {/* /order/date-range-orders-takaway-report */}
//                <Route
//               path="/order/date-range-orders-takaway-report/:fromDate/:toDate"
//               element={
//                 <RequireAuth>
//                     <AdminOnly role={role}>
//                   <AllOrdersTakeawayDateRange/>
//                   </AdminOnly>
//                   </RequireAuth>
              
//               }
//             />
//             {/* <Route path="/order/view/:id" element={
//               <Layout>
//                 <OrderView />
//               </Layout>
//             } /> */}
 
//             <Route
//               path="/staff/add"
//               element={
//                 <RequireAuth>
//                   <AdminOnly role={role}>
//                 <Layout>
//                   <AddStaff/>
//                 </Layout>
//                 </AdminOnly>
//                 </RequireAuth>
//               }
//             />

           
//             <Route
//               path="/staff/all-staffs"
//               element={
//                 <RequireAuth>
//                   <AdminOnly role={role}>
//                 <Layout>
//                   <StaffList/>
//                 </Layout>
//                 </AdminOnly>
//                 </RequireAuth>
//               }
//             />
            
//             <Route
//               path="/reports"
//               element={
//                 <RequireAuth>
//                     <AdminOnly role={role}>
//                 <Layout>
//                   <Reports />
//                 </Layout>
//                 </AdminOnly>
//                 </RequireAuth>
//               }
//             />
         
//               <Route
//               path="/day-wise-report/:date"
//               element={
//                  <RequireAuth>
//                   <AdminOnly role={role}>
//                   <DayWiseReport/>
//                   </AdminOnly>
//                   </RequireAuth>
              
//               }
//             />
        
//               <Route
//              path="/date-range-report/:fromDate/:toDate" 
//             element=
//             {   <RequireAuth>
//               <AdminOnly role={role}>
//             <DateRangeReport/>
//             </AdminOnly>
//               </RequireAuth>
//             } 
//             />

//                    <Route
//               path="/financial-year/add"
//               element={
//                  <RequireAuth>
//                   <AdminOnly role={role}>
//                 <Layout>
//                   <FinancialYear/>
//                 </Layout>
//                 </AdminOnly>
//                 </RequireAuth>
//               }
//             />

         
//           </>
        
        

        

        
//           <>
        
//               <Route
//               path="/staff/orders/add"
//               element={
//                 <RequireAuth>
//                   <StaffOnly role={role}>
//                   <Orders/>
//                   </StaffOnly>
//                   </RequireAuth>
              
//               }
//             />
//             <Route
//               path="/staff/orders-takeaway/add"
//               element={
//                  <RequireAuth>
//                     <StaffOnly role={role}>
//                   <OrdersTakeAway/>
//                   </StaffOnly>
//                   </RequireAuth>
              
//               }
//             />
//               <Route
//               path="/staff/orders/all-orders"
//               element={
//                 <RequireAuth>
//                     <StaffOnly role={role}>
//                 <Layout>
//                   <OrderDetails/>
//                 </Layout>
//                 </StaffOnly>
//                 </RequireAuth>
//               }
//             />
//             <Route
//               path="/staff/orders/table-order-details/:Order_Id"
//               element={
//                <RequireAuth>
//                  <StaffOnly role={role}>
//                   <TableOrderDetails/>
//                   </StaffOnly>
//                   </RequireAuth>
              
//               }
//             />

//               {/* <Route path="/order/all-orders" element={
//                 <RequireAuth>
//                     <StaffOnly>
//               <Layout>
//                 <AllOrdersDashboard />
//               </Layout>
//               </StaffOnly>
//               </RequireAuth>
//             } /> */}

//                <Route
//               path="/order/day-wise-invoices-order-report/:date"
//               element={
//                 <RequireAuth>
//                   <StaffOnly role={role}>
//                   <AllOrdersDayWise/>
//                   </StaffOnly>
//                   </RequireAuth>
              
//               }
//             />
//             {/* /order/date-range-orders-takaway-report */}
//                <Route
//               path="/order/date-range-orders-takaway-report/:fromDate/:toDate"
//               element={
//                  <RequireAuth>
//                       <StaffOnly role={role}>
//                   <AllOrdersTakeawayDateRange/>
//                   </StaffOnly>
//                   </RequireAuth>
              
//               }
//             />


//           </>
      

      
//           <>
//             <Route
//               path="/kitchen-staff/orders/all-orders"
//               element={
//                 <RequireAuth>
//                   <KitchenOnly role={role}>
//                   <KitchenStaff/>
//                   </KitchenOnly>
//                   </RequireAuth>
               
//               }
//             />
//                 {/* <Route
//               path="/new/all-new-food-items"
//               element={
//                <RequireAuth>
                 
//                   <AllFoodItemsList/>
              
//                   </RequireAuth>
              
//               }
//             /> */}
//             </>
              

//           {/* Fallback */}
//                    <Route
//   path="*"
//   element={
//     loggedIn
//       ? <Navigate to="/home" replace />
//       : <Navigate to="/login" replace />
//   }
// />
//           {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
//         </Routes>
//       </Suspense>

//       <ToastContainer position="top-right" autoClose={3000} />
      
//     </>
//   );

// }

// export default function App() {
//   return (
//     <BrowserRouter  >
//       <AppLayout />
//     </BrowserRouter>
//   );
// }