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
  location.pathname.startsWith("/date-range-report");

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

            

          </Route>
          </>
        
        )}

        { userRole==="staff" && (
          <>
          <Route
              path="/staff/table/items-add"
              element={
                <Layout>
                  <StaffTables/>
                </Layout>
              }
            />
              <Route
              path="/staff/table/all-tables"
              element={
                <Layout>
                  <StaffTablesList/>
                </Layout>
              }
            />
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

          </>
        )}

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

// export default function App() {

//   const { data: userMe, isLoading, isError } = useGetUserQuery();

//   if (isLoading) return <div>Loading...</div>;

//   // If not logged in → go to login
//   if (isError || userMe?.success === false) {
//     return (
//       <BrowserRouter>
//         <RouterWrapper userRole={null} userMe={null}/>
//       </BrowserRouter>
//     );
//   }

//   return (
//     <BrowserRouter>
//       <RouterWrapper 
//         userRole={userMe?.user?.role} 
//         userMe={userMe}
//       />
//     </BrowserRouter>
//   );
// }

// export default function App() {



//     const { data: userMe, isLoading, isError } =  useGetUserQuery();
//     console.log(userMe);
//   return (
//     <BrowserRouter>
//       <RouterWrapper   userRole={userMe?.user?.role} 
//         userMe={userMe}/>
//     </BrowserRouter>
//   );
// }
// ✅ PublicRoute – Prevent logged-in users from seeing /login
// function PublicRoute() {
//   const [isAuthenticated, setIsAuthenticated] = useState(null);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const res = await axios.get('/api/user/getUser', { withCredentials: true });
//         setIsAuthenticated(res.data.authenticated);
//       } catch {
//         setIsAuthenticated(false);
//       }
//     };
//     checkAuth();
//   }, []);

//   if (isAuthenticated === null) return <div>Loading...</div>;
//   return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />;
// }
// return(
//   <BrowserRouter>
// <Header/>
//   <Routes>
//     <Route
//             path="/login"
//             element={
           
//                 <Login />
            
              
//             }
//           />
//     <Route path="/" element={
//       <Layout>
//       <Dashboard/>
//       </Layout>
//       } />
//     {/* <Route path="/items/add" element={<Items/>} /> */}

//      <Route
//           path="/items/add-category"
//           element={
//             <Layout>
//               <AddCategory />
//             </Layout>
//           }
//         />
//       <Route 
       
//           path="/items/add"
//           element={
//             <Layout>
//               <Items />
//             </Layout>
//           }
//         />
//       <Route 
//       path="/items/all-items"
//        element={
//         <Layout>
//         <AllItemsList/>
//         </Layout>
//         } 
//         />
   

    
//        <Route path="/party/add" element={
//         <Layout>
//         <PartyAdd/>
//         </Layout>
//         } />
//         <Route path="/party/all-parties" element={
//           <Layout>
//           <AllPartiesList/>
//           </Layout>
//           } />
//            <Route path="/sale/invoice" element={
//           <Layout>
//           <Invoice/>
//           </Layout>
//           } />
          
//             <Route path="/sale/add" element={
     
//       <SaleAdd/>
    
//       } />
//           <Route path="/sale/all-sales" element={
//           <Layout>
//           <AllSaleList/>
//           </Layout>
//           } />

//         <Route path="/purchase/add" element={
//           // <Layout>
//           <PurchaseAdd/>
//           // </Layout>
//           } />
//             <Route path="/purchase/view/:id" element={
//           // <Layout>
//           <PurchaseView/>
//           // </Layout>
//           } />
//               <Route path="/purchase/all-purchases" element={
//           <Layout>
//           <AllPurchasesList/>
//           </Layout>
//           } />
//   </Routes>
 
//       <ToastContainer position="top-right" autoClose={3000} />
// </BrowserRouter>
// )