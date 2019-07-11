import express from 'express';
const router = express.Router();
import { Board, Note } from './../funcs';
import { authorization, permissions } from './../util';


// Member endpoints
router.get(`/:id/members`, authorization, (req, res, next) => {
  Board.getMembers(req.params.id)
        .then(notes => notes ? res.status(200).json(notes) : res.status(500))
        .catch(err => next(err));
})

router.get(`/:id/members/:member`, authorization, (req, res, next) => {
  Board.getMember(req.params.id, req.params.member)
        .then((member) => member ? res.status(200).json(member) : res.status(500))
        .catch(err => next(err));
})

router.put(`/:id/members/:member`, authorization, (req, res, next) => {
  Board.join(req.params.id, req.params.member)
        .then(() => res.status(200).json({ success: `Board joined` }))
        .catch(err => next(err));
})

router.delete(`/:id/members/:member`, authorization, (req, res, next) => {
  Board.leave(req.params.id, req.params.member)
        .then(() => res.status(200).json({ success: `Board left` }))
        .catch(err => next(err));
})


// Note endpoints
router.get(`/:id/notes`, authorization, (req, res, next) => {
  Board.getNotes(req.params.id)
        .then(notes => notes ? res.status(200).json(notes) : res.status(500))
        .catch(err => next(err));
})

router.put(`/:id/notes`, authorization, function (req, res, next) {
  Note.create({ ...req.body, user: req.user })
        .then((note) => res.status(200).json(note))
        .catch(err => next(err));
})

router.patch(`/:id/notes/:note`, authorization, function (req, res, next) {
  Note.update({ ...req.body, id: req.params.note, user: req.user })
        .then((note) => note ? res.json(note) : res.status(500))
        .catch(err => next(err));
})

router.delete(`/:id/notes/:note`, authorization, function (req, res, next) {
  Note.del(req.params.note)
        .then((note) => note ? res.json(note) : res.status(500))
        .catch(err => next(err));
})


// Board endpoints
router.patch(`/:id`, authorization, (req, res, next) => {
  Board.edit(req.params.id)
        .then(board => board ? res.status(200).json(board) : res.status(404))
        .catch(err => next(err));
})

router.delete(`/:id`, authorization, (req, res, next) => {
  Board.del(req.params.id)
        .then(board => board ? res.status(200).json(board) : res.status(404))
        .catch(err => next(err));
})

router.get(`/:id`, authorization, (req, res, next) => {
  Board.get(req.params.id)
        .then(board => board ? res.status(200).json(board) : res.status(404))
        .catch(err => next(err));
})

router.post(`/`, authorization, (req, res, next) => {
  Board.create({ ...req.body, user: req.user })
        .then(board => board ? res.json(board) : res.status(500))
        .catch(err => next(err));
})

export default router;