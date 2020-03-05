import models from '../models';
import { generateID } from '../util';
import { Board } from '.';

async function create (obj) {
  if (!obj.boardID) {
    throw new Error('A board ID needs to be provided in the request body');
  }
  const board = await Board.get(obj.boardID);
  if (!board) {
    throw new Error('Couldn\'t find a board under that board ID, make sure the board exists and is valid');
  }

  const id = generateID();
  const log = {
    id,
    boardID: obj.boardID,
    type: obj.type,
    executor: obj.executor,
    before: obj.before || null,
    after: obj.after || null,
    timestamp: obj.timestamp || Date.now(),
    reason: obj.reason || null
  };

  const dbAL = new models.ActionLog(log);
  await dbAL.save();
  
  return log;
}

async function getMultiple (array) {
  return await models.ActionLog.find({ id: { $in: array } }, { _id: 0, __v: 0 });
}

async function get (boardID, type, limit = 10, skip = 0) {
  limit = Math.min(limit, 100);
  return await models.ActionLog.find(type ? { boardID, type } : { boardID }, { _id: 0, __v: 0 }).sort({ 'timestamp': -1 }).skip(skip).limit(limit);
}

export default {
  create,
  getMultiple,
  get
}