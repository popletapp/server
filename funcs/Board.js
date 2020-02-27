import models from './../models';
import Chatroom from './Chatroom';
import Group from './../funcs/Group.js';
import Note from './../funcs/Note.js';
import User from './../funcs/User.js';
import Invite from './../funcs/Invite.js';
import PermissionHandler from './../util/permissions';
import { generateID, getBotUser, permissions } from './../util';
import { model } from 'mongoose';

const DEFAULT_RANK = {
  name: 'User',
  color: null, // hex
  permissions: 0, // bitfield
  position: 0
}

const DEFAULT_NOTE_CONTENT = 
`If you're looking to get started right away and start taking notes, click on <<TUTORIAL_METHOD_1>> in the Top Bar.\n
To organize your notes a little easier, you can also store notes inside of groups. Click on <<TUTORIAL_METHOD_2>> to create a new group.\n
To add notes to a group, simply drag and drop any note inside the group. To remove notes from a group, drag the note outside of the group.\n
You can invite people to your board by clicking <<TUTORIAL_METHOD_3>> and giving the invite code to them.\n\n
That's pretty much it for the basics. Thanks for using Poplet!`

const bot = getBotUser();

const DEFAULT_NOTE = {
  title: 'Welcome to your new board',
  content: DEFAULT_NOTE_CONTENT,
  user: bot,
  position: { x: 50, y: 50 },
  size: { width: 200, height: 100 },
  options: {}
}

async function create (obj) {
  const id = obj.boardID = generateID();
  const chatroom = await Chatroom.create(obj);
  const note = await Note.create({ ...DEFAULT_NOTE, boardID: id });
  const board = {
    id,
    createdAt: Date.now(),
    name: obj.name || null,
    type: obj.type || 0,
    avatar: obj.avatar || null,
    members: [ obj.user.id ],
    notes: [ note.id ],
    chatrooms: [ chatroom.id ],
    ranks: [
      { ...DEFAULT_RANK, id }
    ],
    owner: obj.user.id,
    compact: false,
    autoResize: true
  };
  
  const dbBoard = new models.Board(board);
  await dbBoard.save();
  await join(id, obj.user.id);
  return board;
}

async function authorize (boardID, requesterID, permissionRequired = 'USER') {
  const requester = await models.Member.findByBoard(boardID, requesterID);
  const board = await this.get(boardID);
  if (!requester) {
    return false;
  }
  if (permissionRequired === 'USER') {
    return true;
  }
  return new PermissionHandler(requester, board).has(permissionRequired);
}

async function get (id) {
  return await models.Board.findOne({ id }, { _id: 0, __v: 0 });
}

async function edit (id, obj) {
  const original = await this.get(id);
  const board = {
    name: obj.name,
    type: obj.type,
    avatar: obj.avatar,
    ranks: obj.ranks,
    chatrooms: obj.chatrooms,
    compact: obj.compact,
    autoResize: obj.autoResize,
    owner: obj.owner
  };
  const newBoard = Object.assign(original, board);
  await models.Board.updateOne({ id }, newBoard);
  return newBoard;
}

async function del (id) {
  return await models.Board.deleteOne({ id });
}

async function getNotes (id) {
  const board = await this.get(id);
  if (!board) {
    return null;
  }
  return await Note.getMultiple(board.notes)
}

async function getGroups (id) {
  const board = await this.get(id);
  // TODO: filter with only groups that are accessible by the user
  if (!board) {
    return null;
  }
  return await Group.getMultiple(board.groups)
}

async function getMember (boardID, memberID, requesterID) {
  const requester = await models.Member.findByBoard(boardID, requesterID)
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

  const membersByBoard = await models.Member.findByBoard(boardID, requesterID)
  // Make sure that the requester is in the board
  if (membersByBoard) {
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
  if (!board) {
    return null;
  }
  return await Chatroom.getMultiple(board.chatrooms);
}

// shouldn't really need to use this, the array is in the board object but oh well
async function getRanks (id) {
  const board = await this.get(id);
  if (!board) {
    return null;
  }
  return board.ranks;
}

async function addRank (id, rank) {
  const board = await this.get(id);
  const lastPosition = board.ranks.sort((a, b) => b.position - a.position)[0].position + 1;

  rank = { ...DEFAULT_RANK, ...rank, id: generateID(), position: lastPosition };
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

async function updateRank (id, rank) {
  const board = await this.get(id);
  const oldRankIndex = board.ranks.findIndex(r => r.id === rank.id);
  const oldRank = board.ranks[oldRankIndex];
  const newRank = {
    ...oldRank,
    name: rank.name,
    color: rank.color,
    permissions: rank.permissions,
    position: rank.position
  }
  await models.Board.updateOne({ id }, {
    $set: {
      [`ranks.${oldRankIndex}`]: newRank
    }
  }, { upsert: true });
  return newRank;
}

async function applyRankToUser (id, user, rank) {
  await models.Member.updateOne({ id: user, board: id }, {
    $addToSet: {
      'ranks': rank
    }
  }, { upsert: true });
  return rank;
}

async function removeRankFromUser (id, user, rank) {
  await models.Member.updateOne({ id: user, board: id }, {
    $pull: {
      'ranks': { $in: rank }
    },
  }, { upsert: true });
  return rank;
}

async function editMember (id, memberID, memberObj, requesterID) {
  const oldMember = this.getMember(id, memberID, requesterID)
  if (!oldMember) return false;
  const newMember = {
    ...oldMember,
    nickname: memberObj.nickname,
    ranks: memberObj.ranks,
  }
  await models.Member.updateOne({ id: memberID, board: id }, newMember, { upsert: true });
  return newMember;
}

async function join (id, user) {
  await models.Board.updateOne({ id }, {
    $addToSet: {
      'members': user
    }
  }, { upsert: true });

  const member = { 
    id: user,
    joinedAt: Date.now(),
    nickname: null,
    board: id,
    ranks: [ id ]
  };
  const dbBoard = new models.Member(member);
  await dbBoard.save();
  return Object.assign(await User.get(user), member);
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

  await models.Member.deleteOne({ id: user, board: id });
  return id;
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
  updateRank,
  applyRankToUser,
  removeRankFromUser,
  editMember
}