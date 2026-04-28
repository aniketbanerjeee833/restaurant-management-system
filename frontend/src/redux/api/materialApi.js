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

eachMaterialReport: builder.query({
  query: ({ Material_Name }) => ({
    url: `material/single-material-report/${Material_Name}`,
    method: "GET",
  }),
  providesTags: ["Material"],
}),

addReleaseMaterials: builder.mutation({
  query: (body ) => ({
    url: `material/release-material`,
    method: "POST",
    body,
  }),
  invalidatesTags: ["Material"],
}),
 printEachMaterialDetailsReport: builder.mutation({
  query: (payload) => ({
    url: "material/print-each-material-details-report",
    method: "POST",
    body: JSON.stringify(payload),   // IMPORTANT
    headers: {
      "Content-Type": "application/json",
    },
    responseHandler: (response) => response.blob(), 
  }),
}),
   
    

  

  
   
   
  
  }),
});

 export const {
    useGetAllMaterialsQuery,
   
    useAddMaterialMutation,
    useEditMaterialMutation,
    useEachMaterialReportQuery,
    useAddReleaseMaterialsMutation,
    usePrintEachMaterialDetailsReportMutation

 }=materialApi
   