import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";




export const dailyExpenseApi = createApi({
  reducerPath: "dailyExpenseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/",
    credentials: "include",
  }),
  invalidatesTags: ["Daily-Expense","DailyExpenseCategory"],

  endpoints: (builder) => ({




addDailyExpense: builder.mutation({
  query: (body) => ({
    url: "daily-expense/add-daily-expense",
    method: "POST",
    body,
  }),
  invalidatesTags: [{ type: "Daily-Expense", id: "LIST" },   
     { type: "DailyExpenseCategory", id: "LIST" }],
}),

getAllDailyExpenseCategories: builder.query({
  query: () => ({
    url: "daily-expense/get-all-daily-expense-categories",
    method: "GET",
  }),
  providesTags: [{ type: "DailyExpenseCategory", id: "LIST" }],
}),

getMonthlyWeeklyExpenses: builder.query({
  query: ({ month, year, search = "" }) => {
    const params = new URLSearchParams();
    params.append("month", month);
    params.append("year", year);
    if (search) params.append("search", search);

    return {
      url: `daily-expense/get-monthly-weekly-expenses?${params.toString()}`,
      method: "GET",
    };
  },
  providesTags: [{ type: "Daily-Expense", id: "LIST" }],
}),

  }),
});

 export const {
    
   useAddDailyExpenseMutation,
   useGetAllDailyExpenseCategoriesQuery,
   useGetMonthlyWeeklyExpensesQuery
  
 }=dailyExpenseApi
   