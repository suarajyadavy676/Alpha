const {Router} = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const Post = require("../models/stock.post.model");
const Comment = require("../models/stock.comments.model");
const stockPostRouter = Router();


// Stock Posts Management:

//1. Create a Stock Post - POST
stockPostRouter.post("/", authenticateToken, async (req, res) => {
  const { stockSymbol, title, description, tags } = req.body;

  try {
    // Get user id from the authenticated user
    const userId = req.user.id;

    // Create a new post
    const newPost = await Stock.create({
      stockSymbol,
      title,
      description,
      tags,
      userId, // Link the post to the authenticated user
    });

    // Respond with success and post ID
    res.status(201).json({
      success: true,
      postId: newPost._id, // Return the post's ID
      message: "Post created successfully",
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ success: false, message: "Post creation failed" });
  }
});

//2. Get all stock posts with optional filters and sorting
stockPostRouter.get("/", async (req, res) => {
  const { stockSymbol, tags, sortBy } = req.query;

  try {
    // Create a filter object
    let filters = {};
    
    // Add stockSymbol filter if provided
    if (stockSymbol) {
      filters.stockSymbol = stockSymbol;
    }

    // Add tags filter if provided (assuming tags is a comma-separated string)
    if (tags) {
      const tagsArray = tags.split(","); // Convert the string to an array
      filters.tags = { $in: tagsArray }; // Filter posts that contain any of the provided tags
    }

    // Sorting logic
    let sortOptions = {};
    if (sortBy === "likes") {
      sortOptions.likesCount = -1; // Sort by likesCount in descending order
    } else {
      sortOptions.createdAt = -1; // Default to sorting by date (createdAt) in descending order
    }

    // Fetch filtered and sorted posts
    const posts = await Post.find(filters)
      .sort(sortOptions) // Apply sorting
      .select("stockSymbol title description likesCount createdAt"); // Only return the selected fields

    // Map the posts to the response format
    const postList = posts.map((post) => ({
      postId: post._id,
      stockSymbol: post.stockSymbol,
      title: post.title,
      description: post.description,
      likesCount: post.likesCount || 0, // Default likesCount to 0 if not present
      createdAt: post.createdAt,
    }));

    // Send the response
    res.status(200).json(postList);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
});

//3. Get a single stock post with comments
stockPostRouter.get("/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    // Find the post by postId
    const post = await Post.findById(postId)
      .populate({
        path: 'comments', // Populate comments
        select: 'userId comment createdAt', // Only include these fields in comments
      })
      .select('stockSymbol title description likesCount'); // Only include these fields in the post

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Map comments to the response format
    const comments = post.comments.map(comment => ({
      commentId: comment._id,
      userId: comment.userId,
      comment: comment.comment,
      createdAt: comment.createdAt,
    }));

    // Respond with post details and comments
    res.status(200).json({
      postId: post._id,
      stockSymbol: post.stockSymbol,
      title: post.title,
      description: post.description,
      likesCount: post.likesCount || 0,
      comments: comments,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Failed to fetch post" });
  }
});

//4. Delete a Stock Post - DELETE
// Delete a stock post by postId
stockPostRouter.delete("/:postId", authenticateToken, async (req, res) => {
  const { postId } = req.params;

  try {
    // Find the post by postId
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Optional: Check if the user has permission to delete this post
    // if (post.userId.toString() !== req.user.id) {
    //   return res.status(403).json({ success: false, message: "Forbidden" });
    // }

    // Delete associated comments (if necessary)
    await Comment.deleteMany({ _id: { $in: post.comments } });

    // Delete the post
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ success: false, message: "Failed to delete post" });
  }
});


module.exports = stockPostRouter