
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAddDailyExpenseMutation, useGetAllDailyExpenseCategoriesQuery } from "../../redux/api/dailyExpenseApi";
import { useNavigate } from "react-router-dom";
import { useGetUserQuery } from "../../redux/api/userApi";
import { useState } from "react";


export default function DailyExpense() {
  const today = new Date().toISOString().split("T")[0];
//   const [selectedDate, setSelectedDate] = useState(today);
  const { data: userMe,  } = useGetUserQuery();
  console.log(userMe,"userMe in header");
const {data:allDailyExpenseCategories}= useGetAllDailyExpenseCategoriesQuery()
console.log(allDailyExpenseCategories,"allDailyExpenseCategories");

const[categoryOpen,setCategoryOpen]=useState(false) 
const navigate=useNavigate();
  const [addDailyExpense, { isLoading: isSaving }] =
    useAddDailyExpenseMutation();
    const[categorySearch,setCategorySearch]=useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
     defaultValues: {
        Expense_Date: today,
        
    }
  });

const handleSelect = (value) => {
  setCategorySearch(value); // updates input UI
  setValue("Category", value, { 
    shouldValidate: true,
    shouldDirty: true 
  }); // updates RHF form state
};

  const onSubmit = async (data) => {

    if(!data?.Expense_Date ){
      toast.error("Please select expense date.");
      return;
    }
    try {
      await addDailyExpense({...data}).unwrap();

      toast.success("Expense Added");

      //reset(); // clear form after success
      navigate("/daily-expense/all-daily-expenses")
    } catch (err) {
      console.error(err);
      toast.error("Failed to add expense");
    }
  };

  const formValues=watch();
  console.log(formValues)


  return (
    <div style={{height:"100%"}}
    className="flex flex-col bg-white p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        {/* <div className="bg-white p-6 rounded shadow mb-6">
          <h1 className="text-2xl font-bold mb-4">
            Daily Expense Management
          </h1>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div> */}
           <div className="inn-title w-full px-2 py-3">

                                <div className="flex flex-col sm:flex-row justify-between
                                 items-start sm:items-center w-full mt-2">

                                    {/* LEFT HEADER */}
                                    <div className="w-full sm:w-auto">
                                        <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Add Daily Expense</h4>
                                        {/* <p className="text-gray-500 mb-2 sm:mb-4">
        Add new sale details
      </p> */}
                                    </div>

                                    {/* RIGHT BUTTON SECTION */}
                                    <div className="
      w-full sm:w-auto 
      flex flex-wrap sm:flex-nowrap 
      justify-start sm:justify-end 
      gap-3
    ">
                                        
                                {/* <div 
                  style={{width:"100%"}} className="flex  gap-4 justify-center items-center">
                    <span className="active ">
                      Date
                      <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
                    </span>
                    <input
                    style={{marginBottom:"0px"}}
                      type="date"
                      id="Expense_Date"
                      {...register("Expense_Date")}
                      
                      className="w-full outline-none border-b-2 text-gray-900"
                    />
                   
                  </div> */}

                  <div
  style={{ width: "100%" }}
  className="flex gap-4 justify-center items-center"
>
  <span className="active">
    Date
    <span className="text-red-500 font-bold text-lg">
      &nbsp;*
    </span>
  </span>

  <input
    style={{ marginBottom: "0px" }}
    type="date"
    id="Expense_Date"
    {...register("Expense_Date")}
    readOnly={userMe?.user?.role === "staff"}
    className={`w-full outline-none border-b-2 text-gray-900 
      ${userMe?.user?.role === "staff" ? "bg-gray-100 cursor-not-allowed" : ""}
    `}
  />
</div>

                                    </div>

                                </div>
                            </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 "
        >
             <div className="grid grid-cols-2 gap-4">
          {/* <div>
            <input
              type="text"
              placeholder="Category (Gas, Vegetables)"
              {...register("Category", {
                required: "Category is required",
              })}
              className="border px-3 py-2 rounded w-full"
            />
            {errors.Category && (
              <p className="text-red-500 text-sm">
                {errors.Category.message}
              </p>
            )}
          </div> 
            <input
            type="text"
            placeholder="Product Description"
            {...register("Product_Description")}
            className="border px-3 py-2 rounded"
          />

          <input
            type="text"
            placeholder="Notes"
            {...register("Notes")}
            className="border px-3 py-2 rounded"
          />

          <div>
            <input
              type="number"
              placeholder="Amount"
              step="0.01"
              {...register("Amount", {
                required: "Amount is required",
                min: {
                  value: 1,
                  message: "Amount must be greater than 0",
                },
              })}
              className="border px-3 py-2 rounded w-full"
            />
            {errors.Amount && (
              <p className="text-red-500 text-sm">
                {errors.Amount.message}
              </p>
            )}
          </div>
          
          */}
