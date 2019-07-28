import express from 'express';
import bodyParser from 'body-parser';
import Redis from 'ioredis';
import config from './config';
import SocketServer from 'socket.io';
import secrets from './secrets';
import http from 'http';
import models, { connectDb } from './models';
import ratelimit from 'express-rate-limit';
import { User, Board, Chatroom, Gateway, Note, Invite } from './routes';

const URL = 'http://localhost:3000';
const API_VER = 'v1';
const API_URL = `/api/${API_VER}`;
const app = express();
const rclient = new Redis({ host: '127.0.0.1' });

rclient.once('ready', function() {
  console.log('Redis ready');
});

// Global ratelimit - a maximum of 5 requests in 5 seconds
const globalLimiter = ratelimit({
  windowMs: 5e3,
  max: 10
})

app.use(bodyParser.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Origin', URL);
  res.setHeader('Access-Control-Allow-Headers', 'authorization,content-type');
  next();
});

// Token handler + authentication
app.use(async (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    models.Token.findOne({ token }).then(async response => {
      if (response) {
        const id = response.userId;
        const user = await models.User.findOne({ id });
        if (!user) {
          next();
        }
        req.user = {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      }
      next();
    })
  } else {
    next();
  }
})

app.use('/authorized', (req, res) => {
  res
  .status(req.user ? 200 : 403)
  .send(req.user ? `You are logged in as ${req.user.id}` : 'You are not authorized.')
})

app.use(`${API_URL}/gateway`, Gateway)
app.use(`${API_URL}/users`, User)
app.use(`${API_URL}/boards`, Board)
app.use(`${API_URL}/notes`, Note)
app.use(`${API_URL}/chatrooms`, Chatroom)
app.use(`${API_URL}/invites`, Invite)

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

const server = http.createServer(app);
const io = new SocketServer(server);
const authorize = require('./sockets/authorize').handle;

io.on('connection', (client) => {
  client.on('authorize', (data) => {
    authorize({ client, data, io, redis: rclient })
  })
});

connectDb().then(async () => {
  server.listen(config.port, () =>
    console.log(`Poplet (server-side) is listening on ${config.port}!`),
  );
});

export default { ws: io }