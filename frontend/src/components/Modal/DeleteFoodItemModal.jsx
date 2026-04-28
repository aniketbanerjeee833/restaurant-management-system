

// export default function DeleteFoodItemModal() {
//   return (
//     <div>DeleteFoodItemModal</div>
//   )

//import { toast } from "react-toastify";


// }
//export default function  DeleteFoodItemModal({ onClose, foodItem, editingFoodItem,isInvoiceDeleted })
export default function  DeleteFoodItemModal({  onClose,
  title = "Are you sure you want to delete?",

  onConfirm,
  isLoading,
  confirmText = "Delete",})
{
    //console.log("foodItem", foodItem, editingFoodItem);
    //const dispatch = useDispatch();
    
//const[softDeleteFoodItem, { isLoading: isDeletingFoodItem }]=  useSoftDeleteFoodItemMutation();
  
// const handleSoftDeleteFoodItem = async (Item_Id) => {
//   try {
//     const res=await softDeleteFoodItem(Item_Id).unwrap();
//     toast.success(`${res.Item_Name} Food item deleted successfully`);
//     //dispatch(foodItemApi.util.invalidateTags([{ type: "Food-Item", id: "LIST" }]));
//     onClose();
//   } catch (err) {
//     console.error("Delete failed", err);
//     toast.error("Failed to delete food item");
//   }
// };
    






    return (
     <>
  {/* Overlay */}
  <div
    style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.35)",
      backdropFilter: "blur(4px)",
      zIndex: 50,
      padding: "1rem",
    }}
  >
    {/* Modal Card */}
    <div
      className="
        bg-white
        w-full
        max-w-md
        rounded-xl
        shadow-lg
        p-8
        relative
        text-center
      "
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
          style={{marginBottom:"20px",backgroundColor:"transparent"}}
      >
        ✕
      </button>

      {/* Title */}
      <h4 className="text-xl font-semibold text-gray-900 mb-12"
      style={{marginBottom:"20px"}}>
      {title}
      </h4>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={onClose}
          className="
            px-6 py-2
            rounded
            font-bold
            text-white
            bg-black
            hover:bg-gray-800
            transition
          "
        >
          Cancel
        </button>

        <button
          type="button"
            onClick={onConfirm}
            disabled={isLoading}
          // onClick={() => handleSoftDeleteFoodItem(foodItem.Item_Id)}
          // disabled={isDeletingFoodItem}
          className="
            px-6 py-2
            rounded
            font-bold
            text-white
            bg-red-600
            hover:bg-red-700
            transition
            disabled:opacity-60
          "
        >
          {isLoading ? "Deleting..." : confirmText}
          {/* {isDeletingFoodItem ? "Deleting..." : "Delete"} */}
        </button>
      </div>
    </div>
  </div>
</>

    );
}