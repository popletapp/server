import { Board } from './../funcs';
import { Permissions } from './../util/permissions';

const PermissionMap = {
  UPDATE_NOTE: Permissions.EDITOR
}

exports.handle = ({ client, data }) => {
  if (data && data.type && data.board) {
    // Ensure this user is in the board and/or has the correct permissions
    if (Board.authorize(data.board, client.userID, PermissionMap[data.type] || Permissions.USER)) {
      client.to(data.board).emit('message', data)
    }
  }
}