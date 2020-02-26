import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  author: {
    type: Object
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true
  },
  modifiedAt: {
    type: Date
  },
  type: {
    type: Number // 1 for change log, 2 for general post, 3 for misc
  }
});

const BlogPost = mongoose.model('BlogPost', postSchema);

export default BlogPost;