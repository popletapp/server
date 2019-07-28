import mongoose from 'mongoose';

const chatroomSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  members: {
    type: Object
  },
  board: {
    type: String // board ID
  },
  blacklist: {
    type: Array // of IDs (ranks, users)
  },
  lastMessage: { // last message (the actual comment object) as well as the timestamp
    type: Object
  }
});

const Chatroom = mongoose.model('Chatroom', chatroomSchema);

export default Chatroom;