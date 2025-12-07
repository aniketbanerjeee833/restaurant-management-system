import { NavLink, useNavigate } from "react-router-dom";

import "./Login.css"
import { useState } from "react";


import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useLoginUserMutation } from "../../../redux/api/userApi";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {loginSchema} from "../../../schema/userFormSchema"
import {setUser, setUserId} from "../../../redux/reducer/userReducer";

export default function Login() {
const dispatch = useDispatch();
  // const [username, setUsername] = useState('');
  // const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  //const[loggedInLoading, setLoggedInLoading] = useState(false);
  //const [error, setError] = useState('');
  //const [blockedUntil, setBlockedUntil] = useState(null); // timestamp until which login is blocked
 //const {  loggedIn } = useSelector((state) => state.user);
const [countdownLeft, setCountdownLeft] = useState(0);
const[duplicateLoginError,setDuplicateLoginError]=useState("");


 const [loginUser, { isLoading }] = useLoginUserMutation();


const [blockedUntil, setBlockedUntil] = useState(null);
const[blockedUntilReadable, setBlockedUntilReadable] = useState(null);
const [error, setError] = useState("");

  const {
    
      register,
      handleSubmit,

      watch,
      
      formState: { errors },
    } = useForm({
      resolver: zodResolver(loginSchema),
    
  
    })
const formValues = watch();
const onSubmit = async (data) => {
 
  setError("");
  const { username, password } = data;
  console.log("Logging in with:", { username, password });

  try {
    const response = await loginUser({ username, password }).unwrap();
    console.log("Login Response:", response);
    // if (response.success) {
    //   toast.success(response.message || "Login successful");
     
    //   // dispatch(setUserRole(response?.user?.role));
    //   // dispatch(setUserId(response?.user?.User_Id));
   
    //    window.location.href = "/home";
    // } else {
     
    //   toast.error(response.message || "Login failed");
    // }
  if (response.success) {

  toast.success("Login successful");
  dispatch(setUser(response?.user));
    
  dispatch(setUserId(response?.user?.User_Id));  // ✅ FIXED
  if(response?.user?.role === "staff"){
    window.location.href = "/staff/orders/all-orders";
  } else {
    window.location.href = "/home";
  }
}
  } catch (err) {
    console.error("Login error:", err);

    // 🔒 1️⃣ Rate limit (too many attempts)
    if (err.status === 429 && err.data?.blockedUntil) {
      const blockedTime = err.data.blockedUntil;
      setBlockedUntil(blockedTime);
      setBlockedUntilReadable(err.data.blockedUntilReadable);

      const localTime = new Date(blockedTime).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      });

      toast.error(
        `Too many login attempts. Please try again at ${localTime} (in about ${Math.ceil(
          (blockedTime - Date.now()) / 60000
        )} minutes).`
      );
    }

    // 🚫 2️⃣ Already logged in on another device
    else if (err.status === 403) {
      toast.error(
        "You are already logged in on another device. Please log out from that device first.",
        { duration: 6000 }
      );

      // 🧠 Optional: show a clear visual warning near the form
      setDuplicateLoginError(
        "You’re already logged in on another device. Please log out there or wait until your session expires."
      );

      // Optionally, open a dialog to explain or refresh session
      // setShowLogoutDialog(true);
    }

    // ⚠️ 3️⃣ General error handler
    else {
      toast.error(err?.data?.message || "Something went wrong. Please try again.");
      setError(err.data?.message || "Something went wrong");
    }
  }
};






const timeLeft =
  blockedUntil && blockedUntil > Date.now()
    ? Math.ceil((blockedUntil - Date.now()) / 1000)
    : 0;

// 🕐 Countdown timer state (re-renders every second)
useEffect(() => {
  const saved = localStorage.getItem("blockedUntil");
  if (saved && Number(saved) > Date.now()) {
    setBlockedUntil(Number(saved));
  }
}, []);

// 🧠 Save blockedUntil whenever it changes
useEffect(() => {
  if (blockedUntil) {
    localStorage.setItem("blockedUntil", blockedUntil);
  } else {
    localStorage.removeItem("blockedUntil");
  }
}, [blockedUntil]);

// 🕐 Countdown updater (ticks every second)
useEffect(() => {
  if (!blockedUntil) return;

  const timer = setInterval(() => {
    const remaining = Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000));
    setCountdownLeft(remaining);

    if (remaining <= 0) {
      clearInterval(timer);
      setBlockedUntil(null);
    }
  }, 1000);

  return () => clearInterval(timer);
}, [blockedUntil]);

