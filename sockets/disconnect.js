exports.handle = ({ data }) => {
  if (data && data.userID && data.authToken) {
    rclient.del(`wsclient-${data.userID}`, data)
  }
}