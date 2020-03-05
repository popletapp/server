import models from '../models';

async function create (boardID, obj, requesterID) {
  if (!boardID) {
    throw new Error('Board ID is invalid');
  }
  const code = [...(0 | Math.random() * 6.04e6).toString(13)].map(c => Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()).join('');
  const invite = {
    code,
    board: boardID,
    createdAt: Date.now(),
    createdBy: obj.user.id,
    whitelistedMembers: obj.whitelist || null,
    expiresAt: obj.expiresAt || null
  };

  const dbInvite = new models.Invite(invite);
  await dbInvite.save().then(() => {
    ActionLog.create({
      boardID,
      type: ActionTypes.DELETE_INVITE,
      executor: requesterID,
      before: invite,
      after: null
    });
  });

  return invite;
}

async function getAll (boardID) {
  return await models.Invite.find({ board: boardID }, { _id: 0, __v: 0 });
}

async function get (code) {
  return await models.Invite.findOne({ code }, { _id: 0, __v: 0 });
}

async function del (boardID, id, requesterID) {
  const invite = await this.get(id);
  await models.Group.deleteOne({ id }, { _id: 0, __v: 0 }).then(() => {
    ActionLog.create({
      boardID,
      type: ActionTypes.DELETE_INVITE,
      executor: requesterID,
      before: invite,
      after: null
    });
  });
  return true;
}

export default {
  create,
  getAll,
  get,
  del
}