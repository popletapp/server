import mongoose from 'mongoose';
import config from './../config';

import User from './User';
import Board from './Board';
import Token from './Token';
import Chatroom from './Chatroom';
import Note from './Note';
import ChatroomComment from './ChatroomComment';

const connectDb = () => {
  return mongoose.connect(config.databaseUrl);
};

const models = { User, ChatroomComment, Token, Board, Note, Chatroom };

export { connectDb };

export default models;