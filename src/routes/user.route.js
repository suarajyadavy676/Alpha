const { Router } = require("express");
const userRouter = Router();
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middlewares/authenticateToken");

// User registration
userRouter.post("/auth/register", async (req, res) => {
  try {
    let { username, email, password } = req.body;

    // Check if all fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if email already exists
    let userEmail = await User.findOne({ email });
    if (userEmail) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Hash the password
    bcrypt.hash(password, 10, async function (err, hash) {
      if (err) {
        console.error("Error in bcrypt hashing:", err);
        return res.status(500).json({ success: false, message: "Error in hashing password" });
      }

      // Create a new user
      try {
        const newUser = await User.create({ username, email, password: hash });
        
        // Respond with userId and success message
        res.status(200).json({
          success: true,
          message: "User registered successfully",
          userId: newUser._id
        });
      } catch (err) {
        console.error("Error saving user to database:", err);
        res.status(500).json({ success: false, message: "Error saving user to database" });
      }
    });
  } catch (error) {
    console.error("Error in user registration:", error);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

// login
userRouter.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Compare the entered password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expiry time
    });

    // Respond with the token and user details
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

//Get User Profile - GET
userRouter.get("/user/profile/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch user profile from the database by userId
    const user = await User.findById(userId, "username bio profilePicture"); // Only select specific fields

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with user profile data
    res.status(200).json({
      id: user._id,
      username: user.username,
      bio: user.bio,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

// Update user profile
userRouter.put("/user/profile", authenticateToken, async (req, res) => {
  const { username, bio, profilePicture } = req.body;
  
  try {
    // Get user id from the authenticated user
    const userId = req.user.id;

    // Find and update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, bio, profilePicture },
      { new: true } // This returns the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Respond with success message
    res.status(200).json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Profile update failed" });
  }
});


module.exports = userRouter;
