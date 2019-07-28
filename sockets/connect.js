import User from './../funcs/User';
import { join } from 'path';
const listeners = require(join(__dirname));
exports.handle = async ({ client, io }) => {
  for (const listener of listeners) {
    try {
      const func = require(join(__dirname, listener)).handle;
      if (func) {
        listeners[listener] = func.bind(this);
        client.on(listener, (data) => listeners[listener]({ client, data, io }));
      }
    } catch (e) {
      console.error(e)
    }
  }
  const boards = await User.listBoards(client.userID);
  for (const board of boards) {
    console.log(`${client.userID} is now subscribed to updates for ${board.name}`)
    client.join(board.id)
  }
}