import models from './../models';
import { generateID } from '../util';

async function create (obj) {
  const id = generateID();
  const note = {
    id,
    title: obj.title || null,
    content: obj.content || null,
    createdAt: Date.now(),
    createdBy: obj.user,
    modifiedAt: Date.now(),
    modifiedBy: obj.user,
    labels: [],
    assignees: [],
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

async function update (obj) {
  return await models.Note.updateOne({ id: obj.id }, {
    id: obj.id,
    title: obj.title || null,
    content: obj.content || null,
    createdAt: obj.createdAt,
    createdBy: obj.createdBy,
    modifiedAt: Date.now(),
    modifiedBy: obj.user,
    labels: obj.labels || [],
    assignees: obj.assignees || [],
    options: obj.options || {}
  });
}

async function getMultiple (array) {
  return await models.Note.find({ id: { $in: array } });
}

async function get (id) {
  return await models.Note.findOne({ id });
}

export default {
  create,
  update,
  getMultiple,
  get
}