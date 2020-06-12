import { Board } from './../funcs';
import { Permissions } from './../util/permissions';

const PermissionMap = {
  UPDATE_NOTE: 'MANAGE_NOTES',
  CREATE_NOTE: 'MANAGE_NOTES',
  DELETE_NOTE: 'MANAGE_NOTES',
  UPDATE_GROUP: 'MANAGE_NOTES',
  CREATE_GROUP: 'MANAGE_NOTES',
  DELETE_GROUP: 'MANAGE_NOTES',
  DELETE_BOARD: 'ADMINISTRATOR',
  REQUEST_CHATROOMS: 'VIEW_CHATROOMS',
  CREATE_NOTE_COMMENT: 'ADD_COMMENTS',
  CREATE_CHATROOM_COMMENT: 'SEND_CHATROOM_MESSAGES',
  ADD_RANK: [ 'MODERATOR', 'MANAGE_BOARD' ],
  UPDATE_RANK: [ 'MODERATOR', 'MANAGE_BOARD' ],
  DELETE_RANK: [ 'MODERATOR', 'MANAGE_BOARD' ],
  REMOVE_MEMBER: [ 'KICK_MEMBERS', 'BAN_MEMBERS', 'MODERATOR' ]
}

exports.handle = async ({ client, data, redis }) => {
  if (data && data.type && data.board) {
    if (data.type === 'JOIN_BOARD') {
      client.join(board)
    }

    if (data.type === 'LEAVE_BOARD') {
      client.leave(board)
    }

    // Ensure this user is in the board and/or has the correct permissions
    const authorized = await Board.authorize(data.board, client.userID, PermissionMap[data.type]);
    if (authorized) {
      const eventCount = await redis.get(`${client.userID}-${data.board}-events`);
      if (!eventCount) {
        redis.set(`${client.userID}-${data.board}-events`, 1);
      } else {
        redis.set(`${client.userID}-${data.board}-events`, eventCount + 1);
      }
      client.to(data.board).emit('message', data);
    }
  }
}