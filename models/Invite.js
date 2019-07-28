import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true
  },
  board: {
    type: String // board ID
  },
  createdAt: {
    type: Date
  },
  createdBy: {
    type: String // user ID
  },
  whitelistedMembers: {
    type: Array // array of user IDs or null for no whitelist
  },
  expiresAt: {
    type: Date // or null if infinite
  }
});

const Invite = mongoose.model('Invite', inviteSchema);

export default Invite;