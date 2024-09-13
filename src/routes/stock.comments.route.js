const {Router} = require("express");
const Post = require("../models/stock.post.model");
const Comment = require("../models/stock.comments.model");
const authenticateToken = require("../middlewares/authenticateToken");

const commentRouter = Router();
//1. Add a Comment to a Post - POST
commentRouter.post("/posts/:postId/comments", authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { comment } = req.body;
  const userId = req.user.id; // Assuming user ID is stored in JWT payload

  try {
    // Find the post
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Create the new comment
    const newComment = new Comment({ userId, postId, comment });
    await newComment.save();

    // Add comment ID to the post
    post.comments.push(newComment._id);
    await post.save();

    res.status(200).json({
      success: true,
      commentId: newComment._id,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ success: false, message: "Failed to add comment" });
  }
});

//2. Delete a Comment - DELETE
commentRouter.delete("/posts/:postId/comments/:commentId", authenticateToken, async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    // Find and delete the comment
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    // Check if the comment belongs to the user (optional)
    // if (comment.userId.toString() !== req.user.id) {
    //   return res.status(403).json({ success: false, message: "Forbidden" });
    // }

    await Comment.findByIdAndDelete(commentId);

    // Remove the comment ID from the post's comments array
    await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } });

    res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ success: false, message: "Failed to delete comment" });
  }
});

module.exports = commentRouter