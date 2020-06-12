import mongoose from 'mongoose';

const notecmtSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  note: {
    type: String // note ID
  },
  author: {
    type: Object,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true
  }
});

const NoteComment = mongoose.model('NoteComment', notecmtSchema);

export default NoteComment;