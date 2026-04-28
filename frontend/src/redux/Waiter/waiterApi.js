import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";









export const waiterApi = createApi({
  reducerPath: "waiterApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/",
    credentials: "include",
  }),
  tagTypes: ["waiter" ],

    endpoints: (builder) => ({

        // get: builder.query({
        //     query: () => `waiter/all-orders` ,
        //     providesTags: ["waiter"],
        // }),

      getOrdersByWaiter: builder.query({
  query: () => "waiter/waiter-orders",
  providesTags: ["waiter"],
}),

      
   
    }),
});

export const {useGetOrdersByWaiterQuery} = waiterApi