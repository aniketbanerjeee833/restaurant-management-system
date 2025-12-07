import { z } from "zod";

// export const materialSchema = z.object({
//   name: z.string().min(1, "Material name is required"),
//   unit: z.string().min(1, "Unit is required"),

//   current_stock: z
//     .number()
//     .nonnegative("Stock cannot be negative")
//     .default(0),

//   reorder_level: z
//     .number()
//     .positive("Reorder level must be positive")
//     .optional()
//     .nullable(),

//   shelf_life_days: z
//     .number()
//     .int()
//     .positive("Shelf life must be positive")
//     .optional()
//     .nullable(),
// });


 const materialSchema = z.object({
  name: z.string().min(1, "Material name is required"),


  //  current_stock: z.preprocess(
  //   (v) => {
  //     if (v === "" || v === null || v === undefined) return null;
  //     return Number(v);
  //   },
  //   z.number().nonnegative("Stock cannot be negative").nullable()
  // ).optional(),

  reorder_level: z.preprocess(
    (v) => {
      if (v === "" || v === null || v === undefined) return null;
      return Number(v);
    },
    z.number().nonnegative("Reorder level cannot be negative").nullable()
  ).optional(),

  
  reorder_level_unit: z.string().min(1, "Unit is required"),


  shelf_life_days: z.preprocess(
    (v) => {
      if (v === "" || v === null || v === undefined) return null;
      return Number(v);
    },
    z.number().int("Days must be an integer").nullable()
  ).optional(),
});
export default materialSchema;