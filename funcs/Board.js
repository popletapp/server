import models from './../models';
import Chatroom from './Chatroom';
import Group from './../funcs/Group.js';
import Note from './../funcs/Note.js';
import User from './../funcs/User.js';
import Invite from './../funcs/Invite.js';
import PermissionHandler from './../util/permissions';
import { generateID } from './../util';
import { model } from 'mongoose';

const DEFAULT_RANK = {
  name: 'User',
  color: null, // hex
  permissions: 0, // bitfield
  position: 0
}

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
    chatrooms: [ chatroom.id ],
    ranks: [
      { ...DEFAULT_RANK, id }
    ]
  };
  
  const dbBoard = new models.Board(board);
  await dbBoard.save();
  await join(id, obj.user);
  return board;
}

async function authorize (boardID, requesterID, permissionRequired = 'USER') {
  const requester = await models.Member.findByBoard(boardID, requesterID);
  const board = await this.get(boardID);
  if (!requester) {
    return null;
  }
  return new PermissionHandler(requester, board).has(permissionRequired);
}

async function get (id) {
  return await models.Board.findOne({ id }, { _id: 0, __v: 0 });
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

async function getGroups (id) {
  const board = await this.get(id);
  // TODO: filter with only groups that are accessible by the user
  return await Group.getMultiple(board.groups)
}

async function getMember (boardID, memberID, requesterID) {
  const requester = models.Member.findByBoard(boardID, requesterID)
  if (requester) {
    return await models.Member.findByBoard(boardID, memberID);
  } else {
    return null;
  }
}

async function getMembers (boardID, requesterID) {
  function bubble(data) {
    let tmp;
    for (let i = data.length - 1; i > 0; i--) {
        for (let j = 0; j < i; j++) {
            if (data[j] > data[j+1]) {
                tmp = data[j];
                data[j] = data[j+1];
                data[j+1] = tmp;
            }
        }
    }
    return data;
  }

  const requester = models.Member.findByBoard(boardID, requesterID)
  if (requester) {
    const merged = [];
    const members = bubble(await models.Member.find({ board: boardID }, { _id: 0, __v: 0 }));
    const users = bubble(await User.getMultiple(members.map(m => m.id || null).filter(Boolean)));
    for (const i in members) {
      merged.push(Object.assign(members[i]._doc, users[i]._doc))
    }
    return merged;
  } else {
    return null;
  }
}

async function getChatrooms (id) {
  const board = await this.get(id);
  return await Chatroom.getMultiple(board.chatrooms);
}

// shouldn't really need to use this, the array is in the board object but oh well
async function getRanks (id) {
  const board = await this.get(id);
  return board.ranks;
}

async function addRank (id, rank) {
  rank = { ...DEFAULT_RANK, ...rank, id: generateID() };
  await models.Board.updateOne({ id }, {
    $addToSet: {
      'ranks': rank
    }
  }, { upsert: true });
  return rank
}

async function removeRank (id, rank) {
  await models.Board.updateOne({ id, ranks: { $elemMatch: { 'id': rank.id, 'position': { $gte: rank.position } } } }, {
    $pull: {
      'ranks': { $in: rank }
    },
    $inc: {
      'ranks.$': { position: -1 }
    }
  }, { upsert: true });
  return rank;
}

async function adjustPermissionsOnRank (id, rank) {
  rank.permissions = rank.permissions || 0;
  await models.Board.updateOne({ id, 'ranks.id': rank.id }, {
    $set: {
      'ranks.$.permissions': rank.permissions
    }
  }, { upsert: true });
}

async function join (id, user) {
  const board = await models.Board.findOneAndUpdate({ id }, {
    $addToSet: {
      'members': user
    }
  }, { upsert: true });

  const member = { 
    id: user,
    joinedAt: Date.now(),
    nickname: null,
    board: id,
    ranks: []
  };
  const dbBoard = new models.Member(member);
  await dbBoard.save();
  return board;
}

async function leave (id, user) {
  const board = await models.Board.findOneAndUpdate({ id: id }, {
    $filter: {
      input: 'members',
      as: 'member',
      cond: {
        $not: [ '$$member', user ]
      }
    }
  });

  await models.Member.deleteOne({ id: user, board: id });
  return board;
}

export default {
  authorize,
  create,
  edit,
  del,
  join,
  leave,
  get,
  getNotes,
  getGroups,
  getMember,
  getMembers,
  getChatrooms,
  getRanks,
  addRank,
  removeRank,
  adjustPermissionsOnRank
}