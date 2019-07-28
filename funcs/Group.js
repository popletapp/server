import models from './../models';
import { generateID } from '../util';

async function create (obj) {
  if (!obj.boardID) {
    throw new Error('A board ID needs to be provided in the request body');
  }

  const id = generateID();
  const group = {
    id,
    name: obj.name || null,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    blacklist: [], // user IDs or rank IDs
    items: [],
    options: obj.options || {}
  };

  const dbGroup = new models.Group(group);
  await dbGroup.save();
  try {
    await models.Board.updateOne({ id: obj.boardID }, {
      $push: {
        groups: id
      }
    });
  } catch (e) {
    throw new Error('Error whilst trying to apply note to board, make sure the board exists and is valid.');
  }
  return group;
}

async function update (obj) {
  const group = {
    id: obj.id,
    name: obj.name || null,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    blacklist: obj.blacklist,
    items: obj.items,
    options: obj.options
  };
  await models.Group.updateOne({ id: obj.id }, group);
  return group;
}

async function getMultiple (array) {
  return await models.Group.find({ id: { $in: array } }, { _id: 0, __v: 0 });
}

async function get (id) {
  return await models.Group.findOne({ id }, { _id: 0, __v: 0 });
}

export default {
  create,
  update,
  getMultiple,
  get
}