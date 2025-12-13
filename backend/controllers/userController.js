import bcrypt from "bcrypt";

import db from "../config/db.js";
import crypto from "crypto";
import { sanitizeObject } from "../utils/sanitizeInput.js";
import { loginSchema, registerSchema } from "../validators/userSchema.js";

const MAX_ATTEMPTS = 3;
const BLOCK_DURATION_MINUTES = 1;


// ⚙️ Manually toggle for local or cPanel deployment
const isProduction = false;

console.log("Environment - isProduction:", isProduction);
const cleanValue = (value) => {
  if (value === undefined || value === null || value === "" || value === " ") {
    return null; // store as NULL in DB
  }
  return value.trim();
};
/* ==========================================================================
   REGISTER USER
   ========================================================================== */
// const registerUser = async (req, res, next) => {
//   try {
//     // 🧼 1️⃣ Sanitize the request body
//     const cleanData = sanitizeObject(req.body);

//     // ✅ 2️⃣ Validate request body
//     const parsed = registerSchema.safeParse(cleanData);
//     if (!parsed.success) {
//       const errors = parsed.error.errors.map((e) => e.message);
//       return res.status(400).json({ success: false, errors });
//     }

//     const { name, phone, email, username, password, address, pincode, city, role } = parsed.data;

//     //  Check if any users exist
//     const [users] = await db.query(`SELECT * FROM users`);
//     console.log("Existing users count:", users.length);

//     let adminId = null; // default

//     // ✅ CASE 1: First-ever registration (no users yet)
//     if (users.length === 0) {
//       console.log("🟢 First user registration — creating verified admin...");
//       adminId = null; // or NULL (no parent admin)
//     }
//     // ✅ CASE 2: Admin registering other users
//     else {
//       adminId = req.user.User_Id;
//       if (!adminId) {
//         return res.status(403).json({
//           success: false,
//           message: "Only an admin can register new users.",
//         });
//       }

//       // Ensure admin exists and is valid
//       const [adminCheck] = await db.query(
//         `SELECT * FROM users WHERE id = ? AND role = 'admin'`,
//         [adminId]
//       );
//       if (adminCheck.length === 0) {
//         return res.status(403).json({
//           success: false,
//           message: "Invalid admin credentials.",
//         });
//       }
//     }

//     //  Prevent multiple verified admins
//     if (role === "admin") {
//       const [existingAdmin] = await db.query(`SELECT * FROM users WHERE role = 'admin'`);
//       if (existingAdmin.length > 0) {
//         return res.status(400).json({
//           success: false,
//           message: "An admin already exists for this company.",
//         });
//       }
//     }

//     //  Check duplicates
//     const [existing] = await db.query(
//       `SELECT * FROM users WHERE email = ? OR phone = ? OR username = ?`,
//       [email, phone, username]
//     );
//     if (existing.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists (duplicate email, phone or username).",
//       });
//     }

//     //  Generate custom User_Id like USR001, USR002...
//     const [last] = await db.query(`SELECT User_Id FROM users ORDER BY id DESC LIMIT 1`);
//     let userId = "USR001";
//     if (last.length > 0) {
//       const num = parseInt(last[0].User_Id.replace("USR", "")) + 1;
//       userId = "USR" + num.toString().padStart(3, "0");
//     }

//     //  Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     //  Insert into database
//     const [result] = await db.query(
//       `INSERT INTO users 
//        (User_Id, name, phone, email, username, password, address, pincode, city, admin_id, role, created_at, updated_at)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//       [userId, name, phone, email, username, hashedPassword, address, cleanValue(pincode), 
//         cleanValue(city), 
//         cleanValue(adminId), role || "user"]
//     );

//     // 🎯 8️⃣ Response
//     return res.status(201).json({
//       success: true,
//       message:
//         users.length === 0
//           ? "Admin registered successfully (verified admin created)."
//           : "User registered successfully under admin.",
//       userId,
//       dbId: result.insertId,
//       role: role || "user",
//     });
//   } catch (err) {
//     console.error("Register Error:", err);
//      next(err);
//   }
// };
// const registerUser = async (req, res, next) => {
//   let connection;
//   try {
//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     console.log("Auth middleware - user ID:", req.user.User_Id);
//     // ⛔ Make sure req.user exists (userAuth middleware must run)
//     if (!req.user || !req.user.User_Id) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized. Please login again.",
//       });
//     }

//     const { User_Id } = req.user;
//     console.log("Auth middleware - user ID:", User_Id);
//     // Check if logged-in user is admin
//     const [users] = await connection.query(
//       `SELECT * FROM users WHERE User_Id=?`,
//       [User_Id]
//     );

