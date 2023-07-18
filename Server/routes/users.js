const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/'); // Specify the directory where uploaded files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Generate a unique filename
  },
});

// Create multer instance with the configured storage
const upload = multer({ storage });
//update user

router.put('/:id', upload.single('profilePicture'), async (req, res) => {
 
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

//get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList);
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  const userId = req.params.id;
  const { userId: requestUserId, isAdmin } = req.body;

  if (requestUserId === userId || isAdmin) {
    try {
      const user = await User.findByIdAndDelete(userId);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account");
  }
});
//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});
//follow user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you alrady follow");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cannot follow yourself");
  }
});

//unfollow user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you alrady unfollow");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cannot unfollow yourself");
  }
});

//update user profile
router.put("/profile", async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      occupation,
      city,
      country,
      email,
      github,
      phone,
      username,
    } = req.body;
    await User.findByIdAndUpdate(userId, {
      fullName,
      occupation,
      city,
      phone,
      username,
      email,
      github,
      country,
    });
    res.sendStatus(200);
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
