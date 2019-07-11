import mongoose from 'mongoose';
import config from './../config';

import User from './User';
import Board from './Board';
import Token from './Token';
import Chatroom from './Chatroom';
import Note from './Note';
import ChatroomComment from './ChatroomComment';
import Member from './Member';
import Group from './Group';
import Invite from './Invite';

const connectDb = () => {
  return mongoose.connect(config.databaseUrl);
};

const models = { User, ChatroomComment, Token, Board, Note, Chatroom, Member, Group, Invite };

export { connectDb };

export default models;