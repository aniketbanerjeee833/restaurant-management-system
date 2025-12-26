// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // Ensure folder exists
// const uploadDir = "./uploads/food-item";
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// // 🔥 Persistent counter for current request
// let fileIndex = 0;

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         fileIndex = 0; // reset counter for each new request
//         cb(null, uploadDir);
//     },

//     filename: (req, file, cb) => {
//         try {
//             const parsed = JSON.parse(req.body.items);
//             const items = parsed.items;

//             // Get name using the correct index
//             const name =
//                 items[fileIndex]?.Item_Name?.replace(/\s+/g, "_") || "item";

//             const ext = path.extname(file.originalname);
//             const filename = `${name}_${Date.now()}${ext}`;

//             fileIndex++; // increment for next image

//             cb(null, filename);
//         } catch (err) {
//             cb(
//                 null,
//                 `unknown_${Date.now()}${path.extname(file.originalname)}`
//             );
//         }
//     },
// });

// // File filter
// function fileFilter(req, file, cb) {
//     const allowed = /jpeg|jpg|png|webp/;
//     const ok =
//         allowed.test(file.mimetype) &&
//         allowed.test(path.extname(file.originalname).toLowerCase());

//     ok ? cb(null, true) : cb(new Error("Only image files allowed"));
// }

// export const foodUpload = multer({
//     storage,
//     fileFilter,
//     limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB
// });
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "./uploads/food-item";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

let fileIndex = 0;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fileIndex = 0;
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        try {
            // ----------------------
            // ADD MODE
            // ----------------------
            if (req.body.items) {
                const parsed = JSON.parse(req.body.items);
                const items = parsed.items;

                const name =
                    items[fileIndex]?.Item_Name?.replace(/\s+/g, "_") || "";

                const ext = path.extname(file.originalname);
                const filename = `${name}_${Date.now()}${ext}`;

                fileIndex++;
                return cb(null, filename);
            }

            // ----------------------
            // EDIT MODE (single image)
            // ----------------------
            const safeName =
                (req.body.Item_Name || "").replace(/\s+/g, "_");
            const ext = path.extname(file.originalname);

            return cb(null, `${safeName}_${Date.now()}${ext}`);
        } catch (err) {
            return cb(
                null,
                `unknown_${Date.now()}${path.extname(file.originalname)}`
            );
        }
    },
});

function fileFilter(req, file, cb) {
    const allowed = /jpeg|jpg|png|webp/;
    const ok =
        allowed.test(file.mimetype) &&
        allowed.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error("Only image files allowed"));
}

export const foodUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
