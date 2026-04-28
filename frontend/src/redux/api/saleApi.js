import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";





export const saleApi = createApi({
  reducerPath: "saleApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/",
    credentials: "include",
  }),
  tagTypes: ["Sale", "New-Sale","Invoice"],
  endpoints: (builder) => ({

    // ------------------------------------
    // INVOICE
    // ------------------------------------
    addInvoice: builder.mutation({
      query: ({ body }) => ({
        url: `sale/add-invoice`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Invoice", id: "SINGLE" }],
    }),

    updateInvoice: builder.mutation({
      query: ({ body }) => ({
        url: `sale/update-invoice`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "Invoice", id: "SINGLE" }],
    }),

    getSingleInvoice: builder.query({
      query: () => `sale/get-single-invoice`,
      providesTags: [{ type: "Invoice", id: "SINGLE" }],
    }),

    getNewSaleSingleInvoice: builder.query({
      query: () => `sale/get-single-new-sale-invoice`,
      providesTags: [{ type: "Invoice", id: "SINGLE-NEW" }],
    }),

    // ------------------------------------
    // SALE CREATE
    // ------------------------------------
    addSale: builder.mutation({
      query: ({ body }) => ({
        url: `sale/add-sale`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Sale", id: "LIST" }],
    }),
  addNewSale: builder.mutation({
    
      query: ({ body }) => ({
        
        url: `sale/add-new-sale`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "New-Sale", id: "LIST" },
      
      ],
    }),
    // ------------------------------------
    // SALE EDIT
    // ------------------------------------
    editSale: builder.mutation({
      query: ({ body, Sale_Id }) => ({
        url: `sale/edit-sale/${Sale_Id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { Sale_Id }) => [
        { type: "Sale", id: Sale_Id },
        { type: "Sale", id: "LIST" },
      ],
    }),
 editNewSale: builder.mutation({
      query: ({ body,Sale_Id }) => ({
        
        url: `sale/edit-new-sale/${Sale_Id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [
        { type: "New-Sale", id: "LIST" },
      
      ],
    }),
    // ------------------------------------
    // ALL SALES
    // ------------------------------------
    getAllSales: builder.query({
      query: ({ page, search = "", fromDate = "", toDate = "" }) => {
        const params = new URLSearchParams();
        params.append("page", page);
        if (search) params.append("search", search);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        return `sale/get-all-sales?${params.toString()}`;
      },
      providesTags: [{ type: "Sale", id: "LIST" }],
    }),
getAllNewSales: builder.query({
  query: ({ page, search = "", fromDate = "", toDate = "" }) => {
    const params = new URLSearchParams();

    params.append("page", page); // always present
    if (search) params.append("search", search);
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    return `sale/get-all-new-sales?${params.toString()}`;
  },
  providesTags: [{ type: "New-Sale", id: "LIST" }],
}),
    // ------------------------------------
    // LATEST INVOICE NUMBER
    // ------------------------------------
    getLatestInvoiceNumber: builder.query({
      query: () => `sale/get-latest-invoice-number`,
      providesTags: [{ type: "Invoice", id: "LATEST" }],
    }),
   getLatestNewSaleInvoiceNumber: builder.query({
        query: () => `sale/get-latest-new-sale-invoice-number`,
        provideTaags: [{
          type: "New-Sale",
          id: "LIST"
        }],
      }),
    // ------------------------------------
    // SPECIFIC SALE
    // ------------------------------------
    getSingleSale: builder.query({
      query: (Sale_Id) => `sale/get-single-sale/${Sale_Id}`,
      providesTags: (result, error, Sale_Id) => [
        { type: "Sale", id: Sale_Id },
      ],
    }),

    // ------------------------------------
    // PRINT BILL
    // ------------------------------------
    printSaleBill: builder.mutation({
      query: (sale) => ({
        url: `sale/print-sale-invoice`,
        method: "POST",
        body: sale,
        responseHandler: (response) => response.blob(),
      }),
      invalidatesTags: [{ type: "Sale", id: "LIST" }],
    }),
getTotalNewSalesEachDay: builder.query({
  query: () => `/sale/total-new-sales-by-day`,
  providesTags: ["New-Sale"],
   
}),
    // ------------------------------------
    // TOTAL SALES PER DAY
    // ------------------------------------
    getTotalSalesEachDay: builder.query({
      query: () => `sale/total-sales-by-day`,
      providesTags: [{ type: "Sale", id: "DASHBOARD" }],
    }),

  }),
});



 export const {
   
  useAddInvoiceMutation,
    useUpdateInvoiceMutation,
    useGetSingleInvoiceQuery,

    useGetNewSaleSingleInvoiceQuery,

    useAddSaleMutation,
   
    useEditSaleMutation,
     useAddNewSaleMutation,
      useEditNewSaleMutation,
   
    useGetAllSalesQuery,
     useGetAllNewSalesQuery,


    useGetLatestInvoiceNumberQuery,
   
       useGetLatestNewSaleInvoiceNumberQuery,
    useGetSingleSaleQuery,
    usePrintSaleBillMutation,

    
    useGetTotalSalesEachDayQuery
   
 }=saleApi
   
