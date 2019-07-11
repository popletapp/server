import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema({
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
  }
});

const Invite = mongoose.model('Invite', inviteSchema);

export default Invite;