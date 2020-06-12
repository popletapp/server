import models from './../models';
import { generateID } from '../util';
import { Board } from './';
import ActionLog from './../funcs/ActionLog.js';
import ActionTypes from './../constants/ActionTypes';
import HomeContentTypes from '../constants/HomeContentTypes';

async function create (boardID, obj, requesterID) {
  if (!boardID) {
    throw new Error('Board ID is invalid');
  }
  const board = await Board.get(boardID);
  if (!board) {
    throw new Error('Couldn\'t find a board under that board ID, make sure the board exists and is valid');
  }
  const ref = (board.noteCount || 0) + 1;
  const id = generateID();
  const note = {
    id,
    ref,
    title: obj.title || null,
    content: obj.content || null,
    createdAt: Date.now(),
    createdBy: obj.user,
    modifiedAt: Date.now(),
    modifiedBy: obj.user,
    labels: [],
    assignees: [],
    dueDate: null,
    position: obj.position || { x: 0, y: 0 },
    size: obj.size || { width: 200, height: 100 },
    options: obj.options || {}
  };

  const dbNote = new models.Note(note);
  await dbNote.save();
  
  try {
    await models.Board.updateOne({ id: boardID }, {
      $push: {
        notes: id
      },
      $inc: {
        noteCount: 1
      }
    }).then(() => {
      ActionLog.create({
        boardID,
        type: ActionTypes.CREATE_NOTE,
        executor: requesterID,
        before: null,
        after: note
      });
    });
  } catch (e) {
    throw new Error('Error whilst trying to apply note to board, make sure the board exists and is valid');
  }
  return note;
}

function deepEqual (x, y) {
  const ok = Object.keys, tx = typeof x, ty = typeof y;
  return x && y && tx === 'object' && tx === ty ? (
    ok(x).length === ok(y).length &&
      ok(x).every(key => key === 'position' ? true : (deepEqual(x[key], y[key]))
  )) : (x === y);
}

async function update (boardID, obj, requesterID) {
  return await this.get(obj.id).then(async (oldNote) => {
    if (!oldNote) return null;
    const newNote = {
      ...oldNote._doc,
      title: obj.title,
      content: obj.content,
      labels: obj.labels,
      assignees: obj.assignees,
      position: obj.position,
      size: obj.size,
      dueDate: obj.dueDate,
      options: obj.options,
      modifiedAt: Date.now(),
      modifiedBy: obj.user,
      options: obj.options
    };
    const ELIGIBLE_PERMISSIONS = ['MANAGE_NOTES'];
    // Only allow people with MOVE_NOTES to move the note if note is the same except position change
    if (deepEqual(oldNote, newNote)) {
      ELIGIBLE_PERMISSIONS.push('MOVE_NOTES');
    }
    if (oldNote.assignees.length !== newNote.assignees.length) {
      HomeContent.create({ user: friend, type: HomeContentTypes.ASSIGNED_TO_NOTE, value: { user: id } });
    }
    const authorized = await Board.authorize(boardID, obj.user.id, ELIGIBLE_PERMISSIONS);
    if (authorized) {
      // Would love to .then this but mongo has an internal cache 😔
      await ActionLog.create({
        boardID,
        type: ActionTypes.UPDATE_NOTE,
        executor: requesterID,
        before: oldNote,
        after: newNote
      });
      await models.Note.updateOne({ id: obj.id }, newNote);
      return newNote;
    } else {
      return null;
    }
  })
}

async function del (boardID, id, requesterID) {
  const note = await this.get(id);
  await models.NoteComment.deleteMany({ note: id });
  await models.Note.deleteOne({ id }).then(() => {
    ActionLog.create({
      boardID,
      type: ActionTypes.CREATE_NOTE,
      executor: requesterID,
      before: note,
      after: null
    });
  });
  await models.Board.updateOne({ id: boardID }, {
    $inc: { noteCount: -1 }
  })
  return true;
}

async function comment (boardID, obj, requesterID) {
  const comment = {
    id: generateID(),
    note: obj.note,
    timestamp: Date.now(),
    author: obj.author,
    content: obj.content
  };

  const dbComment = new models.NoteComment(comment);
  await dbComment.save().then(async () => {
    ActionLog.create({
      boardID,
      type: ActionTypes.CREATE_NOTE_COMMENT,
      executor: requesterID,
      before: null,
      after: comment
    });
  });
  return comment;
}

async function getComment (id) {
  return await models.NoteComment.findOne({ id });
}

async function getComments (id, limit = 20, position = 0) {
  if (limit > 50) {
    limit = 50;
  }
  if (limit < 2) {
    limit = 2;
  }
  console.log(await models.NoteComment.find({ note: id }))
  return await models.NoteComment.find({ note: id }).sort({ 'timestamp': -1 }).skip(position).limit(limit);
}

async function getMultiple (array) {
  return await models.Note.find({ id: { $in: array } }, { _id: 0, __v: 0 });
}

async function get (id) {
  return await models.Note.findOne({ id }, { _id: 0, __v: 0 });
}

export default {
  create,
  update,
  del,
  getMultiple,
  get,
  comment,
  getComment,
  getComments
}