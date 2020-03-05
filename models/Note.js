import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  ref: {
    type: Number,
    unique: true
  },
  createdAt: {
    type: Date
  },
  modifiedAt: {
    type: Date
  },
  modifiedBy: {
    type: Object // User object, not ID
  },
  title: {
    type: String
  },
  content: {
    type: String
  },
  labels: {
    type: Array
  },
  assignees: {
    type: Array // Array of user objects
  },
  importance: {
    type: Number
  },
  dueDate: {
    type: Date
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


const Note = mongoose.model('Note', noteSchema);

export default Note;