//     if (users.length === 0 || users[0].role !== "admin") {
//       return res.status(403).json({
//         success: false,
//         message: "Only an admin can register new users.",
//       });
//     }

//     // Sanitize + validate inputs
//     const cleanData = sanitizeObject(req.body);
//     const parsed = registerSchema.safeParse(cleanData);

//     if (!parsed.success) {
//       const errors = parsed.error.errors.map((e) => e.message);
//       return res.status(400).json({ success: false, errors });
//     }

//     const { name, phone, email, username, password, address, pincode, city, role } =
//       parsed.data;

//     // Check duplicates: email OR phone OR username
//     const [existing] = await connection.query(
//       `SELECT * FROM users WHERE email = ? OR phone = ? OR username = ?`,
//       [email, phone, username]
//     );

//     if (existing.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists (duplicate email, phone or username).",
//       });
//     }

//     // Generate User_Id incrementally
//     const [last] = await connection.query(
//       `SELECT User_Id FROM users ORDER BY id DESC LIMIT 1`
//     );

//     let userId = "USR001";
//     if (last.length > 0) {
//       const num = parseInt(last[0].User_Id.replace("USR", ""), 10) + 1;
//       userId = "USR" + num.toString().padStart(3, "0");
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const cleanValue = (v) =>
//       v !== undefined && v !== null && String(v).trim() !== "" ? v : null;

//     // Insert new user
//     const [result] = await connection.query(
//       `INSERT INTO users 
//        (User_Id, name, phone, email, username, password, address, pincode, city, admin_id, role, created_at, updated_at)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//       [
//         userId,
//         name,
//         phone,
//         email,
//         username,
//         hashedPassword,
//         address,
//         cleanValue(pincode),
//         cleanValue(city),
//         User_Id, // admin_id → originally created by which admin
//         "staff",
//       ]
//     );

//     await connection.commit();

//     return res.status(201).json({
//       success: true,
//       message: "User registered successfully.",
//       userId,
//       dbId: result.insertId,
//       role: role || "user",
//     });
//   } catch (err) {
//     if (connection) await connection.rollback();
//     console.error("Register Error:", err);
//     next(err);
//   } finally {
//     if (connection) connection.release();
//   }
// };
const registerUser = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // ===============================
    // 🔐 AUTH CHECK
    // ===============================
    if (!req.user || !req.user.User_Id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const adminId = req.user.User_Id;

    const [adminRows] = await connection.query(
      `SELECT role FROM users WHERE User_Id = ?`,
      [adminId]
    );

    if (!adminRows.length || adminRows[0].role !== "admin") {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: "Only admin can register users",
      });
    }

    // ===============================
    // 🧼 SANITIZE & VALIDATE
    // ===============================
    const cleanData = sanitizeObject(req.body);
    const parsed = registerSchema.safeParse(cleanData);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.errors.map(e => e.message),
      });
    }

    const {
      name,
      phone,
      email,
      username,
      password,
      address,
      pincode,
      city,
      role,
      categories = [],
    } = parsed.data;

    // ===============================
    // 🔁 DUPLICATE CHECK
    // ===============================
    const [existing] = await connection.query(
      `SELECT id FROM users 
       WHERE email = ? OR phone = ? OR username = ?`,
      [email, phone, username]
    );

    if (existing.length) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // ===============================
    // 🆔 GENERATE USER ID
    // ===============================
    const [lastUser] = await connection.query(
      `SELECT User_Id FROM users ORDER BY id DESC LIMIT 1`
    );

    let userId = "USR001";
    if (lastUser.length) {
      const num = parseInt(lastUser[0].User_Id.replace("USR", ""), 10) + 1;
      userId = "USR" + String(num).padStart(3, "0");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ===============================
    // 👤 INSERT USER
    // ===============================
    await connection.query(
      `INSERT INTO users
       (User_Id, name, phone, email, username, password,
        address, pincode, city, admin_id, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        name,
        phone,
        email,
        username,
        hashedPassword,
        address || null,
        pincode || null,
        city || null,
        adminId,
        role,
      ]
    );

    // ===============================
    // 🍳 KITCHEN STAFF CATEGORY LOGIC
    // ===============================
    if (role === "kitchen-staff") {

      if (!Array.isArray(categories) || categories.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "Kitchen staff must have at least one category",
        });
      }

      // ✅ Validate categories
      const [validCats] = await connection.query(
        `SELECT Item_Category 
         FROM add_category 
         WHERE Item_Category IN (?)`,
        [categories]
      );

      if (validCats.length !== categories.length) {
        const found = validCats.map(c => c.Item_Category);
        const missing = categories.filter(c => !found.includes(c));

        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Invalid categories: ${missing.join(", ")}`,
        });
      }

      // 🆔 Generate Staff_Category_Id
      const [lastCat] = await connection.query(
        `SELECT Staff_Category_Id 
         FROM kitchen_staff_categories 
         ORDER BY id DESC LIMIT 1`
      );

      let staffCategoryId = "KSC001";
      if (lastCat.length) {
        const num = parseInt(
          lastCat[0].Staff_Category_Id.replace("KSC", ""),
          10
        ) + 1;
        staffCategoryId = "KSC" + String(num).padStart(5, "0");
      }

      // 📌 Insert category mapping
      await connection.query(
        `INSERT INTO kitchen_staff_categories
         (Staff_Category_Id, User_Id, Category_Names, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())`,
        [
          staffCategoryId,
          userId,
          categories.join(","), // 👈 IMPORTANT
        ]
      );
    }

    // ===============================
    // ✅ COMMIT
    // ===============================
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      User_Id: userId,
      role,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Register Error:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

