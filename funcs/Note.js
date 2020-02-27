import models from './../models';
import { generateID } from '../util';
import { Board } from './';

async function create (obj) {
  const id = generateID();
  const note = {
    id,
    title: obj.title || null,
    content: obj.content || null,
    createdAt: new Date().toISOString(),
    createdBy: obj.user,
    modifiedAt: new Date().toISOString(),
    modifiedBy: obj.user,
    labels: [],
    assignees: [],
    position: obj.position || { x: 0, y: 0 },
    size: obj.size || { width: 200, height: 100 },
    options: obj.options || {}
  };

  const dbNote = new models.Note(note);
  await dbNote.save();

  if (!obj.boardID) {
    throw new Error('A board ID needs to be provided in the request body');
  }
  try {
    await models.Board.updateOne({ id: obj.boardID }, {
      $push: {
        notes: id
      }
    });
  } catch (e) {
    throw new Error('Error whilst trying to apply note to board, make sure the board exists and is valid.');
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

async function update (obj, boardID) {
  const oldNote = this.get(obj.id);
  if (!oldNote) return null;
  const comparisonNote = {
    ...oldNote,
    title: obj.title,
    content: obj.content,
    labels: obj.labels,
    assignees: obj.assignees,
    position: obj.position,
    size: obj.size,
    options: obj.options
  };
  const newNote = {
    ...oldNote,
    ...comparisonNote,
    modifiedAt: new Date().toISOString(),
    modifiedBy: obj.user,
  };

  const ELIGIBLE_PERMISSIONS = ['MANAGE_NOTES'];
  // Only allow people with MOVE_NOTES to move the note if note is the same except position change
  if (deepEqual(oldNote, comparisonNote)) {
    ELIGIBLE_PERMISSIONS.push('MOVE_NOTES');
  }
  const authorized = await Board.authorize(boardID, obj.user.id, ELIGIBLE_PERMISSIONS);
  if (authorized) {
    await models.Note.updateOne({ id: obj.id }, newNote);
    return newNote;
  } else {
    return null;
  }
}

async function del (id) {
  return await models.Note.deleteOne({ id });
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