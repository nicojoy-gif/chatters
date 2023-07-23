const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const profileRoute = require("./routes/profile");
const User = require("./models/User");
const bodyParser = require("body-parser");

// Load environment variables from .env file
dotenv.config();

// Allowed origins for CORS
const allowedOrigins = ["https://chatter-seven-rust.vercel.app", "https://chatterapp-gilt.vercel.app", "http://localhost:3000"];

// CORS options with custom origin check
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS with custom options
app.use(helmet()); // Helmet for security headers
app.use(morgan("common")); // Morgan for request logging
app.use(express.json()); // Parse JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded requests

// Set Cross-Origin-Resource-Policy header based on origin
app.use(function(req, res, next) {
  const origin = req.get("origin");
  if (allowedOrigins.indexOf(origin) !== -1) {
    // Set same-site policy if the request origin is in allowedOrigins
    res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  } else {
    // Set cross-origin policy for other origins
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  }
  next();
});

// Serve static images from the "public/images" directory
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "/public/images"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// File upload route
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploaded");
  } catch (err) {
    console.log(err);
    // You might want to send an error response here if the upload fails
    res.status(500).json("File upload failed");
  }
});

app.put('/:id', upload.single('profilePicture'), async (req, res) => {
 
  if (req.file) {
    // Handle profile picture update
    const profilePicturePath = req.file.path;

    try {
      // Update the user's profile picture in the database
      await User.findByIdAndUpdate(req.params.id, {
        $set: { profilePicture: profilePicturePath },
      });

      res.status(200).json('Profile picture has been updated');
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(400).json('No profile picture file provided');
  }

});

// Welcome route
app.get("/", (req, res) => {
  res.send("Welcome to the Chatter API");
});

// Routes
app.use("/api/profile", profileRoute);
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`));
