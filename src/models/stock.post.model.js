const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  stockSymbol: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: [String],
  likesCount: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // Reference to comments
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
