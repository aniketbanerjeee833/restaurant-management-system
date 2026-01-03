import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";




export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/staff/",
    credentials: "include",
  }),
  invalidatesTags: ["Order","Takeaway-Order","Customer"],

  endpoints: (builder) => ({

    addNewCustomer: builder.mutation({
      query: (payload) => ({
        url: `order/add-new-customer`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Customer"],
    }),
    getAllCustomers: builder.query({
      query: () => `order/all-customers`,
      providesTags: ["Customer"],
    }),
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

  getTakeawayOrderDetails: builder.query({
    query: (orderId) => `order/get-takeaway-order-details/${orderId}`,
    providesTags: ["Takeaway-Order"],
  }),

  updateOrder: builder.mutation({
    query: ({Order_Id,payload}) => ({
      url: `order/update-order/${Order_Id}`,
      method: "PATCH",
      body: payload,
    }),
    invalidatesTags: ["Order"],
  }),


  updateTakeawayOrder: builder.mutation({
    query: ({Takeaway_Order_Id,payload}) => ({
      url: `order/update-takeaway-order/${Takeaway_Order_Id}`,
      method: "PATCH",
      body: payload,
    }),
    invalidatesTags: ["Takeaway-Order"],
  }),
confirmOrderBillPaidAndInvoiceGenerated: builder.mutation({
  query: ({ orderId, payload }) => ({
    url: `order/confirm-bill/${orderId}`,
    method: "POST",
    body: payload,
  }),
  invalidatesTags: ["Order"],
}),

confirmTakeawayOrderBillPaidAndInvoiceGenerated: builder.mutation({
  query: ({ takeawayOrderId, payload }) => ({
    url: `order/confirm-takeaway-bill/${takeawayOrderId}`,
    method: "POST",
    body: payload,
  }),
  invalidatesTags: ["Takeaway-Order"],
}),
totalInvoicesEachDay: builder.query({
  query: () => `order/total-invoices-orders-each-day`,
  providesTags: ["Order"],
}),

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
  query: ({ fromDate, toDate, page = 1, search = "" }) => {
    const params = new URLSearchParams();
    params.append("fromDate", fromDate);
    params.append("toDate", toDate);
    params.append("page", page);
    if (search) params.append("search", search.trim());

    return `order/get-all-invoices-orders-takeaways-in-date-range?${params.toString()}`;
  },
}),


takeawayAddOrdersAndGenerateInvoices: builder.mutation({
  query: (payload) => ({
    url: `order/takeaway-add-orders-and-generate-invoices`,
    method: "POST",
    body: payload,
  }),
  invalidatesTags: ["Takeaway-Order"],
}),




nextInvoiceNumber: builder.query({
  query: () => `order/next-invoice-number`,
  providesTags: ["Order"],
}),
  generateSms: builder.mutation({
      query: ({ Order_Id, payload }) => ({
        url: `/order/generate-sms/${Order_Id}`,
        method: "POST",
        body: payload,
      }),
    }),

    generateSmsForTakeaway: builder.mutation({
      query: ({ payload }) => ({
        url: `/order/generate-sms-for-takeaway`,
        method: "POST",
        body: payload,
      }),
    }),

    cancelTakeawayOrder: builder.mutation({
      query: (Takeaway_Order_Id) => ({
        url: `/order/cancel-takeaway-order/${Takeaway_Order_Id}`,
        method: "PATCH",
        
      }),
    }),

    completeTakeawayOrder: builder.mutation({
      query: (Takeaway_Order_Id) => ({
        url: `/order/complete-takeaway-order/${Takeaway_Order_Id}`,
        method: "PATCH",
        
      }),
    }),

    printThermalInvoice: builder.mutation({
      query: (payload) => ({
        url: `/order/print-thermal-invoice`,
        method: "POST",
        body: payload,
      }),
    }),


})
})

export const { useAddNewCustomerMutation,useGetAllCustomersQuery,
  useAddOrderMutation,useGetTablesHavingOrdersQuery,
  useGetTableOrderDetailsQuery ,
  useGetTakeawayOrderDetailsQuery,
  
  useUpdateOrderMutation,
  useUpdateTakeawayOrderMutation,

useConfirmOrderBillPaidAndInvoiceGeneratedMutation,
useConfirmTakeawayOrderBillPaidAndInvoiceGeneratedMutation,

useTotalInvoicesEachDayQuery,
useGetAllInvoicesAndOrdersEachDayQuery,
useGetAllInvoicesOfOrdersAndTakeawaysInDateRangeQuery,
useTakeawayAddOrdersAndGenerateInvoicesMutation,useNextInvoiceNumberQuery,
useGenerateSmsMutation,useGenerateSmsForTakeawayMutation,useCancelTakeawayOrderMutation
,useCompleteTakeawayOrderMutation,usePrintThermalInvoiceMutation} = orderApi