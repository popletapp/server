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
  lastMessage: { // last message (the actual comment object) as well as the timestamp
    type: Object
  },
  messages: {
    type: Array // Array of objects
  }
});

const Chatroom = mongoose.model('Chatroom', chatroomSchema);

export default Chatroom;