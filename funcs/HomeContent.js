import models from '../models';
import { generateID } from '../util';

async function create (obj) {
  const id = generateID();
  const content = {
    id,
    user: obj.user,
    type: obj.type,
    value: obj.value,
    timestamp: Date.now()
  };

  const dbHC = new models.HomeContent(content);
  await dbHC.save();
  
  return content;
}

async function getMultiple (array) {
  return await models.HomeContent.find({ id: { $in: array } }, { _id: 0, __v: 0 });
}

async function get (user, type, limit = 10, skip = 0, customQuery) {
  limit = Math.min(limit, 100);
  let query = type ? { user, type } : { user };
  if (customQuery) {
    query = customQuery;
  }
  return await models.HomeContent.find(query, { _id: 0, __v: 0 }).sort({ 'timestamp': -1 }).skip(skip).limit(limit);
}

export default {
  create,
  getMultiple,
  get
}