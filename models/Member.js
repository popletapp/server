import mongoose from 'mongoose';
import User from './../funcs/User';

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

memberSchema.statics.findByBoard = async function (board, id) {
  const member = await this.findOne({ board, id });
  Object.assign(await User.get(id), member)
};

const Member = mongoose.model('Member', memberSchema);

export default Member;