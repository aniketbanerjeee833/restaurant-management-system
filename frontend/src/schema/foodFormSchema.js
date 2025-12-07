import { z } from "zod";

export const singleFoodItemSchema = z.object({
  Item_Name: z
    .string()
    .min(2, "Item Name must be at least 2 characters")
    .max(255),

Item_Image: z
  .any()
  .optional()
  .refine(
    (file) => {
      if (!file) return true; // ✔ allow empty
      return file instanceof File;
    },
    { message: "Invalid file upload" }
  )
  .refine(
    (file) => {
      if (!file) return true; // ✔ allow empty
      return ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type);
    },
    { message: "Only JPG, PNG, WEBP images allowed" }
  )
  .refine(
    (file) => {
      if (!file) return true; // ✔ allow empty
      return file.size <= 1 * 1024 * 1024;
    },
    { message: "Image must be less than 1MB" }
  ),


  Item_Category: z.string().min(1, "Select a category"),

  Item_Price: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)), "Enter valid price")
    .transform((v) => parseFloat(v))
    .refine((n) => n >= 0, "Price must be positive"),

  Item_Quantity: z
    .string()
    .refine((v) => /^[0-9]+$/.test(v), "Enter  quantity in numbers")
    .transform((v) => parseInt(v))
    .refine((n) => n >= 1, "Minimum quantity is 1"),

      Tax_Type: z.string().optional().default("None"),

  // 🆕 Auto-calculated numeric Tax Amount
  Tax_Amount: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)), "Invalid tax amount")
    .transform((v) => parseFloat(v))
    .refine((n) => n >= 0, "Tax amount must be positive"),

  Amount: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)), "Invalid amount")
    .transform((v) => parseFloat(v))
    .refine((n) => n >= 0, "Amount must be positive")

});


// ⬅ MULTI-ROW SCHEMA
export const foodFormSchema = z.object({
  items: z.array(singleFoodItemSchema).min(1, "Add at least one item"),
});
