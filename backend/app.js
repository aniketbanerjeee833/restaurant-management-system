
import errorHandler from "./middleware/errorHandler.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import partyRoutes from "./routes/partyRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

import purchaseRoutes from "./routes/purchaseRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import tableRoutes from "./routes/tableRoutes.js";
import foodRoutes from "./routes/foodItemRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";

import orderRoutes from "./routes/Staff/orderItemRoutes.js"
import "dotenv/config";
import express from "express";

import cors from "cors";
import helmet from "helmet";  
import cookieParser from "cookie-parser";

import { clearExpiredLoginAttempts, clearExpiredSessions } from "./utils/cronJobs.js";
import path from "path";







const app = express();
app.use(express.json());

const isProduction=false
// app.use(helmet());
if (isProduction) {
  console.log("🚀 Running Helmet in PRODUCTION mode with strict CSP");

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: [
            "'self'",
            "data:",
            "blob:",
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com",
            "https://ancoinnovation.com",
          ],
          connectSrc: [
            "'self'",
            "https://cdn.jsdelivr.net",
            "https://ancoinnovation.com",
          ],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
      noSniff: true,
    })
  );
} else {
  console.log("🧩 Running Helmet in DEVELOPMENT mode (relaxed CSP)");

  // More permissive CSP for Vite dev
  app.use(
    helmet({
      contentSecurityPolicy: false, // disable CSP locally
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginEmbedderPolicy: false,
      noSniff: true,
    })
  );
}
app.use(cookieParser());
// app.use(cors({
//   origin: process.env.CLIENT_URL, // allow requests from 'http://localhost:5173','http://localhost:5174'
//   methods: ['GET', 'POST',"PUT","DELETE","PATCH",'OPTIONS'],  // your React app port
//   credentials: true                // allow cookies
// }));
const allowedOrigins = [
  process.env.CLIENT_URL,               // e.g. http://localhost:5173
  "http://localhost:5174",              // second allowed origin

];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/api/user",userRoutes)
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/party", partyRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/sale", saleRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/food-item",foodRoutes)

app.use("/api/table", tableRoutes);
app.use("/api/material", materialRoutes);

app.use("/api/staff/order",orderRoutes)

app.use(errorHandler)
const PORT = process.env.PORT || 4000;
clearExpiredSessions();
clearExpiredLoginAttempts();

app.listen(PORT, (err) => {
  if (err) {
    logger.error(`❌ Failed to start server on port ${PORT}`, err);
    process.exit(1);
  } else {
    console.log(`Server running on port ${PORT}`); // optional plain console
  }
});



