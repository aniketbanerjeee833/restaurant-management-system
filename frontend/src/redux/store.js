
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage for web
import userReducer from "./reducer/userReducer";

import { partyApi } from "./api/partyAPi";
import { itemApi } from "./api/itemApi";
import { purchaseApi } from "./api/purchaseApi";
import { saleApi } from "./api/saleApi";
import { dashboardApi } from "./api/dashboardApi";
import { userApi } from "./api/userApi";
import { reportApi } from "./api/reportApi";
import { staffApi } from "./api/staffApi";
import { tableApi } from "./api/tableApi";
import { foodItemApi } from "./api/foodItemApi";
import { materialApi } from "./api/materialApi";
import { orderApi } from "./api/Staff/orderApi";
import { settingsApi } from "./api/settingsApi";
import { kitchenStaffApi } from "./api/KitchenStaff/kitchenStaffApi";



// ✅ Combine reducers
const rootReducer = combineReducers({
  
   user: userReducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [materialApi.reducerPath]: materialApi.reducer,
  [partyApi.reducerPath]: partyApi.reducer,
  [itemApi.reducerPath]: itemApi.reducer,
  [tableApi.reducerPath]: tableApi.reducer,
  [purchaseApi.reducerPath]: purchaseApi.reducer,
  [saleApi.reducerPath]: saleApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
 
  [reportApi.reducerPath]: reportApi.reducer,
   [settingsApi.reducerPath]: settingsApi.reducer,
  [staffApi.reducerPath]: staffApi.reducer,
  [foodItemApi.reducerPath]: foodItemApi.reducer,

  [orderApi.reducerPath]: orderApi.reducer,

  [kitchenStaffApi.reducerPath]: kitchenStaffApi.reducer,

 
});

// ✅ Persist config (only persist user slice)
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // only user slice is persisted
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required by redux-persist
    }).concat(
      dashboardApi.middleware,
      materialApi.middleware,
      partyApi.middleware,
      saleApi.middleware,

      itemApi.middleware,
      tableApi.middleware,
      purchaseApi.middleware,
      userApi.middleware,
      
      reportApi.middleware,
      settingsApi.middleware,
      staffApi.middleware,
      foodItemApi.middleware,
      orderApi.middleware,
      kitchenStaffApi.middleware
      
     
    ),
});

export const persistor = persistStore(store);
export default store;
