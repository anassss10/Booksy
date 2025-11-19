const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./userAuth");

// Allowed roles
const VALID_ROLES = ["user", "admin"];

// signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, address, role, mobile } = req.body;

    // Validate Username
    if (!username || username.length < 4) {
      return res.status(400).json({ message: "Username must be at least 4 characters long" });
    }

    // Check Username Duplication
    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Check Email Duplication
    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Validate Password
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Validate Mobile Number
    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({ message: "Mobile number must be exactly 10 digits" });
    }

    // Check Duplicate Mobile Number
    const existingMobile = await User.findOne({ mobile: mobile });
    if (existingMobile) {
      return res.status(400).json({ message: "Mobile number already exists" });
    }

    // Validate role
    let roleToSave = "user";
    if (role) {
      if (typeof role !== "string" || !VALID_ROLES.includes(role.toLowerCase())) {
        return res.status(400).json({
          message: `Role must be one of: ${VALID_ROLES.join(", ")}`
        });
      }
      roleToSave = role.toLowerCase();
    }

    // Encrypt Password
    const hashPass = await bcrypt.hash(password, 10);

    // Create New User
    const newUser = new User({
      username,
      email,
      password: hashPass,
      address,
      mobile,
      role: roleToSave,
    });

    // Save to Database
    await newUser.save();
    console.log("Signup request body:", req.body);

    return res.status(201).json({ message: "User created successfully" });

  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: error.message });
  }
});

// signin
router.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Request Body:", req.body);

    const existingUser = await User.findOne({ username });
    console.log("Found User:", existingUser);

    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    bcrypt.compare(password, existingUser.password, (err, same) => {
      if (err) {
        console.error("Signin Error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (same) {
        // Normalize role to string if stored otherwise
        const userRole =
          Array.isArray(existingUser.role) && existingUser.role.length > 0
            ? existingUser.role[0]
            : existingUser.role || "user";

        const authPayload = {
          id: existingUser._id,
          name: existingUser.username,
          role: userRole,
        };

        const token = jwt.sign(authPayload, "bookStore123", {
          expiresIn: "30d",
        });

        return res.status(200).json({
          id: existingUser._id,
          role: userRole,
          token,
        });
      } else {
        return res.status(400).json({ message: "Invalid password" });
      }
    });
  } catch (error) {
    console.error("Signin Error:", error);
    return res.status(500).json({ message: error.message });
  }
});

// get user info
router.get("/getuserinfo", authenticateToken, async (req, res) => {
  try {
    // Prefer header id (your current flow) but fallback to req.user.id if authenticateToken set it
    const id = req.headers.id || req.user?.id;
    if (!id) return res.status(400).json({ message: "User id not provided" });

    const data = await User.findById(id).select("-password");
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("GetUserInfo Error:", error);
    return res.status(500).json({ message: error.message });
  }
});

// update address
router.put("/updateaddress", authenticateToken, async (req, res) => {
  try {
    const id = req.headers.id || req.user?.id;
    const { address } = req.body;
    if (!id) return res.status(400).json({ message: "User id not provided" });
    if (!address) return res.status(400).json({ message: "Address is required" });

    await User.findByIdAndUpdate(id, { address: address });
    return res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    console.error("UpdateAddress Error:", error);
    return res.status(500).json({ message: error.message });
  }
});

router.put("/updatemobile", async (req, res) => {
  try {
    const userId = req.headers.id;
    const { mobile } = req.body;

    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({ message: "Mobile number must be exactly 10 digits" });
    }

    const existing = await User.findOne({ mobile });
    if (existing) {
      return res.status(400).json({ message: "Mobile number already in use" });
    }

    await User.findByIdAndUpdate(userId, { mobile });

    return res.status(200).json({ message: "Mobile number updated successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
