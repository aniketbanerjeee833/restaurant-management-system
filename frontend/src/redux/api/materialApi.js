import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";




export const materialApi = createApi({
  reducerPath: "materialApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/",
    credentials: "include",
  }),
  invalidatesTags: ["Material"],

  endpoints: (builder) => ({



getAllMaterials: builder.query({
  query: ({ page, search = "" } = {}) => {
    const params = new URLSearchParams();

    // ✅ Append only when defined
    if (page) params.append("page", page);
    if (search) params.append("search", search);
  

    const queryString = params.toString();
    return queryString
      ? `material/get-all-materials?${queryString}`
      : `material/get-all-materials`;
  },
  providesTags: ["Material"],
}),

    // ✅ Add a party
    addMaterial: builder.mutation({
    
      query: ({ body }) => ({
        
        url: `material/add-material`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
         "Material" ,
      
      ],
    }),

  editMaterial: builder.mutation({
  query: ({ body, Material_Id }) => ({
    url: `material/edit-material/${Material_Id}`,
    method: "PATCH",
    body,
  }),
  invalidatesTags: ["Material"],
}),

addReleaseMaterials: builder.mutation({
  query: (body ) => ({
    url: `material/release-material`,
    method: "POST",
    body,
  }),
  invalidatesTags: ["Material"],
}),

   
    

  

  
   
   
  
  }),
});

 export const {
    useGetAllMaterialsQuery,
   
    useAddMaterialMutation,
    useEditMaterialMutation,
    useAddReleaseMaterialsMutation

 }=materialApi
   