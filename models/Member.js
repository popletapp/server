import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  id: {
    type: String
  },
  board: {
    type: String // board ID
  },
  joinedAt: {
    type: Date
  },
  nickname: {
    type: String
  },
  ranks: {
    type: Array // of rank IDs
  }
});

memberSchema.statics.findByBoard = async function (board, id) { await this.findOne({ board, id }) };

const Member = mongoose.model('Member', memberSchema);

export default Member;