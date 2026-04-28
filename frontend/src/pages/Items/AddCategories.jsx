

import { itemApi, useAddCategoryMutation, useGetAllCategoriesQuery } from "../../redux/api/itemApi";
import { useDispatch } from "react-redux";
import {  useState } from "react";

import { toast } from "react-toastify";
import { foodItemApi, useToggleCategoryAvailabilityToBeShownOnMenuMutation, useUpdateFoodItemCategoryMutation } from "../../redux/api/foodItemApi";


export default function AddCategory() {

   const [newCategory, setNewCategory] = useState("");
   const dispatch = useDispatch();
    const[categoryError,setCategoryError]=useState("");
   const [addCategory, { isLoading: isAddingCategory }] = useAddCategoryMutation();
// const [categoryAvailability, setCategoryAvailability] = useState({});
const { data: categories } = useGetAllCategoriesQuery();
const [toggleCategoryAvailabilityToBeShownOnMenu]= 
useToggleCategoryAvailabilityToBeShownOnMenuMutation()
console.log("Categories fetched:", categories);

const [updateFoodItemCategory, { isLoading: isUpdatingCategory }]=useUpdateFoodItemCategoryMutation();
const [editingId, setEditingId] = useState(null);
const [editingValue, setEditingValue] = useState("");

//    useEffect(() => {
//   if (categories?.length) {
//     const initial = {};
//     categories.forEach(cat => {
//       initial[cat.id] = true; // default visible in menu
//     });
//     setCategoryAvailability(initial);
//   }
// }, [categories]);
const handleToggleCategoryAvailability = async (id, currentValue,itemCategory) => {
  console.log("Toggling category ID:", id);

  try {
    const res=await toggleCategoryAvailabilityToBeShownOnMenu(id).unwrap();
    if(res.success){
      console.log("Category visibility toggled successfully");
      dispatch(itemApi.util.invalidateTags(["Category"]));
        toast.success(
      currentValue === 1
        ? `${itemCategory} Category shown in menu`
        : `${itemCategory} Category hidden from menu`
    );
    }else{
      console.warn("Failed to toggle category visibility:", res.message);
    }
  
  } catch (err) {
    console.error(err);
    toast.error("Failed to update category");
  }
};



 const handleSubmit = async (e) => {
  e.preventDefault();
 
   if(newCategory.trim()===""){
    setCategoryError("Category cannot be empty")
     return
   }
   else if (newCategory.trim() !== "") {
     try {
       // ✅ Call backend
       const res = await addCategory({
         body: { Item_Category: newCategory.trim() },
       });
 
       // Some RTK Query wrappers put the response under `.data`
       const data = res?.data || res;
       console.log(data,res);
 
       if (data?.success) {
         const addedCat = newCategory.trim();
        toast.success("New Category added successfully!");
         // ✅ Auto-select the new category (single value)
      
 
         // ✅ Refresh cache
         dispatch(itemApi.util.invalidateTags(["Category"]));
 
        
         setNewCategory("");
        
       } else {
        toast.error(res?.error?.data?.message );
         console.warn("⚠️ Category not added. Response:", data);
       }
     } catch (err) {
       console.error("❌ Error adding category:", err);
     }
   }
 };
const handleUpdateCategory = async (id) => {
  if (!editingValue.trim()) return;

  try {
    await updateFoodItemCategory({
      Category_Id: id,
      newCategoryName: editingValue,
    });

    setEditingId(null);
    setEditingValue("");

    // Refetch categories
    dispatch(itemApi.util.invalidateTags(["Category"]));
    dispatch(foodItemApi.util.invalidateTags(["Food-Item"])); // Invalidate food items too, since they depend on categories
    toast.success("Category updated successfully!");
  } catch (err) {
    console.error(err);
  }
};

      
    return (
        <>
       
              
                     {/* <div className="sb2-2-3 ">
                    <div className="row">
                    <div className="col-md-12">
                     <div className="box-inn-sp"> */}
            
                        <div className="flex flex-col bg-white">
                            <div className="inn-title">
                                <h4 className="text-2xl font-bold mb-2">Add New Category</h4>
                                <p className="text-gray-500 mb-6">
                                    Add new Category
                                </p>
                            </div>
                            <div className="tab-inn">



                                <form onSubmit={(e) => handleSubmit(e)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>


                                    <div className="row flex flex-row gap-4">
                                        {/*Lead Name Field*/}
                                        <div className="input-field col s6 mt-0">
                    <span className="active">
                      Item Category
                      <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
                    </span>
                    <input
                      type="text"
                      id="Item_Category"
                     onChange={(e) => setNewCategory(e.target.value)}
                      value={newCategory}
                      placeholder=" Item Category"
                      className="w-full outline-none border-b-2 text-gray-900"
                    />
                    {categoryError && (
                      <p className="text-red-500 text-xs mt-1">
                        {categoryError}
                      </p>
                    )}
                  </div>
                                    
                            <div className="input-field col s6">
                                        <input
                                            type="submit"
                                            disabled={isAddingCategory}
                                               style={{ backgroundColor: "#ff0000" }}
                                            className="waves-effect waves-light btn-large"
                                            value="Add Category"
                                        />
                                    </div>
                                    </div>
                                </form>

  

{/* <div className="mt-4 ml-4 w-[50%]">

  {/* HEADINGS
  <div
    className="
      flex justify-between items-center
      px-3 py-2
      font-semibold text-sm
      text-gray-700
      
      sticky top-0
      bg-white
      z-10
    "
  >
    <span>Categories</span>
    <span>Show on Menu</span>
  </div>

  <div className="max-h-[50vh] overflow-y-auto space-y-2 mt-2">
    {categories?.map((cat) => (
      <div
        key={cat.id}
        className="
          px-3 py-2
          flex justify-between items-center
          bg-[#f3f2fd]
          border-l-4 border-[#ff0000]
          border border-gray-300
          rounded-md
          text-sm
          text-[#ff0000]
          font-medium
        "
      >
        {/* CATEGORY NAME 
        <span>{cat.Item_Category}</span>

        {/* CHECKBOX 
        <input
          type="checkbox"
          checked={cat.is_shown_on_menu === 1}
          onChange={(e) => {
            const value = e.target.checked ? 1 : 0;
            handleToggleCategoryAvailability(
              cat.id,
              value,
              cat.Item_Category
            );
          }}
          className="w-4 h-4 cursor-pointer"
        />
      </div>
    ))}
  </div>
</div> */}

<div className="mt-4 ml-4 flex flex-col gap-2">
  {categories?.map((cat) => (
    <div
      key={cat.id}
      className="
        px-3 py-2
        gap-2
        flex justify-between items-center
        bg-[#f3f2fd]
        border-l-4 border-[#ff0000]
        border border-gray-300
        rounded-md
        text-sm
        font-medium
      "
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-2 w-full">

        {/* EDIT MODE */}
        {editingId === cat.id ? (
          <div className="flex items-center gap-2 w-full mr-2">
            <input
              type="text"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              className="border px-2 py-1 text-sm rounded "
            />

            <button
            disabled={isUpdatingCategory}
            style={{ backgroundColor: "#ff0000" }}
              type="button"
              onClick={() => handleUpdateCategory(cat.id)}
              className="text-white px-2 py-1 rounded bg-gray-600 font-semibold text-xs"
            >
              Save
            </button>

            <button
            style={{backgroundColor:"lightgray"}}
              type="button"
              onClick={() => {
                setEditingId(null);
                setEditingValue("");
              }}
              className=" px-2 py-1 rounded bg-gray-600 font-semibold text-xs"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <span className="text-[#ff0000]">
              {cat.Item_Category}
            </span>

            {/* EDIT ICON */}
            <button
               style={{backgroundColor:"transparent"}}
              type="button"
              onClick={() => {
                setEditingId(cat.id);
                setEditingValue(cat.Item_Category);
              }}
              className="text-gray-500 hover:text-black"
            >
              ✏️
            </button>
          </>
        )}
      </div>

      {/* RIGHT SIDE CHECKBOX */}
      <input
        type="checkbox"
        checked={cat.is_shown_on_menu === 1}
        onChange={(e) => {
          const value = e.target.checked ? 1 : 0;
          handleToggleCategoryAvailability(
            cat.id,
            value,
            cat.Item_Category
          );
        }}
        className="w-4 h-4 cursor-pointer"
      />
    </div>
  ))}
</div>






                            </div>
                        </div>
                  
        
</>
    );
}