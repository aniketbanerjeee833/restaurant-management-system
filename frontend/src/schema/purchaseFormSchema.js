
// import { z } from "zod";
// const HSN_REGEX = /^\d{4,8}$/;
// // ✅ Digits only helper

// const digitsOnly = (fieldName, required = true) =>
//   z.union([z.string(), z.number()])
//     .transform((val) => String(val ?? "").trim())
//     .refine(
//       (val) => (required ? val !== "" : true),
//       { message: `${fieldName} is required` }
//     )
//     .refine(
//       (val) => val === "" || /^\d+(\.\d{1,2})?$/.test(val),
//       { message: `${fieldName} must be a valid number` }
//     )
//     .transform((val) => (val === "" ? 0 : Number(val)));

// // ✅ Schema
// export const purchaseFormSchema = z.object({
//   Party_Name: z.string().min(1, "Party_Name is required"),

//             GSTIN: z.preprocess(
//   (val) => {
//     // if undefined or null → treat as empty string
//     if (val === undefined || val === null) return "";
//     return String(val);
//   },
//   z.string()
//     .refine((val) => val.length === 0 || val.length === 15, {
//       message: "GSTIN must be exactly 15 characters",
//     })
// ),

//   Bill_Number: z.string().min(1, "Bill_Number is required"),

//   Bill_Date: z
//     .string()
//     .refine((val) => !isNaN(Date.parse(val)), {
//       message: "Bill_Date must be a valid date",
//     }),

//   State_Of_Supply: z.string().min(1, "State_Of_Supply is required"),

//   // 🔹 Auto-calculated but cannot be empty
//   Total_Amount: digitsOnly("Total_Amount", true),
//   Balance_Due: digitsOnly("Balance_Due", true),

//   // 🔹 Optional but digits if provided
//   Total_Paid: z.string().optional().or(digitsOnly("Total_Paid", false)),
//   Payment_Type: z
//       .enum(["Cash", "Cheque", "Neft"])
//       .or(z.literal("")) // allow blank select
//       .refine((val) => val !== "", {
//         message: "Please select a payment type.",
//       }),
//   // Payment_Type: z.enum(["Cash", "Cheque", "Neft"]).default("Cash"),
//   Reference_Number: z
//   .string()
//   .trim()
//   .optional()
//   .or(z.literal("")),

//   // Stock_Quantity: digitsOnly("Stock_Quantity"),

//   items: z
//     .array(
//       z.object({
          
//         Item_Name: z.string().min(1, "Item name is required"),
//         //  Item_HSN: z.string().min(4, "HSN Code is required") max(8, "HSN Code must be at most 20 characters"),.
//         // Item_HSN: z.string()
//         //     // 1. Enforce length (4 to 8 characters)
//         //     .min(4, "HSN Code must be at least 4 digits.")
//         //     .max(8, "HSN Code must be at most 8 digits.")
//         //     // 2. Enforce only digits (0-9)
//         //     .regex(HSN_REGEX, "HSN Code must contain only digits (0-9)."),
//        Item_HSN: z.preprocess((val) => {
//   if (val === undefined || val === null) return "";
//   return String(val).trim();
// }, 
// z.string()
//   .min(4, "HSN Code must be at least 4 digits.")
//   .max(8, "HSN Code must be at most 8 digits.")
//   .regex(/^\d+$/, "HSN Code must contain only digits (0-9).")
// ),
 

//           Quantity: z.preprocess(
//   (val) => {
//     if (val === "" || val === undefined || val === null) return undefined;
//     return Number(val);
//   },
//   z
//     .number({
//       required_error: "Quantity is required",
//       invalid_type_error: "Quantity must be a number",
//     })
//     .min(1, "Quantity must be greater than zero")
// ),


//         Item_Unit: z.string().min(1, "Unit is required"),
        
