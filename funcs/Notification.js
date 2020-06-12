import models from '../models';
import { generateID } from '../util';

async function create (obj) {
  const id = generateID();
  const notification = {
    id,
    recipient: obj.recipient,
    author: obj.author,
    title: obj.title,
    content: obj.content,
    timestamp: obj.timestamp || Date.now()
  };

  const notif = new models.Notification(notification);
  await notif.save();
  return notification;
}

async function getMultiple (array) {
  return await models.Notification.find({ id: { $in: array } }, { _id: 0, __v: 0 });
}

async function get (recipient, type, limit = 10, skip = 0) {
  limit = Math.min(limit, 100);
  return await models.Notification.find(type ? { type, recipient } : { recipient }, { _id: 0, __v: 0 }).sort({ 'timestamp': -1 }).skip(skip).limit(limit);
}

export default {
  create,
  getMultiple,
  get
}