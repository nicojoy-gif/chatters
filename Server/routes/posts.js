const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

// API endpoint to search posts by tag
router.get("/search", async (req, res) => {
  const tag = req.query.tag;

  try {
    // Find posts that have a tag matching the provided value (case-insensitive)
    const matchingPosts = await Post.find({
      tags: { $regex: new RegExp(tag, "i") },
    });

    res.json(matchingPosts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while searching for posts." });
  }
});

//create post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});
//update post

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("updated post");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//delete post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("deleted post");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//comment

router.post("/:id/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const newComment = {
      text: req.body.text,
      userId: req.body.userId,
    };

    post.comment.push(newComment);
    await post.save();

    res
      .status(200)
      .json({ message: "Comment posted successfully", comment: newComment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//get post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});
//get posts
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map(async (friendId) => {
        const friend = await User.findById(friendId);
        return Post.find({ userId: friend._id });
      })
    );
    const timelinePosts = userPosts.concat(...friendPosts);

    res.status(200).json(timelinePosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//get all posts

//recent
router.get("/recent/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id })
      .sort({ createdAt: "desc" })
      .limit(3);
    const friendPosts = await Promise.all(
      currentUser.followings.map(async (friendId) => {
        const friend = await User.findById(friendId);
        return Post.find({ userId: friend._id });
      })
    );
    const timelinePosts = userPosts.concat(...friendPosts);

    res.status(200).json(timelinePosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res, next) => {
  // sort from the latest to the earliest
  const posts = await Post.find().sort({ createdAt: "desc" });
  return res.status(200).json({
    statusCode: 200,
    message: "Fetched all posts",
    data: { posts },
  });
});

//get one post

router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

//featured
router.get("/featured", async (req, res) => {
  try {
    const featuredPost = await Post.findOne({ isFeatured: true });
    if (featuredPost) {
      res.status(200).json(featuredPost);
    } else {
      res.status(404).json({ message: "Featured post not found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Assuming you have already set up your server and imported the necessary dependencies

// Assuming you have already set up your server and imported the necessary dependencies

// GET route for retrieving all comments
router.get("/:id/comments", async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comments = post.comment;
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get views
router.put("/:id/view", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.view.includes(req.body.userId)) {
      await post.updateOne({ $push: { view: req.body.userId } });
      res.status(200).json("Post has been viewed");
    } else {
      res.status(200).json("User has already viewed the post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//post data
router.post("/submitFormData", async (req, res) => {
  const formData = req.body;

  try {
    // Save the form data to the database using your Mongoose model
    const savedFormData = await new FormData(formData);
    console.log("Form data saved:", savedFormData);
    res.sendStatus(200);
  } catch (error) {
    console.error("Failed to save form data:", error);
    res.sendStatus(500);
  }
});

// Endpoint to fetch the submitted form data
router.get("/fetchSubmittedData", async (req, res) => {
  try {
    // Fetch the submitted form data from the database using your Mongoose model
    const submittedData = await FormData.find();
    res.json(submittedData);
  } catch (error) {
    console.error("Failed to fetch submitted form data:", error);
    res.sendStatus(500);
  }
});
//like post / dislike
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//get bookmarks

router.get("/:userId/bookmarks", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId).populate("bookmarks");
    const bookmarks = user.bookmarks;
    res.json({ bookmarks });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching bookmarks" });
  }
});

// API endpoint to add or remove a bookmarked post

router.post("/:id/bookmarks", async (req, res) => {
  const postId = req.params.id;
  const userId = req.body.userId; // Extract userId from the request body or session

  try {
    const existingUser = await User.findById(userId);

    if (existingUser) {
      const bookmarkIndex = existingUser.bookmarks.indexOf(postId);

      if (bookmarkIndex === -1) {
        // If the post is not bookmarked, add it to user's bookmarks
        existingUser.bookmarks.push(postId);
        await existingUser.save();

        const bookmarks = existingUser.bookmarks;
        res.json({ message: "Post added to bookmarks", bookmarks });
        console.log(bookmarks);
      } else {
        // If the post is already bookmarked, remove it from user's bookmarks
        existingUser.bookmarks.splice(bookmarkIndex, 1);
        await existingUser.save();

        const bookmarks = existingUser.bookmarks;
        res.json({ message: "Post removed from bookmarks", bookmarks });
        console.log(bookmarks);
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error adding/removing bookmark" });
  }
});

//get post based on tags

module.exports = router;
