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

const bodyParser = require("body-parser");


const allowedOrigins = ["https://chatter-seven-rust.vercel.app/", "https://chatterapp-gilt.vercel.app/", "http://localhost:3000"]; // Add more origins if needed.

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};


app.use(cors(corsOptions));
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "/public/images"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploaded");
  } catch (err) {
    console.log(err);
  }
});
app.get('/', (req,res) => {
  res.send('welcome')
})
app.use("/api/profile", profileRoute);
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
dotenv.config();
mongoose.connect(process.env.MONGO_URL);
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`));
