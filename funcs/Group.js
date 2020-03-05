import models from './../models';
import { generateID } from '../util';
import ActionLog from './../funcs/ActionLog.js';
import ActionTypes from './../constants/ActionTypes';

async function create (boardID, obj, requesterID) {
  if (!boardID) {
    throw new Error('Board ID is not valid');
  }

  const id = generateID();
  const group = {
    id,
    name: obj.name || null,
    type: 0,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    blacklist: [], // user IDs or rank IDs
    items: [],
    position: obj.position || { x: 0, y: 0 },
    size: obj.size || { width: 150, height: 200 },
    options: obj.options || {}
  };

  const dbGroup = new models.Group(group);
  await dbGroup.save();
  try {
    await models.Board.updateOne({ id: boardID }, {
      $push: {
        groups: id
      }
    }).then(() => {
      ActionLog.create({
        boardID,
        type: ActionTypes.CREATE_GROUP,
        executor: requesterID,
        before: null,
        after: group
      });
    });
  } catch (e) {
    throw new Error('Error whilst trying to apply note to board, make sure the board exists and is valid.');
  }
  return group;
}

async function update (boardID, obj, requesterID) {
  const original = await this.get(obj.id);
  const group = {
    id: obj.id,
    name: obj.name || null,
    type: obj.type || 0,
    modifiedAt: Date.now(),
    blacklist: obj.blacklist,
    items: obj.items,
    position: obj.position,
    size: obj.size,
    options: obj.options
  };
  await models.Group.updateOne({ id: obj.id }, group).then(() => {
    ActionLog.create({
      boardID,
      type: ActionTypes.CREATE_GROUP,
      executor: requesterID,
      before: original,
      after: group
    });
  });
  return group;
}

async function getMultiple (array) {
  return await models.Group.find({ id: { $in: array } }, { _id: 0, __v: 0 });
}

async function get (id) {
  return await models.Group.findOne({ id }, { _id: 0, __v: 0 });
}

async function del (boardID, id, requesterID) {
  const group = await this.get(id);
  await models.Group.deleteOne({ id }, { _id: 0, __v: 0 }).then(() => {
    ActionLog.create({
      boardID,
      type: ActionTypes.CREATE_GROUP,
      executor: requesterID,
      before: group,
      after: null
    });
  });
  return true;
}

export default {
  create,
  update,
  getMultiple,
  get,
  del
}