import models from './../models';
const connect = require('./connect');

exports.handle = ({ client, data, io, redis }) => {
  if (data && data.userID && data.authToken) {
    // Authorized
    models.Token.findOne({ token: data.authToken }).then(() => {
      console.log('Authorized')
      redis.set(`wsclient-${data.userID}`, data)
      client.userID = data.userID;
      connect.handle({ client, io, redis });
    });
  }
}