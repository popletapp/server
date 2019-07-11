import mongoose from 'mongoose';

const chtcmtSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  chatroom: {
    type: String // chatroom ID
  },
  author: {
    type: Object,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true
  }
});

const ChatroomComment = mongoose.model('ChatroomComment', chtcmtSchema);

export default ChatroomComment;