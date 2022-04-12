const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  keywords: { type: String, required: true },
  row: { type: Number, required: true },
  col: { type: Number, required: true },
  _id: { type: String, required: true },
  author: { type: String, required: true },
  col_title: { type: String, required: true },
  keys: [
    {
      type: String,
    },
  ],
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
