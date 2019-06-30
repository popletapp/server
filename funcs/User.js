import models from './../models';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import config from './../config'

async function authenticate ({ username, password }) {
  const user = await models.User.findOne({ username });
  if (user && bcrypt.compareSync(password, user.hash)) {
      const { hash, ...userWithoutHash } = user.toObject();
      const token = jwt.sign(user.id, config.secret);
      models.Token.updateOne({ userId: user.id }, {
        token,
        userId: user.id
      }, { upsert: true })
      return {
          ...userWithoutHash,
          token
      };
  }
}

async function get (id) {
  return await models.User.findOne({ id });
}

async function create (obj) {
  const id = Math.floor(Math.random() * 3e14);
  const user = {
    id,
    createdAt: Date.now(),
    username: obj.username || null,
    email: obj.email || null,
    avatar: obj.avatar || null,
    boards: []
  };

  // Hash password
  if (obj.password) {
    user.hash = bcrypt.hashSync(obj.password, 12);
  }

  const dbUser = new models.User(user);
  await dbUser.save();
  return user;
}

async function listBoards () {
  return await models.User.findOne({ id: req.user.id }).then(user => user.boards);
}

export default {
  authenticate,
  create,
  listBoards,
  get
}