exports.handle = ({ client }) => {
  setTimeout(() => {
    client.emit('heartbeat')
  }, 10000);
}