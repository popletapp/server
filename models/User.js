import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date
  },
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  avatar: {
    type: String
  },
  hash: {
    type: String,
    required: true
  },
  status: {
    type: String
  },
  theme: {
    type: Number,
    required: true
  },
  compact: {
    type: Boolean,
    required: true
  },
  lang: {
    type: String,
    required: true
  },
  bot: {
    type: Boolean
  },
  badges: {
    type: Number,
    required: true
  }
});

userSchema.statics.findByLogin = async function (login) {
  let user = await this.findOne({ username: login });
  if (!user) {
    user = await this.findOne({ email: login });
  }
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;