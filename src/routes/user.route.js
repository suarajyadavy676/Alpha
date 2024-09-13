const { Router } = require("express");
const userRouter = Router();
const bcrypt = require("bcrypt");
const User = require("../models/user.model");

// User registration
userRouter.post("/register", async (req, res) => {
  try {
    let { username, email, password } = req.body;

    // Log the password for debugging
    console.log("Password:", password);

    // Check if all fields are provided
    if (!username || !email || !password) {
      return res.status(400).send("All fields are required");
    }

    // Check if email already exists
    let userEmail = await User.findOne({ email });
    if (userEmail) {
      return res.status(400).send("Email already exists");
    }

    // Hash the password
    bcrypt.hash(password, 10, async function (err, hash) {
      if (err) {
        console.error("Error in bcrypt hashing:", err); // Log bcrypt error
        return res.status(500).send("Error in hashing password");
      }

      // Create a new user
      try {
        await User.create({ username, email, password: hash });
        res.status(200).send("User registered successfully");
      } catch (err) {
        console.error("Error saving user to database:", err);
        res.status(500).send("Error saving user to database");
      }
    });
  } catch (error) {
    console.error("Error in user registration:", error);
    res.status(500).send("Registration failed"); // Generic error message
  }
});

module.exports = userRouter;
