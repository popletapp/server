import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date
  },
  name: {
    type: String,
  },
  avatar: {
    type: String,
  },
  members: {
    type: Array
  },
  notes: {
    type: Array
  },
  chatrooms: {
    type: Array
  }
});

const Board = mongoose.model('Board', boardSchema);

export default Board;