<div>
          <div 
                  style={{width:"100%"}} className="input-field col s6 ">
                    <span className="active">
                     Category
                      {/* <span className="text-red-500 font-bold text-lg">&nbsp;*</span> */}
                    </span>
                    <input
                      type="text"
                      id="Category"
                       value={categorySearch}
                        {...register("Category", {
                required: "Category is required",
              })}
                      placeholder="Category"
                      className="w-full outline-none border-b-2 text-gray-900"
                      onFocus={() => setCategoryOpen(true)}
                         onChange={(e) => {
        setCategorySearch(e.target.value);
        setCategoryOpen(true);
         setValue("Category", e.target.value, { shouldValidate: true });
      }}
         onBlur={() => {
        setTimeout(() => setCategoryOpen(false), 150);
      }}
                    />
                    {errors?.Category && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?.Category?.message}
                      </p>
                    )}
                     {categoryOpen && (
                   <div className="absolute top-18 left-0 mt-1 z-50
                    w-full bg-white border border-gray-300 
                   rounded-md shadow-lg max-h-48 overflow-y-auto">      
    {/* //   <div className="absolute top-18 z-20 w-full bg-white border
    //    border-gray-300 rounded-md shadow-lg max-h-42 overflow-y-auto"> */}
        {allDailyExpenseCategories
          ?.filter((cat) =>
            cat.Category.toLowerCase().includes(
              (categorySearch || "").toLowerCase()
            )
          )
          .map((cat, idx) => (
            <div
              key={idx}
              onMouseDown={() => {
               
                handleSelect(cat.Category);
                setCategoryOpen(false);
              }}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {cat.Category}
            </div>
          ))}

        {!allDailyExpenseCategories?.some((cat) =>
          cat.Category
            .toLowerCase()
            .includes((categorySearch || "").toLowerCase())
        ) && (
          <p className="px-3 py-2 text-gray-500">No categories found</p>
        )}
      </div>
    )}
                  </div>
                  <div 
                  style={{width:"100%"}} className="input-field col s6 ">
                    <span className="active">
                     Product Description
                      
                    </span>
                    <input
                      type="text"
                      id="Product_Description"
                       {...register("Product_Description")}
                      placeholder="Product Description"
                      className="w-full outline-none border-b-2 text-gray-900"
                    />
                    {errors?.Product_Description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?.Product_Description}
                      </p>
                    )}
                  </div>
                 </div> 
                 <div>
                  <div 
                  style={{width:"100%"}} className="input-field col s6 ">
                    <span className="active">
                     Notes
                  
                    </span>
                    <input
                      type="text"
                      id="Notes"
                        {...register("Notes")}
                      placeholder="Notes"
                      className="w-full outline-none border-b-2 text-gray-900"
                    />
                    {errors?.Notes && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?.Notes}
                      </p>
                    )}
                  </div>
                  <div 
                  style={{width:"100%"}} className="input-field col s6 ">
                    <span className="active">
                    Amount
                     
                    </span>
                    <input
                      type="number"
                      id="Amount"
                      {...register("Amount", {
                required: "Amount is required",
                min: {
                  value: 1,
                  message: "Amount must be greater than 0",
                },
              })}
                      placeholder="Amount"
                      className="w-full outline-none border-b-2 text-gray-900"
                    />
                    {errors?.Amount && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?.Amount}
                      </p>
                    )}
                  </div>
                   </div>
 </div>
        

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            style={{outline: "none",boxShadow: "none",backgroundColor: "#ff0000",}}
            className=" text-white rounded px-4 py-2  "
          >
            {isSaving ? "Saving..." : "Add Expense"}
          </button>
          </div>
        </form>
      </div>
    </div>
  );
}
