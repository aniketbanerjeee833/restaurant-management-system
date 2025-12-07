
import { LayoutDashboard } from 'lucide-react';
import  { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { useRegisterUserMutation } from '../../redux/api/userApi';
import { toast } from 'react-toastify';

import { useForm } from 'react-hook-form';

import { useSelector } from 'react-redux';





export default function AddStaff() {
   //const{userId,staffId} = useSelector((state) => state.user)
   const[showPassword, setShowPassword] = useState("");
  

   const[registerUser]=useRegisterUserMutation();
  const navigate=useNavigate();
    const {
    register,
    handleSubmit,
    watch,
    
    formState: { errors },
  } = useForm();

const formValues = watch();
const {user}=useSelector((state) => state.user);
console.log(user);
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

      
       
        
   
{/* 
      {( watch(id)) && (
        <label
          htmlFor={id}
          className="absolute left-0 -top-5 text-sm text-[#26a69a] transition-all"
        >
          {label}
        </label>
      )} */}
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
      <div className="sb2-2-2">
        <ul>
           <li >
                    <NavLink style={{display:"flex" ,flexDirection:"row"}}
                      to="/home"
          
                    >
                      <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
                      {/* <i className="fa fa-home mr-2" aria-hidden="true"></i> */}
                      Dashboard
                    </NavLink>
                  </li>
       
        </ul>
      </div>

      <div className="sb2-2-3">
        <div className="row">
          <div className="col-md-12">
            <div className="box-inn-sp">
              <div className="inn-title">
                <h4>Add New Staff</h4>
                <p>Enter the staff details below.</p>
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
                        {renderInput('password', 'password', 'Password')}
                      {renderInput('city', 'text', 'City')}
                  </div>

                

                                        <div className=" flex flex-row gap-4 ">
                                             {renderInput('address', 'text', 'Address')}
                                         
                                              {renderInput('pincode', 'text', 'Pincode')}
               
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
        </div>
      </div>
    </>
    
  );
}