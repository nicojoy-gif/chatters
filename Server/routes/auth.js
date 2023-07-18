const router = require("express").Router();
const User = require("../models/User");
const admin = require("firebase-admin");
const express = require('express');
const session = require('express-session');
const app = express();


router.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);
const serviceaccount = require("../serviceAccountKey.json"); // get json file from firebase console
admin.initializeApp({
  projectId: serviceaccount.project_id,
  credential: admin.credential.cert(serviceaccount),
  serviceAccountId: serviceaccount.client_email, //Tt is used for creating firebase auth credentials
});
const auth = admin.auth();

router.post("/register", async (req, res) => {
  try {
    const hashedPassword = req.body.password
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      fullname: req.body.fullname,
      occupation: req.body.occupation,
      password: hashedPassword,
    });
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//check username
router.get("/register/:username", async (req, res) => {
  const { username } = req.params;

  try {
    // Perform a database query to check if the username exists
    const user = await User.findOne({ userName: username });
    const isAvailable = !user;

    res.json({ available: isAvailable });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
//login

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json("User not found");
    }

    // Replace "plaintextPassword" with the actual plaintext password provided by the user.
    const plaintextPassword = req.body.password;

    // Compare the plaintextPassword with the stored password (hashed value).
    if (user.password !== plaintextPassword) {
      return res.status(400).json("Wrong password");
    }

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json("Server error");
  }
});

router.post('/logout', (req, res) => {
  // Perform the logout action here
  // For example, you can clear the session or perform any other necessary tasks

  // Assuming you are using session-based authentication, you can destroy the session to log out the user
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});




module.exports = router;
