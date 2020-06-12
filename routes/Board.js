import express from 'express';
const router = express.Router();
import { Board, Note, Invite, Group } from './../funcs';
import { authorization, permissions } from './../util';
import ActionLog from '../funcs/ActionLog';


// Member endpoints
router.get(`/:id/members`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.user.id)) {
    Board.getMembers(req.params.id, req.user.id)
      .then(notes => notes ? res.status(200).json(notes) : res.status(500))
      .catch(err => next(err));
  }
})

router.get(`/:id/members/:member`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.params.member)) {
    Board.getMember(req.params.id, req.params.member)
      .then((member) => member ? res.status(200).json(member) : res.status(500))
      .catch(err => next(err));
  }
})

router.put(`/:id/members/:member`, authorization, async (req, res, next) => {
  if (req.body.invite) {
    if (req.user.id !== req.params.member) {
      return res.status(403).json({ message: 'You are not authorized to add this member to this board' })
    }
    const invites = await Invite.getAll(req.params.id);
    // If invite is correct
    if (invites.find(invite => invite.code === req.body.invite)) {
      if (await Board.authorize(req.params.id, req.params.member)) {
        return res.status(400).json({ message: 'This user is already a member of this board' })
      }
      Board.join(req.params.id, req.params.member, req.user.id)
          .then((member) => res.status(200).json(member))
          .catch(err => next(err));
    } else {
      return res.status(403).json({ message: 'Invite code is invalid or expired' })
    }
  } else {
    return res.status(403).json({ message: 'You need to provide an invite code to join this board.' })
  }
})

router.patch(`/:id/members/:member`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.params.member, req.params.member === req.user.id ? 'USER' : 'MANAGE_MEMBERS')) {
    Board.editMember(req.params.id, req.params.member, req.body, req.user.id)
        .then((member) => member ? res.status(200).json(member) : res.status(403))
        .catch(err => next(err));
  }
})

router.delete(`/:id/members/:member`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.params.member, req.params.member === req.user.id ? 'USER' : ['BAN_MEMBERS', 'KICK_MEMBERS', 'MODERATOR'])) {
    Board.leave(req.params.id, req.params.member, req.user.id)
        .then((board) => res.status(200).json(board))
        .catch(err => next(err));
  }
})

// Chatrooms
router.get(`/:id/chatrooms`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.user.id, 'VIEW_CHATROOMS')) {
    Board.getChatrooms(req.params.id)
        .then(chatrooms => chatrooms ? res.status(200).json(chatrooms) : res.status(500))
        .catch(err => next(err));
  }
})


// Group endpoints
router.get(`/:id/groups`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.user.id)) {
    Board.getGroups(req.params.id)
        .then(notes => notes ? res.status(200).json(notes) : res.status(500))
        .catch(err => next(err));
  }
})

router.put(`/:id/groups`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'MANAGE_NOTES')) {
    Group.create(req.params.id, { ...req.body, user: req.user }, req.user.id)
        .then((note) => res.status(200).json(note))
        .catch(err => next(err));
  }
})

router.patch(`/:id/groups/:group`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'MANAGE_NOTES')) {
    Group.update(req.params.id, { ...req.body, id: req.params.group, user: req.user }, req.user.id)
        .then((group) => group ? res.status(200).json(group) : res.status(500))
        .catch(err => next(err));
  }
})

router.delete(`/:id/groups/:group`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'MANAGE_NOTES')) {
    Group.del(req.params.id, req.params.group, req.user.id)
        .then((group) => group ? res.status(200).json(group) : res.status(500))
        .catch(err => next(err));
  }
})


// Rank endpoints
router.get(`/:id/ranks`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.user.id)) {
    Board.getRanks(req.params.id)
        .then(ranks => ranks ? res.status(200).json(ranks) : res.status(500))
        .catch(err => next(err));
  }
})

router.put(`/:id/ranks`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'MANAGE_BOARD')) {
    Board.addRank(req.params.id, req.body.rank, req.user.id)
        .then((rank) => res.status(200).json(rank))
        .catch(err => next(err));
  }
})

router.patch(`/:id/ranks/:rank`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'MANAGE_BOARD')) {
    Board.updateRank(req.params.id, { id: req.params.rank, ...req.body }, req.user.id)
        .then((rank) => rank ? res.status(200).json(rank) : res.status(500))
        .catch(err => next(err));
  }
})

router.delete(`/:id/ranks/:rank`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'MANAGE_BOARD')) {
    Board.removeRank(req.params.id, { id: req.params.rank, ...req.body }, req.user.id)
        .then(() => res.status(204))
        .catch(err => next(err));
  }
})


