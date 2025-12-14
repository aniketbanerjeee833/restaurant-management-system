const kitchenStaffAuth = (req, res, next) => {
 
  if (req.user.role !== "kitchen-staff") {
 
    return res.status(403).json({ success: false, message: "Kitchen staff access required" });
  }

  // Attach adminId for convenience
  req.kitchenStaffId = req.user.id;
  req.categories=req.user.categories
  // console.log("Admin authenticated:", req.user.username);

  next();
};
    export default kitchenStaffAuth;