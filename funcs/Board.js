import models from './../models';
import Chatroom from './Chatroom';

async function create (obj) {
  const id = Math.floor(Math.random() * 3e14).toString();
  obj.boardID = id;
  const chatroom = await Chatroom.create(obj);
  const board = {
    id,
    createdAt: Date.now(),
    name: obj.name || null,
    avatar: obj.avatar || null,
    members: [ obj.user ],
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

async function join (id, user) {
  console.log(`${user.id} is joining ${id}`)
  await models.Board.updateOne({ id }, {
    $addToSet: {
      'members': user
    }
  }, { upsert: true });

  await models.User.updateOne({ id: user.id }, {
    $addToSet: {
      'boards': id
    }
  }, { upsert: true })
  return id;
}

async function leave (id, user) {
  console.log(`${user.id} is leaving ${id}`)
  await models.Board.updateOne({ id: id }, {
    $filter: {
      input: 'members',
      as: 'member',
      cond: {
        $not: [ '$$member', user ]
      }
    }
  });

  await models.User.updateOne({ id: user.id }, {
    $filter: {
      input: 'boards',
      as: 'board',
      cond: {
        $not: [ '$$board', id ]
      }
    }
  })
  return id;
}

export default {
  create,
  join,
  leave,
  get
}