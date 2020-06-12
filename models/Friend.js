import mongoose from 'mongoose';

const friendSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  friendId: {
    type: String,
    required: true
  },
  note: {
    type: String
  },
  pending: {
    type: Boolean
  },
  addedAt: {
    type: Date
  },
  favorited: {
    type: Boolean
  }
});

const Friend = mongoose.model('Friend', friendSchema);

export default Friend;