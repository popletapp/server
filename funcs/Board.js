import models from './../models';
import Chatroom from './Chatroom';
import Note from './../funcs/Note.js';

import { generateID } from './../util';

async function create (obj) {
  const id = obj.boardID = generateID();
  const chatroom = await Chatroom.create(obj);
  const board = {
    id,
    createdAt: Date.now(),
    name: obj.name || null,
    avatar: obj.avatar || null,
    members: [ obj.user.id ],
    notes: [],
    chatrooms: [ chatroom.id ]
  };
  
  const dbBoard = new models.Board(board);
  await dbBoard.save();
  await join(id, obj.user);
  return board;
}

async function get (id) {
  return await models.Board.findOne({ id });
}

async function edit (property, value) {
  return await models.Board.updateOne({ id: obj.id }, { [property]: value }, { upsert: true });
}

async function del (id) {
  return await models.Board.deleteOne({ id });
}

async function getNotes (id) {
  const board = await this.get(id);
  return await Note.getMultiple(board.notes)
}

async function getMember (boardID, memberID) {
  return await models.Member.findByBoard(boardID, memberID);
}

async function getMembers (boardID) {
  return await models.Member.find({ board: boardID });
}

async function join (id, user) {
  await models.Board.updateOne({ id }, {
    $addToSet: {
      'members': user.id
    }
  }, { upsert: true });

  const member = { 
    id: user.id,
    joinedAt: Date.now(),
    nickname: null,
    board: id,
    ranks: []
  };
  const dbBoard = new models.Member(member);
  await dbBoard.save();
  return id;
}

async function leave (id, user) {
  await models.Board.updateOne({ id: id }, {
    $filter: {
      input: 'members',
      as: 'member',
      cond: {
        $not: [ '$$member', user ]
      }
    }
  });

  await models.Member.deleteOne({ id: user.id, board: id });
  return id;
}

export default {
  create,
  edit,
  del,
  join,
  leave,
  get,
  getNotes,
  getMember,
  getMembers
}