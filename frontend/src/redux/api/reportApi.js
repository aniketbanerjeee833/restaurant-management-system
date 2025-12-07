import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const reportApi = createApi({
  reducerPath: "reportApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/",
    credentials: "include",
  }),
 tagTypes: ["Sales", "Purchases", "New-Sale"],
  endpoints: (builder) => ({
    getSalesNewSalesPurchasesEachDay: builder.query({
        query: ({ date }) =>
            
        `report/get-sales-new-sales-purchases-each-day?date=${date}`,
      providesTags: ["Sales", "Purchases", "NewSales"],
    }),
    
        getSalesNewSalesPurchasesInDateRange  : builder.query({
        query: ({ fromDate, toDate }) =>
            
        `report/get-sales-new-sales-purchases-in-date-range?fromDate=${fromDate}&toDate=${toDate}`,
      providesTags: ["Sales", "Purchases", "NewSales"],
    }),
  printDailyReport: builder.mutation({
  query: (payload) => ({
    url: "report/print-daily-report",
    method: "POST",
    body: JSON.stringify(payload),   // IMPORTANT
    headers: {
      "Content-Type": "application/json",
    },
    responseHandler: (response) => response.blob(), 
  }),
}),
      
  }),

  })

export const { useGetSalesNewSalesPurchasesEachDayQuery ,
useGetSalesNewSalesPurchasesInDateRangeQuery,usePrintDailyReportMutation} = reportApi
