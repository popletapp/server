import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  boardID: {
    type: String,
    required: true
  },
  type: {
    type: String, // ex. NOTE_UPDATE
    required: true
  },
  executor: {
    type: String // user id, if null no executor (may have been system)
  },
  before: {
    type: Object // before + after are objects with keys (value)
    // for example if NOTE_UPDATE, this would be { before: { content: '' } }
  },
  after: {
    type: Object // similar to before
  },
  timestamp: {
    type: Date,
    required: true
  },
  reason: {
    type: String
  }
});

const ActionLog = mongoose.model('ActionLog', logSchema);

export default ActionLog;