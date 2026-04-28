import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";











export const foodItemApi = createApi({
  reducerPath: "foodItemApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/",
    credentials: "include",
  }),
  invalidatesTags: ["Food-Item","Daily-Food-Item-Stock"],
  endpoints: (builder) => ({

    // ✅ Add a party
  addFoodItem: builder.mutation({
  query: (formData) => ({
    url: `food-item/add-food-item`,
    method: "POST",
    body: formData,           // send raw FormData
  
  }),
  invalidatesTags: [{ type: "Food-Item", id: "LIST" }],
}),
// getAllFoodItems: builder.query({
//   query: ({ page, search = "" }) => {
//     const params = new URLSearchParams();
//     if(page) params.append("page", page);
//     if (search) params.append("search", search);
    
//     const queryString = params.toString();
//     return queryString
//       ? `food-item/all-food-items?${queryString}`
//       : `food-item/all-food-items`;
//   },
//   providesTags: ["Food-Item"],
// }),
// getAllFoodItems: builder.query({
//   query: ({ page, search = "" }) => {
//     const params = new URLSearchParams();
//     if(page) params.append("page", page);
//     if (search) params.append("search", search);
    
//     const queryString = params.toString();
//     return queryString
//       ? `food-item/all-food-items?${queryString}`
//       : `food-item/all-food-items`;
//   },
//   providesTags: (result) =>
//     result?.foodItems
//       ? [
//           ...result.foodItems.map((item) => ({
//             type: "Food-Item",
//             id: item.Item_Id,
//           })),
//           { type: "Food-Item", id: "LIST" }, // IMPORTANT
//         ]
//       : [{ type: "Food-Item", id: "LIST" }],
// }),
getAllFoodItems: builder.query({
  query: ({ page, search = "" ,orderType=""}) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (search) params.append("search", search);
    if(orderType)   params.append("orderType", orderType); // ✅ NEW
    const queryString = params.toString();
    return queryString
      ? `food-item/all-food-items?${queryString}`
      : `food-item/all-food-items`;
  },

  providesTags: (result) =>
    result?.foodItems
      ? [
          ...result.foodItems.map((item) => ({
            type: "Food-Item",
            id: item.Item_Id,
          })),
          { type: "Food-Item", id: "LIST" },
        ]
      : [{ type: "Food-Item", id: "LIST" }],

  refetchOnMountOrArgChange: true, // 🔥 THIS FIXES IT
}),

editSingleFoodItem: builder.mutation({
  query: ({ Item_Id, formData }) => ({
    url: `food-item/edit-food-item/${Item_Id}`,
    method: "PATCH",
    body: formData,       // ✔ send raw FormData
  }),
  invalidatesTags: (result, error, { Item_Id }) => [
    { type: "Food-Item", id: Item_Id },
    { type: "Food-Item", id: "LIST" },
  ],
}),

// toggleFoodItemAvailability: builder.mutation({
//   query: (Item_Id) => ({
//     url: `food-item/toggle-food-item-status/${Item_Id}`,
//     method: "PATCH",
//   }),
//   invalidatesTags: (result, error, Item_Id) => [
//     { type: "Food-Item", id: Item_Id },
//     { type: "Food-Item", id: "LIST" },
//   ],
// }),
toggleFoodItemAvailability: builder.mutation({
  query: (Item_Id) => ({
    url: `food-item/toggle-food-item-status/${Item_Id}`,
    method: "PATCH",
  }),
  invalidatesTags: [
    { type: "Food-Item", id: "LIST" }   // THIS TRIGGERS REFRESH
  ],
}),

getAllCategoriesAndFoodItemsToBeShownOnMenu: builder.query({
  query: () => ({
    url: `food-item/all-categories-for-menu`,
  }),
  providesTags: ["Food-Item"],
}),

toggleCategoryAvailabilityToBeShownOnMenu: builder.mutation({
  query: (id) => ({
    url: `food-item/category-visibility-on-menu/${id}`,
    method: "PATCH",
  }),
}),
  softDeleteFoodItem: builder.mutation({
    query: (Item_Id) => ({
      url: `food-item/soft-delete-food-item/${Item_Id}`,
      method: "PATCH",
    }),
    invalidatesTags: [
      { type: "Food-Item", id: "LIST" }   // THIS TRIGGERS REFRESH
    ],
  }),

  updateFoodItemCategory: builder.mutation({
    query: ({ Category_Id, newCategoryName }) => ({
      url: `food-item/update-food-item-category/${Category_Id}`,
      method: "PATCH",
      body: { newCategoryName },
    })
  }),

getDailyFoodItemsStock: builder.query({
  query: ({ page, search = "" }) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (search) params.append("search", search);

    const queryString = params.toString();
    return queryString
      ? `food-item/daily-food-items-stock?${queryString}`
      : `food-item/daily-food-items-stock`;
  },
  providesTags: (result) =>
    result?.foodItems
      ? [
          ...result.foodItems.map((item) => ({
            type: "Daily-Food-Item-Stock",
            id: item.Item_Id,
          })),
          { type: "Daily-Food-Item-Stock", id: "LIST" },
        ]
      : [{ type: "Daily-Food-Item-Stock", id: "LIST" }],
}),

