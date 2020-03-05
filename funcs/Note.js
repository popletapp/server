import models from './../models';
import { generateID } from '../util';
import { Board } from './';
import ActionLog from './../funcs/ActionLog.js';
import ActionTypes from './../constants/ActionTypes';

async function create (boardID, obj, requesterID) {
  if (!boardID) {
    throw new Error('Board ID is invalid');
  }
  const board = await Board.get(boardID);
  if (!board) {
    throw new Error('Couldn\'t find a board under that board ID, make sure the board exists and is valid');
  }
  const ref = board.notes.length ? (board.notes.map(n => n.reference).sort((a, b) => b - a)[0] || 0) + 1 : 1;
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
  await models.Note.deleteOne({ id }).then(() => {
    ActionLog.create({
      boardID,
      type: ActionTypes.CREATE_NOTE,
      executor: requesterID,
      before: note,
      after: null
    });
  });
  return true;
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
  get
}