/* ========================================================================== 
   LOGIN USER 
   ========================================================================== */


const recordFailedAttempt = async (userId, ip) => {
  const effectiveUserId = userId || "UNKNOWN";
  const now = Date.now();
  const indiaOffset = 5.5 * 60 * 60 * 1000;

  //  Try to find user-specific attempt first
  const [userRows] = await db.query(
    `SELECT * FROM login_attempts WHERE User_Id = ? LIMIT 1`,
    [effectiveUserId]
  );

  //  If not found, check IP-based attempt
  let record = userRows[0];
  if (!record) {
    const [ipRows] = await db.query(
      `SELECT * FROM login_attempts WHERE ip_address = ? LIMIT 1`,
      [ip]
    );
    record = ipRows[0];
  }

  //  3 First failed attempt — insert new
  if (!record) {
    await db.query(
      `INSERT INTO login_attempts (User_Id, ip_address, attempt_count, last_attempt)
       VALUES (?, ?, 1, NOW())`,
      [effectiveUserId, ip]
    );

    const [[newRow]] = await db.query(
      `SELECT * FROM login_attempts WHERE User_Id = ? OR ip_address = ? LIMIT 1`,
      [effectiveUserId, ip]
    );
    return newRow;
  }

  //  Increment attempt count
  const newCount = record.attempt_count + 1;
  const blockedUntilMs =
    newCount >= MAX_ATTEMPTS ? now + BLOCK_DURATION_MINUTES * 60 * 1000 : record.blocked_until_ms;
  const blockedUntil =
    newCount >= MAX_ATTEMPTS
      ? new Date(blockedUntilMs + indiaOffset).toISOString().slice(0, 19).replace("T", " ")
      : record.blocked_until;

  //  Update row
  await db.query(
    `UPDATE login_attempts 
     SET attempt_count = ?, last_attempt = NOW(),
         blocked_until = ?, blocked_until_ms = ?
     WHERE id = ?`,
    [newCount, blockedUntil, blockedUntilMs, record.id]
  );

  //  Fetch & return latest record
  const [[updatedRow]] = await db.query(
    `SELECT * FROM login_attempts WHERE id = ?`,
    [record.id]
  );

  return updatedRow;
};

const cleanupExpiredAttempts = async () => {
  const now = Date.now();

  //  Delete all attempts that expired more than a minute ago
  await db.query(
    `DELETE FROM login_attempts 
     WHERE blocked_until_ms IS NOT NULL 
     AND blocked_until_ms < ?`,
    [now]
  );

  // Optionally, also clear IP-only or "UNKNOWN" users after expiry
  await db.query(
    `DELETE FROM login_attempts 
     WHERE User_Id = 'UNKNOWN' 
     AND blocked_until_ms IS NOT NULL 
     AND blocked_until_ms < ?`,
    [now]
  );
};

