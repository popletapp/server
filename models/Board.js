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
    type: Array // of user IDs
  },
  notes: {
    type: Array // of note IDs (even if they're inside of a group - this will be handled on the web app)
  },
  groups: {
    type: Array // of group IDs
  },
  ranks: {
    type: Array // of rank *objects*
    // The default rank will have the same ID as the board ID
  },
  chatrooms: {
    type: Array
  }
});

const Board = mongoose.model('Board', boardSchema);

export default Board;