import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";









export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/",
    credentials: "include",
  }),
  tagTypes: ["Dashboard" ],

  endpoints: (builder) => ({
 getTotalSalesPurchasesReceivablesPayablesProfit: builder.query({
  query: (date) => ({
    url: "dashboard/total-sales-purchases-receivables-payables-profit",
    params: { date },
  }),
}),
  providesTags: ["Dashboard"],
        getAllSalesAndPurchasesYearWise: builder.query({
    query: ({year}) => `dashboard/sales-purchases-profit?year=${year}`,
    providesTags: ["Dashboard"],
  }),

  getCategoriesWiseItemCount: builder.query({
    query: ({month, year}) => `dashboard/categories-wise-item-count?month=${month}&year=${year}`,
    providesTags: ["Dashboard"],
  }),
  getPartyWiseSalesAndPurchases: builder.query({
    query: ({month, year}) => `dashboard/party-wise-sales-purchases?month=${month}&year=${year}`,
    providesTags: ["Dashboard"],  

  }),
})

})

export const {
   useGetTotalSalesPurchasesReceivablesPayablesProfitQuery,
    useGetAllSalesAndPurchasesYearWiseQuery,
    useGetCategoriesWiseItemCountQuery,
    useGetPartyWiseSalesAndPurchasesQuery } = dashboardApi