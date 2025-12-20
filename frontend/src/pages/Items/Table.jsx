import {  useState } from "react";
import {  useNavigate } from "react-router-dom";




import { useForm } from "react-hook-form";







import { toast } from "react-toastify";

import { useAddTableMutation } from "../../redux/api/tableApi";









export default function Table() {
 
  const navigate=useNavigate();
  const {
    register,
    handleSubmit,

    watch
  } = useForm()



  
  // const [wholeSalePrice, setWholeSalePrice] = useState(false);
  //const [open, setOpen] = useState(false);
  //const [selected, setSelected] = useState([]); // selected categories

 
 

  const [addTable, { isLoading:isAddingTable }] = useAddTableMutation();

  //const [search, setSearch] = useState("");
 
  const [errors, setErrors] = useState({});



  // Toggle category selection

  //   Close dropdown if click outside
 

 






  const formValues = watch();
  console.log("Current form values:", formValues);
  console.log("Form errors:", errors);


  const onSubmit = async (data) => {
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
      const res = await addTable({
        body: data,
      }).unwrap();
      console.log(" successfully:", res);
      const resData = res?.data || res;
      if (resData?.success) {

        toast.success("New Table added successfully!");
        navigate("/table/all-tables");
      } else {
        toast.error("Failed to add new table");
      }

    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to add new table";
      toast.error(errorMessage);
      // toast.error("Failed to add lead");
      console.error("Submission failed", error);
    }
  };

console.log(errors);

  return (
  <>


    
    <div className="sb2-2-3 ">
      <div className="row">
        <div className="col-md-12">
          <div className="box-inn-sp">
            <div className="inn-title">
              <div className="flex flex-row justify-between tables-center mb-4 sm:mb-4">
                <div>
              <h4 className="text-2xl font-bold mb-2">Add New Table</h4>
              <p className="text-gray-500 mb-6">
                Add new table details
              </p>
              </div>
                                         <div className="hidden sm:block">
                                        <button
                                        onClick={()=>navigate("/table/all-tables")}
                                            style={{
                                                outline: "none",
                                                boxShadow: "none",
                                                backgroundColor: "#ff0000",
                                            }}
                                            className="text-white px-4 py-2 rounded-md"

                                        >
                                            All Tables
                                        </button>
                                        </div>
              </div>
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
                      id="Item_Name"
                      {...register("Table_Name")}
                      placeholder=" Item Name"
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
                    disabled={formValues.errorCount > 0 ||isAddingTable}
                    className=" text-white font-bold py-2 px-4 rounded mt-4"
                    style={{ backgroundColor: "#ff0000" }}
                  >
                    {isAddingTable ? "Saving..." : "Save"}
                  </button>
                </div>
                </div>
              </form>
            </div>
   

          </div>
        </div>
      </div>
    </div>



  </>
  );
};