// Label endpoints
router.put(`/:id/labels`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'MANAGE_BOARD')) {
    Board.addLabel(req.params.id, req.body, req.user.id)
        .then((label) => res.status(200).json(label))
        .catch(err => next(err));
  }
})

router.patch(`/:id/labels/:label`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'MANAGE_BOARD')) {
    Board.updateLabel(req.params.id, { id: req.params.label, ...req.body }, req.user.id)
        .then((label) => label ? res.status(200).json(label) : res.status(500))
        .catch(err => next(err));
  }
})

router.delete(`/:id/labels/:label`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'MANAGE_BOARD')) {
    Board.removeLabel(req.params.id, { id: req.params.label, ...req.body }, req.user.id)
        .then(() => res.status(204))
        .catch(err => next(err));
  }
})


// Note endpoints
router.get(`/:id/notes`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.user.id)) {
    Board.getNotes(req.params.id)
        .then(notes => notes ? res.status(200).json(notes) : res.status(500))
        .catch(err => next(err));
  }
})

router.put(`/:id/notes`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'MANAGE_NOTES')) {
    Note.create(req.params.id, { ...req.body, user: req.user }, req.user.id)
        .then((note) => res.status(200).json(note))
        .catch(err => next(err));
  }
})

router.patch(`/:id/notes/:note`, authorization, function (req, res, next) {
  Note.update(req.params.id, { ...req.body, id: req.params.note, user: req.user }, req.user.id)
      .then((note) => note ? res.status(200).json(note) : res.status(500))
      .catch(err => next(err));
})

router.delete(`/:id/notes/:note`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'MANAGE_NOTES')) {
    Note.del(req.params.id, req.params.note, req.user.id)
        .then((note) => note ? res.status(200).json(note) : res.status(500))
        .catch(err => next(err));
  }
})

router.post(`/:id/notes/:note/comments`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id)) {
    Note.comment(req.params.id, req.body, req.user.id)
      .then((comment) => comment ? res.status(200).json(comment) : res.status(500))
      .catch(err => next(err));
  }
})

router.get(`/:id/notes/:note/comments`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id)) {
    Note.getComments(req.params.note)
      .then((comment) => comment ? res.status(200).json(comment) : res.status(500))
      .catch(err => next(err));
  }
})

// Invite endpoints
router.get(`/:id/invites`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'INVITE_MEMBERS')) {
    Invite.getAll(req.params.id)
        .then((invite) => res.status(200).json(invite))
        .catch(err => next(err));
  }
})

router.get(`/:id/invites/:invite`, authorization, function (req, res, next) {
  Invite.get(req.params.invite)
      .then((invite) => res.status(200).json(invite))
      .catch(err => next(err));
})

router.post(`/:id/invites`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'MODERATOR')) {
    Invite.create(req.params.id, { ...req.body, user: req.user, boardID: req.params.id }, req.user.id)
        .then((invite) => res.status(200).json(invite))
        .catch(err => next(err));
  }
})

router.delete(`/:id/invites/:invite`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'MODERATOR')) {
    Invite.del(req.params.id, req.params.invite, req.user.id)
        .then((invite) => res.status(200).json(invite))
        .catch(err => next(err));
  }
})


// Action log endpoints
router.get(`/:id/actionlog`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.user.id, 'MODERATOR')) {
    ActionLog.get(req.params.id, req.body.type, req.body.limit, req.body.skip)
          .then(al => al ? res.status(200).json(al) : res.status(403))
          .catch(err => next(err));
  }
})



// Board endpoints
router.patch(`/:id`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.user.id, 'ADMINISTRATOR')) {
    Board.edit(req.params.id, req.body, req.user.id)
        .then(board => board ? res.status(200).json(board) : res.status(404))
        .catch(err => next(err));
  }
})

router.delete(`/:id`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.user.id, 'ADMINISTRATOR')) {
    Board.del(req.params.id, req.user.id)
        .then(board => board ? res.status(200).json(board) : res.status(404))
        .catch(err => next(err));
  }
})

router.get(`/:id`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.user.id)) {
    Board.get(req.params.id)
          .then(board => board ? res.status(200).json(board) : res.status(404))
          .catch(err => next(err));
  }
})

router.post(`/`, authorization, (req, res, next) => {
  Board.create({ ...req.body, user: req.user })
        .then(board => board ? res.json(board) : res.status(500))
        .catch(err => next(err));
})

export default router;