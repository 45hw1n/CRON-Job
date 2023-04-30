const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  slug: {
    type: String,
  },
  created: {
    type: String,
  },
  updated: {
    type: String,
  },
  title: {
    type: String,
  },
  body: {
    type: String,
  },
  views: {
    type: Number,
  },
  tags: {
    type: [String],
  },
});

const blogModel =  mongoose.model("blogSchema", blogSchema)

module.exports = blogModel;