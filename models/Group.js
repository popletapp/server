import mongoose from 'mongoose';

/*
PermissionOverrideType (Number)
0 = USER, 1 = RANK, 2 = INVITE (members invited through a specific invite)
*/

const groupSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date
  },
  createdBy: {
    type: Object
  },
  modifiedAt: {
    type: Date
  },
  name: {
    type: String,
  },
  type: {
    type: Number
  },
  permissionOverrides: {
    type: Array // array of objects { id: String, type: PermissionOverrideType, bitfield: Number }
  },
  items: {
    type: Array // of note IDs (or other things maybe)
  },
  position: {
    type: Object // x, y
  },
  size: {
    type: Object // width, height
  },
  options: {
    type: Object // compact, autoResize
  }
});

const Group = mongoose.model('Group', groupSchema);

export default Group;