exports.handle = ({ client, redis }) => {
  redis.set(`${client.userID}-ack`, Date.now(), 'EX', 300);
  client.emit('heartbeat');
}