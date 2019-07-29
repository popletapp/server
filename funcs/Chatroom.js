import models from './../models';
import { generateID } from './../util';

async function create (obj) {
  const id = generateID();
  const chatroom = {
    id,
    createdAt: Date.now(),
    name: obj.name || null,
    avatar: obj.avatar || null,
    board: obj.boardID || null,
    blacklist: obj.blacklist || null,
    lastMessage: null,
    messages: []
  };

  if (!obj.boardID) {
    throw 'A board ID needs to be provided in the request body';
  }
  try {
    await models.Board.updateOne({ id: obj.boardID }, {
      $addToSet: {
        'chatrooms': id
      }
    });
  } catch (e) {
    throw 'Error whilst trying to apply chatroom to board, make sure the board exists and is valid.';
  }
  const dbChatroom = new models.Chatroom(chatroom);
  await dbChatroom.save();

  return chatroom;
}

async function update (obj) {
  const chatroom = {
    id: obj.id,
    name: obj.name || null,
    avatar: obj.avatar || null,
    board: obj.boardID || null,
    blacklist: obj.blacklist || null,
    lastMessage: null,
    messages: []
  };
  await models.Chatroom.updateOne({ id: obj.id }, chatroom);
  return chatroom;
}

async function del (id) {
  return await models.Chatroom.deleteOne({ id });
}

async function getMultiple (array) {
  return await models.Chatroom.find({ id: { $in: array } }, { _id: 0, __v: 0 });
}

async function comment (obj) {
  const comment = {
    id: generateID(),
    chatroom: obj.chatroom,
    timestamp: Date.now(),
    author: obj.author,
    content: obj.content
  };
  console.log(comment)
  const dbComment = new models.ChatroomComment(comment);
  await dbComment.save();
}

async function getComment (id) {
  return await models.ChatroomComment.findOne({ id });
}

async function getComments (id, limit, position) {
  if (limit > 100) {
    limit = 100;
  }
  if (limit < 2) {
    limit = 2;
  }
  const comments = await models.ChatroomComment.find({ chatroom: id });
  console.log(comments.hasNext)
  return comments.sort({ 'timestamp': -1 }).skip(position).limit(limit);
}

async function get (id) {
  return await models.Chatroom.findOne({ id });
}

export default {
  create,
  update,
  del,
  getMultiple,
  comment,
  getComment,
  getComments,
  get
}