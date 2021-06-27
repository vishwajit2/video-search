const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get("/", auth, async (req, res) => {
  try {
    console.log(req.user);
    return res.status(200).json(req.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/register", (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      return res.status(400).send("All input is required");
    }
    // check if user already exist
    User.findOne({ email }).then((oldUser) => {
      if (oldUser) {
        return res.status(409).send("User Already Exist. Please Login");
      }
      const newUser = new User({
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: password,
      });
      newUser.save().then((user) => {
        // Create token
        jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          },
          (err, token) => {
            user.token = token;
            console.log(user);

            return res.json({
              success: true,
              token: token,
            });
          }
        );
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(409).json("could not create user");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    // Validate user input
    if (!(email && password)) {
      return res.status(400).send("All input is required");
    }
    User.findOne({ email }).then((user) => {
      if (!user) {
        return res.status(404).json({ emailnotfound: "Email not found" });
      }
      bcrypt.compare(password, user.password).then((isMatch) => {
        // Create token
        if (isMatch) {
          jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            },
            (err, token) => {
              return res.json({
                success: true,
                token: token,
              });
            }
          );
        } else {
          return res.status(400).send("Invalid Credentials");
        }
      });
    });
  } catch (err) {
    console.log(err);
    res.status(400).send("Invalid Credentials");
  }
});

module.exports = router;
