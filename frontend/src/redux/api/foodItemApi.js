import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";






export const foodItemApi = createApi({
  reducerPath: "foodItemApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/",
    credentials: "include",
  }),
  invalidatesTags: ["Food-Item"],
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
getAllFoodItems: builder.query({
  query: ({ page, search = "" }) => {
    const params = new URLSearchParams();
    if(page) params.append("page", page);
    if (search) params.append("search", search);
    
    const queryString = params.toString();
    return queryString
      ? `food-item/all-food-items?${queryString}`
      : `food-item/all-food-items`;
  },
  providesTags: ["Food-Item"],
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
})


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

export const { useAddFoodItemMutation, useGetAllFoodItemsQuery, useEditSingleFoodItemMutation } = foodItemApi