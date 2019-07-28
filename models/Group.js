import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date
  },
  modifiedAt: {
    type: Date
  },
  name: {
    type: String,
  },
  blacklist: {
    type: Array // of member IDs
  },
  items: {
    type: Array // of note IDs (or other things maybe)
  },
  options: {
    type: Object // other things like color, position, width/height
  }
});

const Group = mongoose.model('Group', groupSchema);

export default Group;