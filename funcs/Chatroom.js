import models from './../models';
import { generateID } from './../util';

async function create (obj) {
  const id = generateID();
  const chatroom = {
    id,
    createdAt: Date.now(),
    name: `${obj.name}'s chatroom` || null,
    avatar: obj.avatar || null,
    members: [ obj.user.id ],
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

async function comment (obj) {
  const comment = {
    id: generateID(),
    timestamp: Date.now(),
    author: obj.author,
    content: obj.content
  };
  const dbComment = new models.ChatroomComment(comment);
  await dbComment.save();
}

async function getComment (id) {
  return await models.ChatroomComment.findOne({ id });
}

async function getComments (id) {
  return await models.ChatroomComment.find({ chatroom: id });
}

async function get (id) {
  return await models.Chatroom.findOne({ id });
}

export default {
  create,
  comment,
  getComment,
  getComments,
  get
}