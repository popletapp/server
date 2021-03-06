import express from 'express';
import bodyParser from 'body-parser';
import Redis from 'ioredis';
import config from './config';
import SocketServer from 'socket.io';
import http from 'http';
import models, { connectDb } from './models';
import ratelimit from 'express-rate-limit';
import { User, Board, Chatroom, Gateway, Note, Invite, Blog } from './routes';
import imageServer from './../image-server';
import fs from 'fs';

const API_VER = 'v1';
const API_URL = `/api/${API_VER}`;
const app = express();
const rclient = new Redis({ host: '127.0.0.1' });
const server = http.createServer(app);

// Global ratelimit - a maximum of 25 requests in 3 seconds
const globalLimiter = ratelimit({
  windowMs: 1e3,
  max: 50
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(globalLimiter)

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://popletapp.com');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Super-Properties, X-Context-Properties, X-Failed-Requests, If-None-Match');
  res.setHeader('Access-Control-Max-Age', '86400')
  next();
});

// Other protection
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block')
  next();
})


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

// Check if user is authorized to make changes
app.use('/authorized', (req, res) => {
  res
  .status(req.user ? 200 : 403)
  .send(req.user ? `You are logged in as ${req.user.id}` : 'You are not authorized.')
})

// API endpoints
app.use(`${API_URL}/gateway`, Gateway)
app.use(`${API_URL}/users`, User)
app.use(`${API_URL}/boards`, Board)
app.use(`${API_URL}/notes`, Note)
app.use(`${API_URL}/chatrooms`, Chatroom)
app.use(`${API_URL}/invites`, Invite)
app.use(`${API_URL}/blog`, Blog)

// Image server
app.use(imageServer);

// HSTS support
app.get('/*', function(req, res, next) {
  res.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  next();
});

// "web-app" folder must be contained inside of a parent with the server
app.use(express.static(`${__dirname}/../web-app/build`));
app.get('*', (req, res) => {
  fs.readFile(`${__dirname}/../web-app/build/index.html`, (err, data) => {
    if (data) {
      res.writeHead(200, { 'Content-Type': "text/html" });
      res.write(data);
      res.end();
    }
  })
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('An internal server error has occured.')
})

// Initialize websockets
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

export default { ws: io, redis: rclient }