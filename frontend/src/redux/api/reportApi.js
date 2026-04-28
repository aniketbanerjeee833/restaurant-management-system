import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const reportApi = createApi({
  reducerPath: "reportApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/",
    credentials: "include",
  }),
 tagTypes: ["Sales", "Purchases", "NewSales","Kitchen"],
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

getTotalSalesDineInTakeawayDailyAnalysis: builder.query({
  query: ({ year, month }) => ({
    url: "report/get-total-sales-dine-in-takeaway-daily-analysis",
    params: { year, month },
  }),
  providesTags: ["Sales"],
}),
getTotalSalesDineInTakeawayWeeklyAnalysis: builder.query({
  query: ({ year, month }) => ({
    url: "report/get-total-sales-dine-in-takeaway-weekly-analysis",
    params: { year, month },
  }),
  providesTags: ["Sales"],
      
  }),
  getTotalSalesDineInTakeawayMonthlyAnalysis: builder.query({
    query: ({ year }) => ({
      url: "report/get-total-sales-dine-in-takeaway-monthly-analysis",
      params: { year },
  }),
  providesTags: ["Sales"],

  }),
  getTotalSalesDineInTakeawayYearlyAnalysis: builder.query({
    query: ({ year }) => ({
      url: "report/get-total-sales-dine-in-takeaway-yearly-analysis",
      params: { year },
  }),
  providesTags: ["Sales"],

}),
getItemsSoldDailyCategoryWiseAnalysis: builder.query({
  query: ({ year, month }) => ({
    url: "report/get-items-sold-daily-category-wise-analysis",
    params: { year, month },
  }),

}),

getKitchenWiseReportAnalysis: builder.query({
  query: ({ year, month, page = 1 }) => ({
    url: "report/get-kitchen-wise-report",
    params: { year, month, page },
  }),
  providesTags: [{ type: "Kitchen", id: "LIST" }],
}),

}),
  })

export const { useGetSalesNewSalesPurchasesEachDayQuery ,
useGetSalesNewSalesPurchasesInDateRangeQuery,usePrintDailyReportMutation,
useGetTotalSalesDineInTakeawayDailyAnalysisQuery,
useGetTotalSalesDineInTakeawayWeeklyAnalysisQuery,
useGetTotalSalesDineInTakeawayMonthlyAnalysisQuery,
useGetTotalSalesDineInTakeawayYearlyAnalysisQuery,useGetItemsSoldDailyCategoryWiseAnalysisQuery,
useGetKitchenWiseReportAnalysisQuery} = reportApi
