import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    unique: true,
  },
  userId: {
    type: String,
    unique: true
  }
});

const Token = mongoose.model('Token', tokenSchema);

export default Token;