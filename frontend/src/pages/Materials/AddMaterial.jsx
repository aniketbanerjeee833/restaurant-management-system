

import { NavLink, useNavigate } from "react-router-dom";




import { useForm } from "react-hook-form";







import { toast } from "react-toastify";
import {  LayoutDashboard } from "lucide-react";

import { useAddMaterialMutation } from "../../redux/api/materialApi";
import { zodResolver } from "@hookform/resolvers/zod";
import materialFormSchema from "../../schema/materialFormSchema";










export default function AddMaterial() {
 

    const units={
        "Kilogram":"Kg",
        "Litre":"lt",
        "Gram":"gm",
        "Pcs":"pcs"
    }
  const navigate=useNavigate();
  const {
    register,
    handleSubmit,

    watch,
 formState: { errors },
  } = useForm({
    resolver:zodResolver(materialFormSchema),
      defaultValues: {
        reorder_level: 0,
        current_stock: 0,
        reorder_level_unit: "",
        name: "",
        shelf_life_days: 0,
    }
  })



 
 

  const [addMaterial, { isLoading:isAddingMaterial }] = useAddMaterialMutation();

  //const [search, setSearch] = useState("");
 




  // Toggle category selection

  //   Close dropdown if click outside
 

 






  const formValues = watch();
  console.log("Current form values:", formValues);
  console.log("Form errors:", errors);


  const onSubmit = async (data) => {
    console.log("Form Data (from RHF):", data);

  
    try {
      const res = await addMaterial({
        body: data,
      }).unwrap();
      console.log(" successfully:", res);
      const resData = res?.data || res;
      if (resData?.success) {

        toast.success("New Material added successfully!");
        navigate("/material/all-materials");
      } else {
        toast.error("Failed to add new material");
      }

    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to add new material";
      toast.error(errorMessage);
      // toast.error("Failed to add lead");
      console.error("Submission failed", error);
    }
  };



  return (<>

{/* 
    <div className="sb2-2-2">
      <ul >
        <li >
          <NavLink style={{display:"flex" ,flexDirection:"row"}}
            to="/home"

          >
            <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
        
            Dashboard
          </NavLink>
        </li>

      </ul>
    </div> */}
    <div className="sb2-2-3 ">
      <div className="row">
        <div className="col-md-12">
          <div className="box-inn-sp">
            <div className="inn-title">
              <div className="flex flex-row justify-between tables-center mb-4 sm:mb-4">
                <div>
              <h4 className="text-2xl font-bold mb-2">Add New Material</h4>
              <p className="text-gray-500 mb-6">
                Add new material details
              </p>
              </div>
                                         <div className="hidden sm:block">
                                        <button
                                        onClick={()=>navigate("/material/all-materials")}
                                            style={{
                                                outline: "none",
                                                boxShadow: "none",
                                                backgroundColor: "#ff0000",
                                            }}
                                            className="text-white px-4 py-2 rounded-md"

                                        >
                                            All Materials
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
                     Material Name
                      <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
                    </span>
                    <input
                      type="text"
                      id="Material_Name"
                      {...register("name")}
                      placeholder=" Material Name"
                      className="w-full outline-none border-b-2 text-gray-900"
                    />
                    {errors?.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?.name}
                      </p>
                    )}
                  </div>

              

             
              
              



             
                  {/* <div className="grid grid-cols-2 gap-4"> */}
{/* 
                  <div style={{width:"100%"}} className="input-field col s6 flex flex-row ">
                    <span className="active">
                     Reorder Level
                     
                    </span>
                    <input
                      type="text"
                      id="Reorder_Level"
                     
                      placeholder=" Reorder Level"
                      className="w-full outline-none border-b-2 text-gray-900"
                                
                                {...register("reorder_level",{
             onChange: (e) => {
                                    let val = e.target.value;

                                    // ✅ allow digits and one dot
                                    val = val.replace(/[^0-9.]/g, "");

                                    // ✅ if more than one dot, keep only the first
                                    const parts = val.split(".");
                                    if (parts.length > 2) {
                                      val = parts[0] + "." + parts.slice(1).join(""); // collapse extra dots
                                    }

                                    // ✅ limit to 2 decimal places
                                    if (val.includes(".")) {
                                      const [int, dec] = val.split(".");
                                      val = int + "." + dec.slice(0, 2);
                                    }

                                    e.target.value = val;
                                     }
  })}
                    />
                    {errors?.reorder_level && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?.reorder_level}
                      </p>
                    )}
                    <div 
 className="input-field col s6  ">
    <span className="active">
        Unit
        <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
    </span>


    <select
    id="Material_Unit"
    {...register("unit")}
    className="w-full outline-none border-b-2 text-gray-900"
    >
    <option value="">Select Unit</option>
   {Object.entries(units).map(([key, value]) => (
   <option key={key} value={key}>
  {`${value} (${key})`}
</option>
))}
    </select>
    
    {errors?.unit && (
        <p className="text-red-500 text-xs mt-1">
            {errors?.unit}
        </p>
    )}
</div>
                  </div> */}
