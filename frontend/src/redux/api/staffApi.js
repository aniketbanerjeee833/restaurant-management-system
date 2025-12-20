import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";





export const staffApi = createApi({
  reducerPath: "staffApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/",
    credentials: "include", // same as withCredentials: true
  }),
  tagTypes: ["Staff"], // 👈 added Location for countries/states/cities
  endpoints: (builder) => ({

   
getAllStaffs: builder.query({
  query: ({ adminId, page } = {}) => {
    const params = new URLSearchParams();

    // Append parameters only if they exist
    if (page) params.append("page", page);
   

    const queryString = params.toString();

    return `staff/get-all-staffs/${adminId}?${queryString}`
      
  },

  providesTags: ["Staff"],
}),

     availableCategoriesForKitchenStaffs:builder.query({
            query: () => `staff/available-categories-for-kitchen-staffs` ,
            providesTags: ["Kitchen-Staff"],
        }),

        editStaff: builder.mutation({
            query: (payload) => ({
                url: `staff/update-staff`,
                method: "PATCH",
                body: payload,
            }),
            invalidatesTags: ["Staff"],
        }),
    


  
  

    
  }),
});


export const {
useGetAllStaffsQuery,useAvailableCategoriesForKitchenStaffsQuery,useEditStaffMutation
} = staffApi;
