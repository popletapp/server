exports.handle = ({ data, redis }) => {
  if (data && data.userID && data.authToken) {
    redis.del(`wsclient-${data.userID}`)
  }
}