addOrUpdateDailyFoodItemStock: builder.mutation({
  query: (formData) => ({
    url: `food-item/add-or-update-daily-food-item-stock`,
    method: "PUT",
    body: formData,
  }),
  invalidatesTags: (result, error, { Item_Id }) => [
    { type: "Daily-Food-Item-Stock", id: Item_Id },
    { type: "Daily-Food-Item-Stock", id: "LIST" },
  ],
}),

setDailyFoodItemStockZero: builder.mutation({
  query: ({ Item_Id, reason }) => ({
    url: `food-item/set-daily-food-items-stock-zero/${Item_Id}`,
    method: "PATCH",
    body: { reason }, // 👈 reason in body
  }),
  invalidatesTags: (result, error, { Item_Id }) => [
    { type: "Daily-Food-Item-Stock", id: Item_Id },
    { type: "Daily-Food-Item-Stock", id: "LIST" },
  ],
}),

getFoodItemStockHistoryByDate: builder.query({
  query: ({ date, page = 1, search = "" }) => {
    const params = new URLSearchParams();
    params.append("date", date);
    params.append("page", page);
    if (search) params.append("search", search);

    return `food-item/stock-history-by-date?${params.toString()}`;
  },
  providesTags: [{ type: "Daily-Food-Item-Stock", id: "LIST" }],
}),

editDailyFoodStock: builder.mutation({
  query: (formData) => ({
    url: `food-item/edit-daily-food-stock`,
    method: "PATCH",
    body: formData,
  }),
  invalidatesTags: (result, error, { Item_Id }) => [
    { type: "Daily-Food-Item-Stock", id: Item_Id },
    { type: "Daily-Food-Item-Stock", id: "LIST" },
  ],
}),

removeDailyFoodStock: builder.mutation({
  query: (formData) => ({
    url: `food-item/remove-daily-food-stock`,
    body: formData,
    method: "PATCH",
  }),
  invalidatesTags: (result, error, { Stock_Id }) => [
    { type: "Daily-Food-Item-Stock", id: Stock_Id },
    { type: "Daily-Food-Item-Stock", id: "LIST" },
  ],
}),


getEachFoodItemsStockReport: builder.query({
  query: (Item_Id) => ({
    url: `food-item/all-food-items-stock-report/${Item_Id}`,
  }),
  // providesTags: (result) =>
  //   result?.foodItems
  //     ? [
  //         ...result.foodItems.map((item) => ({
  //           type: "Food-Item-Stock-Report",
  //           id: item.Item_Id,
  //         })),
  //         { type: "Food-Item-Stock-Report", id: "LIST" },
  //       ]
  //     : [{ type: "Food-Item-Stock-Report", id: "LIST" }],
}),


// generateImageFromText: builder.mutation({
//   query: (prompt) => ({
//     url: `food-item/generate-image-from-text`,
//     method: "POST",
//     body: { prompt },
//   }),
 
// }),
generateImageFromText: builder.mutation({
  query: (prompt) => ({
    url: `food-item/generate-image-from-text`,
    method: "POST",
    body: { prompt },
  }),
 
}),


// editSingleFoodItem: builder.mutation({
//   query: (formData) => ({
//     url: `food-item/edit-food-item/${formData.Item_Id}`,
//     method: "PATCH",
//     body: formData,           // send raw FormData


//   }),
//   invalidatesTags: (result, error, { Item_Id }) => [
//     { type: "Food-Item", id: Item_Id },
//     { type: "Food-Item", id: "LIST" },
//   ],
// }),
  })
})

export const { useAddFoodItemMutation, useGetAllFoodItemsQuery, 
  useEditSingleFoodItemMutation, useToggleFoodItemAvailabilityMutation,
  useGetAllCategoriesAndFoodItemsToBeShownOnMenuQuery, 
  useToggleCategoryAvailabilityToBeShownOnMenuMutation,
  useSoftDeleteFoodItemMutation,
  useUpdateFoodItemCategoryMutation,
  useGetDailyFoodItemsStockQuery,
  useAddOrUpdateDailyFoodItemStockMutation,
  useSetDailyFoodItemStockZeroMutation,
  useGetFoodItemStockHistoryByDateQuery,
  useEditDailyFoodStockMutation,
  useRemoveDailyFoodStockMutation,
 useLazyGetEachFoodItemsStockReportQuery,useGenerateImageFromTextMutation
 } = foodItemApi