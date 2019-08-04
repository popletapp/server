import models from './../models';
import { generateID } from '../util';

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

async function update (obj) {
  const note = {
    id: obj.id,
    title: obj.title || null,
    content: obj.content || null,
    createdAt: obj.createdAt,
    createdBy: obj.createdBy,
    modifiedAt: new Date().toISOString(),
    modifiedBy: obj.user,
    labels: obj.labels || [],
    assignees: obj.assignees || [],
    position: obj.position,
    size: obj.size,
    options: obj.options || {}
  };
  await models.Note.updateOne({ id: obj.id }, note);
  return note;
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