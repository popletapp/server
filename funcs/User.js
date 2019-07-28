import models from './../models';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import config from './../config'
import { generateID } from '../util';
import HTTPError from '../util/HTTPError';

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

async function get (id) {
  return await models.User.findOne({ id }, { _id: 0, __v: 0, hash: 0, email: 0, boards: 0 });
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
    badges: 0
  };

  // Hash password
  if (obj.password) {
    user.hash = bcrypt.hashSync(obj.password, 12);
  }

  const dbUser = new models.User(user);
  await dbUser.save();
  return user;
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

async function logout () {
  await models.Token.deleteOne({ userId: user.id });
}

export default {
  authenticate,
  create,
  listBoards,
  get,
  logout
}