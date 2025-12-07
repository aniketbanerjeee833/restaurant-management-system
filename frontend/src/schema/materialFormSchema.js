import { z } from "zod";

// export const materialFormSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   unit: z.string().min(1, "Unit is required"),

//   reorder_level: z
//     .string()
//     .optional()
//     .transform(val => val === "" ? null : Number(val)),

//   shelf_life_days: z
//     .string()
//     .optional()
//     .transform(val => val === "" ? null : Number(val)),
// });
 const materialFormSchema = z.object({
  name: z.string().min(1, "Name is required"),

  

  // current_stock: z
  //   .string()
  //   .optional()
  //   .transform(val => val === "" ? null : Number(val)),

  reorder_level: z
    .string()
    .optional()
    .transform(val => val === "" ? null : Number(val)),

   reorder_level_unit: z.string().min(1, "Unit is required"),

  shelf_life_days: z
    .string()
    .optional()
    .transform(val => val === "" ? null : Number(val)),
});
export default materialFormSchema;