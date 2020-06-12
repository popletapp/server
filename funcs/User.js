import models from './../models';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import config from './../config'
import { generateID } from '../util';
import HTTPError from '../util/HTTPError';
import HomeContentTypes from '../constants/HomeContentTypes';
import { HomeContent } from './';

async function authenticate ({ email, password }) {
  const user = await models.User.findOne({ email });

  if (user && bcrypt.compareSync(password, user.hash)) {
      const { hash, ...userWithoutHash } = user.toObject();
      const token = jwt.sign(user.id, config.secret);
      await models.Token.updateOne({ userId: user.id }, {
        token,
        userId: user.id
      }, { upsert: true })
      return {
          ...userWithoutHash,
          token,
          userID: user.id
      };
  } else {
    return null;
  }
}

async function get (id, returnEverything = false) {
  let returnValue = { _id: 0, __v: 0, hash: 0, email: 0, boards: 0, compact: 0, theme: 0, lang: 0 };
  if (returnEverything) {
    returnValue = { _id: 0, __v: 0, hash: 0, email: 0, boards: 0 };
  }
  return await models.User.findOne({ id }, returnValue)
    .catch(e => e);
}

async function getMultiple (array) {
  return await models.User.find({ id: { $in: array } }, { _id: 0, __v: 0, hash: 0, email: 0, boards: 0, compact: 0, theme: 0, lang: 0 });
}

const DEFAULT_SETTINGS = {
  theme: 0,
  compact: false
}
async function create (obj) {
  const usernameExists = await models.User.findOne({ username: obj.username });
  const emailExists = await models.User.findOne({ email: obj.email });
  if (usernameExists) {
    throw new HTTPError('A user with this username already exists', 403);
  } else if (emailExists) {
    throw new HTTPError('This e-mail address is already being used by another user', 403);
  }

  const { username, password } = obj;
  if (password.length < 6) {
    throw new HTTPError('Password needs to be longer than 6 characters', 400);
  } else if (username.length < 3) {
    throw new HTTPError('Username needs to be at least 4 characters', 400);
  } else if (username.length > 32) {
    throw new HTTPError('Username can\'t be longer than 32 characters', 400);
  } else if (/\W/.test(username)) {
    throw new HTTPError('Username can only contain alphanumeric characters or underscores', 400);
  }

  const id = generateID();
  const user = {
    id,
    createdAt: Date.now(),
    username: obj.username || null,
    email: obj.email || null,
    avatar: obj.avatar || null,
    badges: 0,
    theme: 0,
    status: 'offline',
    compact: false,
    lang: 'en',
    bot: false
  };

  // Hash password
  if (obj.password) {
    user.hash = bcrypt.hashSync(obj.password, 12);
  }

  const dbUser = new models.User(user);
  await dbUser.save();
  return user;
}

async function edit (id, obj) {
  const original = await this.get(id);
  // Hash password
  if (obj.password) {
    obj.hash = bcrypt.hashSync(obj.password, 12);
  }
  delete obj.password;
  const user = {
    email: obj.email,
    avatar: obj.avatar,
    hash: obj.hash,
    theme: obj.theme,
    compact: obj.compact,
    lang: obj.lang,
    status: obj.status
  };
  const newUser = Object.assign(original, user);
  await models.User.updateOne({ id }, newUser);
  return newUser;
}

async function addFriend (id, friend, pending = true) {
  const friendObject = {
    userId: id,
    friendId: friend,
    note: '',
    pending,
    addedAt: Date.now(),
    favorited: false
  }
  const dbFriend = new models.Friend(friendObject);
  await dbFriend.save();
  return friend;
}

async function getPendingFriendRequests (id) {
  // Looking for pending relationships requests where the other user has put the current user as the friend ID
  const pending = await models.Friend.find({ friendId: id, pending: true }, { __v: 0, _id: 0 });
  if (pending.length) {
    const users = await getMultiple(pending.map(friend => friend.userId));
    return users;
  } else {
    return [];
  }
}

async function acceptFriendRequest (id, friend) {
  // Update the pending request to be completed
  const operation = await models.Friend.updateOne({ userId: friend, friendId: id }, { pending: false });
  if (operation.n) {
    // The accepter now adds the acceptee as a friend, establishing a relationship
    await addFriend(id, friend, false)
    // Add to content feed for both users
    HomeContent.create({ user: friend, type: HomeContentTypes.FRIEND_REQUEST_ACCEPTED, value: { user: id } });
    HomeContent.create({ user: id, type: HomeContentTypes.FRIENDSHIP_CREATED, value: { user: friend } });
  }
  return { accepted: true };
}

async function editFriend (id, friend, data) {
  const friendObject = {
    note: data.note,
    favorited: data.favorited
  }
  await models.Friend.updateOne({ userId: id, friendId: friend }, friendObject);
  return true;
}

async function removeFriend (id, friend) {
  // If one friend removes another, both should be removed
  await models.Friend.deleteOne({ userId: id, friendId: friend });
  await models.Friend.deleteOne({ userId: friend, friendId: id });
  return true;
}

async function getFriends (id) {
  return await models.Friend.find({ userId: id, pending: false }, { __v: 0, _id: 0 });
}

async function listBoards (id) {
  const members = await models.Member.find({ id });
  if (members && members.length) {
    const array = members.map(member => member.board);
    return await models.Board.find({ id: { $in: array } });
  } else {
    return [];
  }
}

async function logout (id) {
  await models.Token.deleteOne({ userId: id });
  return true;
}

async function getHomeContent (id) {
  /*
  const groupArrayByTimestamps = (array, range, timestampProperty = 'createdAt') => {
    const final = [];
    let current = [];
    for (const value of array) {
      if (Date.now() - new Date(value[timestampProperty]).valueOf() < range) {
        current.push(value);
      } else {
        final.push(current);
        current = [];
      }
    }
    if (current.length) {
      final.push(current);
    }
    return final;
  }
  */

  const REMOVE_INSIGNIFICANT = { __v: 0, _id: 0 };
  // Get notes where this user is the creator or assigned
  const notes = await models.Note.find({ $or: [{ 'createdBy.id': id }, 
    { assignees: { $in: id } }] }, REMOVE_INSIGNIFICANT);
  const content = await models.HomeContent.find({ user: id }, REMOVE_INSIGNIFICANT);
  console.log(content)
  if (notes.length) {
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      if (note.dueDate) {
        console.log('adding due date to home content')
        content.push({ type: HomeContentTypes.DUE_DATE_UPCOMING, value: { note } })
      }
    }
  }

  return content;
}


export default {
  authenticate,
  create,
  listBoards,
  get,
  edit,
  getMultiple,
  logout,
  getHomeContent,
  getFriends,
  addFriend,
  removeFriend,
  editFriend,
  acceptFriendRequest,
  getPendingFriendRequests
}