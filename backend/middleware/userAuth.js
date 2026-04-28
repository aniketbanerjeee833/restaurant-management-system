
import db from "../config/db.js";


// Promise-based version of userAuth middleware
const userAuth = async (req, res, next) => {
  try {
    const sessionId = req.cookies.session_id;
    // console.log("Auth middleware - checking session:", sessionId);

    if (!sessionId) {
      console.log("No session ID provided");
  
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    

    // ✅ Using mysql2/promise (if your db connection is mysql2)
    const [results] = await db.query(
        `
        SELECT 
          us.User_Id, 
        
          u.User_Id,            -- custom ID like USR002
          u.name, 
          u.email, 
          u.username, 
          u.role
          
        FROM sessions us
        JOIN users u ON us.User_Id = u.User_Id
        WHERE us.Session_Id = ? 
          AND us.expires_at > NOW()
      `,
        [sessionId]
      );

    if (results.length === 0) {
      console.log("Invalid or expired session");
      
      return res.status(401).json({ success: false, message: "Invalid session or you are logged in on another device" });
    }
const [activeSessions] = await db.query(
  "SELECT COUNT(*) AS cnt FROM sessions WHERE User_Id = ? AND expires_at > NOW()",
  [results[0].User_Id]
);

if (activeSessions[0].cnt > 1) {
  console.warn(`⚠️ Multiple active sessions for user ${results[0].username}`);
  return res
    .status(403)
    .json({ success: false, message: "You are already logged in on another device. Please log out there to continue." });
}
    // ✅ Attach user details to request
     let categories = [];

    if (results[0].role === "kitchen-staff") {
      const [rows] = await db.query(
        `SELECT Category_Names
         FROM kitchen_staff_categories
         WHERE User_Id = ?`,
        [results[0].User_Id]
      );

      categories = rows.flatMap(r =>
        r.Category_Names
          ?.split(",")
          .map(c => c.trim())
      );
    }

    req.user = {
      User_Id: results[0].User_Id,
      name: results[0].name,
      email: results[0].email,
      username: results[0].username,
      role: results[0].role,
      categories
    };
    console.log(
      `✅ Authenticated user: ${req.user.username} (${req.user.User_Id}) | Role: ${req.user.role}`
    );

    next(); // Continue to controller

  } catch (err) {
    console.error("❌ Session validation error:", err);
  
 next(err);
  }
};

export default userAuth;