<div style={{ width: "100%" }} className="input-field col s6 flex flex-row gap-4">

  {/* 🔹 Reorder Level */}
  <div className="w-1/2">
    <span className="active">Reorder Level
      <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
    </span>

    <input
      type="text"
      id="Reorder_Level"
      placeholder="Reorder Level"
      className="w-full outline-none border-b-2 text-gray-900"
      {...register("reorder_level", {
        onChange: (e) => {
          let val = e.target.value;

          // allow digits + dot
          val = val.replace(/[^0-9.]/g, "");

          // only one dot
          const parts = val.split(".");
          if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");

          // max 2 decimals
          if (val.includes(".")) {
            const [int, dec] = val.split(".");
            val = int + "." + dec.slice(0, 2);
          }

          e.target.value = val;
        },
      })}
    />

    {errors?.reorder_level && (
      <p className="text-red-500 text-xs mt-1">
        {errors?.reorder_level}
      </p>
    )}
  </div>

  {/* 🔹 Unit Dropdown */}
  <div className="w-1/2">
    <span className="active">
      Unit<span className="text-red-500 font-bold text-lg">&nbsp;*</span>
    </span>

    <select
      id="Material_Unit"
      {...register("reorder_level_unit")}
      className="w-full outline-none border-b-2 text-gray-900"
    >
      <option value="">Select Unit</option>
      {Object.entries(units).map(([key, value]) => (
        <option key={key} value={key}>
          {`${value} (${key})`}
        </option>
      ))}
    </select>

    {errors?.unit && (
      <p className="text-red-500 text-xs mt-1">{errors?.unit}</p>
    )}
  </div>

</div>

              

             
              
              
<div  style={{width:"100%"}}
 className="input-field col s6  ">
    <span className="active">
        Shelf Life (Days)
     
    </span>

     <input
        type="text"
        id="shelf_life_days"
     
        placeholder=" Shelf Life (Days)"
        className="w-full outline-none border-b-2 text-gray-900"
        
          
        {...register("shelf_life_days",{
         
          
        
      onInput:(e) => {
        // ✅ Allow only digits
        e.target.value = e.target.value.replace(/[^0-9]/g, "");
      }
           })}
    /> 
  
    
    {errors?.shelf_life_days && (
        <p className="text-red-500 text-xs mt-1">
            {errors?.shelf_life_days}
        </p>
    )}
</div>


                </div>
                 <div className="flex justify-end items-center">
                  <button
                    type="submit"
                    disabled={formValues.errorCount > 0 ||isAddingMaterial}
                    className=" text-white font-bold py-2 px-4 rounded mt-4"
                    style={{ backgroundColor: "#ff0000" }}
                  >
                    {isAddingMaterial ? "Saving..." : "Save"}
                  </button>
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