const loginUser = async (req, res, next) => {
  try {
     const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    await cleanupExpiredAttempts(); // cleanup old login attempts first
    const cleanData = sanitizeObject(req.body);
    const parsed = loginSchema.safeParse(cleanData);

    if (!parsed.success) {
      const errors = parsed.error?.errors?.map((e) => e.message) || ["Invalid input"];
      return res.status(400).json({ success: false, errors });
    }

    const { username, password } = parsed.data;
    //const ip = req.ip;

    // 🔹 1️⃣ Find user
    const [users] = await db.query(`SELECT * FROM users WHERE username = ?`, [username]);
    const user = users[0];

    // ❌ Invalid username
    if (!user || user.username !== username) {
      const attempt = await recordFailedAttempt(null, ip);
      if (attempt?.blocked_until_ms && attempt.blocked_until_ms > Date.now()) {
        const remaining = Math.ceil((attempt.blocked_until_ms - Date.now()) / 60000);
        return res.status(429).json({
          success: false,
          message: `Too many login attempts. Please try again after ${remaining} minutes.`,
          blockedUntil: attempt.blocked_until_ms,
          blockedUntilReadable: attempt.blocked_until,
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid username",
        attempt,
      });
    }

    // 🔹 2️⃣ Check if user is blocked
    const [attemptRows] = await db.query(
      `SELECT * FROM login_attempts WHERE User_Id = ? OR ip_address = ? LIMIT 1`,
      [user.User_Id, ip]
    );

    const attempt = attemptRows[0];
    const now = Date.now();

    if (attempt && attempt.blocked_until_ms && attempt.blocked_until_ms > now) {
      const remaining = Math.ceil((attempt.blocked_until_ms - now) / 60000);
      return res.status(429).json({
        success: false,
        message: `Too many login attempts. Please try again after ${remaining} minutes.`,
        blockedUntil: attempt.blocked_until_ms,
        blockedUntilReadable: attempt.blocked_until,
      });
    }


  await db.query(`DELETE FROM sessions WHERE User_Id = ? AND expires_at <= NOW()`, [user.User_Id]);

    // 🔹 4️⃣ Check if any active session still exists
    const [existingSessions] = await db.query(
      `SELECT * FROM sessions WHERE User_Id = ? AND expires_at > NOW()`,
      [user.User_Id]
    );

    if (existingSessions.length > 0) {
      return res.status(403).json({
        success: false,
        message:
          "You are already logged in on another device. Please log out there to continue.",
      });
    }

    // 🔹 Validate password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const attempt = await recordFailedAttempt(user.User_Id, ip);
      if (attempt?.blocked_until_ms && attempt.blocked_until_ms > Date.now()) {
        const remaining = Math.ceil((attempt.blocked_until_ms - Date.now()) / 60000);
        return res.status(429).json({
          success: false,
          message: `Too many login attempts. Please try again after ${remaining} minutes.`,
          blockedUntil: attempt.blocked_until_ms,
          blockedUntilReadable: attempt.blocked_until,
        });
      }

      return res.status(401).json({ success: false, message: "Invalid password", attempt });
    }

    // 🔹  Success — clear failed attempts
await db.query(
  `DELETE FROM login_attempts 
   WHERE User_Id = ? 
   OR (User_Id = 'UNKNOWN' AND ip_address = ?)`,
  [user.User_Id, ip]
);
const userAgent = req.headers["user-agent"];
console.log(userAgent);
    // 🔹  Create new session
    const sessionId = crypto.randomBytes(32).toString("hex");
    await db.query(
      `INSERT INTO sessions (Session_Id, User_Id, created_at, expires_at)
       VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY))`,
      [sessionId, user.User_Id]
    );

    // 🔹  Set secure cookie
    res.cookie("session_id", sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "Lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
        ...(isProduction && { domain: ".ancoinnovation.com" }),
    });

    // 🔹 Respond success
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        User_Id: user.User_Id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
   next(err);
  }
};



 

const getUser = async (req, res, next) => {
  try {
    const sessionId = req.cookies.session_id;
    if (!sessionId) {
      return res.json({ authenticated: false, user: null });
    }

    const [rows] = await db.query(
      `SELECT us.User_Id, u.User_Id, u.name, u.email, u.username, u.role
       FROM sessions us
       JOIN users u ON us.User_Id = u.User_Id
       WHERE us.session_id = ? AND us.expires_at > NOW()`,
      [sessionId]
    );

    if (rows.length === 0) {
      return res.json({ authenticated: false, user: null });
    }

    return res.json({
      authenticated: true,
      success: true,
      user: rows[0],
    });
  } catch (err) {
    console.error("GetUser error:", err);
    next(err);
  }
};

   //LOGOUT USER

const logoutUser = async (req, res,next) => {
  try {
    const sessionId = req.cookies.session_id;
    if (sessionId) {
      await db.query(`DELETE FROM sessions WHERE Session_Id = ?`, [sessionId]);
    }

    res.clearCookie("session_id", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      path: "/",
      ...(isProduction && { domain: ".ancoinnovation.com" }),
    });

    return res.status(200).json({ success: true, message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
 next(err);
  
  }
};



export { registerUser, loginUser, getUser, logoutUser };