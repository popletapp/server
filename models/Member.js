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
  const member = await this.findOne({ board, id }, { _id: 0, __v: 0});
  if (!member) {
    return null;
  }
  const user = await User.get(id);
  return Object.assign({}, user._doc, member._doc)
};

const Member = mongoose.model('Member', memberSchema);

export default Member;