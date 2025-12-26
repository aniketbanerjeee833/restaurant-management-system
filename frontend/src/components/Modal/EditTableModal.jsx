import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useUpdateTableMutation } from "../../redux/api/tableApi";

import { useEffect } from "react";
import { toast } from "react-toastify";
import Table from "../../pages/Items/Table";


export default function EditTableModal({table,onClose}) {

    const navigate=useNavigate()
      const {
        register,
        handleSubmit,
        reset,
        watch
    
        
      } = useForm()
      useEffect(() => {
          reset({
            Table_Name: table.Table_Name,
            Table_Capacity: table.Table_Capacity
          })
      },[])

      console.log(table)
     
    const[editTable,{isLoading:isEditingTable}]=useUpdateTableMutation()
      const formValues = watch();
  console.log("Current form values:", formValues);
    const [errors, setErrors] = useState({});
      const onSubmit = async(data) => {
            console.log("Form Data (from RHF):", data);

    if(!data.Table_Name ){
      
     setErrors((prevErrors) => ({ ...prevErrors, Table_Name: "Table name is required"
      }));
      return
      
    }

    if(!data.Table_Capacity ){
      
      setErrors((prevErrors) => ({ ...prevErrors, Table_Capacity: "Table capacity is required"
       }));
       return
       
     }
        try {
             const res = await editTable({
               body: data,
               Table_Id:table.Table_Id
             }).unwrap();
             console.log(" successfully:", res);
             const resData = res?.data || res;
             if (resData?.success) {
       
               toast.success(" Table edited successfully!");
               onClose();
               navigate("/table/all-tables");
             } else {
               toast.error("Failed to add new table");
             }
       
           } catch (error) {
             const errorMessage =
               error?.data?.message || error?.message || "Failed to update table";
             toast.error(errorMessage);
             // toast.error("Failed to add lead");
             console.error("Submission failed", error);
           }
      }
   return (
  <>

<div
  style={{
    position: "fixed",
    marginTop: "4rem",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)", // dim background
    backdropFilter: "blur(4px)", // blur effect
    zIndex: 50,
    padding: "1rem", // ensures spacing on small screens
  }}
>
    <div
      className="bg-white 
      w-full
       max-w-4xl rounded-lg 
      shadow-lg p-6 
    overflow-hidden max-h-[90vh]
      "
    >
       <div className="flex justify-between items-center mb-6"
      style={{marginBottom:"20px",paddingBottom:"10px"}}>
        <h4 className="text-xl font-semibold text-gray-900">
          Edit Table
        </h4>
        <button
          type="button"
          style={{ backgroundColor: "transparent" ,height:"30px",width:"30px",
            fontSize:"20px"
          }}
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 "
        >
          ✕
        </button>
      </div>
    
            
            
            <div className=" tab-inn">


              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-3 gap-4">

                  <div 
                  style={{width:"100%"}} className="input-field col s6 ">
                    <span className="active">
                     Table Name
                      <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
                    </span>
                    <input
                      type="text"
                      id="Table_Name"
                      {...register("Table_Name")}
                      placeholder=" Table Name"
                      className="w-full outline-none border-b-2 text-gray-900"
                    />
                    {errors?.Table_Name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?.Table_Name}
                      </p>
                    )}
                  </div>

              

             
              
              
<div  style={{width:"100%"}}
 className="input-field col s6  ">
    <span className="active">
        Table Capacity
        <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
    </span>

    <input
        type="text"
        id="Table_Capacity"
        {...register("Table_Capacity")}
        placeholder=" Table Capacity"
        className="w-full outline-none border-b-2 text-gray-900"
        
                 // limit to 8 digits
    onInput={(e) => {
      // ✅ Allow only digits
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
    }}
    />
    
    {errors?.Table_Capacity && (
        <p className="text-red-500 text-xs mt-1">
            {errors?.Table_Capacity}
        </p>
    )}
</div>



                

                <div className="flex  items-center">
                  <button
                    type="submit"
                    disabled={formValues.errorCount > 0 ||isEditingTable}
                    className=" text-white font-bold py-2 px-4 rounded mt-4"
                    style={{ backgroundColor: "#ff0000" }}
                  >
                    {isEditingTable ? "Saving..." : "Save"}
                  </button>
                </div>
                </div>
              </form>
            </div>
   

        
      </div>
    </div>



  </>
  );
}
