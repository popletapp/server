import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  id: {
    unique: true,
    required: true,
    type: String
  },
  recipient: {
    type: String // user id
  },
  author: {
    type: String // user id or if null, sent by system
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  timestamp: {
    type: Date
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;