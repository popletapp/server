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
  type: {
    type: Number // 0 = freeplace, 1 = grid
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
  noteCount: {
    type: Number
  },
  groups: {
    type: Array // of group IDs
  },
  ranks: {
    type: Array // of rank *objects*
    // The default rank will have the same ID as the board ID
  },
  labels: {
    type: Array // of label objects
  },
  whitelist: {
    type: Array // of user IDs or null if no whitelist
  },
  owner: {
    type: String // user ID of owner
  },
  chatrooms: {
    type: Array
  },
  compact: {
    type: Boolean
  },
  autoResize: { // whether or not notes/groups should automatically resize to comfortably take up space or if the user needs to manually resize components
    type: Boolean
  }
});

const Board = mongoose.model('Board', boardSchema);

export default Board;