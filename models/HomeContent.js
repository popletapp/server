import mongoose from 'mongoose';

const homeContentSchema = new mongoose.Schema({
  id: {
    unique: true,
    required: true,
    type: String
  },
  user: {
    type: String, // user id
    required: true
  },
  type: {
    type: String
  },
  value: {
    type: Object // must contain at least one of { text, user, note, board, invite }
  },
  timestamp: {
    type: Date
  }
});

const HomeContent = mongoose.model('HomeContent', homeContentSchema);

export default HomeContent;