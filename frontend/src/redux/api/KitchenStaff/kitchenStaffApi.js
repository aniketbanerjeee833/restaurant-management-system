import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";








export const kitchenStaffApi = createApi({
  reducerPath: "kitchenStaffApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/",
    credentials: "include",
  }),
  tagTypes: ["Kitchen-Staff" ],

    endpoints: (builder) => ({

        getKitchenOrders: builder.query({
            query: () => `kitchen-staff/orders` ,
            providesTags: ["Kitchen-Staff"],
        }),
        updateKitchenItemStatus: builder.mutation({
            query: ({ KOT_Id, KOT_Item_Id,  status }) => ({
                url: `kitchen-staff/update-item-status/${KOT_Id}/${KOT_Item_Id}`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: ["Kitchen-Staff"],
        }),
    }),
});

export const {
   useGetKitchenOrdersQuery ,useUpdateKitchenItemStatusMutation} = kitchenStaffApi