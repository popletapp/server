import models from './../models';
import { generateID } from './../util';

async function create (obj) {
  const id = generateID();
  const post = {
    id,
    title: obj.title || null,
    author: obj.author || null,
    content: obj.content || null,
    timestamp: obj.timestamp || Date.now(),
    modifiedAt: obj.modifiedAt || null,
    type: obj.type || 1
  };

  if (!obj.title) {
    throw '`title` needs to be provided in the request body';
  }
  if (!obj.content) {
    throw '`content` needs to be provided in the request body';
  }

  const dbBlog = new models.BlogPost(post);
  await dbBlog.save();

  return post;
}

async function update (obj) {
  const post = {
    id,
    title: obj.title || null,
    author: obj.author || null,
    content: obj.content || null,
    timestamp: obj.timestamp || Date.now(),
    modifiedAt: obj.modifiedAt || null,
    type: obj.type || 1
  };
  await models.BlogPost.updateOne({ id: obj.id }, post);
  return post;
}

async function del (id) {
  return await models.BlogPost.deleteOne({ id });
}

async function getMultiple (limit = 10) {
  return await models.BlogPost.find(null, { _id: 0, __v: 0 }).limit(limit).sort({ timestamp: -1 });
}

async function get (id) {
  return await models.BlogPost.findOne({ id });
}

export default {
  create,
  update,
  del,
  get,
  getMultiple
}