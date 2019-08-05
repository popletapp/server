import express from 'express';
const router = express.Router();
import { Board, Note, Invite, Group } from './../funcs';
import { authorization, permissions } from './../util';


// Member endpoints
router.get(`/:id/members`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.params.member)) {
    Board.getMembers(req.params.id)
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
    const invites = await Invite.getAll(req.params.id);
    // If invite is correct
    if (invites.find(invite => invite.code === req.body.invite)) {
      Board.join(req.params.id, req.params.member)
          .then((member) => res.status(200).json(member))
          .catch(err => next(err));
    } else {
      res.status(403).json({ message: 'Invite code is invalid or expired' })
    }
  } else {
    res.status(403).json({ message: 'You need to provide an invite code to join this board.' })
  }
})

router.delete(`/:id/members/:member`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.params.member, req.params.member === req.user.id ? 'USER' : 'MODERATOR')) {
    Board.leave(req.params.id, req.params.member)
        .then((board) => res.status(200).json(board))
        .catch(err => next(err));
  }
})

// Chatrooms
router.get(`/:id/chatrooms`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.user.id)) {
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
  if (Board.authorize(req.params.id, req.user.id, 'EDITOR')) {
    Group.create({ ...req.body, user: req.user })
        .then((note) => res.status(200).json(note))
        .catch(err => next(err));
  }
})

router.patch(`/:id/groups/:group`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'EDITOR')) {
    Group.update({ ...req.body, id: req.params.group, user: req.user })
        .then((group) => group ? res.status(200).json(group) : res.status(500))
        .catch(err => next(err));
  }
})

router.delete(`/:id/groups/:group`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'EDITOR')) {
    Group.del(req.params.group)
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
  if (Board.authorize(req.params.id, req.user.id, 'EDITOR')) {
    Board.addRank(req.params.id, req.body.rank)
        .then((rank) => res.status(200).json(rank))
        .catch(err => next(err));
  }
})

router.patch(`/:id/ranks/:rank`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'EDITOR')) {
    Board.adjustPermissionsOnRank(req.params.id, { id: req.params.rank, ...req.body.rank })
        .then((rank) => rank ? res.status(200).json(rank) : res.status(500))
        .catch(err => next(err));
  }
})

router.delete(`/:id/ranks/:rank`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'EDITOR')) {
    Board.removeRank(req.params.id, { id: req.params.rank, ...req.body.rank })
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
  if (Board.authorize(req.params.id, req.user.id, 'EDITOR')) {
    Note.create({ ...req.body, user: req.user })
        .then((note) => res.status(200).json(note))
        .catch(err => next(err));
  }
})

router.patch(`/:id/notes/:note`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'EDITOR')) {
    Note.update({ ...req.body, id: req.params.note, user: req.user })
        .then((note) => note ? res.status(200).json(note) : res.status(500))
        .catch(err => next(err));
  }
})

router.delete(`/:id/notes/:note`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'EDITOR')) {
    Note.del(req.params.note)
        .then((note) => note ? res.status(200).json(note) : res.status(500))
        .catch(err => next(err));
  }
})

// Invite endpoints
router.get(`/:id/invites`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'MODERATOR')) {
    Invite.getAll(req.params.id)
        .then((invite) => res.status(200).json(invite))
        .catch(err => next(err));
  }
})

router.get(`/:id/invites/:invite`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'USER')) {
    Invite.get(req.params.invite)
        .then((invite) => res.status(200).json(invite))
        .catch(err => next(err));
  }
})

router.post(`/:id/invites`, authorization, function (req, res, next) {
  if (Board.authorize(req.params.id, req.user.id, 'MODERATOR')) {
    Invite.create({ ...req.body, user: req.user, boardID: req.params.id })
        .then((invite) => res.status(200).json(invite))
        .catch(err => next(err));
  }
})

// Board endpoints
router.patch(`/:id`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.user.id, 'ADMINISTRATOR')) {
    Board.edit(req.params.id)
        .then(board => board ? res.status(200).json(board) : res.status(404))
        .catch(err => next(err));
  }
})

router.delete(`/:id`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.user.id, 'ADMINISTRATOR')) {
    Board.del(req.params.id)
        .then(board => board ? res.status(200).json(board) : res.status(404))
        .catch(err => next(err));
  }
})

router.get(`/:id`, authorization, (req, res, next) => {
  if (Board.authorize(req.params.id, req.user.id, 'USER')) {
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