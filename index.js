import express from 'express';
import bodyParser from 'body-parser';
import config from './config';
import http from 'http';
import WebSocket from 'ws';
import models, { connectDb } from './models';
import { User, Board, Chatroom, Gateway, Note } from './routes';

const URL = 'http://localhost:3000';
const API_VER = 'v1';
const API_URL = `/api/${API_VER}`;
const app = express();

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

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, port: 7979 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    for (const client of wss.clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    }
  });
});

connectDb().then(async () => {
  app.listen(config.port, () =>
    console.log(`Poplet (server-side) is listening on ${config.port}!`),
  );
});