// 🕓 Convert to readable local time (India)
const localTime =
  blockedUntil && blockedUntil > Date.now()
    ? new Date(blockedUntil).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Kolkata",
      })
    : null;


    console.log(blockedUntil, timeLeft, localTime,formValues);
    return (
        <>
        <div className="body">
      <div className="container">
    <div className="image-side">
        <img src="/assets/images/bg-login.jpg"  style={{width:"100%", height:"100%"}} alt="Login Illustration" />
    </div>
    <div className="login-side">

    
    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
  {/* <h2>Admin Login</h2> */}
  <div className="flex flex-col mb-3 gap-3 justify-center items-center">
  <img src="/assets/images/techeasy_logo.png" className="w-50" alt="" />
    <h3>Admin Login</h3>
  {/* <p className="subtitle">Secure access to your accounting dashboard</p> */}
</div>
  {/* Username */}
  <div className="mb-3">
    <input
      type="text"
      placeholder="👤 Username"
      {...register("username")}
     
      // value={username}
      // onChange={(e) => setUsername(e.target.value)}
      style={{
        width: "92%",
        padding: "7px",
        fontSize: "16px",
        borderRadius: "6px",
        border: "1px solid #ccc",
      }}
    />
    {errors.username && (
      <p className="error-message ">{errors.username.message}</p>
    )}
  </div>

  {/* Password */}
  <div className="mb-3">
    <input
      type={showPassword ? "text" : "password"}
      placeholder="🔒 Password"
      {...register("password")}
   
      // value={password}
      // onChange={(e) => setPassword(e.target.value)}
      style={{
        width: "92%",
        padding: "7px",
        fontSize: "16px",
        borderRadius: "6px",
        border: "1px solid #ccc",
      }}
    />
        {errors.password && (
      <p className="error-message ">{errors.password.message}</p>
    )}
</div>
    {/* Show Password below input, side-by-side checkbox + text */}
    <div
  style={{
    display: "flex",
    alignItems: "center", // ✅ keeps checkbox & label perfectly centered vertically
    gap: "8px", // ✅ consistent spacing between checkbox & text
    marginTop: "8px",
    flexWrap: "wrap", // ✅ ensures responsiveness on smaller screens
  }}
>
  <input
    type="checkbox"
    id="showPassword"
    checked={showPassword}
    onChange={() => setShowPassword(!showPassword)}
    style={{
      width: "16px",
      height: "16px",
      cursor: "pointer",
      flexShrink: 0, // ✅ prevents checkbox from shrinking on small screens
       // ✅ (optional) gives your theme color to checkbox
    }}
  />
  <label
    htmlFor="showPassword"
    style={{
      position: "relative",
    bottom: "6px", // ✅ nudges label down to align with checkbox
      fontSize: "14px",
      color: "#333",
      cursor: "pointer",
     // ✅ aligns label perfectly with checkbox
      userSelect: "none", // ✅ avoids accidental text selection
      lineHeight: "1.5", // ✅ perfect alignment visually
    }}
  >
    Show Password
  </label>
</div>

  {/* Submit Button */}
<button
  type="submit"
  disabled={isLoading || duplicateLoginError || countdownLeft > 0}
  // className="login-btn"
  style={{
    backgroundColor: countdownLeft > 0 || isLoading || duplicateLoginError ? "#ccc" : "#4CA1AF",
    color: countdownLeft > 0 || isLoading || duplicateLoginError ? "#444" : "#fff",
    cursor: countdownLeft > 0 || isLoading || duplicateLoginError ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
  }}
>
  {countdownLeft > 0 ? (
    <>
      🔒 Please wait{" "}
      <strong>
        {String(Math.floor(countdownLeft / 60)).padStart(2, "0")}m{" "}
        {String(countdownLeft % 60).padStart(2, "0")}s
      </strong>
      <br />
      <small
        style={{
          fontSize: "13px",
          display: "block",
          marginTop: "3px",
          color: "#333",
        }}
      >
        You can try again at{" "}
        <strong style={{ color: "#000" }}>{localTime}</strong>
      </small>
    </>
  ) : isLoading ? (
    "Logging in..."
  ) : (
    "Login"
  )}
</button>
{duplicateLoginError && (
  <div
    style={{
      color: "#b91c1c",
      backgroundColor: "#fee2e2",
      border: "1px solid #fca5a5",
      borderRadius: "6px",
      padding: "8px 12px",
      marginTop: "10px",
      fontSize: "14px",
    }}
  >
    ⚠️ {duplicateLoginError}
  </div>
)}
   <div className="bottom-text flex justify-center items-center">
          <p>Designed & Developed by @ 
            <NavLink to="https://techpromind.com/"
          className="color: #4CA1AF"
           target="_blank">Techpromind
           </NavLink>
           </p>
        </div>

</form>

    </div>
    </div>
   </div>
    </>
    )
  
}