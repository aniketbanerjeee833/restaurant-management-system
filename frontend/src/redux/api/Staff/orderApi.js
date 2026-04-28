import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";




export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/staff/",
    credentials: "include",
  }),
  invalidatesTags: ["Order","Takeaway-Order","Customer","PreBookOrder"],

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
// totalInvoicesEachDay: builder.query({
//   query: () => `order/total-invoices-orders-each-day`,
//   providesTags: ["Order"],
// }),
totalInvoicesEachDay: builder.query({
  query: ({ year, month }) =>
    `order/total-invoices-orders-each-day?year=${year}&month=${month}`,
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

// getAllInvoicesOfOrdersAndTakeawaysInDateRange: builder.query({
//   query: ({ fromDate, toDate, page = 1, search = "" }) => {
//     const params = new URLSearchParams();
//     params.append("fromDate", fromDate);
//     params.append("toDate", toDate);
//     params.append("page", page);
   
//     if (search) params.append("search", search.trim());

//     return `order/get-all-invoices-orders-takeaways-in-date-range?${params.toString()}`;
//   },
//   providesTags: ["Order"],
// }),
getAllInvoicesOfOrdersAndTakeawaysInDateRange: builder.query({
  query: ({ fromDate, toDate, page = 1,filter = "all", search = "" }) => {
    const params = new URLSearchParams();
    params.append("fromDate", fromDate);
    params.append("toDate", toDate);
    params.append("page", page);
    params.append("filter", filter);
    if (search) params.append("search", search.trim());

    return `order/get-all-invoices-orders-takeaways-in-date-range?${params.toString()}`;
  },
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

updateTakeawayAndDineInDeliveryStatus: builder.mutation({
  query: (payload) => ({
    url: `order/update-takeaway-and-dine-in-delivery-status`,
    method: "PATCH",
    body: payload,
  }),
  invalidatesTags: ["Order"],
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

    generateSmsForPreBooked: builder.mutation({
      query: ({ Pre_Book_Order_Id, payload }) => ({
        url: `/order/generate-sms-for-pre-booked/${Pre_Book_Order_Id}`,
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

  checkItemElligibleForKOTPrint: builder.mutation({
  query: (items) => ({
    url: `order/check-item-elligible-for-kot-print`,
    method: "POST",
    body: { items },
  }),
}),

deleteInvoice: builder.mutation({
  query: ({ Invoice_Id, orderType }) => ({
    url: `order/delete-invoice/${Invoice_Id}`,
    method: "DELETE",
    body: { orderType },
  }),
  invalidatesTags: ["Order"], // ✅ CORRECT
}),


addPreBookOrder: builder.mutation({
  query: (payload) => ({
    url: `order/add-pre-book-order`,
    method: "POST",
    body: payload,
  }),
  invalidatesTags: [
    { type: "PreBookOrder", id: "LIST" }
  ],
}),

getAllPreBookingOrders: builder.query({
  query: () => `order/get-all-pre-booking-orders`,
  providesTags: (result) => {
    const orders = Array.isArray(result)
      ? result
      : result?.orders || result?.data || [];

    return [
      { type: "PreBookOrder", id: "LIST" },
      ...orders.map(order => ({
        type: "PreBookOrder",
        id: order.Pre_Booked_Order_Id,
      })),
    ];
  },
}),


getPreBookOrderDetails: builder.query({
  query: (Pre_Booked_Order_Id) =>
    `order/get-pre-book-order-details/${Pre_Booked_Order_Id}`,
  providesTags: (result, error, id) => [
    { type: "PreBookOrder", id },
  ],
}),

getPreBookOrderItemsForKOT: builder.query({
  query: (Pre_Booked_Order_Id) =>
    `order/get-pre-book-order-items-for-kot/${Pre_Booked_Order_Id}`,
}),



updatePreBookOrder: builder.mutation({
  query: ({ Pre_Booked_Order_Id, ...body }) => ({
    url: `/order/update-pre-book-order/${Pre_Booked_Order_Id}`,
    method: "PATCH",
    body,
  }),
  invalidatesTags: (result, error, { Pre_Booked_Order_Id }) => [
    { type: "PreBookOrder", id: Pre_Booked_Order_Id }, // 🔥 details page
    { type: "PreBookOrder", id: "LIST" },               // 🔥 list page
      { type: "PreBookOrder", id: "DAYWISE" },  
  ],
}),

confirmPreOrderBillPaidAndInvoiceGenerated: builder.mutation({
    query: ({ Pre_Book_Order_Id, payload })=> ({
    url: `/order/confirm-pre-book-order-bill-paid-and-invoice-generated/${Pre_Book_Order_Id}`,
    method: "POST",
    body: payload,
  }),
  
  invalidatesTags: (result, error, { Pre_Book_Order_Id }) => [
    { type: "PreBookOrder", id: Pre_Book_Order_Id }, // details page
    { type: "PreBookOrder", id: "LIST" },            // pre-book list
    { type: "Order" },                               // 🔥 ALL INVOICE SCREENS
  ],
  // invalidatesTags: (result, error, { Pre_Booked_Order_Id }) => [
  //   { type: "PreBookOrder", id: Pre_Booked_Order_Id }, // 🔥 details page
  //   { type: "PreBookOrder", id: "LIST" },               // 🔥 list page

  // ],
 
}),

   updateAndPrintPreBookKOT: builder.mutation({
      query: ({ Pre_Booked_Order_Id, ...body }) => ({
        url: `/order/kot-and-update-pre-book-order/${Pre_Booked_Order_Id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { Pre_Booked_Order_Id }) => [
        { type: "PreBookOrder", id: Pre_Booked_Order_Id }, // 🔥 details page
        { type: "PreBookOrder", id: "LIST" },               // 🔥 list page 
      ],
    }),

 KOTOfOrdersTakenByWaiter: builder.mutation({
  query: ({ Order_Id }) => ({
    url: `/order/KOT-of-orders-taken-by-waiter/${Order_Id}`,
    method: "POST",
  }),
      
     
    }),

// totalPreBookOrdersEachDay:builder.query({
//   query: ({ year, month }) => ({
//     url: `/order/total-pre-book-orders-each-day?year=${year}&month=${month}`,
// }),
//   providesTags: [{ type: "PreBookOrder", id: "DAYWISE" }],
// }),

// getPreBookedOrdersDayWise:builder.query({
//   // query: (date) => ({
//   //   url: `/order/get-pre-booked-orders-day-wise/${date}`,

//   // }),
//     query: ({ page = 1, search = "", date }) => {
//     const params = new URLSearchParams();

//     params.append("date", date);
//     params.append("page", page);
//     if (search) params.append("search", search);

//     return `order/get-pre-book-orders-orders-each-day?${params.toString()}`;
//   },
//   }),
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


useUpdateTakeawayAndDineInDeliveryStatusMutation,

useTotalInvoicesEachDayQuery,
useGetAllInvoicesAndOrdersEachDayQuery,
useGetAllInvoicesOfOrdersAndTakeawaysInDateRangeQuery,
useTakeawayAddOrdersAndGenerateInvoicesMutation,useNextInvoiceNumberQuery,
useGenerateSmsMutation,useGenerateSmsForTakeawayMutation,
useGenerateSmsForPreBookedMutation,
useCancelTakeawayOrderMutation,
useCompleteTakeawayOrderMutation,usePrintThermalInvoiceMutation,
useCheckItemElligibleForKOTPrintMutation,
useDeleteInvoiceMutation,

useAddPreBookOrderMutation,
useGetAllPreBookingOrdersQuery,useGetPreBookOrderDetailsQuery,
useLazyGetPreBookOrderItemsForKOTQuery,
useUpdatePreBookOrderMutation,
useConfirmPreOrderBillPaidAndInvoiceGeneratedMutation,
useUpdateAndPrintPreBookKOTMutation,
useKOTOfOrdersTakenByWaiterMutation,

} = orderApi