import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";




export const tableApi = createApi({
  reducerPath: "tableApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/",
    credentials: "include",
  }),
  invalidatesTags: ["Table"],
  
  endpoints: (builder) => ({
    addTable: builder.mutation({
      query: ({ body }) => ({
        url: `table/add-table`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Table"],
    }),
 
getAllTables: builder.query({
  query: ({ page = null, search = "" } = {}) => {

    const params = new URLSearchParams();

    // Only add page if page exists
    if (page !== null && page !== undefined) {
      params.append("page", page);
    }

    // Only add search if search exists and is not empty
    if (search && search.trim() !== "") {
      params.append("search", search.trim());
    }

    const queryString = params.toString();

    return queryString
      ? `table/get-all-tables?${queryString}`
      : `table/get-all-tables`;
  },

  providesTags: ["Table"],
}),


  }),
});

export const { useAddTableMutation, useGetAllTablesQuery } = tableApi;