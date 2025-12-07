import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/staff/",
    credentials: "include",
  }),
  invalidatesTags: ["Order","Takeaway-Order"],

  endpoints: (builder) => ({

 addOrder: builder.mutation({
  query: (payload) => ({
    url: `order/add-order`,
    method: "POST",
    body: payload,
  }),
  invalidatesTags: ["Order"],
}),
getTablesHavingOrders: builder.query({
  query: () => `order/get-tables-having-orders`,
  providesTags: ["Order"],
}),

getTableOrderDetails: builder.query({
  query: (orderId) => `order/get-table-order-details/${orderId}`,
  providesTags: ["Order"],

  }),

  updateOrder: builder.mutation({
    query: ({Order_Id,payload}) => ({
      url: `order/update-order/${Order_Id}`,
      method: "PATCH",
      body: payload,
    }),
    invalidatesTags: ["Order"],
  }),
confirmOrderBillPaidAndInvoiceGenerated: builder.mutation({
  query: ({ orderId, payload }) => ({
    url: `order/confirm-bill/${orderId}`,
    method: "POST",
    body: payload,
  }),
  invalidatesTags: ["Order"],
}),

totalInvoicesEachDay: builder.query({
  query: () => `order/total-invoices-orders-each-day`,
  providesTags: ["Order"],
}),
// getAllInvoicesAndOrdersEachDay: builder.query({
//   query: ({ date }) => `order/get-all-invoices-orders-each-day?date=${date}`,
//   providesTags: ["Order"],
// })

// getAllItems: builder.query({
//   query: ({ page, search = "", fromDate = "", toDate = "" } = {}) => {
//     const params = new URLSearchParams();

//     // ✅ Append only when defined
//     if (page) params.append("page", page);
//     if (search) params.append("search", search);
//     if (fromDate) params.append("fromDate", fromDate);
//     if (toDate) params.append("toDate", toDate);

//     const queryString = params.toString();
//     return queryString
//       ? `item/get-all-items?${queryString}`
//       : `item/get-all-items`;
//   },
//   providesTags: ["Item"],
// }),
getAllInvoicesAndOrdersEachDay: builder.query({
  query: ({ page = 1, search = "", date }) => {
    const params = new URLSearchParams();

    params.append("date", date);
    params.append("page", page);
    if (search) params.append("search", search);

    return `order/get-all-invoices-orders-each-day?${params.toString()}`;
  },
  providesTags: ["Order"],
}),

getAllInvoicesOfOrdersAndTakeawaysInDateRange: builder.query({
  query: ({ fromDate, toDate }) => `order/get-all-invoices-orders-takeaways-in-date-range?fromDate=${fromDate}&toDate=${toDate}`,
  providesTags: ["Order"],
}),

takeawayAddOrdersAndGenerateInvoices: builder.mutation({
  query: (payload) => ({
    url: `order/takeaway-add-orders-and-generate-invoices`,
    method: "POST",
    body: payload,
  }),
  invalidatesTags: ["Takeaway-Order"],
}),

// getAllInvoicesAndOrdersEachDay: builder.query({
//   query: ({ page, search = "", date } = {}) => {
//     const params = new URLSearchParams();

//     // ✅ Append only when defined
//     if (page) params.append("page", page);
//     if (search) params.append("search", search);
   


//     const queryString = params.toString();
//     return `order/get-all-invoices-orders-each-day?date=${date}${queryString}`
    
//   },
//   providesTags: ["Order"],
// }),

})
})

export const { useAddOrderMutation,useGetTablesHavingOrdersQuery,
  useGetTableOrderDetailsQuery ,useUpdateOrderMutation,
useConfirmOrderBillPaidAndInvoiceGeneratedMutation,
useTotalInvoicesEachDayQuery,
useGetAllInvoicesAndOrdersEachDayQuery,
useGetAllInvoicesOfOrdersAndTakeawaysInDateRangeQuery,
useTakeawayAddOrdersAndGenerateInvoicesMutation} = orderApi