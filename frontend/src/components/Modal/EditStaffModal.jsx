
import { LayoutDashboard } from 'lucide-react';
import  { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { useRegisterUserMutation } from '../../redux/api/userApi';
import { toast } from 'react-toastify';

import { useForm } from 'react-hook-form';

import { useSelector } from 'react-redux';

import { useGetAllCategoriesQuery } from '../../redux/api/itemApi';
import { useEffect } from 'react';





export default function EditStaffModal({selectedStaff,onClose}) {
   //const{userId,staffId} = useSelector((state) => state.user)
   const[showPassword, setShowPassword] = useState("");
   const [categorySearch, setCategorySearch] = useState("");
const [categoryOpen, setCategoryOpen] = useState(false);

console.log(selectedStaff,"selectedStaff");
     

   const[registerUser]=useRegisterUserMutation();
  const navigate=useNavigate();
    const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    
    formState: { errors },
  } =  useForm({
  defaultValues: {
    role: "kitchen_staff",
    categories: [],
  },
});
  const { data: categories } = useGetAllCategoriesQuery()
  console.log(categories, "categories");
const formValues = watch();

const selectedCategories = watch("categories") || [];
const selectedRole = watch("role");

const {user}=useSelector((state) => state.user);
console.log(user);


useEffect(() => {
  if (!selectedStaff) return;

  const normalizedCategories =
    selectedStaff.role === "kitchen-staff"
      ? Array.isArray(selectedStaff.categories)
        ? selectedStaff.categories
        : typeof selectedStaff.categories === "string"
        ? selectedStaff.categories.split(",").map(c => c.trim())
        : []
      : [];

  reset({
    name: selectedStaff.name || "",
    email: selectedStaff.email || "",
    phone: selectedStaff.phone || "",
    username: selectedStaff.username || "",
    city: selectedStaff.city || "",
    address: selectedStaff.address || "",
    pincode: selectedStaff.pincode || "",
    role: selectedStaff.role || "",
    categories: normalizedCategories,
  });

}, [selectedStaff, reset]);

const onSubmit = async (data) => {
  console.log("Raw Form Data (from RHF):", data);

  // const formData = new FormData();
  //  Object.keys(data).forEach((key) => {
  //   formData.append(key, data[key]);
  // });

  // append file if exists

  const payload={...data};
  

  // ✅ Log FormData contents (you won't see anything with console.log(formData))

try {
  const res = await registerUser({body:payload,User_Id:user.User_Id}).unwrap();
  console.log("Response from backend:", res);
  toast.success(res.message || "New employee added successfully!");
  navigate(`/staff/all-staffs`); // ✅ use backend userId
} catch (error) {
  // ✅ show backend error message if available
  const errorMessage =
    error?.data?.message || error?.message || "Failed to add new employee";

  toast.error(errorMessage);
  console.error("Submission failed", error);
}


};

  console.log("Current form values:", formValues);
  console.log("Form errors:", errors);
  const renderInput = (id, type = 'text', label, colClass = 'col s6') => (

  <div className={`input-field  ${colClass}`} style={{marginTop:"0px"}}>
    <div className="relative ">
        {/* Show error below the input field */}
          <span className="active">{label}</span>
                 
      {errors[id] && (
        <p className="text-red-500 text-xs mt-1">{errors[id]?.message}</p>
      )}
    
       {
      type=== "password" && label === "Password" ? (
        <input style={{border:"none !important ",outline:"none !important"}}
          id={id}
          type={showPassword ? 'text' : 'password'}
          {...register(id)} // <-- react-hook-form binding
          //placeholder={focusStates[id] ? '' : label}
       
          className={`w-full outline-none border  text-gray-900 bg-white rounded-md p-2 `}
        />
      ):
      (
        <input style={{border:"none !important ",outline:"none !important"}}
          id={id}
          type={type}
          {...register(id)} // <-- react-hook-form binding
         // placeholder={focusStates[id] ? '' : label}
      
             onInput={(e) => {
          if (id === "phone") {
            e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
          }
          if(id==="pincode"){
            e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
          }
        }}
          className={`w-full  outline-none border  text-gray-900 bg-white rounded-md p-2`}
        />
      )}  

      
       
        
   

      { (label==="Password" ) &&(
           <span
              className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
      )}
    

    
    </div>
  </div>
);





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
        Edit Staff
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
           
             
              <div className="tab-inn">
               <form  className=" gap-6" onSubmit={handleSubmit(onSubmit)}>

                  <div className="row flex gap-4">
                     {renderInput('name', 'text', ' Name')}
                    {renderInput('email', 'text', 'Email')}
                      {renderInput('phone', 'text', 'Phone Number')}
                   
                  </div>

                  <div className="row flex gap-4">
                  
                    {renderInput('username', 'text', 'Username')}
                        {/* {renderInput('password', 'password', 'Password')} */}
                      {renderInput('city', 'text', 'City')}
                  </div>

                

                                        <div className=" flex flex-row gap-4 ">
                                             {renderInput('address', 'text', 'Address')}
                                         
                                              {renderInput('pincode', 'text', 'Pincode')}
               
                                        </div>
    <div style={{width:"100%"}}
    className="grid grid-cols-[0.2fr_1fr] w-full ml-2 mb-2 gap-4">

  {/* ================= ROLE ================= */}
  <div className="flex flex-col items-start ">
     <span className="active">
        Role <span className="text-red-500">*</span>
      </span>

    <select
  
      {...register("role", { required: "Role is required" })}
      className="w-full outline-none border text-gray-900 bg-white rounded-md p-2"
      onChange={(e) => {
        const value = e.target.value;
        setValue("role", value);

        // Reset categories if role changes
        if (value !== "kitchen-staff") {
          setValue("categories", []);
          setCategorySearch("");
          setCategoryOpen(false);
        }
      }}
    >
      <option value="">Select Role</option>
      <option value="staff">Staff</option>
      <option value="kitchen-staff">Kitchen Staff</option>
    </select>
  </div>

  {errors?.role && (
    <p className="text-red-500 text-xs">{errors.role.message}</p>
  )}

  {/* ================= CATEGORIES ================= */}
  {selectedRole === "kitchen-staff" && (
    <div className="relative">

      <span className="active">
        Assign Categories <span className="text-red-500">*</span>
      </span>

      {/* INPUT + CHIPS */}
      <div
        className="flex flex-wrap items-center gap-2 border  p-2 cursor-text"
        onClick={() => setCategoryOpen(true)}
      >
        {/* Selected Categories */}
        {selectedCategories?.map((cat, idx) => (
          <span
            key={idx}
            className="bg-[#4CA1AF] text-white px-2 py-1  flex items-center gap-1 text-sm"
          >
            {cat}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setValue(
                  "categories",
                  selectedCategories.filter((c) => c !== cat),
                  { shouldValidate: true }
                );
              }}
            >
              ✕
            </button>
          </span>
        ))}

        <input
        style={{marginBottom:"0px",border:"none"}}
          type="text"
          value={categorySearch}
          onChange={(e) => {
            setCategorySearch(e.target.value);
            setCategoryOpen(true);
          }}
          placeholder="Search category"
          className="flex-1 outline-none"
          
        />
      </div>

      {/* DROPDOWN */}
      {categoryOpen && (
        <div className="absolute z-20 mt-1 
        w-full bg-white border rounded shadow max-h-48 overflow-y-auto">

          {categories
            ?.filter(
              (cat) =>
                cat.Item_Category
                  .toLowerCase()
                  .includes(categorySearch.toLowerCase()) &&
                !selectedCategories.includes(cat.Item_Category)
            )
            .map((cat, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setValue(
                    "categories",
                    [...selectedCategories, cat.Item_Category],
                    { shouldValidate: true }
                  );
                  setCategorySearch("");
                  setCategoryOpen(false);
                }}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {cat.Item_Category}
              </div>
            ))}

          {categories?.length === 0 && (
            <p className="px-3 py-2 text-gray-500">No categories found</p>
          )}
        </div>
      )}

      {/* ERROR */}
      {errors?.categories && (
        <p className="text-red-500 text-xs mt-1">
          At least one category is required
        </p>
      )}
    </div>
  )}



</div>



                                               
                                        
                                             <div className="flex justify-end ">
                    
                       <button
                        style={{ backgroundColor: "#4CA1AF" }}
                        type="submit"
                        className="text-white font-bold py-2 px-4 rounded"
                        
                      >
                        Add Staff
                      </button>
                    
                  </div>   

                  

                
                </form>
              </div>
            </div>
          </div>
        
    </>
    
  );
}