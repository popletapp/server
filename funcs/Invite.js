import models from '../models';

async function create (obj) {
  if (!obj.boardID) {
    throw new Error('A board ID needs to be provided in the request body');
  }
  const code = [...(0 | Math.random() * 6.04e6).toString(13)].map(c => Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()).join('');
  const invite = {
    code,
    board: obj.boardID,
    createdAt: new Date().toISOString(),
    createdBy: obj.user.id,
    whitelistedMembers: obj.whitelist || null,
    expiresAt: obj.expiresAt || null
  };

  const dbInvite = new models.Invite(invite);
  await dbInvite.save();

  return invite;
}

async function getAll (boardID) {
  return await models.Invite.find({ board: boardID }, { _id: 0, __v: 0 });
}

async function get (code) {
  return await models.Invite.findOne({ code }, { _id: 0, __v: 0 });
}

export default {
  create,
  getAll,
  get
}