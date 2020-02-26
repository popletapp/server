exports.handle = ({ client }) => {
  client.emit('heartbeat')
}