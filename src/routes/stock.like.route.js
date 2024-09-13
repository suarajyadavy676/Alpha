const {Router} = require("express");
const Post = require("../models/stock.post.model");
const authenticateToken = require("../middlewares/authenticateToken");

const likeRouter = Router();

// Middleware to authenticate JWT token
likeRouter.use(authenticateToken);

//1. Like a Post - POST
likeRouter.post("/:postId/like", async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id; // Assuming user ID is stored in JWT payload

  try {
    // Find the post
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Check if the user has already liked the post
    if (post.likes.includes(userId)) {
      return res.status(400).json({ success: false, message: "Post already liked" });
    }

    // Add user's ID to the likes array
    post.likes.push(userId);
    await post.save();

    res.status(200).json({ success: true, message: 'Post liked' });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ success: false, message: "Failed to like post" });
  }
});

//2. Unlike a Post - DELETE /
// Unlike a post
likeRouter.delete("/:postId/like", async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id; // Assuming user ID is stored in JWT payload

  try {
    // Find the post
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Check if the user has liked the post
    if (!post.likes.includes(userId)) {
      return res.status(400).json({ success: false, message: "Post not liked" });
    }

    // Remove user's ID from the likes array
    post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    await post.save();

    res.status(200).json({ success: true, message: 'Post unliked' });
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({ success: false, message: "Failed to unlike post" });
  }
});

module.exports = likeRouter