//              Purchase_Price: digitsOnly("Purchase_Price", true).refine(
//           (num) => num === undefined || num >= 1,
//           { message: "Purchase Price must be  greater than 0" }
//         ),
      
//         Discount_On_Purchase_Price: digitsOnly("Discount_On_Purchase_Price", false).optional(),
//         Discount_Type_On_Purchase_Price: z.enum(["Percentage", "Amount"]).optional(),
//         Tax_Type: z.string().min(1, "Tax_Type is required").optional().default("None"), // ✅ no need to validate enum, UI ensures correctness
//         Tax_Amount: digitsOnly("Tax_Amount", false),
//         Amount: digitsOnly("Amount", false),
//       })
//     )
//     .nonempty("At least one item must be added"),
// });
import { z } from "zod";

const digitsOnly = (field, required = true) =>
  z.union([z.string(), z.number()])
    .transform((val) => String(val ?? "").trim())
    .refine((v) => (required ? v !== "" : true), {
      message: `${field} is required`,
    })
    .refine((v) => v === "" || /^\d+(\.\d{1,2})?$/.test(v), {
      message: `${field} must be a valid number`,
    })
    .transform((v) => (v === "" ? 0 : Number(v)));

export const purchaseFormSchema = z.object({
  Party_Name: z.string().min(1, "Party_Name is required"),

  GSTIN: z.preprocess(
    (v) => (v === undefined || v === null ? "" : String(v)),
    z.string().refine((v) => v.length === 0 || v.length === 15, {
      message: "GSTIN must be exactly 15 characters",
    })
  ),

  Bill_Number: z.string().min(1, "Bill_Number is required"),

  Bill_Date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Bill_Date must be a valid date",
  }),

  State_Of_Supply: z.string().min(1, "State_Of_Supply is required"),

  // Total_Amount: digitsOnly("Total_Amount"),
  // Balance_Due: digitsOnly("Balance_Due"),
Total_Amount: digitsOnly("Total_Amount", true),
 Balance_Due: digitsOnly("Balance_Due", true),
  Total_Paid: z.string().optional().or(digitsOnly("Total_Paid", false)),
  // Total_Paid: z.string().optional().or(digitsOnly("Total_Paid", false)),

    // Payment_Type: z
    //   .enum(["Cash", "Cheque", "Neft"])
    //   .or(z.literal(""))
    //   .refine((v) => v !== "", {
    //     message: "Please select a payment type.",
    //   }),
 Payment_Type: z.enum(["Cash", "Cheque", "Neft"]).default("Cash"),
  // Reference_Number: z.string().optional().or(z.literal("")),
Reference_Number: z.preprocess(
  (v) => (v === null || v === undefined ? "" : String(v)),  
  z.string()
).optional(),

  items: z
    .array(
      z.object({
        Item_Name: z.string().min(1, "Item name is required"),

        // Item_HSN: z.preprocess(
        //   (v) => (v === undefined || v === null ? "" : String(v).trim()),
        //   z
        //     .string()
        //     .min(4, "HSN Code must be at least 4 digits.")
        //     .max(8, "HSN Code must be at most 8 digits.")
        //     .regex(/^\d+$/, "HSN Code must contain only digits")
        // ),

        Quantity: z.preprocess(
          (v) => Number(v),
          z.number().min(1, "Quantity must be greater than zero")
        ),

        Item_Unit: z.string().min(1, "Unit is required"),

        Purchase_Price: digitsOnly("Purchase_Price"),

        Discount_On_Purchase_Price: digitsOnly(
          "Discount_On_Purchase_Price",
          false
        ).optional(),

        Discount_Type_On_Purchase_Price: z.enum(["Percentage", "Amount"]).optional(),

        Tax_Type: z.string().min(1, "Tax Type is required"),

        Tax_Amount: digitsOnly("Tax_Amount", false),

        Amount: digitsOnly("Amount", false),
      })
    )
    .nonempty("At least one item must be added"),
});
